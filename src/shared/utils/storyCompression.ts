/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — turns a window of Log rows into a compact,
 * deterministic digest (counts, context aggregates, spikes, streak)
 * that is fed to the LLM instead of raw entries.
 *
 * Pure: no I/O. The digest is built BEFORE any vendor call, so the
 * vendor (Together AI) only ever sees compressed, minimal context.
 *
 * Doc: docs/technical/LOT-LOG-COMMAND-SYSTEM.md
 */

import type { StoryRange } from './logCommands.js'
import { STORY_RANGE_DAYS } from './logCommands.js'

export interface DigestLogRow {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export interface StoryDigest {
  range: StoryRange
  windowDays: number | null
  entryCount: number
  activeDays: number
  streakDays: number
  /** Entries by part of day. */
  dayparts: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  avgTempC: number | null
  avgHumidity: number | null
  topCities: string[]
  topWeather: string[]
  topMoonPhases: string[]
  moods: string[]
  /** Human-readable flags: volume spike, silence gap, mood shift. */
  spikes: string[]
  /** Newest-first trimmed excerpts, capped by caller. */
  excerpts: string[]
}

// 'note' is what the Log editor persists; the others are legacy event names.
const ENTRY_EVENTS = new Set(['note', 'log_entry', 'journal'])
const DAY_MS = 86_400_000

const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v))
const dayKey = (d: Date) => d.toISOString().slice(0, 10)

function top(counts: Map<string, number>, n: number): string[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([k]) => k)
}

function bump(m: Map<string, number>, k?: string | null) {
  if (!k) return
  m.set(k, (m.get(k) || 0) + 1)
}

/** Consecutive active days ending today or yesterday. */
export function computeStreak(activeDayKeys: Set<string>, now: Date): number {
  let streak = 0
  let cursor = new Date(now.getTime())
  if (!activeDayKeys.has(dayKey(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  while (activeDayKeys.has(dayKey(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  return streak
}

export function buildStoryDigest(
  rows: DigestLogRow[],
  range: StoryRange,
  now: Date = new Date(),
  maxExcerpts = 8
): StoryDigest {
  const windowDays = range === 'recent' ? null : STORY_RANGE_DAYS[range]
  const since = windowDays ? now.getTime() - windowDays * DAY_MS : 0

  const inWindow = rows
    .filter(r => toDate(r.createdAt).getTime() >= since)
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())

  const entries = inWindow.filter(r => ENTRY_EVENTS.has(r.event) && (r.text || '').trim())
  const cities = new Map<string, number>()
  const weather = new Map<string, number>()
  const moons = new Map<string, number>()
  const perDay = new Map<string, number>()
  const dayparts = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  let tempSum = 0, tempN = 0, humSum = 0, humN = 0

  for (const e of entries) {
    const d = toDate(e.createdAt)
    const k = dayKey(d)
    perDay.set(k, (perDay.get(k) || 0) + 1)
    const h = d.getUTCHours()
    // Daypart from entry's own timezone when present, else UTC.
    let hour = h
    const tz = e.context?.timeZone
    if (tz) {
      try {
        hour = Number(
          new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: tz }).format(d)
        ) % 24
      } catch { /* bad tz — keep UTC */ }
    }
    if (hour < 6) dayparts.night++
    else if (hour < 12) dayparts.morning++
    else if (hour < 18) dayparts.afternoon++
    else dayparts.evening++

    const c = e.context || {}
    bump(cities, c.city)
    bump(weather, c.weatherDescription)
    bump(moons, c.astroMoonPhase)
    if (typeof c.temperature === 'number' && c.temperature > 0) { tempSum += c.temperature - 273.15; tempN++ }
    if (typeof c.humidity === 'number') { humSum += c.humidity; humN++ }
  }

  const moods = inWindow
    .filter(r => r.event === 'emotional_checkin')
    .map(r => String(r.metadata?.emotionalState || '').toUpperCase())
    .filter(Boolean)

  const spikes: string[] = []
  const counts = [...perDay.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  if (counts.length >= 3) {
    const vals = counts.map(c => c[1])
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    const peak = counts.reduce((a, b) => (b[1] > a[1] ? b : a))
    if (peak[1] >= Math.max(3, mean * 2)) {
      spikes.push(`VOLUME SPIKE ${peak[0]}: ${peak[1]} entries (avg ${mean.toFixed(1)})`)
    }
  }
  if (windowDays && windowDays > 1 && counts.length) {
    const lastKey = counts[counts.length - 1][0]
    const gap = Math.floor((now.getTime() - new Date(lastKey + 'T00:00:00Z').getTime()) / DAY_MS)
    if (gap >= 3) spikes.push(`SILENCE: ${gap} days since last entry`)
  }
  if (moods.length >= 4) {
    // moods is newest-first; compare newer half vs older half dominant mood.
    const half = Math.floor(moods.length / 2)
    const dom = (a: string[]) => {
      const m = new Map<string, number>()
      a.forEach(x => bump(m, x))
      return top(m, 1)[0]
    }
    const recent = dom(moods.slice(0, half)), prior = dom(moods.slice(half))
    if (recent && prior && recent !== prior) spikes.push(`MOOD SHIFT: ${prior} → ${recent}`)
  }

  const activeKeys = new Set(
    rows.filter(r => ENTRY_EVENTS.has(r.event)).map(r => dayKey(toDate(r.createdAt)))
  )

  return {
    range,
    windowDays,
    entryCount: entries.length,
    activeDays: perDay.size,
    streakDays: computeStreak(activeKeys, now),
    dayparts,
    avgTempC: tempN ? Math.round((tempSum / tempN) * 10) / 10 : null,
    avgHumidity: humN ? Math.round(humSum / humN) : null,
    topCities: top(cities, 2),
    topWeather: top(weather, 2),
    topMoonPhases: top(moons, 2),
    moods: moods.slice(0, 8),
    spikes,
    excerpts: entries.slice(0, maxExcerpts).map(e => (e.text || '').trim().substring(0, 200)),
  }
}

/** Compact text block for the LLM prompt. Deterministic and small. */
export function formatDigestForPrompt(d: StoryDigest): string {
  const span = d.windowDays ? `LAST ${d.windowDays} DAY(S)` : 'RECENT'
  const dp = d.dayparts
  return [
    `WINDOW: ${span}`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays} active day(s) · STREAK ${d.streakDays}d`,
    `DAYPARTS: night ${dp.night} · morning ${dp.morning} · afternoon ${dp.afternoon} · evening ${dp.evening}`,
    `CONTEXT: ${[
      d.avgTempC !== null ? `avg ${d.avgTempC}°C` : null,
      d.avgHumidity !== null ? `humidity ${d.avgHumidity}%` : null,
      d.topCities.length ? `places ${d.topCities.join(', ')}` : null,
      d.topWeather.length ? `sky ${d.topWeather.join(', ')}` : null,
      d.topMoonPhases.length ? `moon ${d.topMoonPhases.join(', ')}` : null,
    ].filter(Boolean).join(' · ') || 'none'}`,
    `MOODS (newest first): ${d.moods.join(', ') || 'NO DATA'}`,
    `FLAGS: ${d.spikes.join(' | ') || 'none'}`,
    'EXCERPTS (newest first):',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ].join('\n')
}
