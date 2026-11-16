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
  { trigger: 'silent-mode',    emojis: [],       keywords: ['silent', 'quiet', 'sil', 'silence-check'] },
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
  // sil-check had no handler; /sil and /silence-check now route to silent-mode
  { trigger: 'sil-check',      emojis: [],        keywords: [] },
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

// ── Command registry (single source of truth for /system) ─────────────────

export type LogCommandGroup = 'NARRATIVE' | 'CONTEXT' | 'SELF-CARE' | 'MODES'

export interface LogCommand {
  command: string      // as displayed, e.g. "/story [scope]"
  trigger: LogTrigger
  group: LogCommandGroup
  description: string
}

/**
 * Every slash command the Log understands, grouped for /system.
 * `detectTriggers` is driven by RULES above; a unit check
 * (`missingFromRegistry`) guarantees every trigger with a keyword
 * appears here, so the help screen can never silently drift.
 */
export const LOG_COMMANDS: LogCommand[] = [
  { command: '/story [scope]', trigger: 'story-mode', group: 'NARRATIVE', description: 'Compressed story · scope: day | week | month | year (default week)' },
  { command: '/qi [query]', trigger: 'qi-rfi', group: 'NARRATIVE', description: 'Ask the Quantum Intelligence engine' },
  { command: '/prayer', trigger: 'prayer-mode', group: 'NARRATIVE', description: 'Contextual scripture' },
  { command: '/how', trigger: 'how-checkin', group: 'NARRATIVE', description: 'LOT AI check-in (System tab)' },
  { command: '/scan', trigger: 'ai-scan', group: 'CONTEXT', description: 'System status overview' },
  { command: '/qos', trigger: 'qos-report', group: 'CONTEXT', description: 'Quantum OS state analysis' },
  { command: '/phys', trigger: 'phys-report', group: 'CONTEXT', description: 'Physiological cohort report' },
  { command: '/assembly', trigger: 'assembly-check', group: 'CONTEXT', description: 'Self-assembly module status' },
  { command: '/silent', trigger: 'silent-mode', group: 'CONTEXT', description: 'Signal silence check' },
  { command: '/breathe', trigger: 'breathe', group: 'SELF-CARE', description: '4-2-6 breathing exercise' },
  { command: '/freeze', trigger: 'freeze-widgets', group: 'SELF-CARE', description: 'Pause and reflect protocol' },
  { command: '/fast', trigger: 'force-fast', group: 'SELF-CARE', description: 'Orthodox fasting calendar' },
  { command: '/synth', trigger: 'toggle-synth', group: 'MODES', description: 'Toggle keyboard sound' },
  { command: '/radio', trigger: 'radio-toggle', group: 'MODES', description: 'Toggle radio' },
  { command: '/night', trigger: 'night-mode', group: 'MODES', description: 'Dark mode' },
  { command: '/system', trigger: 'system-help', group: 'MODES', description: 'This help screen' },
]

const GROUP_ORDER: LogCommandGroup[] = ['NARRATIVE', 'CONTEXT', 'SELF-CARE', 'MODES']

/** Triggers reachable by keyword that are not documented in LOG_COMMANDS. */
export function missingFromRegistry(): LogTrigger[] {
  const documented = new Set(LOG_COMMANDS.map(c => c.trigger))
  return RULES.filter(r => r.keywords.length > 0 && !documented.has(r.trigger)).map(r => r.trigger)
}

/**
 * Lines for the SYSTEM: block. Command lines start with "/" and use
 * 2+ spaces between command and description (the Log renderer splits
 * on that gap). Header lines are rendered as small caps labels.
 */
export function renderSystemHelp(): string[] {
  const lines: string[] = []
  for (const group of GROUP_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.group === group)
    if (!cmds.length) continue
    if (lines.length) lines.push('')
    lines.push(group)
    for (const c of cmds) lines.push(`${c.command.padEnd(16, ' ')}  ${c.description}`)
  }
  lines.push('', 'JOURNAL', 'Write freely. Every entry is saved with its moment: time, weather, place, sky.')
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter  Save log immediately')
  return lines
}
