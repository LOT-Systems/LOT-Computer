import type { Log, User } from '#shared/types'
import dayjs from '#server/utils/dayjs'

export interface EnergyTransaction {
  timestamp: string
  activity: string
  energyCost: number // negative = drain, positive = replenishment
  category: 'social' | 'focus' | 'creative' | 'physical' | 'rest' | 'joy' | 'emotional' | 'romantic' | 'intimacy'
  source: 'check-in' | 'chat' | 'memory' | 'planner' | 'log'
}

export interface EnergyState {
  currentLevel: number // 0-100
  maxCapacity: 100
  status: 'depleted' | 'low' | 'moderate' | 'good' | 'full'
  daysUntilBurnout: number | null // predictive
  recentTransactions: EnergyTransaction[]
  needsReplenishment: {
    category: 'social' | 'creative' | 'rest' | 'joy' | 'physical' | 'romantic' | 'intimacy'
    urgency: number // 0-10
    daysSinceLastReplenishment: number
  }[]
  trajectory: 'improving' | 'stable' | 'declining' | 'critical'
  romanticConnection: {
    lastIntimacyMoment: string | null
    daysSinceConnection: number
    connectionQuality: 'disconnected' | 'distant' | 'present' | 'deep'
    needsAttention: boolean
  }
}

/**
 * Energy costs/gains for different activities
 * Based on typical patterns - will be personalized per user later
 */
const ENERGY_COSTS = {
  // Emotional check-ins (mood-dependent)
  energized: 0, // neutral, already high energy
  calm: 5, // slight replenishment
  peaceful: 8,
  grateful: 10,
  hopeful: 3,
  fulfilled: 12,
  content: 7,

  // Depleting emotions
  tired: -8,
  anxious: -10,
  overwhelmed: -15,
  exhausted: -20,
  restless: -5,
  uncertain: -3,
  excited: -2, // excitement costs energy despite being positive

  // Activities
  chat_message: -3, // social energy cost
  chat_message_like: 1, // small positive boost
  answer: -5, // reflection costs focus energy
  plan_set: -4, // planning requires focus
  note: -2, // writing requires energy

  // Self-care gains
  self_care_completed: 15, // significant boost
  ritual_completed: 10,
  rest_taken: 20,
  creative_expression: -5, // costs energy but replenishes soul
}

/**
 * Detect romantic/intimacy moments from log content
 */
function detectRomanticContent(text: string): {
  isRomantic: boolean
  isIntimacy: boolean
  energyGain: number
} {
  const lowerText = text.toLowerCase()

  // Intimacy keywords (more specific)
  const intimacyKeywords = ['intimacy', 'intimate', 'sex', 'physical connection', 'close', 'cuddling', 'holding', 'touch']
  const hasIntimacy = intimacyKeywords.some(keyword => lowerText.includes(keyword))

  // Romantic keywords (broader)
  const romanticKeywords = [
    'partner', 'love', 'loved', 'loving', 'boyfriend', 'girlfriend', 'husband', 'wife',
    'date', 'romance', 'romantic', 'together', 'relationship', 'connected', 'connection',
    'heart', 'affection', 'tender', 'sweet', 'kiss', 'embrace'
  ]
  const hasRomantic = romanticKeywords.some(keyword => lowerText.includes(keyword))

  let energyGain = 0
  if (hasIntimacy) energyGain = 25 // Major replenishment
  else if (hasRomantic) energyGain = 15 // Moderate replenishment

  return {
    isRomantic: hasRomantic,
    isIntimacy: hasIntimacy,
    energyGain
  }
}

/**
 * Calculate energy transaction from log entry
 */
function logToEnergyTransaction(log: Log): EnergyTransaction | null {
  let energyCost = 0
  let category: EnergyTransaction['category'] = 'emotional'
  let activity = log.event

  // Emotional check-ins
  if (log.event === 'emotional_checkin') {
    const emotionalState = log.metadata?.emotionalState as string
    energyCost = ENERGY_COSTS[emotionalState as keyof typeof ENERGY_COSTS] || 0
    category = 'emotional'
    activity = `Felt ${emotionalState}`
  }

  // Chat activity (social energy)
  else if (log.event === 'chat_message') {
    energyCost = ENERGY_COSTS.chat_message
    category = 'social'
    activity = 'Community chat'
  }

  else if (log.event === 'chat_message_like') {
    energyCost = ENERGY_COSTS.chat_message_like
    category = 'social'
    activity = 'Liked message'
  }

  // Memory answers (focus energy)
  else if (log.event === 'answer') {
    energyCost = ENERGY_COSTS.answer
    category = 'focus'
    activity = 'Memory reflection'
  }

  // Planning (focus energy)
  else if (log.event === 'plan_set') {
    energyCost = ENERGY_COSTS.plan_set
    category = 'focus'
    activity = 'Set daily plan'
  }

  // Notes (check for romantic/intimacy content first)
  else if (log.event === 'note') {
    const logText = log.text || ''
    const romanticContent = detectRomanticContent(logText)

    if (romanticContent.isIntimacy) {
      energyCost = romanticContent.energyGain
      category = 'intimacy'
      activity = 'Intimate moment'
    } else if (romanticContent.isRomantic) {
      energyCost = romanticContent.energyGain
      category = 'romantic'
      activity = 'Romantic connection'
    } else {
      energyCost = ENERGY_COSTS.note
      category = 'creative'
      activity = 'Journal entry'
    }
  }

  // Self-care (major replenishment)
  else if (log.event === 'self_care_completed') {
    energyCost = ENERGY_COSTS.self_care_completed
    category = 'rest'
    activity = 'Self-care moment'
  }

  else {
    return null // Unknown event type
  }

  return {
    timestamp: log.createdAt.toISOString(),
    activity,
    energyCost,
    category,
    source: log.event as EnergyTransaction['source']
  }
}

/**
 * Analyze user's energy state from recent logs
 */
export function analyzeEnergyState(logs: Log[]): EnergyState {
  // Convert logs to energy transactions
  const transactions = logs
    .map(logToEnergyTransaction)
    .filter(Boolean) as EnergyTransaction[]

  // Calculate current energy level (start at 70, modify by transactions)
  let currentLevel = 70 // baseline
  const recentTransactions = transactions.slice(0, 20) // Last 20 activities

  for (const transaction of recentTransactions) {
    currentLevel += transaction.energyCost
  }

  // Clamp to 0-100
  currentLevel = Math.max(0, Math.min(100, currentLevel))

  // Determine status
  let status: EnergyState['status']
  if (currentLevel <= 15) status = 'depleted'
  else if (currentLevel <= 35) status = 'low'
  else if (currentLevel <= 60) status = 'moderate'
  else if (currentLevel <= 85) status = 'good'
  else status = 'full'

  // Calculate trajectory (compare first 10 to last 10 transactions)
  let trajectory: EnergyState['trajectory'] = 'stable'
  if (recentTransactions.length >= 10) {
    const firstHalf = recentTransactions.slice(10, 20).reduce((sum, t) => sum + t.energyCost, 0)
    const secondHalf = recentTransactions.slice(0, 10).reduce((sum, t) => sum + t.energyCost, 0)

    if (currentLevel < 20) trajectory = 'critical'
    else if (secondHalf > firstHalf + 10) trajectory = 'improving'
    else if (secondHalf < firstHalf - 10) trajectory = 'declining'
    else trajectory = 'stable'
  }

  // Predict days until burnout (if declining)
  let daysUntilBurnout: number | null = null
  if (trajectory === 'declining' || trajectory === 'critical') {
    // Calculate average daily depletion
    const recentDays = transactions.filter(t =>
      dayjs().diff(dayjs(t.timestamp), 'day') <= 7
    )

    const dailyAverage = recentDays.reduce((sum, t) => sum + t.energyCost, 0) / 7

    if (dailyAverage < 0) {
      daysUntilBurnout = Math.floor(currentLevel / Math.abs(dailyAverage))
    }
  }

  // Detect replenishment needs by category
  const categoryTransactions: Record<string, EnergyTransaction[]> = {}

  for (const transaction of transactions) {
    if (!categoryTransactions[transaction.category]) {
      categoryTransactions[transaction.category] = []
    }
    categoryTransactions[transaction.category].push(transaction)
  }

  const needsReplenishment: EnergyState['needsReplenishment'] = []

  // Check each replenishment category
  const replenishmentCategories: Array<'social' | 'creative' | 'rest' | 'joy' | 'physical' | 'romantic' | 'intimacy'> =
    ['romantic', 'intimacy', 'social', 'creative', 'rest', 'joy', 'physical']

  for (const category of replenishmentCategories) {
    const categoryTxns = categoryTransactions[category] || []

    // Find positive transactions (replenishment)
    const replenishments = categoryTxns.filter(t => t.energyCost > 0)

    let daysSinceLastReplenishment = 999
    if (replenishments.length > 0) {
      const mostRecent = replenishments[0]
      daysSinceLastReplenishment = dayjs().diff(dayjs(mostRecent.timestamp), 'day')
    }

    // Calculate urgency
    let urgency = 0
    if (daysSinceLastReplenishment > 7) urgency = 10
    else if (daysSinceLastReplenishment > 5) urgency = 7
    else if (daysSinceLastReplenishment > 3) urgency = 4
    else urgency = 1

    if (urgency >= 4) {
      needsReplenishment.push({
        category,
        urgency,
        daysSinceLastReplenishment
      })
    }
  }

  // Sort by urgency
  needsReplenishment.sort((a, b) => b.urgency - a.urgency)

  // Analyze romantic connection specifically
  const romanticTxns = categoryTransactions['romantic'] || []
  const intimacyTxns = categoryTransactions['intimacy'] || []
  const allRomanticMoments = [...romanticTxns, ...intimacyTxns].sort((a, b) =>
    dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
  )

  let romanticConnection: EnergyState['romanticConnection'] = {
    lastIntimacyMoment: null,
    daysSinceConnection: 999,
    connectionQuality: 'disconnected',
    needsAttention: false
  }

  if (allRomanticMoments.length > 0) {
    const lastMoment = allRomanticMoments[0]
    const daysSince = dayjs().diff(dayjs(lastMoment.timestamp), 'day')

    romanticConnection = {
      lastIntimacyMoment: lastMoment.timestamp,
      daysSinceConnection: daysSince,
      connectionQuality:
        daysSince <= 1 ? 'deep' :
        daysSince <= 3 ? 'present' :
        daysSince <= 7 ? 'distant' :
        'disconnected',
      needsAttention: daysSince >= 3
    }
  }

  return {
    currentLevel,
    maxCapacity: 100,
    status,
    daysUntilBurnout,
    recentTransactions: recentTransactions.slice(0, 10),
    needsReplenishment,
    trajectory,
    romanticConnection
  }
}

/**
 * Generate energy-aware suggestions
 */
export function generateEnergySuggestions(energyState: EnergyState): string[] {
  const suggestions: string[] = []

  // Critical depletion
  if (energyState.status === 'depleted' || energyState.trajectory === 'critical') {
    suggestions.push('Your energy is critically low. Rest is not optional - it\'s essential.')

    if (energyState.daysUntilBurnout !== null && energyState.daysUntilBurnout <= 3) {
      suggestions.push(`At this pace, burnout in ${energyState.daysUntilBurnout} day${energyState.daysUntilBurnout === 1 ? '' : 's'}. Please stop and rest.`)
    }
  }

  // Low energy
  else if (energyState.status === 'low') {
    suggestions.push('Your reserves are running low. What can you release today?')
  }

  // Declining trajectory
  else if (energyState.trajectory === 'declining') {
    suggestions.push('Your energy is declining. Notice what\'s draining you.')
  }

  // Romantic connection needs (highest priority)
  if (energyState.romanticConnection.needsAttention) {
    const days = energyState.romanticConnection.daysSinceConnection

    if (energyState.romanticConnection.connectionQuality === 'disconnected') {
      suggestions.push(`${days} days since intimate connection. Your heart needs tending.`)
    } else if (energyState.romanticConnection.connectionQuality === 'distant') {
      suggestions.push(`Connection feels distant. When will you make time for closeness?`)
    }
  }

  // Specific replenishment needs
  for (const need of energyState.needsReplenishment.slice(0, 2)) {
    if (need.category === 'romantic' && need.urgency >= 7) {
      suggestions.push(`Romantic connection needs attention. ${need.daysSinceLastReplenishment} days is affecting you.`)
    }

    if (need.category === 'intimacy' && need.urgency >= 4) {
      suggestions.push(`Physical intimacy matters. Notice the distance.`)
    }

    if (need.category === 'rest' && need.urgency >= 7) {
      suggestions.push(`${need.daysSinceLastReplenishment} days without deep rest. Your system needs recovery.`)
    }

    if (need.category === 'social' && need.urgency >= 7) {
      suggestions.push(`You haven't connected in ${need.daysSinceLastReplenishment} days. Reach out to someone.`)
    }

    if (need.category === 'joy' && need.urgency >= 7) {
      suggestions.push(`When did you last feel joy? ${need.daysSinceLastReplenishment} days is too long.`)
    }

    if (need.category === 'creative' && need.urgency >= 7) {
      suggestions.push(`Your creative energy needs expression. Make something today.`)
    }
  }

  // Improving trajectory
  if (energyState.trajectory === 'improving') {
    suggestions.push('Your energy is rising. You\'re taking care of yourself.')
  }

  return suggestions.slice(0, 3) // Max 3 suggestions
}
