/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 */

// LOT-FM-001 / Section 2 — 23-Item Ration Load
// COGS withheld. Cadence fixed. Load fixed.

export type Cadence = 'MONTHLY' | 'QUARTERLY' | 'SEMI-ANNUAL' | 'ANNUAL'

export type RationItem = {
  no: string
  nomenclature: string
  cadence: Cadence
}

export const RATION_MANIFEST: RationItem[] = [
  { no: '001', nomenclature: 'ENERGY BAR, DENSE, 2400 KCAL',       cadence: 'MONTHLY'     },
  { no: '002', nomenclature: 'ELECTROLYTE PACKET, 10-CT',           cadence: 'MONTHLY'     },
  { no: '003', nomenclature: 'COFFEE, INSTANT, 14-CT',              cadence: 'MONTHLY'     },
  { no: '004', nomenclature: 'OATS, INSTANT, 7-CT',                 cadence: 'MONTHLY'     },
  { no: '005', nomenclature: 'TRAIL MIX, PORTIONED, 6-CT',          cadence: 'MONTHLY'     },
  { no: '006', nomenclature: 'PROTEIN BAR, 4-CT',                   cadence: 'MONTHLY'     },
  { no: '007', nomenclature: 'RATION PACK, FREEZE-DRIED VEG',       cadence: 'MONTHLY'     },
  { no: '008', nomenclature: 'GLUCOSE TABLET, 10-CT',               cadence: 'MONTHLY'     },
  { no: '009', nomenclature: 'SANITIZER, HAND, 2 OZ',               cadence: 'MONTHLY'     },
  { no: '010', nomenclature: 'GLOVE, NITRILE, PAIR',                cadence: 'MONTHLY'     },
  { no: '011', nomenclature: 'MASK, N95, INDIVIDUALLY SEALED',      cadence: 'MONTHLY'     },
  { no: '012', nomenclature: 'CARD, MANIFEST, PRINTED',             cadence: 'MONTHLY'     },
  { no: '013', nomenclature: 'WATER PURIFICATION TAB, 20-CT',       cadence: 'QUARTERLY'   },
  { no: '014', nomenclature: 'BANDAGE, ADHESIVE, 20-CT',            cadence: 'QUARTERLY'   },
  { no: '015', nomenclature: 'WIPE, ANTISEPTIC, 10-CT',             cadence: 'QUARTERLY'   },
  { no: '016', nomenclature: 'TABLET, IBUPROFEN 200MG, 24-CT',      cadence: 'QUARTERLY'   },
  { no: '017', nomenclature: 'CORD, PARACORD TYPE III, 10 FT',      cadence: 'QUARTERLY'   },
  { no: '018', nomenclature: 'FLASHLIGHT, MICRO, 1×AA',             cadence: 'QUARTERLY'   },
  { no: '019', nomenclature: 'TAPE, DUCT, MINI ROLL',               cadence: 'QUARTERLY'   },
  { no: '020', nomenclature: 'TIE, ZIP, 10-CT',                     cadence: 'QUARTERLY'   },
  { no: '021', nomenclature: 'MARKER, PERMANENT, FINE TIP',         cadence: 'QUARTERLY'   },
  { no: '022', nomenclature: 'PONCHO, EMERGENCY, SINGLE-USE',       cadence: 'SEMI-ANNUAL' },
  { no: '023', nomenclature: 'NOTEPAD, WATERPROOF, 3×5 IN',         cadence: 'SEMI-ANNUAL' },
]

export const ISSUE_PRICE_USD = 100
export const ISSUE_CADENCE = 'MONTHLY'
export const LOT_FM_REF = 'LOT-FM-001'
