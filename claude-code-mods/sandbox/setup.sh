#!/bin/bash
# 建测试仓库：在 sandbox 里建一个 build/ 文件夹（3 个随机文件，约 588 KB），并存好第一个版本
# 用法：在 sandbox 文件夹里跑 bash setup.sh
set -e
cd "$(dirname "$0")"
mkdir -p build
for i in 1 2 3; do head -c 200000 /dev/urandom > "build/chunk$i.bin"; done
[ -d .git ] || git init -q
git add .
git commit -q -m init
echo "sandbox 已就绪："; ls build
