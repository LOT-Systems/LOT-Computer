import type { Log, User } from '#shared/types'
import { EnergyState } from './energy'
import dayjs from '#server/utils/dayjs'

export interface Intervention {
  type: 'gentle_warning' | 'urgent_care' | 'celebration' | 'permission' | 'validation' | 'pattern_awareness'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  suggestion?: string
  action?: {
    label: string
    target: 'rest' | 'connect' | 'reflect' | 'release'
  }
}

export interface UserState {
  emotionalPattern: {
    dominantMood: string
    daysInPattern: number
    isStrugglingPattern: boolean
  }
  energyState: EnergyState
  recentLogs: Log[]
  romanticConnectionState: {
    daysDisconnected: number
    qualityLevel: string
  }
}

/**
 * Semantic analysis: Detect struggle beyond just keywords
 * Looks for: intensity, frequency, combinations, context
 */
function detectSemanticStruggle(logs: Log[]): {
  isStruggling: boolean
  struggleThemes: string[]
  urgency: number // 0-10
} {
  const recentLogs = logs.filter(log =>
    dayjs().diff(dayjs(log.createdAt), 'day') <= 7
  )

  const struggleThemes: string[] = []
  let struggleScore = 0

  // Check emotional check-ins
  const checkIns = recentLogs.filter(l => l.event === 'emotional_checkin')
  const negativeStates = ['anxious', 'overwhelmed', 'exhausted', 'tired', 'restless', 'uncertain']

  const negativeCheckIns = checkIns.filter(c =>
    negativeStates.includes(c.metadata?.emotionalState as string)
  )

  // High frequency of negative states
  const negativeRatio = negativeCheckIns.length / Math.max(checkIns.length, 1)
  if (negativeRatio > 0.6) {
    struggleScore += 5
    struggleThemes.push('persistent difficult emotions')
  }

  // Consecutive negative states (more concerning than scattered)
  let consecutiveNegative = 0
  let maxConsecutive = 0
  for (const checkIn of checkIns) {
    if (negativeStates.includes(checkIn.metadata?.emotionalState as string)) {
      consecutiveNegative++
      maxConsecutive = Math.max(maxConsecutive, consecutiveNegative)
    } else {
      consecutiveNegative = 0
    }
  }

  if (maxConsecutive >= 3) {
    struggleScore += 7
    struggleThemes.push('sustained emotional difficulty')
  }

  // Semantic analysis of log text (looking for meaning, not just keywords)
  const notes = recentLogs.filter(l => l.event === 'note' && l.text)

  for (const note of notes) {
    const text = (note.text || '').toLowerCase()

    // Despair indicators (semantic clusters)
    const despairPhrases = [
      "can't", "don't know", "feel lost", "too much", "give up",
      "nothing helps", "pointless", "broken", "empty", "numb"
    ]
    const hasDespair = despairPhrases.some(phrase => text.includes(phrase))
    if (hasDespair) {
      struggleScore += 3
      if (!struggleThemes.includes('despair')) struggleThemes.push('despair')
    }

    // Isolation indicators
    const isolationPhrases = [
      "alone", "no one", "nobody understands", "by myself",
      "can't reach out", "withdrawn", "isolate", "distance"
    ]
    const hasIsolation = isolationPhrases.some(phrase => text.includes(phrase))
    if (hasIsolation) {
      struggleScore += 3
      if (!struggleThemes.includes('isolation')) struggleThemes.push('isolation')
    }

    // Exhaustion indicators (beyond the emotion)
    const exhaustionPhrases = [
      "so tired", "can't keep", "running on empty", "burnout",
      "no energy", "drained", "depleted", "barely function"
    ]
    const hasExhaustion = exhaustionPhrases.some(phrase => text.includes(phrase))
    if (hasExhaustion) {
      struggleScore += 4
      if (!struggleThemes.includes('exhaustion')) struggleThemes.push('exhaustion')
    }

    // Relationship struggle indicators
    const relationshipStruggles = [
      "fight", "argument", "distant", "disconnect", "tension",
      "hurt", "misunderstood", "conflict", "alone in relationship"
    ]
    const hasRelationshipStruggles = relationshipStruggles.some(phrase => text.includes(phrase))
    if (hasRelationshipStruggles) {
      struggleScore += 3
      if (!struggleThemes.includes('relationship strain')) struggleThemes.push('relationship strain')
    }
  }

  // Absence of positive activities (semantic void)
  const selfCareCount = recentLogs.filter(l => l.event === 'self_care_completed').length
  const chatCount = recentLogs.filter(l => l.event === 'chat_message').length
  const positiveCheckIns = checkIns.filter(c => {
    const state = c.metadata?.emotionalState as string
    return ['calm', 'peaceful', 'grateful', 'content', 'joyful', 'fulfilled'].includes(state)
  })

  if (selfCareCount === 0 && chatCount === 0 && positiveCheckIns.length === 0) {
    struggleScore += 4
    struggleThemes.push('absence of replenishment')
  }

  const urgency = Math.min(10, struggleScore)
  const isStruggling = urgency >= 5

  return {
    isStruggling,
    struggleThemes,
    urgency
  }
}

/**
 * Generate compassionate interventions based on user state
 */
export function generateCompassionateInterventions(userState: UserState): Intervention[] {
  const interventions: Intervention[] = []

  // Detect semantic struggle
  const struggleAnalysis = detectSemanticStruggle(userState.recentLogs)

  // CRITICAL: Sustained overwhelming difficulty
  if (struggleAnalysis.urgency >= 9) {
    interventions.push({
      type: 'urgent_care',
      severity: 'critical',
      title: 'Please pause',
      message: `I see you're carrying something heavy. ${struggleAnalysis.struggleThemes.join(', ')}. You don't have to carry this alone.`,
      suggestion: 'Consider reaching out to someone you trust, or simply allow yourself to rest completely.',
      action: {
        label: 'I need support',
        target: 'connect'
      }
    })
  }

  // HIGH: Prolonged difficult emotional pattern
  else if (userState.emotionalPattern.isStrugglingPattern &&
           userState.emotionalPattern.daysInPattern >= 3) {

    interventions.push({
      type: 'gentle_warning',
      severity: 'high',
      title: 'Pattern noticed',
      message: `You've felt ${userState.emotionalPattern.dominantMood} for ${userState.emotionalPattern.daysInPattern} days. Your system is signaling something.`,
      suggestion: 'What would help shift this? Sometimes the smallest change creates space.',
      action: {
        label: 'Reflect on this',
        target: 'reflect'
      }
    })
  }

  // MEDIUM-HIGH: Energy depletion with burnout risk
  if (userState.energyState.daysUntilBurnout !== null &&
      userState.energyState.daysUntilBurnout <= 5) {

    interventions.push({
      type: 'gentle_warning',
      severity: 'high',
      title: 'Burnout approaching',
      message: `At this pace, you'll reach burnout in ${userState.energyState.daysUntilBurnout} days. This is not sustainable.`,
      suggestion: 'What can you release? What can wait? Your well-being cannot.',
      action: {
        label: 'What can I release?',
        target: 'release'
      }
    })
  }

  // MEDIUM: Romantic disconnection
  if (userState.romanticConnectionState.daysDisconnected >= 7 &&
      userState.romanticConnectionState.qualityLevel === 'disconnected') {

    interventions.push({
      type: 'pattern_awareness',
      severity: 'medium',
      title: 'Connection distance',
      message: `${userState.romanticConnectionState.daysDisconnected} days since intimate connection. Distance affects you in ways you might not notice immediately.`,
      suggestion: 'Even a small moment of presence together can shift the pattern.',
      action: {
        label: 'Tend to connection',
        target: 'connect'
      }
    })
  }

  // MEDIUM: Social isolation detected
  if (struggleAnalysis.struggleThemes.includes('isolation')) {
    interventions.push({
      type: 'gentle_warning',
      severity: 'medium',
      title: 'Isolation noticed',
      message: 'You\'ve been alone with this. Isolation can amplify everything you\'re feeling.',
      suggestion: 'You don\'t need to share everything. Just being with someone can help.',
      action: {
        label: 'Reach out',
        target: 'connect'
      }
    })
  }

  // LOW: Permission to rest (when pushing too hard)
  if (userState.energyState.status === 'low' ||
      userState.energyState.status === 'depleted') {

    interventions.push({
      type: 'permission',
      severity: 'medium',
      title: 'Permission to rest',
      message: 'Rest is not earned. It\'s required. You don\'t need to justify taking care of yourself.',
      suggestion: 'What would complete rest look like today?',
      action: {
        label: 'Allow rest',
        target: 'rest'
      }
    })
  }

  // CELEBRATION: Energy improving
  if (userState.energyState.trajectory === 'improving') {
    interventions.push({
      type: 'celebration',
      severity: 'low',
      title: 'Energy rising',
      message: 'Your energy is improving. You\'re taking care of yourself and it shows.',
      suggestion: 'Notice what helped. Remember this for next time.'
    })
  }

  // VALIDATION: Consistent positive pattern
  const recentPositive = userState.recentLogs.filter(l => {
    if (l.event === 'emotional_checkin') {
      const state = l.metadata?.emotionalState as string
      return ['calm', 'peaceful', 'grateful', 'content', 'fulfilled'].includes(state)
    }
    return false
  })

  if (recentPositive.length >= 5 && userState.emotionalPattern.daysInPattern >= 3) {
    interventions.push({
      type: 'validation',
      severity: 'low',
      title: 'Sustained well-being',
      message: `${userState.emotionalPattern.daysInPattern} days of ${userState.emotionalPattern.dominantMood}. You\'ve created this. You know how.`,
      suggestion: 'What supports this state? Keep doing it.'
    })
  }

  // Sort by severity
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
  return interventions.sort((a, b) =>
    severityOrder[b.severity] - severityOrder[a.severity]
  ).slice(0, 2) // Max 2 interventions at once
}

/**
 * Determine if intervention should be shown (cooldown logic)
 */
export function shouldShowIntervention(
  interventionType: Intervention['type'],
  lastShownTimes: Record<string, string>,
  severity: Intervention['severity']
): boolean {
  const lastShown = lastShownTimes[interventionType]
  if (!lastShown) return true

  // Critical interventions can show every 6 hours
  if (severity === 'critical') {
    return dayjs().diff(dayjs(lastShown), 'hour') >= 6
  }

  // High severity: once per day
  if (severity === 'high') {
    return dayjs().diff(dayjs(lastShown), 'day') >= 1
  }

  // Medium: once per 2 days
  if (severity === 'medium') {
    return dayjs().diff(dayjs(lastShown), 'day') >= 2
  }

  // Low/celebration: once per 3 days
  return dayjs().diff(dayjs(lastShown), 'day') >= 3
}
