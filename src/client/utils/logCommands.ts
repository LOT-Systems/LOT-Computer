/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND REGISTRY — single source of truth for every slash
 * command the operator can type into the Log (Journal).
 *
 *  - /system            renders the full grouped command map
 *  - /system <command>  renders one command's dossier (usage, aliases, XP)
 *
 * The Log stays a *passive* AI surface: commands are opt-in, never
 * prompted. Ordinary text is just journal text with context metadata.
 *
 * Arcade layer: each command use grants a little XP, tallied locally.
 * The rank ladder rewards return visits and reflection, not volume —
 * self-care first, game second.
 */

import type { LogTrigger } from './logTriggers'

export type CommandCategory =
  | 'NARRATIVE'
  | 'INTELLIGENCE'
  | 'SELF-CARE'
  | 'ENVIRONMENT'
  | 'SYSTEM'

export const CATEGORY_ORDER: CommandCategory[] = [
  'NARRATIVE',
  'INTELLIGENCE',
  'SELF-CARE',
  'ENVIRONMENT',
  'SYSTEM',
]

export interface LogCommand {
  /** Primary command, with leading slash. */
  cmd: string
  /** Usage string shown in /system (args in brackets). */
  usage: string
  /** Trigger fired by logTriggers.detectTriggers(). */
  trigger: LogTrigger
  category: CommandCategory
  description: string
  /** Additional keywords / emojis that fire the same trigger. */
  aliases: string[]
  /** Arcade XP per use. */
  xp: number
}

export const LOG_COMMANDS: LogCommand[] = [
  // NARRATIVE — the compression loop
  { cmd: '/story',    usage: '/story [day|week|month|year]', trigger: 'story-mode',    category: 'NARRATIVE',    description: 'Compressed story of your day, week, month or year', aliases: ['📖'], xp: 10 },
  { cmd: '/prayer',   usage: '/prayer',      trigger: 'prayer-mode',    category: 'NARRATIVE',    description: 'Contextual scripture for this entry',      aliases: ['/candle', '🕯️'], xp: 5 },
  { cmd: '/how',      usage: '/how',         trigger: 'how-checkin',    category: 'NARRATIVE',    description: 'Open LOT AI check-in (System tab)',         aliases: [], xp: 3 },

  // INTELLIGENCE — Quantum Intent Engine surfaces
  { cmd: '/qi',       usage: '/qi [query]',  trigger: 'qi-rfi',         category: 'INTELLIGENCE', description: 'Ask the Quantum Intelligence engine',       aliases: [], xp: 5 },
  { cmd: '/qos',      usage: '/qos',         trigger: 'qos-report',     category: 'INTELLIGENCE', description: 'Quantum OS state analysis',                 aliases: ['/os-report'], xp: 3 },
  { cmd: '/assembly', usage: '/assembly',    trigger: 'assembly-check', category: 'INTELLIGENCE', description: 'Self-assembly module status',               aliases: ['/assemble'], xp: 3 },
  { cmd: '/phys',     usage: '/phys',        trigger: 'phys-report',    category: 'INTELLIGENCE', description: 'Physiological cohort report',               aliases: ['/cohort-report'], xp: 3 },
  { cmd: '/scan',     usage: '/scan',        trigger: 'ai-scan',        category: 'INTELLIGENCE', description: 'System status overview',                    aliases: ['/ai'], xp: 2 },

  // SELF-CARE — body protocols
  { cmd: '/breathe',  usage: '/breathe',     trigger: 'breathe',        category: 'SELF-CARE',    description: '4-2-6 breathing exercise',                  aliases: ['/breath'], xp: 8 },
  { cmd: '/freeze',   usage: '/freeze',      trigger: 'freeze-widgets', category: 'SELF-CARE',    description: 'Pause and reflect protocol',                aliases: ['/pause', '🧊'], xp: 5 },
  { cmd: '/silent',   usage: '/silent',      trigger: 'silent-mode',    category: 'SELF-CARE',    description: 'Signal silence check',                      aliases: ['/quiet'], xp: 3 },
  { cmd: '/sil',      usage: '/sil',         trigger: 'sil-check',      category: 'SELF-CARE',    description: 'Silence-pattern check',                     aliases: ['/silence-check'], xp: 2 },
  { cmd: '/fast',     usage: '/fast',        trigger: 'force-fast',     category: 'SELF-CARE',    description: 'Orthodox fasting calendar',                 aliases: [], xp: 2 },

  // ENVIRONMENT — room controls
  { cmd: '/radio',    usage: '/radio',       trigger: 'radio-toggle',   category: 'ENVIRONMENT',  description: 'Toggle radio',                              aliases: ['🎧'], xp: 1 },
  { cmd: '/synth',    usage: '/synth',       trigger: 'toggle-synth',   category: 'ENVIRONMENT',  description: 'Toggle keyboard sound',                     aliases: ['/keyboard', '🎹'], xp: 1 },
  { cmd: '/night',    usage: '/night',       trigger: 'night-mode',     category: 'ENVIRONMENT',  description: 'Dark mode',                                 aliases: ['🌙'], xp: 1 },

  // SYSTEM
  { cmd: '/system',   usage: '/system [command]', trigger: 'system-help', category: 'SYSTEM',     description: 'This command map (or one command dossier)', aliases: ['/commands'], xp: 0 },
]

/** Lookup by command name with or without slash, or by alias. */
export function findCommand(name: string): LogCommand | null {
  if (!name) return null
  const n = name.trim().toLowerCase()
  const withSlash = n.startsWith('/') ? n : `/${n}`
  return (
    LOG_COMMANDS.find(c => c.cmd === withSlash) ||
    LOG_COMMANDS.find(c => c.aliases.some(a => a.toLowerCase() === withSlash || a === name.trim())) ||
    null
  )
}

export function findCommandByTrigger(trigger: LogTrigger): LogCommand | null {
  return LOG_COMMANDS.find(c => c.trigger === trigger) || null
}

/** Extract the argument after `/system`, if any. */
export function parseSystemArg(text: string): string | null {
  const m = (text || '').match(/(?:^|\s)\/(?:system|commands)\s+\/?([a-z][a-z0-9-]*)/i)
  return m ? m[1].toLowerCase() : null
}

// ─── Arcade rank ladder ──────────────────────────────────────────────────────

export interface ArcadeRank {
  rank: string
  minXp: number
}

export const ARCADE_RANKS: ArcadeRank[] = [
  { rank: 'CADET',      minXp: 0 },
  { rank: 'OPERATOR',   minXp: 50 },
  { rank: 'NAVIGATOR',  minXp: 150 },
  { rank: 'ARCHIVIST',  minXp: 400 },
  { rank: 'CHRONICLER', minXp: 1000 },
  { rank: 'ORACLE',     minXp: 2500 },
]

export function rankForXp(xp: number): { current: ArcadeRank; next: ArcadeRank | null } {
  let idx = 0
  for (let i = 0; i < ARCADE_RANKS.length; i++) if (xp >= ARCADE_RANKS[i].minXp) idx = i
  return { current: ARCADE_RANKS[idx], next: ARCADE_RANKS[idx + 1] || null }
}

const XP_KEY = 'lot:log-command-xp'

export interface CommandLedger {
  xp: number
  uses: Record<string, number>
}

export function readLedger(): CommandLedger {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(XP_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.xp === 'number') return { xp: parsed.xp, uses: parsed.uses || {} }
    }
  } catch {}
  return { xp: 0, uses: {} }
}

/** Record one command use; returns the updated ledger. Extra XP (e.g. story compression) is optional. */
export function recordCommandUse(trigger: LogTrigger, extraXp = 0): CommandLedger {
  const ledger = readLedger()
  const cmd = findCommandByTrigger(trigger)
  ledger.xp += (cmd?.xp || 0) + Math.max(0, Math.round(extraXp))
  ledger.uses[trigger] = (ledger.uses[trigger] || 0) + 1
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(XP_KEY, JSON.stringify(ledger))
  } catch {}
  return ledger
}

// ─── Rendering ───────────────────────────────────────────────────────────────

const USAGE_COL = 30

/**
 * Lines for the SYSTEM block. Format contract consumed by Logs.tsx:
 *  - lines starting with "/" are rendered as command rows (split on 2+ spaces)
 *  - empty lines are spacers
 *  - everything else is a section header
 */
export function renderSystemHelp(ledger: CommandLedger = readLedger()): string[] {
  const lines: string[] = []
  for (const cat of CATEGORY_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.category === cat)
    if (!cmds.length) continue
    if (lines.length) lines.push('')
    lines.push(cat)
    for (const c of cmds) lines.push(`${c.usage.padEnd(USAGE_COL)}  ${c.description}`)
  }
  const { current, next } = rankForXp(ledger.xp)
  lines.push('')
  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter    Save log immediately')
  lines.push('Type /system <command> for a command dossier')
  lines.push('')
  lines.push(
    `ARCADE · RANK ${current.rank} · XP ${ledger.xp}` +
      (next ? ` · NEXT ${next.rank} @ ${next.minXp}` : ' · MAX RANK')
  )
  return lines
}

/** Dossier for one command; null if unknown. */
export function renderCommandDossier(name: string, ledger: CommandLedger = readLedger()): string[] | null {
  const c = findCommand(name)
  if (!c) return null
  const pad = (k: string) => k.padEnd(16)
  return [
    `COMMAND DOSSIER — ${c.cmd.toUpperCase()}`,
    `${c.usage.padEnd(USAGE_COL)}  ${c.description}`,
    '',
    `${pad('CATEGORY')}${c.category}`,
    `${pad('ALIASES')}${c.aliases.join(' ') || '—'}`,
    `${pad('XP / USE')}+${c.xp}`,
    `${pad('USES')}${ledger.uses[c.trigger] || 0}`,
  ]
}
