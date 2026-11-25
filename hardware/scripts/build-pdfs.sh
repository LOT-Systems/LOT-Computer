#!/usr/bin/env bash
# Build PDF manuals from hardware/docs/*.md → hardware/manuals/*.pdf
# Requires: pandoc, node, and Playwright with Chromium (pre-installed in the LOT build container).
set -euo pipefail
HW="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HW/manuals"; TMP="$(mktemp -d)"
mkdir -p "$OUT"
for md in "$HW"/docs/*.md; do
  name="$(basename "$md" .md)"
  pandoc "$md" -f gfm -t html5 --standalone --metadata title="LOT-HW-01 TILE · $name" \
    --css "$HW/scripts/pdf.css" --embed-resources -o "$TMP/$name.html" 2>/dev/null \
  || pandoc "$md" -f gfm -t html5 --standalone --metadata title="LOT-HW-01 TILE · $name" \
    -H <(printf '<style>%s</style>' "$(cat "$HW/scripts/pdf.css")") -o "$TMP/$name.html"
done
# combined
pandoc "$HW/README.md" "$HW"/docs/*.md -f gfm -t html5 --standalone \
  --metadata title="LOT-HW-01 TILE · Complete design package" \
  -H <(printf '<style>%s h1{page-break-before:always}</style>' "$(cat "$HW/scripts/pdf.css")") \
  -o "$TMP/LOT-HW-01-TILE-COMPLETE.html"
node "$HW/scripts/html2pdf.cjs" "$TMP" "$OUT"
rm -rf "$TMP"
ls -la "$OUT"
