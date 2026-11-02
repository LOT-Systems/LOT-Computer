/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry (LOT-LOGCMD) — single source of truth for slash
 * commands typed into the Log, plus the pure helpers behind /system and
 * /story. No stores, no DOM, no network: safe for client, server, tests.
 *
 * Pipeline: LOT User data -> Quantum Intent Engine -> Together AI -> LOT data.
 * The Log is a passive AI UI: the user only writes; commands are optional.
 */

export type CommandCategory = 'NARRATIVE' | 'CONTEXT' | 'BODY' | 'SYSTEM'

export interface LogCommand {
  command: string // as typed, e.g. "/story"
  usage?: string // argument hint, e.g. "[day|week|month|year]"
  description: string
  category: CommandCategory
}

export const LOG_COMMANDS: LogCommand[] = [
  { command: '/story', usage: '[day|week|month|year]', description: 'Compressed story of your day, week, month or year', category: 'NARRATIVE' },
  { command: '/prayer', description: 'Generate contextual scripture', category: 'NARRATIVE' },
  { command: '/how', description: 'Open LOT AI check-in (System tab)', category: 'NARRATIVE' },
  { command: '/qi', usage: '[query]', description: 'Ask the Quantum Intelligence engine', category: 'NARRATIVE' },
  { command: '/scan', description: 'System status overview', category: 'CONTEXT' },
  { command: '/qos', description: 'Quantum OS state analysis', category: 'CONTEXT' },
  { command: '/assembly', description: 'Self-assembly module status', category: 'CONTEXT' },
  { command: '/phys', description: 'Physiological cohort report', category: 'CONTEXT' },
  { command: '/fast', description: 'Orthodox fasting calendar', category: 'BODY' },
  { command: '/breathe', description: '4-2-6 breathing exercise', category: 'BODY' },
  { command: '/freeze', description: 'Pause and reflect protocol', category: 'BODY' },
  { command: '/silent', description: 'Signal silence check', category: 'BODY' },
  { command: '/synth', description: 'Toggle keyboard sound', category: 'SYSTEM' },
  { command: '/radio', description: 'Toggle radio', category: 'SYSTEM' },
  { command: '/night', description: 'Dark mode', category: 'SYSTEM' },
  { command: '/system', description: 'This help screen', category: 'SYSTEM' },
]

const CATEGORY_ORDER: CommandCategory[] = ['NARRATIVE', 'CONTEXT', 'BODY', 'SYSTEM']

/**
 * Renders the /system screen as plain text. Format contract (consumed by the
 * SYSTEM block renderer in Logs.tsx): category headers are lines without a
 * leading "/", command rows start with "/" and separate command from
 * description with 2+ spaces.
 */
export function buildSystemHelp(extra?: string[]): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const rows = LOG_COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push('', cat)
    for (const c of rows) {
      const head = c.usage ? `${c.command} ${c.usage}` : c.command
      lines.push(`${head.padEnd(14)}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  if (extra?.length) lines.push('', ...extra)
  return lines.join('\n')
}

// ── /story period ────────────────────────────────────────────────────────

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

export const STORY_PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', weekly: 'week', w: 'week',
  month: 'month', monthly: 'month', m: 'month',
  year: 'year', yearly: 'year', y: 'year',
}

/**
 * Extracts the period from text like "/story week". Defaults to 'day'.
 * Only the word directly after /story counts, so ordinary prose
 * ("/story of my week") is not misread.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  return (m && PERIOD_ALIASES[m[2].toLowerCase()]) || 'day'
}

/** Removes the /story command, its period word and the 📖 marker. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(\s+(today|weekly|monthly|yearly|day|week|month|year|[dwmy])\b)?/i, '$1')
    .replace(/📖/g, '')
    .trim()
}

// ── Arcade evolution ─────────────────────────────────────────────────────

export interface ArcadeStats {
  entries: number // journal/log entries in scope
  checkIns: number // emotional/energy/self-care check-ins in scope
  streakDays: number // consecutive days with at least one record
}

export interface ArcadeRank {
  xp: number
  level: number
  rank: string
  nextRank: string | null
  xpToNext: number
}

// Rank thresholds are provisional tuning values, not measured constants.
const RANKS: Array<{ name: string; xp: number }> = [
  { name: 'RECRUIT', xp: 0 },
  { name: 'OPERATOR', xp: 100 },
  { name: 'FIELD AGENT', xp: 300 },
  { name: 'SPECIALIST', xp: 700 },
  { name: 'COMMANDER', xp: 1500 },
  { name: 'ARCHITECT', xp: 3000 },
]

export function computeArcade(stats: ArcadeStats): ArcadeRank {
  const xp = Math.max(
    0,
    Math.floor(stats.entries) * 10 +
      Math.floor(stats.checkIns) * 5 +
      Math.floor(stats.streakDays) * 20
  )
  let idx = 0
  RANKS.forEach((r, i) => { if (xp >= r.xp) idx = i })
  const next = RANKS[idx + 1] || null
  return {
    xp,
    level: idx + 1,
    rank: RANKS[idx].name,
    nextRank: next ? next.name : null,
    xpToNext: next ? next.xp - xp : 0,
  }
}

/** Consecutive-day streak ending today (or yesterday) from record dates. */
export function computeStreakDays(dates: Array<Date | string | number>, now: Date = new Date()): number {
  const day = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000)
  const set = new Set(dates.map(d => day(new Date(d))))
  let cursor = day(now)
  if (!set.has(cursor)) cursor -= 1
  let streak = 0
  while (set.has(cursor)) { streak++; cursor-- }
  return streak
}

export function formatArcadeLine(a: ArcadeRank): string {
  const next = a.nextRank ? ` · ${a.xpToNext} XP TO ${a.nextRank}` : ' · MAX RANK'
  return `LVL ${a.level} ${a.rank} · ${a.xp} XP${next}`
}
