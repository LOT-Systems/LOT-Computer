#!/usr/bin/env bash
# Build PDF manuals from the numbered Markdown docs. Needs pandoc + chromium.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p pdf
CHROME="${CHROME:-$(ls /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | head -1)}"
css='body{font:11pt/1.45 -apple-system,Helvetica,Arial,sans-serif;max-width:780px;margin:24px auto;color:#111}table{border-collapse:collapse;width:100%;font-size:9.5pt}td,th{border:1px solid #bbb;padding:4px 6px;vertical-align:top}th{background:#eee}code,pre{background:#f3f3f3;font-size:9pt}pre{padding:8px;overflow:auto}h1{border-bottom:2px solid #111}'
for f in [0-9][0-9]-*.md README.md; do
  b="${f%.md}"
  pandoc "$f" -s --metadata title="LOT PAGER — $b" -c /dev/null -o "pdf/$b.html" -V "header-includes=<style>$css</style>"
  "$CHROME" --headless --no-sandbox --disable-gpu --print-to-pdf="pdf/$b.pdf" --no-pdf-header-footer "file://$PWD/pdf/$b.html" >/dev/null 2>&1
  rm "pdf/$b.html"
done
ls pdf
