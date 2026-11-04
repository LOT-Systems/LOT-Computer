/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION — deterministic layer.
 *
 * Pipeline position:
 *   LOT User data → [THIS: compress + spike detect] → Quantum Intent Engine
 *   context → AI vendor (Together AI) → LOT personalized data stored.
 *
 * The LLM never sees raw history. It sees a bounded, structured digest
 * (counts, streaks, mood tally, environment aggregates, spikes, sampled
 * entries). Everything here is pure and unit-testable. Doc:
 * docs/technical/LOT-STORY-COMPRESSION.md
 */

import type { StoryPeriod } from './logCommands'

export interface CompressibleLog {
  event: string
  text: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

export const JOURNAL_EVENTS = ['log_entry', 'journal']
export const MOOD_EVENTS = ['emotional_checkin']
export const CARE_EVENTS = ['memory_answer', 'self_care_checkin', 'energy_checkin']

const DAY_MS = 86_400_000
export const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }

export function periodWindow(period: StoryPeriod, now: Date = new Date()) {
  return { from: new Date(now.getTime() - PERIOD_DAYS[period] * DAY_MS), to: now }
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v))
const words = (s: string | null | undefined) => (s || '').trim().split(/\s+/).filter(Boolean).length

export interface Spike {
  day: string
  kind: 'volume' | 'silence' | 'mood-shift'
  detail: string
}

export interface StoryDigest {
  period: StoryPeriod
  from: string
  to: string
  entryCount: number
  wordCount: number
  activeDays: number
  windowDays: number
  currentStreak: number
  longestStreak: number
  moods: Array<{ mood: string; count: number }>
  careAnswers: string[]
  environment: { avgTempC: number | null; cities: string[]; conditions: string[] }
  spikes: Spike[]
  sampleEntries: Array<{ day: string; text: string }>
}

/** Kelvin → C when the stored value is clearly Kelvin, else pass through. */
function tempToC(t: number): number {
  return t > 150 ? t - 273.15 : t
}

function streaks(activeDayKeys: Set<string>, to: Date, windowDays: number) {
  let current = 0
  for (let i = 0; i < windowDays; i++) {
    const k = dayKey(new Date(to.getTime() - i * DAY_MS))
    if (activeDayKeys.has(k)) current++
    else if (i === 0) continue // today may not be written yet
    else break
  }
  let longest = 0
  let run = 0
  for (let i = windowDays - 1; i >= 0; i--) {
    const k = dayKey(new Date(to.getTime() - i * DAY_MS))
    run = activeDayKeys.has(k) ? run + 1 : 0
    if (run > longest) longest = run
  }
  return { current, longest }
}

/**
 * Spike / pattern-change detection over per-day entry volume and moods.
 * - volume: a day whose entry count is >= mean + 2*sd (min 3 entries)
 * - silence: >=3 consecutive empty days after a previously active stretch
 * - mood-shift: dominant mood of the later half differs from the earlier half
 * Used by the story digest now and by the follow-up engine later.
 */
export function detectSpikes(
  logs: CompressibleLog[],
  window: { from: Date; to: Date }
): Spike[] {
  const spikes: Spike[] = []
  const windowDays = Math.max(1, Math.round((window.to.getTime() - window.from.getTime()) / DAY_MS))
  const perDay = new Map<string, number>()
  for (const l of logs) {
    if (!JOURNAL_EVENTS.includes(l.event)) continue
    const k = dayKey(toDate(l.createdAt))
    perDay.set(k, (perDay.get(k) || 0) + 1)
  }

  if (windowDays >= 7 && perDay.size >= 3) {
    const counts: number[] = []
    for (let i = 0; i < windowDays; i++) counts.push(perDay.get(dayKey(new Date(window.to.getTime() - i * DAY_MS))) || 0)
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const sd = Math.sqrt(counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length)
    perDay.forEach((n, day) => {
      if (n >= 3 && sd > 0 && n >= mean + 2 * sd) {
        spikes.push({ day, kind: 'volume', detail: `${n} entries in one day (avg ${mean.toFixed(1)})` })
      }
    })

    // silence: gap of >=3 days between two active days
    const sorted = Array.from(perDay.keys()).sort()
    for (let i = 1; i < sorted.length; i++) {
      const gap = Math.round((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / DAY_MS) - 1
      if (gap >= 3) spikes.push({ day: sorted[i - 1], kind: 'silence', detail: `${gap} silent days followed` })
    }
  }

  const moods = logs
    .filter(l => MOOD_EVENTS.includes(l.event))
    .map(l => ({ t: toDate(l.createdAt).getTime(), m: String(l.metadata?.emotionalState || '').toLowerCase() }))
    .filter(x => x.m)
    .sort((a, b) => a.t - b.t)
  if (moods.length >= 4) {
    const dom = (arr: typeof moods) => {
      const c = new Map<string, number>()
      arr.forEach(x => c.set(x.m, (c.get(x.m) || 0) + 1))
      return Array.from(c.entries()).sort((a, b) => b[1] - a[1])[0][0]
    }
    const half = Math.floor(moods.length / 2)
    const a = dom(moods.slice(0, half))
    const b = dom(moods.slice(half))
    if (a !== b) {
      spikes.push({
        day: dayKey(new Date(moods[half].t)),
        kind: 'mood-shift',
        detail: `dominant mood moved ${a.toUpperCase()} → ${b.toUpperCase()}`,
      })
    }
  }
  return spikes.sort((x, y) => (x.day < y.day ? -1 : 1))
}

export function compressLogs(
  logs: CompressibleLog[],
  period: StoryPeriod,
  now: Date = new Date(),
  maxSamples = 6
): StoryDigest {
  const window = periodWindow(period, now)
  const inWin = logs.filter(l => {
    const t = toDate(l.createdAt).getTime()
    return t >= window.from.getTime() && t <= window.to.getTime()
  })
  const journal = inWin
    .filter(l => JOURNAL_EVENTS.includes(l.event) && (l.text || '').trim())
    .sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())

  const activeKeys = new Set(journal.map(l => dayKey(toDate(l.createdAt))))
  const windowDays = PERIOD_DAYS[period]
  const { current, longest } = streaks(activeKeys, now, windowDays)

  const moodCount = new Map<string, number>()
  inWin.filter(l => MOOD_EVENTS.includes(l.event)).forEach(l => {
    const m = String(l.metadata?.emotionalState || '').toLowerCase()
    if (m) moodCount.set(m, (moodCount.get(m) || 0) + 1)
  })

  const careAnswers = inWin
    .filter(l => CARE_EVENTS.includes(l.event))
    .map(l => {
      const q = String(l.metadata?.question || '')
      const a = String(l.metadata?.option || l.metadata?.answer || '')
      return q && a ? `${q}: ${a}` : ''
    })
    .filter(Boolean)
    .slice(-5)

  const temps: number[] = []
  const cities = new Map<string, number>()
  const conds = new Map<string, number>()
  journal.forEach(l => {
    const c = l.context || {}
    if (typeof c.temperature === 'number') temps.push(tempToC(c.temperature))
    if (c.city) cities.set(String(c.city), (cities.get(String(c.city)) || 0) + 1)
    if (c.weatherDescription) conds.set(String(c.weatherDescription), (conds.get(String(c.weatherDescription)) || 0) + 1)
  })
  const top = (m: Map<string, number>, n: number) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0])

  // even sample across the window so the digest stays bounded
  const samples: StoryDigest['sampleEntries'] = []
  if (journal.length) {
    const step = Math.max(1, Math.floor(journal.length / maxSamples))
    for (let i = journal.length - 1; i >= 0 && samples.length < maxSamples; i -= step) {
      samples.unshift({ day: dayKey(toDate(journal[i].createdAt)), text: (journal[i].text || '').slice(0, 200) })
    }
  }

  return {
    period,
    from: window.from.toISOString(),
    to: window.to.toISOString(),
    entryCount: journal.length,
    wordCount: journal.reduce((n, l) => n + words(l.text), 0),
    activeDays: activeKeys.size,
    windowDays,
    currentStreak: current,
    longestStreak: longest,
    moods: Array.from(moodCount.entries()).map(([mood, count]) => ({ mood, count })).sort((a, b) => b.count - a.count),
    careAnswers,
    environment: {
      avgTempC: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null,
      cities: top(cities, 2),
      conditions: top(conds, 3),
    },
    spikes: detectSpikes(inWin, window),
    sampleEntries: samples,
  }
}

// ----------------------------------------------------------------------------
// ARCADE — gamified evolution of the user. Self-care framing: XP rewards
// showing up and reflecting, never intensity, volume-shaming, or perfection.
// ----------------------------------------------------------------------------

export const ARCADE_RANKS = [
  { rank: 'ROOKIE',    minXp: 0 },
  { rank: 'OBSERVER',  minXp: 50 },
  { rank: 'OPERATOR',  minXp: 200 },
  { rank: 'NAVIGATOR', minXp: 600 },
  { rank: 'ARCHIVIST', minXp: 1500 },
  { rank: 'ORACLE',    minXp: 4000 },
] as const

export interface ArcadeStatus {
  rank: string
  level: number
  xp: number
  nextRank: string | null
  xpToNext: number
}

/**
 * XP model (lifetime): 10 per journal entry (capped 3/day so bursts do not
 * out-earn consistency), 25 per active-day streak step beyond day 1 capped
 * at 7, 15 per mood/care check-in, 40 per generated story.
 */
export function computeXp(input: {
  entriesCappedPerDay: number
  bestStreak: number
  checkins: number
  stories: number
}): number {
  return (
    input.entriesCappedPerDay * 10 +
    Math.min(Math.max(input.bestStreak - 1, 0), 7) * 25 +
    input.checkins * 15 +
    input.stories * 40
  )
}

export function arcadeStatus(xp: number): ArcadeStatus {
  let idx = 0
  ARCADE_RANKS.forEach((r, i) => { if (xp >= r.minXp) idx = i })
  const next = ARCADE_RANKS[idx + 1]
  return {
    rank: ARCADE_RANKS[idx].rank,
    level: idx + 1,
    xp,
    nextRank: next ? next.rank : null,
    xpToNext: next ? next.minXp - xp : 0,
  }
}

export function lifetimeXp(logs: CompressibleLog[]): number {
  const perDay = new Map<string, number>()
  const active = new Set<string>()
  let checkins = 0
  let stories = 0
  for (const l of logs) {
    const k = dayKey(toDate(l.createdAt))
    if (JOURNAL_EVENTS.includes(l.event)) {
      perDay.set(k, Math.min(3, (perDay.get(k) || 0) + 1))
      active.add(k)
    } else if (MOOD_EVENTS.includes(l.event) || CARE_EVENTS.includes(l.event)) checkins++
    else if (l.event === 'generated_story') stories++
  }
  let best = 0
  let run = 0
  let prev: number | null = null
  Array.from(active).sort().forEach(k => {
    const t = new Date(k).getTime()
    run = prev !== null && t - prev === DAY_MS ? run + 1 : 1
    prev = t
    if (run > best) best = run
  })
  let entries = 0
  perDay.forEach(n => (entries += n))
  return computeXp({ entriesCappedPerDay: entries, bestStreak: best, checkins, stories })
}

// ----------------------------------------------------------------------------
// PROMPT — bounded digest → Together AI
// ----------------------------------------------------------------------------

const PERIOD_FRAME: Record<StoryPeriod, string> = {
  day: 'the last day',
  week: 'the last week',
  month: 'the last month',
  year: 'the last year',
}

export function buildCompressionPrompt(d: StoryDigest, userWords: string, stateBlock: string, rank: ArcadeStatus): string {
  const words = d.period === 'day' ? '80-140' : d.period === 'week' ? '120-200' : '160-260'
  const spikes = d.spikes.length ? d.spikes.map(s => `- ${s.day} ${s.kind}: ${s.detail}`).join('\n') : '- (none detected)'
  return `You are the Story module of LOT Systems — a personal operating system for self-care. You compress ${PERIOD_FRAME[d.period]} of the operator's own data into a short story that is read back to them.

RULES:
- Second person ("You..."), ${words} words, plain prose, no title, no preamble, no lists.
- Use ONLY facts in the DIGEST. Never invent events, people, diagnoses or numbers.
- Surface one high and one low if the data supports it; otherwise say the data is quiet. Name any SPIKE or pattern change gently, as an observation, never a judgement.
- Silence or gaps are not failure. Acknowledge them with compassion.
- Not medical advice. If entries suggest crisis, say only: you are not alone, please reach out to someone you trust or a local crisis line.
- Close with ONE quiet forward-looking sentence. No pep talk. No gamification language in the prose (rank is shown separately).

DIGEST (${d.period.toUpperCase()}, ${d.from.slice(0, 10)} → ${d.to.slice(0, 10)}):
- entries: ${d.entryCount}, words: ${d.wordCount}, active days: ${d.activeDays}/${d.windowDays}
- streak: current ${d.currentStreak}, longest ${d.longestStreak}
- moods: ${d.moods.map(m => `${m.mood} x${m.count}`).join(', ') || 'no data'}
- environment: avg ${d.environment.avgTempC ?? '—'}°C; places ${d.environment.cities.join(', ') || '—'}; sky ${d.environment.conditions.join(', ') || '—'}
- self-care answers: ${d.careAnswers.join(' | ') || 'none'}
${stateBlock ? stateBlock + '\n' : ''}SPIKES / PATTERN CHANGES:
${spikes}

SAMPLED ENTRIES (verbatim, oldest first):
${d.sampleEntries.map(e => `- [${e.day}] ${e.text.replace(/\s+/g, ' ')}`).join('\n') || '- (none)'}

OPERATOR'S OWN WORDS WITH THE COMMAND: "${userWords || '(none)'}"
(operator is currently ${rank.rank}; do not mention it)`
}
