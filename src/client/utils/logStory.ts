/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log story compression + arcade evolution.
 *
 * Deterministic, on-device compression of the operator's record into a
 * day / week / month / year story. No network, no LLM: the same logs always
 * produce the same story. The digest it produces is ALSO the payload sent to
 * the AI vendor (Together AI, via POST /api/story) so the model receives a
 * compressed context instead of raw entries:
 *
 *   LOT User data -> compressStory() digest -> QIE route -> Together AI
 *
 * Arcade: every record earns XP. XP maps to a LEVEL and a RANK. The framing is
 * self-care first — XP rewards showing up and noticing, never output volume.
 *
 * Pure module: no stores, no DOM, no Date.now() (callers pass `now`).
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export interface StoryLogInput {
  text?: string | null
  event?: string | null
  createdAt: string | number | Date
  context?: Record<string, any> | null
}

/** Events that are the operator's own journal writing. */
export const JOURNAL_EVENTS = ['note', 'log_entry', 'journal'] as const

/** Events that are machine bookkeeping — never counted as operator activity. */
export const NOISE_EVENTS = [
  'ping', 'settings_change', 'users_total', 'users_online', 'badge_unlock',
  'generated_story', 'qi_rfi', 'assembly_directive', 'prayer_scripture',
  'system_feedback', 'chat_message_like', 'live_message', 'other',
] as const

const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }
const DAY_MS = 86_400_000

const STOPWORDS = new Set((
  'the a an and or but if then so of to in on at by for with from as is are was were be been it its this that these those ' +
  'i me my mine we our you your he she they them his her their not no yes do did done have has had just very really ' +
  'about into over under out up down more most some any all can could would should will than too also what when where ' +
  'who why how today day got get like feel feeling felt am im ive dont'
).split(' '))

// ---------------------------------------------------------------------------
// Period parsing
// ---------------------------------------------------------------------------

/** Reads "/story [period]" from an entry. Defaults to week. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(?:^|\s)\/story\s+(day|today|week|month|year)\b/i.exec(text || '')
  if (!m) return 'week'
  const w = m[1].toLowerCase()
  return w === 'today' ? 'day' : (w as StoryPeriod)
}

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

export interface StoryDigest {
  period: StoryPeriod
  windowDays: number
  entries: number            // journal entries in window
  signals: number            // non-journal operator events (clicks, check-ins)
  priorEntries: number       // journal entries in the preceding window
  change: 'spike' | 'drop' | 'steady' | 'new'
  activeDays: number
  streak: number             // consecutive active days ending today (or yesterday)
  peakDay: { date: string; count: number } | null
  peakHour: number | null    // 0-23, most active local hour
  partOfDay: 'night' | 'morning' | 'afternoon' | 'evening' | null
  themes: string[]           // top recurring words
  tempRangeC: [number, number] | null
  cities: string[]
  moonPhases: string[]
  firstEntry: string | null  // truncated sample (the opening of the window)
  lastEntry: string | null   // truncated sample (the most recent)
}

function ts(v: string | number | Date): number {
  return v instanceof Date ? v.getTime() : new Date(v).getTime()
}

function dayKey(t: number): string {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfDay(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function isNoise(l: StoryLogInput): boolean {
  return (NOISE_EVENTS as readonly string[]).includes(l.event || '')
}
function isJournal(l: StoryLogInput): boolean {
  return (JOURNAL_EVENTS as readonly string[]).includes(l.event || '') && !!(l.text || '').trim()
}

/** Strips slash commands and generated blocks (prayer/story) from an entry. */
export function cleanEntryText(text: string): string {
  return (text || '')
    .split(/\n\n(?=[🕯📖])/u)[0]                 // drop appended prayer/story blocks
    .replace(/(^|\s)\/[a-z-]+(\s+\[?[a-z|]+\]?)?/gi, ' ')
    .replace(/[🕯️📖🎹🎧🌙🧊❗‼️]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function clip(s: string, n = 140): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…'
}

export function compressStory(
  logs: StoryLogInput[],
  period: StoryPeriod,
  now: number | Date = Date.now()
): StoryDigest {
  const nowT = ts(now)
  const days = PERIOD_DAYS[period]
  // "day" = since local midnight; others = trailing N days including today.
  const end = startOfDay(nowT) + DAY_MS
  const start = end - days * DAY_MS
  const priorStart = start - days * DAY_MS

  const live = logs.filter(l => !isNoise(l) && Number.isFinite(ts(l.createdAt)))
  const inWin = live.filter(l => ts(l.createdAt) >= start && ts(l.createdAt) < end)
  const inPrior = live.filter(l => ts(l.createdAt) >= priorStart && ts(l.createdAt) < start)

  const journal = inWin.filter(isJournal).sort((a, b) => ts(a.createdAt) - ts(b.createdAt))
  const signals = inWin.length - journal.length
  const priorEntries = inPrior.filter(isJournal).length

  // Day buckets
  const perDay = new Map<string, number>()
  for (const l of inWin) perDay.set(dayKey(ts(l.createdAt)), (perDay.get(dayKey(ts(l.createdAt))) || 0) + 1)
  let peakDay: StoryDigest['peakDay'] = null
  perDay.forEach((count, date) => {
    if (!peakDay || count > peakDay.count) peakDay = { date, count }
  })

  // Streak over ALL live logs: consecutive days ending today (or yesterday).
  const allDays = new Set(live.map(l => dayKey(ts(l.createdAt))))
  let streak = 0
  let cursor = startOfDay(nowT)
  if (!allDays.has(dayKey(cursor))) cursor -= DAY_MS
  while (allDays.has(dayKey(cursor))) {
    streak++
    cursor -= DAY_MS
  }

  // Hour distribution
  const hours = new Array(24).fill(0)
  for (const l of inWin) hours[new Date(ts(l.createdAt)).getHours()]++
  const maxHour = Math.max(...hours)
  const peakHour = maxHour > 0 ? hours.indexOf(maxHour) : null
  const partOfDay: StoryDigest['partOfDay'] =
    peakHour === null ? null
      : peakHour < 5 || peakHour >= 22 ? 'night'
      : peakHour < 12 ? 'morning'
      : peakHour < 17 ? 'afternoon' : 'evening'

  // Themes: most frequent non-stopword tokens across journal text
  const freq = new Map<string, number>()
  for (const l of journal) {
    for (const w of cleanEntryText(l.text || '').toLowerCase().match(/[\p{L}]{4,}/gu) || []) {
      if (!STOPWORDS.has(w)) freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  const themes = Array.from(freq.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([w]) => w)

  // Context metadata
  const temps: number[] = []
  const cities = new Map<string, number>()
  const moons = new Map<string, number>()
  for (const l of inWin) {
    const c = l.context || {}
    if (typeof c.temperature === 'number') {
      // Log context stores temperature in Kelvin (see shared/utils toCelsius).
      temps.push(c.temperature - 273.15)
    }
    if (c.city) cities.set(c.city, (cities.get(c.city) || 0) + 1)
    if (c.astroMoonPhase) moons.set(c.astroMoonPhase, (moons.get(c.astroMoonPhase) || 0) + 1)
  }
  const top = (m: Map<string, number>, n: number) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k)

  // Pattern change: spike / drop vs prior window (needs a baseline of >= 3)
  let change: StoryDigest['change'] = 'steady'
  if (priorEntries === 0) change = journal.length > 0 ? 'new' : 'steady'
  else if (priorEntries >= 3 && journal.length >= priorEntries * 1.5) change = 'spike'
  else if (priorEntries >= 3 && journal.length <= priorEntries * 0.5) change = 'drop'

  return {
    period,
    windowDays: days,
    entries: journal.length,
    signals,
    priorEntries,
    change,
    activeDays: perDay.size,
    streak,
    peakDay,
    peakHour,
    partOfDay,
    themes,
    tempRangeC: temps.length ? [Math.round(Math.min(...temps)), Math.round(Math.max(...temps))] : null,
    cities: top(cities, 2),
    moonPhases: top(moons, 1),
    firstEntry: journal.length ? clip(cleanEntryText(journal[0].text || '')) || null : null,
    lastEntry: journal.length ? clip(cleanEntryText(journal[journal.length - 1].text || '')) || null : null,
  }
}

// ---------------------------------------------------------------------------
// Arcade evolution
// ---------------------------------------------------------------------------

export interface ArcadeRank {
  min: number
  title: string
}

/** Rank ladder keyed by LEVEL. Self-care framing: presence over output. */
export const ARCADE_RANKS: ArcadeRank[] = [
  { min: 1,  title: 'SIGNAL' },       // first records
  { min: 3,  title: 'OBSERVER' },     // noticing the self
  { min: 6,  title: 'KEEPER' },       // routine forming
  { min: 10, title: 'NAVIGATOR' },    // patterns understood
  { min: 15, title: 'CARTOGRAPHER' }, // maps own cycles
  { min: 21, title: 'ARCHIVIST' },    // long memory
  { min: 30, title: 'OPERATOR PRIME' },
]

export interface ArcadeStatus {
  xp: number
  level: number
  rank: string
  xpIntoLevel: number
  xpForNext: number
  bar: string          // fixed-width text progress bar
  nextRank: string | null
}

/** Cumulative XP needed to reach `level` (level 1 = 0). Quadratic, gentle early. */
export function xpForLevel(level: number): number {
  const n = Math.max(0, level - 1)
  return 25 * n * n + 25 * n // 0, 50, 150, 300, 500, ...
}

export function levelForXp(xp: number): number {
  let lvl = 1
  while (xpForLevel(lvl + 1) <= xp) lvl++
  return lvl
}

export function rankForLevel(level: number): string {
  let title = ARCADE_RANKS[0].title
  for (const r of ARCADE_RANKS) if (level >= r.min) title = r.title
  return title
}

/**
 * XP rules (self-care: consistency > volume):
 *   journal entry  +10  (capped at 3 XP-bearing entries per day)
 *   other signal   +2   (capped at 10 per day)
 *   active day     +15
 *   streak bonus   +5 per streak day, max +50 (today's streak)
 */
export function computeArcade(logs: StoryLogInput[], now: number | Date = Date.now()): ArcadeStatus {
  const live = logs.filter(l => !isNoise(l) && Number.isFinite(ts(l.createdAt)))
  const byDay = new Map<string, { j: number; s: number }>()
  for (const l of live) {
    const k = dayKey(ts(l.createdAt))
    const b = byDay.get(k) || { j: 0, s: 0 }
    if (isJournal(l)) b.j++
    else b.s++
    byDay.set(k, b)
  }
  let xp = 0
  byDay.forEach(b => {
    xp += Math.min(b.j, 3) * 10 + Math.min(b.s, 10) * 2 + 15
  })
  const streak = compressStory(logs, 'day', now).streak
  xp += Math.min(streak * 5, 50)

  const level = levelForXp(xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const into = xp - base
  const span = next - base
  const filled = Math.max(0, Math.min(10, Math.round((into / span) * 10)))
  const nextRankEntry = ARCADE_RANKS.find(r => r.min > level)
  return {
    xp,
    level,
    rank: rankForLevel(level),
    xpIntoLevel: into,
    xpForNext: span,
    bar: '[' + '#'.repeat(filled) + '.'.repeat(10 - filled) + ']',
    nextRank: nextRankEntry ? nextRankEntry.title : null,
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const PERIOD_LABEL: Record<StoryPeriod, string> = {
  day: 'TODAY', week: 'LAST 7 DAYS', month: 'LAST 30 DAYS', year: 'LAST 365 DAYS',
}

function hh(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}

/**
 * Renders the compressed story: a short deterministic narrative plus a
 * fixed-grid data block and the arcade status. Output lines use
 * "KEY   value" rows so the Logs renderer can align them.
 */
export function renderStory(d: StoryDigest, arcade: ArcadeStatus): string {
  const lines: string[] = []
  lines.push(`STORY ${PERIOD_LABEL[d.period]}`)
  lines.push('')

  if (d.entries === 0 && d.signals === 0) {
    lines.push(
      d.period === 'day'
        ? 'Nothing recorded today. The record is quiet, and quiet is data too.'
        : `Nothing recorded in the ${PERIOD_LABEL[d.period].toLowerCase()}. The next entry starts the story.`
    )
  } else {
    const parts: string[] = []
    const where = d.cities.length ? ` in ${d.cities.join(' and ')}` : ''
    parts.push(
      `You wrote ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'}${where}` +
        (d.activeDays > 1 ? ` across ${d.activeDays} days` : '') + '.'
    )
    if (d.partOfDay) parts.push(`You were most present in the ${d.partOfDay}, around ${hh(d.peakHour!)}.`)
    if (d.themes.length) parts.push(`What kept returning: ${d.themes.join(', ')}.`)
    if (d.change === 'spike') parts.push(`This is a spike against the ${d.priorEntries} entries before it. Something is moving.`)
    else if (d.change === 'drop') parts.push(`This is quieter than the ${d.priorEntries} entries before it. Worth noticing, not judging.`)
    else if (d.change === 'new') parts.push('This is a fresh stretch — no earlier record to compare to.')
    if (d.tempRangeC) {
      const [lo, hi] = d.tempRangeC
      parts.push(`The air ran ${lo === hi ? lo + '°C' : lo + ' to ' + hi + '°C'}${d.moonPhases[0] ? `, under a ${d.moonPhases[0].toLowerCase()} moon` : ''}.`)
    }
    lines.push(parts.join(' '))
    if (d.lastEntry) {
      lines.push('')
      lines.push(`Latest: "${d.lastEntry}"`)
    }
  }

  lines.push('')
  lines.push('RECORD')
  lines.push(`ENTRIES    ${d.entries}   (prior ${d.priorEntries})`)
  lines.push(`SIGNALS    ${d.signals}`)
  lines.push(`ACTIVE     ${d.activeDays} of ${d.windowDays} days`)
  lines.push(`STREAK     ${d.streak} ${d.streak === 1 ? 'day' : 'days'}`)
  if (d.peakDay) lines.push(`PEAK DAY   ${d.peakDay.date}  (${d.peakDay.count})`)
  lines.push('')
  lines.push('ARCADE')
  lines.push(`RANK       ${arcade.rank}  LVL ${arcade.level}`)
  lines.push(`XP         ${arcade.bar} ${arcade.xpIntoLevel}/${arcade.xpForNext}`)
  if (arcade.nextRank) lines.push(`NEXT RANK  ${arcade.nextRank}`)
  return lines.join('\n')
}

/**
 * Compact one-block text for the AI vendor. This is the compressed context
 * that replaces raw log entries in the /api/story prompt.
 */
export function digestForModel(d: StoryDigest, arcade: ArcadeStatus): string {
  const bits = [
    `PERIOD ${d.period.toUpperCase()}`,
    `ENTRIES ${d.entries} (prior ${d.priorEntries}, change ${d.change.toUpperCase()})`,
    `SIGNALS ${d.signals}`,
    `ACTIVE_DAYS ${d.activeDays}/${d.windowDays}`,
    `STREAK ${d.streak}`,
    d.partOfDay ? `PEAK_TIME ${d.partOfDay} ${hh(d.peakHour!)}` : '',
    d.themes.length ? `THEMES ${d.themes.join(',')}` : '',
    d.tempRangeC ? `TEMP_C ${d.tempRangeC[0]}..${d.tempRangeC[1]}` : '',
    d.cities.length ? `PLACE ${d.cities.join(',')}` : '',
    d.moonPhases[0] ? `MOON ${d.moonPhases[0]}` : '',
    `RANK ${arcade.rank} L${arcade.level}`,
    d.lastEntry ? `LATEST "${d.lastEntry}"` : '',
  ]
  return bits.filter(Boolean).join(' | ')
}
