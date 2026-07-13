const express = require('express');
const app = express();

// 模拟数据库：读写各有 10ms 延迟（真实 DB 的网络往返）
const db = {
  data: { sku_1001: { name: '机械键盘', stock: 10 } },
  async get(key) {
    await new Promise(r => setTimeout(r, 10));
    return { ...this.data[key] };
  },
  async set(key, value) {
    await new Promise(r => setTimeout(r, 10));
    this.data[key] = value;
  },
};

app.post('/buy/:sku', async (req, res) => {
  const item = await db.get(req.params.sku);
  if (!item) return res.status(404).json({ error: 'not found' });

  if (item.stock <= 0) {
    return res.status(409).json({ error: 'out of stock' });
  }

  item.stock -= 1;
  await db.set(req.params.sku, item);
  res.json({ ok: true, remaining: item.stock });
});

app.get('/stock/:sku', async (req, res) => {
  const item = await db.get(req.params.sku);
  res.json(item);
});

app.listen(3456, () => console.log('shop api on :3456'));
