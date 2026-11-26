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
  | 'rank-report'       // /rank — Arcade: Record Rank + XP from the Log

export type CommandGroup = 'STORY & RECORD' | 'INTELLIGENCE' | 'SELF-CARE' | 'ENVIRONMENT' | 'SYSTEM'

interface TriggerRule {
  trigger: LogTrigger
  emojis: string[]
  keywords: string[] // lower-case slash commands (without leading slash)
  /** Shown in /system. Omit to keep a command unlisted (easter egg). */
  usage?: string
  description?: string
  group?: CommandGroup
}

/**
 * SINGLE SOURCE OF TRUTH for Log commands. `/system` renders from this
 * table, so a command added here is documented automatically and the
 * help screen can never drift from what the detector actually accepts.
 */
const RULES: TriggerRule[] = [
  { trigger: 'story-mode',     emojis: ['📖'],    keywords: ['story'],
    usage: '/story [day|week|month|year]', description: 'Compressed story of your record (default: week)', group: 'STORY & RECORD' },
  { trigger: 'rank-report',    emojis: [],        keywords: ['rank', 'xp'],
    usage: '/rank', description: 'Record Rank, XP and streak (Arcade)', group: 'STORY & RECORD' },
  { trigger: 'qi-rfi',         emojis: [],        keywords: ['qi'],
    usage: '/qi [query]', description: 'Ask the Quantum Intelligence engine', group: 'INTELLIGENCE' },
  { trigger: 'ai-scan',        emojis: [],       keywords: ['scan', 'ai'],
    usage: '/scan', description: 'System status overview', group: 'INTELLIGENCE' },
  { trigger: 'assembly-check', emojis: [],        keywords: ['assembly', 'assemble'],
    usage: '/assembly', description: 'Self-assembly module status', group: 'INTELLIGENCE' },
  { trigger: 'qos-report',     emojis: [],        keywords: ['qos', 'os-report'],
    usage: '/qos', description: 'Quantum OS state analysis', group: 'INTELLIGENCE' },
  { trigger: 'phys-report',    emojis: [],        keywords: ['phys', 'cohort-report'],
    usage: '/phys', description: 'Physiological cohort report', group: 'INTELLIGENCE' },
  { trigger: 'how-checkin',    emojis: [],        keywords: ['how'],
    usage: '/how', description: 'Open LOT AI check-in (System tab)', group: 'INTELLIGENCE' },
  { trigger: 'prayer-mode',    emojis: ['🕯️', '🕯'], keywords: ['prayer', 'candle'],
    usage: '/prayer', description: 'Generate contextual scripture', group: 'SELF-CARE' },
  { trigger: 'breathe',        emojis: [],       keywords: ['breathe', 'breath'],
    usage: '/breathe', description: '4-2-6 breathing exercise', group: 'SELF-CARE' },
  { trigger: 'freeze-widgets', emojis: ['🧊'],    keywords: ['freeze', 'pause'],
    usage: '/freeze', description: 'Pause and reflect protocol', group: 'SELF-CARE' },
  { trigger: 'force-fast',     emojis: [],       keywords: ['fast'],
    usage: '/fast', description: 'Orthodox fasting calendar', group: 'SELF-CARE' },
  { trigger: 'silent-mode',    emojis: [],       keywords: ['silent', 'quiet'],
    usage: '/silent', description: 'Signal silence check', group: 'SELF-CARE' },
  { trigger: 'sil-check',      emojis: [],        keywords: ['sil', 'silence-check'] },
  { trigger: 'cohort-support', emojis: ['❗', '‼️', '‼'], keywords: [] },
  { trigger: 'toggle-synth',   emojis: ['🎹'],    keywords: ['synth', 'keyboard'],
    usage: '/synth', description: 'Toggle keyboard sound', group: 'ENVIRONMENT' },
  { trigger: 'radio-toggle',   emojis: ['🎧'],    keywords: ['radio'],
    usage: '/radio', description: 'Toggle radio', group: 'ENVIRONMENT' },
  { trigger: 'night-mode',     emojis: ['🌙'],    keywords: ['night'],
    usage: '/night', description: 'Dark mode', group: 'ENVIRONMENT' },
  { trigger: 'system-help',    emojis: [],        keywords: ['system', 'commands'],
    usage: '/system', description: 'This help screen', group: 'SYSTEM' },
]

const GROUP_ORDER: CommandGroup[] = ['STORY & RECORD', 'INTELLIGENCE', 'SELF-CARE', 'ENVIRONMENT', 'SYSTEM']

/** Public, documented commands in display order. */
export function listCommands(): { usage: string; description: string; group: CommandGroup; emojis: string[] }[] {
  return RULES
    .filter(r => r.usage && r.description && r.group)
    .map(r => ({ usage: r.usage!, description: r.description!, group: r.group!, emojis: r.emojis }))
    .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
}

/**
 * Text rendered by `/system`. Lines starting with "/" are commands
 * (usage, two+ spaces, description); other non-empty lines are headers.
 */
export function buildSystemHelp(): string {
  const lines: string[] = []
  let group: CommandGroup | null = null
  for (const c of listCommands()) {
    if (c.group !== group) {
      if (group) lines.push('')
      lines.push(c.group)
      group = c.group
    }
    const emoji = c.emojis.length ? `  ${c.emojis[0]}` : ''
    lines.push(`${c.usage}    ${c.description}${emoji}`)
  }
  lines.push('', 'SHORTCUTS', 'CTRL+ENTER    SAVE LOG IMMEDIATELY')
  lines.push('', 'EVERY ENTRY IS RECORDED WITH ITS CONTEXT — TIME, PLACE, WEATHER, SKY.')
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
