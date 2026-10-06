// 场景构建：键为 scenes.json 里的场景 id。build 只在进入场景时调用一次，返回的函数每帧调用、只由 t 决定。
// 可复用的小工具：确定性伪随机（同一个 seed 永远得到同样的序列，保证逐帧一致）
const rnd=seed=>()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
const centered=e=>{e.style.transform="translate(-50%,-50%)";return e};

const SCENES={
  // s01 三百个屏幕：单个手机 → 拉远成满屏网格，格子随机点亮，计数 0 → 300
  s01:{build(root){
    const phone=card(root,{x:880,y:330,w:160,h:300,rows:[.7,.5,.9,.6,.8,.4],gap:34});phone.style.borderRadius="22px";
    const ag=agent(root,{x:1090,y:430,s:96});
    const cols=14,rows=7,cw=96,ch=110,gap=16,x0=(1920-cols*(cw+gap)+gap)/2,y0=(1080-rows*(ch+gap)+gap)/2;
    const cells=grid(root,{x:x0,y:y0,cols,rows,cw,ch,gap});
    const r=rnd(7),order=cells.map((c,i)=>[r(),i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
    const lightAt=new Array(cells.length);order.forEach((ci,k)=>lightAt[ci]=k/cells.length);
    const cc=box(root,"card","",{x:760,y:410,w:400,h:230});cc.style.background="#1c1f24";cc.style.zIndex=2;
    const cl1=lbl(cc,"已重建",{x:200,y:30,center:1,size:30});const num=box(cc,"big","0",{x:0,y:84,w:400});num.style.textAlign="center";num.style.fontSize="96px";
    return t=>{
      A(phone,t,S(1),{k:"pop"});A(ag,t,S(1)+.3,{k:"fade"});
      // 拉远：手机缩小淡出，网格淡入
      const z=eio(P(t,S(5)-LEAD,.8));setFx(phone,{sc2:1-.7*z,op2:1-z});setFx(ag,{op2:1-z});
      const t0=S(6)-LEAD,t1=S(7)+1.2;
      cells.forEach((c,i)=>{A(c,t,S(5)+.2+(i%cols)*.02+Math.floor(i/cols)*.03,{k:"fade",d:.4});
        const lit=t>=lerp(t0,t1,lightAt[i]);c.style.borderColor=lit?"rgba(216,119,86,.9)":"";c.style.background=lit?"rgba(216,119,86,.2)":""});
      A(cc,t,S(5)+.5,{k:"pop"});
      const frac=cl((t-t0)/(t1-t0));num.textContent=N(300*frac)+(frac>=1?"":"");
      // 结尾整片亮起
      const done=eio(P(t,t1,.5));cc.style.borderColor=done>.5?"var(--or)":"";
    }}},

  // s02 不是一次性交给代理：直连路径被否定 → 下方流程轨道逐节点走到终点
  s02:{build(root){
    const task=card(root,{x:300,y:190,w:360,h:200,title:"整个 App",icon:"box",rows:[.9,.6,.8,.5]});
    const ag=agent(root,{x:1470,y:240,s:100,label:"代理"});
    const svg=svgRoot(root);
    const direct=link(svg,{d:curve(662,290,1462,290),tone:"l1",w:3,arrow:1});
    const x_=badge(root,{x:1040,y:268,s:44,state:"err"});
    const tag=pill(root,"一次交付",{x:1000,y:210,tone:"mut"});centered(tag);tag.style.left="1060px";tag.style.top="236px";
    const n=5,xs=[...Array(n)].map((_,i)=>460+i*250),Y=760;
    const track=link(svg,{pts:[[xs[0],Y],[xs[n-1],Y]],tone:"l2",w:4});
    const nodes=xs.map((x,i)=>{const b=box(root,"card",`<span class="mono" style="color:var(--mut)">${i+1}</span>`,{x:x-34,y:Y-34,w:68,h:68});b.style.borderRadius="50%";b.style.display="grid";b.style.placeItems="center";return b});
    const trackOn=link(svg,{pts:[[xs[0],Y],[xs[n-1],Y]],tone:"ok",w:4});
    const flag=pill(root,"走到终点",{x:xs[n-1]-70,y:Y+62,tone:"ok",icon:"flag"});
    const flow=lbl(root,"结构化流程",{x:xs[0]-34,y:Y-110,tx:1,size:26});
    return t=>{
      A(task,t,S(8)-.4);A(ag,t,S(8)-.2,{k:"fade"});A(ag.label,t,S(8),{k:"fade"});
      draw(direct,t,S(8),.7);A(tag,t,S(8)+.3,{k:"fade"});
      // 否定：直连变暗，出现红叉
      A(x_,t,S(9),{k:"pop"});dim(direct,t,S(9),{to:.25});dim(tag,t,S(9),{to:.3});
      A(flow,t,S(10)-.2,{k:"fade"});draw(track,t,S(10),.8);
      const s0=S(10)+.4,s1=S(11)+.2,step=(s1-s0)/(n-1);
      nodes.forEach((nd,i)=>{const ti=s0+i*step;A(nd,t,ti-.3,{k:"pop"});
        const ok=t>=ti+.35,act=t>=ti-LEAD&&!ok;nd.style.borderColor=ok?"var(--ok)":act?"var(--or)":"";nd.style.background=ok?"rgba(166,201,133,.15)":act?"rgba(216,119,86,.15)":"";
        nd.firstChild.style.color=ok?"var(--ok)":act?"var(--or)":"var(--mut)"});
      draw(trackOn,t,s0,(s1-s0)+.35);
      A(flag,t,s1+.5,{k:"rise"});
    }}},

  // s03 只讲方法：左卡细节模糊 + 问号 → 右侧复刻卡逐行变清晰并打勾
  s03:{build(root){
    const mk=(x,title)=>{const c=card(root,{x,y:290,w:460,h:420,title});c.rows2=[0,1,2,3,4].map(i=>box(c,"sk l1","",{x:30,y:100+i*60,w:[300,220,340,260,200][i],h:14}));return c};
    const L=mk(330,"他们的描述"),R=mk(1130,"我们的复刻");
    const q=badge(root,{x:750,y:268,s:50,state:"q"});q.style.background="var(--card)";
    const checks=R.rows2.map((r,i)=>badge(R,{x:390,y:92+i*60,s:30,state:"ok"}));
    const svg=svgRoot(root),ar=link(svg,{pts:[[810,500],[1110,500]],tone:"or",w:3,arrow:1});
    return t=>{
      A(L,t,S(12)-.3);L.rows2.forEach(r=>setFx(r,{blur:5}));
      A(q,t,S(13),{k:"pop"});
      draw(ar,t,S(14),.6);A(R,t,S(14)+.3,{k:"right"});
      R.rows2.forEach((r,i)=>{const s=S(15)+i*.32;setFx(r,{blur:lerp(7,0,eio(P(t,s-LEAD,.4)))});A(checks[i],t,s+.25,{k:"pop"})});
    }}},

  // s04 无法靠话术绕过：代理带“完成了”冲向闸门，灯变红被弹回
  s04:{build(root){
    const svg=svgRoot(root),Y=640;
    const track=link(svg,{pts:[[300,Y],[1640,Y]],tone:"l2",w:4});
    const g=gate(root,{x:950,y:Y-190,h:190,arm:170,label:"检查"});
    const nx=card(root,{x:1320,y:Y-70,w:260,h:140,title:"下一步",rows:[.7,.5]});
    const ag=agent(root,{x:380,y:Y-50,s:100});
    const say=pill(root,"做完了",{x:290,y:Y-130,icon:"chat"});   // 右缘与代理对齐，冲到闸门前不碰竖杆
    return t=>{
      draw(track,t,S(16)-.4,.7);A(g,t,S(16),{k:"fade"});A(g.label,t,S(16),{k:"fade"});A(nx,t,S(16)+.2,{k:"fade"});A(ag,t,S(16)-.2,{k:"pop"});
      gateSet(g,0,after(t,S(18))?"err":"l2");
      A(say,t,S(17)-.3,{k:"pop"});
      const go=eio(P(t,S(17),1.1)),back=eo(P(t,S(18)-LEAD,.6));
      const dx=420*go-200*back;setFx(ag,{mx:dx});setFx(say,{mx:dx});
      dim(say,t,S(18),{to:.3});
    }}},

  // s05 找缝隙：代理从闸门下方绕行 → 红叉 → 橙色新拦截堵住 → 只能正常通过
  s05:{build(root){
    const svg=svgRoot(root),Y=640;
    link(svg,{pts:[[300,Y],[1640,Y]],tone:"l2",w:4}).style.strokeDashoffset=0;
    const g=gate(root,{x:950,y:Y-190,h:190,arm:170,label:"检查"});
    const nx=card(root,{x:1320,y:Y-70,w:260,h:140,title:"下一步",rows:[.7,.5]});
    const ag=agent(root,{x:380,y:Y-50,s:100});
    const by=link(svg,{d:`M430 ${Y} C 640 ${Y+260}, 1180 ${Y+260}, 1310 ${Y+40}`,tone:"l1",w:3,dash:"10 10"});
    const byOn=link(svg,{d:by.getAttribute("d"),tone:"or",w:3});
    const x_=badge(root,{x:1150,y:Y+150,s:44,state:"err"});
    const wall=box(root,"","",{x:1100,y:Y+110,w:18,h:140});wall.style.background="var(--or)";wall.style.borderRadius="6px";
    const wl=pill(root,"我们的改动",{x:1030,y:Y+272,tone:"or"});
    const ok=badge(root,{x:1560,y:Y-96,s:44,state:"ok"});
    return t=>{
      A(g.label,t,0,{k:"none"});
      const wd=S(21)-.2,open=wd+.7,through=wd+.9;
      gateSet(g,eio(P(t,open,.4)),after(t,open)?"ok":"err");
      A(by,t,S(19),{k:"fade"});draw(byOn,t,S(20),1.4);
      // 代理沿绕行曲线走到 70% 处
      const f=.7*eio(P(t,S(20)-LEAD,1.4)),back=eio(P(t,wd-LEAD,.5));const [px,py]=along(by,f*(1-back));
      A(x_,t,S(20)+1.1,{k:"pop"});X(x_,t,wd,{});
      A(wall,t,wd,{k:"drop"});A(wl,t,wd+.2,{k:"fade"});dim(by,t,wd+.1,{to:.2});dim(byOn,t,wd+.1,{to:.2});
      // 闸门打开后正常通过
      const go=eio(P(t,through,.7));setFx(ag,{mx:(px-430)+go*810,my:py-Y});   // 停在“下一步”卡左侧，不压住标题
      A(ok,t,through+.6,{k:"pop"});
    }}},

  // s06 频道介绍：中心卡 → 四周小窗口
  s06:{build(root){
    // 连线先画（在卡片下层），从卡片左右边缘连到四个窗口
    const svg=svgRoot(root),pts=[[240,160],[1380,160],[240,730],[1380,730]],WW=300,WH=190;
    const c=card(root,{x:800,y:450,w:320,h:150,title:"软件公司",icon:"code",itone:"or",rows:[.6]});
    const ws=pts.map(([x,y])=>win(root,{x,y,w:WW,h:WH}));
    const ls=pts.map(([x,y])=>link(svg,{d:x<900?curve(800,525,x+WW,y+WH/2):curve(1120,525,x,y+WH/2),tone:"l2",w:2.5}));
    const ch=centered(pill(root,"我们的频道",{x:960,y:672,icon:"play",tone:"or"}));
    return t=>{A(c,t,S(22),{k:"pop"});
      ls.forEach((l,i)=>draw(l,t,S(23)+i*.15,.5));ws.forEach((w,i)=>A(w,t,S(23)+.3+i*.15,{k:"fade"}));
      A(ch,t,S(24),{k:"rise"})}}},

  // s07 同一个循环：左侧 App 上的循环 → 复制一份到“你的 App”
  s07:{build(root){
    const mkLoop=(x,title)=>{const c=card(root,{x,y:250,w:560,h:600,title,icon:"box"});
      const g=box(root,"","",{x,y:250,w:560,h:600});const s=sv(g,"svg",{width:560,height:600,style:"position:absolute;left:0;top:0;overflow:visible"});
      const rg=ring(s,{cx:280,cy:340,r:170});const d=dot(s,{r:9,tone:"or"});
      const names=["计划","构建","检查","评审"];const ps=names.map((n,i)=>{const [px_,py_]=rg.at(i*90);const p=pill(g,n,{x:px_,y:py_});return centered(p)});
      return{c,g,rg,d,ps}};
    const Lp=mkLoop(260,"他们的 App"),Rp=mkLoop(1100,"你的 App");
    const svg=svgRoot(root),ar=link(svg,{pts:[[830,550],[1090,550]],tone:"or",w:3,arrow:1});
    // 胶囊压在圆环上：背景用不透明色，环线不会透过文字
    const run=(o,t,s0,s1)=>{o.ps.forEach((p,i)=>{A(p,t,s0+i*.25,{k:"pop"});const on=t>=lerp(s0,s1,i/4);p.className="a pill"+(on?" or":"");p.style.background=on?"color-mix(in srgb, var(--or) 18%, var(--card))":"var(--card)"});
      const f=cl((t-s0)/(s1-s0));o.rg.setArc(0,360*eio(f));place(o.d,f>0?o.rg.at(360*eio(f)):null)};
    return t=>{
      A(Lp.c,t,S(25)-.3);run(Lp,t,S(25),SE(26));
      draw(ar,t,S(27),.6);A(Rp.c,t,S(27)+.2,{k:"right"});A(Rp.g,t,S(27)+.2,{k:"fade"});
      setFx(Rp.g,{mx:lerp(-840,0,eio(P(t,S(27)-LEAD,.9))),op2:eio(P(t,S(27)-LEAD,.9))});
      run(Rp,t,S(28),SE(28));
    }}},
};
