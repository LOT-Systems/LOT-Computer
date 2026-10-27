#!/usr/bin/env bash
# Builds PDF manuals from the markdown docs (pandoc + Playwright chromium)
set -euo pipefail
cd "$(dirname "$0")"; mkdir -p pdf
for f in 0*.md; do
  pandoc "$f" -s --metadata title="LOT Pager — ${f%.md}" -c ../hardware/pdf/style.css -o "pdf/${f%.md}.html"
done
node -e '
const {chromium}=require("playwright");const fs=require("fs");
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const f of fs.readdirSync("pdf").filter(x=>x.endsWith(".html"))){
 await p.goto("file://"+process.cwd()+"/pdf/"+f);
 await p.pdf({path:"pdf/"+f.replace(".html",".pdf"),format:"A4",margin:{top:"18mm",bottom:"18mm",left:"16mm",right:"16mm"}});}
await b.close();})()'
rm -f pdf/*.html
