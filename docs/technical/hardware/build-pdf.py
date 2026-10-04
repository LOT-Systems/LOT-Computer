#!/usr/bin/env python3
"""Render LOT-HW1 Markdown docs to one PDF via headless Chromium. Needs: pip install markdown."""
import glob, os, subprocess, tempfile, markdown
here = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(here, "LOT-HW1-0*.md")))
css = "body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;font-size:11pt;line-height:1.4}h1{border-bottom:3px solid #43aff3;padding-top:8px;page-break-before:always}h1:first-of-type{page-break-before:avoid}table{border-collapse:collapse;width:100%;font-size:9pt}td,th{border:1px solid #bbb;padding:3px 5px;vertical-align:top}th{background:#eef7fd}code,pre{background:#f4f4f4;font-size:9pt}pre{padding:6px;overflow:hidden;white-space:pre-wrap}blockquote{border-left:4px solid #fef17b;margin-left:0;padding-left:10px;color:#444}"
body = "".join(markdown.markdown(open(f).read(), extensions=["tables", "fenced_code"]) for f in files)
html = f"<html><head><meta charset='utf-8'><style>{css}</style></head><body>{body}</body></html>"
with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as t:
    t.write(html)
out = os.path.join(here, "LOT-HW1-ENGINEERING-PACK.pdf")
chrome = os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu", f"--print-to-pdf={out}", "--no-pdf-header-footer", "file://" + t.name], check=True)
print(out)
