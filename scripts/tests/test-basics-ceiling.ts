/**
 * LOT-FM-001 · BASIC ration — envelope audit.
 * Run: npx esr ./scripts/tests/test-basics-ceiling.ts
 * Fails (exit 1) if any month in the 12-month cycle breaches USD 40 landed
 * or 60% margin, if any line lacks a cost, or if the manifest is not 23 lines.
 */
import { RATION_MANIFEST, publicManifest } from '../../src/shared/basics/manifest'
import { auditCycle } from '../../src/server/utils/basics-cogs'

const fail = (msg: string) => { console.error('RED  ' + msg); process.exitCode = 1 }

if (RATION_MANIFEST.length !== 23) fail(`manifest has ${RATION_MANIFEST.length} lines, expected 23`)
const codes = new Set(RATION_MANIFEST.map((i) => i.code))
if (codes.size !== 23) fail('duplicate stock codes')
for (const it of RATION_MANIFEST) {
  if (it.offset < 0 || it.offset >= it.cadence) fail(`${it.code} offset ${it.offset} out of range for cadence ${it.cadence}`)
}
const leaked = publicManifest().some((r) => Object.keys(r).some((k) => /cost|usd|cogs|price/i.test(k)))
if (leaked) fail('public manifest exposes a cost field')

const a = auditCycle()
console.log('MO  LINES  GOODS   LANDED  MARGIN')
for (const m of a.months) {
  console.log(`${String(m.month).padStart(2, '0')}  ${String(m.lines).padStart(5)}  ${m.goodsUsd.toFixed(2).padStart(6)}  ${m.landedUsd.toFixed(2).padStart(6)}  ${m.marginPct.toFixed(1)}%${m.withinCeiling ? '' : '  BREACH'}`)
}
console.log(`PEAK ${a.peakLandedUsd.toFixed(2)} (MO ${a.peakMonth}) · FLOOR MARGIN ${a.floorMarginPct.toFixed(1)}%`)
if (!a.green) fail('envelope breached')
if (!process.exitCode) console.log('GREEN  envelope holds')
