/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND SYSTEM — single source of truth
 *
 * Pure module (no stores, no DOM, no DB) shared by client and server:
 *   1. COMMANDS        — registry behind `/system` (help is generated, never hand-written)
 *   2. parseStoryScope — `/story [day|week|month|year]`
 *   3. compressStory   — deterministic compression of Log entries + context
 *                        metadata into a digest (stats, peaks, spikes, narrative)
 *   4. computeArcade   — gamified evolution (XP / rank) derived from log activity
 *
 * Doc: docs/technical/LOT-LOG-COMMAND-SYSTEM.md
 */

// ─── 1. COMMAND REGISTRY ────────────────────────────────────────────────────

export type CommandCategory = 'NARRATIVE' | 'CONTEXT' | 'BODY' | 'AMBIENT' | 'SYSTEM'

export interface LogCommand {
  slash: string // canonical, without leading slash
  aliases: string[]
  args?: string // usage hint, e.g. "[day|week|month|year]"
  category: CommandCategory
  description: string
}

export const COMMAND_CATEGORY_ORDER: CommandCategory[] = [
  'NARRATIVE',
  'CONTEXT',
  'BODY',
  'AMBIENT',
  'SYSTEM',
]

export const COMMANDS: LogCommand[] = [
  { slash: 'story', aliases: [], args: '[day|week|month|year]', category: 'NARRATIVE', description: 'Compressed story of your day, week, month or year' },
  { slash: 'prayer', aliases: ['candle'], category: 'NARRATIVE', description: 'Generate contextual scripture' },
  { slash: 'qi', aliases: [], args: '[query]', category: 'NARRATIVE', description: 'Ask the Quantum Intelligence engine' },
  { slash: 'how', aliases: [], category: 'NARRATIVE', description: 'Open LOT AI check-in (System tab)' },
  { slash: 'scan', aliases: ['ai'], category: 'CONTEXT', description: 'System status overview' },
  { slash: 'qos', aliases: ['os-report'], category: 'CONTEXT', description: 'Quantum OS state analysis' },
  { slash: 'assembly', aliases: ['assemble'], category: 'CONTEXT', description: 'Self-assembly module status' },
  { slash: 'phys', aliases: ['cohort-report'], category: 'BODY', description: 'Physiological cohort report' },
  { slash: 'fast', aliases: [], category: 'BODY', description: 'Orthodox fasting calendar' },
  { slash: 'breathe', aliases: ['breath'], category: 'BODY', description: '4-2-6 breathing exercise' },
  { slash: 'freeze', aliases: ['pause'], category: 'BODY', description: 'Pause and reflect protocol' },
  { slash: 'silent', aliases: ['quiet'], category: 'BODY', description: 'Signal silence check' },
  { slash: 'sil', aliases: ['silence-check'], category: 'BODY', description: 'Signal silence pattern check' },
  { slash: 'synth', aliases: ['keyboard'], category: 'AMBIENT', description: 'Toggle keyboard sound' },
  { slash: 'radio', aliases: [], category: 'AMBIENT', description: 'Toggle radio' },
  { slash: 'night', aliases: [], category: 'AMBIENT', description: 'Dark mode' },
  { slash: 'system', aliases: ['commands'], category: 'SYSTEM', description: 'This command list' },
]

export const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: 'Ctrl+Enter', description: 'Save log immediately' },
]

/**
 * Plain-text help consumed by the SYSTEM block renderer. Line grammar
 * (kept stable — the renderer keys off it):
 *   - starts with "/"      → command row   "<cmd>  <description>" (2+ spaces)
 *   - non-empty other line → section header
 *   - empty line           → spacer
 */
export function buildSystemHelp(opts?: { arcade?: ArcadeState }): string {
  const lines: string[] = ['AVAILABLE COMMANDS', '']
  for (const cat of COMMAND_CATEGORY_ORDER) {
    const rows = COMMANDS.filter(c => c.category === cat)
    if (!rows.length) continue
    lines.push(cat)
    for (const c of rows) {
      const left = `/${c.slash}${c.args ? ' ' + c.args : ''}`
      lines.push(`${left.padEnd(14)}  ${c.description}`)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS')
  for (const s of SHORTCUTS) lines.push(`${s.keys.padEnd(14)}  ${s.description}`)
  if (opts?.arcade) {
    const a = opts.arcade
    lines.push('', 'ARCADE')
    lines.push(`RANK ${a.rank} · LV ${a.level} · ${a.xp} XP`)
    lines.push(a.nextRank ? `NEXT ${a.nextRank} IN ${a.xpToNext} XP` : 'MAX RANK REACHED')
  }
  return lines.join('\n')
}

// ─── 2. /story SCOPE ────────────────────────────────────────────────────────

export type StoryScope = 'day' | 'week' | 'month' | 'year'
export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

const SCOPE_WORDS: Record<string, StoryScope> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year', annual: 'year',
}

/**
 * Extracts scope + remaining free text from a log containing `/story`.
 * `"felt tired /story week"` → { scope: 'week', rest: 'felt tired' }.
 * Unknown / missing argument defaults to 'day'. Never throws.
 */
export function parseStoryCommand(text: string): { scope: StoryScope; rest: string } {
  const src = text || ''
  const m = src.match(/(^|\s)\/story(?:\s+([a-z]+))?(?=\s|$|[^a-z0-9_])/i)
  let scope: StoryScope = 'day'
  let stripped = src
  if (m) {
    const word = (m[2] || '').toLowerCase()
    if (word && SCOPE_WORDS[word]) {
      scope = SCOPE_WORDS[word]
      stripped = src.replace(m[0], m[1] || '')
    } else {
      stripped = src.replace(/(^|\s)\/story/i, m[1] || '')
    }
  }
  return { scope, rest: stripped.replace(/📖/g, '').trim() }
}

// ─── 3. STORY COMPRESSION ───────────────────────────────────────────────────

export interface CompressibleEntry {
  text?: string | null
  createdAt: Date | string | number
  context?: Record<string, any> | null
}

export interface StorySpike {
  kind: 'volume' | 'silence' | 'depth'
  label: string
}

export interface StoryDigest {
  scope: StoryScope
  windowStart: number
  windowEnd: number
  entryCount: number
  activeDays: number
  totalDays: number
  words: number
  peakHour: number | null
  dayPart: string | null
  weather: string | null
  avgTempC: number | null
  cities: string[]
  moon: string | null
  spikes: StorySpike[]
  /** Deterministic narrative; used as AI grounding and as offline fallback. */
  narrative: string
}

const DAY_MS = 86_400_000
const SCOPE_DAYS: Record<StoryScope, number> = { day: 1, week: 7, month: 30, year: 365 }

const dayPart = (h: number) =>
  h < 5 ? 'deep night' : h < 9 ? 'morning' : h < 12 ? 'late morning' :
  h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night'

const mode = <T,>(xs: T[]): T | null => {
  if (!xs.length) return null
  const m = new Map<T, number>()
  xs.forEach(x => m.set(x, (m.get(x) || 0) + 1))
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

const toMs = (d: Date | string | number) => new Date(d).getTime()
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

/** Slash-command lines / generated blocks must not count as the user's own words. */
export function isUserProse(text: string | null | undefined): boolean {
  if (!text) return false
  const t = text.replace(/[​-‍⁠﻿᠎]/g, '').trim()
  if (!t) return false
  return !/^\/[a-z-]+\s*$/i.test(t)
}

export function compressStory(
  entries: CompressibleEntry[],
  scope: StoryScope,
  now: Date | number = Date.now()
): StoryDigest {
  const end = toMs(now)
  const days = SCOPE_DAYS[scope]
  const start = end - days * DAY_MS
  const prevStart = start - days * DAY_MS

  const valid = entries.filter(e => isUserProse(e.text))
  const inWin = valid.filter(e => { const t = toMs(e.createdAt); return t > start && t <= end })
  const inPrev = valid.filter(e => { const t = toMs(e.createdAt); return t > prevStart && t <= start })

  const dayKeys = new Set(inWin.map(e => Math.floor(toMs(e.createdAt) / DAY_MS)))
  const words = inWin.reduce((n, e) => n + wordCount(e.text || ''), 0)
  const hours = inWin.map(e => new Date(toMs(e.createdAt)).getHours())
  const peakHour = mode(hours)

  const ctx = inWin.map(e => e.context || {})
  const weather = mode(ctx.map(c => (c.weatherDescription || '').toString().toLowerCase()).filter(Boolean))
  const temps = ctx.map(c => c.temperature).filter((n): n is number => typeof n === 'number')
  const avgTempC = temps.length
    ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
    : null
  const cities = [...new Set(ctx.map(c => c.city).filter(Boolean))].slice(0, 3) as string[]
  const moon = mode(ctx.map(c => c.astroMoonPhase).filter(Boolean)) as string | null

  // Spike / pattern-change detection against the previous equal window.
  const spikes: StorySpike[] = []
  const cur = inWin.length
  const prev = inPrev.length
  if (prev >= 3 && cur >= prev * 2) {
    spikes.push({ kind: 'volume', label: `${cur} entries vs ${prev} in the previous ${scope === 'day' ? 'day' : scope} — volume spike` })
  }
  if (prev >= 3 && cur === 0) {
    spikes.push({ kind: 'silence', label: `silence — nothing logged after ${prev} entries the ${scope === 'day' ? 'day' : scope} before` })
  } else if (prev >= 5 && cur > 0 && cur <= prev / 3) {
    spikes.push({ kind: 'silence', label: `quieter: ${cur} entries vs ${prev} before` })
  }
  const prevAvgWords = inPrev.length
    ? inPrev.reduce((n, e) => n + wordCount(e.text || ''), 0) / inPrev.length
    : 0
  const longest = inWin.reduce((best, e) => (wordCount(e.text || '') > wordCount(best?.text || '') ? e : best), inWin[0])
  if (longest && prevAvgWords > 0 && wordCount(longest.text || '') >= prevAvgWords * 3 && wordCount(longest.text || '') >= 40) {
    spikes.push({ kind: 'depth', label: `one entry ran ${wordCount(longest.text || '')} words — far above your usual ${Math.round(prevAvgWords)}` })
  }

  const dp = peakHour === null ? null : dayPart(peakHour)
  const scopeNoun = scope === 'day' ? 'last 24 hours' : `last ${scope}`
  const parts: string[] = []
  if (!cur) {
    parts.push(`No entries in the ${scopeNoun}.`)
  } else {
    parts.push(`${cur} ${cur === 1 ? 'entry' : 'entries'} across ${dayKeys.size} of ${days} ${days === 1 ? 'day' : 'days'}, ${words} words.`)
    if (dp) parts.push(`You wrote most in the ${dp}.`)
    const env: string[] = []
    if (weather) env.push(weather)
    if (avgTempC !== null) env.push(`around ${avgTempC}°C`)
    if (cities.length) env.push(`in ${cities.join(' / ')}`)
    if (moon) env.push(`under a ${String(moon).toLowerCase()} moon`)
    if (env.length) parts.push(`The context around you: ${env.join(', ')}.`)
  }
  spikes.forEach(s => parts.push(s.label.charAt(0).toUpperCase() + s.label.slice(1) + '.'))

  return {
    scope,
    windowStart: start,
    windowEnd: end,
    entryCount: cur,
    activeDays: dayKeys.size,
    totalDays: days,
    words,
    peakHour,
    dayPart: dp,
    weather: weather || null,
    avgTempC,
    cities,
    moon,
    spikes,
    narrative: parts.join(' '),
  }
}

// ─── 4. ARCADE (gamified evolution) ─────────────────────────────────────────

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  nextRank: string | null
  xpToNext: number
  streak: number
}

/** [min XP, name] — ascending. Names follow the LOT console / field-manual idiom. */
export const ARCADE_RANKS: Array<[number, string]> = [
  [0, 'CADET'],
  [50, 'OPERATOR'],
  [200, 'NAVIGATOR'],
  [600, 'ARCHIVIST'],
  [1500, 'CARTOGRAPHER'],
  [4000, 'ARCHITECT'],
]

/**
 * XP is derived, never stored — the same logs always yield the same rank.
 *   10 / entry · +5 / active day · +3 / streak day · +25 / story generated
 * Self-care framing: rewards showing up, not volume — XP per day is capped
 * at 5 entries so spamming the Log earns nothing extra.
 */
export function computeArcade(
  entries: Array<{ createdAt: Date | string | number }>,
  storiesGenerated = 0,
  now: Date | number = Date.now()
): ArcadeState {
  const perDay = new Map<number, number>()
  for (const e of entries) {
    const k = Math.floor(toMs(e.createdAt) / DAY_MS)
    perDay.set(k, (perDay.get(k) || 0) + 1)
  }
  let entryXp = 0
  perDay.forEach(n => { entryXp += Math.min(n, 5) * 10 })

  // Streak: consecutive active days ending today (or yesterday).
  const today = Math.floor(toMs(now) / DAY_MS)
  let cursor = perDay.has(today) ? today : today - 1
  let streak = 0
  while (perDay.has(cursor)) { streak++; cursor-- }

  const xp = entryXp + perDay.size * 5 + streak * 3 + storiesGenerated * 25
  let idx = 0
  ARCADE_RANKS.forEach(([min], i) => { if (xp >= min) idx = i })
  const next = ARCADE_RANKS[idx + 1]
  return {
    xp,
    level: idx + 1,
    rank: ARCADE_RANKS[idx][1],
    nextRank: next ? next[1] : null,
    xpToNext: next ? next[0] - xp : 0,
    streak,
  }
}
