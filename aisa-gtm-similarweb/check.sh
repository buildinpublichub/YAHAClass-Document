#!/usr/bin/env bash
# 接口连通性检查：把视频里用到的每个接口各真跑一次，确认 key、订阅、接口参数都对。
# 用法：export AISA_API_KEY=... ; bash check.sh
# 会真实扣费：约 $0.60（trend 6 个月）+ $3.00（top-geo 10 行）+ $0.004（reddit）+ $0.001（oxylabs）+ $0.005（sonar）+ $0.001（dataforseo）≈ $3.6
cd "$(dirname "$0")"
K="${AISA_API_KEY:-}"
pass=0; fail=0
ok(){ echo "✅ $1"; pass=$((pass+1)); }
no(){ echo "✗  $1"; fail=$((fail+1)); }
[ -z "$K" ] && { echo "✗  没设 AISA_API_KEY"; exit 1; }
mkdir -p live

echo "===================== AIsa GTM 录影前检查 ====================="
echo "--- 0) key 有效性（免费）---"
code=$(curl -s -o /dev/null -w "%{http_code}" https://api.aisa.one/v1/models -H "Authorization: Bearer $K")
[ "$code" = "200" ] && ok "/v1/models HTTP 200" || no "/v1/models HTTP $code"

echo "--- 1) GTM MCP 端点（免费）---"
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 -X POST https://mcp.aisa.one/gtm/mcp \
  -H "Authorization: Bearer $K" -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"check","version":"0"}}}')
[ "$code" = "200" ] && ok "mcp.aisa.one/gtm/mcp initialize 200" || no "gtm/mcp HTTP $code"

echo "--- 2) Similarweb traffic-trend shopee.tw（≈\$0.10–0.60）---"
r=$(curl -s --max-time 60 -G "https://api.aisa.one/apis/v1/similarweb/website-traffic-trend" -H "Authorization: Bearer $K" --data-urlencode "domain=shopee.tw")
echo "$r" > live/trend_shopee.json
if echo "$r" | grep -q '"points"'; then ok "traffic-trend shopee.tw 有 points"; else no "traffic-trend → $(echo "$r" | head -c 160)"; fi

echo "--- 3) Similarweb top-geographies tw.coupang.com（≈\$3.00，同时验证子域名处理）---"
r=$(curl -s --max-time 60 -G "https://api.aisa.one/apis/v1/similarweb/website-top-geographies" -H "Authorization: Bearer $K" --data-urlencode "domain=tw.coupang.com")
echo "$r" > live/geo_coupang.json
if echo "$r" | grep -q '"countries"'; then
  ok "top-geographies tw.coupang.com 有 countries"
  echo "$r" | python3 -c "import sys,json; d=json.load(sys.stdin); [print('    ',c.get('country_code'),c.get('share')) for c in d['data']['countries'][:3]]" 2>/dev/null
  echo "   ↑ 第一名应为 TW。若是 KR，说明被算成 coupang.com 全球；top-geographies 没有 main_domain_only 参数，让 Agent 改用 traffic-engagement 并设 main_domain_only=false"
else no "top-geographies → $(echo "$r" | head -c 160)"; fi

echo "--- 4) Reddit search Heptabase（≈\$0.004）---"
r=$(curl -s --max-time 60 -G "https://api.aisa.one/apis/v1/reddit/search" -H "Authorization: Bearer $K" --data-urlencode "query=Heptabase" --data-urlencode "sort=relevance" --data-urlencode "timeframe=year")
echo "$r" > live/reddit_heptabase.json
echo "$r" | grep -q '"posts"' && ok "reddit/search 有 posts" || no "reddit/search → $(echo "$r" | head -c 160)"

echo "--- 5) Oxylabs ai-search google_ai_mode（\$0.001，约 8 秒，必须 render=html）---"
r=$(curl -s --max-time 120 -X POST "https://api.aisa.one/apis/v1/oxylabs/ai-search" -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
  -d '{"source":"google_ai_mode","query":"best visual note taking app for research","render":"html","parse":true,"geo_location":"United States"}')
echo "$r" > live/oxylabs_google_ai_mode.json
if echo "$r" | grep -q '"response_text"'; then ok "oxylabs google_ai_mode 有 response_text"; else no "oxylabs → $(echo "$r" | head -c 160)"; fi

echo "--- 5b) Perplexity sonar（≈\$0.005）---"
r=$(curl -s --max-time 120 -X POST "https://api.aisa.one/apis/v1/perplexity/sonar" -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
  -d '{"model":"sonar","messages":[{"role":"user","content":"best visual note-taking app for research"}]}')
echo "$r" > live/pplx_sonar.json
echo "$r" | grep -q '"citations"' && ok "perplexity sonar 有 citations" || no "perplexity → $(echo "$r" | head -c 160)"

echo "--- 5c) DataForSEO ChatGPT live（≈\$0.001）---"
r=$(curl -s --max-time 150 -X POST "https://api.aisa.one/apis/v1/dataforseo/ai_optimization/chat_gpt/llm_responses/live" -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
  -d '[{"user_prompt":"best visual note-taking app for research","model_name":"gpt-4o-mini","web_search":true}]')
echo "$r" > live/dfs_chatgpt.json
echo "$r" | grep -q '"status_code":20000' && ok "dataforseo chat_gpt live 20000" || no "dataforseo chatgpt → $(echo "$r" | head -c 160)"

echo "--- 6) claude mcp 状态 ---"
if claude mcp list 2>/dev/null | grep -q "aisa-gtm"; then
  echo "ℹ️  aisa-gtm 已加入当前目录"
else
  echo "ℹ️  aisa-gtm 尚未加入，见 README 接入三步"
fi

echo "=============================================================="
echo "通过 $pass / 失败 $fail"
[ "$fail" -eq 0 ] && echo "全绿。" || echo "有失败项。若都是 subscription_required，先去 console.aisa.one/billing?product=gtm 开通 Go-to-Market 方案。"
