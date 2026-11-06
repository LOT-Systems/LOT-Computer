/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 */

/**
 * Log command registry + local story compression + arcade rank.
 *
 * Pure module (no stores, no DOM, no network) so it is unit-testable
 * and usable from any surface. Single source of truth for:
 *   - the `/system` help screen (generated, never hand-edited)
 *   - unknown-command suggestions
 *   - `/story [day|week|month|year]` offline compression
 *   - `/rank` arcade standing (XP / level / streak)
 *
 * Doc: docs/technical/LOG-COMMAND-SYSTEM.md
 */

export type CommandCategory = 'AI' | 'STATE' | 'ARCADE' | 'AMBIENT' | 'SYSTEM'

export interface LogCommand {
  name: string
  usage: string
  description: string
  category: CommandCategory
}

export const LOG_COMMANDS: LogCommand[] = [
  { name: 'story',    usage: '/story [day|week|month|year]', description: 'Compressed story of your logs (default: day)', category: 'AI' },
  { name: 'qi',       usage: '/qi [query]',  description: 'Ask the Quantum Intelligence engine', category: 'AI' },
  { name: 'prayer',   usage: '/prayer',      description: 'Generate contextual scripture', category: 'AI' },
  { name: 'how',      usage: '/how',         description: 'Open LOT AI check-in (System tab)', category: 'AI' },
  { name: 'rank',     usage: '/rank',        description: 'Arcade standing: level, XP, streak', category: 'ARCADE' },
  { name: 'scan',     usage: '/scan',        description: 'System status overview', category: 'STATE' },
  { name: 'assembly', usage: '/assembly',    description: 'Self-assembly module status', category: 'STATE' },
  { name: 'phys',     usage: '/phys',        description: 'Physiological cohort report', category: 'STATE' },
  { name: 'qos',      usage: '/qos',         description: 'Quantum OS state analysis', category: 'STATE' },
  { name: 'sil',      usage: '/sil',         description: 'Signal silence check', category: 'STATE' },
  { name: 'fast',     usage: '/fast',        description: 'Orthodox fasting calendar', category: 'STATE' },
  { name: 'breathe',  usage: '/breathe',     description: '4-2-6 breathing exercise', category: 'AMBIENT' },
  { name: 'freeze',   usage: '/freeze',      description: 'Pause and reflect protocol', category: 'AMBIENT' },
  { name: 'silent',   usage: '/silent',      description: 'Quiet mode', category: 'AMBIENT' },
  { name: 'synth',    usage: '/synth',       description: 'Toggle keyboard sound', category: 'AMBIENT' },
  { name: 'radio',    usage: '/radio',       description: 'Toggle radio', category: 'AMBIENT' },
  { name: 'night',    usage: '/night',       description: 'Dark mode', category: 'AMBIENT' },
  { name: 'system',   usage: '/system',      description: 'This help screen', category: 'SYSTEM' },
]

const CATEGORY_ORDER: CommandCategory[] = ['AI', 'ARCADE', 'STATE', 'AMBIENT', 'SYSTEM']

/** Build the /system help text from the registry. */
export function formatSystemHelp(): string {
  const width = Math.max(...LOG_COMMANDS.map(c => c.usage.length)) + 2
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.category === cat)
    if (!cmds.length) continue
    lines.push('', cat)
    for (const c of cmds) lines.push(c.usage.padEnd(width) + c.description)
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter'.padEnd(width) + 'Save log immediately')
  return lines.join('\n')
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[a.length][b.length]
}

/** Closest known command for a mistyped one (distance <= 2), else null. */
export function suggestCommand(input: string): string | null {
  const q = input.replace(/^\//, '').toLowerCase()
  if (!q) return null
  let best: { name: string; d: number } | null = null
  for (const c of LOG_COMMANDS) {
    const d = editDistance(q, c.name)
    if (d <= 2 && (!best || d < best.d)) best = { name: c.name, d }
  }
  return best ? `/${best.name}` : null
}

// ─── /story ─────────────────────────────────────────────────────────

export type StoryWindow = 'day' | 'week' | 'month' | 'year'

export function parseStoryWindow(text: string): StoryWindow {
  const m = text.toLowerCase().match(/\/story\s+(day|week|month|year)\b/)
  return (m?.[1] as StoryWindow) || 'day'
}

export interface StoryLog {
  text: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
}

const WINDOW_MS: Record<StoryWindow, number> = {
  day: 864e5,
  week: 7 * 864e5,
  month: 30 * 864e5,
  year: 365 * 864e5,
}

const STOPWORDS = new Set(
  'the a an and or but of to in on at for with is are was were be been it this that i my me we you he she they them as by from so not no do did have has had just very'.split(' ')
)

/** Strip system output (commands, 📖/🕯️ blocks) from a log. */
function cleanText(t: string | null): string {
  if (!t) return ''
  return t
    .split(/\n\n/)
    .filter(p => !/^\s*(📖|🕯️|🕯)/.test(p))
    .join('\n\n')
    .replace(/(^|\s)\/[a-z-]+(\s+(day|week|month|year))?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Deterministic offline compression of the user's logs for a window.
 * No network. Used when /api/story is unavailable, and as a preview.
 */
export function composeLocalStory(
  logs: StoryLog[],
  window: StoryWindow = 'day',
  now: Date = new Date()
): string {
  const since = now.getTime() - WINDOW_MS[window]
  const entries = logs
    .map(l => ({ at: new Date(l.createdAt), text: cleanText(l.text), ctx: l.context || {} }))
    .filter(e => e.text && e.at.getTime() >= since && e.at.getTime() <= now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const head = `STORY · ${window.toUpperCase()}`
  if (!entries.length) {
    return `${head}\nNo entries in this window. Write one line — the story starts there.`
  }

  const days = new Set(entries.map(e => e.at.toISOString().slice(0, 10))).size
  const words = entries.reduce((n, e) => n + e.text.split(' ').length, 0)

  const freq = new Map<string, number>()
  for (const e of entries)
    for (const w of e.text.toLowerCase().match(/[a-zа-яё]{4,}/g) || [])
      if (!STOPWORDS.has(w)) freq.set(w, (freq.get(w) || 0) + 1)
  const themes = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .filter(([, n]) => n > 1 || entries.length === 1)
    .map(([w]) => w)

  const cities = [...new Set(entries.map(e => e.ctx.city).filter(Boolean))]
  const temps = entries.map(e => e.ctx.temperature).filter((t): t is number => typeof t === 'number')
  const clip = (s: string) => (s.length > 120 ? s.slice(0, 117).trimEnd() + '…' : s)

  const lines = [
    head,
    `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · ${days} ${days === 1 ? 'day' : 'days'} · ${words} words`,
  ]
  if (themes.length) lines.push(`THEMES   ${themes.join(' · ')}`)
  if (cities.length) lines.push(`PLACES   ${cities.slice(0, 3).join(' · ')}`)
  if (temps.length) lines.push(`TEMP     ${Math.min(...temps).toFixed(0)}–${Math.max(...temps).toFixed(0)}`)
  lines.push(`OPEN     ${clip(entries[0].text)}`)
  if (entries.length > 1) lines.push(`LATEST   ${clip(entries[entries.length - 1].text)}`)
  return lines.join('\n')
}

// ─── /rank (arcade) ─────────────────────────────────────────────────

export const RANKS: Array<{ minXp: number; name: string }> = [
  { minXp: 0, name: 'SIGNAL' },
  { minXp: 10, name: 'OPERATOR' },
  { minXp: 40, name: 'NAVIGATOR' },
  { minXp: 120, name: 'ARCHIVIST' },
  { minXp: 300, name: 'ORACLE' },
  { minXp: 700, name: 'ARCHITECT' },
]

/** Consecutive-day streak ending today or yesterday (UTC days). */
export function computeStreak(dates: Array<Date | string>, now: Date = new Date()): number {
  const day = (d: Date) => Math.floor(d.getTime() / 864e5)
  const set = new Set(dates.map(d => day(new Date(d))))
  let cur = day(now)
  if (!set.has(cur)) cur -= 1
  let n = 0
  while (set.has(cur)) { n++; cur-- }
  return n
}

/** XP = 1 per entry + 5 per streak day (capped at 100 streak bonus days). */
export function computeRank(logs: StoryLog[], now: Date = new Date()) {
  const real = logs.filter(l => cleanText(l.text))
  const streak = computeStreak(real.map(l => l.createdAt), now)
  const xp = real.length + 5 * Math.min(streak, 100)
  let idx = 0
  RANKS.forEach((r, i) => { if (xp >= r.minXp) idx = i })
  const next = RANKS[idx + 1]
  return { xp, streak, entries: real.length, rank: RANKS[idx].name, level: idx + 1, next: next ? { name: next.name, xpNeeded: next.minXp - xp } : null }
}

export function formatRank(logs: StoryLog[], now: Date = new Date()): string {
  const r = computeRank(logs, now)
  return [
    `RANK     ${r.rank}  (LV ${r.level})`,
    `XP       ${r.xp}`,
    `STREAK   ${r.streak} ${r.streak === 1 ? 'day' : 'days'}`,
    `ENTRIES  ${r.entries}`,
    r.next ? `NEXT     ${r.next.name} in ${r.next.xpNeeded} XP` : 'NEXT     MAX RANK',
  ].join('\n')
}
