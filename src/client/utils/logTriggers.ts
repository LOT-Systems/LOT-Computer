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
  | 'arcade-status'     // /arcade — Arcade evolution card (rank, badges, next tier)

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
  { trigger: 'arcade-status',  emojis: ['🕹️', '🕹'], keywords: ['arcade', 'level'] },
]

// ----------------------------------------------------------------------
// COMMAND REGISTRY — single source of truth for `/system`.
// Every slash command a user can type in the Log is listed here exactly
// once. `/system` renders from this list, so adding a trigger without a
// registry row is a doctrine violation (see docs/technical/LOG-COMMAND-
// SYSTEM.md §4). `cohort-support` is emoji-only (❗) and intentionally
// not a slash command.
// ----------------------------------------------------------------------

export type LogCommandGroup = 'NARRATIVE' | 'INTELLIGENCE' | 'SELF-CARE' | 'ARCADE' | 'ENVIRONMENT'

export interface LogCommand {
  trigger: LogTrigger
  usage: string        // what the user types, e.g. "/story [day|week|month|year]"
  description: string
  group: LogCommandGroup
}

export const LOG_COMMAND_GROUPS: LogCommandGroup[] = [
  'NARRATIVE', 'INTELLIGENCE', 'SELF-CARE', 'ARCADE', 'ENVIRONMENT',
]

export const LOG_COMMANDS: LogCommand[] = [
  { trigger: 'story-mode',     usage: '/story [day|week|month|year]', description: 'Compressed story of your day / week / month / year', group: 'NARRATIVE' },
  { trigger: 'prayer-mode',    usage: '/prayer',      description: 'Contextual scripture',                  group: 'NARRATIVE' },
  { trigger: 'how-checkin',    usage: '/how',         description: 'LOT AI check-in (System tab)',          group: 'NARRATIVE' },
  { trigger: 'qi-rfi',         usage: '/qi [query]',  description: 'Ask the Quantum Intelligence engine',   group: 'INTELLIGENCE' },
  { trigger: 'ai-scan',        usage: '/scan',        description: 'System status overview',                group: 'INTELLIGENCE' },
  { trigger: 'qos-report',     usage: '/qos',         description: 'Quantum OS state analysis',             group: 'INTELLIGENCE' },
  { trigger: 'assembly-check', usage: '/assembly',    description: 'Self-assembly module status',           group: 'INTELLIGENCE' },
  { trigger: 'phys-report',    usage: '/phys',        description: 'Physiological cohort report',           group: 'INTELLIGENCE' },
  { trigger: 'breathe',        usage: '/breathe',     description: '4-2-6 breathing exercise',              group: 'SELF-CARE' },
  { trigger: 'freeze-widgets', usage: '/freeze',      description: 'Pause and reflect protocol',            group: 'SELF-CARE' },
  { trigger: 'silent-mode',    usage: '/silent',      description: 'Signal silence check',                  group: 'SELF-CARE' },
  { trigger: 'sil-check',      usage: '/sil',         description: 'Signal silence pattern (short form)',   group: 'SELF-CARE' },
  { trigger: 'force-fast',     usage: '/fast',        description: 'Orthodox fasting calendar',             group: 'SELF-CARE' },
  { trigger: 'arcade-status',  usage: '/arcade',      description: 'Your Arcade rank, badges, next tier',   group: 'ARCADE' },
  { trigger: 'toggle-synth',   usage: '/synth',       description: 'Toggle keyboard sound',                 group: 'ENVIRONMENT' },
  { trigger: 'radio-toggle',   usage: '/radio',       description: 'Toggle radio',                          group: 'ENVIRONMENT' },
  { trigger: 'night-mode',     usage: '/night',       description: 'Dark mode',                             group: 'ENVIRONMENT' },
  { trigger: 'system-help',    usage: '/system',      description: 'This command list',                     group: 'ENVIRONMENT' },
]

/** Every trigger that has a slash keyword must appear in LOG_COMMANDS. */
export function unregisteredTriggers(): LogTrigger[] {
  const registered = new Set(LOG_COMMANDS.map(c => c.trigger))
  return RULES.filter(r => r.keywords.length > 0 && !registered.has(r.trigger)).map(r => r.trigger)
}

/**
 * Render the `/system` help screen as plain text. Group headers are
 * upper-case lines; command lines start with "/" and separate usage from
 * description with 2+ spaces (the Log renderer splits on that).
 */
export function formatSystemHelp(): string {
  const lines: string[] = []
  for (const group of LOG_COMMAND_GROUPS) {
    const cmds = LOG_COMMANDS.filter(c => c.group === group)
    if (cmds.length === 0) continue
    if (lines.length > 0) lines.push('')
    lines.push(group)
    for (const c of cmds) lines.push(`${c.usage}  ${c.description}`)
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter  Save log immediately')
  return lines.join('\n')
}

// ----------------------------------------------------------------------
// ARCADE — gamified evolution, self-care first.
// Rank is derived from earned badges only: no streak punishment, no
// loss state. Tiers are deliberately calm names, not combat ranks.
// ----------------------------------------------------------------------

export interface ArcadeTier { name: string; minBadges: number }

export const ARCADE_TIERS: ArcadeTier[] = [
  { name: 'INSERT COIN', minBadges: 0 },
  { name: 'PLAYER ONE',  minBadges: 1 },
  { name: 'CONTINUE',    minBadges: 5 },
  { name: 'LEVEL UP',    minBadges: 15 },
  { name: 'COMBO',       minBadges: 40 },
  { name: 'HIGH SCORE',  minBadges: 100 },
  { name: 'BONUS STAGE', minBadges: 250 },
  { name: 'FINAL BOSS',  minBadges: 500 },
  { name: 'GAME CLEAR',  minBadges: 800 },
]

export interface ArcadeStatus {
  tier: ArcadeTier
  tierIndex: number
  next: ArcadeTier | null
  earned: number
  total: number
  toNext: number
  progress: number // 0..1 within current tier
}

export function getArcadeStatus(earned: number, total: number): ArcadeStatus {
  const n = Math.max(0, Math.floor(earned))
  let tierIndex = 0
  ARCADE_TIERS.forEach((t, i) => { if (n >= t.minBadges) tierIndex = i })
  const tier = ARCADE_TIERS[tierIndex]
  const next = ARCADE_TIERS[tierIndex + 1] || null
  const span = next ? next.minBadges - tier.minBadges : 1
  return {
    tier,
    tierIndex,
    next,
    earned: n,
    total,
    toNext: next ? next.minBadges - n : 0,
    progress: next ? Math.min(1, (n - tier.minBadges) / span) : 1,
  }
}

/** Fixed-width text card for the Log `ARCADE:` block. */
export function formatArcadeStatus(s: ArcadeStatus): string {
  const width = 16
  const filled = Math.round(s.progress * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return [
    `RANK            ${s.tier.name}`,
    `STAGE           ${s.tierIndex + 1} / ${ARCADE_TIERS.length}`,
    `BADGES          ${s.earned} / ${s.total}`,
    `PROGRESS        ${bar}`,
    s.next ? `NEXT            ${s.next.name} IN ${s.toNext} ${s.toNext === 1 ? 'BADGE' : 'BADGES'}` : 'NEXT            ALL STAGES CLEARED',
    'RULE            NO LOSS STATE — CARE IS THE ONLY SCORE',
  ].join('\n')
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
