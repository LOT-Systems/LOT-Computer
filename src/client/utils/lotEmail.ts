/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — Log command parser (pure, no stores / DOM).
 *
 * Compose anywhere in a Log entry:
 *
 *   /email to Hitomi.
 *   See you at the studio at 8.
 *
 * or on one line:
 *
 *   /email to Hitomi: see you at the studio at 8.
 *
 * The command line names the recipient; only text AFTER the command is
 * the body — journal text written above it never leaves the Log. After sending, the command line is
 * replaced with a SENT stamp so the record stays in the Log and the
 * draft block does not re-open.
 */

export interface EmailDraft {
  to: string          // recipient as typed ("Hitomi", "Hitomi K")
  body: string        // message body
  commandLine: string // the exact line to replace after sending
}

const COMMAND_RE = /^[ \t]*\/email(?:[ \t]+to)?[ \t]+([^\n:]+?)[ \t]*(?:[.:]|$)[ \t]*([^\n]*)$/im

export function parseEmailCommand(text: string): EmailDraft | null {
  if (!text) return null
  const m = text.match(COMMAND_RE)
  if (!m) return null
  const to = m[1].replace(/[.,;!?]+$/, '').trim()
  if (to.length < 2) return null
  const inline = (m[2] || '').trim()
  // Only what follows the command is mail — journal text above it stays private
  const rest = text.slice((m.index ?? 0) + m[0].length).trim()
  const body = [inline, rest].filter(Boolean).join('\n').trim()
  return { to, body, commandLine: m[0] }
}

export function sentStamp(name: string, at: Date = new Date()): string {
  const hh = String(at.getHours()).padStart(2, '0')
  const mm = String(at.getMinutes()).padStart(2, '0')
  return `✉ SENT TO ${name.toUpperCase()} · ${hh}:${mm}`
}
