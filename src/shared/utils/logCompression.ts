/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMPRESSION ENGINE — LCE v1
 *
 * Turns a window of raw Log records (journal notes, mood check-ins,
 * self-care answers) plus their context snapshots (weather, city, moon,
 * zodiac) into a compact, deterministic "compression" of the period.
 *
 * Pipeline position:
 *   LOT User data → [LCE compression] → LOT Quantum Intent Engine state
 *   → AI vendor processor (Together AI) → generated_story Log (stored)
 *
 * The compression is the ONLY thing the AI vendor sees about the period.
 * It is pure (no DB, no DOM, no clock unless injected) so the client,
 * the server and tests can share it, and so the local fallback story is
 * reproducible when the AI vendor is down.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

/** Default period when the operator types a bare `/story`. */
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'week'

const PERIOD_MS: Record<StoryPeriod, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  d: 'day', day: 'day', today: 'day', daily: 'day',
  w: 'week', week: 'week', weekly: 'week',
  m: 'month', month: 'month', monthly: 'month',
  y: 'year', year: 'year', yearly: 'year', annual: 'year',
}

/**
 * Reads the period argument from a log text containing `/story`.
 * `/story`, `/story week`, `/story m`, `/story year` … Unknown or
 * missing argument → DEFAULT_STORY_PERIOD.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  if (!text) return DEFAULT_STORY_PERIOD
  const match = text.match(/(?:^|\s)\/story(?:\s+([a-z]+))?/i)
  const arg = match?.[1]?.toLowerCase()
  if (arg && PERIOD_ALIASES[arg]) return PERIOD_ALIASES[arg]
  return DEFAULT_STORY_PERIOD
}

export function periodWindow(period: StoryPeriod, now: Date): { start: Date; end: Date } {
  return { start: new Date(now.getTime() - PERIOD_MS[period]), end: now }
}

// ─── Input shape ─────────────────────────────────────────────────────────────

export interface CompressionLog {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

// ─── Valence model ───────────────────────────────────────────────────────────
// Signed score in [-1, 1]. Mood check-ins are authoritative; journal text
// falls back to a small lexicon. Deliberately tiny and transparent — the AI
// vendor does the nuance, LCE only has to find the peaks.

export const MOOD_VALENCE: Record<string, number> = {
  energized: 0.8, excited: 0.8, fulfilled: 0.9, grateful: 0.9,
  hopeful: 0.6, peaceful: 0.7, calm: 0.6, content: 0.6,
  uncertain: -0.2, restless: -0.3, tired: -0.4,
  anxious: -0.7, overwhelmed: -0.8, exhausted: -0.8,
}

const POSITIVE_WORDS = [
  'love', 'grateful', 'gratitude', 'happy', 'joy', 'calm', 'peace', 'peaceful',
  'beautiful', 'good', 'great', 'amazing', 'proud', 'rested', 'strong', 'clear',
  'light', 'free', 'hope', 'win', 'won', 'done', 'finished', 'laugh', 'fun',
]
const NEGATIVE_WORDS = [
  'tired', 'exhausted', 'anxious', 'anxiety', 'sad', 'lonely', 'alone', 'stuck',
  'lost', 'scared', 'panic', 'angry', 'hurt', 'pain', 'sick', 'stress',
  'stressed', 'overwhelmed', 'bad', 'worse', 'worst', 'cry', 'fail', 'failed',
  'heavy', 'dark', 'empty',
]

/** Lexicon valence for free text; null when no signal words are present. */
export function textValence(text: string): number | null {
  if (!text) return null
  const words = text.toLowerCase().match(/[a-z']+/g) || []
  let pos = 0
  let neg = 0
  for (const w of words) {
    if (POSITIVE_WORDS.includes(w)) pos++
    else if (NEGATIVE_WORDS.includes(w)) neg++
  }
  if (pos + neg === 0) return null
  return round2((pos - neg) / (pos + neg))
}

/** Valence of a single log, or null when it carries no emotional signal. */
export function logValence(log: CompressionLog): number | null {
  const mood = String(log.metadata?.emotionalState || '').toLowerCase()
  if (mood && MOOD_VALENCE[mood] !== undefined) {
    const intensity = Number(log.metadata?.intensity)
    const scale = Number.isFinite(intensity) && intensity > 0 ? 0.5 + Math.min(intensity, 10) / 20 : 1
    return round2(Math.max(-1, Math.min(1, MOOD_VALENCE[mood] * scale)))
  }
  if (log.event === 'note' || log.event === 'journal') {
    return textValence(stripCommands(log.text || ''))
  }
  return null
}

/** Removes slash commands and AI-appended blocks so they don't pollute stats. */
export function stripCommands(text: string): string {
  return text
    .split(/\n{2,}/)
    .filter(p => !/^\s*(📖|🕯️|🕯)/.test(p))
    .join('\n\n')
    .replace(/(^|\s)\/[a-z][a-z0-9-]*(\s+(day|week|month|year|d|w|m|y))?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Compression output ──────────────────────────────────────────────────────

export interface Peak {
  kind: 'high' | 'low'
  at: string            // ISO timestamp
  valence: number
  source: 'mood' | 'journal'
  excerpt: string       // ≤ 120 chars
  context: string       // compact context line, e.g. "18°C · Lisbon · Waxing Gibbous"
}

export interface Spike {
  day: string           // YYYY-MM-DD
  entries: number
  baseline: number      // mean entries/day over active days
}

export interface LogCompression {
  version: 'LCE-1'
  period: StoryPeriod
  window: { start: string; end: string }
  totals: {
    records: number
    journalEntries: number
    words: number
    moodCheckins: number
    selfCareAnswers: number
    activeDays: number
    coverage: number    // activeDays / days in window, 0..1
  }
  moods: { dominant: string | null; distribution: Record<string, number> }
  valence: { mean: number | null; firstHalf: number | null; secondHalf: number | null; shift: number | null }
  rhythm: { dominantPhase: string | null; phases: Record<string, number> }
  context: {
    cities: string[]
    tempRangeC: [number, number] | null
    weather: string[]
    moonPhases: string[]
    zodiac: string[]
  }
  peaks: Peak[]
  spikes: Spike[]
  /** Signals the machine may later follow up on (spike or pattern change). */
  followUps: string[]
  excerpts: string[]
  selfCare: string[]
}

const PHASES: Array<[string, number, number]> = [
  ['NIGHT', 0, 5], ['DAWN', 5, 9], ['MORNING', 9, 12],
  ['MIDDAY', 12, 14], ['AFTERNOON', 14, 18], ['EVENING', 18, 22], ['NIGHT', 22, 24],
]

function phaseOf(hour: number): string {
  for (const [name, from, to] of PHASES) if (hour >= from && hour < to) return name
  return 'NIGHT'
}

/** Local hour of a log, using its context timeZone when present (server runs UTC). */
function localHour(at: Date, ctx: Record<string, any> | null | undefined): number {
  const tz = ctx?.timeZone
  if (tz) {
    try {
      const h = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: tz }).format(at)
      const n = parseInt(h, 10)
      if (Number.isFinite(n)) return n % 24
    } catch {
      /* invalid zone — fall through */
    }
  }
  return at.getHours()
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function mean(xs: number[]): number | null {
  return xs.length ? round2(xs.reduce((a, b) => a + b, 0) / xs.length) : null
}

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v)
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function topKeys(counts: Record<string, number>, n: number): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9)
}

export function contextLine(ctx: Record<string, any> | null | undefined): string {
  if (!ctx) return ''
  const parts: string[] = []
  if (typeof ctx.temperature === 'number') parts.push(`${fahrenheitToCelsius(ctx.temperature)}°C`)
  if (ctx.city) parts.push(String(ctx.city))
  if (ctx.astroMoonPhase) parts.push(String(ctx.astroMoonPhase))
  return parts.join(' · ')
}

function excerpt(text: string, max = 120): string {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

const JOURNAL_EVENTS = ['note', 'journal']
const SELF_CARE_EVENTS = ['memory_answer', 'self_care_checkin', 'energy_checkin', 'answer']

/**
 * Compresses `logs` that fall inside the `period` window ending at `now`.
 * Logs outside the window are ignored, so callers may pass a superset.
 */
export function compressLogs(
  logs: CompressionLog[],
  period: StoryPeriod,
  now: Date = new Date()
): LogCompression {
  const { start, end } = periodWindow(period, now)
  const inWindow = logs
    .map(l => ({ ...l, _at: toDate(l.createdAt) }))
    .filter(l => !isNaN(l._at.getTime()) && l._at >= start && l._at <= end)
    .sort((a, b) => a._at.getTime() - b._at.getTime())

  const journal = inWindow.filter(l => JOURNAL_EVENTS.includes(l.event) && stripCommands(l.text || '').length > 0)
  const moods = inWindow.filter(l => l.event === 'emotional_checkin' && l.metadata?.emotionalState)
  const selfCare = inWindow.filter(l => SELF_CARE_EVENTS.includes(l.event))

  // Moods
  const moodDist: Record<string, number> = {}
  for (const m of moods) {
    const s = String(m.metadata!.emotionalState).toLowerCase()
    moodDist[s] = (moodDist[s] || 0) + 1
  }

  // Rhythm (hour-of-day phase of journal + mood activity)
  const phases: Record<string, number> = {}
  for (const l of [...journal, ...moods]) {
    const p = phaseOf(localHour(l._at, l.context))
    phases[p] = (phases[p] || 0) + 1
  }

  // Context aggregation
  const cityCounts: Record<string, number> = {}
  const weatherCounts: Record<string, number> = {}
  const moonCounts: Record<string, number> = {}
  const zodiacCounts: Record<string, number> = {}
  const temps: number[] = []
  for (const l of inWindow) {
    const c = l.context || {}
    if (c.city) cityCounts[c.city] = (cityCounts[c.city] || 0) + 1
    if (c.weatherDescription) weatherCounts[c.weatherDescription] = (weatherCounts[c.weatherDescription] || 0) + 1
    if (c.astroMoonPhase) moonCounts[c.astroMoonPhase] = (moonCounts[c.astroMoonPhase] || 0) + 1
    if (c.astroWesternZodiac) zodiacCounts[c.astroWesternZodiac] = (zodiacCounts[c.astroWesternZodiac] || 0) + 1
    if (typeof c.temperature === 'number') temps.push(fahrenheitToCelsius(c.temperature))
  }

  // Valence series
  const scored = [...journal, ...moods]
    .map(l => ({ l, v: logValence(l) }))
    .filter((x): x is { l: typeof x.l; v: number } => x.v !== null)
    .sort((a, b) => a.l._at.getTime() - b.l._at.getTime())
  const vals = scored.map(s => s.v)
  const half = Math.floor(vals.length / 2)
  const firstHalf = vals.length >= 4 ? mean(vals.slice(0, half)) : null
  const secondHalf = vals.length >= 4 ? mean(vals.slice(half)) : null
  const shift = firstHalf !== null && secondHalf !== null ? round2(secondHalf - firstHalf) : null

  // Peaks — top 2 highs and top 2 lows, only past a minimum magnitude.
  const toPeak = (s: { l: any; v: number }, kind: 'high' | 'low'): Peak => ({
    kind,
    at: s.l._at.toISOString(),
    valence: s.v,
    source: s.l.event === 'emotional_checkin' ? 'mood' : 'journal',
    excerpt: s.l.event === 'emotional_checkin'
      ? excerpt(`${String(s.l.metadata.emotionalState).toUpperCase()}${s.l.metadata.note ? ' — ' + s.l.metadata.note : ''}`)
      : excerpt(stripCommands(s.l.text || '')),
    context: contextLine(s.l.context),
  })
  const highs = [...scored].filter(s => s.v >= 0.5).sort((a, b) => b.v - a.v).slice(0, 2).map(s => toPeak(s, 'high'))
  const lows = [...scored].filter(s => s.v <= -0.5).sort((a, b) => a.v - b.v).slice(0, 2).map(s => toPeak(s, 'low'))

  // Spikes — days with journal volume ≥ 2× baseline and ≥ 3 entries.
  const perDay: Record<string, number> = {}
  for (const j of journal) perDay[dayKey(j._at)] = (perDay[dayKey(j._at)] || 0) + 1
  const dayCounts = Object.values(perDay)
  const baseline = mean(dayCounts) || 0
  const spikes: Spike[] = period === 'day' ? [] : Object.entries(perDay)
    .filter(([, n]) => dayCounts.length >= 3 && n >= 3 && n >= baseline * 2)
    .map(([day, entries]) => ({ day, entries, baseline }))
    .sort((a, b) => b.entries - a.entries)
    .slice(0, 3)

  const activeDays = new Set([...journal, ...moods, ...selfCare].map(l => dayKey(l._at))).size
  const windowDays = Math.max(1, Math.round(PERIOD_MS[period] / PERIOD_MS.day))

  const followUps: string[] = []
  if (shift !== null && shift <= -0.4) followUps.push('VALENCE DROP — tone fell across the period; ask gently what changed')
  if (shift !== null && shift >= 0.4) followUps.push('VALENCE RISE — tone lifted across the period; ask what helped')
  for (const s of spikes) followUps.push(`SPIKE ${s.day} — ${s.entries} entries vs ${s.baseline}/day baseline`)
  if (lows.length && !highs.length) followUps.push('LOWS WITHOUT HIGHS — offer one small self-care action')

  const words = journal.reduce((n, j) => n + (stripCommands(j.text || '').match(/\S+/g)?.length || 0), 0)

  return {
    version: 'LCE-1',
    period,
    window: { start: start.toISOString(), end: end.toISOString() },
    totals: {
      records: inWindow.length,
      journalEntries: journal.length,
      words,
      moodCheckins: moods.length,
      selfCareAnswers: selfCare.length,
      activeDays,
      coverage: round2(Math.min(1, activeDays / windowDays)),
    },
    moods: { dominant: topKeys(moodDist, 1)[0] || null, distribution: moodDist },
    valence: { mean: mean(vals), firstHalf, secondHalf, shift },
    rhythm: { dominantPhase: topKeys(phases, 1)[0] || null, phases },
    context: {
      cities: topKeys(cityCounts, 3),
      tempRangeC: temps.length ? [Math.min(...temps), Math.max(...temps)] : null,
      weather: topKeys(weatherCounts, 3),
      moonPhases: topKeys(moonCounts, 3),
      zodiac: topKeys(zodiacCounts, 2),
    },
    peaks: [...highs, ...lows],
    spikes,
    followUps,
    excerpts: journal.slice(-6).map(j => excerpt(stripCommands(j.text || ''), 200)),
    selfCare: selfCare.slice(-5).map(l => {
      const q = String(l.metadata?.question || '')
      const a = String(l.metadata?.option || l.metadata?.answer || '')
      return q && a ? excerpt(`${q}: ${a}`) : ''
    }).filter(Boolean),
  }
}

// ─── Prompt + fallback ───────────────────────────────────────────────────────

const PERIOD_WORDS: Record<StoryPeriod, { label: string; length: string }> = {
  day: { label: 'today', length: '60-110 words, one paragraph' },
  week: { label: 'this week', length: '100-170 words, 1-2 paragraphs' },
  month: { label: 'this month', length: '140-220 words, 2 paragraphs' },
  year: { label: 'this year', length: '180-280 words, 2-3 paragraphs' },
}

/** Serialises the compression into the data block sent to the AI vendor. */
export function compressionToPromptBlock(c: LogCompression): string {
  const dist = Object.entries(c.moods.distribution).map(([k, v]) => `${k}×${v}`).join(', ')
  const peaks = c.peaks.map(p => `- ${p.kind.toUpperCase()} (${p.valence}) ${p.at.slice(0, 10)} [${p.context || 'no context'}]: ${p.excerpt}`)
  return [
    `PERIOD: ${c.period.toUpperCase()} (${c.window.start.slice(0, 10)} → ${c.window.end.slice(0, 10)})`,
    `VOLUME: ${c.totals.journalEntries} journal entries, ${c.totals.words} words, ${c.totals.moodCheckins} mood check-ins, ${c.totals.selfCareAnswers} self-care answers, ${c.totals.activeDays} active days (coverage ${Math.round(c.totals.coverage * 100)}%)`,
    `MOODS: ${dist || 'NO DATA'}${c.moods.dominant ? ` (dominant: ${c.moods.dominant})` : ''}`,
    `VALENCE: mean ${c.valence.mean ?? '—'}, shift ${c.valence.shift ?? '—'}`,
    `RHYTHM: most active in ${c.rhythm.dominantPhase || '—'}`,
    `CONTEXT: ${[
      c.context.cities.length ? `cities ${c.context.cities.join('/')}` : '',
      c.context.tempRangeC ? `${c.context.tempRangeC[0]}–${c.context.tempRangeC[1]}°C` : '',
      c.context.weather.length ? `weather ${c.context.weather.join('/')}` : '',
      c.context.moonPhases.length ? `moon ${c.context.moonPhases.join('/')}` : '',
    ].filter(Boolean).join(', ') || 'NO DATA'}`,
    `PEAKS:\n${peaks.join('\n') || '- (none detected)'}`,
    `PATTERN SIGNALS:\n${c.followUps.map(f => `- ${f}`).join('\n') || '- (stable)'}`,
    `JOURNAL EXCERPTS (most recent last):\n${c.excerpts.map(e => `- ${e}`).join('\n') || '- (none)'}`,
    `SELF-CARE:\n${c.selfCare.map(s => `- ${s}`).join('\n') || '- (none)'}`,
  ].join('\n\n')
}

export function buildStorySystemPrompt(period: StoryPeriod): string {
  const w = PERIOD_WORDS[period]
  return `You are the Story module of LOT Systems — a personal operating system that compresses the operator's own records into a short narrative and hands it back to them.

The operator invoked /story ${period}. Write the compressed story of ${w.label}: ${w.length}.

RULES:
- Second person ("You...").
- Use ONLY the data below. Name concrete details: places, weather, moon, times of day, their own words.
- Surface the high and low peaks honestly. Do not smooth the lows away; hold them with care.
- If a pattern signal exists (valence drop/rise, spike), weave it in as an observation, not a diagnosis.
- No medical or clinical claims. No pep talk. No hashtags, no emojis, no title.
- Close with ONE quiet question the operator could answer in their next Log entry.
- Return only the story.`
}

/** Deterministic story used when the AI vendor is unreachable. */
export function localStory(c: LogCompression): string {
  const w = PERIOD_WORDS[c.period]
  if (c.totals.journalEntries + c.totals.moodCheckins === 0) {
    return `Nothing was recorded ${w.label}. The page is still open. What is one thing you noticed today?`
  }
  const sentences: string[] = []
  const place = c.context.cities[0] ? ` in ${c.context.cities[0]}` : ''
  sentences.push(
    `${cap(w.label)}${place} you wrote ${c.totals.journalEntries} ${plural(c.totals.journalEntries, 'entry', 'entries')} across ${c.totals.activeDays} ${plural(c.totals.activeDays, 'day', 'days')}, mostly in the ${(c.rhythm.dominantPhase || 'day').toLowerCase()}.`
  )
  if (c.context.tempRangeC || c.context.moonPhases[0]) {
    const bits = [
      c.context.tempRangeC ? `between ${c.context.tempRangeC[0]} and ${c.context.tempRangeC[1]}°C` : '',
      c.context.moonPhases[0] ? `under a ${c.context.moonPhases[0].toLowerCase()} moon` : '',
    ].filter(Boolean)
    sentences.push(`The air held ${bits.join(', ')}.`)
  }
  if (c.moods.dominant) sentences.push(`The mood you returned to most was ${c.moods.dominant}.`)
  const high = c.peaks.find(p => p.kind === 'high')
  const low = c.peaks.find(p => p.kind === 'low')
  if (high) sentences.push(`A high point: "${high.excerpt}"`)
  if (low) sentences.push(`A low point: "${low.excerpt}"`)
  if (c.valence.shift !== null && c.valence.shift <= -0.4) sentences.push('The tone grew heavier toward the end.')
  if (c.valence.shift !== null && c.valence.shift >= 0.4) sentences.push('The tone grew lighter toward the end.')
  sentences.push(low && !high ? 'What would make tomorrow a little lighter?' : 'What do you want to carry forward?')
  return sentences.join(' ')
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many
}

/** Compact terminal-style stat header shown above the story in the Log. */
export function compressionHeader(c: LogCompression): string {
  const lines = [
    `PERIOD          ${c.period.toUpperCase()}`,
    `ENTRIES         ${c.totals.journalEntries} · ${c.totals.words} WORDS`,
    `ACTIVE DAYS     ${c.totals.activeDays} · ${Math.round(c.totals.coverage * 100)}% COVERAGE`,
  ]
  if (c.moods.dominant) lines.push(`DOMINANT MOOD   ${c.moods.dominant.toUpperCase()}`)
  if (c.valence.mean !== null) lines.push(`VALENCE         ${signed(c.valence.mean)}${c.valence.shift !== null ? ` · SHIFT ${signed(c.valence.shift)}` : ''}`)
  const highs = c.peaks.filter(p => p.kind === 'high').length
  const lows = c.peaks.filter(p => p.kind === 'low').length
  lines.push(`PEAKS           ▲${highs} ▼${lows}`)
  if (c.spikes.length) lines.push(`SPIKES          ${c.spikes.map(s => s.day).join(', ')}`)
  return lines.join('\n')
}

function signed(n: number): string {
  return (n > 0 ? '+' : '') + n.toFixed(2)
}

// ─── Arcade layer — Chronicle rank ───────────────────────────────────────────
// Each compressed story is a chapter. Ranks are earned by closing chapters,
// never by streak pressure: missing a week costs nothing.

export const CHRONICLE_RANKS: Array<{ rank: string; at: number; glyph: string }> = [
  { rank: 'SCRIBE', at: 0, glyph: '[.]' },
  { rank: 'CHRONICLER', at: 5, glyph: '[:]' },
  { rank: 'ARCHIVIST', at: 15, glyph: '[#]' },
  { rank: 'LOREKEEPER', at: 40, glyph: '[§]' },
  { rank: 'MYTHWRIGHT', at: 100, glyph: '[∞]' },
]

/** XP weight per period — a year chapter is worth more than a day page. */
export const CHAPTER_XP: Record<StoryPeriod, number> = { day: 1, week: 3, month: 8, year: 30 }

export interface ChronicleRank {
  chapter: number       // this story's chapter number (1-based)
  rank: string
  glyph: string
  xp: number
  nextRank: string | null
  chaptersToNext: number | null
  bar: string           // 10-cell ASCII progress bar to next rank
}

/** `storiesBefore` = generated_story count prior to this one. */
export function chronicleRank(storiesBefore: number, xp: number): ChronicleRank {
  const chapter = storiesBefore + 1
  let idx = 0
  for (let i = 0; i < CHRONICLE_RANKS.length; i++) if (chapter >= CHRONICLE_RANKS[i].at) idx = i
  const cur = CHRONICLE_RANKS[idx]
  const next = CHRONICLE_RANKS[idx + 1] || null
  const span = next ? next.at - cur.at : 1
  const progress = next ? Math.min(1, (chapter - cur.at) / span) : 1
  const filled = Math.round(progress * 10)
  return {
    chapter,
    rank: cur.rank,
    glyph: cur.glyph,
    xp,
    nextRank: next ? next.rank : null,
    chaptersToNext: next ? next.at - chapter : null,
    bar: '[' + '█'.repeat(filled) + '░'.repeat(10 - filled) + ']',
  }
}
