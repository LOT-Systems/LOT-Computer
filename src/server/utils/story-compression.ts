/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression (/story)
 *
 * Pure, deterministic reduction of a user's logs into a StoryDigest for a
 * period (day | week | month | year): volume, rhythm, mood, ambient context,
 * spikes and pattern changes versus the previous equal-length window, plus
 * arcade XP. The digest — not the raw journal — feeds the AI prompt, and a
 * deterministic fallback story is built from it when the AI vendor is down.
 *
 * Pipeline position:
 *   LOT user data -> [this digest] -> Quantum Intent Engine -> AI vendor
 *   (Together AI) -> LOT personalized data stored (`generated_story` log)
 *
 * No DB, no network, no clock reads (callers pass `now`) so it is unit-testable.
 * Doc: docs/technical/LOG-COMMAND-SYSTEM.md
 */

import { toCelsius } from '#shared/utils'
import { arcadeRankForXp, type ArcadeRank, type StoryPeriod } from '#shared/utils/log-commands'

export interface DigestLog {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export type SignalKind = 'spike' | 'volume-shift' | 'mood-shift' | 'silence'

export interface StorySignal {
  kind: SignalKind
  /** One-line, human-readable, no invented numbers. */
  detail: string
}

export interface StoryDigest {
  period: StoryPeriod
  windowStart: string
  windowEnd: string
  entryCount: number
  previousEntryCount: number
  activeDays: number
  windowDays: number
  currentStreak: number
  checkinCount: number
  dominantMood: string | null
  moods: Record<string, number>
  avgTempC: number | null
  cities: string[]
  keywords: string[]
  signals: StorySignal[]
  /** Truncated entry texts (oldest first) offered to the prompt as evidence. */
  excerpts: string[]
  xp: number
  rank: ArcadeRank
}

/** Events that carry the user's own words. 'note' is the Log page entry. */
export const ENTRY_EVENTS: ReadonlySet<string> = new Set(['note', 'log_entry', 'journal'])
const CHECKIN_EVENTS: ReadonlySet<string> = new Set([
  'emotional_checkin', 'self_care_checkin', 'energy_checkin', 'memory_answer',
])

const DAY_MS = 86_400_000
const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }
const MAX_EXCERPTS = 12
const EXCERPT_CHARS = 160

const STOPWORDS = new Set((
  'about after again also because been before being below between both could did does doing down during each ' +
  'from further have having here into just like more most much only other over same should some such than that ' +
  'their them then there these they this those through under until very want was were what when where which while ' +
  'will with would your you and for are but not the its it\'s i\'m dont don\'t cant can\'t feel feeling today'
).split(' '))

export function periodDays(period: StoryPeriod): number {
  return PERIOD_DAYS[period]
}

/** Rolling window ending at `now`: [start, end). */
export function periodWindow(period: StoryPeriod, now: Date): { start: Date; end: Date } {
  return { start: new Date(now.getTime() - PERIOD_DAYS[period] * DAY_MS), end: now }
}

function ts(l: DigestLog): number {
  return new Date(l.createdAt).getTime()
}

function dayKey(t: number): string {
  return new Date(t).toISOString().slice(0, 10)
}

function inWindow(l: DigestLog, start: Date, end: Date): boolean {
  const t = ts(l)
  return t >= start.getTime() && t < end.getTime()
}

function isEntry(l: DigestLog): boolean {
  return ENTRY_EVENTS.has(l.event) && !!(l.text && l.text.trim())
}

function moodOf(l: DigestLog): string | null {
  const m = l.metadata?.emotionalState
  return typeof m === 'string' && m.trim() ? m.trim().toLowerCase() : null
}

function dominant(counts: Record<string, number>): string | null {
  let best: string | null = null
  for (const [k, v] of Object.entries(counts)) {
    if (best === null || v > counts[best] || (v === counts[best] && k < best)) best = k
  }
  return best
}

/** Consecutive days with at least one entry, ending today or yesterday. */
function streakEndingAt(daysWithEntries: Set<string>, now: Date): number {
  let cursor = now.getTime()
  if (!daysWithEntries.has(dayKey(cursor))) cursor -= DAY_MS
  let n = 0
  while (daysWithEntries.has(dayKey(cursor))) {
    n++
    cursor -= DAY_MS
  }
  return n
}

/**
 * Arcade XP. Rewards showing up and noticing, with per-day caps so a burst of
 * typing cannot be farmed: entries 3 XP (max 5/day), check-ins 5 XP (max 3/day),
 * +2 XP per day of the running streak (capped at 7 days).
 */
export function computeXp(logs: DigestLog[], now: Date): number {
  const perDay = new Map<string, { entries: number; checkins: number }>()
  for (const l of logs) {
    const bucket = perDay.get(dayKey(ts(l))) ?? { entries: 0, checkins: 0 }
    if (isEntry(l)) bucket.entries++
    else if (CHECKIN_EVENTS.has(l.event)) bucket.checkins++
    else continue
    perDay.set(dayKey(ts(l)), bucket)
  }
  let xp = 0
  perDay.forEach(b => {
    xp += Math.min(b.entries, 5) * 3 + Math.min(b.checkins, 3) * 5
  })
  const active = new Set(Array.from(perDay.keys()))
  xp += Math.min(streakEndingAt(active, now), 7) * 2
  return xp
}

function topKeywords(entries: DigestLog[], limit = 5): string[] {
  const freq = new Map<string, number>()
  for (const l of entries) {
    const words = (l.text || '').toLowerCase().match(/[a-zа-яё']{4,}/gi) || []
    for (const w of words) {
      if (STOPWORDS.has(w)) continue
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  return Array.from(freq.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, limit)
    .map(([w]) => w)
}

function detectSpikes(entries: DigestLog[], period: StoryPeriod, windowDays: number): StorySignal[] {
  if (entries.length < 4) return []
  const byHour = period === 'day'
  const buckets = new Map<string, number>()
  for (const l of entries) {
    const iso = new Date(ts(l)).toISOString()
    const k = byHour ? iso.slice(0, 13) : iso.slice(0, 10)
    buckets.set(k, (buckets.get(k) || 0) + 1)
  }
  const slots = byHour ? 24 : windowDays
  const mean = entries.length / slots
  let variance = 0
  buckets.forEach(n => { variance += (n - mean) ** 2 })
  variance += (slots - buckets.size) * mean ** 2
  const sd = Math.sqrt(variance / slots)
  const out: StorySignal[] = []
  buckets.forEach((n, k) => {
    if (n >= 3 && n > mean + 2 * sd) {
      out.push({
        kind: 'spike',
        detail: byHour
          ? `${n} entries in the hour starting ${k.slice(11)}:00 UTC`
          : `${n} entries on ${k}`,
      })
    }
  })
  return out.sort((a, b) => (a.detail < b.detail ? -1 : 1)).slice(0, 3)
}

/**
 * Build the digest. `logs` may span any range (window + previous window +
 * history for XP); each statistic selects the slice it needs.
 */
export function buildStoryDigest(logs: DigestLog[], period: StoryPeriod, now: Date): StoryDigest {
  const { start, end } = periodWindow(period, now)
  const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()))
  const windowDays = PERIOD_DAYS[period]

  const windowLogs = logs.filter(l => inWindow(l, start, end))
  const entries = windowLogs.filter(isEntry).sort((a, b) => ts(a) - ts(b))
  const previousEntries = logs.filter(l => inWindow(l, prevStart, start) && isEntry(l))

  const moodLogs = windowLogs.filter(l => l.event === 'emotional_checkin' && moodOf(l)).sort((a, b) => ts(a) - ts(b))
  const moods: Record<string, number> = {}
  for (const l of moodLogs) moods[moodOf(l)!] = (moods[moodOf(l)!] || 0) + 1

  const temps = entries
    .map(l => l.context?.temperature)
    .filter((t): t is number => typeof t === 'number' && Number.isFinite(t))
  // Log context stores temperature in Kelvin (see toCelsius in shared utils).
  const celsius = temps.map(toCelsius)
  const avgTempC = celsius.length ? Math.round(celsius.reduce((a, b) => a + b, 0) / celsius.length) : null
  const cityFreq: Record<string, number> = {}
  for (const l of entries) {
    const c = l.context?.city
    if (typeof c === 'string' && c) cityFreq[c] = (cityFreq[c] || 0) + 1
  }
  const cities = Object.entries(cityFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c)

  const entryDays = new Set(entries.map(l => dayKey(ts(l))))
  const allEntryDays = new Set(logs.filter(isEntry).map(l => dayKey(ts(l))))
  const streak = streakEndingAt(allEntryDays, now)

  const signals: StorySignal[] = [...detectSpikes(entries, period, windowDays)]

  // Volume shift vs previous window (needs a real baseline, no tiny-number noise).
  if (previousEntries.length >= 3) {
    const ratio = entries.length / previousEntries.length
    if (ratio >= 1.5 || ratio <= 0.5) {
      signals.push({
        kind: 'volume-shift',
        detail: `${entries.length} entries versus ${previousEntries.length} in the previous ${period}`,
      })
    }
  }

  // Mood shift: dominant mood in first half differs from second half.
  if (moodLogs.length >= 4) {
    const mid = Math.floor(moodLogs.length / 2)
    const tally = (ls: DigestLog[]) => {
      const c: Record<string, number> = {}
      ls.forEach(l => { c[moodOf(l)!] = (c[moodOf(l)!] || 0) + 1 })
      return dominant(c)
    }
    const a = tally(moodLogs.slice(0, mid))
    const b = tally(moodLogs.slice(mid))
    if (a && b && a !== b) signals.push({ kind: 'mood-shift', detail: `mood moved from ${a} to ${b}` })
  }

  // Silence: user normally writes (baseline) but the latest days are empty.
  if (period !== 'day' && previousEntries.length + entries.length >= 5 && entries.length > 0) {
    const last = ts(entries[entries.length - 1])
    const gap = Math.floor((now.getTime() - last) / DAY_MS)
    if (gap >= 3) signals.push({ kind: 'silence', detail: `no entries for ${gap} days` })
  }

  const step = Math.max(1, Math.ceil(entries.length / MAX_EXCERPTS))
  const excerpts = entries
    .filter((_, i) => i % step === 0)
    .slice(0, MAX_EXCERPTS)
    .map(l => (l.text || '').trim().replace(/\s+/g, ' ').slice(0, EXCERPT_CHARS))

  const xp = computeXp(logs.filter(l => ts(l) >= now.getTime() - 365 * DAY_MS && ts(l) <= now.getTime()), now)

  return {
    period,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    entryCount: entries.length,
    previousEntryCount: previousEntries.length,
    activeDays: entryDays.size,
    windowDays,
    currentStreak: streak,
    checkinCount: windowLogs.filter(l => CHECKIN_EVENTS.has(l.event)).length,
    dominantMood: dominant(moods),
    moods,
    avgTempC,
    cities,
    keywords: topKeywords(entries),
    signals,
    excerpts,
    xp,
    rank: arcadeRankForXp(xp),
  }
}

const PERIOD_LABEL: Record<StoryPeriod, string> = {
  day: 'today', week: 'this week', month: 'this month', year: 'this year',
}

/** Evidence block handed to the AI vendor. Digest facts first, excerpts last. */
export function digestToPromptBlock(d: StoryDigest): string {
  const lines = [
    `PERIOD: ${d.period} (${d.windowStart.slice(0, 10)} to ${d.windowEnd.slice(0, 10)})`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays} of ${d.windowDays} days (previous ${d.period}: ${d.previousEntryCount})`,
    `CHECK-INS: ${d.checkinCount}`,
    `STREAK: ${d.currentStreak} days`,
    `DOMINANT MOOD: ${d.dominantMood || 'no data'}`,
    `AMBIENT: ${d.avgTempC !== null ? d.avgTempC + '°C avg' : 'no weather data'}${d.cities.length ? ', ' + d.cities.join(' / ') : ''}`,
    `RECURRING WORDS: ${d.keywords.join(', ') || 'none'}`,
    `ARCADE: level ${d.rank.level} ${d.rank.title}, ${d.rank.xp} XP`,
    `SIGNALS:\n${d.signals.map(s => `- ${s.kind}: ${s.detail}`).join('\n') || '- none'}`,
    `ENTRY EXCERPTS (oldest first):\n${d.excerpts.map(e => `- ${e}`).join('\n') || '- (none)'}`,
  ]
  return lines.join('\n')
}

export function buildStorySystemPrompt(period: StoryPeriod): string {
  const words = { day: '60-100', week: '100-160', month: '120-200', year: '150-220' }[period]
  return `You are the Story module of LOT Systems, a personal operating system for self-care. You compress the operator's ${period} into a short narrative from the DIGEST below.

RULES:
- Second person ("You..."), ${words} words, one or two paragraphs.
- Use only facts present in the digest. Never invent events, numbers, names or diagnoses.
- Name any spike, shift or silence in SIGNALS plainly and with compassion; do not dramatize.
- If data is thin, say the picture is still forming. Do not pad.
- Quiet tone matched to the dominant mood. No pep talk, no medical advice.
- Close with one short forward-looking sentence grounded in the data.
- Return ONLY the story. No title, no preamble.`
}

/** Deterministic story used when the AI vendor is unavailable. */
export function fallbackStory(d: StoryDigest): string {
  const label = PERIOD_LABEL[d.period]
  if (d.entryCount === 0) {
    return `Nothing has been written ${label} yet. The system is listening; whatever you add next becomes the first line of this story.`
  }
  const parts: string[] = [
    `${label[0].toUpperCase()}${label.slice(1)} you wrote ${d.entryCount} ${d.entryCount === 1 ? 'entry' : 'entries'}` +
      (d.period === 'day' ? '.' : ` across ${d.activeDays} of ${d.windowDays} days.`),
  ]
  if (d.dominantMood) parts.push(`The mood that came back most was ${d.dominantMood}.`)
  if (d.keywords.length) parts.push(`Words you kept returning to: ${d.keywords.slice(0, 3).join(', ')}.`)
  for (const s of d.signals.slice(0, 2)) parts.push(`Noticed: ${s.detail}.`)
  if (d.currentStreak >= 2) parts.push(`You are on a ${d.currentStreak}-day streak.`)
  parts.push('The picture keeps sharpening with every entry.')
  return parts.join(' ')
}
