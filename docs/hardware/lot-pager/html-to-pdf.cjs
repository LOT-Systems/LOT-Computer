// Render every HTML file in <in> to an A4 PDF in <out> with the preinstalled Playwright Chromium.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
;(async () => {
  const [inDir, outDir] = process.argv.slice(2)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  for (const f of fs.readdirSync(inDir).filter((f) => f.endsWith('.html')).sort()) {
    await page.goto('file://' + path.join(inDir, f))
    const out = path.join(outDir, f.replace(/\.html$/, '.pdf'))
    await page.pdf({
      path: out, format: 'A4', printBackground: true,
      margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
      displayHeaderFooter: true,
      headerTemplate: '<div style="font:8px monospace;width:100%;padding:0 16mm;color:#888">LOT SYSTEMS · LOT PAGER · HW-01</div>',
      footerTemplate: '<div style="font:8px monospace;width:100%;padding:0 16mm;color:#888;text-align:right"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    })
    console.log('pdf', out)
  }
  await browser.close()
})()
