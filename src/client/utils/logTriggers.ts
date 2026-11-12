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
  | 'arcade-level'      // /level · /xp · /arcade — operator arcade evolution

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
  { trigger: 'arcade-level',   emojis: [],        keywords: ['level', 'xp', 'arcade'] },
]

/**
 * COMMAND REGISTRY — single source of truth for `/system`.
 * Every slash command the Log understands is listed here, grouped by
 * function. `/system` renders this table verbatim, so adding a command
 * to RULES without adding it here is a documentation defect.
 */
export interface CommandSpec {
  usage: string
  description: string
  trigger: LogTrigger
}

export const COMMAND_GROUPS: Array<{ group: string; commands: CommandSpec[] }> = [
  {
    group: 'NARRATIVE',
    commands: [
      { usage: '/story', description: 'Compressed story of your week', trigger: 'story-mode' },
      { usage: '/story day', description: 'Compress the last 24 hours', trigger: 'story-mode' },
      { usage: '/story month', description: 'Compress the last 30 days', trigger: 'story-mode' },
      { usage: '/story year', description: 'Compress the last 365 days', trigger: 'story-mode' },
      { usage: '/level', description: 'Arcade rank, XP and progress (/xp, /arcade)', trigger: 'arcade-level' },
    ],
  },
  {
    group: 'INTELLIGENCE',
    commands: [
      { usage: '/qi [query]', description: 'Ask the Quantum Intelligence engine', trigger: 'qi-rfi' },
      { usage: '/scan', description: 'System status overview', trigger: 'ai-scan' },
      { usage: '/qos', description: 'Quantum OS state analysis', trigger: 'qos-report' },
      { usage: '/phys', description: 'Physiological cohort report', trigger: 'phys-report' },
      { usage: '/assembly', description: 'Self-assembly module status', trigger: 'assembly-check' },
      { usage: '/how', description: 'Open LOT AI check-in (System tab)', trigger: 'how-checkin' },
    ],
  },
  {
    group: 'SELF-CARE',
    commands: [
      { usage: '/breathe', description: '4-2-6 breathing exercise', trigger: 'breathe' },
      { usage: '/freeze', description: 'Pause and reflect protocol', trigger: 'freeze-widgets' },
      { usage: '/silent', description: 'Signal silence check', trigger: 'silent-mode' },
      { usage: '/prayer', description: 'Generate contextual scripture', trigger: 'prayer-mode' },
      { usage: '/fast', description: 'Orthodox fasting calendar', trigger: 'force-fast' },
    ],
  },
  {
    group: 'ENVIRONMENT',
    commands: [
      { usage: '/synth', description: 'Toggle keyboard sound', trigger: 'toggle-synth' },
      { usage: '/radio', description: 'Toggle radio', trigger: 'radio-toggle' },
      { usage: '/night', description: 'Dark mode', trigger: 'night-mode' },
      { usage: '/system', description: 'This command index', trigger: 'system-help' },
    ],
  },
]

/** Plain-text `/system` screen, parsed by the Log renderer. */
export function buildSystemHelp(): string {
  const lines: string[] = []
  for (const g of COMMAND_GROUPS) {
    if (lines.length) lines.push('')
    lines.push(g.group)
    for (const c of g.commands) lines.push(`${c.usage.padEnd(14, ' ')}${c.description}`)
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

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
