/**
 * Aquatic Evolution Badge System for LOT
 *
 * Milestone badges represent growth through water metaphors:
 * ∘ (droplet) → ≈ (wave) → ≋ (deep current)
 *
 * Displayed in dedicated "Level:" field in Public Profile.
 *
 * Philosophy: Growth through natural cycles, like water flowing.
 */

export type BadgeType =
  | 'milestone_7'     // ∘ - Droplet (beginning)
  | 'milestone_30'    // ≈ - Wave (flowing)
  | 'milestone_100'   // ≋ - Deep current (mastery)

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
    symbol: '∘',
    name: 'Droplet',
    description: 'Seven days of consistent practice',
    unlockMessage: 'First drops form. ∘',
  },
  milestone_30: {
    id: 'milestone_30',
    symbol: '≈',
    name: 'Wave',
    description: 'A full month of engagement',
    unlockMessage: 'Waves begin to flow. ≈',
  },
  milestone_100: {
    id: 'milestone_100',
    symbol: '≋',
    name: 'Current',
    description: 'A hundred days of practice',
    unlockMessage: 'Deep currents established. ≋',
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
 * Get current level symbol based on streak
 * Returns the highest milestone badge symbol earned
 */
export function getLevelSymbol(streak: number): string {
  if (streak >= 100) return BADGES.milestone_100.symbol // ≋
  if (streak >= 30) return BADGES.milestone_30.symbol   // ≈
  if (streak >= 7) return BADGES.milestone_7.symbol     // ∘
  return '' // No level yet
}

/**
 * Capitalize first letter of each word
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Join array with · separator and capitalize each word
 */
export function joinWithDots(items: string[]): string {
  if (items.length === 0) return ''
  return items.map(capitalize).join(' · ')
}

/**
 * Calculate which milestone badges should be awarded based on streak
 * This is called periodically or after significant events
 */
export async function checkAndAwardBadges(): Promise<BadgeType[]> {
  const newBadges: BadgeType[] = []

  try {
    // Fetch user stats from API
    const response = await fetch('/api/user-stats')
    if (!response.ok) return newBadges

    const stats = await response.json()

    // Check milestone badges only (Aquatic Evolution: ∘ ≈ ≋)
    if (stats.streak >= 7 && !hasBadge('milestone_7')) {
      if (awardBadge('milestone_7')) newBadges.push('milestone_7')
    }
    if (stats.streak >= 30 && !hasBadge('milestone_30')) {
      if (awardBadge('milestone_30')) newBadges.push('milestone_30')
    }
    if (stats.streak >= 100 && !hasBadge('milestone_100')) {
      if (awardBadge('milestone_100')) newBadges.push('milestone_100')
    }

  } catch (error) {
    console.warn('Badge check failed:', error)
  }

  return newBadges
}
