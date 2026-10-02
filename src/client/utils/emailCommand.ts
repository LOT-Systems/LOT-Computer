/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email command parser (pure).
 *
 *   /email to Hitomi. Dinner at 8?        → { to: 'Hitomi', subject: 'Dinner at 8?', body: 'Dinner at 8?' }
 *   /email to Hitomi
 *   Subject line
 *   Longer body …                          → subject = first line, body = full text
 *
 * Sending is explicit (Ctrl/⌘+Enter in Log) so typing never fires a mail.
 */

export interface ParsedEmail {
  to: string
  subject: string
  body: string
}

export function parseEmailCommand(text: string): ParsedEmail | null {
  if (!text) return null
  const m = /(?:^|\s)\/email\s+to\s+([^\s.,:;!?]+)[.,:;]?[ \t]*([\s\S]*)$/i.exec(text)
  if (!m) return null
  const to = m[1].trim()
  const body = m[2].trim()
  if (!to || !body) return null
  const subject = body.split('\n')[0].trim().slice(0, 80)
  return { to, subject, body }
}

/** True when the text contains an /email to NAME header (even without a body yet). */
export function hasEmailHeader(text: string): boolean {
  return /(?:^|\s)\/email\s+to\s+\S+/i.test(text || '')
}
