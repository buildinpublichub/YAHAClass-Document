# YAHA 学堂 · 视频配套代码

这里存放 [YAHA 学堂 YouTube 频道](https://www.youtube.com/@yahaclass) 各支视频对应的完整代码和配置文件。**看哪支视频，就点对应目录**，把代码复制下来就能跟着做。

## 📺 视频 ↔ 代码 对照表

| 视频 | 发布日 | 配套代码目录 |
|------|--------|-------------|
| [我复刻了 Claude Tag！让机器人自动读写文件、写 spec，免费使用最强 Agent](https://youtu.be/fQ2lwxVk04k) | 2026-06-29 | [`claude-tag/`](./claude-tag) |
| [别再花钱买 AI 工具！几行 Python 用 Google RAG 打造专属「读心」助理](https://youtu.be/BpDIpf-ebJc) | 2026-06-26 | [`google-rag-單集/`](./google-rag-單集) |
| RAG → Agent 续集：用 Gemini function calling，让 AI 自己查完直接帮你写信 *(即将发布)* | 2026-07 | [`RAG2Agent/`](./RAG2Agent) |
| [2 个超实用 Claude Code Hooks：自动环境设置 ＋ 手机推播通知【进阶篇】](https://youtu.be/io0B2AjXfmU) | 2026-02-19 | [`ClaudeCode Hooks.md`](./ClaudeCode%20Hooks.md) |

## 📂 各目录内容说明

- **[`claude-tag/`](./claude-tag)** — 复刻 Claude Tag 的机器人：让 AI 自动读写文件、写 spec（`bot.py`）。
- **[`google-rag-單集/`](./google-rag-單集)** — 从零做 Google RAG「读心」助理：建 corpus、上传文件、检索问答的完整一套（`create_corpus.py` / `upload_file.py` / `query.py` / `ask.py` 等）。
- **[`RAG2Agent/`](./RAG2Agent)** — RAG 单集的续集：用 Gemini function calling 把上面那个「只会查文件回答」的 RAG，升级成会自己判断要不要查、查完还自动帮你写好一封请假信的 AI Agent（`agent.py`）。
- **[`ClaudeCode Hooks.md`](./ClaudeCode%20Hooks.md)** — Claude Code Hooks 进阶篇的完整配置代码：自动环境设置（PATH/NVM）+ 手机推播通知（ntfy.sh / macOS / Windows）。

---

💡 找不到某支视频的代码？可能还没整理上来，欢迎在对应视频下留言提醒。
