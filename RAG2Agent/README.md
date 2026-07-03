# RAG2Agent — 用 Gemini function calling，把 RAG 机器人升级成会自己干活的 AI Agent

这是 YAHA 学堂 YouTube「从零做 AI Agent」单集的完整代码。用几行 Python，把上一支「只会查文件回答」的 Gemini RAG 机器人，升级成一个会自己判断要不要查、查完还自动帮你写好一封请假信的 AI Agent。先查规定、再写信的顺序，**一行 if/else 都没写**，全是 Gemini 靠 function calling 自己排的。

## 文件说明

| 文件 | 作用 |
|------|------|
| `agent.py` | 主程序：两个工具（查文件 `search_company_docs` + 写信 `draft_leave_email`）+ function calling 的 while 循环 |
| `find_corpus.py` | 小帮手：自动找到上一支建好的 RAG corpus（柜子），不用手贴一长串 ID |

## 前置需求

本支复用上一支「从零做 RAG」建好的 Vertex AI RAG corpus（display name 为「公司文件庫」）。**如果你还没建过 corpus，先看上一支视频把柜子建起来。**

1. 一个 Google Cloud 项目，已开启 Vertex AI API
2. 已装依赖：
   ```bash
   pip install google-genai google-cloud-aiplatform
   ```
3. 已完成 gcloud 认证：
   ```bash
   gcloud auth application-default login
   ```

## 使用方法

1. 把 `agent.py` 里的 `PROJECT_ID` 改成你自己的 Google Cloud 项目 ID
2. 运行：
   ```bash
   python3 agent.py
   ```

会依序跑三个场景：闲聊（不查文件）、问规定（自己去查）、请它写信（连用两个工具：先查规定、再写信）。

## 核心概念

- **`from_callable`**：不用手写 JSON，SDK 自动读函数的参数类型和 docstring，生成 Gemini 看得懂的工具声明。
- **docstring 是写给 AI 看的**：模型靠它判断这个工具干嘛用、什么时候用。
- **while 循环**：调用工具 → 拿结果 → 喂回对话 → 再问一次，让 Agent 能连续做好几件事。

> ⚠️ 安全提醒：本例的写信工具只是拼字符串，很安全。但如果你给 Agent 一个「真的会发信」「真的会改数据库」的工具，它一判断就直接执行了。这类有副作用的工具，上线前一定要加一道「执行前先让人确认」的关卡。
