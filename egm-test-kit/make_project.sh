#!/bin/bash
# Creates the demo to-do project used in the video.
# Usage: bash make_project.sh ~/egm-demo
set -e
DEST="${1:?give a folder, e.g. ~/egm-demo}"
HERE="$(cd "$(dirname "$0")" && pwd)"
if [ -e "$DEST" ]; then echo "$DEST already exists. Pick a new folder name."; exit 1; fi
mkdir -p "$DEST"
cp -R "$HERE/project-files/." "$DEST/"
cd "$DEST"
git init -q
git add -A
git -c user.name=Demo -c user.email=demo@example.invalid commit -qm "Initial todo app"
echo "Created $DEST"
find . -path ./.git -prune -o -type f -print | sort
