/**
 * User Operating System API
 *
 * Treats each user as a measurable system with:
 * - OS Version (maturity/progression level)
 * - Performance Metrics (engagement, consistency, depth)
 * - System Health (balance, patterns, growth)
 * - Diagnostics (insights, recommendations, bottlenecks)
 *
 * Philosophy: Users are living systems that evolve, stabilize, and optimize over time.
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import { Op } from 'sequelize'
import dayjs from '#server/utils/dayjs'
import { extractUserTraits, determineUserCohort } from '#server/utils/memory'
import { analyzeUserPatterns } from '#server/utils/patterns'
import type { Log, User } from '#shared/types'

export function registerOSRoutes(fastify: FastifyInstance) {

  /**
   * GET /api/os/status
   * System health check - overall state of user's LOT system
   */
  fastify.get('/os/status', async (req: FastifyRequest, reply) => {
    try {
      const userId = req.user.id

      // Calculate core metrics
      const [answerCount, logCount, lastActivity, streak] = await Promise.all([
        fastify.models.Answer.count({ where: { userId } }),
        fastify.models.Log.count({ where: { userId } }),
        fastify.models.Log.findOne({
          where: { userId },
          order: [['createdAt', 'DESC']],
          attributes: ['createdAt'],
        }),
        calculateStreak(userId, fastify),
      ])

      const daysSinceStart = await getDaysSinceFirstActivity(userId, fastify)
      const engagementRate = daysSinceStart > 0 ? (answerCount / daysSinceStart) : 0

      // System health score (0-100)
      const health = calculateSystemHealth({
        answerCount,
        logCount,
        streak,
        engagementRate,
        daysSinceStart,
      })

      // Determine system state
      let state: 'initializing' | 'active' | 'engaged' | 'optimized' | 'dormant'
      if (answerCount === 0) state = 'initializing'
      else if (streak === 0) state = 'dormant'
      else if (engagementRate > 0.8) state = 'optimized'
      else if (engagementRate > 0.4) state = 'engaged'
      else state = 'active'

      return {
        health,
        state,
        uptime: daysSinceStart,
        streak,
        lastActivity: lastActivity?.createdAt || null,
        metrics: {
          totalInteractions: answerCount + logCount,
          memoryQuestions: answerCount,
          journalEntries: logCount,
          engagementRate: Math.round(engagementRate * 100),
        },
      }
    } catch (error: any) {
      console.error('❌ OS Status error:', error)
      return reply.status(500).send({ error: 'Failed to retrieve OS status' })
    }
  })

  /**
   * GET /api/os/version
   * User's OS version - progression/maturity level
   */
  fastify.get('/os/version', async (req: FastifyRequest, reply) => {
    try {
      const userId = req.user.id

      // Get comprehensive metrics
      const [answerCount, logCount, daysSinceStart, logs] = await Promise.all([
        fastify.models.Answer.count({ where: { userId } }),
        fastify.models.Log.count({ where: { userId } }),
        getDaysSinceFirstActivity(userId, fastify),
        fastify.models.Log.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 100,
        }),
      ])

      // Extract psychological depth if enough data
      let psychologicalDepth: any = null
      if (logs.length >= 10) {
        const analysis = extractUserTraits(logs)
        psychologicalDepth = analysis.psychologicalDepth
      }

      // Calculate version based on progression
      const version = calculateOSVersion({
        answerCount,
        logCount,
        daysSinceStart,
        psychologicalDepth,
      })

      return {
        version: version.number,
        name: version.name,
        description: version.description,
        progression: version.progression, // 0-100 to next version
        nextVersion: version.nextVersion,
        requirements: version.requirements,
        unlocked: version.unlocked,
        milestones: version.milestones,
      }
    } catch (error: any) {
      console.error('❌ OS Version error:', error)
      return reply.status(500).send({ error: 'Failed to retrieve OS version' })
    }
  })

  /**
   * GET /api/os/insights
   * Real-time pattern insights and recommendations
   */
  fastify.get('/os/insights', async (req: FastifyRequest, reply) => {
    try {
      const userId = req.user.id

      // Get recent logs for pattern analysis
      const logs = await fastify.models.Log.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 200,
      })

      if (logs.length < 10) {
        return {
          insights: [],
          message: 'Keep engaging to unlock pattern insights',
        }
      }

      // Analyze patterns
      const patterns = await analyzeUserPatterns(req.user, logs)

      // Generate actionable recommendations
      const recommendations = generateRecommendations(logs, patterns)

      return {
        insights: patterns,
        recommendations,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error('❌ OS Insights error:', error)
      return reply.status(500).send({ error: 'Failed to generate insights' })
    }
  })

  /**
   * GET /api/os/performance
   * Engagement metrics, consistency, and growth indicators
   */
  fastify.get('/os/performance', async (req: FastifyRequest, reply) => {
    try {
      const userId = req.user.id

      // Get time-series data
      const answers = await fastify.models.Answer.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt'],
        limit: 100,
      })

      const logs = await fastify.models.Log.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt', 'event'],
        limit: 200,
      })

      // Calculate performance metrics
      const consistency = calculateConsistency(answers)
      const velocity = calculateVelocity(logs)
      const depth = calculateDepth(logs)
      const balance = calculateBalance(logs)

      // Weekly trends
      const weeklyMetrics = calculateWeeklyMetrics(logs)

      return {
        overall: {
          consistency: Math.round(consistency * 100),
          velocity: Math.round(velocity * 100),
          depth: Math.round(depth * 100),
          balance: Math.round(balance * 100),
        },
        trends: {
          weekly: weeklyMetrics,
          trajectory: determineTrend(weeklyMetrics),
        },
        benchmarks: {
          answers: answers.length,
          logs: logs.length,
          avgPerWeek: (logs.length / Math.max(weeklyMetrics.length, 1)),
        },
      }
    } catch (error: any) {
      console.error('❌ OS Performance error:', error)
      return reply.status(500).send({ error: 'Failed to calculate performance' })
    }
  })

  /**
   * GET /api/os/diagnostics
   * System diagnostics, bottlenecks, and optimization suggestions
   */
  fastify.get('/os/diagnostics', async (req: FastifyRequest, reply) => {
    try {
      const userId = req.user.id

      // Comprehensive system check
      const [
        answers,
        logs,
        lastMemory,
        lastMood,
        lastPlanner,
      ] = await Promise.all([
        fastify.models.Answer.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 50,
        }),
        fastify.models.Log.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 100,
        }),
        fastify.models.Answer.findOne({
          where: { userId },
          order: [['createdAt', 'DESC']],
        }),
        fastify.models.Log.findOne({
          where: { userId, event: 'emotional_checkin' },
          order: [['createdAt', 'DESC']],
        }),
        fastify.models.Log.findOne({
          where: { userId, event: 'plan_set' },
          order: [['createdAt', 'DESC']],
        }),
      ])

      // Detect issues
      const issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; description: string; suggestion: string }> = []

      // Check for inactivity
      if (lastMemory) {
        const daysSinceMemory = dayjs().diff(dayjs(lastMemory.createdAt), 'day')
        if (daysSinceMemory > 2) {
          issues.push({
            type: 'inactivity',
            severity: daysSinceMemory > 7 ? 'high' : 'medium',
            description: `Last Memory question: ${daysSinceMemory} days ago`,
            suggestion: 'Check in with a Memory question to maintain your streak',
          })
        }
      }

      // Check for imbalanced widget usage
      const moodCount = logs.filter(l => l.event === 'emotional_checkin').length
      const plannerCount = logs.filter(l => l.event === 'plan_set').length
      const memoryCount = answers.length

      if (memoryCount > 10 && (moodCount === 0 || plannerCount === 0)) {
        issues.push({
          type: 'imbalance',
          severity: 'low',
          description: 'Focusing mainly on Memory questions',
          suggestion: 'Try Mood check-ins or Planner to get fuller insights',
        })
      }

      // Check for pattern stagnation
      if (answers.length > 20) {
        const recentOptions = answers.slice(0, 10).map(a => a.metadata?.option)
        const uniqueRecent = new Set(recentOptions).size
        if (uniqueRecent < 4) {
          issues.push({
            type: 'stagnation',
            severity: 'low',
            description: 'Similar choices in recent answers',
            suggestion: 'Explore different options to discover new patterns',
          })
        }
      }

      // Calculate optimization score
      const optimizationScore = Math.max(0, 100 - (issues.length * 15))

      return {
        status: issues.length === 0 ? 'optimal' : issues.some(i => i.severity === 'high') ? 'needs_attention' : 'good',
        optimizationScore,
        issues,
        lastActivity: {
          memory: lastMemory?.createdAt || null,
          mood: lastMood?.createdAt || null,
          planner: lastPlanner?.createdAt || null,
        },
        recommendations: generateOptimizationSteps(issues),
      }
    } catch (error: any) {
      console.error('❌ OS Diagnostics error:', error)
      return reply.status(500).send({ error: 'Failed to run diagnostics' })
    }
  })

  /**
   * GET /api/os/config
   * User's system configuration and preferences
   */
  fastify.get('/os/config', async (req: FastifyRequest, reply) => {
    try {
      const user = req.user

      // Get privacy settings if they exist
      const metadata = await fastify.models.UserMetadata.findOne({
        where: { userId: user.id },
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(' '),
          tags: user.tags,
        },
        settings: {
          privacy: metadata?.privacySettings || {},
          theme: {
            current: user.theme || 'light',
            baseColor: user.baseColor || '#ffffff',
            accentColor: user.accentColor || '#000000',
          },
          location: user.city && user.country ? {
            city: user.city,
            country: user.country,
          } : null,
        },
        features: {
          usership: user.tags.some(t => t.toLowerCase() === 'usership'),
          publicProfile: metadata?.privacySettings?.isProfilePublic || false,
          customUrl: user.customUrl || null,
        },
      }
    } catch (error: any) {
      console.error('❌ OS Config error:', error)
      return reply.status(500).send({ error: 'Failed to retrieve config' })
    }
  })
}

// ============================================================================
// Helper Functions
// ============================================================================

async function calculateStreak(userId: string, fastify: FastifyInstance): Promise<number> {
  const answers = await fastify.models.Answer.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    attributes: ['createdAt'],
  })

  if (answers.length === 0) return 0

  const today = dayjs().startOf('day')
  let currentDate = today
  const answerDays = new Set(
    answers.map(a => dayjs(a.createdAt).startOf('day').format('YYYY-MM-DD'))
  )

  // Start from today or yesterday
  if (!answerDays.has(today.format('YYYY-MM-DD'))) {
    currentDate = today.subtract(1, 'day')
  }

  let streak = 0
  while (answerDays.has(currentDate.format('YYYY-MM-DD'))) {
    streak++
    currentDate = currentDate.subtract(1, 'day')
  }

  return streak
}

async function getDaysSinceFirstActivity(userId: string, fastify: FastifyInstance): Promise<number> {
  const firstActivity = await fastify.models.Log.findOne({
    where: { userId },
    order: [['createdAt', 'ASC']],
    attributes: ['createdAt'],
  })

  if (!firstActivity) return 0

  return dayjs().diff(dayjs(firstActivity.createdAt), 'day')
}

function calculateSystemHealth(metrics: {
  answerCount: number
  logCount: number
  streak: number
  engagementRate: number
  daysSinceStart: number
}): number {
  const { answerCount, streak, engagementRate, daysSinceStart } = metrics

  // Health components (each 0-25)
  const dataHealth = Math.min(25, (answerCount / 50) * 25) // 50 answers = perfect data
  const consistencyHealth = Math.min(25, (streak / 30) * 25) // 30 day streak = perfect consistency
  const engagementHealth = Math.min(25, engagementRate * 25) // 100% = perfect engagement
  const maturityHealth = Math.min(25, (daysSinceStart / 60) * 25) // 60 days = mature system

  return Math.round(dataHealth + consistencyHealth + engagementHealth + maturityHealth)
}

function calculateOSVersion(metrics: {
  answerCount: number
  logCount: number
  daysSinceStart: number
  psychologicalDepth: any
}): any {
  const { answerCount, logCount, daysSinceStart, psychologicalDepth } = metrics

  // Version progression tiers
  const versions = [
    {
      number: '0.1.0',
      name: 'Initializing',
      description: 'System starting up',
      requirements: { answers: 0, days: 0 },
      unlocked: ['Memory', 'Basic logging'],
      milestones: [],
    },
    {
      number: '0.5.0',
      name: 'Emerging',
      description: 'Patterns beginning to form',
      requirements: { answers: 7, days: 7 },
      unlocked: ['Memory', 'Mood', 'Pattern detection'],
      milestones: ['First week', 'Initial patterns'],
    },
    {
      number: '1.0.0',
      name: 'Active',
      description: 'System fully operational',
      requirements: { answers: 20, days: 14 },
      unlocked: ['All widgets', 'Psychological profiling'],
      milestones: ['Two weeks active', 'Profile generated'],
    },
    {
      number: '1.5.0',
      name: 'Engaged',
      description: 'Consistent usage, deep patterns',
      requirements: { answers: 50, days: 30 },
      unlocked: ['Badge system', 'Advanced insights'],
      milestones: ['30 day milestone', 'Deep pattern recognition'],
    },
    {
      number: '2.0.0',
      name: 'Optimized',
      description: 'Highly tuned, integrated system',
      requirements: { answers: 100, days: 60 },
      unlocked: ['Full diagnostics', 'Cohort matching', 'Growth trajectory'],
      milestones: ['100 interactions', '60 days uptime'],
    },
    {
      number: '3.0.0',
      name: 'Integrated',
      description: 'Mastery level - system and self in harmony',
      requirements: { answers: 200, days: 120 },
      unlocked: ['All features', 'Legacy mode', 'Mentorship capabilities'],
      milestones: ['200+ interactions', '120+ days', 'Integrated self-knowledge'],
    },
  ]

  // Find current version
  let currentVersion = versions[0]
  for (const version of versions) {
    if (answerCount >= version.requirements.answers && daysSinceStart >= version.requirements.days) {
      currentVersion = version
    } else {
      break
    }
  }

  // Calculate progression to next version
  const currentIndex = versions.indexOf(currentVersion)
  const nextVersion = versions[currentIndex + 1] || null

  let progression = 100
  if (nextVersion) {
    const answerProgress = (answerCount / nextVersion.requirements.answers) * 100
    const dayProgress = (daysSinceStart / nextVersion.requirements.days) * 100
    progression = Math.min(100, Math.min(answerProgress, dayProgress))
  }

  return {
    ...currentVersion,
    progression: Math.round(progression),
    nextVersion: nextVersion?.number || null,
  }
}

function generateRecommendations(logs: Log[], patterns: any[]): string[] {
  const recommendations: string[] = []

  // Check for missing widget types
  const hasMemory = logs.some(l => l.event === 'answer')
  const hasMood = logs.some(l => l.event === 'emotional_checkin')
  const hasPlanner = logs.some(l => l.event === 'plan_set')

  if (!hasMood) recommendations.push('Try a Mood check-in to track emotional patterns')
  if (!hasPlanner) recommendations.push('Set a Plan to explore intention and direction')

  // Based on patterns
  if (patterns.some(p => p.type === 'temporal' && p.confidence > 0.7)) {
    recommendations.push('Strong timing pattern detected - maintain your rhythm')
  }

  return recommendations
}

function calculateConsistency(answers: any[]): number {
  if (answers.length < 7) return 0

  // Check for gaps in the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(i, 'day').format('YYYY-MM-DD')
  )

  const answerDays = new Set(
    answers.map(a => dayjs(a.createdAt).format('YYYY-MM-DD'))
  )

  const daysWithAnswers = last7Days.filter(day => answerDays.has(day)).length
  return daysWithAnswers / 7
}

function calculateVelocity(logs: Log[]): number {
  if (logs.length < 2) return 0

  // Interactions per day over last 30 days
  const thirtyDaysAgo = dayjs().subtract(30, 'day')
  const recentLogs = logs.filter(l => dayjs(l.createdAt).isAfter(thirtyDaysAgo))

  return Math.min(1, recentLogs.length / 30)
}

function calculateDepth(logs: Log[]): number {
  // Quality of engagement - longer notes, varied events
  const notes = logs.filter(l => l.event === 'note')
  const avgNoteLength = notes.length > 0
    ? notes.reduce((sum, n) => sum + (n.text?.length || 0), 0) / notes.length
    : 0

  return Math.min(1, avgNoteLength / 100) // 100 char average = 100% depth
}

function calculateBalance(logs: Log[]): number {
  // Variety of widget usage
  const eventTypes = new Set(logs.map(l => l.event))
  return Math.min(1, eventTypes.size / 5) // 5 different event types = perfect balance
}

function calculateWeeklyMetrics(logs: Log[]): Array<{ week: string; count: number }> {
  const weeklyData: Record<string, number> = {}

  for (const log of logs) {
    const week = dayjs(log.createdAt).format('YYYY-[W]WW')
    weeklyData[week] = (weeklyData[week] || 0) + 1
  }

  return Object.entries(weeklyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .reverse()
    .map(([week, count]) => ({ week, count }))
}

function determineTrend(weeklyMetrics: Array<{ week: string; count: number }>): 'increasing' | 'stable' | 'decreasing' {
  if (weeklyMetrics.length < 2) return 'stable'

  const recent = weeklyMetrics.slice(-3)
  const older = weeklyMetrics.slice(0, 3)

  const recentAvg = recent.reduce((sum, w) => sum + w.count, 0) / recent.length
  const olderAvg = older.reduce((sum, w) => sum + w.count, 0) / older.length

  if (recentAvg > olderAvg * 1.2) return 'increasing'
  if (recentAvg < olderAvg * 0.8) return 'decreasing'
  return 'stable'
}

function generateOptimizationSteps(issues: any[]): string[] {
  const steps: string[] = []

  if (issues.length === 0) {
    return ['System running optimally - maintain current engagement']
  }

  // Prioritize by severity
  const highSeverity = issues.filter(i => i.severity === 'high')
  const mediumSeverity = issues.filter(i => i.severity === 'medium')

  if (highSeverity.length > 0) {
    steps.push(highSeverity[0].suggestion)
  }

  if (mediumSeverity.length > 0) {
    steps.push(mediumSeverity[0].suggestion)
  }

  if (steps.length < 3) {
    steps.push('Check System page regularly to maintain rhythm')
  }

  return steps
}
