#!/usr/bin/env node
// Builds hardware/docs/*.md → hardware/manuals/*.pdf (one PDF per document) + a combined manual.
// Needs: pandoc on PATH, playwright with Chromium.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
// CommonJS require so a globally installed playwright (NODE_PATH) also resolves
const { chromium } = createRequire(import.meta.url)('playwright')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = path.join(root, 'docs')
const outDir = path.join(root, 'manuals')
fs.mkdirSync(outDir, { recursive: true })

const css = `
  @page { size: A4; margin: 18mm 16mm 20mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #111; }
  h1 { font-size: 20pt; font-weight: normal; border-bottom: 1px solid #111; padding-bottom: 6px; }
  h2 { font-size: 13pt; font-weight: normal; margin-top: 22px; }
  h3 { font-size: 11pt; font-weight: normal; opacity: .8; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9pt; page-break-inside: auto; }
  th, td { border-bottom: 1px solid #ccc; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { border-bottom: 1px solid #111; font-weight: normal; opacity: .7; }
  pre, code { font-family: Menlo, Consolas, monospace; font-size: 8.5pt; }
  pre { background: #f4f4f4; padding: 8px; white-space: pre-wrap; page-break-inside: avoid; }
  blockquote { border-left: 2px solid #111; margin: 10px 0; padding: 2px 10px; opacity: .85; }
  a { color: #111; }
  .lot-head { font-size: 8pt; opacity: .6; letter-spacing: .08em; margin-bottom: 18px; }
`
const files = fs.readdirSync(docsDir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()
const browser = await chromium.launch()
const page = await browser.newPage()
const combined = []

for (const f of files) {
  const md = path.join(docsDir, f)
  const body = execFileSync('pandoc', [md, '-f', 'gfm', '-t', 'html5'], { encoding: 'utf8' })
  combined.push(body)
  const html = `<!doctype html><meta charset="utf-8"><style>${css}</style>
    <div class="lot-head">LOT SYSTEMS · LOT PAGER L-01 · ${f.replace('.md', '')}</div>${body}`
  await page.setContent(html, { waitUntil: 'load' })
  const pdf = path.join(outDir, f.replace(/\.md$/, '.pdf'))
  await page.pdf({
    path: pdf, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:7pt;width:100%;text-align:center;opacity:.6">LOT Pager L-01 · <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
  })
  console.log('pdf', path.relative(root, pdf))
}

const all = `<!doctype html><meta charset="utf-8"><style>${css} .br{page-break-before:always}</style>
  <div class="lot-head">LOT SYSTEMS · LOT PAGER L-01 · COMPLETE MANUAL</div>
  ${combined.map((b, i) => (i ? `<div class="br"></div>${b}` : b)).join('')}`
await page.setContent(all, { waitUntil: 'load' })
await page.pdf({ path: path.join(outDir, 'L01-COMPLETE-MANUAL.pdf'), format: 'A4', printBackground: true })
console.log('pdf manuals/L01-COMPLETE-MANUAL.pdf')
await browser.close()
