// A 组 · 出现与揭示：东西怎么登场：从看不清到看清、从乱码到答案、一条条写出来
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// a0 分组标题
"a0":{...groupTitle("A","出现与揭示","东西怎么登场：从看不清到看清、从乱码到答案、一条条写出来")},

// a1 blurText（原 f01）
"a1":{build(root,sc){const n=sc.scenes[0].a;head(root,"A-1","出现与揭示","blurText","讲到才清晰");
  const c=card(root,{x:160,y:270,w:1600,h:520,title:"本段要点",icon:"list"});title(c,36);
  const k1=chip(c,"1",{x:70,y:176,size:34}),k2=chip(c,"2",{x:70,y:356,size:34});
  const mk=(txt,y)=>{const e=box(c,"",esc(txt),{x:170,y});e.style.font="600 68px/1.3 NSC";e.style.whiteSpace="nowrap";return e};
  const s1=mk("上下文|越堆|越长，|模型的|注意力|就越|分散",160),s2=mk("最早|写下的|规则，|被挤出|视野",340);
  return t=>{A(c,t,S(n)-.5,{k:"fade"});A(k1,t,S(n)-.3,{k:"pop"});blurText(s1,t,S(n),{gap:.24});
    A(k2,t,S(n+1),{k:"pop"});A(s2,t,S(n+1),{k:"fade",d:.6});blurText(s2,t,S(n+2),{gap:.26,ghost:.4});
    dim(s1,t,S(n+2,1.4),{to:.4});dim(k1,t,S(n+2,1.4),{to:.4});
  }}},

// a2 splitRise（原 f03）
"a2":{build(root,sc){const n=sc.scenes[0].a;head(root,"A-2","出现与揭示","splitRise","章节标题、关键结论登场");
  const ch=lbl(root,"CHAPTER 03",{x:960,y:236,size:40,center:1,color:"or"});ch.classList.add("mono");
  const tt=lbl(root,"为什么测试总是通过",{x:960,y:300,size:100,tx:1,center:1});tt.style.fontWeight="700";
  const cc=card(root,{x:410,y:520,w:1100,h:200});const cl2=box(cc,"",esc("结论：测试本身写错了"),{x:0,y:58,w:1100});Object.assign(cl2.style,{font:"700 68px/1.2 NSC",textAlign:"center",color:"var(--tx)"});
  const en=lbl(root,"The test itself was wrong.",{x:960,y:790,size:56,tx:1,center:1});en.classList.add("mono");
  return t=>{splitRise(ch,t,S(n)-.3,{gap:.03,dist:40});splitRise(tt,t,S(n),{gap:.07,dist:90});
    A(cc,t,S(n+1)-.25,{k:"pop"});splitRise(cl2,t,S(n+1),{gap:.06,dist:80,bounce:1});
    splitRise(en,t,S(n+2),{gap:.035,dist:60,bounce:1});
  }}},

// a3 scramble（原 f04）
"a3":{build(root,sc){const n=sc.scenes[0].a;head(root,"A-3","出现与揭示","scramble","模型在猜、解码、答案揭晓");
  const ag=agent(root,{x:150,y:440,s:140,label:"模型",lsize:32});const svg=svgRoot(root);const ln=link(svg,{pts:[[306,510],[410,510]],tone:"l1",w:3,arrow:1});
  const w=win(root,{x:430,y:190,w:1370,h:700,title:"模型输出"});winBar(w,{size:32});const B=w.body;
  const row=(lab,y,cls,size)=>{const l=lbl(B,lab,{x:50,y,size:28});const v=box(B,cls,"",{x:50,y:y+44});v.style.fontSize=size+"px";v.style.fontWeight="600";v.style.whiteSpace="pre";return[l,v]};
  const [l1,v1]=row("ROOT CAUSE",36,"mono",64),[l2,v2]=row("根因",196,"",68),[l3,v3]=row("下一步",356,"",68);l1.classList.add("mono");
  const pA=pill(B,"解码中",{x:50,y:540,tone:"or",icon:"refresh",size:34}),pB=pill(B,"答案揭晓",{x:50,y:540,icon:"eye",size:34});
  return t=>{A(ag,t,S(n)-.5,{k:"pop"});A(ag.label,t,S(n)-.4,{k:"fade"});draw(ln,t,S(n)-.4,.4);A(w,t,S(n)-.5,{k:"fade"});
    [l1,l2,l3].forEach((e,i)=>A(e,t,S(n)-.3+i*.1,{k:"fade"}));[v1,v2,v3].forEach((e,i)=>A(e,t,S(n)-.3+i*.1,{k:"fade"}));
    scramble(v1,t,S(n),"cache key collision",{d:1.5,seed:3});
    scramble(v2,t,S(n+1),"缓存键冲突，读到了旧数据",{d:1.7,order:"random",seed:5});
    scramble(v3,t,S(n+2),"先回滚版本，再清空缓存",{d:1.2,pool:"block",seed:9});
    const done=after(t,S(n+2,1.3));A(pA,t,S(n)-.2,{k:"fade"});setFx(pA,{op2:done?0:1});A(pB,t,S(n+2,1.3),{k:"pop"});
  }}},

// a4 writer（原 g05）
"a4":{build(root,sc){const n=sc.scenes[0].a;head(root,"A-4","出现与揭示","writer","生成文字；写偏了、越界");
  const m=writer(root,{x:520,y:190,w:820,h:660,title:"写作",rows:11,seed:4,first:"先介绍一下背景…"});
  const wl=box(root,"",`<span style="display:grid;width:52px;height:52px">${ico("warn")}</span><span>跑题</span>`,{x:1510,y:420,w:260});
  Object.assign(wl.style,{display:"flex",alignItems:"center",gap:"12px",font:"600 36px/1.2 NSC",color:"var(--warn)"});
  return t=>{A(m,t,S(n)-.3,{k:"pop"});m.type(t,S(n,.2),{per:.32});m.drift(t,S(n+1,.3),{from:6});A(wl,t,S(n+1,1.2),{k:"left"});
  }}},

// a5 tokenRow（2026-09 新增）
"a5":{build(root,sc){const n=sc.scenes[0].a;head(root,"A-5","出现与揭示","tokenRow","切成词块，只有几块真正起作用");
  const ic=[agent(root,{x:150,y:402,s:84}),agent(root,{x:150,y:682,s:84})];
  const R1=tokenRow(root,["只有","管理员","能","打开","工资","单","。"],{x:280,y:400,size:72,mono:0});
  const R2=tokenRow(root,["员工","只","能","看","自己","的","工资","。"],{x:280,y:680,size:72,mono:0});
  const nt=lbl(root,"「工资单」拆成两块",{x:0,y:530,size:36,color:"or"});
  return t=>{ic.forEach((e,i)=>A(e,t,S(n)-.3+i*.2,{k:"pop"}));R1.type(t,S(n),{per:.16});R2.type(t,S(n,.5),{per:.16});
    const b=R1.toks[4];nt.style.left=(280+b.offsetLeft)+"px";A(nt,t,S(n+1),{k:"fade"});pulse(R1.toks[4],t,S(n+1,.2));pulse(R1.toks[5],t,S(n+1,.35));
    R1.focus(t,S(n+2),[1,4,5]);R2.focus(t,S(n+2,.3),[0,4,6]);X(nt,t,S(n+2));
  }}},

};
