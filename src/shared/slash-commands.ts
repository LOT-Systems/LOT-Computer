/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Slash-command registry — single source of truth for the Log (Journal)
 * command surface. `/system` renders its help screen from this table, so a
 * command added here can never be missing from the help.
 *
 * Pure module (no stores, no DOM, no network). Detection of *which* command
 * fired lives in `#client/utils/logTriggers`; this file only describes them.
 */

export type SlashCategory = 'AI' | 'STATE' | 'RITUAL' | 'DEVICE' | 'NAV'

export interface SlashCommand {
  /** Command name without the leading slash. */
  name: string
  /** Optional argument hint shown in help, e.g. "[day|week|month|year]". */
  args?: string
  description: string
  category: SlashCategory
  /** Other accepted spellings (without slash). Mirrors logTriggers keywords. */
  aliases?: string[]
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { name: 'story', args: '[day|week|month|year]', category: 'AI', description: 'Compressed story of your day / week / month / year' },
  { name: 'qi', args: '[query]', category: 'AI', description: 'Ask the Quantum Intelligence engine' },
  { name: 'scan', category: 'AI', description: 'System status overview', aliases: ['ai'] },
  { name: 'assembly', category: 'AI', description: 'Self-assembly module status', aliases: ['assemble'] },
  { name: 'prayer', category: 'RITUAL', description: 'Contextual scripture', aliases: ['candle'] },
  { name: 'breathe', category: 'RITUAL', description: '4-2-6 breathing exercise', aliases: ['breath'] },
  { name: 'freeze', category: 'RITUAL', description: 'Pause and reflect protocol', aliases: ['pause'] },
  { name: 'fast', category: 'RITUAL', description: 'Orthodox fasting calendar' },
  { name: 'phys', category: 'STATE', description: 'Physiological cohort report', aliases: ['cohort-report'] },
  { name: 'qos', category: 'STATE', description: 'Quantum OS state analysis', aliases: ['os-report'] },
  { name: 'sil', category: 'STATE', description: 'Signal silence pattern check', aliases: ['silence-check'] },
  { name: 'silent', category: 'STATE', description: 'Signal silence status', aliases: ['quiet'] },
  { name: 'synth', category: 'DEVICE', description: 'Toggle keyboard sound', aliases: ['keyboard'] },
  { name: 'radio', category: 'DEVICE', description: 'Toggle radio' },
  { name: 'night', category: 'DEVICE', description: 'Dark mode' },
  { name: 'how', category: 'NAV', description: 'Open LOT AI check-in (System tab)' },
  { name: 'system', category: 'NAV', description: 'This help screen', aliases: ['commands'] },
]

const CATEGORY_ORDER: SlashCategory[] = ['AI', 'RITUAL', 'STATE', 'DEVICE', 'NAV']

const CATEGORY_LABEL: Record<SlashCategory, string> = {
  AI: 'INTELLIGENCE',
  RITUAL: 'RITUAL',
  STATE: 'STATE',
  DEVICE: 'DEVICE',
  NAV: 'NAVIGATION',
}

const PAD = 28

/**
 * Renders the `/system` help screen as plain text lines (monospace grid).
 */
export function renderSystemHelp(commands: SlashCommand[] = SLASH_COMMANDS): string {
  const lines: string[] = ['LOT® COMMAND INDEX', '']
  for (const cat of CATEGORY_ORDER) {
    const group = commands.filter(c => c.category === cat)
    if (!group.length) continue
    lines.push(CATEGORY_LABEL[cat])
    for (const c of group) {
      const head = `/${c.name}${c.args ? ' ' + c.args : ''}`
      lines.push(`  ${head.padEnd(PAD)}${c.description}`)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS')
  lines.push(`  ${'Ctrl+Enter'.padEnd(PAD)}Save log immediately`)
  lines.push('')
  lines.push('Write freely. Every entry is stored with its context:')
  lines.push('time, weather, location, sky. No prompts required.')
  return lines.join('\n')
}

/** True when `name` (no slash) is a registered command or alias. */
export function isKnownCommand(name: string): boolean {
  const n = name.toLowerCase()
  return SLASH_COMMANDS.some(c => c.name === n || c.aliases?.includes(n))
}
