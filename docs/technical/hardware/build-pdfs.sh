#!/usr/bin/env bash
# Build PDF manuals from the .md files. Needs pandoc + playwright chromium.
set -e
cd "$(dirname "$0")"; mkdir -p manuals; T=$(mktemp -d)
cat > "$T/s.css" <<'CSS'
body{font:11pt/1.45 "Courier New",monospace;color:#111;max-width:900px;margin:auto}
h1,h2{border-bottom:1px solid #111}table{border-collapse:collapse;width:100%;font-size:9pt}
td,th{border:1px solid #888;padding:3px 5px;vertical-align:top}pre{background:#f2f2f2;padding:6px;font-size:8.5pt;overflow:hidden}
CSS
mk(){ out=$1; shift; pandoc "$@" -s --metadata title="$out" -c "$T/s.css" --embed-resources -o "$T/$out.html"
  node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://$T/$out.html');await p.pdf({path:'manuals/$out.pdf',format:'A4',margin:{top:'15mm',bottom:'15mm',left:'12mm',right:'12mm'}});await b.close()})()"; }
mk LOT-PLATE-Operator-Manual 09-OPERATOR-MANUAL.md
mk LOT-PLATE-Builders-Manual 01-PLAN.md 02-BOM.md 03-ROADMAP.md 04-MECHANICAL-RF.md 05-ELECTRONICS.md 08-MANUFACTURING-100.md
mk LOT-PLATE-Firmware-Manual 06-FIRMWARE.md 07-LOT-API-CONNECTOR.md
ls -la manuals
