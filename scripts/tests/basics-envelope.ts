/**
 * LOT-FM-001 envelope check. Fails (exit 1) on any ceiling breach.
 * Run: npx tsx scripts/tests/basics-envelope.ts
 */
import { RATION_MANIFEST, RATION_TERMS, shipsOnIssue } from '../../src/shared/basics/manifest'
import { auditCycle } from '../../src/server/utils/basics-cogs'

const a = auditCycle(24)
const pad = (s: string | number, n: number) => String(s).padEnd(n)
console.log('ISSUE  LINES                                          CONTENTS  LANDED  MARGIN')
for (const e of a.envelopes) {
  console.log(
    pad(String(e.issue).padStart(3, '0'), 7) + pad(e.lines.join(' '), 47) +
    pad(e.contentsUsd.toFixed(2), 10) + pad(e.landedUsd.toFixed(2), 8) +
    (e.margin * 100).toFixed(1) + '%' + (e.withinCeiling ? '' : '  ** BREACH **')
  )
}
console.log(`ITEMS ${RATION_MANIFEST.length}/${RATION_TERMS.itemCount} · PEAK ${a.peakLandedUsd} · AVG ${a.avgLandedUsd} · MIN MARGIN ${(a.minMargin * 100).toFixed(1)}%`)
// Every recurring line must ship at least once within issues 0..11.
const neverShips = RATION_MANIFEST.filter(
  (it) => !Array.from({ length: 12 }, (_, n) => shipsOnIssue(it, n)).some(Boolean)
).map((it) => it.line)
if (neverShips.length) console.log('NEVER SHIPS IN 12:', neverShips.join(' '))
const fail =
  neverShips.length > 0 ||
  RATION_MANIFEST.length !== RATION_TERMS.itemCount ||
  a.breaches.length > 0 || a.missingCost.length > 0 ||
  a.minMargin < RATION_TERMS.marginFloor ||
  new Set(RATION_MANIFEST.map((i) => i.line)).size !== RATION_MANIFEST.length
console.log(fail ? 'ENVELOPE: RED' : 'ENVELOPE: GREEN')
process.exit(fail ? 1 : 0)
