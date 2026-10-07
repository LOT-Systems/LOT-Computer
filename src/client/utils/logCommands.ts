/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND REGISTRY
 *
 * Single source of truth for every slash command the Log understands.
 * `/system` renders from this table, so help can never drift from the
 * detector table in logTriggers.ts (a self-check script enforces parity).
 *
 * ARCADE LAYER: each command carries an XP weight. First use of a command
 * is a "discovery" (+XP). Total XP maps to an operator rank. Discovery state
 * lives in localStorage only — it is a per-device convenience, not user data.
 * Self-care tech, not a casino: no streak-shaming, no loss states, no
 * variable-ratio rewards. Rank only goes up.
 */

import type { LogTrigger } from './logTriggers'

export type CommandCategory = 'MEMORY' | 'BODY' | 'ENGINE' | 'ENVIRONMENT' | 'SYSTEM'

export interface LogCommand {
  /** Trigger this command fires (matches logTriggers.ts) */
  trigger: LogTrigger
  /** Primary slash form, shown in help */
  usage: string
  /** Extra accepted slash words (without slash) */
  aliases: string[]
  category: CommandCategory
  description: string
  /** Arcade XP awarded on first use */
  xp: number
}

export const COMMANDS: LogCommand[] = [
  // MEMORY — the compression loop
  { trigger: 'story-mode', usage: '/story', aliases: [], category: 'MEMORY', description: 'Compressed story of your day', xp: 20 },
  { trigger: 'story-week', usage: '/week', aliases: [], category: 'MEMORY', description: 'Compressed story of your week', xp: 30 },
  { trigger: 'story-month', usage: '/month', aliases: [], category: 'MEMORY', description: 'Compressed story of your month', xp: 40 },
  { trigger: 'story-year', usage: '/year', aliases: [], category: 'MEMORY', description: 'Compressed story of your year', xp: 50 },
  { trigger: 'prayer-mode', usage: '/prayer', aliases: ['candle'], category: 'MEMORY', description: 'Contextual scripture', xp: 10 },
  { trigger: 'how-checkin', usage: '/how', aliases: [], category: 'MEMORY', description: 'Open LOT AI check-in', xp: 10 },
  // ENGINE — what the machine knows
  { trigger: 'qi-rfi', usage: '/qi [query]', aliases: [], category: 'ENGINE', description: 'Ask the Quantum Intelligence engine', xp: 25 },
  { trigger: 'ai-scan', usage: '/scan', aliases: ['ai'], category: 'ENGINE', description: 'System status overview', xp: 10 },
  { trigger: 'assembly-check', usage: '/assembly', aliases: ['assemble'], category: 'ENGINE', description: 'Self-assembly module status', xp: 15 },
  { trigger: 'qos-report', usage: '/qos', aliases: ['os-report'], category: 'ENGINE', description: 'Quantum OS state analysis', xp: 15 },
  // BODY — self-care protocols
  { trigger: 'phys-report', usage: '/phys', aliases: ['cohort-report'], category: 'BODY', description: 'Physiological cohort report', xp: 15 },
  { trigger: 'breathe', usage: '/breathe', aliases: ['breath'], category: 'BODY', description: '4-2-6 breathing exercise', xp: 10 },
  { trigger: 'force-fast', usage: '/fast', aliases: [], category: 'BODY', description: 'Orthodox fasting calendar', xp: 10 },
  { trigger: 'freeze-widgets', usage: '/freeze', aliases: ['pause'], category: 'BODY', description: 'Pause and reflect protocol', xp: 10 },
  { trigger: 'silent-mode', usage: '/silent', aliases: ['quiet'], category: 'BODY', description: 'Signal silence check', xp: 10 },
  { trigger: 'sil-check', usage: '/sil', aliases: ['silence-check'], category: 'BODY', description: 'Silence pattern detector', xp: 10 },
  // ENVIRONMENT — sensory
  { trigger: 'toggle-synth', usage: '/synth', aliases: ['keyboard'], category: 'ENVIRONMENT', description: 'Toggle keyboard sound', xp: 5 },
  { trigger: 'radio-toggle', usage: '/radio', aliases: [], category: 'ENVIRONMENT', description: 'Toggle radio', xp: 5 },
  { trigger: 'night-mode', usage: '/night', aliases: [], category: 'ENVIRONMENT', description: 'Dark mode', xp: 5 },
  // SYSTEM
  { trigger: 'system-help', usage: '/system', aliases: ['commands'], category: 'SYSTEM', description: 'This command index', xp: 0 },
]

const CATEGORY_ORDER: CommandCategory[] = ['MEMORY', 'ENGINE', 'BODY', 'ENVIRONMENT', 'SYSTEM']

// ---------------------------------------------------------------------------
// Arcade ranks
// ---------------------------------------------------------------------------

export interface OperatorRank {
  name: string
  minXp: number
}

export const RANKS: OperatorRank[] = [
  { name: 'RECRUIT', minXp: 0 },
  { name: 'CADET', minXp: 30 },
  { name: 'OPERATOR', minXp: 80 },
  { name: 'SPECIALIST', minXp: 150 },
  { name: 'COMMANDER', minXp: 250 },
]

export const MAX_XP = COMMANDS.reduce((s, c) => s + c.xp, 0)

export function rankFor(xp: number): { rank: OperatorRank; next: OperatorRank | null } {
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].minXp) idx = i
  return { rank: RANKS[idx], next: RANKS[idx + 1] || null }
}

// ---------------------------------------------------------------------------
// Discovery persistence (localStorage, failure-tolerant)
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'lot:log-commands:discovered'

export function getDiscovered(): LogTrigger[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter(t => COMMANDS.some(c => c.trigger === t)) : []
  } catch {
    return []
  }
}

/** Records first use of a trigger. Returns the XP gained (0 if already known). */
export function recordCommandUse(trigger: LogTrigger): number {
  const cmd = COMMANDS.find(c => c.trigger === trigger)
  if (!cmd) return 0
  const known = getDiscovered()
  if (known.includes(trigger)) return 0
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...known, trigger]))
  } catch {
    return 0
  }
  return cmd.xp
}

export function xpFor(discovered: LogTrigger[]): number {
  return COMMANDS.reduce((s, c) => s + (discovered.includes(c.trigger) ? c.xp : 0), 0)
}

// ---------------------------------------------------------------------------
// /system renderer
// ---------------------------------------------------------------------------

/**
 * Builds the /system screen. Line grammar consumed by Logs.tsx:
 *   - lines starting with '/'  → command rows ("usage  description  [mark]")
 *   - 'KEY            value'   → status rows (rendered as headers when no '/')
 * Discovered commands are marked with a trailing '●'.
 */
export function formatSystemHelp(discovered: LogTrigger[]): string {
  const xp = xpFor(discovered)
  const { rank, next } = rankFor(xp)
  const lines: string[] = [
    'OPERATOR STATUS',
    `RANK  ${rank.name}   XP ${xp}/${MAX_XP}   COMMANDS ${discovered.length}/${COMMANDS.length}`,
    next ? `NEXT  ${next.name} AT ${next.minXp} XP` : 'NEXT  MAX RANK — THE RECORD IS THE REWARD',
    '',
  ]
  for (const cat of CATEGORY_ORDER) {
    const rows = COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push(cat)
    for (const c of rows) {
      const mark = discovered.includes(c.trigger) ? '  ●' : ''
      lines.push(`${c.usage.padEnd(14)}  ${c.description}${mark}`)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter    Save log immediately')
  lines.push('')
  lines.push('● = used. First use of each command earns XP.')
  return lines.join('\n')
}
