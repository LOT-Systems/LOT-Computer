/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMPRESSION ENGINE (LCE) — v1
 *
 * Pure, deterministic compression of a user's Log (journal) entries and
 * their context snapshots into a "compression packet" for a period
 * (day / week / month / year). The packet is:
 *
 *   1. the structured input the Quantum Intent Engine hands to the AI
 *      vendor (Together AI) when the user types `/story [period]`;
 *   2. the offline fallback — `renderPacketStory()` produces a readable
 *      compressed story with zero AI calls, so /story never goes blank;
 *   3. the source of the Arcade layer (XP, level, rank, streak).
 *
 * No DB, no DOM, no network. Safe to import from client and server.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Minimal log shape — matches the Log model rows the server holds. */
export interface CompressibleLog {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: {
    temperature?: number | null
    humidity?: number | null
    weatherDescription?: string | null
    city?: string | null
    country?: string | null
    timeZone?: string | null
    astroMoonPhase?: string | null
    astroWesternZodiac?: string | null
    [key: string]: any
  } | null
  metadata?: Record<string, any> | null
}

export interface Peak {
  kind: 'high' | 'low'
  date: string // YYYY-MM-DD
  score: number
  excerpt: string
  city: string | null
  weather: string | null
}

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  xpIntoLevel: number
  xpForNextLevel: number
  streakDays: number
}

export interface CompressionPacket {
  period: StoryPeriod
  since: string // ISO
  until: string // ISO
  entries: number
  words: number
  activeDays: number
  spanDays: number
  coverage: number // activeDays / spanDays, 0..1
  dominantWindow: string | null // e.g. 'MORNING'
  windows: Record<string, number>
  cities: string[]
  weather: string[]
  moonPhases: string[]
  moods: Record<string, number>
  sentiment: number // mean, -1..1
  peaks: Peak[]
  pattern: {
    signal: 'SPIKE' | 'DROP' | 'STEADY' | 'INSUFFICIENT'
    ratio: number | null // current daily rate / baseline daily rate
  }
  excerpts: string[]
  arcade: ArcadeState
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse the argument after `/story`. Accepts full words, short forms and
 * `today`. Anything unrecognized falls back to `week` — the default
 * compression window.
 */
export function parseStoryPeriod(text: string | null | undefined): StoryPeriod {
  const m = (text || '').toLowerCase().match(/\/story\s+([a-z]+)/)
  const arg = m ? m[1] : ''
  if (['day', 'd', 'today', 'daily'].includes(arg)) return 'day'
  if (['week', 'w', 'weekly'].includes(arg)) return 'week'
  if (['month', 'm', 'monthly'].includes(arg)) return 'month'
  if (['year', 'y', 'yearly', 'annual'].includes(arg)) return 'year'
  return 'week'
}

// ---------------------------------------------------------------------------
// Sentiment — lexicon based, intentionally tiny and explainable
// ---------------------------------------------------------------------------

const POSITIVE = [
  'good', 'great', 'calm', 'happy', 'grateful', 'love', 'rested', 'clear',
  'strong', 'energized', 'energy', 'peace', 'peaceful', 'joy', 'proud',
  'focused', 'hopeful', 'fulfilled', 'better', 'beautiful', 'light', 'win',
  'walked', 'slept', 'thank', 'thanks', 'smile', 'fresh', 'done',
]
const NEGATIVE = [
  'bad', 'tired', 'anxious', 'anxiety', 'sad', 'angry', 'stress', 'stressed',
  'exhausted', 'sick', 'pain', 'lonely', 'lost', 'worried', 'worry', 'fear',
  'hard', 'heavy', 'cant', "can't", 'insomnia', 'overwhelmed', 'burnout',
  'cry', 'cried', 'hurt', 'empty', 'numb', 'worse', 'fail', 'failed',
]

/** Returns a score in [-1, 1]. 0 means neutral or no signal. */
export function scoreSentiment(text: string): number {
  const words = (text || '').toLowerCase().match(/[a-z']+/g) || []
  if (!words.length) return 0
  let pos = 0
  let neg = 0
  for (const w of words) {
    if (POSITIVE.includes(w)) pos++
    else if (NEGATIVE.includes(w)) neg++
  }
  if (pos + neg === 0) return 0
  return (pos - neg) / (pos + neg)
}

// ---------------------------------------------------------------------------
// Arcade — gamified evolution. Self-care first: XP rewards showing up,
// never volume for its own sake (word XP is capped per entry).
// ---------------------------------------------------------------------------

export const ARCADE_RANKS = [
  'INITIATE',   // L1
  'OBSERVER',   // L2
  'SCRIBE',     // L3
  'NAVIGATOR',  // L4
  'OPERATOR',   // L5
  'SENTINEL',   // L6
  'ARCHIVIST',  // L7
  'CARTOGRAPHER', // L8
  'ORACLE',     // L9
  'ARCHITECT',  // L10+
]

/** XP needed to go from `level` to `level + 1`. Gentle quadratic curve. */
export function xpForLevel(level: number): number {
  return 50 + (level - 1) * 25
}

export function entryXp(text: string): number {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length
  if (!words) return 0
  // 10 for showing up + 1 per 10 words, capped at +10
  return 10 + Math.min(10, Math.floor(words / 10))
}

export function computeArcade(totalXp: number, streakDays: number): ArcadeState {
  let level = 1
  let remaining = Math.max(0, Math.floor(totalXp))
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  return {
    xp: Math.max(0, Math.floor(totalXp)),
    level,
    rank: ARCADE_RANKS[Math.min(level, ARCADE_RANKS.length) - 1],
    xpIntoLevel: remaining,
    xpForNextLevel: xpForLevel(level),
    streakDays,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip machine-appended blocks (📖 story, 🕯️ scripture) and slash commands. */
export function cleanEntryText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .split(/\n{2,}/)
    .filter(p => !/^\s*(📖|🕯️|🕯)/.test(p))
    .join('\n\n')
    .replace(/(^|\s)\/[a-z][a-z-]*(\s+(day|week|month|year|d|w|m|y|today))?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function dayKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function windowOf(d: Date, timeZone?: string | null): string {
  let hour = d.getUTCHours()
  if (timeZone) {
    try {
      hour = Number(
        new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone }).format(d)
      ) % 24
    } catch {
      /* invalid tz — keep UTC */
    }
  }
  if (hour < 5) return 'NIGHT'
  if (hour < 12) return 'MORNING'
  if (hour < 17) return 'AFTERNOON'
  if (hour < 21) return 'EVENING'
  return 'NIGHT'
}

function bump(map: Record<string, number>, key: string | null | undefined) {
  if (!key) return
  map[key] = (map[key] || 0) + 1
}

function topKeys(map: Record<string, number>, n: number): string[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

/** Consecutive days with ≥1 journal entry, ending today or yesterday. */
export function computeStreak(dayKeys: Set<string>, now: Date): number {
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (!dayKeys.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  let streak = 0
  while (dayKeys.has(dayKey(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

const JOURNAL_EVENTS = ['note', 'journal', 'log_entry']

/** Lifetime Arcade state from journal history. Streak adds 5 XP per day. */
export function computeArcadeFromLogs(logs: CompressibleLog[], now: Date = new Date()): ArcadeState {
  const days = new Set<string>()
  let xp = 0
  for (const l of logs) {
    if (!JOURNAL_EVENTS.includes(l.event)) continue
    const at = new Date(l.createdAt)
    const clean = cleanEntryText(l.text)
    if (!clean || isNaN(at.getTime())) continue
    days.add(dayKey(at))
    xp += entryXp(clean)
  }
  const streak = computeStreak(days, now)
  return computeArcade(xp + streak * 5, streak)
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Compress `logs` (any order, any events) into a packet for `period`
 * ending at `now`. The baseline for pattern detection is the equal-length
 * window immediately preceding the period, so it should be supplied in
 * `logs` too (callers fetch 2× the period).
 */
export function compressLogs(
  logs: CompressibleLog[],
  period: StoryPeriod,
  now: Date = new Date(),
  opts: { arcadeLogs?: CompressibleLog[] } = {}
): CompressionPacket {
  const spanDays = PERIOD_DAYS[period]
  const until = now
  const since = new Date(now.getTime() - spanDays * 86400000)
  const baselineSince = new Date(since.getTime() - spanDays * 86400000)

  const journal = logs
    .filter(l => JOURNAL_EVENTS.includes(l.event))
    .map(l => ({ ...l, at: new Date(l.createdAt), clean: cleanEntryText(l.text) }))
    .filter(l => l.clean.length > 0 && !isNaN(l.at.getTime()))

  const inPeriod = journal.filter(l => l.at >= since && l.at <= until)
  const inBaseline = journal.filter(l => l.at >= baselineSince && l.at < since)

  const windows: Record<string, number> = {}
  const cityMap: Record<string, number> = {}
  const weatherMap: Record<string, number> = {}
  const moonMap: Record<string, number> = {}
  const days = new Set<string>()
  let words = 0
  let sentimentSum = 0

  const scored: Array<{ l: (typeof inPeriod)[number]; s: number }> = []
  for (const l of inPeriod) {
    const tz = l.context?.timeZone || null
    bump(windows, windowOf(l.at, tz))
    bump(cityMap, l.context?.city || null)
    bump(weatherMap, (l.context?.weatherDescription || '').toLowerCase() || null)
    bump(moonMap, l.context?.astroMoonPhase || null)
    days.add(dayKey(l.at))
    words += l.clean.split(/\s+/).filter(Boolean).length
    const s = scoreSentiment(l.clean)
    sentimentSum += s
    scored.push({ l, s })
  }

  // Moods from emotional check-ins in the period
  const moods: Record<string, number> = {}
  for (const l of logs) {
    if (l.event !== 'emotional_checkin') continue
    const at = new Date(l.createdAt)
    if (at < since || at > until) continue
    bump(moods, String(l.metadata?.emotionalState || '').toUpperCase() || null)
  }

  // Peaks: strongest high and strongest low, only if signal is non-zero
  const peaks: Peak[] = []
  const toPeak = (kind: 'high' | 'low', x: { l: any; s: number }): Peak => ({
    kind,
    date: dayKey(x.l.at),
    score: Math.round(x.s * 100) / 100,
    excerpt: x.l.clean.slice(0, 140),
    city: x.l.context?.city || null,
    weather: x.l.context?.weatherDescription || null,
  })
  const sorted = [...scored].sort((a, b) => b.s - a.s)
  if (sorted.length && sorted[0].s > 0) peaks.push(toPeak('high', sorted[0]))
  const lowest = sorted[sorted.length - 1]
  if (lowest && lowest.s < 0) peaks.push(toPeak('low', lowest))

  // Pattern change: current vs baseline entry rate
  let pattern: CompressionPacket['pattern'] = { signal: 'INSUFFICIENT', ratio: null }
  if (inBaseline.length >= 3 || inPeriod.length >= 3) {
    const cur = inPeriod.length / spanDays
    const base = inBaseline.length / spanDays
    const ratio = base === 0 ? null : Math.round((cur / base) * 100) / 100
    const signal =
      base === 0 ? (cur > 0 ? 'SPIKE' : 'STEADY') :
      cur / base >= 1.5 ? 'SPIKE' :
      cur / base <= 0.5 ? 'DROP' : 'STEADY'
    pattern = { signal, ratio }
  }

  // Arcade: lifetime XP. Callers pass the full journal history as
  // `opts.arcadeLogs`; otherwise XP is computed over `logs`.
  const arcade = computeArcadeFromLogs(opts.arcadeLogs || logs, now)

  // Excerpts: newest first, bounded, for the AI prompt
  const excerpts = [...inPeriod]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, period === 'day' ? 8 : 12)
    .map(l => l.clean.slice(0, 220))

  const activeDays = days.size
  return {
    period,
    since: since.toISOString(),
    until: until.toISOString(),
    entries: inPeriod.length,
    words,
    activeDays,
    spanDays,
    coverage: Math.round((activeDays / spanDays) * 100) / 100,
    dominantWindow: topKeys(windows, 1)[0] || null,
    windows,
    cities: topKeys(cityMap, 3),
    weather: topKeys(weatherMap, 3),
    moonPhases: topKeys(moonMap, 2),
    moods,
    sentiment: inPeriod.length ? Math.round((sentimentSum / inPeriod.length) * 100) / 100 : 0,
    peaks,
    pattern,
    excerpts,
    arcade,
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const PERIOD_LABEL: Record<StoryPeriod, string> = {
  day: 'TODAY',
  week: 'THIS WEEK',
  month: 'THIS MONTH',
  year: 'THIS YEAR',
}

/** Terminal-grid header shown above the story in the Log. */
export function renderPacketHeader(p: CompressionPacket): string[] {
  const pad = (k: string) => k.padEnd(16, ' ')
  const lines = [
    `${pad('COMPRESSION')}${p.period.toUpperCase()} · ${p.entries} ENTRIES · ${p.activeDays}/${p.spanDays} DAYS`,
  ]
  if (p.dominantWindow) lines.push(`${pad('WINDOW')}${p.dominantWindow}`)
  if (p.cities.length) lines.push(`${pad('PLACE')}${p.cities.join(' · ').toUpperCase()}`)
  if (p.weather.length) lines.push(`${pad('SKY')}${p.weather.join(' · ').toUpperCase()}`)
  if (p.pattern.signal !== 'INSUFFICIENT') {
    lines.push(
      `${pad('PATTERN')}${p.pattern.signal}${p.pattern.ratio !== null ? ` ×${p.pattern.ratio}` : ''}`
    )
  }
  lines.push(
    `${pad('ARCADE')}L${p.arcade.level} ${p.arcade.rank} · ${p.arcade.xpIntoLevel}/${p.arcade.xpForNextLevel} XP · STREAK ${p.arcade.streakDays}D`
  )
  return lines
}

/** Deterministic story — used when the AI vendor is unavailable. */
export function renderPacketStory(p: CompressionPacket): string {
  if (p.entries === 0) {
    return `${PERIOD_LABEL[p.period].charAt(0) + PERIOD_LABEL[p.period].slice(1).toLowerCase()} is still unwritten. The machine is listening; one line is enough to begin.`
  }
  const parts: string[] = []
  const where = p.cities.length ? ` from ${p.cities.join(', ')}` : ''
  parts.push(
    `You wrote ${p.entries} ${p.entries === 1 ? 'entry' : 'entries'} across ${p.activeDays} ${p.activeDays === 1 ? 'day' : 'days'}${where}, mostly in the ${(p.dominantWindow || 'day').toLowerCase()}.`
  )
  if (p.weather.length) parts.push(`The sky ran ${p.weather.join(', then ')}.`)
  const high = p.peaks.find(x => x.kind === 'high')
  const low = p.peaks.find(x => x.kind === 'low')
  if (high) parts.push(`A high point on ${high.date}: "${high.excerpt}".`)
  if (low) parts.push(`A heavier moment on ${low.date}: "${low.excerpt}".`)
  if (p.pattern.signal === 'SPIKE') parts.push('You have been writing more than before — something is asking to be said.')
  if (p.pattern.signal === 'DROP') parts.push('You have been writing less than before. Quiet is also data.')
  parts.push('The record holds. Keep the loop small and honest.')
  return parts.join(' ')
}

/** Data block handed to the AI vendor. Bounded and free of identifiers. */
export function renderPacketPrompt(p: CompressionPacket): string {
  const moods = Object.entries(p.moods).map(([k, v]) => `${k}×${v}`).join(', ')
  return [
    `PERIOD: ${p.period.toUpperCase()} (${p.since.slice(0, 10)} → ${p.until.slice(0, 10)})`,
    `ENTRIES: ${p.entries} · WORDS: ${p.words} · ACTIVE DAYS: ${p.activeDays}/${p.spanDays}`,
    `DOMINANT WINDOW: ${p.dominantWindow || 'n/a'}`,
    `PLACES: ${p.cities.join(', ') || 'n/a'}`,
    `WEATHER: ${p.weather.join(', ') || 'n/a'}`,
    `MOON: ${p.moonPhases.join(', ') || 'n/a'}`,
    `MOODS: ${moods || 'n/a'}`,
    `SENTIMENT MEAN: ${p.sentiment}`,
    `PATTERN: ${p.pattern.signal}${p.pattern.ratio !== null ? ` (rate ×${p.pattern.ratio} vs previous ${p.period})` : ''}`,
    `PEAKS:`,
    ...(p.peaks.length
      ? p.peaks.map(x => `- ${x.kind.toUpperCase()} ${x.date}${x.city ? ` @ ${x.city}` : ''}${x.weather ? `, ${x.weather}` : ''}: "${x.excerpt}"`)
      : ['- none detected']),
    `ENTRIES (newest first):`,
    ...(p.excerpts.length ? p.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ].join('\n')
}
