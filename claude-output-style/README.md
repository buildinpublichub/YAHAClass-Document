# Claude Code Output Style 示例

配套视频：[你以为Fable 5降智了？我实测在ClaudeCode加一行设置，AI瞬间说人话](https://youtu.be/nlNDzop6tBw)
Claude Code 实测版本：2.1.231。

## 文件说明

| 文件 | 用途 |
|------|------|
| `app.py` | 视频里用来做对比的 11 行小函数，里面埋了几个经典问题（SQL 注入、按下标取列、连接不关闭等） |
| `.claude/output-styles/eli5.md` | 视频第 4 段手写的 ELI5「讲人话」风格 |
| `.claude/output-styles/code-review-mechanism.md` | 视频第 5 段用 `/branch` 让 Claude 自己生成的「成因与修法」审查风格 |
| `.claude/settings.local.json` | 选中风格后 Claude Code 自动写入的配置，只有一行，不用手改 |

## 怎么用

1. 把 `.claude/` 整个文件夹放到你项目根目录（只对该项目生效；放到 `~/.claude/output-styles/` 则全局生效）
2. 在 Claude Code 里输入 `/config`，找到 **Output style**，选 `ELI5` 或 `成因与修法`
3. 走菜单切换当场生效；如果是手改 `settings.local.json`，要 `/clear` 或重开会话才生效
4. 新建的风格文件要**重开会话**才会出现在菜单里，`/clear` 刷不出来

> 旧教程里的 `/output-style` 命令在 2.1.91 已删除，统一走 `/config`。

## 视频里用到的提示词

对比默认风格 vs ELI5：

```
读一下app.py，评估这个函数有什么问题，先不要改
```

Explanatory 风格演示：

```
帮我把app.py里的SQL注入问题修掉
```

Learning 风格演示：

```
给app.py加一个算订单总金额的新函数
```

让 Claude 生成专属风格（先 `/branch` 复制当前会话，再在副本里输入）：

```
把你刚才那段回复，用五种不同的风格重写一次，从最简洁到最详细，我要找一种我读起来最舒服的表达方式
```

```
就用第四种，帮我把这个风格做成一个output style文件
```

## frontmatter 里最关键的一行

```yaml
keep-coding-instructions: true
```

不写默认 `false`，system prompt 里的软件工程规范会被整段丢掉，Claude 就不按工程师的方式干活了。只想换说话方式、代码照写，这行必须 `true`。

## 相关链接

- Claude Code 输出风格官方文档：https://code.claude.com/docs/zh-CN/output-styles
- Lydia Hallie 自定义风格原推：https://x.com/lydiahallie/status/2080378470111256907
- Lydia Hallie 关于 Learning 模式：https://x.com/lydiahallie/status/2056420694087594283
