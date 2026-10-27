/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 *
 * Fixed-grid ledger renderer. Pure text, 3270 register. Shared by the
 * public /basics page and the in-app Basics tab.
 */
import {
  BASIC_DOCTRINE,
  BASIC_MANIFEST,
  BASIC_PRICE_USD,
  CADENCE_LABEL,
  STATUS_LINE,
} from './manifest'

export const GRID = 54

const rule = (c = '=') => c.repeat(GRID)

export const ledgerLine = (
  no: number,
  nomenclature: string,
  qty: number,
  cadence: string
): string => {
  const left = `${String(no).padStart(2, '0')}  ${nomenclature}`
  const right = `${String(qty).padStart(2, ' ')}  ${cadence.padEnd(10)}`
  return left.padEnd(GRID - right.length) + right
}

export const renderLedger = (): string => {
  const out: string[] = [STATUS_LINE(), rule(), ...BASIC_DOCTRINE, rule(), 'NO  NOMENCLATURE'.padEnd(GRID - 15) + 'QTY  CADENCE   ']
  out.push(rule('-'))
  for (const it of BASIC_MANIFEST) {
    out.push(ledgerLine(it.no, it.nomenclature, it.qty, CADENCE_LABEL[it.cadence]))
  }
  out.push(rule('-'))
  out.push(`TOTAL ITEMS: ${BASIC_MANIFEST.length}`)
  out.push(`TERMS: USD ${BASIC_PRICE_USD}/MO. CANCEL ANY MONTH. STAND DOWN.`)
  out.push(rule())
  return out.join('\n')
}
