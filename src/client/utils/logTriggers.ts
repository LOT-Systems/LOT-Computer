/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log-text triggers
 *
 * Pure detectors for secret codes, keywords and emojis that the user
 * can sneak into a log entry to toggle System modes. Keeping this
 * module pure (no stores, no DOM) so tests and non-Log surfaces can
 * reuse it. Wiring into the actual stores happens at the call site.
 *
 * Design rules:
 *  - Detectors are case-insensitive for keywords, exact for emojis.
 *  - Each detector must be idempotent — returning `true` does not
 *    mean the trigger fires twice if the user edits around it; the
 *    call site is responsible for debouncing via "last seen" refs.
 *  - Triggers are additive: a single log can contain several.
 */

export type LogTrigger =
  | 'toggle-synth'      // 🎹  or  /synth
  | 'ai-scan'           // /scan
  | 'silent-mode'       // /silent
  | 'breathe'           // /breathe
  | 'force-fast'        // /fast
  | 'radio-toggle'      // 🎧  or  /radio
  | 'night-mode'        // 🌙  or  /night
  | 'prayer-mode'       // 🕯️  or  /prayer
  | 'freeze-widgets'    // 🧊  or  /freeze
  | 'cohort-support'    // ❗  (heavy exclamation, distinct from regular '!')
  | 'qos-report'        // /qos — surface Quantum OS state in current log session
  | 'assembly-check'    // /assembly — trigger self-assembly module status check
  | 'phys-report'       // /phys — generate physiological cohort report
  | 'sil-check'         // /sil — check for signal silence pattern
  | 'qi-rfi'            // /qi — Quantum Intelligence RFI (Request for Information)
  | 'system-help'       // /system — list all available slash commands
  | 'story-mode'        // /story — generate contextual story from recent data
  | 'how-checkin'       // /how — open LOT AI check-in (navigates to System tab)

interface TriggerRule {
  trigger: LogTrigger
  emojis: string[]
  keywords: string[] // lower-case slash commands (without leading slash)
}

const RULES: TriggerRule[] = [
  { trigger: 'toggle-synth',   emojis: ['🎹'],    keywords: ['synth', 'keyboard'] },
  { trigger: 'ai-scan',        emojis: [],       keywords: ['scan', 'ai'] },
  { trigger: 'silent-mode',    emojis: [],       keywords: ['silent', 'quiet'] },
  { trigger: 'breathe',        emojis: [],       keywords: ['breathe', 'breath'] },
  { trigger: 'force-fast',     emojis: [],       keywords: ['fast'] },
  { trigger: 'radio-toggle',   emojis: ['🎧'],    keywords: ['radio'] },
  { trigger: 'night-mode',     emojis: ['🌙'],    keywords: ['night'] },
  { trigger: 'prayer-mode',    emojis: ['🕯️', '🕯'], keywords: ['prayer', 'candle'] },
  { trigger: 'freeze-widgets', emojis: ['🧊'],    keywords: ['freeze', 'pause'] },
  { trigger: 'cohort-support', emojis: ['❗', '‼️', '‼'], keywords: [] },
  { trigger: 'qos-report',     emojis: [],        keywords: ['qos', 'os-report'] },
  { trigger: 'assembly-check', emojis: [],        keywords: ['assembly', 'assemble'] },
  { trigger: 'phys-report',    emojis: [],        keywords: ['phys', 'cohort-report'] },
  { trigger: 'sil-check',      emojis: [],        keywords: ['sil', 'silence-check'] },
  { trigger: 'qi-rfi',         emojis: [],        keywords: ['qi'] },
  { trigger: 'system-help',    emojis: [],        keywords: ['system', 'commands'] },
  { trigger: 'story-mode',     emojis: ['📖'],    keywords: ['story'] },
  { trigger: 'how-checkin',    emojis: [],        keywords: ['how'] },
]

/**
 * Returns every trigger present in `text`. An empty array means the
 * text is ordinary. Order reflects the order of `RULES`, not the
 * text — call sites that need "first occurrence" can scan manually.
 */
export function detectTriggers(text: string): LogTrigger[] {
  if (!text) return []
  const hits: LogTrigger[] = []
  const lower = text.toLowerCase()

  for (const rule of RULES) {
    // Emoji check — literal includes, no boundary. Emojis are already
    // atomic enough that a substring match is the correct behavior.
    const hasEmoji = rule.emojis.some(e => text.includes(e))

    // Keyword check — match "/word" as a whole token (followed by
    // end-of-string, whitespace, or non-word). This prevents "/scandalous"
    // from firing the /scan trigger.
    const hasKeyword = rule.keywords.some(k => {
      const re = new RegExp(`(^|\\s)\\/${k}(\\s|$|[^a-z0-9_])`, 'i')
      return re.test(lower)
    })

    if (hasEmoji || hasKeyword) hits.push(rule.trigger)
  }

  return hits
}

/**
 * Returns the *new* triggers that appeared in `text` compared to
 * `previousText`. The call site passes the prior value from a ref so
 * we only act on deltas — editing around an existing 🎹 will not
 * re-fire the toggle. This is the recommended entry point for the
 * NoteEditor effect.
 */
export function detectNewTriggers(
  text: string,
  previousText: string
): LogTrigger[] {
  const current = new Set(detectTriggers(text))
  const prior = new Set(detectTriggers(previousText))
  const fresh: LogTrigger[] = []
  current.forEach(t => { if (!prior.has(t)) fresh.push(t) })
  return fresh
}

// ---------------------------------------------------------------------------
// Command catalog — single source of truth for /system
// ---------------------------------------------------------------------------

export interface LogCommand {
  command: string // as typed, e.g. '/story [day|week|month|year]'
  description: string
  category: 'MEMORY' | 'STATE' | 'RITUAL' | 'SYSTEM'
  trigger: LogTrigger
}

export const LOG_COMMANDS: LogCommand[] = [
  { command: '/story [day|week|month|year]', description: 'Compressed story of your window (default: week)', category: 'MEMORY', trigger: 'story-mode' },
  { command: '/qi [query]',   description: 'Ask the Quantum Intelligence engine', category: 'MEMORY', trigger: 'qi-rfi' },
  { command: '/how',          description: 'Open LOT AI check-in (System tab)',   category: 'MEMORY', trigger: 'how-checkin' },
  { command: '/scan',         description: 'System status overview',              category: 'STATE',  trigger: 'ai-scan' },
  { command: '/qos',          description: 'Quantum OS state analysis',           category: 'STATE',  trigger: 'qos-report' },
  { command: '/phys',         description: 'Physiological cohort report',         category: 'STATE',  trigger: 'phys-report' },
  { command: '/assembly',     description: 'Self-assembly module status',         category: 'STATE',  trigger: 'assembly-check' },
  { command: '/silent',       description: 'Signal silence check',                category: 'STATE',  trigger: 'silent-mode' },
  { command: '/prayer',       description: 'Generate contextual scripture',       category: 'RITUAL', trigger: 'prayer-mode' },
  { command: '/breathe',      description: '4-2-6 breathing exercise',            category: 'RITUAL', trigger: 'breathe' },
  { command: '/freeze',       description: 'Pause and reflect protocol',          category: 'RITUAL', trigger: 'freeze-widgets' },
  { command: '/fast',         description: 'Orthodox fasting calendar',           category: 'RITUAL', trigger: 'force-fast' },
  { command: '/synth',        description: 'Toggle keyboard sound',               category: 'SYSTEM', trigger: 'toggle-synth' },
  { command: '/radio',        description: 'Toggle radio',                        category: 'SYSTEM', trigger: 'radio-toggle' },
  { command: '/night',        description: 'Dark mode',                           category: 'SYSTEM', trigger: 'night-mode' },
  { command: '/system',       description: 'This help screen',                    category: 'SYSTEM', trigger: 'system-help' },
]

const CATEGORY_ORDER: LogCommand['category'][] = ['MEMORY', 'STATE', 'RITUAL', 'SYSTEM']

/**
 * Text for the /system panel. Lines starting with '/' are rendered as
 * command rows (command, 2+ spaces, description); other non-empty lines
 * are section headers — the format Logs.tsx already renders.
 */
export function buildSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const cat of CATEGORY_ORDER) {
    lines.push('', cat)
    for (const c of LOG_COMMANDS.filter(x => x.category === cat)) {
      lines.push(`${c.command}  ${c.description}`)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

/** Period argument of `/story [period]`; 'week' when absent or unknown. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story\s+(day|today|week|month|year)\b/i.exec(text || '')
  if (!m) return 'week'
  const p = m[2].toLowerCase()
  return (p === 'today' ? 'day' : p) as StoryPeriod
}

/** Log text with the /story command (and optional period) removed. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/\/story(\s+(day|today|week|month|year)\b)?/i, '')
    .replace(/📖/g, '')
    .trim()
}
