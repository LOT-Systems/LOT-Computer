#!/usr/bin/env node
// LOT widget health scan — static inventory of every *Widget component.
// Usage: node scripts/health/widget-scan.mjs > inventory.md
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

const dir = 'src/client/components'
const system = readFileSync(path.join(dir, 'System.tsx'), 'utf8')
const count = (s, re) => (s.match(re) || []).length
const rows = readdirSync(dir)
  .filter((f) => /Widget.*\.tsx$/.test(f))
  .sort()
  .map((f) => {
    const src = readFileSync(path.join(dir, f), 'utf8')
    const name = f.replace('.tsx', '')
    const sets = count(src, /setInterval\(/g)
    const clears = count(src, /clearInterval\(/g)
    return {
      name,
      lines: src.split('\n').length,
      mounted: new RegExp(`<${name}\\b`).test(system) ? 'System' : '—',
      lazy: new RegExp(`lazy\\([^)]*${name}|<LazyMount>\\s*(<React\\.Suspense[^>]*>\\s*)?<${name}\\b`).test(system) ? 'yes' : '',
      signals: count(src, /recordSignal\(|record\w+Signal\(/g),
      api: count(src, /\/api\/|use[A-Z]\w+\(\)/g) ? 'yes' : '',
      storage: count(src, /localStorage|sessionStorage/g),
      timers: `${sets}/${clears}${sets !== clears ? ' ⚠' : ''}`,
      visGate: /document\.hidden|isRouteActive|useActiveViewport|useInViewport/.test(src) ? 'yes' : '',
    }
  })

console.log('| Widget | Lines | Mounted | Lazy | Signals | API | Storage | setInt/clear | Vis-gated |')
console.log('|---|---:|---|---|---:|---|---:|---|---|')
for (const r of rows)
  console.log(`| ${r.name} | ${r.lines} | ${r.mounted} | ${r.lazy} | ${r.signals} | ${r.api} | ${r.storage} | ${r.timers} | ${r.visGate} |`)
console.log(`\n${rows.length} widgets scanned.`)
