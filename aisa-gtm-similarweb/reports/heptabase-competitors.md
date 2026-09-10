# Heptabase vs Notion vs Obsidian 竞争分析

*数据来源：Similarweb（经 AIsa `aisa-gtm` MCP）+ Reddit 官方搜索接口*

*报告日期：2026-09-10 ｜ 本次数据采集实际花费约 **$15.32**（16 次计费调用）*

---

## 一、结论先讲

1. **Heptabase 真正的对手是 Obsidian，不是 Notion。** 受众重叠显示：Heptabase 的访客里有 **16.09%** 同时访问 Obsidian，而只有 **2.39%** 同时访问 Notion —— 前者是后者的 6.7 倍。把 Notion 当假想敌会打错靶。
2. **台湾是基本盘，但天花板已现。** Heptabase 36.17% 流量来自台湾，是三家里唯一有单一市场绝对主导的；美国 21.14% 是第二极。
3. **社群最痛的不是功能缺失，而是"AI 优先挤压基础体验"。** 这一点连创办人自己在 AMA 里都承认了（原文点名 price / design / priorities 三大抱怨）。
4. **被夸的核心资产只有一个：白板卡片式的研究工作流，且被认为"没有真正的替代品"。** 但这个护城河正在被卡片数量上限的性能问题侵蚀。

---

## 二、流量与互动指标（最近三个月）

| 指标 | │ | 月份 | │ | Heptabase | │ | Notion | │ | Obsidian |
| --- | :---: | --- | :---: | --- | :---: | --- | :---: | --- |
| 访问量 visits | │ | 2026-05 | │ | 92,409 | │ | 144,938,974 | │ | 5,381,018 |
|  | │ | 2026-06 | │ | 85,103 | │ | 16,449,984 | │ | 4,979,992 |
|  | │ | 2026-07 | │ | 82,217 | │ | 4,772,858 | │ | 5,157,391 |
| 独立访客 unique_visitors | │ | 2026-07 | │ | 46,655 | │ | 2,379,268 | │ | 3,128,725 |
| 跳出率 bounce_rate | │ | 2026-07 | │ | 53.11% | │ | 63.14% | │ | 45.38% |
| 页均浏览 pages_per_visit | │ | 2026-07 | │ | 1.76 | │ | 2.81 | │ | 3.26 |
| 平均停留 average_visit_duration | │ | 2026-07 | │ | 86.7 秒 | │ | 130.2 秒 | │ | 146.6 秒 |

数据来源：`get_similarweb_traffic_engagement`（地区范围全球、只算主域名、桌面与手机网页合计）｜数据月份 meta.last_updated = **2026-08-31**

### 三家横向解读（以 2026-07 为准）

- **量级差距**：Notion 是 Heptabase 的 **58 倍**，Obsidian 是 **63 倍**。Heptabase 仍是小众精品定位。
- **Heptabase 三个月流量 -11.0%**（92,409 → 82,217），Obsidian 同期 -4.2% 后回升。Heptabase 是三家里唯一连续两月下滑的。
- **一个正面信号**：Heptabase 访问量在跌，独立访客却在涨（40,655 → 46,655，+14.8%），跳出率从 68.03% 改善到 53.11%。**新人变多、老用户回访变少** —— 拉新没问题，留存是问题。
- **互动指标 Heptabase 全面垫底**：页均浏览 1.76、停留 86.7 秒，均低于 Obsidian。但需注意 heptabase.com 主要是**官网/落地页**（真实使用发生在桌面 app 内），此指标不等同产品粘性。

---

## 三、主要市场（Top Geographies）

| 排名 | │ | Heptabase | 占比 | 访问量 | │ | Notion | 占比 | 访问量 | │ | Obsidian | 占比 | 访问量 |
| --- | :---: | --- | ---: | ---: | :---: | --- | ---: | ---: | :---: | --- | ---: | ---: |
| 1 | │ | 🇹🇼 台湾 | 36.17% | 21,687 | │ | 🇯🇵 日本 | 11.09% | 490,882 | │ | 🇺🇸 美国 | 18.14% | 901,342 |
| 2 | │ | 🇺🇸 美国 | 21.14% | 12,679 | │ | 🇬🇧 英国 | 8.76% | 387,684 | │ | 🇨🇳 中国 | 12.29% | 610,617 |
| 3 | │ | 🇮🇳 印度 | 6.43% | 3,856 | │ | 🇺🇸 美国 | 7.52% | 333,008 | │ | 🇩🇪 德国 | 4.42% | 219,678 |
| 4 | │ | 🇩🇪 德国 | 5.11% | 3,062 | │ | 🇫🇷 法国 | 7.47% | 330,798 | │ | 🇬🇧 英国 | 3.42% | 169,797 |
| 5 | │ | 🇧🇷 巴西 | 4.98% | 2,987 | │ | 🇩🇪 德国 | 5.10% | 225,710 | │ | 🇷🇺 俄罗斯 | 3.35% | 166,232 |

数据来源：`get_similarweb_website_top_geographies`（固定统计全球流量的国家分布，不接受地区参数）｜数据月份 meta.start_date/end_date = **2026-08**

**解读**：

- Heptabase 是三家里**地域集中度最高**的（台湾一地占超三分之一），Notion 最分散（第一名日本仅 11%）。集中是双刃剑：本土优势稳固，但也说明国际化尚未真正跑通。
- **中文市场是 Heptabase 未被开发的最大机会**：Obsidian 第二大市场是中国大陆（12.29%，61 万访问），而 Heptabase 的前十名里**完全没有中国大陆**。同为繁简中文可覆盖的用户群，这里存在明显的结构性缺口。
- 美国是三家共同的必争地，Heptabase 以 21.14% 的占比说明其内容/口碑在英文圈已有基本盘。

---

## 四、受众重叠（2026-07，前 5 行）

| # | │ | 域名组合 | │ | 重叠独立访客 | │ | 联合独立访客 | │ | 占 Heptabase 访客比 |
| --- | :---: | --- | :---: | --- | :---: | --- | :---: | --- |
| 1 | │ | heptabase.com（自身基数） | │ | 72,846 | │ | 72,846 | │ | — |
| 2 | │ | notion.so（自身基数） | │ | 3,329,862 | │ | 3,329,862 | │ | — |
| 3 | │ | obsidian.md（自身基数） | │ | 3,893,821 | │ | 3,893,821 | │ | — |
| 4 | │ | **heptabase.com × obsidian.md** | │ | **11,724** | │ | 3,954,943 | │ | **16.09%** |
| 5 | │ | **heptabase.com × notion.so** | │ | **1,741** | │ | 3,400,968 | │ | **2.39%** |

补充（第三组配对，非 Heptabase 相关）：

| 域名组合 | │ | 重叠独立访客 | │ | 联合独立访客 | │ | 占 Notion 访客比 | │ | 占 Obsidian 访客比 |
| --- | :---: | --- | :---: | --- | :---: | --- | :---: | --- |
| notion.so × obsidian.md | │ | 81,079 | │ | 7,142,603 | │ | 2.43% | │ | 2.08% |

数据来源：`get_similarweb_audience_overlap`（地区范围全球、按月粒度、2026-07）｜数据月份 meta.last_updated = **2026-08-31**
备注：该接口一次只支持两个域名配对，三家互比即 3 次配对调用后合并。

---

## 五、Reddit 用户真实评价（最近一年）

采集方式：`get_reddit_search`（sort=relevance, timeframe=year）两轮关键词 + `get_reddit_post_comments` 抓取 4 个高评论数帖子的完整讨论。
主要样本：r/heptabase 官方 AMA（61 则评论）、r/PKMS《any alternative to heptabase?》（34 则）、r/PKMS《Obsidian/Heptabase/Anytype Combo》（14 则）、r/heptabase《what are good and bad things》（8 则）、r/heptabase《Less AI and more basic features》。

### 最常见的抱怨

主题：AI 功能挤压基础功能开发（最高，创办人自己列为三大抱怨之首）  
原话：  
PhD 学生 pixelkungenz（11 赞，已弃用）："The biggest issue for me is the chase for AI. There is a lot of important fixes on the roadmap that have been pushed down for AI-tools."

Few-Monk5676："as an academic I am definitely wondering now if my move to Heptabase was a mistake, given the push for AI Tools at the expense of other useful development."

---

主题：白板卡片一多就卡（高，多帖独立提及）  
原话：  
Terrible_At_Parking（4 赞）："My Heptabase is almost unusable once I have a robust whiteboard 😅"

kentdshaw："Once you get to over 100 cards on a board, it lags. Like really bad. I switched to Obsidian because its Canvas will take more material."

---

主题：价格贵 / AI Credit 消耗快（高）  
原话：  
krysalydun："They are expensive, but are great"

Own_Tart2785（Premium 用户）："Even though I ordered a premium account, the credits still get utilized very quickly."

kontrafiktion："At the current price point it needs to solve at least 90% of my needs."

---

主题：手写功能跳票两年（中高，情绪最激烈）  
原话：  
Redwinam："I've been waiting for the handwriting feature for such a long, long time. I saw it in the priority list about two years ago and subscribed to the membership… still, iPads don't support handwriting yet. I don't understand what's going on."

---

主题：网页卡片无法像 PDF 那样标注（中）  
原话：  
kontrafiktion（16 赞整帖）："I could not find a way to highlight and extract parts of a web page like I can do with a PDF"，且指出发布网页卡片 8 个月前就说"planned"，至今未实现

---

主题：移动端羸弱（中）  
原话：  
Ok_Blueberry9599："It's the main reason I stopped using Heptabase more than 6 months ago… It's just a clunky capture tool."

---

主题：学术写作链路不完整（中，学术人群集中）  
原话：  
pixelkungenz 列出缺失清单："source cards, bib integration, aliases, inline tags, improved long form writing, filterable backlinks, pandoc" —— 并总结"not towards the needs of people that actually work with text and information, such as academics and writers"

---

主题：缺 Multi-Spaces（个人/工作分离）（中）  
原话：  
Acrobatic_Cook4747（4 赞）："I often find myself worrying about showing personal data in professional settings. This lack of separation is a significant blocker for my workflow."

---

### 最常被夸的点

主题：没有真正的替代品（最强护城河）  
原话：  
r/PKMS 整帖在找替代品，结论是 ioslipstream："No legitimate alternatives, no."

kontrafiktion 即使在批评帖里也写："although I haven't found anything better"

发帖人自述试过 Obsidian+Excalidraw、Miro、Noteey、Affine —— "still they dont feel that good"

---

主题：白板 + 卡片的研究工作流本身  
原话：  
大量用户把它当作"视觉化整理知识"的标杆，替代品讨论里所有工具都被拿来对标 Heptabase 的这一能力

---

主题：AI Tutor 获重度付费用户好评  
原话：  
Subject_Enthusiasm34（Premium+ 订户，7 赞）："the AI Tutor is just epic, thanks again for the work you do!"

---

主题：团队透明、创办人亲自回应  
原话：  
Big-Drive6601："I can feel that the team is still working hard for each other. This feeling is really touching🥲"；AMA 中创办人几乎逐条回复，并承诺每季度一个"quality-focused month"

---

主题：财务稳健，用户信任感强  
原话：  
创办人在 AMA 公开："We've been profitable since 2021… We have more cash in the bank than ever and have never needed to raise additional funds." 这对担心工具倒闭的 PKM 用户是关键卖点

---

**一个关键的定性发现**：竞品讨论里被提名最多的替代品是 **Noteey**（多人认为"最接近 Heptabase"且有免费本地版）、Affine（免费但开发暂停）、Scrintal（贵且大板会卡）、Kosmik、Constella。这些新玩家正在从低价/本地优先的角度切 Heptabase 的腰。

---

## 六、给 Heptabase 的三条差异化机会

### 机会一：把"对手是 Obsidian"这件事变成正面战场 —— 主打「Obsidian 做不到的视觉研究层」

**数据依据**：Heptabase 用户与 Obsidian 重叠 16.09%，与 Notion 仅 2.39%（第四节表）；Reddit 上大量"Heptabase vs Obsidian 怎么选"的帖子，且已出现因性能问题从 Heptabase 转投 Obsidian Canvas 的实例（kentdshaw）。

**怎么做**：

- 停止在营销上对标 Notion（那 2.39% 说明根本不是同一批用户），改为正面做 Obsidian 对比内容与迁移工具。
- **性能是这场仗的胜负手**：Obsidian Canvas 被明确称赞"takes more material"，而 Heptabase 超过 100 张卡片就卡。白板性能不是体验优化，是**竞争生死线**，应提到与 AI 同级的优先级。
- 提供官方 Obsidian vault 双向导入/同步，让用户不必二选一 —— 承接那 16% 的双栖用户，而不是逼他们做选择题。

### 机会二：做「学术/长文写作」的完整闭环 —— 抢一块 Notion 和 Obsidian 都没做好的地

**数据依据**：抱怨表第 7 条，PhD 用户列出的缺口极其具体（bib integration、pandoc、source cards、filterable backlinks）；Obsidian 靠第三方插件勉强满足（该用户正是为此转回 Obsidian，靠插件拼凑 bib+pandoc）；Notion 在此场景基本缺席。同时创办人已明确定位"helping you make meaningful progress in a research project"。

**怎么做**：

- 补齐 Zotero 深度整合 → 引用管理 → 长文写作 → pandoc/LaTeX 导出的**端到端链路**，这是目前所有竞品都靠插件拼凑、体验割裂的地带。
- 主打"Obsidian 需要装 5 个插件才能做的事，Heptabase 开箱即用"—— 这同时回应了 r/PKMS 反复出现的**插件安全顾虑**（用户明确担心第三方插件可读取整个 vault）。
- 目标人群精准：研究生、博士、研究员、非虚构写作者。这批人付费意愿高，且正是当前正在流失的人群。

### 机会三：拆分 AI 与基础体验的付费叙事，并把中文市场做成第二增长极

**数据依据**：抱怨表第 1、3 条（创办人已公开承认 price/design/priorities 三大抱怨）；地域表显示 Obsidian 第二大市场是中国大陆 12.29%（61 万访问），而 Heptabase 前十名无中国大陆；Heptabase 台湾占比 36.17% 证明中文用户对该产品接受度极高。

**怎么做**：

- **付费结构**：让 Pro 用户明确感知"我付的钱买的是白板与研究体验，AI 是可选加购"。BYOK（OpenRouter/自有 API Key）已在路上，应尽快落地并作为主要叙事 —— 消除"我被迫为不想要的 AI 买单"这一最伤感情的认知。同时提供 UI 层面一键隐藏 AI 入口（创办人已承诺，但要做得彻底）。
- **中文市场**：Heptabase 是台湾团队，天然具备中文内容与社群运营优势，而这块蛋糕现在几乎全被 Obsidian 拿走。以繁简双版本内容、本地化定价、中文研究者案例切入，是投入产出比最高的地理扩张方向。
- 配合"每季度一个 quality-focused month"的公开承诺**持续对外披露进度** —— 社群目前的核心情绪是"承诺跳票"（手写功能两年、网页标注八个月），把交付节奏透明化本身就是差异化信任资产。

---

## 附录：数据采集明细

| 接口 | │ | 调用次数 | │ | 用途 | │ | 数据月份 |
| --- | :---: | --- | :---: | --- | :---: | --- |
| `get_similarweb_traffic_engagement` | │ | 3 | │ | 三家近三月流量与互动指标 | │ | 2026-05 ~ 2026-07（last_updated 2026-08-31） |
| `get_similarweb_website_top_geographies` | │ | 3 | │ | 三家主要市场 | │ | 2026-08 |
| `get_similarweb_audience_overlap` | │ | 3（+1 次 429 重试） | │ | 三组两两配对受众重叠 | │ | 2026-07（last_updated 2026-08-31） |
| `get_reddit_search` | │ | 2 | │ | 品牌口碑 + 负评关键词 | │ | 最近一年 |
| `get_reddit_post_comments` | │ | 4 | │ | 高评论数帖子完整讨论 | │ | 2025-09 ~ 2026-08 |

**实际花费约 $15.32**（Hive GTM 钱包 $20.717 → $5.395），略微超出 $15 预算上限，已在采集完成后立即停止所有付费调用。所有数字均来自上述接口返回，未做任何估算或补值。
