/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND SYSTEM — shared, pure, isomorphic.
 *
 * One source of truth for the slash commands an operator can type into
 * the Log (Journal). Used by:
 *   - client  : /system help screen, /story scope parsing, /level arcade card
 *   - server  : /api/story time-window compression (buildStoryDigest)
 *
 * No DOM, no stores, no I/O. Everything here is deterministic given
 * its inputs, so it can be verified with plain node assertions.
 *
 * Doctrine: the Log is a passive AI surface. Commands never interrupt
 * writing; they append a block below the entry and leave the text intact.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. COMMAND REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export type LogCommandCategory =
  | 'NARRATIVE'   // story / compression of the operator's data
  | 'INTELLIGENCE' // AI + engine reports
  | 'RITUAL'      // self-care protocols
  | 'ARCADE'      // gamified evolution
  | 'INTERFACE'   // UI toggles

export interface LogCommand {
  /** Primary command, without slash. */
  name: string
  /** Optional argument hint, e.g. "[day|week|month|year]". */
  args?: string
  /** One-line description shown in /system. */
  description: string
  category: LogCommandCategory
  /** Alternate keywords that fire the same trigger (without slash). */
  aliases?: string[]
  /** Emoji shortcuts that fire the same trigger. */
  emojis?: string[]
}

export const LOG_COMMANDS: LogCommand[] = [
  // NARRATIVE
  { name: 'story', args: '[day|week|month|year]', category: 'NARRATIVE', emojis: ['📖'],
    description: 'Compressed story of your recent day, week, month or year' },
  { name: 'how', category: 'NARRATIVE',
    description: 'Open LOT AI check-in (System tab)' },

  // INTELLIGENCE
  { name: 'qi', args: '[query]', category: 'INTELLIGENCE',
    description: 'Ask the Quantum Intelligence engine' },
  { name: 'scan', category: 'INTELLIGENCE', aliases: ['ai'],
    description: 'System status overview' },
  { name: 'qos', category: 'INTELLIGENCE', aliases: ['os-report'],
    description: 'Quantum OS state analysis' },
  { name: 'assembly', category: 'INTELLIGENCE', aliases: ['assemble'],
    description: 'Self-assembly module status' },
  { name: 'phys', category: 'INTELLIGENCE', aliases: ['cohort-report'],
    description: 'Physiological cohort report' },

  // RITUAL
  { name: 'prayer', category: 'RITUAL', aliases: ['candle'], emojis: ['🕯️', '🕯'],
    description: 'Contextual scripture' },
  { name: 'breathe', category: 'RITUAL', aliases: ['breath'],
    description: '4-2-6 breathing exercise' },
  { name: 'freeze', category: 'RITUAL', aliases: ['pause'], emojis: ['🧊'],
    description: 'Pause and reflect protocol' },
  { name: 'fast', category: 'RITUAL',
    description: 'Orthodox fasting calendar' },
  { name: 'silent', category: 'RITUAL', aliases: ['quiet'],
    description: 'Signal silence check' },
  { name: 'sil', category: 'RITUAL', aliases: ['silence-check'],
    description: 'Signal silence pattern' },

  // ARCADE
  { name: 'level', category: 'ARCADE', aliases: ['arcade', 'xp'],
    description: 'Your self-care arcade rank, XP and streak' },

  // INTERFACE
  { name: 'synth', category: 'INTERFACE', aliases: ['keyboard'], emojis: ['🎹'],
    description: 'Toggle keyboard sound' },
  { name: 'radio', category: 'INTERFACE', emojis: ['🎧'],
    description: 'Toggle radio' },
  { name: 'night', category: 'INTERFACE', emojis: ['🌙'],
    description: 'Dark mode' },
  { name: 'system', category: 'INTERFACE', aliases: ['commands'],
    description: 'This command list' },
]

const CATEGORY_ORDER: LogCommandCategory[] = [
  'NARRATIVE', 'INTELLIGENCE', 'RITUAL', 'ARCADE', 'INTERFACE',
]

/**
 * Lines for the /system help block. Header lines are UPPERCASE with no
 * leading slash; command lines start with "/" and separate command from
 * description with 2+ spaces (the Log renderer splits on that gap).
 */
export function formatSystemHelp(): string[] {
  const lines: string[] = []
  for (const cat of CATEGORY_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.category === cat)
    if (!cmds.length) continue
    if (lines.length) lines.push('')
    lines.push(cat)
    for (const c of cmds) {
      const head = `/${c.name}${c.args ? ' ' + c.args : ''}`
      lines.push(`${head}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STORY SCOPE — /story [day|week|month|year]
// ─────────────────────────────────────────────────────────────────────────────

export type StoryScope = 'recent' | 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPE_MS: Record<StoryScope, number> = {
  recent: 3 * 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

/** Target story length (words) per scope — longer windows, denser compression. */
export const STORY_SCOPE_WORDS: Record<StoryScope, number> = {
  recent: 180, day: 120, week: 180, month: 220, year: 260,
}

const SCOPE_ALIASES: Record<string, StoryScope> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', w: 'week', weekly: 'week',
  month: 'month', m: 'month', monthly: 'month',
  year: 'year', y: 'year', yearly: 'year', annual: 'year',
}

export function isStoryScope(v: unknown): v is StoryScope {
  return typeof v === 'string' && v in STORY_SCOPE_MS
}

/** Reads the token after "/story". Unknown or missing → 'recent'. */
export function parseStoryScope(text: string): StoryScope {
  const m = /(^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  if (!m) return 'recent'
  return SCOPE_ALIASES[m[2].toLowerCase()] || 'recent'
}

/** Removes "/story [scope]" and 📖 from the log text before it is sent. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(\s+(day|today|d|week|w|weekly|month|m|monthly|year|y|yearly|annual)\b)?/gi, ' ')
    .replace(/📖/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STORY DIGEST — compression of a time window before it reaches the AI
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal log shape the digest needs. Matches the Log model fields. */
export interface DigestLog {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

/** Valence of each EmotionalState, -2 (low) … +2 (high). */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2,
  hopeful: 1, content: 1, peaceful: 1, calm: 1,
  uncertain: -1, tired: -1, restless: -1,
  anxious: -2, overwhelmed: -2, exhausted: -2,
}

export interface StoryPeak {
  date: string        // YYYY-MM-DD
  mood: string
  valence: number
  city?: string
  note?: string
}

export interface StoryDigest {
  scope: StoryScope
  since: string
  until: string
  entryCount: number
  activeDays: number
  spanDays: number
  moods: { state: string; count: number }[]
  avgValence: number | null
  high: StoryPeak | null
  low: StoryPeak | null
  cities: string[]
  tempRangeC: [number, number] | null
  weather: string[]
  moonPhases: string[]
  selfCare: string[]
  samples: string[]
}

const ENTRY_EVENTS = new Set(['note', 'log_entry', 'journal'])
const SELF_CARE_EVENTS = new Set(['answer', 'self_care', 'memory_answer', 'self_care_checkin', 'energy_checkin'])

const ts = (d: Date | string) => (d instanceof Date ? d.getTime() : new Date(d).getTime())
const ymd = (d: Date | string) => new Date(ts(d)).toISOString().slice(0, 10)

function topN(values: string[], n: number): string[] {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) || 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k)
}

/**
 * Evenly samples up to `n` items across the array so a month/year window
 * is represented end-to-end instead of only by its latest entries.
 */
export function spreadSample<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items.slice()
  const out: T[] = []
  const step = (items.length - 1) / (n - 1)
  for (let i = 0; i < n; i++) out.push(items[Math.round(i * step)])
  return out
}

/**
 * Compresses every log inside the scope window into a fixed-size digest.
 * Output size is bounded regardless of window length (≤ 8 samples,
 * ≤ 6 moods, ≤ 5 cities, ≤ 5 self-care notes), so the AI prompt stays
 * small for a year as for a day.
 */
export function buildStoryDigest(
  logs: DigestLog[],
  scope: StoryScope,
  now: Date = new Date()
): StoryDigest {
  const until = now.getTime()
  const since = until - STORY_SCOPE_MS[scope]
  const inWindow = logs
    .filter(l => { const t = ts(l.createdAt); return t >= since && t <= until })
    .sort((a, b) => ts(a.createdAt) - ts(b.createdAt))

  const entries = inWindow.filter(l => ENTRY_EVENTS.has(l.event) && (l.text || '').trim())
  const moodLogs = inWindow.filter(l => l.event === 'emotional_checkin' && l.metadata?.emotionalState)
  const careLogs = inWindow.filter(l => SELF_CARE_EVENTS.has(l.event))

  const days = new Set(inWindow.map(l => ymd(l.createdAt)))

  // Moods + peaks
  const moodCounts = new Map<string, number>()
  let valSum = 0
  let valN = 0
  let high: StoryPeak | null = null
  let low: StoryPeak | null = null
  for (const l of moodLogs) {
    const mood = String(l.metadata!.emotionalState).toLowerCase()
    moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1)
    const v = MOOD_VALENCE[mood]
    if (v === undefined) continue
    valSum += v
    valN++
    const peak: StoryPeak = {
      date: ymd(l.createdAt), mood, valence: v,
      city: l.context?.city || undefined,
      note: l.metadata?.note ? String(l.metadata.note).slice(0, 120) : undefined,
    }
    // Latest wins on ties: the most recent peak is the most relevant one.
    if (!high || v >= high.valence) high = peak
    if (!low || v <= low.valence) low = peak
  }
  if (high && high.valence <= 0) high = null
  if (low && low.valence >= 0) low = null

  // Environment context
  const temps = inWindow
    .map(l => l.context?.temperature)
    .filter((t): t is number => typeof t === 'number' && isFinite(t))
    .map(k => Math.round(k - 273.15))

  const selfCare = careLogs.map(l => {
    const q = String(l.metadata?.question || '')
    const a = String(l.metadata?.option || l.metadata?.answer || '')
    if (q && a) return `${q.slice(0, 80)}: ${a.slice(0, 60)}`
    return String(l.text || '').replace(/\s+/g, ' ').slice(0, 100)
  }).filter(Boolean)

  return {
    scope,
    since: new Date(since).toISOString(),
    until: new Date(until).toISOString(),
    entryCount: entries.length,
    activeDays: days.size,
    spanDays: Math.round(STORY_SCOPE_MS[scope] / 86400000),
    moods: [...moodCounts.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([state, count]) => ({ state, count })),
    avgValence: valN ? Math.round((valSum / valN) * 100) / 100 : null,
    high,
    low,
    cities: topN(inWindow.map(l => l.context?.city || ''), 5),
    tempRangeC: temps.length ? [Math.min(...temps), Math.max(...temps)] : null,
    weather: topN(inWindow.map(l => String(l.context?.weatherDescription || '').toLowerCase()), 3),
    moonPhases: topN(inWindow.map(l => l.context?.astroMoonPhase || ''), 2),
    selfCare: spreadSample(selfCare, 5),
    samples: spreadSample(entries, 8).map(l => {
      const city = l.context?.city ? ` · ${l.context.city}` : ''
      return `[${ymd(l.createdAt)}${city}] ${String(l.text).replace(/\s+/g, ' ').slice(0, 200)}`
    }),
  }
}

/** Renders a digest as the DATA block of the story prompt. */
export function formatDigestForPrompt(d: StoryDigest): string {
  const peak = (p: StoryPeak | null) =>
    p ? `${p.date} — ${p.mood.toUpperCase()}${p.city ? ' in ' + p.city : ''}${p.note ? ` ("${p.note}")` : ''}` : 'none detected'
  return [
    `WINDOW: ${d.scope.toUpperCase()} (${d.since.slice(0, 10)} → ${d.until.slice(0, 10)}, ${d.spanDays}d)`,
    `ACTIVITY: ${d.entryCount} journal entries across ${d.activeDays} active days`,
    `MOODS: ${d.moods.map(m => `${m.state} ×${m.count}`).join(', ') || 'NO DATA'}`,
    `AVERAGE VALENCE: ${d.avgValence ?? 'n/a'} (scale -2 … +2)`,
    `HIGH PEAK: ${peak(d.high)}`,
    `LOW PEAK: ${peak(d.low)}`,
    `PLACES: ${d.cities.join(', ') || 'unknown'}`,
    `ENVIRONMENT: ${d.tempRangeC ? `${d.tempRangeC[0]}°C to ${d.tempRangeC[1]}°C` : 'temp n/a'}; ${d.weather.join(', ') || 'weather n/a'}${d.moonPhases.length ? `; moon ${d.moonPhases.join(', ')}` : ''}`,
    '',
    'SELF-CARE:',
    ...(d.selfCare.length ? d.selfCare.map(s => `- ${s}`) : ['- (none)']),
    '',
    'JOURNAL SAMPLES (chronological, spread across window):',
    ...(d.samples.length ? d.samples.map(s => `- ${s}`) : ['- (none)']),
  ].join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ARCADE EVOLUTION — /level
// ─────────────────────────────────────────────────────────────────────────────
//
// Self-care first: XP rewards *showing up*, never volume. One journal day
// counts once no matter how many entries; streaks give a capped bonus; a
// missed day never subtracts XP (no punishment loops).

export interface ArcadeRank {
  level: number
  title: string
}

export const ARCADE_RANKS: { minXp: number; title: string }[] = [
  { minXp: 0,     title: 'INITIATE' },
  { minXp: 50,    title: 'OBSERVER' },
  { minXp: 150,   title: 'RECORDER' },
  { minXp: 350,   title: 'PATHFINDER' },
  { minXp: 700,   title: 'CARTOGRAPHER' },
  { minXp: 1200,  title: 'NAVIGATOR' },
  { minXp: 2000,  title: 'ARCHIVIST' },
  { minXp: 3200,  title: 'SENTINEL' },
  { minXp: 5000,  title: 'ORACLE' },
  { minXp: 8000,  title: 'LAYER-OF-TIME' },
]

export interface ArcadeState {
  xp: number
  level: number
  title: string
  nextTitle: string | null
  xpIntoLevel: number
  xpForNext: number | null
  activeDays: number
  currentStreak: number
  longestStreak: number
}

export const XP_PER_DAY = 10
export const XP_STREAK_BONUS = 2   // per consecutive day beyond the first
export const XP_STREAK_CAP = 10    // max bonus per day

function localDay(d: Date | string, tzOffsetMin: number): number {
  return Math.floor((ts(d) - tzOffsetMin * 60000) / 86400000)
}

/**
 * @param dates        timestamps of journal entries (any order)
 * @param now          reference time
 * @param tzOffsetMin  Date#getTimezoneOffset() of the operator (default 0 / UTC)
 */
export function computeArcadeState(
  dates: (Date | string)[],
  now: Date = new Date(),
  tzOffsetMin = 0
): ArcadeState {
  const dayNums = [...new Set(dates.map(d => localDay(d, tzOffsetMin)))].sort((a, b) => a - b)

  let xp = 0
  let run = 0
  let longest = 0
  let prev: number | null = null
  for (const day of dayNums) {
    run = prev !== null && day === prev + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    xp += XP_PER_DAY + Math.min((run - 1) * XP_STREAK_BONUS, XP_STREAK_CAP)
    prev = day
  }

  // Current streak is alive if the last entry was today or yesterday.
  const today = localDay(now, tzOffsetMin)
  const current = prev !== null && today - prev <= 1 ? run : 0

  let idx = 0
  for (let i = 0; i < ARCADE_RANKS.length; i++) if (xp >= ARCADE_RANKS[i].minXp) idx = i
  const next = ARCADE_RANKS[idx + 1] || null

  return {
    xp,
    level: idx + 1,
    title: ARCADE_RANKS[idx].title,
    nextTitle: next ? next.title : null,
    xpIntoLevel: xp - ARCADE_RANKS[idx].minXp,
    xpForNext: next ? next.minXp - ARCADE_RANKS[idx].minXp : null,
    activeDays: dayNums.length,
    currentStreak: current,
    longestStreak: longest,
  }
}

/** Terminal-style lines for the /level block. */
export function formatArcadeLines(s: ArcadeState): string[] {
  const bar = (() => {
    if (s.xpForNext === null) return '■■■■■■■■■■ MAX'
    const filled = Math.max(0, Math.min(10, Math.floor((s.xpIntoLevel / s.xpForNext) * 10)))
    return '■'.repeat(filled) + '□'.repeat(10 - filled)
  })()
  return [
    `RANK            LV ${s.level} · ${s.title}`,
    `XP              ${s.xp}`,
    `PROGRESS        ${bar}${s.xpForNext !== null ? ` ${s.xpIntoLevel}/${s.xpForNext}` : ''}`,
    s.nextTitle ? `NEXT            ${s.nextTitle}` : 'NEXT            —',
    `STREAK          ${s.currentStreak}D (BEST ${s.longestStreak}D)`,
    `ACTIVE DAYS     ${s.activeDays}`,
    'RULE            SHOW UP · ONE DAY = ONE CREDIT · NO PENALTIES',
  ]
}
