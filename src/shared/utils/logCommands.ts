/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry, /story compression and Arcade rank.
 *
 * Pure module (no DOM, no stores, no DB) shared by the client Log editor
 * and the server /api/story route.
 *
 *  - LOG_COMMANDS      single source of truth for the /system screen
 *  - parseStoryPeriod  "/story week" -> 'week'
 *  - summarizeEntries  logs -> countable stats (entries, active days, streak, moods)
 *  - computeArcade     stats -> XP / level / rank (Arcade evolution)
 *  - composeCompressedStory  deterministic fallback when the AI vendor is down
 *
 * Arcade formula is PROVISIONAL: transparent linear XP, tunable by constant.
 */

export type CommandCategory = 'CONTEXT' | 'MIND' | 'BODY' | 'SYSTEM' | 'ARCADE'

export interface LogCommand {
  name: string
  args?: string
  category: CommandCategory
  desc: string
}

export const LOG_COMMANDS: LogCommand[] = [
  { name: 'story', args: '[day|week|month|year]', category: 'CONTEXT', desc: 'Compressed story of your period + Arcade rank' },
  { name: 'how', category: 'CONTEXT', desc: 'Open LOT AI check-in (System tab)' },
  { name: 'qi', args: '[query]', category: 'CONTEXT', desc: 'Ask the Quantum Intelligence engine' },
  { name: 'prayer', category: 'MIND', desc: 'Generate contextual scripture' },
  { name: 'freeze', category: 'MIND', desc: 'Pause and reflect protocol' },
  { name: 'silent', category: 'MIND', desc: 'Signal silence check' },
  { name: 'breathe', category: 'BODY', desc: '4-2-6 breathing exercise' },
  { name: 'fast', category: 'BODY', desc: 'Orthodox fasting calendar' },
  { name: 'phys', category: 'BODY', desc: 'Physiological cohort report' },
  { name: 'scan', category: 'SYSTEM', desc: 'System status overview' },
  { name: 'assembly', category: 'SYSTEM', desc: 'Self-assembly module status' },
  { name: 'qos', category: 'SYSTEM', desc: 'Quantum OS state analysis' },
  { name: 'synth', category: 'SYSTEM', desc: 'Toggle keyboard sound' },
  { name: 'radio', category: 'SYSTEM', desc: 'Toggle radio' },
  { name: 'night', category: 'SYSTEM', desc: 'Dark mode' },
  { name: 'system', category: 'SYSTEM', desc: 'This help screen' },
]

const CATEGORY_ORDER: CommandCategory[] = ['CONTEXT', 'MIND', 'BODY', 'SYSTEM', 'ARCADE']

/**
 * Text for the /system screen. Format is consumed by the Log renderer:
 * lines starting with "/" are command rows (cmd, 2+ spaces, desc);
 * other non-empty lines are section headers.
 */
export function renderSystemHelp(): string {
  const out: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.category === cat)
    if (!cmds.length) continue
    out.push('', cat)
    for (const c of cmds) {
      const head = `/${c.name}${c.args ? ' ' + c.args : ''}`
      out.push(`${head}  ${c.desc}`)
    }
  }
  out.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return out.join('\n')
}

// ─── Story periods ──────────────────────────────────────────────────────────

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year',
}

/** Reads the period argument after "/story"; defaults to 'day'. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  return (m && PERIOD_ALIASES[m[2].toLowerCase()]) || 'day'
}

export function isStoryPeriod(v: unknown): v is StoryPeriod {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(PERIOD_DAYS, v)
}

/** Window start for a period: now minus N days (day = rolling 24h). */
export function storyWindowStart(period: StoryPeriod, now: Date = new Date()): Date {
  return new Date(now.getTime() - PERIOD_DAYS[period] * 86_400_000)
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export interface EntryLike {
  createdAt: Date | string
  mood?: string
}

export interface EntryStats {
  entries: number
  activeDays: number
  streak: number // consecutive active days ending today or yesterday
  moods: Record<string, number>
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

export function summarizeEntries(items: EntryLike[], now: Date = new Date()): EntryStats {
  const days = new Set<string>()
  const moods: Record<string, number> = {}
  for (const it of items) {
    const d = new Date(it.createdAt)
    if (isNaN(d.getTime())) continue
    days.add(dayKey(d))
    if (it.mood) {
      const k = it.mood.toLowerCase()
      moods[k] = (moods[k] || 0) + 1
    }
  }
  let streak = 0
  const cursor = new Date(now)
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return { entries: items.length, activeDays: days.size, streak, moods }
}

// ─── Arcade ─────────────────────────────────────────────────────────────────

export interface ArcadeRank {
  min: number
  title: string
}

/** Self-care ranks, ascending by XP threshold. */
export const ARCADE_RANKS: ArcadeRank[] = [
  { min: 0, title: 'SIGNAL' },
  { min: 100, title: 'OPERATOR' },
  { min: 400, title: 'NAVIGATOR' },
  { min: 1000, title: 'KEEPER' },
  { min: 2500, title: 'ARCHITECT' },
  { min: 6000, title: 'ORACLE' },
]

export const ARCADE_XP = { entry: 10, activeDay: 25, streakDay: 15, badge: 50 } as const

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  nextRank: string | null
  toNext: number
  progressPct: number
}

export function computeArcade(
  stats: Pick<EntryStats, 'entries' | 'activeDays' | 'streak'>,
  badges = 0
): ArcadeState {
  const xp =
    stats.entries * ARCADE_XP.entry +
    stats.activeDays * ARCADE_XP.activeDay +
    stats.streak * ARCADE_XP.streakDay +
    badges * ARCADE_XP.badge
  let idx = 0
  ARCADE_RANKS.forEach((r, i) => { if (xp >= r.min) idx = i })
  const cur = ARCADE_RANKS[idx]
  const next = ARCADE_RANKS[idx + 1] || null
  return {
    xp,
    level: idx + 1,
    rank: cur.title,
    nextRank: next ? next.title : null,
    toNext: next ? next.min - xp : 0,
    progressPct: next ? Math.floor(((xp - cur.min) / (next.min - cur.min)) * 100) : 100,
  }
}

export function renderArcadeLine(a: ArcadeState): string {
  const bar = '█'.repeat(Math.round(a.progressPct / 10)).padEnd(10, '░')
  return a.nextRank
    ? `ARCADE  LV${a.level} ${a.rank}  ${bar}  ${a.xp} XP — ${a.toNext} to ${a.nextRank}`
    : `ARCADE  LV${a.level} ${a.rank}  ${bar}  ${a.xp} XP — MAX`
}

// ─── Deterministic fallback story ───────────────────────────────────────────

export function composeCompressedStory(period: StoryPeriod, s: EntryStats): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[period]
  if (!s.entries) {
    return `No entries ${span}. The log is open whenever you are.`
  }
  const topMood = Object.entries(s.moods).sort((a, b) => b[1] - a[1])[0]
  const parts = [
    `${s.entries} ${s.entries === 1 ? 'entry' : 'entries'} across ${s.activeDays} ${s.activeDays === 1 ? 'day' : 'days'} ${span}.`,
  ]
  if (s.streak > 1) parts.push(`A ${s.streak}-day streak is running.`)
  if (topMood) parts.push(`Most frequent state: ${topMood[0]}.`)
  return parts.join(' ')
}
