"""帶來源問答：把整個櫃子掛給 Gemini，讓它讀文件回答。

跟 query.py 的差別：query.py 只把相關段落「撈」出來；
這支會把段落餵給 Gemini，產生一句自然語言的答案，而且只根據文件回答。

門檻參數叫 vector_similarity_threshold：相似度越高越像，
所以數字「調大」才更嚴格（跟純檢索的 distance threshold 方向相反）。

影片大結局：把 contents 換成文件裡沒有的問題（例如起薪），
看它會不會老實說「找不到」，而不是瞎掰一個數字。
"""

from google import genai
from google.genai import types

from find_corpus import find_latest_corpus

PROJECT_ID = "你的專案ID"

# 自動找到最新的「公司文件庫」櫃子，重錄時 ID 會變也不用改這支。
corpus = find_latest_corpus()
print("使用櫃子：", corpus.name)

client = genai.Client(vertexai=True, project=PROJECT_ID, location="us-central1")

# 把整個櫃子包成一個「工具」交給 Gemini
rag_tool = types.Tool(
    retrieval=types.Retrieval(
        vertex_rag_store=types.VertexRagStore(
            rag_resources=[types.VertexRagStoreRagResource(rag_corpus=corpus.name)],
            rag_retrieval_config=types.RagRetrievalConfig(
                top_k=3,
                filter=types.RagRetrievalConfigFilter(
                    vector_similarity_threshold=0.5,
                ),
            ),
        )
    )
)

question = "我們公司放假相關的規定，有沒有什麼上限？"
print("問題：", question)
print("-" * 40)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=question,
    config=types.GenerateContentConfig(tools=[rag_tool]),
)
print(response.text)

# 印出這個答案是根據哪份文件來的（來源）
meta = response.candidates[0].grounding_metadata
if meta and meta.grounding_chunks:
    sources = set()
    for gc in meta.grounding_chunks:
        if gc.retrieved_context:
            sources.add(gc.retrieved_context.uri)
    print("-" * 40)
    for s in sources:
        print("來源：", s)
