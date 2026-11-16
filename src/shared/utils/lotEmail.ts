/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — the simplest possible letter system.
 *
 * A LOT® Email is a DirectMessage whose body starts with LOT_EMAIL_PREFIX.
 * No new table, no migration: letters ride the existing direct_messages
 * rails and surface in Sync. Composed from Log with:
 *
 *   /email to Hitomi. Thank you for the walk yesterday.
 *   /email to Hitomi K: see you at the cohort dinner
 *   /email to Hitomi
 *   Multi-line body on the following lines.
 *
 * Pure module — shared by client (Log parser, Sync renderer) and server.
 */

export const LOT_EMAIL_PREFIX = '✉ LOT EMAIL\n'
export const LOT_EMAIL_MAX_LENGTH = 2000
export const LOT_EMAIL_HOURLY_LIMIT = 30

export interface EmailCommand {
  /** Recipient as typed: first name, optional last initial, or an email address */
  to: string
  /** Letter body (may be empty while the user is still typing) */
  body: string
  /** The exact command text matched, so the caller can replace it after sending */
  matched: string
}

// Name: one word (letters of any script, apostrophes, hyphens), optionally
// followed by a single last-name initial ("Hitomi K" / "Hitomi K.").
// Or a plain email address.
const NAME = `[\\p{L}][\\p{L}'’\\-]*(?:\\s+\\p{Lu}(?=[.:,\\n]|$)\\.?)?`
const EMAIL = `[^\\s@]+@[^\\s@]+\\.[^\\s@.,:;!?]+`
const COMMAND_RE = new RegExp(
  `(^|\\s)\\/email\\s+(?:to\\s+)?(${EMAIL}|${NAME})([\\s\\S]*)$`,
  'iu'
)

export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = text.match(COMMAND_RE)
  if (!m) return null
  const to = m[2].trim().replace(/\.$/, '')
  if (!to || to.toLowerCase() === 'to') return null
  const body = m[3].replace(/^[\s.:,;!—-]+/, '').trim()
  const matched = text.slice((m.index ?? 0) + m[1].length)
  return { to, body: body.slice(0, LOT_EMAIL_MAX_LENGTH), matched }
}

export function isLotEmail(message: string | null | undefined): boolean {
  return !!message && message.startsWith(LOT_EMAIL_PREFIX)
}

export function wrapLotEmail(body: string): string {
  return LOT_EMAIL_PREFIX + body.trim().slice(0, LOT_EMAIL_MAX_LENGTH)
}

export function unwrapLotEmail(message: string): string {
  return isLotEmail(message) ? message.slice(LOT_EMAIL_PREFIX.length) : message
}

/** Splits a recipient query into first name + optional last initial / email. */
export function parseRecipient(to: string): {
  email?: string
  firstName?: string
  lastInitial?: string
} {
  const t = to.trim()
  if (t.includes('@')) return { email: t.toLowerCase() }
  const [first, last] = t.split(/\s+/)
  return {
    firstName: first,
    lastInitial: last ? last.replace(/\./g, '').charAt(0).toUpperCase() : undefined,
  }
}
