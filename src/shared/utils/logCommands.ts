/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for every slash command
 * the Log (Journal) understands. `/system` renders this table; docs mirror it.
 * Pure data + pure functions: no stores, no DOM, no I/O.
 */

export type LogCommandGroup = 'MEMORY' | 'SYSTEM' | 'RITUAL' | 'AMBIENT'

export interface LogCommandSpec {
  command: string
  group: LogCommandGroup
  description: string
}

export const LOG_COMMANDS: readonly LogCommandSpec[] = [
  { command: '/story',          group: 'MEMORY',  description: 'Compressed story of today' },
  { command: '/story week',     group: 'MEMORY',  description: 'Compressed story of the last 7 days' },
  { command: '/story month',    group: 'MEMORY',  description: 'Compressed story of the last 30 days' },
  { command: '/story year',     group: 'MEMORY',  description: 'Compressed story of the last 365 days' },
  { command: '/rank',           group: 'MEMORY',  description: 'Arcade rank: level, XP, streak' },
  { command: '/qi [query]',     group: 'MEMORY',  description: 'Ask the Quantum Intelligence engine' },
  { command: '/how',            group: 'MEMORY',  description: 'Open LOT AI check-in (System tab)' },
  { command: '/scan',           group: 'SYSTEM',  description: 'System status overview' },
  { command: '/assembly',       group: 'SYSTEM',  description: 'Self-assembly module status' },
  { command: '/phys',           group: 'SYSTEM',  description: 'Physiological cohort report' },
  { command: '/qos',            group: 'SYSTEM',  description: 'Quantum OS state analysis' },
  { command: '/silent',         group: 'SYSTEM',  description: 'Signal silence check' },
  { command: '/system',         group: 'SYSTEM',  description: 'This help screen' },
  { command: '/prayer',         group: 'RITUAL',  description: 'Generate contextual scripture' },
  { command: '/fast',           group: 'RITUAL',  description: 'Orthodox fasting calendar' },
  { command: '/breathe',        group: 'RITUAL',  description: '4-2-6 breathing exercise' },
  { command: '/freeze',         group: 'RITUAL',  description: 'Pause and reflect protocol' },
  { command: '/synth',          group: 'AMBIENT', description: 'Toggle keyboard sound' },
  { command: '/radio',          group: 'AMBIENT', description: 'Toggle radio' },
  { command: '/night',          group: 'AMBIENT', description: 'Dark mode' },
]

const GROUP_ORDER: LogCommandGroup[] = ['MEMORY', 'SYSTEM', 'RITUAL', 'AMBIENT']

/** Render the `/system` help screen as monospace-aligned plain text. */
export function renderSystemHelp(): string {
  const width = Math.max(...LOG_COMMANDS.map(c => c.command.length)) + 2
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const group of GROUP_ORDER) {
    lines.push('', group)
    for (const c of LOG_COMMANDS.filter(x => x.group === group)) {
      lines.push(`${c.command.padEnd(width)}${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', `${'Ctrl+Enter'.padEnd(width)}Save log immediately`)
  return lines.join('\n')
}
