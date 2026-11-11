/**
 * LOT-FM-001 — BASIC envelope gate.
 * Fails (exit 1) if the 23-line manifest is malformed, any box in the 12-issue
 * cycle breaches the USD 40 landed ceiling, or margin drops under 60%.
 * Run: yarn basics:check
 */
import {
  computeBasicsEnvelope,
  auditBasicsManifest,
  issueLandedUsd,
} from '../src/server/utils/basics-cogs'
import { getIssueLoad, formatIssueNumber } from '../src/shared/constants/basics'

const faults = auditBasicsManifest()
const env = computeBasicsEnvelope()

console.log('LOT-FM-001 / BASIC / ENVELOPE CHECK')
console.log('ISSUE  LINES  LANDED')
for (let i = 1; i <= 12; i++) {
  console.log(
    `${formatIssueNumber(i)}    ${String(getIssueLoad(i).length).padStart(2, '0')}     ${issueLandedUsd(i).toFixed(2)}`
  )
}
console.log(`AMORTIZED  ${env.amortizedUsd.toFixed(2)}  MARGIN ${(env.amortizedMargin * 100).toFixed(1)}%`)
console.log(`PEAK       ${env.peakUsd.toFixed(2)}  ISSUE ${formatIssueNumber(env.peakIssue)}  CEILING ${env.ceilingUsd.toFixed(2)}`)
console.log(`QUOTED     ${env.quotedLines}/${env.totalLines}`)

if (!env.withinCeiling) faults.push(`CEILING BREACH ${env.peakUsd} > ${env.ceilingUsd}`)
if (!env.marginHeld) faults.push(`MARGIN BREACH on issue ${env.peakIssue}`)

if (faults.length) {
  console.error('STATUS: RED')
  faults.forEach((f) => console.error(` - ${f}`))
  process.exit(1)
}
console.log('STATUS: GREEN')
