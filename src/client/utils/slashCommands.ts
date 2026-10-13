/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log slash-command registry — single source of truth for /system.
 *
 * The Log is a passive AI UI: the user only writes. Slash commands are the
 * one deliberate channel for talking to the machine from inside an entry.
 * Detection lives in logTriggers.ts; this module owns the human-readable
 * catalogue so the /system screen can never drift from what is wired.
 * Pure (no stores, no DOM).
 */

import type { LogTrigger } from '#client/utils/logTriggers'
import type { StoryScope } from '#client/utils/storyCompression'

export type CommandGroup = 'MEMORY' | 'INTELLIGENCE' | 'PROTOCOL' | 'ENVIRONMENT' | 'SYSTEM'

export interface SlashCommand {
  /** Command as typed, without arguments, e.g. "/story" */
  cmd: string
  /** Optional argument hint shown in help, e.g. "[day|week|month|year]" */
  args?: string
  desc: string
  group: CommandGroup
  /** Trigger it fires. 'prayer-mode' is wired outside LogTrigger-only logic but is still a trigger. */
  trigger: LogTrigger
}

export const COMMAND_GROUPS: CommandGroup[] = [
  'MEMORY',
  'INTELLIGENCE',
  'PROTOCOL',
  'ENVIRONMENT',
  'SYSTEM',
]

export const SLASH_COMMANDS: SlashCommand[] = [
  { cmd: '/story',    args: '[day|week|month|year]', desc: 'Compressed story of your period + arcade rank', group: 'MEMORY',       trigger: 'story-mode' },
  { cmd: '/how',      desc: 'Open LOT AI check-in (System tab)',     group: 'MEMORY',       trigger: 'how-checkin' },
  { cmd: '/prayer',   desc: 'Generate contextual scripture',         group: 'MEMORY',       trigger: 'prayer-mode' },
  { cmd: '/qi',       args: '[query]', desc: 'Ask the Quantum Intelligence engine', group: 'INTELLIGENCE', trigger: 'qi-rfi' },
  { cmd: '/scan',     desc: 'System status overview',                group: 'INTELLIGENCE', trigger: 'ai-scan' },
  { cmd: '/assembly', desc: 'Self-assembly module status',           group: 'INTELLIGENCE', trigger: 'assembly-check' },
  { cmd: '/phys',     desc: 'Physiological cohort report',           group: 'INTELLIGENCE', trigger: 'phys-report' },
  { cmd: '/qos',      desc: 'Quantum OS state analysis',             group: 'INTELLIGENCE', trigger: 'qos-report' },
  { cmd: '/breathe',  desc: '4-2-6 breathing exercise',              group: 'PROTOCOL',     trigger: 'breathe' },
  { cmd: '/freeze',   desc: 'Pause and reflect protocol',            group: 'PROTOCOL',     trigger: 'freeze-widgets' },
  { cmd: '/silent',   desc: 'Signal silence check',                  group: 'PROTOCOL',     trigger: 'silent-mode' },
  { cmd: '/fast',     desc: 'Orthodox fasting calendar',             group: 'PROTOCOL',     trigger: 'force-fast' },
  { cmd: '/synth',    desc: 'Toggle keyboard sound',                 group: 'ENVIRONMENT',  trigger: 'toggle-synth' },
  { cmd: '/radio',    desc: 'Toggle radio',                          group: 'ENVIRONMENT',  trigger: 'radio-toggle' },
  { cmd: '/night',    desc: 'Dark mode',                             group: 'ENVIRONMENT',  trigger: 'night-mode' },
  { cmd: '/system',   desc: 'This help screen',                      group: 'SYSTEM',       trigger: 'system-help' },
]

const SHORTCUTS: Array<[string, string]> = [
  ['Ctrl+Enter', 'Save log immediately'],
]

/**
 * Renders the /system screen. Format is consumed by the SYSTEM block in
 * Logs.tsx: lines starting with "/" are command rows (cmd, 2+ spaces, desc);
 * any other non-empty line is a section header.
 */
export function buildSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const group of COMMAND_GROUPS) {
    const rows = SLASH_COMMANDS.filter(c => c.group === group)
    if (rows.length === 0) continue
    lines.push('', group)
    for (const c of rows) {
      const head = c.args ? `${c.cmd} ${c.args}` : c.cmd
      lines.push(`${head}  ${c.desc}`)
    }
  }
  lines.push('', 'SHORTCUTS')
  for (const [k, d] of SHORTCUTS) lines.push(`${k}  ${d}`)
  return lines.join('\n')
}

const SCOPE_WORDS: Record<string, StoryScope> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', w: 'week',
  month: 'month', m: 'month',
  year: 'year', y: 'year',
}

/**
 * Reads the optional period argument from "/story week". Defaults to 'day'.
 * Only the first word after /story is considered, so prose that follows the
 * command ("/story what a day") is never misread as a scope.
 */
export function parseStoryScope(text: string): StoryScope {
  const m = /(^|\s)\/story(?:\s+([a-z]+))?/i.exec(text || '')
  const word = m?.[2]?.toLowerCase()
  return (word && SCOPE_WORDS[word]) || 'day'
}
