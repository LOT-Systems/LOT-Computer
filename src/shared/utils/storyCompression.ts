/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression (LOT-SC-1)
 *
 * Pure, deterministic compression of a user's context-tagged Log history into
 * a compact StoryDigest for a window (day | week | month | year). The digest is
 * what the AI vendor sees — never the raw journal — and it also powers a
 * no-AI fallback story, so /story works when the engine is offline.
 *
 * No I/O, no randomness, no clock reads (callers pass `now`). Shared by the
 * server (/api/story) and any client surface. Spec: docs/technical/LOT-LOG-COMMAND-SYSTEM.md
 */

export type StoryWindow = 'day' | 'week' | 'month' | 'year'

export const STORY_WINDOW_DAYS: Record<StoryWindow, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

export type StoryLogInput = {
  event: string
  text?: string | null
  createdAt: Date | string
  /** Log.context — temperature is Kelvin, as stored by getLogContext. */
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export type StorySpike = {
  day: string // YYYY-MM-DD (UTC)
  kind: 'volume' | 'silence' | 'mood-shift' | 'weather-swing'
  detail: string
}

export type ArcadeStatus = {
  xp: number
  level: number
  rank: string
  nextRankXp: number | null
}

export type StoryDigest = {
  window: StoryWindow
  from: string
  to: string
  entries: number
  activeDays: number
  streak: number // consecutive active days ending at `now` (or yesterday)
  words: number
  daypart: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  moods: Array<[string, number]>
  places: string[]
  tempRangeC: [number, number] | null
  moonPhases: string[]
  spikes: StorySpike[]
  excerpts: string[]
  arcade: ArcadeStatus
}

/** Events that count as the user's own voice (journal text). */
const VOICE_EVENTS = new Set(['log_entry', 'journal', 'note'])
/** Events that carry a mood label in metadata.emotionalState. */
const MOOD_EVENTS = new Set(['emotional_checkin'])
/** Generated / system events never feed back into compression. */
const EXCLUDED_EVENTS = new Set([
  'generated_story',
  'assembly_directive',
  'qi_rfi',
  'prayer_scripture',
  'ping',
  'users_total',
  'users_online',
  'quantum_intent_signal',
  'settings_change',
  'system_feedback',
  'chat_message',
  'chat_message_like',
  'live_message',
  'direct_message_sent',
  'community_coherence_pulse',
])

const NEGATIVE_MOODS = new Set([
  'anxious', 'stressed', 'sad', 'tired', 'overwhelmed', 'angry', 'lonely',
  'low', 'depleted', 'frustrated', 'worried', 'drained',
])

/** Arcade ranks: self-care progression, not competition. XP floor per rank. */
const RANKS: Array<[number, string]> = [
  [0, 'RECRUIT'],
  [50, 'OBSERVER'],
  [150, 'OPERATOR'],
  [400, 'NAVIGATOR'],
  [900, 'CARTOGRAPHER'],
  [1800, 'ARCHIVIST'],
  [3600, 'KEEPER OF TIME'],
]

const DAY_MS = 24 * 60 * 60 * 1000

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

/** `/story`, `/story week`, `/story month`, `📖 year` -> window (default week). */
export function parseStoryWindow(text: string): StoryWindow {
  const m = /(?:^|\s)(?:\/story|📖)\s*(day|today|week|month|year)?\b/i.exec(text || '')
  const w = (m?.[1] || 'week').toLowerCase()
  return w === 'today' ? 'day' : (w as StoryWindow)
}

export function arcadeStatus(xp: number): ArcadeStatus {
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i][0]) idx = i
  const next = RANKS[idx + 1]
  return {
    xp,
    level: idx + 1,
    rank: RANKS[idx][1],
    nextRankXp: next ? next[0] : null,
  }
}

function mean(a: number[]) {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0
}
function stdev(a: number[]) {
  const m = mean(a)
  return Math.sqrt(mean(a.map(x => (x - m) ** 2)))
}

export function compressStory(
  logs: StoryLogInput[],
  window: StoryWindow,
  now: Date
): StoryDigest {
  const spanDays = STORY_WINDOW_DAYS[window]
  const start = new Date(now.getTime() - spanDays * DAY_MS)

  const inWindow = logs
    .map(l => ({ ...l, at: new Date(l.createdAt) }))
    .filter(l => !isNaN(l.at.getTime()) && l.at >= start && l.at <= now)
    .filter(l => !EXCLUDED_EVENTS.has(l.event))
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const perDay = new Map<string, number>()
  const daypart = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  const moodCount = new Map<string, number>()
  const moodSeries: Array<{ day: string; neg: boolean }> = []
  const places = new Map<string, number>()
  const moons = new Map<string, number>()
  const dayTemp = new Map<string, number[]>()
  let words = 0
  let voice = 0
  const voiceTexts: Array<{ text: string; at: Date }> = []

  for (const l of inWindow) {
    const k = dayKey(l.at)
    perDay.set(k, (perDay.get(k) || 0) + 1)

    const h = l.at.getUTCHours()
    daypart[h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening']++

    if (VOICE_EVENTS.has(l.event) && l.text && l.text.trim()) {
      // Strip slash-command lines and previously appended 📖/🕯️ output.
      const clean = l.text
        .split('\n')
        .filter(line => !/^\s*(\/\w+|📖|🕯️?)/.test(line))
        .join(' ')
        .trim()
      if (clean) {
        voice++
        words += clean.split(/\s+/).filter(Boolean).length
        voiceTexts.push({ text: clean, at: l.at })
      }
    }

    if (MOOD_EVENTS.has(l.event)) {
      const mood = String(l.metadata?.emotionalState || '').toLowerCase()
      if (mood) {
        moodCount.set(mood, (moodCount.get(mood) || 0) + 1)
        moodSeries.push({ day: k, neg: NEGATIVE_MOODS.has(mood) })
      }
    }

    const c = l.context || {}
    if (c.city) places.set(String(c.city), (places.get(String(c.city)) || 0) + 1)
    if (c.astroMoonPhase) moons.set(String(c.astroMoonPhase), (moons.get(String(c.astroMoonPhase)) || 0) + 1)
    if (typeof c.temperature === 'number' && c.temperature > 0) {
      const arr = dayTemp.get(k) || []
      arr.push(c.temperature - 273.15)
      dayTemp.set(k, arr)
    }
  }

  // ---- streak: consecutive active days ending today (or yesterday)
  let streak = 0
  for (let i = 0; i < spanDays; i++) {
    const k = dayKey(new Date(now.getTime() - i * DAY_MS))
    if (perDay.has(k)) streak++
    else if (i === 0) continue // today may not have started yet
    else break
  }

  // ---- spikes
  const spikes: StorySpike[] = []
  const counts = Array.from(perDay.values())
  if (counts.length >= 3) {
    const m = mean(counts)
    const sd = stdev(counts)
    perDay.forEach((n, day) => {
      if (n >= 3 && sd > 0 && (n - m) / sd >= 1.5) {
        spikes.push({ day, kind: 'volume', detail: `${n} entries vs ${m.toFixed(1)} avg` })
      }
    })
  }
  // silence: gap >= 3 days between two active days (or last active -> now)
  const activeSorted = Array.from(perDay.keys()).sort()
  for (let i = 1; i < activeSorted.length; i++) {
    const gap = Math.round((Date.parse(activeSorted[i]) - Date.parse(activeSorted[i - 1])) / DAY_MS)
    if (gap >= 4) spikes.push({ day: activeSorted[i], kind: 'silence', detail: `${gap - 1} quiet days before` })
  }
  // mood shift: negative share, first half vs second half
  if (moodSeries.length >= 4) {
    const mid = Math.floor(moodSeries.length / 2)
    const share = (a: typeof moodSeries) => a.filter(x => x.neg).length / (a.length || 1)
    const d = share(moodSeries.slice(mid)) - share(moodSeries.slice(0, mid))
    if (Math.abs(d) >= 0.4) {
      spikes.push({
        day: moodSeries[mid].day,
        kind: 'mood-shift',
        detail: d > 0 ? 'low moods rising' : 'low moods easing',
      })
    }
  }
  // weather swing: day-over-day mean temperature change >= 8°C
  const tempDays = Array.from(dayTemp.keys()).sort()
  for (let i = 1; i < tempDays.length; i++) {
    const a = mean(dayTemp.get(tempDays[i - 1])!)
    const b = mean(dayTemp.get(tempDays[i])!)
    if (Math.abs(b - a) >= 8) {
      spikes.push({ day: tempDays[i], kind: 'weather-swing', detail: `${a.toFixed(0)}°C → ${b.toFixed(0)}°C` })
    }
  }
  spikes.sort((x, y) => x.day.localeCompare(y.day))

  // ---- excerpts: longest voice entries, capped, chronological
  const excerpts = voiceTexts
    .slice()
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, 4)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .map(e => (e.text.length > 160 ? e.text.slice(0, 157) + '...' : e.text))

  const temps = Array.from(dayTemp.values()).flat()
  const top = (m: Map<string, number>, n: number) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n)

  // ---- arcade XP: 5/entry (capped 20/day) + 10/active day + 5/streak day (cap 50) + 2/100 words
  let xp = 0
  perDay.forEach(n => { xp += Math.min(n * 5, 20) + 10 })
  xp += Math.min(streak * 5, 50) + Math.floor(words / 100) * 2

  return {
    window,
    from: dayKey(start),
    to: dayKey(now),
    entries: inWindow.length,
    activeDays: perDay.size,
    streak,
    words,
    daypart,
    moods: top(moodCount, 4),
    places: top(places, 3).map(([p]) => p),
    tempRangeC: temps.length ? [Math.round(Math.min(...temps)), Math.round(Math.max(...temps))] : null,
    moonPhases: top(moons, 2).map(([p]) => p),
    spikes: spikes.slice(0, 5),
    excerpts,
    arcade: arcadeStatus(xp),
  }
}

/** Compact, vendor-safe text block of the digest (no raw journal beyond excerpts). */
export function digestToPromptBlock(d: StoryDigest): string {
  const dp = Object.entries(d.daypart).filter(([, n]) => n > 0).map(([k, n]) => `${k} ${n}`).join(', ')
  return [
    `WINDOW: ${d.window.toUpperCase()} (${d.from} → ${d.to})`,
    `ENTRIES: ${d.entries} across ${d.activeDays} active days · streak ${d.streak} · ${d.words} words`,
    `RHYTHM: ${dp || 'none'}`,
    `MOODS: ${d.moods.map(([m, n]) => `${m}×${n}`).join(', ') || 'none recorded'}`,
    `CONTEXT: ${[d.places.join('/'), d.tempRangeC ? `${d.tempRangeC[0]}..${d.tempRangeC[1]}°C` : '', d.moonPhases.join('/')].filter(Boolean).join(' · ') || 'none'}`,
    `SPIKES: ${d.spikes.map(s => `${s.day} ${s.kind} (${s.detail})`).join('; ') || 'none'}`,
    `EXCERPTS:\n${d.excerpts.map(e => `- ${e}`).join('\n') || '- (none)'}`,
  ].join('\n')
}

/** Deterministic story used when the AI engine is unavailable. */
export function fallbackStory(d: StoryDigest): string {
  if (d.entries === 0) {
    return `Nothing recorded in the last ${d.window}. The record is open whenever you are.`
  }
  const parts = [
    `Over the last ${d.window} you left ${d.entries} marks across ${d.activeDays} day${d.activeDays === 1 ? '' : 's'}${d.streak > 1 ? `, ${d.streak} in a row` : ''}.`,
  ]
  if (d.moods.length) parts.push(`${d.moods[0][0]} came up most.`)
  const s = d.spikes[0]
  if (s) parts.push(`The record bends on ${s.day}: ${s.detail}.`)
  parts.push('The loop keeps listening.')
  return parts.join(' ')
}

export function arcadeLine(a: ArcadeStatus): string {
  const next = a.nextRankXp === null ? 'MAX' : `${a.nextRankXp - a.xp} XP TO NEXT`
  return `LV ${a.level} ${a.rank} · ${a.xp} XP · ${next}`
}
