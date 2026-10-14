/**
 * LOT-FM-001 INTERNAL ENVELOPE CHECK — COGS withheld from client bundle.
 * Run: npx tsx scripts/basics/cogs.ts   (exit 1 on breach)
 * Unit costs are CEILING ESTIMATES pending supplier quotes (Month 3).
 */
import { BASIC_MANIFEST, BASIC_PRICE_USD, BASIC_ITEM_COUNT } from '../../src/shared/basics/manifest'

const UNIT_USD: Record<string, number> = {
  'B-01': 2.5, 'B-02': 2, 'B-03': 1.25, 'B-04': 1.5, 'B-05': 1.75, 'B-06': 3,
  'B-07': 3, 'B-08': 5, 'B-09': 2, 'B-10': 1.5, 'B-11': 3.5, 'B-12': 2,
  'B-13': 1.25, 'B-14': 2, 'B-15': 1.5, 'B-16': 0.75, 'B-17': 7, 'B-18': 5,
  'B-19': 6.5, 'B-20': 3, 'B-21': 2, 'B-22': 2, 'B-23': 0.5,
}
const LANDED_OVERHEAD_USD = 9 // carton + inserts + freight + pick/pack, per issue
const CEILING = 40
const MARGIN_FLOOR = 0.6

const items = BASIC_MANIFEST.reduce((s, i) => s + UNIT_USD[i.id] / i.cadence, 0)
const landed = items + LANDED_OVERHEAD_USD
const margin = (BASIC_PRICE_USD - landed) / BASIC_PRICE_USD
const ok = BASIC_MANIFEST.length === BASIC_ITEM_COUNT && landed <= CEILING && margin >= MARGIN_FLOOR
console.log(`ITEMS ${BASIC_MANIFEST.length}/${BASIC_ITEM_COUNT}  AMORTISED ${items.toFixed(2)}  LANDED ${landed.toFixed(2)}/${CEILING}  MARGIN ${(margin * 100).toFixed(1)}%  ${ok ? 'GREEN' : 'BREACH'}`)
process.exit(ok ? 0 : 1)
