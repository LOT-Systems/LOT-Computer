/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Story Compression — the deterministic first stage of /story.
 *
 *   LOT User data → [compressLogs] → Digest → (LOT Quantum Intent Engine
 *   prompt) → AI vendor (Together AI) → LOT personalized data stored
 *
 * The Digest is a small, fixed-shape summary of a day / week / month / year
 * of Log entries plus their context metadata. The AI vendor only ever sees
 * the Digest (never the raw log table), and `composeLocalStory` renders the
 * same Digest without any network, so /story always answers — online or not.
 *
 * Pure module: no stores, no DOM, no network, no clock (callers pass `now`).
 */

export type StoryWindow = 'day' | 'week' | 'month' | 'year'

export const DEFAULT_STORY_WINDOW: StoryWindow = 'week'

const WINDOW_DAYS: Record<StoryWindow, number> = { day: 1, week: 7, month: 30, year: 365 }
const WINDOW_LABEL: Record<StoryWindow, string> = {
  day: 'DAY · 24H',
  week: 'WEEK · 7D',
  month: 'MONTH · 30D',
  year: 'YEAR · 365D',
}
const DAY_MS = 86_400_000

/** Minimal Log shape this module needs (structurally compatible with Log). */
export interface StoryLog {
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

export interface ArcadeState {
  xpTotal: number
  xpWindow: number
  level: number
  rank: string
  xpToNext: number
  streakDays: number
}

export interface StorySignal {
  kind: 'volume-spike' | 'mood-shift' | 'silence'
  detail: string
}

export interface StoryDigest {
  window: StoryWindow
  label: string
  from: string
  to: string
  counts: { notes: number; checkIns: number; selfCare: number; answers: number; total: number }
  activeDays: number
  buckets: Array<{ key: string; count: number; mood: number | null }>
  peakBucket: { key: string; count: number } | null
  mood: {
    samples: number
    avg: number | null
    top: Array<[string, number]>
    best: { key: string; avg: number } | null
    worst: { key: string; avg: number } | null
  }
  signals: StorySignal[]
  context: { city: string | null; moon: string | null; tempC: number | null; humidity: number | null }
  themes: string[]
  excerpts: string[]
  arcade: ArcadeState
}

// ---------------------------------------------------------------------------
// Window parsing
// ---------------------------------------------------------------------------

const WINDOW_ALIASES: Record<string, StoryWindow> = {
  day: 'day', today: 'day', daily: 'day', '24h': 'day', '1d': 'day',
  week: 'week', weekly: 'week', '7d': 'week',
  month: 'month', monthly: 'month', '30d': 'month',
  year: 'year', yearly: 'year', annual: 'year', '365d': 'year',
}

/**
 * Reads the window argument out of Log text: "/story week" → 'week'.
 * Bare "/story" (or an unknown argument) → DEFAULT_STORY_WINDOW.
 */
export function parseStoryWindow(text: string): StoryWindow {
  const m = /(^|\s)\/story(?:\s+([a-z0-9]+))?/i.exec(text || '')
  const arg = m?.[2]?.toLowerCase()
  return (arg && WINDOW_ALIASES[arg]) || DEFAULT_STORY_WINDOW
}

/** Text the user wrote alongside the command (command + 📖 stripped). */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(\s+(day|today|daily|24h|1d|week|weekly|7d|month|monthly|30d|year|yearly|annual|365d))?/gi, ' ')
    .replace(/📖/g, '')
    .trim()
}

// ---------------------------------------------------------------------------
// Signal extraction
// ---------------------------------------------------------------------------

/** Valence of an emotional state, -1 (low) … +1 (high). */
const VALENCE: Record<string, number> = {
  energized: 0.8, calm: 0.5, tired: -0.3, anxious: -0.6, hopeful: 0.6,
  fulfilled: 0.9, exhausted: -0.8, grateful: 0.8, restless: -0.3, content: 0.6,
  overwhelmed: -0.8, peaceful: 0.7, excited: 0.8, uncertain: -0.3,
}

const NOTE_EVENTS = new Set(['note'])
const CHECKIN_EVENTS = new Set(['emotional_checkin'])
const SELFCARE_EVENTS = new Set(['self_care', 'self_care_checkin', 'energy_checkin', 'intention'])
const ANSWER_EVENTS = new Set(['answer', 'memory_answer'])

const XP_PER: Record<'notes' | 'checkIns' | 'selfCare' | 'answers', number> = {
  notes: 3, checkIns: 5, selfCare: 4, answers: 2,
}
const XP_PER_STREAK_DAY = 10

const STOPWORDS = new Set((
  'about after again also always because been before being between both cant could didnt does done dont ' +
  'each even every feel feeling felt from gets going have having here into just kind like little made make ' +
  'more most much need only other over really some still such take than that their them then there these ' +
  'they thing things think this today tomorrow very want were what when where which while will with without ' +
  'would your youre yesterday today'
).split(/\s+/))

function toTime(d: Date | string): number {
  return (d instanceof Date ? d : new Date(d)).getTime()
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function bucketKey(ts: number, window: StoryWindow, tzOffsetMinutes: number): string {
  const d = new Date(ts + tzOffsetMinutes * 60_000)
  const ymd = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
  if (window === 'day') return `${pad2(d.getUTCHours())}:00`
  if (window === 'year') return ymd.slice(0, 7)
  return ymd
}

function dayKey(ts: number, tzOffsetMinutes: number): string {
  return bucketKey(ts, 'week', tzOffsetMinutes)
}

function isSlashOnly(text: string): boolean {
  return /^\s*\/[a-z]/i.test(text)
}

/**
 * The person's own words in a note: text after a generated block (📖 story,
 * 🕯️ scripture appended by slash commands) and the /story command itself are
 * removed, so machine output is never fed back into the next story.
 */
function ownText(raw: string | null | undefined): string {
  const cut = (raw || '').split(/📖|🕯/)[0]
  return stripStoryCommand(cut)
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function round(n: number, dp = 2): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

function moodOf(l: StoryLog): number | null {
  const state = String(l.metadata?.emotionalState ?? '').toLowerCase()
  if (!(state in VALENCE)) return null
  return VALENCE[state]
}

/** Consecutive active days ending today (or yesterday, so the streak is not lost mid-day). */
function currentStreak(dayKeys: Set<string>, now: number, tz: number): number {
  let cursor = now
  if (!dayKeys.has(dayKey(cursor, tz))) cursor -= DAY_MS
  let n = 0
  while (dayKeys.has(dayKey(cursor, tz))) {
    n++
    cursor -= DAY_MS
  }
  return n
}

/** Arcade (gamified) evolution. PROVISIONAL tuning — see docs/technical/LOT-LOG-SLASH-AND-STORY.md. */
export function computeArcade(logs: StoryLog[], windowStart: number, now: number, tz = 0): ArcadeState {
  let xpTotal = 0
  let xpWindow = 0
  const days = new Set<string>()
  for (const l of logs) {
    const kind = classify(l)
    if (!kind) continue
    const t = toTime(l.createdAt)
    if (t > now) continue
    const xp = XP_PER[kind]
    xpTotal += xp
    if (t >= windowStart) xpWindow += xp
    days.add(dayKey(t, tz))
  }
  const streakDays = currentStreak(days, now, tz)
  const streakBonus = streakDays * XP_PER_STREAK_DAY
  xpTotal += streakBonus
  xpWindow += streakBonus
  const level = Math.floor(Math.sqrt(xpTotal / 10)) + 1
  const nextAt = 10 * level * level
  return {
    xpTotal,
    xpWindow,
    level,
    rank: rankFor(level),
    xpToNext: nextAt - xpTotal,
    streakDays,
  }
}

function rankFor(level: number): string {
  if (level >= 15) return 'SAGE'
  if (level >= 10) return 'ARCHITECT'
  if (level >= 6) return 'NAVIGATOR'
  if (level >= 3) return 'OPERATOR'
  return 'INITIATE'
}

function classify(l: StoryLog): 'notes' | 'checkIns' | 'selfCare' | 'answers' | null {
  if (NOTE_EVENTS.has(l.event)) {
    const t = ownText(l.text)
    return t && !isSlashOnly(t) ? 'notes' : null
  }
  if (CHECKIN_EVENTS.has(l.event)) return 'checkIns'
  if (SELFCARE_EVENTS.has(l.event)) return 'selfCare'
  if (ANSWER_EVENTS.has(l.event)) return 'answers'
  return null
}

function extractThemes(texts: string[]): string[] {
  const freq = new Map<string, number>()
  for (const t of texts) {
    const seen = new Set<string>()
    for (const w of t.toLowerCase().match(/[a-zа-яё]{4,}/g) || []) {
      if (STOPWORDS.has(w) || seen.has(w)) continue
      seen.add(w)
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  return [...freq.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([w]) => w)
}

function mostCommon(xs: Array<string | null | undefined>): string | null {
  const m = new Map<string, number>()
  for (const x of xs) if (x) m.set(x, (m.get(x) || 0) + 1)
  let best: string | null = null
  let n = 0
  m.forEach((c, k) => { if (c > n) { best = k; n = c } })
  return best
}

// ---------------------------------------------------------------------------
// Compression
// ---------------------------------------------------------------------------

export interface CompressOptions {
  now?: Date
  /** Minutes east of UTC for the user's wall clock (bucket boundaries). */
  tzOffsetMinutes?: number
}

/**
 * Compresses `logs` (any order, any events) into a StoryDigest for `window`.
 * Non-journal events (logins, theme changes, generated stories, QIE signals)
 * are ignored — they are system noise, not the person's narrative.
 */
export function compressLogs(logs: StoryLog[], window: StoryWindow, opts: CompressOptions = {}): StoryDigest {
  const now = (opts.now ?? new Date()).getTime()
  const tz = opts.tzOffsetMinutes ?? 0
  const start = now - WINDOW_DAYS[window] * DAY_MS

  const inWin = logs
    .filter(l => {
      const t = toTime(l.createdAt)
      return t >= start && t <= now && classify(l) !== null
    })
    .sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt))

  const counts = { notes: 0, checkIns: 0, selfCare: 0, answers: 0, total: 0 }
  const byBucket = new Map<string, { count: number; moods: number[] }>()
  const moodSeries: number[] = []
  const moodNames = new Map<string, number>()
  const days = new Set<string>()
  const noteTexts: string[] = []

  for (const l of inWin) {
    const kind = classify(l)!
    counts[kind]++
    counts.total++
    const t = toTime(l.createdAt)
    const key = bucketKey(t, window, tz)
    const b = byBucket.get(key) ?? { count: 0, moods: [] }
    b.count++
    const v = moodOf(l)
    if (v !== null) {
      b.moods.push(v)
      moodSeries.push(v)
      const name = String(l.metadata!.emotionalState).toLowerCase()
      moodNames.set(name, (moodNames.get(name) || 0) + 1)
    }
    byBucket.set(key, b)
    days.add(dayKey(t, tz))
    if (kind === 'notes') noteTexts.push(ownText(l.text))
  }

  const buckets = [...byBucket.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, b]) => ({ key, count: b.count, mood: b.moods.length ? round(mean(b.moods)) : null }))

  const peak = buckets.reduce<{ key: string; count: number } | null>(
    (best, b) => (!best || b.count > best.count ? { key: b.key, count: b.count } : best), null)

  const moodBuckets = buckets.filter(b => b.mood !== null) as Array<{ key: string; count: number; mood: number }>
  const best = moodBuckets.length >= 2 ? moodBuckets.reduce((a, b) => (b.mood > a.mood ? b : a)) : null
  const worst = moodBuckets.length >= 2 ? moodBuckets.reduce((a, b) => (b.mood < a.mood ? b : a)) : null

  // --- Pattern detection ("spike or a pattern change") ---------------------
  const signals: StorySignal[] = []
  const slots = window === 'day' ? 24 : window === 'year' ? 12 : WINDOW_DAYS[window]
  if (counts.total >= 4) {
    // Non-empty buckets padded with zeros to the window's slot count.
    const series = buckets.map(b => b.count)
    while (series.length < slots) series.push(0)
    const mu = counts.total / slots
    const sd = Math.sqrt(series.reduce((a, x) => a + (x - mu) ** 2, 0) / slots)
    if (peak && peak.count >= 3 && peak.count > mu + 1.5 * sd) {
      signals.push({ kind: 'volume-spike', detail: `${peak.count} entries at ${peak.key} vs ${round(mu, 1)} typical` })
    }
  }
  if (moodSeries.length >= 4) {
    const half = Math.floor(moodSeries.length / 2)
    const first = mean(moodSeries.slice(0, half))
    const last = mean(moodSeries.slice(half))
    if (Math.abs(last - first) >= 0.4) {
      signals.push({
        kind: 'mood-shift',
        detail: `mood moved ${last > first ? 'up' : 'down'} (${round(first)} → ${round(last)})`,
      })
    }
  }
  if (inWin.length >= 3) {
    const gaps: number[] = []
    for (let i = 1; i < inWin.length; i++) gaps.push(toTime(inWin[i].createdAt) - toTime(inWin[i - 1].createdAt))
    const sorted = [...gaps].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const sinceLast = now - toTime(inWin[inWin.length - 1].createdAt)
    if (sinceLast > DAY_MS && sinceLast > 2 * median) {
      signals.push({ kind: 'silence', detail: `${Math.floor(sinceLast / DAY_MS)}d since last entry` })
    }
  }

  const ctxs = inWin.map(l => l.context || {})
  const temps = ctxs.map(c => c.temperature).filter((x): x is number => typeof x === 'number' && x > 0)
  const hums = ctxs.map(c => c.humidity).filter((x): x is number => typeof x === 'number' && x > 0)

  const excerpts = noteTexts
    .slice(-3)
    .map(t => (t.length > 140 ? t.slice(0, 139) + '…' : t))
    .map(t => t.replace(/\s+/g, ' '))

  return {
    window,
    label: WINDOW_LABEL[window],
    from: new Date(start).toISOString(),
    to: new Date(now).toISOString(),
    counts,
    activeDays: days.size,
    buckets,
    peakBucket: peak,
    mood: {
      samples: moodSeries.length,
      avg: moodSeries.length ? round(mean(moodSeries)) : null,
      top: [...moodNames.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
      best: best ? { key: best.key, avg: best.mood } : null,
      worst: worst && worst.key !== best?.key ? { key: worst.key, avg: worst.mood } : null,
    },
    signals,
    context: {
      city: mostCommon(ctxs.map(c => c.city)),
      moon: mostCommon(ctxs.map(c => c.astroMoonPhase)),
      tempC: temps.length ? Math.round(mean(temps) - 273.15) : null,
      humidity: hums.length ? Math.round(mean(hums)) : null,
    },
    themes: extractThemes(noteTexts),
    excerpts,
    arcade: computeArcade(logs, start, now, tz),
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** Terminal-grid stat lines shown above the narrative. */
export function renderDigestLines(d: StoryDigest): string[] {
  const row = (k: string, v: string) => `${k.padEnd(10)}${v}`
  const lines = [
    row('WINDOW', d.label),
    row('ENTRIES', `${d.counts.total} · notes ${d.counts.notes} · check-ins ${d.counts.checkIns} · self-care ${d.counts.selfCare + d.counts.answers}`),
    row('ACTIVE', `${d.activeDays} day${d.activeDays === 1 ? '' : 's'}`),
  ]
  if (d.mood.avg !== null) {
    const top = d.mood.top.map(([s, n]) => `${s.toUpperCase()}×${n}`).join(' ')
    lines.push(row('MOOD', `${d.mood.avg >= 0 ? '+' : ''}${d.mood.avg} · ${top}`))
  }
  if (d.peakBucket) lines.push(row('PEAK', `${d.peakBucket.key} (${d.peakBucket.count})`))
  for (const s of d.signals) lines.push(row('SIGNAL', `${s.kind.toUpperCase()} — ${s.detail}`))
  const ctx = [d.context.city, d.context.moon, d.context.tempC !== null ? `${d.context.tempC}°C` : null]
    .filter(Boolean).join(' · ')
  if (ctx) lines.push(row('CONTEXT', ctx))
  const a = d.arcade
  lines.push(row('ARCADE', `LVL ${a.level} ${a.rank} · ${a.xpTotal} XP (+${a.xpWindow}) · STREAK ${a.streakDays}D · ${a.xpToNext} TO NEXT`))
  return lines
}

/**
 * Deterministic story from a Digest. No network. Second person, grounded in
 * the person's own numbers; never invents events.
 */
export function composeLocalStory(d: StoryDigest): string {
  const span = d.window === 'day' ? 'day' : d.window
  if (d.counts.total === 0) {
    return `The record is quiet for this ${span}. Silence is also a signal — one line is enough to begin the loop again.`
  }
  const p1: string[] = [
    `This ${span} you left ${d.counts.total} mark${d.counts.total === 1 ? '' : 's'} across ${d.activeDays} day${d.activeDays === 1 ? '' : 's'}.`,
  ]
  if (d.themes.length) p1.push(`Words you kept returning to: ${d.themes.join(', ')}.`)
  if (d.excerpts.length) p1.push(`The latest thing you wrote: “${d.excerpts[d.excerpts.length - 1]}”`)

  const p2: string[] = []
  if (d.mood.avg !== null) {
    const tone = d.mood.avg >= 0.4 ? 'mostly bright' : d.mood.avg <= -0.2 ? 'heavier than usual' : 'steady'
    p2.push(`Your check-ins read ${tone}${d.mood.top.length ? ` — ${d.mood.top.map(([s]) => s).join(', ')} led` : ''}.`)
    if (d.mood.best && d.mood.worst) p2.push(`The high point was ${d.mood.best.key}; the low was ${d.mood.worst.key}.`)
  }
  for (const s of d.signals) {
    if (s.kind === 'volume-spike') p2.push(`Something drew you to write at ${d.peakBucket?.key} (${s.detail}).`)
    if (s.kind === 'mood-shift') p2.push(`A pattern changed: ${s.detail}.`)
    if (s.kind === 'silence') p2.push(`The record went quiet: ${s.detail}.`)
  }

  const a = d.arcade
  const p3 = `Level ${a.level} ${a.rank}, ${a.streakDays}-day streak — ${a.xpToNext} XP to the next level. ` +
    (d.mood.avg !== null && d.mood.avg < -0.2
      ? 'Tomorrow only needs one honest line.'
      : 'The next entry keeps the loop alive.')

  return [p1.join(' '), p2.join(' '), p3].filter(Boolean).join('\n\n')
}

/** Prompt for the AI vendor. Sends the Digest only — never raw log rows. */
export function buildStoryPrompt(d: StoryDigest, logText: string): string {
  const system = `You are the Story module of LOT® — a context-based, self-care operating system. You receive a compressed DIGEST of one person's ${d.window} (journal entries + the context they were written in) and return their story back to them.

RULES:
- Second person ("You..."). Grounded in the DIGEST only; never invent events, people or numbers.
- 90-170 words, 2 short paragraphs. No title, no preamble, no bullet points.
- Surface the most intimate high and low peak. If a SIGNAL is present, name it gently as a change worth noticing.
- Weave in the ARCADE line once, lightly — progress is a side effect of care, not the goal.
- Not medical advice. If the DIGEST shows a heavy stretch, be compassionate and small: one next step at most.
- End with one quiet forward-looking sentence. Return ONLY the story.`
  const digest = renderDigestLines(d).join('\n')
  const extras = [
    d.themes.length ? `THEMES: ${d.themes.join(', ')}` : '',
    d.excerpts.length ? `RECENT LINES:\n${d.excerpts.map(e => `- ${e}`).join('\n')}` : '',
    d.mood.best ? `HIGH: ${d.mood.best.key} (${d.mood.best.avg})` : '',
    d.mood.worst ? `LOW: ${d.mood.worst.key} (${d.mood.worst.avg})` : '',
  ].filter(Boolean).join('\n')
  return `${system}\n\nDIGEST\n${digest}\n${extras}\n\nPERSON'S NOTE WITH COMMAND: "${logText || '(none)'}"`
}
