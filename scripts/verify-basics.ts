// LOT-FM-001 envelope check: 23 items, landed cost <= $40 each month, margin >= 60%.
import { RATION_MANIFEST, itemsForMonth, RATION_PRICE_USD } from '../src/shared/basics/manifest'
import { ITEM_COGS_USD, FULFILLMENT_USD, PACKAGING_USD } from '../src/server/basics/cogs'

let fail = RATION_MANIFEST.length !== 23 ? 1 : 0
let tot = 0
for (let m = 1; m <= 12; m++) {
  const goods = itemsForMonth(m).reduce((s, i) => s + ITEM_COGS_USD[i.item], 0)
  const landed = goods + FULFILLMENT_USD + PACKAGING_USD
  const margin = 1 - landed / RATION_PRICE_USD
  tot += goods
  const ok = landed <= 40 && margin >= 0.6
  if (!ok) fail = 1
  console.log(
    `MO ${String(m).padStart(2, '0')}  GOODS $${goods.toFixed(2)}  LANDED $${landed.toFixed(2)}  MARGIN ${(margin * 100).toFixed(1)}%  ${ok ? 'PASS' : 'FAIL'}`
  )
}
console.log(`GOODS AVG $${(tot / 12).toFixed(2)}  ITEMS ${RATION_MANIFEST.length}`)
process.exit(fail)
