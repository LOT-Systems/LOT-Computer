// Print every HTML file in argv[2] to PDF in argv[3] with a LOT header/footer.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
;(async () => {
  const [src, out] = process.argv.slice(2)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  for (const f of fs.readdirSync(src).filter((f) => f.endsWith('.html')).sort()) {
    await page.goto('file://' + path.join(src, f))
    const pdf = path.join(out, f.replace(/\.html$/, '.pdf'))
    await page.pdf({
      path: pdf, format: 'A4', printBackground: true,
      margin: { top: '18mm', bottom: '16mm', left: '16mm', right: '16mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font:8px Helvetica;width:100%;padding:0 16mm;display:flex;justify-content:space-between;color:#888"><span>LOT SYSTEMS · SQ-1</span><span>${f.replace('.html', '')}</span></div>`,
      footerTemplate: `<div style="font:8px Helvetica;width:100%;padding:0 16mm;display:flex;justify-content:space-between;color:#888"><span>COSMO® · brand.lot-systems.com</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
    })
    console.log('PDF', pdf)
  }
  await browser.close()
})()
