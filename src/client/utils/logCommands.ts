/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for what `/system`
 * prints. Pure (no stores, no DOM). Detection stays in logTriggers.ts;
 * this file only documents and renders.
 */

export type CommandGroup = 'AI' | 'SYSTEM' | 'CARE' | 'AMBIENT'

export interface LogCommand {
  command: string // as typed, e.g. "/story [day|week|month|year]"
  group: CommandGroup
  summary: string
}

export const LOG_COMMANDS: LogCommand[] = [
  { command: '/story [day|week|month|year]', group: 'AI', summary: 'Compressed story of your journal (default: week)' },
  { command: '/qi [query]', group: 'AI', summary: 'Ask the Quantum Intelligence engine' },
  { command: '/prayer', group: 'AI', summary: 'Contextual scripture' },
  { command: '/how', group: 'AI', summary: 'Open LOT AI check-in (System tab)' },
  { command: '/scan', group: 'SYSTEM', summary: 'System status overview' },
  { command: '/qos', group: 'SYSTEM', summary: 'Quantum OS state analysis' },
  { command: '/assembly', group: 'SYSTEM', summary: 'Self-assembly module status' },
  { command: '/phys', group: 'SYSTEM', summary: 'Physiological cohort report' },
  { command: '/sil', group: 'SYSTEM', summary: 'Signal silence pattern check' },
  { command: '/system', group: 'SYSTEM', summary: 'This command list' },
  { command: '/breathe', group: 'CARE', summary: '4-2-6 breathing exercise' },
  { command: '/freeze', group: 'CARE', summary: 'Pause and reflect protocol' },
  { command: '/silent', group: 'CARE', summary: 'Signal silence acknowledgement' },
  { command: '/fast', group: 'CARE', summary: 'Orthodox fasting calendar' },
  { command: '/synth', group: 'AMBIENT', summary: 'Toggle keyboard sound' },
  { command: '/radio', group: 'AMBIENT', summary: 'Toggle radio' },
  { command: '/night', group: 'AMBIENT', summary: 'Dark mode' },
]

const GROUP_ORDER: CommandGroup[] = ['AI', 'SYSTEM', 'CARE', 'AMBIENT']

/** Lines shown by `/system`. Lines beginning with "/" are commands. */
export function renderSystemHelp(): string {
  const width = Math.max(...LOG_COMMANDS.map(c => c.command.length)) + 2
  const lines = ['AVAILABLE COMMANDS']
  for (const g of GROUP_ORDER) {
    lines.push('', g)
    for (const c of LOG_COMMANDS.filter(x => x.group === g)) {
      lines.push(c.command.padEnd(width) + c.summary)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter'.padEnd(width) + 'Save log immediately')
  return lines.join('\n')
}
