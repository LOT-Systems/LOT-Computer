// Render every .html in argv[2] to PDF in argv[3] with Playwright Chromium.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
;(async () => {
  const [src, out] = process.argv.slice(2)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  for (const f of fs.readdirSync(src).filter((f) => f.endsWith('.html')).sort()) {
    await page.goto('file://' + path.join(src, f))
    await page.pdf({
      path: path.join(out, f.replace(/\.html$/, '.pdf')),
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size:7px;width:100%;padding:0 14mm;color:#777">LOT SYSTEMS · LOT-HW-01 TILE · INTERNAL / BUILD</div>',
      footerTemplate: '<div style="font-size:7px;width:100%;padding:0 14mm;color:#777;text-align:right">ISSUE 2026.11.25 · <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
      margin: { top: '16mm', bottom: '14mm', left: '14mm', right: '14mm' },
    })
    console.log('pdf', f)
  }
  await browser.close()
})()
