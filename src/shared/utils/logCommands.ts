/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for slash commands.
 *
 * Pure (no stores, no DOM, no I/O) so the client (/system screen),
 * the trigger detector and tests all read the same table. Adding a
 * command = one row here; /system renders it automatically.
 *
 * Doc: docs/technical/LOT-LOG-COMMAND-SYSTEM.md
 */

export type CommandGroup = 'INTELLIGENCE' | 'SELF-CARE' | 'ENVIRONMENT' | 'SYSTEM'

export interface LogCommand {
  /** Canonical slash name, lower-case, no leading slash. */
  name: string
  /** Extra names that fire the same command. */
  aliases: string[]
  /** Optional argument hint rendered in /system, e.g. "[day|week|month|year]". */
  args?: string
  group: CommandGroup
  description: string
}

export const COMMAND_GROUPS: CommandGroup[] = [
  'INTELLIGENCE',
  'SELF-CARE',
  'ENVIRONMENT',
  'SYSTEM',
]

export const LOG_COMMANDS: LogCommand[] = [
  { name: 'story',    aliases: [],                      args: '[day|week|month|year]', group: 'INTELLIGENCE', description: 'Compressed story of your data' },
  { name: 'qi',       aliases: [],                      args: '[query]',               group: 'INTELLIGENCE', description: 'Ask the Quantum Intelligence engine' },
  { name: 'scan',     aliases: ['ai'],                                                 group: 'INTELLIGENCE', description: 'System status overview' },
  { name: 'qos',      aliases: ['os-report'],                                          group: 'INTELLIGENCE', description: 'Quantum OS state analysis' },
  { name: 'phys',     aliases: ['cohort-report'],                                      group: 'INTELLIGENCE', description: 'Physiological cohort report' },
  { name: 'assembly', aliases: ['assemble'],                                           group: 'INTELLIGENCE', description: 'Self-assembly module status' },
  { name: 'rank',     aliases: ['arcade', 'level'],                                    group: 'INTELLIGENCE', description: 'Arcade rank, XP and next unlock' },
  { name: 'how',      aliases: [],                                                     group: 'INTELLIGENCE', description: 'Open LOT AI check-in (System tab)' },

  { name: 'prayer',   aliases: ['candle'],                                             group: 'SELF-CARE',    description: 'Contextual scripture' },
  { name: 'breathe',  aliases: ['breath'],                                             group: 'SELF-CARE',    description: '4-2-6 breathing exercise' },
  { name: 'freeze',   aliases: ['pause'],                                              group: 'SELF-CARE',    description: 'Pause and reflect protocol' },
  { name: 'silent',   aliases: ['quiet'],                                              group: 'SELF-CARE',    description: 'Signal silence check' },
  { name: 'sil',      aliases: ['silence-check'],                                      group: 'SELF-CARE',    description: 'Silence pattern check' },
  { name: 'fast',     aliases: [],                                                     group: 'SELF-CARE',    description: 'Orthodox fasting calendar' },

  { name: 'synth',    aliases: ['keyboard'],                                           group: 'ENVIRONMENT',  description: 'Toggle keyboard sound' },
  { name: 'radio',    aliases: [],                                                     group: 'ENVIRONMENT',  description: 'Toggle radio' },
  { name: 'night',    aliases: [],                                                     group: 'ENVIRONMENT',  description: 'Dark mode' },

  { name: 'system',   aliases: ['commands'],                                           group: 'SYSTEM',       description: 'This help screen' },
]

/** Resolve a typed name (or alias) to its canonical command. */
export function resolveCommand(name: string): LogCommand | null {
  const n = name.trim().replace(/^\//, '').toLowerCase()
  if (!n) return null
  return (
    LOG_COMMANDS.find(c => c.name === n || c.aliases.includes(n)) || null
  )
}

/**
 * Build the /system screen as plain lines. Section headers are bare
 * words; command rows start with "/" and use 2+ spaces between the
 * command and its description (the renderer splits on that gap).
 */
export function buildSystemHelpLines(opts?: { rankLine?: string }): string[] {
  const lines: string[] = ['LOT® LOG — COMMANDS', '']
  if (opts?.rankLine) lines.push(opts.rankLine, '')
  for (const group of COMMAND_GROUPS) {
    const rows = LOG_COMMANDS.filter(c => c.group === group)
    if (!rows.length) continue
    lines.push(group)
    for (const c of rows) {
      const label = c.args ? `/${c.name} ${c.args}` : `/${c.name}`
      lines.push(`${label}  ${c.description}`)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS', 'Ctrl+Enter  Save log immediately')
  return lines
}

// ─── /story range ────────────────────────────────────────────────

export type StoryRange = 'day' | 'week' | 'month' | 'year' | 'recent'

export const STORY_RANGE_DAYS: Record<Exclude<StoryRange, 'recent'>, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const RANGE_WORDS: Record<string, StoryRange> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year',
}

/**
 * Parse "/story week" style input. Returns the range requested, or
 * 'recent' (legacy behaviour: last ~10 entries) when none is given.
 */
export function parseStoryRange(text: string): StoryRange {
  const m = /(^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  if (!m) return 'recent'
  return RANGE_WORDS[m[2].toLowerCase()] || 'recent'
}

// ─── Arcade (gamified evolution) ─────────────────────────────────

export interface ArcadeRank {
  level: number
  title: string
  minXp: number
}

/** Provisional rank ladder. Thresholds are tunable; titles are the contract. */
export const ARCADE_RANKS: ArcadeRank[] = [
  { level: 1, title: 'RECRUIT',    minXp: 0 },
  { level: 2, title: 'OPERATOR',   minXp: 100 },
  { level: 3, title: 'SPECIALIST', minXp: 500 },
  { level: 4, title: 'VANGUARD',   minXp: 1500 },
  { level: 5, title: 'COMMANDER',  minXp: 4000 },
  { level: 6, title: 'ARCHITECT',  minXp: 10000 },
]

export interface ArcadeInput {
  logEntries: number
  checkins: number
  storiesRead: number
  streakDays: number
}

/** XP weights: writing is worth most; the streak is the multiplier of habit. */
export function computeArcadeXp(i: ArcadeInput): number {
  return (
    Math.max(0, i.logEntries) * 10 +
    Math.max(0, i.checkins) * 5 +
    Math.max(0, i.storiesRead) * 15 +
    Math.max(0, i.streakDays) * 20
  )
}

export interface ArcadeStatus {
  xp: number
  rank: ArcadeRank
  next: ArcadeRank | null
  /** 0–100 progress inside the current rank. */
  progressPct: number
}

export function getArcadeStatus(xp: number): ArcadeStatus {
  const safe = Math.max(0, Math.floor(xp))
  let idx = 0
  for (let i = 0; i < ARCADE_RANKS.length; i++) {
    if (safe >= ARCADE_RANKS[i].minXp) idx = i
  }
  const rank = ARCADE_RANKS[idx]
  const next = ARCADE_RANKS[idx + 1] || null
  const progressPct = next
    ? Math.round(((safe - rank.minXp) / (next.minXp - rank.minXp)) * 100)
    : 100
  return { xp: safe, rank, next, progressPct }
}

export function formatArcadeLine(s: ArcadeStatus): string {
  const bar = (() => {
    const filled = Math.round(s.progressPct / 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled)
  })()
  const nxt = s.next ? `${s.next.minXp - s.xp} XP to ${s.next.title}` : 'MAX RANK'
  return `RANK  LV${s.rank.level} ${s.rank.title}  ${bar}  ${s.xp} XP · ${nxt}`
}
