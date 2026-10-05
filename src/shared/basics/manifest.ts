/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT-FM-001 / BASIC RATION MODULE
 * SECTION 1 — RATION MANIFEST + DOCTRINE (public data: nomenclature + cadence; COGS withheld)
 */

export type RationCategory = 'HYGIENE' | 'GROOMING' | 'GARMENT' | 'SUSTENANCE' | 'RECORD'
export type CadenceMonths = 1 | 2 | 3 | 6 | 12

export type RationItem = {
  /** Line number, "01".."23" */
  line: string
  nomenclature: string
  spec: string
  category: RationCategory
  /** Issued every N months */
  everyMonths: CadenceMonths
  /** First issue number (1-based) in which the line ships. Staggers the load. */
  phase: number
}

export const cadenceLabel = (n: CadenceMonths): string =>
  n === 1 ? 'MONTHLY' : n === 12 ? 'ANNUAL' : `EVERY ${n} MO`

// 23-line civilian ration load. Provisional until S-2 signs the manifest.
// Per-line spec, cadence and phase are the load engine's only inputs.
export const RATION_MANIFEST: readonly RationItem[] = [
  { line: '01', nomenclature: 'TOOTHPASTE',               spec: '100 ML',     category: 'HYGIENE',    everyMonths: 1,  phase: 1 },
  { line: '02', nomenclature: 'TOOTHBRUSH',               spec: '1 EA',       category: 'HYGIENE',    everyMonths: 3,  phase: 1 },
  { line: '03', nomenclature: 'FLOSS, WAXED',             spec: '2 CT',       category: 'HYGIENE',    everyMonths: 2,  phase: 2 },
  { line: '04', nomenclature: 'SOAP, BAR',                spec: '1 EA',       category: 'HYGIENE',    everyMonths: 1,  phase: 1 },
  { line: '05', nomenclature: 'BODY WASH',                spec: '250 ML',     category: 'HYGIENE',    everyMonths: 2,  phase: 1 },
  { line: '06', nomenclature: 'SHAMPOO',                  spec: '250 ML',     category: 'HYGIENE',    everyMonths: 2,  phase: 2 },
  { line: '07', nomenclature: 'DEODORANT',                spec: '1 EA',       category: 'HYGIENE',    everyMonths: 1,  phase: 1 },
  { line: '08', nomenclature: 'RAZOR CARTRIDGES',         spec: '4 PK',       category: 'GROOMING',   everyMonths: 2,  phase: 2 },
  { line: '09', nomenclature: 'HAND SOAP, REFILL',        spec: '500 ML',     category: 'HYGIENE',    everyMonths: 2,  phase: 1 },
  { line: '10', nomenclature: 'LIP BALM',                 spec: '1 EA',       category: 'GROOMING',   everyMonths: 3,  phase: 2 },
  { line: '11', nomenclature: 'SUNSCREEN, SPF 30',        spec: '100 ML',     category: 'GROOMING',   everyMonths: 6,  phase: 6 },
  { line: '12', nomenclature: 'UNDERWEAR',                spec: '2 PK',       category: 'GARMENT',    everyMonths: 3,  phase: 3 },
  { line: '13', nomenclature: 'SOCKS',                    spec: '3 PK',       category: 'GARMENT',    everyMonths: 3,  phase: 2 },
  { line: '14', nomenclature: 'T-SHIRT, PLAIN',           spec: '1 EA',       category: 'GARMENT',    everyMonths: 6,  phase: 4 },
  { line: '15', nomenclature: 'TOWEL, FACE',              spec: '1 EA',       category: 'GARMENT',    everyMonths: 6,  phase: 5 },
  { line: '16', nomenclature: 'TISSUE, POCKET',           spec: '6 PK',       category: 'HYGIENE',    everyMonths: 1,  phase: 1 },
  { line: '17', nomenclature: 'SWABS, COTTON',            spec: '100 CT',     category: 'HYGIENE',    everyMonths: 3,  phase: 3 },
  { line: '18', nomenclature: 'NAIL CLIPPER',             spec: '1 EA',       category: 'GROOMING',   everyMonths: 12, phase: 9 },
  { line: '19', nomenclature: 'COMB',                     spec: '1 EA',       category: 'GROOMING',   everyMonths: 12, phase: 8 },
  { line: '20', nomenclature: 'LAUNDRY SHEETS',           spec: '30 CT',      category: 'HYGIENE',    everyMonths: 1,  phase: 1 },
  { line: '21', nomenclature: 'FIELD BARS, SHELF-STABLE', spec: '6 CT',       category: 'SUSTENANCE', everyMonths: 1,  phase: 1 },
  { line: '22', nomenclature: 'ELECTROLYTE STICKS',       spec: '10 CT',      category: 'SUSTENANCE', everyMonths: 1,  phase: 1 },
  { line: '23', nomenclature: 'MANIFEST CARD, PRINTED',   spec: '1 EA',       category: 'RECORD',     everyMonths: 1,  phase: 1 },
]

export const DOCTRINE_LINES = [
  'BASIC IS THE PHYSICAL LAYER OF THE LOT® SYSTEM.',
  'ONE RATION PER OPERATOR PER MONTH. ISSUED. NOT SOLD.',
  'THE LEDGER IS THE MARKETING. NO LAYER BETWEEN PUBLIC AND MANIFEST.',
  'LANDED COST CEILING USD 40.00. MARGIN FLOOR 60%. NEVER BREACHED.',
]

export const PRICE_LINE = 'USD 100.00 / MO. ADDITIVE TO USERSHIP / AI.'
export const MANUAL_REF = 'LOT-FM-001'
export const RATION_COUNT = 23
export const SCHEDULE_HORIZON = 12

/** Is this line issued in ration issue `n` (1-based)? */
export const isIssued = (item: RationItem, n: number): boolean =>
  n >= item.phase && (n - item.phase) % item.everyMonths === 0

/** Month-by-month load engine: the lines that ship in issue `n`. */
export const issueLoad = (n: number): RationItem[] =>
  RATION_MANIFEST.filter((i) => isIssued(i, n))

/** First issue number >= `from` in which `item` ships. */
export const nextIssueOf = (item: RationItem, from: number): number => {
  if (from <= item.phase) return item.phase
  return item.phase + Math.ceil((from - item.phase) / item.everyMonths) * item.everyMonths
}
