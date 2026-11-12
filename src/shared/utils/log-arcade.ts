/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log Arcade — the operator's gamified evolution, computed from the record
 * stream. Surfaced in the Log via `/level` (aliases `/xp`, `/arcade`).
 *
 * SELF-CARE RULES OF ENGAGEMENT (non-negotiable — this is a care product):
 *   R1  XP never decays. Nothing is ever taken away.
 *   R2  No streak penalty. Returning after silence EARNS a bonus.
 *   R3  Presence over volume. Per-day caps stop grinding; one honest entry
 *       a day outscores ten hollow ones.
 *   R4  No leaderboards, no comparison. The only opponent is entropy.
 *   R5  Deterministic and explainable — every point maps to a record.
 *
 * Pure module. No DB, no DOM, no network.
 */

export interface ArcadeLog {
  event: string
  createdAt: Date | string
}

export const XP_RULES = {
  ENTRY: 10, // journal entry (note)
  ENTRY_DAILY_CAP: 5,
  CHECKIN: 5, // mood / self-care / energy / memory answer
  CHECKIN_DAILY_CAP: 6,
  PRESENCE: 20, // any active day
  RETURN: 30, // first active day after ≥3 silent days
  RETURN_GAP_DAYS: 3,
  STORY: 15, // a compressed story was generated (/story)
  STORY_DAILY_CAP: 1,
} as const

const JOURNAL = new Set(['note', 'log_entry', 'journal'])
const CHECKIN = new Set([
  'emotional_checkin',
  'self_care_checkin',
  'self_care_completed',
  'energy_checkin',
  'memory_answer',
])

/** Tiers of five levels each. The last tier is open-ended. */
export const ARCADE_TIERS = [
  'SIGNAL',
  'TRACE',
  'PATTERN',
  'NARRATIVE',
  'ARCHIVE',
  'CONSTELLATION',
  'LIBRARY OF TIME',
] as const

/** Cumulative XP required to reach `level` (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  const n = Math.max(0, level - 1)
  return 50 * n * (n + 1) // 0, 100, 300, 600, 1000, 1500 …
}

export function levelForXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

export function tierForLevel(level: number): string {
  const i = Math.min(ARCADE_TIERS.length - 1, Math.floor((level - 1) / 5))
  return ARCADE_TIERS[i]
}

export interface ArcadeState {
  xp: number
  level: number
  tier: string
  /** Rank label, e.g. "PATTERN III". Beyond level 30: "LIBRARY OF TIME 4". */
  rank: string
  levelFloor: number
  nextLevelAt: number
  /** 0..1 progress inside the current level. */
  progress: number
  activeDays: number
  returns: number
  breakdown: { entries: number; checkins: number; presence: number; returns: number; stories: number }
  todayXp: number
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

export function computeArcade(logs: ArcadeLog[], now: Date = new Date()): ArcadeState {
  const perDay = new Map<string, { entries: number; checkins: number; stories: number }>()
  for (const l of logs) {
    const at = new Date(l.createdAt)
    if (isNaN(at.getTime()) || at > now) continue
    const k = dayKey(at)
    const d = perDay.get(k) || { entries: 0, checkins: 0, stories: 0 }
    if (JOURNAL.has(l.event)) d.entries++
    else if (CHECKIN.has(l.event)) d.checkins++
    else if (l.event === 'generated_story') d.stories++
    perDay.set(k, d)
  }

  const days = Array.from(perDay.keys()).sort()
  const b = { entries: 0, checkins: 0, presence: 0, returns: 0, stories: 0 }
  let returns = 0
  let prev: number | null = null
  const today = dayKey(now)
  let todayXp = 0

  for (const k of days) {
    const d = perDay.get(k)!
    const t = Date.parse(k)
    let dayXp = 0
    const e = Math.min(d.entries, XP_RULES.ENTRY_DAILY_CAP) * XP_RULES.ENTRY
    const c = Math.min(d.checkins, XP_RULES.CHECKIN_DAILY_CAP) * XP_RULES.CHECKIN
    const s = Math.min(d.stories, XP_RULES.STORY_DAILY_CAP) * XP_RULES.STORY
    b.entries += e
    b.checkins += c
    b.stories += s
    b.presence += XP_RULES.PRESENCE
    dayXp += e + c + s + XP_RULES.PRESENCE
    if (prev !== null && (t - prev) / 86_400_000 > XP_RULES.RETURN_GAP_DAYS) {
      b.returns += XP_RULES.RETURN
      dayXp += XP_RULES.RETURN
      returns++
    }
    if (k === today) todayXp = dayXp
    prev = t
  }

  const xp = b.entries + b.checkins + b.presence + b.returns + b.stories
  const level = levelForXp(xp)
  const floor = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const tier = tierForLevel(level)
  const sub = ((level - 1) % 5) + 1
  const rank = level > 30 ? `${tier} ${level - 30}` : `${tier} ${['I', 'II', 'III', 'IV', 'V'][sub - 1]}`

  return {
    xp,
    level,
    tier,
    rank,
    levelFloor: floor,
    nextLevelAt: next,
    progress: next > floor ? (xp - floor) / (next - floor) : 0,
    activeDays: days.length,
    returns,
    breakdown: b,
    todayXp,
  }
}

/** 20-cell ASCII meter, e.g. ▓▓▓▓▓▓░░░░░░░░░░░░░░ */
export function arcadeMeter(progress: number, cells = 20): string {
  const n = Math.max(0, Math.min(cells, Math.round(progress * cells)))
  return '▓'.repeat(n) + '░'.repeat(cells - n)
}

export function formatArcade(s: ArcadeState): string[] {
  const pad = (l: string) => l.padEnd(16, ' ')
  return [
    `${pad('RANK')}${s.rank}`,
    `${pad('LEVEL')}${s.level}`,
    `${pad('XP')}${s.xp} / ${s.nextLevelAt}`,
    `${pad('PROGRESS')}${arcadeMeter(s.progress)}`,
    `${pad('TODAY')}+${s.todayXp} XP`,
    `${pad('PRESENCE')}${s.activeDays} DAYS`,
    `${pad('RETURNS')}${s.returns}`,
    '',
    'XP NEVER DECAYS · RETURNING IS REWARDED',
  ]
}
