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
 * `/system` renders its screen from this table, so the help screen can
 * never drift from what the Log actually understands. A unit test
 * (scripts/tests/test-log-commands.ts) asserts every registry entry is
 * recognised by the trigger detector in client/utils/logTriggers.ts.
 *
 * Pure module: no DOM, no stores, no I/O. Safe for client and server.
 */

export type LogCommandGroup =
  | 'COMPRESSION'
  | 'ARCADE'
  | 'CONTEXT'
  | 'BODY'
  | 'AMBIENT'
  | 'SYSTEM'

export interface LogCommand {
  /** Canonical name, without the leading slash. */
  name: string
  /** Alternate spellings, without the leading slash. */
  aliases: string[]
  /** Usage string as shown to the user. */
  usage: string
  group: LogCommandGroup
  description: string
}

export const LOG_COMMAND_GROUPS: LogCommandGroup[] = [
  'COMPRESSION',
  'ARCADE',
  'CONTEXT',
  'BODY',
  'AMBIENT',
  'SYSTEM',
]

export const LOG_COMMANDS: LogCommand[] = [
  { name: 'story', aliases: [], usage: '/story [day|week|month|year]', group: 'COMPRESSION', description: 'Compressed story of your day, week, month or year' },
  { name: 'rank', aliases: ['arcade', 'xp'], usage: '/rank', group: 'ARCADE', description: 'Your arcade rank, XP and next unlock' },
  { name: 'scan', aliases: ['ai'], usage: '/scan', group: 'CONTEXT', description: 'System status overview' },
  { name: 'qi', aliases: [], usage: '/qi [query]', group: 'CONTEXT', description: 'Ask the Quantum Intelligence engine' },
  { name: 'qos', aliases: ['os-report'], usage: '/qos', group: 'CONTEXT', description: 'Quantum OS state analysis' },
  { name: 'phys', aliases: ['cohort-report'], usage: '/phys', group: 'CONTEXT', description: 'Physiological cohort report' },
  { name: 'assembly', aliases: ['assemble'], usage: '/assembly', group: 'CONTEXT', description: 'Self-assembly module status' },
  { name: 'how', aliases: [], usage: '/how', group: 'CONTEXT', description: 'Open LOT AI check-in (System tab)' },
  { name: 'prayer', aliases: ['candle'], usage: '/prayer', group: 'BODY', description: 'Generate contextual scripture' },
  { name: 'breathe', aliases: ['breath'], usage: '/breathe', group: 'BODY', description: '4-2-6 breathing exercise' },
  { name: 'freeze', aliases: ['pause'], usage: '/freeze', group: 'BODY', description: 'Pause and reflect protocol' },
  { name: 'silent', aliases: ['quiet'], usage: '/silent', group: 'BODY', description: 'Signal silence check' },
  { name: 'sil', aliases: ['silence-check'], usage: '/sil', group: 'BODY', description: 'Signal silence pattern check' },
  { name: 'fast', aliases: [], usage: '/fast', group: 'BODY', description: 'Orthodox fasting calendar' },
  { name: 'synth', aliases: ['keyboard'], usage: '/synth', group: 'AMBIENT', description: 'Toggle keyboard sound' },
  { name: 'radio', aliases: [], usage: '/radio', group: 'AMBIENT', description: 'Toggle radio' },
  { name: 'night', aliases: [], usage: '/night', group: 'AMBIENT', description: 'Dark mode' },
  { name: 'system', aliases: ['commands'], usage: '/system', group: 'SYSTEM', description: 'This command screen' },
]

/** Shortcuts shown at the bottom of the /system screen. */
export const LOG_SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: 'Ctrl+Enter', description: 'Save log immediately' },
]

/**
 * Renders the /system screen. Format contract (consumed by the Logs
 * renderer): lines starting with "/" are command rows — command, then
 * 2+ spaces, then description; other non-empty lines are section
 * headers; empty lines are spacers.
 */
export function renderSystemHelp(opts?: { rankLine?: string }): string {
  const width = Math.max(...LOG_COMMANDS.map(c => c.usage.length)) + 2
  const lines: string[] = ['AVAILABLE COMMANDS']
  if (opts?.rankLine) lines.push(opts.rankLine)
  for (const group of LOG_COMMAND_GROUPS) {
    const rows = LOG_COMMANDS.filter(c => c.group === group)
    if (!rows.length) continue
    lines.push('', group)
    for (const c of rows) lines.push(`${c.usage.padEnd(width)}${c.description}`)
  }
  lines.push('', 'SHORTCUTS')
  for (const s of LOG_SHORTCUTS) lines.push(`${s.keys.padEnd(width)}${s.description}`)
  return lines.join('\n')
}

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

const PERIOD_WORDS: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year', annual: 'year',
}

/**
 * Reads the period argument that follows /story ("/story week").
 * Returns 'day' when absent or unrecognised so a bare /story keeps
 * working. Only the token directly after the command is considered.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(?:^|\s)\/story(?:\s+([a-z]+))?/i.exec(text || '')
  const word = m?.[1]?.toLowerCase()
  return (word && PERIOD_WORDS[word]) || 'day'
}

/** Removes the /story command (and optional period word) from log text. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(?:\s+(?:day|today|daily|week|weekly|month|monthly|year|yearly|annual)\b)?/gi, '$1')
    .replace(/📖/g, '')
    .trim()
}
