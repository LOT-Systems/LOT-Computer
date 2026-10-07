/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG STORY COMPRESSOR
 *
 * Pure, dependency-free. Turns a window of raw Log records into a compact
 * StoryDigest (day / week / month / year), then into either:
 *   - a deterministic text compression (offline fallback, no AI needed), or
 *   - a prompt block for the AI vendor (Together AI) to narrate.
 *
 * Shared by client (/story fallback) and server (/api/story prompt), so the
 * numbers the operator sees and the numbers the AI sees are the same numbers.
 *
 * Privacy: the digest carries aggregates and short keyword stems only — never
 * full entry text. See docs/log/LOT-LOG-COMMANDS.md §6.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: readonly StoryPeriod[] = ['day', 'week', 'month', 'year']

export const STORY_WINDOW_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Minimal Log shape — satisfied by both client Log and Sequelize rows. */
export interface StoryLogLike {
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, unknown> | null
  context?: {
    temperature?: number | null
    city?: string | null
  } | null
}

export interface StorySpike {
  /** YYYY-MM-DD (UTC day key) */
  day: string
  count: number
  kind: 'SPIKE' | 'DROP'
}

export interface StoryDigest {
  period: StoryPeriod
  windowDays: number
  /** Entries (journal notes) in the window */
  entries: number
  /** Entries in the immediately preceding window of equal length */
  priorEntries: number
  /** Percent change vs prior window; null when prior is 0 */
  deltaPct: number | null
  activeDays: number
  longestStreak: number
  currentStreak: number
  /** Dominant time-of-day band of entries */
  peakBand: 'NIGHT' | 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'EVENING' | null
  moods: Array<{ state: string; count: number }>
  moodHigh: string | null
  moodLow: string | null
  keywords: string[]
  cities: string[]
  avgTempC: number | null
  spikes: StorySpike[]
  /** Hours since the last entry in the window; null when none */
  silentHours: number | null
  totalWords: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000

/** Journal-bearing events. Server stores Log-tab entries as 'note'. */
const ENTRY_EVENTS = new Set(['note'])

const POSITIVE_MOODS = [
  'energized', 'calm', 'hopeful', 'grateful', 'fulfilled',
  'content', 'peaceful', 'excited', 'grounded',
]
const CHALLENGING_MOODS = ['tired', 'anxious', 'exhausted', 'overwhelmed']

const STOPWORDS = new Set((
  'the a an and or but if then so to of in on at for with from by as is am are was were be been ' +
  'it its this that these those i me my we our you your he she they them his her their not no yes ' +
  'do did does done have has had will would can could should just very really also too more most ' +
  'some any all about into out up down over under than when what which who how why there here ' +
  'today day got get like feel felt going went one two still much many'
).split(' '))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isStoryPeriod(v: unknown): v is StoryPeriod {
  return typeof v === 'string' && (STORY_PERIODS as readonly string[]).includes(v)
}

/** Scans free text for `/story [day|week|month|year]` style period hints. */
export function detectStoryPeriod(text: string): StoryPeriod | null {
  const m = /(^|\s)\/(day|week|month|year)(\s|$|[^a-z0-9_])/i.exec(text || '')
  return m ? (m[2].toLowerCase() as StoryPeriod) : null
}

function toMs(d: Date | string): number {
  const t = d instanceof Date ? d.getTime() : new Date(d).getTime()
  return Number.isFinite(t) ? t : NaN
}

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

function bandOf(hour: number): NonNullable<StoryDigest['peakBand']> {
  if (hour < 5) return 'NIGHT'
  if (hour < 11) return 'MORNING'
  if (hour < 14) return 'MIDDAY'
  if (hour < 18) return 'AFTERNOON'
  if (hour < 22) return 'EVENING'
  return 'NIGHT'
}

function isEntry(l: StoryLogLike): boolean {
  if (!ENTRY_EVENTS.has(l.event)) return false
  const t = (l.text || '').trim()
  // Skip empties and engine output echoed into the log (📖 story, 🕯️ prayer)
  return t.length > 0 && !t.startsWith('📖') && !t.startsWith('🕯')
}

/** Strips slash commands / emoji echoes so keywords reflect the human's words. */
function cleanForKeywords(text: string): string {
  return text
    .replace(/(^|\s)\/[a-z-]+/gi, ' ')
    .replace(/📖[\s\S]*$/u, ' ')
    .replace(/🕯️?[\s\S]*$/u, ' ')
    .toLowerCase()
}

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

export function buildStoryDigest(
  logs: StoryLogLike[],
  period: StoryPeriod = 'day',
  now: number = Date.now()
): StoryDigest {
  const windowDays = STORY_WINDOW_DAYS[period]
  const start = now - windowDays * DAY_MS
  const priorStart = start - windowDays * DAY_MS

  const inWindow: StoryLogLike[] = []
  let priorEntries = 0
  for (const l of logs) {
    const t = toMs(l.createdAt)
    if (Number.isNaN(t) || t > now) continue
    if (t >= start) inWindow.push(l)
    else if (t >= priorStart && isEntry(l)) priorEntries++
  }

  const entries = inWindow.filter(isEntry)
  const entryTimes = entries.map(l => toMs(l.createdAt))

  // Active days + streaks (UTC day keys — deterministic across server/client)
  const perDay = new Map<string, number>()
  for (const t of entryTimes) {
    const k = dayKey(t)
    perDay.set(k, (perDay.get(k) || 0) + 1)
  }
  const activeKeys = Array.from(perDay.keys()).sort()
  let longest = 0
  let run = 0
  let prev = NaN
  for (const k of activeKeys) {
    const ms = Date.parse(k)
    run = ms - prev === DAY_MS ? run + 1 : 1
    if (run > longest) longest = run
    prev = ms
  }
  // Current streak: consecutive days ending today or yesterday
  let current = 0
  let cursor = Date.parse(dayKey(now))
  if (!perDay.has(dayKey(cursor))) cursor -= DAY_MS
  while (perDay.has(dayKey(cursor))) {
    current++
    cursor -= DAY_MS
  }

  // Peak band
  const bandCounts = new Map<NonNullable<StoryDigest['peakBand']>, number>()
  for (const t of entryTimes) {
    const b = bandOf(new Date(t).getUTCHours())
    bandCounts.set(b, (bandCounts.get(b) || 0) + 1)
  }
  let peakBand: StoryDigest['peakBand'] = null
  let bandMax = 0
  bandCounts.forEach((c, b) => {
    if (c > bandMax) { bandMax = c; peakBand = b }
  })

  // Moods
  const moodMap = new Map<string, number>()
  for (const l of inWindow) {
    if (l.event !== 'emotional_checkin') continue
    const s = String(l.metadata?.emotionalState || '').toLowerCase().trim()
    if (s) moodMap.set(s, (moodMap.get(s) || 0) + 1)
  }
  const moods = Array.from(moodMap, ([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state))
  const moodHigh = moods.find(m => POSITIVE_MOODS.includes(m.state))?.state ?? null
  const moodLow = moods.find(m => CHALLENGING_MOODS.includes(m.state))?.state ?? null

  // Keywords — frequency over cleaned note text, length >= 4, stopwords out
  const freq = new Map<string, number>()
  let totalWords = 0
  for (const l of entries) {
    const words = cleanForKeywords(l.text || '').match(/[\p{L}][\p{L}'-]{3,}/gu) || []
    totalWords += (l.text || '').trim().split(/\s+/).length
    for (const w of words) {
      if (STOPWORDS.has(w)) continue
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  const keywords = Array.from(freq, ([w, c]) => ({ w, c }))
    .filter(x => x.c >= 2 || freq.size <= 8)
    .sort((a, b) => b.c - a.c || a.w.localeCompare(b.w))
    .slice(0, 5)
    .map(x => x.w)

  // Context
  const cityMap = new Map<string, number>()
  let tempSum = 0
  let tempN = 0
  for (const l of entries) {
    const c = l.context?.city
    if (c) cityMap.set(c, (cityMap.get(c) || 0) + 1)
    const tF = l.context?.temperature
    if (typeof tF === 'number' && Number.isFinite(tF)) {
      tempSum += tF
      tempN++
    }
  }
  const cities = Array.from(cityMap, ([c, n]) => ({ c, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map(x => x.c)
  // Context temperature is stored in Kelvin (see toCelsius in #shared/utils)
  const avgTempC = tempN ? Math.round(tempSum / tempN - 273.15) : null

  // Spikes: a day well above (or a gap well below) the window's daily mean.
  // Only meaningful for windows >= 7 days.
  const spikes: StorySpike[] = []
  if (windowDays >= 7 && activeKeys.length >= 3) {
    const mean = entries.length / windowDays
    perDay.forEach((count, day) => {
      if (count >= 3 && count >= mean * 3) spikes.push({ day, count, kind: 'SPIKE' })
    })
    spikes.sort((a, b) => b.count - a.count)
    spikes.length = Math.min(spikes.length, 3)
    // Drop: longest recent silence (>= 3 days) inside window
    let gap = 0
    let gapEnd = ''
    for (let d = start; d <= now; d += DAY_MS) {
      const k = dayKey(d)
      if (!perDay.has(k)) { gap++; if (gap >= 3) gapEnd = k } else gap = 0
    }
    if (gap >= 3) spikes.push({ day: gapEnd, count: 0, kind: 'DROP' })
  }

  const lastMs = entryTimes.length ? Math.max(...entryTimes) : NaN
  const silentHours = Number.isNaN(lastMs) ? null : Math.max(0, Math.round((now - lastMs) / 3600000))

  const deltaPct =
    priorEntries > 0 ? Math.round(((entries.length - priorEntries) / priorEntries) * 100) : null

  return {
    period,
    windowDays,
    entries: entries.length,
    priorEntries,
    deltaPct,
    activeDays: perDay.size,
    longestStreak: longest,
    currentStreak: current,
    peakBand,
    moods,
    moodHigh,
    moodLow,
    keywords,
    cities,
    avgTempC,
    spikes,
    silentHours,
    totalWords,
  }
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

/**
 * Deterministic compressed story. Terminal-grid lines; usable with no AI.
 * Returns an honest "no data" record when the window is empty.
 */
export function renderDigestLines(d: StoryDigest): string[] {
  const label = d.period.toUpperCase()
  if (d.entries === 0 && d.moods.length === 0) {
    return [
      `STORY           ${label} — NO SIGNAL`,
      'ENTRIES         0',
      'NEXT            WRITE ONE LINE. THE RECORD STARTS THERE.',
    ]
  }
  const lines: string[] = [
    `STORY           ${label} · ${d.windowDays}D WINDOW`,
    `ENTRIES         ${d.entries} · ${d.activeDays} ACTIVE DAY${d.activeDays === 1 ? '' : 'S'} · ${d.totalWords} WORDS`,
  ]
  if (d.deltaPct !== null) {
    const arrow = d.deltaPct > 0 ? '+' : ''
    lines.push(`VS PRIOR        ${arrow}${d.deltaPct}% (${d.priorEntries} → ${d.entries})`)
  } else if (d.priorEntries === 0) {
    lines.push('VS PRIOR        NO BASELINE YET')
  }
  if (d.windowDays > 1) {
    lines.push(`STREAK          ${d.currentStreak} CURRENT · ${d.longestStreak} LONGEST`)
  }
  if (d.peakBand) lines.push(`PEAK HOURS      ${d.peakBand} (UTC)`)
  if (d.moods.length) {
    lines.push(`MOOD            ${d.moods.slice(0, 3).map(m => `${m.state.toUpperCase()} ×${m.count}`).join(' · ')}`)
    if (d.moodHigh) lines.push(`HIGH            ${d.moodHigh.toUpperCase()}`)
    if (d.moodLow) lines.push(`LOW             ${d.moodLow.toUpperCase()}`)
  }
  if (d.keywords.length) lines.push(`THEMES          ${d.keywords.join(' · ').toUpperCase()}`)
  if (d.cities.length) {
    const t = d.avgTempC !== null ? ` · AVG ${d.avgTempC}°C` : ''
    lines.push(`PLACE           ${d.cities.join(' · ').toUpperCase()}${t}`)
  }
  for (const s of d.spikes) {
    lines.push(
      s.kind === 'SPIKE'
        ? `SPIKE           ${s.day} · ${s.count} ENTRIES`
        : `DROP            SILENT 3D+ ENDING ${s.day}`
    )
  }
  if (d.silentHours !== null && d.silentHours >= 24) {
    lines.push(`LAST ENTRY      ${d.silentHours}H AGO`)
  }
  return lines
}

/**
 * Prompt block for the AI vendor. Aggregates only — no raw entry text.
 * The vendor executes; it does not remember (see README: Your Story, Your Data).
 */
export function digestToPromptBlock(d: StoryDigest): string {
  return renderDigestLines(d).join('\n')
}
