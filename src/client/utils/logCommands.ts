/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND REGISTRY (pure)
 *
 * Single source of truth for every Log slash command. /system renders from
 * this table, so a command cannot exist without being documented.
 * Spec: docs/technical/LOG-ENTRY-SYSTEM.md
 */

export type CommandCategory = 'AI' | 'CONTEXT' | 'RITUAL' | 'INTERFACE'

export interface LogCommandDef {
  command: string      // without slash
  usage: string        // shown in /system
  description: string
  category: CommandCategory
}

export const LOG_COMMANDS: LogCommandDef[] = [
  { command: 'story',    usage: '/story [day|week|month|year]', description: 'Compressed story of your period (default: week)', category: 'AI' },
  { command: 'qi',       usage: '/qi [query]',  description: 'Ask the Quantum Intelligence engine', category: 'AI' },
  { command: 'how',      usage: '/how',         description: 'Open LOT AI check-in (System tab)', category: 'AI' },
  { command: 'prayer',   usage: '/prayer',      description: 'Generate contextual scripture', category: 'RITUAL' },
  { command: 'breathe',  usage: '/breathe',     description: '4-2-6 breathing exercise', category: 'RITUAL' },
  { command: 'freeze',   usage: '/freeze',      description: 'Pause and reflect protocol', category: 'RITUAL' },
  { command: 'fast',     usage: '/fast',        description: 'Orthodox fasting calendar', category: 'RITUAL' },
  { command: 'scan',     usage: '/scan',        description: 'System status overview', category: 'CONTEXT' },
  { command: 'assembly', usage: '/assembly',    description: 'Self-assembly module status', category: 'CONTEXT' },
  { command: 'phys',     usage: '/phys',        description: 'Physiological cohort report', category: 'CONTEXT' },
  { command: 'qos',      usage: '/qos',         description: 'Quantum OS state analysis', category: 'CONTEXT' },
  { command: 'silent',   usage: '/silent',      description: 'Signal silence check', category: 'CONTEXT' },
  { command: 'synth',    usage: '/synth',       description: 'Toggle keyboard sound', category: 'INTERFACE' },
  { command: 'radio',    usage: '/radio',       description: 'Toggle radio', category: 'INTERFACE' },
  { command: 'night',    usage: '/night',       description: 'Dark mode', category: 'INTERFACE' },
  { command: 'system',   usage: '/system [filter]', description: 'This help screen (filter by name or category)', category: 'INTERFACE' },
]

export const STORY_PERIODS = ['day', 'week', 'month', 'year'] as const
export type StoryPeriodArg = (typeof STORY_PERIODS)[number]

/** Parses "/story month" -> 'month'. Unknown or missing argument -> 'week'. */
export function parseStoryPeriod(text: string): StoryPeriodArg {
  const m = /(^|\s)\/story(?:\s+(day|week|month|year))?(?=\s|$|[^a-z0-9_])/i.exec(text || '')
  return ((m?.[2] || 'week').toLowerCase() as StoryPeriodArg)
}

/** Parses "/system ai" -> 'ai'. Returns '' when no filter. */
export function parseSystemFilter(text: string): string {
  const m = /(^|\s)\/system(?:\s+([a-z]+))?(?=\s|$|[^a-z0-9_])/i.exec(text || '')
  return (m?.[2] || '').toLowerCase()
}

/** Builds the /system help text consumed by the Logs renderer ("/cmd  description" rows + category headers). */
export function renderSystemHelp(filter = ''): string {
  const f = filter.toLowerCase()
  const cats: CommandCategory[] = ['AI', 'RITUAL', 'CONTEXT', 'INTERFACE']
  const lines: string[] = ['AVAILABLE COMMANDS', '']
  let shown = 0
  for (const cat of cats) {
    const items = LOG_COMMANDS.filter(c => c.category === cat && (!f || c.category.toLowerCase() === f || c.command.includes(f)))
    if (!items.length) continue
    lines.push(cat, ...items.map(c => `${c.usage}  ${c.description}`), '')
    shown += items.length
  }
  if (!shown) lines.push(`NO COMMAND MATCHES "${f.toUpperCase()}"`, '')
  lines.push('SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}
