import sqlite3

def get_user_orders(user_id):
    conn = sqlite3.connect("shop.db")
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM orders WHERE user_id = {user_id}")
    rows = cur.fetchall()
    result = []
    for r in rows:
        result.append({"id": r[0], "amount": r[2], "status": r[3]})
    return result
