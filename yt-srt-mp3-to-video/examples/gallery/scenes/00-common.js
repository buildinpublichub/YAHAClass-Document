// 组件库预览（references/components.html）的共用辅助：场景按「要表达什么」分成 A–H 八组，每组一个文件（01-a-appear.js … 08-h-annotate.js）。
// 新组件收进 lib.js 时：挑最合适的一组，在 scenes.json 该组末尾加一个场景（id 如 d8）、gallery.srt 补字幕，在该组文件里加一个构建，再重建 components.html（命令见 components.md 文末）。

// 示例 logo（通用几何标志，演示 brandNode 用；实际项目放项目提供的 logo，写在项目的 00-common.js）
window.DEMO_LOGO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z"/><path d="M12 7.5l4 2.3v4.4L12 16.5l-4-2.3V9.8z" fill="currentColor"/></svg>';

// 场景左上角两行小标题（预览专用）：「编号 分组名 · 组件函数名」「表达：……」；返回外框（需要时可整体 X() 隐去）
window.head=(root,no,group,fn,meaning)=>{const g=box(root,"","",{x:120,y:78});
  lbl(g,no+"  "+group+" · "+fn,{x:0,y:0,size:28});lbl(g,"表达："+meaning,{x:0,y:40,size:28,tx:1});return g};

// 按实际宽度把一组元素排成一行（每帧调用，字体加载前后都对）
window.rowOut=(els,x,gap)=>{els.forEach(e=>{e.style.left=x+"px";x+=e.offsetWidth+gap})};

// 分组标题场景（2–3 秒）：大号组字母 + 组名 + 一句话说明 + 本组组件（来自 scenes.json 的 comps）
window.groupTitle=(L,name,desc)=>({build(root,sc){const n=sc.scenes[0].a;
  const lt=box(root,"mono",L,{x:0,y:230,w:VW});Object.assign(lt.style,{textAlign:"center",font:"700 150px/1 JBM,monospace",color:"var(--or)"});
  const nm=lbl(root,name,{x:CX,y:420,size:110,tx:1,center:1});nm.style.fontWeight="700";
  const ds=lbl(root,desc,{x:CX,y:590,size:42,center:1});
  const cs=box(root,"mono",esc(sc.scenes[0].comps||""),{x:210,y:720,w:1500});Object.assign(cs.style,{textAlign:"center",fontSize:"30px",lineHeight:"1.6",color:"var(--l1)"});
  return t=>{A(lt,t,S(n)-.3,{k:"fade",d:.3});setFx(lt,{sc2:lerp(.6,1,eback(P(t,S(n)-.3,.6)))});// 组字母带回弹放大
    A(nm,t,S(n)-.15);A(ds,t,S(n,.35),{k:"fade"});A(cs,t,S(n,.7),{k:"fade"});
  }}});
