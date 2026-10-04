import { envelope, COGS_STATUS } from '../src/server/basics/cogs.js'
import { BASIC_MANIFEST, BASIC_PRICE_USD, BASIC_ITEM_COUNT } from '../src/shared/basics/manifest.js'

// LOT-FM-001 envelope check. Exit 1 on breach (price, count, ceiling, margin).
const e = envelope()
console.log(`LOT-FM-001 ENVELOPE  COGS:${COGS_STATUS}  PRICE:USD ${BASIC_PRICE_USD}`)
for (const r of e.rows)
  console.log(`ISSUE ${String(r.issue).padStart(2, '0')}  ITEMS ${String(r.items).padStart(2)}  LANDED ${r.landed.toFixed(2)}  MARGIN ${(r.margin * 100).toFixed(1)}%`)
console.log(`WORST ISSUE ${e.worst.issue}  LANDED ${e.worst.landed.toFixed(2)}  MEAN ${e.mean.toFixed(2)}`)
const countOk = BASIC_MANIFEST.length === BASIC_ITEM_COUNT
console.log(`ITEMS ${BASIC_MANIFEST.length}/${BASIC_ITEM_COUNT} ${countOk ? 'OK' : 'BREACH'}  ENVELOPE ${e.ok ? 'GREEN' : 'BREACH'}`)
process.exit(e.ok && countOk ? 0 : 1)
