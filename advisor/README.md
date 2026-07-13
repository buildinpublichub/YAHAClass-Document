# advisor — Claude Code 顾问模式实测用的「秒杀」demo

配套视频：[我给 Claude Code 挂了顾问，结果它一次都没出手过｜advisor 实测＋官方没提的坑](https://youtu.be/MCR1CVqQe3s)

这是视频里用来测 Claude Code `advisor`（顾问模式）的那个小项目：一个**故意写错**的商品秒杀 API。

## 这个 demo 有什么问题？

`server.js` 里的 `/buy/:sku` 是典型的「先读、再判断、后写」：

```js
const item = await db.get(req.params.sku);   // 读库存
if (item.stock <= 0) return res.status(409); // 判断
item.stock -= 1;
await db.set(req.params.sku, item);          // 写回
```

读和写之间有 10ms 的 DB 延迟。50 个人同时抢 10 件货，大家都在「库存还有 10」的时候通过了判断——**超卖**。这就是经典的 race condition（TOCTOU）。

拿它来测顾问，是因为这种 bug 一眼看不出来、跑一次也不一定复现，正好看看模型会不会去找顾问升级决策。

## 怎么跑

```bash
npm install
npm start           # 起服务，监听 :3456

# 另开一个终端
node stress.js      # 50 并发抢 10 件库存
```

你会看到类似：

```
并发请求: 50
成功下单: 50
被拒绝:   0
最终库存: -40
❌ 超卖了！库存变成负数
```

## 文件

- `server.js` — 秒杀 API，内含 race condition（模拟 DB 读写各 10ms 延迟）
- `stress.js` — 压测脚本，50 并发下单，最后检查有没有超卖
- `package.json` — 只依赖 express

修好之后再跑一次 `stress.js`，成功下单应该正好是 10、库存归 0。
