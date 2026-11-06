/**
 * LOT® Email — "/email to Hitomi. Body text" parser. Pure, no stores.
 * Accepted: "/email to Hitomi. hi", "/email to Hitomi: hi", "/email to Hitomi\nhi".
 */
export type EmailCommand = { to: string; body: string; raw: string }

const RE = /(^|\n)[ \t]*(\/email[ \t]+to[ \t]+([^\n.:,]+?)[ \t]*(?:[.:,][ \t]*|\n)([\s\S]*?))(?=\n[ \t]*\/email\b|$)/i

export function parseEmailCommand(text: string): EmailCommand | null {
  if (!text) return null
  const m = RE.exec(text)
  if (!m) return null
  const body = (m[4] || '').trim()
  const to = (m[3] || '').trim()
  if (!to || !body) return null
  return { to, body, raw: m[2] }
}
