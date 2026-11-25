/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® STORY COMPRESSION — deterministic digest layer (pure)
 *
 * Pipeline position:
 *   LOT User data → [THIS: compression digest] → Quantum Intent Engine
 *   → AI vendor (Together AI) narrates digest → LOT stores generated_story
 *
 * The digest is computed BEFORE any AI call, so:
 *  - the AI receives compressed signal, not raw private text dumps;
 *  - the system still produces a story (deterministic fallback) when
 *    the vendor is offline;
 *  - peaks / spikes / pattern changes are measured, not hallucinated.
 *
 * Pure module: no DOM, no network, no DB. `now` is injectable.
 */

import { computeArcadeProgress, xpForLog, levelForXp, type ArcadeLogLike } from './arcade.js'

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'
export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']
export const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', d: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

/**
 * Parse `/story <period>` from free text. Returns null when no explicit
 * period is given (caller then uses `resolveAutoPeriod`).
 */
export function parseStoryPeriod(text: string): StoryPeriod | null {
  const m = (text || '').match(/(?:^|\s)\/story[\s:]+([a-z0-9]+)/i)
  if (!m) return null
  return PERIOD_ALIASES[m[1].toLowerCase()] || null
}

export interface StoryLogLike extends ArcadeLogLike {
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

/** Mood valence (-2..+2). Unknown moods are ignored, not guessed. */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2, flowing: 2,
  hopeful: 1, calm: 1, content: 1, peaceful: 1, grounded: 1, focused: 1, steady: 1,
  uncertain: -1, restless: -1, tired: -1, unsettled: -1, heavy: -1,
  anxious: -2, overwhelmed: -2, exhausted: -2, drained: -2, depleted: -2,
}

// Minimal lexicon for Journal text. Deliberately small + transparent.
const POS_WORDS = ['good', 'great', 'happy', 'love', 'grateful', 'calm', 'rested', 'strong', 'clear', 'peace', 'joy', 'proud', 'light', 'win', 'better']
const NEG_WORDS = ['bad', 'sad', 'tired', 'anxious', 'stress', 'stressed', 'angry', 'lonely', 'sick', 'pain', 'heavy', 'lost', 'worse', 'exhausted', 'fear']

/** Strip LOT slash-commands and generated blocks from journal text. */
export function cleanJournalText(text: string): string {
  // Everything after the first generated block (📖 story / 🕯️ scripture) is
  // machine output appended to the entry — never treat it as the operator's words.
  return (text || '')
    .split(/(?:^|\n)\s*(?:📖|🕯️?)\s/)[0]
    .replace(/(^|\s)\/[a-z][a-z0-9-]*(\s+(day|today|week|month|year|d|w|m|y))?(?=\s|$)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function textValence(text: string): number {
  const words = cleanJournalText(text).toLowerCase().match(/[a-z']+/g) || []
  let score = 0
  for (const w of words) {
    if (POS_WORDS.includes(w)) score++
    else if (NEG_WORDS.includes(w)) score--
  }
  return Math.max(-2, Math.min(2, score))
}

export interface StoryPeak {
  day: string
  score: number
  mood: string | null
  snippet: string | null
}

export interface StoryDigest {
  period: StoryPeriod
  from: string
  to: string
  totalRecords: number
  journalEntries: number
  activeDays: number
  windowDays: number
  moodCounts: Record<string, number>
  dominantMood: string | null
  avgValence: number | null
  trend: 'RISING' | 'FALLING' | 'STEADY' | 'INSUFFICIENT'
  high: StoryPeak | null
  low: StoryPeak | null
  spikeDays: string[]
  silenceDays: number
  context: {
    avgTempC: number | null
    avgHumidity: number | null
    cities: string[]
    dominantSky: string | null
    moonPhases: string[]
    dominantTimeBand: string | null
  }
  selfCare: string[]
  journalSamples: string[]
  arcade: { xpGained: number; levelNow: number; levelAtStart: number; rank: string; streakDays: number }
}

/** day = today has ≥3 records, else week. Deterministic, documented. */
export function resolveAutoPeriod(logs: StoryLogLike[], now: Date = new Date()): StoryPeriod {
  const today = now.toISOString().slice(0, 10)
  const n = logs.filter(l => toIso(l.createdAt).slice(0, 10) === today && xpForLog(l) > 0).length
  return n >= 3 ? 'day' : 'week'
}

function toIso(d: string | Date): string {
  return typeof d === 'string' ? new Date(d).toISOString() : d.toISOString()
}

function timeBand(log: StoryLogLike): string {
  const d = new Date(toIso(log.createdAt))
  let hour = d.getUTCHours()
  const tz = log.context?.timeZone
  if (tz) {
    try {
      const h = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: tz }).format(d)
      const parsed = parseInt(h, 10)
      if (!Number.isNaN(parsed)) hour = parsed
    } catch { /* invalid tz → UTC */ }
  }
  if (hour < 5) return 'NIGHT'
  if (hour < 12) return 'MORNING'
  if (hour < 17) return 'AFTERNOON'
  if (hour < 21) return 'EVENING'
  return 'NIGHT'
}

function mode(values: string[]): string | null {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) || 0) + 1)
  let best: string | null = null
  let n = 0
  counts.forEach((c, k) => { if (c > n) { n = c; best = k } })
  return best
}

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * Compress a log list into a StoryDigest for the given period.
 * Logs outside [now - periodDays, now] are ignored for the window but
 * used for the arcade "level at start" baseline.
 */
export function compressStory(
  allLogs: StoryLogLike[],
  period: StoryPeriod,
  now: Date = new Date()
): StoryDigest {
  const windowDays = PERIOD_DAYS[period]
  const to = now
  const from = period === 'day'
    ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    : new Date(now.getTime() - windowDays * 86_400_000)

  const inWindow = allLogs.filter(l => {
    const t = Date.parse(toIso(l.createdAt))
    return t >= from.getTime() && t <= to.getTime()
  })
  const before = allLogs.filter(l => Date.parse(toIso(l.createdAt)) < from.getTime())
  const meaningful = inWindow.filter(l => xpForLog(l) > 0)

  const journal = meaningful.filter(l => l.event === 'note' && cleanJournalText(l.text || '').length > 0)
  const moods = meaningful
    .filter(l => l.event === 'emotional_checkin')
    .map(l => String(l.metadata?.emotionalState || '').toLowerCase())
    .filter(Boolean)

  const moodCounts: Record<string, number> = {}
  for (const m of moods) moodCounts[m] = (moodCounts[m] || 0) + 1

  // Per-day signal: mood valence (weight 2) + journal text valence (weight 1)
  type DayAcc = { sum: number; w: number; count: number; mood: string | null; snippet: string | null; snipScore: number }
  const days = new Map<string, DayAcc>()
  const acc = (k: string) => {
    let d = days.get(k)
    if (!d) { d = { sum: 0, w: 0, count: 0, mood: null, snippet: null, snipScore: 0 }; days.set(k, d) }
    return d
  }
  for (const l of meaningful) {
    const k = toIso(l.createdAt).slice(0, 10)
    const d = acc(k)
    d.count++
    if (l.event === 'emotional_checkin') {
      const m = String(l.metadata?.emotionalState || '').toLowerCase()
      if (m in MOOD_VALENCE) { d.sum += MOOD_VALENCE[m] * 2; d.w += 2; d.mood = d.mood || m }
    } else if (l.event === 'note') {
      const clean = cleanJournalText(l.text || '')
      if (clean) {
        const v = textValence(clean)
        if (v !== 0) { d.sum += v; d.w += 1 }
        if (!d.snippet || Math.abs(v) > Math.abs(d.snipScore)) { d.snippet = clean.slice(0, 140); d.snipScore = v }
      }
    }
  }

  const scored = Array.from(days.entries())
    .filter(([, d]) => d.w > 0)
    .map(([day, d]) => ({ day, score: round1(d.sum / d.w), mood: d.mood, snippet: d.snippet }))
    .sort((a, b) => a.day.localeCompare(b.day))

  let high: StoryPeak | null = null
  let low: StoryPeak | null = null
  if (scored.length >= 1) {
    high = scored.reduce((a, b) => (b.score > a.score ? b : a))
    low = scored.reduce((a, b) => (b.score < a.score ? b : a))
    if (scored.length === 1 || high.score === low.score) {
      // One signal level only: report it as a single reading, not two peaks
      if (high.score >= 0) low = null
      else high = null
    }
  }

  const avgValence = scored.length ? round1(scored.reduce((s, d) => s + d.score, 0) / scored.length) : null

  let trend: StoryDigest['trend'] = 'INSUFFICIENT'
  if (scored.length >= 4) {
    const half = Math.floor(scored.length / 2)
    const a = scored.slice(0, half).reduce((s, d) => s + d.score, 0) / half
    const b = scored.slice(half).reduce((s, d) => s + d.score, 0) / (scored.length - half)
    trend = b - a >= 0.5 ? 'RISING' : a - b >= 0.5 ? 'FALLING' : 'STEADY'
  }

  // Activity spikes: days with ≥ 2× median record count AND ≥ 4 records
  const counts = Array.from(days.values()).map(d => d.count).sort((a, b) => a - b)
  const median = counts.length ? counts[Math.floor(counts.length / 2)] : 0
  const spikeDays = Array.from(days.entries())
    .filter(([, d]) => counts.length >= 3 && d.count >= 4 && d.count >= median * 2)
    .map(([k]) => k)
    .sort()

  const temps = inWindow.map(l => l.context?.temperature).filter((t): t is number => typeof t === 'number' && t > 150)
  const hums = inWindow.map(l => l.context?.humidity).filter((h): h is number => typeof h === 'number')
  const cities = Array.from(new Set(inWindow.map(l => l.context?.city).filter(Boolean) as string[])).slice(0, 5)
  const moonPhases = Array.from(new Set(inWindow.map(l => l.context?.astroMoonPhase).filter(Boolean) as string[])).slice(0, 4)

  const selfCare = meaningful
    .filter(l => ['answer', 'memory_answer', 'self_care', 'self_care_checkin', 'energy_checkin'].includes(l.event))
    .map(l => {
      const q = String(l.metadata?.question || '')
      const a = String(l.metadata?.option || l.metadata?.answer || l.text || '')
      return q && a ? `${q.slice(0, 80)} → ${a.slice(0, 60)}` : a.slice(0, 100)
    })
    .filter(Boolean)
    .slice(0, 6)

  const journalSamples = journal
    .slice()
    .sort((a, b) => toIso(b.createdAt).localeCompare(toIso(a.createdAt)))
    .map(l => cleanJournalText(l.text || '').slice(0, 220))
    .slice(0, period === 'day' ? 6 : 8)

  const startProgress = computeArcadeProgress(before, from)
  const nowProgress = computeArcadeProgress(allLogs.filter(l => Date.parse(toIso(l.createdAt)) <= to.getTime()), now)

  return {
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    totalRecords: meaningful.length,
    journalEntries: journal.length,
    activeDays: days.size,
    windowDays,
    moodCounts,
    dominantMood: mode(moods),
    avgValence,
    trend,
    high,
    low,
    spikeDays,
    silenceDays: Math.max(0, windowDays - days.size),
    context: {
      avgTempC: temps.length ? Math.round(temps.reduce((s, t) => s + t, 0) / temps.length - 273.15) : null,
      avgHumidity: hums.length ? Math.round(hums.reduce((s, h) => s + h, 0) / hums.length) : null,
      cities,
      dominantSky: mode(inWindow.map(l => String(l.context?.weatherDescription || '').toLowerCase()).filter(Boolean)),
      moonPhases,
      dominantTimeBand: mode(meaningful.map(timeBand)),
    },
    selfCare,
    journalSamples,
    arcade: {
      xpGained: Math.max(0, nowProgress.totalXp - startProgress.totalXp),
      levelNow: nowProgress.level,
      levelAtStart: levelForXp(startProgress.totalXp),
      rank: nowProgress.rank.title,
      streakDays: nowProgress.streakDays,
    },
  }
}

/** Compact grid lines rendered above the story in the Log. */
export function formatDigestGrid(d: StoryDigest): string[] {
  const lines = [
    `PERIOD          ${d.period.toUpperCase()} · ${d.from.slice(0, 10)} → ${d.to.slice(0, 10)}`,
    `RECORDS         ${d.totalRecords} · ${d.journalEntries} JOURNAL · ${d.activeDays}/${d.windowDays} DAYS`,
  ]
  if (d.dominantMood) lines.push(`DOMINANT MOOD   ${d.dominantMood.toUpperCase()}`)
  if (d.trend !== 'INSUFFICIENT') lines.push(`TREND           ${d.trend}`)
  if (d.high) lines.push(`HIGH PEAK       ${d.high.day}${d.high.mood ? ' · ' + d.high.mood.toUpperCase() : ''}`)
  if (d.low) lines.push(`LOW PEAK        ${d.low.day}${d.low.mood ? ' · ' + d.low.mood.toUpperCase() : ''}`)
  if (d.spikeDays.length) lines.push(`SPIKE           ${d.spikeDays.join(', ')}`)
  const ctx: string[] = []
  if (d.context.avgTempC !== null) ctx.push(`${d.context.avgTempC}°C`)
  if (d.context.avgHumidity !== null) ctx.push(`${d.context.avgHumidity}%`)
  if (d.context.dominantSky) ctx.push(d.context.dominantSky.toUpperCase())
  if (d.context.cities.length) ctx.push(d.context.cities.join('/').toUpperCase())
  if (ctx.length) lines.push(`CONTEXT         ${ctx.join(' · ')}`)
  const lvl = d.arcade.levelNow > d.arcade.levelAtStart ? ` · L${d.arcade.levelAtStart}→L${d.arcade.levelNow}` : ` · L${d.arcade.levelNow}`
  lines.push(`ARCADE          +${d.arcade.xpGained} XP${lvl} · ${d.arcade.rank}`)
  return lines
}

/** Prompt data block for the AI vendor (compressed, no raw dumps). */
export function formatDigestForPrompt(d: StoryDigest): string {
  const moods = Object.entries(d.moodCounts).sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m}×${n}`).join(', ')
  return [
    `PERIOD: ${d.period} (${d.from.slice(0, 10)} to ${d.to.slice(0, 10)})`,
    `RECORDS: ${d.totalRecords} total, ${d.journalEntries} journal entries, active ${d.activeDays} of ${d.windowDays} days, ${d.silenceDays} silent days`,
    `MOODS: ${moods || 'no check-ins'}`,
    `AVERAGE VALENCE (-2..+2): ${d.avgValence ?? 'unknown'} · TREND: ${d.trend}`,
    d.high ? `HIGH PEAK: ${d.high.day}${d.high.mood ? ` (${d.high.mood})` : ''}${d.high.snippet ? ` — "${d.high.snippet}"` : ''}` : 'HIGH PEAK: none detected',
    d.low ? `LOW PEAK: ${d.low.day}${d.low.mood ? ` (${d.low.mood})` : ''}${d.low.snippet ? ` — "${d.low.snippet}"` : ''}` : 'LOW PEAK: none detected',
    d.spikeDays.length ? `ACTIVITY SPIKES: ${d.spikeDays.join(', ')}` : 'ACTIVITY SPIKES: none',
    `CONTEXT: temp ${d.context.avgTempC ?? '?'}°C, humidity ${d.context.avgHumidity ?? '?'}%, sky ${d.context.dominantSky || '?'}, places ${d.context.cities.join(', ') || '?'}, moon ${d.context.moonPhases.join(', ') || '?'}, usually writes in the ${(d.context.dominantTimeBand || 'unknown').toLowerCase()}`,
    `ARCADE: +${d.arcade.xpGained} XP this ${d.period}, level ${d.arcade.levelAtStart}→${d.arcade.levelNow}, rank ${d.arcade.rank}, streak ${d.arcade.streakDays}d`,
    '',
    'JOURNAL SAMPLES (most recent first):',
    ...(d.journalSamples.length ? d.journalSamples.map(s => `- ${s}`) : ['- (none)']),
    '',
    'SELF-CARE ANSWERS:',
    ...(d.selfCare.length ? d.selfCare.map(s => `- ${s}`) : ['- (none)']),
  ].join('\n')
}

/** Deterministic story used when the AI vendor is unavailable. */
export function composeFallbackStory(d: StoryDigest): string {
  const span = d.period === 'day' ? 'Today' : `This ${d.period}`
  if (d.totalRecords === 0) {
    return `${span} has been quiet in the archive. Nothing was recorded, and that is also a reading — silence is data. When you write again, the story continues from here.`
  }
  const parts: string[] = []
  parts.push(`${span} you showed up ${d.totalRecords} time${d.totalRecords === 1 ? '' : 's'}${d.period === 'day' ? '' : ` across ${d.activeDays} of ${d.windowDays} days`}, with ${d.journalEntries} journal entr${d.journalEntries === 1 ? 'y' : 'ies'}.`)
  if (d.dominantMood) parts.push(`The mood that returned most often was ${d.dominantMood}.`)
  if (d.high && d.low) parts.push(`The brightest point came on ${d.high.day}; the heaviest on ${d.low.day}.`)
  else if (d.high) parts.push(`The clearest point came on ${d.high.day}.`)
  else if (d.low) parts.push(`The weight gathered most on ${d.low.day}.`)
  if (d.trend === 'RISING') parts.push('The line is rising.')
  if (d.trend === 'FALLING') parts.push('The line has been sloping down — worth a slower evening.')
  if (d.context.cities.length) parts.push(`It happened in ${d.context.cities.join(', ')}${d.context.dominantSky ? `, mostly under ${d.context.dominantSky}` : ''}.`)
  parts.push(`+${d.arcade.xpGained} XP; you hold the rank of ${d.arcade.rank.toLowerCase()}.`)
  return parts.join(' ')
}
