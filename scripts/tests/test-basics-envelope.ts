/**
 * LOT-FM-001 envelope check. Fails (exit 1) if any month of the 12-month
 * cycle breaches the USD 40 landed ceiling / 60% margin floor, or if the
 * load is not exactly 23 lines with unique keys and valid phases.
 * Run after `yarn server:build`: npx esr ./scripts/tests/test-basics-envelope.ts
 */
import { BASIC_LOAD, basicLoadForMonth } from '../../dist/server/shared/constants/basics.js'
import { verifyBasicEnvelope, BASIC_OVERHEAD_TOTAL_USD } from '../../dist/server/server/utils/basics-envelope.js'

let fail = 0
const check = (ok: boolean, msg: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!ok) fail++
}

check(BASIC_LOAD.length === 23, `LOAD = 23 LINES (got ${BASIC_LOAD.length})`)
check(new Set(BASIC_LOAD.map((i) => i.key)).size === BASIC_LOAD.length, 'KEYS UNIQUE')
check(BASIC_LOAD.every((i, idx) => i.ln === String(idx + 1).padStart(2, '0')), 'LINE NUMBERS SEQUENTIAL')
check(BASIC_LOAD.every((i) => i.phase >= 0 && i.phase < i.interval), 'PHASES WITHIN INTERVAL')
const everyLineIssues = BASIC_LOAD.every((i) =>
  Array.from({ length: 12 }, (_, n) => basicLoadForMonth(n)).some((m) => m.includes(i))
)
check(everyLineIssues, 'EVERY LINE ISSUES WITHIN 12 MONTHS')

const v = verifyBasicEnvelope()
console.log(`\nOVERHEAD/ISSUE  USD ${BASIC_OVERHEAD_TOTAL_USD.toFixed(2)}`)
console.log('MO  LINES  GOODS   LANDED  MARGIN')
for (const m of v.months) {
  console.log(
    `M${String(m.month + 1).padStart(2, '0')} ${String(m.lines).padStart(5)}  ${m.goodsUsd.toFixed(2).padStart(6)}  ${m.landedUsd
      .toFixed(2)
      .padStart(6)}  ${m.marginPct.toFixed(1)}%  ${m.pass ? 'HELD' : 'BREACH'}`
  )
}
check(v.missing.length === 0, `ALL LINES COSTED (missing: ${v.missing.join(',') || 'none'})`)
check(v.pass, `CEILING HELD ALL 12 ISSUES (peak USD ${v.peakLandedUsd} @ M${v.peakMonth + 1}, min margin ${v.minMarginPct}%)`)

process.exit(fail ? 1 : 0)
