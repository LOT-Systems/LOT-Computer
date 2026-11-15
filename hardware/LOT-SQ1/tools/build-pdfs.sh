#!/usr/bin/env bash
# Rebuild manuals/*.pdf from docs/*.md  (pandoc → HTML → Chromium print via Playwright)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/manuals"; TMP="$(mktemp -d)"
mkdir -p "$OUT"
for md in "$ROOT"/docs/*.md; do
  name="LOT-SQ1-$(basename "$md" .md)"
  pandoc "$md" -f gfm -t html5 --standalone --metadata title="$name" \
    --css "$ROOT/tools/manual.css" --embed-resources -o "$TMP/$name.html"
done
node "$ROOT/tools/html-to-pdf.cjs" "$TMP" "$OUT"
rm -rf "$TMP"
