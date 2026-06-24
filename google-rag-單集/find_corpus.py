from vertexai import rag

# 自動找到名為「公司文件庫」的最新一個櫃子。
# 這樣重錄、重建櫃子時，ID 會變也沒關係，後面的腳本都不用改。
DISPLAY_NAME = "公司文件庫"


def find_latest_corpus():
    matches = [c for c in rag.list_corpora() if c.display_name == DISPLAY_NAME]
    if not matches:
        raise RuntimeError(
            f"找不到叫「{DISPLAY_NAME}」的櫃子，請先跑 create_corpus.py 建一個。"
        )
    # create_time 最新的排在最前面，取第一個
    latest = sorted(matches, key=lambda c: c.create_time, reverse=True)[0]
    return latest
