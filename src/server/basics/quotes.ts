/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC — SUPPLIER QUOTES (SERVER ONLY, WITHHELD FROM PUBLIC LEDGER)
 *
 * One entry per ration line, landed unit cost at the fulfillment dock in USD
 * cents. A line with no entry, or an expired entry, falls back to the ESTIMATE
 * in cogs.ts. COGS flips to QUOTED only when all 23 lines hold a live quote.
 * Never import this file from src/client or src/shared.
 */
import { QUOTE_DATA } from '#server/basics/quotes.data'

export type Quote = {
  supplier: string
  /** Landed unit cost, USD cents, for one ration unit as specified in the manifest. */
  unitCents: number
  /** Minimum order quantity, ration units. */
  moq: number
  /** ISO date the quote was issued. */
  quotedOn: string
  /** Days the quote stays valid. */
  validDays: number
}

/** Confirmed quotes keyed by line "01".."23". Fed by `npm run basics:quotes` -> quotes.data.ts. */
export const QUOTES: Record<string, Quote> = QUOTE_DATA

export const isLive = (q: Quote, now: Date): boolean => {
  const issued = Date.parse(q.quotedOn)
  if (Number.isNaN(issued) || !(q.unitCents > 0) || !(q.moq > 0)) return false
  return now.getTime() <= issued + q.validDays * 86_400_000
}

export const liveQuote = (
  line: string,
  now: Date,
  quotes: Record<string, Quote> = QUOTES
): Quote | null => {
  const q = quotes[line]
  return q && isLive(q, now) ? q : null
}
