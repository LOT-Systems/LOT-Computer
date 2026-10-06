/**
 * LOT SYSTEMS CORPORATION — Arcade evolution of the Operator (pure)
 *
 * Self-care first, game second: XP is earned by showing up and recording
 * context, never by volume of text. Rank is a pure function of log history,
 * so it can be recomputed anywhere and never drifts.
 */
import { countWords, dayKey, journalStreak, type StoryLogInput } from './logStory.js'

export const ARCADE_RANKS = [
  { name: 'RECRUIT',   xp: 0 },
  { name: 'SIGNAL',    xp: 50 },
  { name: 'OPERATOR',  xp: 150 },
  { name: 'ANALYST',   xp: 400 },
  { name: 'NAVIGATOR', xp: 900 },
  { name: 'ARCHITECT', xp: 1800 },
  { name: 'LOT-PRIME', xp: 3500 },
] as const

export interface ArcadeState {
  xp: number
  rank: string
  nextRank: string | null
  toNext: number
  streak: number
  entries: number
}

const XP_ENTRY = 5          // per journal entry
const XP_CONTEXT = 2        // entry carries context meta-data
const XP_DAY = 10           // per distinct active day
const XP_STREAK_DAY = 3     // per streak day, capped
const STREAK_CAP = 30
const ENTRY_WORD_CAP = 40   // words beyond this earn nothing: depth over volume

export function computeArcade(logs: StoryLogInput[], now: Date = new Date()): ArcadeState {
  const entries = logs.filter(l => l.event === 'note' && countWords(l.text) > 0)
  const days = new Set(entries.map(l => dayKey(new Date(l.createdAt))))
  const streak = journalStreak(logs, now)
  const xp =
    entries.reduce((a, l) => a + XP_ENTRY + (l.context && Object.keys(l.context).length ? XP_CONTEXT : 0)
      + Math.floor(Math.min(countWords(l.text), ENTRY_WORD_CAP) / 10), 0) +
    days.size * XP_DAY +
    Math.min(streak, STREAK_CAP) * XP_STREAK_DAY

  let idx = 0
  ARCADE_RANKS.forEach((r, i) => { if (xp >= r.xp) idx = i })
  const next = ARCADE_RANKS[idx + 1]
  return {
    xp,
    rank: ARCADE_RANKS[idx].name,
    nextRank: next ? next.name : null,
    toNext: next ? next.xp - xp : 0,
    streak,
    entries: entries.length,
  }
}

export function renderArcade(a: ArcadeState): string {
  const next = a.nextRank ? `${a.toNext} XP to ${a.nextRank}` : 'MAX RANK'
  return `RANK      ${a.rank}\nXP        ${a.xp} · ${next}\nSTREAK    ${a.streak} day${a.streak === 1 ? '' : 's'} · ${a.entries} entries`
}
