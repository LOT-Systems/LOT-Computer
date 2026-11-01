/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for slash commands.
 *
 * `/system` renders its help screen from this registry, so the help can never
 * drift from what the detector (`logTriggers.ts`) actually fires. A unit
 * check (`scripts/tests/test-log-commands.ts`) asserts every registry entry
 * maps to a live trigger and vice versa.
 *
 * Pure module: no stores, no DOM.
 */

import type { LogTrigger } from './logTriggers'

export type CommandCategory =
  | 'NARRATIVE'   // turn the record into story / ask the machine
  | 'STATE'       // read-outs of the operator's own system state
  | 'PROTOCOL'    // short guided routines
  | 'INTERFACE'   // toggles for the surface itself

export interface LogCommand {
  trigger: LogTrigger
  /** Primary slash command, without the leading slash. */
  name: string
  /** Optional argument hint, e.g. "[day|week|month|year]". */
  args?: string
  description: string
  category: CommandCategory
  /** Usership-gated server features. Shown with a marker in /system. */
  usership?: boolean
}

export const COMMAND_CATEGORY_ORDER: CommandCategory[] = [
  'NARRATIVE',
  'STATE',
  'PROTOCOL',
  'INTERFACE',
]

export const LOG_COMMANDS: LogCommand[] = [
  // NARRATIVE
  { trigger: 'story-mode',   name: 'story',    args: '[day|week|month|year]', category: 'NARRATIVE', description: 'Compressed story of your record + arcade rank', usership: true },
  { trigger: 'qi-rfi',       name: 'qi',       args: '[query]',               category: 'NARRATIVE', description: 'Ask the Quantum Intelligence engine', usership: true },
  { trigger: 'prayer-mode',  name: 'prayer',                                  category: 'NARRATIVE', description: 'Generate contextual scripture' },
  { trigger: 'how-checkin',  name: 'how',                                     category: 'NARRATIVE', description: 'Open LOT AI check-in (System tab)' },

  // STATE
  { trigger: 'ai-scan',        name: 'scan',     category: 'STATE', description: 'System status overview' },
  { trigger: 'assembly-check', name: 'assembly', category: 'STATE', description: 'Self-assembly module status' },
  { trigger: 'phys-report',    name: 'phys',     category: 'STATE', description: 'Physiological cohort report' },
  { trigger: 'qos-report',     name: 'qos',      category: 'STATE', description: 'Quantum OS state analysis' },
  { trigger: 'force-fast',     name: 'fast',     category: 'STATE', description: 'Orthodox fasting calendar' },
  { trigger: 'silent-mode',    name: 'silent',   category: 'STATE', description: 'Signal silence check' },
  { trigger: 'sil-check',      name: 'sil',      category: 'STATE', description: 'Signal silence pattern check' },

  // PROTOCOL
  { trigger: 'breathe',        name: 'breathe',  category: 'PROTOCOL', description: '4-2-6 breathing exercise' },
  { trigger: 'freeze-widgets', name: 'freeze',   category: 'PROTOCOL', description: 'Pause and reflect protocol' },

  // INTERFACE
  { trigger: 'toggle-synth',   name: 'synth',    category: 'INTERFACE', description: 'Toggle keyboard sound' },
  { trigger: 'radio-toggle',   name: 'radio',    category: 'INTERFACE', description: 'Toggle radio' },
  { trigger: 'night-mode',     name: 'night',    category: 'INTERFACE', description: 'Dark mode' },
  { trigger: 'system-help',    name: 'system',   category: 'INTERFACE', description: 'This help screen' },
]

const PAD = 22

/** Left column text for a command, e.g. "/story [day|week|month|year]". */
function commandLabel(c: LogCommand): string {
  const base = `/${c.name}${c.args ? ' ' + c.args : ''}`
  return base
}

/**
 * Builds the /system help text. Format is consumed by the renderer in
 * Logs.tsx: lines starting with "/" are command rows (two+ spaces separate
 * command from description); other non-empty lines are section headers.
 */
export function buildSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS', '']

  for (const cat of COMMAND_CATEGORY_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push(cat)
    for (const c of rows) {
      const label = commandLabel(c)
      const pad = ' '.repeat(Math.max(2, PAD - label.length))
      lines.push(`${label}${pad}${c.description}${c.usership ? '  [USERSHIP]' : ''}`)
    }
    lines.push('')
  }

  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter    Save log immediately')
  lines.push('')
  lines.push('NOTE')
  lines.push('Commands are case-insensitive and may be placed anywhere in an entry.')
  return lines.join('\n')
}

/** Returns the registry entry for a trigger, if any. */
export function commandForTrigger(trigger: LogTrigger): LogCommand | undefined {
  return LOG_COMMANDS.find(c => c.trigger === trigger)
}
