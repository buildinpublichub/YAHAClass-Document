# YAHA 学堂 · 视频配套代码

这里存放 [YAHA 学堂 YouTube 频道](https://www.youtube.com/@yahaclass) 各支视频对应的完整代码和配置文件。**看哪支视频，就点对应目录**，把代码复制下来就能跟着做。

## 📺 视频 ↔ 代码 对照表

| 视频 | 发布日 | 配套代码目录 |
|------|--------|-------------|
| [我复刻了 Claude Tag！让机器人自动读写文件、写 spec，免费使用最强 Agent](https://youtu.be/fQ2lwxVk04k) | 2026-06-29 | [`claude-tag/`](./claude-tag) |
| [别再花钱买 AI 工具！几行 Python 用 Google RAG 打造专属「读心」助理](https://youtu.be/BpDIpf-ebJc) | 2026-06-26 | [`google-rag-單集/`](./google-rag-單集) |
| [上一支的 RAG 只会回答，这次我让它自己查完直接写好一封信｜Python AI Agent](https://youtu.be/o2ttsH6D77U) | 2026-07-03 | [`RAG2Agent/`](./RAG2Agent) |
| [2 个超实用 Claude Code Hooks：自动环境设置 ＋ 手机推播通知【进阶篇】](https://youtu.be/io0B2AjXfmU) | 2026-02-19 | [`ClaudeCode Hooks.md`](./ClaudeCode%20Hooks.md) |
| [我给 Claude Code 挂了顾问，结果它一次都没出手过｜advisor 实测＋官方没提的坑](https://youtu.be/MCR1CVqQe3s) | 2026-07-13 | [`advisor/`](./advisor) |
| [AI做的网站为什么全都长得不一样？我用Claude Design一次搞定网站+广告+PPT+合同](https://youtu.be/1Jl1scURsIA) | 2026-07-16 | [`claude-design/`](./claude-design) |
| 你以为Fable 5降智了？我实测在ClaudeCode加一行设置，AI瞬间说人话（链接待发布后补） | 2026-08 | [`claude-output-style/`](./claude-output-style) |

## 📂 各目录内容说明

- **[`claude-tag/`](./claude-tag)** — 复刻 Claude Tag 的机器人：让 AI 自动读写文件、写 spec（`bot.py`）。
- **[`google-rag-單集/`](./google-rag-單集)** — 从零做 Google RAG「读心」助理：建 corpus、上传文件、检索问答的完整一套（`create_corpus.py` / `upload_file.py` / `query.py` / `ask.py` 等）。
- **[`RAG2Agent/`](./RAG2Agent)** — RAG 单集的续集：用 Gemini function calling 把上面那个「只会查文件回答」的 RAG，升级成会自己判断要不要查、查完还自动帮你写好一封请假信的 AI Agent（`agent.py`）。
- **[`ClaudeCode Hooks.md`](./ClaudeCode%20Hooks.md)** — Claude Code Hooks 进阶篇的完整配置代码：自动环境设置（PATH/NVM）+ 手机推播通知（ntfy.sh / macOS / Windows）。
- **[`advisor/`](./advisor)** — 实测 Claude Code 顾问模式（advisor）用的「秒杀」demo：一个故意藏了 race condition、会超卖的商品下单 API（`server.js`）＋ 50 并发压测脚本（`stress.js`）。拿它去看模型到底会不会找顾问升级决策。
- **[`claude-design/`](./claude-design)** — Claude Design 完整实战的全部提示词：从设计系统出发做出网站、视频广告、PPT、合同，再交给 Claude Code 整合部署到 Netlify 真实收单。按视频章节整理成 7 份文件（logo / 字体配色 / 设计系统 / 网站 / 广告分镜 / PPT合同 / 整合部署），含视频里踩过的所有坑。
- **[`claude-output-style/`](./claude-output-style)** — Claude Code 输出风格（output style）实测配套：对比用的 11 行小函数 `app.py`、手写的 ELI5「讲人话」风格和用 `/branch` 让 Claude 自己生成的「成因与修法」审查风格（`.claude/output-styles/`），以及视频里用到的全部提示词、`keep-coding-instructions` 要点和「手改配置要 `/clear`」的坑。

---

💡 找不到某支视频的代码？可能还没整理上来，欢迎在对应视频下留言提醒。
