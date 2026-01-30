import type { User, WeatherRecord } from '#shared/types'
import { PatternInsight } from './patterns'
import dayjs from '#server/utils/dayjs'

export interface ContextualPrompt {
  type: 'check-in' | 'suggestion' | 'insight' | 'connection'
  title: string
  message: string
  action?: {
    label: string
    target: 'mood' | 'memory' | 'sync' | 'log'
  }
  priority: number // 0-10, higher = more urgent/relevant
  triggeredBy: string // which pattern triggered this
}

/**
 * Generates contextual prompts based on user's patterns and current context
 */
export function generateContextualPrompts(
  patterns: PatternInsight[],
  currentContext: {
    hour: number
    weather?: WeatherRecord
    dayOfWeek: number
    recentCheckIns: any[]
  }
): ContextualPrompt[] {
  const prompts: ContextualPrompt[] = []

  for (const pattern of patterns) {
    // Weather-mood pattern triggers
    if (pattern.type === 'weather-mood' && currentContext.weather && currentContext.weather.tempKelvin) {
      const tempC = currentContext.weather.tempKelvin - 273.15
      const avgTemp = pattern.metadata?.avgTemp
      const emotionalState = pattern.metadata?.emotionalState

      // If current temp matches pattern temp (within 3°C)
      if (avgTemp && emotionalState && Math.abs(tempC - avgTemp) <= 3) {
        prompts.push({
          type: 'check-in',
          title: 'Weather match',
          message: `It's ${Math.round(tempC)}°C - you tend to feel ${emotionalState} in this weather. How are you now?`,
          action: {
            label: 'Check in',
            target: 'mood'
          },
          priority: 7,
          triggeredBy: pattern.title
        })
      }

      // Humidity patterns
      const humidity = currentContext.weather.humidity
      const avgHumidity = pattern.metadata?.avgHumidity

      if (avgHumidity && humidity !== null && Math.abs(humidity - avgHumidity) <= 10) {
        prompts.push({
          type: 'insight',
          title: 'Humidity awareness',
          message: `Humidity is ${humidity}% today. You've felt ${emotionalState} in similar conditions.`,
          priority: 5,
          triggeredBy: pattern.title
        })
      }
    }

    // Temporal pattern triggers
    if (pattern.type === 'temporal') {
      const peakHour = pattern.metadata?.peakHour
      const timeDesc = pattern.metadata?.timeDesc

      // If we're at or near peak hour
      if (peakHour && Math.abs(currentContext.hour - peakHour) <= 1) {
        prompts.push({
          type: 'suggestion',
          title: 'Peak energy time',
          message: `It's your ${timeDesc} energy peak. What will you create with this vitality?`,
          action: {
            label: 'Reflect',
            target: 'memory'
          },
          priority: 8,
          triggeredBy: pattern.title
        })
      }

      // Weekend vs weekday patterns
      const isWeekend = currentContext.dayOfWeek === 0 || currentContext.dayOfWeek === 6
      const weekendPct = pattern.metadata?.weekendPct
      const weekdayPct = pattern.metadata?.weekdayPct

      if (weekendPct && weekdayPct) {
        const higherOnWeekends = weekendPct > weekdayPct

        if (isWeekend && higherOnWeekends) {
          prompts.push({
            type: 'insight',
            title: 'Weekend energy',
            message: "Your weekend energy tends to be higher. How will you honor it today?",
            priority: 6,
            triggeredBy: pattern.title
          })
        } else if (!isWeekend && !higherOnWeekends) {
          prompts.push({
            type: 'insight',
            title: 'Weekday flow',
            message: "You thrive during weekdays. What's calling your focus today?",
            priority: 6,
            triggeredBy: pattern.title
          })
        }
      }
    }

    // Social-emotional pattern triggers
    if (pattern.type === 'social-emotional') {
      const emotionalState = pattern.metadata?.emotionalState
      const chatRate = pattern.metadata?.chatRate

      // Check if user recently checked in with this emotional state
      const recentState = currentContext.recentCheckIns.find(
        c => c.metadata?.emotionalState === emotionalState &&
        dayjs().diff(dayjs(c.createdAt), 'hour') < 2
      )

      if (recentState && chatRate > 0.6) {
        prompts.push({
          type: 'connection',
          title: 'Community connection',
          message: `You tend to connect with community when feeling ${emotionalState}. Others are online now.`,
          action: {
            label: 'Join community',
            target: 'sync'
          },
          priority: 7,
          triggeredBy: pattern.title
        })
      }
    }

    // Streak patterns
    if (pattern.type === 'streak') {
      const streakState = pattern.metadata?.state
      const streakLength = pattern.metadata?.length

      if (streakState && streakLength >= 3) {
        prompts.push({
          type: 'insight',
          title: 'Pattern awareness',
          message: `You maintained ${streakState} energy for ${streakLength} days. What supported that consistency?`,
          action: {
            label: 'Reflect',
            target: 'log'
          },
          priority: 5,
          triggeredBy: pattern.title
        })
      }
    }

    // Behavioral patterns
    if (pattern.type === 'behavioral') {
      const avgPerDay = pattern.metadata?.avgPerDay

      if (avgPerDay > 1.5) {
        prompts.push({
          type: 'insight',
          title: 'Deep engagement',
          message: `Your commitment to self-reflection is strong (${avgPerDay.toFixed(1)} answers/day). This is growth.`,
          priority: 4,
          triggeredBy: pattern.title
        })
      }
    }
  }

  // Sort by priority and limit to top 3
  return prompts
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
}

/**
 * Generates pattern evolution data for tracking changes over time
 */
export interface PatternEvolution {
  patternType: string
  patternTitle: string
  timeline: {
    week: string // ISO week (e.g., "2026-W01")
    confidence: number
    dataPoints: number
    value?: any // Pattern-specific value (e.g., avgTemp, peakHour)
  }[]
  trend: 'strengthening' | 'stable' | 'weakening' | 'emerging'
  firstSeen: string // ISO date
  lastSeen: string // ISO date
}

/**
 * Analyzes how patterns have evolved over time
 */
export function analyzePatternEvolution(
  historicalPatterns: {
    analyzedAt: string
    patterns: PatternInsight[]
  }[]
): PatternEvolution[] {
  const evolutionMap = new Map<string, PatternEvolution>()

  // Group patterns by title to track same pattern over time
  for (const snapshot of historicalPatterns) {
    const week = dayjs(snapshot.analyzedAt).format('GGGG-[W]WW')

    for (const pattern of snapshot.patterns) {
      const key = `${pattern.type}:${pattern.title}`

      if (!evolutionMap.has(key)) {
        evolutionMap.set(key, {
          patternType: pattern.type,
          patternTitle: pattern.title,
          timeline: [],
          trend: 'emerging',
          firstSeen: snapshot.analyzedAt,
          lastSeen: snapshot.analyzedAt
        })
      }

      const evolution = evolutionMap.get(key)!

      // Add timeline entry
      evolution.timeline.push({
        week,
        confidence: pattern.confidence,
        dataPoints: pattern.dataPoints,
        value: pattern.metadata?.avgTemp || pattern.metadata?.peakHour || null
      })

      evolution.lastSeen = snapshot.analyzedAt
    }
  }

  // Calculate trends
  for (const evolution of evolutionMap.values()) {
    if (evolution.timeline.length < 2) {
      evolution.trend = 'emerging'
      continue
    }

    // Compare first half to second half of timeline
    const midpoint = Math.floor(evolution.timeline.length / 2)
    const firstHalf = evolution.timeline.slice(0, midpoint)
    const secondHalf = evolution.timeline.slice(midpoint)

    const firstAvgConfidence = firstHalf.reduce((sum, t) => sum + t.confidence, 0) / firstHalf.length
    const secondAvgConfidence = secondHalf.reduce((sum, t) => sum + t.confidence, 0) / secondHalf.length

    const confidenceDelta = secondAvgConfidence - firstAvgConfidence

    if (confidenceDelta > 0.1) {
      evolution.trend = 'strengthening'
    } else if (confidenceDelta < -0.1) {
      evolution.trend = 'weakening'
    } else {
      evolution.trend = 'stable'
    }
  }

  return Array.from(evolutionMap.values())
    .sort((a, b) => {
      // Sort by trend importance: strengthening > stable > emerging > weakening
      const trendPriority = { strengthening: 3, stable: 2, emerging: 1, weakening: 0 }
      return trendPriority[b.trend] - trendPriority[a.trend]
    })
}

/**
 * Generates pattern-aware memory questions
 */
export function generatePatternAwareQuestion(
  patterns: PatternInsight[],
  currentContext: {
    hour: number
    weather?: WeatherRecord
    emotionalState?: string
  }
): string | null {
  // Find most relevant pattern for current context
  for (const pattern of patterns) {
    // Weather-mood pattern
    if (pattern.type === 'weather-mood' && currentContext.weather && currentContext.weather.tempKelvin) {
      const tempC = currentContext.weather.tempKelvin - 273.15
      const avgTemp = pattern.metadata?.avgTemp
      const emotionalState = pattern.metadata?.emotionalState

      if (avgTemp && emotionalState && Math.abs(tempC - avgTemp) <= 3) {
        return `You tend to feel ${emotionalState} in this weather. What does ${emotionalState} energy reveal about what you need right now?`
      }
    }

    // Temporal pattern
    if (pattern.type === 'temporal') {
      const peakHour = pattern.metadata?.peakHour

      if (peakHour && Math.abs(currentContext.hour - peakHour) <= 1) {
        return `You're at your energy peak. When you feel this vital, what matters most to you?`
      }
    }

    // Social-emotional pattern
    if (pattern.type === 'social-emotional' && currentContext.emotionalState) {
      const patternState = pattern.metadata?.emotionalState

      if (patternState === currentContext.emotionalState) {
        return `You often connect with others when feeling ${currentContext.emotionalState}. What do you seek in those connections?`
      }
    }
  }

  return null
}
