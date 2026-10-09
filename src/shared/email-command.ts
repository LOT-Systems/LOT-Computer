/**
 * LOT® Email — command parser (pure, shared by client + server).
 * Syntax in Log:  /email to Hitomi. Message body...
 *                 /email to Hitomi: Message body...
 */
export const MAX_MAIL_LENGTH = 2000

export function parseEmailCommand(text: string): { to: string; body: string } | null {
  const m = /(?:^|\s)\/email\s+to\s+([^\s.,:;!?]+)\s*[.:,;\-—]?\s*([\s\S]*)$/i.exec(text || '')
  if (!m) return null
  return { to: m[1], body: m[2].trim().slice(0, MAX_MAIL_LENGTH) }
}
