import * as React from 'react'
import { useLogs } from '#client/queries'
import dayjs from '#client/utils/dayjs'
import type { Log } from '#shared/types'

/**
 * useLogContext - Shared log analytics hook for cross-widget correlation
 *
 * Provides computed metrics from user logs that multiple widgets can use
 * without duplicating calculation logic. Computes mood trends, activity
 * patterns, streaks, and behavioral breakdowns from the log history.
 */
export function useLogContext() {
  const { data: logs = [] } = useLogs()

  return React.useMemo(() => {
    if (logs.length === 0) {
      return {
        isEmpty: true,
        totalEntries: 0,
        activeDays: 0,
        streak: 0,
        recentMoods: [] as string[],
        dominantMood: null as string | null,
        moodTrend: 'stable' as 'improving' | 'stable' | 'declining',
        activityBreakdown: {} as Record<string, number>,
        todayActivity: [] as Log[],
        lastActivityAgo: null as string | null,
        weeklyRate: 0,
        hasMemory: false,
        hasMood: false,
        hasPlanner: false,
        hasSelfCare: false,
        hasIntention: false,
        widgetDiversity: 0,
        peakHour: null as number | null,
      }
    }

    const now = dayjs()
    const today = now.format('YYYY-MM-DD')
    const yesterday = now.subtract(1, 'day').format('YYYY-MM-DD')

    // Activity breakdown by event type
    const activityBreakdown: Record<string, number> = {}
    logs.forEach(log => {
      const event = log.event || 'note'
      activityBreakdown[event] = (activityBreakdown[event] || 0) + 1
    })

    // Widget diversity (how many different event types)
    const eventTypes = new Set(logs.map(l => l.event).filter(Boolean))
    const widgetDiversity = eventTypes.size

    // Check which widgets have been used
    const hasMemory = logs.some(l => l.event === 'answer')
    const hasMood = logs.some(l => l.event === 'emotional_checkin')
    const hasPlanner = logs.some(l => l.event === 'plan_set')
    const hasSelfCare = logs.some(l => l.event === 'self_care_complete')
    const hasIntention = logs.some(l => l.event === 'intention')

    // Active days (unique dates)
    const uniqueDays = new Set(
      logs.map(log => dayjs(log.createdAt).format('YYYY-MM-DD'))
    )
    const activeDays = uniqueDays.size

    // Streak calculation
    const sortedDays = Array.from(uniqueDays).sort().reverse()
    let streak = 0
    if (sortedDays.length > 0 && (sortedDays[0] === today || sortedDays[0] === yesterday)) {
      const startOffset = sortedDays[0] === today ? 0 : 1
      for (let i = 0; i < sortedDays.length; i++) {
        const expectedDay = now.subtract(i + startOffset, 'day').format('YYYY-MM-DD')
        if (sortedDays[i] === expectedDay) {
          streak++
        } else {
          break
        }
      }
    }

    // Recent moods (last 7 days)
    const weekAgo = now.subtract(7, 'day')
    const moodLogs = logs.filter(
      l => l.event === 'emotional_checkin' && dayjs(l.createdAt).isAfter(weekAgo)
    )
    const recentMoods = moodLogs
      .map(l => {
        // Extract mood from metadata or text
        const metadata = l.metadata as any
        return metadata?.emotionalState || metadata?.mood || ''
      })
      .filter(Boolean)

    // Dominant mood
    const moodCounts: Record<string, number> = {}
    recentMoods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1
    })
    const dominantMood = Object.entries(moodCounts).length > 0
      ? Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0][0]
      : null

    // Mood trend (compare first half vs second half of recent moods)
    const positives = ['energized', 'hopeful', 'calm', 'peaceful', 'grateful', 'content', 'excited']
    const negatives = ['anxious', 'overwhelmed', 'tired', 'exhausted', 'sad', 'lonely', 'restless']

    let moodTrend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentMoods.length >= 4) {
      const mid = Math.floor(recentMoods.length / 2)
      const olderMoods = recentMoods.slice(mid)
      const newerMoods = recentMoods.slice(0, mid)

      const scoreArr = (moods: string[]) =>
        moods.reduce((sum, m) => sum + (positives.includes(m) ? 1 : negatives.includes(m) ? -1 : 0), 0)

      const olderScore = scoreArr(olderMoods) / olderMoods.length
      const newerScore = scoreArr(newerMoods) / newerMoods.length

      if (newerScore > olderScore + 0.3) moodTrend = 'improving'
      else if (newerScore < olderScore - 0.3) moodTrend = 'declining'
    }

    // Today's activity
    const todayStart = now.startOf('day')
    const todayActivity = logs.filter(l => dayjs(l.createdAt).isAfter(todayStart))

    // Time since last activity
    const lastLog = logs[0] // Logs are DESC ordered
    const lastActivityAgo = lastLog
      ? formatTimeAgo(dayjs(lastLog.createdAt))
      : null

    // Weekly rate
    const thirtyDaysAgo = now.subtract(30, 'day')
    const recentLogs = logs.filter(l => dayjs(l.createdAt).isAfter(thirtyDaysAgo))
    const weeklyRate = recentLogs.length > 0
      ? Math.round((recentLogs.length / 30) * 7)
      : 0

    // Peak activity hour
    const hourCounts: Record<number, number> = {}
    logs.forEach(l => {
      const hour = dayjs(l.createdAt).hour()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const peakHour = Object.entries(hourCounts).length > 0
      ? Number(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0][0])
      : null

    return {
      isEmpty: false,
      totalEntries: logs.length,
      activeDays,
      streak,
      recentMoods,
      dominantMood,
      moodTrend,
      activityBreakdown,
      todayActivity,
      lastActivityAgo,
      weeklyRate,
      hasMemory,
      hasMood,
      hasPlanner,
      hasSelfCare,
      hasIntention,
      widgetDiversity,
      peakHour,
    }
  }, [logs])
}

function formatTimeAgo(time: dayjs.Dayjs): string {
  const minutes = dayjs().diff(time, 'minute')
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
