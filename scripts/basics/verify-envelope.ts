/**
 * LOT-FM-001 · BASIC · ENVELOPE CHECK
 * Run: npx tsx --tsconfig tsconfig.paths.json scripts/basics/verify-envelope.ts
 * Exits 1 if any issue in the 12-issue cycle breaches USD 40 landed / 60% margin,
 * if the load is not exactly 23 lines, or if a slot is out of range.
 */
import {
  BASICS_LOAD,
  BASICS_LOAD_COUNT,
  BASICS_CADENCE_PERIOD,
} from '../../src/shared/constants/basics'
import { basicsEnvelopeAudit } from '../../src/server/utils/basics-cogs'

const errors: string[] = []
if (BASICS_LOAD.length !== BASICS_LOAD_COUNT) errors.push(`LOAD COUNT ${BASICS_LOAD.length} != ${BASICS_LOAD_COUNT}`)
const lines = new Set(BASICS_LOAD.map((l) => l.line))
if (lines.size !== BASICS_LOAD.length) errors.push('DUPLICATE LINE NUMBER')
for (const l of BASICS_LOAD) {
  if (l.slot < 0 || l.slot >= BASICS_CADENCE_PERIOD[l.cadence]) errors.push(`LINE ${l.line} SLOT OUT OF RANGE`)
}

const audit = basicsEnvelopeAudit()
if (audit.missing.length) errors.push(`COGS MISSING: ${audit.missing.join(',')}`)

console.log('ISSUE  LINES                                    GOODS   LANDED  MARGIN  OK')
for (const i of audit.issues) {
  console.log(
    `${String(i.issue + 1).padStart(5, '0')}  ${i.lines.join(' ').padEnd(40)} ${i.goodsUsd.toFixed(2).padStart(6)}  ${i.landedUsd.toFixed(2).padStart(6)}  ${(i.margin * 100).toFixed(1).padStart(5)}%  ${i.withinEnvelope ? 'Y' : 'N'}`
  )
  if (!i.withinEnvelope) errors.push(`ISSUE ${i.issue + 1} BREACH: LANDED ${i.landedUsd}`)
}
console.log(`MAX LANDED ${audit.maxLandedUsd.toFixed(2)} · AVG LANDED ${audit.avgLandedUsd.toFixed(2)} · MIN MARGIN ${(audit.minMargin * 100).toFixed(1)}% · AVG MARGIN ${(audit.avgMargin * 100).toFixed(1)}%`)

if (errors.length) {
  console.error('RED:\n' + errors.join('\n'))
  process.exit(1)
}
console.log('GREEN: ENVELOPE HOLDS')
