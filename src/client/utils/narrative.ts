import dayjs from '#client/utils/dayjs'

/**
 * Cleanness Narrative - Context and time-aware language
 *
 * Provides simple, purposeful narrative elements based on:
 * - Time of day (morning, afternoon, evening, night)
 * - Day of week (weekday vs weekend)
 * - Season
 * - User context (energy, patterns, activity)
 */

export type TimeOfDay = 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'late_night'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * Get current time of day
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = dayjs().hour()

  if (hour >= 4 && hour < 7) return 'early_morning'
  if (hour >= 7 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'midday'
  if (hour >= 14 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 21) return 'evening'
  if (hour >= 21 && hour < 23) return 'night'
  return 'late_night'
}

/**
 * Get current season
 */
export function getSeason(): Season {
  const month = dayjs().month() // 0-11

  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) return 'spring'  // Mar-May
  if (month >= 5 && month <= 7) return 'summer'  // Jun-Aug
  if (month >= 8 && month <= 10) return 'autumn' // Sep-Nov
  return 'winter' // Dec-Feb
}

/**
 * Check if it's a weekend
 */
export function isWeekend(): boolean {
  const day = dayjs().day() // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6
}

/**
 * Get day period greeting
 */
export function getDayPeriodGreeting(): string {
  const timeOfDay = getTimeOfDay()

  switch (timeOfDay) {
    case 'early_morning': return 'Early morning'
    case 'morning': return 'Morning'
    case 'midday': return 'Midday'
    case 'afternoon': return 'Afternoon'
    case 'evening': return 'Evening'
    case 'night': return 'Night'
    case 'late_night': return 'Late night'
  }
}

/**
 * Get time-aware planning prompts
 */
export function getPlanningPrompt(): string {
  const timeOfDay = getTimeOfDay()
  const weekend = isWeekend()

  if (timeOfDay === 'early_morning') {
    return 'The day begins'
  }

  if (timeOfDay === 'morning') {
    if (weekend) {
      return 'The morning unfolds'
    }
    return 'Morning momentum'
  }

  if (timeOfDay === 'midday') {
    return 'Midday clarity'
  }

  if (timeOfDay === 'afternoon') {
    return 'Afternoon focus'
  }

  if (timeOfDay === 'evening') {
    return 'Evening wind down'
  }

  if (timeOfDay === 'night') {
    return 'Night reflection'
  }

  return 'Late hours'
}

/**
 * Get energy-aware narrative
 */
export function getEnergyNarrative(level: number, trajectory: string): string {
  const timeOfDay = getTimeOfDay()

  // Critical energy
  if (level < 30) {
    if (trajectory === 'critical') {
      return 'Your reserves are depleted'
    }
    return 'Energy running low'
  }

  // Low energy
  if (level < 50) {
    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      return 'Natural depletion'
    }
    return 'Reserves diminishing'
  }

  // Moderate energy
  if (level < 70) {
    return 'Steady capacity'
  }

  // Good energy
  if (level < 85) {
    if (trajectory === 'improving') {
      return 'Building reserves'
    }
    return 'Good reserves'
  }

  // High energy
  return 'Full capacity'
}

/**
 * Get romantic connection narrative
 */
export function getRomanticNarrative(daysSince: number, quality: string): string {
  if (quality === 'deep') {
    return 'Recent intimacy'
  }

  if (quality === 'present') {
    return 'Connection alive'
  }

  if (quality === 'distant') {
    return 'Fading presence'
  }

  return 'Disconnected'
}

/**
 * Get memory reflection prompt based on time and quantum state
 *
 * Quantum-aware: adapts to user's energy, clarity, and alignment
 */
export function getMemoryReflectionPrompt(
  energy?: 'depleted' | 'low' | 'moderate' | 'high' | 'unknown',
  clarity?: 'confused' | 'uncertain' | 'clear' | 'focused' | 'unknown',
  alignment?: 'disconnected' | 'searching' | 'aligned' | 'flowing' | 'unknown'
): string {
  const timeOfDay = getTimeOfDay()

  // Quantum-aware prompts based on user state
  if (energy === 'depleted' || energy === 'low') {
    return 'Rest and remember.'
  }

  if (alignment === 'flowing' || (energy === 'high' && clarity === 'focused')) {
    return 'In this moment.'
  }

  if (clarity === 'confused' || alignment === 'searching') {
    return 'Notice.'
  }

  // Time-aware fallbacks
  if (timeOfDay === 'evening' || timeOfDay === 'night') {
    return 'Looking back.'
  }

  if (timeOfDay === 'morning' || timeOfDay === 'early_morning') {
    return 'Remember.'
  }

  return 'Recall.'
}

/**
 * Get narrative completion phrase
 */
export function getCompletionPhrase(action: 'plan' | 'check_in' | 'memory' | 'message'): string {
  const timeOfDay = getTimeOfDay()

  switch (action) {
    case 'plan':
      if (timeOfDay === 'morning') return 'Direction set.'
      if (timeOfDay === 'evening') return 'Path clear.'
      return 'Intention held.'

    case 'check_in':
      return 'Acknowledged'

    case 'memory':
      return 'Remembered'

    case 'message':
      return 'Sent'
  }
}

/**
 * Get intervention narrative based on context
 */
export function getInterventionNarrative(severity: 'low' | 'moderate' | 'high' | 'urgent'): string {
  const timeOfDay = getTimeOfDay()

  if (severity === 'urgent') {
    return 'Immediate care needed'
  }

  if (severity === 'high') {
    if (timeOfDay === 'night' || timeOfDay === 'late_night') {
      return 'Rest may help'
    }
    return 'Gentle attention needed'
  }

  if (severity === 'moderate') {
    return 'Worth tending'
  }

  return 'Notice this'
}

/**
 * Get chat catalyst narrative
 */
export function getChatCatalystNarrative(priority: number): string {
  if (priority >= 9) {
    return 'Strong resonance'
  }

  if (priority >= 7) {
    return 'Connection available'
  }

  if (priority >= 5) {
    return 'Possible link'
  }

  return 'Distant signal'
}

/**
 * Get narrative status based on day state
 */
export function getDayStateNarrative(): string {
  const timeOfDay = getTimeOfDay()
  const hour = dayjs().hour()

  // Very early
  if (hour >= 4 && hour < 6) {
    return 'Dawn approaches'
  }

  // Morning
  if (hour >= 6 && hour < 9) {
    return 'Morning rises'
  }

  // Late morning
  if (hour >= 9 && hour < 12) {
    return 'Day progresses'
  }

  // Afternoon
  if (hour >= 12 && hour < 15) {
    return 'Afternoon unfolds'
  }

  // Late afternoon
  if (hour >= 15 && hour < 18) {
    return 'Day wanes'
  }

  // Evening
  if (hour >= 18 && hour < 21) {
    return 'Evening settles'
  }

  // Night
  if (hour >= 21 && hour < 24) {
    return 'Night deepens'
  }

  // Late night
  return 'Late hours'
}
