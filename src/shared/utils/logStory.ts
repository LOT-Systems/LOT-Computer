/**
 * LOT SYSTEMS CORPORATION — Log Story compressor (pure, no stores, no DOM)
 *
 * LOT User data -> compressLogs() -> StoryDigest -> renderStory()
 *
 * Deterministic compression of the Journal (event === 'note') into a
 * day / week / month / year digest, including the context meta-data each
 * entry carries (weather, city, moon). Also detects spikes and pattern
 * shifts so the machine can follow up. Runs offline; the digest is what is
 * handed to the AI vendor layer, never the raw journal.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const SCOPE_DAYS: Record<StoryScope, number> = { day: 1, week: 7, month: 30, year: 365 }

export interface StoryLogInput {
  event: string
  text: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export interface StoryDigest {
  scope: StoryScope
  windowDays: number
  entries: number
  words: number
  activeDays: number
  streak: number
  peakDay: { date: string; words: number } | null
  topCity: string | null
  tempC: { min: number; max: number } | null
  topMoon: string | null
  moods: Array<{ mood: string; count: number }>
  shifts: StoryShift[]
}

export type StoryShift = {
  kind: 'spike' | 'silence' | 'surge' | 'drop'
  note: string
}

export function parseStoryScope(text: string): StoryScope {
  const m = text.toLowerCase().match(/(?:^|\s)\/story\s+(day|week|month|year)\b/)
  return (m?.[1] as StoryScope) || 'day'
}

const pad = (n: number) => String(n).padStart(2, '0')
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/**
 * Strip machine output and commands so the loop never feeds on itself:
 * everything from the first generated-block marker (story / prayer) onward,
 * plus any /command token, is not the operator's own writing.
 */
export function cleanJournalText(t: string | null | undefined): string {
  const raw = t || ''
  const cut = raw.search(/📖|🕯️?/u)
  const own = cut >= 0 ? raw.slice(0, cut) : raw
  return own.replace(/(^|\s)\/[a-z][a-z0-9-]*/gi, ' ').trim()
}

export const countWords = (t: string | null | undefined) =>
  cleanJournalText(t).split(/\s+/).filter(Boolean).length

const isJournalEntry = (l: StoryLogInput) => l.event === 'note' && countWords(l.text) > 0

function mode(values: string[]): string | null {
  const c = new Map<string, number>()
  values.forEach(v => c.set(v, (c.get(v) || 0) + 1))
  let best: string | null = null
  let n = 0
  c.forEach((count, v) => { if (count > n) { best = v; n = count } })
  return best
}

/** Consecutive journal days ending today (or yesterday, so an unfinished day keeps the streak). */
export function journalStreak(logs: StoryLogInput[], now: Date): number {
  const days = new Set(logs.filter(isJournalEntry).map(l => dayKey(new Date(l.createdAt))))
  let cursor = startOfDay(now)
  if (!days.has(dayKey(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (days.has(dayKey(cursor))) { streak++; cursor = addDays(cursor, -1) }
  return streak
}

/**
 * Pattern-change detection. Baseline = the 14 days before the window.
 *  spike   today's words >= mean + 2 sigma of baseline daily words (and >= 30 words)
 *  silence 3+ days without an entry after 3+ active days in the 14 before it began
 *  surge / drop  window entries/day vs baseline entries/day (>= 2x or <= 0.5x)
 */
export function detectShifts(logs: StoryLogInput[], now: Date, windowDays: number): StoryShift[] {
  const entries = logs.filter(isJournalEntry)
  const today = startOfDay(now)
  const baseStart = addDays(today, -(windowDays - 1) - 14)
  const winStart = addDays(today, -(windowDays - 1))
  const shifts: StoryShift[] = []

  const dailyWords = new Map<string, number>()
  entries.forEach(l => {
    const k = dayKey(new Date(l.createdAt))
    dailyWords.set(k, (dailyWords.get(k) || 0) + countWords(l.text))
  })

  const baseline: number[] = []
  let baseEntries = 0
  let baseActive = 0
  for (let d = baseStart; d < winStart; d = addDays(d, 1)) {
    const w = dailyWords.get(dayKey(d)) || 0
    baseline.push(w)
    if (w > 0) baseActive++
  }
  entries.forEach(l => {
    const t = new Date(l.createdAt)
    if (t >= baseStart && t < winStart) baseEntries++
  })

  const todayWords = dailyWords.get(dayKey(today)) || 0
  if (baseActive >= 3 && todayWords >= 30) {
    const mean = baseline.reduce((a, b) => a + b, 0) / baseline.length
    const sd = Math.sqrt(baseline.reduce((a, b) => a + (b - mean) ** 2, 0) / baseline.length)
    if (todayWords >= mean + 2 * sd) {
      shifts.push({ kind: 'spike', note: `Today ${todayWords} words vs ${Math.round(mean)} typical.` })
    }
  }

  // Silence is window-independent: 3+ quiet days after 3+ active days in the 14 before the quiet began.
  let quiet = 0
  for (let d = today; quiet < 60 && !dailyWords.get(dayKey(d)); d = addDays(d, -1)) quiet++
  if (quiet >= 3) {
    let priorActive = 0
    for (let i = 1; i <= 14; i++) if (dailyWords.get(dayKey(addDays(today, -(quiet + i - 1))))) priorActive++
    if (priorActive >= 3) shifts.push({ kind: 'silence', note: `${quiet} days without an entry after an active stretch.` })
  }

  if (windowDays >= 7 && baseEntries > 0) {
    let winEntries = 0
    entries.forEach(l => { if (new Date(l.createdAt) >= winStart) winEntries++ })
    const ratio = (winEntries / windowDays) / (baseEntries / 14)
    if (ratio >= 2) shifts.push({ kind: 'surge', note: `Entry rate ${ratio.toFixed(1)}x the prior fortnight.` })
    else if (ratio <= 0.5) shifts.push({ kind: 'drop', note: `Entry rate ${ratio.toFixed(1)}x the prior fortnight.` })
  }
  return shifts
}

export function compressLogs(logs: StoryLogInput[], scope: StoryScope, now: Date = new Date()): StoryDigest {
  const windowDays = SCOPE_DAYS[scope]
  const winStart = addDays(startOfDay(now), -(windowDays - 1))
  const inWindow = logs.filter(l => new Date(l.createdAt) >= winStart && new Date(l.createdAt) <= now)
  const entries = inWindow.filter(isJournalEntry)

  const perDay = new Map<string, number>()
  entries.forEach(l => {
    const k = dayKey(new Date(l.createdAt))
    perDay.set(k, (perDay.get(k) || 0) + countWords(l.text))
  })
  let peakDay: StoryDigest['peakDay'] = null
  perDay.forEach((words, date) => { if (!peakDay || words > peakDay.words) peakDay = { date, words } })

  const ctx = entries.map(l => l.context || {})
  const temps = ctx.map(c => c.temperature).filter((t): t is number => typeof t === 'number' && t > 150)
    .map(k => Math.round(k - 273.15))
  const moodCount = new Map<string, number>()
  inWindow.filter(l => l.event === 'emotional_checkin').forEach(l => {
    const m = String(l.metadata?.emotionalState || '').toLowerCase()
    if (m) moodCount.set(m, (moodCount.get(m) || 0) + 1)
  })

  return {
    scope,
    windowDays,
    entries: entries.length,
    words: entries.reduce((a, l) => a + countWords(l.text), 0),
    activeDays: perDay.size,
    streak: journalStreak(logs, now),
    peakDay,
    topCity: mode(ctx.map(c => c.city).filter(Boolean)),
    tempC: temps.length ? { min: Math.min(...temps), max: Math.max(...temps) } : null,
    topMoon: mode(ctx.map(c => c.astroMoonPhase).filter(Boolean)),
    moods: Array.from(moodCount, ([mood, count]) => ({ mood, count })).sort((a, b) => b.count - a.count).slice(0, 3),
    shifts: detectShifts(logs, now, windowDays),
  }
}

/** Fixed-width, terminal-grid rendering. This is also the offline fallback story. */
export function renderStory(d: StoryDigest): string {
  if (d.entries === 0) {
    return `STORY ${d.scope.toUpperCase()}\nNo journal entries in the last ${d.windowDays} day${d.windowDays > 1 ? 's' : ''}.\nWrite one line. The machine reads context, not prompts.`
  }
  const row = (k: string, v: string) => `${k.padEnd(10)}${v}`
  const lines = [
    `STORY ${d.scope.toUpperCase()}  ·  ${d.windowDays}D WINDOW`,
    row('ENTRIES', `${d.entries} across ${d.activeDays} day${d.activeDays > 1 ? 's' : ''} · ${d.words} words`),
    row('STREAK', `${d.streak} day${d.streak === 1 ? '' : 's'}`),
  ]
  if (d.peakDay && d.activeDays > 1) lines.push(row('PEAK', `${d.peakDay.date} · ${d.peakDay.words} words`))
  if (d.topCity) lines.push(row('PLACE', d.topCity))
  if (d.tempC) lines.push(row('AIR', d.tempC.min === d.tempC.max ? `${d.tempC.min}°C` : `${d.tempC.min}°C to ${d.tempC.max}°C`))
  if (d.topMoon) lines.push(row('MOON', d.topMoon))
  if (d.moods.length) lines.push(row('MOOD', d.moods.map(m => `${m.mood} x${m.count}`).join(' · ')))
  d.shifts.forEach(s => lines.push(row(s.kind.toUpperCase(), s.note)))
  return lines.join('\n')
}

/** Compact prompt payload for the AI layer (digest, not raw journal). */
export function digestForPrompt(d: StoryDigest): string {
  return renderStory(d).replace(/\s{2,}/g, ' ')
}
