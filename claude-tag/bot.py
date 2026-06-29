"""案例二 + 大結局：會動手做事的 agent bot。
加上 tool use（工具使用），讓 Claude 能自己跑唯讀指令、寫檔案，
並用 agent loop（while 迴圈）分階段把事做完。

安全提醒：讓 AI 跑 shell 指令有風險。safe_run 做了三層防護：
  1. 擋掉 shell 串接字元（; | & ` $ > <），避免 `ls ; rm -rf ~` 偷渡
  2. 用 shlex.split 切 token，只看第一個是否在白名單
  3. 不用 shell=True，直接傳清單給 subprocess，無法串接
正式上線、特別是讓它碰公司機器時，要再加更嚴格的隔離（例如丟容器跑）。

跑之前要先設好三個環境變數：
  SLACK_BOT_TOKEN, SLACK_APP_TOKEN, ANTHROPIC_API_KEY
"""

import os
import shlex
import subprocess

import anthropic
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

app = App(token=os.environ["SLACK_BOT_TOKEN"])
anthropic_client = anthropic.Anthropic()  # 會自動讀 ANTHROPIC_API_KEY

# 告訴 Claude 用 Slack 的格式回，不然 Markdown 在 Slack 會顯示成一堆 ** 跟 #
SLACK_STYLE = (
    "你在 Slack 裡回訊息。請用 Slack 的格式，不要用標準 Markdown：\n"
    "- 粗體用單個星號 *像這樣*，絕對不要用兩個星號 **。\n"
    "- 不要用 # 或 ## 開頭的標題。\n"
    "- 不要用表格（| 那種），改用條列。\n"
    "- 條列用「• 」開頭。\n"
    "- 語氣簡潔，不要太長。"
)


ALLOWED = {"ls", "grep", "cat", "find", "wc", "head"}
BANNED_CHARS = (";", "|", "&", "`", "$", ">", "<")


def safe_run(cmd):
    # 擋掉 shell 串接字元，避免用 ; 或 && 偷渡別的指令
    if any(c in cmd for c in BANNED_CHARS):
        return "拒絕執行：指令包含不允許的字元"
    parts = shlex.split(cmd)
    if not parts or parts[0] not in ALLOWED:
        return "拒絕執行：只允許這幾個唯讀指令"
    try:
        out = subprocess.run(parts, capture_output=True, text=True, timeout=10)
        return out.stdout or out.stderr or "(沒有輸出)"
    except Exception as e:
        return f"執行錯誤：{e}"


TOOLS = [
    {
        "name": "run_command",
        "description": "在專案資料夾裡跑一個唯讀的 shell 指令，用來查看檔案、搜尋內容。例如 ls、grep、cat。",
        "input_schema": {
            "type": "object",
            "properties": {
                "cmd": {"type": "string", "description": "要執行的 shell 指令"}
            },
            "required": ["cmd"],
        },
    },
    {
        "name": "write_file",
        "description": "把內容寫進一個檔案，用來產出文件、會議紀錄、報告。",
        "input_schema": {
            "type": "object",
            "properties": {
                "filename": {"type": "string"},
                "content": {"type": "string"},
            },
            "required": ["filename", "content"],
        },
    },
]


@app.event("app_mention")
# 多收一個 client：這是 Bolt 自動注入的 Slack client，拿來撈頻道訊息用。
# （這也是為什麼上面 Claude 那個要取名 anthropic_client，兩個 client 才不會撞）
def handle_mention(event, client, say):
    say(text="收到，讓我看一下…")

    # === 對話記憶：把頻道最近講過的話一起丟給 Claude，它才有前後文 ===
    # conversations_history：給它頻道，撈回這個頻道最近 10 則訊息
    history = client.conversations_history(channel=event["channel"], limit=10)
    # 細節1：Slack 回的順序是「新到舊」，用 reversed 反成「舊到新」，
    #        不然對話順序會顛倒
    recent = list(reversed(history["messages"]))
    messages = [
        {"role": "user", "content": m["text"]}
        for m in recent
        # 細節2：m.get("text") 過濾掉沒有文字的訊息（像系統通知那種）
        # 細節3：not m.get("bot_id") 只留人類講的話，把 bot 自己回的、
        #        還有那句「收到」濾掉，不然記憶會被自己的話塞滿
        if m.get("text") and not m.get("bot_id")
    ]
    # 注意：要用 conversations_history，Slack 權限要有 channels:history scope
    while True:
        resp = anthropic_client.messages.create(
            model="claude-opus-4-8",
            max_tokens=2048,
            system=SLACK_STYLE,
            tools=TOOLS,
            messages=messages,
        )
        # 把 Claude 這一輪的回應接到對話裡
        messages.append({"role": "assistant", "content": resp.content})

        if resp.stop_reason != "tool_use":
            break  # Claude 不想用工具了，代表它講完了

        # Claude 想用工具，我們幫它跑，把結果回給它
        tool_results = []
        for block in resp.content:
            if block.type == "tool_use":
                if block.name == "run_command":
                    say(text=f"🔧 正在執行：`{block.input['cmd']}`")
                    output = safe_run(block.input["cmd"])
                elif block.name == "write_file":
                    with open(block.input["filename"], "w") as f:
                        f.write(block.input["content"])
                    output = f"已寫入 {block.input['filename']}"
                else:
                    output = f"未知的工具：{block.name}"
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": output,
                    }
                )
        messages.append({"role": "user", "content": tool_results})

    final = next((b.text for b in resp.content if b.type == "text"), None)
    if final:
        say(text=final)


if __name__ == "__main__":
    SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"]).start()
