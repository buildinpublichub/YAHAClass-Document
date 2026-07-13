// 模拟秒杀：50 个用户同时抢购库存只有 10 件的商品
const N = 50;

async function main() {
  const results = await Promise.all(
    Array.from({ length: N }, () =>
      fetch('http://localhost:3456/buy/sku_1001', { method: 'POST' })
        .then(r => r.json())
        .catch(e => ({ error: e.message }))
    )
  );
  const ok = results.filter(r => r.ok).length;
  const rejected = results.filter(r => r.error === 'out of stock').length;

  const stock = await fetch('http://localhost:3456/stock/sku_1001').then(r => r.json());

  console.log(`并发请求: ${N}`);
  console.log(`成功下单: ${ok}`);
  console.log(`被拒绝:   ${rejected}`);
  console.log(`最终库存: ${stock.stock}`);
  if (stock.stock < 0) console.log('❌ 超卖了！库存变成负数');
  else if (ok > 10) console.log('❌ 超卖了！只有10件却卖出' + ok + '单');
  else console.log('✅ 没有超卖');
}

main();
