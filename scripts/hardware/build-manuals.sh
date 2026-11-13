#!/usr/bin/env bash
# Build PDF manuals from docs/hardware/*.md
# Needs: pandoc, node + playwright (chromium). Usage: scripts/hardware/build-manuals.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/docs/hardware"
OUT="$SRC/pdf"
mkdir -p "$OUT"
CSS="$ROOT/scripts/hardware/manual.css"
for md in "$SRC"/0*.md; do
  name="$(basename "$md" .md)"
  html="$OUT/$name.html"
  pandoc "$md" -f gfm -t html5 -s --metadata title="LOT Pager — $name" --css "$CSS" --embed-resources -o "$html"
  node "$ROOT/scripts/hardware/html-to-pdf.cjs" "$html" "$OUT/LOT-Pager-$name.pdf"
  rm -f "$html"
  echo "built $OUT/LOT-Pager-$name.pdf"
done
