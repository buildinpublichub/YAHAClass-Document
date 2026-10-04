# Claude Code Mods 示例

配套视频：[rm -rf 删了什么、上下文还剩多少，Claude Code 都不告诉你？装个 Mod 全看得见｜2026 插件教程](https://youtu.be/0RTUj16alAU)
Claude Code 实测版本：2.1.287（Mods 需要 2.1.287 或更新，旧版先跑 `claude update`）。

## 文件说明

| 文件 | 用途 |
|------|------|
| `sandbox/` | 测试仓库：`greet.js` / `main.js` / `README.md` 是 Replay Theater 那段用的小项目，`setup.sh` 会再建一个可以随便删的 `build/` 给 Blast Radius 拦 |
| `token-weather/.claude-plugin/plugin.json` | 插件清单，最后一行 `types` 是修 validate 报错时加的 |
| `token-weather/hooks/hooks.json` | 告诉 Claude Code 入口文件在哪 |
| `token-weather/hooks/token-weather.mjs` | Token Weather 完整代码（视频第 4 段换上的完整版） |
| `token-weather/types/index.d.ts` | `$.state` 里存的 `readings` 的类型声明，不写的话 `claude plugin validate` 会报错 |
| `token-weather/tests/token-weather.test.ts` | 假装窗口 20 万，验证横栏从 Clear 变成 Showers |
| `token-weather/tsconfig.json` | 编辑器补全用；它引用的 `.claude-plugin/types/` 会在第一次加载时由 Claude Code 自动生成 |

## 1. 准备官方示例仓库和测试仓库

视频里两个文件夹放在同一层（我放在用户主目录）：

```text
任意文件夹/
├── sandbox/                  ← 测试仓库，在这里启动 Claude Code
└── claude-code-playground/   ← 官方示例仓库
```

克隆官方仓库（Blast Radius、Replay Theater 都在里面）：

```bash
git clone https://github.com/anthropics/claude-code-playground.git
```

建测试仓库：把本目录的 `sandbox/` 复制到同一层，然后：

```bash
cd sandbox
bash setup.sh
```

第一次 commit 如果报错要你填名字和邮箱，先跑：

```bash
git config --global user.name "你的名字"
git config --global user.email "you@example.com"
```

## 2. 跑官方示例

Blast Radius（拦截 rm -rf）：

```bash
claude --plugin-dir ../claude-code-playground/claude-code/mods/blast-radius
```

在 Claude Code 里输入：

```text
用 rm -rf build 把 build 文件夹删掉
```

Replay Theater（回放每次文件修改）：

```bash
claude --plugin-dir ../claude-code-playground/claude-code/mods/replay-theater
```

```text
把所有的 greet 改名成 welcome，greetAll 不要动。每一处都用 Edit 工具改。
```

跑完输入 `/replay` 回放。Replay Theater 只看 Edit / Write / MultiEdit，Claude 如果用 Bash 里的 sed 改，就会显示没有修改，所以提示词里要加“每一处都用 Edit 工具改”。想重来就 `git checkout -- .` 还原。

`--plugin-dir` 是临时加载，关掉会话就没了。

## 3. 跑 Token Weather

把 `token-weather/` 复制到任意位置，在它的上一层：

```bash
claude --plugin-dir ./token-weather
```

会话开着的时候改 `hooks/token-weather.mjs` 并保存，会当场热重载，不用重启。

检查和测试（另开一个终端标签页，同样在上一层跑）：

```bash
claude plugin validate ./token-weather
claude plugin test ./token-weather
```

## 4. 装成本地插件（不用每次 --plugin-dir）

```bash
cd claude-code-playground/claude-code/mods
claude plugin marketplace add ./
claude plugin install blast-radius@claude-code-playground-mods --scope user
```

然后在 Claude Code 里输入 `/reload-plugins`，再输入 `/plugin` 就能看到正在跑的 Mod。本地市场指向你克隆的那个文件夹，删了或挪了 Mod 就不加载了。

> ⚠️ Mod 没有沙盒，用你的权限运行，能读写文件、能联网。装别人的 Mod 之前，先跑 `claude plugin validate` 看它调了哪些 API。
