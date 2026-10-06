# 场景构建（scenes.js）与引擎接口

成片网页 = `assets/engine.html`（暗色舞台 + 组件 + 动画工具 + 预览外壳）+ scenes.json + 你写的场景构建文件。完整可运行的例子：`examples/demo/scenes.js`（7 个场景：网格计数、否定 → 流程轨道、模糊 → 清晰、闸门弹回、绕行被堵、中心辐射、循环复制）。**新项目先读这个例子。**

## 文件组织

- 短片：一个 `项目/schematic/scenes.js`。
- 长片（约 5 分钟以上）：按章节拆成 `项目/schematic/scenes/01-开场.js`、`02-xxx.js`…，`build_film.py --js 项目/schematic/scenes` 会按文件名读入整个目录。
- 每个文件各自封装作用域：文件里写 `const SCENES = {...}` 或 `Object.assign(SCENES, {...})` 都可以；文件内定义的辅助函数不会和别的文件冲突。同一个场景 id 出现在多个文件时，后读入的覆盖先读入的。
- 需要跨文件共用的辅助函数，放进 `scenes/00-common.js`，挂到 `window` 上：`window.myHelper = ...`。

## 基本结构

```js
const SCENES = {
  s01: {                       // 键 = scenes.json 的场景 id
    span: 1,                   // 可选：这个构建连续覆盖几个场景（画面跨场景连续演变时用），默认 1
    build(root, sc) {          // 进入场景时调用一次：创建全部元素（初始都按最终位置摆好）
      const c = card(root, {x: 760, y: 410, w: 400, h: 230, title: "已重建"});
      const num = box(c, "big", "0", {x: 0, y: 90, w: 400});
      return t => {            // 每帧调用：t = 当前秒；画面必须完全由 t 算出
        A(c, t, S(5), {k: "pop"});
        count(num, t, S(6), {to: 300, d: 2});
      };
    }
  },
};
```

`sc.scenes` 是本构建覆盖的场景数组（含 scenes.json 里的全部字段）。

## 铁律（违反会导致跳转错乱、渲染和预览不一致）

1. **画面只由 t 决定**：update 里不累加状态、不依赖上一帧、不用 CSS transition / setTimeout / Math.random。需要随机顺序时用确定性伪随机（例子里的 `rnd(seed)`）。
2. **时间点用 `S(字幕序号, 句内偏移秒)` / `SE(字幕序号)`**，不写死秒数。例如 `S(12)` 是第 12 句开始，`S(12, 1.5)` 是第 12 句开始后 1.5 秒（一句字幕里有几个动作时用）。动画函数会自动提前 `LEAD = 0.2` 秒启动，说到这句时刚好到位。
3. **元素默认可见**。要在某一刻才出现的元素，每帧都要调用 `A()`（在时刻之前它会保持透明）。
4. 引擎每帧会先把所有用过效果函数的元素重置，再执行 update；所以每个效果函数每帧都要调用，不要写成 `if (t > x) dim(...)`，而是直接 `dim(el, t, x)`（函数内部会按时间算出 0–1 的进度）。
5. **不要直接写 `style.opacity` / `style.translate` / `style.scale` / `style.rotate` / `style.filter` / `style.clipPath`**：这六个属性由效果系统每帧统一写入，手写的值会被覆盖或覆盖别人（测试中最常踩的坑）。
   - 随时间变化的：用 `A` `X` `dim` `blur` `mv` `zoom` `grow` `draw`，或直接 `setFx(el, {...})`。
   - 固定不变的（如箭头永远朝上、某元素一直半暗）：`base(el, {rot:-90})`、`base(el, {dim:.4})`，每帧重置后仍保留。
   - 居中用 `centered(el)`（它写的是 `transform`，不在上述六个属性里，不冲突）；颜色、背景、边框、宽高、文字内容可以直接写 style。
6. 场景结束前 0.3 秒引擎统一淡出。需要和下一场景无缝衔接时，用 `span` 合并成一个构建。**最后一个场景不淡出**，一直停留到音频结束。

## 常驻元素（跨场景不闪）

角落导航、路线图这类每个场景都要重建、位置不变的元素，默认会随场景结束的 0.3 秒淡出一起闪一下。标记为常驻即可避免：

```js
"s05":{keep:["nav"], build(root){ const nav = keep(navList(root,{}), "nav"); ... }},
```

- `keep(el, key)` 标记元素（必须是 root 的直接子元素）；下一个构建在同级写 `keep:["key"]` 并在同一位置重建它。
- 当前场景淡出时，被下一个构建声明的常驻元素保持原样，其余内容用底色遮罩淡出。
- 下一个构建要把它从别处动画进来（比如先居中再缩到角落）时，不要声明 keep。

## 画布与安全区

| 比例 | 画布 | 安全区（关键内容放这里） | 中心 |
|---|---|---|---|
| 横版 16:9 | 1920×1080 | x 120–1800，y 90–990 | `CX=960, CY=540` |
| 竖版 9:16 | 1080×1920 | x 90–970，y 280–1520（上方留给平台顶栏，下方和右侧留给标题、字幕、点赞评论按钮） | `CX=530, CY=900` |

引擎提供 `VW` `VH` `V`（V 为真表示竖版）和 `SAFE={x0,x1,y0,y1}`。

**竖版要重新构图，不要把横版缩小**：左右并排改上下叠放；一屏只讲一件事；字号比横版同类元素大 10–20%；横向轨道改竖向；宽表格改成一行一张卡。

## 组件（规范 4.4）

全部绝对定位，`x,y` 是左上角，返回 DOM 元素。下表是引擎的基础组件；**更高层的通用组件（选项概率条、打分尺、写作窗口、品牌节点、导航清单、否定标记、括号、泳道等）见 `components.md`**（含动效，按要表达的意思分组），写动画时先查那里。

默认字号已按硬规则设好：标签 26px、胶囊 32px、卡片标题 32px、窗口标题栏 28px（栏高 54px）、大数字 64px、流程节点 110px。

| 函数 | 说明 |
|---|---|
| `box(parent, cls, html, {x,y,w,h,...})` | 通用绝对定位元素；数字自动加 px，无单位值写成字符串（`opacity:"0"`） |
| `E(parent, cls, html, css)` | 普通子元素（非绝对定位） |
| `card(p, {x,y,w,h,title,icon,itone,rows,gap})` | 深灰卡片；标题 32px（再放大用组件库的 `title()`）；`rows` 为骨架横条宽度数组（像素，或 0–1 表示比例）；返回元素带 `.head` `.rows` |
| `win(p, {x,y,w,h,title})` | 带三色点标题栏的窗口（栏高 54px、标题 28px，再放大用组件库的 `winBar()`）；内容放到 `w.body` |
| `term(p, {x,y,w,h,title})` | 风格化终端；`w.line(html)` 追加一行，行内 `<span class="p/o/g/r/m">` 分别为提示符灰 / 橙 / 绿 / 红 / 灰 |
| `pill(p, text, {x,y,tone,icon,size,w})` | 胶囊标签；tone：`or` `ok` `err` `warn` `mut`；`size` 字号（默认 32，图标和内边距随之缩放）；`w` 定宽（文字居中） |
| `lbl(p, text, {x,y,tx,size,color,center})` | 文字标签（默认 26px 灰字；`tx:1` 为亮字；`center:1` 以 x 为中心） |
| `agent(p, {x,y,s,label,bare,claude})` | 代理 / 执行者：橙色放射图标（通用符号）；`claude:1` 换成 Claude 官方 logo（引擎内置 `CLAUDE_LOGO`）——旁白讲 Claude / Claude Code 时必须用它 |
| `person(p, {x,y,s,label})` | 人像 |
| `icon(p, name, {x,y,s,tone,sw})` | 线性图标；name 见下 |
| `badge(p, {x,y,s,state})` / `setBadge(el, state)` | 状态徽标：`ok` 绿勾、`err` 红叉、`warn` 黄三角、`or` 橙色进行中、`q` 问号、`idle` 灰圈 |
| `skel(p, {x,y,rows,gap,h,tone})` | 一组骨架横条 |
| `meter(p, {x,y,w,h,vertical})` / `setMeter(m, 0–1, tone)` | 容量条 / 进度条 |
| `gauge(p, {x,y,r,label})` / `setGauge(g, 0–1, tone)` | 半圆仪表 |
| `gate(p, {x,y,h,arm,label})` / `gateSet(g, 抬起0–1, 灯色tone)` | 闸门：竖杆 + 横杆 + 状态灯 |
| `grid(p, {x,y,cols,rows,cw,ch,gap,cls})` | 同质小块网格，返回格子数组 |
| `node(p, {x,y,s,icon,text,round,label,lsize})` / `setNode(n, state)` | 流程节点（默认边长 `s` 110px）：圆角方块（`round:1` 为圆形）+ 图标或文字 + 下方标签；state：`idle` `active`（橙）`ok` `err` `warn` `dim`，用不透明着色 |
| `quota(p, {x,y,w,h,label,limit})` / `setQuota(q, 值, tone)` | 额度条 + 上限竖线（`limit` 为上限位置 0–1，默认 1）；达到上限时条和竖线变红，返回是否已达上限 |
| `stack(p, {x,y,w,h,n,gap,vertical})` | 分段条 / 分段柱，返回段数组；每段用 `grow()` 或 `A()` 出现、`tint()` 着色 |
| `chapters(p, {x,y,w,n,labels})` / `setChap(c, 位置)` / `hop(svg, c, 从, 到)` | 章节进度条 + 播放头（位置 0–n，小数表示段内进度）；`hop` 生成播放头跳过某段的弧线（配合 `draw`、`along`），用于“这段可以跳过”“章节导航” |
| `tint(el, tone, amt)` | 不透明着色：把 tone 按比例混进卡片底色（`amt=0` 恢复）。高亮压在连线上时用它，不要用半透明 rgba |
| `svgRoot(p)` / `sv(p, tag, attrs)` | 与画布同尺寸的 SVG / 创建 SVG 元素 |
| `link(svg, {pts:[[x,y],...] 或 d, tone, w, dash, arrow})` | 连线（折线或 path），返回 path（带 `len`、有箭头时带 `head`），配合 `draw()` 生长；`curve(x1,y1,x2,y2)` / `vcurve(...)` 生成平滑曲线。虚线（`dash`）无法逐段生长，`draw()` 对它改为淡入 |
| `ring(svg, {cx,cy,r,w,tone,atone})` | 圆环；返回 `{el, arc, at(角度)→[x,y], setArc(a0,a1)}`，角度 0 在正上方、顺时针；`arc` 是 atone 色（默认橙）的进度弧 |
| `dot(svg, {r,tone})` / `place(dot, [x,y] 或 null)` | 圆点（沿路径、圆环移动用）；null 隐藏 |
| `along(path, 0–1)` | 路径上某比例处的坐标 |
| `follow(el, path, 0–1)` | 让任意元素（卡片、胶囊）以自身中心沿路径飞行 |
| `centered(el)` | 以 x,y 为中心放置（pill、lbl 等尺寸由内容决定的元素） |
| `rnd(seed)` | 确定性伪随机数生成器（需要随机顺序时用，不能用 Math.random） |
| `addCSS(css)` | 追加样式（补充或覆盖组件样式时用，同一段只加一次） |

其他返回字段：`card` 返回的元素带 `.head` `.rows`；`meter` 带 `.fill`；`agent` / `person` / `node` 传了 `label` 时带 `.label`（标签元素，需要单独调用 `A()` 让它出现）；`quota` 带 `.label` `.track` `.fill` `.cap`；`gate` 带 `.arm` `.lamp` `.label`。

图标名：check cross warn q lock unlock doc folder code eye user users search clock db chat list shield gear globe key box bolt play stop arrow plus minus phone monitor refresh crown hand mail cart coin book cal flag。

**主题**：`build_film.py --theme dark|light`。亮色时舞台带 `.light` 类、全局常量 `LIGHT` 为真（场景代码一般不需要判断它，颜色写变量就会自动切换；只有确实要两种主题画法不同时才用 `LIGHT`）。

CSS 变量（全部在 `.stage` 上，两种主题各有一套取值，见 spec.md 4.2 / 4.6）：`--bg --win --winbar --card --card2 --edge --l1 --l2 --or --tx --mut --ok --err --warn`，色块用 `--pink --yellow --blue --teal --red`；`TONE` 对象把 `ok/err/warn/or/mut/tx/l1/l2` 映射到这些变量。**不要自己发明颜色**；状态色含义见规范 4.3。底色、描边、骨架条也只写变量（`var(--card)` `var(--card2)` `var(--win)` `var(--edge)` `var(--l1)` `var(--l2)`），不要硬写 `#1A1A1A`、`#25292F` 这类深灰：配色调整后硬写的颜色会比周围暗一截。

**内容要可读**：`card` 的 `rows`、`skel` 骨架条只用来表示「一大段文字 / 数量多」；具体对象（邮件、工单、选项、技能…）用 `lbl` / `pill` 写真实短标签。模型在写东西用组件库的 `writer(...,{first:"真实第一行"})`。交付前跑 `scripts/audit.py`（见 SKILL.md 第 5 步）。

## 动画（规范第 7 节）

所有函数第三个参数 `s` 是字幕时间（`S(n)`），自动提前 LEAD；返回 0–1 进度。效果互相叠加、不互相覆盖（进场用 opacity/translate，移动用 translate 偏移，缩放用 scale，降暗用 filter；blur 折算成透明度，不出模糊滤镜）。

| 函数 | 含义 |
|---|---|
| `A(el, t, s, {k,d,dist})` | 进场。k：`rise`（默认）`fade` `left` `right` `drop`（从上落下）`pop`（轻微放大，克制）`none`（瞬间出现） |
| `X(el, t, s, {k,d,rot})` | 退场。k：`fade`（默认）`fall`（掉落并变暗 = 被丢弃 / 遗漏）`shrink` |
| `dim(el, t, s, {to,d,back})` | 降暗到 `to`（默认 .35）= 退出焦点、被遗忘、看不到；`back` 为恢复亮度的时刻 |
| `blur(el, t, s, {from,to,d})` | 等待出场 ↔ 出场 = 未讲到 / 想象不出。**渲染成透明度，不是模糊滤镜**：数值 ≥4 即 50% 透明，0 为完全不透明（2026-09 按用户要求改） |
| `mv(el, t, s, {from,to,d})` | 移动（相对原位置的偏移 `[dx,dy]`） |
| `zoom(el, t, s, {from,to,d})` | 缩放强调 |
| `setFx(el, {mx,my,dim,blur,sc2,op2,rot,gx,gy})` | 直接设置效果（自定义轨迹、自定义动画都用它）。`mx,my` 位移、`dim` 降暗 0–1、`blur` 占位强度（≥4 = 50% 透明）、`sc2` 缩放、`op2` 透明度乘数、`rot` 旋转度数、`gx,gy` 裁剪显露比例 |
| `draw(path, t, s, d, {upto})` | 连线生长（带箭头时箭头跟随）；`upto:.5` 只画到一半 = 没走到、中断 |
| `grow(el, t, s, {axis,d,to,rev})` | 裁剪生长：横条从左往右（`rev:1` 从右往左）、柱子从下往上（`axis:"y"`）显露；`to` 为最终比例 |
| `base(el, {...})` | 固定效果（每帧重置后仍保留），如 `base(arrow, {rot:-90})` |
| `count(el, t, s, {from,to,d,fmt,pre,suf})` | 数字滚动（数值必须来自旁白） |
| `type(el, t, s, text, {cps,caret})` | 打字 |
| `seqText(el, t, [[时刻, html], ...])` | 同一位置按时间切换文字 |
| `scan(t, s, d)` | 扫描进度（逐行检查、读取） |
| `after(t, s)` | 是否已到时刻（用于切换状态：`setBadge(b, after(t,S(9))?"ok":"idle")`） |
| `stagger(s, i, gap)` | 逐项时刻 |
| `P(t,s,d)` `lerp` `cl` `eo` `eio` `es` `N` | 进度、插值、截断、缓动（减速 / 先加速后减速 / 轻回弹）、千分位 |

## 常用写法

```js
// 逐项出现 + 逐项打勾（检查清单）
rows.forEach((r,i)=>{A(r,t,stagger(S(12),i,.2),{k:"left"});setBadge(marks[i],after(t,S(14)+i*.5)?"ok":"idle")});

// 连线生长后，对象沿连线移动
draw(path,t,S(20),.6);const [x,y]=along(path,eio(P(t,S(21)-LEAD,1)));setFx(token,{mx:x-x0,my:y-y0});

// 被遗忘：列表上推，旧的关键项逐渐变暗
items.forEach((it,i)=>{A(it,t,stagger(S(30),i,.4));setFx(it,{my:-44*Math.max(0,shown-i-1)})});dim(rule,t,S(33),{to:.25});

// 需求被丢弃：掉落并变暗（比淡出更能表达遗漏）
X(chip,t,S(40),{k:"fall"});

// 流程走到一半中断：连线只画一半，下一个节点保持灰
draw(l,t,S(8),.8,{upto:.5});setNode(next,"dim");

// 撞上限：额度条增长到上限变红
setQuota(q,lerp(0,1.2,P(t,S(3),2.5)));

// 同一句里分三步：句内偏移
A(a,t,S(20));A(b,t,S(20,1.2));A(c,t,S(20,2.4));

// 闸门三态：拦住（红）→ 修复 → 放行（绿、抬杆）
gateSet(g,eio(P(t,S(52)-LEAD,.4)),after(t,S(52))?"ok":after(t,S(50))?"err":"l2");
```

## 写完之后

```bash
python3 $S/shoot.py --html 项目/成片网页.html --out 项目/schematic/check --steps
```

逐张看总览图：元素是否在该出现的时刻出现、有没有重叠和出界、动作是否对上 sequence 的描述、结果是否停留到场景结束。总览图是缩略图：**小字、图标是否偏移、徽标是否居中，要打开同目录的单帧原图检查**（每个场景至少打开一张）。有问题改完再截，直到干净。
