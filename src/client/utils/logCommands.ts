/**
 * LOT SYSTEMS CORPORATION — Log command registry (pure)
 *
 * Single source of truth for the slash commands typed into the Log.
 * /system renders its help from this table, so help can never drift from
 * the commands that exist. Detection stays in logTriggers.ts; the test in
 * scripts/tests/test-log-system.ts fails if the two disagree.
 */
import type { LogTrigger } from './logTriggers'

export type CommandGroup = 'CONTEXT' | 'AI' | 'SELF-CARE' | 'DEVICE' | 'SYSTEM'

export interface LogCommand {
  command: string            // primary slash command, e.g. '/story'
  usage?: string             // shown instead of command when it takes arguments
  description: string
  group: CommandGroup
  trigger: LogTrigger
}

export const LOG_COMMANDS: LogCommand[] = [
  { command: '/story',    usage: '/story [week|month|year]', group: 'AI', trigger: 'story-mode',
    description: 'Compressed story of your journal and context' },
  { command: '/rank',     group: 'AI', trigger: 'rank-report',
    description: 'Arcade rank, XP and streak' },
  { command: '/qi',       usage: '/qi [query]', group: 'AI', trigger: 'qi-rfi',
    description: 'Ask the Quantum Intelligence engine' },
  { command: '/how',      group: 'AI', trigger: 'how-checkin',
    description: 'Open LOT AI check-in (System tab)' },
  { command: '/scan',     group: 'CONTEXT', trigger: 'ai-scan',
    description: 'System status overview' },
  { command: '/assembly', group: 'CONTEXT', trigger: 'assembly-check',
    description: 'Self-assembly module status' },
  { command: '/phys',     group: 'CONTEXT', trigger: 'phys-report',
    description: 'Physiological cohort report' },
  { command: '/qos',      group: 'CONTEXT', trigger: 'qos-report',
    description: 'Quantum OS state analysis' },
  { command: '/fast',     group: 'CONTEXT', trigger: 'force-fast',
    description: 'Orthodox fasting calendar' },
  { command: '/prayer',   group: 'SELF-CARE', trigger: 'prayer-mode',
    description: 'Contextual scripture' },
  { command: '/breathe',  group: 'SELF-CARE', trigger: 'breathe',
    description: '4-2-6 breathing exercise' },
  { command: '/freeze',   group: 'SELF-CARE', trigger: 'freeze-widgets',
    description: 'Pause and reflect protocol' },
  { command: '/silent',   group: 'SELF-CARE', trigger: 'silent-mode',
    description: 'Signal silence check' },
  { command: '/synth',    group: 'DEVICE', trigger: 'toggle-synth',
    description: 'Toggle keyboard sound' },
  { command: '/radio',    group: 'DEVICE', trigger: 'radio-toggle',
    description: 'Toggle radio' },
  { command: '/night',    group: 'DEVICE', trigger: 'night-mode',
    description: 'Dark mode' },
  { command: '/system',   group: 'SYSTEM', trigger: 'system-help',
    description: 'This help screen' },
]

const GROUP_ORDER: CommandGroup[] = ['AI', 'CONTEXT', 'SELF-CARE', 'DEVICE', 'SYSTEM']

/**
 * Text format consumed by the SYSTEM block renderer in Logs.tsx:
 * a non-slash line is a section label, "/cmd  description" is a row
 * (command and description separated by 2+ spaces).
 */
export function renderSystemHelp(rankLine?: string): string {
  const lines: string[] = []
  if (rankLine) lines.push(rankLine, '')
  GROUP_ORDER.forEach(group => {
    lines.push(group)
    LOG_COMMANDS.filter(c => c.group === group).forEach(c => {
      lines.push(`${(c.usage || c.command).padEnd(26)}  ${c.description}`)
    })
    lines.push('')
  })
  lines.push('SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}
