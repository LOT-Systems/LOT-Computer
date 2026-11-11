/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — command grammar (shared by Log client + API server).
 *
 *   /email to Hitomi
 *   Body of the message on the following lines.
 *
 *   /email to Hitomi Kato: inline body works too
 *
 * The recipient is a LOT Community member resolved by name. Trailing
 * punctuation ("/email to Hitomi.") is ignored.
 */

export const LOT_EMAIL_MAX_LENGTH = 2000

export type LotEmailCommand = {
  /** Recipient name exactly as typed, cleaned of trailing punctuation */
  to: string
  /** Message body (may be empty while the user is still typing) */
  body: string
}

const COMMAND_RE = /(^|\n)[ \t]*\/email[ \t]+to[ \t]+([^\n]*)/i

export function parseLotEmailCommand(text: string | null | undefined): LotEmailCommand | null {
  if (!text) return null
  const match = COMMAND_RE.exec(text)
  if (!match) return null

  let header = match[2]
  let inlineBody = ''
  const colon = header.search(/[:—]/)
  if (colon > -1) {
    inlineBody = header.slice(colon + 1).trim()
    header = header.slice(0, colon)
  }

  const to = header.replace(/[.,;!?\s]+$/g, '').replace(/^@/, '').trim()
  if (!to) return null

  const after = text.slice(match.index + match[0].length)
  const restLines = after.replace(/^\n/, '')
  const body = [inlineBody, restLines]
    .filter((part) => part && part.trim())
    .join('\n')
    .trim()
    .slice(0, LOT_EMAIL_MAX_LENGTH)

  return { to, body }
}

/** Receipt line written back into the Log after a successful send */
export function lotEmailReceipt(name: string, time: string): string {
  return `✉ EMAIL [SENT] → ${name} · ${time}`
}

/** Normalize a person's name for matching */
export function normalizeName(s: string | null | undefined): string {
  return (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Score how well `query` names a person. 0 = no match.
 * 100 full name · 90 first name · 70 last name · 40 prefix.
 */
export function scoreNameMatch(
  query: string,
  person: { firstName?: string | null; lastName?: string | null }
): number {
  const q = normalizeName(query)
  if (!q) return 0
  const first = normalizeName(person.firstName)
  const last = normalizeName(person.lastName)
  const full = `${first} ${last}`.trim()
  if (full && q === full) return 100
  if (first && q === first) return 90
  if (last && q === last) return 70
  if (full && full.startsWith(q) && q.length >= 2) return 40
  if (last && last.startsWith(q) && q.length >= 2) return 30
  return 0
}
