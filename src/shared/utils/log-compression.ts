/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMPRESSION — Quantum Intent Engine pre-processor (LCX-1)
 *
 * Pipeline position:
 *   LOT user data (Log rows + context snapshots)
 *     → [THIS MODULE] compress into a StoryDigest (deterministic, no I/O)
 *     → AI vendor processor (Together AI) writes the narrative from the digest
 *     → generated_story Log row persisted with the digest as metadata
 *
 * Why a deterministic stage first:
 *   - The vendor never sees raw history, only a bounded digest
 *     (privacy + token budget + reproducibility).
 *   - Peaks / spikes are computed by rules we own, not guessed by a model.
 *   - If the vendor is down, `fallbackStory()` still returns a truthful
 *     story built from the same digest.
 *
 * This file is PURE: no stores, no DOM, no DB, no dayjs. Both the
 * server (/api/story, /api/arcade) and the client (/system help) import it.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type StoryHorizon = 'day' | 'week' | 'month' | 'year'

export const STORY_HORIZONS: StoryHorizon[] = ['day', 'week', 'month', 'year']

/** Rolling window length per horizon, in milliseconds. */
export const HORIZON_MS: Record<StoryHorizon, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

/** The horizon one level below — its stories are fed upward (recursive compression). */
export const CHILD_HORIZON: Record<StoryHorizon, StoryHorizon | null> = {
  day: null,
  week: 'day',
  month: 'week',
  year: 'month',
}

/** Minimal log shape so the module works with Sequelize rows and plain objects. */
export interface CompressibleLog {
  id?: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

export interface StoryPeak {
  kind: 'high' | 'low'
  source: 'mood' | 'journal'
  score: number // signed, -10..+10
  at: string // ISO timestamp
  label: string // short human label, e.g. "GRATEFUL" or first words of entry
  context: string // compact context line, e.g. "14°C · Tokyo · Waxing Moon"
}

export type RhythmSignal = 'surge' | 'steady' | 'quiet' | 'silent'
export type MoodDrift = 'rising' | 'falling' | 'stable' | 'unknown'

export interface StoryDigest {
  horizon: StoryHorizon
  windowStart: string
  windowEnd: string
  counts: {
    total: number
    journal: number
    moods: number
    selfCare: number
    activeDays: number
  }
  journal: string[] // sampled excerpts, oldest → newest
  moods: { state: string; count: number }[] // most frequent first
  selfCare: string[] // "question: answer"
  environment: {
    tempC: { min: number; max: number; avg: number } | null
    humidityAvg: number | null
    cities: string[]
    weather: string | null // dominant description
    moonPhase: string | null // dominant
    zodiac: string | null // dominant western zodiac
  }
  timeOfDay: { night: number; morning: number; afternoon: number; evening: number }
  peaks: StoryPeak[] // max one high + one low, strongest
  rhythm: RhythmSignal
  moodDrift: MoodDrift
  followUp: string | null // a single machine follow-up question when a spike/drift is detected
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const JOURNAL_EVENTS = ['note', 'journal', 'log_entry']
export const MOOD_EVENTS = ['emotional_checkin']
export const SELF_CARE_EVENTS = ['memory_answer', 'answer', 'self_care_checkin', 'energy_checkin']

/** Valence for EmotionalState (shared/types). Unknown states → 0. */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, fulfilled: 2, grateful: 2, excited: 2,
  calm: 1, hopeful: 1, content: 1, peaceful: 1,
  tired: -1, restless: -1, uncertain: -1,
  anxious: -2, exhausted: -2, overwhelmed: -2,
}

// Small, conservative lexicon. Purpose is ranking peaks, not sentiment analysis.
const HIGH_WORDS = ['grateful', 'joy', 'happy', 'love', 'calm', 'peace', 'proud', 'beautiful', 'alive', 'rested', 'clear', 'free', 'thank', 'win', 'laugh']
const LOW_WORDS = ['tired', 'anxious', 'sad', 'alone', 'lonely', 'stress', 'angry', 'lost', 'hurt', 'pain', 'exhausted', 'worried', 'fear', 'sick', 'cry', "can't sleep", 'overwhelm']

const MAX_JOURNAL_SAMPLES: Record<StoryHorizon, number> = { day: 8, week: 10, month: 12, year: 14 }
const EXCERPT_CHARS = 180

// ─── Helpers ────────────────────────────────────────────────────────────────

const toMs = (d: Date | string): number => (d instanceof Date ? d.getTime() : new Date(d).getTime())

/** Commands are stripped so "/story week" never becomes story material. */
export function stripCommands(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story\s+(day|today|week|month|year|d|w|m|y)\b/gi, ' ')
    .replace(/(^|\s)\/[a-z][a-z0-9_-]*/gi, ' ')
    .replace(/📖|🎹|🎧|🌙|🕯️|🕯|🧊/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Removes prior machine output (blocks appended by /story, /prayer) so the
 * engine does not compress its own words back into the user's story.
 * A machine block starts at a line beginning with 📖 / 🕯 and runs until the
 * next blank line — the Log client appends blocks without inner blank lines
 * (see `toMachineBlock`) so the boundary is exact.
 */
export function stripMachineOutput(text: string): string {
  const out: string[] = []
  let inBlock = false
  for (const line of (text || '').split('\n')) {
    if (/^\s*(📖|🕯️|🕯)/.test(line)) { inBlock = true; continue }
    if (inBlock && line.trim() === '') { inBlock = false; continue }
    if (!inBlock) out.push(line)
  }
  return out.join('\n')
}

/** Formats machine output for appending into a Log entry: prefix + no inner blank lines. */
export function toMachineBlock(prefix: string, body: string): string {
  return `${prefix} ${(body || '').trim().replace(/\n\s*\n/g, '\n')}`
}

function mode(values: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) || 0) + 1)
  }
  let best: string | null = null
  let bestN = 0
  counts.forEach((n, v) => { if (n > bestN) { best = v; bestN = n } })
  return best
}

/** Hour of day as the user lived it: context.date is local wall-clock "YYYY-MM-DD HH:mm:ss". */
function localHour(log: CompressibleLog): number {
  const d = log.context?.date
  if (typeof d === 'string') {
    const m = d.match(/\d{4}-\d{2}-\d{2}[ T](\d{2}):/)
    if (m) return parseInt(m[1], 10)
  }
  return new Date(toMs(log.createdAt)).getUTCHours()
}

function localDay(log: CompressibleLog): string {
  const d = log.context?.date
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10)
  return new Date(toMs(log.createdAt)).toISOString().slice(0, 10)
}

export function contextLine(ctx: Record<string, any> | null | undefined): string {
  if (!ctx) return ''
  const parts: string[] = []
  if (typeof ctx.temperature === 'number') parts.push(`${Math.round(ctx.temperature - 273.15)}°C`)
  if (typeof ctx.humidity === 'number') parts.push(`${Math.round(ctx.humidity)}%`)
  if (ctx.weatherDescription) parts.push(String(ctx.weatherDescription))
  if (ctx.city) parts.push(String(ctx.city))
  if (ctx.astroMoonPhase) parts.push(String(ctx.astroMoonPhase))
  return parts.join(' · ')
}

export function journalScore(text: string): number {
  const lower = (text || '').toLowerCase()
  let score = 0
  for (const w of HIGH_WORDS) if (lower.includes(w)) score += 1
  for (const w of LOW_WORDS) if (lower.includes(w)) score -= 1
  if (/!{2,}/.test(text)) score += score >= 0 ? 1 : -1 // intensity amplifier
  return Math.max(-10, Math.min(10, score * 2))
}

function firstWords(text: string, n = 6): string {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  return words.slice(0, n).join(' ') + (words.length > n ? '…' : '')
}

// ─── Horizon parsing ────────────────────────────────────────────────────────

/**
 * "/story" → week (default). "/story day" | "/story today" → day.
 * "/story month", "/story year" as expected. Unknown args fall back to week.
 */
export function parseStoryHorizon(text: string, fallback: StoryHorizon = 'week'): StoryHorizon {
  const m = (text || '').match(/(?:^|\s)\/story(?:\s+([a-z]+))?/i)
  const arg = m?.[1]?.toLowerCase()
  if (!arg) return fallback
  if (arg === 'day' || arg === 'today' || arg === 'd') return 'day'
  if (arg === 'week' || arg === 'w') return 'week'
  if (arg === 'month' || arg === 'm') return 'month'
  if (arg === 'year' || arg === 'y') return 'year'
  return fallback
}

// ─── Compression ────────────────────────────────────────────────────────────

export function compressLogs(
  logs: CompressibleLog[],
  horizon: StoryHorizon,
  now: Date = new Date()
): StoryDigest {
  const end = now.getTime()
  const start = end - HORIZON_MS[horizon]
  const inWindow = logs
    .filter(l => {
      const t = toMs(l.createdAt)
      return t >= start && t <= end
    })
    .sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt))

  const journalLogs = inWindow.filter(l => JOURNAL_EVENTS.includes(l.event))
    .map(l => ({ log: l, clean: stripCommands(stripMachineOutput(l.text || '')) }))
    .filter(j => j.clean.length > 0)
  const moodLogs = inWindow.filter(l => MOOD_EVENTS.includes(l.event) && l.metadata?.emotionalState)
  const selfCareLogs = inWindow.filter(l => SELF_CARE_EVENTS.includes(l.event))

  // Journal sampling: evenly spaced across the window so a month digest is
  // not just "the last 10 entries". Always keep the newest entry.
  const cap = MAX_JOURNAL_SAMPLES[horizon]
  let sampled = journalLogs
  if (journalLogs.length > cap) {
    const step = journalLogs.length / cap
    sampled = Array.from({ length: cap }, (_, i) => journalLogs[Math.floor(i * step)])
    sampled[cap - 1] = journalLogs[journalLogs.length - 1]
  }
  const journal = sampled.map(j => j.clean.substring(0, EXCERPT_CHARS))

  // Moods
  const moodCounts = new Map<string, number>()
  for (const l of moodLogs) {
    const s = String(l.metadata!.emotionalState).toLowerCase()
    moodCounts.set(s, (moodCounts.get(s) || 0) + 1)
  }
  const moods = Array.from(moodCounts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)

  const selfCare = selfCareLogs
    .map(l => {
      const q = String(l.metadata?.question || '')
      const a = String(l.metadata?.option || l.metadata?.answer || '')
      return q && a ? `${q.substring(0, 80)}: ${a.substring(0, 60)}` : ''
    })
    .filter(Boolean)
    .slice(-8)

  // Environment — every click carries a context snapshot.
  const temps = inWindow
    .map(l => l.context?.temperature)
    .filter((t): t is number => typeof t === 'number')
    .map(k => k - 273.15)
  const hums = inWindow.map(l => l.context?.humidity).filter((h): h is number => typeof h === 'number')
  const environment: StoryDigest['environment'] = {
    tempC: temps.length
      ? {
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
          avg: Math.round(temps.reduce((s, t) => s + t, 0) / temps.length),
        }
      : null,
    humidityAvg: hums.length ? Math.round(hums.reduce((s, h) => s + h, 0) / hums.length) : null,
    cities: Array.from(new Set(inWindow.map(l => l.context?.city).filter(Boolean) as string[])).slice(0, 5),
    weather: mode(inWindow.map(l => l.context?.weatherDescription)),
    moonPhase: mode(inWindow.map(l => l.context?.astroMoonPhase)),
    zodiac: mode(inWindow.map(l => l.context?.astroWesternZodiac)),
  }

  // Time of day — of journal + mood entries (intentional acts, not passive events)
  const timeOfDay = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  for (const l of [...journalLogs.map(j => j.log), ...moodLogs]) {
    const h = localHour(l)
    if (h < 5) timeOfDay.night++
    else if (h < 12) timeOfDay.morning++
    else if (h < 17) timeOfDay.afternoon++
    else if (h < 22) timeOfDay.evening++
    else timeOfDay.night++
  }

  // Peaks — strongest high + strongest low across moods and journal.
  const candidates: StoryPeak[] = []
  for (const l of moodLogs) {
    const state = String(l.metadata!.emotionalState).toLowerCase()
    const intensity = typeof l.metadata?.intensity === 'number' ? l.metadata.intensity : 5
    const score = Math.round((MOOD_VALENCE[state] || 0) * (intensity / 5) * 2.5)
    if (score === 0) continue
    candidates.push({
      kind: score > 0 ? 'high' : 'low',
      source: 'mood',
      score,
      at: new Date(toMs(l.createdAt)).toISOString(),
      label: state.toUpperCase(),
      context: contextLine(l.context),
    })
  }
  for (const j of journalLogs) {
    const score = journalScore(j.clean)
    if (score === 0) continue
    candidates.push({
      kind: score > 0 ? 'high' : 'low',
      source: 'journal',
      score,
      at: new Date(toMs(j.log.createdAt)).toISOString(),
      label: firstWords(j.clean),
      context: contextLine(j.log.context),
    })
  }
  const high = candidates.filter(c => c.kind === 'high').sort((a, b) => b.score - a.score)[0]
  const low = candidates.filter(c => c.kind === 'low').sort((a, b) => a.score - b.score)[0]
  const peaks = [high, low].filter(Boolean) as StoryPeak[]

  // Rhythm — recent quarter of the window vs the rest, entries per ms.
  const activeLogs = [...journalLogs.map(j => j.log), ...moodLogs, ...selfCareLogs]
  const rhythm = computeRhythm(activeLogs, start, end)

  // Mood drift — mean valence of first half vs second half.
  const moodDrift = computeMoodDrift(moodLogs)

  const activeDays = new Set(activeLogs.map(localDay)).size

  const digest: StoryDigest = {
    horizon,
    windowStart: new Date(start).toISOString(),
    windowEnd: new Date(end).toISOString(),
    counts: {
      total: inWindow.length,
      journal: journalLogs.length,
      moods: moodLogs.length,
      selfCare: selfCareLogs.length,
      activeDays,
    },
    journal,
    moods,
    selfCare,
    environment,
    timeOfDay,
    peaks,
    rhythm,
    moodDrift,
    followUp: null,
  }
  digest.followUp = followUpQuestion(digest)
  return digest
}

export function computeRhythm(logs: CompressibleLog[], start: number, end: number): RhythmSignal {
  if (logs.length === 0) return 'silent'
  const span = end - start
  const split = end - span / 4
  const recent = logs.filter(l => toMs(l.createdAt) >= split).length
  const earlier = logs.length - recent
  const recentRate = recent / (span / 4)
  const earlierRate = earlier / ((span * 3) / 4)
  if (logs.length < 3) return recent > 0 ? 'steady' : 'quiet'
  if (earlierRate === 0) return recent > 0 ? 'surge' : 'quiet'
  const ratio = recentRate / earlierRate
  if (ratio >= 2) return 'surge'
  if (ratio <= 0.34) return 'quiet'
  return 'steady'
}

export function computeMoodDrift(moodLogs: CompressibleLog[]): MoodDrift {
  const vals = moodLogs
    .map(l => MOOD_VALENCE[String(l.metadata?.emotionalState || '').toLowerCase()])
    .filter((v): v is number => typeof v === 'number')
  if (vals.length < 4) return 'unknown'
  const half = Math.floor(vals.length / 2)
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
  const delta = avg(vals.slice(half)) - avg(vals.slice(0, half))
  if (delta >= 0.75) return 'rising'
  if (delta <= -0.75) return 'falling'
  return 'stable'
}

/**
 * The machine asks first. One question, only when the digest shows a
 * spike or a pattern change. Null means: stay quiet.
 */
export function followUpQuestion(d: StoryDigest): string | null {
  const low = d.peaks.find(p => p.kind === 'low')
  if (d.moodDrift === 'falling' && low) {
    return `Your mood has been trending down since "${low.label}". What changed around then?`
  }
  if (d.rhythm === 'quiet' && d.counts.journal > 0) {
    return 'You have been quieter than usual. Is it rest, or is something taking your attention?'
  }
  if (d.rhythm === 'surge') {
    return 'You are writing more than usual. What is asking to be recorded right now?'
  }
  if (d.moodDrift === 'rising') {
    const high = d.peaks.find(p => p.kind === 'high')
    return high
      ? `Something lifted — "${high.label}". What would keep it going?`
      : 'Your mood is rising. What is working?'
  }
  return null
}

// ─── Prompt rendering ───────────────────────────────────────────────────────

/** Compact, vendor-facing data block. No IDs, no emails, no raw timestamps beyond the peak date. */
export function renderDigestBlock(d: StoryDigest): string {
  const env = d.environment
  const envParts: string[] = []
  if (env.tempC) envParts.push(`temp ${env.tempC.min}–${env.tempC.max}°C (avg ${env.tempC.avg})`)
  if (env.humidityAvg !== null) envParts.push(`humidity ~${env.humidityAvg}%`)
  if (env.weather) envParts.push(`mostly ${env.weather}`)
  if (env.cities.length) envParts.push(`in ${env.cities.join(', ')}`)
  if (env.moonPhase) envParts.push(`moon: ${env.moonPhase}`)
  if (env.zodiac) envParts.push(`season: ${env.zodiac}`)

  const tod = d.timeOfDay
  const todTop = (Object.entries(tod) as [string, number][]).sort((a, b) => b[1] - a[1])[0]

  return [
    `HORIZON: ${d.horizon.toUpperCase()} (rolling)`,
    `ACTIVITY: ${d.counts.journal} journal entries, ${d.counts.moods} mood check-ins, ${d.counts.selfCare} self-care answers across ${d.counts.activeDays} active day(s)`,
    `RHYTHM: ${d.rhythm.toUpperCase()} · MOOD DRIFT: ${d.moodDrift.toUpperCase()}`,
    todTop && todTop[1] > 0 ? `MOST ACTIVE: ${todTop[0]}` : 'MOST ACTIVE: —',
    `ENVIRONMENT: ${envParts.join('; ') || 'no context recorded'}`,
    `MOODS: ${d.moods.slice(0, 5).map(m => `${m.state}×${m.count}`).join(', ') || 'none'}`,
    'PEAKS:',
    ...(d.peaks.length
      ? d.peaks.map(p => `- ${p.kind.toUpperCase()} (${p.source}) "${p.label}" ${p.context ? `[${p.context}]` : ''} on ${p.at.slice(0, 10)}`)
      : ['- none detected']),
    'JOURNAL (oldest → newest):',
    ...(d.journal.length ? d.journal.map(j => `- ${j}`) : ['- (none)']),
    'SELF-CARE:',
    ...(d.selfCare.length ? d.selfCare.map(s => `- ${s}`) : ['- (none)']),
  ].join('\n')
}

/** Header strip rendered above the story in the Log (terminal grid style). */
export function renderDigestHeader(d: StoryDigest): string {
  const peaks = d.peaks.map(p => `${p.kind === 'high' ? '▲' : '▼'} ${p.label}`).join('  ')
  return [
    `STORY ${d.horizon.toUpperCase()}  ·  ${d.counts.journal} ENTRIES  ·  ${d.counts.activeDays} DAYS  ·  ${d.rhythm.toUpperCase()}`,
    peaks || null,
  ].filter(Boolean).join('\n')
}

/**
 * Deterministic story when the AI vendor is unreachable. Truthful by
 * construction: every sentence is derived from the digest.
 */
export function fallbackStory(d: StoryDigest): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[d.horizon]
  if (d.counts.journal + d.counts.moods + d.counts.selfCare === 0) {
    return `Nothing recorded ${span} yet. The record starts with the next entry.`
  }
  const s: string[] = []
  s.push(`You recorded ${d.counts.journal} ${d.counts.journal === 1 ? 'entry' : 'entries'} ${span}, across ${d.counts.activeDays} ${d.counts.activeDays === 1 ? 'day' : 'days'}.`)
  const env = d.environment
  if (env.tempC || env.cities.length) {
    const where = env.cities.length ? ` in ${env.cities[0]}` : ''
    const temp = env.tempC ? ` around ${env.tempC.avg}°C` : ''
    s.push(`Mostly${where}${temp}${env.moonPhase ? `, under a ${env.moonPhase}` : ''}.`)
  }
  if (d.moods.length) s.push(`The most frequent state was ${d.moods[0].state}.`)
  const high = d.peaks.find(p => p.kind === 'high')
  const low = d.peaks.find(p => p.kind === 'low')
  if (high) s.push(`A high point: "${high.label}".`)
  if (low) s.push(`A low point: "${low.label}".`)
  if (d.rhythm === 'quiet') s.push('Lately you have been quieter.')
  if (d.rhythm === 'surge') s.push('Lately you have been writing more.')
  s.push('The record keeps going.')
  return s.join(' ')
}

// ─── Arcade — gamified evolution (self-care, never punitive) ───────────────

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  nextLevelXp: number
  progress: number // 0..1 within current level
  streakDays: number
  lastActiveDay: string | null
}

/**
 * XP is awarded for presence, not performance. No XP is ever removed and a
 * broken streak only resets the streak counter — this is self-care, not a
 * leaderboard. Weights: journal 10, mood check-in 5, self-care answer 5,
 * generated story read 15 (closing the loop).
 */
export const ARCADE_XP: Record<string, number> = {
  note: 10, journal: 10, log_entry: 10,
  emotional_checkin: 5,
  memory_answer: 5, answer: 5, self_care_checkin: 5, energy_checkin: 5,
  generated_story: 15,
}

export const ARCADE_RANKS: { level: number; rank: string }[] = [
  { level: 1, rank: 'SIGNAL' },
  { level: 3, rank: 'OPERATOR' },
  { level: 6, rank: 'NAVIGATOR' },
  { level: 10, rank: 'ARCHIVIST' },
  { level: 15, rank: 'CARTOGRAPHER' },
  { level: 21, rank: 'STEWARD' },
  { level: 28, rank: 'ORACLE' },
  { level: 36, rank: 'SAGE' },
]

/** Level n requires 50·n·(n−1) cumulative XP: L2=100, L3=300, L4=600 … */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1)
}

export function levelForXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

export function rankForLevel(level: number): string {
  let rank = ARCADE_RANKS[0].rank
  for (const r of ARCADE_RANKS) if (level >= r.level) rank = r.rank
  return rank
}

export function computeArcade(logs: CompressibleLog[], now: Date = new Date()): ArcadeState {
  let xp = 0
  const days = new Set<string>()
  for (const l of logs) {
    const w = ARCADE_XP[l.event]
    if (!w) continue
    if (JOURNAL_EVENTS.includes(l.event) && !stripCommands(l.text || '')) continue
    xp += w
    days.add(localDay(l))
  }
  const level = levelForXp(xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)

  // Streak: consecutive days ending today or yesterday (UTC-dated fallback).
  const sorted = Array.from(days).sort().reverse()
  let streakDays = 0
  if (sorted.length) {
    const dayMs = 24 * 60 * 60 * 1000
    const today = now.toISOString().slice(0, 10)
    const yesterday = new Date(now.getTime() - dayMs).toISOString().slice(0, 10)
    if (sorted[0] === today || sorted[0] === yesterday || sorted[0] > today) {
      streakDays = 1
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1] + 'T00:00:00Z').getTime()
        const cur = new Date(sorted[i] + 'T00:00:00Z').getTime()
        if (prev - cur === dayMs) streakDays++
        else break
      }
    }
  }

  return {
    xp,
    level,
    rank: rankForLevel(level),
    nextLevelXp: next,
    progress: next > base ? (xp - base) / (next - base) : 0,
    streakDays,
    lastActiveDay: sorted[0] || null,
  }
}

export function renderArcade(a: ArcadeState): string {
  const width = 20
  const filled = Math.round(a.progress * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return [
    `RANK            ${a.rank}`,
    `LEVEL           ${a.level}`,
    `XP              ${a.xp} / ${a.nextLevelXp}`,
    `PROGRESS        ${bar}`,
    `STREAK          ${a.streakDays} ${a.streakDays === 1 ? 'DAY' : 'DAYS'}`,
    'RULE            PRESENCE EARNS XP · NOTHING IS EVER TAKEN AWAY',
  ].join('\n')
}
