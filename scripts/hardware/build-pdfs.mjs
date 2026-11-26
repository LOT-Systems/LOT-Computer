#!/usr/bin/env node
// Render docs/hardware/lot-pager/*.md → pdf/*.pdf  (pandoc → HTML → Chromium print)
// Usage: node scripts/hardware/build-pdfs.mjs
import { execFileSync } from 'node:child_process'
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')

const dir = resolve('docs/hardware/lot-pager')
const out = join(dir, 'pdf')
mkdirSync(out, { recursive: true })
const css = `
  @page { size: A4; margin: 16mm 14mm 18mm 14mm; }
  body { font: 10.5pt/1.45 Arial, Helvetica, sans-serif; color: #111; background: #fff; }
  h1 { font-size: 17pt; font-weight: normal; border-bottom: 1px solid #111; padding-bottom: 6px; letter-spacing: .02em; }
  h2 { font-size: 12.5pt; font-weight: normal; margin-top: 20px; border-bottom: 1px solid #bbb; }
  h3 { font-size: 11pt; font-weight: normal; text-decoration: underline; }
  code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.4pt; }
  pre, pre code { font-family: "DejaVu Sans Mono", monospace; font-size: 6.8pt; }
  pre { background: #f4f4f2; border: 1px solid #ddd; padding: 8px; white-space: pre !important; overflow: hidden; line-height: 1.2; }
  pre code { white-space: pre !important; }
  table { border-collapse: collapse; width: 100%; font-size: 8.6pt; margin: 8px 0; }
  th, td { border: 1px solid #ccc; padding: 3px 5px; vertical-align: top; text-align: left; }
  th { background: #eee; font-weight: normal; }
  blockquote { border-left: 2px solid #111; margin-left: 0; padding-left: 10px; color: #333; }
  a { color: #111; }
`
const files = readdirSync(dir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()
const browser = await chromium.launch()
const page = await browser.newPage()
for (const f of files) {
  const html = execFileSync('pandoc', [join(dir, f), '-f', 'gfm', '-t', 'html5', '-s',
    '--metadata', `title=${f.replace('.md', '')}`, '--metadata', 'pagetitle=LOT PAGER'], { encoding: 'utf8' })
    .replace('</head>', `<style>${css} header#title-block-header{display:none}</style></head>`)
  await page.setContent(html, { waitUntil: 'load' })
  const pdf = join(out, f.replace('.md', '.pdf'))
  await page.pdf({ path: pdf, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="font:7pt Arial;width:100%;padding:0 14mm;color:#555;display:flex;justify-content:space-between"><span>LOT SYSTEMS CORPORATION · LOT PAGER TILE-40 · ${f.replace('.md','')}</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' } })
  console.log('PDF', pdf)
}
await browser.close()
