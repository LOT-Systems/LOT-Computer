/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Arcade — gamified evolution of the user, self-care first.
 *
 * Design rules (doctrine):
 *  - XP rewards CONSISTENCY and REFLECTION, never volume-grinding or
 *    streak-anxiety. Daily XP is capped; there is no punishment for a gap.
 *  - Rank names are calm self-care ranks, not combat ranks.
 *  - Pure + deterministic: same logs in, same level out. Safe to run on
 *    client (for /system) and server (for /story).
 *  - This is the Log-section ladder only; it does not replace the badge
 *    codex (docs/badges), it is the simple on-ramp to it.
 */

export type ArcadeLog = { text: string | null; event: string; createdAt: Date | string }

export const ARCADE_RANKS = [
  { level: 1,  title: 'SIGNAL',     minXp: 0 },
  { level: 2,  title: 'SPARK',      minXp: 50 },
  { level: 3,  title: 'ROUTINE',    minXp: 150 },
  { level: 4,  title: 'RHYTHM',     minXp: 350 },
  { level: 5,  title: 'ANCHOR',     minXp: 700 },
  { level: 6,  title: 'COMPASS',    minXp: 1200 },
  { level: 7,  title: 'LANTERN',    minXp: 2000 },
  { level: 8,  title: 'KEEPER',     minXp: 3200 },
  { level: 9,  title: 'ORACLE',     minXp: 5000 },
  { level: 10, title: 'CONSTELLATION', minXp: 8000 },
] as const

export type ArcadeState = {
  xp: number
  level: number
  title: string
  nextTitle: string | null
  xpToNext: number | null
  /** 0..1 progress inside the current level */
  progress: number
  activeDays: number
}

const DAILY_XP_CAP = 25
const WRITING_EVENTS = ['log_entry', 'journal']

export function computeArcade(logs: ArcadeLog[]): ArcadeState {
  const perDay = new Map<string, number>()
  const bonusDays = new Set<string>()
  const seenStory = new Set<string>()

  for (const l of logs) {
    const d = (l.createdAt instanceof Date ? l.createdAt : new Date(l.createdAt))
    if (isNaN(d.getTime())) continue
    const k = d.toISOString().slice(0, 10)
    let xp = 0
    if (WRITING_EVENTS.includes(l.event) && l.text && l.text.trim()) {
      const wc = l.text.trim().split(/\s+/).length
      xp = 3 + (wc >= 20 ? 2 : 0) + (wc >= 60 ? 2 : 0) // reflection depth bonus
      bonusDays.add(k)
    } else if (l.event === 'generated_story' && !seenStory.has(k)) {
      seenStory.add(k) // reading your own story once a day is rewarded once
      xp = 5
    }
    if (xp) perDay.set(k, (perDay.get(k) || 0) + xp)
  }

  let xp = 0
  perDay.forEach(v => { xp += Math.min(v, DAILY_XP_CAP) })
  // consistency bonus: +10 per full run of 7 consecutive writing days
  const sorted = Array.from(bonusDays).sort()
  let run = 0
  for (let i = 0; i < sorted.length; i++) {
    const gapOk = i > 0 && (Date.parse(sorted[i]) - Date.parse(sorted[i - 1])) / 86400000 === 1
    run = gapOk ? run + 1 : 1
    if (run % 7 === 0) xp += 10
  }

  let cur: (typeof ARCADE_RANKS)[number] = ARCADE_RANKS[0]
  for (const r of ARCADE_RANKS) if (xp >= r.minXp) cur = r
  const next = ARCADE_RANKS.find(r => r.level === cur.level + 1) || null
  return {
    xp,
    level: cur.level,
    title: cur.title,
    nextTitle: next?.title ?? null,
    xpToNext: next ? next.minXp - xp : null,
    progress: next ? (xp - cur.minXp) / (next.minXp - cur.minXp) : 1,
    activeDays: bonusDays.size,
  }
}

/** One terminal-grid line, e.g. "LVL 3 ROUTINE  ▓▓▓▓░░░░░░  170 XP  → RHYTHM in 180" */
export function formatArcadeLine(a: ArcadeState): string {
  const filled = Math.round(a.progress * 10)
  const bar = '▓'.repeat(filled) + '░'.repeat(10 - filled)
  const tail = a.nextTitle ? `→ ${a.nextTitle} in ${a.xpToNext}` : 'MAX RANK'
  return `LVL ${a.level} ${a.title}  ${bar}  ${a.xp} XP  ${tail}`
}
