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
import { detectSemanticStruggle } from '#server/utils/compassionate-interventions.js'
import { analyzeUserPatterns, type PatternInsight } from '#server/utils/patterns.js'
import { determineUserCohort, extractUserTraits, generateMemoryStory } from '#server/utils/memory.js'

/**
 * Monthly Summary Generator - Plain LOT Style Review
 *
 * Generates a minimalist, narrative monthly review in plain text
 * Designed for email delivery at the start of each month
 */

export interface MonthlySummary {
  period: {
    month: string
    year: number
    totalDays: number
  }
  presence: {
    activeDays: number
    totalEntries: number
    consistency: 'exceptional' | 'strong' | 'steady' | 'intermittent' | 'minimal'
    longestStreak: number
  }
  energy: {
    averageLevel: number
    trajectory: string
    rangeLow: number
    rangeHigh: number
    romanticConnectionDays: number
  }
  patterns: {
    insights: PatternInsight[]
    dominantThemes: Array<{ theme: string; count: number }>
    peakActivityHours: number[]
    strugglingPeriods: number
    breakthroughMoments: number
    emotionalEvolution: string
  }
  growth: {
    currentLevel: number
    levelsGained: number
    newAchievements: number
    totalAchievements: number
    cohortEvolution: string
    notableProgress: string[]
  }
  narrative: string
  forwardLook: string
  memoryStory: string | null
  osVersion: string
  osState: string
}

/**
 * Check if it's time for monthly summary
 * First 3 days of the month, once per month
 */
export function shouldShowMonthlySummary(
  user: User,
  lastSummaryDate: Date | null
): boolean {
  const now = dayjs()
  const dayOfMonth = now.date()

  // Show in first 3 days of month
  if (dayOfMonth > 3) {
    return false
  }

  // If never shown, show it
  if (!lastSummaryDate) {
    return true
  }

  // Show if more than 25 days since last summary
  const daysSinceLastSummary = now.diff(dayjs(lastSummaryDate), 'day')
  return daysSinceLastSummary >= 25
}

/**
 * Generate monthly summary from user's logs
 */
export async function generateMonthlySummary(
  user: User,
  logs: Log[]
): Promise<MonthlySummary> {
  const now = dayjs()
  const lastMonth = now.subtract(1, 'month')
  const startOfMonth = lastMonth.startOf('month')
  const endOfMonth = lastMonth.endOf('month')

  // Filter logs from last complete month (inclusive of both boundaries)
  const monthLogs = logs.filter(log => {
    const logDate = dayjs(log.createdAt)
    return (logDate.isAfter(startOfMonth) || logDate.isSame(startOfMonth)) &&
           (logDate.isBefore(endOfMonth) || logDate.isSame(endOfMonth))
  })

  // Calculate period
  const period = {
    month: lastMonth.format('MMMM'),
    year: lastMonth.year(),
    totalDays: endOfMonth.date()
  }

  // Analyze presence
  const uniqueDays = new Set(
    monthLogs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD'))
  )
  const activeDays = uniqueDays.size
  const totalEntries = monthLogs.length

  // Calculate longest streak
  const sortedDays = Array.from(uniqueDays).sort()
  let longestStreak = 0
  let currentStreak = 0
  let previousDate: dayjs.Dayjs | null = null

  for (const day of sortedDays) {
    const currentDate = dayjs(day)
    if (previousDate && currentDate.diff(previousDate, 'day') === 1) {
      currentStreak++
    } else {
      currentStreak = 1
    }
    longestStreak = Math.max(longestStreak, currentStreak)
    previousDate = currentDate
  }

  let consistency: 'exceptional' | 'strong' | 'steady' | 'intermittent' | 'minimal'
  const consistencyRatio = activeDays / period.totalDays
  if (consistencyRatio >= 0.90) consistency = 'exceptional'
  else if (consistencyRatio >= 0.70) consistency = 'strong'
  else if (consistencyRatio >= 0.40) consistency = 'steady'
  else if (consistencyRatio >= 0.15) consistency = 'intermittent'
  else consistency = 'minimal'

  // Analyze energy across the month
  const energyState = analyzeEnergyState(monthLogs)
  const weeklyEnergy: number[] = []

  // Calculate weekly averages for range
  for (let i = 0; i < 4; i++) {
    const weekStart = startOfMonth.add(i * 7, 'day')
    const weekEnd = weekStart.add(7, 'day')
    const weekLogs = monthLogs.filter(log => {
      const logDate = dayjs(log.createdAt)
      return logDate.isAfter(weekStart) && logDate.isBefore(weekEnd)
    })
    if (weekLogs.length > 0) {
      weeklyEnergy.push(weekLogs.length * 15) // Rough heuristic
    }
  }

  const rangeLow = weeklyEnergy.length > 0 ? Math.min(...weeklyEnergy) : 0
  const rangeHigh = weeklyEnergy.length > 0 ? Math.max(...weeklyEnergy) : 0

  // Count romantic connection days
  const romanticLogs = monthLogs.filter(log =>
    log.text && (
      log.text.toLowerCase().includes('partner') ||
      log.text.toLowerCase().includes('love') ||
      log.text.toLowerCase().includes('intimacy') ||
      log.text.toLowerCase().includes('relationship') ||
      log.text.toLowerCase().includes('romantic')
    )
  )
  const romanticDays = new Set(
    romanticLogs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD'))
  ).size

  // Analyze patterns with advanced pattern recognition
  const patternInsights = await analyzeUserPatterns(user, monthLogs)

  // Extract dominant themes from log text
  const themeCounts = new Map<string, number>()
  const themeKeywords = [
    'work', 'career', 'family', 'health', 'energy', 'rest', 'creativity',
    'love', 'growth', 'learning', 'purpose', 'connection', 'solitude',
    'anxiety', 'peace', 'joy', 'gratitude', 'struggle', 'breakthrough'
  ]

  monthLogs.forEach(log => {
    if (log.text) {
      const text = log.text.toLowerCase()
      themeKeywords.forEach(theme => {
        if (text.includes(theme)) {
          themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1)
        }
      })
    }
  })

  const dominantThemes = Array.from(themeCounts.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Peak activity hours
  const hourCounts = new Map<number, number>()
  monthLogs.forEach(log => {
    const hour = dayjs(log.createdAt).hour()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
  })

  const peakActivityHours = Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => hour)

  // Detect struggling periods
  const semanticAnalysis = detectSemanticStruggle(monthLogs)
  const strugglingPeriods = semanticAnalysis.isStruggling ?
    Math.min(Math.floor(semanticAnalysis.urgency / 1.5), 7) : 0

  // Breakthrough moments
  const breakthroughMoments = monthLogs.filter(log =>
    log.event === 'plan_set' ||
    log.event === 'achievement_unlocked' ||
    (log.text && (
      log.text.toLowerCase().includes('breakthrough') ||
      log.text.toLowerCase().includes('clarity') ||
      log.text.toLowerCase().includes('realized') ||
      log.text.toLowerCase().includes('understanding')
    ))
  ).length

  // Emotional evolution
  const emotionalCheckIns = monthLogs.filter(log => log.event === 'emotional_checkin')
  const emotionalEvolution = analyzeEmotionalEvolution(emotionalCheckIns, startOfMonth, endOfMonth)

  // Growth metrics
  const narrative = generateUserNarrative(user, logs)
  const currentLevel = narrative.currentLevel

  // Calculate levels gained (assuming we had previous level stored)
  const monthAgoLogs = logs.filter(log =>
    dayjs(log.createdAt).isBefore(startOfMonth)
  )
  const previousNarrative = monthAgoLogs.length > 0 ? generateUserNarrative(user, monthAgoLogs) : narrative
  const levelsGained = Math.max(0, currentLevel - previousNarrative.currentLevel)

  // Recent achievements
  const recentAchievements = narrative.achievements.filter(a =>
    a.unlocked && a.unlockedAt &&
    dayjs(a.unlockedAt).isAfter(startOfMonth) &&
    dayjs(a.unlockedAt).isBefore(endOfMonth)
  )

  // Cohort evolution
  const userTraits = extractUserTraits(monthLogs)
  const cohort = determineUserCohort(userTraits.traits, userTraits.patterns, userTraits.psychologicalDepth)
  const cohortEvolution = describeCohortEvolution(cohort.behavioralCohort, userTraits)

  // Notable progress
  const notableProgress: string[] = []
  if (activeDays >= period.totalDays * 0.8) notableProgress.push('Exceptional consistency')
  if (longestStreak >= 14) notableProgress.push(`${longestStreak}-day streak maintained`)
  if (romanticDays >= 10) notableProgress.push('Regular romantic connection')
  if (breakthroughMoments >= 5) notableProgress.push('Multiple breakthrough moments')
  if (levelsGained >= 2) notableProgress.push(`Advanced ${levelsGained} levels`)
  if (recentAchievements.length >= 3) notableProgress.push(`Unlocked ${recentAchievements.length} achievements`)
  if (patternInsights.some(i => i.confidence >= 0.8)) notableProgress.push('Strong personal patterns emerged')

  // Generate narrative in plain LOT style
  const narrativeText = generateMonthlyNarrative({
    period,
    presence: { activeDays, totalEntries, consistency, longestStreak },
    energy: {
      averageLevel: energyState.currentLevel,
      trajectory: energyState.trajectory,
      rangeLow,
      rangeHigh,
      romanticConnectionDays: romanticDays
    },
    patterns: {
      insights: patternInsights,
      dominantThemes,
      peakActivityHours,
      strugglingPeriods,
      breakthroughMoments,
      emotionalEvolution
    },
    growth: {
      currentLevel,
      levelsGained,
      newAchievements: recentAchievements.length,
      totalAchievements: narrative.achievements.filter(a => a.unlocked).length,
      cohortEvolution,
      notableProgress
    }
  })

  const forwardLook = generateForwardLook(consistency, strugglingPeriods, notableProgress, cohort.behavioralCohort)

  // Generate Memory Story - narrative synthesis of user's answers
  let memoryStory: string | null = null
  try {
    // Only generate if user has answered Memory questions
    const answerLogs = logs.filter(log => log.event === 'answer')
    if (answerLogs.length >= 5) {
      memoryStory = await generateMemoryStory(user, logs)
      console.log(`📖 Generated Memory Story for monthly summary (${memoryStory?.length || 0} chars)`)
    } else {
      console.log('⏭️ Skipping Memory Story - insufficient answers')
    }
  } catch (error: any) {
    console.error('Failed to generate Memory Story for monthly summary:', error.message)
    memoryStory = null
  }

  // Calculate OS version from answer count and days since start
  const answerLogs = logs.filter(log => log.event === 'answer')
  const answerCount = answerLogs.length
  const firstLog = logs.length > 0
    ? logs.reduce((earliest, log) =>
        dayjs(log.createdAt).isBefore(dayjs(earliest.createdAt)) ? log : earliest
      )
    : null
  const daysSinceStart = firstLog
    ? dayjs().diff(dayjs(firstLog.createdAt), 'day')
    : 0

  const osVersion = calculateOSVersionFromMetrics(answerCount, daysSinceStart)
  const osState = determineOSState(answerCount, activeDays, period.totalDays)

  return {
    period,
    presence: { activeDays, totalEntries, consistency, longestStreak },
    energy: {
      averageLevel: energyState.currentLevel,
      trajectory: energyState.trajectory,
      rangeLow,
      rangeHigh,
      romanticConnectionDays: romanticDays
    },
    patterns: {
      insights: patternInsights,
      dominantThemes,
      peakActivityHours,
      strugglingPeriods,
      breakthroughMoments,
      emotionalEvolution
    },
    growth: {
      currentLevel,
      levelsGained,
      newAchievements: recentAchievements.length,
      totalAchievements: narrative.achievements.filter(a => a.unlocked).length,
      cohortEvolution,
      notableProgress
    },
    narrative: narrativeText,
    forwardLook,
    memoryStory,
    osVersion: osVersion.number,
    osState
  }
}

/**
 * Analyze emotional evolution across the month
 */
function analyzeEmotionalEvolution(
  checkIns: Log[],
  startOfMonth: dayjs.Dayjs,
  endOfMonth: dayjs.Dayjs
): string {
  if (checkIns.length < 3) {
    return 'Limited emotional data this month'
  }

  // Split month into thirds
  const monthLength = endOfMonth.diff(startOfMonth, 'day')
  const firstThird = startOfMonth.add(monthLength / 3, 'day')
  const secondThird = startOfMonth.add((monthLength * 2) / 3, 'day')

  const earlyEmotions = checkIns.filter(log =>
    dayjs(log.createdAt).isBefore(firstThird)
  ).map(log => log.metadata?.emotionalState as string).filter(Boolean)

  const midEmotions = checkIns.filter(log => {
    const date = dayjs(log.createdAt)
    return date.isAfter(firstThird) && date.isBefore(secondThird)
  }).map(log => log.metadata?.emotionalState as string).filter(Boolean)

  const lateEmotions = checkIns.filter(log =>
    dayjs(log.createdAt).isAfter(secondThird)
  ).map(log => log.metadata?.emotionalState as string).filter(Boolean)

  // Simplify to narrative
  if (earlyEmotions.length > 0 && lateEmotions.length > 0) {
    const earlyDominant = mostCommon(earlyEmotions)
    const lateDominant = mostCommon(lateEmotions)

    if (earlyDominant === lateDominant) {
      return `Steady ${earlyDominant} throughout`
    }
    return `Shifted from ${earlyDominant} to ${lateDominant}`
  }

  return 'Emotional landscape tracked'
}

/**
 * Describe cohort evolution
 */
function describeCohortEvolution(cohort: string, traits: any): string {
  const traitCount = Object.keys(traits).length

  if (traitCount >= 15) {
    return `Rich profile emerging (${cohort} cohort)`
  } else if (traitCount >= 8) {
    return `Clear patterns forming (${cohort} cohort)`
  } else {
    return `Profile developing (${cohort} cohort)`
  }
}

/**
 * Generate clean narrative in plain LOT style
 */
function generateMonthlyNarrative(summary: Omit<MonthlySummary, 'narrative' | 'forwardLook' | 'memoryStory' | 'osVersion' | 'osState'>): string {
  const lines: string[] = []

  // Header
  lines.push(`${summary.period.month} ${summary.period.year}`)
  lines.push('─'.repeat(summary.period.month.length + 5))
  lines.push('')

  // Presence - minimalist
  lines.push('Presence')
  if (summary.presence.consistency === 'exceptional') {
    lines.push(`${summary.presence.activeDays}/${summary.period.totalDays} days. Exceptional.`)
  } else if (summary.presence.consistency === 'strong') {
    lines.push(`${summary.presence.activeDays}/${summary.period.totalDays} days. Strong rhythm.`)
  } else if (summary.presence.consistency === 'steady') {
    lines.push(`${summary.presence.activeDays}/${summary.period.totalDays} days. Steady practice.`)
  } else if (summary.presence.consistency === 'intermittent') {
    lines.push(`${summary.presence.activeDays}/${summary.period.totalDays} days. Intermittent.`)
  } else {
    lines.push(`${summary.presence.activeDays}/${summary.period.totalDays} days. Seeds remain.`)
  }

  if (summary.presence.longestStreak >= 7) {
    lines.push(`Longest streak: ${summary.presence.longestStreak} days.`)
  }
  lines.push(`${summary.presence.totalEntries} total entries.`)
  lines.push('')

  // Energy - simple numbers
  lines.push('Energy')
  lines.push(`Average: ${summary.energy.averageLevel}%`)
  lines.push(`Range: ${summary.energy.rangeLow}-${summary.energy.rangeHigh}%`)
  lines.push(`Trajectory: ${summary.energy.trajectory}`)
  if (summary.energy.romanticConnectionDays > 0) {
    lines.push(`Romantic connection: ${summary.energy.romanticConnectionDays} days`)
  }
  lines.push('')

  // Patterns - what emerged
  lines.push('Patterns')
  if (summary.patterns.dominantThemes.length > 0) {
    const themes = summary.patterns.dominantThemes
      .slice(0, 3)
      .map(t => t.theme)
      .join(', ')
    lines.push(`Themes: ${themes}`)
  }

  if (summary.patterns.emotionalEvolution) {
    lines.push(summary.patterns.emotionalEvolution)
  }

  if (summary.patterns.strugglingPeriods > 0) {
    lines.push(`${summary.patterns.strugglingPeriods} difficult days noted`)
  }

  if (summary.patterns.breakthroughMoments > 0) {
    lines.push(`${summary.patterns.breakthroughMoments} moments of clarity`)
  }

  // Pattern insights if significant
  const strongInsights = summary.patterns.insights.filter(i => i.confidence >= 0.7)
  if (strongInsights.length > 0) {
    lines.push('')
    lines.push('Notable:')
    strongInsights.slice(0, 2).forEach(insight => {
      lines.push(`• ${insight.description}`)
    })
  }
  lines.push('')

  // Growth - numbers as creature evolution
  lines.push('Evolution')
  lines.push(`Level ${summary.growth.currentLevel}${summary.growth.levelsGained > 0 ? ` (+${summary.growth.levelsGained})` : ''}`)
  lines.push(`Achievements: ${summary.growth.newAchievements} unlocked | ${summary.growth.totalAchievements} total`)
  lines.push(summary.growth.cohortEvolution)

  if (summary.growth.notableProgress.length > 0) {
    lines.push('')
    summary.growth.notableProgress.forEach(progress => {
      lines.push(`• ${progress}`)
    })
  }

  return lines.join('\n')
}

/**
 * Generate forward-looking statement
 */
function generateForwardLook(
  consistency: string,
  strugglingPeriods: number,
  notableProgress: string[],
  cohort: string
): string {
  const lines: string[] = []

  lines.push('─'.repeat(40))
  lines.push('')

  if (strugglingPeriods >= 5) {
    lines.push('The door remains open.')
    lines.push('Support available when needed.')
  } else if (consistency === 'exceptional' && notableProgress.length >= 4) {
    lines.push('Strong foundation established.')
    lines.push('Continue building.')
  } else if (consistency === 'minimal') {
    lines.push('Practice awaits your return.')
  } else {
    lines.push('Month ahead holds space for you.')
  }

  return lines.join('\n')
}

/**
 * Utility: Find most common element
 */
function mostCommon<T>(arr: T[]): T | undefined {
  const counts = new Map<T, number>()
  arr.forEach(item => counts.set(item, (counts.get(item) || 0) + 1))
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0]
}

/**
 * Calculate OS version from user metrics (mirrors os-api.ts logic)
 */
function calculateOSVersionFromMetrics(answerCount: number, daysSinceStart: number): { number: string; name: string } {
  const versions = [
    { number: '0.1.0', name: 'Initializing', answers: 0, days: 0 },
    { number: '0.5.0', name: 'Emerging', answers: 7, days: 7 },
    { number: '1.0.0', name: 'Active', answers: 20, days: 14 },
    { number: '1.5.0', name: 'Engaged', answers: 50, days: 30 },
    { number: '2.0.0', name: 'Optimized', answers: 100, days: 60 },
    { number: '3.0.0', name: 'Integrated', answers: 200, days: 120 },
  ]

  let current = versions[0]
  for (const v of versions) {
    if (answerCount >= v.answers && daysSinceStart >= v.days) {
      current = v
    } else {
      break
    }
  }
  return current
}

/**
 * Determine OS state from engagement metrics
 */
function determineOSState(answerCount: number, activeDays: number, totalDays: number): string {
  const ratio = activeDays / totalDays
  if (answerCount === 0) return 'Initializing'
  if (ratio >= 0.8) return 'Optimized'
  if (ratio >= 0.4) return 'Engaged'
  if (ratio >= 0.15) return 'Active'
  return 'Dormant'
}

/**
 * Generate plain text email body
 */
export function generateMonthlyEmailBody(summary: MonthlySummary, userFirstName: string): string {
  const greeting = userFirstName ? userFirstName : 'there'

  // Build email sections
  const sections: string[] = []

  // Header
  sections.push(`${greeting},`)
  sections.push('')
  sections.push(`Your ${summary.period.month} review from LOT Systems.`)
  sections.push('')

  // Main narrative
  sections.push(summary.narrative)
  sections.push('')

  // Memory Story if available
  if (summary.memoryStory) {
    sections.push('─'.repeat(40))
    sections.push('')
    sections.push('Memory Story')
    sections.push('')
    sections.push(summary.memoryStory)
    sections.push('')
  }

  // Forward look
  sections.push(summary.forwardLook)
  sections.push('')

  // Footer
  sections.push('Continue at lot-systems.com')
  sections.push('')
  sections.push('—')
  sections.push('LOT Systems')
  sections.push('Patterns. Growth. Presence.')

  return sections.join('\n')
}

/**
 * Monthly Review HTML Email Template — User OS Style
 *
 * Mirrors the public profile page aesthetic:
 * - Clean, minimalist layout with label:value Block pattern
 * - User's theme colors (base + accent)
 * - OS version display, system metrics
 */

export interface MonthlyEmailTheme {
  baseColor: string
  accentColor: string
  themeName: string
}

export interface MonthlyEmailData {
  firstName: string
  period: { month: string; year: number; totalDays: number }
  osVersion: string
  osState: string
  presence: {
    activeDays: number
    totalEntries: number
    consistency: string
    longestStreak: number
  }
  energy: {
    averageLevel: number
    trajectory: string
    rangeLow: number
    rangeHigh: number
    romanticConnectionDays: number
  }
  patterns: {
    dominantThemes: Array<{ theme: string; count: number }>
    emotionalEvolution: string
    strugglingPeriods: number
    breakthroughMoments: number
    insights: Array<{ description: string; confidence: number }>
  }
  growth: {
    currentLevel: number
    levelsGained: number
    newAchievements: number
    totalAchievements: number
    cohortEvolution: string
    notableProgress: string[]
  }
  memoryStory: string | null
  forwardLook: string
  theme: MonthlyEmailTheme
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function blockRow(label: string, value: string, accentColor: string): string {
  return `
    <tr>
      <td style="width:170px;padding:4px 8px 4px 0;vertical-align:top;color:${accentColor};opacity:0.5;font-size:14px;">${escapeHtml(label)}</td>
      <td style="padding:4px 0;vertical-align:top;color:${accentColor};font-size:14px;">${escapeHtml(value)}</td>
    </tr>`
}

function htmlSectionHeader(title: string, accentColor: string): string {
  return `
    <tr>
      <td colspan="2" style="padding:32px 0 8px 0;color:${accentColor};font-size:14px;letter-spacing:0.5px;">
        ${escapeHtml(title)}
      </td>
    </tr>`
}

function htmlSeparator(accentColor: string): string {
  return `
    <tr>
      <td colspan="2" style="padding:16px 0;">
        <div style="border-top:1px solid ${accentColor};opacity:0.15;"></div>
      </td>
    </tr>`
}

export function generateMonthlyEmailHtml(data: MonthlyEmailData): string {
  const { baseColor, accentColor } = data.theme
  const greeting = data.firstName || 'there'

  const consistencyLabels: Record<string, string> = {
    exceptional: 'Exceptional',
    strong: 'Strong rhythm',
    steady: 'Steady practice',
    intermittent: 'Intermittent',
    minimal: 'Seeds remain',
  }
  const consistencyLabel = consistencyLabels[data.presence.consistency] || data.presence.consistency

  const strongInsights = data.patterns.insights.filter(i => i.confidence >= 0.7)

  const themes = data.patterns.dominantThemes
    .slice(0, 3)
    .map(t => t.theme)
    .join(', ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(data.period.month)} ${data.period.year} — Your LOT Review</title>
</head>
<body style="margin:0;padding:0;background-color:${baseColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${baseColor};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">

          <!-- Header: Name + Date -->
          <tr>
            <td style="padding:0 0 40px 0;">
              <div style="color:${accentColor};font-size:16px;margin-bottom:4px;">${escapeHtml(greeting)},</div>
              <div style="color:${accentColor};font-size:14px;opacity:0.5;">Your ${escapeHtml(data.period.month)} ${data.period.year} review from LOT Systems.</div>
            </td>
          </tr>

          <!-- OS Version Banner -->
          <tr>
            <td style="padding:0 0 32px 0;">
              <div style="color:${accentColor};font-size:13px;letter-spacing:1px;opacity:0.4;margin-bottom:4px;">SYSTEM STATUS</div>
              <div style="color:${accentColor};font-size:16px;">OS v.${escapeHtml(data.osVersion)} — ${escapeHtml(data.osState)}</div>
            </td>
          </tr>

          <!-- Separator -->
          <tr>
            <td style="padding:0 0 8px 0;">
              <div style="border-top:1px solid ${accentColor};opacity:0.15;"></div>
            </td>
          </tr>

          <!-- Main Metrics Table -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                ${htmlSectionHeader('Presence', accentColor)}
                ${blockRow('Days active:', `${data.presence.activeDays}/${data.period.totalDays}`, accentColor)}
                ${blockRow('Consistency:', consistencyLabel, accentColor)}
                ${data.presence.longestStreak >= 3 ? blockRow('Longest streak:', `${data.presence.longestStreak} days`, accentColor) : ''}
                ${blockRow('Total entries:', `${data.presence.totalEntries}`, accentColor)}

                ${htmlSeparator(accentColor)}

                ${htmlSectionHeader('Energy', accentColor)}
                ${blockRow('Average:', `${data.energy.averageLevel}%`, accentColor)}
                ${blockRow('Range:', `${data.energy.rangeLow}–${data.energy.rangeHigh}%`, accentColor)}
                ${blockRow('Trajectory:', data.energy.trajectory, accentColor)}
                ${data.energy.romanticConnectionDays > 0 ? blockRow('Connection:', `${data.energy.romanticConnectionDays} days`, accentColor) : ''}

                ${htmlSeparator(accentColor)}

                ${htmlSectionHeader('Patterns', accentColor)}
                ${themes ? blockRow('Themes:', themes, accentColor) : ''}
                ${data.patterns.emotionalEvolution ? blockRow('Emotional:', data.patterns.emotionalEvolution, accentColor) : ''}
                ${data.patterns.strugglingPeriods > 0 ? blockRow('Difficult days:', `${data.patterns.strugglingPeriods}`, accentColor) : ''}
                ${data.patterns.breakthroughMoments > 0 ? blockRow('Clarity moments:', `${data.patterns.breakthroughMoments}`, accentColor) : ''}
                ${strongInsights.length > 0 ? `
                <tr>
                  <td colspan="2" style="padding:8px 0 0 0;">
                    <div style="color:${accentColor};font-size:13px;opacity:0.5;margin-bottom:4px;">Notable:</div>
                    ${strongInsights.slice(0, 2).map(i => `<div style="color:${accentColor};font-size:14px;padding:2px 0 2px 12px;">&middot; ${escapeHtml(i.description)}</div>`).join('')}
                  </td>
                </tr>` : ''}

                ${htmlSeparator(accentColor)}

                ${htmlSectionHeader('Evolution', accentColor)}
                ${blockRow('Level:', `${data.growth.currentLevel}${data.growth.levelsGained > 0 ? ` (+${data.growth.levelsGained})` : ''}`, accentColor)}
                ${blockRow('Achievements:', `${data.growth.newAchievements} unlocked · ${data.growth.totalAchievements} total`, accentColor)}
                ${blockRow('Cohort:', data.growth.cohortEvolution, accentColor)}
                ${data.growth.notableProgress.length > 0 ? `
                <tr>
                  <td colspan="2" style="padding:8px 0 0 0;">
                    ${data.growth.notableProgress.map(p => `<div style="color:${accentColor};font-size:14px;padding:2px 0 2px 12px;">&middot; ${escapeHtml(p)}</div>`).join('')}
                  </td>
                </tr>` : ''}

              </table>
            </td>
          </tr>

          ${data.memoryStory ? `
          <!-- Memory Story -->
          <tr>
            <td style="padding:32px 0 0 0;">
              <div style="border-top:1px solid ${accentColor};opacity:0.15;margin-bottom:24px;"></div>
              <div style="color:${accentColor};font-size:13px;letter-spacing:0.5px;opacity:0.5;margin-bottom:12px;">Memory Story</div>
              <div style="color:${accentColor};font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.memoryStory)}</div>
            </td>
          </tr>` : ''}

          <!-- Forward Look -->
          <tr>
            <td style="padding:32px 0 0 0;">
              <div style="border-top:1px solid ${accentColor};opacity:0.15;margin-bottom:24px;"></div>
              <div style="color:${accentColor};font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.forwardLook.replace(/─+\n?\n?/g, '').trim())}</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:48px 0 0 0;">
              <div style="border-top:1px solid ${accentColor};opacity:0.15;margin-bottom:24px;"></div>
              <div style="color:${accentColor};font-size:14px;">
                <a href="https://lot-systems.com" style="color:${accentColor};text-decoration:underline;opacity:0.7;">Continue at lot-systems.com</a>
              </div>
              <div style="color:${accentColor};font-size:13px;opacity:0.35;margin-top:16px;">
                —<br>
                LOT Systems<br>
                Patterns. Growth. Presence.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
