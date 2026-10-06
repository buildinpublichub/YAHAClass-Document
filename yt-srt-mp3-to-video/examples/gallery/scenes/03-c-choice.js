// C 组 · 选择与判断：几个可能里选一个、打分、过不过阈值
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// c0 分组标题
"c0":{...groupTitle("C","选择与判断","几个可能里选一个、打分、过不过阈值")},

// c1 optBars · fanLinks（原 g02）
"c1":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-1","选择与判断","optBars · fanLinks","做选择题；输出的是概率");
  const svg=svgRoot(root),J=brandNode(root,{x:180,y:430,s:200,logo:DEMO_LOGO,label:"决策"});
  const O=optBars(root,{x:620,y:290,labels:["选项 A","选项 B","选项 C"],size:40,gap:150,pillW:230,w:760,bh:26});
  const L=fanLinks(svg,[392,530],O.rows.map(r=>r.pill));
  return t=>{A(J,t,S(n),{k:"pop"});A(J.label,t,S(n,.1),{k:"fade"});
    L.forEach((l,i)=>draw(l,t,S(n,.5)+i*.15,.5));O.rows.forEach((r,i)=>{A(r.pill,t,S(n,.8)+i*.15,{k:"left"});A(r.bar,t,S(n,1)+i*.15,{k:"fade"});A(r.pct,t,S(n+1),{k:"fade"})});
    O.fill(t,S(n+1),[.78,.42,.2]);const pk=after(t,S(n+1,1.5));O.pick(pk?0:-1);
    L.forEach((l,i)=>l.setAttribute("stroke",TONE[pk&&i===0?"or":"l1"]));setBrand(J,pk?"active":"idle");
  }}},

// c2 rotPill · rotateText（原 f06）
"c2":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-2","选择与判断","rotPill · rotateText","一个位置有几种可能");
  const words=["超时","权限不足","配置文件缺失"];
  const s=lbl(root,"这个报错的原因是",{x:220,y:318,size:64,tx:1});s.style.fontWeight="600";
  const rp=rotPill(root,words,{x:800,y:304,size:60,tone:"or"});
  const cap=lbl(root,"可能的原因",{x:220,y:560,size:32});
  const cs=words.map(w=>chip(root,w,{x:220,y:620,size:44,w:w.length*44+56}));
  const at=[S(n),S(n,1.4),S(n+1,.3),S(n+1,1.6),S(n+2),S(n+2,1.0)],seq=[0,1,2,0,1,2];
  return t=>{rowOut(cs,220,40);rp.style.left=(220+s.offsetWidth+30)+"px";
    A(s,t,S(n)-.3);A(rp,t,S(n),{k:"pop"});A(cap,t,S(n,.4),{k:"fade"});cs.forEach((c,i)=>A(c,t,S(n,.5)+i*.12,{k:"fade"}));
    const k=rotateText(rp,t,S(n),{at,seq,d:.5}),fin=after(t,S(n+2,1.8)),cls="a pill "+(fin?"warn":"or");if(rp.className!==cls)rp.className=cls;
    cs.forEach((c,i)=>{const on=i===k,col=on?(fin?"var(--warn)":"var(--or)"):"";c.style.borderColor=col;c.style.color=on?col:"var(--mut)";setFx(c,{dim:on?0:.3})});
  }}},

// c3 ynMeter（原 g04）
"c3":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-3","选择与判断","ynMeter","置信度、是非判断、阈值放行");
  const M=ynMeter(root,{x:260,y:500,w:1400,gate:.7,gateLabel:"阈值 0.7"});
  const val=box(root,"big mono","0.20",{x:260,y:250});val.style.fontSize="96px";const vl=lbl(root,"置信度",{x:540,y:290,size:36});
  const bd=badge(root,{x:1700,y:538,s:60,state:"idle"});
  return t=>{A(M,t,S(n),{k:"fade"});A(val,t,S(n,.3),{k:"fade"});A(vl,t,S(n,.3),{k:"fade"});A(bd,t,S(n,.5),{k:"pop"});
    const v=kf(t,[[S(n,.6),.2],[S(n,2.2),.45],[S(n+1),.45],[S(n+1,.9),.86],[S(n+1,2.2),.86],[S(n+1,3.1),.55]]);
    const pass=M.set(v,v>=.7?"ok":"or");M.setGate(pass?"ok":"l1");val.textContent=v.toFixed(2);val.style.color=pass?"var(--ok)":"";setBadge(bd,pass?"ok":"idle");
  }}},

// c4 ruler（原 g03）
"c4":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-4","选择与判断","ruler","打分、分档、落在哪个等级");
  const hd=box(root,"",`<span style="display:grid;width:48px;height:48px;color:var(--mut)">${_ico('<path d="M4 17a8 8 0 0116 0"/><path d="M12 17l4-5"/>')}</span><span>质量打分</span>`,{x:260,y:300,w:600});
  Object.assign(hd.style,{display:"flex",alignItems:"center",gap:"16px",font:"600 40px/1.2 NSC"});
  const R=ruler(root,{x:260,y:560,w:1400,n:5,labels:["0","1","2","3","4"]});
  const tk=["很差","勉强","一般","不错","很好"].map((s,i)=>lbl(root,s,{x:R.ax(i),y:700,center:1,size:30}));
  return t=>{A(hd,t,S(n),{k:"fade"});A(R,t,S(n,.2),{k:"fade"});tk.forEach((e,i)=>A(e,t,S(n,.6)+i*.1,{k:"fade"}));A(R.cur,t,S(n,1.2),{k:"drop"});
    R.setCur(kf(t,[[S(n,1.2),0],[S(n,2.6),1.4],[S(n+1),1.4],[S(n+1,1.2),3]]));
  }}},

// c5 brandNode · setBrand（原 g06）
"c5":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-5","选择与判断","brandNode · setBrand","某个具体产品 / 主体及其状态");
  const a=brandNode(root,{x:520,y:330,s:200,logo:DEMO_LOGO,label:"有 logo"}),b=brandNode(root,{x:1200,y:330,s:200,text:"AI",label:"没有 logo：短字"});
  const st=box(root,"mono","",{x:0,y:760,w:1920});Object.assign(st.style,{textAlign:"center",fontSize:"40px",color:"var(--mut)"});
  const seq=[[S(n+1),"active"],[S(n+1,.9),"ok"],[S(n+1,1.8),"err"],[S(n+1,2.7),"dim"]];
  return t=>{[a,b].forEach((e,i)=>{A(e,t,S(n,.2*i),{k:"pop"});A(e.label,t,S(n,.2*i+.2),{k:"fade"})});
    let s="idle";seq.forEach(([k,v])=>{if(after(t,k))s=v});setBrand(a,s);setBrand(b,s);st.textContent="state = "+s;A(st,t,S(n,1),{k:"fade"});
  }}},

// c6 pinAxis（2026-09 新增）
"c6":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-6","选择与判断","pinAxis","每个判断有多大把握");
  const G=pinAxis(root,{x:210,y:880,w:1500,labels:["0 没把握","0.5","1 很确定"]});
  const P1=G.pin({v:.97,text:"员工能改自己的角色吗？",tag:"否",tone:"err",h:400,cw:470});
  const P2=G.pin({v:.2,text:"试用期能请年假吗？",tag:"是",tone:"mut",h:400});
  const P3=G.pin({v:.55,text:"经理能看团队工资吗？",tag:"是",tone:"warn",h:150});
  return t=>{G.show(t,S(n)-.3);P1.play(t,S(n,.4));P2.play(t,S(n+1,.3));P3.play(t,S(n+2));pulse(P3.card,t,S(n+2,.9),{amt:.06});
    tint(P3.card,after(t,S(n+2,.9))?"warn":null,.12);
  }}},

// c7 rankList（2026-09 新增）
"c7":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-7","选择与判断","rankList","先打分、再排序、只取前几名");
  const R=rankList(root,{x:310,y:220,w:1300,rh:88,items:[["employee-card",.38],["pay-slip",.91],["team-list",.05],["payday-email",.33],["my-profile",.41],["pay-history",.87],["payroll-page",.96],["new-employee",.21]]});
  return t=>{R.show(t,S(n),{per:.14});R.sort(t,S(n+1));R.top(t,S(n+2),3);
  }}},


// c8 probChip（2026-09 新增）
"c8":{build(root,sc){const n=sc.scenes[0].a;head(root,"C-8","选择与判断","probChip","有一个概率，但旁白没说是多少");
  const rows=[["员工能看别人的工资吗？","否","err"],["这次需要补测试吗？","是","ok"],["该用哪个技能？","前端设计","or"]].map(([q,a,tn],i)=>{
    const y=330+i*170,c=card(root,{x:260,y,w:900,h:120});lbl(c,q,{x:36,y:40,size:36,tx:1});
    const r=pill(root,a,{x:1200,y:y+30,size:36,tone:tn}),pc=probChip(root,{x:1440,y:y+34,size:32});return [c,r,pc]});
  return t=>{rows.forEach(([c,r,pc],i)=>{A(c,t,S(n,.5*i),{k:"left"});A(r,t,S(n,.5*i+.3),{k:"pop"});A(pc,t,S(n+1,.3*i),{k:"pop"})});
  }}},
};
