// D 组 · 流程与进度：走到第几步、排队到达、一个个过、谁先到
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// d0 分组标题
"d0":{...groupTitle("D","流程与进度","走到第几步、排队到达、一个个过、谁先到")},

// d1 chain（原 g07）
"d1":{build(root,sc){const n=sc.scenes[0].a;head(root,"D-1","流程与进度","chain","流程、步骤、流水线（哪一步出错）");
  const svg=svgRoot(root),C=chain(root,svg,{s:150,gap:340,y:430,items:[{icon:"doc",label:"读取"},{icon:"search",label:"检索"},{icon:"code",label:"生成"},{icon:"shield",label:"检查"},{icon:"flag",label:"发布"}]});
  const bd=badge(root,{x:C.cx(3)-28,y:C.y-84,s:56,state:"err"});
  return t=>{C.play(t,S(n),{per:.5});
    const at=i=>S(n+1)+i*.6,fail=after(t,at(3));
    C.nodes.forEach((e,i)=>{const on=after(t,at(i)),nx=after(t,at(i+1));setNode(e,i===3&&fail?"err":i>3&&fail?"dim":on&&(nx&&i<3)?"ok":on?"active":"idle")});
    C.links.forEach((l,i)=>l.setAttribute("stroke",TONE[after(t,at(i+1))&&i<3?"or":"l2"]));A(bd,t,at(3)+.2,{k:"pop"});
    if(C.nodes[4].label)dim(C.nodes[4].label,t,at(3),{to:.4});
  }}},

// d2 stepRun（原 f12）
"d2":{build(root,sc){const n=sc.scenes[0].a;head(root,"D-2","流程与进度","stepRun","流程走到第几步");
  const subs=["读需求","定方案","写代码","跑测试","发布"];const svg=svgRoot(root);
  const R=roadmap(root,svg,{names:subs.map((_,i)=>"第 "+(i+1)+" 步"),subs,y:500,w:1440,cw:250});
  const hd=box(root,"","",{x:240,y:280});hd.style.font="600 52px/1.2 NSC";
  return t=>{A(hd,t,S(n)-.3,{k:"fade"});[R.line,R.prog].forEach(l=>setFx(l,{op:eo(P(t,S(n)-.6,.5))}));R.nodes.forEach((e,i)=>A(e,t,S(n)-.5+i*.08,{k:"pop"}));
    R.cards.forEach((e,i)=>A(e,t,S(n)-.4+i*.08,{k:"fade"}));
    const k=stepRun(R,t,S(n),{at:[S(n+1),S(n+1,1.4),S(n+2)]});const h=`当前：<span style="color:var(--or)">第 ${k+1} 步 · ${subs[Math.max(0,k)]}</span>`;if(hd._h!==h){hd._h=h;hd.innerHTML=h}
  }}},

// d3 checklist · setCheck · corner · dock（原 g08）
"d3":{build(root,sc){const n=sc.scenes[0].a;const T=head(root,"D-3","流程与进度","checklist · setCheck · corner · dock","本片几件事、讲到第几件，常驻角落");
  const c=checklist(root,{title:"本片三件事",items:[["list","先分类"],["search","再检索"],["shield","最后把关"]]});
  const main=card(root,{x:600,y:170,w:1180,h:780,title:"下一部分的内容区",icon:"doc",rows:[.8,.6,.7,.5],gap:40});main.rows.forEach(r=>r.style.height="16px");
  // corner(c) 算出缩到角落的效果值（缩放 CORNER.k、左上角落在 CORNER.x / CORNER.y）；虚线框预示常驻位置，dock() 做缩过去的过程
  const cc=corner(c),tg=dashBox(root,{x:CORNER.x,y:CORNER.y,w:parseFloat(c.style.width)*cc.sc2,h:parseFloat(c.style.height)*cc.sc2,tone:"or"});
  return t=>{A(c,t,S(n),{k:"pop"});
    setCheck(c,after(t,S(n+1))?{done:[0],cur:1}:after(t,S(n,1.4))?{cur:0}:{});
    dock(c,t,S(n+1,1.6));X(T,t,S(n+1,1.6),{d:.3});A(main,t,S(n+1,2.2),{k:"fade"});
    A(tg,t,S(n+1,1.6),{k:"fade",d:.3});X(tg,t,S(n+1,2.4),{d:.3});
  }}},

// d4 roadmap · setRoad（原 g09）
"d4":{build(root,sc){const n=sc.scenes[0].a;head(root,"D-4","流程与进度","roadmap · setRoad","路线图上走到第几站");
  const svg=svgRoot(root),r=roadmap(root,svg,{names:["用法一","用法二","用法三"],subs:["分类","路由","把关"],w:1200,y:250});
  const body=card(root,{x:160,y:560,w:1600,h:400,title:"当前一站的内容",icon:"doc",rows:[.7,.5,.6],gap:44});body.rows.forEach(e=>e.style.height="16px");
  return t=>{A(r.line,t,S(n),{k:"fade"});[...r.nodes,...r.cards].forEach((e,i)=>A(e,t,S(n,.2)+(i%3)*.15,{k:"fade"}));A(body,t,S(n,.8),{k:"fade"});
    const nx=after(t,S(n+1));setRoad(r,nx?{done:[0],cur:1,pos:kf(t,[[S(n+1)-LEAD,0],[S(n+1,.6),1]])}:{cur:0,pos:0});
    const p=bump(t,S(n+1),.8);setFx(body,{op2:1-.8*p});
  }}},

// d5 listIn（原 f10）
"d5":{build(root,sc){const n=sc.scenes[0].a;head(root,"D-5","流程与进度","listIn","排队、逐个到达、超出上限");
  const w=win(root,{x:420,y:170,w:1080,h:800,title:"请求队列"});winBar(w,{size:32});const B=w.body;
  const names=["生成周报","翻译文档","修复登录","压缩图片","导出账单","同步日历","清理缓存"];
  const items=names.map((s,i)=>{const e=box(B,"card","",{x:40,y:28,w:1000,h:96});e.style.boxShadow="none";
    chip(e,"#"+(1041+i),{x:24,y:18,size:30});lbl(e,s,{x:200,y:26,size:36,tx:1});return e});
  const cap=box(B,"","",{x:30,y:28+5*114-10,w:1020,h:0});cap.style.borderTop="3px dashed var(--l2)";const cl1=lbl(B,"上限 5 条",{x:890,y:28+5*114+4,size:28});
  const at=[S(n),S(n,.9),S(n,1.8),S(n+1),S(n+1,1.1),S(n+2),S(n+2,1.2)];
  return t=>{A(w,t,S(n)-.5,{k:"fade"});A(cap,t,S(n)-.3,{k:"fade"});A(cl1,t,S(n)-.3,{k:"fade"});
    const k=listIn(items,t,S(n),{at,rh:114,max:5,d:.5});items.forEach((e,i)=>{e.style.borderLeft=i===k-1?"8px solid var(--or)":""});
  }}},

// d6 cardSwap（原 f11）
"d6":{build(root,sc){const n=sc.scenes[0].a;head(root,"D-6","流程与进度","cardSwap","很多案例一个个过");
  const vs=["ok","ok","err","ok","warn"],cards=vs.map((v,i)=>{const c=card(root,{x:300,y:440,w:780,h:440,title:"案例 0"+(i+1),icon:"doc",rows:[.8,.55,.7,.45,.6],gap:48});title(c,42);
    c.bd=badge(c,{x:680,y:22,s:72,state:v});return c});
  const cl1=lbl(root,"已检查",{x:1420,y:420,size:40});const num=box(root,"big mono","0 / 5",{x:1420,y:490});num.style.fontSize="120px";
  const chk=[S(n,1.2),S(n+1,.9),S(n+1,2.45),S(n+2,1.1),S(n+2,2.3)];
  return t=>{cards.forEach((c,i)=>A(c,t,S(n)-.5+(4-i)*.08,{k:"fade"}));A(cl1,t,S(n)-.2,{k:"fade"});A(num,t,S(n)-.2,{k:"fade"});
    cardSwap(cards,t,S(n+1),{at:[S(n+1),S(n+1,1.6),S(n+2,.3),S(n+2,1.5)],d:.75});
    cards.forEach((c,i)=>A(c.bd,t,chk[i],{k:"pop"}));const k=chk.filter(s=>after(t,s)).length,txt=k+" / 5";if(num._t!==txt){num._t=txt;num.textContent=txt}
  }}},

// d7 lanes（原 g13）
"d7":{build(root,sc){const n=sc.scenes[0].a;head(root,"D-7","流程与进度","lanes","速度 / 耗时对比、超时");
  const svg=svgRoot(root),L=lanes(root,svg,{x:160,y:360,w:1600,h:130,gap:90,limit:5.2,limitLabel:"时限 5 秒",
    rows:[{label:"快",icon:"bolt",blocks:[.6,.4,.5,.3,.5,.4]},{label:"慢",icon:"clock",blocks:[1.4,1.8,1.2,1.6]}]});
  return t=>{L.lanes.forEach((l,i)=>{A(l.band,t,S(n)-.3+i*.1,{k:"fade"});A(l.head,t,S(n)-.2+i*.1,{k:"left"})});A(L.limit,t,S(n,.2),{k:"drop"});A(L.limit.label,t,S(n,.3),{k:"fade"});
    L.run(t,[[S(n,.4),1.8],[S(n,.4),S(n+1,1.6)-S(n,.4)]]);
  }}},

// d8 loopCycle（2026-09 新增）
"d8":{build(root,sc){const n=sc.scenes[0].a;head(root,"D-8","流程与进度","loopCycle","一轮轮地试，直到达成或受阻");const svg=svgRoot(root);
  const L=loopCycle(root,svg,{x:210,y:480,w:1500,cw:420,chh:160,dip:150,names:["看页面","判断","动手点击"],goal:"目标：把 Priya 改成经理",exits:[["目标达成","ok"],["页面受阻","err"]]});
  return t=>{L.show(t,S(n)-.4);
    L.run(t,[{s:S(n,.4),per:.9,texts:["团队页","点 Priya","Priya"]},{s:S(n+1,.2),per:.9,texts:["个人页","点改角色","改角色"]},{s:S(n+2),per:.9,n:2,texts:["已保存","达成 0.96",""]}]);
    L.exit(t,S(n+2,1.4),0);
  }}},

};
