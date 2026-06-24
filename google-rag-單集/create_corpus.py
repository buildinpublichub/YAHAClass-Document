from vertexai import rag
import vertexai

PROJECT_ID = "你的專案ID"
vertexai.init(project=PROJECT_ID, location="us-central1")

# 指定用哪個embedding模型把文字轉成數字，用Google官方現成的就好
embedding_config = rag.RagEmbeddingModelConfig(
    vertex_prediction_endpoint=rag.VertexPredictionEndpoint(
        publisher_model="publishers/google/models/text-embedding-005"
    )
)

# 建一個叫「公司文件庫」的櫃子
# 用 RAG 託管的向量庫，embedding 設定放在 backend_config 裡。
rag_corpus = rag.create_corpus(
    display_name="公司文件庫",
    backend_config=rag.RagVectorDbConfig(
        rag_embedding_model_config=embedding_config,
    ),
)

print("櫃子建好了，它的ID是：")
print(rag_corpus.name)
