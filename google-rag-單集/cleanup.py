from vertexai import rag
import vertexai

PROJECT_ID = "你的專案ID"
vertexai.init(project=PROJECT_ID, location="us-central1")

# 錄影前清場用：把所有叫「公司文件庫」的舊櫃子刪掉，從乾淨狀態開錄。
DISPLAY_NAME = "公司文件庫"

matches = [c for c in rag.list_corpora() if c.display_name == DISPLAY_NAME]

if not matches:
    print(f"沒有叫「{DISPLAY_NAME}」的櫃子，已經是乾淨狀態。")
else:
    print(f"找到 {len(matches)} 個叫「{DISPLAY_NAME}」的櫃子，開始刪除：")
    for c in matches:
        rag.delete_corpus(name=c.name)
        print("  已刪除：", c.name)
    print("清場完成，可以開錄了。")
