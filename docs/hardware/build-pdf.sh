#!/usr/bin/env bash
# Build PDF manuals from docs/hardware/*.md (pandoc -> HTML -> headless Chromium).
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-$(command -v chromium chromium-browser google-chrome 2>/dev/null | head -1 || true)}"
[ -z "$CHROME" ] && CHROME="$(ls /opt/pw-browsers/chromium-*/*/chrome 2>/dev/null | head -1)"
mkdir -p pdf
for f in 0*.md; do
  b="${f%.md}"
  pandoc "$f" -s --metadata title="LOT HW-001 — $b" -c ../style.css -o "pdf/$b.html"
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="pdf/$b.pdf" "file://$PWD/pdf/$b.html" >/dev/null 2>&1
  rm "pdf/$b.html"
done
ls pdf
