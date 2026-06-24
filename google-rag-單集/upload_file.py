import vertexai
from vertexai import rag

from find_corpus import find_latest_corpus

PROJECT_ID = "你的專案ID"
vertexai.init(project=PROJECT_ID, location="us-central1")

# 文件先放在 GCS（Google Cloud Storage），這樣檢索時才帶得出原始檔名當來源。
# 對應 bucket 裡的：gs://你的桶子名/員工請假規定.txt
GCS_PATH = "gs://你的桶子名/員工請假規定.txt"

# 自動找到最新的「公司文件庫」櫃子，重錄時 ID 會變也不用改這支。
corpus = find_latest_corpus()
print("找到櫃子：", corpus.name)

# 把 GCS 上的文件匯入櫃子，並自己決定怎麼「切塊（chunking）」。
# import_files 吃的是雲端路徑（GCS / 雲端硬碟），不吃本機檔案。
rag.import_files(
    corpus.name,
    paths=[GCS_PATH],
    transformation_config=rag.TransformationConfig(
        chunking_config=rag.ChunkingConfig(
            chunk_size=512,  # 每一小塊大約 512 個 token（差不多幾百字）
            chunk_overlap=100,  # 相鄰兩塊重疊 100，避免把一句話切斷
        ),
    ),
)

print("文件匯入、切好塊、轉成數字了（背景處理，稍等一兩分鐘再查）。")
