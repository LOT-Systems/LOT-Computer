#!/usr/bin/env node
// Render docs/hardware/*.md → docs/hardware/pdf/*.pdf (pandoc → HTML → Chromium print)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const dir = path.resolve('docs/hardware'), out = path.join(dir, 'pdf')
fs.mkdirSync(out, { recursive: true })
const css = `body{font-family:"Helvetica Neue",Arial,sans-serif;font-size:10pt;color:#111;max-width:none;margin:0}
pre,code{font-family:"DejaVu Sans Mono",Menlo,monospace;font-size:7.6pt}pre{background:#f4f4f2;padding:8px;border:1px solid #ddd;white-space:pre;overflow:hidden}
table{border-collapse:collapse;width:100%;font-size:8pt;margin:8px 0}th,td{border:1px solid #ccc;padding:3px 5px;vertical-align:top;text-align:left}th{background:#eee}
h1,h2,h3{font-weight:600;letter-spacing:.02em}h2{border-bottom:1px solid #111;padding-bottom:2px;margin-top:18px}a{color:#111}`
const files = fs.readdirSync(dir).filter((f) => /^LOT-01-.*\.md$/.test(f)).sort()
const browser = await chromium.launch()
const page = await browser.newPage()
for (const f of files) {
  const html = execFileSync('pandoc', [path.join(dir, f), '-f', 'gfm', '-t', 'html5', '-s', '--metadata', `title=${f.replace('.md', '')}`])
    .toString().replace('</head>', `<style>${css}</style></head>`).replace(/<header[\s\S]*?<\/header>/, '')
  await page.setContent(html, { waitUntil: 'load' })
  const pdf = path.join(out, f.replace(/\.md$/, '.pdf'))
  await page.pdf({ path: pdf, format: 'A4', margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' }, printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font-size:7pt;width:100%;text-align:center;color:#666">LOT SYSTEMS · ${f.replace('.md', '')} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>` })
  console.log('PDF', path.relative(process.cwd(), pdf))
}
await browser.close()
