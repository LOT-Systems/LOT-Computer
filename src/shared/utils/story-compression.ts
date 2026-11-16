/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION — LOT® AI narrative capsule (Log /story)
 *
 * Pure, deterministic compression of a user's log stream into a
 * "capsule": the shape of a day / week / month / year, before any AI
 * vendor sees it. The capsule is the LOT-owned layer of the pipeline:
 *
 *   LOT user data → [capsule: this module] → QIE state → Together AI → stored story
 *
 * Doctrine:
 *  - No I/O, no stores, no Date.now() inside helpers (caller passes `now`).
 *  - Works on any log-like record ({ event, text, metadata, context, createdAt }).
 *  - Every field is derivable offline, so /story still answers when the
 *    AI vendor is down (see `fallbackStory`).
 *  - Arcade XP is a self-care metric: it rewards showing up and
 *    recording, never intensity of emotion, never streak pressure.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

const SCOPE_ALIASES: Record<string, StoryScope> = {
  day: 'day', today: 'day', d: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

const SCOPE_DAYS: Record<StoryScope, number> = { day: 1, week: 7, month: 30, year: 365 }

/** Default scope when the user types a bare `/story`. */
export const DEFAULT_STORY_SCOPE: StoryScope = 'week'

/**
 * Reads the scope token right after `/story` (e.g. "/story month").
 * Unknown or missing tokens fall back to the default scope.
 */
export function parseStoryScope(text: string | null | undefined): StoryScope {
  if (!text) return DEFAULT_STORY_SCOPE
  const m = text.toLowerCase().match(/(?:^|\s)\/story(?:\s+([a-z0-9]+))?/)
  const token = m?.[1]
  return (token && SCOPE_ALIASES[token]) || DEFAULT_STORY_SCOPE
}

/** Removes the `/story [scope]` command and 📖 marker from free text. */
export function stripStoryCommand(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/(^|\s)\/story(?:\s+(?:day|today|d|24h|week|w|7d|month|m|30d|year|y|365d)\b)?/gi, '$1')
    .replace(/📖/g, '')
    .trim()
}

export function scopeStart(scope: StoryScope, now: Date): Date {
  return new Date(now.getTime() - SCOPE_DAYS[scope] * 24 * 60 * 60 * 1000)
}

// ── Inputs ────────────────────────────────────────────────────────────────

export interface StoryLogLike {
  id?: string
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: {
    temperature?: number | null // Kelvin, as stored by getLogContext
    humidity?: number | null
    city?: string | null
    weatherDescription?: string | null
    astroMoonPhase?: string | null
    astroWesternZodiac?: string | null
  } | null
}

// ── Valence ───────────────────────────────────────────────────────────────

/** Emotional check-in states → valence in [-2, +2]. */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2,
  hopeful: 1, calm: 1, peaceful: 1, content: 1,
  uncertain: -1, tired: -1, restless: -1,
  anxious: -2, overwhelmed: -2, exhausted: -2,
}

const POSITIVE_WORDS = [
  'grateful', 'thankful', 'happy', 'joy', 'love', 'calm', 'peace', 'rested',
  'proud', 'clear', 'light', 'beautiful', 'good', 'great', 'strong', 'hope',
  'progress', 'finished', 'done', 'win', 'energy', 'walk', 'sun', 'laugh',
]
const NEGATIVE_WORDS = [
  'tired', 'exhausted', 'anxious', 'anxiety', 'stress', 'stressed', 'sad',
  'angry', 'lonely', 'alone', 'overwhelmed', 'pain', 'sick', 'lost', 'stuck',
  'worried', 'fear', 'afraid', 'bad', 'hard', 'heavy', 'cry', 'insomnia', 'burnout',
]

/**
 * Lexicon valence for free journal text, clamped to [-2, +2].
 * Intentionally crude: it only ranks peaks inside one window, it never
 * labels the user. Negations ("not good") flip the next word.
 */
export function textValence(text: string | null | undefined): number {
  if (!text) return 0
  const words = text.toLowerCase().match(/[a-z']+/g) || []
  let score = 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const negated = i > 0 && /^(not|no|never|don't|didn't|isn't|wasn't)$/.test(words[i - 1])
    const sign = negated ? -1 : 1
    if (POSITIVE_WORDS.includes(w)) score += sign
    else if (NEGATIVE_WORDS.includes(w)) score -= sign
  }
  return Math.max(-2, Math.min(2, score))
}

export function logValence(log: StoryLogLike): number | null {
  if (log.event === 'emotional_checkin') {
    const state = String(log.metadata?.emotionalState || '').toLowerCase()
    return state in MOOD_VALENCE ? MOOD_VALENCE[state] : null
  }
  if (log.event === 'note' && log.text && log.text.trim().length > 0) {
    return textValence(log.text)
  }
  return null
}

// ── Arcade (self-care gamification) ──────────────────────────────────────

/**
 * XP per recorded act. Weighted toward the Journal (the passive AI
 * input) and toward answering the machine's questions. Generated
 * output (stories, AI replies) earns nothing — only the human acts.
 */
export const ARCADE_XP: Record<string, number> = {
  note: 10,
  emotional_checkin: 5,
  answer: 5, // Memory Engine answer (the machine asked first)
  self_care: 5,
  intention: 5,
  // legacy event names still present in older rows
  memory_answer: 5,
  self_care_checkin: 5,
  energy_checkin: 5,
}

/** Events that count as "answered the machine" / self-care acts. */
export const ANSWER_EVENTS = [
  'answer', 'self_care', 'intention', 'memory_answer', 'self_care_checkin', 'energy_checkin',
]

/** Arcade ranks. Thresholds are lifetime XP. */
export const ARCADE_RANKS: Array<{ minXP: number; title: string }> = [
  { minXP: 0, title: 'SIGNAL' },
  { minXP: 100, title: 'OBSERVER' },
  { minXP: 500, title: 'RECORDER' },
  { minXP: 1500, title: 'NAVIGATOR' },
  { minXP: 4000, title: 'CARTOGRAPHER' },
  { minXP: 10000, title: 'ARCHIVIST' },
  { minXP: 25000, title: 'ORACLE' },
]

export function xpForLog(log: StoryLogLike): number {
  if (log.event === 'note' && !(log.text && log.text.trim())) return 0
  return ARCADE_XP[log.event] || 0
}

export interface ArcadeStatus {
  xp: number
  level: number
  title: string
  nextTitle: string | null
  toNext: number | null
}

export function arcadeStatus(lifetimeXP: number): ArcadeStatus {
  const xp = Math.max(0, Math.floor(lifetimeXP || 0))
  let idx = 0
  for (let i = 0; i < ARCADE_RANKS.length; i++) {
    if (xp >= ARCADE_RANKS[i].minXP) idx = i
  }
  const next = ARCADE_RANKS[idx + 1] || null
  return {
    xp,
    level: idx + 1,
    title: ARCADE_RANKS[idx].title,
    nextTitle: next ? next.title : null,
    toNext: next ? next.minXP - xp : null,
  }
}

// ── Capsule ───────────────────────────────────────────────────────────────

export interface StoryPeak {
  at: string // ISO timestamp
  valence: number
  excerpt: string
  city: string | null
  weather: string | null
}

export interface StoryCapsule {
  scope: StoryScope
  from: string
  to: string
  entries: number // journal notes with text
  checkins: number
  answers: number
  words: number
  activeDays: number
  windowDays: number
  moods: Array<{ state: string; count: number }>
  valence: number | null // mean, rounded to 0.1
  shift: { direction: 'rising' | 'falling' | 'steady'; delta: number } | null
  high: StoryPeak | null
  low: StoryPeak | null
  rhythm: 'night' | 'morning' | 'afternoon' | 'evening' | null
  context: {
    avgTempC: number | null
    avgHumidity: number | null
    cities: string[]
    moon: string | null
    zodiac: string | null
  }
  arcade: { windowXP: number; status: ArcadeStatus }
}

const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d))

function mostCommon(values: Array<string | null | undefined>): string | null {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) || 0) + 1)
  let best: string | null = null
  let n = 0
  counts.forEach((c, k) => { if (c > n) { best = k; n = c } })
  return best
}

const round1 = (n: number) => Math.round(n * 10) / 10

function excerpt(text: string | null | undefined, max = 140): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

function toPeak(log: StoryLogLike, valence: number): StoryPeak {
  const ctx = log.context || {}
  const label =
    log.event === 'emotional_checkin'
      ? `[${String(log.metadata?.emotionalState || '').toUpperCase()}] ${log.metadata?.note || ''}`
      : log.text
  return {
    at: toDate(log.createdAt).toISOString(),
    valence,
    excerpt: excerpt(label),
    city: ctx.city || null,
    weather: ctx.weatherDescription || null,
  }
}

/**
 * Compresses logs in the scope window into a capsule.
 *
 * @param logs        any order; out-of-window logs are ignored
 * @param scope       day | week | month | year
 * @param now         window end (caller-supplied for determinism)
 * @param lifetimeXP  optional lifetime XP; defaults to window XP
 * @param hourOf      optional local-hour resolver (timezone aware);
 *                    defaults to the Date's own hours
 */
export function compressStory(
  logs: StoryLogLike[],
  scope: StoryScope,
  now: Date,
  lifetimeXP?: number,
  hourOf: (d: Date) => number = d => d.getHours()
): StoryCapsule {
  const start = scopeStart(scope, now)
  const inWindow = logs
    .filter(l => {
      const t = toDate(l.createdAt).getTime()
      return t >= start.getTime() && t <= now.getTime()
    })
    .sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())

  const notes = inWindow.filter(l => l.event === 'note' && l.text && l.text.trim())
  const checkins = inWindow.filter(l => l.event === 'emotional_checkin')
  const answers = inWindow.filter(l => ANSWER_EVENTS.includes(l.event))

  // Moods
  const moodCounts = new Map<string, number>()
  for (const c of checkins) {
    const s = String(c.metadata?.emotionalState || '').toLowerCase()
    if (s) moodCounts.set(s, (moodCounts.get(s) || 0) + 1)
  }
  const moods = Array.from(moodCounts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Valence series → mean, peaks, shift
  const scored: Array<{ log: StoryLogLike; v: number }> = []
  for (const l of [...notes, ...checkins]) {
    const v = logValence(l)
    if (v !== null) scored.push({ log: l, v })
  }
  scored.sort((a, b) => toDate(a.log.createdAt).getTime() - toDate(b.log.createdAt).getTime())

  const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0)
  const valence = scored.length ? round1(mean(scored.map(s => s.v))) : null

  let high: StoryPeak | null = null
  let low: StoryPeak | null = null
  if (scored.length) {
    // Latest wins ties — the most recent peak is the most actionable one.
    const hi = scored.reduce((best, s) => (s.v >= best.v ? s : best))
    const lo = scored.reduce((best, s) => (s.v <= best.v ? s : best))
    if (hi.v > 0) high = toPeak(hi.log, hi.v)
    if (lo.v < 0) low = toPeak(lo.log, lo.v)
  }

  let shift: StoryCapsule['shift'] = null
  if (scored.length >= 4) {
    const half = Math.floor(scored.length / 2)
    const delta = round1(mean(scored.slice(half).map(s => s.v)) - mean(scored.slice(0, half).map(s => s.v)))
    shift = { direction: delta >= 0.5 ? 'rising' : delta <= -0.5 ? 'falling' : 'steady', delta }
  }

  // Rhythm: when does the user write?
  const buckets = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  for (const n of notes) {
    const h = hourOf(toDate(n.createdAt))
    if (h < 5) buckets.night++
    else if (h < 12) buckets.morning++
    else if (h < 18) buckets.afternoon++
    else if (h < 22) buckets.evening++
    else buckets.night++
  }
  const rhythm = notes.length
    ? (Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0] as StoryCapsule['rhythm'])
    : null

  // Environmental context
  const temps = inWindow.map(l => l.context?.temperature).filter((t): t is number => typeof t === 'number' && t > 0)
  const hums = inWindow.map(l => l.context?.humidity).filter((h): h is number => typeof h === 'number')
  const cities: string[] = []
  for (const l of inWindow) {
    const c = l.context?.city
    if (c && !cities.includes(c)) cities.push(c)
  }

  const activeDays = new Set(inWindow.map(l => toDate(l.createdAt).toISOString().slice(0, 10))).size
  const windowXP = inWindow.reduce((s, l) => s + xpForLog(l), 0)

  return {
    scope,
    from: start.toISOString(),
    to: now.toISOString(),
    entries: notes.length,
    checkins: checkins.length,
    answers: answers.length,
    words: notes.reduce((s, n) => s + ((n.text || '').match(/\S+/g) || []).length, 0),
    activeDays,
    windowDays: SCOPE_DAYS[scope],
    moods,
    valence,
    shift,
    high,
    low,
    rhythm,
    context: {
      avgTempC: temps.length ? Math.round(mean(temps) - 273.15) : null,
      avgHumidity: hums.length ? Math.round(mean(hums)) : null,
      cities: cities.slice(0, 5),
      moon: mostCommon(inWindow.map(l => l.context?.astroMoonPhase)),
      zodiac: mostCommon(inWindow.map(l => l.context?.astroWesternZodiac)),
    },
    arcade: {
      windowXP,
      status: arcadeStatus(lifetimeXP ?? windowXP),
    },
  }
}

// ── Rendering ─────────────────────────────────────────────────────────────

const pad = (k: string) => k.padEnd(16, ' ')

/** Terminal-grid header lines shown above the story in the Log. */
export function renderCapsule(c: StoryCapsule): string[] {
  const lines = [
    `${pad('STORY')}${c.scope.toUpperCase()} · ${c.from.slice(0, 10)} → ${c.to.slice(0, 10)}`,
    `${pad('SIGNAL')}${c.entries} ENTRIES · ${c.checkins} CHECK-INS · ${c.activeDays}/${c.windowDays} DAYS`,
  ]
  if (c.moods.length) {
    lines.push(`${pad('MOOD')}${c.moods.slice(0, 3).map(m => `${m.state.toUpperCase()}×${m.count}`).join(' · ')}`)
  }
  if (c.shift) {
    const sign = c.shift.delta > 0 ? '+' : ''
    lines.push(`${pad('SHIFT')}${c.shift.direction.toUpperCase()} (${sign}${c.shift.delta})`)
  }
  const env: string[] = []
  if (c.context.avgTempC !== null) env.push(`${c.context.avgTempC}°C`)
  if (c.context.avgHumidity !== null) env.push(`${c.context.avgHumidity}%`)
  if (c.context.cities.length) env.push(c.context.cities.join(' / ').toUpperCase())
  if (env.length) lines.push(`${pad('FIELD')}${env.join(' · ')}`)
  const sky = [c.context.moon, c.context.zodiac].filter(Boolean)
  if (sky.length) lines.push(`${pad('SKY')}${sky.join(' · ').toUpperCase()}`)
  const a = c.arcade.status
  lines.push(
    `${pad('ARCADE')}+${c.arcade.windowXP} XP · LV ${a.level} ${a.title}` +
      (a.nextTitle && a.toNext !== null ? ` · ${a.toNext} → ${a.nextTitle}` : ' · MAX')
  )
  return lines
}

/** Compact data block handed to the AI vendor (no PII beyond city). */
export function capsuleToPrompt(c: StoryCapsule): string {
  const parts = [
    `WINDOW: ${c.scope} (${c.from.slice(0, 10)} to ${c.to.slice(0, 10)}), active ${c.activeDays} of ${c.windowDays} days`,
    `VOLUME: ${c.entries} journal entries (${c.words} words), ${c.checkins} mood check-ins, ${c.answers} answered questions`,
    `MOODS: ${c.moods.map(m => `${m.state} x${m.count}`).join(', ') || 'no check-ins'}`,
    `VALENCE: ${c.valence === null ? 'unknown' : c.valence} on a -2..+2 scale`,
    `SHIFT: ${c.shift ? `${c.shift.direction} (${c.shift.delta})` : 'not enough signal'}`,
    `WRITING RHYTHM: mostly ${c.rhythm || 'unknown'}`,
    `ENVIRONMENT: ${[
      c.context.avgTempC !== null ? `${c.context.avgTempC}°C avg` : null,
      c.context.avgHumidity !== null ? `${c.context.avgHumidity}% humidity` : null,
      c.context.cities.length ? `in ${c.context.cities.join(', ')}` : null,
      c.context.moon ? `moon ${c.context.moon}` : null,
      c.context.zodiac ? `sun in ${c.context.zodiac}` : null,
    ].filter(Boolean).join(', ') || 'unknown'}`,
    `HIGH PEAK: ${c.high ? `${c.high.at.slice(0, 10)} — "${c.high.excerpt}"` : 'none detected'}`,
    `LOW PEAK: ${c.low ? `${c.low.at.slice(0, 10)} — "${c.low.excerpt}"` : 'none detected'}`,
  ]
  return parts.join('\n')
}

/**
 * Deterministic story used when the AI vendor is unavailable or the
 * user is not on Usership. Second person, no motivation-speak.
 */
export function fallbackStory(c: StoryCapsule): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[c.scope]
  if (c.entries + c.checkins + c.answers === 0) {
    return `Nothing was recorded ${span}. The machine is listening. One line is enough to begin.`
  }
  const s: string[] = []
  s.push(
    `${span[0].toUpperCase()}${span.slice(1)} you showed up on ${c.activeDays} of ${c.windowDays} day${c.windowDays > 1 ? 's' : ''}, ` +
      `leaving ${c.entries} entr${c.entries === 1 ? 'y' : 'ies'} and ${c.checkins} check-in${c.checkins === 1 ? '' : 's'}.`
  )
  if (c.moods.length) s.push(`The most common state was ${c.moods[0].state}.`)
  if (c.high) s.push(`A high point: "${c.high.excerpt}"`)
  if (c.low) s.push(`A low point: "${c.low.excerpt}"`)
  if (c.shift?.direction === 'rising') s.push('The second half was lighter than the first.')
  else if (c.shift?.direction === 'falling') s.push('The second half was heavier than the first. Go gently.')
  if (c.rhythm) s.push(`You mostly write in the ${c.rhythm}.`)
  return s.join(' ')
}
