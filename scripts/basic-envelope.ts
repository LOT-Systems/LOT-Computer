/**
 * LOT-FM-001 — BASIC envelope check. Exits non-zero on ceiling breach.
 * Usage: npx tsx scripts/basic-envelope.ts
 */
import { verifyEnvelope, COGS_CEILING_USD, MARGIN_FLOOR_PCT } from '../src/server/utils/basic-envelope'

const r = verifyEnvelope()
const pad = (s: string | number, n: number) => String(s).padStart(n)
console.log('ISSUE  LINES  GOODS   FIXED   LANDED  MARGIN  STATUS')
for (const i of r.issues) {
  console.log(
    `${pad(String(i.issueNo).padStart(2, '0'), 5)}  ${pad(i.lines, 5)}  ${pad(i.goodsUsd.toFixed(2), 6)}  ${pad(i.fixedUsd.toFixed(2), 6)}  ${pad(i.landedUsd.toFixed(2), 6)}  ${pad(i.marginPct.toFixed(1), 5)}%  ${i.withinCeiling ? 'GO' : 'BREACH'}`
  )
}
console.log(`PEAK ISSUE ${r.peak.issueNo}: USD ${r.peak.landedUsd.toFixed(2)} / CEILING ${COGS_CEILING_USD} · AVG USD ${r.avgLandedUsd.toFixed(2)} · FLOOR ${MARGIN_FLOOR_PCT}%`)
console.log(r.ok ? 'ENVELOPE: GREEN' : 'ENVELOPE: RED — CEILING BREACHED')
process.exit(r.ok ? 0 : 1)
