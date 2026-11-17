/**
 * LOT-FM-001 — BASIC envelope check.
 * Fails (exit 1) if any cycle month breaches the USD 40 landed ceiling,
 * the 60% margin floor, or the manifest/COGS tables drift apart.
 * Run: npx tsx scripts/basics-envelope-check.ts
 */
import { BASIC_MANIFEST, BASIC_MODULE, loadForMonth } from '../src/shared/constants/basics.ts'
import { BASIC_COGS, BASIC_OVERHEAD, BASIC_PROCESSING_USD } from '../src/server/basics/cogs.ts'

const fail: string[] = []
if (BASIC_MANIFEST.length !== BASIC_MODULE.itemCount) fail.push(`MANIFEST COUNT ${BASIC_MANIFEST.length} != ${BASIC_MODULE.itemCount}`)
const cogs = new Map(BASIC_COGS.map((c) => [c.ln, c.usd]))
for (const it of BASIC_MANIFEST) if (!cogs.has(it.ln)) fail.push(`NO COGS FOR LN ${it.ln}`)
if (cogs.size !== BASIC_MANIFEST.length) fail.push('COGS/MANIFEST LINE MISMATCH')

const overhead = BASIC_OVERHEAD.containerUsd + BASIC_OVERHEAD.manifestCardUsd + BASIC_OVERHEAD.freightUsd
const issued = new Set<string>()
console.log('MONTH  LINES  GOODS   LANDED  MARGIN  NET/FEES')
let worst = 0
for (let m = 1; m <= BASIC_MODULE.cycleMonths; m++) {
  const load = loadForMonth(m)
  load.forEach((it) => issued.add(it.ln))
  const goods = load.reduce((s, it) => s + (cogs.get(it.ln) ?? 0), 0)
  const landed = goods + overhead
  const margin = (BASIC_MODULE.priceUsdMonthly - landed) / BASIC_MODULE.priceUsdMonthly
  const net = (BASIC_MODULE.priceUsdMonthly - landed - BASIC_PROCESSING_USD) / BASIC_MODULE.priceUsdMonthly
  worst = Math.max(worst, landed)
  console.log(`M${String(m).padStart(2, '0')}    ${String(load.length).padStart(2)}    ${goods.toFixed(2).padStart(5)}   ${landed.toFixed(2).padStart(5)}   ${(margin * 100).toFixed(1)}%   ${(net * 100).toFixed(1)}%`)
  if (landed > BASIC_MODULE.ceilingUsdLanded) fail.push(`M${m} LANDED ${landed.toFixed(2)} > ${BASIC_MODULE.ceilingUsdLanded}`)
  if (margin < BASIC_MODULE.marginFloor) fail.push(`M${m} MARGIN ${(margin * 100).toFixed(1)}% < 60%`)
}
for (const it of BASIC_MANIFEST) if (!issued.has(it.ln)) fail.push(`LN ${it.ln} NEVER ISSUED IN CYCLE`)
console.log(`WORST-CASE LANDED: USD ${worst.toFixed(2)} / CEILING USD ${BASIC_MODULE.ceilingUsdLanded}`)
if (fail.length) { console.error('ENVELOPE: RED\n' + fail.join('\n')); process.exit(1) }
console.log('ENVELOPE: GREEN')
