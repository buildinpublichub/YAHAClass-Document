// F 组 · 状态与检查：正在处理、扫描筛查、两边对照
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// f0 分组标题
"f0":{...groupTitle("F","状态与检查","正在处理、扫描筛查、两边对照")},

// f1 runBorder（原 f09）
"f1":{build(root,sc){const n=sc.scenes[0].a;head(root,"F-1","状态与检查","runBorder","正在处理中 → 处理完成");
  const Lc=card(root,{x:180,y:270,w:700,h:400,title:"当前项",icon:"doc",rows:[.85,.6,.75,.5],gap:44});title(Lc,38);Lc.style.border="3px solid var(--or)";
  const Rc=card(root,{x:1040,y:270,w:700,h:400,title:"生成报告",icon:"gear",rows:[.85,.6,.75],gap:44});title(Rc,38);
  const m=meter(Rc,{x:40,y:320,w:560,h:18}),bd=badge(Rc,{x:604,y:24,s:60,state:"ok"});
  const cl1=lbl(root,"静态橙框：当前这一项",{x:530,y:720,size:36,tx:1,center:1}),cr=lbl(root,"",{x:1390,y:720,size:36,tx:1,center:1});
  return t=>{A(Lc,t,S(n)-.4,{k:"pop"});A(Rc,t,S(n)-.2,{k:"pop"});A(cl1,t,S(n),{k:"fade"});A(cr,t,S(n+1),{k:"fade"});
    runBorder(Rc,t,S(n+1),{until:S(n+2),speed:.32});
    setMeter(m,eio(P(t,S(n+1)-LEAD,S(n+2)-S(n+1))),after(t,S(n+2))?"ok":"or");
    const ok=after(t,S(n+2,.2));Rc.style.border=ok?"3px solid var(--ok)":"";A(bd,t,S(n+2,.2),{k:"pop"});
    const txt=ok?"绿框：处理完成":"跑光边框：正在处理";if(cr._t!==txt){cr._t=txt;cr.textContent=txt}
  }}},

// f2 scanBar · scanRun（原 f14）
"f2":{build(root,sc){const n=sc.scenes[0].a;head(root,"F-2","状态与检查","scanBar · scanRun","检测、筛查、逐个出结果");
  const names=["auth-core","http-client","json-parse","left-pad","img-resize","logger","crypto-utils","date-fmt","md-render","zip-stream","csv-reader","yaml-lite","color-conv","uuid-gen","deep-merge"];
  const st=["ok","ok","warn","ok","q","ok","ok","ok","warn","ok","q","ok","warn","ok","q"],tn={ok:"ok",warn:"warn",q:null};
  const items=names.map((s,i)=>{const e=card(root,{x:120+(i%5)*340,y:240+Math.floor(i/5)*166,w:320,h:130});e.style.boxShadow="none";
    const l=lbl(e,s,{x:22,y:45,size:28,tx:1});l.classList.add("mono");e.bd=badge(e,{x:252,y:41,s:48,state:"idle"});return e});
  const B=scanBar(root,{x0:110,x1:1810,y0:215,y1:727});
  const sum=[pill(root,"通过 9",{x:138,y:820,tone:"ok",icon:"check",size:38}),pill(root,"可疑 3",{x:0,y:820,tone:"warn",icon:"warn",size:38}),pill(root,"未知 3",{x:0,y:820,tone:"mut",icon:"q",size:38})];
  return t=>{rowOut(sum,120,40);items.forEach((e,i)=>A(e,t,S(n)-.4+(i%5)*.06+Math.floor(i/5)*.1,{k:"fade"}));
    scanRun(B,items,t,S(n+1),{d:3.2,hit:(i,since)=>{const e=items[i],on=since>=0;setBadge(e.bd,on?st[i]:"idle");tint(e,on&&tn[st[i]]?tn[st[i]]:null,on&&tn[st[i]]?.14:0);
      setFx(e,{sc2:on&&since<.35?1+.07*Math.sin(since/.35*Math.PI):1})}});
    sum.forEach((p,i)=>A(p,t,S(n+2)+i*.2,{k:"pop"}));
  }}},

// f3 compare（原 g14）
"f3":{build(root,sc){const n=sc.scenes[0].a;head(root,"F-3","状态与检查","compare","两种做法同构对照，焦点在哪栏");
  const C=compare(root,{y:170,h:780,titles:["逐字生成","一次算完"],icons:["chat","bolt"]});
  C.cols.forEach((c,i)=>{skel(c.body,{x:40,y:30,rows:[600,480,540,420].map(v=>v*(i?.5:1)),gap:44,h:16});
    lbl(c.body,"耗时",{x:40,y:280,size:32});const m=meter(c.body,{x:40,y:340,w:C.cw-80,h:24});setMeter(m,i?.12:.9,"l1");c.m=m});
  return t=>{A(C.L,t,S(n),{k:"pop"});A(C.R,t,S(n,.2),{k:"pop"});
    dim(C.R,t,S(n,1.2),{to:.35,back:S(n+1)});dim(C.L,t,S(n+1),{to:.35});
  }}},

// f4 verdictList（2026-09 新增）
"f4":{build(root,sc){const n=sc.scenes[0].a;head(root,"F-4","状态与检查","verdictList","一批问题逐条判定");
  const V=verdictList(root,{x:260,y:210,w:1400,rh:120,size:36,pw:160,title:"5 个问题",
    items:["员工能看别人的工资吗？","经理能批假吗？","员工能改自己的资料吗？","经理能改别人的角色吗？","工资页只给管理员吗？"]});
  return t=>{V.show(t,S(n)-.3);V.stamp(t,S(n+1),[["否","err",.97],["是","ok",.93],["是","ok",.91],["否","err",.95],["是","ok",.88]],{per:.4});
  }}},

// f5 matrix（2026-09 新增）
"f5":{build(root,sc){const n=sc.scenes[0].a;head(root,"F-5","状态与检查","matrix","几种角色 × 几个页面，逐个试");
  const M=matrix(root,{rows:["管理员","经理","员工"],cols:["首页","团队","工资","我的","设置"],hw:320,cw:250,rh:150,size:34,y:260});
  const k="ok",x="err";
  return t=>{M.show(t,S(n)-.3);M.fill(t,0,[[k,k,k,k,k],[k,k,x,k,x],[k,x,x,k,x]],{per:.22,at:[S(n,.9),S(n+1,.8),S(n+2)]});
  }}},

};
