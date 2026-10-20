/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for every slash command
 * the Log (Journal) understands. The /system help screen is generated from
 * this table, so a command can never exist without being documented.
 *
 * Pure module: no stores, no DOM, no imports. Safe on client and server.
 */

export type LogCommandCategory = 'STORY' | 'CONTEXT' | 'PROTOCOL' | 'MEDIA' | 'NAVIGATE' | 'SYSTEM'

export interface LogCommand {
  /** Canonical name, lower-case, without the leading slash. */
  name: string
  /** Extra keywords that fire the same command. */
  aliases: string[]
  /** Optional emoji that fires the command (exact match). */
  emoji?: string
  category: LogCommandCategory
  /** Argument hint rendered after the name, e.g. "[day|week|month|year]". */
  args?: string
  description: string
}

export const LOG_COMMAND_CATEGORY_ORDER: LogCommandCategory[] = [
  'STORY', 'CONTEXT', 'PROTOCOL', 'MEDIA', 'NAVIGATE', 'SYSTEM',
]

export const LOG_COMMANDS: LogCommand[] = [
  { name: 'story',    aliases: [], emoji: '📖', category: 'STORY', args: '[day|week|month|year]',
    description: 'Compressed story of your day, week, month or year' },
  { name: 'prayer',   aliases: ['candle'], emoji: '🕯️', category: 'STORY',
    description: 'Contextual scripture' },
  { name: 'scan',     aliases: ['ai'], category: 'CONTEXT',
    description: 'System status overview' },
  { name: 'qi',       aliases: [], category: 'CONTEXT', args: '[query]',
    description: 'Ask the Quantum Intelligence engine' },
  { name: 'qos',      aliases: ['os-report'], category: 'CONTEXT',
    description: 'Quantum OS state analysis' },
  { name: 'phys',     aliases: ['cohort-report'], category: 'CONTEXT',
    description: 'Physiological cohort report' },
  { name: 'assembly', aliases: ['assemble'], category: 'CONTEXT',
    description: 'Self-assembly module status' },
  { name: 'sil',      aliases: ['silence-check'], category: 'CONTEXT',
    description: 'Signal silence check' },
  { name: 'fast',     aliases: [], category: 'PROTOCOL',
    description: 'Orthodox fasting calendar' },
  { name: 'breathe',  aliases: ['breath'], category: 'PROTOCOL',
    description: '4-2-6 breathing exercise' },
  { name: 'freeze',   aliases: ['pause'], emoji: '🧊', category: 'PROTOCOL',
    description: 'Pause and reflect protocol' },
  { name: 'silent',   aliases: ['quiet'], category: 'PROTOCOL',
    description: 'Silent mode' },
  { name: 'synth',    aliases: ['keyboard'], emoji: '🎹', category: 'MEDIA',
    description: 'Toggle keyboard sound' },
  { name: 'radio',    aliases: [], emoji: '🎧', category: 'MEDIA',
    description: 'Toggle radio' },
  { name: 'night',    aliases: [], emoji: '🌙', category: 'MEDIA',
    description: 'Dark mode' },
  { name: 'how',      aliases: [], category: 'NAVIGATE',
    description: 'Open LOT AI check-in (System tab)' },
  { name: 'system',   aliases: ['commands'], category: 'SYSTEM',
    description: 'This help screen' },
]

export function findLogCommand(name: string): LogCommand | undefined {
  const n = name.toLowerCase().replace(/^\//, '')
  return LOG_COMMANDS.find(c => c.name === n || c.aliases.includes(n))
}

export interface SystemHelpRow {
  usage: string
  description: string
}
export interface SystemHelpSection {
  title: string
  rows: SystemHelpRow[]
}

/** Build the /system help screen as structured sections (grouped, ordered). */
export function buildSystemHelp(): SystemHelpSection[] {
  const sections: SystemHelpSection[] = LOG_COMMAND_CATEGORY_ORDER.map(cat => ({
    title: cat,
    rows: LOG_COMMANDS.filter(c => c.category === cat).map(c => ({
      usage: `/${c.name}${c.args ? ' ' + c.args : ''}`,
      description: c.description,
    })),
  })).filter(s => s.rows.length > 0)

  sections.push({
    title: 'SHORTCUTS',
    rows: [{ usage: 'Ctrl+Enter', description: 'Save log immediately' }],
  })
  return sections
}

/** Flat text rendering of /system — used for tests and plain-text surfaces. */
export function renderSystemHelpText(): string {
  return buildSystemHelp()
    .map(s => [s.title, ...s.rows.map(r => `${r.usage.padEnd(26)}${r.description}`)].join('\n'))
    .join('\n\n')
}

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'
export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'week'

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', weekly: 'week', w: 'week',
  month: 'month', monthly: 'month', m: 'month',
  year: 'year', yearly: 'year', y: 'year',
}

/**
 * Parse "/story [period]" out of a log entry. Returns the requested period
 * (default week) and the remaining text with the command stripped.
 */
export function parseStoryCommand(text: string): { period: StoryPeriod; rest: string } {
  const m = /(^|\s)\/story(?:\s+([a-z]+))?(?=\s|$|[^a-z0-9_])/i.exec(text || '')
  let period: StoryPeriod = DEFAULT_STORY_PERIOD
  let rest = text || ''
  if (m) {
    const arg = (m[2] || '').toLowerCase()
    const mapped = PERIOD_ALIASES[arg]
    // Only swallow the argument when it is a real period keyword.
    const consumed = mapped ? m[0] : m[0].replace(/\s+[a-z]+$/i, '')
    if (mapped) period = mapped
    rest = (text || '').replace(consumed, m[1] || '')
  }
  rest = rest.replace(/📖/g, '').trim()
  return { period, rest }
}
