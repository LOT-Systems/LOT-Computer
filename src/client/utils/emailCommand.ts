/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email command parser — pure, no stores or DOM.
 *
 *   /email to Hitomi. Dinner at 8?
 *   /email to Hitomi: Dinner at 8?
 *   /email to Hitomi
 *   Dinner at 8?
 */

export const MAX_EMAIL_LENGTH = 2000

export interface EmailCommand {
  to: string
  body: string
}

const EMAIL_RE = /(?:^|\s)\/email\s+to\s+([^\s.,:;!?]+)[.,:;!?]?\s*([\s\S]*)$/i

/** Returns the parsed command, or null when `text` is not a complete /email. */
export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = EMAIL_RE.exec(text)
  if (!m) return null
  const body = m[2].trim().slice(0, MAX_EMAIL_LENGTH)
  if (!body) return null
  return { to: m[1], body }
}
