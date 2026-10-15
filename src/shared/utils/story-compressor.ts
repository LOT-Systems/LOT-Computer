/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Story Compressor
 *
 * Pure, dependency-free (no I/O, no stores, no clock except the injected `now`).
 * Turns raw Log rows into a compact, deterministic StoryDigest that is
 *   (a) fed to the AI vendor (Together AI) as the only user data it sees, and
 *   (b) rendered locally as a fallback story when the vendor is unreachable.
 *
 * Pipeline position:
 *   LOT User data -> [Story Compressor] -> Quantum Intent Engine state
 *     -> AI vendor processor (Together AI) -> LOT personalized data (stored)
 *
 * Doc: docs/technical/LOG-SLASH-COMMANDS-AND-STORY.md
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_SCOPE: StoryScope = 'week'

const SCOPE_DAYS: Record<StoryScope, number> = { day: 1, week: 7, month: 30, year: 365 }

/** Events that count as the user's own words (the Journal). */
export const JOURNAL_EVENTS = ['note', 'log_entry', 'journal']
/** Events that carry mood / self-care signal. */
export const MOOD_EVENTS = ['emotional_checkin']
export const SELF_CARE_EVENTS = [
  'self_care', 'self_care_complete', 'self_care_completed', 'energy_checkin', 'answer', 'memory_answer',
]
export const STORY_EVENT = 'generated_story'

export interface StoryLogRow {
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  nextRank: string | null
  xpToNext: number
}

export interface StorySpike {
  kind: 'volume-spike' | 'silence' | 'mood-shift'
  detail: string
}

export interface StoryDigest {
  scope: StoryScope
  windowStart: string
  windowEnd: string
  entries: number
  words: number
  activeDays: number
  windowDays: number
  streak: number
  moods: { label: string; count: number }[]
  selfCareTouches: number
  places: string[]
  weather: string[]
  tempRangeC: [number, number] | null
  avgHumidity: number | null
  moonPhases: string[]
  dayparts: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  spikes: StorySpike[]
  excerpts: string[]
  arcade: ArcadeState
}

// ── Command parsing ─────────────────────────────────────────────────────────

/**
 * `/story`, `/story day|week|month|year` (also `/story today`, `/story yesterday`
 * is NOT supported — rolling windows only, by design: no calendar ambiguity).
 * Returns the scope and the free text that surrounds the command.
 */
export function parseStoryCommand(text: string): { scope: StoryScope; rest: string } {
  const src = text || ''
  const m = src.match(/(^|\s)\/story(?:\s+(day|today|week|month|year))?(?=\s|$|[^a-z0-9_])/i)
  let scope: StoryScope = DEFAULT_STORY_SCOPE
  if (m && m[2]) {
    const w = m[2].toLowerCase()
    scope = w === 'today' ? 'day' : (w as StoryScope)
  }
  const rest = src.replace(/(^|\s)\/story(?:\s+(?:day|today|week|month|year))?(?=\s|$|[^a-z0-9_])/i, ' ')
    .replace(/📖/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return { scope, rest }
}

// ── Arcade (self-care gamification) ─────────────────────────────────────────

const RANKS: { min: number; name: string }[] = [
  { min: 1, name: 'SIGNAL' },
  { min: 3, name: 'OPERATOR' },
  { min: 6, name: 'NAVIGATOR' },
  { min: 10, name: 'ARCHITECT' },
  { min: 15, name: 'KEEPER' },
  { min: 25, name: 'SAGE' },
]

/**
 * XP is earned by showing up, not by volume: a day with any entry is worth far
 * more than the 5th entry of that day. Streaks and generated stories bonus.
 */
export function computeArcade(input: {
  entries: number
  activeDays: number
  streak: number
  stories: number
  selfCareTouches: number
}): ArcadeState {
  const xp =
    Math.min(input.entries, input.activeDays * 5) * 5 +
    input.activeDays * 25 +
    input.streak * 15 +
    input.stories * 50 +
    input.selfCareTouches * 10
  const level = Math.floor(Math.sqrt(xp / 50)) + 1
  let rank = RANKS[0].name
  let nextIdx = -1
  RANKS.forEach((r, i) => {
    if (level >= r.min) rank = r.name
    else if (nextIdx === -1) nextIdx = i
  })
  const nextLevel = level + 1
  const xpToNext = Math.max(0, (nextLevel - 1) ** 2 * 50 - xp)
  return { xp, level, rank, nextRank: nextIdx === -1 ? null : RANKS[nextIdx].name, xpToNext }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function toDate(v: Date | string): Date { return v instanceof Date ? v : new Date(v) }

function dayKey(d: Date, tz?: string | null): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || undefined }).format(d) // YYYY-MM-DD
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

function hourOf(d: Date, tz?: string | null): number {
  try {
    const h = new Intl.DateTimeFormat('en-GB', { timeZone: tz || undefined, hour: '2-digit', hour12: false }).format(d)
    return parseInt(h, 10) % 24
  } catch {
    return d.getUTCHours()
  }
}

function tally(values: string[]): { label: string; count: number }[] {
  const m = new Map<string, number>()
  values.forEach(v => m.set(v, (m.get(v) || 0) + 1))
  return Array.from(m, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Temperatures in logs are stored in Fahrenheit (client converts with toCelsius). */
const toC = (f: number) => Math.round(((f - 32) * 5) / 9)

// ── Core compression ────────────────────────────────────────────────────────

export function compressLogs(rows: StoryLogRow[], scope: StoryScope, now: Date = new Date()): StoryDigest {
  const windowDays = SCOPE_DAYS[scope]
  const start = new Date(now.getTime() - windowDays * 86400000)
  const inWin = rows.filter(r => { const t = toDate(r.createdAt).getTime(); return t >= start.getTime() && t <= now.getTime() })
  const journal = inWin.filter(r => JOURNAL_EVENTS.includes(r.event) && (r.text || '').trim())
  const tz = (journal.find(r => r.context?.timeZone)?.context?.timeZone as string) || null

  // Strip our own appended outputs (📖 / 🕯️ blocks) so the story never feeds on itself.
  const clean = (t: string) => t.split(/\n\n(?=[📖🕯])/u)[0].trim()
  const texts = journal.map(r => clean(r.text || '')).filter(Boolean)
  const words = texts.reduce((n, t) => n + t.split(/\s+/).filter(Boolean).length, 0)

  // Days / streak (streak counts back from the most recent active day within 1 day of now).
  const perDay = new Map<string, number>()
  journal.forEach(r => { const k = dayKey(toDate(r.createdAt), tz); perDay.set(k, (perDay.get(k) || 0) + 1) })
  const activeDays = perDay.size
  let streak = 0
  for (let i = 0; i < windowDays; i++) {
    const k = dayKey(new Date(now.getTime() - i * 86400000), tz)
    if (perDay.has(k)) streak++
    else if (i === 0) continue // today may not be logged yet
    else break
  }

  const moods = tally(inWin.filter(r => MOOD_EVENTS.includes(r.event))
    .map(r => String(r.metadata?.emotionalState || '').toUpperCase()).filter(Boolean))
  const selfCareTouches = inWin.filter(r => SELF_CARE_EVENTS.includes(r.event)).length
  const stories = rows.filter(r => r.event === STORY_EVENT).length

  // Context metadata captured on every entry.
  const ctx = journal.map(r => r.context || {})
  const places = tally(ctx.map(c => String(c.city || '')).filter(Boolean)).slice(0, 3).map(p => p.label)
  const weather = tally(ctx.map(c => String(c.weatherDescription || '').toLowerCase()).filter(Boolean)).slice(0, 3).map(p => p.label)
  const temps = ctx.map(c => c.temperature).filter((n): n is number => typeof n === 'number').map(toC)
  const hums = ctx.map(c => c.humidity).filter((n): n is number => typeof n === 'number')
  const moonPhases = tally(ctx.map(c => String(c.astroMoonPhase || '')).filter(Boolean)).slice(0, 2).map(p => p.label)

  const dayparts = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  journal.forEach(r => {
    const h = hourOf(toDate(r.createdAt), tz)
    dayparts[h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 22 ? 'evening' : 'night']++
  })

  // Spikes: the machine's reason to follow up.
  const spikes: StorySpike[] = []
  const counts = Array.from(perDay.values())
  if (counts.length >= 3) {
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const sd = Math.sqrt(counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length)
    perDay.forEach((c, k) => {
      if (c >= 3 && c > mean + 1.5 * sd) spikes.push({ kind: 'volume-spike', detail: `${c} entries on ${k} (avg ${mean.toFixed(1)})` })
    })
  }
  const lastEntry = journal.length ? Math.max(...journal.map(r => toDate(r.createdAt).getTime())) : null
  if (lastEntry !== null && scope !== 'day') {
    const gap = Math.floor((now.getTime() - lastEntry) / 86400000)
    if (gap >= 3 && activeDays >= 2) spikes.push({ kind: 'silence', detail: `${gap} days since last entry` })
  }
  if (moods.length >= 2) {
    const ordered = inWin.filter(r => MOOD_EVENTS.includes(r.event))
      .sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())
      .map(r => String(r.metadata?.emotionalState || '').toUpperCase()).filter(Boolean)
    const first = ordered[0], last = ordered[ordered.length - 1]
    if (first && last && first !== last) spikes.push({ kind: 'mood-shift', detail: `${first} -> ${last}` })
  }

  const excerpts = texts.slice(0, 6).map(t => t.replace(/\s+/g, ' ').slice(0, 160))

  return {
    scope,
    windowStart: start.toISOString(),
    windowEnd: now.toISOString(),
    entries: journal.length,
    words,
    activeDays,
    windowDays,
    streak,
    moods,
    selfCareTouches,
    places,
    weather,
    tempRangeC: temps.length ? [Math.min(...temps), Math.max(...temps)] : null,
    avgHumidity: hums.length ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : null,
    moonPhases,
    dayparts,
    spikes,
    excerpts,
    arcade: computeArcade({ entries: journal.length, activeDays, streak, stories, selfCareTouches }),
  }
}

// ── Rendering ───────────────────────────────────────────────────────────────

/** Compact data block for the AI vendor. This is the ONLY user data that leaves LOT. */
export function renderDigestForModel(d: StoryDigest): string {
  const peakPart = (Object.entries(d.dayparts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]
  const lines = [
    `WINDOW: last ${d.windowDays} day(s) (${d.scope})`,
    `ENTRIES: ${d.entries} across ${d.activeDays} active day(s), ${d.words} words, current streak ${d.streak}`,
    `MOODS: ${d.moods.map(m => `${m.label}x${m.count}`).join(', ') || 'NO DATA'}`,
    `SELF-CARE TOUCHES: ${d.selfCareTouches}`,
    `PLACES: ${d.places.join(', ') || 'NO DATA'}`,
    `WEATHER: ${d.weather.join(', ') || 'NO DATA'}${d.tempRangeC ? `, ${d.tempRangeC[0]}..${d.tempRangeC[1]}C` : ''}${d.avgHumidity !== null ? `, humidity ~${d.avgHumidity}%` : ''}`,
    `SKY: ${d.moonPhases.join(', ') || 'NO DATA'}`,
    `LOGS MOSTLY AT: ${peakPart && peakPart[1] > 0 ? peakPart[0] : 'NO DATA'}`,
    `SPIKES: ${d.spikes.map(s => `${s.kind} (${s.detail})`).join('; ') || 'none'}`,
    `ARCADE: level ${d.arcade.level} ${d.arcade.rank}, ${d.arcade.xp} XP`,
    `ENTRY EXCERPTS:`,
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ]
  return lines.join('\n')
}

/** Deterministic story used when the vendor is unreachable. Never invents facts. */
export function fallbackStory(d: StoryDigest): string {
  const span = d.scope === 'day' ? 'today' : `the last ${d.windowDays} days`
  if (d.entries === 0) {
    return `Nothing has been logged ${span}. The system is listening whenever you are ready — one line is enough.`
  }
  const bits: string[] = [
    `You logged ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'} ${span}${d.activeDays > 1 ? `, across ${d.activeDays} days` : ''}.`,
  ]
  if (d.moods.length) bits.push(`The mood you named most was ${d.moods[0].label.toLowerCase()}.`)
  if (d.places.length) bits.push(`Mostly from ${d.places[0]}${d.weather[0] ? `, under ${d.weather[0]}` : ''}.`)
  if (d.streak > 1) bits.push(`${d.streak} days in a row — the habit is holding.`)
  d.spikes.forEach(s => {
    if (s.kind === 'silence') bits.push(`There has been a quiet stretch: ${s.detail}.`)
    if (s.kind === 'mood-shift') bits.push(`Your mood moved: ${s.detail.toLowerCase()}.`)
    if (s.kind === 'volume-spike') bits.push(`One day ran louder than the rest: ${s.detail}.`)
  })
  bits.push(`Level ${d.arcade.level} ${d.arcade.rank}.`)
  return bits.join(' ')
}
