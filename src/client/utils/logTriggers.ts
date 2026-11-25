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
  | 'arcade-status'     // /arcade — self-care Arcade rank, level, XP, streak

export type CommandCategory = 'NARRATIVE' | 'INTELLIGENCE' | 'RITUAL' | 'ENVIRONMENT' | 'ARCADE' | 'SYSTEM'

/**
 * LOG COMMAND REGISTRY — single source of truth.
 * Detection (detectTriggers) and the /system help screen are both
 * derived from this table, so a command can never exist without being
 * documented, nor be documented without being detectable.
 */
export interface LogCommand {
  trigger: LogTrigger
  /** Primary slash keyword (lower-case, no slash). null = emoji-only. */
  command: string | null
  usage?: string
  description: string
  category: CommandCategory
  emojis: string[]
  /** Additional slash keywords that fire the same trigger. */
  aliases: string[]
  /** Hidden commands are detected but not listed in /system. */
  hidden?: boolean
}

export const LOG_COMMANDS: LogCommand[] = [
  { trigger: 'story-mode',     command: 'story',    usage: '/story [day|week|month|year]', description: 'Compressed story of your period — peaks, context, XP', category: 'NARRATIVE',    emojis: ['📖'],        aliases: [] },
  { trigger: 'prayer-mode',    command: 'prayer',   description: 'Contextual scripture',                      category: 'NARRATIVE',    emojis: ['🕯️', '🕯'], aliases: ['candle'] },
  { trigger: 'qi-rfi',         command: 'qi',       usage: '/qi [query]', description: 'Ask the Quantum Intelligence engine', category: 'INTELLIGENCE', emojis: [], aliases: [] },
  { trigger: 'ai-scan',        command: 'scan',     description: 'System status overview',                    category: 'INTELLIGENCE', emojis: [],            aliases: ['ai'] },
  { trigger: 'qos-report',     command: 'qos',      description: 'Quantum OS state analysis',                 category: 'INTELLIGENCE', emojis: [],            aliases: ['os-report'] },
  { trigger: 'assembly-check', command: 'assembly', description: 'Self-assembly module directive',            category: 'INTELLIGENCE', emojis: [],            aliases: ['assemble'] },
  { trigger: 'phys-report',    command: 'phys',     description: 'Physiological cohort report',               category: 'INTELLIGENCE', emojis: [],            aliases: ['cohort-report'] },
  { trigger: 'breathe',        command: 'breathe',  description: '4-2-6 breathing exercise',                  category: 'RITUAL',       emojis: [],            aliases: ['breath'] },
  { trigger: 'freeze-widgets', command: 'freeze',   description: 'Pause and reflect protocol',                category: 'RITUAL',       emojis: ['🧊'],        aliases: ['pause'] },
  { trigger: 'silent-mode',    command: 'silent',   description: 'Signal silence check',                      category: 'RITUAL',       emojis: [],            aliases: ['quiet'] },
  { trigger: 'force-fast',     command: 'fast',     description: 'Orthodox fasting calendar',                 category: 'RITUAL',       emojis: [],            aliases: [] },
  { trigger: 'toggle-synth',   command: 'synth',    description: 'Toggle keyboard sound',                     category: 'ENVIRONMENT',  emojis: ['🎹'],        aliases: ['keyboard'] },
  { trigger: 'radio-toggle',   command: 'radio',    description: 'Toggle radio',                              category: 'ENVIRONMENT',  emojis: ['🎧'],        aliases: [] },
  { trigger: 'night-mode',     command: 'night',    description: 'Dark mode',                                 category: 'ENVIRONMENT',  emojis: ['🌙'],        aliases: [] },
  { trigger: 'arcade-status',  command: 'arcade',   description: 'Self-care Arcade — rank, level, XP, streak', category: 'ARCADE',      emojis: [],            aliases: ['xp', 'level'] },
  { trigger: 'how-checkin',    command: 'how',      description: 'Open LOT AI check-in (System tab)',         category: 'SYSTEM',       emojis: [],            aliases: [] },
  { trigger: 'system-help',    command: 'system',   description: 'This command index',                        category: 'SYSTEM',       emojis: [],            aliases: ['commands'] },
  { trigger: 'sil-check',      command: 'sil',      description: 'Signal silence pattern check',              category: 'SYSTEM',       emojis: [],            aliases: ['silence-check'], hidden: true },
  { trigger: 'cohort-support', command: null,       description: 'Heavy exclamation ❗ — flag for cohort support', category: 'SYSTEM', emojis: ['❗', '‼️', '‼'], aliases: [], hidden: true },
]

interface TriggerRule {
  trigger: LogTrigger
  emojis: string[]
  keywords: string[] // lower-case slash commands (without leading slash)
}

const RULES: TriggerRule[] = LOG_COMMANDS.map(c => ({
  trigger: c.trigger,
  emojis: c.emojis,
  keywords: [...(c.command ? [c.command] : []), ...c.aliases],
}))

const CATEGORY_ORDER: CommandCategory[] = ['NARRATIVE', 'INTELLIGENCE', 'RITUAL', 'ENVIRONMENT', 'ARCADE', 'SYSTEM']

/**
 * Lines for the /system screen. Section headers are UPPER-CASE lines;
 * command lines start with "/" and separate usage from description by
 * 2+ spaces (the renderer in Logs.tsx splits on that).
 */
export function formatSystemHelp(header: string[] = []): string[] {
  const lines: string[] = [...header]
  if (header.length) lines.push('')
  for (const cat of CATEGORY_ORDER) {
    const cmds = LOG_COMMANDS.filter(c => c.category === cat && !c.hidden && c.command)
    if (!cmds.length) continue
    lines.push(cat)
    for (const c of cmds) {
      const usage = c.usage || `/${c.command}`
      const emoji = c.emojis.length ? ` ${c.emojis[0]}` : ''
      lines.push(`${usage}  ${c.description}${emoji}`)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter    Save log immediately')
  return lines
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
