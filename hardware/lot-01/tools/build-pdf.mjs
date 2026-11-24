#!/usr/bin/env node
/**
 * LOT-01 — build PDF manuals from hardware/lot-01/docs/*.md → hardware/lot-01/pdf/*.pdf
 * Requires: pandoc on PATH, Playwright + Chromium.
 *   node hardware/lot-01/tools/build-pdf.mjs
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, writeFileSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = join(root, 'docs')
const outDir = join(root, 'pdf')
mkdirSync(outDir, { recursive: true })

const css = `
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 10pt; line-height: 1.45; }
header#title-block-header { border-bottom: 2px solid #111; margin-bottom: 14pt; padding-bottom: 8pt; }
header .title { font-size: 20pt; margin: 0; letter-spacing: -0.01em; }
header .subtitle { margin: 4pt 0 0; color: #555; font-size: 10pt; }
h1:not(.title) { display: none; }
h2 { font-size: 13pt; margin: 18pt 0 6pt; padding-top: 4pt; border-top: 1px solid #ddd; }
h3 { font-size: 11pt; margin: 12pt 0 4pt; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 8.4pt; page-break-inside: auto; }
th, td { border: 1px solid #ccc; padding: 3pt 5pt; vertical-align: top; text-align: left; }
th { background: #f2f2f2; }
tr { page-break-inside: avoid; }
pre { background: #f6f6f6; border: 1px solid #e2e2e2; padding: 7pt; font-size: 7.6pt; line-height: 1.25;
      white-space: pre; overflow: hidden; page-break-inside: avoid; }
pre > code, pre code { white-space: pre !important; }
code { font-family: Menlo, Consolas, 'DejaVu Sans Mono', monospace; font-size: 8.4pt; }
blockquote { margin: 8pt 0; padding: 6pt 10pt; border-left: 3px solid #111; background: #fafafa; }
a { color: #111; }
`

const files = readdirSync(docsDir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()
const tmp = mkdtempSync(join(tmpdir(), 'lot01-pdf-'))
writeFileSync(join(tmp, 'style.css'), css)

const browser = await chromium.launch()
const page = await browser.newPage()
const built = []
for (const f of files) {
  const html = join(tmp, f.replace(/\.md$/, '.html'))
  execFileSync('pandoc', [join(docsDir, f), '-s', '--from', 'gfm+yaml_metadata_block', '--metadata', 'lang=en',
    '--css', 'style.css', '--embed-resources', '-o', html], { cwd: tmp })
  await page.goto('file://' + html)
  const pdf = join(outDir, basename(f, '.md') + '.pdf')
  await page.pdf({
    path: pdf, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="font:7pt Arial;color:#777;width:100%;padding:0 16mm;display:flex;justify-content:space-between">
      <span>LOT-01 SQUARE · ${basename(f, '.md')} · LOT Systems</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
    margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' },
  })
  built.push(pdf)
  console.log('built', pdf.replace(root + '/', ''))
}
await browser.close()
rmSync(tmp, { recursive: true, force: true })
console.log(`${built.length} PDFs`)
