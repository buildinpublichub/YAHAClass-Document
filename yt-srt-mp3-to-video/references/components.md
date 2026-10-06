# 通用组件库（assets/lib.js）

`assets/lib.js` 是从已完成的长片里提炼出来的通用画法，构建时自动放在场景代码之前（全局函数，直接调用）。它只依赖引擎（`engine-api.md` 里的基础组件与动画函数），和题材无关。

- 预览页：`references/components.html`（暗色；亮色版 `references/components-light.html`；组件和动效都在这一页，按下面的 8 组排列；每组先是一个分组标题场景，之后每个组件一个场景，左上角写「编号 分组 · 函数名」和「表达：……」；源文件在 `examples/gallery/`）。
- 版本：项目第一次构建时，`build_film.py` 把引擎和组件库一起复制到 `项目/schematic/.lib/` 锁定；旧项目不受组件库更新影响，要升级时加 `--update-lib`。
- 同名覆盖：章节文件里自己定义的同名函数会遮蔽组件库的版本；`00-common.js` 里 `window.xxx = ...` 也会替换它。

## 使用原则

1. **分镜按旁白设计，不看组件库。** 先想清楚这段话要演什么关系，再画分镜；先看组件库，画面会被库里现有的东西框住，片片雷同。
2. **写动画时，对象有现成组件就用。** 造型、字号、否定方式由组件保证一致，不用每章重写一遍。
3. **没有就在项目里现画**，但要遵守同样的规则：标签 ≥26px，关键标签 / 胶囊 32–40px，大数字 ≥64px，节点 ≥110px，窗口宽 ≥520px；否定用降暗 + 旁边红叉 / ⊘ / 掉落，不画删除线；横条保持水平。
4. **什么时候收进组件库**：一个画法在一部片子里用了两次以上、或在两部片子里都出现，且和主题无关，就收进 `lib.js`，同时补本文档和预览页（挑最合适的一组，`examples/gallery/` 的 scenes.json、SRT 在该组末尾加一个场景，该组的 `scenes/0x-*.js` 加一个构建，再按文末命令重建 `components.html`）。
5. **项目专属的东西不收**：产品 logo、特定道具（棋盘、棋钟之类）、贯穿全片的专用卡片，放在项目的 `scenes/00-common.js`。

## 醒目效果与动效通则

**亮色主题**：组件全部通用；带光效的 `spotlight`（光斑）、`dotGlow`、`scanBar`（渐变拖尾）、`shineText`（高光）在 `--theme light` 下自动改为平涂或关闭，以符合 Gumroad 风格「不用发光和渐变」。

效果思路参考 React Bits（reactbits.dev），**代码全部用本引擎重写**，没有复制它的源码（它是 MIT + Commons Clause 许可）。只用 CSS / SVG，画面只由 t 决定，随机一律走内部的 `_fxHash`（整数混合后交给 `rnd`），可以 4K 逐帧渲染。第三个参数 `s` 是字幕时间，自动提前 LEAD；一个效果要动好几次时，用 `o.at` 传各次时刻数组（时刻用 `S()` 算好）。每帧都要调用。预览见 `references/components.html`（动效分散在下面各组里）。

**规则：扫光（`shineText`）、跑光边框（`runBorder`）、乱码解码（`scramble`）、像素替换（`pixelSwap`）这类醒目效果，每个场景最多用一个，而且必须对应旁白的含义**（讲到“正在处理”才跑光，讲到“模型在猜 / 解出答案”才解码）。不要为了好看叠加动效。

内部辅助（下划线前缀，项目代码不要依赖）：`_fxHash(...整数)` 确定性 0–1 值；`_fxSplit(el, by)` 把文字拆成 inline-block 小块（只拆一次）；`_FX_POOL` 乱码字符集；`_FX_BAYER` 4×4 抖动矩阵；`_fxT` 带缓存的写文字。

## 速查（按要表达什么分组）

| 组 | 组件 | 一句话表达 |
|---|---|---|
| **A 出现与揭示** | `blurText` | 讲到才出现：词按讲到的顺序由半透明变不透明（引擎已把模糊折算成透明度） |
|  | `splitRise` | 章节标题、关键结论逐字升起登场 |
|  | `scramble` | 模型在猜：乱码逐位解出答案 |
|  | `writer` | 生成文字；跑题 = 横条变黄越过右边界 |
|  | `tokenRow` | 模型把句子切成词块，真正起作用的只有几块 |
| **B 焦点与强调** | `focusFrame` `trueFocus` | 同一时刻只有一个焦点，四角框移到下一个 |
|  | `spotlight` | 柔光在一组卡片间移动，停在要讲的那张 |
|  | `shineText` | 扫光点名关键词（比变橙更轻） |
|  | `title` `winBar` | 主角卡片标题 / 窗口标题栏再放大一级 |
|  | `kf` `bump` `pulse` `blink` | 沿关键帧走、脉冲一下、放大一下、闪烁 |
|  | `eback` | 回弹缓动（约 10% 过冲） |
|  | `searchHits` | 带着问题去一堆东西里找：关键词标橙、命中块亮起 |
| **C 选择与判断** | `optBars` `fanLinks` | 做选择题：决策点扇出到选项，概率条长出、选中最高项 |
|  | `rotPill` `rotateText` | 一个位置有几种可能：胶囊里轮换候选词 |
|  | `ynMeter` | 0–1 置信度 / 是非判断，过阈值闸线才放行 |
|  | `ruler` | 打分、分档：游标停在某一档 |
|  | `brandNode` `setBrand` | 某个具体产品 / 主体（放 logo）及其状态 |
|  | `pinAxis` | 每个判断有多大把握：判断卡挂到 0–1 轴上 |
|  | `rankList` | 先打分、再按分数重排、只取前几名 |
|  | `probChip` `probRing` | 有一个概率但旁白没给数值：迷你圆环 +「概率」，不写 ▮▮% |
| **D 流程与进度** | `chain` | 步骤链、流水线，哪一步出错 |
|  | `stepRun` | 步骤条推进：走到第几步 |
|  | `checklist` `setCheck` `corner` `dock` `CORNER` | 章节导航清单：讲到第几件，缩到角落常驻 |
|  | `roadmap` `setRoad` | 横向路线图：走到第几站 |
|  | `listIn` | 排队、逐个到达、超上限淘汰最旧 |
|  | `cardSwap` | 一摞案例一个个过 |
|  | `lanes` | 速度 / 耗时对比，越过时限变红 |
|  | `loopCycle` | 一轮轮地试（看 → 判断 → 动手），直到达成或受阻 |
| **E 数量与计时** | `countCard` | 大数字 + 标签；两数对比 |
|  | `odometer` | 里程表式数字上涨 / 下降 |
|  | `flapBoard` `flapSeq` `flapTo` | 翻牌计时、比分、超时 |
|  | `ledger` `FMT` | 一笔费用由哪几项组成，某项免费，合计滚动 |
|  | `runClock` | 两种做法同时开跑，计时 / 计费读数，谁先停谁更快更省 |
| **F 状态与检查** | `runBorder` | 边框跑光 = 正在处理，完成后变绿 |
|  | `scanBar` `scanRun` | 扫描线扫过，逐个亮出通过 / 可疑 / 未知 |
|  | `compare` | 两栏同构对照，焦点在哪栏另一栏降暗 |
|  | `verdictList` | 一批问题 / 规则逐条盖上结论 + 把握分数 |
|  | `matrix` | 几种角色 × 几个页面，逐行逐格试出能不能进 |
| **G 否定与替换** | `denyMark` `deny` | 否定：降暗 + 旁边红叉 / ⊘ / 连同徽标掉落 |
|  | `stopMark` | ⊘ 放在元素旁边：这条路不走 |
|  | `flipNode` | 节点翻面，揭示真实类型 |
|  | `pixelGrid` `pixelSwap` | 像素格替换：被替换、生成出来 |
|  | `verdictList.prune` | 判为丢弃的行淡出，剩下的上移收拢 |
| **H 标注与背景** | `brace` | 括号 / 梳形括号 / 大括号归组 |
|  | `dashBox` | 虚线空槽、待填位置、范围 |
|  | `chip` | 小编号块 Q1、#3 |
|  | `dotGrid` `dotGlow` | 极淡点阵背景（舞台质感，可选） |
|  | `matchLinks` | 两列一一对应，没有对应的标红 = 缺口 |

预览页 `references/components.html` 里的场景编号就是「组字母-序号」（如 `D-3`），下文每个条目都标了对应编号。

2026-09 新增的 11 个画法（`tokenRow` `searchHits` `pinAxis` `rankList` `loopCycle` `ledger` `runClock` `verdictList` `matrix` `matchLinks`，以及格式工具 `FMT`）来自对一部同类解说片（AI LABS 的 Jev 用例视频）的逐帧分析：只借「用什么动作表达什么关系」，画法和代码按本引擎重写，没有使用原片素材。

下文示例里的 `n` 指场景第一句字幕的序号（`sc.scenes[0].a`），`S(n)` / `S(n+1)` 是第一、二句的开始时刻。所有“每帧调用”的函数都遵守引擎铁律：状态完全由 t 算出。

---

## A 出现与揭示

**表达**：东西怎么登场：从看不清到看清、从乱码到答案、一条条写出来。

**适用场合**：要点句逐词登场、章节标题和结论登场、模型输出的答案被“解”出来、模型 / 人在写东西。

**限用提醒**：`splitRise` 只用于章节标题和关键结论；`scramble` 是醒目效果，只在“模型在猜 / 解出答案”时用，每个场景最多一个醒目效果。

### `blurText(el, t, s, {by="word", gap=.2, d=.7, from=16, dist=26, ghost=0})`

**预览**：A-1

**用途**：讲到才清晰。一句话的词按讲到的顺序依次由模糊变清晰（错落、轻微上移）。中文用 `|` 分词。
**适用**：要点句、结论句逐词登场；`ghost:.4` 让还没讲到的句子先以模糊占位出现（配合 `A(el,…,{k:"fade"})` 控制占位何时出现），讲到时再变清晰。

```js
const s1=box(c,"","上下文|越堆|越长，|注意力|就越|分散",{x:170,y:160});s1.style.font="600 68px/1.3 NSC";
return t=>{blurText(s1,t,S(n),{gap:.24});A(s2,t,S(n+1),{k:"fade"});blurText(s2,t,S(n+2),{ghost:.4})};
```

### `splitRise(el, t, s, {by="char", gap=.045, d=.6, dist=70, bounce})`

**预览**：A-2

**用途**：标题、关键结论登场。文字逐字（`by:"word"` 逐词）错落升起，`bounce:1` 带轻微回弹。
**只用于章节标题和关键结论**，正文、标签用它会显得花。

```js
splitRise(title,t,S(n),{gap:.07,dist:90});splitRise(concl,t,S(n+1),{bounce:1});
```

### `scramble(el, t, s, text, {d=1.2, order="seq", pool, fps=16, seed=7, noise, hide})`

**预览**：A-3

**用途**：模型在猜、解码、答案揭晓。乱码逐位解出正确文字；未解出的位暗灰、刚解出的位先亮橙 0.3 秒。同一时刻乱码固定（按 t 和 seed 算出）。
- `order:"random"` 确定性乱序揭晓；`pool` 默认自动：**中文位用常用字**，其余用大写字母数字符号；`"block"` 方块字符较重，少用。
- 英文给元素加 `.mono`，乱码时宽度不抖。s 之前显示定格乱码（`hide:1` 则留空）。

```js
scramble(v1,t,S(n),"cache key collision",{d:1.5});scramble(v2,t,S(n+1),"缓存键冲突",{order:"random"});
```

### `writer(p, {x, y, w=640, h=400, title="写作", rows, lh=16, gap=44, seed, bar, first, fs})`

**预览**：A-4

**用途**：模型 / 人在“写”东西：骨架横条一条条打出来，橙色光标跟着走。**`first`**：前几行写真实短句（字符串或数组，如 `first:"根据工单内容来看…"`），观众才知道它在写什么——除非内容确实无关紧要，都应该给第一行；`fs` 为这几行的字号（默认 ≥26px）。**跑题**用 `drift`：后面的横条变黄、向右伸长越过窗口右边界（右边界出现黄色虚线界标），横条始终水平，不倾斜。

**返回**：窗口元素，`.lines` `.caret` `.edge`；每帧调用的方法：
- `m.type(t, s, {per=.35, upto})`：从 s 起每 per 秒打出一条；`upto` 只打到第几条。
- `m.typeAt(t, [时刻...], {d})`：按给定时刻逐条打（`null` = 这条不出现）。
- `m.drift(t, s, {from, over=150, d})`：第 from 条起跑题。

```js
const m=writer(root,{x:520,y:190,w:820,h:660,rows:11,first:"根据工单内容来看…"});
return t=>{A(m,t,S(n)-.3,{k:"pop"});m.type(t,S(n,.2),{per:.32});m.drift(t,S(n+1,.3),{from:6})};
```

**常见搭配**：和 `brandNode` 并排对比“写一段话”与“选一个选项”；跑题时旁边加黄色 `warn` 图标 + “跑题”标签。

### `tokenRow(p, toks, {x, y, size=40, gap=10, pal, mono})`

**预览**：A-5

**用途**：模型读句子时先切成词块，只有几块真正起作用。每块一个平涂色块（pal 循环：pink / yellow / blue / teal / or），长词可以拆成两块（如 `["工资","单"]`）。中文句子加 `mono:0` 用正文字体。

**返回**：行元素 R（`.toks` `.caret`）；`R.type(t,s,{per=.12})` 逐块出现 + 橙色光标（打完约 0.8 秒后光标消失）；`R.focus(t,s,idx,{to=.3,sc=1.08})` idx 以外的块降暗、idx 略放大。

```js
const R=tokenRow(root,["只有","管理员","能","打开","工资","单","。"],{x:280,y:400,size:72,mono:0});
return t=>{R.type(t,S(n),{per:.16});R.focus(t,S(n+2),[1,4,5])};
```

**限用提醒**：色块只区分“这是不同的块”，不代表状态；焦点靠降暗表达，不再额外变橙。

---

## B 焦点与强调

**表达**：此刻该看哪里：焦点框、柔光、扫光、放大一级、顶一下。

**适用场合**：并列的几项逐个讲、在一组里点名一项、点名关键词、主角卡片放大、元素顶一下 / 闪烁提醒。

**限用提醒**：要一眼看到的地方仍然直接变橙；`shineText` 是醒目效果，每个场景最多一个；`spotlight` 在暗舞台上光感偏弱，停下后要补橙色胶囊或着色。

### `focusFrame(p, {len=30, w=5, tone="or"})` → `trueFocus(F, els, t, s, {seq, at, per=1, d=.5, pad=18, blur=5, dim=.55})`

**预览**：B-1

**用途**：同一时刻只有一个焦点。一排词只有焦点那个清晰，其余模糊降暗；四角括号框平滑移到下一个。返回当前焦点序号（可用来同步下方说明文字）。
**适用**：流水线步骤、并列概念逐个讲解。框和元素须在同一父元素里。

```js
const F=focusFrame(root);const at=[S(n,1.2),S(n+1),S(n+1,1.4),S(n+2)];
return t=>{const k=trueFocus(F,words,t,at[0],{at});};
```

### `spotlight(els, t, s, {seq, at, per=1, d=.7, r=380, amt=.16, dim=.35, bg})`

**预览**：B-2

**用途**：聚焦某一项。一束径向柔光在一组卡片上移动，照到的卡片内部变亮、边框转橙，远处卡片降暗；`bg` 传一个全屏底层元素时同步画一层更大更淡的光。返回当前停在的卡片序号。
**暗舞台上光感偏弱，主要靠边框转橙和降暗起作用**：要确保看清时，停下后再加一个橙色胶囊或 `tint`；只有一张要强调时，直接 `trueFocus` 或着色更清楚。

```js
spotlight(cards,t,S(n+1),{seq:[0,4,1,2],at:[S(n+1),S(n+1,1),S(n+1,2),S(n+2)],bg});
```

### `shineText(el, t, s, {d=1, rep=1, gap=.4, color="var(--tx)", hi="#ffffff", w=.45, angle=110})`

**预览**：B-3

**用途**：点名当前关键词，比直接变橙更轻。一道斜向高光匀速扫过文字（`background-clip:text` 渐变，位置由 t 算出）；不扫时文字就是 `color` 底色。
**适用**：流程图里的节点标签（灰字配白光）、一句话里的关键词（白字配橙光 `hi:"var(--or)"`）。要一眼看到的地方仍然直接变橙。

```js
shineText(C.nodes[2].label,t,S(n+1),{color:"var(--mut)",d:1.1,rep:2});
shineText(kw,t,S(n+2),{hi:"var(--or)",w:.5,rep:2});
```

### `title(el, size=34)`

**预览**：B-4

**用途**：让主角卡片的标题（或任意文字元素）再大一级，标题里的图标跟着放大。`el` 是 `card()` 时改它的 `.head`。可以每帧调用（字号随状态变化）。

```js
const c=card(root,{x:160,y:190,w:760,h:420,title:"判断法则",icon:"doc"});
title(c,40);
```

### `winBar(w, {size=30, h, tx})`

**预览**：B-4

**用途**：窗口标题栏放大（栏高随字号，默认 ≥54），`tx:1` 标题用亮字；`w.body` 自动下移。返回窗口，`w.barH` 为栏高。

```js
const w=winBar(win(root,{x:1000,y:190,w:760,h:420,title:"客服信箱"}),{size:34,tx:1});
```

**引擎默认值**（已合规，一般不用再调）：胶囊 32px、标签 26px、卡片标题 32px、窗口标题栏 28px / 54px 高。

### `kf` / `bump` / `pulse` / `blink`（时间工具）

**预览**：B-5

| 函数 | 说明 |
|---|---|
| `kf(t, [[时刻, 值], ...])` | 关键帧插值，段间 `eio` 缓动；值可以是数字或数组（如 `[x,y]`）。自定义轨迹、游标位置、数值变化都用它 |
| `bump(t, s, d=.6)` | 单次脉冲：从 s 起 d 秒内 0 → 1 → 0，返回当前值（闪一下、提亮一下） |
| `pulse(el, t, s, {amt=.12, d=.5})` | 元素放大一下再回落（写 `sc2`）；同一元素要脉冲多次时，把几次 `bump` 相加后一次 `setFx(el,{sc2:1+amt*sum})`，不要连调两次 `pulse`（后一次会覆盖前一次） |
| `blink(t, s, hz=2.5, lo=.25)` | 闪烁：s 之前返回 0，之后在 1 和 lo 之间交替；直接给 `setFx(el,{op2:...})`（光标、提示灯） |

```js
const [x,y]=kf(t,[[S(n),[260,720]],[S(n,1.1),[620,380]],[S(n,2.2),[980,640]]]);setFx(nd,{mx:x-260,my:y-720});
const b=bump(t,S(n+1),.5)+bump(t,S(n+1,1.4),.5);setFx(bolt,{sc2:1+.2*b});
setFx(lamp,{op2:blink(t,S(n+1))});
```

### `eback(p)`

**预览**：各分组标题场景的组字母

回弹缓动（约 10% 过冲），p 为 0–1 进度；比引擎的 `es` 更明显。`splitRise` 的 `bounce`、`listIn` 的弹入都用它。

### `searchHits(p, {x, y, w=1600, items, cols=5, ch=74, gap=16, size=28, query, keys, icon})`

**预览**：B-6

**用途**：带着问题去一堆东西（文件、页面、记录）里找。顶部搜索框打字，关键词变橙；下方网格里含关键词的块逐个变橙，其余降暗。

**返回**：`{box, q, cells}`；`H.type(t,s,{cps=18})` 打字（每帧调用）；`H.hit(t,s,hits,{stag=.06,to=.3})` 在 s 标出关键词、命中块逐个亮起（hits 为空数组时只标关键词，不降暗）。`hit` 每帧都要调用（它同时负责刷新搜索框文字）。

```js
const H=searchHits(root,{x:160,y:210,ch:96,query:"员工在哪里看自己的工资？",keys:["员工","工资"],items:[...25 个文件名]});
return t=>{H.type(t,S(n,.8),{cps:8});H.hit(t,S(n+1),after(t,S(n+2))?[1,3,5,8]:[])};
```

**常见搭配**：命中之后接 `rankList` 给命中项打分排序。

---

## C 选择与判断

**表达**：几个可能里选一个、打分、过不过阈值、具体是哪个产品。

**适用场合**：做选择题 / 输出是概率、原因候选轮换、置信度与阈值、打分分档、某个具体产品的决策节点。

**限用提醒**：数值必须来自旁白；有 logo 就一律用 logo，不写首字母。

### `optBars(p, {x, y, labels, size=34, gap, pillW, pw, w=520, bh=22, icons})`

**预览**：C-1

**用途**：“做选择题 / 输出是概率而不是一段话”。左列胶囊，右边概率条和百分比。

**返回**：`{rows:[{pill,bar,pct,y}], ph, gap, set(i,v,tone), pct(i,text), fill(t,s,vals,{d,pct,tone}), pick(i,tone="or")}`
- `fill` 让所有条一起长出、百分比同步滚动（每帧调用）。
- `pick(i)` 高亮第 i 项（胶囊变橙、条变橙）；`pick(-1)` 取消。要在 `fill` / `set` 之后调用。

```js
const O=optBars(root,{x:620,y:290,labels:["选项 A","选项 B","选项 C"],size:40,gap:150,pillW:230,w:760});
return t=>{
  O.rows.forEach((r,i)=>{A(r.pill,t,S(n)+i*.15,{k:"left"});A(r.bar,t,S(n,.2)+i*.15,{k:"fade"})});
  O.fill(t,S(n+1),[.78,.42,.2]);
  O.pick(after(t,S(n+1,1.5))?0:-1);
};
```

### `fanLinks(svg, [x,y], els, {tone, w, side, in, arrow})`

**预览**：C-1

**用途**：从一点扇出到一组元素（决策点 → 选项、分发 → 多个接收方）。默认连到每个元素的左侧中点；`side:"top"` 连到顶边；`in:1` 反过来从元素右侧汇到这一点。返回 path 数组，配合 `draw()`。

```js
const L=fanLinks(svg,[392,530],O.rows.map(r=>r.pill));
L.forEach((l,i)=>draw(l,t,S(n,.5)+i*.15,.5));
```

**常见搭配**：`brandNode` + `fanLinks` + `optBars`；选中后把被选那条连线 `setAttribute("stroke",TONE.or)`。

### `rotPill(p, words, {x, y, size=48, tone})` → `rotateText(e, t, s, {seq, at, per=1.2, d=.5})`

**预览**：C-2

**用途**：一个位置有几种可能。同一胶囊里轮换候选词，旧词上移淡出、新词从下方进入，胶囊宽度按两个词的实际宽度平滑变化。返回当前词序号。
**适用**：原因候选、方案候选；最后停在一个时改胶囊类名表达状态（如 `"a pill warn"` = 可疑）。

```js
const rp=rotPill(root,["超时","权限不足","配置文件缺失"],{x:800,y:304,size:60,tone:"or"});
return t=>{const k=rotateText(rp,t,S(n),{seq:[0,1,2,0,1,2],at:[S(n),S(n,1.4),S(n+1,.3),S(n+1,1.6),S(n+2),S(n+2,1)]})};
```

### `ynMeter(p, {x, y, w=1000, th=36, v=0, gate, gateLabel, ends=["0","1"], split})`

**预览**：C-3

**用途**：0–1 的分数、置信度、是非判断；`gate` 画一道阈值闸线，表达“过线才放行”。`split:1` 把轨道分成两半（是 / 否两侧）。

**返回**：元素，`set(v,tone="or")` 同时移动填充和白色竖针，返回是否过阈值；`setGate(tone)` 闸线着色。

```js
const M=ynMeter(root,{x:260,y:500,w:1400,gate:.7,gateLabel:"阈值 0.7"});
return t=>{const v=kf(t,[[S(n),.2],[S(n+1),.86]]);const pass=M.set(v,v>=.7?"ok":"or");M.setGate(pass?"ok":"l1")};
```

**常见搭配**：旁边放 `badge` 随过线切换 `ok`；上方一个 `big` 数字显示当前值（数值必须来自旁白）。

### `ruler(p, {x, y, w=1000, n=5, labels, ins=70, ts=34, below=1})`

**预览**：C-4

**用途**：打分、分档、“落在哪个等级”。n 道粗刻度 + 橙色倒三角游标。

**返回**：尺元素，`.ticks` `.tl`（刻度数字）`.cur`（游标）；`setCur(v)` 游标移到第 v 道（可小数），停在整刻度时那个数字变橙；`ax(i)` 第 i 道的舞台 x（用来在刻度下挂说明文字）。

```js
const R=ruler(root,{x:260,y:560,w:1400,n:5});
["很差","勉强","一般","不错","很好"].forEach((s,i)=>lbl(root,s,{x:R.ax(i),y:700,center:1,size:30}));
return t=>{A(R.cur,t,S(n,1),{k:"drop"});R.setCur(kf(t,[[S(n,1),0],[S(n+1),3]]))};
```

### `brandNode(p, {x, y, s=140, logo, text, label, lsize=32, k=.56})` / `setBrand(n, state)`

**预览**：C-5

**用途**：片子讲某个具体产品 / 主体时，代表它的圆形决策节点。`logo` 是项目提供的 SVG 字符串（用 `currentColor` 着色，矢量描摹后放进项目 `00-common.js`）；**有 logo 就一律用 logo，不写首字母**；没有 logo 时用 `text` 写短字。

**返回**：节点，`.mark`（logo 或文字）`.label`。`setBrand(n, state)`：`idle`（亮白标志）/ `active`（橙）/ `ok` / `err` / `warn` / `dim`（灰）。

```js
// 项目 00-common.js：window.PRODUCT_LOGO='<svg viewBox="..." ...>...</svg>';
const J=brandNode(root,{x:180,y:430,s:200,logo:PRODUCT_LOGO,label:"决策"});
return t=>{A(J,t,S(n),{k:"pop"});A(J.label,t,S(n,.1),{k:"fade"});setBrand(J,after(t,S(n+1))?"active":"idle")};
```

### `pinAxis(p, {x, y=820, w=1400, ticks=[0,.5,1], labels, ls=30})` → `G.pin({v, text, tag, tone, h, cw, chh})`

**预览**：C-6

**用途**：每个判断有多大把握。0–1 横轴，判断卡按分数挂上去（竖杆 + 轴上圆点），越靠右越确定；挂在中间的卡用 `warn` 表示“自己也拿不准”。

**返回**：G（`.line` `.ticks` `ax(v)`）；`G.show(t,s)` 轴出现；`G.pin(...)` 在 build 里建一张挂卡，返回 `{card, stem, dot, num, play(t,s)}`。`h` 是卡底离轴的高度，**分数接近的卡要用不同 h 错开**，并确认竖杆不会穿过别的卡。

```js
const G=pinAxis(root,{x:210,y:880,w:1500,labels:["0 没把握","0.5","1 很确定"]});
const P1=G.pin({v:.97,text:"员工能改自己的角色吗？",tag:"否",tone:"err",h:400});
return t=>{G.show(t,S(n));P1.play(t,S(n,.4))};
```

**限用提醒**：分数必须来自旁白。

### `rankList(p, {x, y, w=900, items:[[文字,分数],...], rh=84, size=32, bw=220})`

**预览**：C-7

**用途**：先打分、再排序、只取前几名。逐行出现（分数条和数字一起长），再按分数从高到低换位，前 k 名橙色高亮、其余降暗。

**返回**：R（`.rows` `.order`）；`R.show(t,s,{per=.12})`、`R.sort(t,s,{d=.9,stag=.03})`、`R.top(t,s,k,{to=.3})`，三个都每帧调用。

```js
const R=rankList(root,{x:310,y:220,w:1300,rh:88,items:[["employee-card",.38],["pay-slip",.91],["payroll-page",.96]]});
return t=>{R.show(t,S(n));R.sort(t,S(n+1));R.top(t,S(n+2),2)};
```

### `probChip(p, {x, y, size=28, v=.7, text="概率"})` / `probRing(size, v)`

**预览**：C-8

**用途**：模型给出一个概率 / 把握，但旁白没说是多少。迷你圆环 +「概率」字样；环的填充只示意「有一个概率值」，不代表具体数字。**不要用「▮▮%」灰块**（用户审片时指出看起来像乱码）。旁白给了具体数字才写数字。

**返回**：胶囊元素。`probRing(size, v)` 只返回圆环的 HTML，流式布局里自己拼胶囊时用（`E(row,"pill mut",probRing(28)+"概率",{display:"flex",alignItems:"center",gap:"8px"})`）。

```js
const pc=probChip(root,{x:1440,y:360,size:32});
return t=>A(pc,t,S(n,.4),{k:"pop"});
```

---

## D 流程与进度

**表达**：走到第几步、排队到达、一个个过、谁先到。

**适用场合**：步骤链与出错的一步、步骤条推进、章节导航清单与角落常驻、路线图、请求排队、逐个检查案例、耗时对比与超时。

**限用提醒**：已完成一律灰勾（不用绿）；角落常驻缩放后文字仍要 ≥26px；`cardSwap` 的卡片上方要留出层叠空间。

### `chain(p, svg, {items:[{icon,text,label}], n, x, y, s=120, gap=2s, round, tone, arrow=1, lsize=30})`

**预览**：D-1

**用途**：步骤、流程、流水线；某一步出错、某一段被跳过。默认水平居中。

**返回**：`{nodes, links, xs, cx(i), cy, y, s, play(t,s,{per})}`；`play` 让节点逐个出现、连线逐段生长。状态用引擎的 `setNode(n, state)`。

```js
const C=chain(root,svg,{s:150,gap:340,y:430,items:[{icon:"doc",label:"读取"},{icon:"search",label:"检索"},{icon:"code",label:"生成"}]});
return t=>{C.play(t,S(n));C.nodes.forEach((e,i)=>setNode(e,after(t,S(n+1)+i*.6)?"active":"idle"))};
```

**常见搭配**：`brace`（梳形括号指向其中几个节点）、`flipNode`（节点翻面揭示真实类型）、`denyMark` + `deny`（某一步被否定）。

### `stepRun(R, t, s, {at, d=.6})`

**预览**：D-2

**用途**：流程走到第几步。驱动组件库的 `roadmap()`：已完成打灰勾（不用绿）、当前橙色、连线逐段填充、没讲到的步骤模糊，换步时当前节点放大一下。返回当前步骤序号。

```js
const R=roadmap(root,svg,{names,subs,y:500,w:1440});return t=>{stepRun(R,t,S(n),{at:[S(n+1),S(n+1,1.4),S(n+2)]})};
```

### `checklist(p, {title, items, x, y, w=480, rh=86})` / `setCheck(c, {done, cur, show})`

**预览**：D-3

**用途**：章节导航 / 本片几件事 / 待办清单。`items` 是文字或 `[图标, 文字]`（图标可以是引擎图标名，也可以是 `<path .../>` 片段）。默认放在舞台中央。

**状态**（`setCheck` 每帧调用）：
- `done` 已讲完：整行降暗，编号变灰实心并带小勾（**不用绿**）。
- `cur` 当前：橙框 + 橙色编号 + 橙色图标。
- `show` 已露出但未讲：清楚显示。
- 其余：模糊占位。

### `corner(el, {k, x, y})` / `dock(el, t, s, {k, x, y, d})` / `CORNER`

**预览**：D-3

**用途**：清单、路线图等缩到角落常驻。`corner()` 算出效果值，配合 `base(el, corner(el))` 固定在角落；`dock()` 是从原位置缩过去的过程动画，终点与 `corner()` 一致。默认 `CORNER = {k:.82, x:120, y:90}`：缩放 0.82 保证清单的 33px 文字缩小后仍 ≥26px。

```js
// 讲到这一章时：中央出现 → 当前项亮起 → 缩到角落
"c3-01":{build(root){const c=keep(checklist(root,{title:"三件事",items:[["list","先分类"],["search","再检索"],["shield","最后把关"]]}),"nav");
  return t=>{A(c,t,S(n),{k:"pop"});setCheck(c,{done:[0],cur:1});dock(c,t,S(n,2))}}},
// 之后的场景：同一位置重建并常驻
"c3-02":{keep:["nav"],build(root){const c=keep(checklist(root,{...同上}),"nav");base(c,corner(c));
  return t=>{setCheck(c,{done:[0],cur:1});/* 其余内容避开左上角 */}}},
```

### `roadmap(p, svg, {names, subs, x, y=170, w=1200, cw})` / `setRoad(r, {done, cur, clear, pos})`

**预览**：D-4

**用途**：横向路线：讲到第几站、用法一二三。轨道 + 圆点节点 + 下挂卡（`names` 26px 小字、`subs` 32px 大字）。

**返回**：`{nodes, cards, ticks, line, prog, xs, y, n}`；`setRoad` 每帧调用：`done` 节点灰实心带小勾、卡降暗（不用绿）；`cur` 橙节点 + 橙框；`clear` 已露出；其余卡模糊；`pos`（默认 = cur）橙色进度线走到第几个节点，可传小数做推进动画。

```js
const r=roadmap(root,svg,{names:["用法一","用法二","用法三"],subs:["分类","路由","把关"]});
return t=>setRoad(r,after(t,S(n+1))?{done:[0],cur:1,pos:kf(t,[[S(n+1)-LEAD,0],[S(n+1,.6),1]])}:{cur:0});
```

角落常驻同 `checklist`：把 roadmap 放进一个全屏容器 `g=box(root,"","",{x:0,y:0,w:1920,h:1080})`，对容器 `keep` + `base(g,{sc2,mx,my})`。

### `listIn(items, t, s, {at, per=.8, rh=110, max, d=.5})`

**预览**：D-5

**用途**：排队、逐个到达。所有项先摆在第一行位置；新项缩放 + 淡入弹入顶部，旧项平滑下移 `rh`，超过 `max` 的最旧项淡出。返回已到达条数（可用来标出最新一条）。

```js
const k=listIn(items,t,S(n),{at,rh:114,max:5});items.forEach((e,i)=>e.style.borderLeft=i===k-1?"8px solid var(--or)":"");
```

### `cardSwap(cards, t, s, {at, per=1.2, d=.8, dx=36, dy=-66, k=.04, fade=.12, drop=440})`

**预览**：D-6

**用途**：很多案例一个个过。一摞卡片（`cards[0]` 在最上）叠放在同一位置，用 translate + scale 模拟透视；最上面一张下滑离开、收到最底，下一张顶上来。返回当前最上面卡片的序号。
**适用**：逐个检查案例、逐份审阅；卡片标题放顶部，默认层距会露出后面各层的标题条。卡片摆放位置要为向上 `4×66` 像素的层留空间。

```js
cardSwap(cards,t,S(n+1),{at:[S(n+1),S(n+1,1.6),S(n+2,.3),S(n+2,1.5)],d:.75});
```

### `lanes(p, svg, {rows:[{label, icon, blocks:[时长...]}], max, limit, limitLabel, x=160, y=260, w=1600, h=120, gap=70, hw=300})`

**预览**：D-7

**用途**：速度 / 耗时对比、“谁先到”、超时。每道左侧道头（图标 + 32px 标签），右侧轨道里的时间块按时长逐段生长，正在长的块橙框；`limit` 画时限线，越过时限的部分预先切成红色块，长到那里就是红的。

**返回**：`{lanes, limit, ux(值→x), play(i,t,s,d), hit(on), run(t,[[s,d],...])}`
- `play(i,t,s,d)`：第 i 道在 s 起 d 秒内长完，返回是否越线。
- `run(t, list)`：全部播放，任一道越线时时限线和标签变红。

```js
const L=lanes(root,svg,{limit:5.2,limitLabel:"时限 5 秒",rows:[{label:"快",icon:"bolt",blocks:[.6,.4,.5]},{label:"慢",icon:"clock",blocks:[1.4,1.8,1.2,1.6]}]});
return t=>L.run(t,[[S(n),1.8],[S(n),SE(n+1)-S(n)]]);
```

### `loopCycle(p, svg, {x, y, w=1400, names, cw=380, chh=150, dip=120, goal, exits, spread=170, counter})`

**预览**：D-8

**用途**：一轮一轮地试，直到达成或受阻（代理操作网页、反复修到测试通过）。三步一轮排成一行，下方回环箭头回到第一步，回环中间的胶囊计“第几轮”；中间一步上方两个出口（默认 达成 / 受阻）。

**返回**：L（`.cards` `.exits` `.arc` `.cnt`）；
- `L.show(t,s)` 卡片、箭头、回环、出口依次出现。
- `L.run(t,rounds)` rounds=`[{s, texts:[三步内容], per=.8, n=3}]`：当前步橙框，本轮走过的卡换成本轮内容；一轮走完、下一轮开始前回环亮橙。最后一轮在判断处就出去时写 `n:2`。
- `L.exit(t,s,i)` 第 i 个出口着色（连线同色）、中间卡同色，另一个出口降暗。

```js
const L=loopCycle(root,svg,{x:210,y:480,w:1500,cw:420,names:["看页面","判断","动手点击"],goal:"目标：把 Priya 改成经理",exits:[["目标达成","ok"],["页面受阻","err"]]});
return t=>{L.show(t,S(n));L.run(t,[{s:S(n,.4),per:.9,texts:["团队页","点 Priya","Priya"]},{s:S(n+1),per:.9,n:2,texts:["已保存","达成 0.96",""]}]);L.exit(t,S(n+1,1.4),0)};
```

---

## E 数量与计时

**表达**：数字涨跌、大数对比、倒计时。

**适用场合**：处理量 / 耗时 / 价格的大数字、强调数字涨跌、棋钟倒计时和记分牌。

**限用提醒**：数字必须来自旁白；`odometer` 只在强调涨跌时用（普通计数用 `count`）；翻牌只用于计时和比分。

### `countCard(p, {x, y, w=440, h=260, value="0", size=96, label, icon, lsize=32, tone})`

**预览**：E-1

**用途**：大数字 + 标签（处理量、耗时、价格）。数字配合引擎的 `count()` 滚动；**数值必须来自旁白**。

**返回**：卡片，`.num` `.label`；`c.tone(tone)` 改数字颜色（`null` 恢复）。

```js
const a=countCard(root,{x:300,y:330,w:580,h:340,label:"每小时处理",icon:"clock",size:120});
return t=>{A(a,t,S(n),{k:"pop"});count(a.num,t,S(n,.4),{to:1200,d:1.6,suf:" 件"})};
```

### `odometer(el, t, s, {from, to, d=1.6, stag=.07})`

**预览**：E-2

**用途**：数字变化。里程表式：每一位竖向滚到目标值（低位多转一圈、高位稍晚到位），带千分位，可向上或向下滚。配合 `countCard` 的 `.num` 使用。
**只在强调数字涨跌时用**；普通计数用引擎的 `count` 就够了，滚动中间态比较乱。数字必须来自旁白。

```js
odometer(L.num,t,S(n+1),{from:128400,to:356920,d:1.9});
```

### `flapBoard(p, text, {x, y, size=140, cw, ch, gap=12})` → `flapSeq(b, t, [[时刻,文字],...], {d=.45, gap=.08})` / `flapTo(b, t, s, text, {from})`

**预览**：E-3

**用途**：计时、翻牌变化。每格上半页先翻下、下半页再落下；相同的位不翻；冒号、小数点为窄格。文字颜色跟随板的 `style.color`（超时改 `var(--err)`）。
**只用于计时和比分**（棋钟、倒计时、记分牌），其他数字变化不用。

```js
const b=flapBoard(card,"5:00",{x:138,y:150,size:150});
return t=>{flapSeq(b,t,[[S(n),"5:00"],[S(n+1),"4:00"],[S(n+1,.65),"3:00"],[S(n+2),"0:00"]])};
```

### `ledger(p, {x, y, w=900, title, items:[[名称,金额文字,说明?],...], rh=100, total:[标签,初始文字]})`

**预览**：E-4

**用途**：一笔费用由哪几项组成。逐行列出，某一行盖胶囊（如「免费」）并整行变绿，底部合计滚动到最终数。

**返回**：卡片 L（`.rows` `.tot`）；`L.show(t,s,{per=.5})`、`L.mark(t,s,i,tag,tone="ok")`、`L.sum(t,s,{from=0,to,d=1.2,fmt=FMT.usd})`。

**格式工具 `FMT`**：`s`（12.3s）`s2` `mmss`（1:08）`usd`（$0.43）`usd3`（$0.042）`int`（千分位）`p2`（0.97），`ledger` / `runClock` / `count` 都能用。

```js
const L=ledger(root,{x:310,y:230,w:1300,rh:130,title:"一次调用的费用",items:[["发送问题","$0.042","每百万 token"],["传回答案","$0"]],total:["合计","$0.000"]});
return t=>{L.show(t,S(n));L.mark(t,S(n+1),1,"免费");L.sum(t,S(n+2),{to:.042,fmt:FMT.usd3})};
```

**限用提醒**：金额只写旁白给的数。

### `runClock(p, {x, y, size=44, icon="clock"})` → `C.run(t, s, e, {from=0, to, fmt=FMT.s, tone="ok"})`

**预览**：E-5

**用途**：计时 / 计费读数。s 到 e 之间**匀速**走（时钟不缓动），到 e 停住并变色（默认绿 = 先完成）。两张卡各放一对（时间 + 费用，计费用 `icon:"coin"`），就是“谁更快、更省”的比赛；落后的一方结束时写 `tone:"tx"` 保持中性，不必变红。返回是否已停。

```js
const tm=runClock(card,{x:40,y:470,size:60}),co=runClock(card,{x:420,y:470,size:60,icon:"coin"});
return t=>{tm.run(t,S(n),S(n+1),{to:8,fmt:v=>Math.floor(v)+"s"});co.run(t,S(n),S(n+1),{to:.03,fmt:FMT.usd})};
```

**常见搭配**：先停的卡同时弹出 `badge` 绿勾、边框变绿；和 `lanes` 的区别：`lanes` 比长度，`runClock` 比读数。

---

## F 状态与检查

**表达**：正在处理、扫描筛查、两边对照。

**适用场合**：处理中 / 生成中、依赖或文件逐个检测出结果、两种做法同构对照。

**限用提醒**：`runBorder` 是醒目效果，只在讲到“正在处理”时用，每个场景最多一个；静态橙框 = 当前项，跑光 = 进行中，不要混用。

### `runBorder(el, t, s, {until, speed=.3, len=.07, n=2, tone="or", r=14, w=4})`

**预览**：F-1

**用途**：正在处理中。光点沿卡片圆角边框匀速跑动（SVG 描边 dashoffset），带拖尾和光晕；`until` 时刻淡出。和静态橙框（= 当前这一项）区分：跑光 = 进行中。
**适用**：处理中、生成中；结束后改成绿框 + 勾表示完成。

```js
runBorder(card,t,S(n+1),{until:S(n+2)});card.style.border=after(t,S(n+2,.2))?"3px solid var(--ok)":"";
```

### `scanBar(p, {x0, x1, y0, y1})` → `scanRun(B, items, t, s, {d=3, hit(i, since)})`

**预览**：F-2

**用途**：检测、筛查。一条橙色竖向扫描线带渐隐拖尾，从 x0 扫到 x1；每一项被扫过时回调 `hit(i, 扫过后的秒数)`（没扫到为 -1），在回调里亮状态：通过绿、可疑黄、未知灰（徽标 `q`），可以顺手弹一下。

```js
scanRun(B,items,t,S(n+1),{d:3.2,hit:(i,since)=>{const on=since>=0;setBadge(items[i].bd,on?st[i]:"idle");
  setFx(items[i],{sc2:on&&since<.35?1+.07*Math.sin(since/.35*Math.PI):1})}});
```

### `compare(p, {titles, icons, x=160, y=150, w=1600, h=760, gap=100, vs, tones})`

**预览**：F-3

**用途**：两栏同构对照（逐字生成 vs 一次算完、旧流程 vs 新流程）。两栏结构完全一样，只有内容不同；焦点在哪一栏，另一栏用 `dim` 降暗。`tones` 给两栏顶边上阵营色（可选）。

**返回**：`{L, R, cols, cw}`；每栏是 card，内容放进 `.body`（标题下方，坐标从 0,0 起，宽 `cw`）。

```js
const C=compare(root,{titles:["逐字生成","一次算完"],icons:["chat","bolt"]});
C.cols.forEach((c,i)=>{const m=meter(c.body,{x:40,y:340,w:C.cw-80,h:24});setMeter(m,i?.12:.9,"l1")});
return t=>{dim(C.R,t,S(n,1.2),{back:S(n+1)});dim(C.L,t,S(n+1))};
```

### `verdictList(p, {x, y, w=1200, title, items, rh=92, size=32, pw=150})`

**预览**：F-4（盖结论）、G-4（`prune` 收拢）

**用途**：一批问题 / 规则 / 消息逐条判定。每行右侧依次弹出结论胶囊（是 / 否、留 / 丢…，颜色按状态）并滚出把握分数；没盖到的行保持空白。

**返回**：卡片 V（`.rows`，每行 `.t .p .n`）；
- `V.show(t,s,{per=.15})` 卡片和各行出现。
- `V.stamp(t,s,res,{per=.3})` res=`[[结论,tone,分数],...]`，某项写 `null` 跳过；每帧调用。
- `V.prune(t,s,drop,{d=.5})` drop 行淡出，下面的行上移补位，整张卡同步变矮（见 G-4）。

```js
const V=verdictList(root,{x:260,y:210,w:1400,rh:120,size:36,title:"5 个问题",items:["员工能看别人的工资吗？",...]});
return t=>{V.show(t,S(n));V.stamp(t,S(n+1),[["否","err",.97],["是","ok",.93],...],{per:.4})};
```

**限用提醒**：分数来自旁白；没给分数就只盖结论（第三项写 `null`）。“丢弃”用灰色 `mut` 胶囊，不用红（红 = 失败）。

### `matrix(p, {x, y, rows, cols, hw=300, cw=200, rh=100, size=30, icons})`

**预览**：F-5

**用途**：几种角色 × 几个页面（或 几台设备 × 几项检查）逐个试。一行一行地逐格填绿勾 / 红叉，正在测的那一行橙色底；没填的格子是灰短横。

**返回**：卡片 M（`.cells[r][c]` `.bands`）；`M.show(t,s)`；`M.fill(t,s,vals,{per=.18,gap=.4,at})` vals[r][c] = `ok` / `err` / `warn` / `q`，`null` 不填；`at` 给每行开始时刻（一行对一句字幕），返回当前行。

```js
const M=matrix(root,{rows:["管理员","经理","员工"],cols:["首页","团队","工资","我的","设置"],hw:320,cw:250,rh:150,size:34,y:260});
return t=>{M.show(t,S(n));M.fill(t,0,vals,{per:.22,at:[S(n,.9),S(n+1,.8),S(n+2)]})};
```

---

## G 否定与替换

**表达**：排除、揭穿真面目、被新版本替换。

**适用场合**：方案被否定 / 丢弃、“翻开一看原来是…”、草稿被生成版替换。

**限用提醒**：永远不画删除线，否定 = 降暗 + 旁边红叉 / ⊘ / 掉落，徽标不压在元素上；`pixelSwap` 是醒目效果，偏游戏感，一部片子用一两次即可。

### `denyMark(p, el, {mark, side, at, s:52, gap:16})` → `deny(d, t, s, {to=.35, delay=.25, fall, rot=0, back})`

**预览**：G-1

**用途**：否定、排除、“这条路不行”、被丢弃。**永远不画删除线**：元素降暗，旁边弹出红叉徽标（`mark:"stop"` 为 ⊘）；`fall:true`（或一个时刻）让元素连同徽标竖直掉落（默认不旋转，`rot` 可给角度）；`back` 为恢复时刻。

分两步，保证 update 里不创建任何元素：
1. **build 里** `const d = denyMark(p, el, {...})`：按 `el` 在 `p` 里的位置建好徽标（默认在元素右侧、垂直居中；`side:"left"/"top"` 或 `at:[x,y]` 指定中心），初始隐藏。`el` 须在 `p` 之内。
2. **update 里** `deny(d, t, s, {...})`：每帧调用，返回降暗进度。

**徽标要落在空白处**：元素之间至少留 70px 空隙，或用 `side` / `at` 挪开。

```js
// build
const dA=denyMark(root,cardA), dB=denyMark(root,cardB,{mark:"stop"}), dC=denyMark(root,cardC);
return t=>{
  deny(dA,t,S(n,.9));                        // 降暗 + 红叉
  deny(dB,t,S(n+1));                         // 降暗 + ⊘
  deny(dC,t,S(n+1,1.4),{fall:S(n+1,2.3)});   // 先否定，再连同徽标掉落
};
```

### `stopMark(p, x, y, s=56)`

**预览**：G-1、G-2

**用途**：⊘ 禁止标记（以 x,y 为中心），放在元素**旁边**，不压在元素上；底色会遮住下方连线。静态标记或自己控制出现时用它；需要“降暗 + 标记”一起时用 `denyMark` + `deny`。

### `flipNode(n, t, s, html, {d=.4})`

**预览**：G-2

**用途**：节点绕竖轴翻面，过半时换成 `html`（通常是 `ico("list")` 之类）= 揭示真实类型、“翻开一看原来是…”。每帧调用；翻之前显示原内容。它写的是 `transform`（不在六个效果属性里），可与 `A` / `setNode` 同时使用。

```js
const nd=node(root,{x:1330,y:260,s:170,icon:"q",label:"类型"});
return t=>{flipNode(nd,t,S(n+1),ico("list"));setNode(nd,after(t,S(n+1,.2))?"active":"idle")};
```

### `pixelGrid(p, {x, y, w, h, cols=20, rows=12, color, gap=2})` → `pixelSwap(G, a, b, t, s, {d=1.3, order="random", seed})`

**预览**：G-3

**用途**：被替换、生成出来。像素格逐块盖住 a，过半时 a 换成 b，再逐块揭开露出 b。`order`：`"random"` 确定性乱序、`"dither"` 半调网点（4×4 抖动矩阵）、`"sweep"` 从左到右带抖动。连续替换 a→b→c 时按时间顺序调用。
**只在“生成出来 / 被替换”这种关键时刻少量用**：橙色方块很醒目，偏游戏感，一部片子用一两次即可。

```js
const G=pixelGrid(root,{x,y,w,h});return t=>{pixelSwap(G,draft,gen,t,S(n+1));pixelSwap(G,gen,final,t,S(n+2),{order:"dither"})};
```

### `verdictList(...).prune(t, s, drop, {d=.5})`

**预览**：G-4

**用途**：先判断留还是丢，丢掉的移走、剩下的收拢（上下文压缩、筛掉无关消息）。组件本体见 F 组 `verdictList`；先 `stamp` 盖「留 / 丢」，再 `prune` 让被丢的行淡出、下面的行上移补位、卡片变矮。

```js
return t=>{V.show(t,S(n));V.stamp(t,S(n,1),[["留","ok",.94],["丢","mut",.9],["留","ok",.97]]);V.prune(t,S(n+1),[1])};
```

---

## H 标注与背景

**表达**：括号归组、空槽与编号、舞台质感。

**适用场合**：把几样东西归成一类、待填的位置、给问题编号、可选的点阵背景。

**限用提醒**：`dotGrid` 只当静态背景，不承载含义，`dotGlow` 的高亮很弱，不要指望它引导注意力。

### `brace(p, svg, {x1, x2, y} 或 {y1, y2, x}, {dir=1, shape, teeth, h=20, label, size=32, tone="l1", lcolor})`

**预览**：H-1

**用途**：把一组东西归为一类，标签写在括号背面。
- 横向 `{x1,x2,y}`：`dir=1` 齿朝下、括住下方，标签在上；`dir=-1` 反之。
- 竖向 `{y1,y2,x}`：`dir=1` 齿朝左、括住左侧，标签在右；`dir=-1` 反之。
- `teeth:[x...]`（竖向为 y）加中间齿 = **梳形括号**，一次指向不相邻的几个节点。
- `shape:"curly"` 为大括号。

**返回**：`{path, label}`；`path` 用 `draw()` 生长，`label` 用 `A()` 出现。

```js
const top=brace(root,svg,{x1:C.cx(0),x2:C.cx(3),y:C.y-56,h:30,teeth:[C.cx(1)],label:"判断题",tone:"or",lcolor:"or",size:36});
const grp=brace(root,svg,{y1:372,y2:648,x:1672,shape:"curly",label:"三类"});
return t=>{draw(top.path,t,S(n),.8);A(top.label,t,S(n,.5),{k:"fade"})};
```

### `dashBox(p, {x, y, w, h, tone="l1", bw=3, r=14})`

**预览**：H-2

**用途**：空槽、待填的位置、范围框。之后有卡片 `A(...,{k:"drop"})` 落进来 = 填上了。

### `chip(p, text, {x, y, w, h, size=30, tone})`

**预览**：H-2

**用途**：小编号块（Q1、#3、步骤号），等宽字，宽度随文字。`tone` 给描边和文字着色。

### `dotGrid(p, {x, y, w, h, gap=36, r=1.6, op=.1, glow})` → `dotGlow(G, x, y, r=220, amt=1)`

**预览**：H-3

**用途**：舞台质感。在区域里铺极淡的点阵（边缘渐隐，自动插到最底层）；`glow:1` 再叠一层较亮点阵，由 `dotGlow` 在指定位置（相对点阵左上角）附近露出。
**当可选的静态背景用**：不承载含义；`dotGlow` 的高亮很弱，不要指望它引导注意力。

```js
const D=dotGrid(root,{x:0,y:0,w:VW,h:VH,op:.1});A(D,t,S(n),{k:"fade",d:.8});
```

### `matchLinks(p, svg, {left, right, pairs, rh=82, size=30, miss="无对应"})`

**预览**：H-4

**用途**：两边能不能一一对上，缺口在哪（规则 ↔ 测试、需求 ↔ 实现、问题 ↔ 答案）。左右两列卡片，有对应的用绿色曲线连起；左边没有对应的行变红，旁边出红色胶囊；最后已对应的降暗，只留缺口。

**参数**：`left` / `right` = `{x, y, w, title, items}`（右列文字用等宽字）；`pairs=[[左序号, 右序号],...]`。两列之间至少留约 300px，给缺口胶囊。

**返回**：`{L, R, links, miss, tags}`；`K.show(t,s)`、`K.link(t,s,{per=.2})`、`K.flag(t,s)`、`K.focus(t,s,{to=.3})`，都每帧调用。

```js
const K=matchLinks(root,svg,{rh:104,size:32,miss:"无测试",left:{x:160,y:220,w:780,title:"access-rules.md",items:[...]},
  right:{x:1240,y:220,w:520,title:"tests/",items:[...]},pairs:[[0,0],[2,1],[3,2]]});
return t=>{K.show(t,S(n));K.link(t,S(n,1));K.flag(t,S(n+1));K.focus(t,S(n+2))};
```

---

## 重建预览页

```bash
G=~/.claude/skills/yt-srt-mp3-to-video/examples/gallery
python3 ~/.claude/skills/yt-srt-mp3-to-video/scripts/build_film.py --scenes $G/scenes.json --js $G/scenes \
  --srt $G/gallery.srt --mp3 $G/gallery.mp3 --out ~/.claude/skills/yt-srt-mp3-to-video/references/components.html --update-lib --theme dark
# 亮色预览页
python3 ~/.claude/skills/yt-srt-mp3-to-video/scripts/build_film.py --scenes $G/scenes.json --js $G/scenes \
  --srt $G/gallery.srt --mp3 $G/gallery.mp3 --out ~/.claude/skills/yt-srt-mp3-to-video/references/components-light.html --theme light
```

组件和动效都在这一个预览页里；每次都要用最新的引擎和组件库，所以总是加 `--update-lib`。加场景时 SRT 和静音 MP3 要一起延长（`ffmpeg -f lavfi -i anullsrc=r=22050:cl=mono -t 秒数 -q:a 9 -acodec libmp3lame gallery.mp3`）。
