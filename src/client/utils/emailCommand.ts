/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email command parser (pure — no stores, no DOM).
 *
 * A log is an email when its first line is `/email to <Name>`:
 *
 *   /email to Hitomi
 *   See you at the cohort meetup.
 *
 * or on one line, ending the name with `.`, `:` or `,`:
 *
 *   /email to Hitomi. See you at the cohort meetup.
 *
 * Sending happens on Ctrl/Cmd+Enter, never while typing.
 */

export interface EmailCommand {
  to: string
  body: string
}

const EMAIL_RE = /^\s*\/email\s+to\s+([^\n.:,]+?)\s*(?:[.:,]\s*([^\n]*))?(?:\n([\s\S]*))?$/i

export function parseEmailCommand(text: string): EmailCommand | null {
  const m = EMAIL_RE.exec(text || '')
  if (!m) return null
  const to = m[1].trim()
  const body = [m[2], m[3]].filter(Boolean).join('\n').trim()
  if (!to) return null
  return { to, body }
}

/** Log text after a successful send — keeps a readable receipt. */
export function emailReceipt(to: string, body: string): string {
  return `✉ SENT → ${to}\n${body}`
}

/** Draft handed from Cohort/Community to the Log composer. */
export const EMAIL_DRAFT_KEY = 'lot:email-draft'
