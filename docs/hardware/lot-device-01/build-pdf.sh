#!/usr/bin/env bash
# Build one PDF per document + a full manual. Needs pandoc + Playwright Chromium.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/pdf"; TMP="$(mktemp -d)"; mkdir -p "$OUT"
CSS='body{font-family:"Helvetica Neue",Arial,sans-serif;font-size:10.5pt;line-height:1.45;color:#111;max-width:none;margin:0}
h1{font-size:18pt;border-bottom:1px solid #111;padding-bottom:4pt}h2{font-size:13pt;margin-top:16pt}h3{font-size:11pt}
table{border-collapse:collapse;width:100%;font-size:8.5pt;margin:6pt 0}th,td{border:1px solid #bbb;padding:3pt 5pt;vertical-align:top;text-align:left}
th{background:#eee}pre,code{font-family:Menlo,Consolas,monospace;font-size:8pt}pre{background:#f4f4f4;padding:6pt;white-space:pre-wrap}
blockquote{border-left:3px solid #888;margin:6pt 0;padding-left:8pt;color:#333}a{color:#111}
.foot{margin-top:24pt;font-size:7.5pt;color:#666;border-top:1px solid #ccc;padding-top:4pt}'
DOCS=(01-PLAN 02-BOM 03-MECHANICAL 04-PCB-PCBWAY 05-FIRMWARE 06-SOFTWARE-CONNECTOR 07-CHARGER 08-ROADMAP 09-USER-MANUAL)
wrap(){ printf '<!doctype html><meta charset="utf-8"><title>%s</title><style>%s</style>' "$1" "$CSS"; cat; printf '<div class="foot">LOT SYSTEMS · LOT DEVICE-01 SQUARE · %s · brand.lot-systems.com</div>' "$1"; }
for d in "${DOCS[@]}"; do pandoc -f gfm -t html "$HERE/$d.md" | wrap "$d" > "$TMP/$d.html"; done
{ for d in 00-README "${DOCS[@]}"; do pandoc -f gfm -t html "$HERE/$d.md"; echo '<div style="page-break-after:always"></div>'; done; } | wrap "LOT-DEVICE-01 FULL MANUAL" > "$TMP/LOT-DEVICE-01-FULL-MANUAL.html"
node -e '
const {chromium}=require("playwright");const fs=require("fs"),path=require("path");
(async()=>{const [tmp,out]=process.argv.slice(1);const b=await chromium.launch();const p=await b.newPage();
for(const f of fs.readdirSync(tmp).filter(f=>f.endsWith(".html"))){await p.goto("file://"+path.join(tmp,f));
await p.pdf({path:path.join(out,f.replace(/\.html$/,".pdf")),format:"A4",margin:{top:"16mm",bottom:"16mm",left:"14mm",right:"14mm"},printBackground:true});console.log("pdf",f)}
await b.close()})()' "$TMP" "$OUT"
rm -rf "$TMP"
