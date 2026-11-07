/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Arcade evolution — pure functions.
 *
 * Gamified progression for a self-care product. Design rules:
 *   1. XP rewards showing up and reflecting, never output volume:
 *      a per-day XP cap prevents grinding and long-text spam.
 *   2. Nothing is ever subtracted. A broken streak resets the streak
 *      counter only; level, XP and rank are permanent.
 *   3. Deterministic: same logs in → same result out (no randomness).
 *
 * XP is derived from the logs supplied (the client passes what /logs returns,
 * currently the newest 500 displayable events), so it is a rolling window of
 * evolution, not an all-time ledger. See docs/technical/LOG-SYSTEM.md §Limits.
 */

export interface ArcadeLogInput {
  event: string
  text?: string | null
  createdAt: Date | string
}

export const XP_TABLE: Record<string, number> = {
  note: 10,
  emotional_checkin: 8,
  self_care_complete: 12,
  self_care_completed: 12,
  memory_answer: 6,
  answer: 6,
  generated_story: 5,
  badge_unlock: 25,
  goal_set: 10,
  goal_complete: 30,
}

/** Bonus XP for a substantial journal entry (>= 40 words), once per entry. */
export const REFLECTION_BONUS = 5
export const DAILY_XP_CAP = 120

export const RANKS = [
  'INITIATE',
  'OPERATOR',
  'NAVIGATOR',
  'PILOT',
  'COMMANDER',
  'ARCHITECT',
] as const
export type Rank = (typeof RANKS)[number]

/** XP needed to *reach* level n (n >= 1): 50·(n−1)². Level 1 at 0 XP. */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * (level - 1)
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1
}

/** Rank advances every 5 levels, capped at ARCHITECT. */
export function rankForLevel(level: number): Rank {
  return RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 5))]
}

export interface ArcadeState {
  xp: number
  level: number
  rank: Rank
  xpIntoLevel: number
  xpForNext: number
  streak: number
  longestStreak: number
  activeDays: number
  /** Today's XP so far, and how much of the cap remains. */
  todayXp: number
  todayCapRemaining: number
}

function dayKey(d: Date | string): string {
  return new Date(d).toISOString().slice(0, 10)
}

function shiftDay(key: string, delta: number): string {
  const t = new Date(key + 'T00:00:00Z').getTime() + delta * 86400000
  return new Date(t).toISOString().slice(0, 10)
}

export function computeArcade(logs: ArcadeLogInput[], now: number = Date.now()): ArcadeState {
  const perDay = new Map<string, number>()
  for (const l of logs) {
    let gain = XP_TABLE[l.event] || 0
    if (!gain) continue
    if (l.event === 'note') {
      const words = (l.text || '').trim().split(/\s+/).filter(Boolean).length
      if (words === 0) continue // empty notes earn nothing
      if (words >= 40) gain += REFLECTION_BONUS
    }
    const k = dayKey(l.createdAt)
    perDay.set(k, (perDay.get(k) || 0) + gain)
  }

  let xp = 0
  perDay.forEach(v => { xp += Math.min(v, DAILY_XP_CAP) })

  const level = levelForXp(xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)

  // Streaks: consecutive days with any XP. The current streak stays alive
  // if the last active day is today or yesterday (grace until tonight).
  const keys = Array.from(perDay.keys()).sort()
  let longest = 0
  let run = 0
  for (let i = 0; i < keys.length; i++) {
    run = i > 0 && keys[i] === shiftDay(keys[i - 1], 1) ? run + 1 : 1
    if (run > longest) longest = run
  }
  const today = dayKey(new Date(now))
  let streak = 0
  let cursor = perDay.has(today) ? today : shiftDay(today, -1)
  while (perDay.has(cursor)) {
    streak++
    cursor = shiftDay(cursor, -1)
  }

  const todayRaw = perDay.get(today) || 0
  const todayXp = Math.min(todayRaw, DAILY_XP_CAP)

  return {
    xp,
    level,
    rank: rankForLevel(level),
    xpIntoLevel: xp - base,
    xpForNext: next - base,
    streak,
    longestStreak: longest,
    activeDays: perDay.size,
    todayXp,
    todayCapRemaining: DAILY_XP_CAP - todayXp,
  }
}

/** Terminal-style read-out for the `/arcade` command (key/value rows). */
export function formatArcade(s: ArcadeState): string {
  const width = 20
  const filled = Math.round((s.xpIntoLevel / s.xpForNext) * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return [
    `RANK            ${s.rank}`,
    `LEVEL           ${s.level}`,
    `XP              ${s.xp}`,
    `NEXT LEVEL      ${bar} ${s.xpIntoLevel}/${s.xpForNext}`,
    `STREAK          ${s.streak} DAY${s.streak === 1 ? '' : 'S'} (BEST ${s.longestStreak})`,
    `ACTIVE DAYS     ${s.activeDays}`,
    `TODAY           ${s.todayXp}/${DAILY_XP_CAP} XP`,
    'NOTE            XP REWARDS SHOWING UP. NOTHING IS EVER LOST.',
  ].join('\n')
}
