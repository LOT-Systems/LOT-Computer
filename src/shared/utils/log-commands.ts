/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log slash-command registry — single source of truth.
 *
 * The /system help screen is generated from LOG_COMMANDS so the list
 * can never drift from the commands that actually exist. Pure module:
 * no stores, no DOM, no server imports (shared by client and server).
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: readonly StoryPeriod[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'week'

export interface LogCommand {
  command: string // as typed, e.g. "/story [day|week|month|year]"
  description: string
}

export const LOG_COMMANDS: readonly LogCommand[] = [
  { command: '/story [day|week|month|year]', description: 'Compressed story of your journal, default week' },
  { command: '/prayer', description: 'Generate contextual scripture' },
  { command: '/scan', description: 'System status overview' },
  { command: '/qi [query]', description: 'Ask the Quantum Intelligence engine' },
  { command: '/assembly', description: 'Self-assembly module status' },
  { command: '/phys', description: 'Physiological cohort report' },
  { command: '/qos', description: 'Quantum OS state analysis' },
  { command: '/fast', description: 'Orthodox fasting calendar' },
  { command: '/breathe', description: '4-2-6 breathing exercise' },
  { command: '/freeze', description: 'Pause and reflect protocol' },
  { command: '/silent', description: 'Signal silence check' },
  { command: '/synth', description: 'Toggle keyboard sound' },
  { command: '/radio', description: 'Toggle radio' },
  { command: '/night', description: 'Dark mode' },
  { command: '/how', description: 'Open LOT AI check-in (System tab)' },
  { command: '/system', description: 'This help screen' },
]

/** Lines for the /system screen. Command and description split by 2+ spaces. */
export function buildSystemHelpLines(): string[] {
  return [
    'AVAILABLE COMMANDS',
    '',
    ...LOG_COMMANDS.map(c => `${c.command}  ${c.description}`),
    '',
    'SHORTCUTS',
    'Ctrl+Enter    Save log immediately',
  ]
}

/**
 * Reads the period argument from "/story week". Unknown or missing
 * argument falls back to DEFAULT_STORY_PERIOD. Plural/adjective forms
 * ("weekly", "days") are accepted.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  if (!m) return DEFAULT_STORY_PERIOD
  const arg = m[2].toLowerCase()
  const hit = STORY_PERIODS.find(p => arg === p || arg === `${p}s` || arg === `${p}ly` || (p === 'day' && arg === 'daily') || (p === 'year' && arg === 'yearly'))
  return hit || DEFAULT_STORY_PERIOD
}
