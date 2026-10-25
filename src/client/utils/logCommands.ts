/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth.
 *
 * Every slash command / emoji trigger the Log understands is declared
 * here once. `logTriggers.ts` derives its detection rules from this
 * list and `/system` renders its help screen from it, so the help text
 * can never drift from what the Log actually does.
 *
 * Pure module: no stores, no DOM.
 */

export type LogTrigger =
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

export type LogCommandGroup = 'AI' | 'SYSTEM' | 'WELLBEING' | 'INTERFACE'

export interface LogCommand {
  trigger: LogTrigger
  /** Primary slash command, without the slash. Empty = emoji-only trigger. */
  command: string
  /** Extra slash keywords that fire the same trigger. */
  aliases: string[]
  emojis: string[]
  /** Optional argument hint shown in /system, e.g. "[day|week|month|year]". */
  args?: string
  description: string
  group: LogCommandGroup
  /** Hidden commands fire but are not listed in /system. */
  hidden?: boolean
}

export const LOG_COMMANDS: LogCommand[] = [
  { trigger: 'story-mode', command: 'story', aliases: [], emojis: ['📖'], args: '[day|week|month|year]',
    description: 'Compressed story of your day, week, month or year', group: 'AI' },
  { trigger: 'qi-rfi', command: 'qi', aliases: [], emojis: [], args: '[query]',
    description: 'Ask the Quantum Intelligence engine', group: 'AI' },
  { trigger: 'prayer-mode', command: 'prayer', aliases: ['candle'], emojis: ['🕯️', '🕯'],
    description: 'Generate contextual scripture', group: 'AI' },
  { trigger: 'how-checkin', command: 'how', aliases: [], emojis: [],
    description: 'Open LOT AI check-in (System tab)', group: 'AI' },

  { trigger: 'ai-scan', command: 'scan', aliases: ['ai'], emojis: [],
    description: 'System status overview', group: 'SYSTEM' },
  { trigger: 'assembly-check', command: 'assembly', aliases: ['assemble'], emojis: [],
    description: 'Self-assembly module status', group: 'SYSTEM' },
  { trigger: 'qos-report', command: 'qos', aliases: ['os-report'], emojis: [],
    description: 'Quantum OS state analysis', group: 'SYSTEM' },
  { trigger: 'phys-report', command: 'phys', aliases: ['cohort-report'], emojis: [],
    description: 'Physiological cohort report', group: 'SYSTEM' },
  { trigger: 'sil-check', command: 'sil', aliases: ['silence-check'], emojis: [],
    description: 'Signal silence pattern check', group: 'SYSTEM' },
  { trigger: 'system-help', command: 'system', aliases: ['commands'], emojis: [],
    description: 'This help screen', group: 'SYSTEM' },

  { trigger: 'force-fast', command: 'fast', aliases: [], emojis: [],
    description: 'Orthodox fasting calendar', group: 'WELLBEING' },
  { trigger: 'breathe', command: 'breathe', aliases: ['breath'], emojis: [],
    description: '4-2-6 breathing exercise', group: 'WELLBEING' },
  { trigger: 'freeze-widgets', command: 'freeze', aliases: ['pause'], emojis: ['🧊'],
    description: 'Pause and reflect protocol', group: 'WELLBEING' },
  { trigger: 'silent-mode', command: 'silent', aliases: ['quiet'], emojis: [],
    description: 'Signal silence check', group: 'WELLBEING' },
  { trigger: 'cohort-support', command: '', aliases: [], emojis: ['❗', '‼️', '‼'],
    description: 'Request cohort support', group: 'WELLBEING', hidden: true },

  { trigger: 'toggle-synth', command: 'synth', aliases: ['keyboard'], emojis: ['🎹'],
    description: 'Toggle keyboard sound', group: 'INTERFACE' },
  { trigger: 'radio-toggle', command: 'radio', aliases: [], emojis: ['🎧'],
    description: 'Toggle radio', group: 'INTERFACE' },
  { trigger: 'night-mode', command: 'night', aliases: [], emojis: ['🌙'],
    description: 'Dark mode', group: 'INTERFACE' },
]

const GROUP_ORDER: LogCommandGroup[] = ['AI', 'SYSTEM', 'WELLBEING', 'INTERFACE']

/**
 * Renders the /system help screen. Line format is consumed by the
 * Log renderer: lines starting with "/" are two-column command rows
 * (command, 2+ spaces, description); other non-empty lines are headings.
 */
export function buildSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const group of GROUP_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.group === group && !c.hidden && c.command)
    if (!rows.length) continue
    lines.push('', group)
    for (const c of rows) {
      const head = `/${c.command}${c.args ? ' ' + c.args : ''}`
      lines.push(`${head}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}
