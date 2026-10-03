/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION — deterministic digest of a user's logs.
 *
 * Stage "COMPRESS" of the loop  LOG → OBSERVE → COMPRESS → ASK.
 * Turns N raw log rows (with context metadata) into a small, dense,
 * model-ready digest: volume, mood arc, environment, rhythm, peaks and
 * lows. The AI vendor never sees raw history, only this digest, and if
 * the vendor fails the digest alone renders a local story.
 *
 * Pure: no DB, no network, no clock (callers pass `now`).
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: readonly StoryScope[] = ['day', 'week', 'month', 'year']

export const STORY_SCOPE_DAYS: Record<StoryScope, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

export function parseStoryScope(input: unknown): StoryScope {
  const v = String(input || '').trim().toLowerCase()
  const alias: Record<string, StoryScope> = {
    d: 'day', today: 'day', day: 'day',
    w: 'week', week: 'week',
    m: 'month', month: 'month',
    y: 'year', year: 'year',
  }
  return alias[v] || 'week'
}

export type StoryLogInput = {
  event?: string | null
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: {
    temperature?: number | null // Kelvin
    humidity?: number | null
    weatherDescription?: string | null
    city?: string | null
    astroMoonPhase?: string | null
  } | null
}

export type StoryDigest = {
  scope: StoryScope
  windowDays: number
  totalLogs: number
  entryCount: number
  activeDays: number
  streakDays: number
  moods: Array<{ state: string; count: number }>
  moodFirst: string | null
  moodLast: string | null
  avgTempC: number | null
  avgHumidity: number | null
  weather: string[]
  cities: string[]
  moonPhases: string[]
  rhythm: { morning: number; afternoon: number; evening: number; night: number }
  peakDay: { date: string; count: number } | null
  lowDay: { date: string; count: number } | null
  spike: boolean
  quietGapDays: number
  samples: string[]
}

const ENTRY_EVENTS = new Set(['note', 'log_entry', 'journal'])
const MAX_SAMPLES = 5
const SAMPLE_CHARS = 160

const top = (counts: Map<string, number>, n: number): string[] =>
  [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)

export function buildStoryDigest(
  logs: StoryLogInput[],
  scope: StoryScope,
  now: Date = new Date(),
  streakDays = 0
): StoryDigest {
  const windowDays = STORY_SCOPE_DAYS[scope]
  const since = now.getTime() - windowDays * 86_400_000
  const inWindow = logs
    .map(l => ({ l, t: new Date(l.createdAt).getTime() }))
    .filter(x => !isNaN(x.t) && x.t >= since && x.t <= now.getTime())
    .sort((a, b) => a.t - b.t)

  const perDay = new Map<string, number>()
  const moodCounts = new Map<string, number>()
  const moodSeq: string[] = []
  const weather = new Map<string, number>()
  const cities = new Map<string, number>()
  const moons = new Map<string, number>()
  const rhythm = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  const temps: number[] = []
  const hums: number[] = []
  const samples: string[] = []
  let entryCount = 0

  for (const { l, t } of inWindow) {
    const d = new Date(t)
    const day = d.toISOString().slice(0, 10)
    perDay.set(day, (perDay.get(day) || 0) + 1)

    const h = d.getUTCHours()
    if (h >= 5 && h < 12) rhythm.morning++
    else if (h >= 12 && h < 17) rhythm.afternoon++
    else if (h >= 17 && h < 22) rhythm.evening++
    else rhythm.night++

    const c = l.context
    if (c) {
      if (typeof c.temperature === 'number') temps.push(c.temperature - 273.15)
      if (typeof c.humidity === 'number') hums.push(c.humidity)
      if (c.weatherDescription) weather.set(c.weatherDescription, (weather.get(c.weatherDescription) || 0) + 1)
      if (c.city) cities.set(c.city, (cities.get(c.city) || 0) + 1)
      if (c.astroMoonPhase) moons.set(c.astroMoonPhase, (moons.get(c.astroMoonPhase) || 0) + 1)
    }

    if (l.event === 'emotional_checkin') {
      const m = String(l.metadata?.emotionalState || '').toLowerCase()
      if (m) {
        moodCounts.set(m, (moodCounts.get(m) || 0) + 1)
        moodSeq.push(m)
      }
    }

    if (l.event && ENTRY_EVENTS.has(l.event)) {
      const text = (l.text || '').replace(/\s+/g, ' ').trim()
      // Slash-command echoes and generated blocks are not the user's voice.
      if (text && !text.startsWith('/') && !text.includes('📖') && !text.includes('🕯')) {
        entryCount++
        samples.push(text.slice(0, SAMPLE_CHARS))
      }
    }
  }

  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  const avgT = avg(temps)
  const avgH = avg(hums)

  // Peak / low across ACTIVE days; spike = peak ≥ 4 rows and ≥ 2× the other days' mean.
  const dayEntries = [...perDay.entries()]
  let peakDay: StoryDigest['peakDay'] = null
  let lowDay: StoryDigest['lowDay'] = null
  for (const [date, count] of dayEntries) {
    if (!peakDay || count > peakDay.count) peakDay = { date, count }
    if (!lowDay || count < lowDay.count) lowDay = { date, count }
  }
  // Baseline excludes the peak itself, otherwise a 2-day window can never spike.
  const others = peakDay ? inWindow.length - peakDay.count : 0
  const baseline = dayEntries.length > 1 ? others / (dayEntries.length - 1) : 0
  const spike = !!peakDay && dayEntries.length > 1 && peakDay.count >= 4 && peakDay.count >= baseline * 2

  // Longest run of silent days inside the window.
  let quietGap = 0
  let run = 0
  for (let i = 0; i < windowDays; i++) {
    const key = new Date(now.getTime() - i * 86_400_000).toISOString().slice(0, 10)
    if (perDay.has(key)) run = 0
    else quietGap = Math.max(quietGap, ++run)
  }

  return {
    scope,
    windowDays,
    totalLogs: inWindow.length,
    entryCount,
    activeDays: perDay.size,
    streakDays,
    moods: [...moodCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count })),
    moodFirst: moodSeq[0] || null,
    moodLast: moodSeq[moodSeq.length - 1] || null,
    avgTempC: avgT === null ? null : Math.round(avgT),
    avgHumidity: avgH === null ? null : Math.round(avgH),
    weather: top(weather, 3),
    cities: top(cities, 3),
    moonPhases: top(moons, 2),
    rhythm,
    peakDay,
    lowDay: dayEntries.length > 1 ? lowDay : null,
    spike,
    quietGapDays: quietGap,
    // Newest voice last, capped: most recent samples carry the current state.
    samples: samples.slice(-MAX_SAMPLES),
  }
}

/** Compact, labelled text block — the only payload sent to the AI vendor. */
export function renderDigestBlock(d: StoryDigest): string {
  const r = d.rhythm
  const dominant = (Object.entries(r) as Array<[string, number]>).sort((a, b) => b[1] - a[1])[0]
  const lines = [
    `SCOPE: ${d.scope.toUpperCase()} (${d.windowDays}d)`,
    `VOLUME: ${d.totalLogs} records · ${d.entryCount} journal entries · ${d.activeDays} active days · streak ${d.streakDays}d`,
    `MOOD ARC: ${d.moods.length ? d.moods.map(m => `${m.state}×${m.count}`).join(', ') : 'NO DATA'}${d.moodFirst && d.moodLast && d.moodFirst !== d.moodLast ? ` (${d.moodFirst} → ${d.moodLast})` : ''}`,
    `ENVIRONMENT: ${[
      d.avgTempC !== null ? `${d.avgTempC}°C avg` : '',
      d.avgHumidity !== null ? `${d.avgHumidity}% humidity` : '',
      d.weather.join('/'),
      d.cities.join('/'),
      d.moonPhases.join('/'),
    ].filter(Boolean).join(' · ') || 'NO DATA'}`,
    `RHYTHM: ${dominant && dominant[1] > 0 ? `mostly ${dominant[0]}` : 'none'} (m${r.morning}/a${r.afternoon}/e${r.evening}/n${r.night})`,
    `PEAK: ${d.peakDay ? `${d.peakDay.date} (${d.peakDay.count} records)${d.spike ? ' — SPIKE' : ''}` : 'none'}`,
    `LOW: ${d.lowDay ? `${d.lowDay.date} (${d.lowDay.count} records)` : 'none'}${d.quietGapDays > 0 ? ` · longest silence ${d.quietGapDays}d` : ''}`,
    `RECENT VOICE:`,
    ...(d.samples.length ? d.samples.map(s => `- ${s}`) : ['- (none)']),
  ]
  return lines.join('\n')
}

/** Offline fallback: a short plain story built from the digest alone. */
export function composeDigestStory(d: StoryDigest, rankLine?: string): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[d.scope]
  if (d.totalLogs === 0) {
    return `Nothing was recorded ${span}. The machine waits — one entry is enough to begin the story.`
  }
  const parts: string[] = []
  parts.push(`${span[0].toUpperCase()}${span.slice(1)} you left ${d.totalLogs} record${d.totalLogs === 1 ? '' : 's'} across ${d.activeDays} day${d.activeDays === 1 ? '' : 's'}.`)
  if (d.moods.length) {
    const arc = d.moodFirst && d.moodLast && d.moodFirst !== d.moodLast
      ? `, moving from ${d.moodFirst} to ${d.moodLast}`
      : ''
    parts.push(`The mood read mostly ${d.moods[0].state}${arc}.`)
  }
  const env = [d.avgTempC !== null ? `${d.avgTempC}°C` : '', d.weather[0] || '', d.cities[0] || ''].filter(Boolean).join(', ')
  if (env) parts.push(`The air around you: ${env}.`)
  if (d.spike && d.peakDay) parts.push(`${d.peakDay.date} stood out — ${d.peakDay.count} records in one day.`)
  if (d.quietGapDays >= 2) parts.push(`There was a ${d.quietGapDays}-day silence. Silence is data too.`)
  if (rankLine) parts.push(rankLine)
  return parts.join(' ')
}
