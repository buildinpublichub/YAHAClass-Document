# 视频里输入的全部 prompt（按出现顺序）

所有 prompt 都是在 `claude mcp add aisa-gtm` 之后、项目目录里放了 [`CLAUDE.md`](./CLAUDE.md) 的 ClaudeCode 会话中输入的。每个工作流开一个新会话（`/clear`）。

---

## 0. 对照组：没接 MCP 的 ClaudeCode

在一个没加 aisa-gtm 的目录里启动 `claude`，输入：

```text
帮我做一份台湾四大电商的流量拆解：蝦皮、momo、PChome、酷澎，
我要最近几个月的月流量趋势和每家的流量渠道构成。
```

实录：它回答「我这边没有 SimilarWeb / Semrush 之类流量数据源的接入，也没有你本地的数据文件」，然后给四个选项（导 CSV / 其他工具数据 / 只要框架 / 用浏览器抓免费版）。

---

## 1. 台湾四大电商流量拆解

### 第一轮

```text
用AIsa的Similarweb官方数据，帮我做一份台湾四大电商的流量拆解报告：
shopee.tw、momoshop.com.tw、24h.pchome.com.tw、tw.coupang.com。
注意酷澎台湾是tw.coupang.com这个子域名，别把韩国的coupang.com算进来。
我要看：
1）最近几个月的月流量趋势
2）每家的流量渠道构成，只要最近一个月
3）受众地理分布，确认这些数字就是台湾市场
先用get_details查每个接口的价格，总预算控制在20美元以内，超过先停下来问我。
数据拿回来后写成reports/tw-ecommerce.md，用表格呈现，最后给三条结论，
并跟数位时代8月21日报道的排名做对照。
```

实录：它用 `search` 找接口、`get_details` 查价（全部返回 null）、`account` 查余额，然后给每次调用设 `max_price_usd: 1.5`，停下来问「1. 接受兜底方案开跑 2. 先跑一次最便宜的试水」。

### 第二轮（它问方案时）

```text
我选第一条
```

实录：4 次调用全部被 `estimated_price_exceeds_max_price` 拒绝、未扣费。它把上限提到 5 美元只跑一次 shopee.tw 地理分布探价，扣 $3.00，然后算出 13 次 × $3 = $39 超预算，给出 A/B/C 三种砍法和「加预算到 $40」。

### 第三轮（它给砍法时）

```text
价目表在aisa.one/api/similarweb：趋势接口每个指标每个月0.1美元，六个月约0.6；渠道接口0.7美元一个月；地理分布0.3美元一行，最多10行就是3美元。
按这个算：剩下3家地理分布9美元，4家趋势2.4美元，4家渠道2.8美元，共14.2，加已花的3美元是17.2，在20美元以内。
全部跑。max_price_usd按接口设：趋势和渠道设1，地理分布设3.5。tw.coupang.com我已经验过，地理分布第一名是台湾，不用复查。跑完用account核对实际花费写进报告。
```

实录：12 次调用零失败，`account` 核对 $17.20，与测算一分不差。报告写入 `reports/tw-ecommerce.md`。它说明数位时代那篇读不到（MCP 无网页检索），对照表留空。

### 第四轮（它说对照表留空时）

```text
可以，用WebFetch读https://www.bnext.com.tw/article/91940/vbehdg7n-20260821010535-pzre4w3h，把第5节对照表补上。只写报道里明确给出的数字和排名，标明口径。
```

实录：只填了报道明确给出的四个数字，momo / PChome 无绝对值的格子标「报道未给绝对值」，列出三条口径差异。

---

## 2. Heptabase 竞品分析

```text
台湾团队做的Heptabase（heptabase.com）要跟Notion（notion.so）、Obsidian（obsidian.md）竞争。
用Similarweb官方数据比一下三家最近三个月的流量和互动指标、各自的主要市场，
再看三家之间的受众重叠，重叠只要前5行。
然后去Reddit搜最近一年用户对Heptabase的真实评价，抓出最常见的抱怨和被夸的点。
总预算15美元以内。写成reports/heptabase-competitors.md，
最后给Heptabase三条差异化机会。
```

实录：16 次计费调用 $15.32（超 $0.32，它自己停了付费调用并在报告附录交代）。从回车到写完 4 分 25 秒。关键结果：Heptabase × Obsidian 受众重叠 16.09%，× Notion 只有 2.39%；Notion 三个月数据口径突变已标注不可解读为流失。

---

## 3. AI 搜索可见度审计（GEO）

```text
做一个AI搜索可见度审计。分别问ChatGPT、Perplexity和Google AI模式这三个问题：
1）best visual note-taking app for research
2）Heptabase vs Obsidian which is better
3）Notion alternatives for students
ChatGPT用DataForSEO的chat_gpt llm_responses live接口并开web_search，
Perplexity用perplexity sonar接口，Google AI模式用Oxylabs ai-search并带render=html。
把每个引擎的回答里有没有提到Heptabase、Notion、Obsidian做成一张表，
列出每个回答引用的来源网址。
最后告诉我Heptabase要被AI更常推荐，应该去哪些网站补内容。写成reports/heptabase-geo.md。
```

实录：9 次有效调用 $0.68。第一次 ChatGPT 未联网（`web_search: false`），它自己加 `force_web_search: true` 重跑。结果：Obsidian 9/9、Heptabase 6/9、Notion 4/9；「Notion alternatives for students」三个引擎都没提 Heptabase；Heptabase 官网在 9 个回答里零引用。

---

## 备援：不经 Agent，直接 curl 拿数据

```bash
# Similarweb 流量趋势（$0.10 × 指标 × 月份，默认最近 6 个月）
curl -s -G "https://api.aisa.one/apis/v1/similarweb/website-traffic-trend" \
  -H "Authorization: Bearer $AISA_API_KEY" --data-urlencode "domain=shopee.tw" | jq .

# Similarweb 地理分布（$0.30/行，最多 10 行）
curl -s -G "https://api.aisa.one/apis/v1/similarweb/website-top-geographies" \
  -H "Authorization: Bearer $AISA_API_KEY" --data-urlencode "domain=tw.coupang.com" | jq .

# Reddit 搜索
curl -s -G "https://api.aisa.one/apis/v1/reddit/search" \
  -H "Authorization: Bearer $AISA_API_KEY" \
  --data-urlencode "query=Heptabase" --data-urlencode "sort=relevance" --data-urlencode "timeframe=year" | jq '.posts[:5]'

# Google AI 模式（Oxylabs，$0.001/次，必须带 render=html）
curl -s --max-time 120 -X POST "https://api.aisa.one/apis/v1/oxylabs/ai-search" \
  -H "Authorization: Bearer $AISA_API_KEY" -H "Content-Type: application/json" \
  -d '{"source":"google_ai_mode","query":"best visual note taking app for research","render":"html","parse":true,"geo_location":"United States"}' \
  | jq '.results[0].content | {response_text, citations}'

# Perplexity（sonar，约 $0.005/次，回传 citations）
curl -s --max-time 120 -X POST "https://api.aisa.one/apis/v1/perplexity/sonar" \
  -H "Authorization: Bearer $AISA_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"sonar","messages":[{"role":"user","content":"best visual note-taking app for research"}]}' \
  | jq '{answer: .choices[0].message.content, citations, cost: .usage.cost}'

# ChatGPT（DataForSEO，联网后约 $0.027/次）
curl -s --max-time 150 -X POST "https://api.aisa.one/apis/v1/dataforseo/ai_optimization/chat_gpt/llm_responses/live" \
  -H "Authorization: Bearer $AISA_API_KEY" -H "Content-Type: application/json" \
  -d '[{"user_prompt":"best visual note-taking app for research","model_name":"gpt-4o-mini","web_search":true,"force_web_search":true}]' \
  | jq '.tasks[0].result[0].items[0].sections[0].text'
```
