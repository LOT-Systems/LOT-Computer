/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG STORY COMPRESSION (LSC) — pure, dependency-free.
 *
 * Turns raw Log entries (text + context metadata) into a compact
 * StoryDigest: volume, rhythm, environment, spikes/pattern changes and
 * the Arcade standing of the operator. The digest — never the raw log
 * text beyond short excerpts — is what is sent to the AI vendor.
 *
 * Shared by server (/api/story) and client (offline fallback, tests).
 * Spec: docs/technical/LOT-LOG-COMMAND-SYSTEM.md
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const DEFAULT_STORY_SCOPE: StoryScope = 'week'

const SCOPE_DAYS: Record<StoryScope, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const SCOPE_ALIASES: Record<string, StoryScope> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', weekly: 'week', w: 'week',
  month: 'month', monthly: 'month', m: 'month',
  year: 'year', yearly: 'year', y: 'year',
}

/**
 * Reads the scope argument following /story, e.g. "/story month".
 * Anything unrecognised falls back to DEFAULT_STORY_SCOPE.
 */
export function parseStoryScope(text: string): StoryScope {
  const m = /(?:^|\s)\/story(?:\s+([a-z]+))?/i.exec(text || '')
  const arg = m?.[1]?.toLowerCase()
  return (arg && SCOPE_ALIASES[arg]) || DEFAULT_STORY_SCOPE
}

export function storyScopeDays(scope: StoryScope): number {
  return SCOPE_DAYS[scope]
}

/** Minimal shape of a Log row — structurally compatible with the model. */
export interface StoryLogRow {
  text?: string | null
  event?: string | null
  createdAt: Date | string | number
  context?: {
    temperature?: number | null // Kelvin
    humidity?: number | null
    weatherDescription?: string | null
    city?: string | null
    astroMoonPhase?: string | null
    [key: string]: any
  } | null
  metadata?: Record<string, any> | null
}

export type DayPart = 'night' | 'morning' | 'afternoon' | 'evening'

export type SpikeKind =
  | 'volume-spike'   // far more entries than usual on one day
  | 'silence-gap'    // multi-day silence inside the window
  | 'rhythm-shift'   // dominant time of day changed between halves
  | 'mood-shift'     // dominant mood changed between halves
  | 'length-spike'   // an unusually long entry (heavy processing)

export interface StorySpike {
  kind: SpikeKind
  day?: string // YYYY-MM-DD
  note: string
}

export interface ArcadeStanding {
  xp: number
  level: number
  rank: string
  xpIntoLevel: number
  xpForNext: number
  streakDays: number
}

export interface StoryDigest {
  scope: StoryScope
  from: string // YYYY-MM-DD
  to: string
  entryCount: number
  activeDays: number
  windowDays: number
  streakDays: number
  avgWords: number
  dayParts: Record<DayPart, number>
  dominantDayPart: DayPart | null
  cities: string[]
  avgTempC: number | null
  weather: string[]
  moods: Array<{ mood: string; count: number }>
  spikes: StorySpike[]
  excerpts: string[]
  arcade: ArcadeStanding
}

/* ───────────────────────────── ARCADE ───────────────────────────── */

/**
 * Rank ladder — self-care tech-company flavour: you do not "kill
 * bosses", you gain presence. Index = level (clamped to the last rank).
 */
export const ARCADE_RANKS = [
  'INITIATE',
  'OBSERVER',
  'RECORDER',
  'OPERATOR',
  'NAVIGATOR',
  'CARTOGRAPHER',
  'ARCHITECT',
  'SENTINEL',
  'LUMINARY',
  'FOUNDER-CLASS',
] as const

/** XP weights. Showing up daily outweighs volume on purpose. */
export const XP_PER_ENTRY = 10
export const XP_PER_ACTIVE_DAY = 25
export const XP_PER_STREAK_DAY = 15
export const XP_PER_CHECKIN = 5

/** Level n begins at 50·n² XP  (L1=50, L2=200, L3=450, L4=800 …). */
export function xpForLevel(level: number): number {
  return 50 * level * level
}

export function levelFromXp(xp: number): number {
  return Math.max(0, Math.floor(Math.sqrt(Math.max(0, xp) / 50)))
}

export function computeArcade(
  entryCount: number,
  activeDays: number,
  streakDays: number,
  checkins: number
): ArcadeStanding {
  const xp =
    entryCount * XP_PER_ENTRY +
    activeDays * XP_PER_ACTIVE_DAY +
    streakDays * XP_PER_STREAK_DAY +
    checkins * XP_PER_CHECKIN
  const level = levelFromXp(xp)
  const floor = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return {
    xp,
    level,
    rank: ARCADE_RANKS[Math.min(level, ARCADE_RANKS.length - 1)],
    xpIntoLevel: xp - floor,
    xpForNext: next - floor,
    streakDays,
  }
}

/* ───────────────────────────── HELPERS ───────────────────────────── */

const DAY_MS = 86_400_000

function toDate(v: Date | string | number): Date {
  return v instanceof Date ? v : new Date(v)
}

/** Calendar-day key in UTC. Callers pass `tzOffsetMinutes` for local days. */
function dayKey(d: Date, tzOffsetMinutes: number): string {
  return new Date(d.getTime() + tzOffsetMinutes * 60_000)
    .toISOString()
    .slice(0, 10)
}

function localHour(d: Date, tzOffsetMinutes: number): number {
  return new Date(d.getTime() + tzOffsetMinutes * 60_000).getUTCHours()
}

export function dayPartOf(hour: number): DayPart {
  if (hour < 6) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

function wordCount(s: string): number {
  const t = s.trim()
  return t ? t.split(/\s+/).length : 0
}

function top<T extends string>(counts: Record<T, number>): T | null {
  let best: T | null = null
  let n = 0
  for (const k of Object.keys(counts) as T[]) {
    if (counts[k] > n) {
      best = k
      n = counts[k]
    }
  }
  return best
}

/** Commands and generated output never count as the operator's own words. */
export function isOperatorEntry(row: StoryLogRow): boolean {
  if (row.event !== 'note') return false
  const t = (row.text || '').trim()
  return t.length > 0
}

/** Strips slash-commands and generated 📖/🕯️ blocks from an entry. */
export function cleanEntryText(text: string): string {
  return text
    .split('\n')
    .filter(l => !/^\s*(📖|🕯️?)/.test(l))
    .join('\n')
    .replace(/(^|\s)\/[a-z][a-z0-9-]*/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ───────────────────────────── COMPRESSION ───────────────────────────── */

export interface CompressOptions {
  now?: Date
  /** Minutes east of UTC for the operator's local day boundaries. */
  tzOffsetMinutes?: number
}

export function compressLogs(
  rows: StoryLogRow[],
  scope: StoryScope,
  opts: CompressOptions = {}
): StoryDigest {
  const now = opts.now ?? new Date()
  const tz = opts.tzOffsetMinutes ?? 0
  const windowDays = SCOPE_DAYS[scope]
  const todayKey = dayKey(now, tz)
  const todayStart = Date.parse(todayKey + 'T00:00:00Z') - tz * 60_000
  const windowStart = todayStart - (windowDays - 1) * DAY_MS

  // All-time-in-fetch rows feed Arcade (the "season"); window rows feed the story.
  const entriesAll = rows.filter(isOperatorEntry)
  const entries = entriesAll.filter(r => {
    const t = toDate(r.createdAt).getTime()
    return t >= windowStart && t < todayStart + DAY_MS
  })
  const checkinsAll = rows.filter(
    r => r.event === 'emotional_checkin' || r.event === 'self_care' || r.event === 'answer'
  )

  // Per-day volume
  const perDay: Record<string, number> = {}
  const dayParts: Record<DayPart, number> = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  const cities: Record<string, number> = {}
  const weather: Record<string, number> = {}
  const temps: number[] = []
  let words = 0

  for (const r of entries) {
    const d = toDate(r.createdAt)
    perDay[dayKey(d, tz)] = (perDay[dayKey(d, tz)] || 0) + 1
    dayParts[dayPartOf(localHour(d, tz))]++
    words += wordCount(cleanEntryText(r.text || ''))
    const c = r.context
    if (c?.city) cities[c.city] = (cities[c.city] || 0) + 1
    if (c?.weatherDescription) weather[c.weatherDescription] = (weather[c.weatherDescription] || 0) + 1
    if (typeof c?.temperature === 'number') temps.push(c.temperature - 273.15)
  }

  // Moods (emotional_checkin metadata) inside window
  const moodCounts: Record<string, number> = {}
  const moodRowsInWindow = checkinsAll.filter(r => {
    const t = toDate(r.createdAt).getTime()
    return r.event === 'emotional_checkin' && t >= windowStart
  })
  for (const r of moodRowsInWindow) {
    const m = String(r.metadata?.emotionalState || '').trim().toLowerCase()
    if (m) moodCounts[m] = (moodCounts[m] || 0) + 1
  }

  // Streak: consecutive active days ending today (or yesterday — a day
  // not yet written is not a broken streak).
  const allDays = new Set(entriesAll.map(r => dayKey(toDate(r.createdAt), tz)))
  let streak = 0
  let cursor = todayStart
  if (!allDays.has(dayKey(new Date(cursor + 1), tz))) cursor -= DAY_MS
  while (allDays.has(dayKey(new Date(cursor + 1), tz))) {
    streak++
    cursor -= DAY_MS
  }

  const spikes = detectSpikes(entries, perDay, moodRowsInWindow, {
    windowStart,
    todayStart,
    windowDays,
    tz,
  })

  const sortedByTop = (o: Record<string, number>, n: number) =>
    Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n)

  const excerpts = entries
    .slice()
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
    .slice(0, 5)
    .map(r => cleanEntryText(r.text || '').slice(0, 160))
    .filter(Boolean)

  const activeDays = Object.keys(perDay).length
  const arcade = computeArcade(
    entriesAll.length,
    allDays.size,
    streak,
    checkinsAll.length
  )

  return {
    scope,
    from: dayKey(new Date(windowStart + 1), tz),
    to: todayKey,
    entryCount: entries.length,
    activeDays,
    windowDays,
    streakDays: streak,
    avgWords: entries.length ? Math.round(words / entries.length) : 0,
    dayParts,
    dominantDayPart: entries.length ? top(dayParts) : null,
    cities: sortedByTop(cities, 3).map(([k]) => k),
    avgTempC: temps.length
      ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
      : null,
    weather: sortedByTop(weather, 3).map(([k]) => k),
    moods: sortedByTop(moodCounts, 4).map(([mood, count]) => ({ mood, count })),
    spikes,
    excerpts,
    arcade,
  }
}

/* ───────────────────────────── SPIKES ───────────────────────────── */

function detectSpikes(
  entries: StoryLogRow[],
  perDay: Record<string, number>,
  moodRows: StoryLogRow[],
  w: { windowStart: number; todayStart: number; windowDays: number; tz: number }
): StorySpike[] {
  const spikes: StorySpike[] = []
  if (entries.length === 0) return spikes

  // Volume spike: day count > mean + 1.5σ over the window's days, min 3 entries.
  if (w.windowDays >= 7) {
    const counts: number[] = []
    for (let i = 0; i < w.windowDays; i++) {
      counts.push(perDay[dayKey(new Date(w.windowStart + i * DAY_MS + 1), w.tz)] || 0)
    }
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const sd = Math.sqrt(counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length)
    for (const [day, n] of Object.entries(perDay)) {
      if (n >= 3 && n > mean + 1.5 * sd) {
        spikes.push({ kind: 'volume-spike', day, note: `${n} entries on ${day} (usual ${mean.toFixed(1)}/day)` })
      }
    }
  }

  // Silence gap: ≥3 consecutive empty days between first and last active day.
  const activeKeys = Object.keys(perDay).sort()
  for (let i = 1; i < activeKeys.length; i++) {
    const gap =
      (Date.parse(activeKeys[i] + 'T00:00:00Z') - Date.parse(activeKeys[i - 1] + 'T00:00:00Z')) / DAY_MS - 1
    if (gap >= 3) {
      spikes.push({ kind: 'silence-gap', day: activeKeys[i - 1], note: `${gap} days of silence after ${activeKeys[i - 1]}` })
    }
  }

  // Rhythm shift: compare dominant day-part of first vs second half (needs ≥6 entries).
  if (entries.length >= 6) {
    const sorted = entries.slice().sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())
    const mid = Math.floor(sorted.length / 2)
    const dom = (rows: StoryLogRow[]) => {
      const c: Record<DayPart, number> = { night: 0, morning: 0, afternoon: 0, evening: 0 }
      rows.forEach(r => c[dayPartOf(localHour(toDate(r.createdAt), w.tz))]++)
      return top(c)
    }
    const a = dom(sorted.slice(0, mid))
    const b = dom(sorted.slice(mid))
    if (a && b && a !== b) {
      spikes.push({ kind: 'rhythm-shift', note: `writing moved from ${a} to ${b}` })
    }
  }

  // Mood shift: first vs second half dominant mood (needs ≥4 check-ins).
  if (moodRows.length >= 4) {
    const sorted = moodRows.slice().sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())
    const mid = Math.floor(sorted.length / 2)
    const dom = (rows: StoryLogRow[]) => {
      const c: Record<string, number> = {}
      rows.forEach(r => {
        const m = String(r.metadata?.emotionalState || '').toLowerCase()
        if (m) c[m] = (c[m] || 0) + 1
      })
      return top(c)
    }
    const a = dom(sorted.slice(0, mid))
    const b = dom(sorted.slice(mid))
    if (a && b && a !== b) spikes.push({ kind: 'mood-shift', note: `mood moved from ${a} to ${b}` })
  }

  // Length spike: one entry > 3× median length and ≥ 80 words.
  const lens = entries.map(r => wordCount(cleanEntryText(r.text || ''))).sort((a, b) => a - b)
  const median = lens[Math.floor(lens.length / 2)] || 0
  const longest = lens[lens.length - 1] || 0
  if (entries.length >= 4 && longest >= 80 && longest > 3 * Math.max(median, 1)) {
    spikes.push({ kind: 'length-spike', note: `one entry of ${longest} words (median ${median})` })
  }

  return spikes.slice(0, 6)
}

/* ───────────────────────────── RENDERING ───────────────────────────── */

/** Compact text block for the AI prompt. No user identifiers. */
export function renderDigestForPrompt(d: StoryDigest): string {
  const lines = [
    `SCOPE: ${d.scope.toUpperCase()} (${d.from} → ${d.to})`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays}/${d.windowDays} days · avg ${d.avgWords} words · streak ${d.streakDays}d`,
    `RHYTHM: ${(Object.keys(d.dayParts) as DayPart[]).map(k => `${k} ${d.dayParts[k]}`).join(' · ')}`,
  ]
  const env: string[] = []
  if (d.cities.length) env.push(d.cities.join(', '))
  if (d.avgTempC !== null) env.push(`avg ${d.avgTempC}°C`)
  if (d.weather.length) env.push(d.weather.join(', '))
  lines.push(`ENVIRONMENT: ${env.join(' · ') || 'no data'}`)
  lines.push(`MOODS: ${d.moods.map(m => `${m.mood}×${m.count}`).join(', ') || 'no data'}`)
  lines.push(`SPIKES: ${d.spikes.map(s => s.note).join('; ') || 'none — steady pattern'}`)
  lines.push(`ARCADE: ${d.arcade.rank} · level ${d.arcade.level} · ${d.arcade.xp} XP`)
  lines.push('RECENT EXCERPTS:')
  lines.push(...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']))
  return lines.join('\n')
}

/** Terminal-grid status card shown above the story in the Log. */
export function renderStoryCard(d: StoryDigest): string {
  const bar = (n: number, total: number, width = 10) => {
    const filled = total > 0 ? Math.round((n / total) * width) : 0
    return '█'.repeat(filled) + '░'.repeat(width - filled)
  }
  return [
    `STORY           ${d.scope.toUpperCase()}  ${d.from} → ${d.to}`,
    `ENTRIES         ${d.entryCount}  ·  ${d.activeDays}/${d.windowDays} DAYS ACTIVE`,
    `STREAK          ${d.streakDays} DAYS`,
    `ARCADE          ${d.arcade.rank}  L${d.arcade.level}  ${d.arcade.xp} XP`,
    `NEXT RANK       ${bar(d.arcade.xpIntoLevel, d.arcade.xpForNext)}  ${d.arcade.xpForNext - d.arcade.xpIntoLevel} XP`,
    ...(d.spikes.length ? [`SIGNAL          ${d.spikes[0].note.toUpperCase()}`] : []),
  ].join('\n')
}

/**
 * Deterministic offline story — used when the AI vendor is unavailable
 * so /story always answers. Honest: states only what the digest holds.
 */
export function composeLocalStory(d: StoryDigest): string {
  if (d.entryCount === 0) {
    return `No entries in this ${d.scope}. The Log is quiet — it will be here when you write. One line is enough to begin again.`
  }
  const rhythm = d.dominantDayPart ? ` mostly in the ${d.dominantDayPart}` : ''
  const place = d.cities.length ? ` from ${d.cities[0]}` : ''
  const wx = d.avgTempC !== null ? `, around ${d.avgTempC}°C` : ''
  const p1 = `This ${d.scope} you wrote ${d.entryCount} ${d.entryCount === 1 ? 'entry' : 'entries'} on ${d.activeDays} of ${d.windowDays} days${rhythm}${place}${wx}.`
  const p2 = d.spikes.length
    ? `The Log noticed a change: ${d.spikes[0].note}.`
    : `The pattern held steady — no spikes, no breaks.`
  const p3 = d.streakDays >= 2
    ? `The streak stands at ${d.streakDays} days. Quiet consistency is its own signal.`
    : `Tomorrow's entry is where the next line of the story begins.`
  return `${p1}\n\n${p2} ${p3}`
}
