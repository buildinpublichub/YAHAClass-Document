// B 组 · 焦点与强调：此刻该看哪里：焦点框、柔光、扫光、放大一级、顶一下
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// b0 分组标题
"b0":{...groupTitle("B","焦点与强调","此刻该看哪里：焦点框、柔光、扫光、放大一级、顶一下")},

// b1 focusFrame · trueFocus（原 f02）
"b1":{build(root,sc){const n=sc.scenes[0].a;head(root,"B-1","焦点与强调","focusFrame · trueFocus","同一时刻只有一个焦点");
  const names=["读取","规划","编码","测试","提交"],xs=[300,630,960,1290,1620];
  const ws=names.map((s,i)=>lbl(root,s,{x:xs[i],y:350,size:76,tx:1,center:1}));ws.forEach(w=>w.style.fontWeight="700");
  const ar=xs.slice(1).map(x=>{const e=box(root,"ico",ico("arrow",2.4),{x:x-165-26,y:377,w:52,h:52});e.style.color="var(--l2)";return e});
  const F=focusFrame(root,{len:34,w:6});
  const det=["拉取仓库和需求文档","拆成可以执行的小任务","逐个任务写出补丁","跑完整的测试套件","写好提交说明并推送"];
  const dc=card(root,{x:360,y:620,w:1200,h:250,title:"当前步骤",icon:"eye"}),dt=lbl(dc,"",{x:48,y:120,size:48,tx:1});
  const at=[S(n,1.2),S(n+1),S(n+1,1.4),S(n+2),S(n+2,1.4)];
  return t=>{ws.forEach((w,i)=>A(w,t,S(n)+i*.12));ar.forEach((a,i)=>A(a,t,S(n,.2)+i*.12,{k:"fade"}));
    const k=trueFocus(F,ws,t,at[0],{at,d:.55});A(dc,t,at[0],{k:"fade"});
    const txt=names[k]+"："+det[k];if(dt._t!==txt){dt._t=txt;dt.textContent=txt}
    const sw=at.slice(1).map(a=>bump(t,a+.1,.5)).reduce((x,y)=>x+y,0);setFx(dt,{op2:1-.8*sw});
  }}},

// b2 spotlight（原 f13）
"b2":{build(root,sc){const n=sc.scenes[0].a;head(root,"B-2","焦点与强调","spotlight","在一组里聚焦某一项");
  const bg=box(root,"","",{x:0,y:0,w:VW,h:VH});
  const ics=["bolt","db","shield","globe","gear","box"],cards=["A","B","C","D","E","F"].map((s,i)=>{const c=card(root,{x:180+(i%3)*540,y:250+Math.floor(i/3)*350,w:480,h:290,title:"方案 "+s,icon:ics[i],rows:[.8,.6,.7],gap:40});title(c,40);return c});
  const tag=pill(root,"重点",{x:1560,y:196,tone:"or",icon:"eye",size:32});
  return t=>{cards.forEach((c,i)=>A(c,t,S(n)-.4+i*.1,{k:"pop"}));
    spotlight(cards,t,S(n+1),{seq:[0,4,1,2],at:[S(n+1),S(n+1,1.0),S(n+1,2.0),S(n+2)],bg,d:.75});A(tag,t,S(n+2,.7),{k:"drop"});
  }}},

// b3 shineText（原 f05）
"b3":{build(root,sc){const n=sc.scenes[0].a;head(root,"B-3","焦点与强调","shineText","点名当前关键词（比变橙更轻）");
  const svg=svgRoot(root);const C=chain(root,svg,{items:[{icon:"doc",label:"读需求"},{icon:"code",label:"写代码"},{icon:"play",label:"跑测试"},{icon:"flag",label:"提交"}],s:140,gap:420,y:250,lsize:40});
  const cc=card(root,{x:260,y:590,w:1400,h:290,title:"本段重点",icon:"list"});title(cc,34);
  const se=box(cc,"",`只有<span>测试通过</span>才允许提交`,{x:48,y:130});se.style.font="600 64px/1.3 NSC";const kw=se.querySelector("span");
  return t=>{C.play(t,S(n)-.4,{per:.3});
    shineText(C.nodes[2].label,t,S(n+1),{color:"var(--mut)",hi:"#ffffff",d:1.1,rep:2,gap:.3});
    A(cc,t,S(n+1,1.4),{k:"fade"});shineText(kw,t,S(n+2),{color:"var(--tx)",hi:"var(--or)",w:.5,d:1.1,rep:2,gap:.2});
  }}},

// b4 title · winBar（原 g01）
"b4":{build(root,sc){const n=sc.scenes[0].a;head(root,"B-4","焦点与强调","title · winBar","主角卡片 / 窗口再放大一级");
  const c=card(root,{x:160,y:190,w:760,h:420,title:"卡片标题",icon:"doc",rows:[.9,.7,.8,.5,.65],gap:34});c.rows.forEach(r=>{r.style.height="16px"});
  const w=win(root,{x:1000,y:190,w:760,h:420,title:"窗口标题栏"});skel(w.body,{x:34,y:40,rows:[560,420,500,360],gap:44,h:16});
  const pills=[["默认胶囊 32px",""],["当前","or","bolt"],["通过","ok","check"],["失败","err","cross"],["可疑","warn","warn"]];
  const ps=pills.map(([s,tone,ic])=>pill(root,s,{x:160,y:700,tone,icon:ic}));
  const lb=lbl(root,"标签默认 26px",{x:160,y:860}),lt=lbl(root,"亮字标签 tx:1",{x:560,y:860,tx:1}),big=box(root,"big","64",{x:1000,y:840});
  return t=>{// 胶囊按实际宽度排成一行
    let x=160;ps.forEach(e=>{e.style.left=x+"px";x+=e.offsetWidth+24});
    A(c,t,S(n),{k:"pop"});A(w,t,S(n,.2),{k:"pop"});ps.forEach((e,i)=>A(e,t,S(n,.6)+i*.12));[lb,lt,big].forEach((e,i)=>A(e,t,S(n,1.2)+i*.15,{k:"fade"}));
    const up=after(t,S(n+1));title(c,up?40:32);winBar(w,{size:up?36:28,tx:up?1:0});pulse(c,t,S(n+1));pulse(w,t,S(n+1,.2));
  }}},

// b5 kf · bump · pulse · blink（原 g16）
"b5":{build(root,sc){const n=sc.scenes[0].a;head(root,"B-5","焦点与强调","kf · bump · pulse · blink","沿路径走、顶一下、闪烁提醒");
  const svg=svgRoot(root),pts=[[260,720],[620,380],[980,640],[1300,330]];
  const path=link(svg,{pts,tone:"l2",w:3,dash:"10 10"});const kd=pts.map(([x,y])=>{const e=box(root,"","",{x:x-9,y:y-9,w:18,h:18});e.style.borderRadius="50%";e.style.background="var(--l1)";return e});
  const nd=node(root,{x:260-60,y:720-60,s:120,icon:"box"});
  const bolt=node(root,{x:1480,y:280,s:140,icon:"bolt"}),lamp=box(root,"","",{x:1515,y:640,w:70,h:70});lamp.style.borderRadius="50%";lamp.style.background="var(--warn)";
  const labs=[["kf",760,820],["pulse / bump",1550,460],["blink",1550,750]].map(([s,x,y])=>{const e=lbl(root,s,{x,y,center:1,size:30});e.classList.add("mono");return e});
  return t=>{draw(path,t,S(n)-.3,.4);kd.forEach((e,i)=>A(e,t,S(n)-.2+i*.1,{k:"pop"}));A(nd,t,S(n)-.2,{k:"pop"});labs.forEach((e,i)=>A(e,t,S(n,.2)+i*.1,{k:"fade"}));
    const K=pts.map((q,i)=>[S(n,.4)+i*1.1,q]),[x,y]=kf(t,K);setFx(nd,{mx:x-260,my:y-720});
    A(bolt,t,S(n,.3),{k:"pop"});const bb=bump(t,S(n+1),.5)+bump(t,S(n+1,1.4),.5);setFx(bolt,{sc2:1+.2*bb});setNode(bolt,bb>.3?"active":"idle");
    A(lamp,t,S(n,.4),{k:"fade"});setFx(lamp,{op2:after(t,S(n+1,.2))?blink(t,S(n+1,.2),2.5,.2):1});
  }}},

// b6 searchHits（2026-09 新增）
"b6":{build(root,sc){const n=sc.scenes[0].a;head(root,"B-6","焦点与强调","searchHits","带着问题去一堆东西里找");
  const H=searchHits(root,{x:160,y:210,w:1600,ch:96,query:"员工在哪里看自己的工资？",keys:["员工","工资"],
    items:["login-page","payroll-page","team-list","employee-card","settings","pay-slip","roles-menu","my-profile","employee-list","sign-up",
      "pay-history","navbar","access-rules","dashboard","new-employee","holidays","pay-rates","reports","invite-form","footer","employee-page","help-page","time-off","team-pay","billing"]});
  return t=>{A(H.box,t,S(n)-.3,{k:"pop"});H.cells.forEach((c,i)=>A(c,t,S(n)-.2+(i%5)*.04+Math.floor(i/5)*.06,{k:"fade"}));
    H.type(t,S(n,.8),{cps:8});H.hit(t,S(n+1),after(t,S(n+2))?[1,3,5,8,10,14,16,20,23]:[],{stag:.08});
  }}},

};
