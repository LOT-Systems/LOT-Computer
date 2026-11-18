/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) MODULE · PUBLIC MANIFEST
 *
 * This file is PUBLIC. It is bundled into the client and served by
 * /api/public/basics. It carries nomenclature and cadence ONLY.
 * Unit cost (COGS) is WITHHELD and lives server-side in
 * src/server/utils/basics-cogs.ts. Never import COGS here.
 *
 * Cadence model: each line item has a period P (issues between draws)
 * and a slot S in [0, P). Line is drawn on issue n (0-indexed from the
 * subscriber's cadence start) when n % P === S. Slots are staggered so
 * no single issue breaches the landed-cost ceiling.
 */

export const BASICS_FM = 'LOT-FM-001'
export const BASICS_MODULE = 'BASIC'
export const BASICS_PRICE_USD = 100
export const BASICS_MARGIN_FLOOR = 0.6
export const BASICS_LANDED_CEILING_USD = 40
export const BASICS_LOAD_COUNT = 23

export type BasicsCadence = 'M' | 'Q' | 'S' | 'A'

export const BASICS_CADENCE_PERIOD: Record<BasicsCadence, number> = {
  M: 1, // monthly — every issue
  Q: 3, // quarterly — 1 in 3
  S: 6, // semiannual — 1 in 6
  A: 12, // annual — 1 in 12
}

export const BASICS_CADENCE_LABEL: Record<BasicsCadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

export type BasicsLineItem = {
  /** Line number, 01–23. Stable. Used as join key with server COGS. */
  line: string
  /** Noun-first military nomenclature. */
  nomenclature: string
  /** Unit of issue. EA = each, PR = pair, PK = pack, BX = box, KT = kit. */
  ui: 'EA' | 'PR' | 'PK' | 'BX' | 'KT'
  qty: number
  cadence: BasicsCadence
  slot: number
  /** Functional group, shown as ledger section. */
  group: 'HYGIENE' | 'GARMENT' | 'FIELD' | 'OFFICE'
}

/**
 * THE 23-ITEM LOAD — PROVISIONAL REV A.
 * Nomenclature and cadence locked for Month 1 publication.
 * Supplier confirmation is a Month 3 task; lines may be substituted
 * like-for-like under the same line number without changing cadence.
 */
export const BASICS_LOAD: BasicsLineItem[] = [
  // MONTHLY — every issue
  { line: '01', nomenclature: 'PASTE, DENTIFRICE, FLUORIDE, 100 ML', ui: 'EA', qty: 1, cadence: 'M', slot: 0, group: 'HYGIENE' },
  { line: '02', nomenclature: 'SOAP, BAR, UNSCENTED, 120 G', ui: 'EA', qty: 2, cadence: 'M', slot: 0, group: 'HYGIENE' },
  { line: '03', nomenclature: 'SOCKS, CREW, MERINO BLEND, BLACK', ui: 'PR', qty: 1, cadence: 'M', slot: 0, group: 'GARMENT' },
  { line: '04', nomenclature: 'TABLET, ELECTROLYTE, 20 CT', ui: 'PK', qty: 1, cadence: 'M', slot: 0, group: 'FIELD' },
  { line: '05', nomenclature: 'BALM, LIP, SPF 15', ui: 'EA', qty: 1, cadence: 'M', slot: 0, group: 'HYGIENE' },

  // QUARTERLY — 1 in 3, staggered across slots 0/1/2
  { line: '06', nomenclature: 'BRUSH, TOOTH, SOFT', ui: 'EA', qty: 1, cadence: 'Q', slot: 0, group: 'HYGIENE' },
  { line: '07', nomenclature: 'BLADE, SAFETY RAZOR, DOUBLE EDGE, 10 CT', ui: 'PK', qty: 1, cadence: 'Q', slot: 0, group: 'HYGIENE' },
  { line: '08', nomenclature: 'UNDERSHIRT, CREW, COTTON, WHITE', ui: 'EA', qty: 1, cadence: 'Q', slot: 0, group: 'GARMENT' },
  { line: '09', nomenclature: 'BRIEFS, BOXER, COTTON, BLACK', ui: 'EA', qty: 1, cadence: 'Q', slot: 1, group: 'GARMENT' },
  { line: '10', nomenclature: 'SHAMPOO, BAR, UNSCENTED, 70 G', ui: 'EA', qty: 1, cadence: 'Q', slot: 1, group: 'HYGIENE' },
  { line: '11', nomenclature: 'DEODORANT, STICK, UNSCENTED', ui: 'EA', qty: 1, cadence: 'Q', slot: 2, group: 'HYGIENE' },
  { line: '12', nomenclature: 'BATTERY, ALKALINE, AA, 4 CT', ui: 'PK', qty: 1, cadence: 'Q', slot: 2, group: 'FIELD' },

  // SEMIANNUAL — 1 in 6
  { line: '13', nomenclature: 'NOTEBOOK, GRID, A5, 80 SHEET', ui: 'EA', qty: 1, cadence: 'S', slot: 0, group: 'OFFICE' },
  { line: '14', nomenclature: 'PEN, GEL, BLACK, 0.5 MM', ui: 'EA', qty: 2, cadence: 'S', slot: 1, group: 'OFFICE' },
  { line: '15', nomenclature: 'HANDKERCHIEF, COTTON, WHITE', ui: 'EA', qty: 2, cadence: 'S', slot: 2, group: 'GARMENT' },
  { line: '16', nomenclature: 'CLOTH, CLEANING, MICROFIBER', ui: 'EA', qty: 1, cadence: 'S', slot: 3, group: 'FIELD' },
  { line: '17', nomenclature: 'TAPE, DUCT, BLACK, 10 M', ui: 'EA', qty: 1, cadence: 'S', slot: 4, group: 'FIELD' },

  // ANNUAL — 1 in 12
  { line: '18', nomenclature: 'LAMP, HEAD, LED, 100 LM', ui: 'EA', qty: 1, cadence: 'A', slot: 1, group: 'FIELD' },
  { line: '19', nomenclature: 'KNIFE, UTILITY, FOLDING', ui: 'EA', qty: 1, cadence: 'A', slot: 3, group: 'FIELD' },
  { line: '20', nomenclature: 'KIT, FIRST AID, POCKET', ui: 'KT', qty: 1, cadence: 'A', slot: 5, group: 'FIELD' },
  { line: '21', nomenclature: 'CLIPPER, NAIL, STEEL', ui: 'EA', qty: 1, cadence: 'A', slot: 7, group: 'HYGIENE' },
  { line: '22', nomenclature: 'CAP, WATCH, KNIT, BLACK', ui: 'EA', qty: 1, cadence: 'A', slot: 9, group: 'GARMENT' },
  { line: '23', nomenclature: 'BOTTLE, WATER, STEEL, 750 ML', ui: 'EA', qty: 1, cadence: 'A', slot: 11, group: 'FIELD' },
]

/** Doctrine — the System's terms, stated once, in order. */
export const BASICS_DOCTRINE: string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE BOX. ONE MONTH. 23 LINES ON CADENCE.',
  'THE MEMBER IS ON STRENGTH, NOT A CUSTOMER.',
  'WHAT IS ISSUED IS PUBLISHED. THE LEDGER IS THE MARKETING.',
  'NO SCENT. NO COLOR. NO SURPLUS. REPLACE BEFORE FAILURE.',
  'STAND DOWN AT ANY TIME. AI USERSHIP IS RETAINED.',
]

/** Membership state machine (Month 2). Declared now so the status line is stable. */
export type BasicsState = 'OPEN TAB' | 'USERSHIP/AI' | 'PENDING' | 'ON STRENGTH' | 'STEADY STATE'

/** Pure: which lines are drawn on issue n (0-indexed from cadence start). */
export function basicsLinesForIssue(n: number): BasicsLineItem[] {
  return BASICS_LOAD.filter(
    (item) => n % BASICS_CADENCE_PERIOD[item.cadence] === item.slot
  )
}

/** Public manifest projection — the only shape that leaves the server. */
export function basicsPublicManifest() {
  return {
    fm: BASICS_FM,
    module: BASICS_MODULE,
    priceUsdMonthly: BASICS_PRICE_USD,
    lines: BASICS_LOAD.map(({ line, nomenclature, ui, qty, cadence, group }) => ({
      line,
      nomenclature,
      ui,
      qty,
      cadence: BASICS_CADENCE_LABEL[cadence],
      group,
    })),
    doctrine: BASICS_DOCTRINE,
    cogs: 'WITHHELD',
  }
}
