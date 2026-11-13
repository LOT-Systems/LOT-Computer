/**
 * LOT-FM-001 envelope gate. Exits 1 if any issue in the 12-issue cycle
 * breaches the USD 40 landed ceiling (i.e. margin < 60% at USD 100/mo).
 * Run: npx tsx scripts/basics/envelope-check.ts
 */
import { cycleEnvelope } from '../../src/server/utils/basics-envelope'
import { BASIC_LOAD, BASIC_LANDED_CEILING_USD } from '../../src/shared/constants/basics'

const env = cycleEnvelope()
const pad = (s: string | number, n: number) => String(s).padEnd(n)
console.log(`LOT-FM-001 / ENVELOPE / ${BASIC_LOAD.length} LINES / CEILING USD ${BASIC_LANDED_CEILING_USD}`)
console.log(pad('ISSUE', 7) + pad('LINES', 7) + pad('GOODS', 9) + pad('LANDED', 9) + pad('MARGIN', 9) + 'STATE')
for (const i of env.issues) {
  console.log(
    pad(String(i.issue).padStart(2, '0'), 7) + pad(i.lines.length, 7) +
    pad(i.goodsUsd.toFixed(2), 9) + pad(i.landedUsd.toFixed(2), 9) +
    pad(i.marginPct.toFixed(1) + '%', 9) + (i.within ? 'WITHIN' : 'BREACH')
  )
}
console.log(`WORST: ISSUE ${env.worst.issue} USD ${env.worst.landedUsd.toFixed(2)} / AVG USD ${env.avgLanded.toFixed(2)}`)
if (env.missing.length) console.log(`MISSING COGS: ${env.missing.join(', ')}`)
console.log(`ENVELOPE: ${env.status}`)
process.exit(env.status === 'WITHIN' ? 0 : 1)
