/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * ARCADE LAYER — gamified evolution of the operator.
 *
 * Self-care first: XP rewards CONSISTENCY and REFLECTION (showing up,
 * writing, closing the loop with a story) — never volume for its own
 * sake. Per-day XP from entries is capped so a 40-entry binge day earns
 * no more than a calm 5-entry day.
 *
 * Pure module. Deterministic. No I/O.
 */

export interface ArcadeStats {
  /** Lifetime journal entries (event = note). */
  entries: number
  /** Lifetime distinct calendar days with ≥1 entry. */
  activeDays: number
  /** Current consecutive-day streak (ending today or yesterday). */
  streak: number
  /** Lifetime generated stories (/story). */
  stories: number
  /** Lifetime emotional check-ins. */
  checkins: number
}

export interface ArcadeRank {
  id: string
  name: string
  minXp: number
}

/** Ladder. Names follow LOT field-manual voice; thresholds are strictly increasing. */
export const ARCADE_RANKS: ArcadeRank[] = [
  { id: 'R0', name: 'RECRUIT',   minXp: 0 },
  { id: 'R1', name: 'SIGNAL',    minXp: 100 },
  { id: 'R2', name: 'OPERATOR',  minXp: 300 },
  { id: 'R3', name: 'SPECIALIST', minXp: 700 },
  { id: 'R4', name: 'SERGEANT',  minXp: 1400 },
  { id: 'R5', name: 'NAVIGATOR', minXp: 2600 },
  { id: 'R6', name: 'ARCHITECT', minXp: 4500 },
  { id: 'R7', name: 'COMMANDER', minXp: 7500 },
]

export const ARCADE_XP = {
  /** Per entry, but only the first PER_DAY_CAP entries of a day count (see computeXp). */
  ENTRY: 5,
  PER_DAY_CAP: 5,
  ACTIVE_DAY: 20,
  STREAK_DAY: 10,
  STREAK_CAP: 30,
  STORY: 40,
  CHECKIN: 15,
} as const

export interface ArcadeStanding {
  xp: number
  rank: ArcadeRank
  next: ArcadeRank | null
  toNext: number
  /** 0–100 progress inside the current rank band. */
  progressPct: number
}

export function computeXp(s: ArcadeStats): number {
  const x = ARCADE_XP
  // Cap entry XP at PER_DAY_CAP entries per active day (average-based bound).
  const cappedEntries = Math.min(s.entries, s.activeDays * x.PER_DAY_CAP)
  return Math.max(
    0,
    Math.round(
      cappedEntries * x.ENTRY +
        s.activeDays * x.ACTIVE_DAY +
        Math.min(s.streak, x.STREAK_CAP) * x.STREAK_DAY +
        s.stories * x.STORY +
        s.checkins * x.CHECKIN
    )
  )
}

export function getArcadeStanding(s: ArcadeStats): ArcadeStanding {
  const xp = computeXp(s)
  let idx = 0
  for (let i = 0; i < ARCADE_RANKS.length; i++) if (xp >= ARCADE_RANKS[i].minXp) idx = i
  const rank = ARCADE_RANKS[idx]
  const next = ARCADE_RANKS[idx + 1] || null
  const toNext = next ? next.minXp - xp : 0
  const progressPct = next
    ? Math.round(((xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)
    : 100
  return { xp, rank, next, toNext, progressPct }
}

/** Consecutive-day streak from a set of YYYY-MM-DD keys, ending today or yesterday. */
export function computeStreak(dayKeys: Iterable<string>, todayKey: string): number {
  const set = new Set(dayKeys)
  const shift = (key: string, delta: number): string => {
    const d = new Date(key + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() + delta)
    return d.toISOString().slice(0, 10)
  }
  let cursor = set.has(todayKey) ? todayKey : shift(todayKey, -1)
  let n = 0
  while (set.has(cursor)) {
    n++
    cursor = shift(cursor, -1)
  }
  return n
}

/** One-line Arcade footer, e.g. "ARCADE  OPERATOR · 412 XP · 188 TO SPECIALIST · STREAK 6D". */
export function renderArcadeLine(st: ArcadeStanding, streak: number): string {
  const nextPart = st.next ? `${st.toNext} TO ${st.next.name}` : 'MAX RANK'
  return `ARCADE  ${st.rank.name} · ${st.xp} XP · ${nextPart} · STREAK ${streak}D`
}
