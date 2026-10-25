#!/bin/sh
# Regenerates ../script.js from Control Panel for Twitter, at the commit in
# upstream-commit (pass another commit or "main" to move forward; the file is
# updated to whatever was used). The fixed settings live in the FOLD object at
# the top of prune.mjs. Reproducible: same commit + same lockfile = same output.
set -e
cd "$(dirname "$0")"
commit="${1:-$(cat upstream-commit)}"
[ -d node_modules ] || npm ci --silent
tmp=$(mktemp -d)
git clone -q https://github.com/insin/control-panel-for-twitter.git "$tmp/cpft"
git -C "$tmp/cpft" checkout -q "$commit"
python3 -I pre.py "$tmp/cpft/script.js" "$tmp/pre.js"
node prune.mjs "$tmp/pre.js" ../script.js
node --check ../script.js
git -C "$tmp/cpft" rev-parse HEAD > upstream-commit
rm -rf "$tmp"
echo "script.js gerado a partir de $(cut -c1-7 upstream-commit)"
