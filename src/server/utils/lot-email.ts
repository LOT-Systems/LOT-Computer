/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — command parsing (pure, no I/O).
 *
 * Compose in Log:   /email to Hitomi. Dinner at 8? /send
 * The email is only sent once the text ends with /send, because Log
 * autosaves while typing and a half-typed draft must never go out.
 */

export const MAX_EMAIL_BODY_LENGTH = 5000
export const MAX_EMAIL_SUBJECT_LENGTH = 120

export type ParsedEmailCommand = {
  recipient: string
  body: string
  ready: boolean // true once "/send" terminates the text
}

const EMAIL_RE = /^\s*\/email\s+to\s+([^.:\n]{1,60})[.:]?\s*([\s\S]*)$/i
const SEND_RE = /\s*\/send\s*$/i

export function parseEmailCommand(text: string): ParsedEmailCommand | null {
  const m = EMAIL_RE.exec(text || '')
  if (!m) return null
  let body = m[2]
  const ready = SEND_RE.test(body)
  if (ready) body = body.replace(SEND_RE, '')
  return {
    recipient: m[1].trim().replace(/\s+/g, ' '),
    body: body.trim().slice(0, MAX_EMAIL_BODY_LENGTH),
    ready,
  }
}

export function subjectFromBody(body: string): string {
  const first = body.split('\n')[0].trim()
  return first.length > MAX_EMAIL_SUBJECT_LENGTH
    ? first.slice(0, MAX_EMAIL_SUBJECT_LENGTH - 1) + '…'
    : first
}
