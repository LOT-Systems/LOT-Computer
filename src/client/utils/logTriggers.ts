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
  | 'arcade-report'     // /arcade — gamified evolution readout (rank, level, XP, streak)

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
  { trigger: 'arcade-report',  emojis: [],        keywords: ['arcade', 'level', 'xp'] },
]

/**
 * COMMAND REGISTRY — single source of truth for /system.
 *
 * Every trigger above MUST appear here exactly once (enforced by
 * `assertRegistryComplete`, run at module load in dev and by the
 * docs/technical/LOG-COMMAND-SYSTEM.md verification step). The /system
 * screen renders from this table, so help can never drift from behavior.
 */
export type CommandGroup = 'NARRATIVE' | 'INTELLIGENCE' | 'SELF-CARE' | 'ENVIRONMENT' | 'SYSTEM'

export interface CommandSpec {
  trigger: LogTrigger
  usage: string        // shown in the left column, e.g. "/story [day|week|month|year]"
  description: string
  group: CommandGroup
}

export const COMMAND_REGISTRY: CommandSpec[] = [
  { trigger: 'story-mode',     group: 'NARRATIVE',    usage: '/story [day|week|month|year]', description: 'Compressed story of your recorded period (default week)' },
  { trigger: 'arcade-report',  group: 'NARRATIVE',    usage: '/arcade',      description: 'Rank, level, XP and streak — presence earns XP' },
  { trigger: 'prayer-mode',    group: 'NARRATIVE',    usage: '/prayer',      description: 'Contextual scripture for this entry' },
  { trigger: 'qi-rfi',         group: 'INTELLIGENCE', usage: '/qi [query]',  description: 'Ask the Quantum Intelligence engine' },
  { trigger: 'ai-scan',        group: 'INTELLIGENCE', usage: '/scan',        description: 'System status overview' },
  { trigger: 'qos-report',     group: 'INTELLIGENCE', usage: '/qos',         description: 'Quantum OS state analysis' },
  { trigger: 'assembly-check', group: 'INTELLIGENCE', usage: '/assembly',    description: 'Self-assembly module directive' },
  { trigger: 'phys-report',    group: 'INTELLIGENCE', usage: '/phys',        description: 'Physiological cohort report' },
  { trigger: 'sil-check',      group: 'INTELLIGENCE', usage: '/sil',         description: 'Signal silence pattern check' },
  { trigger: 'how-checkin',    group: 'SELF-CARE',    usage: '/how',         description: 'Open LOT AI check-in (System tab)' },
  { trigger: 'breathe',        group: 'SELF-CARE',    usage: '/breathe',     description: '4-2-6 breathing exercise' },
  { trigger: 'freeze-widgets', group: 'SELF-CARE',    usage: '/freeze',      description: 'Pause and reflect protocol' },
  { trigger: 'silent-mode',    group: 'SELF-CARE',    usage: '/silent',      description: 'Signal silence acknowledgement' },
  { trigger: 'force-fast',     group: 'SELF-CARE',    usage: '/fast',        description: 'Orthodox fasting calendar' },
  { trigger: 'cohort-support', group: 'SELF-CARE',    usage: '❗',           description: 'Flag this entry for cohort support' },
  { trigger: 'toggle-synth',   group: 'ENVIRONMENT',  usage: '/synth',       description: 'Toggle keyboard sound' },
  { trigger: 'radio-toggle',   group: 'ENVIRONMENT',  usage: '/radio',       description: 'Toggle radio' },
  { trigger: 'night-mode',     group: 'ENVIRONMENT',  usage: '/night',       description: 'Dark mode' },
  { trigger: 'system-help',    group: 'SYSTEM',       usage: '/system',      description: 'This command list' },
]

export const COMMAND_GROUP_ORDER: CommandGroup[] = ['NARRATIVE', 'INTELLIGENCE', 'SELF-CARE', 'ENVIRONMENT', 'SYSTEM']

/** Returns triggers present in RULES but missing from the registry (should be []). */
export function missingFromRegistry(): LogTrigger[] {
  const listed = new Set(COMMAND_REGISTRY.map(c => c.trigger))
  return RULES.map(r => r.trigger).filter(t => !listed.has(t))
}

/** Aliases for a trigger, e.g. story-mode → ['📖'] (primary keyword excluded). */
export function aliasesFor(trigger: LogTrigger): string[] {
  const rule = RULES.find(r => r.trigger === trigger)
  if (!rule) return []
  // Emoji variants (🕯️ / 🕯) are one alias — show only the first.
  return [...rule.keywords.slice(1).map(k => `/${k}`), ...rule.emojis.slice(0, 1)]
    .filter((v, i, a) => a.indexOf(v) === i)
}

/**
 * Renders the /system screen as text lines. Command lines start with the
 * usage token followed by two+ spaces and the description — the Log
 * renderer splits on that gap. Group headers are plain uppercase lines.
 */
export function renderSystemHelp(): string {
  const lines: string[] = ['LOT® LOG — COMMAND SYSTEM', '']
  for (const group of COMMAND_GROUP_ORDER) {
    const cmds = COMMAND_REGISTRY.filter(c => c.group === group)
    if (!cmds.length) continue
    lines.push(group)
    for (const c of cmds) {
      const aliases = aliasesFor(c.trigger).filter(a => a !== c.usage)
      const suffix = aliases.length ? `  (${aliases.join(' ')})` : ''
      lines.push(`${c.usage}  ${c.description}${suffix}`)
    }
    lines.push('')
  }
  lines.push('SHORTCUTS')
  lines.push('Ctrl+Enter  Save log immediately')
  lines.push('')
  lines.push('PROTOCOL')
  lines.push('Every entry is recorded with its context — time, weather, place, moon.')
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
