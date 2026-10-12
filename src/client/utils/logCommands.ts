/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for every slash command.
 *
 * /system renders from this table, so the help screen can never drift from
 * the commands that exist. Each entry binds a user-facing slash string to a
 * LogTrigger id (see logTriggers.ts). The test in
 * scripts/tests/test-log-commands.ts asserts that every registry entry has a
 * live trigger rule and every slash rule is documented here.
 *
 * Pure: no stores, no DOM.
 */

import type { LogTrigger } from '#client/utils/logTriggers'
import { type ArcadeState, progressBar } from '#client/utils/logArcade'

export type CommandCategory = 'MEMORY' | 'INTELLIGENCE' | 'PROTOCOL' | 'INTERFACE' | 'SYSTEM'

export interface LogCommand {
  trigger: LogTrigger
  /** canonical slash form, without arguments */
  slash: string
  /** argument hint shown in help, e.g. "[day|week|month|year]" */
  args?: string
  category: CommandCategory
  summary: string
}

export const LOG_COMMANDS: readonly LogCommand[] = [
  { trigger: 'story-mode',     slash: '/story',    args: '[day|week|month|year]', category: 'MEMORY',       summary: 'Compressed story of your record + AI narrative' },
  { trigger: 'how-checkin',    slash: '/how',      category: 'MEMORY',       summary: 'Open LOT AI check-in (System tab)' },
  { trigger: 'prayer-mode',    slash: '/prayer',   category: 'MEMORY',       summary: 'Generate contextual scripture' },
  { trigger: 'qi-rfi',         slash: '/qi',       args: '[query]',         category: 'INTELLIGENCE', summary: 'Ask the Quantum Intelligence engine' },
  { trigger: 'ai-scan',        slash: '/scan',     category: 'INTELLIGENCE', summary: 'System status overview' },
  { trigger: 'assembly-check', slash: '/assembly', category: 'INTELLIGENCE', summary: 'Self-assembly module status' },
  { trigger: 'phys-report',    slash: '/phys',     category: 'INTELLIGENCE', summary: 'Physiological cohort report' },
  { trigger: 'qos-report',     slash: '/qos',      category: 'INTELLIGENCE', summary: 'Quantum OS state analysis' },
  { trigger: 'force-fast',     slash: '/fast',     category: 'PROTOCOL',     summary: 'Orthodox fasting calendar' },
  { trigger: 'breathe',        slash: '/breathe',  category: 'PROTOCOL',     summary: '4-2-6 breathing exercise' },
  { trigger: 'freeze-widgets', slash: '/freeze',   category: 'PROTOCOL',     summary: 'Pause and reflect protocol' },
  { trigger: 'silent-mode',    slash: '/silent',   category: 'PROTOCOL',     summary: 'Signal silence check' },
  { trigger: 'toggle-synth',   slash: '/synth',    category: 'INTERFACE',    summary: 'Toggle keyboard sound' },
  { trigger: 'radio-toggle',   slash: '/radio',    category: 'INTERFACE',    summary: 'Toggle radio' },
  { trigger: 'night-mode',     slash: '/night',    category: 'INTERFACE',    summary: 'Dark mode' },
  { trigger: 'system-help',    slash: '/system',   category: 'SYSTEM',       summary: 'This command list' },
]

const CATEGORY_ORDER: readonly CommandCategory[] = ['MEMORY', 'INTELLIGENCE', 'PROTOCOL', 'INTERFACE', 'SYSTEM']

/** Slash commands not shown in /system (legacy / low-signal aliases live in logTriggers). */
export const UNLISTED_TRIGGERS: readonly LogTrigger[] = ['sil-check', 'cohort-support']

/**
 * Render the /system screen. Line contract with the Logs.tsx renderer:
 * a line starting with "/" is a command row (command, 2+ spaces, summary);
 * any other non-empty line is a section header; blank lines are spacers.
 */
export function renderSystemHelp(arcade?: ArcadeState | null): string {
  const lines: string[] = ['LOT LOG — COMMANDS', '']

  if (arcade) {
    const next = arcade.nextRank
    lines.push('OPERATOR')
    lines.push(
      `RANK L${arcade.rank.level} ${arcade.rank.name} · ${arcade.xp} XP · ${arcade.currentStreak}D STREAK`
    )
    lines.push(
      next
        ? `${progressBar(arcade.progressPct)} ${arcade.xpToNext} XP TO ${next.name}`
        : `${progressBar(100)} TOP RANK`
    )
    lines.push('')
  }

  for (const cat of CATEGORY_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push(cat)
    for (const c of rows) {
      const cmd = c.args ? `${c.slash} ${c.args}` : c.slash
      lines.push(`${cmd}  ${c.summary}`)
    }
    lines.push('')
  }

  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter    Save log immediately')
  lines.push('')
  lines.push('NOTE')
  lines.push('Write normally. Every entry is stored with its context — no prompts needed.')
  return lines.join('\n')
}
