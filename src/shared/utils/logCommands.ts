/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log Command Registry — single source of truth for every slash command
 * and emoji trigger that can be typed into a Log entry.
 *
 * Consumers:
 *  - client/utils/logTriggers.ts  builds its detector rules from this table
 *  - Logs.tsx                     renders /system output from this table
 *  - docs/technical/LOT-LOG-COMMANDS.md documents this table
 *
 * Adding a command = adding one row here. The /system screen, the detector
 * and the prefix hints update together, so the help can never drift from
 * what the detector actually accepts.
 *
 * Pure module: no stores, no DOM, no I/O.
 */

export type LogCommandId =
  | 'toggle-synth'
  | 'ai-scan'
  | 'silent-mode'
  | 'breathe'
  | 'force-fast'
  | 'radio-toggle'
  | 'night-mode'
  | 'prayer-mode'
  | 'freeze-widgets'
  | 'cohort-support'
  | 'qos-report'
  | 'assembly-check'
  | 'phys-report'
  | 'sil-check'
  | 'qi-rfi'
  | 'system-help'
  | 'story-mode'
  | 'how-checkin'

export type LogCommandCategory = 'MEMORY' | 'INTELLIGENCE' | 'PROTOCOL' | 'INTERFACE'

export interface LogCommand {
  id: LogCommandId
  /** Primary slash command, without the leading slash. `null` = emoji-only. */
  primary: string | null
  /** Additional accepted spellings (lower-case, no slash). */
  aliases: string[]
  /** Emoji triggers (exact match). */
  emojis: string[]
  category: LogCommandCategory
  /** One-line description shown on the /system screen. */
  summary: string
  /** Optional argument hint, shown next to the command, e.g. "[day|week]". */
  args?: string
}

export const LOG_COMMANDS: LogCommand[] = [
  // MEMORY — compress the operator's own record back to them
  { id: 'story-mode', primary: 'story', aliases: [], emojis: ['📖'], category: 'MEMORY',
    summary: 'Compressed story of your record', args: '[day|week|month|year]' },
  { id: 'how-checkin', primary: 'how', aliases: [], emojis: [], category: 'MEMORY',
    summary: 'Open LOT AI check-in (System tab)' },
  { id: 'prayer-mode', primary: 'prayer', aliases: ['candle'], emojis: ['🕯️', '🕯'], category: 'MEMORY',
    summary: 'Contextual scripture' },

  // INTELLIGENCE — query the engines
  { id: 'qi-rfi', primary: 'qi', aliases: [], emojis: [], category: 'INTELLIGENCE',
    summary: 'Ask the Quantum Intelligence engine', args: '[query]' },
  { id: 'ai-scan', primary: 'scan', aliases: ['ai'], emojis: [], category: 'INTELLIGENCE',
    summary: 'System status overview' },
  { id: 'qos-report', primary: 'qos', aliases: ['os-report'], emojis: [], category: 'INTELLIGENCE',
    summary: 'Quantum OS state analysis' },
  { id: 'assembly-check', primary: 'assembly', aliases: ['assemble'], emojis: [], category: 'INTELLIGENCE',
    summary: 'Self-assembly module status' },
  { id: 'phys-report', primary: 'phys', aliases: ['cohort-report'], emojis: [], category: 'INTELLIGENCE',
    summary: 'Physiological cohort report' },
  { id: 'sil-check', primary: 'sil', aliases: ['silence-check'], emojis: [], category: 'INTELLIGENCE',
    summary: 'Signal silence pattern check' },

  // PROTOCOL — self-care protocols
  { id: 'breathe', primary: 'breathe', aliases: ['breath'], emojis: [], category: 'PROTOCOL',
    summary: '4-2-6 breathing exercise' },
  { id: 'freeze-widgets', primary: 'freeze', aliases: ['pause'], emojis: ['🧊'], category: 'PROTOCOL',
    summary: 'Pause and reflect protocol' },
  { id: 'force-fast', primary: 'fast', aliases: [], emojis: [], category: 'PROTOCOL',
    summary: 'Orthodox fasting calendar' },
  { id: 'silent-mode', primary: 'silent', aliases: ['quiet'], emojis: [], category: 'PROTOCOL',
    summary: 'Acknowledge signal silence' },
  { id: 'cohort-support', primary: null, aliases: [], emojis: ['❗', '‼️', '‼'], category: 'PROTOCOL',
    summary: 'Request cohort support (emoji only)' },

  // INTERFACE — toggles
  { id: 'toggle-synth', primary: 'synth', aliases: ['keyboard'], emojis: ['🎹'], category: 'INTERFACE',
    summary: 'Toggle keyboard sound' },
  { id: 'radio-toggle', primary: 'radio', aliases: [], emojis: ['🎧'], category: 'INTERFACE',
    summary: 'Toggle radio' },
  { id: 'night-mode', primary: 'night', aliases: [], emojis: ['🌙'], category: 'INTERFACE',
    summary: 'Dark mode' },
  { id: 'system-help', primary: 'system', aliases: ['commands'], emojis: [], category: 'INTERFACE',
    summary: 'This command list' },
]

const CATEGORY_ORDER: LogCommandCategory[] = ['MEMORY', 'INTELLIGENCE', 'PROTOCOL', 'INTERFACE']

/** Every slash keyword (primary + aliases) for a command. */
export function commandKeywords(cmd: LogCommand): string[] {
  return cmd.primary ? [cmd.primary, ...cmd.aliases] : [...cmd.aliases]
}

/**
 * Renders the /system screen. Line grammar (consumed by Logs.tsx):
 *   - a line starting with "/" is `<command>  <description>` (2+ spaces split)
 *   - any other non-empty line is a section header
 *   - an empty line is vertical space
 */
export function formatSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const category of CATEGORY_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.category === category && c.primary)
    if (rows.length === 0) continue
    lines.push('', category)
    for (const c of rows) {
      const head = `/${c.primary}${c.args ? ' ' + c.args : ''}`
      lines.push(`${head}  ${c.summary}`)
    }
  }
  const emojiRows = LOG_COMMANDS.filter(c => c.emojis.length > 0)
  lines.push('', 'EMOJI TRIGGERS')
  lines.push(emojiRows.map(c => `${c.emojis[0]} ${c.primary ?? c.id}`).join('   '))
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

/**
 * Prefix hints for a partially typed command: `sys` → [system]. Used by the
 * Log surface to suggest completions. Returns [] for empty/non-matching input.
 */
export function suggestCommands(prefix: string, limit = 5): LogCommand[] {
  const p = prefix.replace(/^\//, '').trim().toLowerCase()
  if (!p) return []
  return LOG_COMMANDS.filter(c => commandKeywords(c).some(k => k.startsWith(p))).slice(0, limit)
}

// ---------------------------------------------------------------------------
// /story period argument
// ---------------------------------------------------------------------------

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'day'

/**
 * Reads the period argument that follows /story in a log entry.
 * `/story week` → 'week'; bare `/story` or unknown argument → the default.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(?:^|\s)\/story\s+(day|week|month|year)s?\b/i.exec(text || '')
  return m ? (m[1].toLowerCase() as StoryPeriod) : DEFAULT_STORY_PERIOD
}
