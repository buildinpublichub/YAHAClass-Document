import vertexai
from vertexai import rag

from find_corpus import find_latest_corpus

PROJECT_ID = "你的專案ID"
vertexai.init(project=PROJECT_ID, location="us-central1")

# 自動找到最新的「公司文件庫」櫃子
corpus = find_latest_corpus()
print("查詢櫃子：", corpus.name)

# 我們想問的問題
question = "請問特休假有幾天？"
print("問題：", question)
print("-" * 40)

# 拿問題去櫃子裡撈出最相關的幾段內容
response = rag.retrieval_query(
    text=question,
    rag_resources=[rag.RagResource(rag_corpus=corpus.name)],
    rag_retrieval_config=rag.RagRetrievalConfig(top_k=1),
)

# 把撈到的段落印出來看
for i, ctx in enumerate(response.contexts.contexts, 1):
    print(f"【相關片段 {i}】（相似度分數：{ctx.score:.4f}）")
    print("來源：", ctx.source_uri)
    print(ctx.text)
    print("-" * 40)
