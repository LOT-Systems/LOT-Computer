/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — command parser (pure, shared by client + tests)
 *
 * Grammar (typed in a Log):
 *   /email to Hitomi: See you at the sync.
 *   /email to Hitomi, running late
 *   /email to Hitomi
 *   running late          <- body may continue on following lines
 */

export const MAX_EMAIL_LENGTH = 4000

export type EmailCommand = { to: string; body: string }

const EMAIL_RE = /(?:^|\s)\/email\s+to\s+@?([^\s:,;.!?]+)[\s:,;.!?-]*([\s\S]*)$/i

/** Returns the recipient name + body, or null when the text has no complete /email command. */
export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = EMAIL_RE.exec(text)
  if (!m) return null
  const to = m[1].trim()
  const body = m[2].trim().slice(0, MAX_EMAIL_LENGTH)
  if (!to) return null
  return { to, body }
}
