/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT-FM-001 / BASIC RATION MODULE
 * SECTION 1 — RATION MANIFEST + DOCTRINE
 */

export type RationCadence = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
export type RationCategory = 'NUTRITION' | 'HEALTH' | 'HYGIENE' | 'EQUIPMENT'

export type RationItem = {
  line: string
  nomenclature: string
  spec: string
  cadence: RationCadence
  category: RationCategory
}

// 23-item civilian ration load per LOT-FM-001.
// COGS ceiling: USD 40.00 landed. Margin floor: 60%.
export const RATION_MANIFEST: RationItem[] = [
  { line: '01', nomenclature: 'ROLLED OATS',                     spec: '40 OZ',           cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '02', nomenclature: 'LENTILS, RED',                     spec: '2 LB',            cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '03', nomenclature: 'RICE, BROWN LONG GRAIN',           spec: '3 LB',            cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '04', nomenclature: 'COFFEE, DARK ROAST GROUND',        spec: '12 OZ',           cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '05', nomenclature: 'HONEY, RAW WILDFLOWER',            spec: '12 OZ',           cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '06', nomenclature: 'OLIVE OIL, COLD-PRESSED EVOO',     spec: '750 ML',          cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '07', nomenclature: 'SALT, KOSHER',                     spec: '1 LB',            cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '08', nomenclature: 'BLACK PEPPER, WHOLE',              spec: '2 OZ',            cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '09', nomenclature: 'APPLE CIDER VINEGAR, RAW',         spec: '16 OZ',           cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '10', nomenclature: 'SEEDS, MIXED (HEMP/CHIA/FLAX)',    spec: '12 OZ',           cadence: 'MONTHLY',   category: 'NUTRITION'  },
  { line: '11', nomenclature: 'VITAMIN D3',                       spec: '2000 IU / 90 CT', cadence: 'MONTHLY',   category: 'HEALTH'     },
  { line: '12', nomenclature: 'VITAMIN C',                        spec: '500 MG / 90 CT',  cadence: 'MONTHLY',   category: 'HEALTH'     },
  { line: '13', nomenclature: 'ELECTROLYTE POWDER',               spec: '30 SRV',          cadence: 'MONTHLY',   category: 'HEALTH'     },
  { line: '14', nomenclature: 'OMEGA-3, FISH OIL',                spec: '1000 MG / 60 CT', cadence: 'MONTHLY',   category: 'HEALTH'     },
  { line: '15', nomenclature: 'PROBIOTIC, MULTI-STRAIN',          spec: '30 CT',           cadence: 'MONTHLY',   category: 'HEALTH'     },
  { line: '16', nomenclature: 'MAGNESIUM GLYCINATE',              spec: '400 MG / 60 CT',  cadence: 'MONTHLY',   category: 'HEALTH'     },
  { line: '17', nomenclature: 'ZINC, CHELATED',                   spec: '15 MG / 60 CT',   cadence: 'MONTHLY',   category: 'HEALTH'     },
  { line: '18', nomenclature: 'SOAP, CASTILE UNSCENTED',          spec: '2 BAR',           cadence: 'MONTHLY',   category: 'HYGIENE'    },
  { line: '19', nomenclature: 'RAZOR, SAFETY + BLADES',           spec: '1 HDL / 10 BL',   cadence: 'MONTHLY',   category: 'HYGIENE'    },
  { line: '20', nomenclature: 'FLOSS, UNWAXED',                   spec: '2 CT',            cadence: 'MONTHLY',   category: 'HYGIENE'    },
  { line: '21', nomenclature: 'TOOTHPASTE, FLUORIDE-FREE',        spec: '4 OZ',            cadence: 'QUARTERLY', category: 'HYGIENE'    },
  { line: '22', nomenclature: 'DEODORANT, CRYSTAL MINERAL',       spec: '3.5 OZ',          cadence: 'QUARTERLY', category: 'HYGIENE'    },
  { line: '23', nomenclature: 'JOURNAL, FIELD (LOT-FM)',          spec: '1 EA',            cadence: 'QUARTERLY', category: 'EQUIPMENT'  },
]

export const DOCTRINE_LINES = [
  'BASIC is the physical layer of the LOT® System.',
  'One ration per operator per month. Issued. Not sold.',
  'The ledger is the marketing. No layer between public and manifest.',
  'COGS ceiling: USD 40.00 landed. Margin floor: 60%. Never breached.',
]

export const PRICE_LINE = 'USD 100.00 / MO.'
export const MANUAL_REF = 'LOT-FM-001'
export const RATION_COUNT = 23
