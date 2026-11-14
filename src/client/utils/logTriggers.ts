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

// ─────────────────────────────────────────────────────────────────────
// COMMAND REGISTRY — single source of truth for `/system`.
//
// Every user-facing slash command is declared here once. The `/system`
// screen is rendered from this table, so the help text can never drift
// from what the detector actually recognises. A unit check in
// scripts/tests/test-log-commands.ts asserts that every registry
// command resolves to a RULES trigger.
// ─────────────────────────────────────────────────────────────────────

export type CommandGroup = 'NARRATIVE' | 'INTELLIGENCE' | 'SELF-CARE' | 'ENVIRONMENT' | 'SYSTEM'

export interface LogCommand {
  command: string // as typed, without arguments: "/story"
  usage?: string // argument hint: "[day|week|month|year]"
  description: string
  group: CommandGroup
  trigger: LogTrigger
  aliases?: string[]
}

export const COMMAND_GROUP_ORDER: CommandGroup[] = [
  'NARRATIVE', 'INTELLIGENCE', 'SELF-CARE', 'ENVIRONMENT', 'SYSTEM',
]

export const LOG_COMMANDS: LogCommand[] = [
  { command: '/story',    usage: '[day|week|month|year]', description: 'Compressed story of your day, week, month or year — peaks, context, XP', group: 'NARRATIVE', trigger: 'story-mode' },
  { command: '/prayer',   description: 'Contextual scripture for this moment', group: 'NARRATIVE', trigger: 'prayer-mode', aliases: ['/candle'] },
  { command: '/qi',       usage: '[question]', description: 'Ask the Quantum Intelligence engine', group: 'INTELLIGENCE', trigger: 'qi-rfi' },
  { command: '/scan',     description: 'System status overview', group: 'INTELLIGENCE', trigger: 'ai-scan', aliases: ['/ai'] },
  { command: '/qos',      description: 'Quantum OS state analysis', group: 'INTELLIGENCE', trigger: 'qos-report' },
  { command: '/assembly', description: 'Self-assembly module status', group: 'INTELLIGENCE', trigger: 'assembly-check' },
  { command: '/phys',     description: 'Physiological cohort report', group: 'INTELLIGENCE', trigger: 'phys-report' },
  { command: '/how',      description: 'Open LOT AI check-in (System tab)', group: 'SELF-CARE', trigger: 'how-checkin' },
  { command: '/breathe',  description: '4-2-6 breathing exercise', group: 'SELF-CARE', trigger: 'breathe' },
  { command: '/freeze',   description: 'Pause and reflect protocol', group: 'SELF-CARE', trigger: 'freeze-widgets', aliases: ['/pause'] },
  { command: '/silent',   description: 'Signal silence check', group: 'SELF-CARE', trigger: 'silent-mode', aliases: ['/quiet'] },
  { command: '/fast',     description: 'Orthodox fasting calendar', group: 'SELF-CARE', trigger: 'force-fast' },
  { command: '/radio',    description: 'Toggle radio', group: 'ENVIRONMENT', trigger: 'radio-toggle' },
  { command: '/synth',    description: 'Toggle keyboard sound', group: 'ENVIRONMENT', trigger: 'toggle-synth', aliases: ['/keyboard'] },
  { command: '/night',    description: 'Dark mode', group: 'ENVIRONMENT', trigger: 'night-mode' },
  { command: '/system',   description: 'This command index', group: 'SYSTEM', trigger: 'system-help', aliases: ['/commands'] },
]

/** Triggers whose handler reads an argument typed after the command. */
export const DEFERRED_TRIGGERS: LogTrigger[] = ['story-mode', 'qi-rfi']

/** Milliseconds of typing silence before a deferred command fires. */
export const DEFERRED_TRIGGER_IDLE_MS = 1200

/** Returns the keyword list a trigger answers to (for tests / docs). */
export function keywordsForTrigger(trigger: LogTrigger): string[] {
  return RULES.find(r => r.trigger === trigger)?.keywords || []
}

/**
 * Renders the `/system` screen. Lines starting with "/" are commands
 * (command + two-space gap + description); other non-empty lines are
 * section headers. Format is consumed by the SYSTEM block in Logs.tsx.
 */
export function renderSystemHelp(commands: LogCommand[] = LOG_COMMANDS): string {
  const lines: string[] = ['LOT® LOG — COMMAND INDEX', '']
  for (const group of COMMAND_GROUP_ORDER) {
    const inGroup = commands.filter(c => c.group === group)
    if (!inGroup.length) continue
    lines.push(group)
    for (const c of inGroup) {
      const head = c.usage ? `${c.command} ${c.usage}` : c.command
      lines.push(`${head}  ${c.description}`)
    }
    lines.push('')
  }
  lines.push('EMOJI TRIGGERS')
  lines.push('📖 story · 🕯️ prayer · 🎧 radio · 🎹 synth · 🌙 night · 🧊 freeze')
  lines.push('')
  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter — save log immediately')
  return lines.join('\n')
}
