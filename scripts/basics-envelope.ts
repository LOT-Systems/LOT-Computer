/**
 * LOT-FM-001 · BASIC envelope check. Fails (exit 1) on any ceiling breach.
 * Run: npx tsx scripts/basics-envelope.ts
 */
import { BASICS_MANIFEST } from '../src/shared/constants/basics'
import {
  basicsEnvelopeCycle,
  basicsCogsGaps,
  BASICS_LANDED_CEILING_USD,
} from '../src/server/utils/basics-cogs'

const gaps = basicsCogsGaps()
const cycle = basicsEnvelopeCycle()
const pad = (s: string | number, n: number) => String(s).padStart(n)

console.log('LOT-FM-001 · BASIC · ENVELOPE · 12-MONTH CYCLE')
console.log(`MANIFEST ${BASICS_MANIFEST.length} · CEILING USD ${BASICS_LANDED_CEILING_USD}`)
console.log('MO  ITEMS  GOODS   LANDED  MARGIN  STATE')
for (const e of cycle) {
  console.log(
    `${pad(e.month + 1, 2)}  ${pad(e.items, 5)}  ${pad(e.goodsUsd.toFixed(2), 6)}  ${pad(e.landedUsd.toFixed(2), 6)}  ${pad((e.margin * 100).toFixed(0) + '%', 6)}  ${e.breach ? 'BREACH' : 'OK'}`
  )
}
const peak = Math.max(...cycle.map((e) => e.landedUsd))
const avg = cycle.reduce((s, e) => s + e.landedUsd, 0) / cycle.length
console.log(`PEAK USD ${peak.toFixed(2)} · AVG USD ${avg.toFixed(2)} · AVG MARGIN ${((1 - avg / 100) * 100).toFixed(1)}%`)

if (BASICS_MANIFEST.length !== 23) { console.error('FAIL: manifest must hold 23 items'); process.exit(1) }
if (new Set(BASICS_MANIFEST.map((i) => i.nsn)).size !== 23) { console.error('FAIL: duplicate NSN'); process.exit(1) }
if (gaps.length) { console.error('FAIL: COGS gaps ' + gaps.join(',')); process.exit(1) }
if (cycle.some((e) => e.breach)) { console.error('FAIL: ceiling breach'); process.exit(1) }
console.log('ENVELOPE: GREEN')
