/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMPRESSION ENGINE  (LCE v1)
 *
 * Deterministic, pure pre-processor that sits between LOT user data and
 * the AI vendor processor:
 *
 *   LOT user data → [LCE packet] → Quantum Intent Engine context → Together AI → stored story
 *
 * The AI never receives the raw journal dump. It receives a compressed
 * packet: counts, mood distribution, environmental context, the single
 * highest and lowest moments, detected spikes and the shift between the
 * first and second half of the window. The model writes prose; the
 * numbers are computed here, so they are reproducible and testable.
 *
 * Rules:
 *  - No I/O, no stores, no dates other than the `now` passed in.
 *  - Shared by server (/api/story, /api/story/packet) and client (/system).
 *  - Valence scoring is a small lexical heuristic, labelled as such.
 *    It locates candidate peaks; it does not diagnose anything.
 */

// ─── Horizons ────────────────────────────────────────────────────────────────

export type StoryHorizon = 'day' | 'week' | 'month' | 'year'

export const STORY_HORIZONS: StoryHorizon[] = ['day', 'week', 'month', 'year']

export const DEFAULT_STORY_HORIZON: StoryHorizon = 'week'

const DAY_MS = 24 * 60 * 60 * 1000

export const HORIZON_DAYS: Record<StoryHorizon, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Story length budget per horizon — longer horizons compress harder, not longer. */
export const HORIZON_WORD_BUDGET: Record<StoryHorizon, [number, number]> = {
  day: [60, 120],
  week: [100, 180],
  month: [120, 200],
  year: [140, 220],
}

const HORIZON_ALIASES: Record<string, StoryHorizon> = {
  day: 'day', today: 'day', d: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

export function normalizeHorizon(value: unknown): StoryHorizon {
  if (typeof value !== 'string') return DEFAULT_STORY_HORIZON
  return HORIZON_ALIASES[value.trim().toLowerCase()] || DEFAULT_STORY_HORIZON
}

/**
 * Parse "/story", "/story month", "📖 year — rough week" etc.
 * Returns the horizon and the free text left after removing the command.
 */
export function parseStoryCommand(text: string): { horizon: StoryHorizon; note: string } {
  const source = text || ''
  const match = source.match(/(?:^|\s)\/story(?:\s+([a-z0-9]+))?/i)
  let horizon = DEFAULT_STORY_HORIZON
  let note = source
  if (match) {
    const arg = (match[1] || '').toLowerCase()
    if (arg && HORIZON_ALIASES[arg]) {
      horizon = HORIZON_ALIASES[arg]
      note = source.replace(match[0], ' ')
    } else {
      note = source.replace(/(?:^|\s)\/story/i, ' ')
    }
  }
  note = note.replace(/📖/g, '').replace(/\s+/g, ' ').trim()
  return { horizon, note }
}

// ─── Input shape ─────────────────────────────────────────────────────────────

export interface CompressibleLog {
  id?: string
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

// ─── Text hygiene ────────────────────────────────────────────────────────────

/**
 * Removes machine-written content from a journal note so the engine does
 * not compress its own output back into the next story (feedback loop):
 * slash-command lines, 📖 story blocks, 🕯️ scripture blocks.
 */
export function cleanJournalText(text: string | null | undefined): string {
  if (!text) return ''
  const kept: string[] = []
  let skippingMachineBlock = false
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) {
      skippingMachineBlock = false
      continue
    }
    if (line.startsWith('📖') || line.startsWith('🕯')) {
      skippingMachineBlock = true
      continue
    }
    if (skippingMachineBlock) continue
    if (/^\/[a-z]/i.test(line)) continue
    const stripped = line
      .replace(/(^|\s)\/story\s+(day|today|week|month|year|d|w|m|y)\b/gi, ' ')
      .replace(/(^|\s)\/[a-z][\w-]*/gi, ' ')
      .trim()
    if (stripped) kept.push(stripped)
  }
  return kept.join(' ').replace(/\s+/g, ' ').trim()
}

export function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

// ─── Valence (lexical heuristic) ─────────────────────────────────────────────

const POSITIVE = [
  'grateful', 'gratitude', 'calm', 'peace', 'peaceful', 'happy', 'joy', 'love', 'loved',
  'rested', 'energized', 'energy', 'strong', 'proud', 'clear', 'clarity', 'hope', 'hopeful',
  'beautiful', 'good', 'great', 'wonderful', 'light', 'free', 'laugh', 'laughed', 'win',
  'finished', 'done', 'progress', 'fulfilled', 'content', 'excited', 'better', 'slept well',
]

const NEGATIVE = [
  'tired', 'exhausted', 'anxious', 'anxiety', 'stress', 'stressed', 'sad', 'angry', 'lonely',
  'alone', 'overwhelmed', 'sick', 'pain', 'hurt', 'worried', 'worry', 'fear', 'afraid',
  'lost', 'stuck', 'bad', 'awful', 'cry', 'cried', 'burnout', 'restless', "can't sleep",
  'insomnia', 'headache', 'fight', 'argument', 'failed', 'worse', 'heavy', 'drained',
]

const NEGATORS = /\b(not|no|never|don't|didn't|isn't|wasn't|without)\s+$/

const MOOD_VALENCE: Record<string, number> = {
  energized: 2, fulfilled: 2, grateful: 2, excited: 2, peaceful: 2,
  calm: 1, hopeful: 1, content: 1,
  uncertain: -1, restless: -1, tired: -1,
  anxious: -2, overwhelmed: -2, exhausted: -2,
}

/** Returns a valence in roughly [-1, 1]. Positive = lighter, negative = heavier. */
export function scoreValence(text: string): number {
  const lower = ` ${text.toLowerCase()} `
  let score = 0
  let hits = 0
  const scan = (words: string[], sign: number) => {
    for (const w of words) {
      const re = new RegExp(`[^a-z']${w}[^a-z']`, 'g')
      let m: RegExpExecArray | null
      while ((m = re.exec(lower))) {
        const before = lower.slice(Math.max(0, m.index - 12), m.index + 1)
        score += NEGATORS.test(before) ? -sign : sign
        hits++
      }
    }
  }
  scan(POSITIVE, 1)
  scan(NEGATIVE, -1)
  if (!hits) return 0
  return Math.max(-1, Math.min(1, score / Math.max(3, hits)))
}

export function moodValence(state: string | null | undefined): number {
  if (!state) return 0
  return (MOOD_VALENCE[state.toLowerCase()] || 0) / 2
}

// ─── Packet ──────────────────────────────────────────────────────────────────

export interface StoryPeak {
  at: string
  valence: number
  excerpt: string
  city?: string | null
  weather?: string | null
  source: 'note' | 'checkin'
}

export interface StorySpike {
  date: string
  entries: number
  baseline: number
}

export interface CompressionPacket {
  version: 'LCE-1'
  horizon: StoryHorizon
  from: string
  to: string
  spanDays: number
  entries: number
  words: number
  activeDays: number
  coverage: number // activeDays / spanDays, 0..1
  checkins: number
  moods: { state: string; count: number }[]
  dominantMood: string | null
  meanValence: number
  shift: { firstHalf: number; secondHalf: number; delta: number; direction: 'up' | 'down' | 'flat' } | null
  peaks: { high: StoryPeak | null; low: StoryPeak | null }
  spikes: StorySpike[]
  context: {
    cities: string[]
    meanTempC: number | null
    weather: string | null
    moonPhase: string | null
    timeBlock: string | null
  }
  streak: number // consecutive days with a journal entry ending today/yesterday
  followUp: string | null // deterministic reason the machine should check in, if any
}

const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v))
const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const round2 = (n: number) => Math.round(n * 100) / 100

function mode<T>(values: T[]): T | null {
  const counts = new Map<T, number>()
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1)
  let best: T | null = null
  let bestCount = 0
  counts.forEach((c, v) => {
    if (c > bestCount) {
      best = v
      bestCount = c
    }
  })
  return best
}

function timeBlockOf(hour: number): string {
  if (hour < 5) return 'night'
  if (hour < 9) return 'morning'
  if (hour < 12) return 'late morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'late evening'
}

/** Hour of day in the operator's own time zone (from log context), UTC fallback. */
function localHour(d: Date, timeZone?: string | null): number {
  if (timeZone) {
    try {
      const h = Number(
        new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(d)
      )
      if (isFinite(h)) return h % 24
    } catch {
      /* invalid zone — fall through */
    }
  }
  return d.getUTCHours()
}

function excerpt(text: string, max = 140): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

/** Consecutive UTC days with ≥1 entry, counting back from `now` (today or yesterday may start it). */
export function journalStreak(dayKeys: Set<string>, now: Date): number {
  let cursor = new Date(now.getTime())
  if (!dayKeys.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS)
  let streak = 0
  while (dayKeys.has(dayKey(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  return streak
}

/**
 * Compress the logs inside the horizon window into a packet.
 * `logs` may contain anything; only `note` and `emotional_checkin` are used.
 */
export function compressLogs(
  logs: CompressibleLog[],
  horizon: StoryHorizon,
  now: Date = new Date()
): CompressionPacket {
  const spanDays = HORIZON_DAYS[horizon]
  const toMs = now.getTime()
  const fromMs = toMs - spanDays * DAY_MS
  const inWindow = logs.filter(l => {
    const t = toDate(l.createdAt).getTime()
    return t >= fromMs && t <= toMs
  })

  const notes = inWindow
    .filter(l => l.event === 'note')
    .map(l => ({ log: l, text: cleanJournalText(l.text), at: toDate(l.createdAt) }))
    .filter(n => n.text.length > 0)
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const checkins = inWindow
    .filter(l => l.event === 'emotional_checkin')
    .map(l => ({ log: l, state: String(l.metadata?.emotionalState || '').toLowerCase(), at: toDate(l.createdAt) }))
    .filter(c => c.state)

  // Peaks — candidates from notes and check-ins on one valence scale.
  const candidates: StoryPeak[] = []
  for (const n of notes) {
    const v = scoreValence(n.text)
    if (v !== 0) {
      candidates.push({
        at: n.at.toISOString(), valence: round2(v), excerpt: excerpt(n.text),
        city: n.log.context?.city || null, weather: n.log.context?.weatherDescription || null, source: 'note',
      })
    }
  }
  for (const c of checkins) {
    const v = moodValence(c.state)
    if (v !== 0) {
      const note = String(c.log.metadata?.note || '').trim()
      candidates.push({
        at: c.at.toISOString(), valence: round2(v),
        excerpt: excerpt(note ? `${c.state.toUpperCase()} — ${note}` : c.state.toUpperCase()),
        city: c.log.context?.city || null, weather: c.log.context?.weatherDescription || null, source: 'checkin',
      })
    }
  }
  let high: StoryPeak | null = null
  let low: StoryPeak | null = null
  for (const p of candidates) {
    if (p.valence > 0 && (!high || p.valence > high.valence)) high = p
    if (p.valence < 0 && (!low || p.valence < low.valence)) low = p
  }
  const meanValence = candidates.length
    ? round2(candidates.reduce((s, p) => s + p.valence, 0) / candidates.length)
    : 0

  // Activity per day + spikes (a day ≥ 2× the active-day mean and ≥ 3 entries).
  const perDay = new Map<string, number>()
  for (const n of notes) perDay.set(dayKey(n.at), (perDay.get(dayKey(n.at)) || 0) + 1)
  const activeDays = perDay.size
  const baseline = activeDays ? notes.length / activeDays : 0
  const spikes: StorySpike[] = []
  if (spanDays > 1 && activeDays >= 3) {
    perDay.forEach((count, date) => {
      if (count >= 3 && count >= baseline * 2) spikes.push({ date, entries: count, baseline: round2(baseline) })
    })
    spikes.sort((a, b) => b.entries - a.entries)
  }

  // Shift — valence of first half vs second half of the window.
  let shift: CompressionPacket['shift'] = null
  if (spanDays > 1) {
    const mid = fromMs + (toMs - fromMs) / 2
    const first = candidates.filter(p => new Date(p.at).getTime() < mid)
    const second = candidates.filter(p => new Date(p.at).getTime() >= mid)
    if (first.length >= 2 && second.length >= 2) {
      const avg = (xs: StoryPeak[]) => xs.reduce((s, p) => s + p.valence, 0) / xs.length
      const a = round2(avg(first))
      const b = round2(avg(second))
      const delta = round2(b - a)
      shift = { firstHalf: a, secondHalf: b, delta, direction: delta > 0.25 ? 'up' : delta < -0.25 ? 'down' : 'flat' }
    }
  }

  // Environment context.
  const ctxLogs = [...notes.map(n => n.log), ...checkins.map(c => c.log)]
  const cities = Array.from(new Set(ctxLogs.map(l => l.context?.city).filter(Boolean) as string[])).slice(0, 5)
  const temps = ctxLogs
    .map(l => l.context?.temperature)
    .filter((t): t is number => typeof t === 'number' && isFinite(t))
  const meanTempC = temps.length ? Math.round(temps.reduce((s, t) => s + t, 0) / temps.length - 273.15) : null
  const weather = mode(ctxLogs.map(l => l.context?.weatherDescription).filter(Boolean) as string[])
  const moonPhase = mode(ctxLogs.map(l => l.context?.astroMoonPhase).filter(Boolean) as string[])
  const timeBlock = mode(notes.map(n => timeBlockOf(localHour(n.at, n.log.context?.timeZone))))

  const moodCounts = new Map<string, number>()
  for (const c of checkins) moodCounts.set(c.state, (moodCounts.get(c.state) || 0) + 1)
  const moods = Array.from(moodCounts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)

  const allNoteDays = new Set(
    logs
      .filter(l => l.event === 'note' && cleanJournalText(l.text))
      .map(l => dayKey(toDate(l.createdAt)))
  )
  const streak = journalStreak(allNoteDays, now)

  const packet: CompressionPacket = {
    version: 'LCE-1',
    horizon,
    from: new Date(fromMs).toISOString(),
    to: now.toISOString(),
    spanDays,
    entries: notes.length,
    words: notes.reduce((s, n) => s + countWords(n.text), 0),
    activeDays,
    coverage: round2(Math.min(1, activeDays / spanDays)),
    checkins: checkins.length,
    moods,
    dominantMood: moods[0]?.state || null,
    meanValence,
    shift,
    peaks: { high, low },
    spikes: spikes.slice(0, 3),
    context: { cities, meanTempC, weather, moonPhase, timeBlock },
    streak,
    followUp: null,
  }
  packet.followUp = detectFollowUp(packet)
  return packet
}

/**
 * The machine asks first — but only for a reason it can state.
 * Returns a one-line reason, or null when nothing warrants a follow-up.
 */
export function detectFollowUp(p: CompressionPacket): string | null {
  if (p.shift && p.shift.direction === 'down') return 'TONE SHIFTED DOWN IN SECOND HALF OF WINDOW'
  if (p.peaks.low && p.peaks.low.valence <= -0.6) return 'LOW PEAK DETECTED — CHECK IN ON IT'
  if (p.spikes.length) return `ACTIVITY SPIKE ${p.spikes[0].date} (${p.spikes[0].entries} ENTRIES)`
  if (p.spanDays >= 7 && p.entries > 0 && p.coverage < 0.2) return 'SIGNAL SPARSE — FEW ACTIVE DAYS'
  return null
}

/** Compact text block handed to the AI vendor. Numbers only from the packet. */
export function packetToPrompt(p: CompressionPacket): string {
  const lines = [
    `HORIZON: ${p.horizon.toUpperCase()} (${p.spanDays}d, ${p.from.slice(0, 10)} → ${p.to.slice(0, 10)})`,
    `ENTRIES: ${p.entries} · WORDS: ${p.words} · ACTIVE DAYS: ${p.activeDays}/${p.spanDays} · STREAK: ${p.streak}d`,
    `CHECK-INS: ${p.checkins}${p.moods.length ? ` · MOODS: ${p.moods.slice(0, 4).map(m => `${m.state}×${m.count}`).join(', ')}` : ''}`,
    `TONE: mean ${p.meanValence}${p.shift ? ` · first half ${p.shift.firstHalf} → second half ${p.shift.secondHalf} (${p.shift.direction})` : ''}`,
    `CONTEXT: ${[
      p.context.cities.length ? p.context.cities.join(' / ') : null,
      p.context.meanTempC !== null ? `${p.context.meanTempC}°C` : null,
      p.context.weather,
      p.context.moonPhase ? `moon ${p.context.moonPhase}` : null,
      p.context.timeBlock ? `writes mostly in the ${p.context.timeBlock}` : null,
    ].filter(Boolean).join(' · ') || 'unknown'}`,
    `HIGH PEAK: ${p.peaks.high ? `${p.peaks.high.at.slice(0, 10)} — "${p.peaks.high.excerpt}"` : 'none detected'}`,
    `LOW PEAK: ${p.peaks.low ? `${p.peaks.low.at.slice(0, 10)} — "${p.peaks.low.excerpt}"` : 'none detected'}`,
  ]
  if (p.spikes.length) lines.push(`SPIKES: ${p.spikes.map(s => `${s.date} ×${s.entries}`).join(', ')}`)
  if (p.followUp) lines.push(`FOLLOW-UP SIGNAL: ${p.followUp}`)
  return lines.join('\n')
}

/** Terminal Grid header rendered under a story in the Log. */
export function packetToGrid(p: CompressionPacket): string {
  const pad = (k: string) => k.padEnd(16, ' ')
  const lines = [
    `${pad('STORY')}${p.horizon.toUpperCase()} · ${p.spanDays}D`,
    `${pad('ENTRIES')}${p.entries} · ${p.words} WORDS`,
    `${pad('ACTIVE DAYS')}${p.activeDays}/${p.spanDays} · STREAK ${p.streak}D`,
  ]
  if (p.dominantMood) lines.push(`${pad('DOMINANT MOOD')}${p.dominantMood.toUpperCase()}`)
  if (p.shift) lines.push(`${pad('TONE SHIFT')}${p.shift.direction.toUpperCase()} (${p.shift.delta >= 0 ? '+' : ''}${p.shift.delta})`)
  if (p.peaks.high) lines.push(`${pad('HIGH')}${p.peaks.high.at.slice(0, 10)}`)
  if (p.peaks.low) lines.push(`${pad('LOW')}${p.peaks.low.at.slice(0, 10)}`)
  if (p.followUp) lines.push(`${pad('FOLLOW-UP')}${p.followUp}`)
  return lines.join('\n')
}

/** Deterministic fallback when the AI vendor is unreachable — the loop never goes dark. */
export function composeFallbackStory(p: CompressionPacket): string {
  if (!p.entries && !p.checkins) {
    return `Nothing was written this ${p.horizon}. The record stays open; the first line is enough.`
  }
  const parts: string[] = []
  parts.push(
    `This ${p.horizon} you wrote ${p.entries} ${p.entries === 1 ? 'entry' : 'entries'} across ${p.activeDays} ${p.activeDays === 1 ? 'day' : 'days'}` +
      (p.context.cities.length ? `, mostly from ${p.context.cities[0]}` : '') + '.'
  )
  if (p.dominantMood) parts.push(`The mood that returned most was ${p.dominantMood}.`)
  if (p.peaks.high) parts.push(`A lighter moment: "${p.peaks.high.excerpt}"`)
  if (p.peaks.low) parts.push(`A heavier one: "${p.peaks.low.excerpt}"`)
  if (p.shift?.direction === 'up') parts.push('The second half read lighter than the first.')
  if (p.shift?.direction === 'down') parts.push('The second half read heavier than the first — worth a quiet look.')
  if (p.streak >= 3) parts.push(`You have kept the record ${p.streak} days in a row.`)
  return parts.join(' ')
}

// ─── Arcade — Record Rank ────────────────────────────────────────────────────
//
// Gamified evolution of the Log, in self-care register:
//  - XP only accrues. Gaps never subtract; streaks only add.
//  - Inputs are counted over the trailing 365 days so the rank reflects
//    a living practice, not a lifetime grind.
//  - Separate from the 1–100 overall level in rpg-narrative (all activity).

export interface RecordRank {
  xp: number
  rank: string
  tier: number // 1-based
  nextRank: string | null
  xpToNext: number | null
  progress: number // 0..1 inside current tier
  breakdown: { entries: number; words: number; contextual: number; streak: number }
}

export const RECORD_RANKS: { rank: string; xp: number }[] = [
  { rank: 'OBSERVER', xp: 0 },
  { rank: 'RECORDER', xp: 100 },
  { rank: 'CHRONICLER', xp: 400 },
  { rank: 'CARTOGRAPHER', xp: 1000 },
  { rank: 'ARCHIVIST', xp: 2500 },
  { rank: 'KEEPER', xp: 5000 },
]

export function computeRecordRank(logs: CompressibleLog[], now: Date = new Date()): RecordRank {
  const fromMs = now.getTime() - 365 * DAY_MS
  const notes = logs
    .filter(l => l.event === 'note' && toDate(l.createdAt).getTime() >= fromMs)
    .map(l => ({ log: l, text: cleanJournalText(l.text) }))
    .filter(n => n.text)
  const words = notes.reduce((s, n) => s + countWords(n.text), 0)
  const contextual = notes.filter(n => n.log.context && (n.log.context.city || n.log.context.temperature)).length
  const streak = journalStreak(new Set(notes.map(n => dayKey(toDate(n.log.createdAt)))), now)

  const breakdown = {
    entries: notes.length * 10,
    words: Math.floor(words / 25),
    contextual: contextual * 2,
    streak: Math.min(streak, 60) * 5,
  }
  const xp = breakdown.entries + breakdown.words + breakdown.contextual + breakdown.streak

  let tier = 0
  for (let i = 0; i < RECORD_RANKS.length; i++) if (xp >= RECORD_RANKS[i].xp) tier = i
  const current = RECORD_RANKS[tier]
  const next = RECORD_RANKS[tier + 1] || null
  return {
    xp,
    rank: current.rank,
    tier: tier + 1,
    nextRank: next ? next.rank : null,
    xpToNext: next ? next.xp - xp : null,
    progress: next ? round2((xp - current.xp) / (next.xp - current.xp)) : 1,
    breakdown,
  }
}

export function rankToGrid(r: RecordRank, overallLevel?: number | null): string {
  const pad = (k: string) => k.padEnd(16, ' ')
  const filled = Math.round(r.progress * 20)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  const lines = [
    `${pad('RECORD RANK')}${r.rank} · TIER ${r.tier}/${RECORD_RANKS.length}`,
    `${pad('XP')}${r.xp}`,
    `${pad('PROGRESS')}${bar}`,
    r.nextRank ? `${pad('NEXT')}${r.nextRank} IN ${r.xpToNext} XP` : `${pad('NEXT')}MAX TIER — THE RECORD KEEPS ITSELF`,
    `${pad('FROM ENTRIES')}${r.breakdown.entries}`,
    `${pad('FROM WORDS')}${r.breakdown.words}`,
    `${pad('FROM CONTEXT')}${r.breakdown.contextual}`,
    `${pad('FROM STREAK')}${r.breakdown.streak}`,
  ]
  if (typeof overallLevel === 'number') lines.push(`${pad('OVERALL LEVEL')}${overallLevel}/100`)
  return lines.join('\n')
}
