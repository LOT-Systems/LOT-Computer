// Build docs/hardware/*.md (+ latest session report) → docs/hardware/pdf/*.pdf
// Needs: pandoc, Playwright with Chromium.   Usage: node hardware/tools/build-pdfs.mjs
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../docs/hardware')
const OUT = path.join(DIR, 'pdf')
fs.mkdirSync(OUT, { recursive: true })

const CSS = `body{font:10.5pt/1.45 "Helvetica Neue",Arial,sans-serif;color:#111;max-width:none;margin:0}
h1{font-size:17pt;letter-spacing:.02em;border-bottom:1.5px solid #111;padding-bottom:4px}
h2{font-size:12.5pt;margin-top:18px;text-transform:uppercase;letter-spacing:.06em}
table{border-collapse:collapse;width:100%;font-size:9pt;margin:8px 0}th,td{border:1px solid #bbb;padding:3px 5px;text-align:left;vertical-align:top}
th{background:#eee}code,pre{font:8.5pt Menlo,Consolas,monospace;background:#f4f4f4}pre{padding:8px;white-space:pre-wrap}
blockquote{border-left:3px solid #999;margin:8px 0;padding:2px 10px;color:#444}a{color:#111}`

const sessions = fs.readdirSync(path.join(DIR, 'sessions')).filter((f) => f.endsWith('.md')).sort()
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()
  .map((f) => path.join(DIR, f))
if (sessions.length) files.push(path.join(DIR, 'sessions', sessions.at(-1)))

const browser = await chromium.launch()
const page = await browser.newPage()
for (const f of files) {
  const body = execFileSync('pandoc', ['-f', 'gfm', '-t', 'html5', f], { encoding: 'utf8' })
  const name = path.basename(f, '.md')
  await page.setContent(`<!doctype html><meta charset="utf-8"><title>${name}</title><style>${CSS}</style>${body}`)
  await page.pdf({
    path: path.join(OUT, name + '.pdf'), format: 'A4', printBackground: true,
    margin: { top: '16mm', bottom: '16mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font:7pt Arial;width:100%;padding:0 15mm;display:flex;justify-content:space-between"><span>LOT PAGER · ${name}</span><span class="pageNumber"></span></div>`,
  })
  console.log('pdf', name)
}
await browser.close()
