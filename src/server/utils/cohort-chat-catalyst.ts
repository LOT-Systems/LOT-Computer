import type { User } from '#shared/types'
import { CohortMatch } from './patterns'
import dayjs from '#server/utils/dayjs'

export interface ChatCatalyst {
  type: 'cohort_online' | 'shared_state' | 'social_need' | 'similar_journey'
  priority: number // 0-10
  title: string
  message: string
  action: {
    label: string
    cohortMember?: {
      id: string
      name: string
    }
  }
  triggeredBy: string
  conversationStarters?: string[]
}

/**
 * Check if user is recently online (last 15 minutes)
 */
function isUserOnline(user: User): boolean {
  if (!user.lastSeenAt) return false
  const fifteenMinutesAgo = dayjs().subtract(15, 'minute')
  return dayjs(user.lastSeenAt).isAfter(fifteenMinutesAgo)
}

/**
 * Generate chat prompts when cohort members are online
 */
export function generateChatCatalysts(
  currentUser: User,
  cohortMatches: CohortMatch[],
  allUsers: User[],
  currentEmotionalState?: string,
  socialEnergyNeed?: {
    urgency: number
    daysSinceConnection: number
  }
): ChatCatalyst[] {
  const catalysts: ChatCatalyst[] = []

  // Find which cohort members are currently online
  const onlineMembers = cohortMatches.filter(match => {
    const user = allUsers.find(u => u.id === match.user.id)
    return user && isUserOnline(user)
  })

  // High priority: cohort member online with similar emotional state
  if (currentEmotionalState && onlineMembers.length > 0) {
    for (const member of onlineMembers) {
      // Check if they share emotional patterns
      const hasSharedEmotionalPattern = member.sharedPatterns.some(pattern =>
        pattern.toLowerCase().includes(currentEmotionalState.toLowerCase())
      )

      if (hasSharedEmotionalPattern) {
        catalysts.push({
          type: 'shared_state',
          priority: 9,
          title: 'Shared resonance',
          message: `${member.user.firstName} is online and you both share ${currentEmotionalState} patterns. Connect?`,
          action: {
            label: 'Say hello',
            cohortMember: {
              id: member.user.id,
              name: `${member.user.firstName} ${member.user.lastName}`
            }
          },
          triggeredBy: `shared_state_${currentEmotionalState}`,
          conversationStarters: generateConversationStarters(member.sharedPatterns, currentEmotionalState)
        })
      }
    }
  }

  // Medium-high priority: cohort member online with general shared patterns
  if (onlineMembers.length > 0) {
    for (const member of onlineMembers.slice(0, 2)) { // Max 2 suggestions
      catalysts.push({
        type: 'cohort_online',
        priority: 7,
        title: 'Cohort connection',
        message: `${member.user.firstName} from ${member.user.city} is online. You share: ${member.sharedPatterns.slice(0, 2).join(', ')}`,
        action: {
          label: 'Connect',
          cohortMember: {
            id: member.user.id,
            name: `${member.user.firstName} ${member.user.lastName}`
          }
        },
        triggeredBy: 'cohort_online',
        conversationStarters: generateConversationStarters(member.sharedPatterns, currentEmotionalState)
      })
    }
  }

  // Medium priority: Social energy need detected
  if (socialEnergyNeed && socialEnergyNeed.urgency >= 7) {
    // Find any cohort member (doesn't need to be online)
    const topMatch = cohortMatches[0]
    if (topMatch) {
      catalysts.push({
        type: 'social_need',
        priority: 6,
        title: 'Social replenishment',
        message: `You haven't connected in ${socialEnergyNeed.daysSinceConnection} days. ${topMatch.user.firstName} shares your patterns.`,
        action: {
          label: 'Reach out',
          cohortMember: {
            id: topMatch.user.id,
            name: `${topMatch.user.firstName} ${topMatch.user.lastName}`
          }
        },
        triggeredBy: 'social_energy_need',
        conversationStarters: generateConversationStarters(topMatch.sharedPatterns, currentEmotionalState)
      })
    } else {
      // No specific cohort match, suggest general community
      catalysts.push({
        type: 'social_need',
        priority: 5,
        title: 'Connection needed',
        message: `${socialEnergyNeed.daysSinceConnection} days since connection. The community is here.`,
        action: {
          label: 'Join community chat'
        },
        triggeredBy: 'social_energy_need_general'
      })
    }
  }

  // Lower priority: Similar journey stage
  const similarJourneyCohorts = cohortMatches.filter(match =>
    match.sharedPatterns.some(pattern =>
      pattern.toLowerCase().includes('archetype') ||
      pattern.toLowerCase().includes('awareness') ||
      pattern.toLowerCase().includes('journey')
    )
  )

  if (similarJourneyCohorts.length > 0 && catalysts.length < 3) {
    const match = similarJourneyCohorts[0]
    catalysts.push({
      type: 'similar_journey',
      priority: 4,
      title: 'Kindred spirit',
      message: `${match.user.firstName} is on a similar journey. ${match.similarity > 0.7 ? 'Strong resonance.' : 'You might connect.'}`,
      action: {
        label: 'Explore connection',
        cohortMember: {
          id: match.user.id,
          name: `${match.user.firstName} ${match.user.lastName}`
        }
      },
      triggeredBy: 'similar_journey',
      conversationStarters: generateConversationStarters(match.sharedPatterns, currentEmotionalState)
    })
  }

  // Sort by priority
  return catalysts.sort((a, b) => b.priority - a.priority).slice(0, 3)
}

/**
 * Generate conversation starters based on shared patterns
 */
export function generateConversationStarters(
  sharedPatterns: string[],
  currentEmotionalState?: string
): string[] {
  const starters: string[] = []

  // Pattern-based starters
  for (const pattern of sharedPatterns.slice(0, 2)) {
    if (pattern.toLowerCase().includes('energized')) {
      starters.push(`I noticed we both feel energized in similar conditions. What gives you that spark?`)
    }
    if (pattern.toLowerCase().includes('calm')) {
      starters.push(`We share calm patterns. What helps you find peace?`)
    }
    if (pattern.toLowerCase().includes('morning') || pattern.toLowerCase().includes('evening')) {
      starters.push(`Our energy rhythms align. Are you a morning or evening person?`)
    }
    if (pattern.toLowerCase().includes('weather')) {
      starters.push(`Weather affects us similarly. How's your day treating you?`)
    }
    if (pattern.toLowerCase().includes('social')) {
      starters.push(`We both value connection. What kind of interactions feed you?`)
    }
  }

  // Emotional state-based starters
  if (currentEmotionalState) {
    if (currentEmotionalState === 'energized') {
      starters.push(`Feeling energized today - what are you creating with this energy?`)
    }
    if (currentEmotionalState === 'calm') {
      starters.push(`In a calm space right now. What brings you peace?`)
    }
    if (currentEmotionalState === 'anxious' || currentEmotionalState === 'overwhelmed') {
      starters.push(`Having a challenging moment. How do you work with difficult feelings?`)
    }
    if (currentEmotionalState === 'grateful') {
      starters.push(`Feeling grateful today. What's alive in you right now?`)
    }
  }

  // Generic but warm starters
  if (starters.length === 0) {
    starters.push(
      `Your journey resonates with mine. What's present for you today?`,
      `We share similar patterns. What are you learning about yourself?`,
      `I see we're on parallel paths. What's been meaningful for you lately?`
    )
  }

  return starters.slice(0, 3)
}

/**
 * Determine if chat catalyst should be shown (avoid spam)
 */
export function shouldShowChatCatalyst(
  lastShownTime: string | null,
  cooldownMinutes: number = 60
): boolean {
  if (!lastShownTime) return true

  const cooldownExpired = dayjs().diff(dayjs(lastShownTime), 'minute') >= cooldownMinutes
  return cooldownExpired
}
