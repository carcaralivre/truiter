#!/bin/sh
# Packs the source archive AMO asks for alongside a listed submission (script.js
# is generated code): everything needed to rebuild it, without node_modules.
set -e
cd "$(dirname "$0")/.."
version=$(python3 -c "import json;print(json.load(open('manifest.json'))['version'])")
out="web-ext-artifacts/truiter-$version-fontes.zip"
mkdir -p web-ext-artifacts
rm -f "$out"
zip -qr "$out" . -x "web-ext-artifacts/*" "tools/node_modules/*" "loja/*" ".git/*" ".DS_Store" "*/.DS_Store" ".amo-upload-uuid"
echo "$out"
