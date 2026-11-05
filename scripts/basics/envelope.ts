/**
 * LOT-FM-001 §1.2/§2.3 ENVELOPE CHECK. INTERNAL. NEVER BUNDLED.
 * Run: npx tsx scripts/basics/envelope.ts   (exit 1 on breach)
 * COGS are FM-001 Rev A estimates — confirm against live supplier quotes (Month 3).
 */
import { loadForMonth, RATION_ITEMS, BASIC_PRICE_USD } from '../../src/shared/constants/basics'

const COGS: Record<string, number> = {
  '001': 3.0, '002': 3.5, '003': 5.0, '004': 0.4, '005': 1.2, '006': 0.5,
  '007': 0.7, '008': 1.8, '009': 0.9, '010': 0.8, '011': 2.5, '012': 1.5,
  '013': 1.8, '014': 1.5, '015': 0.9, '016': 1.2, '017': 0.7, '018': 1.8,
  '019': 2.5, '020': 4.0, '021': 3.5, '022': 2.5, '023': 0.3,
}
// FM-001 §2.3 stated goods totals, for drift detection.
const MANUAL: Record<number, number> = {
  1: 15.3, 2: 15.4, 3: 12.3, 4: 17.4, 5: 15.8, 6: 13.5,
  7: 17.1, 8: 15.4, 9: 15.8, 10: 17.9, 11: 15.8, 12: 11.7,
}
const FULFIL = 7, PACK = 3, CEILING = 40, FLOOR = 0.6

let fail = false, sum = 0
console.log('MO  ITEMS  GOODS   MANUAL  LANDED  MARGIN')
for (let m = 1; m <= 12; m++) {
  const ids = loadForMonth(m)
  const goods = ids.reduce((a, i) => a + COGS[i], 0)
  const landed = goods + FULFIL + PACK
  const margin = (BASIC_PRICE_USD - landed) / BASIC_PRICE_USD
  sum += goods
  const bad = landed > CEILING || margin < FLOOR
  if (bad) fail = true
  console.log(
    `${String(m).padStart(2, '0')}  ${String(ids.length).padStart(5)}  ${goods.toFixed(2).padStart(6)}  ${MANUAL[m].toFixed(2).padStart(6)}  ${landed.toFixed(2).padStart(6)}  ${(margin * 100).toFixed(1)}%${bad ? '  BREACH' : ''}${Math.abs(goods - MANUAL[m]) > 0.05 ? '  DRIFT' : ''}`
  )
}
console.log(`ITEMS ${RATION_ITEMS.length}  GOODS AVG ${(sum / 12).toFixed(2)}`)
console.log(fail ? 'ENVELOPE: BREACH' : 'ENVELOPE: HOLDS')
process.exit(fail ? 1 : 0)
