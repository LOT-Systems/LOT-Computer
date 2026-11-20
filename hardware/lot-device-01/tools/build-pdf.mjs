#!/usr/bin/env node
// Render every LOT-DEVICE-01 doc in docs/hardware/ to PDF in hardware/lot-device-01/pdf/
// Requires: pandoc (md → html) and playwright/chromium (html → pdf).
//   node hardware/lot-device-01/tools/build-pdf.mjs
import { execFileSync } from 'node:child_process'
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { createRequire } from 'node:module'

const root = process.cwd()
const src = join(root, 'docs/hardware')
const out = join(root, 'hardware/lot-device-01/pdf')
mkdirSync(out, { recursive: true })

const css = `
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #111; }
  h1 { font-size: 18pt; font-weight: 600; letter-spacing: .02em; border-bottom: 1px solid #111; padding-bottom: 6px; }
  h2 { font-size: 13pt; margin-top: 22px; } h3 { font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 9pt; }
  th, td { border: 1px solid #bbb; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #f2f2f2; }
  pre { background: #f6f6f6; padding: 8px; font-size: 8pt; white-space: pre; overflow: hidden; }
  code { font-size: 9pt; } blockquote { color: #555; border-left: 3px solid #ccc; margin: 0; padding-left: 10px; }
  .foot { margin-top: 28px; font-size: 8pt; color: #777; border-top: 1px solid #ddd; padding-top: 6px; }
`

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const browser = await chromium.launch()
const page = await browser.newPage()

const files = readdirSync(src).filter((f) => /^LOT-DEVICE-01-.*\.md$/.test(f)).sort()
for (const f of files) {
  const body = execFileSync('pandoc', [join(src, f), '-f', 'gfm', '-t', 'html'], { encoding: 'utf8' })
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}
    <div class="foot">LOT Systems · COSMO® · LOT-DEVICE-01 · ${basename(f, '.md')} · generated ${new Date().toISOString().slice(0, 10)}</div></body></html>`
  await page.setContent(html, { waitUntil: 'load' })
  const pdf = join(out, basename(f, '.md') + '.pdf')
  await page.pdf({ path: pdf, format: 'A4', printBackground: true })
  console.log('✓', pdf.replace(root + '/', ''))
}
await browser.close()
writeFileSync(join(out, 'README.md'), `# LOT-DEVICE-01 PDF manuals\n\nGenerated from docs/hardware/*.md by tools/build-pdf.mjs.\n\n${files.map((f) => `- ${basename(f, '.md')}.pdf`).join('\n')}\n`)
