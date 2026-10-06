// E 组 · 数量与计时：数字涨跌、大数对比、倒计时
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// e0 分组标题
"e0":{...groupTitle("E","数量与计时","数字涨跌、大数对比、倒计时")},

// e1 countCard（原 g12）
"e1":{build(root,sc){const n=sc.scenes[0].a;head(root,"E-1","数量与计时","countCard","一个大数字；两数对比");
  const a=countCard(root,{x:300,y:330,w:580,h:340,label:"每小时处理",icon:"clock",size:120}),b=countCard(root,{x:1040,y:330,w:580,h:340,label:"每小时处理",icon:"clock",size:120});
  const la=lbl(root,"方式一",{x:590,y:250,center:1,size:36,tx:1}),lb=lbl(root,"方式二",{x:1330,y:250,center:1,size:36,tx:1});
  return t=>{A(a,t,S(n),{k:"pop"});A(la,t,S(n),{k:"fade"});count(a.num,t,S(n,.4),{to:1200,d:1.6,suf:" 件"});
    A(b,t,S(n+1),{k:"pop"});A(lb,t,S(n+1),{k:"fade"});count(b.num,t,S(n+1,.3),{to:90,d:1.2,suf:" 件"});b.tone(after(t,S(n+1,1.8))?"err":null);
  }}},

// e2 odometer（原 f07）
"e2":{build(root,sc){const n=sc.scenes[0].a;head(root,"E-2","数量与计时","odometer","数字上涨 / 下降");
  const L=countCard(root,{x:180,y:290,w:740,h:460,value:"128,400",size:130,label:"本月 Token 用量",icon:"coin",lsize:36});
  const R=countCard(root,{x:1000,y:290,w:740,h:460,value:"842",size:130,label:"平均耗时（毫秒）",icon:"clock",lsize:36});
  const aL=box(L,"ico",ico("arrow",2.6),{x:640,y:40,w:56,h:56}),aR=box(R,"ico",ico("arrow",2.6),{x:640,y:40,w:56,h:56});base(aL,{rot:-90});base(aR,{rot:90});aL.style.color="var(--l1)";aR.style.color="var(--l1)";
  return t=>{A(L,t,S(n)-.4,{k:"pop"});A(R,t,S(n)-.2,{k:"pop"});
    odometer(L.num,t,S(n+1),{from:128400,to:356920,d:1.9});odometer(R.num,t,S(n+2),{from:842,to:517,d:1.5});
    A(aL,t,S(n+1,.2),{k:"fade"});A(aR,t,S(n+2,.2),{k:"fade"});
  }}},

// e3 flapBoard · flapSeq · flapTo（原 f08）
"e3":{build(root,sc){const n=sc.scenes[0].a;head(root,"E-3","数量与计时","flapBoard · flapSeq · flapTo","计时、翻牌变化、超时");
  const mk=(x,name)=>{const c=card(root,{x,y:250,w:740,h:520,title:name,icon:"clock"});title(c,40);c.b=flapBoard(c,"5:00",{x:138,y:150,size:150});return c};
  const W=mk(180,"白方"),K=mk(1000,"黑方");W.style.borderWidth="3px";
  const to=pill(W,"超时判负",{x:0,y:400,tone:"err",icon:"cross",size:40});to.style.left="50%";to.style.transform="translateX(-50%)";
  const turn=pill(W,"走棋中",{x:500,y:26,tone:"or",size:30});
  const K0=[[S(n),"5:00"],[S(n+1),"4:00"],[S(n+1,.65),"3:00"],[S(n+1,1.3),"2:00"],[S(n+1,1.95),"1:00"],[S(n+2),"0:00"]];
  return t=>{A(W,t,S(n)-.4,{k:"pop"});A(K,t,S(n)-.2,{k:"pop"});
    flapSeq(W.b,t,K0,{d:.45});flapTo(K.b,t,S(n),"5:00");// 黑方不走：flapTo 单次翻牌（文字不变就不翻）
    const lost=after(t,S(n+2,.8));W.b.style.color=lost?"var(--err)":"var(--tx)";W.style.borderColor=lost?"var(--err)":after(t,S(n+1))?"var(--or)":"";
    A(turn,t,S(n+1),{k:"fade"});X(turn,t,S(n+2,.8));A(to,t,S(n+2,.8),{k:"pop"});
  }}},

// e4 ledger（2026-09 新增）
"e4":{build(root,sc){const n=sc.scenes[0].a;head(root,"E-4","数量与计时","ledger","一笔费用由哪几项组成");
  const L=ledger(root,{x:310,y:230,w:1300,rh:130,title:"一次调用的费用",items:[["发送问题","$0.042","每百万 token"],["传回答案","$0","每百万 token"]],total:["合计","$0.000"]});
  return t=>{L.show(t,S(n)-.3,{per:.6});L.mark(t,S(n+1,1.2),1,"免费","ok");L.sum(t,S(n+2),{to:.042,fmt:FMT.usd3});
  }}},

// e5 runClock（2026-09 新增）
"e5":{build(root,sc){const n=sc.scenes[0].a;head(root,"E-5","数量与计时","runClock","谁更快、更省");
  const cs=[["直接用大模型","chat"],["先交给小模型判断","bolt"]].map(([s,ic],i)=>{const c=card(root,{x:160+i*840,y:220,w:760,h:620,title:s,icon:ic});title(c,38);
    lbl(c,"任务：核对工资页的权限",{x:40,y:130,size:34,tx:1});skel(c,{x:40,y:220,rows:[560,440,500],gap:52,h:16});
    c.tm=runClock(c,{x:40,y:470,size:60});c.co=runClock(c,{x:420,y:470,size:60,icon:"coin"});if(i)c.bd=badge(c,{x:676,y:24,s:56,state:"ok"});return c});
  return t=>{cs.forEach((c,i)=>A(c,t,S(n)-.3+i*.15,{k:"pop"}));
    cs[0].tm.run(t,S(n,.8),S(n+2,1.4),{to:34,fmt:v=>Math.floor(v)+"s",tone:"tx"});cs[0].co.run(t,S(n,.8),S(n+2,1.4),{to:.43,fmt:FMT.usd,tone:"tx"});
    cs[1].tm.run(t,S(n,.8),S(n+1,.6),{to:8,fmt:v=>Math.floor(v)+"s"});cs[1].co.run(t,S(n,.8),S(n+1,.6),{to:.03,fmt:FMT.usd});
    A(cs[1].bd,t,S(n+1,.7),{k:"pop"});cs[1].style.borderColor=after(t,S(n+1,.7))?"var(--ok)":"";
  }}},

};
