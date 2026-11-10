/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression — LOT® AI narrative loop
 *
 * Pure, dependency-free module shared by client and server.
 *
 *   LOT User data → [compressLogs] → digest → LOT Quantum Intent Engine
 *     → AI vendor processor (Together AI) → stored `generated_story` log
 *
 * The digest is the *deterministic* half of the compression: counts,
 * mood trajectory, high/low peaks, ambient context (city, weather,
 * moon) and an evenly-sampled set of journal excerpts across the whole
 * horizon. The AI vendor only turns the digest into prose; it never
 * sees the raw log table. This keeps the vendor payload small and
 * bounded regardless of how many entries the operator has written.
 */

export type StoryHorizon = 'day' | 'week' | 'month' | 'year'

export const STORY_HORIZONS: StoryHorizon[] = ['day', 'week', 'month', 'year']

export const DEFAULT_STORY_HORIZON: StoryHorizon = 'week'

const DAY_MS = 24 * 60 * 60 * 1000

export const HORIZON_MS: Record<StoryHorizon, number> = {
  day: DAY_MS,
  week: 7 * DAY_MS,
  month: 30 * DAY_MS,
  year: 365 * DAY_MS,
}

/** Target story length (words) per horizon — wider window, denser story. */
export const HORIZON_WORDS: Record<StoryHorizon, number> = {
  day: 120,
  week: 180,
  month: 240,
  year: 300,
}

/** Max journal excerpts forwarded to the AI vendor per horizon. */
export const HORIZON_SAMPLES: Record<StoryHorizon, number> = {
  day: 6,
  week: 8,
  month: 10,
  year: 12,
}

const HORIZON_ALIASES: Record<string, StoryHorizon> = {
  day: 'day', d: 'day', today: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

/**
 * Reads the horizon argument that follows `/story` in a log entry.
 * `/story`, `/story week` → week. `/story month` → month. Unknown or
 * missing args fall back to DEFAULT_STORY_HORIZON.
 */
export function parseStoryHorizon(text: string | null | undefined): StoryHorizon {
  if (!text) return DEFAULT_STORY_HORIZON
  const match = /(?:^|\s)\/story(?:\s+([a-z0-9]+))?/i.exec(text)
  const arg = match?.[1]?.toLowerCase()
  if (arg && HORIZON_ALIASES[arg]) return HORIZON_ALIASES[arg]
  return DEFAULT_STORY_HORIZON
}

/** Valence of each emotional check-in state: +1 high peak, -1 low peak. */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 1,
  excited: 1,
  fulfilled: 1,
  grateful: 1,
  hopeful: 1,
  content: 0.5,
  calm: 0.5,
  peaceful: 0.5,
  uncertain: -0.5,
  tired: -0.5,
  restless: -0.5,
  anxious: -1,
  overwhelmed: -1,
  exhausted: -1,
}

/** Minimal shape of a log row consumed by the compressor. */
export interface CompressibleLog {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: {
    city?: string | null
    temperature?: number | null
    humidity?: number | null
    weatherDescription?: string | null
    astroMoonPhase?: string | null
    [key: string]: any
  } | null
  metadata?: Record<string, any> | null
}

export interface StoryPeak {
  at: string // ISO timestamp
  mood: string
  note: string | null
}

export interface StoryDigest {
  horizon: StoryHorizon
  since: string
  until: string
  totalSignals: number
  journalEntries: number
  activeDays: number
  spanDays: number
  moodCounts: Record<string, number>
  dominantMood: string | null
  /** Mean valence of mood check-ins, -1..1, null if no check-ins. */
  moodBalance: number | null
  /** Second half of window minus first half; >0 rising, <0 falling. */
  moodDrift: number | null
  highPeak: StoryPeak | null
  lowPeak: StoryPeak | null
  selfCareCompleted: number
  selfCareSkipped: number
  topCities: string[]
  avgTemperature: number | null
  avgHumidity: number | null
  dominantSky: string | null
  dominantMoon: string | null
  longestSilenceHours: number | null
  excerpts: string[]
}

const JOURNAL_EVENTS = new Set(['log_entry', 'journal', 'note'])
const SELF_CARE_DONE = new Set(['self_care_complete', 'self_care_checkin'])
const SELF_CARE_SKIP = new Set(['self_care_skip'])

function toTime(v: Date | string): number {
  return v instanceof Date ? v.getTime() : new Date(v).getTime()
}

function topKeys(counts: Record<string, number>, n: number): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([k]) => k)
}

function bump(counts: Record<string, number>, key: string | null | undefined) {
  if (!key) return
  counts[key] = (counts[key] || 0) + 1
}

function mean(values: number[]): number | null {
  if (!values.length) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function round1(v: number | null): number | null {
  return v === null ? null : Math.round(v * 10) / 10
}

/**
 * Picks `n` items spread evenly from first to last, so a month-long
 * story samples the whole month instead of only the last few days.
 */
export function sampleEvenly<T>(items: T[], n: number): T[] {
  if (n <= 0) return []
  if (items.length <= n) return items.slice()
  if (n === 1) return [items[items.length - 1]]
  const out: T[] = []
  const step = (items.length - 1) / (n - 1)
  for (let i = 0; i < n; i++) out.push(items[Math.round(i * step)])
  return out
}

/**
 * Compresses every log inside the horizon window into a StoryDigest.
 * `logs` may arrive in any order and may include rows outside the
 * window; both are handled here.
 */
export function compressLogs(
  logs: CompressibleLog[],
  horizon: StoryHorizon,
  now: Date = new Date()
): StoryDigest {
  const until = now.getTime()
  const since = until - HORIZON_MS[horizon]

  const inWindow = logs
    .map(l => ({ log: l, t: toTime(l.createdAt) }))
    .filter(x => Number.isFinite(x.t) && x.t >= since && x.t <= until)
    .sort((a, b) => a.t - b.t)

  const moodCounts: Record<string, number> = {}
  const cityCounts: Record<string, number> = {}
  const skyCounts: Record<string, number> = {}
  const moonCounts: Record<string, number> = {}
  const days = new Set<string>()
  const temps: number[] = []
  const hums: number[] = []
  const valences: Array<{ t: number; v: number }> = []
  const journal: Array<{ t: number; text: string }> = []
  let highPeak: StoryPeak | null = null
  let lowPeak: StoryPeak | null = null
  let highV = -Infinity
  let lowV = Infinity
  let selfCareCompleted = 0
  let selfCareSkipped = 0
  let longestGapMs = 0

  inWindow.forEach(({ log, t }, i) => {
    days.add(new Date(t).toISOString().slice(0, 10))
    if (i > 0) longestGapMs = Math.max(longestGapMs, t - inWindow[i - 1].t)

    const ctx = log.context || {}
    if (ctx.city) bump(cityCounts, ctx.city)
    if (typeof ctx.temperature === 'number') temps.push(ctx.temperature)
    if (typeof ctx.humidity === 'number') hums.push(ctx.humidity)
    if (ctx.weatherDescription) bump(skyCounts, String(ctx.weatherDescription).toLowerCase())
    if (ctx.astroMoonPhase) bump(moonCounts, String(ctx.astroMoonPhase))

    if (JOURNAL_EVENTS.has(log.event)) {
      const text = (log.text || '').trim()
      // Command-only entries ("/story week") carry no narrative signal.
      if (text && !/^\/[a-z]+(\s+[a-z0-9]+)?$/i.test(text)) {
        journal.push({ t, text: text.replace(/\s+/g, ' ').slice(0, 200) })
      }
    }

    if (SELF_CARE_DONE.has(log.event)) selfCareCompleted++
    if (SELF_CARE_SKIP.has(log.event)) selfCareSkipped++

    if (log.event === 'emotional_checkin') {
      const mood = String(log.metadata?.emotionalState || '').toLowerCase()
      if (!mood) return
      bump(moodCounts, mood)
      const v = MOOD_VALENCE[mood]
      if (v === undefined) return
      valences.push({ t, v })
      const note = (log.metadata?.note as string) || null
      const peak = { at: new Date(t).toISOString(), mood, note: note ? note.slice(0, 140) : null }
      // >= / <= so the most recent extreme wins ties.
      if (v >= highV) { highV = v; highPeak = peak }
      if (v <= lowV) { lowV = v; lowPeak = peak }
    }
  })

  // A "peak" is only meaningful on its own side of neutral.
  if (highV <= 0) highPeak = null
  if (lowV >= 0) lowPeak = null

  let moodDrift: number | null = null
  if (valences.length >= 2) {
    const mid = Math.floor(valences.length / 2)
    const first = mean(valences.slice(0, mid).map(x => x.v))!
    const second = mean(valences.slice(mid).map(x => x.v))!
    moodDrift = round1(second - first)
  }

  return {
    horizon,
    since: new Date(since).toISOString(),
    until: new Date(until).toISOString(),
    totalSignals: inWindow.length,
    journalEntries: journal.length,
    activeDays: days.size,
    spanDays: Math.round(HORIZON_MS[horizon] / DAY_MS),
    moodCounts,
    dominantMood: topKeys(moodCounts, 1)[0] || null,
    moodBalance: round1(mean(valences.map(x => x.v))),
    moodDrift,
    highPeak,
    lowPeak,
    selfCareCompleted,
    selfCareSkipped,
    topCities: topKeys(cityCounts, 3),
    avgTemperature: round1(mean(temps)),
    avgHumidity: round1(mean(hums)),
    dominantSky: topKeys(skyCounts, 1)[0] || null,
    dominantMoon: topKeys(moonCounts, 1)[0] || null,
    longestSilenceHours: inWindow.length >= 2 ? Math.round(longestGapMs / 3_600_000) : null,
    excerpts: sampleEvenly(journal, HORIZON_SAMPLES[horizon]).map(
      j => `[${new Date(j.t).toISOString().slice(0, 10)}] ${j.text}`
    ),
  }
}

/** Renders the digest as the data block sent to the AI vendor. */
export function formatDigestForPrompt(d: StoryDigest): string {
  const moods = topKeys(d.moodCounts, 5).map(m => `${m}×${d.moodCounts[m]}`).join(', ')
  const lines = [
    `HORIZON: ${d.horizon.toUpperCase()} (${d.since.slice(0, 10)} → ${d.until.slice(0, 10)})`,
    `SIGNALS: ${d.totalSignals} total · ${d.journalEntries} journal entries · active ${d.activeDays}/${d.spanDays} days`,
    `MOODS: ${moods || 'NO DATA'}`,
    `MOOD BALANCE: ${d.moodBalance ?? 'n/a'} (−1 low … +1 high) · DRIFT: ${d.moodDrift ?? 'n/a'}`,
    `HIGH PEAK: ${d.highPeak ? `${d.highPeak.mood} on ${d.highPeak.at.slice(0, 10)}${d.highPeak.note ? ` — "${d.highPeak.note}"` : ''}` : 'none recorded'}`,
    `LOW PEAK: ${d.lowPeak ? `${d.lowPeak.mood} on ${d.lowPeak.at.slice(0, 10)}${d.lowPeak.note ? ` — "${d.lowPeak.note}"` : ''}` : 'none recorded'}`,
    `SELF-CARE: ${d.selfCareCompleted} completed · ${d.selfCareSkipped} skipped`,
    `PLACE: ${d.topCities.join(', ') || 'unknown'}`,
    `ENVIRONMENT: ${d.avgTemperature ?? '—'} avg temp · ${d.avgHumidity ?? '—'}% humidity · sky ${d.dominantSky || '—'} · moon ${d.dominantMoon || '—'}`,
    `LONGEST SILENCE: ${d.longestSilenceHours !== null ? `${d.longestSilenceHours}h` : 'n/a'}`,
    'JOURNAL EXCERPTS (evenly sampled across horizon):',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ]
  return lines.join('\n')
}

/** Terminal-grid header shown above the story in the Log. */
export function formatDigestHeader(d: StoryDigest): string[] {
  const pad = (k: string) => k.padEnd(16, ' ')
  const lines = [
    `${pad('STORY')}${d.horizon.toUpperCase()}`,
    `${pad('SIGNALS')}${d.totalSignals} · ${d.journalEntries} ${d.journalEntries === 1 ? "ENTRY" : "ENTRIES"} · ${d.activeDays}/${d.spanDays} DAYS`,
  ]
  if (d.dominantMood) lines.push(`${pad('DOMINANT')}${d.dominantMood.toUpperCase()}`)
  if (d.highPeak) lines.push(`${pad('HIGH')}${d.highPeak.mood.toUpperCase()} ${d.highPeak.at.slice(5, 10)}`)
  if (d.lowPeak) lines.push(`${pad('LOW')}${d.lowPeak.mood.toUpperCase()} ${d.lowPeak.at.slice(5, 10)}`)
  return lines
}
