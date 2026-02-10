import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block } from '#client/components/ui'
import { useNarrative, useLogs } from '#client/queries'
import dayjs from '#client/utils/dayjs'
import { ProgressBars, getStoicProgressLabel } from '#client/utils/progressBars'
import { useLogContext } from '#client/hooks/useLogContext'

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
  const logCtx = useLogContext()
  const [view, setView] = React.useState<'metrics' | 'activity'>('metrics')

  const cycleView = () => {
    setView(prev => prev === 'metrics' ? 'activity' : 'metrics')
  }

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
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  // Check if streak is active (includes today or yesterday)
  if (sortedDays.length > 0 && (sortedDays[0] === today || sortedDays[0] === yesterday)) {
    // Count consecutive days from most recent
    const startOffset = sortedDays[0] === today ? 0 : 1
    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDay = dayjs().subtract(i + startOffset, 'day').format('YYYY-MM-DD')
      if (sortedDays[i] === expectedDay) {
        streakDays++
      } else {
        break
      }
    }
  }

  const consistency = activeDays > 0 ? Math.min(100, Math.round((streakDays / Math.min(activeDays, 30)) * 100)) : 0

  // Display XP progress (totalXP is actual activity count)
  // Show last 2 digits as progress indicator
  const xpProgress = totalXP % 100

  // Determine evolution stage based on level
  const getEvolutionStage = (level: number): string => {
    if (level >= 50) return 'Deployed'
    if (level >= 40) return 'Optimized'
    if (level >= 30) return 'Compiled'
    if (level >= 20) return 'Integrated'
    if (level >= 10) return 'Initializing'
    return 'Bootstrapping'
  }

  const stage = getEvolutionStage(currentLevel)

  // Activity breakdown labels
  const activityLabels: Record<string, string> = {
    'answer': 'Memory',
    'emotional_checkin': 'Mood',
    'plan_set': 'Planner',
    'self_care_complete': 'Self-care',
    'intention': 'Intention',
    'note': 'Journal',
    'quantum_intent_signal': 'QIE signal',
  }

  return (
    <Block label={view === 'metrics' ? 'Evolution:' : 'Activity:'} blockView onLabelClick={cycleView}>
      {view === 'activity' && (
        <div>
          {/* Activity type breakdown */}
          <div className="flex flex-col gap-4 mb-16">
            {Object.entries(logCtx.activityBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([event, count]) => (
                <div key={event} className="flex justify-between items-baseline">
                  <span className="opacity-30">{activityLabels[event] || event}</span>
                  <span className="tabular-nums">{count}</span>
                </div>
              ))
            }
          </div>

          {/* Diversity */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Widget diversity</span>
            <span>{logCtx.widgetDiversity} types</span>
          </div>

          {/* Mood trend */}
          {logCtx.dominantMood && (
            <div className="flex justify-between items-baseline mb-8">
              <span className="opacity-30">Dominant mood</span>
              <span className="capitalize">{logCtx.dominantMood}</span>
            </div>
          )}

          {/* Peak hour */}
          {logCtx.peakHour !== null && (
            <div className="flex justify-between items-baseline mb-8">
              <span className="opacity-30">Peak hour</span>
              <span>{logCtx.peakHour}:00</span>
            </div>
          )}

          {/* Weekly rate */}
          <div className="opacity-30 mt-12">
            ~{logCtx.weeklyRate} interactions per week.
          </div>
        </div>
      )}

      {view === 'metrics' && <div>
        {/* Main level display */}
        <div className="mb-24">
          {currentLevel} {stage}
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-4 mb-24">
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Entries</span>
            <span className="tabular-nums">{totalEntries}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Active days</span>
            <span className="tabular-nums">{activeDays}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Streak</span>
            <span className="tabular-nums">{streakDays} {streakDays === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Achievements</span>
            <span className="tabular-nums">{unlockedAchievements}/{totalAchievements}</span>
          </div>
          {consistency > 0 && (
            <div className="flex items-center gap-8 mt-4">
              <span className="opacity-30">Consistency</span>
              <ProgressBars percentage={consistency} barCount={10} />
              <span className="tabular-nums">{consistency}%</span>
            </div>
          )}
        </div>

        {/* Activity Progress - bar symbols */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>Total XP</div>
            <div>{totalXP}</div>
          </div>
          <div className="flex items-center gap-8">
            <ProgressBars percentage={Math.min(100, xpProgress)} barCount={10} />
            <div>{getStoicProgressLabel(xpProgress)}</div>
          </div>
        </div>

        {/* Reflection on progress */}
        {currentLevel > 1 && (
          <div className="mt-24 opacity-30">
            Consistent input accelerates compilation.
          </div>
        )}
      </div>}
    </Block>
  )
}
