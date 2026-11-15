/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Story Compression Engine (SCE)
 *
 * Stage 2 of the LOT® AI loop:
 *
 *   LOT User data → [LOT Quantum Intent Engine: compression] → AI vendor
 *   processor (Together AI) → LOT personalized data stored
 *
 * This module is PURE: no DB, no network, no DOM. It receives raw log
 * rows (journal entries, check-ins, self-care, widget clicks — each one a
 * context snapshot of the moment) and compresses them into a
 * `CompressionPacket`: the smallest honest representation of a person's
 * day / week / month / year. The packet is what leaves LOT for the AI
 * vendor — never the raw rows — so the vendor sees a signal summary,
 * not an archive.
 *
 * The same packet also yields a deterministic story (`renderCompressedStory`)
 * that is used when the AI vendor is unavailable, so /story never
 * returns empty.
 */

export type StoryHorizon = 'day' | 'week' | 'month' | 'year'

export const STORY_HORIZONS: StoryHorizon[] = ['day', 'week', 'month', 'year']

const HORIZON_DAYS: Record<StoryHorizon, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Minimal row shape — matches the Log model without importing it. */
export interface CompressibleLog {
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

export type PeakKind = 'high' | 'low'

export interface StoryPeak {
  kind: PeakKind
  at: string // ISO timestamp
  score: number // −1..+1 valence
  excerpt: string // ≤ 120 chars, never the full entry
  context: string // "Rain · 12°C · Lisbon · Waxing Moon"
}

export interface ActivitySpike {
  day: string // YYYY-MM-DD
  count: number
  zScore: number
}

export interface ArcadeStatus {
  xp: number
  level: number
  rank: string
  nextLevelXp: number
  progress: number // 0..1 toward next level
  streakDays: number
}

export interface CompressionPacket {
  horizon: StoryHorizon
  requestedHorizon: StoryHorizon
  widened: boolean
  from: string
  to: string
  totals: {
    snapshots: number // every row, every click
    journal: number // free-text Log entries
    checkins: number
    selfCare: number
    intentions: number
    words: number
    activeDays: number
  }
  mood: {
    dominant: string | null
    sequence: string[] // chronological, deduped consecutive
    valence: number // −1..+1 mean
    trend: 'rising' | 'falling' | 'steady' | 'unknown'
  }
  environment: {
    cities: string[]
    tempMinC: number | null
    tempMaxC: number | null
    humidityAvg: number | null
    weather: string | null // dominant description
    moonPhases: string[]
    zodiac: string | null // dominant western zodiac
  }
  themes: string[] // top recurring words in the journal
  peaks: StoryPeak[] // ≤ 1 high + ≤ 1 low
  spikes: ActivitySpike[]
  arcade: ArcadeStatus
}

// ─── Lexicon ─────────────────────────────────────────────────────────────────

const POSITIVE = new Set([
  'energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content', 'peaceful',
  'excited', 'grounded', 'focused', 'flowing', 'steady', 'happy', 'joy', 'love',
  'loved', 'rested', 'light', 'clear', 'strong', 'beautiful', 'good', 'great',
  'proud', 'free', 'warm', 'sun', 'sunny', 'laugh', 'laughed', 'win', 'won',
  'thankful', 'alive', 'inspired', 'relaxed', 'better', 'amazing', 'wonderful',
])

const NEGATIVE = new Set([
  'tired', 'anxious', 'exhausted', 'overwhelmed', 'restless', 'uncertain',
  'drained', 'depleted', 'unsettled', 'heavy', 'sad', 'angry', 'alone', 'lonely',
  'lost', 'sick', 'pain', 'hurt', 'stress', 'stressed', 'fear', 'afraid', 'worse',
  'bad', 'awful', 'cry', 'cried', 'broke', 'broken', 'fight', 'failed', 'fail',
  'numb', 'empty', 'insomnia', 'worried', 'worry', 'panic', 'grief', 'miss',
])

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'was', 'are', 'but', 'have', 'had',
  'not', 'you', 'all', 'just', 'from', 'they', 'his', 'her', 'she', 'him', 'its',
  'our', 'out', 'about', 'what', 'when', 'then', 'there', 'some', 'very', 'been',
  'into', 'like', 'will', 'would', 'could', 'should', 'today', 'really', 'also',
  'more', 'much', 'than', 'them', 'were', 'which', 'your', 'one', 'can', 'did',
  'got', 'get', 'now', 'how', 'too', 'over', 'after', 'before', 'still', 'again',
  'day', 'feel', 'feeling', 'felt', 'think', 'know', 'want', 'make', 'made',
  'story', 'system', 'week', 'month', 'year',
])

// Rank ladder — self-care, not combat. A person grows; they don't "kill".
export const ARCADE_RANKS = [
  'Seed',
  'Sprout',
  'Keeper',
  'Steward',
  'Cartographer',
  'Lantern',
  'Navigator',
  'Elder',
  'Sage',
  'Constellation',
] as const

const JOURNAL_EVENTS = new Set(['note', 'journal', 'log_entry'])
const CHECKIN_EVENTS = new Set(['emotional_checkin', 'energy_checkin', 'self_care_checkin'])
const SELF_CARE_EVENTS = new Set(['self_care', 'self_care_complete', 'self_care_completed'])
// Machine-generated rows must not be scored as the person's own voice.
const MACHINE_EVENTS = new Set([
  'generated_story', 'lot_ai_story', 'prayer_scripture', 'qi_rfi',
  'assembly_directive', 'scheduled_job', 'system_snapshot', 'ping',
])

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\/[a-z]+/g, ' ') // strip slash commands
    .split(/[^a-z\u00c0-\u024f']+/)
    .filter(Boolean)
}

/** Lexicon valence in −1..+1; 0 when there is no signal. */
export function scoreValence(text: string): number {
  const words = tokenize(text)
  let pos = 0
  let neg = 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const negated = i > 0 && (words[i - 1] === 'not' || words[i - 1] === "don't" || words[i - 1] === 'never')
    if (POSITIVE.has(w)) negated ? neg++ : pos++
    else if (NEGATIVE.has(w)) negated ? pos++ : neg++
  }
  const total = pos + neg
  return total === 0 ? 0 : (pos - neg) / total
}

function moodValence(mood: string): number {
  const m = mood.toLowerCase()
  if (POSITIVE.has(m)) return 1
  if (NEGATIVE.has(m)) return -1
  return 0
}

function toCelsius(t: number): number {
  // LogContext stores Kelvin from the weather API; tolerate °C already.
  return t > 150 ? t - 273.15 : t
}

function mode<T>(items: T[]): T | null {
  if (items.length === 0) return null
  const counts = new Map<T, number>()
  for (const i of items) counts.set(i, (counts.get(i) || 0) + 1)
  let best: T | null = null
  let bestN = 0
  counts.forEach((n, k) => {
    if (n > bestN) {
      best = k
      bestN = n
    }
  })
  return best
}

function contextLine(ctx: Record<string, any> | null | undefined): string {
  if (!ctx) return ''
  const parts: string[] = []
  if (ctx.weatherDescription) parts.push(String(ctx.weatherDescription))
  if (typeof ctx.temperature === 'number') parts.push(`${Math.round(toCelsius(ctx.temperature))}°C`)
  if (ctx.city) parts.push(String(ctx.city))
  if (ctx.astroMoonPhase) parts.push(String(ctx.astroMoonPhase))
  return parts.join(' · ')
}

function excerpt(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + '…'
}

// ─── Horizon parsing ─────────────────────────────────────────────────────────

/**
 * Resolve the requested horizon from a Log text. `/day`, `/week`,
 * `/month`, `/year` win; `/story` alone resolves to `day`.
 */
export function parseStoryHorizon(text: string): StoryHorizon {
  const lower = (text || '').toLowerCase()
  for (const h of STORY_HORIZONS) {
    if (new RegExp(`(^|\\s)\\/${h}(\\s|$|[^a-z0-9_])`).test(lower)) return h
  }
  const inline = lower.match(/\/story[\s:\-]+(day|week|month|year)\b/)
  if (inline) return inline[1] as StoryHorizon
  return 'day'
}

export function horizonStart(horizon: StoryHorizon, now: Date): Date {
  return new Date(now.getTime() - HORIZON_DAYS[horizon] * 86_400_000)
}

/** The next wider horizon, or null at `year`. */
export function widerHorizon(h: StoryHorizon): StoryHorizon | null {
  const i = STORY_HORIZONS.indexOf(h)
  return i >= 0 && i < STORY_HORIZONS.length - 1 ? STORY_HORIZONS[i + 1] : null
}

// ─── Arcade ──────────────────────────────────────────────────────────────────

/** XP needed to *reach* `level` (level 1 = 0 XP). Quadratic, gentle. */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * (level - 1)
}

export function computeArcade(logs: CompressibleLog[]): ArcadeStatus {
  let xp = 0
  const days = new Set<string>()
  for (const l of logs) {
    if (MACHINE_EVENTS.has(l.event)) continue
    days.add(dayKey(toDate(l.createdAt)))
    if (JOURNAL_EVENTS.has(l.event)) {
      const words = tokenize(l.text || '').length
      xp += 10 + Math.min(20, Math.floor(words / 10)) // depth bonus, capped
    } else if (CHECKIN_EVENTS.has(l.event)) xp += 6
    else if (SELF_CARE_EVENTS.has(l.event)) xp += 8
    else if (l.event === 'intention') xp += 5
    else xp += 1 // every click is a snapshot of the moment
  }

  // Streak: consecutive active days ending at the most recent active day.
  const sorted = Array.from(days).sort()
  let streak = 0
  if (sorted.length) {
    streak = 1
    for (let i = sorted.length - 1; i > 0; i--) {
      const gap = (Date.parse(sorted[i]) - Date.parse(sorted[i - 1])) / 86_400_000
      if (gap === 1) streak++
      else break
    }
  }
  xp += streak * 3

  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  const floor = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const rank = ARCADE_RANKS[Math.min(ARCADE_RANKS.length - 1, Math.floor((level - 1) / 3))]

  return {
    xp,
    level,
    rank,
    nextLevelXp: next,
    progress: next > floor ? (xp - floor) / (next - floor) : 0,
    streakDays: streak,
  }
}

// ─── Compression ─────────────────────────────────────────────────────────────

export function compressLogs(
  allLogs: CompressibleLog[],
  requested: StoryHorizon,
  now: Date = new Date(),
  opts: { minJournal?: number; arcadeLogs?: CompressibleLog[]; autoWiden?: boolean } = {}
): CompressionPacket {
  const minJournal = opts.minJournal ?? 2
  let horizon = requested
  let window = filterWindow(allLogs, horizon, now)

  // Auto-widen: a story of an empty day is not a story. Widen until there
  // is enough of the person's own voice, or we hit the year.
  while (opts.autoWiden !== false && countJournal(window) < minJournal) {
    const wider = widerHorizon(horizon)
    if (!wider) break
    horizon = wider
    window = filterWindow(allLogs, wider, now)
  }

  window.sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())

  const journal = window.filter(l => JOURNAL_EVENTS.has(l.event) && (l.text || '').trim())
  const checkins = window.filter(l => CHECKIN_EVENTS.has(l.event))
  const selfCare = window.filter(l => SELF_CARE_EVENTS.has(l.event))
  const intentions = window.filter(l => l.event === 'intention')

  // Mood
  const moods = checkins
    .map(l => String(l.metadata?.emotionalState || '').toLowerCase())
    .filter(Boolean)
  const sequence: string[] = []
  for (const m of moods) if (sequence[sequence.length - 1] !== m) sequence.push(m)

  const valences: number[] = [
    ...moods.map(moodValence),
    ...journal.map(l => scoreValence(l.text || '')).filter(v => v !== 0),
  ]
  const valence = valences.length ? valences.reduce((a, b) => a + b, 0) / valences.length : 0

  let trend: CompressionPacket['mood']['trend'] = 'unknown'
  if (valences.length >= 4) {
    const half = Math.floor(valences.length / 2)
    const first = valences.slice(0, half).reduce((a, b) => a + b, 0) / half
    const second = valences.slice(half).reduce((a, b) => a + b, 0) / (valences.length - half)
    trend = second - first > 0.2 ? 'rising' : first - second > 0.2 ? 'falling' : 'steady'
  }

  // Environment — the meta-data of every snapshot
  const ctxs = window.map(l => l.context).filter(Boolean) as Record<string, any>[]
  const temps = ctxs.map(c => c.temperature).filter((t): t is number => typeof t === 'number').map(toCelsius)
  const hums = ctxs.map(c => c.humidity).filter((h): h is number => typeof h === 'number')
  const cities = Array.from(new Set(ctxs.map(c => c.city).filter(Boolean).map(String)))
  const moonPhases = Array.from(new Set(ctxs.map(c => c.astroMoonPhase).filter(Boolean).map(String)))

  // Themes
  const freq = new Map<string, number>()
  for (const l of journal) {
    const seen = new Set<string>()
    for (const w of tokenize(l.text || '')) {
      if (w.length < 4 || STOPWORDS.has(w) || seen.has(w)) continue
      seen.add(w)
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  const themes = Array.from(freq.entries())
    .filter(([, n]) => n >= 2 || journal.length <= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([w]) => w)

  // Peaks — the most intimate high and low of the period
  const scored = journal
    .map(l => ({ l, s: scoreValence(l.text || '') }))
    .filter(x => x.s !== 0)
  const peaks: StoryPeak[] = []
  const hi = scored.reduce<typeof scored[0] | null>((b, x) => (x.s > 0 && (!b || x.s > b.s) ? x : b), null)
  const lo = scored.reduce<typeof scored[0] | null>((b, x) => (x.s < 0 && (!b || x.s < b.s) ? x : b), null)
  for (const [kind, x] of [['high', hi], ['low', lo]] as const) {
    if (!x) continue
    peaks.push({
      kind,
      at: toDate(x.l.createdAt).toISOString(),
      score: Math.round(x.s * 100) / 100,
      excerpt: excerpt(x.l.text || ''),
      context: contextLine(x.l.context),
    })
  }

  // Spikes — days with unusual activity (pattern change → follow-up)
  const perDay = new Map<string, number>()
  for (const l of window) {
    if (MACHINE_EVENTS.has(l.event)) continue
    const k = dayKey(toDate(l.createdAt))
    perDay.set(k, (perDay.get(k) || 0) + 1)
  }
  const counts = Array.from(perDay.values())
  const spikes: ActivitySpike[] = []
  if (counts.length >= 3) {
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const sd = Math.sqrt(counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length)
    if (sd > 0) {
      perDay.forEach((count, day) => {
        const z = (count - mean) / sd
        if (z >= 1.5) spikes.push({ day, count, zScore: Math.round(z * 100) / 100 })
      })
      spikes.sort((a, b) => b.zScore - a.zScore)
    }
  }

  const words = journal.reduce((n, l) => n + tokenize(l.text || '').length, 0)

  return {
    horizon,
    requestedHorizon: requested,
    widened: horizon !== requested,
    from: horizonStart(horizon, now).toISOString(),
    to: now.toISOString(),
    totals: {
      snapshots: window.length,
      journal: journal.length,
      checkins: checkins.length,
      selfCare: selfCare.length,
      intentions: intentions.length,
      words,
      activeDays: perDay.size,
    },
    mood: {
      dominant: mode(moods),
      sequence: sequence.slice(-8),
      valence: Math.round(valence * 100) / 100,
      trend,
    },
    environment: {
      cities: cities.slice(0, 5),
      tempMinC: temps.length ? Math.round(Math.min(...temps)) : null,
      tempMaxC: temps.length ? Math.round(Math.max(...temps)) : null,
      humidityAvg: hums.length ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : null,
      weather: mode(ctxs.map(c => c.weatherDescription).filter(Boolean).map(String)),
      moonPhases: moonPhases.slice(0, 4),
      zodiac: mode(ctxs.map(c => c.astroWesternZodiac).filter(Boolean).map(String)),
    },
    themes,
    peaks,
    spikes: spikes.slice(0, 3),
    arcade: computeArcade(opts.arcadeLogs ?? allLogs),
  }
}

function filterWindow(logs: CompressibleLog[], h: StoryHorizon, now: Date): CompressibleLog[] {
  const start = horizonStart(h, now).getTime()
  const end = now.getTime()
  return logs.filter(l => {
    const t = toDate(l.createdAt).getTime()
    return t >= start && t <= end
  })
}

function countJournal(logs: CompressibleLog[]): number {
  return logs.filter(l => JOURNAL_EVENTS.has(l.event) && (l.text || '').trim()).length
}

// ─── Rendering ───────────────────────────────────────────────────────────────

const HORIZON_LABEL: Record<StoryHorizon, string> = {
  day: 'DAY',
  week: 'WEEK',
  month: 'MONTH',
  year: 'YEAR',
}

/** Terminal header shown above every story — the compressed telemetry. */
export function renderPacketHeader(p: CompressionPacket): string {
  const env = p.environment
  const lines = [
    `COMPRESSION     ${HORIZON_LABEL[p.horizon]}${p.widened ? ` (widened from ${HORIZON_LABEL[p.requestedHorizon]})` : ''}`,
    `SNAPSHOTS       ${p.totals.snapshots} · ${p.totals.journal} entries · ${p.totals.words} words · ${p.totals.activeDays} active days`,
  ]
  if (p.mood.dominant) lines.push(`MOOD            ${p.mood.dominant.toUpperCase()} · trend ${p.mood.trend.toUpperCase()}`)
  const envParts: string[] = []
  if (env.weather) envParts.push(env.weather)
  if (env.tempMinC !== null) envParts.push(env.tempMinC === env.tempMaxC ? `${env.tempMinC}°C` : `${env.tempMinC}–${env.tempMaxC}°C`)
  if (env.humidityAvg !== null) envParts.push(`${env.humidityAvg}% hum`)
  if (env.cities.length) envParts.push(env.cities.join(', '))
  if (envParts.length) lines.push(`ENVIRONMENT     ${envParts.join(' · ')}`)
  if (env.moonPhases.length || env.zodiac) {
    lines.push(`SKY             ${[env.zodiac, ...env.moonPhases].filter(Boolean).join(' · ')}`)
  }
  if (p.themes.length) lines.push(`THEMES          ${p.themes.join(' · ')}`)
  const a = p.arcade
  lines.push(`ARCADE          LV ${a.level} ${a.rank.toUpperCase()} · ${a.xp} XP · ${Math.round(a.progress * 100)}% → LV ${a.level + 1} · streak ${a.streakDays}d`)
  return lines.join('\n')
}

/** Deterministic story — the fallback when the AI vendor is offline. */
export function renderCompressedStory(p: CompressionPacket): string {
  const t = p.totals
  if (t.snapshots === 0) {
    return 'The Log is quiet. Write one line about this moment — the system will hold the weather, the hour, and the sky around it.'
  }
  const span = p.horizon === 'day' ? 'Today' : `This ${p.horizon}`
  const out: string[] = []
  out.push(
    `${span} you left ${t.snapshots} snapshot${t.snapshots === 1 ? '' : 's'} of yourself` +
      (t.journal ? `, ${t.journal} in your own words.` : '.')
  )
  if (p.mood.dominant) {
    const trendText = { rising: 'and the line was rising', falling: 'and the line was falling', steady: 'and the line held steady', unknown: '' }[p.mood.trend]
    out.push(`${cap(p.mood.dominant)} was the dominant state${trendText ? `, ${trendText}` : ''}.`)
  }
  if (p.themes.length) out.push(`You kept returning to ${listJoin(p.themes.slice(0, 3))}.`)
  const hi = p.peaks.find(x => x.kind === 'high')
  const lo = p.peaks.find(x => x.kind === 'low')
  if (hi) out.push(`The high: “${hi.excerpt}”${hi.context ? ` (${hi.context})` : ''}.`)
  if (lo) out.push(`The low: “${lo.excerpt}”${lo.context ? ` (${lo.context})` : ''}.`)
  if (t.selfCare) out.push(`${t.selfCare} self-care moment${t.selfCare === 1 ? '' : 's'} completed.`)
  out.push(followUpQuestion(p))
  return out.join(' ')
}

/** The machine asks first — one question, aimed at the strongest signal. */
export function followUpQuestion(p: CompressionPacket): string {
  const lo = p.peaks.find(x => x.kind === 'low')
  const hi = p.peaks.find(x => x.kind === 'high')
  if (lo && (!hi || Math.abs(lo.score) >= hi.score)) return 'What would have made the low point lighter?'
  if (p.spikes.length) return `Something moved on ${p.spikes[0].day} — what was different that day?`
  if (hi) return 'What made the high point possible, and can it happen again?'
  if (p.mood.trend === 'falling') return 'What is quietly draining you right now?'
  return 'What do you want to remember about this stretch of time?'
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function listJoin(xs: string[]): string {
  if (xs.length <= 1) return xs.join('')
  return xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]
}

// ─── Vendor prompt ───────────────────────────────────────────────────────────

/**
 * Prompt for the AI vendor processor. Only the packet crosses the
 * boundary — at most two ≤120-char excerpts of the person's words.
 */
export function buildStoryPrompt(p: CompressionPacket, logText: string): string {
  const words = { day: '80-140', week: '120-180', month: '150-220', year: '180-260' }[p.horizon]
  return `You are the Story Compression module of LOT® — a context-aware self-care operating system. You receive a COMPRESSION PACKET: the distilled signal of one person's ${p.horizon}, built from journal entries and context snapshots (weather, place, sky, mood). Compress it further into a story they can hold.

RULES:
- Second person ("You..."). ${words} words. Plain, warm, exact. No title, no preamble, no lists.
- Use ONLY facts present in the packet. Never invent events, people or places.
- Name the high and the low peaks if present, with their context (weather, place, sky).
- Let the environment be texture, not decoration.
- If the arcade level rose or a streak exists, acknowledge it in one clause — quietly, no gamer slang.
- Match the emotional register. Don't force positivity on pain.
- End with EXACTLY one follow-up question on its own line, aimed at the strongest signal (the low peak, a spike, or the trend). The machine asks first.

CURRENT LOG LINE: "${excerpt(logText || '(none)', 200)}"

COMPRESSION PACKET:
${JSON.stringify(
  {
    horizon: p.horizon,
    widened: p.widened,
    totals: p.totals,
    mood: p.mood,
    environment: p.environment,
    themes: p.themes,
    peaks: p.peaks,
    spikes: p.spikes,
    arcade: { level: p.arcade.level, rank: p.arcade.rank, streakDays: p.arcade.streakDays },
  },
  null,
  1
)}`
}
