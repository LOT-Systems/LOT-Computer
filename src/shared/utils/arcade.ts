/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® ARCADE — self-care progression engine (pure, deterministic)
 *
 * Gamified evolution of the operator without turning self-care into a
 * slot machine. Doctrine:
 *  - XP rewards PRESENCE (showing up, writing, checking in), never
 *    outcomes (being "happy"). A heavy day logged honestly earns the
 *    same XP as a bright one.
 *  - Per-day XP is capped so bulk-spamming entries cannot farm levels.
 *  - Streak multiplier is gentle (max ×1.5) and decays, not resets to
 *    zero shame — missing a day only drops the multiplier.
 *  - Pure module: no DOM, no stores, no network. Shared by client
 *    (/arcade, /system header) and server (/story digest).
 */

export interface ArcadeLogLike {
  event: string
  text?: string | null
  createdAt: string | Date
}

/** Base XP per event class. Unknown events earn MINOR_XP. */
export const ARCADE_XP_TABLE: Record<string, number> = {
  note: 10,               // Journal (Log) entry — the core loop
  emotional_checkin: 6,
  answer: 6,              // Memory/self-care question answered
  memory_answer: 6,
  self_care: 8,
  self_care_checkin: 8,
  energy_checkin: 5,
  intention: 6,
  plan_set: 6,
  generated_story: 3,     // Reading your own compression
  prayer_scripture: 2,
}
export const MINOR_XP = 1
/** Events that are machine/system noise and earn nothing. */
const ZERO_XP_EVENTS = new Set([
  'user_login', 'user_logout', 'weather_update', 'ping',
  'users_total', 'users_online', 'settings_change', 'theme_change',
])
/** Max XP one calendar day can contribute (anti-farming). */
export const DAILY_XP_CAP = 120
/** Max streak multiplier. */
export const STREAK_MULT_MAX = 1.5

export interface ArcadeRank {
  minLevel: number
  title: string
  glyph: string
}

/** Self-care ranks. Ordered ascending by minLevel. */
export const ARCADE_RANKS: ArcadeRank[] = [
  { minLevel: 1,  title: 'INITIATE',     glyph: '·' },
  { minLevel: 3,  title: 'OBSERVER',     glyph: '∘' },
  { minLevel: 5,  title: 'KEEPER',       glyph: '○' },
  { minLevel: 8,  title: 'NAVIGATOR',    glyph: '◌' },
  { minLevel: 12, title: 'CARTOGRAPHER', glyph: '◯' },
  { minLevel: 17, title: 'STEWARD',      glyph: '◎' },
  { minLevel: 23, title: 'ARCHIVIST',    glyph: '◉' },
  { minLevel: 30, title: 'ORACLE',       glyph: '●' },
]

/** Cumulative XP required to REACH `level` (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  const n = Math.max(0, Math.floor(level) - 1)
  // Triangular curve: 50, 150, 300, 500, ... (each level +50 more)
  return 25 * n * (n + 1)
}

export function levelForXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

export function rankForLevel(level: number): ArcadeRank {
  let rank = ARCADE_RANKS[0]
  for (const r of ARCADE_RANKS) if (level >= r.minLevel) rank = r
  return rank
}

/** XP for a single log, before daily cap + streak multiplier. */
export function xpForLog(log: ArcadeLogLike): number {
  if (ZERO_XP_EVENTS.has(log.event)) return 0
  const base = ARCADE_XP_TABLE[log.event] ?? MINOR_XP
  if (log.event === 'note') {
    const len = (log.text || '').trim().length
    if (len === 0) return 0
    // Depth bonus: +1 per 80 chars, max +10. Rewards writing, not length farming.
    return base + Math.min(10, Math.floor(len / 80))
  }
  return base
}

export function dayKey(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toISOString().slice(0, 10)
}

export interface ArcadeProgress {
  totalXp: number
  level: number
  rank: ArcadeRank
  nextRank: ArcadeRank | null
  xpIntoLevel: number
  xpForNextLevel: number
  progressPct: number
  streakDays: number
  multiplier: number
  todayXp: number
  activeDays: number
}

/**
 * Compute full progression from a log list (any order).
 * `now` injectable for deterministic tests.
 */
export function computeArcadeProgress(
  logs: ArcadeLogLike[],
  now: Date = new Date()
): ArcadeProgress {
  const perDay = new Map<string, number>()
  for (const log of logs) {
    const xp = xpForLog(log)
    if (xp <= 0) continue
    const k = dayKey(log.createdAt)
    perDay.set(k, (perDay.get(k) || 0) + xp)
  }

  const days = Array.from(perDay.keys()).sort()
  let totalXp = 0
  let streak = 0
  let prevDay: string | null = null
  for (const d of days) {
    if (prevDay && daysBetween(prevDay, d) === 1) streak++
    else streak = 1
    const mult = streakMultiplier(streak)
    totalXp += Math.round(Math.min(DAILY_XP_CAP, perDay.get(d) || 0) * mult)
    prevDay = d
  }

  // Current streak only counts if the last active day is today or yesterday
  const todayK = dayKey(now)
  const lastDay = days[days.length - 1]
  const currentStreak = lastDay && daysBetween(lastDay, todayK) <= 1 ? streak : 0

  const level = levelForXp(totalXp)
  const rank = rankForLevel(level)
  const nextRank = ARCADE_RANKS.find(r => r.minLevel > level) || null
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  const xpIntoLevel = totalXp - floor
  const xpForNextLevel = ceil - floor

  return {
    totalXp,
    level,
    rank,
    nextRank,
    xpIntoLevel,
    xpForNextLevel,
    progressPct: xpForNextLevel > 0 ? Math.round((xpIntoLevel / xpForNextLevel) * 100) : 0,
    streakDays: currentStreak,
    multiplier: streakMultiplier(currentStreak),
    todayXp: Math.min(DAILY_XP_CAP, perDay.get(todayK) || 0),
    activeDays: days.length,
  }
}

/** ×1.0 on day 1, +0.05 per consecutive day, capped at STREAK_MULT_MAX. */
export function streakMultiplier(streakDays: number): number {
  if (streakDays <= 1) return 1
  return Math.min(STREAK_MULT_MAX, Math.round((1 + (streakDays - 1) * 0.05) * 100) / 100)
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

/** Fixed-width progress bar: ▓▓▓▓░░░░░░ */
export function arcadeBar(pct: number, width = 10): string {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)))
  return '▓'.repeat(filled) + '░'.repeat(width - filled)
}

/** Terminal-grid lines for /arcade. */
export function formatArcadeStatus(p: ArcadeProgress): string[] {
  return [
    `RANK            ${p.rank.glyph} ${p.rank.title}`,
    `LEVEL           ${p.level}`,
    `XP              ${p.totalXp}`,
    `NEXT LEVEL      ${arcadeBar(p.progressPct)} ${p.xpIntoLevel}/${p.xpForNextLevel}`,
    `STREAK          ${p.streakDays}D · ×${p.multiplier.toFixed(2)}`,
    `TODAY           +${p.todayXp} XP${p.todayXp >= DAILY_XP_CAP ? ' (DAILY CAP)' : ''}`,
    `ACTIVE DAYS     ${p.activeDays}`,
    p.nextRank ? `NEXT RANK       ${p.nextRank.title} @ L${p.nextRank.minLevel}` : 'NEXT RANK       — FINAL RANK HELD',
  ]
}
