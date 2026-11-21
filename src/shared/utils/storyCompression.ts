/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION ENGINE — LOT® AI
 *
 * Pure, deterministic compression of a user's Log stream into a
 * time-scoped digest (DAY / WEEK / MONTH / YEAR). The digest is the
 * "compressed story" that feeds the loop:
 *
 *   LOT User data → Story Compression (this file) → Quantum Intent
 *   Engine prompt → AI vendor processor (Together AI) → generated_story
 *   log stored back into LOT personalized data.
 *
 * No I/O, no stores, no DOM. Shared by server (/api/story) and client
 * (scope parsing + terminal rendering). If the AI vendor is down the
 * digest alone is still a meaningful story — the machine never goes
 * silent on the user.
 *
 * Doctrine:
 *  - Journal entries are the 'note' event. Mood check-ins are
 *    'emotional_checkin'. Self-care answers are 'answer'/'self_care'.
 *  - Peaks are computed per calendar day (user-local via ISO date in
 *    context.date when present, otherwise UTC date of createdAt).
 *  - Spikes = days whose entry volume or valence deviates more than
 *    SPIKE_SIGMA standard deviations from the window mean. Spikes are
 *    follow-up candidates for the passive AI ("the machine asks").
 *  - Arcade XP is derived, never stored here — the same logs always
 *    produce the same XP (idempotent, auditable).
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

export const SCOPE_DAYS: Record<StoryScope, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

export const DEFAULT_STORY_SCOPE: StoryScope = 'week'

const SPIKE_SIGMA = 1.5

/** Minimal log shape — compatible with server Log model and client Log type. */
export interface StoryLogInput {
  id?: string
  event: string
  text?: string | null
  createdAt: string | Date
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export interface StoryPeak {
  date: string          // YYYY-MM-DD
  valence: number       // -2..+2 (mean of the day)
  excerpt: string       // ≤ 140 chars of that day's strongest entry
}

export interface StorySpike {
  date: string
  kind: 'volume' | 'valence-high' | 'valence-low'
  value: number
  zScore: number
}

export interface StoryArcade {
  xp: number
  rank: string
  rankIndex: number
  nextRank: string | null
  xpToNext: number
  streak: number        // consecutive active days ending at window end
}

export interface StoryDigest {
  scope: StoryScope
  windowStart: string   // ISO
  windowEnd: string     // ISO
  entryCount: number    // journal entries (note)
  wordCount: number
  checkinCount: number  // emotional check-ins
  selfCareCount: number // answers + self-care events
  activeDays: number
  windowDays: number
  moods: Record<string, number>
  dominantMood: string | null
  meanValence: number | null
  trend: 'rising' | 'falling' | 'steady' | 'unknown'
  high: StoryPeak | null
  low: StoryPeak | null
  spikes: StorySpike[]
  topWords: string[]
  context: {
    cities: string[]
    meanTemperatureC: number | null
    meanHumidity: number | null
    moonPhases: string[]
    weather: string[]
  }
  arcade: StoryArcade
}

// ---------------------------------------------------------------------------
// Scope parsing
// ---------------------------------------------------------------------------

const SCOPE_ALIASES: Record<string, StoryScope> = {
  day: 'day', today: 'day', d: 'day', daily: 'day',
  week: 'week', w: 'week', weekly: 'week', '7d': 'week',
  month: 'month', m: 'month', monthly: 'month', '30d': 'month',
  year: 'year', y: 'year', yearly: 'year', annual: 'year', '365d': 'year',
}

/**
 * Reads the scope argument following `/story` in a log entry.
 *   "/story"        → DEFAULT_STORY_SCOPE
 *   "/story month"  → 'month'
 *   "/story y"      → 'year'
 * Unknown arguments fall back to the default (never throws).
 */
export function parseStoryScope(text: string): StoryScope {
  if (!text) return DEFAULT_STORY_SCOPE
  const m = text.match(/(?:^|\s)\/story[ \t]+([a-z0-9]+)/i)
  if (!m) return DEFAULT_STORY_SCOPE
  return SCOPE_ALIASES[m[1].toLowerCase()] || DEFAULT_STORY_SCOPE
}

/** Strips the `/story [scope]` command and 📖 marker from entry text. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(?:[ \t]+(?:day|today|daily|d|week|weekly|w|7d|month|monthly|m|30d|year|yearly|annual|y|365d)\b)?/gi, '$1')
    .replace(/📖/g, '')
    .trim()
}

export function getScopeWindow(scope: StoryScope, now: Date = new Date()): { start: Date; end: Date } {
  const end = new Date(now.getTime())
  const start = new Date(now.getTime() - SCOPE_DAYS[scope] * 24 * 60 * 60 * 1000)
  return { start, end }
}

// ---------------------------------------------------------------------------
// Valence
// ---------------------------------------------------------------------------

/** Emotional check-in states → valence on a -2..+2 scale. */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2,
  hopeful: 1, content: 1, calm: 1, peaceful: 1,
  uncertain: 0,
  tired: -1, restless: -1, anxious: -1,
  exhausted: -2, overwhelmed: -2,
}

const POSITIVE_WORDS = new Set([
  'good', 'great', 'happy', 'calm', 'grateful', 'love', 'loved', 'joy', 'rested',
  'strong', 'proud', 'peace', 'peaceful', 'clear', 'light', 'energized', 'win',
  'better', 'beautiful', 'excited', 'hope', 'hopeful', 'thankful', 'focused',
])
const NEGATIVE_WORDS = new Set([
  'bad', 'sad', 'tired', 'anxious', 'angry', 'stress', 'stressed', 'lonely',
  'sick', 'pain', 'hurt', 'worried', 'worry', 'exhausted', 'overwhelmed', 'lost',
  'fear', 'afraid', 'heavy', 'worse', 'cry', 'cried', 'drained', 'insomnia',
])

/** Lexicon valence of free text, -2..+2, or null if no signal words. */
export function textValence(text: string): number | null {
  const words = tokenize(text)
  let pos = 0
  let neg = 0
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++
    else if (NEGATIVE_WORDS.has(w)) neg++
  }
  if (pos + neg === 0) return null
  return clamp(((pos - neg) / (pos + neg)) * 2, -2, 2)
}

// ---------------------------------------------------------------------------
// Arcade
// ---------------------------------------------------------------------------

/**
 * Arcade ranks — the gamified evolution of the operator. Self-care,
 * not grind: XP rewards showing up (active days) more than volume.
 */
export const ARCADE_RANKS: { name: string; xp: number }[] = [
  { name: 'INITIATE', xp: 0 },
  { name: 'OBSERVER', xp: 100 },
  { name: 'RECORDER', xp: 300 },
  { name: 'NAVIGATOR', xp: 700 },
  { name: 'ARCHIVIST', xp: 1500 },
  { name: 'CARTOGRAPHER', xp: 3000 },
  { name: 'SENTINEL', xp: 6000 },
  { name: 'ORACLE', xp: 12000 },
]

export const XP_RULES = {
  perEntry: 10,
  perHundredWords: 5,
  perCheckin: 5,
  perSelfCare: 5,
  perActiveDay: 20,
  perStreakDay: 10,
} as const

export function getArcadeRank(xp: number): Omit<StoryArcade, 'xp' | 'streak'> {
  let idx = 0
  for (let i = 0; i < ARCADE_RANKS.length; i++) {
    if (xp >= ARCADE_RANKS[i].xp) idx = i
  }
  const next = ARCADE_RANKS[idx + 1] || null
  return {
    rank: ARCADE_RANKS[idx].name,
    rankIndex: idx,
    nextRank: next ? next.name : null,
    xpToNext: next ? next.xp - xp : 0,
  }
}

// ---------------------------------------------------------------------------
// Compression
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  'the', 'and', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'is', 'it', 'i', 'my',
  'me', 'was', 'with', 'at', 'this', 'that', 'be', 'so', 'but', 'not', 'just',
  'have', 'had', 'are', 'you', 'we', 'they', 'he', 'she', 'its', "it's", "i'm",
  'im', 'am', 'do', 'did', 'or', 'as', 'from', 'by', 'all', 'about', 'what',
  'today', 'then', 'there', 'been', 'will', 'would', 'can', 'very', 'more',
  'some', 'out', 'up', 'get', 'got', 'like', 'one', 'also', 'now', 'our', 'your',
])

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\/[a-z]+/g, ' ') // drop slash commands
    .split(/[^a-z'À-ɏЀ-ӿ]+/)
    .filter(Boolean)
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function round(n: number, digits = 2): number {
  const f = Math.pow(10, digits)
  return Math.round(n * f) / f
}

function dayKey(log: StoryLogInput): string {
  const ctxDate = log.context?.date
  if (typeof ctxDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(ctxDate)) {
    return ctxDate.slice(0, 10)
  }
  return new Date(log.createdAt).toISOString().slice(0, 10)
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length)
}

const JOURNAL_EVENTS = new Set(['note'])
const CHECKIN_EVENTS = new Set(['emotional_checkin'])
const SELF_CARE_EVENTS = new Set(['answer', 'self_care', 'memory_answer', 'self_care_checkin', 'energy_checkin'])

function toCelsius(t: number): number {
  // LOT context stores Kelvin from the weather provider; tolerate C/F too.
  if (t > 200) return t - 273.15
  if (t > 60) return ((t - 32) * 5) / 9
  return t
}

/**
 * Compresses a log stream into a StoryDigest for the given scope.
 * Logs outside the window are ignored, so the caller may pass a
 * superset. Generated stories (event 'generated_story') are excluded
 * to prevent the loop from feeding on its own output.
 */
export function compressLogs(
  logs: StoryLogInput[],
  scope: StoryScope,
  now: Date = new Date()
): StoryDigest {
  const { start, end } = getScopeWindow(scope, now)
  const inWindow = logs.filter(l => {
    const t = new Date(l.createdAt).getTime()
    return t >= start.getTime() && t <= end.getTime() && l.event !== 'generated_story'
  })

  const journal = inWindow.filter(l => JOURNAL_EVENTS.has(l.event) && (l.text || '').trim())
  const checkins = inWindow.filter(l => CHECKIN_EVENTS.has(l.event))
  const selfCare = inWindow.filter(l => SELF_CARE_EVENTS.has(l.event))

  // Moods
  const moods: Record<string, number> = {}
  for (const c of checkins) {
    const s = String(c.metadata?.emotionalState || '').toLowerCase()
    if (s) moods[s] = (moods[s] || 0) + 1
  }
  const dominantMood =
    Object.entries(moods).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || null

  // Per-day aggregation
  type Day = { count: number; valences: number[]; best: { text: string; v: number } | null; worst: { text: string; v: number } | null }
  const days = new Map<string, Day>()
  const getDay = (k: string): Day => {
    let d = days.get(k)
    if (!d) { d = { count: 0, valences: [], best: null, worst: null }; days.set(k, d) }
    return d
  }

  let wordCount = 0
  const freq = new Map<string, number>()
  for (const l of journal) {
    const text = (l.text || '').trim()
    const tokens = tokenize(text)
    wordCount += tokens.length
    for (const w of tokens) {
      if (w.length < 4 || STOPWORDS.has(w)) continue
      freq.set(w, (freq.get(w) || 0) + 1)
    }
    const d = getDay(dayKey(l))
    d.count++
    const v = textValence(text)
    const excerpt = text.replace(/\s+/g, ' ').slice(0, 140)
    if (v !== null) {
      d.valences.push(v)
      if (!d.best || v > d.best.v) d.best = { text: excerpt, v }
      if (!d.worst || v < d.worst.v) d.worst = { text: excerpt, v }
    } else if (!d.best) {
      d.best = { text: excerpt, v: 0 }
      d.worst = { text: excerpt, v: 0 }
    }
  }
  for (const c of checkins) {
    const v = MOOD_VALENCE[String(c.metadata?.emotionalState || '').toLowerCase()]
    if (v === undefined) continue
    const d = getDay(dayKey(c))
    d.valences.push(v)
  }
  for (const s of selfCare) getDay(dayKey(s))

  const dayKeys = Array.from(days.keys()).sort()
  const dayValence = dayKeys
    .map(k => ({ k, d: days.get(k)!, v: days.get(k)!.valences.length ? mean(days.get(k)!.valences) : null }))

  const scored = dayValence.filter(x => x.v !== null) as { k: string; d: Day; v: number }[]
  const allValences = scored.map(x => x.v)
  const meanValence = allValences.length ? round(mean(allValences)) : null

  let high: StoryPeak | null = null
  let low: StoryPeak | null = null
  if (scored.length) {
    const hi = scored.reduce((a, b) => (b.v > a.v ? b : a))
    const lo = scored.reduce((a, b) => (b.v < a.v ? b : a))
    high = { date: hi.k, valence: round(hi.v), excerpt: hi.d.best?.text || '' }
    if (lo.k !== hi.k || scored.length === 1) {
      low = { date: lo.k, valence: round(lo.v), excerpt: lo.d.worst?.text || '' }
    }
    if (scored.length === 1) {
      // Single scored day: it's only a high if positive, only a low if negative.
      if (hi.v < 0) high = null
      if (lo.v >= 0) low = null
    }
  }

  // Trend: compare first half vs second half of scored days
  let trend: StoryDigest['trend'] = 'unknown'
  if (scored.length >= 2) {
    const mid = Math.floor(scored.length / 2)
    const a = mean(scored.slice(0, mid).map(x => x.v))
    const b = mean(scored.slice(mid).map(x => x.v))
    const delta = b - a
    trend = delta > 0.3 ? 'rising' : delta < -0.3 ? 'falling' : 'steady'
  }

  // Spikes (pattern change detection)
  const spikes: StorySpike[] = []
  const counts = dayValence.map(x => x.d.count)
  if (counts.length >= 3) {
    const m = mean(counts)
    const sd = stdev(counts)
    if (sd > 0) {
      dayValence.forEach(x => {
        const z = (x.d.count - m) / sd
        if (z >= SPIKE_SIGMA) spikes.push({ date: x.k, kind: 'volume', value: x.d.count, zScore: round(z) })
      })
    }
  }
  if (allValences.length >= 3) {
    const m = mean(allValences)
    const sd = stdev(allValences)
    if (sd > 0) {
      scored.forEach(x => {
        const z = (x.v - m) / sd
        if (z >= SPIKE_SIGMA) spikes.push({ date: x.k, kind: 'valence-high', value: round(x.v), zScore: round(z) })
        if (z <= -SPIKE_SIGMA) spikes.push({ date: x.k, kind: 'valence-low', value: round(x.v), zScore: round(z) })
      })
    }
  }
  spikes.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))

  // Context (environment snapshot aggregation)
  const cities = new Map<string, number>()
  const moon = new Set<string>()
  const weather = new Map<string, number>()
  const temps: number[] = []
  const hums: number[] = []
  for (const l of inWindow) {
    const c = l.context || {}
    if (c.city) cities.set(c.city, (cities.get(c.city) || 0) + 1)
    if (c.astroMoonPhase) moon.add(String(c.astroMoonPhase))
    if (c.weatherDescription) {
      const w = String(c.weatherDescription).toLowerCase()
      weather.set(w, (weather.get(w) || 0) + 1)
    }
    if (typeof c.temperature === 'number') temps.push(toCelsius(c.temperature))
    if (typeof c.humidity === 'number') hums.push(c.humidity)
  }
  const byCount = (m: Map<string, number>) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(e => e[0])

  // Arcade — streak ends at the most recent active day ≤ window end
  const activeSet = new Set(dayKeys)
  let streak = 0
  const cursor = new Date(end.getTime())
  for (let i = 0; i < SCOPE_DAYS[scope] + 1; i++) {
    const k = cursor.toISOString().slice(0, 10)
    if (activeSet.has(k)) streak++
    else if (i > 0) break // allow today to be empty without breaking yesterday's streak
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  const xp =
    journal.length * XP_RULES.perEntry +
    Math.floor(wordCount / 100) * XP_RULES.perHundredWords +
    checkins.length * XP_RULES.perCheckin +
    selfCare.length * XP_RULES.perSelfCare +
    activeSet.size * XP_RULES.perActiveDay +
    streak * XP_RULES.perStreakDay

  return {
    scope,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    entryCount: journal.length,
    wordCount,
    checkinCount: checkins.length,
    selfCareCount: selfCare.length,
    activeDays: activeSet.size,
    windowDays: SCOPE_DAYS[scope],
    moods,
    dominantMood,
    meanValence,
    trend,
    high,
    low,
    spikes: spikes.slice(0, 5),
    topWords: Array.from(freq.entries())
      .filter(e => e[1] >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(e => e[0]),
    context: {
      cities: byCount(cities).slice(0, 3),
      meanTemperatureC: temps.length ? round(mean(temps), 1) : null,
      meanHumidity: hums.length ? Math.round(mean(hums)) : null,
      moonPhases: Array.from(moon).slice(0, 4),
      weather: byCount(weather).slice(0, 3),
    },
    arcade: { xp, streak, ...getArcadeRank(xp) },
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function pad(label: string): string {
  return (label + '                ').slice(0, 16)
}

function valenceLabel(v: number | null): string {
  if (v === null) return 'NO SIGNAL'
  const sign = v > 0 ? '+' : ''
  const word = v >= 1 ? 'HIGH' : v > 0.2 ? 'LIFTED' : v >= -0.2 ? 'NEUTRAL' : v > -1 ? 'LOW' : 'HEAVY'
  return `${sign}${v.toFixed(2)} ${word}`
}

/** Terminal Grid rendering of a digest (one line per field). */
export function formatDigest(d: StoryDigest): string[] {
  const lines: string[] = [
    `${pad('STORY')}${d.scope.toUpperCase()} · ${d.windowStart.slice(0, 10)} → ${d.windowEnd.slice(0, 10)}`,
    `${pad('ENTRIES')}${d.entryCount} · ${d.wordCount} WORDS`,
    `${pad('ACTIVE DAYS')}${d.activeDays}/${d.windowDays}`,
    `${pad('CHECK-INS')}${d.checkinCount} MOOD · ${d.selfCareCount} SELF-CARE`,
    `${pad('VALENCE')}${valenceLabel(d.meanValence)} · ${d.trend.toUpperCase()}`,
  ]
  if (d.dominantMood) lines.push(`${pad('DOMINANT MOOD')}${d.dominantMood.toUpperCase()}`)
  if (d.high) lines.push(`${pad('HIGH PEAK')}${d.high.date} ${valenceLabel(d.high.valence)}`)
  if (d.low) lines.push(`${pad('LOW PEAK')}${d.low.date} ${valenceLabel(d.low.valence)}`)
  if (d.spikes.length) {
    lines.push(`${pad('SPIKES')}${d.spikes.map(s => `${s.date.slice(5)} ${s.kind.toUpperCase()}`).join(' · ')}`)
  }
  if (d.topWords.length) lines.push(`${pad('THREADS')}${d.topWords.slice(0, 5).join(' · ').toUpperCase()}`)
  const env: string[] = []
  if (d.context.cities.length) env.push(d.context.cities[0].toUpperCase())
  if (d.context.meanTemperatureC !== null) env.push(`${Math.round(d.context.meanTemperatureC)}°C`)
  if (d.context.meanHumidity !== null) env.push(`${d.context.meanHumidity}%`)
  if (env.length) lines.push(`${pad('ENVIRONMENT')}${env.join(' · ')}`)
  if (d.context.moonPhases.length) lines.push(`${pad('MOON')}${d.context.moonPhases.join(' · ').toUpperCase()}`)
  lines.push(
    `${pad('ARCADE')}${d.arcade.rank} · ${d.arcade.xp} XP` +
      (d.arcade.nextRank ? ` · ${d.arcade.xpToNext} → ${d.arcade.nextRank}` : ' · MAX RANK')
  )
  lines.push(`${pad('STREAK')}${d.arcade.streak} DAY${d.arcade.streak === 1 ? '' : 'S'}`)
  return lines
}

/**
 * Deterministic second-person narrative from a digest. Used as the
 * vendor-down fallback so /story always returns the user's own data,
 * never a generic placeholder.
 */
export function narrateDigest(d: StoryDigest): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[d.scope]
  if (d.entryCount === 0 && d.checkinCount === 0 && d.selfCareCount === 0) {
    return `The record for ${span} is still blank. One line is enough to begin — the machine is listening.`
  }
  const parts: string[] = []
  parts.push(
    `${span.charAt(0).toUpperCase() + span.slice(1)} you wrote ${d.entryCount} ${d.entryCount === 1 ? 'entry' : 'entries'}` +
      (d.windowDays > 1 ? ` across ${d.activeDays} of ${d.windowDays} days` : '') + '.'
  )
  if (d.dominantMood) parts.push(`The mood you named most was ${d.dominantMood}.`)
  if (d.trend === 'rising') parts.push('The line has been rising.')
  else if (d.trend === 'falling') parts.push('The line has been sinking, and that is worth noticing gently.')
  if (d.high && d.high.excerpt) parts.push(`The brightest moment came on ${d.high.date}: “${d.high.excerpt}”.`)
  if (d.low && d.low.excerpt) parts.push(`The heaviest was ${d.low.date}: “${d.low.excerpt}”.`)
  if (d.topWords.length) parts.push(`You kept returning to ${d.topWords.slice(0, 3).join(', ')}.`)
  if (d.context.cities.length) parts.push(`Most of it was lived in ${d.context.cities[0]}.`)
  parts.push(
    d.arcade.streak > 1
      ? `${d.arcade.streak} days in a row. Keep the thread unbroken.`
      : 'Tomorrow is another page.'
  )
  return parts.join(' ')
}

/** Compact data block for the AI vendor prompt (keeps tokens low). */
export function digestToPromptBlock(d: StoryDigest): string {
  return [
    `SCOPE: ${d.scope.toUpperCase()} (${d.windowStart.slice(0, 10)} to ${d.windowEnd.slice(0, 10)})`,
    `JOURNAL ENTRIES: ${d.entryCount} (${d.wordCount} words) over ${d.activeDays}/${d.windowDays} active days`,
    `MOOD CHECK-INS: ${d.checkinCount} · ${Object.entries(d.moods).map(([k, v]) => `${k}×${v}`).join(', ') || 'none'}`,
    `SELF-CARE EVENTS: ${d.selfCareCount}`,
    `MEAN VALENCE (-2..+2): ${d.meanValence ?? 'unknown'} · TREND: ${d.trend}`,
    d.high ? `HIGH PEAK ${d.high.date}: "${d.high.excerpt}"` : 'HIGH PEAK: none',
    d.low ? `LOW PEAK ${d.low.date}: "${d.low.excerpt}"` : 'LOW PEAK: none',
    `PATTERN SPIKES: ${d.spikes.map(s => `${s.date} ${s.kind} z=${s.zScore}`).join('; ') || 'none'}`,
    `RECURRING THREADS: ${d.topWords.join(', ') || 'none'}`,
    `ENVIRONMENT: ${d.context.cities.join(', ') || 'unknown'} · ${d.context.meanTemperatureC ?? '?'}°C · ${d.context.meanHumidity ?? '?'}% humidity · weather: ${d.context.weather.join(', ') || 'unknown'} · moon: ${d.context.moonPhases.join(', ') || 'unknown'}`,
    `ARCADE: rank ${d.arcade.rank}, ${d.arcade.xp} XP, ${d.arcade.streak}-day streak`,
  ].join('\n')
}
