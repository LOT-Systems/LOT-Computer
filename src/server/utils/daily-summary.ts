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
import { detectSemanticStruggle } from '#server/utils/compassionate-interventions.js'

/**
 * Daily Summary Generator — the /story day compression.
 *
 * Mirrors weekly-summary.ts / monthly-summary.ts in shape (period,
 * presence, energy, patterns, narrative) but scoped to the current
 * calendar day. Deterministic — no AI vendor call — so it is safe to
 * run offline and free to invoke as often as the operator types /story day.
 */

export interface DailySummary {
  period: {
    date: string
  }
  presence: {
    totalEntries: number
    activityBreakdown: Record<string, number>
  }
  energy: {
    averageLevel: number
    trajectory: string
  }
  patterns: {
    dominantEmotion: string | null
    strugglePresent: boolean
    breakthroughMoments: number
  }
  environment: {
    weatherDescription: string | null
    temperature: number | null
    astroRokuyo: string | null
    astroMoonPhase: string | null
  }
  narrative: string
  reflectionPrompt: string
}

export async function generateDailySummary(user: User, logs: Log[]): Promise<DailySummary> {
  const now = dayjs()
  const dayStart = now.startOf('day')

  const dayLogs = logs.filter(log => dayjs(log.createdAt).isAfter(dayStart))

  const period = { date: now.format('dddd, MMM D') }

  const activityBreakdown: Record<string, number> = {}
  dayLogs.forEach(log => {
    const event = log.event || 'note'
    activityBreakdown[event] = (activityBreakdown[event] || 0) + 1
  })
  const totalEntries = dayLogs.length

  const energyState = analyzeEnergyState(dayLogs)

  const emotionalCheckIns = dayLogs.filter(log => log.event === 'emotional_checkin')
  const emotionCounts = new Map<string, number>()
  emotionalCheckIns.forEach(log => {
    const emotion = log.metadata?.emotionalState as string
    if (emotion) emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1)
  })
  const dominantEmotion = Array.from(emotionCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null

  const semanticAnalysis = detectSemanticStruggle(dayLogs)
  const breakthroughMoments = dayLogs.filter(log =>
    log.event === 'plan_set' ||
    log.event === 'achievement_unlocked' ||
    (log.text && (
      log.text.toLowerCase().includes('breakthrough') ||
      log.text.toLowerCase().includes('clarity') ||
      log.text.toLowerCase().includes('realized')
    ))
  ).length

  // Environment context — most recent snapshot with the day's logs carries
  // the ambient weather/astrology reading (see getLogContext at write time).
  const withContext = dayLogs.filter(log => log.context && (log.context.temperature != null || log.context.astroRokuyo))
  const latestContext = withContext.length > 0 ? withContext[0].context : null
  const environment = {
    weatherDescription: (latestContext?.weatherDescription as string) || null,
    temperature: (latestContext?.temperature as number) ?? null,
    astroRokuyo: (latestContext?.astroRokuyo as string) || null,
    astroMoonPhase: (latestContext?.astroMoonPhase as string) || null,
  }

  const narrative = generateDailyNarrative({
    period,
    presence: { totalEntries, activityBreakdown },
    energy: { averageLevel: energyState.currentLevel, trajectory: energyState.trajectory },
    patterns: { dominantEmotion, strugglePresent: semanticAnalysis.isStruggling, breakthroughMoments },
    environment,
  })

  const reflectionPrompt = semanticAnalysis.isStruggling
    ? 'What is one thing that would ease tomorrow?'
    : breakthroughMoments > 0
      ? 'What made today\'s clarity possible?'
      : 'What is the one thing worth remembering about today?'

  return {
    period,
    presence: { totalEntries, activityBreakdown },
    energy: { averageLevel: energyState.currentLevel, trajectory: energyState.trajectory },
    patterns: { dominantEmotion, strugglePresent: semanticAnalysis.isStruggling, breakthroughMoments },
    environment,
    narrative,
    reflectionPrompt,
  }
}

function generateDailyNarrative(summary: Omit<DailySummary, 'narrative' | 'reflectionPrompt'>): string {
  const lines: string[] = []

  lines.push(summary.period.date)
  lines.push('')

  if (summary.presence.totalEntries === 0) {
    lines.push('No entries logged today. The record is quiet.')
  } else {
    lines.push(`${summary.presence.totalEntries} entr${summary.presence.totalEntries === 1 ? 'y' : 'ies'} logged today.`)
  }

  if (summary.energy.averageLevel < 40) {
    lines.push(`Energy ran low today (${summary.energy.averageLevel}%).`)
  } else if (summary.energy.averageLevel < 60) {
    lines.push(`Energy held steady around ${summary.energy.averageLevel}%.`)
  } else {
    lines.push(`Energy stayed strong today (${summary.energy.averageLevel}%).`)
  }

  if (summary.patterns.dominantEmotion) {
    lines.push(`${summary.patterns.dominantEmotion.charAt(0).toUpperCase() + summary.patterns.dominantEmotion.slice(1)} was the read of the day.`)
  }

  if (summary.patterns.strugglePresent) {
    lines.push('A difficult stretch showed in today\'s record. Acknowledged.')
  }

  if (summary.patterns.breakthroughMoments > 0) {
    lines.push(`${summary.patterns.breakthroughMoments} moment${summary.patterns.breakthroughMoments > 1 ? 's' : ''} of clarity today.`)
  }

  if (summary.environment.weatherDescription || summary.environment.astroRokuyo) {
    const envParts = [
      summary.environment.weatherDescription,
      summary.environment.temperature != null ? `${Math.round(summary.environment.temperature)}°` : null,
      summary.environment.astroRokuyo,
      summary.environment.astroMoonPhase,
    ].filter(Boolean)
    if (envParts.length > 0) {
      lines.push('')
      lines.push(`The day held: ${envParts.join(', ')}.`)
    }
  }

  return lines.join('\n')
}
