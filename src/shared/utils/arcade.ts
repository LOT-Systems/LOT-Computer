/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * ARCADE — pure rank ladder for the gamified evolution of the operator.
 *
 * The ladder mirrors the milestone badges (milestone_7 … milestone_365,
 * architecture theme names) so server-side narrative and client-side
 * badges speak the same language. Pure: no stores, no DOM, no DB.
 */

export type ArcadeRank = {
  /** Minimum consecutive-day streak for this rank. */
  days: number
  /** Architecture-theme name (matches BADGES.milestone_N.architectureName). */
  name: string
}

export const ARCADE_LADDER: readonly ArcadeRank[] = [
  { days: 0, name: 'Recruit' },
  { days: 7, name: 'Foundation' },
  { days: 14, name: 'Load-Bearing' },
  { days: 21, name: 'Deep Foundation' },
  { days: 30, name: 'Structure' },
  { days: 50, name: 'Mid-Structure' },
  { days: 60, name: 'Master Frame' },
  { days: 90, name: 'Inner Wall' },
  { days: 100, name: 'Architecture' },
  { days: 180, name: 'Wing' },
  { days: 365, name: 'Citadel' },
]

export type ArcadeStatus = {
  streakDays: number
  rank: string
  rankIndex: number
  nextRank: string | null
  daysToNext: number | null
}

/** Consecutive days (ending today or yesterday) that contain ≥1 timestamp. */
export function computeStreakDays(
  timestamps: Array<Date | string | number>,
  now: Date = new Date(),
  dayKey: (d: Date) => string = d => d.toISOString().slice(0, 10)
): number {
  const days = new Set<string>()
  for (const t of timestamps) {
    const d = new Date(t)
    if (!isNaN(d.getTime())) days.add(dayKey(d))
  }
  const DAY = 86_400_000
  let cursor = new Date(now.getTime())
  // A streak is still alive if today has not been logged yet.
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - DAY)
  }
  return streak
}

export function getArcadeStatus(streakDays: number): ArcadeStatus {
  const s = Math.max(0, Math.floor(streakDays || 0))
  let idx = 0
  for (let i = 0; i < ARCADE_LADDER.length; i++) {
    if (s >= ARCADE_LADDER[i].days) idx = i
  }
  const next = ARCADE_LADDER[idx + 1] || null
  return {
    streakDays: s,
    rank: ARCADE_LADDER[idx].name,
    rankIndex: idx,
    nextRank: next ? next.name : null,
    daysToNext: next ? next.days - s : null,
  }
}

export function formatArcadeLine(status: ArcadeStatus): string {
  const base = `RANK ${status.rank.toUpperCase()} · STREAK ${status.streakDays}D`
  return status.nextRank
    ? `${base} · ${status.daysToNext}D TO ${status.nextRank.toUpperCase()}`
    : `${base} · MAX RANK`
}
