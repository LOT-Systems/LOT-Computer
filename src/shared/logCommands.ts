/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND REGISTRY — single source of truth for every slash command
 * and emoji trigger understood by the Log (Journal).
 *
 * Consumers:
 *  - client/utils/logTriggers.ts  → detection rules (keywords/emojis)
 *  - client/components/Logs.tsx   → /system help screen (buildSystemHelp)
 *
 * Adding a command = adding ONE entry here. The /system screen can no
 * longer drift from what the detector actually recognises.
 *
 * Pure module: no stores, no DOM, no I/O.
 */

export type LogTrigger =
  | 'toggle-synth'
  | 'ai-scan'
  | 'silent-mode'
  | 'breathe'
  | 'force-fast'
  | 'radio-toggle'
  | 'night-mode'
  | 'prayer-mode'
  | 'freeze-widgets'
  | 'cohort-support'
  | 'qos-report'
  | 'assembly-check'
  | 'phys-report'
  | 'sil-check'
  | 'qi-rfi'
  | 'system-help'
  | 'story-mode'
  | 'how-checkin'

export type LogCommandCategory = 'AI' | 'SELF-CARE' | 'STATE' | 'INTERFACE' | 'SYSTEM'

export interface LogCommandDef {
  trigger: LogTrigger
  /** Lower-case keywords WITHOUT the leading slash. First one is canonical. */
  keywords: string[]
  emojis: string[]
  category: LogCommandCategory
  /** Optional argument grammar shown in /system, e.g. "[day|week|month|year]". */
  args?: string
  description: string
  /** Hidden from /system (e.g. passive triggers with no slash form). */
  hidden?: boolean
}

export const LOG_COMMANDS: LogCommandDef[] = [
  // ── AI ────────────────────────────────────────────────────────────────
  {
    trigger: 'story-mode', keywords: ['story'], emojis: ['📖'], category: 'AI',
    args: '[day|week|month|year]',
    description: 'Compressed story of your day / week / month / year',
  },
  {
    trigger: 'qi-rfi', keywords: ['qi'], emojis: [], category: 'AI',
    args: '<query>',
    description: 'Ask the Quantum Intelligence engine',
  },
  {
    trigger: 'prayer-mode', keywords: ['prayer', 'candle'], emojis: ['🕯️', '🕯'], category: 'AI',
    description: 'Contextual scripture',
  },
  {
    trigger: 'assembly-check', keywords: ['assembly', 'assemble'], emojis: [], category: 'AI',
    description: 'Self-assembly directive',
  },
  // ── SELF-CARE ─────────────────────────────────────────────────────────
  {
    trigger: 'breathe', keywords: ['breathe', 'breath'], emojis: [], category: 'SELF-CARE',
    description: '4-2-6 breathing exercise',
  },
  {
    trigger: 'freeze-widgets', keywords: ['freeze', 'pause'], emojis: ['🧊'], category: 'SELF-CARE',
    description: 'Pause and reflect protocol',
  },
  {
    trigger: 'force-fast', keywords: ['fast'], emojis: [], category: 'SELF-CARE',
    description: 'Orthodox fasting calendar',
  },
  {
    trigger: 'silent-mode', keywords: ['silent', 'quiet'], emojis: [], category: 'SELF-CARE',
    description: 'Signal silence check',
  },
  {
    trigger: 'how-checkin', keywords: ['how'], emojis: [], category: 'SELF-CARE',
    description: 'Open LOT AI check-in (System tab)',
  },
  // ── STATE ─────────────────────────────────────────────────────────────
  {
    trigger: 'phys-report', keywords: ['phys', 'cohort-report'], emojis: [], category: 'STATE',
    description: 'Physiological cohort report',
  },
  {
    trigger: 'qos-report', keywords: ['qos', 'os-report'], emojis: [], category: 'STATE',
    description: 'Quantum OS state analysis',
  },
  {
    trigger: 'sil-check', keywords: ['sil', 'silence-check'], emojis: [], category: 'STATE',
    description: 'Signal silence pattern check',
  },
  {
    trigger: 'ai-scan', keywords: ['scan', 'ai'], emojis: [], category: 'STATE',
    description: 'System status overview',
  },
  // ── INTERFACE ─────────────────────────────────────────────────────────
  {
    trigger: 'toggle-synth', keywords: ['synth', 'keyboard'], emojis: ['🎹'], category: 'INTERFACE',
    description: 'Toggle keyboard sound',
  },
  {
    trigger: 'radio-toggle', keywords: ['radio'], emojis: ['🎧'], category: 'INTERFACE',
    description: 'Toggle radio',
  },
  {
    trigger: 'night-mode', keywords: ['night'], emojis: ['🌙'], category: 'INTERFACE',
    description: 'Dark mode',
  },
  // ── SYSTEM ────────────────────────────────────────────────────────────
  {
    trigger: 'system-help', keywords: ['system', 'commands'], emojis: [], category: 'SYSTEM',
    description: 'This command list',
  },
  {
    trigger: 'cohort-support', keywords: [], emojis: ['❗', '‼️', '‼'], category: 'SYSTEM',
    description: 'Request cohort support (heavy exclamation)', hidden: true,
  },
]

const CATEGORY_ORDER: LogCommandCategory[] = ['AI', 'SELF-CARE', 'STATE', 'INTERFACE', 'SYSTEM']

/** Pad width for the command column in the plain-text help block. */
const CMD_COL = 14

/**
 * Builds the /system help text consumed by the Logs renderer:
 *  - lines starting with "/" → command rows (cmd, 2+ spaces, description)
 *  - any other non-empty line → section header
 *  - empty line → spacer
 */
export function buildSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const defs = LOG_COMMANDS.filter(d => d.category === cat && !d.hidden && d.keywords.length)
    if (!defs.length) continue
    lines.push('', cat)
    for (const d of defs) {
      const cmd = `/${d.keywords[0]}${d.args ? ' ' + d.args : ''}`
      lines.push(`${cmd.padEnd(CMD_COL)}  ${d.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}
