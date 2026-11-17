/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Story Compression — Stage 2 of the LOT AI loop.
 *
 *   LOT User data → [LOT Quantum Intent Engine: compression] → AI vendor (Together AI) → stored story
 *
 * This module is PURE (no DB, no network, no DOM). It takes the raw Log
 * rows of an operator and compresses a time window (day / week / month /
 * year) into a small, deterministic "Story Packet":
 *
 *   - journal volume + the most expressive entries (slash commands and
 *     machine-generated replies stripped out)
 *   - mood trajectory with HIGH and LOW peaks (valence-scored check-ins)
 *   - environment context aggregated from each entry's snapshot
 *     (city, temperature range, humidity, weather, moon phase, zodiac)
 *   - rhythm (active days, longest streak, dominant time-of-day)
 *   - Arcade readout (XP / level / rank) — the gamified self-care evolution
 *
 * The packet is what gets sent to the AI vendor — never the raw journal.
 * When the vendor is unavailable, `composeFallbackStory()` renders the
 * same packet as a plain-language story so /story never returns empty.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

export const STORY_SCOPE_DAYS: Record<StoryScope, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Minimal shape of a Log row this module needs (server model or client type). */
export interface StoryLogInput {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export interface StoryPeak {
  kind: 'high' | 'low'
  date: string // YYYY-MM-DD
  label: string // e.g. "GRATEFUL" or an excerpt
  score: number // -2..+2
  context: string // e.g. "Lisbon · 18°C · Waxing Gibbous"
}

export interface ArcadeReadout {
  xp: number
  level: number
  rank: string
  nextLevelXp: number
  progress: number // 0..1 inside current level
}

export interface StoryPacket {
  scope: StoryScope
  windowStart: string // ISO
  windowEnd: string // ISO
  journal: {
    entries: number
    words: number
    excerpts: string[]
    topWords: string[]
  }
  moods: {
    count: number
    sequence: string[] // chronological, upper-case
    averageValence: number | null // -2..+2
    trend: 'rising' | 'falling' | 'steady' | 'unknown'
  }
  peaks: StoryPeak[]
  selfCare: string[]
  environment: {
    cities: string[]
    tempMinC: number | null
    tempMaxC: number | null
    avgHumidity: number | null
    weather: string[]
    moonPhases: string[]
    zodiac: string[]
  }
  rhythm: {
    activeDays: number
    longestStreak: number
    dominantPhase: 'morning' | 'afternoon' | 'evening' | 'night' | 'unknown'
  }
  arcade: ArcadeReadout
  signalDensity: 'silent' | 'sparse' | 'steady' | 'dense'
}

// ---------------------------------------------------------------------------
// Event classification
// ---------------------------------------------------------------------------

/** Events that represent the operator's own journal (Log tab) writing. */
export const JOURNAL_EVENTS = ['note', 'journal', 'log_entry']

/** Events that represent mood check-ins. */
export const MOOD_EVENTS = ['emotional_checkin']

/** Events that represent self-care / memory answers. */
export const SELF_CARE_EVENTS = ['memory_answer', 'self_care_checkin', 'energy_checkin', 'answer']

/**
 * Valence table for emotional check-in states. -2 (heavy) .. +2 (bright).
 * Unknown states score 0 so they never create false peaks.
 */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2, joyful: 2, inspired: 2,
  hopeful: 1, content: 1, peaceful: 1, calm: 1, focused: 1, loved: 1,
  uncertain: -1, restless: -1, tired: -1, bored: -1, lonely: -1,
  anxious: -2, overwhelmed: -2, exhausted: -2, sad: -2, angry: -2,
}

export function moodValence(state: string | null | undefined): number {
  if (!state) return 0
  return MOOD_VALENCE[state.toLowerCase().trim()] ?? 0
}

// Generated replies get appended to the note text with these markers
// (📖 story, 🕯️ prayer). They are the machine talking — never compress them
// back into the operator's own narrative, or the loop eats its own tail.
const GENERATED_LINE = /^\s*(📖|🕯️|🕯)/u
const SLASH_TOKEN = /(^|\s)\/[a-z][a-z0-9_-]*(\s+(day|week|month|year|today))?(?=\s|$)/gi

/**
 * Strip slash commands and machine-generated lines from a journal text,
 * leaving only what the operator actually wrote.
 */
export function cleanJournalText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .split('\n')
    .filter(line => !GENERATED_LINE.test(line))
    .join('\n')
    .replace(SLASH_TOKEN, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ---------------------------------------------------------------------------
// Scope parsing
// ---------------------------------------------------------------------------

/**
 * Parse the scope argument of a `/story` command inside free text.
 *   "/story"        → week (default)
 *   "/story day"    → day   ("/story today" also → day)
 *   "/story month"  → month
 *   "/story y"      → year  (single-letter shortcuts d/w/m/y)
 */
export function parseStoryScope(text: string | null | undefined, fallback: StoryScope = 'week'): StoryScope {
  if (!text) return fallback
  const m = text.match(/(?:^|\s)\/story(?:\s+([a-z]+))?/i)
  if (!m || !m[1]) return fallback
  const arg = m[1].toLowerCase()
  if (arg === 'today' || arg === 'd' || arg === 'day') return 'day'
  if (arg === 'w' || arg === 'week') return 'week'
  if (arg === 'm' || arg === 'month') return 'month'
  if (arg === 'y' || arg === 'year') return 'year'
  return fallback
}

export function isStoryScope(x: unknown): x is StoryScope {
  return typeof x === 'string' && (STORY_SCOPES as string[]).includes(x)
}

// ---------------------------------------------------------------------------
// Arcade (gamified self-care evolution)
// ---------------------------------------------------------------------------

export const ARCADE_RANKS = [
  'INITIATE',     // L1
  'OBSERVER',     // L2
  'SIGNALER',     // L3
  'CARTOGRAPHER', // L4
  'NAVIGATOR',    // L5
  'ARCHIVIST',    // L6
  'OPERATOR',     // L7
  'ARCHITECT',    // L8
  'ORACLE',       // L9
  'LOT PRIME',    // L10+
]

/** XP needed to *reach* level n (n ≥ 1). Quadratic curve: 0, 100, 300, 600, 1000… */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level)) - 1
  return 50 * n * (n + 1)
}

/**
 * Arcade XP is earned only by care, never by volume alone:
 *   journal entry   10 XP  (+1 per 20 words, capped at +5)
 *   mood check-in    5 XP
 *   self-care answer 5 XP
 *   active day      15 XP
 *   streak bonus    10 XP per day of longest streak beyond 2
 */
export function computeArcade(input: {
  entries: number
  wordsPerEntry: number[]
  moods: number
  selfCare: number
  activeDays: number
  longestStreak: number
}): ArcadeReadout {
  const wordBonus = input.wordsPerEntry.reduce((s, w) => s + Math.min(5, Math.floor(w / 20)), 0)
  const xp =
    input.entries * 10 +
    wordBonus +
    input.moods * 5 +
    input.selfCare * 5 +
    input.activeDays * 15 +
    Math.max(0, input.longestStreak - 2) * 10

  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  const floor = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return {
    xp,
    level,
    rank: ARCADE_RANKS[Math.min(level, ARCADE_RANKS.length) - 1],
    nextLevelXp: next,
    progress: next > floor ? (xp - floor) / (next - floor) : 1,
  }
}

// ---------------------------------------------------------------------------
// Compression
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set(
  ('the a an and or but if then so to of in on at for with from by is are was were be been ' +
    'i me my mine you your it its this that these those we our they them their he she his her ' +
    'not no yes do did does done have has had just very really today yesterday tomorrow ' +
    'about into out up down over under again more most some any all can could would should will ' +
    'what when where who why how than too also as there here am im ive dont cant one get got')
    .split(' ')
)

function toDate(x: Date | string): Date {
  return x instanceof Date ? x : new Date(x)
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toCelsiusMaybe(t: number | null | undefined): number | null {
  if (t === null || t === undefined || !Number.isFinite(t)) return null
  // LOT weather cache stores Kelvin; anything above 150 is Kelvin.
  return t > 150 ? t - 273.15 : t
}

function topN<T extends string>(items: T[], n: number): T[] {
  const counts = new Map<T, number>()
  for (const it of items) counts.set(it, (counts.get(it) || 0) + 1)
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, n)
    .map(([k]) => k)
}

function contextLine(ctx: Record<string, any> | null | undefined): string {
  if (!ctx) return ''
  const parts: string[] = []
  if (ctx.city) parts.push(String(ctx.city))
  const c = toCelsiusMaybe(ctx.temperature)
  if (c !== null) parts.push(`${Math.round(c)}°C`)
  if (ctx.astroMoonPhase) parts.push(String(ctx.astroMoonPhase))
  return parts.join(' · ')
}

function longestStreak(days: string[]): number {
  if (days.length === 0) return 0
  const sorted = Array.from(new Set(days)).sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00Z').getTime()
    const cur = new Date(sorted[i] + 'T00:00:00Z').getTime()
    if (cur - prev === 86400000) {
      run++
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}

function phaseOfHour(h: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

/** Local hour of an entry: prefer the operator's wall clock from context.date ("YYYY-MM-DD HH:mm…"). */
function localHour(row: StoryLogInput): number {
  const d = row.context?.date
  if (typeof d === 'string') {
    const m = d.match(/(\d{1,2}):(\d{2})/)
    if (m) return Number(m[1])
  }
  return toDate(row.createdAt).getUTCHours()
}

/**
 * Compress an operator's logs over a scope window into a Story Packet.
 * `logs` may be in any order and may extend beyond the window.
 */
export function compressStory(
  logs: StoryLogInput[],
  scope: StoryScope,
  now: Date = new Date()
): StoryPacket {
  const windowEnd = now
  const windowStart = new Date(now.getTime() - STORY_SCOPE_DAYS[scope] * 86400000)
  const inWindow = logs
    .filter(l => {
      const t = toDate(l.createdAt).getTime()
      return t >= windowStart.getTime() && t <= windowEnd.getTime()
    })
    .sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())

  // --- Journal --------------------------------------------------------------
  const journalRows = inWindow
    .filter(l => JOURNAL_EVENTS.includes(l.event))
    .map(l => ({ row: l, clean: cleanJournalText(l.text) }))
    .filter(j => j.clean.length > 0)

  const wordsPerEntry = journalRows.map(j => j.clean.split(/\s+/).filter(Boolean).length)
  const allWords = journalRows
    .flatMap(j => j.clean.toLowerCase().match(/[a-zа-яё][a-zа-яё'-]{2,}/giu) || [])
    .map(w => w.replace(/'/g, ''))
    .filter(w => !STOP_WORDS.has(w))

  // Excerpts: the longest entries are usually the most expressive. Keep
  // chronological order among the chosen ones so the story reads in time.
  const excerptLimit = scope === 'day' ? 4 : scope === 'week' ? 6 : 8
  const chosen = journalRows
    .map((j, i) => ({ ...j, i, len: j.clean.length }))
    .sort((a, b) => b.len - a.len)
    .slice(0, excerptLimit)
    .sort((a, b) => a.i - b.i)
  const excerpts = chosen.map(j => {
    const t = j.clean.replace(/\s+/g, ' ')
    return t.length > 220 ? t.slice(0, 217).trimEnd() + '…' : t
  })

  // --- Moods + peaks --------------------------------------------------------
  const moodRows = inWindow.filter(l => MOOD_EVENTS.includes(l.event))
  const moodSeq = moodRows
    .map(l => String(l.metadata?.emotionalState || '').trim())
    .filter(Boolean)
  const valences = moodSeq.map(moodValence)
  const averageValence = valences.length
    ? Math.round((valences.reduce((s, v) => s + v, 0) / valences.length) * 100) / 100
    : null

  let trend: StoryPacket['moods']['trend'] = 'unknown'
  if (valences.length >= 4) {
    const half = Math.floor(valences.length / 2)
    const a = valences.slice(0, half).reduce((s, v) => s + v, 0) / half
    const b = valences.slice(half).reduce((s, v) => s + v, 0) / (valences.length - half)
    trend = b - a > 0.5 ? 'rising' : a - b > 0.5 ? 'falling' : 'steady'
  } else if (valences.length > 0) {
    trend = 'steady'
  }

  const peaks: StoryPeak[] = []
  const scored = moodRows
    .map(l => ({ l, s: moodValence(l.metadata?.emotionalState as string) }))
    .filter(x => x.s !== 0)
  if (scored.length) {
    const hi = scored.reduce((best, x) => (x.s > best.s ? x : best), scored[0])
    const lo = scored.reduce((worst, x) => (x.s < worst.s ? x : worst), scored[0])
    if (hi.s > 0) {
      peaks.push({
        kind: 'high',
        date: dayKey(toDate(hi.l.createdAt)),
        label: String(hi.l.metadata?.emotionalState).toUpperCase(),
        score: hi.s,
        context: contextLine(hi.l.context),
      })
    }
    if (lo.s < 0) {
      peaks.push({
        kind: 'low',
        date: dayKey(toDate(lo.l.createdAt)),
        label: String(lo.l.metadata?.emotionalState).toUpperCase(),
        score: lo.s,
        context: contextLine(lo.l.context),
      })
    }
  }

  // --- Self-care ------------------------------------------------------------
  const selfCareRows = inWindow.filter(l => SELF_CARE_EVENTS.includes(l.event))
  const selfCare = selfCareRows
    .map(l => {
      const q = String(l.metadata?.question || '').trim()
      const a = String(l.metadata?.option || l.metadata?.answer || '').trim()
      return q && a ? `${q.slice(0, 90)} → ${a.slice(0, 60)}` : ''
    })
    .filter(Boolean)
    .slice(-6)

  // --- Environment (context snapshots) -------------------------------------
  const ctxRows = inWindow.map(l => l.context).filter((c): c is Record<string, any> => !!c)
  const temps = ctxRows.map(c => toCelsiusMaybe(c.temperature)).filter((t): t is number => t !== null)
  const hums = ctxRows.map(c => c.humidity).filter((h): h is number => typeof h === 'number' && Number.isFinite(h))

  // --- Rhythm ---------------------------------------------------------------
  const ownActivity = inWindow.filter(
    l => JOURNAL_EVENTS.includes(l.event) || MOOD_EVENTS.includes(l.event) || SELF_CARE_EVENTS.includes(l.event)
  )
  const days = ownActivity.map(l => dayKey(toDate(l.createdAt)))
  const activeDays = new Set(days).size
  const streak = longestStreak(days)
  const phases = journalRows.map(j => phaseOfHour(localHour(j.row)))

  const arcade = computeArcade({
    entries: journalRows.length,
    wordsPerEntry,
    moods: moodRows.length,
    selfCare: selfCareRows.length,
    activeDays,
    longestStreak: streak,
  })

  const signals = ownActivity.length
  const perDay = signals / STORY_SCOPE_DAYS[scope]
  const signalDensity: StoryPacket['signalDensity'] =
    signals === 0 ? 'silent' : perDay < 0.5 ? 'sparse' : perDay < 2 ? 'steady' : 'dense'

  return {
    scope,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    journal: {
      entries: journalRows.length,
      words: wordsPerEntry.reduce((s, w) => s + w, 0),
      excerpts,
      topWords: topN(allWords, 8),
    },
    moods: {
      count: moodSeq.length,
      sequence: moodSeq.map(s => s.toUpperCase()).slice(-12),
      averageValence,
      trend,
    },
    peaks,
    selfCare,
    environment: {
      cities: topN(ctxRows.map(c => c.city).filter(Boolean).map(String), 3),
      tempMinC: temps.length ? Math.round(Math.min(...temps)) : null,
      tempMaxC: temps.length ? Math.round(Math.max(...temps)) : null,
      avgHumidity: hums.length ? Math.round(hums.reduce((s, h) => s + h, 0) / hums.length) : null,
      weather: topN(ctxRows.map(c => c.weatherDescription).filter(Boolean).map(String), 3),
      moonPhases: topN(ctxRows.map(c => c.astroMoonPhase).filter(Boolean).map(String), 3),
      zodiac: topN(ctxRows.map(c => c.astroWesternZodiac).filter(Boolean).map(String), 2),
    },
    rhythm: {
      activeDays,
      longestStreak: streak,
      dominantPhase: phases.length ? topN(phases, 1)[0] : 'unknown',
    },
    arcade,
    signalDensity,
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export const SCOPE_TITLE: Record<StoryScope, string> = {
  day: 'TODAY',
  week: 'THIS WEEK',
  month: 'THIS MONTH',
  year: 'THIS YEAR',
}

/** Compact, line-oriented packet for the AI vendor prompt. No PII beyond city. */
export function formatPacketForPrompt(p: StoryPacket): string {
  const env = p.environment
  const lines: string[] = [
    `SCOPE: ${p.scope.toUpperCase()} (${p.windowStart.slice(0, 10)} → ${p.windowEnd.slice(0, 10)})`,
    `SIGNAL DENSITY: ${p.signalDensity.toUpperCase()} · ACTIVE DAYS ${p.rhythm.activeDays} · LONGEST STREAK ${p.rhythm.longestStreak} · WRITES MOSTLY IN THE ${p.rhythm.dominantPhase.toUpperCase()}`,
    `JOURNAL: ${p.journal.entries} entries, ${p.journal.words} words`,
    `RECURRING WORDS: ${p.journal.topWords.join(', ') || '—'}`,
    `MOODS (${p.moods.count}, trend ${p.moods.trend}): ${p.moods.sequence.join(' → ') || 'NO DATA'}`,
  ]
  for (const pk of p.peaks) {
    lines.push(`${pk.kind === 'high' ? 'HIGH PEAK' : 'LOW PEAK'}: ${pk.label} on ${pk.date}${pk.context ? ` (${pk.context})` : ''}`)
  }
  const envParts: string[] = []
  if (env.cities.length) envParts.push(env.cities.join(' / '))
  if (env.tempMinC !== null) envParts.push(`${env.tempMinC}–${env.tempMaxC}°C`)
  if (env.avgHumidity !== null) envParts.push(`humidity ~${env.avgHumidity}%`)
  if (env.weather.length) envParts.push(env.weather.join(', '))
  if (env.moonPhases.length) envParts.push(`moon: ${env.moonPhases.join(', ')}`)
  if (env.zodiac.length) envParts.push(`sun in ${env.zodiac.join(', ')}`)
  lines.push(`ENVIRONMENT: ${envParts.join(' · ') || 'NO CONTEXT'}`)
  lines.push(`ARCADE: LEVEL ${p.arcade.level} ${p.arcade.rank} · ${p.arcade.xp} XP`)
  lines.push('')
  lines.push('SELF-CARE ANSWERS:')
  lines.push(...(p.selfCare.length ? p.selfCare.map(s => `- ${s}`) : ['- (none)']))
  lines.push('')
  lines.push('JOURNAL EXCERPTS (operator\'s own words, chronological):')
  lines.push(...(p.journal.excerpts.length ? p.journal.excerpts.map(e => `- "${e}"`) : ['- (none)']))
  return lines.join('\n')
}

/** Header block shown above the story in the Log (terminal style). */
export function formatStoryHeader(p: StoryPacket): string {
  const bar = (() => {
    const filled = Math.round(p.arcade.progress * 10)
    return '▮'.repeat(filled) + '▯'.repeat(10 - filled)
  })()
  return [
    `STORY · ${SCOPE_TITLE[p.scope]}`,
    `${p.journal.entries} ENTRIES · ${p.moods.count} MOODS · ${p.rhythm.activeDays} DAYS`,
    `LVL ${p.arcade.level} ${p.arcade.rank} ${bar} ${p.arcade.xp} XP`,
  ].join('\n')
}

/**
 * Deterministic, AI-free story. Used when the AI vendor fails or the
 * operator is outside Usership. Second person, quiet, grounded.
 */
export function composeFallbackStory(p: StoryPacket): string {
  const when = { day: 'Today', week: 'This week', month: 'This month', year: 'This year' }[p.scope]
  if (p.signalDensity === 'silent') {
    return `${when} the record is quiet. No entries, no check-ins — only the weather passing over. Silence is also data; when you write again, the story picks up from here.`
  }
  const s: string[] = []
  const env = p.environment
  const place = env.cities.length ? ` in ${env.cities[0]}` : ''
  const temp = env.tempMinC !== null ? `, between ${env.tempMinC} and ${env.tempMaxC}°C` : ''
  s.push(
    `${when} you wrote ${p.journal.entries} ${p.journal.entries === 1 ? 'entry' : 'entries'}${place}${temp}, mostly in the ${p.rhythm.dominantPhase === 'unknown' ? 'quiet hours' : p.rhythm.dominantPhase}.`
  )
  if (p.journal.topWords.length >= 2) {
    s.push(`The words that kept returning: ${p.journal.topWords.slice(0, 3).join(', ')}.`)
  }
  const hi = p.peaks.find(x => x.kind === 'high')
  const lo = p.peaks.find(x => x.kind === 'low')
  if (hi && lo) {
    s.push(`The high point was ${hi.label.toLowerCase()} on ${hi.date}; the low, ${lo.label.toLowerCase()} on ${lo.date}.`)
  } else if (hi) {
    s.push(`The brightest moment registered as ${hi.label.toLowerCase()} on ${hi.date}.`)
  } else if (lo) {
    s.push(`There was weight around ${lo.date} — ${lo.label.toLowerCase()}. It was logged, and that counts.`)
  }
  if (p.moods.trend === 'rising') s.push('Across the window, your mood moved upward.')
  if (p.moods.trend === 'falling') s.push('Across the window, your mood drifted lower — worth a gentle look.')
  if (p.rhythm.longestStreak >= 3) s.push(`You held a ${p.rhythm.longestStreak}-day streak.`)
  s.push(`The record keeps growing — level ${p.arcade.level}, ${p.arcade.rank.toLowerCase()}.`)
  return s.join(' ')
}
