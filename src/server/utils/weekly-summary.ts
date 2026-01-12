import dayjs from '#server/utils/dayjs'
import type { User, Log } from '#shared/types'
import { analyzeEnergyState } from './energy.js'
import { generateUserNarrative } from './rpg-narrative.js'
import { detectSemanticStruggle } from './compassionate-interventions.js'

/**
 * Weekly Summary Generator - Stand Report for Users
 *
 * Generates a comprehensive, narrative-style summary of the user's week
 * Presented through Memory Widget on Sundays or Mondays
 */

export interface WeeklySummary {
  period: {
    start: string
    end: string
    totalDays: number
  }
  presence: {
    activeDays: number
    totalEntries: number
    consistency: 'strong' | 'steady' | 'sporadic' | 'minimal'
  }
  energy: {
    averageLevel: number
    trajectory: string
    lowestDay: string | null
    highestDay: string | null
    romanticConnectionDays: number
  }
  patterns: {
    dominantEmotions: Array<{ emotion: string; count: number }>
    peakActivityHours: number[]
    strugglingDays: number
    breakthroughMoments: number
  }
  growth: {
    currentLevel: number
    newAchievements: number
    streakDays: number
    notableProgress: string[]
  }
  narrative: string
  reflectionPrompt: string
}

/**
 * Check if it's time for weekly summary
 * Sundays or Mondays, once per week
 */
export function shouldShowWeeklySummary(
  user: User,
  lastSummaryDate: Date | null
): boolean {
  const now = dayjs()
  const dayOfWeek = now.day() // 0 = Sunday, 1 = Monday

  // Show on Sunday or Monday
  if (dayOfWeek !== 0 && dayOfWeek !== 1) {
    return false
  }

  // If never shown, show it
  if (!lastSummaryDate) {
    return true
  }

  // Show if more than 6 days since last summary
  const daysSinceLastSummary = now.diff(dayjs(lastSummaryDate), 'day')
  return daysSinceLastSummary >= 6
}

/**
 * Generate weekly summary from user's logs
 */
export async function generateWeeklySummary(
  user: User,
  logs: Log[]
): Promise<WeeklySummary> {
  const now = dayjs()
  const weekAgo = now.subtract(7, 'day')

  // Filter logs from past 7 days
  const weekLogs = logs.filter(log =>
    dayjs(log.createdAt).isAfter(weekAgo)
  )

  // Calculate period
  const period = {
    start: weekAgo.format('MMM D'),
    end: now.format('MMM D'),
    totalDays: 7
  }

  // Analyze presence
  const uniqueDays = new Set(
    weekLogs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD'))
  )
  const activeDays = uniqueDays.size
  const totalEntries = weekLogs.length

  let consistency: 'strong' | 'steady' | 'sporadic' | 'minimal'
  if (activeDays >= 6) consistency = 'strong'
  else if (activeDays >= 4) consistency = 'steady'
  else if (activeDays >= 2) consistency = 'sporadic'
  else consistency = 'minimal'

  // Analyze energy
  const energyState = analyzeEnergyState(weekLogs)
  const dailyEnergy = new Map<string, number>()

  weekLogs.forEach(log => {
    const day = dayjs(log.createdAt).format('YYYY-MM-DD')
    // Simple heuristic: count entries as energy indicator
    dailyEnergy.set(day, (dailyEnergy.get(day) || 0) + 1)
  })

  let lowestDay: string | null = null
  let highestDay: string | null = null
  let minEnergy = Infinity
  let maxEnergy = -Infinity

  dailyEnergy.forEach((energy, day) => {
    if (energy < minEnergy) {
      minEnergy = energy
      lowestDay = dayjs(day).format('dddd')
    }
    if (energy > maxEnergy) {
      maxEnergy = energy
      highestDay = dayjs(day).format('dddd')
    }
  })

  // Count romantic connection days
  const romanticLogs = weekLogs.filter(log =>
    log.text && (
      log.text.toLowerCase().includes('partner') ||
      log.text.toLowerCase().includes('love') ||
      log.text.toLowerCase().includes('intimacy') ||
      log.text.toLowerCase().includes('romantic')
    )
  )
  const romanticDays = new Set(
    romanticLogs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD'))
  ).size

  // Analyze patterns
  const emotionalCheckIns = weekLogs.filter(log => log.event === 'emotional_checkin')
  const emotionCounts = new Map<string, number>()

  emotionalCheckIns.forEach(log => {
    const emotion = log.metadata?.emotionalState as string
    if (emotion) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1)
    }
  })

  const dominantEmotions = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // Peak activity hours
  const hourCounts = new Map<number, number>()
  weekLogs.forEach(log => {
    const hour = dayjs(log.createdAt).hour()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
  })

  const peakActivityHours = Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([hour]) => hour)

  // Detect struggling days
  const semanticAnalysis = detectSemanticStruggle(weekLogs)
  const strugglingDays = semanticAnalysis.isStruggling ?
    Math.min(Math.floor(semanticAnalysis.urgency / 2), 3) : 0

  // Breakthrough moments (plan_set, achievements, positive insights)
  const breakthroughMoments = weekLogs.filter(log =>
    log.event === 'plan_set' ||
    log.event === 'achievement_unlocked' ||
    (log.text && (
      log.text.toLowerCase().includes('breakthrough') ||
      log.text.toLowerCase().includes('clarity') ||
      log.text.toLowerCase().includes('realized')
    ))
  ).length

  // Growth metrics
  const narrative = generateUserNarrative(user, logs)
  const currentLevel = narrative.currentLevel

  const recentAchievements = narrative.achievements.filter(a =>
    a.unlocked && a.unlockedAt &&
    dayjs(a.unlockedAt).isAfter(weekAgo)
  )

  // Calculate streak
  const sortedDays = Array.from(uniqueDays).sort().reverse()
  let streakDays = 0
  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDay = now.subtract(i, 'day').format('YYYY-MM-DD')
    if (sortedDays[i] === expectedDay) {
      streakDays++
    } else {
      break
    }
  }

  const notableProgress: string[] = []
  if (activeDays >= 6) notableProgress.push('Showed up every day')
  if (romanticDays >= 2) notableProgress.push('Tended to romantic connection')
  if (breakthroughMoments >= 2) notableProgress.push('Multiple moments of clarity')
  if (streakDays >= 7) notableProgress.push('Maintained daily practice')
  if (recentAchievements.length > 0) {
    notableProgress.push(`Unlocked ${recentAchievements.length} achievement${recentAchievements.length > 1 ? 's' : ''}`)
  }

  // Generate narrative
  const narrativeText = generateWeeklyNarrative({
    period,
    presence: { activeDays, totalEntries, consistency },
    energy: {
      averageLevel: energyState.currentLevel,
      trajectory: energyState.trajectory,
      lowestDay,
      highestDay,
      romanticConnectionDays: romanticDays
    },
    patterns: { dominantEmotions, peakActivityHours, strugglingDays, breakthroughMoments },
    growth: {
      currentLevel,
      newAchievements: recentAchievements.length,
      streakDays,
      notableProgress
    }
  })

  const reflectionPrompt = generateReflectionPrompt(consistency, strugglingDays, notableProgress)

  return {
    period,
    presence: { activeDays, totalEntries, consistency },
    energy: {
      averageLevel: energyState.currentLevel,
      trajectory: energyState.trajectory,
      lowestDay,
      highestDay,
      romanticConnectionDays: romanticDays
    },
    patterns: {
      dominantEmotions,
      peakActivityHours,
      strugglingDays,
      breakthroughMoments
    },
    growth: {
      currentLevel,
      newAchievements: recentAchievements.length,
      streakDays,
      notableProgress
    },
    narrative: narrativeText,
    reflectionPrompt
  }
}

/**
 * Generate clean narrative from weekly data
 */
function generateWeeklyNarrative(summary: Omit<WeeklySummary, 'narrative' | 'reflectionPrompt'>): string {
  const lines: string[] = []

  // Opening: Period
  lines.push(`Week of ${summary.period.start} — ${summary.period.end}`)
  lines.push('')

  // Presence
  if (summary.presence.consistency === 'strong') {
    lines.push(`You showed up ${summary.presence.activeDays} days this week. Strong presence.`)
  } else if (summary.presence.consistency === 'steady') {
    lines.push(`${summary.presence.activeDays} days of practice this week. Steady rhythm.`)
  } else if (summary.presence.consistency === 'sporadic') {
    lines.push(`${summary.presence.activeDays} days this week. Your practice called for you.`)
  } else {
    lines.push(`Limited presence this week. The door remains open.`)
  }

  lines.push(`${summary.presence.totalEntries} total entries.`)
  lines.push('')

  // Energy
  if (summary.energy.averageLevel < 40) {
    lines.push(`Energy ran low this week (${summary.energy.averageLevel}%). Depletion noticed.`)
  } else if (summary.energy.averageLevel < 60) {
    lines.push(`Energy held steady around ${summary.energy.averageLevel}%. Baseline maintained.`)
  } else {
    lines.push(`Energy remained strong (${summary.energy.averageLevel}%). Reserves replenished.`)
  }

  if (summary.energy.lowestDay && summary.energy.highestDay) {
    lines.push(`${summary.energy.lowestDay} felt heaviest. ${summary.energy.highestDay} brought momentum.`)
  }

  if (summary.energy.romanticConnectionDays > 0) {
    lines.push(`${summary.energy.romanticConnectionDays} day${summary.energy.romanticConnectionDays > 1 ? 's' : ''} of romantic connection. Heart tended.`)
  }
  lines.push('')

  // Patterns
  if (summary.patterns.dominantEmotions.length > 0) {
    const topEmotion = summary.patterns.dominantEmotions[0]
    lines.push(`${topEmotion.emotion.charAt(0).toUpperCase() + topEmotion.emotion.slice(1)} emerged ${topEmotion.count} times.`)

    if (summary.patterns.dominantEmotions.length > 1) {
      const others = summary.patterns.dominantEmotions.slice(1)
        .map(e => e.emotion.toLowerCase())
        .join(', ')
      lines.push(`Also present: ${others}.`)
    }
  }

  if (summary.patterns.strugglingDays > 0) {
    lines.push(`${summary.patterns.strugglingDays} difficult day${summary.patterns.strugglingDays > 1 ? 's' : ''} detected. Struggle acknowledged.`)
  }

  if (summary.patterns.breakthroughMoments > 0) {
    lines.push(`${summary.patterns.breakthroughMoments} moment${summary.patterns.breakthroughMoments > 1 ? 's' : ''} of clarity.`)
  }
  lines.push('')

  // Growth
  if (summary.growth.notableProgress.length > 0) {
    lines.push('Progress this week:')
    summary.growth.notableProgress.forEach(progress => {
      lines.push(`• ${progress}`)
    })
  } else {
    lines.push('Seeds planted. Growth takes time.')
  }

  return lines.join('\n')
}

/**
 * Generate reflection prompt based on week
 */
function generateReflectionPrompt(
  consistency: string,
  strugglingDays: number,
  notableProgress: string[]
): string {
  if (strugglingDays >= 2) {
    return 'What support would help you most right now?'
  }

  if (consistency === 'strong' && notableProgress.length >= 3) {
    return 'What made this week work for you?'
  }

  if (consistency === 'minimal') {
    return 'What would help you return to your practice?'
  }

  return 'What matters most as you enter this new week?'
}
