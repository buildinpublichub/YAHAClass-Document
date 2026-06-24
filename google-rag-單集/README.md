# Demo Project — RAG 單集影片素材

這是 `../RAG單集-腳本.md` 那支影片的錄影素材包：從零用 Google RAG Engine
做一個會讀你文件、答得出來還標來源、問沒有的會老實說不知道的問答機器人。

## 資料夾

```
demo-project/
├── prep.sh                 ← 一鍵環境準備（先改裡面的 PROJECT_ID）
├── rag-docs/
│   ├── 員工請假規定.txt      ← 要上傳到語料庫的範例文件（含「年假累積上限10天」答案）
│   └── 員工請假規定.html     ← 同內容好看版；要 PDF 就用瀏覽器開它 ⌘P → 存成 PDF
├── find_corpus.py          ← 共用小工具：自動找到名為「公司文件庫」的最新櫃子
├── cleanup.py              ← 錄影前清場：刪掉所有舊的「公司文件庫」櫃子
├── create_corpus.py        ← 2/6 建語料庫，印出櫃子 ID
├── upload_file.py          ← 3/6 上傳文件（自動接上最新櫃子）
├── query.py                ← 4/6 純檢索：撈出最相關的幾段
└── ask.py                  ← 5/6 帶來源問答 + 6/6 問沒有的問題
```

> **重點：後面幾支腳本不寫死櫃子 ID。** 它們都透過 `find_corpus.py` 自動抓
> 名為「公司文件庫」的最新櫃子。所以你**重錄、重建櫃子時 ID 變了也不用改腳本**，
> 依序跑下來就通，鏡頭不會卡在複製貼上那串 ID。

## 怎麼用（錄影前）

### 1. 一鍵準備環境
```bash
# 先把 prep.sh 第 6 行的 PROJECT_ID 改成你的專案（gcloud config get-value project 可查）
bash prep.sh
```
它會：登入、設專案、開 Vertex AI + Vector Search API、建 venv、裝 SDK、設環境變數。
（前提：已裝 gcloud CLI、GCP 專案已綁帳單。）

### 2. （新專案第一次）確認是 serverless mode
新專案的 RAG Engine 預設是 **Spanner mode**，在 us-central1 對新專案需要白名單，
建櫃子會報 `Spanner mode ... restricted to allowlisted projects`。要先切到 serverless：

```bash
source ~/rag_venv/bin/activate
python3 - <<'PY'
from google.cloud import aiplatform_v1beta1 as v1b
from google.cloud.aiplatform_v1beta1.types import (
    RagEngineConfig, RagManagedDbConfig, UpdateRagEngineConfigRequest)
PROJECT, LOCATION = "yourproject", "us-central1"   # ← 改成你的專案
name = f"projects/{PROJECT}/locations/{LOCATION}/ragEngineConfig"
client = v1b.VertexRagDataServiceClient(
    client_options={"api_endpoint": f"{LOCATION}-aiplatform.googleapis.com"})
cfg = RagEngineConfig(name=name, rag_managed_db_config=RagManagedDbConfig(
    serverless=RagManagedDbConfig.Serverless()))
op = client.update_rag_engine_config(
    request=UpdateRagEngineConfigRequest(rag_engine_config=cfg))
print("AFTER:", op.result(timeout=300).rag_managed_db_config)
PY
```
切一次就好，之後這個專案都是 serverless。

### 3. 照腳本順序跑（每次先進 venv）
```bash
source ~/rag_venv/bin/activate

python3 cleanup.py          # (可選)清掉舊櫃子，從乾淨狀態開錄
python3 create_corpus.py    # 建櫃子，印出新 ID
python3 upload_file.py      # 自動接上最新櫃子上傳，等一兩分鐘背景索引
python3 query.py            # 純檢索：看撈回哪幾段（含年假累積那段）
python3 ask.py              # 帶來源問答（10天 + 來源）

# 大結局：把 ask.py 的 question 改成文件裡沒有的問題（例如起薪），看它會不會老實說不知道
```

## 重要提醒
- **PROJECT_ID 各腳本都要填真值**（create_corpus / upload_file / ask 三支有；query 透過 init 不需要）。範本若漏改，會報 `Permission denied on resource project 你的專案ID`。
- **新專案要先切 serverless mode**（見上方步驟 2），否則建櫃子會被 Spanner 白名單擋。
- **要啟用 Vector Search API**（`vectorsearch.googleapis.com`）—— serverless 託管庫的底層，`prep.sh` 已含；少了它建櫃子會報 `Vector Search API has not been used`。
- **location 用 `us-central1`，不要填 global**（RAG Engine 要區域端點）。
- **upload 後要等一兩分鐘**索引才完成，太快跑 query/ask 會撈空，不是做錯。
- **genai client 用 `vertexai=True`**（不是舊版的 `enterprise=True`，新版 SDK 已失效）。
- **練習完記得 `python3 cleanup.py`**，櫃子放著會佔資源、算儲存費。
- 詳細逐 Step 錄影順序、停錄時機、Plan B，見 `../recording-plan-RAG單集.md`。
- 上架時把 `rag-docs/員工請假規定.txt` 放描述欄連結讓觀眾下載（腳本第 3 段有提）。
