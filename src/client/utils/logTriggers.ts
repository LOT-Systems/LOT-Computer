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
  | 'story-day'         // /day — compressed story of the last 24h
  | 'story-week'        // /week — compressed story of the last 7 days
  | 'story-month'       // /month — compressed story of the last 30 days
  | 'story-year'        // /year — compressed story of the last 365 days
  | 'arcade-status'     // /level — Arcade self-care evolution status

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
  { trigger: 'story-day',      emojis: [],        keywords: ['day'] },
  { trigger: 'story-week',     emojis: [],        keywords: ['week'] },
  { trigger: 'story-month',    emojis: [],        keywords: ['month'] },
  { trigger: 'story-year',     emojis: [],        keywords: ['year'] },
  { trigger: 'arcade-status',  emojis: [],        keywords: ['level', 'arcade', 'xp'] },
]

/** Story triggers → compression horizon. */
export const STORY_TRIGGER_HORIZON: Partial<Record<LogTrigger, 'day' | 'week' | 'month' | 'year'>> = {
  'story-day': 'day',
  'story-week': 'week',
  'story-month': 'month',
  'story-year': 'year',
}

// ─── Command registry — single source of truth for /system ──────────────────

export interface LogCommand {
  usage: string
  description: string
  group: 'NARRATIVE' | 'ENGINE' | 'SELF-CARE' | 'ENVIRONMENT' | 'ARCADE' | 'SYSTEM'
}

export const LOG_COMMAND_GROUPS: LogCommand['group'][] = [
  'NARRATIVE', 'ENGINE', 'SELF-CARE', 'ENVIRONMENT', 'ARCADE', 'SYSTEM',
]

export const LOG_COMMANDS: LogCommand[] = [
  { group: 'NARRATIVE',   usage: '/story',       description: 'Compressed story — today, widens if quiet' },
  { group: 'NARRATIVE',   usage: '/day',         description: 'Compress the last 24 hours' },
  { group: 'NARRATIVE',   usage: '/week',        description: 'Compress the last 7 days' },
  { group: 'NARRATIVE',   usage: '/month',       description: 'Compress the last 30 days' },
  { group: 'NARRATIVE',   usage: '/year',        description: 'Compress the last 365 days' },
  { group: 'NARRATIVE',   usage: '/prayer',      description: 'Contextual scripture for this entry' },
  { group: 'ENGINE',      usage: '/scan',        description: 'System status overview' },
  { group: 'ENGINE',      usage: '/qi [query]',  description: 'Ask the Quantum Intelligence engine' },
  { group: 'ENGINE',      usage: '/qos',         description: 'Quantum OS state analysis' },
  { group: 'ENGINE',      usage: '/assembly',    description: 'Self-assembly module status' },
  { group: 'ENGINE',      usage: '/phys',        description: 'Physiological cohort report' },
  { group: 'SELF-CARE',   usage: '/breathe',     description: '4-2-6 breathing exercise' },
  { group: 'SELF-CARE',   usage: '/freeze',      description: 'Pause and reflect protocol' },
  { group: 'SELF-CARE',   usage: '/silent',      description: 'Signal silence check' },
  { group: 'SELF-CARE',   usage: '/fast',        description: 'Orthodox fasting calendar' },
  { group: 'SELF-CARE',   usage: '/how',         description: 'Open LOT AI check-in (System tab)' },
  { group: 'ENVIRONMENT', usage: '/synth',       description: 'Toggle keyboard sound' },
  { group: 'ENVIRONMENT', usage: '/radio',       description: 'Toggle radio' },
  { group: 'ENVIRONMENT', usage: '/night',       description: 'Dark mode' },
  { group: 'ARCADE',      usage: '/level',       description: 'Your level, rank, XP and streak' },
  { group: 'SYSTEM',      usage: '/system',      description: 'This command list' },
]

/** Plain-text help screen, rendered by the Log's SYSTEM block. */
export function renderSystemHelp(): string {
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const g of LOG_COMMAND_GROUPS) {
    const cmds = LOG_COMMANDS.filter(c => c.group === g)
    if (!cmds.length) continue
    lines.push('', g)
    for (const c of cmds) lines.push(`${c.usage.padEnd(14)}${c.description}`)
  }
  lines.push(
    '',
    'EMOJI',
    '📖  story · 🎹  synth · 🎧  radio · 🌙  night · 🕯️  prayer · 🧊  freeze',
    '',
    'SHORTCUTS',
    'Ctrl+Enter    Save log immediately',
    '',
    'Every entry is stored with its moment: time, weather, place, sky.',
  )
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
