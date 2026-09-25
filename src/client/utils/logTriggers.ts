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
  /**
   * One-line help text for /system. `help: null` means the trigger is
   * intentionally omitted from the printed command list (e.g. a bare
   * punctuation trigger with no `/keyword` form). Every trigger with at
   * least one keyword MUST carry help text — this is enforced by
   * `getCommandHelpLines()` below rather than left to hand-sync.
   */
  help: string | null
}

const RULES: TriggerRule[] = [
  { trigger: 'prayer-mode',    emojis: ['🕯️', '🕯'], keywords: ['prayer', 'candle'], help: 'Generate contextual scripture' },
  { trigger: 'story-mode',     emojis: ['📖'],    keywords: ['story'],              help: 'Generate a personal story from recent data' },
  { trigger: 'ai-scan',        emojis: [],       keywords: ['scan', 'ai'],          help: 'System status overview' },
  { trigger: 'qi-rfi',         emojis: [],        keywords: ['qi'],                 help: 'Ask the Quantum Intelligence engine — /qi [query]' },
  { trigger: 'assembly-check', emojis: [],        keywords: ['assembly', 'assemble'], help: 'Self-assembly module status' },
  { trigger: 'phys-report',    emojis: [],        keywords: ['phys', 'cohort-report'], help: 'Physiological cohort report' },
  { trigger: 'qos-report',     emojis: [],        keywords: ['qos', 'os-report'],   help: 'Quantum OS state analysis' },
  { trigger: 'force-fast',     emojis: [],       keywords: ['fast'],                help: 'Orthodox fasting calendar' },
  { trigger: 'breathe',        emojis: [],       keywords: ['breathe', 'breath'],   help: '4-2-6 breathing exercise' },
  { trigger: 'freeze-widgets', emojis: ['🧊'],    keywords: ['freeze', 'pause'],     help: 'Pause and reflect protocol' },
  { trigger: 'silent-mode',    emojis: [],       keywords: ['silent', 'quiet'],     help: 'Signal silence check' },
  { trigger: 'sil-check',      emojis: [],        keywords: ['sil', 'silence-check'], help: 'Signal silence pattern check' },
  { trigger: 'toggle-synth',   emojis: ['🎹'],    keywords: ['synth', 'keyboard'],   help: 'Toggle keyboard sound' },
  { trigger: 'radio-toggle',   emojis: ['🎧'],    keywords: ['radio'],               help: 'Toggle radio' },
  { trigger: 'night-mode',     emojis: ['🌙'],    keywords: ['night'],               help: 'Dark mode' },
  { trigger: 'how-checkin',    emojis: [],        keywords: ['how'],                help: 'Open LOT AI check-in (System tab)' },
  { trigger: 'system-help',    emojis: [],        keywords: ['system', 'commands'], help: 'This help screen' },
  { trigger: 'cohort-support', emojis: ['❗', '‼️', '‼'], keywords: [],              help: null },
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

/**
 * Renders the /system help screen from RULES — the single source of
 * truth for slash commands. A command added to RULES with `help` set
 * appears here automatically; nothing to hand-sync in Logs.tsx.
 * Triggers with `help: null` (punctuation-only, no `/keyword`) are
 * skipped since they have nothing to type.
 */
export function getCommandHelpLines(): string[] {
  const commandLines = RULES
    .filter(r => r.help !== null && r.keywords.length > 0)
    .map(r => `/${r.keywords[0]}`.padEnd(14) + r.help)

  return [
    'AVAILABLE COMMANDS',
    '',
    ...commandLines,
    '',
    'SHORTCUTS',
    'Ctrl+Enter    Save log immediately',
  ]
}
