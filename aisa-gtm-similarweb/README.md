# AIsa × ClaudeCode：直连 Similarweb 官方数据做竞品分析

📺 视频：https://youtu.be/ydChMfjP8ms

这支视频里 ClaudeCode 通过 AIsa 的 GTM MCP 服务器直接调用 Similarweb 官方 API（V5）、Reddit、DataForSEO、Perplexity、Oxylabs，跑了三个真实工作流：台湾四大电商流量拆解、Heptabase 竞品分析、AI 搜索可见度审计（GEO）。这里是视频里所有输入的原文：接入命令、给 ClaudeCode 的每一段 prompt、项目里的 CLAUDE.md 规则、录前检查脚本，以及三份 Agent 实际产出的报告。

> 数据接口需要开通 AIsa 的 Go-to-Market 方案（$39/月，含 $50 调用额度）：https://aisa.one/solutions/go-to-market
> 每个接口的单价表：https://aisa.one/api/similarweb

## 目录

| 文件 | 内容 |
|---|---|
| [`prompts.md`](./prompts.md) | 视频里输入的全部 prompt 与回复原文，按出现顺序 |
| [`CLAUDE.md`](./CLAUDE.md) | 放在项目根目录给 ClaudeCode 读的规则：先查价、守预算、Similarweb 地区限制、酷澎子域名、GEO 三条接口路径 |
| [`check.sh`](./check.sh) | 录前检查脚本，把视频里用到的每个接口各真跑一次（约 $3.6） |
| [`reports/tw-ecommerce.md`](./reports/tw-ecommerce.md) | Agent 产出：台湾四大电商流量拆解（12 次调用，$17.20） |
| [`reports/heptabase-competitors.md`](./reports/heptabase-competitors.md) | Agent 产出：Heptabase vs Notion vs Obsidian（16 次调用，$15.32） |
| [`reports/heptabase-geo.md`](./reports/heptabase-geo.md) | Agent 产出：三引擎 AI 搜索可见度审计（9 次调用，$0.68） |

## 接入三步

```bash
# 1. 拿 key：console.aisa.one/api-keys → 新建密钥。放环境变量，别贴进聊天窗口
export AISA_API_KEY="sk-aisa-你的key"

# 2. 进项目目录，把 AIsa 的 GTM MCP 服务器加进 ClaudeCode（默认只对当前目录生效）
cd 你的项目目录
claude mcp add --transport http aisa-gtm https://mcp.aisa.one/gtm/mcp \
  --header "Authorization: Bearer $AISA_API_KEY"

# 3. 重开会话，/mcp 看到 aisa-gtm 显示 connected
claude
```

想在所有目录都能用，加 `-s user`。key 会存进 `~/.claude.json`，下次不用再 export。

## 视频里踩过的坑

1. **`/mcp` 显示 needs authentication**：如果第一次 add 时终端里的 key 无效，Claude Code 会把「需要授权」记进 `~/.claude/mcp-needs-auth-cache.json`，之后 remove 再 add 也不清。解法：`claude mcp remove aisa-gtm -s local` → 删掉那个文件里的 `aisa-gtm` 条目 → 用有效 key 重新 add。`claude mcp list` 显示 connected 只代表连得上，不代表 key 对。
2. **get_details 查不到价**：MCP 的 `get_details` 对 Similarweb 接口返回 `price: null`。让 Agent 用 `max_price_usd` 设硬上限，超价的调用会在扣费前被拒（不计费）。真实单价看 https://aisa.one/api/similarweb。
3. **Similarweb 只能选全球或美国**：`country` 只接受 `ww` / `us`。台湾站点用 `ww`，再用 `top-geographies` 的台湾占比证明全球数字就是台湾数字。
4. **ChatGPT 接口要 `force_web_search: true`**：只设 `web_search: true` 不会真联网，回答零来源。加上强制联网后单次成本约涨 100 倍（$0.0003 → $0.027），做 GEO 审计这笔钱必须花。
5. **Oxylabs 的 chatgpt / perplexity / gemini 三个 source 在 AIsa 实时接口上不可用**，会回「Realtime integration is not supported for LLM sources」。ChatGPT 走 DataForSEO，Perplexity 走 `perplexity/sonar`，Google AI 模式走 Oxylabs 且必须带 `render: "html"`。
6. **渠道构成接口按月计费**（$0.70/月），prompt 里要限定「只要最近一个月」，不然 Agent 拉六个月就是 $16.8。
