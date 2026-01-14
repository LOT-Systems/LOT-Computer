/**
 * Minimalist ASCII Badge System for LOT
 *
 * Badges are earned through consistent engagement and are displayed
 * as subtle separators throughout the interface instead of "•" or ","
 *
 * Philosophy: Badges should feel like natural part of the system,
 * not game-like achievements. They reflect growth patterns.
 */

export type BadgeType =
  | 'milestone_7'     // ★ - 7 day streak
  | 'milestone_30'    // ★ - 30 day streak
  | 'milestone_100'   // ★ - 100 day streak
  | 'balanced'        // ◆ - Balanced planner usage (all 4 dimensions used evenly)
  | 'flow'            // ~ - Multi-widget session engagement
  | 'consistent'      // ▪ - Regular timing patterns
  | 'reflective'      // ◇ - Deep memory engagement (long form answers)
  | 'explorer'        // ▫ - Tried multiple moods/options

export interface Badge {
  id: BadgeType
  symbol: string
  name: string
  description: string
  unlockMessage: string // Shown via Memory widget
}

export const BADGES: Record<BadgeType, Badge> = {
  milestone_7: {
    id: 'milestone_7',
    symbol: '★',
    name: '7 Days',
    description: 'Seven days of consistent practice',
    unlockMessage: 'A week of presence. ★',
  },
  milestone_30: {
    id: 'milestone_30',
    symbol: '★',
    name: '30 Days',
    description: 'A full month of engagement',
    unlockMessage: 'A month of dedication. ★',
  },
  milestone_100: {
    id: 'milestone_100',
    symbol: '★',
    name: '100 Days',
    description: 'A hundred days of practice',
    unlockMessage: 'A hundred days of growth. ★',
  },
  balanced: {
    id: 'balanced',
    symbol: '◆',
    name: 'Balanced',
    description: 'All planner dimensions used evenly',
    unlockMessage: 'You explore with balance. ◆',
  },
  flow: {
    id: 'flow',
    symbol: '~',
    name: 'Flow',
    description: 'Engaged multiple widgets in one session',
    unlockMessage: 'You move with flow. ~',
  },
  consistent: {
    id: 'consistent',
    symbol: '▪',
    name: 'Consistent',
    description: 'Regular engagement at similar times',
    unlockMessage: 'Your rhythm is steady. ▪',
  },
  reflective: {
    id: 'reflective',
    symbol: '◇',
    name: 'Reflective',
    description: 'Deep engagement with memory questions',
    unlockMessage: 'Depth in reflection. ◇',
  },
  explorer: {
    id: 'explorer',
    symbol: '▫',
    name: 'Explorer',
    description: 'Tried diverse options across widgets',
    unlockMessage: 'Curiosity guides you. ▫',
  },
}

// Default separator when no badges earned yet
export const DEFAULT_SEPARATOR = '•'

/**
 * Get earned badges from localStorage
 * Format: comma-separated badge IDs
 */
export function getEarnedBadges(): BadgeType[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem('earned_badges')
  if (!stored) return []

  return stored.split(',').filter(Boolean) as BadgeType[]
}

/**
 * Save earned badges to localStorage
 */
export function saveEarnedBadges(badges: BadgeType[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('earned_badges', badges.join(','))
}

/**
 * Check if a badge is earned
 */
export function hasBadge(badgeId: BadgeType): boolean {
  return getEarnedBadges().includes(badgeId)
}

/**
 * Award a new badge (returns true if newly earned)
 */
export function awardBadge(badgeId: BadgeType): boolean {
  const earned = getEarnedBadges()
  if (earned.includes(badgeId)) return false

  earned.push(badgeId)
  saveEarnedBadges(earned)

  // Queue unlock notification for Memory widget
  queueBadgeUnlock(badgeId)

  return true
}

/**
 * Queue badge unlock to show in next Memory widget appearance
 */
function queueBadgeUnlock(badgeId: BadgeType): void {
  if (typeof window === 'undefined') return

  const queued = localStorage.getItem('badge_unlock_queue') || ''
  const queue = queued ? queued.split(',') : []

  if (!queue.includes(badgeId)) {
    queue.push(badgeId)
    localStorage.setItem('badge_unlock_queue', queue.join(','))
  }
}

/**
 * Get next badge unlock to display (and remove from queue)
 */
export function getNextBadgeUnlock(): Badge | null {
  if (typeof window === 'undefined') return null

  const queued = localStorage.getItem('badge_unlock_queue') || ''
  const queue = queued ? queued.split(',').filter(Boolean) : []

  if (queue.length === 0) return null

  const badgeId = queue.shift() as BadgeType
  localStorage.setItem('badge_unlock_queue', queue.join(','))

  return BADGES[badgeId]
}

/**
 * Get separator symbol based on earned badges
 * Uses badges in earned order, cycles through them
 */
export function getBadgeSeparator(index: number = 0): string {
  const earned = getEarnedBadges()

  if (earned.length === 0) return DEFAULT_SEPARATOR

  // Cycle through earned badges for variety
  const badge = BADGES[earned[index % earned.length]]
  return badge.symbol
}

/**
 * Get all badge symbols as a string (for displaying badge collection)
 */
export function getBadgeCollection(): string {
  const earned = getEarnedBadges()

  if (earned.length === 0) return `${DEFAULT_SEPARATOR}  (no badges yet)`

  const symbols = earned.map(id => BADGES[id].symbol)
  return `${symbols.join(' ')}  (${earned.length})`
}

/**
 * Join array with badge separators instead of commas
 */
export function joinWithBadges(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]

  return items.map((item, idx) => {
    if (idx === items.length - 1) return item
    return item + ' ' + getBadgeSeparator(idx) + ' '
  }).join('')
}

/**
 * Calculate which badges should be awarded based on user activity
 * This is called periodically or after significant events
 */
export async function checkAndAwardBadges(): Promise<BadgeType[]> {
  const newBadges: BadgeType[] = []

  try {
    // Fetch user stats from API
    const response = await fetch('/api/user-stats')
    if (!response.ok) return newBadges

    const stats = await response.json()

    // Check milestone badges
    if (stats.streak >= 7 && !hasBadge('milestone_7')) {
      if (awardBadge('milestone_7')) newBadges.push('milestone_7')
    }
    if (stats.streak >= 30 && !hasBadge('milestone_30')) {
      if (awardBadge('milestone_30')) newBadges.push('milestone_30')
    }
    if (stats.streak >= 100 && !hasBadge('milestone_100')) {
      if (awardBadge('milestone_100')) newBadges.push('milestone_100')
    }

    // Check pattern badges
    if (stats.balancedPlanner && !hasBadge('balanced')) {
      if (awardBadge('balanced')) newBadges.push('balanced')
    }
    if (stats.multiWidgetSessions >= 10 && !hasBadge('flow')) {
      if (awardBadge('flow')) newBadges.push('flow')
    }
    if (stats.consistentTiming && !hasBadge('consistent')) {
      if (awardBadge('consistent')) newBadges.push('consistent')
    }
    if (stats.deepReflection && !hasBadge('reflective')) {
      if (awardBadge('reflective')) newBadges.push('reflective')
    }
    if (stats.diverseChoices >= 20 && !hasBadge('explorer')) {
      if (awardBadge('explorer')) newBadges.push('explorer')
    }

  } catch (error) {
    console.warn('Badge check failed:', error)
  }

  return newBadges
}
