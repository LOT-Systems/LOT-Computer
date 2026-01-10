import React from 'react'
import { Block } from '#client/components/ui'
import { useEmotionalCheckIns, useLogs } from '#client/queries'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'

type AnalyticsView = 'weather' | 'time' | 'selfcare' | 'summary'

/**
 * Mood Analytics Widget - Discover what influences your emotional state
 * Pattern: Weather → Time → Self-Care → Summary
 * Analyzes correlations between mood and various factors
 */
export function MoodAnalytics() {
  const [view, setView] = React.useState<AnalyticsView>('weather')

  const { data: checkInsData } = useEmotionalCheckIns(30) // Last 30 days
  const { data: logs = [] } = useLogs()
  const weather = useStore(stores.weather)

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'weather': return 'time'
        case 'time': return 'selfcare'
        case 'selfcare': return 'summary'
        case 'summary': return 'weather'
        default: return 'weather'
      }
    })
  }

  // Analyze mood-weather correlations
  const weatherCorrelations = React.useMemo(() => {
    if (!checkInsData || checkInsData.checkIns.length < 5) return null

    const moodsByWeather: { [key: string]: string[] } = {}

    // Group moods by general weather condition
    checkInsData.checkIns.forEach((checkIn: any) => {
      const mood = checkIn.metadata?.emotionalState
      if (!mood) return

      // In a real implementation, we'd fetch historical weather data
      // For now, we'll use a simplified approach
      const weatherType = 'clear' // Placeholder

      if (!moodsByWeather[weatherType]) moodsByWeather[weatherType] = []
      moodsByWeather[weatherType].push(mood)
    })

    return moodsByWeather
  }, [checkInsData])

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
    const neutralCount = moods.length - positiveCount - challengingCount

    const positivePercent = Math.round((positiveCount / moods.length) * 100)
    const challengingPercent = Math.round((challengingCount / moods.length) * 100)

    return {
      total: moods.length,
      positivePercent,
      challengingPercent,
      neutralPercent: 100 - positivePercent - challengingPercent
    }
  }, [checkInsData])

  const label =
    view === 'weather' ? 'Weather:' :
    view === 'time' ? 'Time:' :
    view === 'selfcare' ? 'Self-care:' :
    'Summary:'

  // Don't show if not enough data
  if (!checkInsData || checkInsData.checkIns.length < 5) {
    return null
  }

  return (
    <Block label={`Insights ${label}`} blockView onLabelClick={cycleView}>
      {view === 'weather' && (
        <div className="inline-block">
          <div className="mb-8 opacity-70">
            Weather patterns coming soon. Track more moods to see correlations.
          </div>
        </div>
      )}

      {view === 'time' && timeCorrelations && (
        <div className="inline-block">
          <div className="mb-12 opacity-70">Your mood by time of day:</div>
          <div className="flex flex-col gap-6">
            {timeCorrelations.map(({ time, mood, count }) => (
              <div key={time} className="flex flex-col gap-2">
                <div className="opacity-60 text-[14px]">{time}</div>
                <div className="flex items-center gap-8">
                  <span className="capitalize">{mood}</span>
                  <span className="opacity-60 text-[12px]">({count}x)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'selfcare' && selfCareCorrelations && (
        <div className="inline-block">
          {selfCareCorrelations.afterCount === 0 ? (
            <div className="opacity-70">
              Complete more self-care to see its impact on your mood.
            </div>
          ) : (
            <>
              <div className="mb-12 opacity-70">Impact of self-care on mood:</div>
              <div className="flex flex-col gap-6">
                <div>
                  <div className="opacity-60 text-[14px] mb-2">After self-care</div>
                  <div>{selfCareCorrelations.afterCount} check-ins</div>
                </div>
                <div>
                  <div className="opacity-60 text-[14px] mb-2">Effect</div>
                  <div className={cn(
                    selfCareCorrelations.hasEffect ? 'text-green-500' : 'opacity-70'
                  )}>
                    {selfCareCorrelations.hasEffect
                      ? '↑ Noticeable positive impact'
                      : '→ Keep practicing to see patterns'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {view === 'summary' && summary && (
        <div className="inline-block">
          <div className="mb-12 opacity-70">Last 30 days overview:</div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-16">
              <span>Total check-ins</span>
              <span className="opacity-75">{summary.total}</span>
            </div>
            <div className="flex items-center justify-between gap-16">
              <span>Positive moods</span>
              <span className="text-green-500">{summary.positivePercent}%</span>
            </div>
            <div className="flex items-center justify-between gap-16">
              <span>Challenging moods</span>
              <span className="text-yellow-500">{summary.challengingPercent}%</span>
            </div>
            <div className="flex items-center justify-between gap-16">
              <span>Neutral moods</span>
              <span className="opacity-60">{summary.neutralPercent}%</span>
            </div>
          </div>
        </div>
      )}
    </Block>
  )
}
