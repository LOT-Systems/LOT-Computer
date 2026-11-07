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
 * Pure module (no stores, no DOM, no network). The trigger detectors live in
 * `src/client/utils/logTriggers.ts`; `scripts/tests/test-log-commands.ts`
 * asserts that every command listed here is actually detectable, so the help
 * screen cannot drift away from the real behaviour.
 */

export type CommandGroup = 'NARRATIVE' | 'CONTEXT' | 'MODES' | 'SELF-CARE' | 'SYSTEM'

export interface LogCommand {
  /** Primary keyword, no leading slash. Must be a keyword in logTriggers RULES. */
  name: string
  /** Optional argument hint shown after the name, e.g. "[day|week|month|year]". */
  args?: string
  group: CommandGroup
  description: string
}

export const COMMAND_GROUP_ORDER: CommandGroup[] = [
  'NARRATIVE',
  'CONTEXT',
  'SELF-CARE',
  'MODES',
  'SYSTEM',
]

export const LOG_COMMANDS: LogCommand[] = [
  // NARRATIVE — the compression loop
  { name: 'story', args: '[day|week|month|year]', group: 'NARRATIVE', description: 'Compressed story of your day / week / month / year' },
  { name: 'arcade', group: 'NARRATIVE', description: 'Your evolution: level, XP, streak, rank' },
  { name: 'qi', args: '[query]', group: 'NARRATIVE', description: 'Ask the Quantum Intelligence engine' },
  { name: 'prayer', group: 'NARRATIVE', description: 'Contextual scripture' },
  // CONTEXT — read-outs of the current moment
  { name: 'scan', group: 'CONTEXT', description: 'System status overview' },
  { name: 'qos', group: 'CONTEXT', description: 'Quantum OS state analysis' },
  { name: 'phys', group: 'CONTEXT', description: 'Physiological cohort report' },
  { name: 'assembly', group: 'CONTEXT', description: 'Self-assembly module status' },
  { name: 'silent', group: 'CONTEXT', description: 'Signal silence check' },
  // SELF-CARE
  { name: 'how', group: 'SELF-CARE', description: 'Open LOT AI check-in (System tab)' },
  { name: 'breathe', group: 'SELF-CARE', description: '4-2-6 breathing exercise' },
  { name: 'freeze', group: 'SELF-CARE', description: 'Pause and reflect protocol' },
  { name: 'fast', group: 'SELF-CARE', description: 'Orthodox fasting calendar' },
  // MODES
  { name: 'synth', group: 'MODES', description: 'Toggle keyboard sound' },
  { name: 'radio', group: 'MODES', description: 'Toggle radio' },
  { name: 'night', group: 'MODES', description: 'Dark mode' },
  // SYSTEM
  { name: 'system', group: 'SYSTEM', description: 'This help screen' },
]

/**
 * Build the `/system` screen. Output format is consumed by the renderer in
 * Logs.tsx: lines starting with "/" are command rows (name and description
 * separated by 2+ spaces), other non-empty lines are group headers.
 */
export function formatSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const group of COMMAND_GROUP_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.group === group)
    if (cmds.length === 0) continue
    lines.push('', group)
    for (const c of cmds) {
      const head = `/${c.name}${c.args ? ' ' + c.args : ''}`
      lines.push(`${head.padEnd(14)}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year',
}

export interface ParsedStoryCommand {
  period: StoryPeriod
  /** Entry text with the /story token (and period word) and 📖 removed. */
  logText: string
}

/**
 * Parse `/story [period]`. Default period is `week`.
 * Only a period word that immediately follows `/story` is consumed.
 */
export function parseStoryCommand(text: string): ParsedStoryCommand {
  const re = /(^|\s)\/story(?:[ \t]+(day|today|daily|week|weekly|month|monthly|year|yearly)\b)?/i
  const m = re.exec(text || '')
  const period = m && m[2] ? PERIOD_ALIASES[m[2].toLowerCase()] : 'week'
  const logText = (text || '').replace(re, '$1').replace(/📖/g, '').trim()
  return { period, logText }
}
