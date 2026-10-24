#!/usr/bin/env node
// QI·46 Phase 0 — Step 0.1 source inventory (repo docs only).
// Usage: node scripts/qi46/corpus-inventory.cjs [--json]
// Reads docs/ and tags each file per the Phase 0.2 schema. It never sets
// cosmo_cleared=true: clearance is Vadik's review, not a heuristic.
// Subscriber data (DB journals, logs) is out of scope and never read here.
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..', '..')
const DOCS = path.join(ROOT, 'docs')
const GATE_MIN_PAIRS = 10000
const BIO = /piezo|biofield|bioelectric|nano-?ceramic|haptic/i

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.name.endsWith('.md') ? [p] : []
  })

const sourceOf = (rel, text) => {
  if (/^docs\/corporate\/(CQGS|LOT-CUBIQ|LOT_QI46)/.test(rel)) return 'institute'
  if (BIO.test(text) && (text.match(BIO) || []).length >= 5) return 'bioelectric'
  if (/^docs\/(wiki|corporate|badges)\//.test(rel)) return 'brand'
  return 'unmapped'
}

const typeOf = (rel) =>
  /assembly|benchmark|technical|deployment|security|diagnostics/.test(rel)
    ? 'technical'
    : /wiki|badges/.test(rel)
      ? 'voice'
      : 'philosophy'

const files = walk(DOCS).map((f) => {
  const rel = path.relative(ROOT, f)
  const text = fs.readFileSync(f, 'utf8')
  return {
    path: rel,
    words: (text.match(/\S+/g) || []).length,
    source: sourceOf(rel, text),
    type: typeOf(rel),
    cosmo_cleared: false,
  }
})

const by = (k) =>
  files.reduce((a, f) => ((a[f[k]] = a[f[k]] || { docs: 0, words: 0 }), a[f[k]].docs++, (a[f[k]].words += f.words), a), {})

const out = {
  scope: 'repo docs only; platform/consumables/cosmo sources NOT inventoried',
  docs: files.length,
  words: files.reduce((n, f) => n + f.words, 0),
  by_source: by('source'),
  by_type: by('type'),
  cosmo_cleared: { true: 0, false: files.length },
  gate: {
    'sources inventoried (6/6)': Object.keys(by('source')).filter((s) => s !== 'unmapped').length >= 6,
    'all docs tagged': true,
    'cosmo_cleared true on all': false,
    [`corpus > ${GATE_MIN_PAIRS} pairs`]: false, // no prompt/completion pairs built yet
    'JSONL validated': false, // nothing emitted yet
    'Vadik review (100 samples)': false,
  },
}
out.gate_result = Object.values(out.gate).every(Boolean) ? 'PASS' : 'HOLD'

if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 2))
else {
  console.log(`QI·46 PHASE 0 INVENTORY  docs=${out.docs}  words=${out.words}`)
  for (const [s, v] of Object.entries(out.by_source)) console.log(`  ${s.padEnd(12)} ${String(v.docs).padStart(4)} docs ${String(v.words).padStart(8)} words`)
  for (const [g, ok] of Object.entries(out.gate)) console.log(`  [${ok ? 'x' : ' '}] ${g}`)
  console.log(`GATE: ${out.gate_result}`)
}
