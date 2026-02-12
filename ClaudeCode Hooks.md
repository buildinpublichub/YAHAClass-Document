## 📋 影片資訊欄程式碼

### 前置準備

```bash
# ====== Mac 用戶 ======

# 1. 安裝 Homebrew（如果還沒裝過）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安裝 Git
brew install git

# 3. 安裝 jq
brew install jq

# 4. 安裝 nvm（Node 版本管理工具）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# ⚠️ 裝完後要重啟終端機

# 5. 安裝 Node 20（重啟終端機後執行）
nvm install 20

# 6. 確認安裝成功
nvm list

# ====== Linux 用戶 ======

# 1. 安裝 Git
sudo apt install git

# 2. 安裝 jq
sudo apt install jq

# 3. 安裝 nvm（Node 版本管理工具）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# ⚠️ 裝完後要重啟終端機

# 4. 安裝 Node 20（重啟終端機後執行）
nvm install 20

# 5. 確認安裝成功
nvm list

# ====== 啟動 Claude Code ======

# 進入你的專案資料夾
cd ~/your-project-folder

# 啟動 Claude Code
claude

# ====== 建立腳本資料夾 ======
mkdir -p ~/.claude/hooks
```

### session-start.sh

```bash
#!/bin/bash

# ====== 1. 載入 Node 版本 ======
if [ -f ".nvmrc" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  
  NODE_VERSION=$(cat .nvmrc)
  nvm use "$NODE_VERSION" > /dev/null 2>&1
  
  if [ -n "$CLAUDE_ENV_FILE" ]; then
    export -p | grep -E '^declare -x (PATH|NVM_|NODE_)' >> "$CLAUDE_ENV_FILE"
  fi
  
  echo "✅ Node 版本已切換至 $NODE_VERSION"
fi

# ====== 2. 顯示 Git 待處理事項 ======
if [ -d ".git" ]; then
  echo ""
  echo "📋 Git 狀態摘要："
  
  CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CHANGES" -gt 0 ]; then
    echo "   • 有 $CHANGES 個檔案尚未提交"
  fi
  
  UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l | tr -d ' ')
  if [ "$UNPUSHED" -gt 0 ]; then
    echo "   • 有 $UNPUSHED 個 commit 尚未推送"
  fi
  
  BRANCH=$(git branch --show-current 2>/dev/null)
  echo "   • 目前在分支：$BRANCH"
  echo ""
fi

exit 0
```

### notify.sh（Mac）

```bash
#!/bin/bash

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code 需要你的注意"')

osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" sound name \"Ping\""

exit 0
```

### notify.sh（Linux）

```bash
#!/bin/bash

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code 需要你的注意"')

notify-send "Claude Code" "$MESSAGE" --urgency=critical

exit 0
```

### notify.ps1（Windows PowerShell）

```powershell
# Windows 版本 - 存為 notify.ps1
# 需要先執行: Install-Module -Name BurntToast

$input = $input | Out-String
$json = $input | ConvertFrom-Json
$message = if ($json.message) { $json.message } else { "Claude Code 需要你的注意" }

# 方法一：使用 BurntToast（需安裝模組）
# New-BurntToastNotification -Text "Claude Code", $message

# 方法二：使用 Windows 內建通知（不需安裝）
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
$template = [Windows.UI.Notifications.ToastTemplateType]::ToastText02
$xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($template)
$xml.GetElementsByTagName("text")[0].AppendChild($xml.CreateTextNode("Claude Code")) | Out-Null
$xml.GetElementsByTagName("text")[1].AppendChild($xml.CreateTextNode($message)) | Out-Null
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Claude Code").Show($toast)
```

> ⚠️ Windows 用戶注意：Claude Code 的 hook 預設執行 bash。如果你在 Windows 上使用 WSL，可以直接用 Linux 版本的腳本。如果是原生 Windows，需要額外設定讓 hook 執行 PowerShell。

### notify.sh（手機推播 - ntfy.sh）

```bash
#!/bin/bash

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code 需要你的注意"')

# 換成你自己的 topic 名稱
curl -s -d "$MESSAGE" ntfy.sh/my-claude-notify > /dev/null

exit 0
```

### 測試用環境快速設定

```bash
# 建立測試用 .nvmrc
echo "20" > .nvmrc

# 初始化 Git
git init

# 建立測試檔案（用於測試 Notification hook）
echo "test" > test.txt
```

### 常用指令

```bash
# 進入 hook 設定
/hooks

# 退出 Claude Code
Ctrl+C 或 /exit

# 除錯模式啟動
claude --debug

# 查看 hook 設定檔
cat ~/.claude/settings.json
```