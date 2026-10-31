/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Log Command Registry — single source of truth.
 *
 * Every slash command typed in the Log is declared here once. The /system
 * help screen is GENERATED from this table, so the help can never drift
 * from the commands that actually exist. Pure module: no stores, no DOM.
 *
 * Adding a command: add one row here + one RULES row in
 * client/utils/logTriggers.ts + a handler branch in Logs.tsx.
 * `scripts/tests/test-log-commands.ts` fails if the registry and the
 * trigger rules disagree.
 */

export type CommandCategory = 'CONTEXT' | 'BODY' | 'AI' | 'AMBIENT' | 'SYSTEM'

export type LogCommand = {
  /** primary command word, no leading slash */
  name: string
  /** trigger id (matches LogTrigger in client/utils/logTriggers.ts) */
  trigger: string
  /** usage hint shown after the name, e.g. "[day|week|month|year]" */
  args?: string
  description: string
  category: CommandCategory
}

export const LOG_COMMANDS: readonly LogCommand[] = [
  // AI — the machine reads your context
  { name: 'story',    trigger: 'story-mode',     args: '[day|week|month|year]', category: 'AI', description: 'Compressed story of your day / week / month / year' },
  { name: 'qi',       trigger: 'qi-rfi',         args: '[query]',               category: 'AI', description: 'Ask the Quantum Intelligence engine' },
  { name: 'prayer',   trigger: 'prayer-mode',                                   category: 'AI', description: 'Generate contextual scripture' },
  { name: 'how',      trigger: 'how-checkin',                                   category: 'AI', description: 'Open LOT AI check-in (System tab)' },
  // CONTEXT — snapshots of the moment
  { name: 'scan',     trigger: 'ai-scan',                                       category: 'CONTEXT', description: 'System status overview' },
  { name: 'qos',      trigger: 'qos-report',                                    category: 'CONTEXT', description: 'Quantum OS state analysis' },
  { name: 'assembly', trigger: 'assembly-check',                                category: 'CONTEXT', description: 'Self-assembly module status' },
  { name: 'phys',     trigger: 'phys-report',                                   category: 'CONTEXT', description: 'Physiological cohort report' },
  { name: 'silent',   trigger: 'silent-mode',                                   category: 'CONTEXT', description: 'Signal silence check' },
  { name: 'sil',      trigger: 'sil-check',                                     category: 'CONTEXT', description: 'Signal silence pattern check' },
  // BODY — self-care protocols
  { name: 'breathe',  trigger: 'breathe',                                       category: 'BODY', description: '4-2-6 breathing exercise' },
  { name: 'freeze',   trigger: 'freeze-widgets',                                category: 'BODY', description: 'Pause and reflect protocol' },
  { name: 'fast',     trigger: 'force-fast',                                    category: 'BODY', description: 'Orthodox fasting calendar' },
  // AMBIENT — environment
  { name: 'synth',    trigger: 'toggle-synth',                                  category: 'AMBIENT', description: 'Toggle keyboard sound' },
  { name: 'radio',    trigger: 'radio-toggle',                                  category: 'AMBIENT', description: 'Toggle radio' },
  { name: 'night',    trigger: 'night-mode',                                    category: 'AMBIENT', description: 'Dark mode' },
  // SYSTEM
  { name: 'system',   trigger: 'system-help',                                   category: 'SYSTEM', description: 'This help screen' },
]

const CATEGORY_ORDER: CommandCategory[] = ['AI', 'CONTEXT', 'BODY', 'AMBIENT', 'SYSTEM']

/**
 * Build the /system help screen as plain text lines. Format contract with the
 * renderer in Logs.tsx: a line starting with "/" is a command row (cmd and
 * description separated by 2+ spaces); any other non-empty line is a section
 * heading; empty lines are spacers.
 */
export function buildSystemHelp(extraLines: string[] = []): string {
  const lines: string[] = []
  if (extraLines.length) lines.push(...extraLines, '')
  lines.push('AVAILABLE COMMANDS', '')
  for (const cat of CATEGORY_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push(cat)
    for (const c of rows) {
      const head = `/${c.name}${c.args ? ' ' + c.args : ''}`
      lines.push(`${head}  ${c.description}`)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', w: 'week',
  month: 'month', m: 'month',
  year: 'year', y: 'year',
}

/** Parse "/story week" -> 'week'. Defaults to 'day' when no/unknown argument. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story(?:\s+([a-z]+))?/i.exec(text || '')
  const arg = m?.[2]?.toLowerCase()
  return (arg && PERIOD_ALIASES[arg]) || 'day'
}
