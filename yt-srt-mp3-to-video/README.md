# yt-srt-mp3-to-video

一个 Claude Code Skill：把口播视频的 **SRT 字幕 + MP3 配音** 做成「示意动画」成片。

你只需要提供校正好的字幕和配音，剩下的事都由 Claude 完成：理解旁白 → 分场景、写视觉命题 → 用卡片、节点、连线、闸门、容量条等抽象图形把旁白讲的事情**演出来** → 跟配音同步的成片网页 → 渲染 4K MP4。

- 两种主题：**暗色**（近黑舞台 + 陶橙高亮，AI LABS 风格）、**亮色**（Gumroad 官网风格：米白底、黑框硬投影、粉黄色块）
- 两种画幅：横版 16:9（1920×1080）、竖版 9:16（1080×1920，适合 Shorts）
- 不是把字幕文字搬上屏，也不用实拍、截图、录屏——旁白讲到什么，画面就把这件事如何发生、如何变化、产生什么结果演出来
- 附带《设计规范 v2》+ 540 段参考动画描述库 + 通用组件库，保证全片风格一致

## 安装

### 1. 下载 skill

```bash
git clone --depth 1 https://github.com/buildinpublichub/YAHAClass-Document.git
```

### 2. 复制到 Claude Code 的 skills 目录

装给所有项目用（推荐）：

```bash
cp -r YAHAClass-Document/yt-srt-mp3-to-video ~/.claude/skills/
```

只装给某个项目用：复制到该项目的 `.claude/skills/` 下即可。

### 3. 安装依赖

脚本用系统 `python3` 运行，需要 Playwright（Chromium）、Pillow、fontTools 和 ffmpeg：

```bash
pip3 install playwright pillow fonttools
python3 -m playwright install chromium
brew install ffmpeg        # macOS；其他系统用对应的包管理器
```

### 4. 验证

重启 Claude Code，输入 `/yt-srt-mp3-to-video` 能看到这个 skill 就装好了。

## 使用

1. 准备两个文件放在同一个目录：
   - **已校正的 SRT 字幕**（字幕文字要和配音完全对得上）
   - **对应的 MP3 配音**
2. 在 Claude Code 里对它说，比如：

   > 用 yt-srt-mp3-to-video 把 字幕.srt + 配音.mp3 做成示意动画，暗色、横版

   主题（暗色 / 亮色）和画幅（横版 / 竖版）要说清楚，没说它会先问你。
3. 之后按流程走，你只需要审核两次：
   - **分镜审阅页**（`分镜审阅.html`）：看分场景和每个场景的视觉设计，有意见直接提，它改完再生成；
   - **成片网页**（`成片网页.html`）：跟着配音播放的完整动画，可以按场景跳转，下方显示旁白和视觉命题。
4. 满意后在对话里说「**渲染**」，就会输出 `成片_4K.mp4`。

### 输出文件

| 文件 | 说明 |
|------|------|
| `分镜审阅.html` | 分镜审阅页（给你审场景设计用） |
| `成片网页.html` | 跟配音同步播放的成片网页（用相对路径引用 MP3，移动时要连 MP3 一起移动） |
| `成片_4K.mp4` | 最终渲染的 4K 视频 |
| `schematic/` | 工作文件（scenes.json、动画代码、自检截图等），不用动 |

## 目录结构

```
yt-srt-mp3-to-video/
├── SKILL.md                 # skill 主文件（流程与设计原则）
├── references/              # 设计规范 v2、scenes.json 格式、引擎 API、
│   │                        #   组件库文档、540 段参考动画描述库
│   └── images/              # 26 张参考拼图
├── assets/                  # 播放引擎、通用组件库 lib.js、字体
│   └── fonts/               # Noto Sans SC、JetBrains Mono（均为 SIL OFL 授权）
├── scripts/                 # 构建 / 自检 / 渲染脚本（python3）
├── examples/                # 完整样例（demo）与组件预览页源（gallery）
└── evals/                   # 评测用例
```

## 依赖与授权说明

- 内置字体 [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) 和 [JetBrains Mono](https://www.jetbrains.com/lp/mono/) 均为 SIL Open Font License 授权，可随本仓库自由分发。
- 本 skill 产出的 HTML / MP4 完全在本地生成，不上传任何内容。

---

出自 [YAHA 学堂](https://www.youtube.com/@yahaclass)。有问题欢迎开 issue 或在视频下留言。
