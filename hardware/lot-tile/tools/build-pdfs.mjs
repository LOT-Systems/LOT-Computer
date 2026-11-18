#!/usr/bin/env node
// Renders hardware/lot-tile/docs/*.md → hardware/lot-tile/pdf/*.pdf (pandoc → HTML → Chromium PDF).
// Requires: pandoc on PATH, playwright with Chromium.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docs = join(root, 'docs'), out = join(root, 'pdf')
mkdirSync(out, { recursive: true })

const css = `
  @page { size: A4; margin: 18mm 16mm 20mm; }
  body { font: 10.5pt/1.5 "Helvetica Neue", Helvetica, Arial, sans-serif; color: #111; }
  h1 { font-size: 20pt; border-bottom: 2px solid #111; padding-bottom: 6px; letter-spacing: .02em; }
  h2 { font-size: 13.5pt; margin-top: 22px; } h3 { font-size: 11.5pt; }
  table { border-collapse: collapse; width: 100%; font-size: 8.8pt; margin: 8px 0 14px; page-break-inside: auto; }
  th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #f1f1f1; } tr { page-break-inside: avoid; }
  pre { background: #f6f6f6; border: 1px solid #ddd; padding: 8px; font-size: 7.6pt; line-height: 1.25;
        white-space: pre; overflow: hidden; page-break-inside: avoid; }
  code { font-family: Menlo, Consolas, "DejaVu Sans Mono", monospace; font-size: 8.6pt; }
  blockquote { border-left: 3px solid #111; margin: 8px 0; padding: 2px 10px; color: #333; }
  a { color: #111; }
`
const header = `<div style="font-size:7pt;width:100%;padding:0 16mm;color:#666;display:flex;justify-content:space-between">
  <span>LOT TILE · P1 · LOT Systems · COSMO® CIA</span><span class="title"></span></div>`
const footer = `<div style="font-size:7pt;width:100%;padding:0 16mm;color:#666;display:flex;justify-content:space-between">
  <span>lot-systems.com</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`

const browser = await chromium.launch()
const page = await browser.newPage()
const files = readdirSync(docs).filter((f) => f.endsWith('.md')).sort()
const all = []
for (const f of files) {
  const md = readFileSync(join(docs, f), 'utf8')
  all.push(md)
  const body = execFileSync('pandoc', ['-f', 'gfm', '-t', 'html5'], { input: md }).toString()
  const title = (md.match(/^# (.+)$/m) || [, basename(f, '.md')])[1]
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`)
  await page.pdf({ path: join(out, f.replace(/\.md$/, '.pdf')), format: 'A4', displayHeaderFooter: true,
    headerTemplate: header, footerTemplate: footer, margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' } })
  console.log('✔', f.replace(/\.md$/, '.pdf'))
}
// Combined binder
const bodyAll = execFileSync('pandoc', ['-f', 'gfm', '-t', 'html5'], { input: all.join('\n\n<div style="page-break-after:always"></div>\n\n') }).toString()
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${bodyAll}</body></html>`)
await page.pdf({ path: join(out, 'LOT-TILE-P1-COMPLETE.pdf'), format: 'A4', displayHeaderFooter: true,
  headerTemplate: header, footerTemplate: footer, margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' } })
console.log('✔ LOT-TILE-P1-COMPLETE.pdf')
await browser.close()
