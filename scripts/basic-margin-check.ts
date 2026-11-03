/**
 * LOT-FM-001 margin gate. Run: npx tsx scripts/basic-margin-check.ts
 * Exits 1 if any issue month breaches ceiling or margin floor.
 * Unit costs are PLANNING ESTIMATES (USD landed, inbound freight incl.) — replace with supplier quotes in Month 3.
 */
import {
  RATION_MANIFEST, itemsForMonth, CADENCE,
  PRICE_USD_PER_MONTH, COGS_CEILING_USD, MARGIN_FLOOR,
} from '../src/client/data/basicRation'

const UNIT: Record<number, number> = {
  1: 1.8, 2: 0.9, 3: 1.2, 4: 3.2, 5: 2.6, 6: 2.4, 7: 2.4, 8: 2.0, 9: 0.8, 10: 4.5,
  11: 6.0, 12: 2.0, 13: 2.4, 14: 2.0, 15: 1.2, 16: 4.0, 17: 5.0, 18: 4.0, 19: 3.6,
  20: 1.0, 21: 1.5, 22: 0.6, 23: 0.25,
}
const PACK_AND_FREIGHT = 7.5 // carton 1.50 + outbound parcel 6.00 (planning estimate)
const FEE = PRICE_USD_PER_MONTH * 0.029 + 0.3

let bad = 0
if (RATION_MANIFEST.length !== 23) { console.log('FAIL: manifest != 23'); bad++ }
for (const i of RATION_MANIFEST) if (UNIT[i.no] === undefined) { console.log('FAIL: no cost for', i.no); bad++ }
for (let m = 0; m < 12; m++) {
  const goods = itemsForMonth(m).reduce((s, i) => s + UNIT[i.no], 0)
  const landed = goods + PACK_AND_FREIGHT
  const margin = (PRICE_USD_PER_MONTH - landed - FEE) / PRICE_USD_PER_MONTH
  const ok = landed <= COGS_CEILING_USD && margin >= MARGIN_FLOOR
  if (!ok) bad++
  console.log(`M${String(m + 1).padStart(2, '0')} ITEMS ${String(itemsForMonth(m).length).padStart(2)} LANDED ${landed.toFixed(2)} MARGIN ${(margin * 100).toFixed(1)}% ${ok ? 'OK' : 'BREACH'}`)
}
void CADENCE
process.exit(bad ? 1 : 0)
