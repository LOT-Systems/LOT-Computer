/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — day / week / month / year.
 *
 * Deterministic, offline compression of a user's Log stream into a compact
 * digest: volume, mood, peaks and lows, pattern change, environment context,
 * recurring themes, and an Arcade rank. The digest does two jobs:
 *   1. It is shown instantly for /story (no network, works offline).
 *   2. It is sent to the AI vendor as the compressed prompt, so the model
 *      narrates a summary instead of re-reading raw entries.
 *
 * Pure (no stores, no DOM, no network). The Arcade rank is derived on the
 * client from the same data and is PROVISIONAL — it is a motivational
 * surface, not a stored, authoritative score.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export interface StoryLog {
  text: string | null
  event: string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

export interface ArcadeRank {
  level: number
  title: string
  xp: number
  /** XP still needed for next level; null at max level */
  toNext: number | null
}

export interface StoryDigest {
  scope: StoryScope
  days: number
  entries: number
  words: number
  checkins: number
  activeDays: number
  streak: number
  moods: string[]
  peakDay: { date: string; entries: number } | null
  quietestRun: number
  /** 'spike' | 'drop' | 'steady' | 'insufficient' — second half vs first half */
  shift: 'spike' | 'drop' | 'steady' | 'insufficient'
  themes: string[]
  place: string | null
  tempRangeC: [number, number] | null
  arcade: ArcadeRank
}

export const SCOPE_DAYS: Record<StoryScope, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Events that are system-made, not something the user wrote. */
const GENERATED_EVENTS = new Set([
  'generated_story', 'prayer_scripture', 'qi_query', 'assembly_directive',
])
const CHECKIN_EVENTS = new Set([
  'emotional_checkin', 'self_care_checkin', 'energy_checkin', 'memory_answer',
])

const ARCADE_LEVELS: Array<{ min: number; title: string }> = [
  { min: 0,     title: 'SIGNAL' },
  { min: 100,   title: 'OPERATOR' },
  { min: 400,   title: 'NAVIGATOR' },
  { min: 1000,  title: 'ARCHITECT' },
  { min: 2500,  title: 'CARTOGRAPHER' },
  { min: 6000,  title: 'KEEPER' },
  { min: 15000, title: 'LOT' },
]

export function arcadeRank(xp: number): ArcadeRank {
  let idx = 0
  for (let i = 0; i < ARCADE_LEVELS.length; i++) {
    if (xp >= ARCADE_LEVELS[i].min) idx = i
  }
  const next = ARCADE_LEVELS[idx + 1]
  return {
    level: idx + 1,
    title: ARCADE_LEVELS[idx].title,
    xp,
    toNext: next ? next.min - xp : null,
  }
}

const STOP = new Set((
  'the a an and or but if then so of to in on at for with from by as is are was were be been am i me my we our you your it its ' +
  'this that these those not no yes do did does have has had just very really too also than into out up down over about what when ' +
  'where who how why can could would should will to too more some any all one get got like feel feeling today'
).split(' '))

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function topThemes(texts: string[], n: number): string[] {
  const freq = new Map<string, number>()
  for (const t of texts) {
    // strip slash commands and emojis-as-markers before counting
    const words = t.toLowerCase().replace(/\/[a-z]+/g, ' ').match(/[a-zа-яё']{4,}/g) || []
    for (const w of words) {
      if (STOP.has(w)) continue
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  return Array.from(freq.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([w]) => w)
}

/**
 * Compress `logs` into a digest for the period ending at `now`.
 * `badgeCount` and `allTimeEntries` feed the Arcade XP only.
 */
export function compressLogs(
  logs: StoryLog[],
  scope: StoryScope,
  now: Date = new Date(),
  opts: { badgeCount?: number; allTimeEntries?: number } = {}
): StoryDigest {
  const days = SCOPE_DAYS[scope]
  const today = startOfDay(now)
  const from = new Date(today)
  from.setDate(from.getDate() - (days - 1))

  const inWindow = logs.filter(l => {
    const t = new Date(l.createdAt)
    return t >= from && t.getTime() <= now.getTime() + 60_000
  })

  const written = inWindow.filter(
    l => !GENERATED_EVENTS.has(l.event) && !CHECKIN_EVENTS.has(l.event) && (l.text || '').trim().length > 0
  )
  const checkinLogs = inWindow.filter(l => CHECKIN_EVENTS.has(l.event))

  const perDay = new Map<string, number>()
  for (const l of [...written, ...checkinLogs]) {
    const k = dayKey(new Date(l.createdAt))
    perDay.set(k, (perDay.get(k) || 0) + 1)
  }

  // Walk the window day by day: activity series, quiet run, streak.
  const series: number[] = []
  const labels: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(from)
    d.setDate(from.getDate() + i)
    const k = dayKey(d)
    labels.push(k)
    series.push(perDay.get(k) || 0)
  }
  let quietestRun = 0
  let run = 0
  for (const v of series) {
    run = v === 0 ? run + 1 : 0
    quietestRun = Math.max(quietestRun, run)
  }
  let streak = 0
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] > 0) streak++
    else if (i === series.length - 1) continue // today not yet logged doesn't break it
    else break
  }

  let peakDay: StoryDigest['peakDay'] = null
  series.forEach((v, i) => {
    if (v > 0 && (!peakDay || v > peakDay.entries)) peakDay = { date: labels[i], entries: v }
  })

  // Pattern change: needs at least 4 days of window to mean anything.
  let shift: StoryDigest['shift'] = 'insufficient'
  if (days >= 4) {
    const mid = Math.floor(series.length / 2)
    const a = series.slice(0, mid).reduce((s, v) => s + v, 0)
    const b = series.slice(mid).reduce((s, v) => s + v, 0)
    if (a + b >= 4) {
      shift = b >= a * 1.5 + 1 ? 'spike' : b <= a * 0.5 - 1 ? 'drop' : 'steady'
    }
  }

  const moods: string[] = []
  for (const l of checkinLogs) {
    const m = l.metadata?.emotionalState
    if (typeof m === 'string' && m.trim()) moods.push(m.trim().toUpperCase())
  }

  const cityCount = new Map<string, number>()
  const temps: number[] = []
  for (const l of inWindow) {
    const c = l.context?.city
    if (typeof c === 'string' && c) cityCount.set(c, (cityCount.get(c) || 0) + 1)
    const t = l.context?.temperature
    if (typeof t === 'number') temps.push(t)
  }
  const place = Array.from(cityCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  // Stored temperature is Fahrenheit (see toCelsius in #shared/utils)
  const toC = (f: number) => Math.round(((f - 32) * 5) / 9)
  const tempRangeC: [number, number] | null = temps.length
    ? [toC(Math.min(...temps)), toC(Math.max(...temps))]
    : null

  const words = written.reduce((s, l) => s + ((l.text || '').trim().split(/\s+/).filter(Boolean).length), 0)
  const activeDays = series.filter(v => v > 0).length

  // Arcade XP — provisional client-side derivation.
  const lifetime = opts.allTimeEntries ?? written.length
  const xp = lifetime * 10 + checkinLogs.length * 5 + activeDays * 20 + (opts.badgeCount || 0) * 50

  return {
    scope, days,
    entries: written.length,
    words,
    checkins: checkinLogs.length,
    activeDays,
    streak,
    moods,
    peakDay,
    quietestRun,
    shift,
    themes: topThemes(written.map(l => l.text || ''), 5),
    place,
    tempRangeC,
    arcade: arcadeRank(xp),
  }
}

function modeOf(xs: string[]): string | null {
  const f = new Map<string, number>()
  xs.forEach(x => f.set(x, (f.get(x) || 0) + 1))
  return Array.from(f.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

const SHIFT_LABEL: Record<StoryDigest['shift'], string> = {
  spike: 'SPIKE — MORE ACTIVE LATELY',
  drop: 'DROP — QUIETER LATELY',
  steady: 'STEADY',
  insufficient: 'TOO EARLY TO READ',
}

/** Terminal-grid rendering of the digest — what /story shows instantly. */
export function formatDigest(d: StoryDigest): string {
  const row = (k: string, v: string) => `${k.padEnd(14)}${v}`
  const lines: string[] = [
    `STORY // ${d.scope.toUpperCase()}${d.days > 1 ? ` · ${d.days} DAYS` : ''}`,
    '',
  ]
  if (d.entries === 0 && d.checkins === 0) {
    lines.push('Nothing recorded in this window yet.')
    lines.push('Write one line in the Log. The machine will take it from there.')
  } else {
    lines.push(row('ENTRIES', `${d.entries} · ${d.words} WORDS`))
    if (d.checkins) lines.push(row('CHECK-INS', String(d.checkins)))
    if (d.days > 1) {
      lines.push(row('ACTIVE', `${d.activeDays} OF ${d.days} DAYS · STREAK ${d.streak}`))
      lines.push(row('PATTERN', SHIFT_LABEL[d.shift]))
      if (d.peakDay) lines.push(row('HIGH', `${d.peakDay.date} · ${d.peakDay.entries} RECORDS`))
      if (d.quietestRun >= 2) lines.push(row('LOW', `${d.quietestRun} QUIET DAYS IN A ROW`))
    }
    const mood = modeOf(d.moods)
    if (mood) lines.push(row('MOOD', `${mood}${d.moods.length > 1 ? ` (${d.moods.length} CHECK-INS)` : ''}`))
    if (d.themes.length) lines.push(row('THEMES', d.themes.join(' · ').toUpperCase()))
    if (d.place) {
      const t = d.tempRangeC
      lines.push(row('CONTEXT', `${d.place.toUpperCase()}${t ? ` · ${t[0]}–${t[1]}°C` : ''}`))
    }
  }
  const a = d.arcade
  lines.push('', row('ARCADE', `LV ${a.level} ${a.title} · ${a.xp} XP${a.toNext !== null ? ` · ${a.toNext} TO NEXT` : ' · MAX'}`))
  return lines.join('\n')
}

/** Single-paragraph form for the AI prompt (token-light). */
export function digestForPrompt(d: StoryDigest): string {
  const bits = [
    `period=${d.scope}(${d.days}d)`,
    `entries=${d.entries}`,
    `words=${d.words}`,
    `checkins=${d.checkins}`,
    `activeDays=${d.activeDays}`,
    `streak=${d.streak}`,
    `pattern=${d.shift}`,
  ]
  if (d.peakDay) bits.push(`peak=${d.peakDay.date}x${d.peakDay.entries}`)
  if (d.quietestRun >= 2) bits.push(`quietRun=${d.quietestRun}d`)
  const mood = modeOf(d.moods)
  if (mood) bits.push(`mood=${mood}`)
  if (d.themes.length) bits.push(`themes=${d.themes.join(',')}`)
  if (d.place) bits.push(`place=${d.place}`)
  if (d.tempRangeC) bits.push(`tempC=${d.tempRangeC[0]}..${d.tempRangeC[1]}`)
  bits.push(`arcade=LV${d.arcade.level}${d.arcade.title}`)
  return bits.join('; ')
}
