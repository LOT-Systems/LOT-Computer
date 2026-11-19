/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — command parser (pure, no stores / DOM).
 *
 * Grammar (case-insensitive):
 *   /email to <Name>: <body>
 *   /email to <Name>
 *   <body on the following lines>
 *   /email to <Name> <body>          (single-word name)
 *
 * Everything written before the command stays a private log entry and
 * is never mailed. Only the text after the command is the body.
 */

export interface EmailDraft {
  to: string
  body: string
  /** Index of the "/email" token inside the source text. */
  start: number
}

const CMD = /(^|\s)\/email\s+to\s+/i

export function parseEmailCommand(text: string): EmailDraft | null {
  if (!text) return null
  const m = CMD.exec(text)
  if (!m) return null
  const start = m.index + m[1].length
  const rest = text.slice(m.index + m[0].length)

  let to = ''
  let body = ''
  const colon = rest.search(/[:\n]/)
  if (colon > -1 && rest[colon] === ':' && !rest.slice(0, colon).includes('\n')) {
    to = rest.slice(0, colon)
    body = rest.slice(colon + 1)
  } else if (colon > -1 && rest[colon] === '\n') {
    to = rest.slice(0, colon)
    body = rest.slice(colon + 1)
  } else {
    const sp = rest.search(/\s/)
    to = sp > -1 ? rest.slice(0, sp) : rest
    body = sp > -1 ? rest.slice(sp + 1) : ''
  }

  to = to.trim().replace(/[.,;!?]+$/, '').slice(0, 80)
  body = body.trim()
  if (!to) return null
  return { to, body, start }
}

/** Replace the command block with a sent receipt so the log keeps a record. */
export function stampEmailSent(text: string, draft: EmailDraft, toName: string, at: Date): string {
  const hh = String(at.getHours()).padStart(2, '0')
  const mm = String(at.getMinutes()).padStart(2, '0')
  const head = text.slice(0, draft.start).replace(/\s+$/, '')
  const receipt = `✉ SENT TO ${toName.toUpperCase()} · ${hh}:${mm}\n${draft.body}`
  return head ? `${head}\n\n${receipt}` : receipt
}

/** Marker used to recognise already-sent receipts (never re-sent). */
export const EMAIL_SENT_MARK = '✉ SENT TO '
