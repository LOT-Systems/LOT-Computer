/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Parses a LOT® Email command out of Log text.
 *
 *   /email to Hitomi.
 *   Dinner on Friday?
 *
 * → { to: 'Hitomi', body: 'Dinner on Friday?' }
 *
 * The recipient ends at the first period, comma, colon, semicolon or
 * newline. Everything else in the log (before and after the command)
 * is the body. Pure — no stores, no DOM.
 */
export function parseEmailCommand(
  text: string
): { to: string; body: string } | null {
  if (!text) return null
  const m = /(?:^|\s)\/(?:email|mail)\s+to\s+([^\n.,:;]+)[.,:;]?/i.exec(text)
  if (!m) return null
  const to = m[1].trim()
  if (!to) return null
  const start = m.index + (m[0].startsWith('/') ? 0 : 1)
  const before = text.slice(0, start).trim()
  const after = text.slice(m.index + m[0].length).trim()
  const body = before && after ? `${before}\n${after}` : before || after
  return { to, body }
}
