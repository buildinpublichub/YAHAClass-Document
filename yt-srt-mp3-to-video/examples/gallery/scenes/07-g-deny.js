// G 组 · 否定与替换：排除、揭穿真面目、被新版本替换
// n = 本场景第一句字幕序号，S(n) / S(n+1) / S(n+2) 为各句开始；head() 写左上角两行小标题（见 00-common.js）

const SCENES={
// g0 分组标题
"g0":{...groupTitle("G","否定与替换","排除、揭穿真面目、被新版本替换")},

// g1 denyMark · deny · stopMark（原 g10）
"g1":{build(root,sc){const n=sc.scenes[0].a;head(root,"G-1","否定与替换","denyMark · deny · stopMark","排除、不行、被丢弃");
  const cs=["方案 A","方案 B","方案 C"].map((s,i)=>{const c=card(root,{x:180+i*550,y:300,w:450,h:340,title:s,icon:["doc","code","box"][i],rows:[.8,.55,.7,.45],gap:44});c.rows.forEach(r=>r.style.height="16px");return c});
  const dm=[denyMark(root,cs[0]),denyMark(root,cs[1],{mark:"stop"}),denyMark(root,cs[2])];
  const cap=["降暗 + 红叉","降暗 + ⊘","连同徽标掉落"].map((s,i)=>lbl(root,s,{x:405+i*550,y:700,center:1,size:34}));
  return t=>{cs.forEach((c,i)=>A(c,t,S(n)+i*.15,{k:"pop"}));
    deny(dm[0],t,S(n,.9));A(cap[0],t,S(n,1.1),{k:"fade"});
    deny(dm[1],t,S(n+1));A(cap[1],t,S(n+1,.2),{k:"fade"});
    deny(dm[2],t,S(n+1,1.4),{fall:S(n+1,2.3)});A(cap[2],t,S(n+1,1.6),{k:"fade"});
  }}},

// g2 flipNode · stopMark（原 g15b）
"g2":{build(root,sc){const n=sc.scenes[0].a;head(root,"G-2","否定与替换","flipNode · stopMark","揭示真实类型；这条路不走");
  const nd=node(root,{x:440,y:330,s:200,icon:"q",label:"类型",lsize:34});
  const pl=pill(root,"直接跳过",{x:1060,y:396,size:40});const sm=stopMark(root,0,0,64);
  const labs=[["flipNode",540,700],["stopMark",1220,700]].map(([s,x,y])=>{const e=lbl(root,s,{x,y,center:1,size:30});e.classList.add("mono");return e});
  return t=>{A(nd,t,S(n)-.2,{k:"pop"});A(nd.label,t,S(n)-.1,{k:"fade"});A(labs[0],t,S(n,.2),{k:"fade"});
    flipNode(nd,t,S(n,1.4),ico("list"));setNode(nd,after(t,S(n,1.6))?"active":"idle");
    A(pl,t,S(n+1),{k:"left"});A(labs[1],t,S(n+1,.2),{k:"fade"});
    sm.style.left=(1060+pl.offsetWidth+24)+"px";sm.style.top=(396+pl.offsetHeight/2-32)+"px";A(sm,t,S(n+1,.8),{k:"pop"});dim(pl,t,S(n+1,.8),{to:.45});
  }}},

// g3 pixelGrid · pixelSwap（原 f15）
"g3":{build(root,sc){const n=sc.scenes[0].a;head(root,"G-3","否定与替换","pixelGrid · pixelSwap","被替换、生成出来");
  const X0=510,Y0=220,W=900,H=560;
  const a=card(root,{x:X0,y:Y0,w:W,h:H,title:"草稿",icon:"doc",rows:[.62,.45,.7,.38,.55,.3],gap:52});title(a,40);a.rows.forEach(r=>r.style.height="18px");
  const b=win(root,{x:X0,y:Y0,w:W,h:H,title:"生成版"});winBar(b,{size:34});
  [[0,"or",220],[0,"l1",380],[1,"l1",520],[1,"ok",260],[2,"l1",600],[3,"or",180],[3,"l1",420],[4,"l1",340],[5,"ok",300],[6,"l1",560]].reduce((x,[r,tone,w],i,arr)=>{
    const prev=i&&arr[i-1][0]===r?x:0,e=box(b.body,"sk "+tone,"",{x:48+prev,y:40+r*60,w,h:20});e.style.borderRadius="10px";return prev+w+24},0);
  const c=card(root,{x:X0,y:Y0,w:W,h:H,title:"定稿",icon:"check",rows:[.82,.7,.78,.64,.74,.5],gap:52});title(c,40);c.rows.forEach(r=>r.style.height="18px");pill(c,"已审核",{x:700,y:20,tone:"ok",size:30});
  const G=pixelGrid(root,{x:X0,y:Y0,w:W,h:H,cols:20,rows:12});
  const cap=lbl(root,"",{x:960,y:830,size:40,tx:1,center:1});
  return t=>{A(a,t,S(n)-.4,{k:"pop"});
    pixelSwap(G,a,b,t,S(n+1),{d:1.5,seed:4});pixelSwap(G,b,c,t,S(n+2),{d:1.5,order:"dither",seed:8});
    const txt=after(t,S(n+2,.55))?"半调网点顺序 → 定稿":after(t,S(n+1,.55))?"确定性乱序 → 生成版":"草稿";if(cap._t!==txt){cap._t=txt;cap.textContent=txt}A(cap,t,S(n),{k:"fade"});
  }}},

// g4 verdictList.prune（2026-09 新增）
"g4":{build(root,sc){const n=sc.scenes[0].a;head(root,"G-4","否定与替换","verdictList.prune","留还是丢，丢掉的移走、剩下的收拢");
  const V=verdictList(root,{x:260,y:220,w:1400,rh:140,size:38,pw:140,title:"对话记录",items:["加一个导出按钮","团队页现在有什么？","导出是空的，修一下","标题栏再暗一点"]});
  return t=>{V.show(t,S(n)-.3);V.stamp(t,S(n,1),[["留","ok",.94],["丢","mut",.9],["留","ok",.97],["丢","mut",.88]],{per:.35});V.prune(t,S(n+1,.3),[1,3]);
  }}},

};
