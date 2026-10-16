/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Email — Log command parser (pure).
 *
 *   /email to Hitomi. See you at the gathering on Friday.
 *   /email to Hitomi: See you ...
 *
 * Recipient = first token after "to" (letters, digits, - _ '). A trailing
 * . , : ; or "-" ends the recipient. Everything after is the body; text
 * before the command is ignored (it stays in the log).
 */

export interface EmailCommand {
  to: string
  body: string
}

const EMAIL_RE = /(?:^|\s)\/email\s+to\s+([\p{L}\p{N}_'’-]+?)\s*(?:[.,:;]|\s|$)([\s\S]*)$/iu

export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = EMAIL_RE.exec(text)
  if (!m) return null
  return { to: m[1], body: m[2].trim() }
}
