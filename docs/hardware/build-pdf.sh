#!/usr/bin/env bash
# Build PDF manuals from the markdown docs. Needs pandoc + playwright (chromium).
set -e
cd "$(dirname "$0")"; mkdir -p pdf
for f in 0*.md README.md SESSION-DIGEST.md; do
  n="${f%.md}"; pandoc "$f" -s --metadata title="LOT-P1 · $n" -c /dev/null -o "pdf/$n.html" \
    -V mainfont=sans-serif --self-contained 2>/dev/null || pandoc "$f" -s --metadata title="LOT-P1 · $n" -o "pdf/$n.html"
done
node -e '
const {chromium}=require("playwright");const fs=require("fs");
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const f of fs.readdirSync("pdf").filter(x=>x.endsWith(".html"))){
 await p.goto("file://"+process.cwd()+"/pdf/"+f);
 await p.addStyleTag({content:"body{font-family:Helvetica,Arial,sans-serif;max-width:900px;margin:auto;font-size:11px}table{border-collapse:collapse}td,th{border:1px solid #999;padding:3px 5px}code,pre{font-size:10px}"});
 await p.pdf({path:"pdf/"+f.replace(".html",".pdf"),format:"A4",margin:{top:"15mm",bottom:"15mm",left:"12mm",right:"12mm"}});}
await b.close();})()'
rm -f pdf/*.html
