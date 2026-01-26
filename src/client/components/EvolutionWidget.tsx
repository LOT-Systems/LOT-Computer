import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block } from '#client/components/ui'
import { useNarrative, useLogs } from '#client/queries'
import dayjs from '#client/utils/dayjs'

/**
 * Evolution Widget - Minimalist Profile Growth Indicators
 *
 * Shows how user's profile is evolving through pure numbers and minimal indicators
 * Displays growth metrics in an elegant, creature-evolution style
 */
export const EvolutionWidget: React.FC = () => {
  const me = useStore(stores.me)
  const { data: narrativeData } = useNarrative()
  const { data: logs } = useLogs()

  if (!narrativeData?.narrative || !logs) {
    return null
  }

  const narrative = narrativeData.narrative

  const {
    currentLevel,
    totalXP,
    achievements
  } = narrative

  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length

  // Calculate metrics from logs
  const totalEntries = logs.length

  // Calculate active days from logs
  const uniqueDays = new Set(
    logs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD'))
  )
  const activeDays = uniqueDays.size

  // Calculate current streak
  const sortedDays = Array.from(uniqueDays).sort().reverse()
  let streakDays = 0

  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDay = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    if (sortedDays[i] === expectedDay || (i === 0 && sortedDays[i] === dayjs().subtract(1, 'day').format('YYYY-MM-DD'))) {
      streakDays++
    } else {
      break
    }
  }

  const consistency = activeDays > 0 ? Math.min(100, Math.round((streakDays / Math.min(activeDays, 30)) * 100)) : 0

  // Calculate XP for next level (simple formula: level * 100)
  const xpForNextLevel = (currentLevel + 1) * 100
  const xpProgress = totalXP % 100

  // Determine evolution stage based on level
  const getEvolutionStage = (level: number): string => {
    if (level >= 50) return 'Transcendent'
    if (level >= 40) return 'Masterful'
    if (level >= 30) return 'Advanced'
    if (level >= 20) return 'Developed'
    if (level >= 10) return 'Emerging'
    return 'Forming'
  }

  const stage = getEvolutionStage(currentLevel)

  return (
    <Block label="Evolution:" blockView>
      <div className="font-mono">
        {/* Main level display */}
        <div className="mb-16 flex items-baseline gap-8">
          <div className="text-2xl">{currentLevel}</div>
          <div className="text-sm opacity-60">{stage}</div>
        </div>

        {/* Grid of metrics - minimalist */}
        <div className="grid grid-cols-2 gap-x-16 gap-y-8 mb-16 text-sm">
          <div>
            <div className="opacity-40 text-xs mb-2">Entries</div>
            <div>{totalEntries}</div>
          </div>

          <div>
            <div className="opacity-40 text-xs mb-2">Active days</div>
            <div>{activeDays}</div>
          </div>

          <div>
            <div className="opacity-40 text-xs mb-2">Streak</div>
            <div>{streakDays} {streakDays === 1 ? 'day' : 'days'}</div>
          </div>

          <div>
            <div className="opacity-40 text-xs mb-2">Achievements</div>
            <div>{unlockedAchievements}/{totalAchievements}</div>
          </div>

          {consistency > 0 && (
            <>
              <div className="col-span-2">
                <div className="opacity-40 text-xs mb-2">Consistency</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 grid-fill-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-acc"
                      style={{ width: `${consistency}%` }}
                    />
                  </div>
                  <div className="text-xs opacity-60">{consistency}%</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* XP Progress - minimal bar */}
        <div>
          <div className="flex justify-between text-xs opacity-40 mb-2">
            <div>Progress</div>
            <div>{xpProgress}/{xpForNextLevel} XP</div>
          </div>
          <div className="h-1 grid-fill-light rounded-full overflow-hidden">
            <div
              className="h-full bg-acc transition-all duration-500"
              style={{ width: `${Math.min(100, (xpProgress / xpForNextLevel) * 100)}%` }}
            />
          </div>
        </div>

        {/* Subtle creature-like evolution hint */}
        {currentLevel > 1 && (
          <div className="mt-16 text-xs opacity-40 text-center">
            Profile organism adapting
          </div>
        )}
      </div>
    </Block>
  )
}
