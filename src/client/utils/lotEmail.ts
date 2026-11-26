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
 *   /email to Hitomi.            ← command line (trailing punctuation ok)
 *   Coffee on Friday?            ← body = every line after the command
 *
 *   /email to Hitomi: Coffee?    ← inline body after a colon
 */

export type EmailCommand = {
  /** Exact command line as typed — replaced with a receipt after sending */
  line: string
  /** Recipient name, cleaned ("Hitomi") */
  to: string
  /** Message body */
  body: string
}

const COMMAND_RE = /^[ \t]*\/email[ \t]+to[ \t]+([^\n]*)$/im

export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = COMMAND_RE.exec(text)
  if (!m) return null
  const line = m[0]
  let rest = m[1]
  let inlineBody = ''
  const colon = rest.indexOf(':')
  if (colon > -1) {
    inlineBody = rest.slice(colon + 1).trim()
    rest = rest.slice(0, colon)
  }
  const to = rest.replace(/[.,!?;]+\s*$/g, '').replace(/\s+/g, ' ').trim()
  if (!to) return null
  const after = text.slice(m.index + line.length).replace(/^\n/, '')
  const body = [inlineBody, after.trim()].filter(Boolean).join('\n\n')
  return { line, to, body }
}

/** Receipt that replaces the command line once the email is sent. */
export function emailReceipt(name: string, at: Date = new Date()): string {
  const hh = at.getHours().toString().padStart(2, '0')
  const mm = at.getMinutes().toString().padStart(2, '0')
  return `✉ LOT Email to ${name} · sent ${hh}:${mm}`
}
