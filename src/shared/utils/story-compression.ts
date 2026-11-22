/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION ENGINE (SCE) — v1
 *
 * Pure, dependency-free compression of a user's Log stream into a
 * time-scoped digest (day / week / month / year). This is the
 * deterministic stage of the pipeline:
 *
 *   LOT User data → [SCE digest] → Quantum Intent Engine → Together AI → stored story
 *
 * The digest is computed BEFORE any AI call so that:
 *   1. The AI vendor receives compressed signal, not raw journal text dumps.
 *   2. A useful story exists even when the AI vendor is offline (fallback).
 *   3. Peaks (high / low) and pattern changes are detected by code, not guessed.
 *
 * Shared between server (/api/story) and client (/level, /story preview).
 * No stores, no DOM, no Node APIs.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

export const SCOPE_DAYS: Record<StoryScope, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Minimal log shape the engine needs. Compatible with `Log` from #shared/types. */
export interface CompressibleLog {
  id?: string
  text?: string | null
  event: string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

export interface StoryPeak {
  kind: 'high' | 'low'
  at: string // ISO timestamp
  score: number // -1..1 valence
  excerpt: string
  city?: string | null
}

export interface PatternShift {
  signal: 'entries' | 'valence' | 'night-writing'
  direction: 'up' | 'down'
  magnitude: number // ratio or delta, see `signal`
  label: string
}

export interface StoryDigest {
  scope: StoryScope
  from: string
  to: string
  entries: number
  words: number
  activeDays: number
  windowDays: number
  streak: number
  dominantPhase: string | null
  phases: Record<string, number>
  cities: string[]
  tempRangeC: [number, number] | null
  weather: string | null
  moonPhase: string | null
  moods: Record<string, number>
  dominantMood: string | null
  valence: number // mean -1..1
  themes: string[]
  peaks: StoryPeak[]
  shifts: PatternShift[]
}

// ─────────────────────────────────────────────────────────────────────
// Scope parsing
// ─────────────────────────────────────────────────────────────────────

const SCOPE_ALIASES: Record<string, StoryScope> = {
  day: 'day', today: 'day', d: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

/**
 * `/story`        → week (default compression horizon)
 * `/story day`    → day
 * `/story month`  → month   (aliases: m, 30d)
 */
export function parseStoryScope(text: string, fallback: StoryScope = 'week'): StoryScope {
  if (!text) return fallback
  const m = text.match(/(?:^|\s)\/story(?:\s+([a-z0-9]+))?/i)
  if (!m || !m[1]) return fallback
  return SCOPE_ALIASES[m[1].toLowerCase()] || fallback
}

/** Removes the command (and scope word) from the log text. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(\s+(day|today|d|24h|week|w|7d|month|m|30d|year|y|365d))?\b/gi, ' ')
    .replace(/📖/g, '')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────
// Journal text hygiene
// ─────────────────────────────────────────────────────────────────────

export const JOURNAL_EVENTS = ['note', 'journal', 'log_entry']
export const MOOD_EVENTS = ['emotional_checkin']
export const SELF_CARE_EVENTS = ['self_care', 'self_care_checkin', 'energy_checkin', 'answer', 'memory_answer']

/**
 * Generated system output (📖 story, 🕯️ scripture) is appended to the
 * note text. It must NOT feed back into compression or the story would
 * eventually be summarising itself.
 */
export function cleanJournalText(text: string | null | undefined): string {
  if (!text) return ''
  const lines = text.split('\n')
  const out: string[] = []
  let skipping = false
  for (const raw of lines) {
    const line = raw.trim()
    if (/^(📖|🕯️|🕯)/.test(line)) { skipping = true; continue }
    if (skipping && line === '') continue
    if (skipping && line) skipping = false
    // Drop slash-command tokens
    const cleaned = raw.replace(/(^|\s)\/[a-z][a-z0-9-]*\b/gi, ' ').trim()
    if (cleaned) out.push(cleaned)
  }
  return out.join('\n').trim()
}

// ─────────────────────────────────────────────────────────────────────
// Valence (tiny lexicon — deterministic, multilingual-safe fallback)
// ─────────────────────────────────────────────────────────────────────

const POSITIVE = [
  'good', 'great', 'calm', 'happy', 'grateful', 'gratitude', 'love', 'peace', 'peaceful',
  'rested', 'energized', 'energy', 'strong', 'clear', 'joy', 'beautiful', 'proud', 'light',
  'won', 'win', 'shipped', 'done', 'finished', 'better', 'best', 'relaxed', 'warm', 'thank',
  'focused', 'inspired', 'excited', 'hopeful', 'free', 'smile', 'laugh', 'walk', 'swim', 'sun',
]
const NEGATIVE = [
  'bad', 'tired', 'exhausted', 'sad', 'angry', 'anxious', 'anxiety', 'stress', 'stressed',
  'lonely', 'alone', 'sick', 'pain', 'hurt', 'lost', 'fear', 'afraid', 'worried', 'worry',
  'cry', 'cried', 'heavy', 'dark', 'fail', 'failed', 'broke', 'broken', 'overwhelmed',
  'insomnia', 'headache', 'burnout', 'numb', 'empty', 'frustrated', 'hate', 'cold', 'late',
]

const POSITIVE_MOODS = ['joyful', 'happy', 'calm', 'grateful', 'energized', 'content', 'peaceful', 'excited', 'hopeful', 'inspired', 'good']
const NEGATIVE_MOODS = ['sad', 'anxious', 'stressed', 'tired', 'angry', 'lonely', 'overwhelmed', 'exhausted', 'frustrated', 'low', 'bad']

export function textValence(text: string): number {
  if (!text) return 0
  const words = text.toLowerCase().match(/[a-z']+/g) || []
  if (!words.length) return 0
  let pos = 0
  let neg = 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const negated = i > 0 && /^(not|no|never|don't|isn't|wasn't|didn't)$/.test(words[i - 1])
    if (POSITIVE.includes(w)) negated ? neg++ : pos++
    else if (NEGATIVE.includes(w)) negated ? pos++ : neg++
  }
  const total = pos + neg
  if (!total) return 0
  return Math.max(-1, Math.min(1, (pos - neg) / total))
}

export function moodValence(mood: string | null | undefined): number {
  const m = (mood || '').toLowerCase()
  if (POSITIVE_MOODS.includes(m)) return 1
  if (NEGATIVE_MOODS.includes(m)) return -1
  return 0
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set((
  'the a an and or but if then so to of in on at for with from by is am are was were be been ' +
  'it its this that these those i me my mine you your we our they them their he she his her ' +
  'just very really today yesterday tomorrow have has had do did does not no yes can could ' +
  'will would should about into out up down over again more most some any all what when ' +
  'where who why how there here than too also like get got go went going one two time day'
).split(' '))

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function phaseOfDay(hour: number): string {
  if (hour < 4) return 'night'
  if (hour < 6) return 'pre-dawn'
  if (hour < 9) return 'morning'
  if (hour < 12) return 'late-morning'
  if (hour < 14) return 'midday'
  if (hour < 17) return 'afternoon'
  if (hour < 20) return 'evening'
  return 'late-evening'
}

function toCelsius(f: number): number {
  return ((f - 32) * 5) / 9
}

function topKey(rec: Record<string, number>): string | null {
  let best: string | null = null
  let n = 0
  for (const k of Object.keys(rec)) if (rec[k] > n) { n = rec[k]; best = k }
  return best
}

function excerpt(text: string, max = 96): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? flat.slice(0, max - 1).trimEnd() + '…' : flat
}

/** Consecutive days with ≥1 journal entry, ending today or yesterday. */
export function journalStreak(logs: CompressibleLog[], now: Date = new Date()): number {
  const days = new Set(
    logs
      .filter(l => JOURNAL_EVENTS.includes(l.event) && cleanJournalText(l.text))
      .map(l => dayKey(toDate(l.createdAt)))
  )
  const cursor = new Date(now)
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

// ─────────────────────────────────────────────────────────────────────
// Compression
// ─────────────────────────────────────────────────────────────────────

interface WindowStats {
  entries: number
  valence: number
  nightShare: number
}

function windowStats(logs: CompressibleLog[]): WindowStats {
  const journal = logs.filter(l => JOURNAL_EVENTS.includes(l.event))
  const texts = journal.map(l => cleanJournalText(l.text)).filter(Boolean)
  const vals = texts.map(textValence)
  logs.filter(l => MOOD_EVENTS.includes(l.event)).forEach(l => vals.push(moodValence(l.metadata?.emotionalState)))
  const night = journal.filter(l => {
    const h = toDate(l.createdAt).getHours()
    return h >= 23 || h < 4
  }).length
  return {
    entries: texts.length,
    valence: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
    nightShare: journal.length ? night / journal.length : 0,
  }
}

/**
 * Compress the log stream into a digest for `scope`, ending at `now`.
 * `logs` may include entries older than the window — the immediately
 * preceding window of equal length is used as the baseline for
 * pattern-shift detection (spikes / drops).
 */
export function compressLogs(
  logs: CompressibleLog[],
  scope: StoryScope,
  now: Date = new Date()
): StoryDigest {
  const windowDays = SCOPE_DAYS[scope]
  const toMs = now.getTime()
  const fromMs = toMs - windowDays * 86400000
  const prevFromMs = fromMs - windowDays * 86400000

  const inWindow = logs.filter(l => {
    const t = toDate(l.createdAt).getTime()
    return t > fromMs && t <= toMs
  })
  const prevWindow = logs.filter(l => {
    const t = toDate(l.createdAt).getTime()
    return t > prevFromMs && t <= fromMs
  })

  const journal = inWindow
    .filter(l => JOURNAL_EVENTS.includes(l.event))
    .map(l => ({ log: l, text: cleanJournalText(l.text) }))
    .filter(x => x.text)

  const phases: Record<string, number> = {}
  const cityCount: Record<string, number> = {}
  const weatherCount: Record<string, number> = {}
  const moonCount: Record<string, number> = {}
  const temps: number[] = []
  const days = new Set<string>()
  let words = 0

  for (const l of inWindow) {
    const ctx = l.context || {}
    if (ctx.city) cityCount[ctx.city] = (cityCount[ctx.city] || 0) + 1
    if (ctx.weatherDescription) weatherCount[ctx.weatherDescription] = (weatherCount[ctx.weatherDescription] || 0) + 1
    if (ctx.astroMoonPhase) moonCount[ctx.astroMoonPhase] = (moonCount[ctx.astroMoonPhase] || 0) + 1
    if (typeof ctx.temperature === 'number') temps.push(toCelsius(ctx.temperature))
  }

  const termFreq: Record<string, number> = {}
  const peaksPool: StoryPeak[] = []

  for (const { log, text } of journal) {
    const d = toDate(log.createdAt)
    days.add(dayKey(d))
    const p = phaseOfDay(d.getHours())
    phases[p] = (phases[p] || 0) + 1
    const tokens = text.toLowerCase().match(/[a-z][a-z']{2,}/g) || []
    words += (text.match(/\S+/g) || []).length
    for (const t of tokens) if (!STOPWORDS.has(t)) termFreq[t] = (termFreq[t] || 0) + 1
    const v = textValence(text)
    if (v !== 0) {
      peaksPool.push({
        kind: v > 0 ? 'high' : 'low',
        at: d.toISOString(),
        score: Math.round(v * 100) / 100,
        excerpt: excerpt(text),
        city: log.context?.city || null,
      })
    }
  }

  const moods: Record<string, number> = {}
  const moodVals: number[] = []
  for (const l of inWindow.filter(l => MOOD_EVENTS.includes(l.event))) {
    const m = String(l.metadata?.emotionalState || '').toLowerCase()
    if (!m) continue
    moods[m] = (moods[m] || 0) + 1
    moodVals.push(moodValence(m))
    days.add(dayKey(toDate(l.createdAt)))
  }

  const allVals = [...journal.map(j => textValence(j.text)), ...moodVals]
  const valence = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0

  // Peaks: strongest high + strongest low (ties → most recent)
  const highs = peaksPool.filter(p => p.kind === 'high').sort((a, b) => b.score - a.score || b.at.localeCompare(a.at))
  const lows = peaksPool.filter(p => p.kind === 'low').sort((a, b) => a.score - b.score || b.at.localeCompare(a.at))
  const peaks: StoryPeak[] = []
  if (highs[0]) peaks.push(highs[0])
  if (lows[0]) peaks.push(lows[0])

  // Pattern shifts vs previous window
  const shifts: PatternShift[] = []
  const cur = windowStats(inWindow)
  const prev = windowStats(prevWindow)
  if (prev.entries >= 2 || cur.entries >= 3) {
    const base = Math.max(prev.entries, 1)
    const ratio = cur.entries / base
    if (ratio >= 2) shifts.push({ signal: 'entries', direction: 'up', magnitude: Math.round(ratio * 10) / 10, label: `WRITING SPIKE ×${Math.round(ratio * 10) / 10}` })
    else if (prev.entries >= 2 && ratio <= 0.5) shifts.push({ signal: 'entries', direction: 'down', magnitude: Math.round(ratio * 10) / 10, label: `WRITING DROP ×${Math.round(ratio * 10) / 10}` })
  }
  const dv = cur.valence - prev.valence
  if (prev.entries >= 2 && cur.entries >= 2 && Math.abs(dv) >= 0.4) {
    shifts.push({ signal: 'valence', direction: dv > 0 ? 'up' : 'down', magnitude: Math.round(dv * 100) / 100, label: dv > 0 ? 'TONE LIFTING' : 'TONE DARKENING' })
  }
  if (cur.entries >= 3 && cur.nightShare - prev.nightShare >= 0.3) {
    shifts.push({ signal: 'night-writing', direction: 'up', magnitude: Math.round(cur.nightShare * 100) / 100, label: 'LATE-NIGHT WRITING RISING' })
  }

  const themes = Object.entries(termFreq)
    .filter(([, n]) => n >= 2 || journal.length <= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([t]) => t)

  const cities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 3)

  return {
    scope,
    from: new Date(fromMs).toISOString(),
    to: now.toISOString(),
    entries: journal.length,
    words,
    activeDays: days.size,
    windowDays,
    streak: journalStreak(logs, now),
    dominantPhase: topKey(phases),
    phases,
    cities,
    tempRangeC: temps.length ? [Math.round(Math.min(...temps)), Math.round(Math.max(...temps))] : null,
    weather: topKey(weatherCount),
    moonPhase: topKey(moonCount),
    moods,
    dominantMood: topKey(moods),
    valence: Math.round(valence * 100) / 100,
    themes,
    peaks,
    shifts,
  }
}

// ─────────────────────────────────────────────────────────────────────
// Rendering
// ─────────────────────────────────────────────────────────────────────

function pad(label: string): string {
  return (label + '                ').slice(0, 16)
}

function valenceLabel(v: number): string {
  if (v >= 0.4) return 'BRIGHT'
  if (v >= 0.1) return 'WARM'
  if (v > -0.1) return 'LEVEL'
  if (v > -0.4) return 'HEAVY'
  return 'LOW'
}

/** Terminal-grid digest lines (monospace-friendly, uppercase labels). */
export function renderDigest(d: StoryDigest): string[] {
  const lines = [
    `${pad('SCOPE')}${d.scope.toUpperCase()} · ${d.windowDays}D`,
    `${pad('ENTRIES')}${d.entries} · ${d.words} WORDS`,
    `${pad('ACTIVE DAYS')}${d.activeDays}/${d.windowDays}`,
    `${pad('STREAK')}${d.streak}D`,
    `${pad('TONE')}${valenceLabel(d.valence)} (${d.valence >= 0 ? '+' : ''}${d.valence.toFixed(2)})`,
  ]
  if (d.dominantPhase) lines.push(`${pad('PHASE')}${d.dominantPhase.toUpperCase()}`)
  if (d.dominantMood) lines.push(`${pad('MOOD')}${d.dominantMood.toUpperCase()}`)
  if (d.cities.length) lines.push(`${pad('LOCATION')}${d.cities.join(' · ').toUpperCase()}`)
  if (d.tempRangeC) lines.push(`${pad('TEMP')}${d.tempRangeC[0]}–${d.tempRangeC[1]}°C${d.weather ? ' · ' + d.weather.toUpperCase() : ''}`)
  if (d.moonPhase) lines.push(`${pad('MOON')}${d.moonPhase.toUpperCase()}`)
  if (d.themes.length) lines.push(`${pad('THEMES')}${d.themes.join(' · ').toUpperCase()}`)
  for (const p of d.peaks) lines.push(`${pad(p.kind === 'high' ? 'HIGH PEAK' : 'LOW PEAK')}"${p.excerpt}"`)
  for (const s of d.shifts) lines.push(`${pad('SHIFT')}${s.label}`)
  return lines
}

/** Compact prompt block for the AI vendor (no raw dumps). */
export function digestToPrompt(d: StoryDigest): string {
  const parts = [
    `SCOPE: ${d.scope} (${d.windowDays} days, ${d.from.slice(0, 10)} → ${d.to.slice(0, 10)})`,
    `JOURNAL: ${d.entries} entries, ${d.words} words, ${d.activeDays}/${d.windowDays} active days, streak ${d.streak}d`,
    `TONE: ${valenceLabel(d.valence)} (${d.valence})`,
    d.dominantPhase ? `WRITES MOSTLY: ${d.dominantPhase}` : '',
    d.dominantMood ? `MOODS: ${Object.entries(d.moods).map(([m, n]) => `${m}×${n}`).join(', ')}` : '',
    d.cities.length ? `PLACES: ${d.cities.join(', ')}` : '',
    d.tempRangeC ? `ENVIRONMENT: ${d.tempRangeC[0]}–${d.tempRangeC[1]}°C${d.weather ? ', mostly ' + d.weather : ''}${d.moonPhase ? ', moon ' + d.moonPhase : ''}` : '',
    d.themes.length ? `RECURRING THEMES: ${d.themes.join(', ')}` : '',
    ...d.peaks.map(p => `${p.kind.toUpperCase()} PEAK (${p.at.slice(0, 10)}${p.city ? ', ' + p.city : ''}): "${p.excerpt}"`),
    ...d.shifts.map(s => `PATTERN SHIFT: ${s.label}`),
  ]
  return parts.filter(Boolean).join('\n')
}

/**
 * Deterministic story used when the AI vendor is offline or the user
 * has no Usership. Second person, quiet, grounded — LOT voice.
 */
export function fallbackStory(d: StoryDigest): string {
  const span = d.scope === 'day' ? 'Today' : `This ${d.scope}`
  if (d.entries === 0 && !d.dominantMood) {
    return `${span} the Log stayed quiet. Nothing is missing — silence is also a record. When you write, the machine will listen.`
  }
  const s: string[] = []
  s.push(
    `${span} you wrote ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'}` +
      (d.scope !== 'day' ? ` across ${d.activeDays} of ${d.windowDays} days` : '') +
      (d.dominantPhase ? `, mostly in the ${d.dominantPhase}` : '') +
      (d.cities[0] ? `, from ${d.cities[0]}` : '') + '.'
  )
  if (d.themes.length) s.push(`What kept returning: ${d.themes.slice(0, 3).join(', ')}.`)
  const high = d.peaks.find(p => p.kind === 'high')
  const low = d.peaks.find(p => p.kind === 'low')
  if (high) s.push(`A high point: "${high.excerpt}"`)
  if (low) s.push(`A heavier moment: "${low.excerpt}"`)
  const shift = d.shifts[0]
  if (shift) s.push(`The machine noticed a change — ${shift.label.toLowerCase()}.`)
  s.push(d.valence < -0.1 ? 'Go gently; the record holds what you cannot carry.' : 'Keep the loop small and honest.')
  return s.join(' ')
}

// ─────────────────────────────────────────────────────────────────────
// ARCADE — gamified evolution (self-care framed, no leaderboards)
// ─────────────────────────────────────────────────────────────────────

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  levelFloorXp: number
  nextLevelXp: number
  progress: number // 0..1 toward next level
  streak: number
  breakdown: { journal: number; words: number; mood: number; selfCare: number; streak: number }
}

/** Rank ladder — every rank is a stage of care, not a competitive tier. */
export const ARCADE_RANKS: { minLevel: number; rank: string }[] = [
  { minLevel: 1, rank: 'SIGNAL' },
  { minLevel: 3, rank: 'OBSERVER' },
  { minLevel: 6, rank: 'KEEPER' },
  { minLevel: 10, rank: 'NAVIGATOR' },
  { minLevel: 15, rank: 'CARTOGRAPHER' },
  { minLevel: 21, rank: 'ARCHIVIST' },
  { minLevel: 28, rank: 'ORACLE' },
  { minLevel: 36, rank: 'SAGE' },
]

/** XP needed to *reach* level n. Quadratic: 50·(n−1)². L2=50, L5=800, L10=4050. */
export function xpForLevel(n: number): number {
  return 50 * (n - 1) * (n - 1)
}

export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1)
}

export function rankForLevel(level: number): string {
  let r = ARCADE_RANKS[0].rank
  for (const step of ARCADE_RANKS) if (level >= step.minLevel) r = step.rank
  return r
}

/**
 * XP economy (anti-grind):
 *   journal entry   +10  (max 5 counted per day)
 *   words           +1 per 25 words (max 20 per entry)
 *   mood check-in   +5   (max 3 per day)
 *   self-care/answer+8   (max 5 per day)
 *   streak          +15 per streak day (current streak)
 */
export function computeArcade(logs: CompressibleLog[], now: Date = new Date()): ArcadeState {
  const perDay: Record<string, { j: number; m: number; s: number }> = {}
  const b = { journal: 0, words: 0, mood: 0, selfCare: 0, streak: 0 }
  for (const l of logs) {
    const k = dayKey(toDate(l.createdAt))
    const slot = (perDay[k] = perDay[k] || { j: 0, m: 0, s: 0 })
    if (JOURNAL_EVENTS.includes(l.event)) {
      const text = cleanJournalText(l.text)
      if (!text || slot.j >= 5) continue
      slot.j++
      b.journal += 10
      b.words += Math.min(20, Math.floor((text.match(/\S+/g) || []).length / 25))
    } else if (MOOD_EVENTS.includes(l.event)) {
      if (slot.m >= 3) continue
      slot.m++
      b.mood += 5
    } else if (SELF_CARE_EVENTS.includes(l.event)) {
      if (slot.s >= 5) continue
      slot.s++
      b.selfCare += 8
    }
  }
  const streak = journalStreak(logs, now)
  b.streak = streak * 15
  const xp = b.journal + b.words + b.mood + b.selfCare + b.streak
  const level = levelForXp(xp)
  const floor = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return {
    xp,
    level,
    rank: rankForLevel(level),
    levelFloorXp: floor,
    nextLevelXp: next,
    progress: next > floor ? (xp - floor) / (next - floor) : 1,
    streak,
    breakdown: b,
  }
}

export function renderArcade(a: ArcadeState): string[] {
  const cells = 20
  const filled = Math.round(a.progress * cells)
  const bar = '█'.repeat(filled) + '░'.repeat(cells - filled)
  return [
    `${pad('RANK')}${a.rank}`,
    `${pad('LEVEL')}${a.level}`,
    `${pad('XP')}${a.xp} / ${a.nextLevelXp}`,
    `${pad('PROGRESS')}${bar} ${Math.round(a.progress * 100)}%`,
    `${pad('STREAK')}${a.streak}D`,
    `${pad('JOURNAL')}+${a.breakdown.journal + a.breakdown.words}`,
    `${pad('MOOD')}+${a.breakdown.mood}`,
    `${pad('SELF-CARE')}+${a.breakdown.selfCare}`,
    `${pad('STREAK BONUS')}+${a.breakdown.streak}`,
  ]
}
