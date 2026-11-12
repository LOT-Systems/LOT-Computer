#!/usr/bin/env bash
# LOT® Widget Health harness — mounts every widget (and the full System tab)
# in headless Chromium with mocked /api/* responses. Reports crashes,
# render loops, hook-order violations and click→paint latency.
# Usage: bash scripts/tests/widget-health/run.sh [outdir]
set -euo pipefail
cd "$(dirname "$0")/../../.."
OUT="${1:-$(mktemp -d)}"; mkdir -p "$OUT/w" "$OUT/s"
B="node_modules/.bin/esbuild --bundle --format=esm --alias:#client=./src/client --alias:#shared=./src/shared \
  --define:process.env.APP_HOST=\"\" --define:process.env.APP_NAME=\"\" --define:process.env.APP_DESCRIPTION=\"\" \
  --define:process.env.APP_VERSION=\"0\" --loader:.svg=dataurl --loader:.png=dataurl --log-level=error"
HTML='<!doctype html><html><head><link rel="stylesheet" href="index.css"></head><body><div id="root"></div><script type="module" src="entry.js"></script></body></html>'
NODE_PATH=$PWD/node_modules $B scripts/tests/widget-health/widgets.entry.tsx --outfile="$OUT/w/entry.js" --define:process.env.NODE_ENV=\"development\"
NODE_PATH=$PWD/node_modules $B scripts/tests/widget-health/system.entry.tsx --outfile="$OUT/s/entry.js" --define:process.env.NODE_ENV=\"production\" --minify
for d in w s; do echo "$HTML" > "$OUT/$d/index.html"; cp dist/client/css/index.css "$OUT/$d/" 2>/dev/null || true; done
node scripts/tests/widget-health/run-widgets.cjs "$OUT/w" > "$OUT/widgets.json"
node scripts/tests/widget-health/run-system.cjs "$OUT/s" > "$OUT/system.json"
python3 scripts/tests/widget-health/scan.py > "$OUT/static.txt"
echo "Results in $OUT (widgets.json, system.json, static.txt)"
