/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — pure parsing helpers shared by client (Log) and server.
 *
 * Grammar (case-insensitive, one command per log):
 *
 *   /email to Hitomi. See you at the walk.
 *   /email to Hitomi S. Thank you.
 *   /email Hitomi: running late
 *   /email to Hitomi
 *   multi-line body follows on the next lines
 *
 * After sending, the client rewrites "/email" → "✉" so the command
 * never fires twice and the log keeps a readable record.
 */

export const MAX_LOT_EMAIL_LENGTH = 4000
export const LOT_EMAIL_HOURLY_LIMIT = 30
export const LOT_EMAIL_SENT_MARK = '✉'

export interface ParsedRecipient {
  first: string
  last: string | null
}

export interface ParsedEmailCommand {
  to: string
  recipient: ParsedRecipient
  body: string
  /** index in the source text where "/email" starts */
  index: number
}

const NAME = "[\\p{L}][\\p{L}'\\-]*"

// "/email" token, optional "to", name (+ optional surname / initial), terminator
const COMMAND_RE = new RegExp(
  `(^|\\s)\\/email[ \\t]+(?:to[ \\t]+)?(${NAME}(?:[ \\t]+${NAME})?)[ \\t]*(?:[.:,—–]|\\r?\\n|$)`,
  'iu'
)

export function parseEmailRecipient(raw: string): ParsedRecipient | null {
  const cleaned = String(raw || '')
    .replace(/^\s*to\s+/i, '')
    .replace(/[.:,—–]+\s*$/u, '')
    .trim()
  if (!cleaned) return null
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0 || parts.length > 2) return null
  const valid = /^[\p{L}][\p{L}'\-]*\.?$/u
  if (!parts.every((p) => valid.test(p))) return null
  if (parts.length === 1 && parts[0].toLowerCase() === 'to') return null
  return {
    first: parts[0].replace(/\.$/, ''),
    last: parts[1] ? parts[1].replace(/\.$/, '') : null,
  }
}

/** True when text contains an unsent "/email" token at all. */
export function hasEmailCommand(text: string): boolean {
  return /(^|\s)\/email(\s|$)/i.test(text || '')
}

export function parseEmailCommand(text: string): ParsedEmailCommand | null {
  if (!text) return null
  const m = COMMAND_RE.exec(text)
  if (!m) return null
  const recipient = parseEmailRecipient(m[2])
  if (!recipient) return null
  const index = m.index + m[1].length
  const body = text
    .slice(m.index + m[0].length)
    .trim()
    .slice(0, MAX_LOT_EMAIL_LENGTH)
  return { to: m[2], recipient, body, index }
}

/** Rewrite the first "/email" token into the sent mark. */
export function markEmailSent(text: string): string {
  return text.replace(/(^|\s)\/email(?=\s|$)/i, (_all, pre) => `${pre}${LOT_EMAIL_SENT_MARK}`)
}
