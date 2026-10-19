/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry (single source of truth)
 *
 * Every slash command available inside a Log entry is declared here once.
 * `/system` renders its help screen from this registry, so the help can
 * never drift from the commands that exist. Pure module: no stores, no DOM,
 * no server imports — usable from the client, the server and tests.
 *
 * Doc: docs/technical/LOG-COMMAND-SYSTEM.md
 */

export type LogCommandGroup = 'AI' | 'SYSTEM' | 'RITUAL' | 'DEVICE'

export interface LogCommandDef {
  /** Token typed by the user, without the leading slash. */
  name: string
  /** Optional argument hint shown in help, e.g. "[day|week|month|year]". */
  args?: string
  description: string
  group: LogCommandGroup
}

export const LOG_COMMANDS: readonly LogCommandDef[] = [
  { name: 'story',    args: '[day|week|month|year]', group: 'AI',
    description: 'Compressed story of your day, week, month or year' },
  { name: 'qi',       args: '[query]',               group: 'AI',
    description: 'Ask the Quantum Intelligence engine' },
  { name: 'prayer',   group: 'AI',     description: 'Generate contextual scripture' },
  { name: 'how',      group: 'AI',     description: 'Open LOT AI check-in (System tab)' },
  { name: 'scan',     group: 'SYSTEM', description: 'System status overview' },
  { name: 'assembly', group: 'SYSTEM', description: 'Self-assembly module status' },
  { name: 'phys',     group: 'SYSTEM', description: 'Physiological cohort report' },
  { name: 'qos',      group: 'SYSTEM', description: 'Quantum OS state analysis' },
  { name: 'silent',   group: 'SYSTEM', description: 'Signal silence check' },
  { name: 'system',   group: 'SYSTEM', description: 'This help screen' },
  { name: 'fast',     group: 'RITUAL', description: 'Orthodox fasting calendar' },
  { name: 'breathe',  group: 'RITUAL', description: '4-2-6 breathing exercise' },
  { name: 'freeze',   group: 'RITUAL', description: 'Pause and reflect protocol' },
  { name: 'synth',    group: 'DEVICE', description: 'Toggle keyboard sound' },
  { name: 'radio',    group: 'DEVICE', description: 'Toggle radio' },
  { name: 'night',    group: 'DEVICE', description: 'Dark mode' },
]

export const LOG_SHORTCUTS: readonly { keys: string; description: string }[] = [
  { keys: 'Ctrl+Enter', description: 'Save log immediately' },
]

const GROUP_ORDER: LogCommandGroup[] = ['AI', 'SYSTEM', 'RITUAL', 'DEVICE']

/**
 * Plain-text help for `/system`. Format contract with the Logs renderer:
 * a line starting with "/" is a command row (name, 2+ spaces, description);
 * any other non-blank line is a section header.
 */
export function renderSystemHelp(): string {
  const head = (c: LogCommandDef) => `/${c.name}${c.args ? ' ' + c.args : ''}`
  const NAME_COL = Math.max(...LOG_COMMANDS.map(c => head(c).length), ...LOG_SHORTCUTS.map(s => s.keys.length)) + 2
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const group of GROUP_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.group === group)
    if (!rows.length) continue
    lines.push('', group)
    for (const c of rows) {
      lines.push(`${head(c).padEnd(NAME_COL)}${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS')
  for (const s of LOG_SHORTCUTS) lines.push(`${s.keys.padEnd(NAME_COL)}${s.description}`)
  return lines.join('\n')
}

// ─── /story period ──────────────────────────────────────────────────────────

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'
export const STORY_PERIODS: readonly StoryPeriod[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'week'

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', weekly: 'week', w: 'week',
  month: 'month', monthly: 'month', m: 'month',
  year: 'year', yearly: 'year', y: 'year',
}

/** Reads the argument after `/story` in a log entry; defaults to week. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /\/story(?:\s+([a-z]+))?/i.exec(text || '')
  const arg = m?.[1]?.toLowerCase()
  return (arg && PERIOD_ALIASES[arg]) || DEFAULT_STORY_PERIOD
}

// ─── Arcade evolution ───────────────────────────────────────────────────────

export interface ArcadeRank {
  level: number
  title: string
  xp: number
  /** XP at which this level starts. */
  floor: number
  /** XP needed for the next level, or null at max level. */
  next: number | null
}

/**
 * Rank ladder. Titles are self-care vocabulary, not combat: the arcade layer
 * rewards showing up and noticing, never intensity or volume alone.
 */
export const ARCADE_LADDER: readonly { floor: number; title: string }[] = [
  { floor: 0,    title: 'SPARK' },
  { floor: 50,   title: 'SIGNAL' },
  { floor: 150,  title: 'RHYTHM' },
  { floor: 400,  title: 'PATTERN' },
  { floor: 900,  title: 'CURRENT' },
  { floor: 1800, title: 'ORBIT' },
  { floor: 3500, title: 'MERIDIAN' },
  { floor: 7000, title: 'ZENITH' },
]

export function arcadeRankForXp(xp: number): ArcadeRank {
  const safe = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0))
  let idx = 0
  for (let i = 0; i < ARCADE_LADDER.length; i++) {
    if (safe >= ARCADE_LADDER[i].floor) idx = i
  }
  return {
    level: idx + 1,
    title: ARCADE_LADDER[idx].title,
    xp: safe,
    floor: ARCADE_LADDER[idx].floor,
    next: ARCADE_LADDER[idx + 1]?.floor ?? null,
  }
}
