/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import dayjs from '#server/utils/dayjs'
import type { User, Log } from '#shared/types'
import { analyzeEnergyState } from '#server/utils/energy.js'
import { generateUserNarrative } from '#server/utils/rpg-narrative.js'

/**
 * Yearly Summary Generator — the /story year compression.
 *
 * Mirrors weekly-summary.ts / monthly-summary.ts in shape but scoped to
 * the trailing 365 days, rolled up by month. Deterministic — no AI
 * vendor call — the highest tier of compression: a year read as 12
 * monthly presence markers plus the dominant emotional throughline.
 */

export interface YearlySummary {
  period: {
    start: string
    end: string
  }
  presence: {
    activeMonths: number
    activeDays: number
    totalEntries: number
    consistency: 'devoted' | 'strong' | 'steady' | 'intermittent' | 'minimal'
  }
  energy: {
    averageLevel: number
    trajectory: string
  }
  patterns: {
    dominantEmotions: Array<{ emotion: string; count: number }>
    peakMonth: string | null
    quietestMonth: string | null
  }
  growth: {
    currentLevel: number
    totalAchievements: number
  }
  monthlyPresence: Array<{ month: string; entries: number }>
  narrative: string
  reflectionPrompt: string
}

export async function generateYearlySummary(user: User, logs: Log[]): Promise<YearlySummary> {
  const now = dayjs()
  const yearAgo = now.subtract(365, 'day')

  const yearLogs = logs.filter(log => dayjs(log.createdAt).isAfter(yearAgo))

  const period = { start: yearAgo.format('MMM YYYY'), end: now.format('MMM YYYY') }

  const uniqueDays = new Set(yearLogs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD')))
  const activeDays = uniqueDays.size
  const totalEntries = yearLogs.length

  // Roll up by calendar month within the window
  const monthCounts = new Map<string, number>()
  yearLogs.forEach(log => {
    const key = dayjs(log.createdAt).format('MMM YYYY')
    monthCounts.set(key, (monthCounts.get(key) || 0) + 1)
  })
  const monthlyPresence = Array.from(monthCounts.entries())
    .map(([month, entries]) => ({ month, entries }))
    .sort((a, b) => dayjs(a.month, 'MMM YYYY').valueOf() - dayjs(b.month, 'MMM YYYY').valueOf())
  const activeMonths = monthlyPresence.length

  let consistency: YearlySummary['presence']['consistency']
  if (activeMonths >= 11) consistency = 'devoted'
  else if (activeMonths >= 8) consistency = 'strong'
  else if (activeMonths >= 5) consistency = 'steady'
  else if (activeMonths >= 2) consistency = 'intermittent'
  else consistency = 'minimal'

  const sortedByEntries = [...monthlyPresence].sort((a, b) => b.entries - a.entries)
  const peakMonth = sortedByEntries[0]?.month || null
  const quietestMonth = sortedByEntries[sortedByEntries.length - 1]?.month || null

  const energyState = analyzeEnergyState(yearLogs)

  const emotionalCheckIns = yearLogs.filter(log => log.event === 'emotional_checkin')
  const emotionCounts = new Map<string, number>()
  emotionalCheckIns.forEach(log => {
    const emotion = log.metadata?.emotionalState as string
    if (emotion) emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1)
  })
  const dominantEmotions = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const narrativeState = generateUserNarrative(user, logs)
  const currentLevel = narrativeState.currentLevel
  const totalAchievements = narrativeState.achievements.filter(a => a.unlocked).length

  const narrative = generateYearlyNarrative({
    period,
    presence: { activeMonths, activeDays, totalEntries, consistency },
    energy: { averageLevel: energyState.currentLevel, trajectory: energyState.trajectory },
    patterns: { dominantEmotions, peakMonth, quietestMonth },
    growth: { currentLevel, totalAchievements },
    monthlyPresence,
  })

  const reflectionPrompt = consistency === 'minimal' || consistency === 'intermittent'
    ? 'What would make next year\'s record more continuous?'
    : 'Looking back across the year, what pattern do you want to carry forward?'

  return {
    period,
    presence: { activeMonths, activeDays, totalEntries, consistency },
    energy: { averageLevel: energyState.currentLevel, trajectory: energyState.trajectory },
    patterns: { dominantEmotions, peakMonth, quietestMonth },
    growth: { currentLevel, totalAchievements },
    monthlyPresence,
    narrative,
    reflectionPrompt,
  }
}

function generateYearlyNarrative(summary: Omit<YearlySummary, 'narrative' | 'reflectionPrompt'>): string {
  const lines: string[] = []

  lines.push(`${summary.period.start} — ${summary.period.end}`)
  lines.push('')

  lines.push(`${summary.presence.activeMonths} of the last 12 months carry an entry. ${summary.presence.totalEntries} total records across ${summary.presence.activeDays} days.`)

  const consistencyLine: Record<typeof summary.presence.consistency, string> = {
    devoted: 'A devoted year of presence.',
    strong: 'A strong year of presence.',
    steady: 'A steady year, with room between the entries.',
    intermittent: 'An intermittent year — the record comes and goes.',
    minimal: 'A minimal year of record. The door stayed open regardless.',
  }
  lines.push(consistencyLine[summary.presence.consistency])
  lines.push('')

  if (summary.patterns.peakMonth && summary.patterns.quietestMonth && summary.patterns.peakMonth !== summary.patterns.quietestMonth) {
    lines.push(`${summary.patterns.peakMonth} carried the most signal. ${summary.patterns.quietestMonth} carried the least.`)
  }

  if (summary.patterns.dominantEmotions.length > 0) {
    const top = summary.patterns.dominantEmotions[0]
    lines.push(`${top.emotion.charAt(0).toUpperCase() + top.emotion.slice(1)} was the throughline, appearing ${top.count} time${top.count !== 1 ? 's' : ''}.`)
  }

  if (summary.energy.averageLevel < 40) {
    lines.push(`Energy trended low across the year (${summary.energy.averageLevel}%).`)
  } else if (summary.energy.averageLevel < 60) {
    lines.push(`Energy held a steady middle across the year (${summary.energy.averageLevel}%).`)
  } else {
    lines.push(`Energy trended strong across the year (${summary.energy.averageLevel}%).`)
  }
  lines.push('')

  if (summary.growth.totalAchievements > 0) {
    lines.push(`${summary.growth.totalAchievements} achievement${summary.growth.totalAchievements !== 1 ? 's' : ''} unlocked. Level ${summary.growth.currentLevel}.`)
  }

  return lines.join('\n')
}
