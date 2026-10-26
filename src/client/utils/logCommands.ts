/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for the `/system` screen.
 *
 * Pure (no stores, no DOM). Detection lives in logTriggers.ts; this module
 * only describes commands so the help screen cannot drift from reality.
 * `trigger` links each entry to its LogTrigger; a unit check asserts every
 * trigger with a slash keyword is documented here.
 */

import type { LogTrigger } from './logTriggers'
import type { ArcadeRank } from '#shared/utils/log-story'

export type CommandGroup = 'MEMORY' | 'INSIGHT' | 'BODY' | 'AMBIENT' | 'SYSTEM'

export type LogCommand = {
  trigger: LogTrigger
  /** Display form, e.g. "/story [period]". */
  usage: string
  description: string
  group: CommandGroup
}

export const LOG_COMMANDS: LogCommand[] = [
  { trigger: 'story-mode', usage: '/story', description: 'Compressed story of your week', group: 'MEMORY' },
  { trigger: 'story-mode', usage: '/story day', description: 'Story of today (also: month, year)', group: 'MEMORY' },
  { trigger: 'prayer-mode', usage: '/prayer', description: 'Contextual scripture', group: 'MEMORY' },
  { trigger: 'ai-scan', usage: '/scan', description: 'System status overview', group: 'INSIGHT' },
  { trigger: 'qi-rfi', usage: '/qi [query]', description: 'Ask the Quantum Intelligence engine', group: 'INSIGHT' },
  { trigger: 'assembly-check', usage: '/assembly', description: 'Self-assembly module status', group: 'INSIGHT' },
  { trigger: 'qos-report', usage: '/qos', description: 'Quantum OS state analysis', group: 'INSIGHT' },
  { trigger: 'phys-report', usage: '/phys', description: 'Physiological cohort report', group: 'INSIGHT' },
  { trigger: 'sil-check', usage: '/sil', description: 'Signal silence pattern check', group: 'INSIGHT' },
  { trigger: 'how-checkin', usage: '/how', description: 'Open LOT AI check-in (System tab)', group: 'INSIGHT' },
  { trigger: 'force-fast', usage: '/fast', description: 'Orthodox fasting calendar', group: 'BODY' },
  { trigger: 'breathe', usage: '/breathe', description: '4-2-6 breathing exercise', group: 'BODY' },
  { trigger: 'freeze-widgets', usage: '/freeze', description: 'Pause and reflect protocol', group: 'BODY' },
  { trigger: 'silent-mode', usage: '/silent', description: 'Signal silence check', group: 'BODY' },
  { trigger: 'toggle-synth', usage: '/synth', description: 'Toggle keyboard sound', group: 'AMBIENT' },
  { trigger: 'radio-toggle', usage: '/radio', description: 'Toggle radio', group: 'AMBIENT' },
  { trigger: 'night-mode', usage: '/night', description: 'Dark mode', group: 'AMBIENT' },
  { trigger: 'system-help', usage: '/system', description: 'This screen', group: 'SYSTEM' },
]

const GROUP_ORDER: CommandGroup[] = ['MEMORY', 'INSIGHT', 'BODY', 'AMBIENT', 'SYSTEM']

const bar = (progress: number, width = 10): string => {
  const filled = Math.round(Math.max(0, Math.min(1, progress)) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

/**
 * Builds the text shown by `/system`. Format is consumed by the Log
 * renderer: lines starting with "/" are command rows (two+ spaces split
 * command from description), everything else is a header/info line.
 */
export function buildSystemHelp(rank?: ArcadeRank | null): string {
  const lines: string[] = []

  if (rank) {
    lines.push('OPERATOR RANK')
    lines.push(
      `LVL ${rank.level} ${rank.title}  ${bar(rank.progress)}  ` +
        (rank.nextAt === null ? `${rank.xp} XP MAX` : `${rank.xp}/${rank.nextAt} XP`)
    )
    lines.push('')
  }

  for (const group of GROUP_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.group === group)
    if (!rows.length) continue
    lines.push(group)
    for (const c of rows) lines.push(`${c.usage}  ${c.description}`)
    lines.push('')
  }

  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}
