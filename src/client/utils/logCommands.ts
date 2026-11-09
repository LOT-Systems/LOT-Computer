/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — the single source of truth for what /system lists.
 *
 * Pure (no stores, no DOM). Detection lives in logTriggers.ts; this module
 * only describes commands for humans. A self-check in
 * scripts/tests/test-log-commands.ts fails if a trigger exists without a
 * registry entry (or vice versa), so the help screen cannot drift.
 */

import type { LogTrigger } from './logTriggers'

export type CommandGroup = 'MEMORY' | 'CONTEXT' | 'BODY' | 'MODES' | 'SYSTEM'

export interface LogCommand {
  trigger: LogTrigger
  /** Canonical form shown in help, e.g. "/story [day|week|month|year]" */
  usage: string
  summary: string
  group: CommandGroup
  /** Extra slash-words that fire the same trigger (informational). */
  aliases?: string[]
  /** Emoji shortcut, if any. */
  emoji?: string
}

export const GROUP_ORDER: CommandGroup[] = ['MEMORY', 'CONTEXT', 'BODY', 'MODES', 'SYSTEM']

export const LOG_COMMANDS: LogCommand[] = [
  // MEMORY — the compression loop
  { trigger: 'story-mode', group: 'MEMORY', usage: '/story [day|week|month|year]', summary: 'Compressed story of your period (default: week)', emoji: '📖' },
  { trigger: 'rank-status', group: 'MEMORY', usage: '/rank', summary: 'Arcade standing: rank, XP, streak', aliases: ['arcade', 'xp'] },
  { trigger: 'how-checkin', group: 'MEMORY', usage: '/how', summary: 'Open LOT AI check-in (System tab)' },
  { trigger: 'qi-rfi', group: 'MEMORY', usage: '/qi [query]', summary: 'Ask the Quantum Intelligence engine' },
  { trigger: 'prayer-mode', group: 'MEMORY', usage: '/prayer', summary: 'Contextual scripture', aliases: ['candle'], emoji: '🕯️' },

  // CONTEXT — the environment around the entry
  { trigger: 'ai-scan', group: 'CONTEXT', usage: '/scan', summary: 'System status overview', aliases: ['ai'] },
  { trigger: 'qos-report', group: 'CONTEXT', usage: '/qos', summary: 'Quantum OS state analysis', aliases: ['os-report'] },
  { trigger: 'assembly-check', group: 'CONTEXT', usage: '/assembly', summary: 'Self-assembly module status', aliases: ['assemble'] },
  { trigger: 'phys-report', group: 'CONTEXT', usage: '/phys', summary: 'Physiological cohort report', aliases: ['cohort-report'] },
  { trigger: 'sil-check', group: 'CONTEXT', usage: '/sil', summary: 'Signal silence check', aliases: ['silence-check'] },

  // BODY — self-care protocols
  { trigger: 'breathe', group: 'BODY', usage: '/breathe', summary: '4-2-6 breathing exercise', aliases: ['breath'] },
  { trigger: 'freeze-widgets', group: 'BODY', usage: '/freeze', summary: 'Pause and reflect protocol', aliases: ['pause'], emoji: '🧊' },
  { trigger: 'force-fast', group: 'BODY', usage: '/fast', summary: 'Orthodox fasting calendar' },
  { trigger: 'silent-mode', group: 'BODY', usage: '/silent', summary: 'Signal quiet mode', aliases: ['quiet'] },

  // MODES — ambience
  { trigger: 'toggle-synth', group: 'MODES', usage: '/synth', summary: 'Toggle keyboard sound', aliases: ['keyboard'], emoji: '🎹' },
  { trigger: 'radio-toggle', group: 'MODES', usage: '/radio', summary: 'Toggle radio', emoji: '🎧' },
  { trigger: 'night-mode', group: 'MODES', usage: '/night', summary: 'Dark mode', emoji: '🌙' },

  // SYSTEM
  { trigger: 'system-help', group: 'SYSTEM', usage: '/system [group]', summary: 'This screen. Filter: /system memory', aliases: ['commands'] },
]

/** Optional filter word after /system, e.g. "/system body" → 'BODY'. */
export function parseSystemFilter(text: string): CommandGroup | null {
  const m = /(?:^|\s)\/(?:system|commands)\s+([a-z]+)/i.exec(text || '')
  const arg = m?.[1]?.toUpperCase()
  return (GROUP_ORDER as string[]).includes(arg || '') ? (arg as CommandGroup) : null
}

/** Triggers intentionally absent from help (emoji-only support signal). */
export const UNLISTED_TRIGGERS: LogTrigger[] = ['cohort-support']

/**
 * Builds the text block rendered by the Log's SYSTEM: panel.
 * Format contract with Logs.tsx renderer:
 *   - lines containing a run of 2+ spaces → command rows
 *     (usage, then summary)
 *   - other non-empty lines → headings / notes
 */
export function buildSystemHelp(filter: CommandGroup | null = null): string {
  const lines: string[] = ['AVAILABLE COMMANDS · ' + LOG_COMMANDS.length]
  for (const group of filter ? [filter] : GROUP_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.group === group)
    if (!cmds.length) continue
    lines.push('', group)
    for (const c of cmds) {
      lines.push(`${c.usage}  ${c.summary}${c.emoji ? `  ${c.emoji}` : ''}`)
    }
  }
  if (!filter) {
    lines.push(
      '',
      'SHORTCUTS',
      '/system memory  Filter by group: memory · context · body · modes · system',
      'Ctrl+Enter  Save log immediately',
      '',
      'Every entry is stamped with time, place, weather and moon. No prompts. Just write.'
    )
  }
  return lines.join('\n')
}
