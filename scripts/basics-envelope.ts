import { envelope, COGS_STATUS, PROCESSING_CENTS, PACK_FREIGHT_CENTS } from '../src/server/basics/cogs'
import { RATION_MANIFEST, RATION_COUNT } from '../src/shared/basics/manifest'

// LOT-FM-001 envelope gate. Exit 1 on breach (count, ceiling, margin).
const e = envelope()
const usd = (c: number) => (c / 100).toFixed(2)
console.log(`LOT-FM-001 ENVELOPE  COGS:${COGS_STATUS}  PACK+FREIGHT:${usd(PACK_FREIGHT_CENTS)}  PROCESSING:${usd(PROCESSING_CENTS)}`)
for (const r of e.rows)
  console.log(`ISSUE ${String(r.issue).padStart(2, '0')}  LINES ${String(r.lines).padStart(2)}  LANDED ${usd(r.landedCents)}  ALL-IN ${usd(r.allInCents)}  MARGIN ${(r.margin * 100).toFixed(1)}%`)
console.log(`WORST ISSUE ${e.worst.issue}  MEAN MARGIN ${(e.meanMargin * 100).toFixed(1)}%`)
const countOk = RATION_MANIFEST.length === RATION_COUNT
console.log(`LINES ${RATION_MANIFEST.length}/${RATION_COUNT} ${countOk ? 'OK' : 'BREACH'}  ENVELOPE ${e.ok ? 'GREEN' : `BREACH: ${e.breach}`}`)
process.exit(e.ok && countOk ? 0 : 1)
