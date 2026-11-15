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
 * Accepted shapes (case-insensitive, "to" optional):
 *
 *   /email to Hitomi
 *   Coffee tomorrow at 9?
 *
 *   /email to Hitomi: Coffee tomorrow at 9?
 *   /email Hitomi Tanaka — Coffee tomorrow at 9?
 *
 * The recipient is the rest of the command line up to ":" / " — " / end
 * of line. The body is the inline remainder plus every following line
 * until a blank-line-then-slash-command or the end of the log.
 *
 * Pure: no stores, no DOM — safe to unit-test.
 */
export interface EmailCommand {
  to: string
  body: string
  /** Stable key for "already sent" bookkeeping in a log session */
  key: string
}

const CMD_RE = /(^|\n)[ \t]*\/(?:email|mail)\b[ \t]*(?:to\b[ \t]*)?([^\n]*)/i

export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = CMD_RE.exec(text)
  if (!m) return null

  const header = m[2] || ''
  const split = header.search(/:|\s[—–-]\s/)
  const to = (split >= 0 ? header.slice(0, split) : header).trim()
  const inline = split >= 0 ? header.slice(split).replace(/^(:|\s[—–-]\s)/, '').trim() : ''

  const after = text.slice(m.index + m[0].length).replace(/^\n/, '')
  const lines: string[] = []
  for (const line of after.split('\n')) {
    if (/^\s*\/\w+/.test(line)) break // another slash command ends the letter
    lines.push(line)
  }
  const body = [inline, lines.join('\n')].filter(Boolean).join('\n').trim()
  if (!to) return null
  return { to, body, key: `${to.toLowerCase()}::${body}` }
}
