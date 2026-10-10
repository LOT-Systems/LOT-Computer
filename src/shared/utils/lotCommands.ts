/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log slash-command registry
 *
 * Single source of truth for what `/system` prints and what the Log
 * suggests while the user is typing "/". Pure and dependency-free.
 *
 * The detectors that actually *fire* commands live in
 * `src/client/utils/logTriggers.ts`; `LOG_COMMAND_TRIGGER_NAMES` below is
 * checked against it so the two cannot silently drift apart.
 *
 * Doc: docs/technical/LOG-COMMANDS-AND-STORY.md
 */

export type CommandGroup = 'JOURNAL' | 'BODY' | 'SYSTEM' | 'INTERFACE'

export interface LogCommand {
  /** Name without the slash */
  name: string
  /** Optional argument hint shown in help, e.g. "[day|week|month|year]" */
  args?: string
  group: CommandGroup
  desc: string
}

export const LOG_COMMANDS: readonly LogCommand[] = [
  { name: 'story',    args: '[day|week|month|year]', group: 'JOURNAL',   desc: 'Compressed story of your day, week, month or year' },
  { name: 'prayer',   group: 'JOURNAL',   desc: 'Generate contextual scripture' },
  { name: 'how',      group: 'JOURNAL',   desc: 'Open LOT AI check-in (System tab)' },
  { name: 'breathe',  group: 'BODY',      desc: '4-2-6 breathing exercise' },
  { name: 'freeze',   group: 'BODY',      desc: 'Pause and reflect protocol' },
  { name: 'fast',     group: 'BODY',      desc: 'Orthodox fasting calendar' },
  { name: 'phys',     group: 'BODY',      desc: 'Physiological cohort report' },
  { name: 'silent',   group: 'BODY',      desc: 'Signal silence check' },
  { name: 'scan',     group: 'SYSTEM',    desc: 'System status overview' },
  { name: 'qi',       args: '[query]',    group: 'SYSTEM',   desc: 'Ask the Quantum Intelligence engine' },
  { name: 'assembly', group: 'SYSTEM',    desc: 'Self-assembly module status' },
  { name: 'qos',      group: 'SYSTEM',    desc: 'Quantum OS state analysis' },
  { name: 'synth',    group: 'INTERFACE', desc: 'Toggle keyboard sound' },
  { name: 'radio',    group: 'INTERFACE', desc: 'Toggle radio' },
  { name: 'night',    group: 'INTERFACE', desc: 'Dark mode' },
  { name: 'system',   group: 'INTERFACE', desc: 'This help screen' },
]

/** Commands that exist in the registry, as names — compared against logTriggers in tests. */
export const LOG_COMMAND_NAMES: readonly string[] = LOG_COMMANDS.map(c => c.name)

const GROUP_ORDER: CommandGroup[] = ['JOURNAL', 'BODY', 'SYSTEM', 'INTERFACE']

export function commandUsage(c: LogCommand): string {
  return `/${c.name}${c.args ? ' ' + c.args : ''}`
}

/**
 * Renders the `/system` screen as plain lines. Format contract with the
 * Log renderer: a line starting with "/" is `usage<2+ spaces>description`;
 * any other non-empty line is a section heading; empty lines are spacers.
 */
export function buildSystemHelp(): string {
  const width = Math.max(...LOG_COMMANDS.map(c => commandUsage(c).length)) + 2
  const lines: string[] = ['LOT® LOG COMMANDS', '']
  for (const g of GROUP_ORDER) {
    lines.push(g)
    for (const c of LOG_COMMANDS.filter(x => x.group === g)) {
      lines.push(commandUsage(c).padEnd(width) + c.desc)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter    Save log immediately')
  lines.push('Type "/"      List commands while you write')
  return lines.join('\n')
}

/**
 * Commands matching a partially typed slash command at the *end* of the text.
 * "/" -> all commands, "/st" -> story, "hello /br" -> breathe.
 * Returns [] when the text does not end in a slash token, or when the token
 * is already a complete command name with no longer match (nothing to suggest).
 */
export function suggestCommands(text: string): LogCommand[] {
  if (!text) return []
  const m = text.match(/(?:^|\s)\/([a-z0-9-]*)$/i)
  if (!m) return []
  const prefix = m[1].toLowerCase()
  const matches = LOG_COMMANDS.filter(c => c.name.startsWith(prefix))
  if (prefix && matches.length === 1 && matches[0].name === prefix) return []
  return matches
}
