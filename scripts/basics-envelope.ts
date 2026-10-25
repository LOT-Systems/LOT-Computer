/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// PRIVATE. BASIC (RATION) cost envelope check. Never import from src/client.
// Fails (exit 1) if landed cost breaches the ceiling or margin drops below floor.
// Unit costs are PROVISIONAL TARGETS, not supplier quotes (quotes: Month 3).

import {
  RATION_ITEMS,
  RATION_PRICE_USD,
  RATION_CADENCE_MONTHS,
} from '../src/shared/constants/basic.js'

const UNIT_COST_USD: Record<string, number> = {
  'TOOTHPASTE 100G': 0.9,
  'DENTAL FLOSS 50M': 0.7,
  'SOAP BAR 100G': 0.8,
  'SHAMPOO BAR': 1.5,
  'DEODORANT STICK': 1.8,
  'TOILET PAPER 6RL': 2.4,
  'PAPER TOWEL 2RL': 1.6,
  'FACIAL TISSUE BOX': 1.1,
  'RAZOR CARTRIDGE 2PK': 1.6,
  'OATS 500G': 1.4,
  'NUT BUTTER 340G': 1.9,
  'ELECTROLYTE SACHET 10CT': 2.0,
  'TEA BLACK 20CT': 1.4,
  'TOOTHBRUSH 2PK': 1.8,
  'SOCKS WOOL BLEND 3PR': 5.5,
  'UNDERWEAR COTTON 3PK': 7.0,
  'WASHCLOTH 3PK': 2.0,
  'NAIL CLIPPER': 1.5,
  'T-SHIRT HEAVYWEIGHT': 4.0,
  'TOWEL BATH': 4.0,
  'FIRST AID REFILL': 2.5,
  'BASE LAYER THERMAL': 8.0,
  'NOTEBOOK FIELD': 1.8,
}

const PACK_AND_FREIGHT_USD = 8.5 // box, manifest card, pick, parcel (per month)
const FEE_PCT = 0.029
const FEE_FIXED = 0.3
const CEILING_USD = 40
const MARGIN_FLOOR = 0.6

const missing = RATION_ITEMS.filter((i) => !(i.nomenclature in UNIT_COST_USD))
if (missing.length) {
  console.error('NO COST FOR:', missing.map((m) => m.nomenclature).join(', '))
  process.exit(1)
}

const goods = RATION_ITEMS.reduce(
  (s, i) => s + UNIT_COST_USD[i.nomenclature] / RATION_CADENCE_MONTHS[i.cadence],
  0
)
const fees = RATION_PRICE_USD * FEE_PCT + FEE_FIXED
const landed = goods + PACK_AND_FREIGHT_USD + fees
const margin = (RATION_PRICE_USD - landed) / RATION_PRICE_USD

console.log(`ITEMS            ${RATION_ITEMS.length}`)
console.log(`GOODS/MO         ${goods.toFixed(2)}`)
console.log(`PACK+FREIGHT/MO  ${PACK_AND_FREIGHT_USD.toFixed(2)}`)
console.log(`FEES/MO          ${fees.toFixed(2)}`)
console.log(`LANDED/MO        ${landed.toFixed(2)}  (ceiling ${CEILING_USD})`)
console.log(`MARGIN           ${(margin * 100).toFixed(1)}%  (floor ${MARGIN_FLOOR * 100}%)`)

const ok = RATION_ITEMS.length === 23 && landed <= CEILING_USD && margin >= MARGIN_FLOOR
console.log(ok ? 'ENVELOPE: PASS' : 'ENVELOPE: FAIL')
process.exit(ok ? 0 : 1)
