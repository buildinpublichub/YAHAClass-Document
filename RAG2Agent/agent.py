from google import genai
from google.genai import types

import vertexai
from vertexai import rag

from find_corpus import find_latest_corpus

PROJECT_ID = "yahaclass"      # ← 改成你的專案ID
LOCATION = "us-central1"
MODEL = "gemini-2.5-flash"

vertexai.init(project=PROJECT_ID, location=LOCATION)
corpus = find_latest_corpus()
client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)


# ---------- 工具一：去公司文件櫃子裡查 ----------
def search_company_docs(question: str) -> str:
    """查詢公司請假規定文件，取得某個假別的天數上限與規則。產生任何請假信之前，都必須先呼叫這個工具確認規定。"""
    print(f"   🔧 [呼叫工具] search_company_docs(question={question!r})")
    resp = rag.retrieval_query(
        text=question,
        rag_resources=[rag.RagResource(rag_corpus=corpus.name)],
        rag_retrieval_config=rag.RagRetrievalConfig(top_k=3),
    )
    chunks = [c.text for c in resp.contexts.contexts]
    return "\n---\n".join(chunks) if chunks else "（文件裡找不到相關內容）"


# ---------- 工具二：寫一封請假申請信 ----------
def draft_leave_email(leave_type: str, days: int, reason: str) -> str:
    """根據假別、天數、原因，產生一封給主管的請假申請信。呼叫前必須已經先用 search_company_docs 查過該假別的規定。"""
    print(f"   🔧 [呼叫工具] draft_leave_email(leave_type={leave_type!r}, days={days}, reason={reason!r})")
    return (
        f"主旨：請假申請（{leave_type} {days} 天）\n\n"
        f"主管您好：\n\n"
        f"我想申請{leave_type}共 {days} 天，原因是{reason}。\n"
        f"相關工作我會先交接完成，再麻煩您核准，謝謝。\n\n"
        f"敬上"
    )


# 改成清單寫法：以後要加第三、第四個工具，只要往 ALL_TOOLS 加一個函式名就好
ALL_TOOLS = [search_company_docs, draft_leave_email]

TOOL_FUNCS = {f.__name__: f for f in ALL_TOOLS}

TOOLS = [types.Tool(function_declarations=[
    types.FunctionDeclaration.from_callable(callable=f, client=client)
    for f in ALL_TOOLS
])]

# 鐵則版 SYSTEM：逼它寫信前一定先查規定（只用客氣語氣，約 5 次會翻 1 次）
SYSTEM = (
    "你是公司 HR 助理。\n"
    "鐵則：只要使用者要你寫任何請假信，你的第一個動作【一定】是先呼叫 search_company_docs "
    "查那個假別的規定上限，拿到規定後，第二步才呼叫 draft_leave_email 寫信。"
    "絕對不可以跳過查規定那一步、直接寫信。\n"
    "如果問題只牽涉公司規定，用 search_company_docs 查完再答。"
    "如果只是閒聊，直接回答，不用查。"
)


def run(prompt: str):
    print("=" * 56)
    print(f"🧑 使用者：{prompt}")
    print("-" * 56)
    cfg = types.GenerateContentConfig(system_instruction=SYSTEM, tools=TOOLS)
    contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]

    step = 0
    while True:
        step += 1
        resp = client.models.generate_content(model=MODEL, contents=contents, config=cfg)
        calls = resp.function_calls
        if not calls:
            if step == 1:
                print("   🧠 [決策] 這題不用查文件，直接回答")
            break
        contents.append(resp.candidates[0].content)
        for call in calls:
            result = TOOL_FUNCS[call.name](**call.args)
            contents.append(types.Content(role="user", parts=[
                types.Part.from_function_response(name=call.name, response={"result": result})
            ]))
    print("-" * 56)
    print("🤖 Agent：", resp.text)


if __name__ == "__main__":
    run("你好，你是誰？")
    run("我們公司年假累積上限是幾天？")
    run("幫我寫一封請3天年假的申請信，原因是回家處理家裡的事。")
