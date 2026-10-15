// LOT-FM-001 — ration load engine + margin gate. Run: npx tsx scripts/tests/test-ration.ts
import assert from 'node:assert/strict'
import { RATION_MANIFEST, itemsForIssue } from '../../src/shared/ration'
import { verifyCycle, assertManifestCosted, RATION_COGS_CEILING_CENTS } from '../../src/server/utils/ration-cogs'

assert.equal(RATION_MANIFEST.length, 23, 'manifest is 23 items')
assertManifestCosted()
const seqs = new Set(RATION_MANIFEST.map(i => i.seq))
assert.equal(seqs.size, 23, 'seq unique')

const counts = Array.from({ length: 13 }, (_, k) => itemsForIssue(k + 1).length)
console.log('ITEMS PER ISSUE 1..13:', counts.join(' '))
assert.equal(counts[0], 22, 'issue 1: 18 monthly + 4 quarterly (semi-annual staggered to #2)')
assert.equal(counts[1], 19, 'issue 2: 18 monthly + clippers')
assert.equal(counts[2], 18)
assert.equal(counts[3], 22, 'quarterly recurs every 3rd issue')
assert.equal(counts[7], 19, 'semi-annual recurs every 6th issue (#8)')

// every item ships at least once in first 12 issues
for (const i of RATION_MANIFEST) {
  assert.ok(Array.from({ length: 12 }, (_, k) => k + 1).some(n => itemsForIssue(n).includes(i)), `item ${i.seq} never ships`)
}

const cycle = verifyCycle(12)
for (const m of cycle) {
  console.log(`#${String(m.issueNumber).padStart(2, '0')} items=${m.items} cogs=$${(m.cogsCents / 100).toFixed(2)} margin=${m.marginPct}% ${m.ok ? 'OK' : 'BREACH'}`)
  assert.ok(m.cogsCents <= RATION_COGS_CEILING_CENTS, `issue ${m.issueNumber} breaches COGS ceiling`)
  assert.ok(m.marginPct >= 60, `issue ${m.issueNumber} below margin floor`)
}
console.log('ALL ISSUES WITHIN ENVELOPE (estimates; fullyQuoted =', cycle.every(m => m.fullyQuoted) + ')')
