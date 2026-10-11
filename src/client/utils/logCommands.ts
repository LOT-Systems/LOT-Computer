/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log command registry — single source of truth for what /system lists.
 * Pure (no stores, no DOM). Execution stays in Logs.tsx; trigger detection
 * stays in logTriggers.ts. A test (scripts/tests/test-log-commands.ts)
 * asserts every registry entry maps to a real detector keyword, so the
 * help screen cannot drift from behaviour.
 *
 * Doc: docs/technical/LOT-LOG-COMMANDS-AND-STORY.md
 */

import type { LogTrigger } from './logTriggers'

export type CommandGroup = 'AI' | 'SYSTEM' | 'RITUAL' | 'AMBIENT'

export interface LogCommand {
  trigger: LogTrigger
  /** Primary keyword, without slash. Must exist in logTriggers RULES. */
  name: string
  usage: string
  group: CommandGroup
  summary: string
  detail: string
}

export const LOG_COMMANDS: LogCommand[] = [
  { trigger: 'story-mode', name: 'story', usage: '/story [day|week|month|year]', group: 'AI',
    summary: 'Compressed story of your day / week / month / year',
    detail: 'Compresses your entries, moods and self-care answers for the window into a short second-person story. Default window: day. Works offline from your own counted data if the AI engine is unreachable. Usership feature for the AI voice.' },
  { trigger: 'qi-rfi', name: 'qi', usage: '/qi [query]', group: 'AI',
    summary: 'Ask the Quantum Intelligence engine',
    detail: 'Sends your query with current context to the Quantum Intent Engine.' },
  { trigger: 'how-checkin', name: 'how', usage: '/how', group: 'AI',
    summary: 'Open LOT AI check-in (System tab)',
    detail: 'Jumps to the System tab where the machine asks first.' },
  { trigger: 'ai-scan', name: 'scan', usage: '/scan', group: 'SYSTEM',
    summary: 'System status overview', detail: 'One-screen state of widgets, signals and engine.' },
  { trigger: 'qos-report', name: 'qos', usage: '/qos', group: 'SYSTEM',
    summary: 'Quantum OS state analysis', detail: 'Current QOS operating mode and signal streams.' },
  { trigger: 'assembly-check', name: 'assembly', usage: '/assembly', group: 'SYSTEM',
    summary: 'Self-assembly module status', detail: 'Phase and status of the self-assembly module.' },
  { trigger: 'phys-report', name: 'phys', usage: '/phys', group: 'SYSTEM',
    summary: 'Physiological cohort report', detail: 'Archetype, ATP, clarity, alignment and detected patterns.' },
  { trigger: 'sil-check', name: 'sil', usage: '/sil', group: 'SYSTEM',
    summary: 'Signal silence check', detail: 'Detects gaps in your signal stream.' },
  { trigger: 'system-help', name: 'system', usage: '/system [command]', group: 'SYSTEM',
    summary: 'This command list', detail: '/system lists everything. /system story shows detail for one command.' },
  { trigger: 'prayer-mode', name: 'prayer', usage: '/prayer', group: 'RITUAL',
    summary: 'Contextual scripture', detail: 'Generates a scripture matched to your moment.' },
  { trigger: 'breathe', name: 'breathe', usage: '/breathe', group: 'RITUAL',
    summary: '4-2-6 breathing exercise', detail: 'Guided inhale 4, hold 2, exhale 6.' },
  { trigger: 'freeze-widgets', name: 'freeze', usage: '/freeze', group: 'RITUAL',
    summary: 'Pause and reflect protocol', detail: 'Freezes widget motion for a moment of reflection.' },
  { trigger: 'silent-mode', name: 'silent', usage: '/silent', group: 'RITUAL',
    summary: 'Quiet mode', detail: 'Reduces system prompts and sound.' },
  { trigger: 'force-fast', name: 'fast', usage: '/fast', group: 'RITUAL',
    summary: 'Orthodox fasting calendar', detail: 'Shows today\'s fast and strictness.' },
  { trigger: 'toggle-synth', name: 'synth', usage: '/synth', group: 'AMBIENT',
    summary: 'Toggle keyboard sound', detail: 'Also triggered by the keyboard emoji.' },
  { trigger: 'radio-toggle', name: 'radio', usage: '/radio', group: 'AMBIENT',
    summary: 'Toggle radio', detail: 'Also triggered by the headphones emoji.' },
  { trigger: 'night-mode', name: 'night', usage: '/night', group: 'AMBIENT',
    summary: 'Dark mode', detail: 'Also triggered by the moon emoji.' },
]

const GROUP_ORDER: CommandGroup[] = ['AI', 'SYSTEM', 'RITUAL', 'AMBIENT']

/** Find the argument after /system, e.g. "/system story" -> "story". */
export function parseSystemArg(text: string): string | null {
  const m = /(^|\s)\/(?:system|commands)(?:\s+\/?([a-z0-9-]+))?/i.exec(text || '')
  return m?.[2]?.toLowerCase() || null
}

export function findCommand(name: string): LogCommand | undefined {
  const n = name.replace(/^\//, '').toLowerCase()
  return LOG_COMMANDS.find(c => c.name === n)
}

/**
 * Render /system output. Lines keep the existing Logs.tsx convention:
 * a line starting with "/" is rendered as a command row (cmd + desc split
 * on 2+ spaces); other non-empty lines render as section headers.
 */
export function renderSystemHelp(arg?: string | null): string {
  if (arg) {
    const c = findCommand(arg)
    if (!c) return [`UNKNOWN COMMAND  ${arg.toUpperCase()}`, '', 'Type /system to list all commands.'].join('\n')
    return [c.group, '', `${c.usage}  ${c.summary}`, '', c.detail].join('\n')
  }
  const lines: string[] = ['AVAILABLE COMMANDS']
  for (const g of GROUP_ORDER) {
    lines.push('', g)
    for (const c of LOG_COMMANDS.filter(x => x.group === g)) {
      lines.push(`/${c.name}`.padEnd(14) + '  ' + c.summary)
    }
  }
  lines.push('', 'SHORTCUTS', 'Ctrl+Enter    Save log immediately', '', 'Type /system <command> for detail.')
  return lines.join('\n')
}
