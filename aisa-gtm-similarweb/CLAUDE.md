# demo 项目说明（给录制时的 ClaudeCode 看）

- 所有对话一律用简体中文回复。
- 数据来源只用 AIsa 的 MCP 工具（aisa-gtm），不要自己编数字，拿不到就明说。
- 花钱之前先用 get_details 查价，把每次调用的预估金额写在过程里；使用者给的预算上限不能超过，快超过就停下来问。
- 报告统一写到 `reports/` 目录，Markdown，表格呈现，每张表下面注明数据来源接口和数据月份（meta.last_updated）。
- Similarweb 接口在本方案只支持 country=ww / us；台湾站点用 ww，并用 top-geographies 的 TW 占比来说明。
- 酷澎台湾的域名是 `tw.coupang.com`，是子域名。traffic-trend 和 top-geographies 没有 main_domain_only 参数；如果返回的数字明显是 coupang.com 全球流量（地理分布第一名是 KR），改用 traffic-engagement 并设 `main_domain_only=false` 重查。
- 渠道构成（marketing channel）按月计费，只查使用者要求的月份数，默认最近一个月。
- 受众重叠（audience overlap）limit 不超过 5。
- AI 搜索可见度（GEO）三条路：ChatGPT 用 `post_dataforseo_ai_chat_gpt_llm_responses_live`（body 是数组，`model_name` 用 gpt-4o-mini，`web_search: true` 且必须同时 `force_web_search: true`，否则模型不联网、没有引用）；Perplexity 用 `post_perplexity_sonar`（`model: "sonar"`，回传 `citations`）；Google AI 模式用 `post_oxylabs_ai_search`（`source: "google_ai_mode"`，必须带 `render: "html"` 和 `parse: true`）。Oxylabs 的 chatgpt / perplexity / gemini 三个 source 在实时接口上不可用，不要试。
- 受众重叠（audience overlap）一次只传**两个**域名，多个域名要两两配对分别查再合并。三个域名一起传会连续回 500 `metered settlement failed`（服务端计费结算错误，重试无用）。三家互比就是 3 次配对调用。
- Reddit 取评论用 `get_reddit_post_comments`，参数是 **`url`（完整帖子链接）**，不是 post_id；而且**不要带 `trim`**，带了会回 400 `request does not match the endpoint contract`。`get_reddit_search` 反过来支持 `trim: true`，两个接口的参数不通用。
- Reddit 搜品牌口碑用 `sort=relevance` + `timeframe=year`。不要用 `sort=top`：热度排序会把 "vs"、"review" 这类通用词的全站爆款帖捞上来，返回一堆无关内容还照样计费。查负评补一轮关键词（如 `<品牌> price expensive worth it`），再从结果里挑 `num_comments` 高的帖子取评论。
- `max_price_usd` 是硬拦截，估价超过就直接 402 不执行（不计费，但白跑一轮）。Similarweb 单点接口（top-geographies、audience-overlap）限价给到 **$3.5**，traffic-engagement 给 $1.5，Reddit 系给 $0.5。价格拿不到（本地后端 `amount: null`）时不要把限价压太低。
- Similarweb 数据出现某月与相邻月份差一个数量级、且跳出率/页均浏览/停留时长多个指标同向突变时，多半是口径或样本调整，不是真实流失。报告里要标注出来，并建议用相邻的正常月份做基线，不要直接写成"某某掉了七成用户"。
