/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — Log command parser.
 *
 * Grammar (case-insensitive, anywhere in a log):
 *
 *   /email to Hitomi.            ← recipient = first word, body = following lines
 *   /email to Hitomi Hello there ← recipient = first word, body = rest of line + following lines
 *   /email to Hitomi K: Hello    ← colon allows a multi-word recipient
 *
 * Trailing punctuation on the recipient ("Hitomi." / "Hitomi,") is stripped.
 * Pure function: no DOM, no stores — shared by client (Log) and server (/api/email).
 */

export const MAX_EMAIL_LENGTH = 2000

export interface EmailCommand {
  to: string
  body: string
}

const COMMAND_RE = /(^|\s)\/email\s+to\s+([^\n]*)/i

export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = COMMAND_RE.exec(text)
  if (!m) return null

  const line = m[2]
  const afterLine = text.slice(m.index + m[0].length).replace(/^\n/, '')

  let to: string
  let inlineBody: string
  const colon = line.indexOf(':')
  if (colon > -1) {
    to = line.slice(0, colon)
    inlineBody = line.slice(colon + 1)
  } else {
    const parts = line.trim().split(/\s+/)
    to = parts.shift() || ''
    inlineBody = parts.join(' ')
  }

  to = to.trim().replace(/[.,;!?]+$/, '').trim()
  if (!to || to.length > 80) return null

  const body = [inlineBody.trim(), afterLine.trim()]
    .filter(Boolean)
    .join('\n')
    .slice(0, MAX_EMAIL_LENGTH)

  return { to, body }
}
