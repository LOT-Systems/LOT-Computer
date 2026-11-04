/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND REGISTRY — single source of truth for Log slash commands.
 *
 * `/system` renders its help screen FROM this registry, so the help can
 * never drift from what is actually wired. Pure module: no DOM, no stores.
 * See docs/technical/LOT-LOG-COMMAND-SYSTEM.md.
 */

export type LogCommandCategory = 'intelligence' | 'self-care' | 'environment' | 'system'

export interface LogCommandSpec {
  /** canonical name, lower-case, no slash */
  name: string
  /** extra accepted spellings */
  aliases?: string[]
  /** argument hint shown in help, e.g. "[day|week|month|year]" */
  args?: string
  description: string
  category: LogCommandCategory
}

export const LOG_COMMANDS: LogCommandSpec[] = [
  { name: 'story',    args: '[day|week|month|year]', description: 'Compressed story of your period', category: 'intelligence' },
  { name: 'qi',       args: '[query]', description: 'Ask the Quantum Intelligence engine', category: 'intelligence' },
  { name: 'how',      description: 'Open LOT AI check-in (System tab)', category: 'intelligence' },
  { name: 'rank',     aliases: ['arcade'], description: 'Your arcade rank, XP and next level', category: 'intelligence' },
  { name: 'prayer',   aliases: ['candle'], description: 'Generate contextual scripture', category: 'self-care' },
  { name: 'breathe',  aliases: ['breath'], description: '4-2-6 breathing exercise', category: 'self-care' },
  { name: 'freeze',   aliases: ['pause'], description: 'Pause and reflect protocol', category: 'self-care' },
  { name: 'silent',   aliases: ['quiet'], description: 'Signal silence check', category: 'self-care' },
  { name: 'fast',     description: 'Orthodox fasting calendar', category: 'self-care' },
  { name: 'scan',     aliases: ['ai'], description: 'System status overview', category: 'environment' },
  { name: 'phys',     aliases: ['cohort-report'], description: 'Physiological cohort report', category: 'environment' },
  { name: 'qos',      aliases: ['os-report'], description: 'Quantum OS state analysis', category: 'environment' },
  { name: 'assembly', aliases: ['assemble'], description: 'Self-assembly module status', category: 'environment' },
  { name: 'synth',    aliases: ['keyboard'], description: 'Toggle keyboard sound', category: 'system' },
  { name: 'radio',    description: 'Toggle radio', category: 'system' },
  { name: 'night',    description: 'Dark mode', category: 'system' },
  { name: 'system',   aliases: ['commands'], description: 'This help screen', category: 'system' },
]

const CATEGORY_TITLES: Record<LogCommandCategory, string> = {
  intelligence: 'INTELLIGENCE',
  'self-care': 'SELF-CARE',
  environment: 'ENVIRONMENT',
  system: 'SYSTEM',
}

const CATEGORY_ORDER: LogCommandCategory[] = ['intelligence', 'self-care', 'environment', 'system']

/** Resolve a typed word (with or without slash) to its canonical command. */
export function resolveCommand(word: string): LogCommandSpec | null {
  const w = word.trim().replace(/^\//, '').toLowerCase()
  if (!w) return null
  return LOG_COMMANDS.find(c => c.name === w || c.aliases?.includes(w)) || null
}

/**
 * Prefix suggestions for a partially typed command ("/st" → story).
 * Only returns when the text ends in an in-progress "/token".
 */
export function suggestCommands(text: string, limit = 5): LogCommandSpec[] {
  const m = /(?:^|\s)\/([a-z-]*)$/i.exec(text || '')
  if (!m) return []
  const prefix = m[1].toLowerCase()
  return LOG_COMMANDS.filter(
    c => c.name.startsWith(prefix) || c.aliases?.some(a => a.startsWith(prefix))
  ).slice(0, limit)
}

/**
 * Render the /system help screen as the line format the Log UI already
 * parses: header lines plain, command lines start with "/" and separate
 * command from description with 2+ spaces.
 */
export function renderSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const group = LOG_COMMANDS.filter(c => c.category === cat)
    if (!group.length) continue
    lines.push('', CATEGORY_TITLES[cat])
    for (const c of group) {
      const left = `/${c.name}${c.args ? ' ' + c.args : ''}`
      lines.push(`${left.padEnd(24)}${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter            Save log immediately')
  return lines.join('\n')
}

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

const PERIOD_WORDS: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', weekly: 'week', w: 'week',
  month: 'month', monthly: 'month', m: 'month',
  year: 'year', yearly: 'year', y: 'year',
}

/** Extract the period from "/story week" style text. Defaults to 'week'. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(?:^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  if (m) {
    const p = PERIOD_WORDS[m[1].toLowerCase()]
    if (p) return p
  }
  return 'week'
}

/** Remove the command token(s) from log text so only the user's words remain. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(?:^|\s)\/story(?:\s+(?:day|today|d|week|weekly|w|month|monthly|m|year|yearly|y)\b)?/i, ' ')
    .replace(/📖/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
