/* ===== yt-srt-mp3-to-video 通用组件库（lib.js） =====
   构建时原样放在场景代码之前，全部是全局函数；只依赖 engine.html 已有的函数。
   默认尺寸已符合硬规则：标签 ≥26px，关键标签 / 胶囊 32–40px，大数字 ≥64px，节点 ≥110px，窗口宽 ≥520px。
   否定一律：降暗 + 旁边红叉徽标 / ⊘ / 掉落，不画删除线；横条保持水平。
   说明与示例见 references/components.md，预览见 references/components.html（组件与动效按「要表达什么」分组，源文件 examples/gallery/）。
   项目里同名函数（章节文件内的 const / function）会遮蔽这里的版本，不冲突。 */

/* ---------- 内部工具 ---------- */
// 元素在祖先 p 坐标系里的框 {x,y,w,h}（沿 offsetParent 累加；识别 centered / lbl center 的 -50% 平移）
function _boxIn(el,p){let x=0,y=0,e=el;while(e&&e!==p){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent}
  const w=el.offsetWidth,h=el.offsetHeight,tf=el.style.transform||"";
  if(/translate\(-50%,\s*-50%\)/.test(tf)){x-=w/2;y-=h/2}else if(/translateX\(-50%\)/.test(tf))x-=w/2;return{x,y,w,h}}
// 线性图标 SVG：name 为引擎图标名，或以 "<" 开头的自定义 path 片段
function _ico(n,sw=2){return n&&n[0]==="<"?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`:ico(n,sw)}

/* ========== 时间工具 ========== */
// 关键帧插值：K=[[时刻,值],...]，值可以是数字或数组（逐项插值），段间 eio 缓动；时刻用 S()/SE() 算好的秒数
function kf(t,K){const mix=(a,b,p)=>Array.isArray(a)?a.map((v,i)=>lerp(v,b[i],p)):lerp(a,b,p);
  if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(t<K[i][0]){const a=K[i-1],b=K[i];return mix(a[1],b[1],eio((t-a[0])/Math.max(.001,b[0]-a[0])))}return K[K.length-1][1]}
// 单次脉冲：从 s 起 d 秒内 0 → 1 → 0（sin 曲线），用于闪一下、顶一下、提亮一下
function bump(t,s,d=.6){const q=P(t,s-LEAD,d);return q>0&&q<1?Math.sin(q*Math.PI):0}
// 闪烁（光标 / 提示灯）：s 之前返回 0，之后按 hz 在 1 和 lo 之间交替；返回值直接给 setFx 的 op2
function blink(t,s=-1e9,hz=2.5,lo=.25){return t<s-LEAD?0:(Math.floor(t*hz)%2?lo:1)}
// 元素脉冲放大一次：amt 放大幅度（默认 .12），d 时长
function pulse(el,t,s,o={}){const b=bump(t,s,o.d||.5);setFx(el,{sc2:1+(o.amt??.12)*b});return b}

/* ========== 文字与外观 ========== */
// 卡片标题 / 任意文字放大：el 为 card()（改它的 .head）或任意文字元素；size 字号（默认 34），标题里的图标随字号放大
function title(el,size=34){const h=el.head||el;h.style.fontSize=size+"px";h.querySelectorAll("svg").forEach(s=>{s.style.width=s.style.height=Math.round(size*1.05)+"px"});return el}
// 窗口标题栏：size 字号（默认 30），h 栏高（默认随字号），tx:1 标题用亮字；内容区 w.body 随栏高下移
function winBar(w,o={}){const s=o.size||30,h=o.h||Math.max(54,Math.round(s*1.9)),b=w.querySelector(".wbar");if(!b)return w;
  b.style.height=h+"px";b.style.fontSize=s+"px";if(o.tx)b.style.color="var(--tx)";
  b.querySelectorAll("i").forEach(i=>{i.style.width=i.style.height=Math.round(h*.26)+"px"});if(w.body)w.body.style.top=h+"px";w.barH=h;return w}

/* ========== 选项与刻度 ========== */
// 选项胶囊 + 概率条：labels 选项文字，size 胶囊字号（34），gap 行距，pillW 胶囊定宽，pw 条起点（相对 x），w 条宽（520），bh 条高（22），icons 每项图标
// 返回 {rows:[{pill,bar,pct}], set(i,0–1,tone), pct(i,文字), fill(t,s,[值],{d,pct}) 一起长出, pick(i,tone) 高亮第 i 项（-1 取消）}
function optBars(p,o={}){const labels=o.labels||[],s=o.size||34,g=o.gap||Math.round(s*2.6),ph=Math.round(s*1.72)+2,bh=o.bh||22,w=o.w||520,pw=o.pw||(o.pillW?o.pillW+36:200);
  const rows=labels.map((l,i)=>{const y=o.y+i*g,pl=pill(p,l,{x:o.x,y,size:s,w:o.pillW,icon:o.icons&&o.icons[i]});pl.style.height=ph+"px";
    const bar=meter(p,{x:o.x+pw,y:y+(ph-bh)/2,w,h:bh}),pct=lbl(p,"",{x:o.x+pw+w+20,y:y+(ph-s*1.2)/2,size:s,tx:1});pct.classList.add("mono");return{pill:pl,bar,pct,y}});
  const R={rows,ph,gap:g,
    set(i,v,tone){setMeter(rows[i].bar,v,tone||"l1")},
    pct(i,txt){rows[i].pct.textContent=txt},
    fill(t,s0,vals,op={}){const q=eio(P(t,s0-LEAD,op.d||.8));vals.forEach((v,i)=>{R.set(i,v*q,op.tone);if(op.pct!==false)R.pct(i,q>0?Math.round(v*q*100)+"%":"")});return q},
    pick(i,tone="or"){rows.forEach((r,k)=>{const c="a pill"+(k===i?" "+tone:"");if(r.pill.className!==c)r.pill.className=c;r.bar.fill.style.background=TONE[k===i?tone:"l1"]})}};
  return R}
// 扇形连线：从一点 from=[x,y] 连到每个元素左侧中点（in:1 反过来：从元素右侧中点汇到这一点；side:"top" 连到元素顶边中点）
// els 与 svg 在同一父元素坐标系；返回 path 数组，配合 draw() 生长
function fanLinks(svg,from,els,o={}){const par=svg.parentNode;return els.map(e=>{const b=_boxIn(e,par);let d;
  if(o.side==="top")d=vcurve(from[0],from[1],b.x+b.w/2,b.y-10);else if(o.in)d=curve(b.x+b.w+10,b.y+b.h/2,from[0],from[1]);else d=curve(from[0],from[1],b.x-10,b.y+b.h/2);
  return link(svg,{d,tone:o.tone||"l1",w:o.w||3,arrow:o.arrow})})}
// 打分尺：n 道刻度（默认 5，数字 0…n-1，或 labels 数组，labels:false 不写数字）+ 橙色倒三角游标；ins 两端内缩，ts 刻度字号（34），below:0 数字放上方
// 返回尺元素，.ticks .tl .cur；setCur(v) 游标移到第 v 道（可小数），停在整刻度时该数字变橙；ax(i) 第 i 道的舞台 x
function ruler(p,o={}){const w=o.w||1000,n=o.n||5,ins=o.ins??70,h=o.h||28,ts=o.ts||34,cs=o.cs||48,ch=Math.round(cs*24/28),below=o.below??1;
  const g=box(p,"","",{x:o.x,y:o.y,w,h});g.body=box(g,"","",{x:0,y:0,w,h});g.body.style.background="linear-gradient(90deg,var(--l2),var(--l1))";g.body.style.borderRadius="8px";
  const step=(w-2*ins)/(n-1);g.rx=[...Array(n)].map((_,k)=>ins+k*step);g.at=v=>ins+v*step;g.ax=i=>o.x+g.at(i);
  g.ticks=g.rx.map(x=>{const e=box(g,"","",{x:x-5,y:-16,w:10,h:h+32});e.style.background="var(--tx)";e.style.borderRadius="3px";return e});
  const labs=o.labels===false?[]:(o.labels||[...Array(n)].map((_,k)=>String(k)));
  g.tl=labs.map((s,k)=>{const e=lbl(g,s,{x:g.rx[k],y:below?h+30:-Math.round(ts*1.2+26),center:1,size:ts,tx:1});e.classList.add("mono");return e});
  g.cur=box(g,"",`<svg viewBox="0 0 28 24" width="${cs}" height="${ch}" style="display:block"><path d="M0 0H28L14 24z" fill="var(--or)"/></svg>`,{x:-cs/2,y:below?-ch-22:h+22,w:cs,h:ch});
  if(!below)g.cur.firstChild.style.transform="scaleY(-1)";
  g.setCur=v=>{g.cur.style.left=(g.at(v)-cs/2)+"px";const k=Math.round(v),on=Math.abs(v-k)<.04;g.tl.forEach((e,i)=>e.style.color=on&&i===k?"var(--or)":"")};return g}
// 是非仪：0–1 横向轨道 + 填充 + 白色竖针，两端写 ends（默认 0 / 1）；gate 阈值位置（0–1，可选）画一道闸线，gateLabel 其标签；split:1 轨道分成两半
// 返回元素，set(v,tone) 同时移动填充和竖针（tone 默认 or），返回是否过阈值；setGate(tone) 闸线着色
function ynMeter(p,o={}){const w=o.w||1000,th=o.th||36,ls=o.ls||34,H=th+120,ty=60,g=box(p,"","",{x:o.x,y:o.y,w,h:H});
  const mk=(x,ww,rad)=>{const e=box(g,"","",{x,y:ty,w:ww,h:th});e.style.background="var(--card2)";e.style.border="1px solid var(--l2)";e.style.borderRadius=rad;return e};
  if(o.split){mk(0,w/2-3,`${th/2}px 0 0 ${th/2}px`);mk(w/2+3,w/2-3,`0 ${th/2}px ${th/2}px 0`)}else mk(0,w,th/2+"px");
  g.fill=box(g,"","",{x:0,y:ty,w:0,h:th});g.fill.style.background="var(--or)";g.fill.style.borderRadius=th/2+"px";
  const ends=o.ends||["0","1"];g.ends=ends.map((s,k)=>{const e=lbl(g,s,{x:k?w:0,y:ty+th+22,center:1,size:ls,tx:1});e.classList.add("mono");return e});
  if(o.gate!=null){const gx=w*o.gate;g.gate=box(g,"","",{x:gx-3,y:ty-40,w:6,h:th+80});g.gate.style.background="var(--l1)";g.gate.style.borderRadius="3px";
    if(o.gateLabel!=null){g.gateL=lbl(g,o.gateLabel,{x:gx,y:ty-40-ls*1.2-8,center:1,size:ls,tx:1});g.gateL.classList.add("mono")}}
  g.needle=box(g,"","",{x:0,y:ty-22,w:8,h:th+44});g.needle.style.background="var(--tx)";g.needle.style.borderRadius="4px";
  g.set=(v,tone)=>{v=cl(v);g.fill.style.width=(w*v)+"px";g.fill.style.background=TONE[tone||"or"]||tone;g.needle.style.left=(w*v-4)+"px";return o.gate!=null&&v>=o.gate};
  g.setGate=tone=>{if(!g.gate)return;g.gate.style.background=TONE[tone]||tone;if(g.gateL)g.gateL.style.color=tone==="l1"?"":TONE[tone]||tone};
  g.set(o.v??0);return g}

/* ========== 写作窗口 ========== */
// 会逐条“打字”的窗口：骨架横条（全部水平）+ 橙色光标；w 宽（640），h 高（400），title 标题，rows 行数，lh 条高（16），gap 行距（44），seed 条长随机种子
// 返回窗口元素，.lines .caret；方法（每帧调用）：
//   m.type(t,s,{per,upto})  从 s 起每 per 秒打出一条；upto 只打到第几条
//   m.typeAt(t,[时刻...],{d}) 按给定时刻逐条打（null = 不出现）
//   m.drift(t,s,{from,over,d}) 跑题：第 from 条起的横条变黄、向右伸长越过窗口右边界 over 像素（不倾斜），右边界处出现虚线界标
function writer(p,o={}){const w=o.w||640,h=o.h||400,lh=o.lh||16,gap=o.gap||44,m=win(p,{x:o.x,y:o.y,w,h,title:o.title??"写作"});if(o.bar)winBar(m,o.bar);
  const top=o.top||((m.barH||54)+30),n=o.rows||Math.max(2,Math.floor((h-top-28)/gap)+1),r=rnd((o.seed||11)+7);
  m.style.overflow="visible";m.querySelector(".wbar").style.borderRadius="13px 13px 0 0";
  // first：前几行写真实短句（字符串或数组），观众才知道它在写什么；其余仍是骨架横条
  const F=o.first==null?[]:[].concat(o.first),fs=o.fs||Math.max(26,Math.round(lh*1.75));
  m.lines=[...Array(n)].map((_,i)=>{if(F[i]){const e=box(m,"",esc(F[i]),{x:34,y:top+i*gap+lh/2-fs*.6,w:Math.min(w-80,Math.round(fs*1.02*F[i].length)),h:Math.round(fs*1.2)});
      Object.assign(e.style,{font:`500 ${fs}px/1.2 "NSC"`,color:"var(--tx)",whiteSpace:"nowrap",overflow:"hidden"});e.w0=parseFloat(e.style.width);return e}
    const e=box(m,"sk","",{x:34,y:top+i*gap,w:Math.round((w-110)*(.5+.5*r())),h:lh});e.style.borderRadius=lh/2+"px";e.w0=parseFloat(e.style.width);return e});
  m.caret=box(m,"","",{x:0,y:0,w:5,h:lh+12});m.caret.style.background="var(--or)";m.caret.style.borderRadius="2px";
  m.edge=box(m,"","",{x:w-2,y:top-22,w:0,h:(n-1)*gap+lh+44});m.edge.style.borderLeft="3px dashed var(--warn)";base(m.edge,{op2:0});
  const caretAt=(last,k,on)=>{const L=m.lines[Math.max(0,last)];m.caret.style.left=(34+parseFloat(L.style.width)*(last<0?0:k)+8)+"px";m.caret.style.top=(parseFloat(L.style.top)-6)+"px";setFx(m.caret,{op2:on})};
  m.typeAt=(t,times,op={})=>{const d=op.d||.3;let last=-1,k=0;m.lines.forEach((l,i)=>{const s=times[i];if(s==null){setFx(l,{op2:0});return}const q=grow(l,t,s,{d});if(q>0){last=i;k=q}});
    caretAt(last,k,t<(times[0]??1e9)-LEAD?0:blink(t));return last};
  m.type=(t,s,op={})=>{const per=op.per||.35,n2=op.upto??m.lines.length;return m.typeAt(t,m.lines.map((_,i)=>i<n2?s+i*per:null),{d:per*.9})};
  m.drift=(t,s,op={})=>{const from=op.from??Math.floor(m.lines.length/2),over=op.over??150,q=eio(P(t,s-LEAD,op.d||.9));
    m.lines.forEach((l,i)=>{if(i<from)return;const tw=w-34+over+(i-from)*30;l.style.width=lerp(l.w0,tw,q)+"px";const c=q>0?"a sk warn":"a sk";if(l.className!==c)l.className=c});
    setFx(m.edge,{op2:q>0?Math.min(1,q*2):0});return q};
  return m}

/* ========== 品牌节点 ========== */
// 圆形决策节点，中间放项目提供的 logo SVG 字符串（fill/stroke 用 currentColor）；没有 logo 时写短字 text；s 直径（140），label 下方标签，lsize 标签字号（32），k logo 占直径比例（.56）
// 返回节点（.mark 为 logo / 文字，.label）；状态用 setBrand
function brandNode(p,o={}){const s=o.s||140,n=node(p,{x:o.x,y:o.y,s,round:1,label:o.label,lsize:o.lsize||32});
  if(o.logo){n.innerHTML="";const h=Math.round(s*(o.k||.56));n.mark=box(n,"",o.logo,{x:(s-h)/2-1,y:(s-h)/2-1,w:h,h});const g=n.mark.querySelector("svg");if(g)Object.assign(g.style,{width:"100%",height:"100%",display:"block"})}
  else{n.innerHTML=`<span style="font:700 ${Math.round(s*(o.text&&o.text.length>2?.24:.34))}px/1 NSC">${esc(o.text||"")}</span>`;n.mark=n.firstChild}
  setBrand(n,"idle");return n}
// 品牌节点状态：idle（亮白标志）/ active（橙）/ ok / err / warn / dim（灰）
function setBrand(n,state){setNode(n,state);if(n.mark)n.mark.style.color=state==="dim"?"var(--l2)":(!state||state==="idle")?"var(--tx)":""}

/* ========== 流程与导航 ========== */
// 横向节点链：items=[{icon,text,label}]（或 n 个空节点），s 节点边长（120），gap 节点间距（默认 2s），round 圆形，tone 连线色，arrow 箭头（默认有），lsize 标签字号（30）
// 返回 {nodes, links, xs, cx(i), cy, play(t,s,{per})}；play 让节点逐个出现、连线逐段生长
function chain(p,svg,o={}){const items=o.items||[...Array(o.n||4)].map(()=>({})),s=o.s||120,g=o.gap||s*2,n=items.length,x0=o.x??CX-((n-1)*g+s)/2,y=o.y??CY-s/2;
  const nodes=items.map((it,i)=>node(p,{x:x0+i*g,y,s,icon:it.icon,text:it.text,round:o.round,label:it.label,lsize:o.lsize||30}));
  const links=nodes.slice(1).map((_,i)=>link(svg,{pts:[[x0+i*g+s+12,y+s/2],[x0+(i+1)*g-12,y+s/2]],tone:o.tone||"l2",w:o.lw||3,arrow:o.arrow??1}));
  const C={nodes,links,xs:nodes.map((_,i)=>x0+i*g),cx:i=>x0+i*g+s/2,cy:y+s/2,y,s,
    play(t,s0,op={}){const per=op.per||.45;nodes.forEach((e,i)=>{A(e,t,s0+i*per,{k:"pop"});if(e.label)A(e.label,t,s0+i*per+.1,{k:"fade"});if(i)draw(links[i-1],t,s0+i*per-per*.6,per*.6)})}};
  return C}
// 常驻角落摆法（checklist / roadmap / 任意卡片）：k 缩放（.82，保证缩小后标签仍 ≥26px），x,y 缩放后左上角的舞台位置
const CORNER={k:.82,x:120,y:90};
// 算出把 el 缩放并移到角落的效果值：base(el, corner(el)) 固定在角落；配合 keep(el,"nav") 跨场景常驻
function corner(el,o={}){const c={...CORNER,...o},x0=parseFloat(el.style.left),y0=parseFloat(el.style.top),w=parseFloat(el.style.width)||el.offsetWidth,h=parseFloat(el.style.height)||el.offsetHeight;
  return{sc2:c.k,mx:c.x-(x0+w/2-c.k*w/2),my:c.y-(y0+h/2-c.k*h/2)}}
// 从原位置缩回角落的过程动画（s 开始，d 秒）；与 corner() 终点一致，之后的场景直接 base(el, corner(el))
function dock(el,t,s,o={}){const c=corner(el,o),q=eio(P(t,s-LEAD,o.d||.7));setFx(el,{sc2:lerp(1,c.sc2,q),mx:c.mx*q,my:c.my*q});return q}
// 章节导航清单：title 标题，items=[文字 或 [图标, 文字]]，w 宽（480），rh 行高（86）；默认放在舞台中央
// 返回卡片，.rows[i]（.dot 编号 .ic 图标 .tx 文字）；状态用 setCheck，角落常驻用 base(c, corner(c))
function checklist(p,o={}){const items=o.items||[],W=o.w||480,rh=o.rh||86,top=o.title?92:20,H=top+items.length*rh+16;
  const c=card(p,{x:o.x??CX-W/2,y:o.y??CY-H/2,w:W,h:H,title:o.title});if(c.head)title(c,34);
  c.rows=items.map((it,i)=>{const [ic,tx]=Array.isArray(it)?it:[null,it],rH=rh-12;const r=box(c,"","",{x:14,y:top+i*rh,w:W-28,h:rH});r.style.border="2px solid transparent";r.style.borderRadius="14px";
    r.dot=box(r,"mono",String(i+1),{x:14,y:(rH-46)/2,w:46,h:46});Object.assign(r.dot.style,{borderRadius:"50%",display:"grid",placeItems:"center",border:"2px solid var(--l1)",fontSize:"28px",color:"var(--mut)"});r.dot.n=String(i+1);
    let x=76;if(ic){r.ic=box(r,"ico",_ico(ic),{x:76,y:(rH-42)/2,w:42,h:42});r.ic.style.color="var(--mut)";x=134}
    r.tx=lbl(r,tx,{x,y:(rH-40)/2,size:33,tx:1});return r});return c}
// 清单状态（每帧调用）：done 已讲完 = 降暗 + 灰编号带小勾（不用绿）；cur 当前 = 橙框 + 橙编号；show 已露出；其余 = 模糊占位
function setCheck(c,st={}){c.rows.forEach((r,i)=>{const done=(st.done||[]).includes(i),cur=st.cur===i,show=cur||done||(st.show||[]).includes(i);
  r.style.borderColor=cur?"var(--or)":"transparent";r.dot.style.background=cur?"var(--or)":done?"var(--l1)":"transparent";r.dot.style.borderColor=cur?"var(--or)":"var(--l1)";r.dot.style.color=cur?"#111":done?"var(--bg)":"var(--mut)";
  const k=done?"d":"n";if(r.dot._k!==k){r.dot._k=k;r.dot.innerHTML=done?`<span style="display:grid;width:66%;height:66%">${ico("check",3.2)}</span>`:r.dot.n}
  if(r.ic)r.ic.style.color=cur?"var(--or)":"var(--mut)";setFx(r,{blur:show?0:4,op2:show?(done?.55:1):.4})})}
// 横向路线图：一条轨道 + n 个圆点节点 + 节点下挂卡（names 小字 26px，subs 大字 32px）；w 轨道长（1200），cw 卡宽
// 返回 {nodes,cards,ticks,line,prog,xs,y}；状态用 setRoad
function roadmap(p,svg,o={}){const names=o.names||["第一步","第二步","第三步"],n=names.length,subs=o.subs||[],w=o.w||1200,x0=o.x??CX-w/2,y=o.y??170;
  const xs=names.map((_,i)=>x0+(n>1?i*w/(n-1):w/2)),cw=o.cw||Math.min(300,(n>1?w/(n-1):w)-40),chh=subs.length?112:70;
  const line=link(svg,{pts:[[x0,y],[x0+w,y]],tone:"l2",w:4});line.style.strokeDashoffset=0;
  const prog=link(svg,{pts:[[x0,y],[x0+w,y]],tone:"or",w:4});
  const nodes=xs.map(x=>{const e=box(p,"","",{x:x-17,y:y-17,w:34,h:34});e.style.borderRadius="50%";e.style.border="4px solid var(--l1)";e.style.background="var(--bg)";return e});
  const cards=xs.map((x,i)=>{const c=box(p,"card","",{x:x-cw/2,y:y+36,w:cw,h:chh});c.name=lbl(c,names[i],{x:cw/2,y:subs.length?14:16,center:1,size:26});
    if(subs[i]!=null)c.sub=lbl(c,subs[i],{x:cw/2,y:52,center:1,size:32,tx:1});return c});
  const ticks=xs.map(x=>box(p,"",`<span style="color:var(--bg);display:grid;width:100%;height:100%">${ico("check",3.2)}</span>`,{x:x-11,y:y-11,w:22,h:22}));
  return{nodes,cards,ticks,line,prog,xs,y,n}}
// 路线图状态（每帧调用）：done 已讲完 = 节点灰实心带小勾 + 卡降暗（不用绿）；cur 当前 = 橙节点 + 橙框；clear 已露出；其余卡模糊；pos 橙色进度线走到第几个节点（默认 cur）
function setRoad(r,st={}){r.nodes.forEach((e,i)=>{const done=(st.done||[]).includes(i),cur=st.cur===i;
  e.style.borderColor=cur?"var(--or)":done?"var(--l2)":"var(--l1)";e.style.background=cur?"var(--or)":done?"var(--l1)":"var(--bg)";
  r.ticks[i].style.display=done?"block":"none";r.cards[i].style.borderColor=cur?"var(--or)":"";
  const clear=cur||done||(st.clear||[]).includes(i);setFx(r.cards[i],{blur:clear?0:5,dim:done?.4:0,op2:clear?1:.5})});
  const pos=st.pos??st.cur??0;r.prog.style.strokeDashoffset=r.prog.len*(1-cl(r.n>1?pos/(r.n-1):0))}

/* ========== 标注与否定 ========== */
// ⊘ 禁止标记：以 x,y 为中心，s 直径（56）；放在被否定元素旁边，不压在元素上；底色遮住下方连线（要“降暗 + 标记”一起出现时用 denyMark + deny）
function stopMark(p,x,y,s=56){const b=box(p,"","",{x:x-s/2,y:y-s/2,w:s,h:s});b.style.borderRadius="50%";b.style.background="var(--bg)";
  b.innerHTML=`<span style="display:grid;width:100%;height:100%;color:var(--err)">${ico("stop",2.4)}</span>`;return b}
// 否定第一步（在 build 里调用）：为 el 建好旁边的否定徽标，返回句柄 d，交给 deny() 每帧驱动；update 里不再创建元素
// 选项：mark:"x"（默认红叉）/ "stop"（⊘）；side 徽标在 right（默认）/ left / top；at=[x,y] 指定徽标中心；s 徽标大小（52）；gap 与元素的间距（16）
// el 须在 p 之内（徽标按 el 在 p 里的布局框摆放）；元素之间至少留约 70px 空隙，徽标才不会压到邻居
function denyMark(p,el,o={}){const b=_boxIn(el,p),S0=o.s||52,gp=o.gap??16,side=o.side||"right";
  let cx=side==="left"?b.x-gp-S0/2:side==="top"?b.x+b.w/2:b.x+b.w+gp+S0/2,cy=side==="top"?b.y-gp-S0/2:b.y+b.h/2;if(o.at){cx=o.at[0];cy=o.at[1]}
  const mark=o.mark==="stop"?stopMark(p,cx,cy,S0):badge(p,{x:cx-S0/2,y:cy-S0/2,s:S0,state:"err"});base(mark,{op:0});
  return{el,mark}}
// 否定第二步（每帧调用）：d 为 denyMark() 的返回值。el 降暗 + 徽标弹出；永远不画删除线
// 选项：to 降暗程度（.35），delay 徽标晚于降暗（.25 秒），fall:true 或时刻 = 连同徽标竖直掉落（rot 旋转角，默认 0，不倾斜），back 恢复时刻；返回降暗进度
function deny(d,t,s,o={}){const {el,mark:m}=d,q=dim(el,t,s,{to:o.to??.35,back:o.back});A(m,t,s+(o.delay??.25),{k:"pop"});
  if(o.back!=null)X(m,t,o.back,{k:"fade",d:.3});
  if(o.fall){const f=o.fall===true?s+1:o.fall,p=eio(P(t,f-LEAD,o.fd||.5));
    if(p>0)[el,m].forEach(e=>{const cur=(e._fx&&e._fx.dim)||0;setFx(e,{op2:1-p*.8,fy:180*p*p,rot:(o.rot||0)*p,dim:Math.max(cur,.6*p)})})}
  return q}
// 括号：横向 {x1,x2,y}（dir=1 齿朝下、括住下方，标签在上；dir=-1 反之）或竖向 {y1,y2,x}（dir=1 齿朝左、括住左侧，标签在右）
// shape:"curly" 为大括号；teeth:[x 或 y,...] 加中间齿 = 梳形括号（一次括住多个节点）；h 齿长（20），label 标签，size 字号（32），tone 颜色（l1）
// 返回 {path, label}；path 用 draw() 生长，label 用 A() 出现
function brace(p,svg,o={}){const tone=o.tone||"l1",h=o.h||20,sd=o.dir||1,size=o.size||32,V2=o.y1!=null;let d,lab=null;
  if(!V2){const {x1,x2,y}=o,m=(x1+x2)/2,e=y+sd*h;
    d=o.shape==="curly"?`M${x1} ${e}Q${x1} ${y} ${x1+h} ${y}L${m-h} ${y}Q${m} ${y} ${m} ${y-sd*h}Q${m} ${y} ${m+h} ${y}L${x2-h} ${y}Q${x2} ${y} ${x2} ${e}`
      :`M${x1} ${e}L${x1} ${y}L${x2} ${y}L${x2} ${e}`+(o.teeth||[]).map(x=>`M${x} ${y}L${x} ${e}`).join("");
    if(o.label!=null){const off=(o.shape==="curly"?h:0)+14;lab=lbl(p,o.label,{x:m,y:sd>0?y-off-size*1.2:y+off,center:1,size,color:o.lcolor||(o.tx===0?undefined:"tx")})}}
  else{const {y1,y2,x}=o,m=(y1+y2)/2,e=x-sd*h;
    d=o.shape==="curly"?`M${e} ${y1}Q${x} ${y1} ${x} ${y1+h}L${x} ${m-h}Q${x} ${m} ${x+sd*h} ${m}Q${x} ${m} ${x} ${m+h}L${x} ${y2-h}Q${x} ${y2} ${e} ${y2}`
      :`M${e} ${y1}L${x} ${y1}L${x} ${y2}L${e} ${y2}`+(o.teeth||[]).map(y=>`M${x} ${y}L${e} ${y}`).join("");
    if(o.label!=null){const off=(o.shape==="curly"?h:0)+18;lab=lbl(p,o.label,{x:sd>0?x+off:x-off,y:m-size*.6,size,color:o.lcolor||"tx"});if(sd<0)lab.style.transform="translateX(-100%)"}}
  const path=link(svg,{d,tone,w:o.w||3.5});return{path,label:lab}}

/* ========== 计数与对比 ========== */
// 大数字卡：value 初始文字（"0"），size 数字字号（96），label 下方标签（32px），icon 标签前图标，tone 数字颜色；w,h 卡片尺寸（440×260）
// 返回卡片，.num（配合 count() 滚动）.label；c.tone(tone) 改数字颜色
function countCard(p,o={}){const w=o.w||440,h=o.h||260,size=o.size||96,ls=o.lsize||32,c=card(p,{x:o.x,y:o.y,w,h});
  const blockH=size+(o.label?ls*1.2+22:0),y0=(h-blockH)/2;
  c.num=box(c,"big",esc(o.value??"0"),{x:0,y:y0,w});Object.assign(c.num.style,{fontSize:size+"px",textAlign:"center"});
  if(o.label){c.label=box(c,"",(o.icon?`<span style="display:grid;width:${ls}px;height:${ls}px">${_ico(o.icon)}</span>`:"")+`<span>${esc(o.label)}</span>`,{x:0,y:y0+size+22,w});
    Object.assign(c.label.style,{display:"flex",justifyContent:"center",alignItems:"center",gap:"12px",font:`500 ${ls}px/1.2 NSC`,color:"var(--mut)"})}
  c.tone=tone=>{c.num.style.color=tone?TONE[tone]||tone:""};if(o.tone)c.tone(o.tone);return c}
// 并排泳道（速度 / 耗时对比）：rows=[{label, icon, blocks:[时长...]}]，时长单位自定，max 轨道末端对应的量，limit 时限（同单位，可选）+ limitLabel
// x,y,w（1600）总框，h 每道高（120），gap 道间距（70），hw 左侧道头宽（300）
// 返回 {lanes, limit, play(i,t,s,d) 第 i 道在 s 起 d 秒内按时长逐块生长（返回是否越线）, run(t,[[s,d],...]) 全部播放并在越线时把时限线变红}
// 越过时限的部分预先切成红色块：生长到那里就是红的，不用斜线、不倾斜
function lanes(p,svg,o={}){const rows=o.rows||[],x=o.x??160,y=o.y??260,w=o.w||1600,lh=o.h||120,gp=o.gap||70,hw=o.hw||300,tx=x+hw,tw=w-hw,pad=12,iw=tw-2*pad;
  const tot=rows.map(r=>(r.blocks||[]).reduce((a,b)=>a+b,0)),max=o.max||Math.max(...tot,o.limit||0)*1.08,ux=v=>tx+pad+v/max*iw,LX=o.limit!=null?ux(o.limit):null;
  const L=rows.map((r,i)=>{const ly=y+i*(lh+gp);const band=box(p,"","",{x:tx,y:ly,w:tw,h:lh});Object.assign(band.style,{background:"var(--card2)",border:"1px solid var(--edge)",borderRadius:"14px"});
    const head=box(p,"","",{x,y:ly,w:hw-24,h:lh});Object.assign(head.style,{display:"flex",alignItems:"center",gap:"14px",font:"500 32px/1.2 NSC",color:"var(--tx)"});
    head.innerHTML=(r.icon?`<span style="display:grid;width:48px;height:48px;flex:none;color:var(--mut)">${_ico(r.icon)}</span>`:"")+`<span>${esc(r.label||"")}</span>`;
    let acc=0;const pieces=[];(r.blocks||[]).forEach((b,k)=>{const a=acc,e=acc+b;acc=e;const cut=o.limit!=null&&a<o.limit&&e>o.limit?[[a,o.limit,0],[o.limit,e,1]]:[[a,e,o.limit!=null&&a>=o.limit?1:0]];
      cut.forEach(([u0,u1,over],j)=>{const x0=ux(u0)+(j?0:3),x1=ux(u1)-(j===cut.length-1?3:0),el=box(p,"card","",{x:x0,y:ly+14,w:Math.max(2,x1-x0),h:lh-28});
        el.style.boxShadow="none";el.style.background="color-mix(in srgb, var(--l1) 38%, var(--card))";el.style.borderColor="var(--l1)";el.style.borderRadius=cut.length>1?(j?"0 10px 10px 0":"10px 0 0 10px"):"10px";if(over){el.style.background="var(--err)";el.style.borderColor="var(--err)"}
        pieces.push({el,a:u0,b:u1,k,over})})});
    return{band,head,pieces,total:acc,y:ly}});
  let lim=null;if(LX!=null){const H=rows.length*(lh+gp)-gp;lim=box(p,"","",{x:LX-3,y:y-24,w:6,h:H+48});lim.style.background="var(--l1)";lim.style.borderRadius="3px";
    if(o.limitLabel!=null){lim.label=box(p,"",`<span style="display:grid;width:40px;height:40px">${ico("clock")}</span><span>${esc(o.limitLabel)}</span>`,{x:LX-160,y:y-84,w:320});
      Object.assign(lim.label.style,{display:"flex",justifyContent:"center",alignItems:"center",gap:"10px",font:"500 34px/1.2 NSC",color:"var(--tx)"})}}
  const R={lanes:L,limit:lim,ux,
    play(i,t,s,d){const ln=L[i],pos=ln.total*P(t,s-LEAD,d);let curK=-1;
      ln.pieces.forEach(pc=>{const g=cl((pos-pc.a)/Math.max(1e-6,pc.b-pc.a));setFx(pc.el,{gx:g});if(g>0&&g<1)curK=pc.k});
      ln.pieces.forEach(pc=>{if(!pc.over)pc.el.style.borderColor=pc.k===curK?"var(--or)":"var(--l1)"});return o.limit!=null&&pos>o.limit+1e-6},
    hit(on){if(!lim)return;lim.style.background=on?"var(--err)":"var(--l1)";if(lim.label)lim.label.style.color=on?"var(--err)":"var(--tx)"},
    run(t,list){const r=list.map((sd,i)=>sd?R.play(i,t,sd[0],sd[1]):false);R.hit(r.some(Boolean));return r}};
  return R}
// 两栏同构对照：titles 两栏标题，icons 标题图标，x,y,w（1600），h（760），gap 两栏间距（100），vs 中间小字（可选），tones 两栏顶边色（阵营色，可选）
// 返回 {L, R, cols, cw}；每栏是 card，内容放进 .body（标题下方，坐标从 0,0 起）
function compare(p,o={}){const x=o.x??160,y=o.y??150,w=o.w||1600,h=o.h||760,gp=o.gap||100,cw=(w-gp)/2;
  const cols=[0,1].map(i=>{const c=card(p,{x:x+i*(cw+gp),y,w:cw,h,title:(o.titles||[])[i],icon:(o.icons||[])[i],itone:"tx"});if(c.head)title(c,36);
    if(o.tones&&o.tones[i])c.style.borderTop=`5px solid ${TONE[o.tones[i]]||o.tones[i]}`;c.body=box(c,"","",{x:0,y:100,w:cw,h:h-100});return c});
  const R={L:cols[0],R:cols[1],cols,cw};if(o.vs)R.vs=lbl(p,o.vs,{x:x+cw+gp/2,y:y+h/2-20,center:1,size:32});return R}

/* ========== 小件 ========== */
// 虚线框（空槽、待填位置、范围）：x,y,w,h，tone 颜色（l1），bw 线宽（3），r 圆角（14）
function dashBox(p,o={}){const b=box(p,"","",{x:o.x,y:o.y,w:o.w,h:o.h});b.style.border=`${o.bw||3}px dashed ${TONE[o.tone||"l1"]||o.tone}`;b.style.borderRadius=(o.r??14)+"px";return b}
// 小编号块（Q1、#3、1…）：等宽字，w,h（自动随字号），size 字号（30），tone 描边 / 文字色（可选）
function chip(p,text,o={}){const s=o.size||30,h=o.h||Math.round(s*1.75),w=o.w||Math.max(h,Math.round(String(text).length*s*.62+s)),c=box(p,"mono",esc(text),{x:o.x,y:o.y,w,h});
  Object.assign(c.style,{border:"2px solid var(--edge)",background:"var(--card)",borderRadius:"10px",display:"grid",placeItems:"center",fontSize:s+"px",color:"var(--tx)"});
  if(o.tone){c.style.borderColor=TONE[o.tone]||o.tone;c.style.color=TONE[o.tone]||o.tone}return c}
// 节点翻面（每帧调用）：从 s 起 d 秒内绕竖轴翻转，过半时把内容换成 html（翻开 = 揭示真面目）；翻回之前显示原内容
function flipNode(n,t,s,html,o={}){if(n._h0==null)n._h0=n.innerHTML;const a=P(t,s-LEAD,o.d||.4),deg=a<=0||a>=1?0:(a<.5?a*180:(a-1)*180);
  n.style.transform=deg?`perspective(600px) rotateY(${deg}deg)`:"";const k=a>=.5?1:0;if(n._flip!==k){n._flip=k;n.innerHTML=k?html:n._h0}return a}

/* ========== 动效（借鉴 React Bits 的效果思路，用本引擎重新实现；不含其代码） ==========
   只用 CSS / SVG，画面只由 t 决定；随机一律用 _fxHash / rnd。醒目效果（扫光、跑光边框、乱码解码、像素替换）每个场景最多用一个，且必须对应旁白含义。
   说明见 components.md（按表达分组，动效分散在各组里），预览见 references/components.html（源文件 examples/gallery/）。 */
// 回弹缓动（比引擎 es 更明显一点，约 10% 过冲），p 为 0–1 进度
function eback(p){if(p<=0)return 0;if(p>=1)return 1;const c1=1.7,c3=2.7;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2)};

// 确定性哈希：同一组整数参数永远得到同一个 0–1 值（整数混合后交给引擎 rnd；逐帧乱码、像素顺序用）
function _fxHash(...k){let h=0x9e3779b1|0;for(const v of k){h=Math.imul(h^(v|0),0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16}
  const r=rnd(((h>>>1)%2147483645)+1);r();return r()};

// 拆字：把 el 的文字拆成 inline-block 小块（只拆一次，缓存在 el._parts）；by："char"（默认，逐字）/"word"（按空格或 | 分词，| 不显示）；返回非空白小块数组
function _fxSplit(el,by="char"){if(el._parts)return el._parts;const src=el.textContent;el.innerHTML="";el._parts=[];
  const toks=by==="word"?src.split(/(\s+|\|)/).filter(x=>x&&x!=="|"):[...src];
  toks.forEach(tk=>{const sp=document.createElement("span");sp.textContent=tk;sp.style.display="inline-block";sp.style.whiteSpace="pre";el.appendChild(sp);if(tk.trim())el._parts.push(sp)});
  return el._parts};

/* ---- 1. BlurText：讲到才清晰 ---- */
// 逐词由模糊变清晰：el 的文字按词拆开（中文用 | 分词），从 s 起每 gap 秒一个词（错落），d 单词时长，from 起始模糊像素，dist 上移距离，ghost 开始前的占位透明度（0 = 不可见，.2 = 模糊占位）；返回最后一个词的进度
function blurText(el,t,s,o={}){const ps=_fxSplit(el,o.by||"word"),gap=o.gap??.2,d=o.d??.7,from=o.from??16,dist=o.dist??26,g=o.ghost??0;let last=0;
  ps.forEach((sp,i)=>{const p=P(t,s-LEAD+i*gap,d),e=eo(p);setFx(sp,{blur:lerp(from,0,e),op:lerp(g,1,cl(p*1.6)),my:dist*(1-e)});last=p});return last};

/* ---- 2. TrueFocus：同一时刻只有一个焦点 ---- */
// 焦点框：在 p 上建一个四角括号框（橙色），交给 trueFocus 每帧驱动；len 角长，w 线宽，tone 颜色
function focusFrame(p,o={}){const f=box(p,"","",{x:0,y:0,w:10,h:10}),L=o.len||30,w=o.w||5,c=TONE[o.tone||"or"]||o.tone;
  [[0,0],[1,0],[0,1],[1,1]].forEach(([a,b])=>{const e=E(f,"","");Object.assign(e.style,{position:"absolute",width:L+"px",height:L+"px",
    [a?"right":"left"]:"0",[b?"bottom":"top"]:"0",["border"+(b?"Bottom":"Top")]:`${w}px solid ${c}`,["border"+(a?"Right":"Left")]:`${w}px solid ${c}`,
    ["border"+(b?"Bottom":"Top")+(a?"Right":"Left")+"Radius"]:"6px"})});f.style.zIndex=5;return f};
// 焦点移动：els 一排元素（与 F 同一父元素），从 s 起按 seq 顺序每 per 秒换一个焦点（或 at 给出各次时刻），d 移动时长；
// 焦点外的元素 blur 像素模糊、dim 降暗；pad 框外扩；返回当前焦点序号（移动过半即算新焦点）
function trueFocus(F,els,t,s,o={}){const seq=o.seq||els.map((_,i)=>i),at=o.at||seq.map((_,k)=>s+k*(o.per||1)),d=o.d??.5,pad=o.pad??18,B=o.blur??5,D=o.dim??.55;
  let a=seq[0],b=seq[0],q=0;for(let k=1;k<seq.length;k++){const qq=eio(P(t,at[k]-LEAD,d));if(qq>0){a=seq[k-1];b=seq[k];q=qq}}
  const k0=eio(P(t,at[0]-LEAD,d)),par=F.parentNode,ba=_boxIn(els[a],par),bb=_boxIn(els[b],par);
  F.style.left=(lerp(ba.x,bb.x,q)-pad)+"px";F.style.top=(lerp(ba.y,bb.y,q)-pad)+"px";F.style.width=(lerp(ba.w,bb.w,q)+2*pad)+"px";F.style.height=(lerp(ba.h,bb.h,q)+2*pad)+"px";
  setFx(F,{op:k0,sc2:lerp(1.25,1,k0)});
  els.forEach((e,i)=>{const w=a===b?(i===a?1:0):(i===a?1-q:0)+(i===b?q:0);setFx(e,{blur:(1-w)*B*k0,dim:(1-w)*D*k0})});
  return q>=.5?b:a};

/* ---- 3. SplitText：标题逐字错落升起 ---- */
// 逐字升起：el 的文字拆成逐字，从 s 起每 gap 秒一个字，d 单字时长，dist 升起距离，bounce:1 带回弹，by:"word" 改为逐词；返回最后一个字的进度
function splitRise(el,t,s,o={}){const ps=_fxSplit(el,o.by||"char"),gap=o.gap??.045,d=o.d??.6,dist=o.dist??70;let q=0;
  ps.forEach((sp,i)=>{const p=P(t,s-LEAD+i*gap,d),e=o.bounce?eback(p):eo(p);setFx(sp,{op:cl(p*2.5),my:dist*(1-e)});q=p});return q};

/* ---- 4. DecryptedText / ScrambledText：乱码逐位解出 ---- */
const _FX_CJK="的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系很情者最立代想已通并提直题程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处府研";
const _FX_ASC="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@/<>=+";
const _FX_BLK="░▒▓█▚▞▙▟▛▜";
const _FX_POOL={cjk:_FX_CJK,ascii:_FX_ASC,block:_FX_BLK};
// 乱码解码：从 s 起 d 秒内把 el 逐位解成 text。order："seq"（从左到右，默认）/"random"（确定性乱序）；pool：乱码字符集（默认自动：中文位用常用字、其余用大写字母数字符号；"block" 方块字符较重，少用）
// fps 乱码刷新率（默认 16），seed 种子；未解出的位为暗灰（noise 颜色），刚解出的位先亮橙 .3 秒再转亮字；s 之前显示定格乱码（hide:1 则不显示）；返回进度
// 英文请给 el 加 .mono（等宽，乱码不抖宽度）；中文每字等宽，不必
function scramble(el,t,s,text,o={}){const cs=[...text],n=cs.length,d=o.d??1.2,fps=o.fps??16,seed=o.seed??7,t0=s-LEAD,pre=Math.min(.35,d*.3);
  const key=text+"|"+(o.order||"seq")+"|"+seed;
  if(el._scK!==key){el._scK=key;el.innerHTML=cs.map(c=>`<span>${esc(c)}</span>`).join("");el._scS=[...el.children];
    let ord=cs.map((_,i)=>i/Math.max(1,n-1));if(o.order==="random"){const R=rnd(seed*97+13),idx=cs.map((_,i)=>[R(),i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);ord=[];idx.forEach((ii,k)=>ord[ii]=k/Math.max(1,n-1))}
    el._scO=ord}
  const f=Math.floor(Math.max(t,t0)*fps),noise=o.noise||"var(--l1)";
  el._scS.forEach((sp,i)=>{const c=cs[i],rt=t0+pre+el._scO[i]*(d-pre);let ch=c,col="";
    if(/[\s:：，。,.、()（）\-]/.test(c)){}
    else if(t<rt){const pool=o.pool?(_FX_POOL[o.pool]||o.pool):/[㐀-鿿]/.test(c)?_FX_CJK:_FX_ASC;ch=o.hide&&t<t0?"　":[...pool][Math.floor(_fxHash(seed,i,f)*[...pool].length)];col=noise;if(o.hide&&t<t0)ch=/[㐀-鿿]/.test(c)?"　":" "}
    else if(t<rt+.3)col="var(--or)";
    if(sp._c!==ch){sp._c=ch;sp.textContent=ch}if(sp._k!==col){sp._k=col;sp.style.color=col}});
  return P(t,t0,d)};

/* ---- 5. ShinyText：斜向高光扫过文字 ---- */
// 扫光：el 为文字元素（行内文字也可以，会改成 inline-block）；从 s 起 d 秒匀速扫一遍，rep 遍数，gap 遍间隔秒数；color 文字底色，hi 高光色，w 高光带宽（相对文字宽），angle 角度
// 用 background-clip:text 的渐变实现，位置由 t 算出；不扫时文字就是底色；返回当前这一遍的进度
function shineText(el,t,s,o={}){const base=o.color||"var(--tx)",hi=o.hi||(LIGHT?"var(--pink)":"#ffffff"),bw=(o.w??.45)/3*100/2,ang=o.angle??110,d=o.d??1,rep=o.rep||1,gap=o.gap??.4;
  const key=base+hi+bw+ang;if(el._shK!==key){el._shK=key;Object.assign(el.style,{backgroundImage:`linear-gradient(${ang}deg, ${base} ${50-bw}%, ${hi} 50%, ${base} ${50+bw}%)`,
    backgroundSize:"300% 100%",backgroundRepeat:"no-repeat",webkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",webkitTextFillColor:"transparent"});
    if(getComputedStyle(el).display==="inline")el.style.display="inline-block"}
  let c=-.5,pr=0;for(let k=0;k<rep;k++){const p=P(t,s-LEAD+k*(d+gap),d);if(p>0&&p<1){c=lerp(-.4,1.4,p);pr=p}}
  el.style.backgroundPosition=`${((c-1.5)/-2*100).toFixed(2)}% 0`;return pr};

/* ---- 6. RotatingText：一个位置轮换几个词 ---- */
// 轮换胶囊：在 p 上建胶囊（x,y 左上角，size 字号 48，tone 胶囊色调），words 候选词；返回元素，交给 rotateText 每帧驱动（宽度随词自适应，词在胶囊内居中）
function rotPill(p,words,o={}){const s=o.size||48,H=Math.round(s*1.72),e=box(p,"pill"+(o.tone?" "+o.tone:""),"",{x:o.x,y:o.y,h:H});
  Object.assign(e.style,{display:"block",padding:"0",overflow:"hidden",fontSize:s+"px",width:"200px"});e.padX=Math.round(s*.72);e.H=H;
  e.words=words.map(w=>{const sp=E(e,"",esc(w));Object.assign(sp.style,{position:"absolute",left:"50%",top:"0",lineHeight:H+"px",whiteSpace:"nowrap",transform:"translateX(-50%)"});return sp});return e};
// 轮换：从 s 起按 seq（候选词序号，默认 0,1,2…）每 per 秒换一个词（或 at 给出各次时刻，at[0] 为第一个词出现）；旧词上移淡出、新词从下方进入，胶囊宽度平滑变化；d 切换时长；返回当前词序号
function rotateText(e,t,s,o={}){const seq=o.seq||e.words.map((_,i)=>i),at=o.at||seq.map((_,k)=>s+k*(o.per||1.2)),d=o.d??.5,H=e.H;
  let a=seq[0],b=seq[0],q=1;for(let k=1;k<seq.length;k++){const qq=eio(P(t,at[k]-LEAD,d));if(qq>0){a=seq[k-1];b=seq[k];q=qq}}
  const W=i=>e.words[i].offsetWidth;e.style.width=(lerp(W(a),W(b),q)+2*e.padX)+"px";
  e.words.forEach((w,i)=>{if(i===b&&(q>=1||a===b))setFx(w,{op2:1,my:0});else if(i===b)setFx(w,{op2:cl(q*1.4-.2),my:H*.7*(1-q)});else if(i===a)setFx(w,{op2:cl(1-q*1.4),my:-H*.7*q});else setFx(w,{op2:0})});
  return q>=.5?b:a};

/* ---- 7. Counter：里程表数字 ---- */
// 里程表：el 为数字元素（会改成等宽字），从 s 起 d 秒由 from 滚到 to；每一位竖向滚动（低位多转一圈，高位稍晚到位，stag 位间错落秒数），带千分位；位数随数值增减时多出的高位淡出 / 淡入
function odometer(el,t,s,o={}){const from=Math.round(o.from||0),to=Math.round(o.to??0),n=String(Math.max(Math.abs(from),Math.abs(to),1)).length,d=o.d??1.6,stag=o.stag??.07,L=1.12;
  if(!el._odo||el._odo.n!==n){el.innerHTML="";el.classList.add("mono");const fs=parseFloat(getComputedStyle(el).fontSize)||64,wrap=E(el,"","");
    Object.assign(wrap.style,{display:"inline-flex",height:L+"em",lineHeight:L+"em",verticalAlign:"top"});const cols=[];
    for(let c=0;c<n;c++){const k=n-1-c,col=E(wrap,"","");Object.assign(col.style,{display:"inline-block",width:".6em",height:L+"em",overflow:"hidden",textAlign:"center"});
      const strip=E(col,"",[...Array(30)].map((_,j)=>`<div style="height:${L}em">${j%10}</div>`).join(""));strip.style.display="block";const C={k,col,strip};cols.push(C);
      if(k>0&&k%3===0){C.comma=E(wrap,"",",");Object.assign(C.comma.style,{display:"inline-block",width:".45em",textAlign:"center"})}}
    el._odo={n,cols,px:fs*L}}
  const vt=lerp(from,to,eio(P(t,s-LEAD,d))),up=to>=from;
  el._odo.cols.forEach(C=>{const k=C.k,pw=Math.pow(10,k),fd=Math.floor(Math.abs(from)/pw)%10,td=Math.floor(Math.abs(to)/pw)%10,spin=from===to?0:(k<2?1:0);
    const dist=up?((td-fd+10)%10+10*spin):-(((fd-td+10)%10)+10*spin),q=eio(P(t,s-LEAD+stag*k,d)),pos=fd+dist*q,idx=((pos%10)+10)%10;
    setFx(C.strip,{my:-(10+idx)*el._odo.px});const vis=k===0||Math.abs(vt)>=pw-.5?1:0;setFx(C.col,{op2:vis});if(C.comma)setFx(C.comma,{op2:vis})});
  return P(t,s-LEAD,d)};

/* ---- 8. SplitFlapText：翻牌显示 ---- */
// 翻牌板：在 p 上建一排翻牌格（x,y 左上角），text 初始文字（决定格数；冒号、小数点、空格为窄格不翻），size 字号（140），cw/ch 单格宽高，gap 格间距；颜色跟随板的 style.color
function flapBoard(p,text,o={}){const size=o.size||140,cw=o.cw||Math.round(size*.8),ch=o.ch||Math.round(size*1.32),gap=o.gap??12,nw=Math.round(size*.42);
  const b=box(p,"","",{x:o.x,y:o.y});Object.assign(b.style,{display:"flex",gap:gap+"px",color:"var(--tx)"});b.ch=ch;
  b.cells=[...text].map(c=>{const narrow=/[:.\s]/.test(c),cell=E(b,"","");Object.assign(cell.style,{position:"relative",width:(narrow?nw:cw)+"px",height:ch+"px",flex:"none"});
    if(narrow){cell.innerHTML=`<div style="position:absolute;inset:0;display:grid;place-items:center;font:600 ${size}px/1 JBM,monospace">${esc(c)}</div>`;cell.narrow=1;return cell}
    const half=top=>{const h=E(cell,"","");Object.assign(h.style,{position:"absolute",left:"0",width:"100%",top:top?"0":ch/2+"px",height:ch/2+"px",overflow:"hidden",
        background:"var(--card)",border:"1px solid var(--edge)",borderRadius:top?"14px 14px 0 0":"0 0 14px 14px",transformOrigin:top?"50% 100%":"50% 0"});
      h.g=E(h,"","");Object.assign(h.g.style,{position:"absolute",left:"0",width:"100%",height:ch+"px",top:top?"0":(-ch/2)+"px",display:"grid",placeItems:"center",font:`600 ${size}px/1 JBM,monospace`});return h};
    cell.T=half(1);cell.B=half(0);cell.FT=half(1);cell.FB=half(0);
    const hinge=E(cell,"","");Object.assign(hinge.style,{position:"absolute",left:"0",width:"100%",top:(ch/2-2)+"px",height:"4px",background:"var(--bg)"});return cell});
  return b};
const _fxT=(e,v)=>{if(e._v!==v){e._v=v;e.textContent=v}};
// 翻牌：从 s 起把板上文字由 from 翻到 text（逐位错落 gap 秒，单次翻牌 d 秒；相同的位不翻）；上半页先翻下、下半页再落下；返回进度
function flapTo(b,t,s,text,o={}){const cs=[...text],fs=[...(o.from??text)],d=o.d??.45,g=o.gap??.08,per=`perspective(${b.ch*4}px) `;let last=1;
  b.cells.forEach((c,i)=>{if(c.narrow)return;const A0=fs[i]??"",Z=cs[i]??"",q=A0===Z?1:P(t,s-LEAD+i*g,d);if(A0!==Z)last=q;
    if(q<=0||q>=1){const v=q<=0?A0:Z;_fxT(c.T.g,v);_fxT(c.B.g,v);c.FT.style.visibility=c.FB.style.visibility="hidden";return}
    _fxT(c.T.g,Z);_fxT(c.B.g,A0);
    if(q<.5){c.FT.style.visibility="";c.FB.style.visibility="hidden";_fxT(c.FT.g,A0);c.FT.style.transform=per+`rotateX(${-180*q}deg)`;c.FT.style.background=`color-mix(in srgb, #000 ${Math.round(q*70)}%, var(--card))`}
    else{c.FB.style.visibility="";c.FT.style.visibility="hidden";_fxT(c.FB.g,Z);c.FB.style.transform=per+`rotateX(${180*(1-q)}deg)`;c.FB.style.background=`color-mix(in srgb, #000 ${Math.round((1-q)*70)}%, var(--card))`}});
  return last};
// 翻牌序列：K=[[时刻, 文字], ...]（时刻用 S() 算好），按时间逐次翻到下一段文字；o 同 flapTo
function flapSeq(b,t,K,o={}){let k=0;for(let i=1;i<K.length;i++)if(t>=K[i][0]-LEAD)k=i;
  return k?flapTo(b,t,K[k][0],K[k][1],{...o,from:K[k-1][1]}):flapTo(b,t,K[0][0],K[0][1],{from:K[0][1]})};

/* ---- 9. StarBorder / BorderGlow：边框跑光 ---- */
// 边框跑光：光点沿 el 的圆角边框匀速跑动 = 正在处理中（SVG 描边 dashoffset 由 t 算出）；从 s 起淡入，until 时刻淡出（可选）
// speed 每秒绕行圈数（.3），len 光点长度（相对周长，.07），n 光点个数（2，对称分布），tone 颜色（or），r 圆角（14），w 线宽（4）
function runBorder(el,t,s,o={}){
  if(!el._rb){const W=parseFloat(el.style.width)||el.offsetWidth,H=parseFloat(el.style.height)||el.offsetHeight,r=o.r??14,w=o.w||4,col=TONE[o.tone||"or"]||o.tone,n=o.n||2,len=o.len??.07;
    const per=2*(W+H)-8*r+2*Math.PI*r,seg=per/n,Lc=per*len,g=sv(el,"svg",{width:W,height:H,style:"position:absolute;left:-1px;top:-1px;overflow:visible;pointer-events:none"});
    const layers=[[Lc*1.4,w*3.2,.18],[Lc*3,w,.16],[Lc*2,w,.34],[Lc,w,1]].map(([L,sw,op])=>{const e=sv(g,"rect",{x:0,y:0,width:W,height:H,rx:r,ry:r,fill:"none",stroke:col,"stroke-width":sw,"stroke-linecap":"round",opacity:op});
      e.style.strokeDasharray=`${L} ${seg-L}`;e.L=L;return e});el._rb={g,layers,per,Lc}}
  const R=el._rb,t0=s-LEAD,travel=(t-t0)*(o.speed??.3)*R.per,op=eio(P(t,t0,.35))*(o.until!=null?1-eio(P(t,o.until-LEAD,.35)):1);
  R.layers.forEach(e=>{e.style.strokeDashoffset=(e.L-R.Lc)-travel+R.Lc});setFx(R.g,{op});return op};

/* ---- 10. AnimatedList：逐条弹入 ---- */
// 列表逐条弹入：items 全部摆在第一行位置（最新的在顶部），从 s 起每 per 秒到达一条（或 at 给出各条到达时刻）；新项缩放 + 淡入弹入，旧项平滑下移 rh 像素；max 上限，超出后最旧的淡出；d 动画时长；返回已到达条数
function listIn(items,t,s,o={}){const at=o.at||items.map((_,i)=>s+i*(o.per||.8)),rh=o.rh||110,d=o.d??.5,max=o.max||1e9;let n=0;
  items.forEach((el,i)=>{const p=P(t,at[i]-LEAD,d);if(p>0)n++;let slot=0;for(let j=i+1;j<items.length;j++)slot+=eio(P(t,at[j]-LEAD,d));
    const fade=cl(slot-(max-1));setFx(el,{op:cl(p*2.2)*(1-fade),sc2:lerp(.7,1,eback(p)),my:slot*rh})});return n};

/* ---- 11. Stack / CardSwap：一摞卡片轮换 ---- */
// 卡片轮换：cards 叠放在同一位置（cards[0] 在最上），从 s 起每 per 秒（或 at 给出各次时刻）最上面一张下滑离开、再收到最底，其余各上一层
// dx,dy 每层偏移（默认 36,-66：向右上，露出后面各层的标题条），k 每层缩小比例，fade 每层降暗，drop 下滑距离，d 单次时长；返回当前最上面卡片的序号
function cardSwap(cards,t,s,o={}){const n=cards.length,at=o.at||[...Array(o.times||n-1)].map((_,k)=>s+k*(o.per||1.2)),d=o.d??.8,dx=o.dx??36,dy=o.dy??-66,k=o.k??.04,fd=o.fade??.12,drop=o.drop??440;
  let m=0,f=0;at.forEach(a=>{const q=eio(P(t,a-LEAD,d));if(q>=1)m++;else if(q>0)f=q});
  cards.forEach((c,i)=>{const r=((i-m)%n+n)%n;let dep=r,oy=0,z=40-r*2;
    if(f>0){if(r===0){dep=(n-1)*eio(cl((f-.35)/.65));oy=drop*Math.sin(Math.PI*cl(f/.9));z=f<.55?60:1}else{dep=r-f;z=40-Math.round(dep*2)}}
    c.style.zIndex=z;setFx(c,{mx:dep*dx,my:dep*dy+oy,sc2:1-dep*k,dim:Math.min(.7,dep*fd)})});
  return f>=.5?(m+1)%n:m%n};

/* ---- 12. Stepper：步骤条推进 ---- */
// 步骤推进：R 为组件库 roadmap()；s 起第 0 步为当前，at 为走到第 1、2…步的时刻；已完成打灰勾（不用绿）、当前橙色、连线逐段填充（d 填充时长）、没讲到的步骤模糊；返回当前步骤序号
function stepRun(R,t,s,o={}){const at=o.at||[],d=o.d??.6;let pos=0,cur=after(t,s)?0:-1;
  at.forEach(a=>{const q=eio(P(t,a-LEAD,d));pos+=q;if(q>=.5)cur++});
  setRoad(R,{cur,done:[...Array(Math.max(0,cur)).keys()],pos});
  R.nodes.forEach((e,i)=>{if(i>0&&at[i-1]!=null)pulse(e,t,at[i-1]+d*.5,{amt:.25,d:.45})});return cur};

/* ---- 13. SpotlightCard：柔光聚焦 ---- */
// 柔光：一束径向柔光在一组卡片上移动，照到的卡片内部被照亮、边框转橙，远处卡片略降暗；els 卡片（同一父元素），从 s 起按 seq 依次移到各卡中心（at 给出各次时刻，d 移动时长）
// r 光半径（380），amt 光强（.16），dim 远处降暗（.35），bg 可选的舞台背景层（同步画一层更大更淡的光）；返回当前停在的卡片序号
function spotlight(els,t,s,o={}){const seq=o.seq||els.map((_,i)=>i),at=o.at||seq.map((_,k)=>s+k*(o.per||1)),d=o.d??.7,r=o.r||380,amt=o.amt??.16,D=o.dim??.35;
  const par=els[0].parentNode,C=els.map(e=>{const b=_boxIn(e,par);return[b.x+b.w/2,b.y+b.h/2,b]});
  let a=seq[0],b=seq[0],q=0;for(let k=1;k<seq.length;k++){const qq=eio(P(t,at[k]-LEAD,d));if(qq>0){a=seq[k-1];b=seq[k];q=qq}}
  const k0=eio(P(t,at[0]-LEAD,.6)),X0=lerp(C[a][0],C[b][0],q),Y0=lerp(C[a][1],C[b][1],q);
  els.forEach((e,i)=>{const bx=C[i][2],lx=X0-bx.x,ly=Y0-bx.y,dist=Math.hypot(C[i][0]-X0,C[i][1]-Y0),near=cl(1-dist/(Math.max(bx.w,bx.h)*.75));
    e.style.backgroundImage=k0>0&&!LIGHT?`radial-gradient(circle ${r}px at ${lx.toFixed(1)}px ${ly.toFixed(1)}px, rgba(255,236,224,${(amt*k0).toFixed(3)}), rgba(255,236,224,0) 100%)`:"";// 亮色不用发光，只靠描边与褪色
    e.style.borderColor=k0>0?`color-mix(in srgb, var(--or) ${Math.round(near*k0*85)}%, var(--edge))`:"";setFx(e,{dim:D*(1-near)*k0})});
  if(o.bg&&!LIGHT){const bb=_boxIn(o.bg,o.bg.parentNode),pb=_boxIn(par,o.bg.parentNode);o.bg.style.backgroundImage=`radial-gradient(circle ${r*1.8}px at ${(X0+pb.x-bb.x).toFixed(1)}px ${(Y0+pb.y-bb.y).toFixed(1)}px, rgba(255,236,224,${(.06*k0).toFixed(3)}), rgba(255,236,224,0) 100%)`}
  return q>=.5?b:a};

/* ---- 14. Radar / Scanner：扫描线检查 ---- */
// 扫描线：在 p 上建一条竖向扫描线（从 x0 扫到 x1，覆盖 y0–y1），左侧带渐隐拖尾；交给 scanRun 驱动
function scanBar(p,o={}){const h=o.y1-o.y0,B=box(p,"","",{x:o.x0-3,y:o.y0,w:6,h});Object.assign(B.style,{background:"var(--or)",borderRadius:"3px",boxShadow:"0 0 18px rgba(216,119,86,.7)",zIndex:6});
  B.trail=box(B,"","",{x:-220,y:0,w:223,h});B.trail.style.background=LIGHT?"rgba(255,144,232,.25)":"linear-gradient(90deg, rgba(216,119,86,0), rgba(216,119,86,.16))";B.o=o;return B};
// 扫描推进：从 s 起 d 秒由 x0 扫到 x1（先加速后减速），扫描线两端淡入淡出；items 被扫过时调用 hit(i, 扫过后的秒数)，没扫到调用 hit(i,-1)；返回扫描线 x
function scanRun(B,items,t,s,o={}){const d=o.d||3,q=scan(t,s,d),x=lerp(B.o.x0,B.o.x1,q),sp=(B.o.x1-B.o.x0)/d,par=B.parentNode;
  setFx(B,{mx:x-B.o.x0,op:q>0&&q<1?cl(Math.min(q,1-q)*12):0});
  items.forEach((e,i)=>{const b=_boxIn(e,par),cx=b.x+b.w/2;if(o.hit)o.hit(i,q>0&&x>=cx?(x-cx)/sp:-1)});return x};

/* ---- 15. PixelTransition / HalftoneReveal：像素格替换 ---- */
// 像素格：在 p 上 x,y,w,h 区域建 cols×rows 个像素格（默认看不见），color 格子颜色，gap 格间缝；交给 pixelSwap 驱动
function pixelGrid(p,o={}){const cols=o.cols||20,rows=o.rows||12,cw=o.w/cols,ch=o.h/rows,g=o.gap??2,G=box(p,"","",{x:o.x,y:o.y,w:o.w,h:o.h});G.style.zIndex=8;G.cols=cols;G.rows=rows;
  G.cells=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const e=box(G,"","",{x:c*cw,y:r*ch,w:cw-g,h:ch-g});e.style.background=o.color||"color-mix(in srgb, var(--or) 78%, var(--card))";e.style.borderRadius="3px";base(e,{op:0});e.c=c;e.r=r;G.cells.push(e)}
  return G};
const _FX_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
// 像素替换：从 s 起 d 秒内，像素格逐块盖住 a，过半时 a 换成 b，再逐块揭开露出 b；order："random"（确定性乱序，默认，seed 种子）/"dither"（4×4 抖动矩阵顺序，半调网点感）/"sweep"（从左到右，带一点抖动）
// 同一组 a/b 连续替换（a→b→c）时按时间顺序调用；返回进度
function pixelSwap(G,a,b,t,s,o={}){const d=o.d??1.3,q=P(t,s-LEAD,d),ord=o.order||"random",seed=o.seed||3;
  if(q<=0){setFx(b,{op2:0});return 0}
  setFx(a,{op2:q<.5?1:0});setFx(b,{op2:q<.5?0:1});if(q>=1)return 1;
  const q1=cl(q*2.1),q2=cl(q*2.1-1.1),key=(e,ph)=>ord==="dither"?(_FX_BAYER[(e.r%4)*4+e.c%4]+.5)/16*.8+_fxHash(seed,e.c,e.r,ph)*.2
      :ord==="sweep"?(e.c/(G.cols-1))*.75+_fxHash(seed,e.c,e.r,ph)*.25:_fxHash(seed,e.c,e.r,ph);
  G.cells.forEach(e=>{const on=q1>key(e,1)*.97&&!(q2>key(e,2)*.97);setFx(e,{op:on?1:0})});return q};

/* ---- 16. DotGrid：点阵背景 ---- */
// 点阵背景：在 p 上 x,y,w,h 区域铺极淡的点阵（gap 点距 36，r 点半径 1.6，op 亮度 .10），边缘渐隐；插到 p 的最底层；返回元素（可 A() 淡入）
// glow:1 再叠一层较亮的点阵，只在 dotGlow 指定的位置附近露出（主体附近的点更亮）
function dotGrid(p,o={}){const gap=o.gap||36,r=o.r||1.6,op=o.op??.1,mk=a=>{const e=box(p,"","",{x:o.x,y:o.y,w:o.w,h:o.h});
    Object.assign(e.style,{backgroundImage:`radial-gradient(circle, rgba(${LIGHT?"0,0,0":"238,238,234"},${LIGHT?a*.7:a}) ${r}px, rgba(${LIGHT?"0,0,0":"238,238,234"},0) ${r+.8}px)`,backgroundSize:`${gap}px ${gap}px`,backgroundPosition:`${gap/2}px ${gap/2}px`,pointerEvents:"none"});
    p.insertBefore(e,p.firstChild);return e};
  const e=mk(op);e.style.maskImage=e.style.webkitMaskImage="radial-gradient(closest-side, #000 70%, transparent 100%)";
  if(o.glow){e.hi=mk(Math.min(.7,op*5));e.hi.style.maskImage=e.hi.style.webkitMaskImage="radial-gradient(circle 0px at 0 0, #000, transparent)";p.insertBefore(e,e.hi.nextSibling)}return e};
// 点阵高亮：把较亮的点阵层露在 (x,y)（相对点阵左上角）附近 r 像素，amt 0–1 强度
function dotGlow(G,x,y,r=220,amt=1){if(!G.hi)return;const m=amt>0?`radial-gradient(circle ${r}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(0,0,0,${amt.toFixed(3)}), transparent)`:"radial-gradient(circle 0px at 0 0, #000, transparent)";
  G.hi.style.maskImage=G.hi.style.webkitMaskImage=m};

/* ========== 2026-09 新增：逐帧分析参考片后提炼的画法（只借表达机制，代码按本引擎重写） ==========
   tokenRow 词块切分与聚焦 · searchHits 检索命中 · pinAxis 置信度轴挂卡 · rankList 按分数重排
   loopCycle 迭代循环 · ledger 费用明细 · runClock 计时 / 计费 · verdictList 逐条判定与收拢
   matrix 角色 × 项目检查矩阵 · matchLinks 两列对应与缺口 */

// 数字格式：runClock / ledger 常用
const FMT={s:v=>v.toFixed(1)+"s",s2:v=>v.toFixed(2)+"s",mmss:v=>{v=Math.max(0,Math.floor(v));return Math.floor(v/60)+":"+String(v%60).padStart(2,"0")},
  usd:v=>"$"+v.toFixed(2),usd3:v=>"$"+v.toFixed(3),int:v=>N(Math.round(v)),p2:v=>v.toFixed(2)};

// 词块切分：toks 词块数组（一个词可以拆成两块，如 ["Pay","roll"]），逐块“打出”，再只保留关键块
// x,y 左上角；size 字号（40）；gap 块间距（10）；pal 色块循环（pink/yellow/blue/teal/or）；mono:0 改用正文字体
// 返回行元素 R，.toks；R.type(t,s,{per=.12}) 逐块出现 + 橙色光标；R.focus(t,s,idx,{to=.3,sc=1.08}) idx 以外降暗、idx 略放大
function tokenRow(p,toks,o={}){const s=o.size||40,g=o.gap??10,pal=o.pal||["pink","yellow","blue","teal","or"],ff=o.mono===0?"NSC":"JBM,monospace";
  const R=box(p,"","",{x:o.x,y:o.y});Object.assign(R.style,{display:"flex",gap:g+"px",alignItems:"center",whiteSpace:"nowrap"});
  R.toks=toks.map((w,i)=>{const c=pal[i%pal.length],cv=TONE[c]||`var(--${c})`,e=E(R,"tok",esc(w));
    Object.assign(e.style,{font:`500 ${s}px/1.15 ${ff}`,padding:`${Math.round(s*.2)}px ${Math.round(s*.26)}px`,borderRadius:Math.round(s*.2)+"px",color:"var(--tx)",
      background:`color-mix(in srgb, ${cv} 28%, var(--card))`,border:`${LIGHT?3:1}px solid color-mix(in srgb, ${cv} ${LIGHT?0:55}%, ${LIGHT?"#000":"var(--edge)"})`});return e});
  R.caret=box(R,"","",{x:0,y:0,w:Math.max(4,Math.round(s*.1)),h:Math.round(s*1.3)});R.caret.style.background="var(--or)";R.caret.style.borderRadius="2px";
  R.type=(t,s0,op={})=>{const per=op.per||.12;let last=-1;R.toks.forEach((e,i)=>{if(A(e,t,s0+i*per,{k:"fade",d:Math.max(.15,per*1.4)})>0)last=i});
    const L=R.toks[Math.max(0,last)];R.caret.style.left=(last<0?0:L.offsetLeft+L.offsetWidth+Math.max(4,g/2))+"px";R.caret.style.top=((R.offsetHeight-R.caret.offsetHeight)/2)+"px";
    const end=s0+R.toks.length*per+.8;setFx(R.caret,{op2:t<s0-LEAD||t>end?0:blink(t)});return last};
  R.focus=(t,s0,idx,op={})=>{R.toks.forEach((e,i)=>{if(idx.includes(i))zoom(e,t,s0,{to:op.sc??1.08});else dim(e,t,s0,{to:op.to??.3})})};
  return R}

// 检索命中：顶部搜索框（打字 + 关键词变橙）+ 下方文件块网格；命中的块变橙、其余降暗
// x,y,w（1600）；items 块文字；cols 列数（5）；ch 块高（74）；gap（16）；size 字号（28）；query 查询句；keys 查询里要标橙的词；icon 块图标（doc）
// 返回 {box,q,cells}；H.type(t,s,{cps=18}) 打字；H.hit(t,s,hits,{stag=.06,to=.3}) 关键词标橙 + 命中块逐个变橙 + 其余降暗
function searchHits(p,o={}){const w=o.w||1600,x=o.x??CX-w/2,y=o.y??200,cols=o.cols||5,gp=o.gap??16,ch=o.ch||74,fs=o.size||28,cw=(w-(cols-1)*gp)/cols,qw=o.qw||Math.min(w,1000);
  const H={};H.box=box(p,"card","",{x:x+(w-qw)/2,y,w:qw,h:84});H.box.innerHTML=`<span style="position:absolute;left:26px;top:22px;width:40px;height:40px;display:grid;color:var(--mut)">${ico("search")}</span>`;
  H.q=box(H.box,"","",{x:84,y:22});Object.assign(H.q.style,{font:`500 34px/40px NSC`,color:"var(--tx)",whiteSpace:"nowrap"});
  H.cells=(o.items||[]).map((s,i)=>{const c=box(p,"card","",{x:x+(i%cols)*(cw+gp),y:y+124+Math.floor(i/cols)*(ch+gp),w:cw,h:ch});c.style.boxShadow="none";
    c.innerHTML=`<span style="position:absolute;left:18px;top:${(ch-30)/2}px;width:30px;height:30px;display:grid;color:var(--mut)">${ico(o.icon||"doc")}</span>`;
    c.t=lbl(c,s,{x:60,y:(ch-fs*1.2)/2,size:fs,tx:1});c.t.classList.add("mono");return c});
  const Q=o.query||"",keys=o.keys||[];
  const render=(n,hl)=>{let s=esc(Q.slice(0,n));if(hl)keys.forEach(k=>{s=s.split(esc(k)).join(`<b style="font-weight:500;color:var(--or)">${esc(k)}</b>`)});return s};
  H.type=(t,s,op={})=>{const cps=op.cps||18,n=Math.floor(Q.length*P(t,s-LEAD,Q.length/cps));H._n=n;return n};
  H.hit=(t,s,hits,op={})=>{const on=after(t,s),v=render(H._n??Q.length,on)+(t>=(H._s??-1e9)&&(H._n??Q.length)<Q.length&&Math.floor(t*2)%2?'<span class="caret"></span>':"");
    if(H.q._v!==v){H.q._v=v;H.q.innerHTML=v}
    H.cells.forEach((c,i)=>{const k=hits.indexOf(i);if(k>=0){const q=P(t,s+.2+k*(op.stag??.06)-LEAD,.35);tint(c,q>0?"or":null,.2*q);c.t.style.color=q>.5?"var(--or)":""}
      else dim(c,t,s+.2,{to:op.to??.3})})};
  return H}

// 置信度轴：0–1 横轴，判定卡挂在各自分数的位置（竖杆连到轴上的圆点）；分数越靠右越有把握
// x,y（轴所在高度，默认 820），w（1400）；ticks 刻度（[0,.5,1]），labels 刻度文字；ls 刻度字号（30）
// 返回 G；G.pin({v,text,tag,tone,h,cw,chh}) 建一张挂卡（h = 卡底离轴高度，错开避免重叠）→ 句柄 .play(t,s)；G.show(t,s) 轴出现
function pinAxis(p,o={}){const w=o.w||1400,x=o.x??CX-w/2,y=o.y??820,ls=o.ls||30,G={x,y,w,ax:v=>x+v*w};
  G.line=box(p,"","",{x,y:y-2,w,h:4});G.line.style.background="var(--l1)";G.line.style.borderRadius="2px";
  const tk=o.ticks||[0,.5,1],tl=o.labels||tk.map(v=>String(v));
  G.ticks=tk.map((v,k)=>{const e=box(p,"","",{x:x+v*w-2,y:y-12,w:4,h:24});e.style.background="var(--l1)";const l=lbl(p,tl[k],{x:x+v*w,y:y+26,center:1,size:ls});l.classList.add("mono");e.l=l;return e});
  G.show=(t,s)=>{grow(G.line,t,s,{d:.6});G.ticks.forEach((e,k)=>{A(e,t,s+.1*k,{k:"fade"});A(e.l,t,s+.1*k,{k:"fade"})})};
  G.pin=q=>{const cw=q.cw||440,chh=q.chh||150,sx=G.ax(q.v),cx=cl(sx-cw/2,x-60,x+w-cw+60),cy=y-(q.h||240)-chh;
    const c=card(p,{x:cx,y:cy,w:cw,h:chh});lbl(c,q.text,{x:24,y:22,size:28,tx:1});
    if(q.tag)pill(c,q.tag,{x:24,y:chh-70,size:28,tone:q.tone});
    const num=box(c,"mono",q.v.toFixed(2),{x:cw-184,y:chh-78,w:160});Object.assign(num.style,{font:"600 50px/1 JBM,monospace",color:"var(--tx)",textAlign:"right"});
    const stem=box(p,"","",{x:sx-1.5,y:cy+chh,w:3,h:y-cy-chh});stem.style.background="var(--l1)";
    const dt=box(p,"","",{x:sx-11,y:y-11,w:22,h:22});Object.assign(dt.style,{borderRadius:"50%",background:"var(--tx)"});
    return{card:c,stem,dot:dt,num,play(t,s){A(c,t,s,{k:"drop"});A(dt,t,s+.25,{k:"pop"});grow(stem,t,s+.25,{axis:"y",d:.4})}}};
  return G}

// 按分数重排：items=[[文字,分数0–1],...] 按给定顺序排好；逐行出现（分数条和数字一起长），再按分数从高到低换位，前 k 名高亮
// x,y,w（900），rh 行高（84），size 字号（32），bw 分数条宽（220）
// 返回 R（.rows，.order 排序后的原索引）；R.show(t,s,{per=.12}) / R.sort(t,s,{d=.9,stag=.03}) / R.top(t,s,k,{to=.3})
function rankList(p,o={}){const it=o.items||[],w=o.w||900,x=o.x??CX-w/2,y=o.y??200,rh=o.rh||84,fs=o.size||32,bw=o.bw||220;
  const R={};R.order=it.map((_,i)=>i).sort((a,b)=>it[b][1]-it[a][1]);const rank=[];R.order.forEach((k,r)=>rank[k]=r);
  R.rows=it.map(([s,v],i)=>{const r=box(p,"card","",{x,y:y+i*rh,w,h:rh-12});r.style.boxShadow="none";
    r.t=lbl(r,s,{x:24,y:(rh-12-fs*1.2)/2,size:fs,tx:1});r.t.classList.add("mono");
    r.m=meter(r,{x:w-bw-150,y:(rh-12-12)/2,w:bw,h:12});r.n=box(r,"mono","",{x:w-128,y:(rh-12-fs*1.2)/2,w:104});Object.assign(r.n.style,{fontSize:fs+"px",textAlign:"right",color:"var(--tx)"});r.v=v;return r});
  R.show=(t,s,op={})=>R.rows.forEach((r,i)=>{const s1=s+i*(op.per??.12);A(r,t,s1,{k:"fade"});const q=eio(P(t,s1-LEAD,.6));setMeter(r.m,r.v*q,"l1");r.n.textContent=q>0?(r.v*q).toFixed(2):""});
  R.sort=(t,s,op={})=>R.rows.forEach((r,i)=>mv(r,t,s+i*(op.stag??.03),{to:[0,(rank[i]-i)*rh],d:op.d||.9}));
  R.top=(t,s,k,op={})=>R.rows.forEach((r,i)=>{if(rank[i]<k){const q=after(t,s);tint(r,q?"or":null,.16);setMeter(r.m,r.v,q?"or":"l1")}else dim(r,t,s,{to:op.to??.3})});
  return R}

// 迭代循环：三步一轮（如 看 → 判断 → 动手），走完一轮沿下方回环进入下一轮，计数胶囊记第几轮；中间一步上方两个出口（达成 / 受阻）
// x,y（三张卡顶边），w 总宽（1400），names 三步名，spread 两个出口离中线的距离（170），cw,chh 卡尺寸（380×150），goal 顶部目标文字，exits=[[文字,tone],...]，counter(k) 计数文字
// 返回 L（.cards .exits）；L.show(t,s)；L.run(t,rounds) rounds=[{s,texts:[三步内容],per=.8,n=3}]（n 这一轮走到第几步就停，最后一轮在判断处出去时写 2）当前步橙框、回环橙线；L.exit(t,s,i) 走第 i 个出口
function loopCycle(p,svg,o={}){const nm=o.names||["看","判断","动手"],w=o.w||1400,cw=o.cw||380,chh=o.chh||150,x0=o.x??CX-w/2,y=o.y??460,gp=(w-3*cw)/2,cy=y+chh/2;
  const L={};L.cards=nm.map((s,i)=>{const c=card(p,{x:x0+i*(cw+gp),y,w:cw,h:chh});c.k=lbl(c,s,{x:26,y:20,size:28});c.v=lbl(c,"",{x:26,y:70,size:36,tx:1});return c});
  L.links=[0,1].map(i=>link(svg,{pts:[[x0+(i+1)*cw+i*gp+12,cy],[x0+(i+1)*(cw+gp)-14,cy]],tone:"l1",w:3,arrow:1}));
  const xa=x0+2*(cw+gp)+cw/2,xb=x0+cw/2,yb=y+chh+14,dip=o.dip||120,arcD=`M${xa} ${yb} C${xa} ${yb+dip} ${xb} ${yb+dip} ${xb} ${yb+4}`;
  L.arc=link(svg,{d:arcD,tone:"l2",w:3,arrow:1});L.hot=link(svg,{d:arcD,tone:"or",w:4});
  L.cnt=pill(p,"",{x:CX,y:yb+dip*.75-4,size:28});centered(L.cnt);L.cnt.style.left=(x0+w/2)+"px";
  const mx=x0+cw+gp+cw/2,ex=o.exits||[["达成","ok"],["受阻","err"]],sp=o.spread||170;
  L.exits=ex.map(([s,tone],i)=>{const e=pill(p,s,{x:mx+(i?sp:-sp),y:y-150,size:30,icon:tone==="ok"?"check":"cross"});centered(e);e.tone=tone;
    e.ln=link(svg,{pts:[[mx,y-10],[mx,y-70],[mx+(i?sp:-sp),y-70],[mx+(i?sp:-sp),y-122]],tone:"l2",w:3});return e});
  if(o.goal){L.goal=lbl(p,o.goal,{x:mx,y:y-250,center:1,size:32,tx:1})}
  const cf=o.counter||(k=>"第 "+k+" 轮");
  L.show=(t,s)=>{L.cards.forEach((c,i)=>A(c,t,s+i*.15,{k:"pop"}));L.links.forEach((l,i)=>draw(l,t,s+.3+i*.15,.4));draw(L.arc,t,s+.6,.6);
    A(L.cnt,t,s+.8,{k:"pop"});L.exits.forEach((e,i)=>{draw(e.ln,t,s+.9,.4);A(e,t,s+1.1+i*.1,{k:"pop"})});if(L.goal)A(L.goal,t,s+.2,{k:"fade"})};
  L.run=(t,R)=>{let k=-1;R.forEach((r,i)=>{if(t>=r.s-LEAD)k=i});const per=k>=0?(R[k].per||.8):.8;
    const ns=k>=0?(R[k].n||3):3,j=k<0?-1:Math.min(ns-1,Math.floor((t-R[k].s+LEAD)/per));
    L.cards.forEach((c,i)=>{const txt=k<0?"":i<=j?R[k].texts[i]:(k>0?R[k-1].texts[i]:"");_fxT(c.v,txt);c.style.borderColor=i===j?"var(--or)":"";tint(c,i===j?"or":null,i===j?.1:0)});
    _fxT(L.cnt.lastChild,cf(Math.max(1,k+1)));
    const e=k>=0?R[k].s+ns*per:1e9,nx=k>=0&&k<R.length-1?R[k+1].s:null;
    L.hot.style.strokeDashoffset=nx!=null&&t>=e-LEAD&&t<nx-LEAD?L.hot.len*(1-eio(P(t,e-LEAD,Math.max(.2,nx-e)))):L.hot.len;return k};
  L.exit=(t,s,i)=>{const on=after(t,s);L.exits.forEach((e,k)=>{if(k===i){e.className="a pill"+(on?" "+e.tone:"");e.ln.setAttribute("stroke",on?TONE[e.tone]:TONE.l2);if(on)pulse(e,t,s)}else dim(e,t,s,{to:.4})});
    const m=L.cards[1];if(on){m.style.borderColor=TONE[L.exits[i].tone];tint(m,L.exits[i].tone,.14)}};
  return L}

// 费用明细：每行 名称（+小字说明）+ 右侧金额；可给某行盖胶囊（如「免费」）并着色；底部合计滚动
// x,y,w（900），title 标题，items=[[名称,金额文字,说明?],...]（金额只写旁白给的数），rh 行高（100），total=[标签,初始文字]
// 返回 L（.rows .tot）；L.show(t,s,{per=.5}) / L.mark(t,s,i,tag,tone="ok") / L.sum(t,s,{from,to,fmt})
function ledger(p,o={}){const it=o.items||[],w=o.w||900,rh=o.rh||100,top=o.title?96:24,H=top+it.length*rh+(o.total?rh+10:0)+14,x=o.x??CX-w/2,y=o.y??CY-H/2;
  const c=card(p,{x,y,w,h:H,title:o.title});if(c.head)title(c,34);
  c.rows=it.map(([a,v,sub],i)=>{const r=box(c,"","",{x:16,y:top+i*rh,w:w-32,h:rh-10});r.style.borderRadius="12px";
    r.a=lbl(r,a,{x:20,y:sub?10:(rh-10-38)/2,size:32,tx:1});if(sub)r.sub=lbl(r,sub,{x:20,y:52,size:26});
    r.v=box(r,"mono",esc(v),{x:w-32-260,y:(rh-10-44)/2,w:240});Object.assign(r.v.style,{font:"600 40px/44px JBM,monospace",textAlign:"right",color:"var(--tx)"});return r});
  if(o.total){const ty=top+it.length*rh+6;c.sep=box(c,"","",{x:24,y:ty,w:w-48,h:2});c.sep.style.background="var(--l2)";
    c.tl=lbl(c,o.total[0],{x:36,y:ty+(rh-38)/2,size:32});c.tot=box(c,"mono",esc(o.total[1]||""),{x:w-300,y:ty+(rh-60)/2+4,w:264});Object.assign(c.tot.style,{font:"700 56px/60px JBM,monospace",textAlign:"right",color:"var(--tx)"})}
  c.show=(t,s,op={})=>{A(c,t,s,{k:"pop"});c.rows.forEach((r,i)=>A(r,t,s+.3+i*(op.per??.5),{k:"left"}));if(c.tot){const st=s+.3+c.rows.length*(op.per??.5);A(c.sep,t,st,{k:"fade"});A(c.tl,t,st,{k:"fade"});A(c.tot,t,st,{k:"fade"})}};
  c.mark=(t,s,i,tag,tone="ok")=>{const r=c.rows[i];if(!r.tag){r.tag=pill(r,tag,{x:0,y:(rh-10-50)/2,size:28,tone});r.tag.style.right="290px";r.tag.style.left="auto"}
    A(r.tag,t,s,{k:"pop"});const on=after(t,s);tint(r,on?tone:null,on?.14:0);r.v.style.color=on?TONE[tone]:""};
  c.sum=(t,s,op={})=>count(c.tot,t,s,{from:op.from||0,to:op.to,d:op.d||1.2,fmt:op.fmt||FMT.usd});
  return c}

// 计时 / 计费读数：图标 + 等宽数字；在 s 到 e 之间匀速走（时钟不缓动），结束后停住并变色（默认绿 = 先完成）
// x,y；size 字号（44）；icon（clock，计费用 coin）；返回元素；C.run(t,s,e,{from=0,to,fmt=FMT.s,tone="ok"}) 返回是否已停
function runClock(p,o={}){const s=o.size||44,C=box(p,"","",{x:o.x,y:o.y});Object.assign(C.style,{display:"flex",alignItems:"center",gap:Math.round(s*.3)+"px",whiteSpace:"nowrap"});
  C.innerHTML=`<span style="display:grid;width:${Math.round(s*.8)}px;height:${Math.round(s*.8)}px;color:var(--mut)">${ico(o.icon||"clock")}</span><span class="mono" style="font:600 ${s}px/1 JBM,monospace;color:var(--tx)"></span>`;
  C.num=C.lastChild;C.ic=C.firstChild;
  C.run=(t,s0,e,op={})=>{const q=cl((t-(s0-LEAD))/Math.max(.01,e-s0)),stop=q>=1;_fxT(C.num,(op.fmt||FMT.s)(lerp(op.from||0,op.to,q)));
    const col=stop?TONE[op.tone||"ok"]:"";C.num.style.color=col;C.ic.style.color=col||"var(--mut)";return stop};
  return C}

// 逐条判定：每行一句（问题 / 规则 / 消息）+ 右侧结论胶囊 + 分数；可再把被丢弃的行淡出、下面的行上移收拢（整张卡变矮）
// x,y,w（1200），title，items 文字，rh 行高（92），size（32），pw 胶囊宽（150）
// 返回 V（.rows）；V.show(t,s,{per=.15})；V.stamp(t,s,res,{per=.3}) res=[[结论,tone,分数],...]（null 跳过）；V.prune(t,s,drop,{d=.5})
function verdictList(p,o={}){const it=o.items||[],w=o.w||1200,rh=o.rh||92,fs=o.size||32,pw=o.pw||150,top=o.title?96:20,H=top+it.length*rh+12,x=o.x??CX-w/2,y=o.y??CY-H/2;
  const c=card(p,{x,y,w,h:H,title:o.title});if(c.head)title(c,34);c.H=H;
  c.rows=it.map((s,i)=>{const r=box(c,"","",{x:16,y:top+i*rh,w:w-32,h:rh-10});Object.assign(r.style,{borderRadius:"12px",background:"var(--card2)"});
    r.t=lbl(r,s,{x:22,y:(rh-10-fs*1.2)/2,size:fs,tx:1});
    r.p=pill(r,"",{x:w-32-pw-150,y:(rh-10-fs*1.5)/2-2,size:Math.round(fs*.88),w:pw});
    r.n=box(r,"mono","",{x:w-32-130,y:(rh-10-fs*1.2)/2,w:110});Object.assign(r.n.style,{fontSize:fs+"px",textAlign:"right",color:"var(--tx)"});return r});
  c.show=(t,s,op={})=>{A(c,t,s,{k:"pop"});c.rows.forEach((r,i)=>A(r,t,s+.2+i*(op.per??.15),{k:"left"}))};
  c.stamp=(t,s,res,op={})=>c.rows.forEach((r,i)=>{const v=res[i];if(!v){setFx(r.p,{op:0});return}const s1=s+i*(op.per??.3);A(r.p,t,s1,{k:"pop"});
    const cls="a pill "+(v[1]||"mut");if(r.p.className!==cls)r.p.className=cls;_fxT(r.p.lastChild,v[0]);
    if(v[2]!=null&&t>=s1-LEAD)count(r.n,t,s1,{from:0,to:v[2],d:.4,fmt:FMT.p2});else _fxT(r.n,"")});
  c.prune=(t,s,drop,op={})=>{const q=eio(P(t,s+.35-LEAD,op.d||.5));let k=0;c.rows.forEach((r,i)=>{if(drop.includes(i)){X(r,t,s,{d:.35});k++}else setFx(r,{my:-k*rh*q})});
    c.style.height=(c.H-drop.length*rh*q)+"px"};
  return c}

// 检查矩阵：行（角色 / 对象）× 列（页面 / 项目），一行一行地逐格填结果；正在检查的行橙色底
// x,y；rows 行名，cols 列名；hw 行头宽（300），cw 列宽（200），rh 行高（100），size（30），icons 行头图标（user）
// 返回 M（.cells[r][c]）；M.show(t,s)；M.fill(t,s,vals,{per=.18,gap=.4,at}) at=[每行开始时刻]（给了就忽略 s、gap，方便一行对一句字幕）；vals[r][c] = ok / err / warn / q（null 不填），返回当前行
function matrix(p,o={}){const rs=o.rows||[],cs=o.cols||[],hw=o.hw||300,cw=o.cw||200,rh=o.rh||100,fs=o.size||30,W=hw+cs.length*cw+32,Hh=rh*.8,H=Hh+rs.length*rh+16,x=o.x??CX-W/2,y=o.y??CY-H/2;
  const M=card(p,{x,y,w:W,h:H});M.heads=cs.map((s,j)=>lbl(M,s,{x:16+hw+j*cw+cw/2,y:(Hh-fs*1.1)/2,center:1,size:Math.round(fs*.9)}));
  M.bands=rs.map((s,i)=>{const b=box(M,"","",{x:10,y:Hh+i*rh,w:W-20,h:rh-8});b.style.borderRadius="12px";
    b.h=box(b,"",`<span style="display:grid;width:${fs}px;height:${fs}px;color:var(--mut)">${ico((o.icons&&o.icons[i])||"user")}</span><span>${esc(s)}</span>`,{x:18,y:0,h:rh-8});
    Object.assign(b.h.style,{display:"flex",alignItems:"center",gap:"14px",font:`500 ${fs}px/1 NSC`,color:"var(--tx)"});return b});
  M.cells=rs.map((_,i)=>cs.map((_,j)=>{const cx=6+hw+j*cw+cw/2,cy=(rh-8)/2,d=box(M.bands[i],"","",{x:cx-14,y:cy-2,w:28,h:4});d.style.background="var(--l2)";
    d.b=badge(M.bands[i],{x:cx-26,y:cy-26,s:52,state:"idle"});return d}));
  M.show=(t,s)=>{A(M,t,s,{k:"pop"});M.heads.forEach((e,j)=>A(e,t,s+.2+j*.06,{k:"fade"}))};
  M.fill=(t,s,vals,op={})=>{const per=op.per??.18,g=op.gap??.4,nc=cs.length;let cur=-1;
    M.bands.forEach((b,i)=>{const r0=op.at?op.at[i]:s+i*(nc*per+g),r1=r0+nc*per+.15;const on=t>=r0-LEAD&&t<r1;if(on)cur=i;tint(b,on?"or":null,on?.12:0);b.style.borderColor="transparent";
      M.cells[i].forEach((d,j)=>{const v=vals[i]&&vals[i][j];if(!v){setFx(d.b,{op:0});return}const q=A(d.b,t,r0+j*per,{k:"pop",d:.3});setBadge(d.b,v);setFx(d,{op:q>0?0:1})})});
    return cur};
  return M}

// 两列对应：左列（规则 / 需求）与右列（测试 / 实现）用曲线连起对应项；左边没有对应的行变红，旁边出红色胶囊；最后已对应的降暗、只留缺口
// left/right = {x,y,w,title,items}；pairs=[[左,右],...]；rh 行高（82），size（30），miss 缺口胶囊文字（"无对应"）
// 返回 {L,R,links,miss}；K.show(t,s)；K.link(t,s,{per=.2})；K.flag(t,s)；K.focus(t,s,{to=.3})
function matchLinks(p,svg,o={}){const rh=o.rh||82,fs=o.size||30,top=96;
  const mk=(c0,isR)=>{const H=top+c0.items.length*rh+12,c=card(p,{x:c0.x,y:c0.y,w:c0.w,h:H,title:c0.title,icon:isR?"folder":"doc"});if(c.head)title(c,32);
    c.rows=c0.items.map((s,i)=>{const r=box(c,"","",{x:14,y:top+i*rh,w:c0.w-28,h:rh-10});Object.assign(r.style,{borderRadius:"10px",background:"var(--card2)"});
      r.t=lbl(r,s,{x:20,y:(rh-10-fs*1.2)/2,size:fs,tx:1});if(isR)r.t.classList.add("mono");r.cy=c0.y+top+i*rh+(rh-10)/2;return r});c.o=c0;return c};
  const L=mk(o.left,0),R=mk(o.right,1),pr=o.pairs||[],hit=new Set(pr.map(q=>q[0]));
  const links=pr.map(([a,b])=>link(svg,{d:curve(L.o.x+L.o.w-14,L.rows[a].cy,R.o.x+14,R.rows[b].cy),tone:"ok",w:3}));
  const miss=L.rows.map((_,i)=>i).filter(i=>!hit.has(i));
  const tags=miss.map(i=>{const e=pill(p,o.miss||"无对应",{x:L.o.x+L.o.w+18,y:L.rows[i].cy-24,size:26,tone:"err",icon:"cross"});return e});
  const K={L,R,links,miss,tags};
  K.show=(t,s)=>{A(L,t,s,{k:"pop"});A(R,t,s+.2,{k:"pop"});[L,R].forEach((c,k)=>c.rows.forEach((r,i)=>A(r,t,s+.3+k*.2+i*.1,{k:"fade"})))};
  K.link=(t,s,op={})=>links.forEach((l,i)=>draw(l,t,s+i*(op.per??.2),.5));
  K.flag=(t,s)=>miss.forEach((i,k)=>{const on=after(t,s+k*.2);tint(L.rows[i],on?"err":null,on?.18:0);A(tags[k],t,s+k*.2,{k:"pop"})});
  K.focus=(t,s,op={})=>{const to=op.to??.3;L.rows.forEach((r,i)=>{if(hit.has(i))dim(r,t,s,{to})});R.rows.forEach(r=>dim(r,t,s,{to}));links.forEach(l=>{const q=eio(P(t,s-LEAD,.5));l.setAttribute("stroke-opacity",String(1-q*(1-to)))})};
  return K}

// ===== 概率（2026-09 新增）：旁白没给具体概率时的显示方式 =====
// 迷你圆环 +「概率」字样；环的填充只示意「这里有一个概率值」，不代表具体数字。不要用「▮▮%」灰块占位（用户反馈：像乱码、看不懂）
function probRing(size=28,v=.7){const r=Math.round(size*.42),C=2*Math.PI*r,sw=Math.max(4,Math.round(size*.17)),d=2*r+sw;
  return `<svg viewBox="0 0 ${d} ${d}" style="width:${d}px;height:${d}px;flex:none;display:block"><circle cx="${d/2}" cy="${d/2}" r="${r}" fill="none" stroke="var(--card2)" stroke-width="${sw}"/><circle cx="${d/2}" cy="${d/2}" r="${r}" fill="none" stroke="var(--tx)" stroke-width="${sw}" stroke-dasharray="${C*v} ${C}" transform="rotate(-90 ${d/2} ${d/2})"/></svg>`}
function probChip(p,o={}){const size=o.size||28,e=pill(p,o.text||"概率",{x:o.x,y:o.y,size,tone:"mut"});
  e.insertAdjacentHTML("afterbegin",probRing(size,o.v??.7));e.style.gap=Math.round(size*.3)+"px";return e}
