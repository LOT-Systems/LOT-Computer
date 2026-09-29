// LOT-FM-001 margin gate. Exit 1 if landed COGS > ceiling or margin < floor.
import { computeCogs } from '../src/client/components/Basics/cogs'
import { RATION_MANIFEST, RATION_COGS_CEILING_USD, RATION_MARGIN_FLOOR_PCT } from '../src/client/components/Basics/constants'

const r = computeCogs()
console.log(`ITEMS      ${RATION_MANIFEST.length}`)
console.log(`ITEMS USD  ${r.itemsUsd.toFixed(2)}`)
console.log(`PACK USD   ${r.packUsd.toFixed(2)}`)
console.log(`FREIGHT    ${r.freightUsd.toFixed(2)}`)
console.log(`LANDED     ${r.landedUsd.toFixed(2)} / CEILING ${RATION_COGS_CEILING_USD}`)
console.log(`MARGIN     ${r.marginPct.toFixed(1)}% / FLOOR ${RATION_MARGIN_FLOOR_PCT}%`)
console.log(`QUOTED     ${r.quotedCount}/${RATION_MANIFEST.length} (targets only until quotes filed)`)
if (r.missing.length) console.log(`MISSING    ${r.missing.join(',')}`)
const ok = r.withinCeiling && r.marginOk && RATION_MANIFEST.length === 23
console.log(ok ? 'GATE       PASS' : 'GATE       FAIL')
process.exit(ok ? 0 : 1)
