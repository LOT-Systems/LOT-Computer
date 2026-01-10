import React from 'react'
import { Block } from '#client/components/ui'
import { useEmotionalCheckIns, useLogs } from '#client/queries'
import { cn } from '#client/utils'

type AnalyticsView = 'time' | 'selfcare' | 'summary'

/**
 * Mood Analytics Widget - Discover what influences your emotional state
 * Pattern: Time → Self-Care → Summary
 * Analyzes correlations between mood and various factors
 */
export function MoodAnalytics() {
  const [view, setView] = React.useState<AnalyticsView>('time')

  const { data: checkInsData } = useEmotionalCheckIns(30) // Last 30 days
  const { data: logs = [] } = useLogs()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'time': return 'selfcare'
        case 'selfcare': return 'summary'
        case 'summary': return 'time'
        default: return 'time'
      }
    })
  }

  // Analyze mood-time correlations
  const timeCorrelations = React.useMemo(() => {
    if (!checkInsData || checkInsData.checkIns.length < 5) return null

    const moodsByTime: { [key: string]: string[] } = {
      'Morning (6-12)': [],
      'Afternoon (12-17)': [],
      'Evening (17-22)': []
    }

    checkInsData.checkIns.forEach((checkIn: any) => {
      const mood = checkIn.metadata?.emotionalState
      if (!mood) return

      const hour = new Date(checkIn.createdAt).getHours()

      if (hour >= 6 && hour < 12) {
        moodsByTime['Morning (6-12)'].push(mood)
      } else if (hour >= 12 && hour < 17) {
        moodsByTime['Afternoon (12-17)'].push(mood)
      } else if (hour >= 17 && hour < 22) {
        moodsByTime['Evening (17-22)'].push(mood)
      }
    })

    // Calculate most common mood for each time period
    const results: { time: string; mood: string; count: number }[] = []

    Object.entries(moodsByTime).forEach(([time, moods]) => {
      if (moods.length === 0) return

      const moodCounts: { [key: string]: number } = {}
      moods.forEach(mood => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1
      })

      const [topMood, count] = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0]

      results.push({ time, mood: topMood, count })
    })

    return results
  }, [checkInsData])

  // Analyze mood-selfcare correlations
  const selfCareCorrelations = React.useMemo(() => {
    if (!checkInsData || checkInsData.checkIns.length < 3) return null

    const selfCareLogs = logs.filter(log => log.event === 'self_care_complete')
    if (selfCareLogs.length === 0) return null

    // Find mood check-ins within 2 hours after self-care
    const moodsAfterSelfCare: string[] = []
    const moodsWithoutSelfCare: string[] = []

    checkInsData.checkIns.forEach((checkIn: any) => {
      const mood = checkIn.metadata?.emotionalState
      if (!mood) return

      const checkInTime = new Date(checkIn.createdAt).getTime()

      // Look for self-care within 2 hours before check-in
      const hadSelfCare = selfCareLogs.some(log => {
        const logTime = new Date(log.createdAt).getTime()
        const diff = checkInTime - logTime
        return diff > 0 && diff < 2 * 60 * 60 * 1000 // Within 2 hours after
      })

      if (hadSelfCare) {
        moodsAfterSelfCare.push(mood)
      } else {
        moodsWithoutSelfCare.push(mood)
      }
    })

    // Calculate average "positivity" score
    const getPositivityScore = (mood: string) => {
      const positive = ['energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content', 'peaceful', 'excited']
      const neutral = ['restless', 'uncertain', 'tired']
      return positive.includes(mood) ? 1 : neutral.includes(mood) ? 0 : -1
    }

    const avgAfterSelfCare = moodsAfterSelfCare.length > 0
      ? moodsAfterSelfCare.reduce((sum, mood) => sum + getPositivityScore(mood), 0) / moodsAfterSelfCare.length
      : 0

    const avgWithoutSelfCare = moodsWithoutSelfCare.length > 0
      ? moodsWithoutSelfCare.reduce((sum, mood) => sum + getPositivityScore(mood), 0) / moodsWithoutSelfCare.length
      : 0

    const improvement = avgAfterSelfCare - avgWithoutSelfCare

    return {
      afterCount: moodsAfterSelfCare.length,
      withoutCount: moodsWithoutSelfCare.length,
      improvement: improvement.toFixed(2),
      hasEffect: improvement > 0.2
    }
  }, [checkInsData, logs])

  // Summary stats
  const summary = React.useMemo(() => {
    if (!checkInsData || checkInsData.checkIns.length < 3) return null

    const moods = checkInsData.checkIns
      .map((c: any) => c.metadata?.emotionalState)
      .filter(Boolean)

    const positive = ['energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content', 'peaceful', 'excited']
    const challenging = ['tired', 'anxious', 'exhausted', 'overwhelmed']

    const positiveCount = moods.filter(m => positive.includes(m)).length
    const challengingCount = moods.filter(m => challenging.includes(m)).length

    const positivePercent = Math.round((positiveCount / moods.length) * 100)
    const challengingPercent = Math.round((challengingCount / moods.length) * 100)
    const neutralPercent = 100 - positivePercent - challengingPercent

    return {
      total: moods.length,
      positivePercent,
      challengingPercent,
      neutralPercent
    }
  }, [checkInsData])

  const label =
    view === 'time' ? 'Time:' :
    view === 'selfcare' ? 'Self-care:' :
    'Summary:'

  // Don't show if not enough data
  if (!checkInsData || checkInsData.checkIns.length < 5) {
    return null
  }

  return (
    <Block label={`Insights ${label}`} blockView onLabelClick={cycleView}>
      {view === 'time' && timeCorrelations && (
        <div className="inline-block">
          {timeCorrelations.length === 0 ? (
            <div className="opacity-60">Track moods at different times to see patterns.</div>
          ) : (
            <>
              <div className="mb-12 opacity-90">Your mood by time of day:</div>
              <div className="flex flex-col gap-6">
                {timeCorrelations.map(({ time, mood, count }) => (
                  <div key={time} className="flex flex-col gap-2">
                    <div className="opacity-60 text-[14px]">{time}</div>
                    <div className="flex items-center gap-8 opacity-90">
                      <span className="capitalize">{mood}</span>
                      <span className="opacity-60 text-[12px]">{count}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {view === 'selfcare' && (
        <div className="inline-block">
          {!selfCareCorrelations ? (
            <div className="opacity-60">Complete self-care to see its impact on your mood.</div>
          ) : selfCareCorrelations.afterCount === 0 ? (
            <div className="opacity-60">Complete more self-care to see patterns.</div>
          ) : (
            <>
              <div className="mb-12 opacity-90">Impact of self-care on mood:</div>
              <div className="flex flex-col gap-6">
                <div>
                  <div className="opacity-60 text-[14px] mb-2">After self-care</div>
                  <div className="opacity-90">{selfCareCorrelations.afterCount} check-ins</div>
                </div>
                <div>
                  <div className="opacity-60 text-[14px] mb-2">Effect</div>
                  <div className={cn(
                    "opacity-90",
                    selfCareCorrelations.hasEffect && "text-green-500"
                  )}>
                    {selfCareCorrelations.hasEffect
                      ? 'Noticeable positive impact'
                      : 'Keep practicing to see patterns'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {view === 'summary' && summary && (
        <div className="inline-block">
          <div className="mb-12 opacity-90">Last 30 days:</div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-16">
              <span className="opacity-90">Total check-ins</span>
              <span className="opacity-80">{summary.total}</span>
            </div>
            <div className="flex items-center justify-between gap-16">
              <span className="opacity-90">Positive moods</span>
              <span className="opacity-90 text-green-500">{summary.positivePercent}%</span>
            </div>
            <div className="flex items-center justify-between gap-16">
              <span className="opacity-90">Challenging moods</span>
              <span className="opacity-90 text-yellow-500">{summary.challengingPercent}%</span>
            </div>
            {summary.neutralPercent > 0 && (
              <div className="flex items-center justify-between gap-16">
                <span className="opacity-90">Neutral moods</span>
                <span className="opacity-60">{summary.neutralPercent}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Block>
  )
}
