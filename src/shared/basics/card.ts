/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC — PRINTED MANIFEST CARD (line 23). Pure text, fixed 48-column grid.
 * Rendered in-app (<pre>) and printed as-is on the card stock. White ground, black ink.
 */
import { issueLoad, MANUAL_REF, RATION_COUNT } from './manifest'
import type { Roster } from './engine'

export const CARD_COLS = 48
const RULE = '='.repeat(CARD_COLS)
const THIN = '-'.repeat(CARD_COLS)
const pad = (a: string, b: string) =>
  a.length + b.length + 1 > CARD_COLS ? `${a} ${b}` : a + ' '.repeat(CARD_COLS - a.length - b.length) + b

export type CardInput = {
  issue: number
  due: string
  roster: Roster
  /** Next issue date after this one */
  next: string
}

export const manifestCard = ({ issue, due, roster, next }: CardInput): string => {
  const load = issueLoad(issue)
  const s = roster.shipping
  const held = new Set(roster.holds)
  return [
    RULE,
    pad(MANUAL_REF, `ISSUE ${String(issue).padStart(2, '0')}`),
    pad('BASIC RATION — ON STRENGTH', due),
    RULE,
    `TO  ${s.name}`.toUpperCase().slice(0, CARD_COLS),
    ...[s.line1, s.line2, `${s.city}, ${s.region} ${s.postal}`]
      .filter(Boolean)
      .map((l) => `    ${l}`.toUpperCase().slice(0, CARD_COLS)),
    THIN,
    pad('LINE  NOMENCLATURE', 'SPEC'),
    THIN,
    ...load.map((i) =>
      pad(`${i.line}    ${i.nomenclature}${held.has(i.line) ? ' [HOLD]' : ''}`, i.spec)
    ),
    THIN,
    pad(`LINES THIS ISSUE ${load.length}/${RATION_COUNT}`, `NEXT ISSUE ${next}`),
    'ISSUED. NOT SOLD. YOU ARE ON STRENGTH.',
    RULE,
  ].join('\n')
}
