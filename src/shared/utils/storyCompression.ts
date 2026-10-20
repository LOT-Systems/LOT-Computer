/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — pure functions that turn a window of Log records
 * (journal entries + their context meta-data) into a compact digest, detect
 * spikes / pattern changes, and build the prompt for the AI vendor.
 *
 * Flow: LOT User data → digest (this module) → Quantum Intent Engine
 *       → AI vendor (Together AI) → personalised story stored as a Log.
 *
 * Pure module: no stores, no DB, no network. Deterministic given `now`.
 */

import type { StoryPeriod } from './logCommands'

export interface StoryLogRecord {
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: {
    temperature?: number | null // Kelvin
    humidity?: number | null
    city?: string | null
    weatherDescription?: string | null
    astroMoonPhase?: string | null
    astroWesternZodiac?: string | null
  } | null
}

export interface StoryWindow {
  period: StoryPeriod
  start: Date
  end: Date
  label: string
}

const DAY_MS = 86_400_000
const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }
const PERIOD_LABEL: Record<StoryPeriod, string> = {
  day: 'LAST 24 HOURS', week: 'LAST 7 DAYS', month: 'LAST 30 DAYS', year: 'LAST 365 DAYS',
}

/** Rolling window ending at `now`. */
export function periodWindow(period: StoryPeriod, now: Date = new Date()): StoryWindow {
  return {
    period,
    start: new Date(now.getTime() - PERIOD_DAYS[period] * DAY_MS),
    end: now,
    label: PERIOD_LABEL[period],
  }
}

export const JOURNAL_EVENTS = ['log_entry', 'journal']
const MOOD_EVENTS = ['emotional_checkin']
const SELF_CARE_EVENTS = ['memory_answer', 'self_care_checkin', 'energy_checkin']

export interface Spike {
  kind: 'volume' | 'mood-shift'
  note: string
}

export interface StoryDigest {
  window: StoryWindow
  journalCount: number
  activeDays: number
  streakDays: number
  perDay: Record<string, number>
  excerpts: string[]
  moods: string[]
  moodShift: string | null
  selfCare: string[]
  weather: { avgCelsius: number | null; avgHumidity: number | null; topCity: string | null; topSky: string | null }
  moonPhases: string[]
  spikes: Spike[]
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const top = (xs: string[]): string | null => {
  const c = new Map<string, number>()
  xs.forEach(x => c.set(x, (c.get(x) || 0) + 1))
  let best: string | null = null
  let n = 0
  c.forEach((v, k) => { if (v > n) { best = k; n = v } })
  return best
}

/** Consecutive active days ending at the window end (or the day before). */
function streak(activeKeys: Set<string>, end: Date): number {
  let n = 0
  let cursor = new Date(end.getTime())
  if (!activeKeys.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS)
  while (activeKeys.has(dayKey(cursor))) {
    n++
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  return n
}

/** Compress a set of Log records into a digest for the window. */
export function compressLogs(records: StoryLogRecord[], window: StoryWindow): StoryDigest {
  const inWin = records
    .map(r => ({ r, t: new Date(r.createdAt) }))
    .filter(x => x.t >= window.start && x.t <= window.end)
    .sort((a, b) => a.t.getTime() - b.t.getTime())

  const journal = inWin.filter(x => JOURNAL_EVENTS.includes(x.r.event) && (x.r.text || '').trim())
  const perDay: Record<string, number> = {}
  journal.forEach(x => { const k = dayKey(x.t); perDay[k] = (perDay[k] || 0) + 1 })

  const activeKeys = new Set(inWin.map(x => dayKey(x.t)))

  // Even-spread excerpt sampling keeps the beginning, middle and end of the window.
  const cap = window.period === 'day' ? 8 : window.period === 'week' ? 10 : 14
  const step = Math.max(1, Math.ceil(journal.length / cap))
  const excerpts = journal
    .filter((_, i) => i % step === 0)
    .slice(0, cap)
    .map(x => `${dayKey(x.t)}: ${(x.r.text || '').replace(/\s+/g, ' ').trim().slice(0, 160)}`)

  const moods = inWin
    .filter(x => MOOD_EVENTS.includes(x.r.event))
    .map(x => String(x.r.metadata?.emotionalState || '').toUpperCase())
    .filter(Boolean)

  const selfCare = inWin
    .filter(x => SELF_CARE_EVENTS.includes(x.r.event))
    .map(x => {
      const q = String(x.r.metadata?.question || '')
      const a = String(x.r.metadata?.option || x.r.metadata?.answer || '')
      return q && a ? `${q}: ${a}` : ''
    })
    .filter(Boolean)
    .slice(-8)

  const ctx = inWin.map(x => x.r.context).filter(Boolean) as NonNullable<StoryLogRecord['context']>[]
  const temps = ctx.map(c => c.temperature).filter((v): v is number => typeof v === 'number').map(k => k - 273.15)
  const hums = ctx.map(c => c.humidity).filter((v): v is number => typeof v === 'number')
  const weather = {
    avgCelsius: temps.length ? Math.round(mean(temps)) : null,
    avgHumidity: hums.length ? Math.round(mean(hums)) : null,
    topCity: top(ctx.map(c => c.city || '').filter(Boolean)),
    topSky: top(ctx.map(c => c.weatherDescription || '').filter(Boolean)),
  }
  const moonPhases = Array.from(new Set(ctx.map(c => c.astroMoonPhase || '').filter(Boolean))).slice(0, 3)

  // --- spike / pattern-change detection ---------------------------------
  const spikes: Spike[] = []
  const counts = Object.values(perDay)
  if (counts.length >= 3) {
    const m = mean(counts)
    const sd = Math.sqrt(mean(counts.map(c => (c - m) ** 2)))
    Object.entries(perDay).forEach(([k, c]) => {
      if (c >= 3 && c > m + 1.5 * sd) {
        spikes.push({ kind: 'volume', note: `${c} entries on ${k} vs ${m.toFixed(1)}/day average` })
      }
    })
  }

  let moodShift: string | null = null
  if (moods.length >= 4) {
    const half = Math.floor(moods.length / 2)
    const a = top(moods.slice(0, half))
    const b = top(moods.slice(half))
    if (a && b && a !== b) {
      moodShift = `${a} → ${b}`
      spikes.push({ kind: 'mood-shift', note: `dominant mood moved ${moodShift}` })
    }
  }

  return {
    window,
    journalCount: journal.length,
    activeDays: activeKeys.size,
    streakDays: streak(activeKeys, window.end),
    perDay,
    excerpts,
    moods,
    moodShift,
    selfCare,
    weather,
    moonPhases,
    spikes,
  }
}

const WORD_TARGET: Record<StoryPeriod, string> = {
  day: '80-140 words', week: '120-200 words', month: '150-240 words', year: '200-300 words',
}
const PERIOD_NOUN: Record<StoryPeriod, string> = {
  day: 'day', week: 'week', month: 'month', year: 'year',
}

export function buildStoryPrompt(
  digest: StoryDigest,
  opts: { logText?: string; stateBlock?: string } = {}
): string {
  const p = digest.window.period
  const w = digest.weather
  const weatherLine = [
    w.avgCelsius !== null ? `${w.avgCelsius}°C avg` : '',
    w.avgHumidity !== null ? `${w.avgHumidity}% humidity` : '',
    w.topSky || '',
    w.topCity || '',
    digest.moonPhases.length ? `moon: ${digest.moonPhases.join(', ')}` : '',
  ].filter(Boolean).join(' · ')

  const system = `You are the Story module of LOT Systems — a personal operating system that compresses the operator's ${PERIOD_NOUN[p]} into a short narrative and hands it back so the operator can see themselves.

Write ${WORD_TARGET[p]} about the operator's ${PERIOD_NOUN[p]}. It must feel personal, grounded and real — not generic motivational writing.

RULES:
- Second person ("You...")
- Use only the data below. Cite specific details from their entries. Never invent events.
- Name the high and the low of the ${PERIOD_NOUN[p]} if the data shows them.
- If SPIKES are listed, mention the pattern change gently and end with at most one open question the operator may sit with — no advice, no diagnosis.
- Weave in the environment (weather, place, moon) only where it explains the mood.
- If data is thin, say so honestly and keep it short.
- Match tone to the operator's energy: reflective if low, energized if high.
- Final sentence: one quiet, forward-looking truth. Not a pep talk.
- Return ONLY the story. No title, no preamble, no lists.`

  const data = `
WINDOW: ${digest.window.label}
ENTRIES: ${digest.journalCount} across ${digest.activeDays} active day(s), current streak ${digest.streakDays}
OPERATOR NOTE: "${(opts.logText || '').slice(0, 300) || '(none)'}"
${opts.stateBlock || 'STATE: unknown'}
ENVIRONMENT: ${weatherLine || 'NO DATA'}
MOODS: ${digest.moods.slice(-8).join(', ') || 'NO DATA'}${digest.moodShift ? ` (shift ${digest.moodShift})` : ''}
SPIKES: ${digest.spikes.map(s => s.note).join('; ') || 'none'}

JOURNAL EXCERPTS:
${digest.excerpts.map(e => `- ${e}`).join('\n') || '- (none)'}

SELF-CARE DATA:
${digest.selfCare.map(n => `- ${n}`).join('\n') || '- (none)'}`

  return `${system}\n\n${data}`
}

// --- Arcade evolution -----------------------------------------------------

export interface ArcadeStatus {
  xp: number
  level: number
  rank: string
  nextLevelXp: number
}

const RANKS = [
  'INSERT COIN', 'PLAYER ONE', 'COMBO', 'HIGH SCORE', 'BOSS RUSH', 'FLOW STATE', 'GRAND MASTER', 'LEGEND',
]

/**
 * Gamified evolution from journaling. XP = entries·10 + activeDays·25
 * + streak·15 (+50 per generated story, capped). Level n needs 100·n² XP.
 */
export function computeArcadeStatus(input: {
  entries: number
  activeDays: number
  streakDays: number
  storiesGenerated?: number
}): ArcadeStatus {
  const xp =
    input.entries * 10 +
    input.activeDays * 25 +
    input.streakDays * 15 +
    Math.min(input.storiesGenerated || 0, 20) * 50
  let level = 1
  while (xp >= 100 * (level + 1) ** 2 && level < RANKS.length * 5) level++
  return {
    xp,
    level,
    rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 5))],
    nextLevelXp: 100 * (level + 1) ** 2,
  }
}
