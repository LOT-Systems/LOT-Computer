/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — pure helpers shared by client and server.
 *
 * Log command grammar:   /email to <Name>[.|:|,|—] <body>
 *   - first line of body (up to 60 chars) doubles as the subject
 *   - "Name" is one or two words (first name, or first + last name)
 */

export const MAX_EMAIL_BODY_LENGTH = 5000
export const MAX_EMAIL_SUBJECT_LENGTH = 200

export interface ParsedEmailCommand {
  to: string
  body: string
}

const EMAIL_CMD_RE =
  /(?:^|\s)\/email\s+to\s+([^\s.:,;—–-]+(?:\s+[^\s.:,;—–-]+)?)\s*(?:[.:,;—–-]\s*|\s+)([\s\S]*)$/i

/** True when text contains the /email token at all (used for the hint UI). */
export function hasEmailCommand(text: string): boolean {
  return /(?:^|\s)\/email(\s|$)/i.test(text || '')
}

/**
 * Parse "/email to Hitomi. Hello there" → { to: 'Hitomi', body: 'Hello there' }.
 * Returns null when the command is incomplete. A second word is treated as a
 * last name only when it is capitalised — "to Hitomi hello" keeps "hello" in the body.
 */
export function parseEmailCommand(text: string): ParsedEmailCommand | null {
  if (!text) return null
  const m = text.match(EMAIL_CMD_RE)
  if (!m) return null
  let to = m[1].trim()
  let body = (m[2] || '').trim()
  const words = to.split(/\s+/)
  if (words.length === 2 && !/^[A-ZА-ЯЁ]/.test(words[1])) {
    to = words[0]
    body = `${words[1]} ${body}`.trim()
  }
  return { to, body }
}

export function subjectFromBody(body: string): string {
  const first = (body || '').split('\n')[0].trim()
  if (!first) return '(no subject)'
  return first.length > 60 ? `${first.slice(0, 57)}...` : first
}

export interface NameCandidate {
  id: string
  firstName: string | null
  lastName: string | null
}

/**
 * Resolve a typed name against candidates.
 * Exact full-name or first-name match wins; otherwise unique prefix match.
 * Returns every candidate that matched so the caller can report ambiguity.
 */
export function matchRecipients<T extends NameCandidate>(
  query: string,
  candidates: T[]
): T[] {
  const q = (query || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!q) return []
  const full = (c: T) =>
    `${c.firstName || ''} ${c.lastName || ''}`.trim().toLowerCase().replace(/\s+/g, ' ')
  const first = (c: T) => (c.firstName || '').trim().toLowerCase()
  const exact = candidates.filter((c) => full(c) === q || first(c) === q)
  if (exact.length) return exact
  return candidates.filter((c) => full(c).startsWith(q))
}
