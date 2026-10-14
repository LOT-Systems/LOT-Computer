/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry + story compression + arcade rank.
 *
 * Pure module (no DB, no DOM, no network) shared by the client (/system help)
 * and the server (/story, /arcade). One registry = one source of truth: the
 * /system screen can never drift from the commands that actually exist.
 *
 * Doc: docs/technical/LOT-LOG-COMMANDS-STORY-ARCADE.md
 */

// ---------------------------------------------------------------------------
// COMMAND REGISTRY  (/system)
// ---------------------------------------------------------------------------

export type CommandGroup = 'AI' | 'ARCADE' | 'CONTEXT' | 'WELLBEING' | 'INTERFACE'

export interface LogCommand {
  usage: string // as typed, e.g. "/story [day|week|month|year]"
  desc: string
  group: CommandGroup
}

export const LOG_COMMANDS: LogCommand[] = [
  { usage: '/story', desc: 'Compressed story of your day (default), or /story week|month|year', group: 'AI' },
  { usage: '/how', desc: 'Open LOT AI check-in (System tab)', group: 'AI' },
  { usage: '/qi [query]', desc: 'Ask the Quantum Intelligence engine', group: 'AI' },
  { usage: '/scan', desc: 'System status overview', group: 'AI' },
  { usage: '/arcade', desc: 'Your rank, XP and next level (also /rank)', group: 'ARCADE' },
  { usage: '/qos', desc: 'Quantum OS state analysis', group: 'CONTEXT' },
  { usage: '/assembly', desc: 'Self-assembly module status', group: 'CONTEXT' },
  { usage: '/phys', desc: 'Physiological cohort report', group: 'CONTEXT' },
  { usage: '/silent', desc: 'Signal silence check', group: 'CONTEXT' },
  { usage: '/prayer', desc: 'Generate contextual scripture', group: 'WELLBEING' },
  { usage: '/breathe', desc: '4-2-6 breathing exercise', group: 'WELLBEING' },
  { usage: '/freeze', desc: 'Pause and reflect protocol', group: 'WELLBEING' },
  { usage: '/fast', desc: 'Orthodox fasting calendar', group: 'WELLBEING' },
  { usage: '/synth', desc: 'Toggle keyboard sound', group: 'INTERFACE' },
  { usage: '/radio', desc: 'Toggle radio', group: 'INTERFACE' },
  { usage: '/night', desc: 'Dark mode', group: 'INTERFACE' },
  { usage: '/system', desc: 'This help screen (also /commands)', group: 'INTERFACE' },
]

/** Lines for the /system block. Command lines start with "/"; headers do not. */
export function renderSystemHelp(): string {
  const pad = (s: string) => s + ' '.repeat(Math.max(2, 16 - s.length))
  const lines: string[] = ['AVAILABLE COMMANDS']
  const groups: CommandGroup[] = ['AI', 'ARCADE', 'CONTEXT', 'WELLBEING', 'INTERFACE']
  for (const g of groups) {
    lines.push('', g)
    LOG_COMMANDS.filter(c => c.group === g).forEach(c => lines.push(pad(c.usage) + c.desc))
  }
  lines.push('', 'SHORTCUTS', pad('Ctrl+Enter') + 'Save log immediately')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// STORY PERIODS  (/story, /story week …)
// ---------------------------------------------------------------------------

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }

/** "/story week" → 'week'. Bare "/story" or unknown argument → 'day'. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story(?:\s+(day|today|week|month|year))?(\s|$|[^a-z0-9_])/i.exec(text || '')
  const arg = (m?.[2] || 'day').toLowerCase()
  return arg === 'today' ? 'day' : (arg as StoryPeriod)
}

export function periodStart(period: StoryPeriod, now: Date = new Date()): Date {
  return new Date(now.getTime() - PERIOD_DAYS[period] * 86_400_000)
}

// ---------------------------------------------------------------------------
// COMPRESSION  — logs in a window → countable facts + context spikes
// ---------------------------------------------------------------------------

export interface LogLike {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export interface Compression {
  period: StoryPeriod
  entries: number // Log (note) entries
  activeDays: number
  totalWords: number
  moods: { state: string; count: number }[]
  peaks: string[] // short human lines, "high" moments
  lows: string[] // short human lines, "low" moments
  contextSpikes: string[] // environment shifts around entries
  sample: string[] // trimmed entry excerpts, newest first
}

const LOW_MOODS = new Set(['anxious', 'sad', 'tired', 'stressed', 'overwhelmed', 'low', 'angry', 'lonely', 'exhausted'])
const HIGH_MOODS = new Set(['happy', 'calm', 'energized', 'grateful', 'joyful', 'peaceful', 'inspired', 'excited', 'focused'])

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d))
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

export function compressLogs(logs: LogLike[], period: StoryPeriod, now: Date = new Date()): Compression {
  const since = periodStart(period, now).getTime()
  const inWindow = logs
    .filter(l => toDate(l.createdAt).getTime() >= since)
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())

  const notes = inWindow.filter(l => l.event === 'note' && (l.text || '').trim())
  const days = new Set(inWindow.filter(l => l.event === 'note').map(l => dayKey(toDate(l.createdAt))))

  const moodCount = new Map<string, number>()
  const peaks: string[] = []
  const lows: string[] = []
  for (const l of inWindow) {
    if (l.event !== 'emotional_checkin') continue
    const state = String(l.metadata?.emotionalState || '').toLowerCase()
    if (!state) continue
    moodCount.set(state, (moodCount.get(state) || 0) + 1)
    const when = dayKey(toDate(l.createdAt))
    if (HIGH_MOODS.has(state) && peaks.length < 3) peaks.push(`${when}: ${state}`)
    if (LOW_MOODS.has(state) && lows.length < 3) lows.push(`${when}: ${state}`)
  }

  // Context spikes: a >=8°C swing between consecutive entries, or a weather
  // description change on a day with a low mood. Honest, simple, explainable.
  const contextSpikes: string[] = []
  const withTemp = notes.filter(l => typeof l.context?.temperature === 'number')
  for (let i = 0; i + 1 < withTemp.length && contextSpikes.length < 3; i++) {
    const a = withTemp[i].context!.temperature as number
    const b = withTemp[i + 1].context!.temperature as number
    if (Math.abs(a - b) >= 8) {
      contextSpikes.push(`${dayKey(toDate(withTemp[i].createdAt))}: temperature shift ${b}→${a}`)
    }
  }

  return {
    period,
    entries: notes.length,
    activeDays: days.size,
    totalWords: notes.reduce((n, l) => n + wordCount(l.text || ''), 0),
    moods: [...moodCount.entries()].map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count),
    peaks,
    lows,
    contextSpikes,
    sample: notes.slice(0, period === 'day' ? 8 : 12).map(l => (l.text || '').replace(/\s+/g, ' ').slice(0, 200)),
  }
}

/** Plain-text data block fed to the model (and reused as a no-AI fallback story). */
export function renderCompression(c: Compression): string {
  return [
    `PERIOD: ${c.period.toUpperCase()}`,
    `LOG ENTRIES: ${c.entries} on ${c.activeDays} active day(s), ${c.totalWords} words`,
    `MOODS: ${c.moods.map(m => `${m.state}×${m.count}`).join(', ') || 'NO DATA'}`,
    `PEAKS: ${c.peaks.join('; ') || 'none detected'}`,
    `LOWS: ${c.lows.join('; ') || 'none detected'}`,
    `CONTEXT SHIFTS: ${c.contextSpikes.join('; ') || 'none detected'}`,
    `ENTRIES (newest first):`,
    ...(c.sample.length ? c.sample.map(s => `- ${s}`) : ['- (none)']),
  ].join('\n')
}

/** Deterministic story used when the AI vendor is unreachable. Never invents data. */
export function fallbackStory(c: Compression): string {
  if (!c.entries && !c.moods.length) {
    return `Nothing recorded this ${c.period} yet. Write a line in the Log — the story starts there.`
  }
  const mood = c.moods[0] ? ` Most frequent state: ${c.moods[0].state}.` : ''
  return `This ${c.period}: ${c.entries} log ${c.entries === 1 ? 'entry' : 'entries'} across ${c.activeDays} day${c.activeDays === 1 ? '' : 's'}.${mood} The engine is resting; your full story will return when it does.`
}

// ---------------------------------------------------------------------------
// ARCADE  — gamified evolution (PROVISIONAL scoring, see doc §Arcade)
// ---------------------------------------------------------------------------

export interface ArcadeRank {
  level: number
  title: string
  minXp: number
}

export const ARCADE_RANKS: ArcadeRank[] = [
  { level: 1, title: 'SPARK', minXp: 0 },
  { level: 2, title: 'SIGNAL', minXp: 50 },
  { level: 3, title: 'PULSE', minXp: 150 },
  { level: 4, title: 'ORBIT', minXp: 400 },
  { level: 5, title: 'RESONANCE', minXp: 900 },
  { level: 6, title: 'COHERENCE', minXp: 1800 },
  { level: 7, title: 'QUANTUM', minXp: 3500 },
]

export const XP_RULES = {
  note: 5, // a Log entry
  noteDeepBonus: 5, // 50+ words
  emotional_checkin: 3,
  generated_story: 8, // asking the machine to compress you
  newActiveDay: 10, // first entry of a calendar day
} as const

export interface ArcadeStatus {
  xp: number
  level: number
  title: string
  nextTitle: string | null
  xpToNext: number | null
  progressPct: number
  streakDays: number
}

export function computeArcade(logs: LogLike[], now: Date = new Date()): ArcadeStatus {
  let xp = 0
  const noteDays = new Set<string>()
  for (const l of logs) {
    if (l.event === 'note' && (l.text || '').trim()) {
      xp += XP_RULES.note
      if (wordCount(l.text || '') >= 50) xp += XP_RULES.noteDeepBonus
      noteDays.add(dayKey(toDate(l.createdAt)))
    } else if (l.event === 'emotional_checkin') xp += XP_RULES.emotional_checkin
    else if (l.event === 'generated_story') xp += XP_RULES.generated_story
  }
  xp += noteDays.size * XP_RULES.newActiveDay

  // Streak: consecutive days with a Log entry ending today (or yesterday).
  let streak = 0
  const cursor = new Date(now)
  if (!noteDays.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  while (noteDays.has(dayKey(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  let idx = 0
  ARCADE_RANKS.forEach((r, i) => { if (xp >= r.minXp) idx = i })
  const cur = ARCADE_RANKS[idx]
  const next = ARCADE_RANKS[idx + 1] || null
  return {
    xp,
    level: cur.level,
    title: cur.title,
    nextTitle: next?.title ?? null,
    xpToNext: next ? next.minXp - xp : null,
    progressPct: next ? Math.round(((xp - cur.minXp) / (next.minXp - cur.minXp)) * 100) : 100,
    streakDays: streak,
  }
}

export function renderArcade(a: ArcadeStatus): string {
  const bar = (() => {
    const filled = Math.round(a.progressPct / 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled)
  })()
  return [
    `RANK            LV${a.level} ${a.title}`,
    `XP              ${a.xp}`,
    `PROGRESS        ${bar} ${a.progressPct}%`,
    a.nextTitle ? `NEXT            ${a.nextTitle} in ${a.xpToNext} XP` : 'NEXT            MAX RANK',
    `STREAK          ${a.streakDays} DAY${a.streakDays === 1 ? '' : 'S'}`,
  ].join('\n')
}
