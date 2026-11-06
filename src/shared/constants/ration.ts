/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC RATION — single source of truth (client + server)
// 23-ITEM CIVILIAN RATION LOAD + CADENCE RULE

export type RationCadence = 'MONTHLY' | 'QUARTERLY' | 'SEMI-ANNUALLY' | 'ANNUALLY'

export type RationItem = {
  seq: string
  nomenclature: string
  cadence: RationCadence
  qty: number
  unit: string
  category: 'HYGIENE' | 'HEALTH' | 'SUSTENANCE' | 'OPERATIONAL'
}

export const RATION_MANIFEST: RationItem[] = [
  { seq: '01', nomenclature: 'SOAP, CASTILE, UNSCENTED',          cadence: 'MONTHLY',       qty: 1, unit: '4OZ BAR',        category: 'HYGIENE' },
  { seq: '02', nomenclature: 'SHAMPOO, LIQUID, UNSCENTED',         cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '03', nomenclature: 'CONDITIONER, LIGHT',                 cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '04', nomenclature: 'BODY WASH, FOAMING',                 cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '05', nomenclature: 'TOOTHPASTE, FLUORIDE',               cadence: 'MONTHLY',       qty: 1, unit: '1OZ TUBE',       category: 'HYGIENE' },
  { seq: '06', nomenclature: 'DENTAL FLOSS, WAXED',                cadence: 'MONTHLY',       qty: 1, unit: '30YD',           category: 'HYGIENE' },
  { seq: '07', nomenclature: 'TOOTHBRUSH, SOFT, MANUAL',           cadence: 'QUARTERLY',     qty: 1, unit: 'EACH',           category: 'HYGIENE' },
  { seq: '08', nomenclature: 'DEODORANT, SOLID, UNSCENTED',        cadence: 'MONTHLY',       qty: 1, unit: '1OZ STICK',      category: 'HYGIENE' },
  { seq: '09', nomenclature: 'LIP BALM, SPF-15',                   cadence: 'MONTHLY',       qty: 1, unit: 'EACH',           category: 'HYGIENE' },
  { seq: '10', nomenclature: 'MOISTURIZER, FRAGRANCE-FREE',        cadence: 'MONTHLY',       qty: 1, unit: '1OZ',            category: 'HYGIENE' },
  { seq: '11', nomenclature: 'SUNSCREEN, MINERAL, SPF-50',         cadence: 'MONTHLY',       qty: 1, unit: '1OZ',            category: 'HYGIENE' },
  { seq: '12', nomenclature: 'HAND SANITIZER, 70% ETHANOL',        cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '13', nomenclature: 'NAIL CLIPPERS, STAINLESS STEEL',     cadence: 'SEMI-ANNUALLY', qty: 1, unit: 'EACH',           category: 'HYGIENE' },
  { seq: '14', nomenclature: 'BANDAGES, ADHESIVE, ASSORTED',       cadence: 'QUARTERLY',     qty: 1, unit: '10CT',           category: 'HEALTH' },
  { seq: '15', nomenclature: 'VITAMIN C, 500MG TABLET',            cadence: 'MONTHLY',       qty: 1, unit: '30CT',           category: 'HEALTH' },
  { seq: '16', nomenclature: 'MULTIVITAMIN, DAILY TABLET',         cadence: 'MONTHLY',       qty: 1, unit: '30CT',           category: 'HEALTH' },
  { seq: '17', nomenclature: 'MELATONIN, 3MG TABLET',              cadence: 'MONTHLY',       qty: 1, unit: '30CT',           category: 'HEALTH' },
  { seq: '18', nomenclature: 'ELECTROLYTE POWDER, SACHET',         cadence: 'MONTHLY',       qty: 4, unit: 'CT',             category: 'HEALTH' },
  { seq: '19', nomenclature: 'PROTEIN BAR, ASSORTED',              cadence: 'MONTHLY',       qty: 2, unit: 'CT',             category: 'SUSTENANCE' },
  { seq: '20', nomenclature: 'COFFEE, GROUND, DARK ROAST',         cadence: 'MONTHLY',       qty: 1, unit: '3OZ BAG',        category: 'SUSTENANCE' },
  { seq: '21', nomenclature: 'TEA, ASSORTED BAGS',                 cadence: 'MONTHLY',       qty: 1, unit: '10CT',           category: 'SUSTENANCE' },
  { seq: '22', nomenclature: 'NOTECARD, RULED',                    cadence: 'QUARTERLY',     qty: 1, unit: '50-SHEET PAD',   category: 'OPERATIONAL' },
  { seq: '23', nomenclature: 'PEN, BALLPOINT, BLACK',              cadence: 'QUARTERLY',     qty: 2, unit: 'CT',             category: 'OPERATIONAL' },
]


/**
 * CADENCE RULE (one definition, used by ledger, card, engine, server):
 *   MONTHLY       every issue
 *   QUARTERLY     issues 1, 4, 7, 10 ...   (every 3rd)
 *   SEMI-ANNUALLY issues 1, 7, 13 ...      (every 6th)
 *   ANNUALLY      issues 1, 13, 25 ...     (every 12th)
 * Issue #1 therefore carries the full 23-item load.
 */
export const rationCadenceDue = (cadence: RationCadence, issueNumber: number): boolean => {
  const i = Math.max(1, Math.floor(issueNumber)) - 1
  switch (cadence) {
    case 'MONTHLY':       return true
    case 'QUARTERLY':     return i % 3 === 0
    case 'SEMI-ANNUALLY': return i % 6 === 0
    case 'ANNUALLY':      return i % 12 === 0
  }
}

export const rationItemsForIssue = (issueNumber: number): RationItem[] =>
  RATION_MANIFEST.filter((item) => rationCadenceDue(item.cadence, issueNumber))
