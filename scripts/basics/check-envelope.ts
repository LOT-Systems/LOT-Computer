/**
 * LOT-FM-001 · BASIC (RATION) · ENVELOPE GATE
 * Usage: yarn basics:envelope
 * Exits 1 if any issue in the 12-issue cycle breaches USD 40 landed / 60% margin,
 * or if the public manifest drifts from 23 lines.
 */

import { BASICS_MANIFEST, BASICS_ITEM_COUNT, getPublicManifest } from '../../src/shared/basics.ts'
import { envelopeReport, BASICS_ENVELOPE } from '../../src/server/basics/ledger.ts'

let failed = false
const fail = (msg: string) => {
  failed = true
  console.error(`FAIL  ${msg}`)
}

if (BASICS_MANIFEST.length !== BASICS_ITEM_COUNT) {
  fail(`MANIFEST HAS ${BASICS_MANIFEST.length} LINES, EXPECTED ${BASICS_ITEM_COUNT}`)
}
const nsns = new Set(BASICS_MANIFEST.map((i) => i.nsn))
if (nsns.size !== BASICS_MANIFEST.length) fail('DUPLICATE NSN IN MANIFEST')

const publicJson = JSON.stringify(getPublicManifest()).toLowerCase()
for (const leak of ['cogs', 'margin', 'supplier', 'landed', 'overhead', 'postage']) {
  if (publicJson.includes(leak)) fail(`PUBLIC MANIFEST LEAKS "${leak}"`)
}

const r = envelopeReport()
const pad = (s: string | number, n: number) => String(s).padEnd(n)
console.log('ISSUE  LINES  GOODS   OVHD    LANDED  MARGIN  NET     STATUS')
for (const i of r.issues) {
  console.log(
    [
      pad(String(i.issue).padStart(2, '0'), 6),
      pad(i.lines.length, 6),
      pad(i.goodsUsd.toFixed(2), 7),
      pad(i.overheadUsd.toFixed(2), 7),
      pad(i.landedUsd.toFixed(2), 7),
      pad(`${Math.round(i.margin * 100)}%`, 7),
      pad(`${Math.round(i.netMargin * 100)}%`, 7),
      i.withinEnvelope ? 'GREEN' : 'BREACH',
    ].join(' ')
  )
  if (!i.withinEnvelope) fail(`ISSUE ${i.issue} BREACHES ENVELOPE (${i.landedUsd} LANDED)`)
}
console.log(
  `\nPEAK ${r.peakLandedUsd.toFixed(2)} · MEAN ${r.meanLandedUsd.toFixed(2)} · ` +
    `CEILING ${BASICS_ENVELOPE.landedCeilingUsd.toFixed(2)} · MIN MARGIN ${Math.round(r.minMargin * 100)}% · ` +
    `COGS ${r.quotedLines} QUOTE / ${r.estimatedLines} ESTIMATE`
)
console.log(failed ? '\nENVELOPE: RED' : '\nENVELOPE: GREEN')
process.exit(failed ? 1 : 0)
