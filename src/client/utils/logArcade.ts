/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log Arcade
 *
 * Gamified evolution of the Log. The user never sees points while
 * writing — the rank is only surfaced on request (`/rank`, `/system`).
 * It rewards the *routine* of self-care journaling (showing up, rhythm,
 * exploring the system), never the content or the emotional valence of
 * an entry. A low mood day earns exactly the same XP as a high one.
 *
 * Pure module: deterministic, no stores, no DOM, no network.
 */

import { detectTriggers } from './logTriggers'

export interface ArcadeLogInput {
  event: string
  text?: string | null
  createdAt: string | Date
}

export interface ArcadeRank {
  id: number
  name: string
  minXp: number
}

/** Ordered ascending by minXp. Names stay calm — self-care, not combat. */
export const ARCADE_RANKS: ArcadeRank[] = [
  { id: 0, name: 'SIGNAL',    minXp: 0 },
  { id: 1, name: 'PULSE',     minXp: 100 },
  { id: 2, name: 'ROUTINE',   minXp: 300 },
  { id: 3, name: 'RHYTHM',    minXp: 700 },
  { id: 4, name: 'ANCHOR',    minXp: 1500 },
  { id: 5, name: 'ARCHIVIST', minXp: 3000 },
  { id: 6, name: 'NAVIGATOR', minXp: 6000 },
  { id: 7, name: 'KEEPER',    minXp: 12000 },
]

/** XP weights. Documented in docs/technical/LOT-LOG-AI-SYSTEM.md. */
export const ARCADE_WEIGHTS = {
  entry: 10,          // per journal entry …
  entriesPerDayCap: 5, // … counted up to this many per day (no grinding)
  activeDay: 5,       // per distinct day with ≥1 entry
  streakDay: 3,       // per day of the longest streak
  distinctCommand: 15, // per distinct slash command ever used
  story: 20,          // per generated story
} as const

export interface ArcadeState {
  xp: number
  rank: ArcadeRank
  nextRank: ArcadeRank | null
  /** 0–100 progress inside the current rank */
  progress: number
  entries: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  commandsUsed: number
  storiesGenerated: number
}

const JOURNAL_EVENTS = new Set(['log_entry', 'journal'])

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const DAY_MS = 24 * 60 * 60 * 1000

export function computeArcade(logs: ArcadeLogInput[], now: Date = new Date()): ArcadeState {
  const perDay = new Map<string, number>()
  const commands = new Set<string>()
  let entries = 0
  let stories = 0

  for (const l of logs) {
    const created = new Date(l.createdAt)
    if (isNaN(created.getTime())) continue
    if (l.event === 'generated_story') {
      stories++
      continue
    }
    if (!JOURNAL_EVENTS.has(l.event)) continue
    const text = (l.text || '').trim()
    if (!text) continue // empty drafts earn nothing
    entries++
    const key = dayKey(created)
    perDay.set(key, (perDay.get(key) || 0) + 1)
    for (const t of detectTriggers(text)) commands.add(t)
  }

  const days = Array.from(perDay.keys()).sort()

  // Longest streak over sorted day keys (noon-anchored to survive DST).
  let longest = 0
  let run = 0
  let prev: number | null = null
  for (const k of days) {
    const [y, m, d] = k.split('-').map(Number)
    const t = new Date(y, m - 1, d, 12).getTime()
    run = prev !== null && Math.round((t - prev) / DAY_MS) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = t
  }

  // Current streak: walk back from today; today may still be empty.
  let current = 0
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  if (!perDay.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (perDay.has(dayKey(cursor))) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }

  const w = ARCADE_WEIGHTS
  let cappedEntries = 0
  perDay.forEach(n => { cappedEntries += Math.min(n, w.entriesPerDayCap) })

  const xp =
    cappedEntries * w.entry +
    days.length * w.activeDay +
    longest * w.streakDay +
    commands.size * w.distinctCommand +
    stories * w.story

  let rank = ARCADE_RANKS[0]
  for (const r of ARCADE_RANKS) if (xp >= r.minXp) rank = r
  const nextRank = ARCADE_RANKS[rank.id + 1] || null
  const progress = nextRank
    ? Math.round(((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100

  return {
    xp,
    rank,
    nextRank,
    progress,
    entries,
    activeDays: days.length,
    currentStreak: current,
    longestStreak: longest,
    commandsUsed: commands.size,
    storiesGenerated: stories,
  }
}

/** Terminal-style read-out for `/rank`. */
export function renderArcade(a: ArcadeState): string {
  const bar = (pct: number) => {
    const filled = Math.round(pct / 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled)
  }
  const lines = [
    `RANK            ${a.rank.id} · ${a.rank.name}`,
    `XP              ${a.xp}${a.nextRank ? ` / ${a.nextRank.minXp}` : ' · MAX'}`,
    `PROGRESS        ${bar(a.progress)} ${a.progress}%`,
    a.nextRank ? `NEXT            ${a.nextRank.name}` : 'NEXT            —',
    `STREAK          ${a.currentStreak}D (BEST ${a.longestStreak}D)`,
    `ENTRIES         ${a.entries} OVER ${a.activeDays} DAYS`,
    `COMMANDS        ${a.commandsUsed} DISCOVERED`,
    `STORIES         ${a.storiesGenerated}`,
  ]
  return lines.join('\n')
}
