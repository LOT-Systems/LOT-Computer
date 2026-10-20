#!/usr/bin/env bash
# Builds docs/hardware/LOT-Computer-Manuals.pdf from 01..06 (needs pandoc + chromium)
set -euo pipefail
cd "$(dirname "$0")"
pandoc 0[1-6]-*.md -f gfm -s --metadata title="LOT Computer — Hardware Manuals" \
  -c /dev/null -o /tmp/lot-hw.html 2>/dev/null || pandoc 0[1-6]-*.md -f gfm -s --metadata title="LOT Computer — Hardware Manuals" -o /tmp/lot-hw.html
CHROME=${CHROME:-$(ls /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | head -1)}
"$CHROME" --headless --no-sandbox --disable-gpu --print-to-pdf=LOT-Computer-Manuals.pdf --no-pdf-header-footer /tmp/lot-hw.html
