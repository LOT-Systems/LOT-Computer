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
 *   /email to Hitomi. Dinner Friday?
 *   Are you free at 7?
 *
 * The period after the name ends the address. The first line after it is
 * the subject; the rest is the body. A single line is both subject and body.
 * The email is only sent on Cmd/Ctrl+Enter, never while typing.
 */
export interface EmailDraft {
  to: string
  subject: string
  body: string
}

const EMAIL_RE = /(?:^|\s)\/email\s+to\s+([^\s.:,\n]+(?:\s[^\s.:,\n]+)?)\s*[.:,]\s*([\s\S]*)$/i

export function parseEmailCommand(text: string): EmailDraft | null {
  const m = EMAIL_RE.exec(text || '')
  if (!m) return null
  const content = m[2].trim()
  if (!content) return null
  const lines = content.split('\n')
  const subject = lines[0].trim().slice(0, 120)
  const rest = lines.slice(1).join('\n').trim()
  return { to: m[1].trim(), subject, body: rest || content }
}
