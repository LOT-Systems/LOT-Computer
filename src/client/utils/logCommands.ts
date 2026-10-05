/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for what `/system` prints.
 *
 * logTriggers.ts DETECTS commands; this file DESCRIBES them. They are kept
 * in lockstep by scripts/tests/test-story-compression.ts (every WIRED detector
 * trigger must be documented here; 'sil-check' is detected but has no Logs.tsx
 * handler yet, so it is deliberately not advertised). Pure module: no stores, no DOM.
 */

import type { LogTrigger } from './logTriggers'

export type CommandGroup = 'MEMORY' | 'ENGINE' | 'RITUAL' | 'ENVIRONMENT' | 'NAVIGATION'

export interface LogCommand {
  trigger: LogTrigger
  /** What the user types. Shown verbatim in /system. */
  usage: string
  description: string
  group: CommandGroup
}

export const GROUP_ORDER: CommandGroup[] = ['MEMORY', 'ENGINE', 'RITUAL', 'ENVIRONMENT', 'NAVIGATION']

export const LOG_COMMANDS: LogCommand[] = [
  // MEMORY — the compression loop
  { trigger: 'story-mode',     usage: '/story [day|week|month|year]', description: 'Compressed story of your day, week, month or year', group: 'MEMORY' },
  { trigger: 'prayer-mode',    usage: '/prayer',   description: 'Generate contextual scripture', group: 'MEMORY' },
  // ENGINE — Quantum Intent Engine
  { trigger: 'ai-scan',        usage: '/scan',     description: 'System status overview', group: 'ENGINE' },
  { trigger: 'qi-rfi',         usage: '/qi [query]', description: 'Ask the Quantum Intelligence engine', group: 'ENGINE' },
  { trigger: 'assembly-check', usage: '/assembly', description: 'Self-assembly module status', group: 'ENGINE' },
  { trigger: 'phys-report',    usage: '/phys',     description: 'Physiological cohort report', group: 'ENGINE' },
  { trigger: 'qos-report',     usage: '/qos',      description: 'Quantum OS state analysis', group: 'ENGINE' },
  // RITUAL — self-care
  { trigger: 'breathe',        usage: '/breathe',  description: '4-2-6 breathing exercise', group: 'RITUAL' },
  { trigger: 'freeze-widgets', usage: '/freeze',   description: 'Pause and reflect protocol', group: 'RITUAL' },
  { trigger: 'silent-mode',    usage: '/silent',   description: 'Signal silence check', group: 'RITUAL' },
  { trigger: 'force-fast',     usage: '/fast',     description: 'Orthodox fasting calendar', group: 'RITUAL' },
  // ENVIRONMENT
  { trigger: 'toggle-synth',   usage: '/synth',    description: 'Toggle keyboard sound', group: 'ENVIRONMENT' },
  { trigger: 'radio-toggle',   usage: '/radio',    description: 'Toggle radio', group: 'ENVIRONMENT' },
  { trigger: 'night-mode',     usage: '/night',    description: 'Dark mode', group: 'ENVIRONMENT' },
  // NAVIGATION
  { trigger: 'how-checkin',    usage: '/how',      description: 'Open LOT AI check-in (System tab)', group: 'NAVIGATION' },
  { trigger: 'system-help',    usage: '/system',   description: 'This help screen', group: 'NAVIGATION' },
]

/**
 * Plain-text /system screen. Lines that start with "/" render as
 * command rows (usage + 2+ spaces + description); other lines render
 * as section labels — that is the contract Logs.tsx relies on.
 */
export function buildSystemHelp(opts: { arcadeLine?: string } = {}): string {
  const pad = Math.max(...LOG_COMMANDS.map(c => c.usage.length)) + 2
  const lines: string[] = []
  if (opts.arcadeLine) {
    lines.push('ARCADE', opts.arcadeLine, '')
  }
  GROUP_ORDER.forEach(group => {
    const cmds = LOG_COMMANDS.filter(c => c.group === group)
    if (!cmds.length) return
    lines.push(group)
    cmds.forEach(c => lines.push(`${c.usage.padEnd(pad)}${c.description}`))
    lines.push('')
  })
  lines.push('SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}
