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
 * Pure (no stores, no DOM, no network) so the client help screen, the
 * trigger detector and the server can all read the same table.
 *
 *   /system  -> renderSystemHelp()   (generated from LOG_COMMANDS)
 *   /story   -> parseStoryCommand()  (period: now | day | week | month | year)
 */

export type LogCommandCategory = 'MEMORY' | 'STATE' | 'PROTOCOL' | 'DEVICE' | 'SYSTEM'

export interface LogCommandDef {
  /** Primary command, without the leading slash. */
  name: string
  /** Optional argument hint shown in help, e.g. "[day|week|month|year]". */
  args?: string
  description: string
  category: LogCommandCategory
}

/** Display order = array order, grouped by category in CATEGORY_ORDER. */
export const LOG_COMMANDS: LogCommandDef[] = [
  { name: 'story',    args: '[day|week|month|year]', category: 'MEMORY',   description: 'Compressed story of your day, week, month or year' },
  { name: 'prayer',   category: 'MEMORY',   description: 'Generate contextual scripture' },
  { name: 'how',      category: 'MEMORY',   description: 'Open LOT AI check-in (System tab)' },
  { name: 'qi',       args: '[query]', category: 'MEMORY', description: 'Ask the Quantum Intelligence engine' },
  { name: 'phys',     category: 'STATE',    description: 'Physiological cohort report' },
  { name: 'qos',      category: 'STATE',    description: 'Quantum OS state analysis' },
  { name: 'scan',     category: 'STATE',    description: 'System status overview' },
  { name: 'assembly', category: 'STATE',    description: 'Self-assembly module status' },
  { name: 'breathe',  category: 'PROTOCOL', description: '4-2-6 breathing exercise' },
  { name: 'freeze',   category: 'PROTOCOL', description: 'Pause and reflect protocol' },
  { name: 'silent',   category: 'PROTOCOL', description: 'Signal silence check' },
  { name: 'fast',     category: 'PROTOCOL', description: 'Orthodox fasting calendar' },
  { name: 'synth',    category: 'DEVICE',   description: 'Toggle keyboard sound' },
  { name: 'radio',    category: 'DEVICE',   description: 'Toggle radio' },
  { name: 'night',    category: 'DEVICE',   description: 'Dark mode' },
  { name: 'system',   category: 'SYSTEM',   description: 'This help screen' },
]

const CATEGORY_ORDER: LogCommandCategory[] = ['MEMORY', 'STATE', 'PROTOCOL', 'DEVICE', 'SYSTEM']

/** Pad the command column so the client can split on 2+ spaces. */
const COL = 16

/**
 * Renders the /system screen. Format contract with the client renderer:
 *  - a line starting with "/" is a command row: "/name [args]<2+ spaces>description"
 *  - any other non-empty line is a section header
 *  - empty line = vertical gap
 */
export function renderSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push('', cat)
    for (const c of rows) {
      const left = `/${c.name}${c.args ? ' ' + c.args : ''}`
      lines.push(`${left.padEnd(COL)}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

// ── /story ──────────────────────────────────────────────────────────────────

export type StoryPeriod = 'now' | 'day' | 'week' | 'month' | 'year'

export const STORY_PERIOD_DAYS: Record<StoryPeriod, number> = {
  now: 3,
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year', annual: 'year',
}

/**
 * Parses "/story", "/story week", "📖 month". Unknown or missing period
 * falls back to 'now' (short-horizon story, the legacy behavior).
 * `logText` is the entry with the command tokens removed.
 */
export function parseStoryCommand(text: string): { period: StoryPeriod; logText: string } {
  let period: StoryPeriod = 'now'
  let logText = text || ''
  const m = /(?:^|\s)\/story(?:\s+([a-z]+))?/i.exec(logText)
  if (m) {
    const alias = m[1] ? PERIOD_ALIASES[m[1].toLowerCase()] : undefined
    if (alias) period = alias
    // Only swallow the argument when it was a recognized period.
    logText = logText.replace(m[0], alias ? ' ' : m[0].replace(/\/story/i, ' '))
  }
  logText = logText.replace(/📖/g, '').replace(/\s+/g, ' ').trim()
  return { period, logText }
}
