import { writeFileSync } from 'node:fs'
import { RATION_MANIFEST, SCHEDULE_HORIZON, issueLoad, cadenceLabel } from '../src/shared/basics/manifest'

// LOT-FM-001 request-for-quote sheet. One row per line: spec, units per operator
// per year, cadence. No target price is printed. Output: docs/technical/BASICS-RFQ.md
const perYear = (line: string) =>
  Array.from({ length: SCHEDULE_HORIZON }, (_, k) => issueLoad(k + 1).filter((i) => i.line === line).length)
    .reduce((a, b) => a + b, 0)
const rows = RATION_MANIFEST.map(
  (i) => `| ${i.line} | ${i.nomenclature} | ${i.spec} | ${cadenceLabel(i.everyMonths)} | ${perYear(i.line)} | ${perYear(i.line) * 100} / ${perYear(i.line) * 500} / ${perYear(i.line) * 1000} |`
)
const out = [
  '# LOT-FM-001 / BASIC — REQUEST FOR QUOTE',
  '',
  'Issued by LOT Systems Corporation. Quote landed unit cost (USD) delivered to a US fulfillment dock,',
  'per ration unit as specified. State MOQ, lead time, quote validity (days) and country of origin.',
  'Unit volume tiers assume 100 / 500 / 1000 operators over 12 issues.',
  '',
  '| LINE | NOMENCLATURE | SPEC | CADENCE | UNITS/OPERATOR/YR | UNITS/YR @100 / 500 / 1000 |',
  '|------|--------------|------|---------|-------------------|-----------------------------|',
  ...rows,
  '',
  'Return each answer as: line, supplier, unit USD, MOQ, lead time days, valid days, quote date.',
  'Entry point for answers: CSV in this row order -> `npm run basics:quotes -- sheet.csv [--write]`. Gate: `npm run basics:envelope`.',
  '',
].join('\n')
writeFileSync('docs/technical/BASICS-RFQ.md', out)
console.log(`RFQ: ${RATION_MANIFEST.length} lines -> docs/technical/BASICS-RFQ.md`)
