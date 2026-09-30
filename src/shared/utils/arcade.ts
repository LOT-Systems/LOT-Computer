/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Arcade — self-care evolution model.
 *
 * Pure and dependency-free (shared by client and server). The arcade layer is
 * a *reflection* of real self-care behavior, never a separate score to grind:
 * XP is derived only from things the operator actually did (journal entries,
 * active days, streak, check-ins). No penalties, no decay, no loss states —
 * a missed day pauses the streak bonus, it never removes earned XP.
 */

export interface ArcadeInput {
  /** Journal / log entries written (event log_entry | journal). */
  entries: number
  /** Distinct calendar days with at least one signal of any kind. */
  activeDays: number
  /** Current consecutive-day streak. */
  streak: number
  /** Check-ins answered (mood, energy, memory answers, self-care). */
  checkins: number
}

export interface ArcadeState {
  xp: number
  level: number
  title: string
  /** XP required to reach the current level. */
  levelFloorXp: number
  /** XP required to reach the next level (null at max level). */
  nextLevelXp: number | null
  /** 0–100 progress between current and next level. */
  progressPct: number
}

export const ARCADE_MAX_LEVEL = 99

export const XP_PER_ENTRY = 10
export const XP_PER_ACTIVE_DAY = 25
export const XP_PER_CHECKIN = 5
/** Streak bonus: 2 XP per streak day, capped so long streaks stay humane. */
export const XP_PER_STREAK_DAY = 2
export const XP_STREAK_CAP = 400

/** Rank titles, ordered by minimum level. */
const TITLES: Array<[number, string]> = [
  [1, 'RECRUIT'],
  [5, 'OPERATOR'],
  [10, 'ADEPT'],
  [20, 'SPECIALIST'],
  [35, 'VETERAN'],
  [50, 'COMMANDER'],
  [70, 'ARCHITECT'],
  [90, 'SAGE'],
]

/** XP needed to *reach* `level` (level 1 = 0 XP). Quadratic: 50·(L-1)². */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.min(ARCADE_MAX_LEVEL, Math.floor(level)))
  return 50 * (l - 1) * (l - 1)
}

export function titleForLevel(level: number): string {
  let title = TITLES[0][1]
  for (const [min, name] of TITLES) {
    if (level >= min) title = name
  }
  return title
}

export function computeXp(input: ArcadeInput): number {
  const n = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0)
  return (
    n(input.entries) * XP_PER_ENTRY +
    n(input.activeDays) * XP_PER_ACTIVE_DAY +
    n(input.checkins) * XP_PER_CHECKIN +
    Math.min(n(input.streak) * XP_PER_STREAK_DAY, XP_STREAK_CAP)
  )
}

export function computeArcade(input: ArcadeInput): ArcadeState {
  const xp = computeXp(input)
  let level = 1
  while (level < ARCADE_MAX_LEVEL && xp >= xpForLevel(level + 1)) level++
  const levelFloorXp = xpForLevel(level)
  const nextLevelXp = level >= ARCADE_MAX_LEVEL ? null : xpForLevel(level + 1)
  const progressPct =
    nextLevelXp === null
      ? 100
      : Math.round(((xp - levelFloorXp) / (nextLevelXp - levelFloorXp)) * 100)
  return {
    xp,
    level,
    title: titleForLevel(level),
    levelFloorXp,
    nextLevelXp,
    progressPct,
  }
}

/** Terminal-grid rendering of an arcade state (used by /rank). */
export function formatArcade(state: ArcadeState, input: ArcadeInput): string {
  const bar = (() => {
    const filled = Math.round(state.progressPct / 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled)
  })()
  const next =
    state.nextLevelXp === null
      ? 'MAX LEVEL'
      : `${state.nextLevelXp - state.xp} XP TO LEVEL ${state.level + 1}`
  return [
    `RANK            ${state.title}`,
    `LEVEL           ${state.level} / ${ARCADE_MAX_LEVEL}`,
    `XP              ${state.xp}`,
    `PROGRESS        ${bar} ${state.progressPct}%`,
    `NEXT            ${next}`,
    '',
    `ENTRIES         ${input.entries}`,
    `ACTIVE DAYS     ${input.activeDays}`,
    `STREAK          ${input.streak}`,
    `CHECK-INS       ${input.checkins}`,
  ].join('\n')
}
