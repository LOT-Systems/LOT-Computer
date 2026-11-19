/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Story Compression Engine (SCE) — v1
 *
 * Pure, deterministic compression of a user's Log (Journal) + check-in
 * stream into a "Story Packet" for a horizon: day / week / month / year.
 *
 *   LOT User data → [SCE packet] → Quantum Intent Engine → Together AI → stored story
 *
 * The packet is the ONLY thing sent to the AI vendor (plus up to five
 * clipped entry excerpts). It is also rendered verbatim as the LEDGER
 * block in the Log and used to build an offline narrative when the
 * vendor is unavailable — the story never fails empty.
 *
 * Rules:
 *  - No I/O, no stores, no Date.now() inside helpers (pass `now`).
 *  - Same input → same output. Safe on server and client.
 */

export type StoryHorizon = 'day' | 'week' | 'month' | 'year'

export const STORY_HORIZONS: StoryHorizon[] = ['day', 'week', 'month', 'year']

const HORIZON_MS: Record<StoryHorizon, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

const HORIZON_ALIASES: Record<string, StoryHorizon> = {
  d: 'day', day: 'day', today: 'day', '24h': 'day', '1d': 'day',
  w: 'week', week: 'week', '7d': 'week', weekly: 'week',
  m: 'month', month: 'month', '30d': 'month', monthly: 'month',
  y: 'year', year: 'year', '365d': 'year', yearly: 'year',
}

/** Journal event names. `note` is the canonical Log entry event. */
export const JOURNAL_EVENTS = ['note', 'journal', 'log_entry']
export const CHECKIN_EVENTS = ['emotional_checkin']
export const STORY_EVENT = 'generated_story'

export interface StoryLogInput {
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

/**
 * Parses "/story", "/story week", "/story m", "📖 year" …
 * Returns the horizon (default: week) and the text with the command removed.
 */
export function parseStoryCommand(text: string): { horizon: StoryHorizon; residual: string } {
  const src = text || ''
  const m = src.match(/(?:\/story|📖)[ \t]*([a-z0-9]+)?/i)
  let horizon: StoryHorizon = 'week'
  let residual = src
  if (m) {
    const arg = (m[1] || '').toLowerCase()
    const mapped = HORIZON_ALIASES[arg]
    if (mapped) {
      horizon = mapped
      residual = src.replace(m[0], '')
    } else {
      residual = src.replace(/\/story|📖/i, '')
    }
  }
  return { horizon, residual: residual.replace(/📖/g, '').trim() }
}

export function isStoryHorizon(v: unknown): v is StoryHorizon {
  return typeof v === 'string' && (STORY_HORIZONS as string[]).includes(v)
}

// ─── Valence lexicon ───────────────────────────────────────────────────
// Emotional check-in states → valence in [-2, +2].
const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2, joyful: 2,
  hopeful: 1, calm: 1, content: 1, peaceful: 1, focused: 1,
  uncertain: -1, tired: -1, restless: -1, anxious: -1.5,
  overwhelmed: -2, exhausted: -2, sad: -1.5, lonely: -1.5,
}

// Minimal text lexicon — deliberately small, transparent and auditable.
const POS_WORDS = [
  'grateful', 'thankful', 'happy', 'joy', 'love', 'calm', 'peace', 'rested',
  'strong', 'clear', 'proud', 'good', 'great', 'beautiful', 'light', 'energy',
  'walk', 'sun', 'win', 'progress', 'finished', 'done', 'slept well', 'laugh',
]
const NEG_WORDS = [
  'tired', 'exhausted', 'anxious', 'anxiety', 'stress', 'sad', 'angry', 'lost',
  'alone', 'lonely', 'pain', 'sick', 'worried', 'fear', 'bad', 'hard', 'heavy',
  'overwhelmed', 'insomnia', 'cry', 'fail', 'stuck', 'burnout', 'headache',
]

export function textValence(text: string): number {
  const t = (text || '').toLowerCase()
  if (!t) return 0
  let score = 0
  for (const w of POS_WORDS) if (t.includes(w)) score += 1
  for (const w of NEG_WORDS) if (t.includes(w)) score -= 1
  return Math.max(-3, Math.min(3, score))
}

// ─── Packet ────────────────────────────────────────────────────────────

export interface StoryPeak {
  kind: 'high' | 'low'
  at: string // ISO
  source: 'journal' | 'checkin'
  valence: number
  excerpt: string
  context: string // "Berlin · 12°C · Waxing Gibbous"
}

export type PatternShift = 'new' | 'surge' | 'drop' | 'steady' | 'silent'

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  xpIntoLevel: number
  xpForNext: number
}

export interface StoryPacket {
  horizon: StoryHorizon
  windowStart: string
  windowEnd: string
  entries: number
  words: number
  checkins: number
  activeDays: number
  spanDays: number
  prevEntries: number
  shift: PatternShift
  shiftPct: number | null
  timeOfDay: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  dominantTime: 'night' | 'morning' | 'afternoon' | 'evening' | null
  cities: string[]
  avgTempC: number | null
  avgHumidity: number | null
  weather: string | null
  moonPhase: string | null
  moods: Array<{ mood: string; count: number }>
  valence: number | null // mean, [-2, 2]
  peaks: StoryPeak[]
  excerpts: string[]
  arcade: ArcadeState
}

const RANKS = [
  'Initiate', 'Observer', 'Keeper', 'Chronicler',
  'Navigator', 'Archivist', 'Sage', 'Oracle',
]

/**
 * Arcade evolution — self-care framed. XP rewards *showing up*, never
 * intensity or volume of negative content. Level curve is quadratic
 * (100 · n²) so early levels come fast and later ones mean commitment.
 */
export function computeArcade(all: StoryLogInput[]): ArcadeState {
  const days = new Set<string>()
  let notes = 0
  let checkins = 0
  let stories = 0
  for (const l of all) {
    if (JOURNAL_EVENTS.includes(l.event) && (l.text || '').trim()) {
      notes++
      days.add(toIso(l.createdAt).slice(0, 10))
    } else if (CHECKIN_EVENTS.includes(l.event)) {
      checkins++
      days.add(toIso(l.createdAt).slice(0, 10))
    } else if (l.event === STORY_EVENT) {
      stories++
    }
  }
  const xp = notes * 10 + checkins * 5 + days.size * 15 + stories * 25
  let level = 0
  while (100 * (level + 1) * (level + 1) <= xp) level++
  const floor = 100 * level * level
  const next = 100 * (level + 1) * (level + 1)
  return {
    xp,
    level,
    rank: RANKS[Math.min(RANKS.length - 1, Math.floor(level / 2))],
    xpIntoLevel: xp - floor,
    xpForNext: next - floor,
  }
}

function toIso(d: Date | string): string {
  return (d instanceof Date ? d : new Date(d)).toISOString()
}

function localHour(l: StoryLogInput): number {
  // context.date is the user's wall clock: 'YYYY-MM-DD HH:mm:ss'
  const wall = l.context?.date
  if (typeof wall === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}/.test(wall)) {
    return parseInt(wall.slice(11, 13), 10)
  }
  return new Date(l.createdAt).getUTCHours()
}

function localDay(l: StoryLogInput): string {
  const wall = l.context?.date
  if (typeof wall === 'string' && /^\d{4}-\d{2}-\d{2}/.test(wall)) return wall.slice(0, 10)
  return toIso(l.createdAt).slice(0, 10)
}

function bucket(h: number): 'night' | 'morning' | 'afternoon' | 'evening' {
  if (h < 5) return 'night'
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 22) return 'evening'
  return 'night'
}

function top<T extends string>(items: T[], n: number): Array<{ key: T; count: number }> {
  const m = new Map<T, number>()
  for (const i of items) if (i) m.set(i, (m.get(i) || 0) + 1)
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, n)
    .map(([key, count]) => ({ key, count }))
}

function mean(xs: number[]): number | null {
  if (!xs.length) return null
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function clip(s: string, n: number): string {
  const t = (s || '').replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n - 1) + '…' : t
}

/** Strips previously generated story/prayer blocks so the AI never compresses its own output. */
export function stripGenerated(text: string): string {
  return (text || '')
    .split(/\n{2,}/)
    .filter(p => !/^\s*(📖|🕯)/.test(p))
    .join('\n\n')
    .replace(/(^|\s)\/[a-z]+(\s+(day|week|month|year|d|w|m|y))?(?=\s|$)/gi, ' ')
    .trim()
}

function contextLine(l: StoryLogInput): string {
  const c = l.context || {}
  const parts: string[] = []
  if (c.city) parts.push(String(c.city))
  if (typeof c.temperature === 'number') parts.push(`${Math.round(c.temperature - 273.15)}°C`)
  if (c.astroMoonPhase) parts.push(String(c.astroMoonPhase))
  return parts.join(' · ')
}

export function compressStory(
  logs: StoryLogInput[],
  horizon: StoryHorizon,
  now: Date,
): StoryPacket {
  const span = HORIZON_MS[horizon]
  const end = now.getTime()
  const start = end - span
  const prevStart = start - span

  const inWin = (l: StoryLogInput, a: number, b: number) => {
    const t = new Date(l.createdAt).getTime()
    return t > a && t <= b
  }

  const journal = logs
    .filter(l => JOURNAL_EVENTS.includes(l.event) && inWin(l, start, end))
    .map(l => ({ ...l, text: stripGenerated(l.text || '') }))
    .filter(l => l.text.length > 0)
  const prevJournal = logs.filter(
    l => JOURNAL_EVENTS.includes(l.event) && inWin(l, prevStart, start) && stripGenerated(l.text || ''),
  )
  const checkins = logs.filter(l => CHECKIN_EVENTS.includes(l.event) && inWin(l, start, end))
  const signal = [...journal, ...checkins]

  // Pattern shift vs previous equal window
  let shift: PatternShift
  let shiftPct: number | null = null
  if (journal.length === 0) shift = 'silent'
  else if (prevJournal.length === 0) shift = 'new'
  else {
    shiftPct = Math.round(((journal.length - prevJournal.length) / prevJournal.length) * 100)
    shift = shiftPct >= 50 ? 'surge' : shiftPct <= -50 ? 'drop' : 'steady'
  }

  const timeOfDay = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  for (const l of journal) timeOfDay[bucket(localHour(l))]++
  const tod = (Object.entries(timeOfDay) as Array<[keyof typeof timeOfDay, number]>)
    .sort((a, b) => b[1] - a[1])[0]
  const dominantTime = tod && tod[1] > 0 ? tod[0] : null

  const temps = signal
    .map(l => l.context?.temperature)
    .filter((t): t is number => typeof t === 'number')
    .map(k => k - 273.15)
  const hums = signal
    .map(l => l.context?.humidity)
    .filter((h): h is number => typeof h === 'number')

  const moodList = checkins
    .map(l => String(l.metadata?.emotionalState || '').toLowerCase())
    .filter(Boolean)

  // Valence-scored moments for peak detection
  const scored = [
    ...journal.map(l => ({ l, source: 'journal' as const, v: textValence(l.text), excerpt: l.text })),
    ...checkins.map(l => {
      const mood = String(l.metadata?.emotionalState || '').toLowerCase()
      const note = String(l.metadata?.note || '')
      return {
        l,
        source: 'checkin' as const,
        v: (MOOD_VALENCE[mood] ?? 0) + textValence(note) * 0.5,
        excerpt: [mood.toUpperCase(), note].filter(Boolean).join(' — '),
      }
    }),
  ]
  const valences = scored.map(s => Math.max(-2, Math.min(2, s.v)))

  const peaks: StoryPeak[] = []
  if (scored.length >= 2) {
    const sorted = [...scored].sort(
      (a, b) => b.v - a.v || new Date(b.l.createdAt).getTime() - new Date(a.l.createdAt).getTime(),
    )
    const hi = sorted[0]
    const lo = sorted[sorted.length - 1]
    if (hi.v > 0) {
      peaks.push({ kind: 'high', at: toIso(hi.l.createdAt), source: hi.source, valence: hi.v, excerpt: clip(hi.excerpt, 120), context: contextLine(hi.l) })
    }
    if (lo.v < 0 && lo !== hi) {
      peaks.push({ kind: 'low', at: toIso(lo.l.createdAt), source: lo.source, valence: lo.v, excerpt: clip(lo.excerpt, 120), context: contextLine(lo.l) })
    }
  }

  const v = mean(valences)
  const avgT = mean(temps)
  const avgH = mean(hums)

  return {
    horizon,
    windowStart: new Date(start).toISOString(),
    windowEnd: new Date(end).toISOString(),
    entries: journal.length,
    words: journal.reduce((a, l) => a + l.text.split(/\s+/).filter(Boolean).length, 0),
    checkins: checkins.length,
    activeDays: new Set(signal.map(localDay)).size,
    spanDays: Math.round(span / HORIZON_MS.day),
    prevEntries: prevJournal.length,
    shift,
    shiftPct,
    timeOfDay,
    dominantTime,
    cities: top(signal.map(l => String(l.context?.city || '')), 3).map(x => x.key),
    avgTempC: avgT === null ? null : Math.round(avgT),
    avgHumidity: avgH === null ? null : Math.round(avgH),
    weather: top(signal.map(l => String(l.context?.weatherDescription || '')), 1)[0]?.key || null,
    moonPhase: top(signal.map(l => String(l.context?.astroMoonPhase || '')), 1)[0]?.key || null,
    moods: top(moodList, 4).map(x => ({ mood: x.key, count: x.count })),
    valence: v === null ? null : Math.round(v * 100) / 100,
    peaks,
    excerpts: [...journal]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(l => clip(l.text, 200)),
    arcade: computeArcade(logs),
  }
}

// ─── Renderers ─────────────────────────────────────────────────────────

const H_LABEL: Record<StoryHorizon, string> = {
  day: 'DAY', week: 'WEEK', month: 'MONTH', year: 'YEAR',
}

function pad(k: string): string {
  return k.padEnd(14)
}

/** Fixed-width LEDGER block shown above the narrative in the Log. */
export function renderLedger(p: StoryPacket): string {
  const shift =
    p.shift === 'silent' ? 'SILENT'
    : p.shift === 'new' ? 'NEW SIGNAL'
    : `${p.shift.toUpperCase()} ${p.shiftPct! >= 0 ? '+' : ''}${p.shiftPct}%`
  const ctx = [
    p.cities.join(', '),
    p.avgTempC !== null ? `${p.avgTempC}°C` : '',
    p.avgHumidity !== null ? `${p.avgHumidity}%` : '',
    p.moonPhase || '',
  ].filter(Boolean).join(' · ')
  const lines = [
    `${pad('STORY')}${H_LABEL[p.horizon]} · ${p.windowStart.slice(0, 10)} → ${p.windowEnd.slice(0, 10)}`,
    `${pad('ENTRIES')}${p.entries} · ${p.words} WORDS · ${p.checkins} CHECK-INS`,
    `${pad('PRESENCE')}${p.activeDays}/${p.spanDays} DAYS`,
    `${pad('PATTERN')}${shift}`,
  ]
  if (p.dominantTime) lines.push(`${pad('HOUR')}${p.dominantTime.toUpperCase()}`)
  if (ctx) lines.push(`${pad('CONTEXT')}${ctx}`)
  if (p.moods.length) lines.push(`${pad('MOOD')}${p.moods.map(m => `${m.mood.toUpperCase()}×${m.count}`).join(' ')}`)
  for (const pk of p.peaks) {
    lines.push(`${pad(pk.kind === 'high' ? 'HIGH ▲' : 'LOW ▼')}${pk.at.slice(0, 10)} — ${pk.excerpt}`)
  }
  lines.push(`${pad('ARCADE')}LV ${p.arcade.level} ${p.arcade.rank.toUpperCase()} · ${p.arcade.xpIntoLevel}/${p.arcade.xpForNext} XP`)
  return lines.join('\n')
}

/** Data block for the AI vendor. Contains only the packet + clipped excerpts. */
export function renderPromptData(p: StoryPacket, logText: string): string {
  return [
    `HORIZON: ${p.horizon} (${p.spanDays} days)`,
    `CURRENT ENTRY: "${clip(logText || '', 300) || '(none)'}"`,
    renderLedger(p),
    '',
    'RECENT EXCERPTS:',
    ...(p.excerpts.length ? p.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ].join('\n')
}

/** Deterministic offline narrative — used when the AI vendor is down. */
export function fallbackNarrative(p: StoryPacket): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[p.horizon]
  if (p.entries === 0 && p.checkins === 0) {
    return `The record is quiet ${span}. Nothing is missing — silence is also data. When you write, the story begins again.`
  }
  const parts: string[] = []
  parts.push(
    `${span[0].toUpperCase()}${span.slice(1)} you showed up on ${p.activeDays} of ${p.spanDays} days, leaving ${p.entries} ${p.entries === 1 ? 'entry' : 'entries'}${p.dominantTime ? `, most often in the ${p.dominantTime}` : ''}.`,
  )
  if (p.cities.length) parts.push(`Most of it was written from ${p.cities[0]}${p.avgTempC !== null ? ` at around ${p.avgTempC}°C` : ''}.`)
  if (p.shift === 'surge') parts.push('You wrote noticeably more than the period before — something is asking to be said.')
  if (p.shift === 'drop') parts.push('You wrote less than the period before. That can be rest, or distance; only you know which.')
  const hi = p.peaks.find(x => x.kind === 'high')
  const lo = p.peaks.find(x => x.kind === 'low')
  if (hi) parts.push(`A high point: "${hi.excerpt}"`)
  if (lo) parts.push(`A heavier moment: "${lo.excerpt}"`)
  parts.push('The pattern is yours; the next entry continues it.')
  return parts.join(' ')
}
