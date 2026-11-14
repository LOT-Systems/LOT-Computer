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
 * Pure, deterministic compression of a user's context-stamped records
 * (Journal / Log entries, mood check-ins, Memory answers, self-care
 * events) into a compact "Story Packet" for a chosen horizon:
 *
 *     DAY (24h) · WEEK (7d) · MONTH (30d) · YEAR (365d)
 *
 * Pipeline position:
 *
 *   LOT User data ─▶ [SCE: this module] ─▶ Quantum Intent framing
 *                 ─▶ AI vendor processor (Together AI) ─▶ generated_story log
 *
 * The packet is the ONLY thing the AI vendor sees. Raw records never
 * leave the server; the packet is a bounded, lossy compression
 * (excerpts are truncated, counts are aggregated). If the vendor is
 * offline, `composeFallbackStory()` writes the story locally from the
 * same packet so `/story` never returns an empty response.
 *
 * No stores, no DOM, no DB, no network — safe to import from client,
 * server, scripts and tests.
 */

// ─── Types ────────────────────────────────────────────────────────────

export type StoryHorizon = 'day' | 'week' | 'month' | 'year'

export interface StoryHorizonSpec {
  key: StoryHorizon
  days: number
  label: string // Upper-case terminal label
  noun: string // Used in prose: "your week"
}

export const STORY_HORIZONS: Record<StoryHorizon, StoryHorizonSpec> = {
  day: { key: 'day', days: 1, label: 'DAY', noun: 'day' },
  week: { key: 'week', days: 7, label: 'WEEK', noun: 'week' },
  month: { key: 'month', days: 30, label: 'MONTH', noun: 'month' },
  year: { key: 'year', days: 365, label: 'YEAR', noun: 'year' },
}

export const STORY_HORIZON_ORDER: StoryHorizon[] = ['day', 'week', 'month', 'year']

/** Minimal shape of a Log row — matches the Sequelize model's JSON. */
export interface StoryLogInput {
  createdAt: string | Date
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  context?: {
    city?: string | null
    temperature?: number | null // Kelvin (as stored by getLogContext)
    humidity?: number | null
    astroMoonPhase?: string | null
    astroWesternZodiac?: string | null
    weatherDescription?: string | null
  } | null
}

export type SignalKind = 'journal' | 'mood' | 'answer' | 'selfcare'

export interface StoryPeak {
  at: string // ISO
  kind: SignalKind
  label: string // e.g. "OVERWHELMED" or "JOURNAL"
  valence: number // -3 … +3
  excerpt: string
  city: string | null
}

export interface StoryPacket {
  version: 1
  horizon: StoryHorizon
  windowStart: string
  windowEnd: string
  counts: { journal: number; mood: number; answer: number; selfcare: number; total: number }
  activeDays: number
  windowDays: number
  longestStreak: number
  words: number
  journal: { at: string; text: string; city: string | null; tempC: number | null; moon: string | null }[]
  moods: {
    dominant: string | null
    distribution: Record<string, number>
    trajectory: 'rising' | 'falling' | 'steady' | 'unknown'
    meanValence: number | null
  }
  answers: string[]
  peaks: { high: StoryPeak | null; low: StoryPeak | null; spike: boolean }
  context: {
    cities: string[]
    avgTempC: number | null
    avgHumidity: number | null
    dominantMoon: string | null
    dominantZodiac: string | null
  }
  arcade: ArcadeSummary
  followUp: string | null
  compression: { rawChars: number; packetChars: number; ratio: number }
}

export interface ArcadeSummary {
  xp: number
  level: number
  rank: string
  nextLevelXp: number
  progress: number // 0..1 toward next level
  breakdown: { journal: number; mood: number; answer: number; selfcare: number; days: number; streak: number }
}

// ─── Event classification ─────────────────────────────────────────────

/** Event names as actually written to the `logs` table. */
export const JOURNAL_EVENTS = ['note', 'journal', 'log_entry']
export const MOOD_EVENTS = ['emotional_checkin']
export const ANSWER_EVENTS = ['answer', 'memory_answer']
export const SELFCARE_EVENTS = ['self_care_checkin', 'energy_checkin', 'selfcare', 'self_care']

/** Events that are machine output and must never feed back into a story. */
const EXCLUDED_EVENTS = ['generated_story', 'prayer_scripture']

export function classifyEvent(event: string): SignalKind | null {
  if (EXCLUDED_EVENTS.includes(event)) return null
  if (JOURNAL_EVENTS.includes(event)) return 'journal'
  if (MOOD_EVENTS.includes(event)) return 'mood'
  if (ANSWER_EVENTS.includes(event)) return 'answer'
  if (SELFCARE_EVENTS.includes(event)) return 'selfcare'
  return null
}

// ─── Valence ──────────────────────────────────────────────────────────

/** Mood → valence on a −2 … +2 scale. Mirrors EmotionalState in #shared/types. */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2,
  hopeful: 1, content: 1, calm: 1, peaceful: 1,
  uncertain: -1, tired: -1, restless: -1,
  anxious: -2, overwhelmed: -2, exhausted: -2,
}

const POSITIVE_WORDS = [
  'grateful', 'happy', 'calm', 'peace', 'peaceful', 'love', 'loved', 'joy', 'rested', 'strong',
  'clear', 'proud', 'good', 'great', 'beautiful', 'energized', 'light', 'free', 'thankful', 'win',
]
const NEGATIVE_WORDS = [
  'tired', 'anxious', 'anxiety', 'sad', 'angry', 'stress', 'stressed', 'lost', 'alone', 'lonely',
  'exhausted', 'sick', 'pain', 'fear', 'afraid', 'overwhelmed', 'bad', 'heavy', 'cry', 'hurt',
]

/**
 * Lightweight lexicon valence for free text, clamped to −2 … +2.
 * Inferred text valence is deliberately capped below explicit mood
 * self-reports (which reach ±3 with intensity): what the user SAYS they
 * feel outranks what a word list guesses.
 */
export function textValence(text: string): number {
  if (!text) return 0
  const tokens = text.toLowerCase().match(/[a-z']+/g) || []
  let score = 0
  for (const t of tokens) {
    if (POSITIVE_WORDS.includes(t)) score += 1
    else if (NEGATIVE_WORDS.includes(t)) score -= 1
  }
  return Math.max(-2, Math.min(2, score))
}

function moodValence(log: StoryLogInput): number {
  const state = String(log.metadata?.emotionalState || '').toLowerCase()
  const base = MOOD_VALENCE[state] ?? 0
  // Intensity (when present, 1–10) amplifies up to 1.5×.
  const intensity = Number(log.metadata?.intensity)
  const amp = Number.isFinite(intensity) && intensity > 0 ? 1 + Math.min(intensity, 10) / 20 : 1
  return Math.max(-3, Math.min(3, base * amp))
}

// ─── Helpers ──────────────────────────────────────────────────────────

const iso = (d: string | Date) => new Date(d).toISOString()
const dayKey = (d: string | Date) => iso(d).slice(0, 10)

export function cleanText(text: string | null | undefined): string {
  return String(text || '')
    // Strip machine-appended blocks so the story never quotes itself.
    .split(/\n\s*\n?(?=📖|🕯️|🕯)/)[0]
    .replace(/(^|\s)\/[a-z][a-z0-9-]*(\s+(day|week|month|year))?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + '…'
}

function mode(values: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) || 0) + 1)
  let best: string | null = null
  let n = 0
  counts.forEach((c, k) => { if (c > n) { best = k; n = c } })
  return best
}

const kelvinToC = (k: number) => Math.round((k - 273.15) * 10) / 10

/** Evenly sample `n` items, always keeping first and last. */
function sampleEvenly<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items
  const out: T[] = []
  for (let i = 0; i < n; i++) out.push(items[Math.round((i * (items.length - 1)) / (n - 1))])
  return out
}

// ─── Horizon parsing ──────────────────────────────────────────────────

const HORIZON_ALIASES: Record<string, StoryHorizon> = {
  day: 'day', today: 'day', d: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

/**
 * Reads the horizon argument following `/story`. Returns `null` when no
 * argument is given so the caller can apply auto-horizon selection.
 *   "/story week"  → 'week'
 *   "/story"       → null
 */
export function parseStoryHorizon(text: string): StoryHorizon | null {
  const m = String(text || '').match(/\/story\s+([a-z0-9]+)/i)
  if (!m) return null
  return HORIZON_ALIASES[m[1].toLowerCase()] || null
}

/**
 * Auto-horizon: the smallest horizon holding at least `minSignals`
 * signals. A quiet day widens to the week, a quiet week to the month.
 */
export function selectAutoHorizon(
  logs: StoryLogInput[],
  now: Date = new Date(),
  minSignals = 3
): StoryHorizon {
  // Uses the same signal rules as compressStory (empty / command-only
  // entries do not count) so auto-selection never disagrees with the packet.
  for (const h of STORY_HORIZON_ORDER) {
    if (compressStory(logs, h, { now }).counts.total >= minSignals) return h
  }
  return 'year'
}

// ─── Arcade ───────────────────────────────────────────────────────────

/**
 * Arcade ranks — self-care progression, not competition. XP rewards
 * presence and honesty, never "good moods": a low check-in earns the
 * same XP as a high one.
 */
export const ARCADE_RANKS = [
  'INITIATE', 'OBSERVER', 'OPERATOR', 'NAVIGATOR', 'ARCHITECT', 'CARTOGRAPHER', 'SAGE',
]

export const ARCADE_XP = {
  journal: 10, // + up to 10 bonus for depth (1 per 20 words)
  journalDepthMax: 10,
  mood: 5,
  answer: 8,
  selfcare: 6,
  activeDay: 15,
  streakDay: 5,
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1
}

export function xpForLevel(level: number): number {
  return 50 * (level - 1) * (level - 1)
}

export function rankForLevel(level: number): string {
  return ARCADE_RANKS[Math.min(ARCADE_RANKS.length - 1, Math.floor((level - 1) / 2))]
}

export function computeArcade(input: {
  journalWordCounts: number[]
  mood: number
  answer: number
  selfcare: number
  activeDays: number
  longestStreak: number
}): ArcadeSummary {
  const breakdown = {
    journal: input.journalWordCounts.reduce(
      (s, w) => s + ARCADE_XP.journal + Math.min(ARCADE_XP.journalDepthMax, Math.floor(w / 20)),
      0
    ),
    mood: input.mood * ARCADE_XP.mood,
    answer: input.answer * ARCADE_XP.answer,
    selfcare: input.selfcare * ARCADE_XP.selfcare,
    days: input.activeDays * ARCADE_XP.activeDay,
    streak: input.longestStreak > 1 ? input.longestStreak * ARCADE_XP.streakDay : 0,
  }
  const xp = Object.values(breakdown).reduce((a, b) => a + b, 0)
  const level = levelForXp(xp)
  const floor = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return {
    xp,
    level,
    rank: rankForLevel(level),
    nextLevelXp: next,
    progress: next > floor ? (xp - floor) / (next - floor) : 0,
    breakdown,
  }
}

// ─── Core compression ─────────────────────────────────────────────────

export interface CompressOptions {
  now?: Date
  maxJournal?: number
  maxAnswers?: number
  excerptChars?: number
}

export function compressStory(
  logs: StoryLogInput[],
  horizon: StoryHorizon,
  opts: CompressOptions = {}
): StoryPacket {
  const now = opts.now || new Date()
  const maxJournal = opts.maxJournal ?? (horizon === 'day' ? 6 : horizon === 'week' ? 8 : 10)
  const maxAnswers = opts.maxAnswers ?? 6
  const excerptChars = opts.excerptChars ?? (horizon === 'year' ? 140 : 220)
  const spec = STORY_HORIZONS[horizon]
  const startMs = now.getTime() - spec.days * 86400000

  // 1. Window + classify, chronological ascending.
  const signals = logs
    .map(l => ({ log: l, kind: classifyEvent(l.event), t: new Date(l.createdAt).getTime() }))
    .filter((s): s is { log: StoryLogInput; kind: SignalKind; t: number } =>
      s.kind !== null && Number.isFinite(s.t) && s.t >= startMs && s.t <= now.getTime())
    .sort((a, b) => a.t - b.t)

  const counts = { journal: 0, mood: 0, answer: 0, selfcare: 0, total: 0 }
  const journalAll: StoryPacket['journal'] = []
  const journalWordCounts: number[] = []
  const answers: string[] = []
  const moodStates: string[] = []
  const valenced: { t: number; v: number; peak: StoryPeak }[] = []
  const cities: string[] = []
  const temps: number[] = []
  const hums: number[] = []
  const moons: string[] = []
  const zodiacs: string[] = []
  const days = new Set<string>()
  let rawChars = 0
  let words = 0

  for (const { log, kind, t } of signals) {
    const ctx = log.context || {}
    const at = iso(log.createdAt)
    const city = ctx.city || null
    if (city) cities.push(city)
    if (typeof ctx.temperature === 'number' && ctx.temperature > 0) temps.push(kelvinToC(ctx.temperature))
    if (typeof ctx.humidity === 'number') hums.push(ctx.humidity)
    if (ctx.astroMoonPhase) moons.push(ctx.astroMoonPhase)
    if (ctx.astroWesternZodiac) zodiacs.push(ctx.astroWesternZodiac)

    if (kind === 'journal') {
      const text = cleanText(log.text)
      if (!text) continue // empty / command-only entries are not signals
      rawChars += (log.text || '').length
      const w = text.split(/\s+/).length
      words += w
      journalWordCounts.push(w)
      journalAll.push({
        at,
        text: truncate(text, excerptChars),
        city,
        tempC: typeof ctx.temperature === 'number' && ctx.temperature > 0 ? kelvinToC(ctx.temperature) : null,
        moon: ctx.astroMoonPhase || null,
      })
      const v = textValence(text)
      if (v !== 0) valenced.push({ t, v, peak: { at, kind, label: 'JOURNAL', valence: v, excerpt: truncate(text, 120), city } })
    } else if (kind === 'mood') {
      const state = String(log.metadata?.emotionalState || '').toLowerCase()
      if (!state) continue
      moodStates.push(state)
      const note = cleanText(log.metadata?.note)
      rawChars += state.length + note.length
      const v = moodValence(log)
      valenced.push({ t, v, peak: { at, kind, label: state.toUpperCase(), valence: v, excerpt: note ? truncate(note, 120) : '', city } })
    } else if (kind === 'answer') {
      const q = String(log.metadata?.question || '').trim()
      const a = String(log.metadata?.answer || log.metadata?.option || '').trim()
      if (!a) continue
      rawChars += q.length + a.length
      answers.push(q ? `${truncate(q, 90)} → ${truncate(a, 60)}` : truncate(a, 60))
    } else if (kind === 'selfcare') {
      rawChars += JSON.stringify(log.metadata || {}).length
    }

    counts[kind]++
    counts.total++
    days.add(dayKey(log.createdAt))
  }

  // 2. Streak (consecutive UTC days with any signal).
  const sortedDays = Array.from(days).sort()
  let longestStreak = 0
  let run = 0
  let prev: number | null = null
  for (const d of sortedDays) {
    const ms = Date.parse(d)
    run = prev !== null && ms - prev === 86400000 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    prev = ms
  }

  // 3. Mood trajectory: mean valence of first half vs second half.
  let trajectory: StoryPacket['moods']['trajectory'] = 'unknown'
  let meanValence: number | null = null
  if (valenced.length >= 2) {
    const mid = Math.floor(valenced.length / 2)
    const mean = (xs: typeof valenced) => xs.reduce((s, x) => s + x.v, 0) / xs.length
    const a = mean(valenced.slice(0, mid))
    const b = mean(valenced.slice(mid))
    meanValence = Math.round(mean(valenced) * 100) / 100
    trajectory = b - a > 0.5 ? 'rising' : a - b > 0.5 ? 'falling' : 'steady'
  } else if (valenced.length === 1) {
    meanValence = valenced[0].v
    trajectory = 'steady'
  }

  // 4. Peaks. High = max valence (> 0), low = min valence (< 0).
  //    A spike = low peak at ≤ −2, or a ≥ 3-point swing inside the window.
  let high: StoryPeak | null = null
  let low: StoryPeak | null = null
  for (const x of valenced) {
    if (x.v > 0 && (!high || x.v >= high.valence)) high = x.peak
    if (x.v < 0 && (!low || x.v <= low.valence)) low = x.peak
  }
  const spike = !!low && (low.valence <= -2 || (!!high && high.valence - low.valence >= 3))

  const distribution: Record<string, number> = {}
  moodStates.forEach(s => { distribution[s] = (distribution[s] || 0) + 1 })

  const arcade = computeArcade({
    journalWordCounts,
    mood: counts.mood,
    answer: counts.answer,
    selfcare: counts.selfcare,
    activeDays: days.size,
    longestStreak,
  })

  const packet: StoryPacket = {
    version: 1,
    horizon,
    windowStart: new Date(startMs).toISOString(),
    windowEnd: now.toISOString(),
    counts,
    activeDays: days.size,
    windowDays: spec.days,
    longestStreak,
    words,
    journal: sampleEvenly(journalAll, maxJournal),
    moods: { dominant: mode(moodStates), distribution, trajectory, meanValence },
    answers: sampleEvenly(answers, maxAnswers),
    peaks: { high, low, spike },
    context: {
      cities: Array.from(new Set(cities)).slice(0, 5),
      avgTempC: temps.length ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10 : null,
      avgHumidity: hums.length ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : null,
      dominantMoon: mode(moons),
      dominantZodiac: mode(zodiacs),
    },
    arcade,
    followUp: null,
    compression: { rawChars, packetChars: 0, ratio: 0 },
  }
  packet.followUp = composeFollowUp(packet)
  const packetChars = renderPacketForPrompt(packet).length
  packet.compression = {
    rawChars,
    packetChars,
    ratio: packetChars > 0 ? Math.round((rawChars / packetChars) * 100) / 100 : 0,
  }
  return packet
}

// ─── Renderers ────────────────────────────────────────────────────────

const shortDate = (s: string) => s.slice(5, 16).replace('T', ' ')

/** Compact, vendor-safe text block. This is all the AI processor sees. */
export function renderPacketForPrompt(p: StoryPacket): string {
  const lines: string[] = []
  lines.push(`HORIZON: ${STORY_HORIZONS[p.horizon].label} (${p.windowStart.slice(0, 10)} → ${p.windowEnd.slice(0, 10)})`)
  lines.push(`SIGNALS: ${p.counts.total} (journal ${p.counts.journal}, mood ${p.counts.mood}, memory ${p.counts.answer}, self-care ${p.counts.selfcare})`)
  lines.push(`PRESENCE: ${p.activeDays}/${p.windowDays} days · longest streak ${p.longestStreak}d · ${p.words} words written`)
  if (p.moods.dominant) {
    const dist = Object.entries(p.moods.distribution).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}×${v}`).join(', ')
    lines.push(`MOODS: ${dist} · trajectory ${p.moods.trajectory}`)
  } else {
    lines.push(`MOODS: no check-ins · trajectory ${p.moods.trajectory}`)
  }
  const ctx: string[] = []
  if (p.context.cities.length) ctx.push(p.context.cities.join(' / '))
  if (p.context.avgTempC !== null) ctx.push(`avg ${p.context.avgTempC}°C`)
  if (p.context.avgHumidity !== null) ctx.push(`${p.context.avgHumidity}% humidity`)
  if (p.context.dominantMoon) ctx.push(`moon mostly ${p.context.dominantMoon}`)
  if (p.context.dominantZodiac) ctx.push(`sun in ${p.context.dominantZodiac}`)
  lines.push(`ENVIRONMENT: ${ctx.join(' · ') || 'unknown'}`)
  if (p.peaks.high) lines.push(`HIGH PEAK [${shortDate(p.peaks.high.at)}] ${p.peaks.high.label}${p.peaks.high.excerpt ? `: "${p.peaks.high.excerpt}"` : ''}`)
  if (p.peaks.low) lines.push(`LOW PEAK [${shortDate(p.peaks.low.at)}] ${p.peaks.low.label}${p.peaks.low.excerpt ? `: "${p.peaks.low.excerpt}"` : ''}${p.peaks.spike ? ' (SPIKE)' : ''}`)
  if (p.journal.length) {
    lines.push('JOURNAL (sampled, chronological):')
    p.journal.forEach(j => lines.push(`- [${shortDate(j.at)}${j.city ? ' ' + j.city : ''}] ${j.text}`))
  }
  if (p.answers.length) {
    lines.push('MEMORY ANSWERS:')
    p.answers.forEach(a => lines.push(`- ${a}`))
  }
  return lines.join('\n')
}

/** Terminal header lines shown above the story in the Log. */
export function renderStoryHeader(p: StoryPacket): string[] {
  const spec = STORY_HORIZONS[p.horizon]
  const lines = [
    `HORIZON         ${spec.label} · ${spec.days}D`,
    `SIGNALS         ${p.counts.total} · DAYS ${p.activeDays}/${p.windowDays} · STREAK ${p.longestStreak}D`,
  ]
  if (p.moods.dominant) lines.push(`MOOD            ${p.moods.dominant.toUpperCase()} · ${p.moods.trajectory.toUpperCase()}`)
  if (p.peaks.high) lines.push(`HIGH            ${p.peaks.high.label} · ${shortDate(p.peaks.high.at)}`)
  if (p.peaks.low) lines.push(`LOW             ${p.peaks.low.label} · ${shortDate(p.peaks.low.at)}${p.peaks.spike ? ' · SPIKE' : ''}`)
  const filled = Math.round(p.arcade.progress * 10)
  lines.push(`ARCADE          +${p.arcade.xp} XP · LV ${p.arcade.level} ${p.arcade.rank} ${'▓'.repeat(filled)}${'░'.repeat(10 - filled)}`)
  if (p.compression.ratio > 0) lines.push(`COMPRESSION     ${p.compression.rawChars}→${p.compression.packetChars} CH · ${p.compression.ratio}×`)
  return lines
}

/**
 * The loop-closing prompt: one gentle question the machine sends back.
 * Spike → ask about the low. Rising → ask what carried it. Otherwise →
 * ask about the high, or invite the first signal.
 */
export function composeFollowUp(p: StoryPacket): string | null {
  if (p.counts.total === 0) return `What is one thing from this ${STORY_HORIZONS[p.horizon].noun} you want the machine to remember?`
  if (p.peaks.spike && p.peaks.low) {
    const when = p.peaks.low.kind === 'mood' ? `feeling ${p.peaks.low.label.toLowerCase()}` : 'that heavier entry'
    return `You logged ${when} on ${shortDate(p.peaks.low.at).slice(0, 5)}. Is it still with you, or has it passed?`
  }
  if (p.moods.trajectory === 'rising') return 'Your signal has been rising. What has been carrying you?'
  if (p.moods.trajectory === 'falling') return 'Your signal has been dipping. What would one small act of care look like tomorrow?'
  if (p.peaks.high) return `What made ${shortDate(p.peaks.high.at).slice(0, 5)} feel lighter — and can you repeat it?`
  return 'What did this stretch of time teach you that you have not written down yet?'
}

/** Local, AI-free story. Second person, grounded only in the packet. */
export function composeFallbackStory(p: StoryPacket): string {
  const noun = STORY_HORIZONS[p.horizon].noun
  if (p.counts.total === 0) {
    return `Your ${noun} is still unwritten here. The machine is listening — one line in the Log is enough to begin the record.`
  }
  const parts: string[] = []
  const where = p.context.cities.length ? ` in ${p.context.cities[0]}` : ''
  const weather = p.context.avgTempC !== null ? `, around ${Math.round(p.context.avgTempC)}°C` : ''
  parts.push(
    `Across this ${noun}${where}${weather}, you showed up on ${p.activeDays} of ${p.windowDays} day${p.windowDays === 1 ? '' : 's'} and left ${p.counts.total} signal${p.counts.total === 1 ? '' : 's'}${p.words ? ` — ${p.words} words in the Journal` : ''}.`
  )
  if (p.moods.dominant) {
    parts.push(`The mood that returned most was ${p.moods.dominant}, and the line was ${p.moods.trajectory === 'unknown' ? 'still forming' : p.moods.trajectory}.`)
  }
  if (p.peaks.high) parts.push(`A high point came on ${shortDate(p.peaks.high.at).slice(0, 5)}${p.peaks.high.excerpt ? `: "${p.peaks.high.excerpt}"` : ''}.`)
  if (p.peaks.low) parts.push(`A lower moment came on ${shortDate(p.peaks.low.at).slice(0, 5)}${p.peaks.low.excerpt ? `: "${p.peaks.low.excerpt}"` : ''} — it is part of the record, not a verdict.`)
  if (p.longestStreak > 1) parts.push(`You held a ${p.longestStreak}-day streak.`)
  parts.push('The pattern is yours; the machine only keeps it.')
  return parts.join(' ')
}
