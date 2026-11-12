/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — pure command parser for the Log.
 *
 *   /email to Hitomi
 *   Body of the message on the following lines.
 *
 *   /email to Hitomi Tanaka: one-line body
 *
 * "to" is optional, a trailing "." after the name is ignored.
 * Text before the command line stays a private log; only the text
 * after it becomes the envelope body.
 */

export interface EmailCommand {
  to: string        // recipient query as typed ("Hitomi", "Hitomi Tanaka")
  body: string      // trimmed message body
  line: string      // the raw command line (for replacing after send)
  start: number     // index of the command line in the source text
}

const COMMAND_RE = /(^|\n)([ \t]*\/email(?:[ \t]+to)?[ \t]+([^\n:]+?)[ \t]*\.?[ \t]*(?::[ \t]*([^\n]*))?)(?=\n|$)/i

export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = COMMAND_RE.exec(text)
  if (!m) return null
  const to = m[3].replace(/\.+$/, '').trim()
  if (to.length < 2 || /^to$/i.test(to) || to.split(/\s+/).length > 3) return null
  const start = m.index + m[1].length
  const line = m[2]
  const inline = (m[4] || '').trim()
  const after = text.slice(start + line.length).replace(/^\n/, '')
  const body = [inline, after].filter(Boolean).join('\n').trim()
  return { to, body, line, start }
}

/** Replace the command line with a quiet sent-receipt so it never re-fires. */
export function markEmailSent(text: string, cmd: EmailCommand, receiverName: string, time: string): string {
  return text.slice(0, cmd.start) + `✉ LOT Email → ${receiverName} · ${time}` + text.slice(cmd.start + cmd.line.length)
}
