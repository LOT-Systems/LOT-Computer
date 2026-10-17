/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOG COMMAND REGISTRY — single source of truth for Log slash commands.
 *
 * Pure (no DOM, no stores, no I/O) so the client (/system help, unknown-command
 * hints) and the server (story scope validation) share one definition.
 * Trigger *detection* lives in client/utils/logTriggers.ts; this module owns
 * the human-facing metadata: category, usage, description, aliases.
 *
 * Doctrine: the Log is a passive AI surface. Commands are optional — the user
 * is never required to type one. Every entry, command or not, is stored with
 * its context snapshot.
 */

export type LogCommandCategory = 'MEMORY' | 'INTEL' | 'BODY' | 'ENV' | 'SYSTEM'

export interface LogCommand {
  /** canonical name, lower-case, no slash */
  name: string
  aliases: string[]
  /** optional argument hint, e.g. "[day|week|month|year]" */
  args?: string
  description: string
  category: LogCommandCategory
}

export const LOG_COMMANDS: LogCommand[] = [
  { name: 'story', aliases: [], args: '[day|week|month|year]', category: 'MEMORY',
    description: 'Compressed story of your day, week, month or year' },
  { name: 'prayer', aliases: ['candle'], category: 'MEMORY',
    description: 'Generate contextual scripture' },
  { name: 'how', aliases: [], category: 'MEMORY',
    description: 'Open LOT AI check-in (System tab)' },
  { name: 'qi', aliases: [], args: '[query]', category: 'INTEL',
    description: 'Ask the Quantum Intelligence engine' },
  { name: 'scan', aliases: ['ai'], category: 'INTEL',
    description: 'System status overview' },
  { name: 'assembly', aliases: ['assemble'], category: 'INTEL',
    description: 'Self-assembly module status' },
  { name: 'qos', aliases: ['os-report'], category: 'INTEL',
    description: 'Quantum OS state analysis' },
  { name: 'phys', aliases: ['cohort-report'], category: 'BODY',
    description: 'Physiological cohort report' },
  { name: 'fast', aliases: [], category: 'BODY',
    description: 'Orthodox fasting calendar' },
  { name: 'breathe', aliases: ['breath'], category: 'BODY',
    description: '4-2-6 breathing exercise' },
  { name: 'freeze', aliases: ['pause'], category: 'BODY',
    description: 'Pause and reflect protocol' },
  { name: 'silent', aliases: ['quiet'], category: 'BODY',
    description: 'Signal silence check' },
  { name: 'sil', aliases: ['silence-check'], category: 'BODY',
    description: 'Signal silence pattern check' },
  { name: 'synth', aliases: ['keyboard'], category: 'ENV',
    description: 'Toggle keyboard sound' },
  { name: 'radio', aliases: [], category: 'ENV',
    description: 'Toggle radio' },
  { name: 'night', aliases: [], category: 'ENV',
    description: 'Dark mode' },
  { name: 'system', aliases: ['commands'], args: '[filter]', category: 'SYSTEM',
    description: 'This help screen' },
]

const CATEGORY_ORDER: LogCommandCategory[] = ['MEMORY', 'INTEL', 'BODY', 'ENV', 'SYSTEM']

/** Shortcuts shown at the foot of /system. */
export const LOG_SHORTCUTS: Array<[string, string]> = [
  ['Ctrl+Enter', 'Save log immediately'],
  ['🎹 🎧 🌙 🕯️ 🧊 📖', 'Emoji shortcuts for synth, radio, night, prayer, freeze, story'],
]

export function findLogCommand(token: string): LogCommand | null {
  const t = token.toLowerCase().replace(/^\//, '')
  return LOG_COMMANDS.find(c => c.name === t || c.aliases.includes(t)) ?? null
}

/**
 * /system output. Lines starting with "/" are rendered as command rows
 * (command, 2+ spaces, description); other lines are section headers.
 * With a `filter`, only commands whose name, alias, category or description
 * contain it are listed.
 */
export function buildSystemHelp(filter = ''): string {
  const f = filter.trim().toLowerCase().replace(/^\//, '')
  const match = (c: LogCommand) =>
    !f ||
    c.name.includes(f) ||
    c.aliases.some(a => a.includes(f)) ||
    c.category.toLowerCase().includes(f) ||
    c.description.toLowerCase().includes(f)

  const lines: string[] = [f ? `COMMANDS MATCHING "${f.toUpperCase()}"` : 'AVAILABLE COMMANDS']
  let shown = 0
  for (const cat of CATEGORY_ORDER) {
    const group = LOG_COMMANDS.filter(c => c.category === cat && match(c))
    if (!group.length) continue
    lines.push('', cat)
    for (const c of group) {
      const usage = `/${c.name}${c.args ? ' ' + c.args : ''}`
      // pad so the renderer's 2+-space split always finds the boundary
      lines.push(`${usage}${usage.length < 22 ? ' '.repeat(22 - usage.length) : '  '}${c.description}`)
      shown++
    }
  }
  if (!shown) {
    lines.push('', 'NO MATCH. TYPE /system FOR THE FULL LIST.')
    return lines.join('\n')
  }
  if (!f) {
    lines.push('', 'SHORTCUTS')
    for (const [k, v] of LOG_SHORTCUTS) lines.push(`${k}${' '.repeat(Math.max(2, 22 - k.length))}${v}`)
  }
  return lines.join('\n')
}

/** Levenshtein distance — tiny, for "did you mean" on mistyped commands. */
function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[a.length][b.length]
}

/** Closest known command within edit distance 2, or null. */
export function suggestLogCommand(token: string): string | null {
  const t = token.toLowerCase().replace(/^\//, '')
  if (!t || findLogCommand(t)) return null
  let best: { name: string; d: number } | null = null
  for (const c of LOG_COMMANDS) {
    for (const n of [c.name, ...c.aliases]) {
      const d = distance(t, n)
      if (d <= 2 && (!best || d < best.d)) best = { name: c.name, d }
    }
  }
  return best ? best.name : null
}

/**
 * Extract the slash tokens a user typed. A token is "/word" at the start of the
 * text or after whitespace — URLs and paths ("a/b", "http://x") never match.
 */
export function extractSlashTokens(text: string): string[] {
  const out: string[] = []
  const re = /(^|\s)\/([a-z][a-z0-9_-]*)(?=\s|$|[^a-z0-9_-])/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out.push(m[2].toLowerCase())
  return out
}

// ---------------------------------------------------------------------------
// /story scope
// ---------------------------------------------------------------------------

export type StoryScope = 'day' | 'week' | 'month' | 'year'
export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_SCOPE: StoryScope = 'week'

const SCOPE_WORDS: Record<string, StoryScope> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year', annual: 'year',
}

export function isStoryScope(v: unknown): v is StoryScope {
  return typeof v === 'string' && (STORY_SCOPES as string[]).includes(v)
}

/** "/story month" → 'month'. "/story" or "/story banana" → default (week). */
export function parseStoryScope(text: string): StoryScope {
  const m = /(?:^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  return (m && SCOPE_WORDS[m[1].toLowerCase()]) || DEFAULT_STORY_SCOPE
}

/** "/system radio" → "radio". Returns '' when no argument. */
export function parseSystemFilter(text: string): string {
  const m = /(?:^|\s)\/(?:system|commands)\s+([a-z0-9_-]+)/i.exec(text || '')
  return m ? m[1] : ''
}

// ---------------------------------------------------------------------------
// ARCADE — evolution rank (self-care gamification)
// ---------------------------------------------------------------------------

export const ARCADE_RANKS = [
  { min: 0,   title: 'RECRUIT' },
  { min: 5,   title: 'OPERATOR' },
  { min: 20,  title: 'SPECIALIST' },
  { min: 50,  title: 'VETERAN' },
  { min: 120, title: 'ARCHITECT' },
  { min: 300, title: 'MASTER' },
] as const

/** Rank from earned-badge count. Returns title, level (1-based) and badges to next rank. */
export function arcadeRank(badgeCount: number): { title: string; level: number; toNext: number | null } {
  const n = Math.max(0, Math.floor(badgeCount) || 0)
  let idx = 0
  ARCADE_RANKS.forEach((r, i) => { if (n >= r.min) idx = i })
  const next = ARCADE_RANKS[idx + 1]
  return { title: ARCADE_RANKS[idx].title, level: idx + 1, toNext: next ? next.min - n : null }
}
