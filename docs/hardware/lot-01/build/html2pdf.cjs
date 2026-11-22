// html → PDF via the preinstalled Playwright Chromium.
const { chromium } = require('playwright')
;(async () => {
  const [, , input, output] = process.argv
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('file://' + require('path').resolve(input), { waitUntil: 'load' })
  await page.pdf({ path: output, format: 'A5', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:7px;width:100%;text-align:center;color:#777">LOT·01 · <span class="pageNumber"></span>/<span class="totalPages"></span></div>' })
  await browser.close()
})()
