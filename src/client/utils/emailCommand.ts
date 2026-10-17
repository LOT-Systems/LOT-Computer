/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Parses the LOT® Email command written in a Log:
 *
 *   /email to Hitomi. Dinner on Friday?
 *   /email to Hitomi Tanaka: Dinner on Friday?
 *
 * The recipient is a first name, or "First Last". Everything after the
 * separator (. : , or newline) is the message body. Returns null until
 * both a recipient and a body are present.
 */
export interface EmailCommand {
  to: string
  body: string
  /** The exact substring of the log that holds the command. */
  raw: string
}

const EMAIL_RE =
  /\/email\s+to\s+([^\s.:,;!?\n]+(?:[ \t]+[^\s.:,;!?\n]+)?)[ \t]*[.:,]?[ \t]*([\s\S]*)$/i

export function parseEmailCommand(text: string): EmailCommand | null {
  const m = EMAIL_RE.exec(text || '')
  if (!m) return null
  let to = m[1].trim()
  let body = m[2].trim()
  // "/email to Hitomi dinner friday" has no separator: the optional second
  // word was really the start of the body, so only keep it when a separator
  // directly followed it.
  const twoWords = to.includes(' ')
  if (twoWords) {
    const sepAfter = /^\/email\s+to\s+\S+[ \t]+\S+[ \t]*[.:,]/i.test(m[0])
    if (!sepAfter) {
      const [first, ...rest] = to.split(/\s+/)
      to = first
      body = `${rest.join(' ')} ${body}`.trim()
    }
  }
  if (!to || !body) return null
  return { to, body, raw: m[0] }
}
