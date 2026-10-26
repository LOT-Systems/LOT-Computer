/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Mail — command parser (shared by Log composer and tests).
 *
 * Grammar:  /email to <Name>[.:,;—-] <body>
 *   "/email to Hitomi. Dinner at 8?"      -> { to: 'Hitomi', body: 'Dinner at 8?' }
 *   "/email to Hitomi Tanaka: see you"    -> { to: 'Hitomi Tanaka', body: 'see you' }
 *   "/email to Hitomi."                   -> { to: 'Hitomi', body: '' }
 * The recipient is 1–2 words. Body may span multiple lines.
 */
export const MAX_MAIL_BODY_LENGTH = 2000

export type MailCommand = { to: string; body: string }

const HEAD = String.raw`(?:^|\s)\/(?:email|mail)\s+to\s+`
// "Hitomi Tanaka: ..." — two-word name only when a delimiter closes it
const FULL_RE = new RegExp(HEAD + String.raw`([^\s.,:;—]+[ \t]+[^\s.,:;—]+)[ \t]*[.,:;—]\s*([\s\S]*)$`, 'i')
// "Hitomi. ..." or "Hitomi ..." — first word is the recipient
const FIRST_RE = new RegExp(HEAD + String.raw`([^\s.,:;—]+)[ \t]*[.,:;—]?\s*([\s\S]*)$`, 'i')

export function parseMailCommand(text: string): MailCommand | null {
  if (!text) return null
  const m = FULL_RE.exec(text) || FIRST_RE.exec(text)
  if (!m) return null
  return { to: m[1].trim(), body: m[2].trim().slice(0, MAX_MAIL_BODY_LENGTH) }
}
