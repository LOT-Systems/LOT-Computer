/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for `/system`.
 *
 * Pure module (no stores, no DOM). The `/system` help screen, the arcade
 * rank, and the drift test all read from COMMANDS, so a command cannot be
 * triggerable yet missing from help (or the reverse).
 *
 * Arcade layer: every command a user fires for the first time is
 * "discovered". Discovery count maps to a rank. Self-care first — ranks
 * reward curiosity and consistency, never speed or volume.
 */

import type { LogTrigger } from './logTriggers'

export type CommandCategory = 'MEMORY' | 'SYSTEM' | 'WELLBEING' | 'AMBIENT'

export interface LogCommand {
  trigger: LogTrigger
  /** Primary slash command, without the slash. Must match RULES in logTriggers. */
  command: string
  /** Optional argument hint shown in help, e.g. "[query]". */
  args?: string
  description: string
  category: CommandCategory
}

export const COMMANDS: LogCommand[] = [
  // MEMORY — the loop: record → compress → return
  { trigger: 'story-mode',     command: 'story',    args: '[day|week|month|year]', description: 'Compressed story of your day, week, month or year', category: 'MEMORY' },
  { trigger: 'prayer-mode',    command: 'prayer',   description: 'Generate contextual scripture', category: 'MEMORY' },
  { trigger: 'how-checkin',    command: 'how',      description: 'Open LOT AI check-in (System tab)', category: 'MEMORY' },
  // SYSTEM — read the machine
  { trigger: 'system-help',    command: 'system',   description: 'This help screen', category: 'SYSTEM' },
  { trigger: 'ai-scan',        command: 'scan',     description: 'System status overview', category: 'SYSTEM' },
  { trigger: 'qi-rfi',         command: 'qi',       args: '[query]', description: 'Ask the Quantum Intelligence engine', category: 'SYSTEM' },
  { trigger: 'assembly-check', command: 'assembly', description: 'Self-assembly module status', category: 'SYSTEM' },
  { trigger: 'phys-report',    command: 'phys',     description: 'Physiological cohort report', category: 'SYSTEM' },
  { trigger: 'qos-report',     command: 'qos',      description: 'Quantum OS state analysis', category: 'SYSTEM' },
  // WELLBEING — care protocols
  { trigger: 'force-fast',     command: 'fast',     description: 'Orthodox fasting calendar', category: 'WELLBEING' },
  { trigger: 'breathe',        command: 'breathe',  description: '4-2-6 breathing exercise', category: 'WELLBEING' },
  { trigger: 'freeze-widgets', command: 'freeze',   description: 'Pause and reflect protocol', category: 'WELLBEING' },
  { trigger: 'silent-mode',    command: 'silent',   description: 'Signal silence check', category: 'WELLBEING' },
  // AMBIENT — environment
  { trigger: 'toggle-synth',   command: 'synth',    description: 'Toggle keyboard sound', category: 'AMBIENT' },
  { trigger: 'radio-toggle',   command: 'radio',    description: 'Toggle radio', category: 'AMBIENT' },
  { trigger: 'night-mode',     command: 'night',    description: 'Dark mode', category: 'AMBIENT' },
]

const CATEGORY_ORDER: CommandCategory[] = ['MEMORY', 'SYSTEM', 'WELLBEING', 'AMBIENT']

/** Operator ranks, by number of distinct commands discovered. */
export const ARCADE_RANKS: Array<{ min: number; rank: string }> = [
  { min: 0, rank: 'RECRUIT' },
  { min: 3, rank: 'CADET' },
  { min: 6, rank: 'OPERATOR' },
  { min: 10, rank: 'SPECIALIST' },
  { min: 14, rank: 'COMMANDER' },
  { min: COMMANDS.length, rank: 'ARCHITECT' },
]

export function rankFor(discovered: number): { rank: string; next: string | null; needed: number } {
  let idx = 0
  ARCADE_RANKS.forEach((r, i) => { if (discovered >= r.min) idx = i })
  const next = ARCADE_RANKS[idx + 1]
  return { rank: ARCADE_RANKS[idx].rank, next: next?.rank ?? null, needed: next ? next.min - discovered : 0 }
}

/**
 * Build the `/system` screen. Lines starting with `/` are command rows
 * (cmd + 2+ spaces + description); other non-empty lines render as section
 * headers — the contract Logs.tsx already renders against.
 */
export function renderSystemHelp(discovered: ReadonlySet<string> = new Set()): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const rows = COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push('', cat)
    for (const c of rows) {
      const cmd = `/${c.command}${c.args ? ' ' + c.args : ''}`
      // Discovered marker keeps the row parseable: cmd, 2+ spaces, description.
      lines.push(`${cmd}  ${discovered.has(c.trigger) ? '✓ ' : ''}${c.description}`)
    }
  }
  const count = COMMANDS.filter(c => discovered.has(c.trigger)).length
  const r = rankFor(count)
  lines.push(
    '',
    'ARCADE',
    `RANK ${r.rank} · ${count}/${COMMANDS.length} commands discovered`,
    r.next ? `NEXT ${r.next} in ${r.needed} more` : 'MAX RANK — the loop is yours',
    '',
    'SHORTCUTS',
    'Ctrl+Enter    Save log immediately'
  )
  return lines.join('\n')
}

/** Extract the scope word after `/story` (e.g. "/story week"). Defaults to 'week'. */
export function parseStoryCommand(text: string): { scope: 'day' | 'week' | 'month' | 'year'; rest: string } {
  const m = text.match(/(^|\s)\/story(?:\s+(today|day|daily|week|weekly|month|monthly|year|yearly|annual))?(?=\s|$|[^a-z0-9_])/i)
  const word = (m?.[2] || '').toLowerCase()
  const scope =
    word === 'today' || word === 'day' || word === 'daily' ? 'day'
    : word === 'month' || word === 'monthly' ? 'month'
    : word === 'year' || word === 'yearly' || word === 'annual' ? 'year'
    : 'week'
  const rest = text.replace(m?.[0] || '', ' ').replace(/📖/g, '').replace(/\s+/g, ' ').trim()
  return { scope, rest }
}

// ── Discovery persistence (per-viewer convenience; safe without storage) ──

const STORAGE_KEY = 'lot:log-commands-discovered'

export function loadDiscovered(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.filter((x: unknown) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

/** Mark a trigger discovered. Returns true when it is new (rank may have changed). */
export function markDiscovered(trigger: string): boolean {
  const known = loadDiscovered()
  if (known.has(trigger)) return false
  known.add(trigger)
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...known])) } catch {}
  return true
}
