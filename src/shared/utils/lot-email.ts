/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — the simplest internal mail.
 *
 * Compose in Log:
 *   /email to Hitomi.
 *   The tea house on Thursday?
 *
 * or inline:
 *   /email to Hitomi: the tea house on Thursday?
 *
 * Stored as a DirectMessage whose text starts with LOT_EMAIL_MARKER,
 * so the same letter appears in the Sync inbox and in the DM thread.
 * Pure module — shared by client (Log parser, Sync renderer) and server.
 */

export const LOT_EMAIL_MARKER = '✉ '
export const MAX_LOT_EMAIL_LENGTH = 2000

export interface ParsedEmailCommand {
  to: string
  body: string
}

// "/email to Hitomi." | "/email Hitomi Tanaka:" | "/email to hitomi, hi"
const COMMAND_RE = /(^|\n)[ \t]*\/email\b[ \t]*(?:to\b[ \t]*)?([^\n]*)/i
const NAME_WORD_RE = /^[\p{L}][\p{L}'’\-]*$/u

/**
 * Parse an "/email to <Name>" command out of a Log entry.
 * Returns null while the command is incomplete (no recipient yet).
 * `body` may be empty — the caller decides when a letter is sendable.
 */
export function parseEmailCommand(text: string): ParsedEmailCommand | null {
  if (!text) return null
  const m = text.match(COMMAND_RE)
  if (!m) return null

  const rest = m[2].trim()
  // Recipient ends at the first terminating punctuation on the line
  const stop = rest.search(/[.:,;!?]/)
  const head = (stop > -1 ? rest.slice(0, stop) : rest).trim()
  let inline = stop > -1 ? rest.slice(stop + 1).trim() : ''

  const words = head.split(/\s+/).filter(Boolean)
  if (!words.length || !NAME_WORD_RE.test(words[0])) return null

  // Name is one or two words; anything further is inline message text
  let nameWords = words.slice(0, 1)
  if (words.length === 2 && NAME_WORD_RE.test(words[1])) {
    nameWords = words
  } else if (words.length > 2) {
    inline = [words.slice(1).join(' '), inline].filter(Boolean).join(' ')
  }

  const cmdEnd = (m.index || 0) + m[0].length
  // Letter body = inline text + everything written after the command line.
  // Text written *before* the command stays private to the Log.
  const after = text.slice(cmdEnd).trim()
  const body = [inline, after].filter(Boolean).join('\n').trim()

  return { to: nameWords.join(' '), body: body.slice(0, MAX_LOT_EMAIL_LENGTH) }
}

export function formatLotEmail(subject: string | undefined, body: string): string {
  const s = (subject || '').trim()
  const b = body.trim()
  const text = s ? `${s}\n\n${b}` : b
  return (LOT_EMAIL_MARKER + text).slice(0, MAX_LOT_EMAIL_LENGTH)
}

export function isLotEmail(message: string | null | undefined): boolean {
  return !!message && message.startsWith(LOT_EMAIL_MARKER)
}

/** Strip the marker for display. */
export function lotEmailText(message: string): string {
  return isLotEmail(message) ? message.slice(LOT_EMAIL_MARKER.length) : message
}
