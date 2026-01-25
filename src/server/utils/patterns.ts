import type { Log, User } from '#shared/types'
import dayjs from '#server/utils/dayjs'

export interface PatternInsight {
  type: 'weather-mood' | 'temporal' | 'social-emotional' | 'streak' | 'behavioral'
  title: string
  description: string
  confidence: number // 0-1, how confident we are in this pattern
  dataPoints: number // how many observations support this
  metadata?: Record<string, any>
}

/**
 * Analyzes user logs to discover patterns and generate insights
 */
export async function analyzeUserPatterns(
  user: User,
  logs: Log[]
): Promise<PatternInsight[]> {
  const insights: PatternInsight[] = []

  // Filter logs with enough data
  const emotionalCheckIns = logs.filter(log => log.event === 'emotional_checkin')
  const chatMessages = logs.filter(log => log.event === 'chat_message')
  const answers = logs.filter(log => log.event === 'answer')

  // Need at least 5 check-ins for meaningful patterns
  if (emotionalCheckIns.length >= 5) {
    // Weather-mood correlations
    insights.push(...analyzeWeatherMoodPatterns(emotionalCheckIns))

    // Temporal patterns
    insights.push(...analyzeTemporalPatterns(emotionalCheckIns))

    // Streak detection
    insights.push(...analyzeStreaks(emotionalCheckIns))
  }

  // Social-emotional patterns (need both chat and check-ins)
  if (chatMessages.length >= 3 && emotionalCheckIns.length >= 3) {
    insights.push(...analyzeSocialEmotionalPatterns(chatMessages, emotionalCheckIns))
  }

  // Behavioral patterns from answers
  if (answers.length >= 10) {
    insights.push(...analyzeBehavioralPatterns(answers))
  }

  // Sort by confidence and limit to top insights
  return insights
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
}

/**
 * Finds correlations between weather conditions and emotional states
 */
function analyzeWeatherMoodPatterns(checkIns: Log[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Filter check-ins with weather context
  const withWeather = checkIns.filter(
    log => log.context?.temperature && log.metadata?.emotionalState
  )

  if (withWeather.length < 5) return insights

  // Group by emotional state
  const emotionalStates: Record<string, { temps: number[]; humidity: number[] }> = {}

  for (const log of withWeather) {
    const state = log.metadata.emotionalState as string
    const tempC = (log.context.temperature as number) - 273.15 // Kelvin to Celsius
    const humidity = log.context.humidity as number

    if (!emotionalStates[state]) {
      emotionalStates[state] = { temps: [], humidity: [] }
    }
    emotionalStates[state].temps.push(tempC)
    emotionalStates[state].humidity.push(humidity)
  }

  // Find patterns for each emotional state
  for (const [state, data] of Object.entries(emotionalStates)) {
    if (data.temps.length < 3) continue

    const avgTemp = data.temps.reduce((a, b) => a + b, 0) / data.temps.length
    const avgHumidity = data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length

    // Temperature preference pattern
    if (data.temps.length >= 3) {
      const tempRange = `${Math.round(avgTemp - 3)}-${Math.round(avgTemp + 3)}°C`
      const percentage = Math.round((data.temps.length / withWeather.length) * 100)

      insights.push({
        type: 'weather-mood',
        title: `${state.charAt(0).toUpperCase() + state.slice(1)} in ${tempRange}`,
        description: `You've felt ${state} ${percentage}% of the time when temperature is around ${Math.round(avgTemp)}°C`,
        confidence: Math.min(data.temps.length / 10, 0.95),
        dataPoints: data.temps.length,
        metadata: { emotionalState: state, avgTemp, tempRange }
      })
    }

    // Humidity pattern (if notable)
    if (data.humidity.length >= 3 && (avgHumidity > 70 || avgHumidity < 40)) {
      const humidityDesc = avgHumidity > 70 ? 'high humidity' : 'dry conditions'
      insights.push({
        type: 'weather-mood',
        title: `${state.charAt(0).toUpperCase() + state.slice(1)} during ${humidityDesc}`,
        description: `When humidity is around ${Math.round(avgHumidity)}%, you tend to feel ${state}`,
        confidence: Math.min(data.humidity.length / 10, 0.85),
        dataPoints: data.humidity.length,
        metadata: { emotionalState: state, avgHumidity, humidityDesc }
      })
    }
  }

  return insights
}

/**
 * Finds temporal patterns (time of day, day of week)
 */
function analyzeTemporalPatterns(checkIns: Log[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Group by hour of day
  const hourlyStates: Record<number, string[]> = {}
  const weekdayStates: Record<number, string[]> = {}

  for (const log of checkIns) {
    const date = dayjs(log.createdAt)
    const hour = date.hour()
    const weekday = date.day() // 0 = Sunday, 6 = Saturday
    const state = log.metadata?.emotionalState as string

    if (!state) continue

    if (!hourlyStates[hour]) hourlyStates[hour] = []
    if (!weekdayStates[weekday]) weekdayStates[weekday] = []

    hourlyStates[hour].push(state)
    weekdayStates[weekday].push(state)
  }

  // Find peak energy times
  const energyStates = ['energized', 'focused', 'joyful']
  let peakHour = -1
  let peakCount = 0

  for (const [hour, states] of Object.entries(hourlyStates)) {
    const energyCount = states.filter(s => energyStates.includes(s)).length
    if (energyCount > peakCount && states.length >= 2) {
      peakCount = energyCount
      peakHour = parseInt(hour)
    }
  }

  if (peakHour >= 0 && peakCount >= 2) {
    const timeDesc = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening'
    insights.push({
      type: 'temporal',
      title: `Peak energy in the ${timeDesc}`,
      description: `You tend to feel most energized around ${peakHour}:00`,
      confidence: Math.min(peakCount / 5, 0.9),
      dataPoints: peakCount,
      metadata: { peakHour, timeDesc }
    })
  }

  // Weekend vs weekday patterns
  const weekendDays = [0, 6] // Sunday, Saturday
  const weekendCheckIns = Object.entries(weekdayStates)
    .filter(([day]) => weekendDays.includes(parseInt(day)))
    .flatMap(([, states]) => states)

  const weekdayCheckIns = Object.entries(weekdayStates)
    .filter(([day]) => !weekendDays.includes(parseInt(day)))
    .flatMap(([, states]) => states)

  if (weekendCheckIns.length >= 3 && weekdayCheckIns.length >= 3) {
    const weekendEnergy = weekendCheckIns.filter(s => energyStates.includes(s)).length
    const weekdayEnergy = weekdayCheckIns.filter(s => energyStates.includes(s)).length
    const weekendPct = weekendEnergy / weekendCheckIns.length
    const weekdayPct = weekdayEnergy / weekdayCheckIns.length

    if (Math.abs(weekendPct - weekdayPct) > 0.2) {
      const higher = weekendPct > weekdayPct ? 'weekends' : 'weekdays'
      insights.push({
        type: 'temporal',
        title: `More energized on ${higher}`,
        description: `Your energy levels tend to be ${Math.round(Math.abs(weekendPct - weekdayPct) * 100)}% higher on ${higher}`,
        confidence: 0.75,
        dataPoints: weekendCheckIns.length + weekdayCheckIns.length,
        metadata: { weekendPct, weekdayPct }
      })
    }
  }

  return insights
}

/**
 * Detects emotional or behavioral streaks
 */
function analyzeStreaks(checkIns: Log[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Sort by date
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  let currentState: string | null = null
  let streakLength = 0
  let longestStreak = { state: '', length: 0 }

  for (const log of sorted) {
    const state = log.metadata?.emotionalState as string
    if (!state) continue

    if (state === currentState) {
      streakLength++
    } else {
      if (streakLength > longestStreak.length) {
        longestStreak = { state: currentState!, length: streakLength }
      }
      currentState = state
      streakLength = 1
    }
  }

  // Check final streak
  if (streakLength > longestStreak.length) {
    longestStreak = { state: currentState!, length: streakLength }
  }

  if (longestStreak.length >= 3) {
    insights.push({
      type: 'streak',
      title: `${longestStreak.length}-day ${longestStreak.state} streak`,
      description: `You maintained ${longestStreak.state} energy for ${longestStreak.length} consecutive check-ins`,
      confidence: 0.95,
      dataPoints: longestStreak.length,
      metadata: { state: longestStreak.state, length: longestStreak.length }
    })
  }

  return insights
}

/**
 * Finds correlations between social activity and emotional states
 */
function analyzeSocialEmotionalPatterns(
  chatMessages: Log[],
  emotionalCheckIns: Log[]
): PatternInsight[] {
  const insights: PatternInsight[] = []

  // For each emotional state, count how many chat messages occurred within 2 hours
  const emotionalStates: Record<string, { total: number; withChat: number }> = {}

  for (const checkIn of emotionalCheckIns) {
    const state = checkIn.metadata?.emotionalState as string
    if (!state) continue

    if (!emotionalStates[state]) {
      emotionalStates[state] = { total: 0, withChat: 0 }
    }

    emotionalStates[state].total++

    // Check if any chat messages within 2 hours after check-in
    const checkInTime = new Date(checkIn.createdAt).getTime()
    const twoHoursMs = 2 * 60 * 60 * 1000

    const hadChat = chatMessages.some(msg => {
      const msgTime = new Date(msg.createdAt).getTime()
      return msgTime >= checkInTime && msgTime <= checkInTime + twoHoursMs
    })

    if (hadChat) {
      emotionalStates[state].withChat++
    }
  }

  // Find states with strong correlation to chat activity
  for (const [state, data] of Object.entries(emotionalStates)) {
    if (data.total < 3) continue

    const chatRate = data.withChat / data.total

    if (chatRate > 0.6) {
      insights.push({
        type: 'social-emotional',
        title: `Social when ${state}`,
        description: `You tend to engage with community ${Math.round(chatRate * 100)}% of the time when feeling ${state}`,
        confidence: Math.min(data.total / 10, 0.85),
        dataPoints: data.total,
        metadata: { emotionalState: state, chatRate }
      })
    }
  }

  return insights
}

/**
 * Analyzes behavioral patterns from memory answers
 */
function analyzeBehavioralPatterns(answers: Log[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Analyze answer frequency over time
  const sorted = [...answers].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const firstAnswer = sorted[0]
  const lastAnswer = sorted[sorted.length - 1]
  const daysBetween = dayjs(lastAnswer.createdAt).diff(dayjs(firstAnswer.createdAt), 'day')

  if (daysBetween > 0) {
    const avgPerDay = answers.length / daysBetween

    if (avgPerDay > 1.5) {
      insights.push({
        type: 'behavioral',
        title: 'Highly engaged with Memory',
        description: `You answer an average of ${avgPerDay.toFixed(1)} questions per day`,
        confidence: 0.9,
        dataPoints: answers.length,
        metadata: { avgPerDay, daysBetween }
      })
    }
  }

  return insights
}

/**
 * Finds cohort matches - users with similar patterns
 */
export interface CohortMatch {
  user: {
    id: string
    firstName: string
    lastName: string
    city: string
    country: string
    archetype?: string
  }
  similarity: number // 0-1, how similar
  sharedPatterns: string[]
}

export async function findCohortMatches(
  targetUser: User,
  targetPatterns: PatternInsight[],
  allUsers: User[],
  getUserPatterns: (userId: string) => Promise<PatternInsight[]>
): Promise<CohortMatch[]> {
  const matches: CohortMatch[] = []

  for (const user of allUsers) {
    // Skip self and users without location
    if (user.id === targetUser.id || !user.city || !user.country) continue

    const userPatterns = await getUserPatterns(user.id)

    // Calculate similarity
    const sharedPatterns: string[] = []
    let similarityScore = 0

    // Same location bonus
    if (user.city === targetUser.city && user.country === targetUser.country) {
      similarityScore += 0.3
      sharedPatterns.push(`Both in ${user.city}`)
    } else if (user.country === targetUser.country) {
      similarityScore += 0.1
      sharedPatterns.push(`Both in ${user.country}`)
    }

    // Same archetype bonus
    if (
      user.metadata?.archetype &&
      targetUser.metadata?.archetype &&
      user.metadata.archetype === targetUser.metadata.archetype
    ) {
      similarityScore += 0.2
      sharedPatterns.push(`Both ${user.metadata.archetype}s`)
    }

    // Pattern overlap
    for (const targetPattern of targetPatterns) {
      const matchingPattern = userPatterns.find(
        p => p.type === targetPattern.type && p.title === targetPattern.title
      )

      if (matchingPattern) {
        similarityScore += 0.15
        sharedPatterns.push(targetPattern.title)
      }
    }

    // Only include if similarity is meaningful
    if (similarityScore >= 0.3 && sharedPatterns.length > 0) {
      matches.push({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city,
          country: user.country,
          archetype: user.metadata?.archetype as string | undefined
        },
        similarity: Math.min(similarityScore, 1),
        sharedPatterns
      })
    }
  }

  // Sort by similarity and limit to top 5
  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
}
