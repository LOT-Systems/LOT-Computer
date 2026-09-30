/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log slash-command registry — single source of truth.
 *
 * `/system` output, unknown-command hints and `/story` period parsing are all
 * derived from this table, so the help screen can never drift from what the
 * trigger detector (client/utils/logTriggers.ts) actually accepts.
 * Pure and dependency-free.
 */

export type CommandCategory = 'AI' | 'STATE' | 'RITUAL' | 'INTERFACE' | 'SYSTEM'

export interface LogCommand {
  /** Canonical name, without the leading slash. */
  name: string
  /** Alternate names accepted by the detector. */
  aliases: string[]
  category: CommandCategory
  /** Optional argument hint shown in /system, e.g. "[day|week|month|year]". */
  args?: string
  description: string
}

export const LOG_COMMANDS: LogCommand[] = [
  { name: 'story', aliases: [], category: 'AI', args: '[day|week|month|year]', description: 'Compressed story of your day, week, month or year' },
  { name: 'rank', aliases: ['level', 'xp'], category: 'AI', description: 'Arcade evolution: rank, level, XP and streak' },
  { name: 'qi', aliases: [], category: 'AI', args: '[query]', description: 'Ask the Quantum Intelligence engine' },
  { name: 'prayer', aliases: ['candle'], category: 'RITUAL', description: 'Generate contextual scripture' },
  { name: 'breathe', aliases: ['breath'], category: 'RITUAL', description: '4-2-6 breathing exercise' },
  { name: 'freeze', aliases: ['pause'], category: 'RITUAL', description: 'Pause and reflect protocol' },
  { name: 'fast', aliases: [], category: 'RITUAL', description: 'Orthodox fasting calendar' },
  { name: 'scan', aliases: ['ai'], category: 'STATE', description: 'System status overview' },
  { name: 'qos', aliases: ['os-report'], category: 'STATE', description: 'Quantum OS state analysis' },
  { name: 'phys', aliases: ['cohort-report'], category: 'STATE', description: 'Physiological cohort report' },
  { name: 'sil', aliases: ['silence-check'], category: 'STATE', description: 'Signal silence pattern check' },
  { name: 'assembly', aliases: ['assemble'], category: 'STATE', description: 'Self-assembly module status' },
  { name: 'silent', aliases: ['quiet'], category: 'INTERFACE', description: 'Signal silence check' },
  { name: 'synth', aliases: ['keyboard'], category: 'INTERFACE', description: 'Toggle keyboard sound' },
  { name: 'radio', aliases: [], category: 'INTERFACE', description: 'Toggle radio' },
  { name: 'night', aliases: [], category: 'INTERFACE', description: 'Dark mode' },
  { name: 'how', aliases: [], category: 'SYSTEM', description: 'Open LOT AI check-in (System tab)' },
  { name: 'system', aliases: ['commands'], category: 'SYSTEM', description: 'This help screen' },
]

const CATEGORY_ORDER: CommandCategory[] = ['AI', 'STATE', 'RITUAL', 'INTERFACE', 'SYSTEM']

/** Every accepted word (canonical + aliases), lower-case, no slash. */
export function allCommandWords(): string[] {
  return LOG_COMMANDS.flatMap(c => [c.name, ...c.aliases])
}

/**
 * `/system` screen. Lines starting with "/" are rendered as command rows by
 * the Log component (command column, two-space gap, description); other
 * non-empty lines are rendered as section headers.
 */
export function renderSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.category === cat)
    if (!cmds.length) continue
    lines.push('', cat)
    for (const c of cmds) {
      const head = `/${c.name}${c.args ? ' ' + c.args : ''}`
      lines.push(`${head}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

/** Levenshtein distance (small strings only). */
function distance(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

/**
 * Closest known command for a mistyped word ("/stroy" → "story"), or null
 * when nothing is within edit distance 2. Exact matches return null — the
 * word is already valid.
 */
export function suggestCommand(word: string): string | null {
  const w = word.toLowerCase().replace(/^\//, '')
  if (!w) return null
  const words = allCommandWords()
  if (words.includes(w)) return null
  let best: { name: string; d: number } | null = null
  for (const c of LOG_COMMANDS) {
    for (const cand of [c.name, ...c.aliases]) {
      const d = distance(w, cand)
      if (d <= 2 && (!best || d < best.d)) best = { name: c.name, d }
    }
  }
  return best ? best.name : null
}

/**
 * Finds a whole-token `/word` that is NOT a known command, for hints.
 * Ignores paths like "a/b" and URLs (slash must start a token).
 */
export function findUnknownCommand(text: string): string | null {
  const known = new Set(allCommandWords())
  const re = /(^|\s)\/([a-z][a-z0-9-]{1,19})(?=\s|$|[^a-z0-9_-])/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const w = m[2].toLowerCase()
    if (!known.has(w)) return w
  }
  return null
}

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

const PERIOD_WORDS: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year',
}

/**
 * Parses `/story [period]` from free text. Defaults to "week" — long enough
 * to show a pattern, short enough to stay personal.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story(?:\s+([a-z]+))?/i.exec(text || '')
  const word = m?.[2]?.toLowerCase()
  return (word && PERIOD_WORDS[word]) || 'week'
}

/** Removes the `/story [period]` token (and the 📖 marker) from entry text. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(?:\s+(?:day|today|daily|week|weekly|month|monthly|year|yearly))?/i, '$1')
    .replace(/📖/g, '')
    .trim()
}
