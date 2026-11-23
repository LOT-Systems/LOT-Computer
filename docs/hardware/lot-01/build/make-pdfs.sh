#!/usr/bin/env bash
# Build LOT·01 PDF manuals from the Markdown sources. Needs pandoc + Node with playwright.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=pdf; TMP=$(mktemp -d)
build() { # name title files...
  local name=$1 title=$2; shift 2
  { echo "<div class=\"cover\"><div class=\"sq\"></div><div class=\"t\">LOT·01</div><p><b>$title</b><br>Rev B · $(date +%Y-%m-%d)<br>LOT Systems · COSMO® CIA</p></div>"
    for f in "$@"; do pandoc -f gfm -t html "$f"; done; } > "$TMP/$name.body.html"
  pandoc -s -f html -t html -c "file://$PWD/build/manual.css" \
    --variable pagetitle="LOT·01 $title" "$TMP/$name.body.html" -o "$TMP/$name.html"
  node build/html2pdf.cjs "$TMP/$name.html" "$OUT/$name.pdf"
  echo "  → $OUT/$name.pdf"
}
build LOT-01_User-Manual            "User Manual"                    09-USER-MANUAL.md 08-CHARGER.md
build LOT-01_Firmware-Manual        "Firmware Manual"                06-FIRMWARE.md 05-PCB-PCBWAY.md
build LOT-01_LOT-API-Connector      "LOT API Connector Manual"       07-LOT-API-CONNECTOR.md
build LOT-01_Manufacturing-Manual   "Manufacturing & Assembly"       04-ENCLOSURE.md 05-PCB-PCBWAY.md 10-MANUFACTURING-100.md
build LOT-01_Plan-BOM-Roadmap       "Plan, Buying List & Roadmap"    01-PLAN.md 02-BOM.md 11-P1-BENCH-ORDER.md 03-ROADMAP.md
rm -rf "$TMP"
