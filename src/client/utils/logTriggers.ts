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

const STORY_COMMAND_RE = /(^|\s)\/story(?:[ \t]+(?:today|day|week|month|year)(?=\s|$)|[ \t]*\n)/

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
    // /story is the one command with an argument (day|week|month|year). The scan
    // runs on every keystroke, so it must not fire on "/story" while the user is
    // still typing "/story month": it fires on a complete scope word, or on Enter.
    const hasKeyword = rule.trigger === 'story-mode'
      ? STORY_COMMAND_RE.test(lower)
      : rule.keywords.some(k => {
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
 * Single source of truth for /system. Every slash command that RULES can
 * fire must appear here (enforced by scripts/tests/test-log-commands.ts),
 * so the help screen can never drift from the real command set.
 */
export interface CommandDoc {
  usage: string      // what the user types
  desc: string
  trigger: LogTrigger
  group: 'STORY' | 'ENGINE' | 'BODY' | 'AMBIENT' | 'NAV'
}

export const COMMAND_REGISTRY: CommandDoc[] = [
  { usage: '/story',         desc: 'Your week, compressed (press Enter)',            trigger: 'story-mode',     group: 'STORY' },
  { usage: '/story day',     desc: 'Today only',                                    trigger: 'story-mode',     group: 'STORY' },
  { usage: '/story month',   desc: 'Last 30 days',                                  trigger: 'story-mode',     group: 'STORY' },
  { usage: '/story year',    desc: 'Last 365 days',                                 trigger: 'story-mode',     group: 'STORY' },
  { usage: '/prayer',        desc: 'Contextual scripture',                          trigger: 'prayer-mode',    group: 'STORY' },
  { usage: '/qi [query]',    desc: 'Ask the Quantum Intelligence engine',           trigger: 'qi-rfi',         group: 'ENGINE' },
  { usage: '/scan',          desc: 'System status overview',                        trigger: 'ai-scan',        group: 'ENGINE' },
  { usage: '/assembly',      desc: 'Self-assembly module status',                   trigger: 'assembly-check', group: 'ENGINE' },
  { usage: '/qos',           desc: 'Quantum OS state analysis',                     trigger: 'qos-report',     group: 'ENGINE' },
  { usage: '/phys',          desc: 'Physiological cohort report',                   trigger: 'phys-report',    group: 'BODY' },
  { usage: '/sil',           desc: 'Silence-pattern check',                          trigger: 'sil-check',      group: 'BODY' },
  { usage: '/fast',          desc: 'Orthodox fasting calendar',                     trigger: 'force-fast',     group: 'BODY' },
  { usage: '/breathe',       desc: '4-2-6 breathing exercise',                      trigger: 'breathe',        group: 'BODY' },
  { usage: '/freeze',        desc: 'Pause and reflect protocol',                    trigger: 'freeze-widgets', group: 'BODY' },
  { usage: '/silent',        desc: 'Signal silence check',                          trigger: 'silent-mode',    group: 'BODY' },
  { usage: '/synth',         desc: 'Toggle keyboard sound',                         trigger: 'toggle-synth',   group: 'AMBIENT' },
  { usage: '/radio',         desc: 'Toggle radio',                                  trigger: 'radio-toggle',   group: 'AMBIENT' },
  { usage: '/night',         desc: 'Dark mode',                                     trigger: 'night-mode',     group: 'AMBIENT' },
  { usage: '/how',           desc: 'Open LOT AI check-in (System tab)',             trigger: 'how-checkin',    group: 'NAV' },
  { usage: '/system',        desc: 'This help screen',                              trigger: 'system-help',    group: 'NAV' },
]

/** Triggers that are emoji-only (no slash form) and so need no help line. */
export const EMOJI_ONLY_TRIGGERS: LogTrigger[] = ['cohort-support']

/** Plain-text help screen, grouped. Lines starting with a group name are headers. */
export function renderSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  let group = ''
  COMMAND_REGISTRY.forEach(c => {
    if (c.group !== group) { group = c.group; lines.push('', group) }
    lines.push(`${c.usage.padEnd(14)}${c.desc}`)
  })
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately')
  return lines.join('\n')
}

/** Exposed for tests: the slash keywords RULES recognises, per trigger. */
export function ruleKeywords(): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  RULES.forEach(r => { out[r.trigger] = r.keywords })
  return out
}
