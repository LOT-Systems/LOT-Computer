/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — pure parser for the Log command.
 *
 *   /email to Hitomi
 *   Good morning. Tea at 8?
 *
 *   /email to Hitomi Tanaka: Tea at 8?
 *
 * The recipient is the first word after "to" (optionally a second
 * capitalised word as last name). The body is whatever follows the
 * name on that line (after an optional ":" or "—") plus every
 * following line. No network, no stores — testable in isolation.
 */

export interface LotEmailDraft {
  to: string
  body: string
  /** The raw command line, so the caller can strip it after sending */
  commandLine: string
}

const COMMAND_RE = /(^|\n)[ \t]*\/email[ \t]+to[ \t]+([^\n]*)/i

export function parseLotEmail(text: string): LotEmailDraft | null {
  if (!text) return null
  const m = text.match(COMMAND_RE)
  if (!m) return null
  const lineRest = m[2].trim()
  const start = (m.index ?? 0) + m[1].length
  const end = start + m[0].length - m[1].length
  const commandLine = text.slice(start, end)

  // Split name from inline body: "Hitomi: hi", "Hitomi — hi", "Hitomi Tanaka hi"
  const sep = lineRest.search(/\s*[:—–]\s*/)
  let namePart = sep > -1 ? lineRest.slice(0, sep) : lineRest
  let inline = sep > -1 ? lineRest.slice(sep).replace(/^\s*[:—–]\s*/, '') : ''
  const words = namePart.split(/\s+/).filter(Boolean)
  if (!words.length) return null
  let nameWords = words.slice(0, 1)
  // Second word counts as last name only when capitalised and no separator given
  if (words[1] && /^\p{Lu}/u.test(words[1]) && (sep > -1 || words.length === 2)) {
    nameWords = words.slice(0, 2)
  }
  const leftover = words.slice(nameWords.length).join(' ')
  inline = [leftover, inline].filter(Boolean).join(' ')

  const to = nameWords.join(' ').replace(/[.,!?;]+$/, '')
  const following = text.slice(end).replace(/^\n/, '')
  const body = [inline, following].filter((x) => x && x.trim()).join('\n').trim()
  return { to, body, commandLine }
}

/** Remove the command + body from the log once sent, leaving a trace line. */
export function stampLotEmailSent(text: string, draft: LotEmailDraft, toName: string): string {
  const idx = text.indexOf(draft.commandLine)
  if (idx === -1) return text
  const before = text.slice(0, idx).replace(/\s+$/, '')
  const stamp = `✉ Sent to ${toName}: ${draft.body}`
  return before ? `${before}\n${stamp}` : stamp
}
