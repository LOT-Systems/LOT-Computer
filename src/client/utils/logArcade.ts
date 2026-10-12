/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log Arcade — operator rank derived from the Log record.
 *
 * Pure and stateless: XP is recomputed from the log history on every call,
 * so there is nothing to persist, desync or cheat. Self-care design rule:
 * the score rewards CONSISTENCY and REFLECTION, never volume. Entries per
 * day are capped, so typing more cannot buy rank — returning tomorrow can.
 *
 * XP table (see docs/technical/LOT-LOG-COMMAND-SYSTEM.md §6):
 *   active day            +10
 *   entry on that day     +5  each, max 3 counted per day
 *   reflective entry      +5  once per day (an entry of 30+ words)
 *   longest streak        +5  per day of streak, max 30 days
 */

export interface ArcadeLogInput {
  text: string | null
  event: string
  createdAt: string | Date
}

export interface Rank {
  level: number
  name: string
  minXp: number
}

export const RANKS: readonly Rank[] = [
  { level: 1, name: 'BOOT',        minXp: 0 },
  { level: 2, name: 'SIGNAL',      minXp: 100 },
  { level: 3, name: 'OPERATOR',    minXp: 300 },
  { level: 4, name: 'SPECIALIST',  minXp: 700 },
  { level: 5, name: 'ARCHITECT',   minXp: 1500 },
  { level: 6, name: 'COMMANDER',   minXp: 3000 },
]

export interface ArcadeState {
  xp: number
  rank: Rank
  nextRank: Rank | null
  xpToNext: number
  /** 0-100 progress inside the current rank band; 100 at top rank. */
  progressPct: number
  activeDays: number
  currentStreak: number
  longestStreak: number
}

export const ENTRY_EVENTS: readonly string[] = ['note', 'log_entry', 'journal']
const DAY_MS = 86_400_000

/**
 * Strip slash commands and machine-appended output (story / scripture
 * blocks) so only what the operator actually wrote is counted.
 */
export function cleanEntryText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .split('\n')
    .filter(line => !/^\s*(📖|🕯️?)/.test(line))
    .join('\n')
    .replace(/(^|\s)\/story\s+(day|week|month|year)\b/gi, ' ')
    .replace(/(^|\s)\/[a-z][a-z0-9-]*/gi, ' ')
    .replace(/[🎹🎧🌙🧊❗‼️📖🕯️]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/** Local-calendar day key (YYYY-MM-DD) so streaks follow the operator's day. */
export function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function keyToIndex(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS)
}

export function rankForXp(xp: number): Rank {
  let current = RANKS[0]
  for (const r of RANKS) if (xp >= r.minXp) current = r
  return current
}

export function computeArcade(
  logs: readonly ArcadeLogInput[],
  now: Date = new Date()
): ArcadeState {
  const perDay = new Map<string, { entries: number; reflective: boolean }>()
  for (const l of logs) {
    if (!ENTRY_EVENTS.includes(l.event)) continue
    const clean = cleanEntryText(l.text)
    if (!clean) continue
    const key = dayKey(new Date(l.createdAt))
    const slot = perDay.get(key) || { entries: 0, reflective: false }
    slot.entries += 1
    if (wordCount(clean) >= 30) slot.reflective = true
    perDay.set(key, slot)
  }

  let xp = 0
  perDay.forEach(slot => {
    xp += 10 + 5 * Math.min(slot.entries, 3) + (slot.reflective ? 5 : 0)
  })

  const indices = Array.from(perDay.keys()).map(keyToIndex).sort((a, b) => a - b)
  let longest = 0
  let run = 0
  for (let i = 0; i < indices.length; i++) {
    run = i > 0 && indices[i] - indices[i - 1] === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  // Current streak is alive if the last active day is today or yesterday.
  let current = 0
  if (indices.length > 0) {
    const today = keyToIndex(dayKey(now))
    const last = indices[indices.length - 1]
    if (today - last <= 1) {
      current = 1
      for (let i = indices.length - 1; i > 0; i--) {
        if (indices[i] - indices[i - 1] === 1) current++
        else break
      }
    }
  }

  xp += Math.min(longest, 30) * 5

  const rank = rankForXp(xp)
  const next = RANKS.find(r => r.minXp > xp) || null
  const progressPct = next
    ? Math.floor(((xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)
    : 100

  return {
    xp,
    rank,
    nextRank: next,
    xpToNext: next ? next.minXp - xp : 0,
    progressPct,
    activeDays: perDay.size,
    currentStreak: current,
    longestStreak: longest,
  }
}

/** Fixed-width progress bar, e.g. [######----] */
export function progressBar(pct: number, width = 10): string {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)))
  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}]`
}
