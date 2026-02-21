import * as React from 'react'
import { useLogs } from '#client/queries'
import dayjs from '#client/utils/dayjs'
import type { Log } from '#shared/types'

/**
 * useLogContext - CQGS Bioethics analytics hook for cross-widget correlation
 *
 * Provides computed metrics from user logs aligned with CQGS Bioethics:
 * Cleanness, Routine, Nutrition, and Laughter parameters.
 * Computes biofield trends, activity patterns, streaks, behavioral
 * breakdowns, environment-time context, recent content excerpts,
 * and session-aware biofeedback from the log history.
 */
export function useLogContext() {
  const { data: logs = [] } = useLogs()

  return React.useMemo(() => {
    const now = dayjs()
    const currentHour = now.hour()

    // Time-of-day context
    const timePhase: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' =
      currentHour >= 5 && currentHour < 11 ? 'morning' :
      currentHour >= 11 && currentHour < 14 ? 'midday' :
      currentHour >= 14 && currentHour < 18 ? 'afternoon' :
      currentHour >= 18 && currentHour < 22 ? 'evening' : 'night'

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
        hasJournal: false,
        widgetDiversity: 0,
        peakHour: null as number | null,
        // Extended context fields
        timePhase,
        currentHour,
        hoursSinceLastActivity: null as number | null,
        lastMoodCheckin: null as string | null,
        hoursSinceLastMood: null as number | null,
        recentTexts: [] as string[],
        todayMoodCount: 0,
        todayMemoryCount: 0,
        todaySelfCareCount: 0,
        todayPlannerCount: 0,
        todayIntentionCount: 0,
        todayJournalCount: 0,
        sessionDepth: 0,
        mostUsedWidget: null as string | null,
        leastUsedWidget: null as string | null,
        activeModules: [] as string[],
        dormantModules: [] as string[],
        engagementLevel: 'new' as 'new' | 'exploring' | 'building' | 'integrated' | 'mastered',
        getContextualDirective: () => 'Initialize your first CQGS module to begin biofeedback.',
      }
    }

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
    const hasJournal = logs.some(l => l.event === 'journal' || l.event === 'chat')

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

    // Today module-specific counts
    const todayMoodCount = todayActivity.filter(l => l.event === 'emotional_checkin').length
    const todayMemoryCount = todayActivity.filter(l => l.event === 'answer').length
    const todaySelfCareCount = todayActivity.filter(l => l.event === 'self_care_complete').length
    const todayPlannerCount = todayActivity.filter(l => l.event === 'plan_set').length
    const todayIntentionCount = todayActivity.filter(l => l.event === 'intention').length
    const todayJournalCount = todayActivity.filter(l => l.event === 'journal' || l.event === 'chat').length

    // Time since last activity
    const lastLog = logs[0] // Logs are DESC ordered
    const lastActivityAgo = lastLog
      ? formatTimeAgo(dayjs(lastLog.createdAt))
      : null
    const hoursSinceLastActivity = lastLog
      ? now.diff(dayjs(lastLog.createdAt), 'hour', true)
      : null

    // Last mood check-in details
    const lastMoodLog = logs.find(l => l.event === 'emotional_checkin')
    const lastMoodCheckin = lastMoodLog
      ? ((lastMoodLog.metadata as any)?.emotionalState || (lastMoodLog.metadata as any)?.mood || null)
      : null
    const hoursSinceLastMood = lastMoodLog
      ? now.diff(dayjs(lastMoodLog.createdAt), 'hour', true)
      : null

    // Recent text excerpts (last 5 log entries with text content)
    const recentTexts = logs
      .filter(l => l.text && l.text.length > 0)
      .slice(0, 5)
      .map(l => l.text)

    // Session depth (how many actions in last 2 hours)
    const twoHoursAgo = now.subtract(2, 'hour')
    const sessionDepth = logs.filter(l => dayjs(l.createdAt).isAfter(twoHoursAgo)).length

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

    // Most and least used widget/module
    const moduleMap: Record<string, string> = {
      'answer': 'memory',
      'emotional_checkin': 'mood',
      'plan_set': 'planner',
      'self_care_complete': 'selfcare',
      'intention': 'intentions',
      'journal': 'journal',
      'chat': 'journal',
    }
    const moduleCounts: Record<string, number> = {}
    logs.forEach(l => {
      const mod = moduleMap[l.event || '']
      if (mod) moduleCounts[mod] = (moduleCounts[mod] || 0) + 1
    })
    const sortedModules = Object.entries(moduleCounts).sort(([, a], [, b]) => b - a)
    const mostUsedWidget = sortedModules.length > 0 ? sortedModules[0][0] : null
    const leastUsedWidget = sortedModules.length > 1 ? sortedModules[sortedModules.length - 1][0] : null

    // Active vs dormant modules
    const allModules = ['memory', 'mood', 'planner', 'selfcare', 'intentions', 'journal']
    const activeModules = allModules.filter(m => moduleCounts[m] > 0)
    const dormantModules = allModules.filter(m => !moduleCounts[m])

    // Engagement level based on total entries and diversity
    const engagementLevel: 'new' | 'exploring' | 'building' | 'integrated' | 'mastered' =
      logs.length < 5 ? 'new' :
      logs.length < 20 || widgetDiversity < 3 ? 'exploring' :
      logs.length < 50 || widgetDiversity < 4 ? 'building' :
      logs.length < 100 || streak < 7 ? 'integrated' : 'mastered'

    // CQGS contextual directive generator based on all log-derived context
    const getContextualDirective = (): string => {
      // Immediate time-gap based directives
      if (hoursSinceLastActivity !== null && hoursSinceLastActivity > 24) {
        return 'Extended absence detected. Re-initialize with a biofield check-in to recalibrate state.'
      }
      if (hoursSinceLastActivity !== null && hoursSinceLastActivity > 8) {
        return 'Session gap detected. Run a brief biofield scan to re-synchronize.'
      }

      // Biofield-gap directive
      if (hoursSinceLastMood !== null && hoursSinceLastMood > 12) {
        return 'Biofield telemetry stale. Deploy check-in for fresh state data.'
      }
      if (!hasMood && logs.length > 3) {
        return 'No biofield data in pipeline. Initialize to calibrate emotional telemetry.'
      }

      // Declining biofield trend
      if (moodTrend === 'declining') {
        return 'Declining biofield trajectory. Deploy Cleanness module or reflective journaling.'
      }

      // Module coverage directives
      if (dormantModules.length >= 4) {
        return `${dormantModules.length} CQGS modules dormant. Expand biofeedback coverage for richer compilation.`
      }
      if (!hasMemory && logs.length > 10) {
        return 'Memory engine idle. Deploy to begin long-term pattern integration.'
      }
      if (!hasIntention && logs.length > 10) {
        return 'No intention vector set. Initialize to calibrate alignment signals.'
      }

      // Time-phase directives grounded in CQGS Routine
      if (timePhase === 'morning' && todayActivity.length === 0) {
        return 'Morning routine window open. Set an intention to initialize today\'s context.'
      }
      if (timePhase === 'evening' && todayMoodCount === 0) {
        return 'Evening approaching. Log biofield state before daily buffer flushes.'
      }
      if (timePhase === 'night' && sessionDepth > 5) {
        return 'Extended night session. Consider winding down. The biofield compiles at rest.'
      }

      // High engagement directives
      if (sessionDepth > 10) {
        return 'Deep session active. Maintain focus or deploy a Cleanness interrupt.'
      }

      // Positive reinforcement — CQGS Citizen Index
      if (streak >= 7 && moodTrend === 'improving') {
        return 'Routine and biofield trajectory aligned. Citizen Index compiling optimally.'
      }
      if (todayActivity.length >= 5) {
        return 'Strong biofeedback volume today. Patterns converging with higher fidelity.'
      }

      // Default based on engagement level
      if (engagementLevel === 'new') return 'CQGS initializing. Continue input to bootstrap pattern recognition.'
      if (engagementLevel === 'exploring') return 'Exploration phase active. Broaden CQGS module coverage for richer biofeedback.'
      if (engagementLevel === 'building') return 'Foundation compiling. Maintain routine to accelerate Bioethics Index.'
      if (engagementLevel === 'integrated') return 'Integrated state achieved. CQGS operating at full observability.'
      return 'Transparent citizen. All CQGS modules online and converging.'
    }

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
      hasJournal,
      widgetDiversity,
      peakHour,
      // Extended context fields
      timePhase,
      currentHour,
      hoursSinceLastActivity,
      lastMoodCheckin,
      hoursSinceLastMood,
      recentTexts,
      todayMoodCount,
      todayMemoryCount,
      todaySelfCareCount,
      todayPlannerCount,
      todayIntentionCount,
      todayJournalCount,
      sessionDepth,
      mostUsedWidget,
      leastUsedWidget,
      activeModules,
      dormantModules,
      engagementLevel,
      getContextualDirective,
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
