#!/usr/bin/env node
// QI·46 Phase 0 — Step 0.1/0.2: source inventory + tagging (dry run, no training data written).
// Usage: node scripts/qi46-corpus-inventory.mjs [--jsonl out.jsonl]
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SOURCES = {
  institute: ['docs/corporate', 'docs/wiki'],
  platform: ['docs/assembly', 'docs/benchmark', 'docs/releases'],
  bioelectric: ['docs/badges'],
  brand: ['docs/setup', 'docs/deployment'],
  technical: ['docs/technical', 'docs/diagnostics', 'docs/security'],
}
// Blocks from CHECKPOINT 0: anything touching personal data stays out until consented + reviewed.
const PII = /[\w.+-]+@[\w-]+\.[\w.]+|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|(api[_-]?key|secret|token|password)\s*[:=]/i

const walk = d => readdirSync(d).flatMap(n => {
  const p = join(d, n)
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []
})

const rows = []
for (const [source, dirs] of Object.entries(SOURCES))
  for (const dir of dirs)
    for (const f of walk(join(ROOT, dir))) {
      const text = readFileSync(f, 'utf8')
      // one training example per H2 section with >= 40 words
      for (const sec of text.split(/\n(?=## )/)) {
        const words = sec.split(/\s+/).filter(Boolean).length
        if (words < 40) continue
        const title = (sec.match(/^#+\s*(.+)$/m) || [, 'untitled'])[1]
        rows.push({
          source, file: relative(ROOT, f), title, words,
          type: /```/.test(sec) ? 'technical' : 'philosophy',
          cosmo_cleared: !PII.test(sec),
        })
      }
    }

const by = k => rows.reduce((a, r) => ((a[r[k]] = (a[r[k]] || 0) + 1), a), {})
const out = {
  documents: new Set(rows.map(r => r.file)).size,
  pairs: rows.length,
  words: rows.reduce((a, r) => a + r.words, 0),
  est_tokens: Math.round(rows.reduce((a, r) => a + r.words, 0) * 1.35),
  by_source: by('source'),
  by_type: by('type'),
  cosmo_cleared: rows.filter(r => r.cosmo_cleared).length,
  cosmo_flagged: rows.filter(r => !r.cosmo_cleared).length,
}
console.log(JSON.stringify(out, null, 2))
const i = process.argv.indexOf('--jsonl')
if (i > 0) writeFileSync(process.argv[i + 1], rows.filter(r => r.cosmo_cleared).map(r => JSON.stringify({ tags: { source: r.source, type: r.type, cosmo_cleared: true }, ref: `${r.file}#${r.title}` })).join('\n') + '\n')
