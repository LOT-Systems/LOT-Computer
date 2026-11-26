/**
 * LOT-FM-001 / BASIC — envelope check.
 * Fails (exit 1) if any month of the 12-month cycle breaches the
 * USD 40 landed ceiling or the 60% margin floor, or if the manifest
 * is not exactly 23 lines with stable numbering.
 * Run: yarn test:basics
 */
import { RATION_MANIFEST, loadForMonth } from '#shared/constants/basics'
import { envelopeReport, COGS_CEILING_USD, MARGIN_FLOOR } from '#server/utils/basics-ledger'

const fail: string[] = []
if (RATION_MANIFEST.length !== 23) fail.push(`MANIFEST LINES ${RATION_MANIFEST.length} ≠ 23`)
RATION_MANIFEST.forEach((item, i) => {
  if (item.line !== i + 1) fail.push(`LINE ${item.line} OUT OF ORDER AT ${i + 1}`)
})
const ids = new Set(RATION_MANIFEST.map((i) => i.id))
if (ids.size !== RATION_MANIFEST.length) fail.push('DUPLICATE ITEM ID')
const issued = new Set<string>()
for (let m = 0; m < 12; m++) loadForMonth(m).forEach((i) => issued.add(i.id))
RATION_MANIFEST.forEach((i) => { if (!issued.has(i.id)) fail.push(`${i.id} NEVER ISSUES`) })

const r = envelopeReport()
console.log('MO  ITEMS  LANDED   MARGIN  STATE')
r.months.forEach((m) =>
  console.log(
    `${String(m.month + 1).padStart(2, '0')}  ${String(m.items).padStart(5)}  ${m.landed.toFixed(2).padStart(6)}  ${(m.margin * 100).toFixed(1).padStart(6)}%  ${m.held ? 'HELD' : 'BREACH'}`
  )
)
console.log(`MAX LANDED ${r.maxLanded.toFixed(2)} / CEILING ${COGS_CEILING_USD.toFixed(2)}`)
console.log(`AVG LANDED ${r.avgLanded.toFixed(2)} · MIN MARGIN ${(r.minMargin * 100).toFixed(1)}% / FLOOR ${MARGIN_FLOOR * 100}%`)
if (r.missingCogs.length) fail.push(`MISSING COGS: ${r.missingCogs.join(', ')}`)
if (!r.held) fail.push('ENVELOPE BREACH')

if (fail.length) {
  console.error('RED:\n' + fail.map((f) => '  ' + f).join('\n'))
  process.exit(1)
}
console.log('GREEN: ENVELOPE HELD')
