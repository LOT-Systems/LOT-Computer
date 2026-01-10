import React from 'react'
import { Block } from '#client/components/ui'
import { useEmotionalCheckIns, useLogs } from '#client/queries'

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
      'Morning hours': [],
      'Afternoon stretch': [],
      'Evening time': []
    }

    checkInsData.checkIns.forEach((checkIn: any) => {
      const mood = checkIn.metadata?.emotionalState
      if (!mood) return

      const hour = new Date(checkIn.createdAt).getHours()

      if (hour >= 6 && hour < 12) {
        moodsByTime['Morning hours'].push(mood)
      } else if (hour >= 12 && hour < 17) {
        moodsByTime['Afternoon stretch'].push(mood)
      } else if (hour >= 17 && hour < 22) {
        moodsByTime['Evening time'].push(mood)
      }
    })

    // Calculate most common mood for each time period with percentage
    const results: { time: string; mood: string; percent: number }[] = []

    Object.entries(moodsByTime).forEach(([time, moods]) => {
      if (moods.length === 0) return

      const moodCounts: { [key: string]: number } = {}
      moods.forEach(mood => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1
      })

      const [topMood, count] = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0]

      const percent = Math.round((count / moods.length) * 100)

      results.push({ time, mood: topMood, percent })
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
            <div>Your patterns are forming. Keep tracking to reveal them.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {timeCorrelations.map(({ time, mood, percent }) => (
                <div key={time}>
                  <span>{time}: </span>
                  <span className="capitalize">{mood} {percent}% of the time</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'selfcare' && (
        <div className="inline-block">
          {!selfCareCorrelations ? (
            <div>The self-care path awaits discovery.</div>
          ) : selfCareCorrelations.afterCount === 0 ? (
            <div>Practice more to unlock this insight.</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                Your self-care affects {selfCareCorrelations.afterCount} tracked moments.
              </div>
              <div>
                {selfCareCorrelations.hasEffect
                  ? 'A clear pattern emerges: self-care shifts your state.'
                  : 'The pattern is subtle. Continue your practice.'}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'summary' && summary && (
        <div className="inline-block">
          <div className="flex flex-col gap-4">
            <div>Your emotional journey: {summary.total} check-ins tracked</div>
            <div>Positive states: {summary.positivePercent}% of your path</div>
            <div>Challenging states: {summary.challengingPercent}% navigated</div>
            {summary.neutralPercent > 0 && (
              <div>Neutral states: {summary.neutralPercent}% observed</div>
            )}
          </div>
        </div>
      )}
    </Block>
  )
}
