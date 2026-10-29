/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry
 *
 * Single source of truth for every slash command the Log understands.
 * `logTriggers.ts` derives its detection rules from this table and the
 * `/system` screen renders its help from it, so a command can never be
 * detected-but-undocumented (or documented-but-dead).
 *
 * Pure module: no stores, no DOM, no network.
 */

export type LogCommandGroup = 'MEMORY' | 'SYSTEM' | 'BODY' | 'AMBIENT'

export interface LogCommand {
  /** Trigger id emitted by `detectTriggers` */
  trigger: string
  /** First keyword is the canonical slash form shown in /system */
  keywords: string[]
  emojis: string[]
  /** Optional argument hint rendered after the command, e.g. "[query]" */
  args?: string
  description: string
  group: LogCommandGroup
}

export const LOG_COMMANDS: LogCommand[] = [
  // MEMORY — commands that read or compress the user's own data
  { trigger: 'story-mode', keywords: ['story'], emojis: ['📖'], args: '[day|week|month|year]', group: 'MEMORY',
    description: 'Compressed story of your day, week, month or year' },
  { trigger: 'prayer-mode', keywords: ['prayer', 'candle'], emojis: ['🕯️', '🕯'], group: 'MEMORY',
    description: 'Generate contextual scripture' },
  { trigger: 'how-checkin', keywords: ['how'], emojis: [], group: 'MEMORY',
    description: 'Open LOT AI check-in (System tab)' },
  { trigger: 'qi-rfi', keywords: ['qi'], emojis: [], args: '[query]', group: 'MEMORY',
    description: 'Ask the Quantum Intelligence engine' },

  // SYSTEM — read-outs of the engine itself
  { trigger: 'ai-scan', keywords: ['scan', 'ai'], emojis: [], group: 'SYSTEM',
    description: 'System status overview' },
  { trigger: 'assembly-check', keywords: ['assembly', 'assemble'], emojis: [], group: 'SYSTEM',
    description: 'Self-assembly module status' },
  { trigger: 'phys-report', keywords: ['phys', 'cohort-report'], emojis: [], group: 'SYSTEM',
    description: 'Physiological cohort report' },
  { trigger: 'qos-report', keywords: ['qos', 'os-report'], emojis: [], group: 'SYSTEM',
    description: 'Quantum OS state analysis' },
  { trigger: 'sil-check', keywords: ['sil', 'silence-check'], emojis: [], group: 'SYSTEM',
    description: 'Signal silence check' },
  { trigger: 'arcade-rank', keywords: ['rank', 'arcade'], emojis: [], group: 'SYSTEM',
    description: 'Log Arcade rank, XP and next unlock' },
  { trigger: 'system-help', keywords: ['system', 'commands'], emojis: [], group: 'SYSTEM',
    description: 'This help screen' },

  // BODY — self-care protocols
  { trigger: 'force-fast', keywords: ['fast'], emojis: [], group: 'BODY',
    description: 'Orthodox fasting calendar' },
  { trigger: 'breathe', keywords: ['breathe', 'breath'], emojis: [], group: 'BODY',
    description: '4-2-6 breathing exercise' },
  { trigger: 'freeze-widgets', keywords: ['freeze', 'pause'], emojis: ['🧊'], group: 'BODY',
    description: 'Pause and reflect protocol' },
  { trigger: 'silent-mode', keywords: ['silent', 'quiet'], emojis: [], group: 'BODY',
    description: 'Signal silence acknowledgement' },

  // AMBIENT — environment toggles
  { trigger: 'toggle-synth', keywords: ['synth', 'keyboard'], emojis: ['🎹'], group: 'AMBIENT',
    description: 'Toggle keyboard sound' },
  { trigger: 'radio-toggle', keywords: ['radio'], emojis: ['🎧'], group: 'AMBIENT',
    description: 'Toggle radio' },
  { trigger: 'night-mode', keywords: ['night'], emojis: ['🌙'], group: 'AMBIENT',
    description: 'Dark mode' },

  // Emoji-only signal (no slash form, intentionally hidden from /system)
  { trigger: 'cohort-support', keywords: [], emojis: ['❗', '‼️', '‼'], group: 'SYSTEM',
    description: 'Cohort support signal' },
]

const HIDDEN_FROM_HELP = new Set(['cohort-support'])

/** Canonical slash form for a trigger, e.g. `/story` — null if emoji-only. */
export function slashFor(trigger: string): string | null {
  const cmd = LOG_COMMANDS.find(c => c.trigger === trigger)
  return cmd && cmd.keywords.length ? `/${cmd.keywords[0]}` : null
}

const GROUP_ORDER: LogCommandGroup[] = ['MEMORY', 'SYSTEM', 'BODY', 'AMBIENT']

/**
 * Renders the /system screen as plain text. Format contract with the
 * Log renderer: lines starting with "/" are `command  description`
 * rows (separated by 2+ spaces); other non-empty lines are headings;
 * empty lines are spacers.
 */
export function renderSystemHelp(extraHeader: string[] = []): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const group of GROUP_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.group === group && !HIDDEN_FROM_HELP.has(c.trigger) && c.keywords.length)
    if (!rows.length) continue
    lines.push('', group)
    for (const c of rows) {
      const cmd = `/${c.keywords[0]}${c.args ? ' ' + c.args : ''}`
      lines.push(`${cmd}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter  Save log immediately')
  if (extraHeader.length) lines.push('', 'ARCADE', ...extraHeader)
  return lines.join('\n')
}

export type StoryPeriodArg = 'day' | 'week' | 'month' | 'year'

/**
 * Parses the period argument of `/story`. `/story week` → 'week'.
 * Accepts singular and plural, case-insensitive; anything else → 'day'.
 */
export function parseStoryPeriod(text: string): StoryPeriodArg {
  const m = /(^|\s)\/story\s+(day|week|month|year)s?\b/i.exec(text || '')
  return (m ? m[2].toLowerCase() : 'day') as StoryPeriodArg
}

/** Strips the `/story [period]` command and 📖 marker, leaving the user's own words. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/\/story(\s+(day|week|month|year)s?\b)?/i, '')
    .replace(/📖/g, '')
    .trim()
}
