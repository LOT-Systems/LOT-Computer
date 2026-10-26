/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log story compression + Arcade rank (pure, no I/O).
 *
 * Shared by the server (/api/story prompt + deterministic fallback) and
 * the client (/system rank line). Input is a plain list of log entries;
 * output is a "digest" — the compressed facts about a period — plus a
 * deterministic local story and an Arcade rank derived from the same
 * entries. No stores, no DB, no network: safe to unit-test in isolation.
 *
 * Loop position:  LOT User data -> [this digest] -> QIE -> AI vendor
 * (Together AI) -> LOT personalized data stored.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

const DAY_MS = 24 * 60 * 60 * 1000

export const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

export type StoryEntry = {
  text: string
  createdAt: Date | string | number
  context?: {
    city?: string | null
    weatherDescription?: string | null
    astroMoonPhase?: string | null
    [key: string]: any
  } | null
}

export type StoryDigest = {
  period: StoryPeriod
  entryCount: number
  activeDays: number
  windowDays: number
  words: number
  avgWords: number
  /** Longest run of consecutive active days ending on the newest active day. */
  streak: number
  peakDay: { date: string; entries: number; words: number } | null
  /** Quietest active day (lowest word count) — only when >= 3 active days. */
  lowDay: { date: string; entries: number; words: number } | null
  /** Pattern change: latest active day's words vs. the prior average. */
  spike: { date: string; ratio: number; direction: 'up' | 'down' } | null
  topCity: string | null
  topWeather: string | null
  moonPhase: string | null
  /** Most frequent meaningful words, lower-case. */
  themes: string[]
}

const STOPWORDS = new Set(
  (
    'the a an and or but if then so to of in on at for with from by as is are was were be been ' +
    'it its this that these those i me my we our you your he she they them his her their not no ' +
    'do did does done have has had will would can could just very really also than too about into ' +
    'out up down over under again more most some any all one two what when where who how why'
  ).split(' ')
)

const toMs = (v: Date | string | number): number =>
  v instanceof Date ? v.getTime() : new Date(v).getTime()

const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

const countWords = (t: string): number => (t.trim() ? t.trim().split(/\s+/).length : 0)

/** Strip system-generated lines (📖/🕯️ blocks) so stories do not eat themselves. */
export function stripGenerated(text: string): string {
  return (text || '')
    .split('\n\n')
    .filter(p => !p.startsWith('📖') && !p.startsWith('🕯'))
    .join('\n\n')
    .replace(/(^|\s)\/[a-z]+(?=\s|$)/gi, ' ')
    .trim()
}

const mode = (values: (string | null | undefined)[]): string | null => {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) || 0) + 1)
  }
  let best: string | null = null
  let bestN = 0
  counts.forEach((n, k) => {
    if (n > bestN) {
      best = k
      bestN = n
    }
  })
  return best
}

export function compressEntries(
  entries: StoryEntry[],
  period: StoryPeriod = 'week',
  now: Date | number = new Date()
): StoryDigest {
  const nowMs = typeof now === 'number' ? now : now.getTime()
  const windowDays = PERIOD_DAYS[period]
  const since = nowMs - windowDays * DAY_MS

  const inWindow = entries
    .map(e => ({ e, ms: toMs(e.createdAt), text: stripGenerated(e.text) }))
    .filter(x => Number.isFinite(x.ms) && x.ms >= since && x.ms <= nowMs && x.text)
    .sort((a, b) => a.ms - b.ms)

  const byDay = new Map<string, { entries: number; words: number }>()
  const freq = new Map<string, number>()
  let words = 0
  for (const { ms, text } of inWindow) {
    const w = countWords(text)
    words += w
    const k = dayKey(ms)
    const d = byDay.get(k) || { entries: 0, words: 0 }
    d.entries += 1
    d.words += w
    byDay.set(k, d)
    for (const token of text.toLowerCase().match(/[a-zÀ-ɏЀ-ӿ']{4,}/g) || []) {
      if (!STOPWORDS.has(token)) freq.set(token, (freq.get(token) || 0) + 1)
    }
  }

  const days = Array.from(byDay.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  // Streak: consecutive calendar days ending at the newest active day.
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (i === days.length - 1) {
      streak = 1
      continue
    }
    const gap = (Date.parse(days[i + 1].date) - Date.parse(days[i].date)) / DAY_MS
    if (gap === 1) streak += 1
    else break
  }

  let peakDay: StoryDigest['peakDay'] = null
  let lowDay: StoryDigest['lowDay'] = null
  for (const d of days) {
    if (!peakDay || d.words > peakDay.words) peakDay = d
    if (!lowDay || d.words < lowDay.words) lowDay = d
  }
  if (days.length < 3) lowDay = null

  // Spike: latest active day vs. mean of earlier active days (needs >= 3 prior).
  let spike: StoryDigest['spike'] = null
  if (days.length >= 4) {
    const latest = days[days.length - 1]
    const prior = days.slice(0, -1)
    const mean = prior.reduce((s, d) => s + d.words, 0) / prior.length
    if (mean > 0) {
      const ratio = latest.words / mean
      if (ratio >= 2) spike = { date: latest.date, ratio: Math.round(ratio * 10) / 10, direction: 'up' }
      else if (ratio <= 0.4) spike = { date: latest.date, ratio: Math.round(ratio * 10) / 10, direction: 'down' }
    }
  }

  const themes = Array.from(freq.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, 5)
    .map(([w]) => w)

  const ctx = inWindow.map(x => x.e.context)

  return {
    period,
    entryCount: inWindow.length,
    activeDays: days.length,
    windowDays,
    words,
    avgWords: inWindow.length ? Math.round(words / inWindow.length) : 0,
    streak,
    peakDay,
    lowDay,
    spike,
    topCity: mode(ctx.map(c => c?.city)),
    topWeather: mode(ctx.map(c => c?.weatherDescription)),
    moonPhase: ctx.length ? ctx[ctx.length - 1]?.astroMoonPhase || null : null,
    themes,
  }
}

/** One-line-per-fact block injected into the AI prompt (compressed context). */
export function digestToPromptBlock(d: StoryDigest): string {
  const lines = [
    `PERIOD: ${d.period.toUpperCase()} (${d.windowDays}d)`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays} active days, ${d.words} words (avg ${d.avgWords}/entry)`,
    `STREAK: ${d.streak} day${d.streak === 1 ? '' : 's'}`,
  ]
  if (d.peakDay) lines.push(`HIGH: ${d.peakDay.date} (${d.peakDay.entries} entries, ${d.peakDay.words} words)`)
  if (d.lowDay && d.lowDay.date !== d.peakDay?.date)
    lines.push(`LOW: ${d.lowDay.date} (${d.lowDay.entries} entries, ${d.lowDay.words} words)`)
  if (d.spike)
    lines.push(`PATTERN CHANGE: latest day ${d.spike.direction === 'up' ? 'surged' : 'fell quiet'} (${d.spike.ratio}x typical)`)
  if (d.topCity) lines.push(`PLACE: ${d.topCity}`)
  if (d.topWeather) lines.push(`SKY: ${d.topWeather}`)
  if (d.moonPhase) lines.push(`MOON: ${d.moonPhase}`)
  if (d.themes.length) lines.push(`RECURRING WORDS: ${d.themes.join(', ')}`)
  return lines.join('\n')
}

/** Deterministic story used when the AI vendor is unavailable. */
export function composeLocalStory(d: StoryDigest): string {
  if (d.entryCount === 0) {
    return `No entries in the last ${d.windowDays === 1 ? 'day' : d.windowDays + ' days'}. The log is open whenever you are.`
  }
  const span = d.period === 'day' ? 'today' : `this ${d.period}`
  const parts: string[] = []
  parts.push(
    `You wrote ${d.entryCount} ${d.entryCount === 1 ? 'entry' : 'entries'} ${span}` +
      (d.activeDays > 1 ? ` across ${d.activeDays} days` : '') +
      (d.topCity ? `, mostly in ${d.topCity}` : '') +
      '.'
  )
  if (d.streak >= 2) parts.push(`${d.streak} days in a row — the loop is holding.`)
  if (d.peakDay && d.activeDays >= 2)
    parts.push(`${d.peakDay.date} was the loudest day (${d.peakDay.words} words).`)
  if (d.spike)
    parts.push(
      d.spike.direction === 'up'
        ? 'The latest day ran well above your usual — something is moving.'
        : 'The latest day was much quieter than usual — worth a gentle look.'
    )
  if (d.themes.length) parts.push(`Words that kept returning: ${d.themes.slice(0, 3).join(', ')}.`)
  parts.push('The next entry will sharpen this.')
  return parts.join(' ')
}

// ---------------------------------------------------------------------------
// ARCADE — gamified evolution of the operator. Derived, never stored: rank is
// a pure function of the log, so it cannot drift or be corrupted.
// ---------------------------------------------------------------------------

export type ArcadeRank = {
  level: number
  title: string
  xp: number
  /** XP needed for the next level, or null at max. */
  nextAt: number | null
  /** 0-1 progress within the current level. */
  progress: number
}

/** [min XP, title] — ascending. Self-care register, not combat. */
const ARCADE_LEVELS: [number, string][] = [
  [0, 'SEED'],
  [50, 'SPROUT'],
  [150, 'ROOTED'],
  [400, 'STEADY'],
  [900, 'ATTUNED'],
  [1800, 'LUCID'],
  [3500, 'KEEPER'],
  [7000, 'ORACLE'],
]

/** XP: 10 per entry, 1 per 20 words (cap 5/entry), 25 per active day, 5 per streak day. Trailing 365d. */
export function arcadeXp(entries: StoryEntry[], now: Date | number = new Date()): number {
  const nowMs = typeof now === 'number' ? now : now.getTime()
  const d = compressEntries(entries, 'year', now)
  let wordXp = 0
  for (const e of entries) {
    const ms = toMs(e.createdAt)
    if (!(ms >= nowMs - PERIOD_DAYS.year * DAY_MS && ms <= nowMs)) continue
    wordXp += Math.min(5, Math.floor(countWords(stripGenerated(e.text)) / 20))
  }
  return d.entryCount * 10 + wordXp + d.activeDays * 25 + d.streak * 5
}

export function arcadeRank(xp: number): ArcadeRank {
  let idx = 0
  for (let i = 0; i < ARCADE_LEVELS.length; i++) if (xp >= ARCADE_LEVELS[i][0]) idx = i
  const cur = ARCADE_LEVELS[idx][0]
  const next = idx + 1 < ARCADE_LEVELS.length ? ARCADE_LEVELS[idx + 1][0] : null
  return {
    level: idx + 1,
    title: ARCADE_LEVELS[idx][1],
    xp,
    nextAt: next,
    progress: next === null ? 1 : Math.min(1, (xp - cur) / (next - cur)),
  }
}

/** Parse the period argument of `/story [day|week|month|year]`; default week. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story\s+(day|today|week|month|year)\b/i.exec(text || '')
  if (!m) return 'week'
  const p = m[2].toLowerCase()
  return (p === 'today' ? 'day' : p) as StoryPeriod
}
