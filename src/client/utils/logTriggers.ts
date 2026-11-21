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
// COMMAND REGISTRY — single source of truth for /system
// ---------------------------------------------------------------------------

export interface LogCommandSpec {
  usage: string        // as typed, e.g. "/story [day|week|month|year]"
  description: string
  group: 'AI' | 'SYSTEM' | 'CARE' | 'AMBIENT'
}

/**
 * Every slash command the Log understands. /system renders this list,
 * so adding a RULES entry without a spec here is a doctrine violation
 * (scripts/tests/log-commands.test.ts enforces parity).
 */
export const LOG_COMMANDS: Record<Exclude<LogTrigger, 'cohort-support'>, LogCommandSpec> = {
  'story-mode':     { group: 'AI',      usage: '/story [day|week|month|year]', description: 'Compressed story of your period (default week)' },
  'qi-rfi':         { group: 'AI',      usage: '/qi [query]',   description: 'Ask the Quantum Intelligence engine' },
  'prayer-mode':    { group: 'AI',      usage: '/prayer',       description: 'Contextual scripture' },
  'how-checkin':    { group: 'AI',      usage: '/how',          description: 'Open LOT AI check-in (System tab)' },
  'ai-scan':        { group: 'SYSTEM',  usage: '/scan',         description: 'System status overview' },
  'assembly-check': { group: 'SYSTEM',  usage: '/assembly',     description: 'Self-assembly module status' },
  'qos-report':     { group: 'SYSTEM',  usage: '/qos',          description: 'Quantum OS state analysis' },
  'phys-report':    { group: 'SYSTEM',  usage: '/phys',         description: 'Physiological cohort report' },
  'sil-check':      { group: 'SYSTEM',  usage: '/sil',          description: 'Signal silence pattern check' },
  'system-help':    { group: 'SYSTEM',  usage: '/system',       description: 'This command index' },
  'breathe':        { group: 'CARE',    usage: '/breathe',      description: '4-2-6 breathing exercise' },
  'freeze-widgets': { group: 'CARE',    usage: '/freeze',       description: 'Pause and reflect protocol' },
  'silent-mode':    { group: 'CARE',    usage: '/silent',       description: 'Signal silence acknowledgement' },
  'force-fast':     { group: 'CARE',    usage: '/fast',         description: 'Orthodox fasting calendar' },
  'toggle-synth':   { group: 'AMBIENT', usage: '/synth',        description: 'Toggle keyboard sound (🎹)' },
  'radio-toggle':   { group: 'AMBIENT', usage: '/radio',        description: 'Toggle radio (🎧)' },
  'night-mode':     { group: 'AMBIENT', usage: '/night',        description: 'Dark mode (🌙)' },
}

/** Keywords (aliases) for a trigger, exposed for help rendering/tests. */
export function getTriggerKeywords(trigger: LogTrigger): string[] {
  return RULES.find(r => r.trigger === trigger)?.keywords || []
}

/** Terminal Grid rendering of the /system command index. */
export function renderSystemHelp(): string[] {
  const groups: LogCommandSpec['group'][] = ['AI', 'SYSTEM', 'CARE', 'AMBIENT']
  const lines: string[] = ['LOT® LOG — COMMAND INDEX', '']
  for (const g of groups) {
    lines.push(`[ ${g} ]`)
    for (const spec of Object.values(LOG_COMMANDS)) {
      if (spec.group !== g) continue
      lines.push(`${(spec.usage + '                              ').slice(0, 30)}${spec.description}`)
    }
    lines.push('')
  }
  lines.push('[ SIGNALS ]')
  lines.push(`${'❗ / ‼️                        '.slice(0, 30)}Cohort support flag`)
  lines.push('')
  lines.push('SHORTCUTS')
  lines.push(`${'Ctrl+Enter                    '.slice(0, 30)}Save log immediately`)
  lines.push('')
  lines.push('Every entry is recorded with its context: time, weather,')
  lines.push('humidity, location, moon and sky. No photo. No sound.')
  return lines
}
