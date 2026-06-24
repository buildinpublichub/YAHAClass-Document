#!/usr/bin/env bash
# RAG 單集 — 錄影前一鍵環境準備（macOS）。先把下面的 PROJECT_ID 改成你的專案。
# 跑法：bash prep.sh
set -e

PROJECT_ID="你的專案ID"   # ← 改成你的專案（gcloud config get-value project 可查）
VENV_PATH="$HOME/rag_venv"

echo "===================================================="
echo " RAG 單集影片 — 錄影前環境準備"
echo " 專案：$PROJECT_ID"
echo "===================================================="

# 0. 基本工具檢查
echo ""
echo "[0/5] 檢查基本工具…"
command -v python3 >/dev/null || { echo "缺 python3"; exit 1; }
command -v gcloud  >/dev/null || { echo "缺 gcloud → 去 cloud.google.com/sdk 裝"; exit 1; }
python3 --version; gcloud --version | head -1

# 1. 登入 + 設定專案
echo ""
echo "[1/5] 登入與設定專案（瀏覽器會跳出，照流程點同意）…"
gcloud auth login
gcloud auth application-default login
gcloud config set project "$PROJECT_ID"

# 2. 啟用 RAG 要用的 API（Vertex AI + Vector Search）
echo ""
echo "[2/5] 啟用 Vertex AI 與 Vector Search API（第一次會花一兩分鐘；專案要先綁帳單）…"
# Vector Search API 是 serverless 託管向量庫的底層，少了它建櫃子會報 PERMISSION_DENIED。
gcloud services enable aiplatform.googleapis.com vectorsearch.googleapis.com --quiet

# 3. 建 Python venv 並裝 SDK
echo ""
echo "[3/5] 建 RAG 用的 Python venv 並裝 SDK…"
python3 -m venv "$VENV_PATH"
# shellcheck disable=SC1090
source "$VENV_PATH/bin/activate"
pip install -q --upgrade pip
pip install -q google-cloud-aiplatform google-genai
echo "venv 在 $VENV_PATH，跑任何 .py 前先：source $VENV_PATH/bin/activate"

# 4. 設環境變數
echo ""
echo "[4/5] 設定環境變數（這次 shell 有效；要常用就寫進 ~/.zshrc）…"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"
export GOOGLE_CLOUD_LOCATION="us-central1"
echo "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"

# 5. 提示後續手動步驟
echo ""
echo "[5/5] 環境就緒。"
echo ""
echo "===================================================="
echo " 接下來照順序跑（記得先 source $VENV_PATH/bin/activate）："
echo "  ※ 新專案第一次：若建櫃子報 Spanner mode 白名單錯，"
echo "    要先把專案切到 serverless mode（見 README「重要提醒」）。"
echo "  1) python3 cleanup.py        → (可選)清掉舊櫃子，從乾淨狀態開錄"
echo "  2) python3 create_corpus.py  → 建櫃子，印出新 ID"
echo "  3) python3 upload_file.py    → 自動接上最新櫃子上傳，等一兩分鐘索引"
echo "  4) python3 query.py          → 純檢索：看撈回哪幾段"
echo "  5) python3 ask.py            → 帶來源問答（10天 + 來源）"
echo "  ※ 後面幾支都自動抓最新櫃子，不用手動填 ID。"
echo "===================================================="
