/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND REGISTRY — single source of truth for Log slash commands.
 *
 * `/system` renders from this table, so help can never drift from the
 * commands that exist. The detector table in client/utils/logTriggers.ts
 * must stay in sync; scripts/tests/test-log-commands.ts enforces it.
 */

export type LogCommandCategory = 'AI' | 'SYSTEM' | 'SELF-CARE' | 'AMBIENT'

export type LogCommandSpec = {
  /** Trigger id as used by detectTriggers() */
  trigger: string
  /** Primary command, without leading slash */
  command: string
  /** Optional argument hint, e.g. "<query>" */
  args?: string
  description: string
  category: LogCommandCategory
}

export const LOG_COMMANDS: readonly LogCommandSpec[] = [
  { trigger: 'story-mode', command: 'story', description: 'Compressed story of your week', category: 'AI' },
  { trigger: 'story-day', command: 'day', description: 'Compressed story of your day', category: 'AI' },
  { trigger: 'story-week', command: 'week', description: 'Compressed story of your week', category: 'AI' },
  { trigger: 'story-month', command: 'month', description: 'Compressed story of your month', category: 'AI' },
  { trigger: 'story-year', command: 'year', description: 'Compressed story of your year', category: 'AI' },
  { trigger: 'qi-rfi', command: 'qi', args: '<query>', description: 'Ask the Quantum Intelligence engine', category: 'AI' },
  { trigger: 'prayer-mode', command: 'prayer', description: 'Contextual scripture', category: 'AI' },
  { trigger: 'how-checkin', command: 'how', description: 'Open LOT AI check-in (System tab)', category: 'AI' },
  { trigger: 'ai-scan', command: 'scan', description: 'System status overview', category: 'SYSTEM' },
  { trigger: 'assembly-check', command: 'assembly', description: 'Self-assembly module status', category: 'SYSTEM' },
  { trigger: 'qos-report', command: 'qos', description: 'Quantum OS state analysis', category: 'SYSTEM' },
  { trigger: 'phys-report', command: 'phys', description: 'Physiological cohort report', category: 'SYSTEM' },
  { trigger: 'sil-check', command: 'sil', description: 'Signal silence pattern check', category: 'SYSTEM' },
  { trigger: 'system-help', command: 'system', description: 'This command list', category: 'SYSTEM' },
  { trigger: 'breathe', command: 'breathe', description: '4-2-6 breathing exercise', category: 'SELF-CARE' },
  { trigger: 'freeze-widgets', command: 'freeze', description: 'Pause and reflect protocol', category: 'SELF-CARE' },
  { trigger: 'silent-mode', command: 'silent', description: 'Signal silence check', category: 'SELF-CARE' },
  { trigger: 'force-fast', command: 'fast', description: 'Orthodox fasting calendar', category: 'SELF-CARE' },
  { trigger: 'toggle-synth', command: 'synth', description: 'Toggle keyboard sound', category: 'AMBIENT' },
  { trigger: 'radio-toggle', command: 'radio', description: 'Toggle radio', category: 'AMBIENT' },
  { trigger: 'night-mode', command: 'night', description: 'Dark mode', category: 'AMBIENT' },
]

const CATEGORY_ORDER: LogCommandCategory[] = ['AI', 'SYSTEM', 'SELF-CARE', 'AMBIENT']

export type SystemHelpSection = {
  title: string
  rows: Array<{ usage: string; description: string }>
}

/** Structured /system output. `arcadeLine` is shown as the header status. */
export function buildSystemHelp(arcadeLine?: string): {
  header: string[]
  sections: SystemHelpSection[]
  footer: string[]
} {
  return {
    header: arcadeLine ? [arcadeLine] : [],
    sections: CATEGORY_ORDER.map(cat => ({
      title: cat,
      rows: LOG_COMMANDS.filter(c => c.category === cat).map(c => ({
        usage: `/${c.command}${c.args ? ' ' + c.args : ''}`,
        description: c.description,
      })),
    })),
    footer: [
      'Ctrl+Enter  Save log immediately',
      'Every entry is stored with its context: weather, time, place, sky.',
    ],
  }
}

/** Plain-text rendering (tests, non-React surfaces). */
export function renderSystemHelpText(arcadeLine?: string): string {
  const h = buildSystemHelp(arcadeLine)
  const out: string[] = [...h.header, '']
  for (const s of h.sections) {
    out.push(s.title)
    for (const r of s.rows) out.push(`${r.usage.padEnd(28)}${r.description}`)
    out.push('')
  }
  return [...out, ...h.footer].join('\n')
}
