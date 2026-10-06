// H 组 · 标注与背景：括号归组、空槽与编号、舞台质感
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// h0 分组标题
"h0":{...groupTitle("H","标注与背景","括号归组、空槽与编号、舞台质感")},

// h1 brace（原 g11）
"h1":{build(root,sc){const n=sc.scenes[0].a;head(root,"H-1","标注与背景","brace","把几样东西归成一组");
  const svg=svgRoot(root),C=chain(root,svg,{x:180,y:470,s:120,gap:250,items:[{icon:"list",label:"判断"},{icon:"list",label:"判断"},{icon:"doc",label:"写作"},{icon:"list",label:"判断"},{icon:"doc",label:"写作"}]});
  const top=brace(root,svg,{x1:C.cx(0),x2:C.cx(3),y:C.y-56,h:30,teeth:[C.cx(1)],label:"判断题",tone:"or",lcolor:"or",size:36});
  const bot=brace(root,svg,{x1:C.xs[2]-10,x2:C.xs[4]+C.s+10,y:C.y+C.s+80,dir:-1,label:"后半段"});
  const ps=["分类","路由","把关"].map((s,i)=>pill(root,s,{x:1470,y:380+i*110,w:170}));
  const cur=brace(root,svg,{y1:372,y2:380+2*110+68,x:1672,shape:"curly",h:22,label:"三类"});
  return t=>{C.nodes.forEach((e,i)=>{A(e,t,S(n)-.3+i*.08,{k:"fade"});A(e.label,t,S(n)-.3+i*.08,{k:"fade"})});C.links.forEach(l=>draw(l,t,S(n)-.2,.3));
    draw(bot.path,t,S(n,.5),.6);A(bot.label,t,S(n,.9),{k:"fade"});
    draw(top.path,t,S(n+1),.8);A(top.label,t,S(n+1,.5),{k:"fade"});[0,1,3].forEach(i=>setNode(C.nodes[i],after(t,S(n+1,.6))?"active":"idle"));
    ps.forEach((e,i)=>A(e,t,S(n+1,1.2)+i*.12,{k:"left"}));draw(cur.path,t,S(n+1,1.7),.6);A(cur.label,t,S(n+1,2.1),{k:"fade"});
  }}},

// h2 dashBox · chip（原 g15a）
"h2":{build(root,sc){const n=sc.scenes[0].a;head(root,"H-2","标注与背景","dashBox · chip","空槽、待填位置；给问题编号");
  const db=dashBox(root,{x:340,y:300,w:560,h:340});const dl=lbl(db,"空槽",{x:280,y:142,center:1,size:34});
  const fill=card(root,{x:360,y:320,w:520,h:300,title:"填进来的卡",icon:"doc",rows:[.8,.6,.7],gap:40});
  const chips=["Q1","Q2","Q3"].map((s,i)=>chip(root,s,{x:1120+i*150,y:410,size:36}));
  const labs=[["dashBox",620,700],["chip",1330,700]].map(([s,x,y])=>{const e=lbl(root,s,{x,y,center:1,size:30});e.classList.add("mono");return e});
  return t=>{A(db,t,S(n)-.3,{k:"fade"});labs.forEach((e,i)=>A(e,t,S(n,.2)+i*.3,{k:"fade"}));
    chips.forEach((c,i)=>A(c,t,S(n,.8)+i*.15,{k:"pop"}));
    A(fill,t,S(n+1),{k:"drop"});dl.style.visibility=after(t,S(n+1))?"hidden":"";
  }}},

// h3 dotGrid · dotGlow（原 f16）
"h3":{build(root,sc){const n=sc.scenes[0].a;head(root,"H-3","标注与背景","dotGrid · dotGlow","舞台质感（可选背景）");
  const div=box(root,"","",{x:959,y:200,w:2,h:760});div.style.background="var(--edge)";
  const hl=lbl(root,"无背景",{x:540,y:210,size:36,tx:1,center:1}),hr=lbl(root,"点阵背景",{x:1380,y:210,size:36,tx:1,center:1});
  const D=dotGrid(root,{x:975,y:180,w:840,h:820,glow:1,op:.13});
  const svg=svgRoot(root),it=[{icon:"doc",label:"输入"},{icon:"gear",label:"处理"},{icon:"check",label:"输出"}];
  const Cl=chain(root,svg,{items:it,s:130,gap:260,x:215,y:480}),Cr=chain(root,svg,{items:it,s:130,gap:260,x:1055,y:480});
  const K=[S(n+2),S(n+2,.9),S(n+2,1.8)];
  return t=>{A(div,t,S(n)-.5,{k:"fade"});A(hl,t,S(n)-.4,{k:"fade"});A(hr,t,S(n)-.4,{k:"fade"});
    Cl.play(t,S(n)-.2,{per:.3});Cr.play(t,S(n)-.2,{per:.3});A(D,t,S(n+1),{k:"fade",d:.9});
    let cur=-1;K.forEach((s,i)=>{if(after(t,s))cur=i});[Cl,Cr].forEach(C=>C.nodes.forEach((e,i)=>setNode(e,i===cur?"active":"idle")));
    const x=kf(t,[[K[0],Cr.cx(0)],[K[1],Cr.cx(1)],[K[2],Cr.cx(2)]]);dotGlow(D,x-975,Cr.cy-180,300,eio(P(t,K[0]-LEAD,.5)));
  }}},

// h4 matchLinks（2026-09 新增）
"h4":{build(root,sc){const n=sc.scenes[0].a;head(root,"H-4","标注与背景","matchLinks","两边能不能一一对上，缺口在哪");const svg=svgRoot(root);
  const K=matchLinks(root,svg,{rh:104,size:32,miss:"无测试",
    left:{x:160,y:220,w:780,title:"access-rules.md",items:["员工只看自己的工资","只有管理员能改角色","经理审批请假","员工能改自己的资料","只有人事能删员工"]},
    right:{x:1240,y:220,w:520,title:"tests/",items:["own-pay.test","time-off.test","edit-profile.test"]},pairs:[[0,0],[2,1],[3,2]]});
  return t=>{K.show(t,S(n)-.3);K.link(t,S(n,1));K.flag(t,S(n+1));K.focus(t,S(n+2));
  }}},

};
