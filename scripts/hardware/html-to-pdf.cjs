// Render one HTML file to an A4 PDF with Chromium (Playwright).
const { chromium } = require('playwright')
const path = require('path')
;(async () => {
  const [src, dest] = process.argv.slice(2)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('file://' + path.resolve(src))
  await page.pdf({
    path: dest, format: 'A4', printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:7px;width:100%;text-align:right;padding-right:16mm;color:#888">LOT SYSTEMS · LOT Pager LOT-HW-01</div>',
    footerTemplate: '<div style="font-size:7px;width:100%;text-align:center;color:#888"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  })
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
