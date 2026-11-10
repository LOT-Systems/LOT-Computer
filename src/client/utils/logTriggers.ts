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
// COMMAND REGISTRY — single source of truth for `/system`
// ---------------------------------------------------------------------------

export interface LogCommand {
  usage: string        // as typed, e.g. "/story [day|week|month|year]"
  description: string
  trigger: LogTrigger
  group: 'NARRATIVE' | 'INTELLIGENCE' | 'SELF-CARE' | 'ENVIRONMENT'
}

export const LOG_COMMANDS: LogCommand[] = [
  { usage: '/story [day|week|month|year]', description: 'Compressed story of your horizon (default week)', trigger: 'story-mode', group: 'NARRATIVE' },
  { usage: '/prayer',      description: 'Contextual scripture for this moment',   trigger: 'prayer-mode',    group: 'NARRATIVE' },
  { usage: '/how',         description: 'Open LOT AI check-in (System tab)',      trigger: 'how-checkin',    group: 'NARRATIVE' },
  { usage: '/qi [query]',  description: 'Ask the Quantum Intelligence engine',    trigger: 'qi-rfi',         group: 'INTELLIGENCE' },
  { usage: '/scan',        description: 'System status overview',                 trigger: 'ai-scan',        group: 'INTELLIGENCE' },
  { usage: '/qos',         description: 'Quantum OS state analysis',              trigger: 'qos-report',     group: 'INTELLIGENCE' },
  { usage: '/assembly',    description: 'Self-assembly module status',            trigger: 'assembly-check', group: 'INTELLIGENCE' },
  { usage: '/phys',        description: 'Physiological cohort report',            trigger: 'phys-report',    group: 'INTELLIGENCE' },
  { usage: '/sil',         description: 'Signal silence check',                   trigger: 'sil-check',      group: 'INTELLIGENCE' },
  { usage: '/breathe',     description: '4-2-6 breathing exercise',               trigger: 'breathe',        group: 'SELF-CARE' },
  { usage: '/freeze',      description: 'Pause and reflect protocol',             trigger: 'freeze-widgets', group: 'SELF-CARE' },
  { usage: '/fast',        description: 'Orthodox fasting calendar',              trigger: 'force-fast',     group: 'SELF-CARE' },
  { usage: '/silent',      description: 'Quiet mode — acknowledge silence',       trigger: 'silent-mode',    group: 'SELF-CARE' },
  { usage: '/synth',       description: 'Toggle keyboard sound',                  trigger: 'toggle-synth',   group: 'ENVIRONMENT' },
  { usage: '/radio',       description: 'Toggle radio',                           trigger: 'radio-toggle',   group: 'ENVIRONMENT' },
  { usage: '/night',       description: 'Dark mode',                              trigger: 'night-mode',     group: 'ENVIRONMENT' },
  { usage: '/system',      description: 'This command list',                      trigger: 'system-help',    group: 'ENVIRONMENT' },
]

/** Emoji shortcuts derived from RULES so they never drift from detection. */
export function getEmojiShortcuts(): Array<{ emoji: string; trigger: LogTrigger }> {
  return RULES.filter(r => r.emojis.length).map(r => ({ emoji: r.emojis[0], trigger: r.trigger }))
}

export interface ArcadeStatus {
  rank: string | null       // current level name, null before first milestone
  symbol: string | null
  badges: number
  next: string | null       // next badge unlock name
}

/**
 * Renders the `/system` screen. Pure — Logs.tsx supplies the Arcade
 * status so this module stays free of stores/localStorage.
 */
export function formatSystemHelp(arcade?: ArcadeStatus | null): string {
  const width = 30
  const lines: string[] = ['LOT® LOG — COMMAND GRID', '']
  const groups: LogCommand['group'][] = ['NARRATIVE', 'INTELLIGENCE', 'SELF-CARE', 'ENVIRONMENT']
  for (const g of groups) {
    lines.push(g)
    LOG_COMMANDS.filter(c => c.group === g).forEach(c => {
      lines.push(`${c.usage.padEnd(width, ' ')}${c.description}`)
    })
    lines.push('')
  }
  const emojiTriggers = getEmojiShortcuts()
  if (emojiTriggers.length) {
    lines.push('EMOJI')
    lines.push(emojiTriggers.map(e => {
      const cmd = LOG_COMMANDS.find(c => c.trigger === e.trigger)
      return `${e.emoji} ${cmd ? cmd.usage.split(' ')[0] : 'cohort support'}`
    }).join('   '))
    lines.push('')
  }
  if (arcade) {
    lines.push('ARCADE')
    lines.push(`${'RANK'.padEnd(width, ' ')}${arcade.rank ? `${arcade.symbol ? arcade.symbol + ' ' : ''}${arcade.rank}` : 'INITIATE — first milestone at 7 days'}`)
    lines.push(`${'BADGES'.padEnd(width, ' ')}${arcade.badges}`)
    if (arcade.next) lines.push(`${'NEXT UNLOCK'.padEnd(width, ' ')}${arcade.next}`)
    lines.push('')
  }
  lines.push('SHORTCUTS')
  lines.push(`${'Ctrl+Enter'.padEnd(width, ' ')}Save log immediately`)
  return lines.join('\n')
}
