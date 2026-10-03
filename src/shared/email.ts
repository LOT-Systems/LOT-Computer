/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — the simplest possible mail layer.
 *
 * An email is a direct message whose body starts with EMAIL_MARKER.
 * No schema change: the Log composes it, Sync receives it.
 *
 * Compose (Log):  /email to Hitomi. See you at the cohort meetup.<Enter>
 * A command fires only once its line is finished with a newline.
 */

export const EMAIL_MARKER = '✉ '
export const MAX_EMAIL_LENGTH = 2000

export type EmailCommand = { to: string; body: string; raw: string }

const LINE_RE = /^[ \t]*\/email[ \t]+to[ \t]+([^\s.,:;]+)[ \t]*[.,:;]?[ \t]*(.*)$/i

/** Completed (newline-terminated) /email lines in `text` that have a body. */
export function parseEmailCommands(text: string): EmailCommand[] {
  if (!text) return []
  const lines = text.split('\n')
  lines.pop() // last segment has no newline yet — still being typed
  const out: EmailCommand[] = []
  for (const line of lines) {
    const m = LINE_RE.exec(line)
    if (m && m[2].trim()) out.push({ to: m[1], body: m[2].trim(), raw: line })
  }
  return out
}

/** Commands present in `text` but not already in `previousText`. */
export function detectNewEmailCommands(text: string, previousText: string): EmailCommand[] {
  const seen = new Map<string, number>()
  for (const c of parseEmailCommands(previousText)) seen.set(c.raw, (seen.get(c.raw) || 0) + 1)
  return parseEmailCommands(text).filter((c) => {
    const n = seen.get(c.raw) || 0
    if (n > 0) { seen.set(c.raw, n - 1); return false }
    return true
  })
}

export const isEmailMessage = (message: string) => message.startsWith(EMAIL_MARKER)
export const toEmailBody = (body: string) => EMAIL_MARKER + body.trim().slice(0, MAX_EMAIL_LENGTH)
export const fromEmailBody = (message: string) => message.slice(EMAIL_MARKER.length)
