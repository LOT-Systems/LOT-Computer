#!/usr/bin/env python3
"""Render hardware/lot-tile/docs/*.md into manuals/*.pdf (requirement 7: PDF manuals).

Pipeline: pandoc (Markdown -> standalone HTML, LOT print CSS) -> Chromium via Playwright (HTML -> A4 PDF).
Also writes manuals/LOT-TILE-Complete.pdf containing every document in order.
Usage: python3 tools/build_pdfs.py
"""
import json
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUT = ROOT / "manuals"

CSS = """
@page { size: A4; margin: 18mm 16mm 20mm 16mm; }
body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.45; color: #111; background: #fff; }
h1 { font-size: 18pt; font-weight: 400; letter-spacing: .02em; border-bottom: 1px solid #111; padding-bottom: 4pt; }
h2 { font-size: 12.5pt; font-weight: 400; margin-top: 18pt; text-transform: uppercase; letter-spacing: .06em; }
h3 { font-size: 11pt; font-weight: 400; }
table { border-collapse: collapse; width: 100%; font-size: 8.5pt; margin: 6pt 0 10pt; page-break-inside: auto; }
th, td { border-top: 0.5pt solid #999; padding: 3pt 4pt; vertical-align: top; text-align: left; }
th { font-weight: 400; color: #555; border-top: 1pt solid #111; }
tr { page-break-inside: avoid; }
code { font-family: Menlo, Consolas, monospace; font-size: 8.5pt; }
pre { font-family: Menlo, Consolas, monospace; font-size: 7.5pt; line-height: 1.25; background: #f4f4f4;
      padding: 6pt; white-space: pre; overflow: hidden; page-break-inside: avoid; }
blockquote { margin: 6pt 0; padding-left: 8pt; border-left: 2pt solid #999; color: #444; }
a { color: #111; }
.lot-foot { margin-top: 24pt; font-size: 7.5pt; color: #777; border-top: 0.5pt solid #ccc; padding-top: 4pt; }
"""

FOOT = '<div class="lot-foot">LOT® TILE · LOT-HW-01 · LOT Systems / COSMO® CIA · lot-systems.com</div>'


def md_to_html(md_files, title):
    with tempfile.NamedTemporaryFile("w", suffix=".css", delete=False) as css:
        css.write(CSS)
    html = subprocess.run(
        ["pandoc", *map(str, md_files), "-f", "gfm", "-t", "html5", "--standalone",
         "--metadata", f"title={title}", "--css", css.name, "--embed-resources"],
        check=True, capture_output=True, text=True).stdout
    # pandoc's standalone template adds a <header> title block; GFM docs carry their own H1.
    html = html.replace('<header id="title-block-header">', '<header id="title-block-header" style="display:none">')
    return html.replace("</body>", FOOT + "</body>")


def main():
    OUT.mkdir(exist_ok=True)
    files = sorted(DOCS.glob("[0-9][0-9]-*.md"))
    jobs = []
    tmp = pathlib.Path(tempfile.mkdtemp())
    for f in files:
        h = tmp / (f.stem + ".html")
        h.write_text(md_to_html([f], f.stem), encoding="utf-8")
        jobs.append([str(h), str(OUT / f"LOT-TILE-{f.stem}.pdf")])
    h = tmp / "complete.html"
    h.write_text(md_to_html([ROOT / "README.md", *files], "LOT TILE Complete"), encoding="utf-8")
    jobs.append([str(h), str(OUT / "LOT-TILE-Complete.pdf")])

    js = """
const { chromium } = require('playwright');
(async () => {
  const jobs = JSON.parse(process.argv[1]);
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [src, dst] of jobs) {
    await p.goto('file://' + src);
    await p.pdf({ path: dst, format: 'A4', printBackground: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="font-size:7pt;width:100%;text-align:center;color:#777"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' } });
    console.log('wrote', dst);
  }
  await b.close();
})();
"""
    subprocess.run(["node", "-e", js, json.dumps(jobs)], check=True)


if __name__ == "__main__":
    sys.exit(main())
