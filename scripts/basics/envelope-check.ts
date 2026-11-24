/**
 * LOT-FM-001 · BASIC envelope check.
 * Verifies 23 lines, every cycle of a 12-month year ≤ COGS ceiling, margin ≥ floor,
 * and the UPGRADE state machine table. Exit 1 on any breach.
 * Run: npx tsx --tsconfig tsconfig.json scripts/basics/envelope-check.ts
 */
import {
  BASICS_ITEM_COUNT,
  BASICS_MANIFEST,
  BASICS_MARGIN_FLOOR,
  basicsTransition,
} from '../../src/shared/basics.ts'
import { basicsEnvelopeReport } from '../../src/server/basics/cogs.ts'

let fail = 0
const check = (ok: boolean, msg: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!ok) fail++
}

check(BASICS_ITEM_COUNT === 23, `MANIFEST LINES = ${BASICS_ITEM_COUNT} (REQ 23)`)
const lines = BASICS_MANIFEST.map((i) => i.line)
check(new Set(lines).size === lines.length, 'LINE NUMBERS UNIQUE')
check(lines.every((l, i) => l === String(i + 1).padStart(2, '0')), 'LINE NUMBERS SEQUENTIAL 01–23')
check(BASICS_MANIFEST.every((i) => i.nomenclature === i.nomenclature.toUpperCase()), 'NOMENCLATURE UPPERCASE')

const r = basicsEnvelopeReport()
console.log('\nCYC  LINES  LANDED   MARGIN')
for (const c of r.cycles) {
  console.log(
    `${String(c.cycle + 1).padStart(3, '0')}  ${String(c.lines).padStart(5)}  ${c.landedUsd.toFixed(2).padStart(6)}   ${(c.margin * 100).toFixed(0)}%${c.ok ? '' : '  BREACH'}`
  )
}
console.log(`PEAK ${r.peakUsd.toFixed(2)} · MEAN ${r.meanUsd.toFixed(2)} · CEILING ${r.ceilingUsd.toFixed(2)}\n`)
check(r.allPriced, 'ALL LINES PRICED')
check(r.cycles.every((c) => c.ok), `EVERY CYCLE ≤ USD ${r.ceilingUsd.toFixed(2)} LANDED`)
check(r.minMargin >= BASICS_MARGIN_FLOOR, `MIN MARGIN ${(r.minMargin * 100).toFixed(0)}% ≥ ${BASICS_MARGIN_FLOOR * 100}%`)
console.log(`INFO  QUOTES CONFIRMED: ${r.allConfirmed ? 'YES' : 'NO (ESTIMATES — MONTH 3)'}`)

check(basicsTransition('USERSHIP_AI', 'UPGRADE') === 'PENDING', 'SM: USERSHIP/AI —UPGRADE→ PENDING')
check(basicsTransition('PENDING', 'ROSTER_COMPLETE') === 'ON_STRENGTH', 'SM: PENDING —ROSTER→ ON STRENGTH')
check(basicsTransition('ON_STRENGTH', 'FIRST_ISSUE_DISPATCHED') === 'STEADY_STATE', 'SM: ON STRENGTH —DISPATCH→ STEADY STATE')
check(basicsTransition('STEADY_STATE', 'STAND_DOWN') === 'USERSHIP_AI', 'SM: STEADY STATE —STAND DOWN→ USERSHIP/AI')
check(basicsTransition('USERSHIP_AI', 'STAND_DOWN') === null, 'SM: ILLEGAL STAND DOWN REJECTED')

console.log(fail ? `\nRED — ${fail} FAILURE(S)` : '\nGREEN')
process.exit(fail ? 1 : 0)
