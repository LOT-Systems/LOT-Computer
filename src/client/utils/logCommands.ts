/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for the /system screen.
 *
 * The trigger detectors live in logTriggers.ts; this module only describes
 * them for humans. Adding a command = one line here, and /system lists it.
 * Pure (no stores, no DOM).
 */

export type StoryRangeArg = 'day' | 'week' | 'month' | 'year'

export interface LogCommand {
  command: string
  usage: string
  summary: string
  group: 'AI' | 'STATE' | 'PROTOCOL' | 'DEVICE' | 'NAV'
}

export const LOG_COMMANDS: LogCommand[] = [
  { command: 'story',    usage: '/story [day|week|month|year]', summary: 'Compressed story of your record (default: week)', group: 'AI' },
  { command: 'qi',       usage: '/qi [query]', summary: 'Ask the Quantum Intelligence engine', group: 'AI' },
  { command: 'prayer',   usage: '/prayer',     summary: 'Contextual scripture', group: 'AI' },
  { command: 'scan',     usage: '/scan',       summary: 'System status overview', group: 'STATE' },
  { command: 'assembly', usage: '/assembly',   summary: 'Self-assembly module status', group: 'STATE' },
  { command: 'phys',     usage: '/phys',       summary: 'Physiological cohort report', group: 'STATE' },
  { command: 'qos',      usage: '/qos',        summary: 'Quantum OS state analysis', group: 'STATE' },
  { command: 'sil',      usage: '/sil',        summary: 'Signal silence check', group: 'STATE' },
  { command: 'fast',     usage: '/fast',       summary: 'Orthodox fasting calendar', group: 'PROTOCOL' },
  { command: 'breathe',  usage: '/breathe',    summary: '4-2-6 breathing exercise', group: 'PROTOCOL' },
  { command: 'freeze',   usage: '/freeze',     summary: 'Pause and reflect protocol', group: 'PROTOCOL' },
  { command: 'silent',   usage: '/silent',     summary: 'Signal silence check', group: 'PROTOCOL' },
  { command: 'synth',    usage: '/synth',      summary: 'Toggle keyboard sound', group: 'DEVICE' },
  { command: 'radio',    usage: '/radio',      summary: 'Toggle radio', group: 'DEVICE' },
  { command: 'night',    usage: '/night',      summary: 'Dark mode', group: 'DEVICE' },
  { command: 'how',      usage: '/how',        summary: 'Open LOT AI check-in (System tab)', group: 'NAV' },
  { command: 'system',   usage: '/system',     summary: 'This screen', group: 'NAV' },
]

const GROUP_ORDER: LogCommand['group'][] = ['AI', 'STATE', 'PROTOCOL', 'DEVICE', 'NAV']

/** Plain-text /system screen, grouped, usage column aligned. */
export function renderSystemHelp(): string {
  const width = Math.max(...LOG_COMMANDS.map(c => c.usage.length)) + 2
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const group of GROUP_ORDER) {
    lines.push('', group)
    for (const c of LOG_COMMANDS.filter(x => x.group === group)) {
      lines.push(`${c.usage.padEnd(width)}${c.summary}`)
    }
  }
  lines.push('', 'SHORTCUTS', `${'Ctrl+Enter'.padEnd(width)}Save log immediately`)
  lines.push(`${'Any entry'.padEnd(width)}Saved with time, place, weather, sky`)
  return lines.join('\n')
}

/** Range argument following /story, defaulting to week. */
export function parseStoryRangeArg(text: string): StoryRangeArg {
  const m = /\/story\s+(day|today|week|month|year)\b/i.exec(text || '')
  if (!m) return 'week'
  const w = m[1].toLowerCase()
  return w === 'today' ? 'day' : (w as StoryRangeArg)
}
