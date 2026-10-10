#!/usr/bin/env bash
# Rebuild the Qollab upload package from the repo sources. Run from anywhere:
#   bash tools/make_qollab_zip.sh
# 1) regenerates the self-contained qollab_js/main.js (3-pane paste file),
# 2) runs the Node logic/bundle tests and refuses to package on failure,
# 3) zips the flat 5-file project (well under Qollab's 100-file / 2MB-per-file
#    limits; ~9 KB today). Output: Isai-Qollab-Frontend.zip at the repo root.
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/build_qollab_main.mjs
node --test tests/qollab-node-tests.mjs
cd qollab_js
rm -f ../Isai-Qollab-Frontend.zip
zip -qX ../Isai-Qollab-Frontend.zip main.js index.html main.css README.md LICENSE
cd ..
unzip -l Isai-Qollab-Frontend.zip
echo "OK: upload Isai-Qollab-Frontend.zip via New Project > Upload your own files"
