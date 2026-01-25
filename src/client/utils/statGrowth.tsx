/**
 * Stat Growth Tracker
 *
 * Tracks numeric stats between sessions and shows growth indicators (↑)
 * when values have increased significantly since last session.
 */

interface StatSnapshot {
  [key: string]: number
  timestamp: number
}

const STORAGE_KEY = 'stat_growth_snapshot'
const GROWTH_THRESHOLD = 0 // Show arrow for any positive growth

/**
 * Get previous stat snapshot from localStorage
 */
function getPreviousSnapshot(): StatSnapshot | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    return JSON.parse(stored) as StatSnapshot
  } catch (e) {
    console.warn('Failed to get stat snapshot:', e)
    return null
  }
}

/**
 * Save current stat snapshot to localStorage
 */
function saveSnapshot(snapshot: StatSnapshot): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch (e) {
    console.warn('Failed to save stat snapshot:', e)
  }
}

/**
 * Check if a stat has grown since last session
 * Returns true if the stat should show a growth indicator
 */
export function hasGrown(statKey: string, currentValue: number): boolean {
  const previous = getPreviousSnapshot()
  if (!previous) return false

  const previousValue = previous[statKey]
  if (previousValue === undefined) return false

  return currentValue > previousValue + GROWTH_THRESHOLD
}

/**
 * Update stat snapshot with current values
 * Call this when stats are loaded/updated
 */
export function updateStatSnapshot(stats: Record<string, number>): void {
  const snapshot: StatSnapshot = {
    ...stats,
    timestamp: Date.now(),
  }

  saveSnapshot(snapshot)
}

/**
 * Get growth indicator component (arrow up)
 */
export function GrowthIndicator() {
  return (
    <span
      className="ml-2 text-green-500 opacity-80 animate-pulse"
      title="Growing since last session"
    >
      ↑
    </span>
  )
}
