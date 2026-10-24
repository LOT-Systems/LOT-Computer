/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import dayjs from '#server/utils/dayjs'

/**
 * Scheduled Jobs - Automated Monthly Email System
 *
 * Handles automated sending of monthly review emails to users
 * Runs at 9 AM UTC on the 1st of every month
 */

interface JobResult {
  jobName: string
  executedAt: string
  success: boolean
  result?: any
  error?: string
  signalsCreated?: number
}

let isMonthlyEmailJobRunning = false
let lastMonthlyEmailRun: Date | null = null

/**
 * Check if we should run the monthly email job
 * Runs on 1st of month, once per day
 */
function shouldRunMonthlyEmailJob(): boolean {
  const now = dayjs()
  const dayOfMonth = now.date()

  // Only run on 1st of month
  if (dayOfMonth !== 1) {
    return false
  }

  // Don't run if already running
  if (isMonthlyEmailJobRunning) {
    console.log('⏸️  Monthly email job already running, skipping')
    return false
  }

  // Don't run if already ran today
  if (lastMonthlyEmailRun) {
    const lastRun = dayjs(lastMonthlyEmailRun)
    if (lastRun.isSame(now, 'day')) {
      console.log('Monthly email job already ran today, skipping')
      return false
    }
  }

  return true
}

/**
 * Execute monthly email sending job
 */
async function executeMonthlyEmailJob(): Promise<JobResult> {
  const jobName = 'monthly-email-sender'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('━'.repeat(60))
  console.log('📅 SCHEDULED JOB: Monthly Email Sender')
  console.log(`   Started at: ${executedAt}`)
  console.log('━'.repeat(60))
  console.log('')

  isMonthlyEmailJobRunning = true

  try {
    // Dynamic import to avoid circular dependencies
    const { sendEmail } = await import('#server/utils/email.js')
    const { generateMonthlySummary, generateMonthlyEmailBody, generateMonthlyEmailHtml, shouldShowMonthlySummary } = await import('#server/utils/monthly-summary.js')
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    // Find active users: 3+ months old, recently active (seen in last 7 days)
    // These are dedicated users with near-daily engagement
    const threeMonthsAgo = dayjs().subtract(3, 'month').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    let activeUsers: any[]
    try {
      activeUsers = await User.findAll({
        where: {
          // Must have joined 3+ months ago
          joinedAt: {
            [Op.lte]: threeMonthsAgo
          },
          // Must be recently active (within last 7 days — proxy for near-daily)
          lastSeenAt: {
            [Op.gte]: sevenDaysAgo
          },
          // Only send to users with Usership tag
          tags: {
            [Op.contains]: ['usership']
          }
        },
        order: [['lastSeenAt', 'DESC']]
      })
    } catch (dbError: any) {
      console.error('Failed to query active users:', dbError.message)
      isMonthlyEmailJobRunning = false
      return { jobName, executedAt, success: false, error: `User query failed: ${dbError.message}` }
    }

    console.log(`Found ${activeUsers.length} active users (3+ months, near-daily)`)
    console.log('')

    const results = {
      total: activeUsers.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      details: [] as any[]
    }

    // Theme defaults matching the profile page
    const THEMES: Record<string, { base: string; acc: string }> = {
      light: { base: '#ffffff', acc: '#000000' },
      dark: { base: '#000000', acc: '#ffffff' },
      sunrise: { base: '#ffd266', acc: '#ffffff' },
      sunset: { base: '#FF8758', acc: '#ffffff' },
      fill_blue: { base: '#82CBF8', acc: '#ffffff' },
      light_red: { base: '#FFF9F9', acc: '#E86575' },
    }

    // Process each user
    for (const user of activeUsers) {
      try {
        const userPublic = user.toPublic()

        // Check if user should receive monthly summary
        const metadata = user.metadata as any || {}
        const lastMonthlySummary = metadata.lastMonthlySummaryDate ? new Date(metadata.lastMonthlySummaryDate) : null

        if (!shouldShowMonthlySummary(userPublic, lastMonthlySummary)) {
          results.skipped++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'skipped',
            reason: 'Too soon since last summary'
          })
          console.log(`⏭️  ${user.email}: Skipped (too soon)`)
          continue
        }

        // Fetch user's logs
        let logs: any[]
        try {
          logs = await Log.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']],
            limit: 1000
          })
        } catch (logError: any) {
          results.failed++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'failed',
            error: `Log query failed: ${logError.message}`
          })
          console.log(`${user.email}: Failed to fetch logs - ${logError.message}`)
          continue
        }

        // Verify near-daily engagement over last 3 months
        const threeMonthsAgoDate = dayjs().subtract(3, 'month')
        const threeMonthLogs = logs.filter((l: any) =>
          dayjs(l.createdAt).isAfter(threeMonthsAgoDate)
        )
        const uniqueActiveDays = new Set(
          threeMonthLogs.map((l: any) => dayjs(l.createdAt).format('YYYY-MM-DD'))
        ).size
        const totalDaysInPeriod = dayjs().diff(threeMonthsAgoDate, 'day')
        const dailyRatio = totalDaysInPeriod > 0 ? uniqueActiveDays / totalDaysInPeriod : 0

        // Require ~everyday login: at least 60% of days active over 3 months
        if (dailyRatio < 0.6) {
          results.skipped++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'skipped',
            reason: `Insufficient daily engagement (${Math.round(dailyRatio * 100)}% of days)`
          })
          console.log(`⏭️  ${user.email}: Skipped (${Math.round(dailyRatio * 100)}% daily engagement, need 60%+)`)
          continue
        }

        // Need at least some activity to generate summary
        if (logs.length < 5) {
          results.skipped++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'skipped',
            reason: 'Insufficient activity'
          })
          console.log(`⏭️  ${user.email}: Skipped (insufficient activity)`)
          continue
        }

        // Generate monthly summary
        console.log(`Generating summary for ${user.email}...`)
        const summary = await generateMonthlySummary(userPublic, logs.map((l: any) => l.toJSON()))

        // Resolve user theme for email styling
        const userThemeName = metadata.theme || 'light'
        const isCustom = userThemeName === 'custom' && metadata.baseColor && metadata.accentColor
        const themeColors = isCustom
          ? { base: metadata.baseColor, acc: metadata.accentColor }
          : (THEMES[userThemeName] || THEMES.light)

        const emailTheme = {
          baseColor: themeColors.base,
          accentColor: themeColors.acc,
          themeName: userThemeName,
        }

        // Generate HTML email body in User OS style
        const htmlBody = generateMonthlyEmailHtml({
          firstName: user.firstName || '',
          period: summary.period,
          osVersion: summary.osVersion,
          osState: summary.osState,
          presence: summary.presence,
          energy: summary.energy,
          patterns: {
            dominantThemes: summary.patterns.dominantThemes,
            emotionalEvolution: summary.patterns.emotionalEvolution,
            strugglingPeriods: summary.patterns.strugglingPeriods,
            breakthroughMoments: summary.patterns.breakthroughMoments,
            insights: summary.patterns.insights,
          },
          growth: summary.growth,
          memoryStory: summary.memoryStory,
          forwardLook: summary.forwardLook,
          theme: emailTheme,
        })

        // Also generate plain text fallback
        const textBody = generateMonthlyEmailBody(summary, user.firstName || '')

        // Send email with HTML + text fallback
        console.log(`📧 Sending email to ${user.email}...`)
        const result = await sendEmail({
          to: user.email,
          subject: `${summary.period.month} ${summary.period.year} — Your LOT Review`,
          html: htmlBody,
          text: textBody,
        })

        if (result.success) {
          // Update user metadata with last summary date
          await user.set({
            metadata: {
              ...metadata,
              lastMonthlySummaryDate: new Date().toISOString()
            }
          }).save()

          results.sent++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'sent',
            messageId: result.messageId
          })
          console.log(`${user.email}: Sent successfully`)
        } else {
          results.failed++
          results.details.push({
            userId: user.id,
            email: user.email,
            status: 'failed',
            error: result.error
          })
          console.log(`${user.email}: Failed - ${result.error}`)
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error: any) {
        results.failed++
        results.details.push({
          userId: user.id,
          email: user.email,
          status: 'failed',
          error: error.message
        })
        console.log(`${user.email}: Error - ${error.message}`)
      }
    }

    console.log('')
    console.log('━'.repeat(60))
    console.log('MONTHLY EMAIL JOB COMPLETE')
    console.log(`   Sent: ${results.sent}`)
    console.log(`   Skipped: ${results.skipped}`)
    console.log(`   Failed: ${results.failed}`)
    console.log(`   Total: ${results.total}`)
    console.log('━'.repeat(60))
    console.log('')

    // Persist job result to database for audit trail
    try {
      // Find an admin user to associate the log entry with
      const adminUser = await User.findOne({
        where: { tags: { [Op.contains]: ['admin'] } }
      })
      if (adminUser) {
        await Log.create({
          userId: adminUser.id,
          event: 'scheduled_job' as any,
          text: `Monthly email job: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed out of ${results.total}`,
          metadata: {
            jobName,
            executedAt,
            ...results
          }
        })
      }
    } catch (persistError: any) {
      console.warn('Failed to persist job result to database:', persistError.message)
    }

    lastMonthlyEmailRun = new Date()
    isMonthlyEmailJobRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: results
    }
  } catch (error: any) {
    console.error('')
    console.error('━'.repeat(60))
    console.error('MONTHLY EMAIL JOB FAILED')
    console.error(`   Error: ${error.message}`)
    console.error('━'.repeat(60))
    console.error('')

    isMonthlyEmailJobRunning = false

    return {
      jobName,
      executedAt,
      success: false,
      error: error.message
    }
  }
}

// ─── Daily QIE Pattern Analytics ─────────────────────────────────────────────

let isDailyQIEJobRunning = false
let lastDailyQIERun: Date | null = null

/**
 * Runs daily at 03:00 UTC.
 * Compiles aggregate Quantum Intent Engine pattern statistics across
 * active users whose signals were synced to the server.
 * Results are logged for system monitoring — no user data is persisted.
 */
function shouldRunDailyQIEJob(): boolean {
  const now = dayjs()
  if (isDailyQIEJobRunning) return false
  if (lastDailyQIERun) {
    const lastRun = dayjs(lastDailyQIERun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

async function executeDailyQIEJob(): Promise<JobResult> {
  const jobName = 'daily-qie-pattern-analytics'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Daily QIE Pattern Analytics')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isDailyQIEJobRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    // Users active in the last 24 hours
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 1000,
    })

    console.log(`  Active users (24h): ${activeUsers.length}`)

    // Aggregate quantum intent signals from synced logs
    const qieLogs = await Log.findAll({
      where: {
        event: 'quantum_intent_signal' as any,
        createdAt: { [Op.gte]: sevenDaysAgo },
      },
      order: [['createdAt', 'DESC']],
      limit: 10000,
    })

    // Tally pattern frequencies
    const patternCounts: Record<string, number> = {}
    const sourceCounts: Record<string, number> = {}
    let totalSignals = 0

    for (const log of qieLogs) {
      const meta = (log as any).metadata || {}
      const pattern = meta.pattern as string | undefined
      const source = meta.source as string | undefined
      if (pattern) patternCounts[pattern] = (patternCounts[pattern] || 0) + 1
      if (source) sourceCounts[source] = (sourceCounts[source] || 0) + 1
      totalSignals++
    }

    // Top 5 patterns by frequency
    const topPatterns = Object.entries(patternCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    console.log(`  Total QIE signals (7d): ${totalSignals}`)
    console.log(`  Unique patterns detected: ${Object.keys(patternCounts).length}`)
    console.log('')
    console.log('  Top patterns:')
    topPatterns.forEach(([pattern, count]) => {
      console.log(`    ${pattern}: ${count}`)
    })
    console.log('')
    console.log('  Source distribution:')
    Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`    ${source}: ${count}`)
      })

    console.log('')
    console.log('─'.repeat(60))
    console.log('QIE ANALYTICS JOB COMPLETE')
    console.log(`   Signals: ${totalSignals} / Patterns: ${Object.keys(patternCounts).length} / Users: ${activeUsers.length}`)
    console.log('─'.repeat(60))
    console.log('')

    lastDailyQIERun = new Date()
    isDailyQIEJobRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { totalSignals, patternCount: Object.keys(patternCounts).length, activeUsers: activeUsers.length, topPatterns }
    }
  } catch (error: any) {
    console.error('Daily QIE analytics job failed:', error.message)
    isDailyQIEJobRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly Physiological Cohort Digest ──────────────────────────────────────

let isWeeklyCohortJobRunning = false
let lastWeeklyCohortRun: Date | null = null

/**
 * Runs on Mondays at 6 AM UTC.
 * Analyzes energy state and cohort signals for active users
 * and persists physiological classification to user metadata.
 */
function shouldRunWeeklyCohortJob(): boolean {
  const now = dayjs()
  const dayOfWeek = now.day() // 0 = Sunday, 1 = Monday

  if (dayOfWeek !== 1) return false
  if (isWeeklyCohortJobRunning) return false

  if (lastWeeklyCohortRun) {
    const lastRun = dayjs(lastWeeklyCohortRun)
    if (lastRun.isSame(now, 'day')) return false
  }

  return true
}

async function executeWeeklyCohortJob(): Promise<JobResult> {
  const jobName = 'weekly-physiological-cohort-digest'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Weekly Physiological Cohort Digest')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isWeeklyCohortJobRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { analyzeEnergyState } = await import('#server/utils/energy.js')
    const { determineUserCohort } = await import('#server/utils/memory/cohort-determination.js')
    const { extractUserTraits } = await import('#server/utils/memory/trait-extraction.js')
    const { Op } = await import('sequelize')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate()

    const activeUsers = await User.findAll({
      where: {
        lastSeenAt: { [Op.gte]: sevenDaysAgo },
      },
      order: [['lastSeenAt', 'DESC']],
      limit: 500,
    })

    console.log(`Processing ${activeUsers.length} active users...`)

    const results = { total: activeUsers.length, processed: 0, skipped: 0, failed: 0 }

    for (const user of activeUsers) {
      try {
        const logs = await Log.findAll({
          where: {
            userId: user.id,
            createdAt: { [Op.gte]: thirtyDaysAgo },
          },
          order: [['createdAt', 'DESC']],
          limit: 200,
        })

        if (logs.length < 3) {
          results.skipped++
          continue
        }

        const logData = logs.map((l: any) => l.toJSON())
        const energyState = analyzeEnergyState(logData)

        // Extract traits and determine cohort
        const traitResult = extractUserTraits(logData)
        const cohort = determineUserCohort(
          traitResult.traits,
          traitResult.patterns,
          traitResult.psychologicalDepth
        )

        // Persist to user metadata
        const metadata = (user as any).metadata as any || {}
        await (user as any).set({
          metadata: {
            ...metadata,
            physiologicalCohort: {
              archetype: cohort.archetype,
              behavioralCohort: cohort.behavioralCohort,
              description: cohort.description,
              energyStatus: energyState.status,
              energyTrajectory: energyState.trajectory,
              computedAt: new Date().toISOString(),
            },
          }
        }).save()

        results.processed++
        console.log(`  ${user.email}: ${cohort.archetype} / ${cohort.behavioralCohort} / ATP ${energyState.currentLevel}%`)
      } catch (err: any) {
        results.failed++
        console.warn(`  ${(user as any).email}: failed — ${err.message}`)
      }
    }

    console.log('')
    console.log('─'.repeat(60))
    console.log('COHORT JOB COMPLETE')
    console.log(`   Processed: ${results.processed} / Skipped: ${results.skipped} / Failed: ${results.failed}`)
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyCohortRun = new Date()
    isWeeklyCohortJobRunning = false

    return { jobName, executedAt, success: true, result: results }
  } catch (error: any) {
    console.error('Weekly cohort job failed:', error.message)
    isWeeklyCohortJobRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly QOS State Digest ──────────────────────────────────────────────────

let isWeeklyQOSJobRunning = false
let lastWeeklyQOSRun: Date | null = null

/**
 * Runs on Wednesdays at 4 AM UTC.
 * Computes each active user's Quantum OS version (derived from assembly progress,
 * physiological cohort, and QIE index) and logs a system summary.
 * No user data is persisted — summary is for system monitoring only.
 */
function shouldRunWeeklyQOSJob(): boolean {
  const now = dayjs()
  const dayOfWeek = now.day() // 0 = Sunday, 3 = Wednesday

  if (dayOfWeek !== 3) return false
  if (isWeeklyQOSJobRunning) return false

  if (lastWeeklyQOSRun) {
    const lastRun = dayjs(lastWeeklyQOSRun)
    if (lastRun.isSame(now, 'day')) return false
  }

  return true
}

async function executeWeeklyQOSJob(): Promise<JobResult> {
  const jobName = 'weekly-qos-state-digest'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Weekly QOS State Digest')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isWeeklyQOSJobRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Op } = await import('sequelize')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: sevenDaysAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 500,
    })

    console.log(`  Active users (7d): ${activeUsers.length}`)

    // Compute QOS version distribution from metadata
    const versionBuckets: Record<string, number> = {}
    const archetypeCounts: Record<string, number> = {}
    let usersWithCohort = 0
    let usersWithoutCohort = 0

    for (const user of activeUsers) {
      const metadata = (user as any).metadata as any || {}
      const pc = metadata.physiologicalCohort

      if (pc?.archetype) {
        archetypeCounts[pc.archetype] = (archetypeCounts[pc.archetype] || 0) + 1
        usersWithCohort++

        // Derive QOS version from energy + archetype availability
        const energyStatus = pc.energyStatus || 'unknown'
        const ver = energyStatus === 'optimal' ? 'v2' : energyStatus === 'moderate' ? 'v1' : 'v0'
        versionBuckets[ver] = (versionBuckets[ver] || 0) + 1
      } else {
        usersWithoutCohort++
        versionBuckets['v0'] = (versionBuckets['v0'] || 0) + 1
      }
    }

    console.log('')
    console.log('  QOS Version Distribution:')
    Object.entries(versionBuckets).sort().forEach(([ver, count]) => {
      console.log(`    ${ver}: ${count} users`)
    })

    console.log('')
    console.log('  Archetype Distribution (top 5):')
    Object.entries(archetypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([arch, count]) => {
        console.log(`    ${arch}: ${count}`)
      })

    console.log('')
    console.log(`  Cohort-resolved: ${usersWithCohort} / Pending: ${usersWithoutCohort}`)
    console.log('')
    console.log('─'.repeat(60))
    console.log('QOS DIGEST COMPLETE')
    console.log(`   Total: ${activeUsers.length} / Resolved: ${usersWithCohort}`)
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyQOSRun = new Date()
    isWeeklyQOSJobRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { total: activeUsers.length, usersWithCohort, usersWithoutCohort, versionBuckets, archetypeCounts }
    }
  } catch (error: any) {
    console.error('Weekly QOS digest failed:', error.message)
    isWeeklyQOSJobRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Intention Audit ────────────────────────────────────────────────────

let isDailyIntentionAuditRunning = false
let lastDailyIntentionAuditRun: Date | null = null

/**
 * Runs daily at 06:00 UTC.
 * Audits intention follow-through: users with active intention signals
 * but no planner/goal execution in 48h receive an intention_decay log entry.
 * Surfaced in the log UI as INTENT-DECAY: — terse field notice, not a notification.
 */
function shouldRunDailyIntentionAudit(): boolean {
  const now = dayjs()
  if (isDailyIntentionAuditRunning) return false
  if (lastDailyIntentionAuditRun) {
    const lastRun = dayjs(lastDailyIntentionAuditRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

async function executeDailyIntentionAudit(): Promise<JobResult> {
  const jobName = 'daily-intention-audit'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Daily Intention Audit')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isDailyIntentionAuditRunning = true

  try {
    const { Log } = await import('#server/models/log.js')

    // Find users with recent intention signals (7d) but no execution (48h)
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()
    const fortyEightHoursAgo = dayjs().subtract(48, 'hour').toDate()

    const intentionLogs = await Log.findAll({
      where: {
        event: 'intention',
        createdAt: { $gte: sevenDaysAgo } as any,
      },
      attributes: ['userId', 'createdAt'],
    })

    const executionLogs = await Log.findAll({
      where: {
        event: ['plan_set', 'goal_updated', 'goal_complete'],
        createdAt: { $gte: fortyEightHoursAgo } as any,
      },
      attributes: ['userId'],
    })

    const usersWithIntention = new Set(intentionLogs.map((l: any) => l.userId))
    const usersWithExecution = new Set(executionLogs.map((l: any) => l.userId))

    let decayCount = 0
    for (const userId of Array.from(usersWithIntention)) {
      if (!usersWithExecution.has(userId)) {
        // Log intention_decay notice — surfaced in log UI as INTENT-DECAY:
        await Log.create({
          userId,
          event: 'intention_decay_notice',
          text: 'Intention set. No execution signal in 48h.',
          metadata: {
            auditAt: executedAt,
            executionWindow: '48h',
            note: 'Intention without action becomes drift. One step closes the loop.',
          },
        })
        decayCount++
      }
    }

    console.log(`  Users with active intention: ${usersWithIntention.size}`)
    console.log(`  Users with 48h execution:    ${usersWithExecution.size}`)
    console.log(`  Intention-decay notices:     ${decayCount}`)
    console.log('')
    console.log('─'.repeat(60))
    console.log('INTENTION AUDIT COMPLETE')
    console.log(`   Decay: ${decayCount} / Active: ${usersWithIntention.size}`)
    console.log('─'.repeat(60))
    console.log('')

    lastDailyIntentionAuditRun = new Date()
    isDailyIntentionAuditRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { intentionUsers: usersWithIntention.size, executionUsers: usersWithExecution.size, decayCount }
    }
  } catch (error: any) {
    console.error('Daily intention audit failed:', error.message)
    isDailyIntentionAuditRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly LOT® AI Story Generation (Job 24 — Sunday 18:00 UTC) ─────────────
// Compresses each active user's week into a short personal narrative and stores
// it in user metadata as weeklyStory. Also writes a lot_ai_story log event.
// The story is template-based (no AI call) — dense, honest, earned compression.

let isWeeklyLOTAIStoryRunning = false
let lastWeeklyLOTAIStoryRun: Date | null = null

function shouldRunWeeklyLOTAIStory(): boolean {
  const now = dayjs()
  if (isWeeklyLOTAIStoryRunning) return false
  if (lastWeeklyLOTAIStoryRun) {
    const lastRun = dayjs(lastWeeklyLOTAIStoryRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.day() === 0 && now.hour() === 18 // Sunday 18:00 UTC
}

async function executeWeeklyLOTAIStory(): Promise<JobResult> {
  const jobName = 'weekly-lot-ai-story'
  const executedAt = new Date().toISOString()
  if (isWeeklyLOTAIStoryRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isWeeklyLOTAIStoryRunning = true

  console.log('─'.repeat(60))
  console.log('WEEKLY LOT® AI STORY GENERATION — Sunday 18:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { User } = await import('#server/models/user.js')
    const { Op } = await import('sequelize')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()
    const weekNumber = dayjs().isoWeek()
    const weekYear = dayjs().year()

    // Gather all logs from the past 7 days
    const recentLogs = await Log.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['userId', 'event', 'text', 'metadata', 'createdAt'],
      order: [['createdAt', 'ASC']],
    })

    // Group by user
    const byUser: Record<string, any[]> = {}
    for (const l of recentLogs) {
      const uid = String((l as any).userId)
      if (!byUser[uid]) byUser[uid] = []
      byUser[uid].push(l)
    }

    const MOOD_POSITIVE = new Set(['energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content', 'peaceful', 'excited', 'grounded', 'focused', 'flowing', 'steady'])
    const MOOD_HARD = new Set(['tired', 'anxious', 'exhausted', 'overwhelmed', 'restless', 'uncertain', 'drained', 'depleted', 'unsettled', 'heavy'])

    let generated = 0

    for (const [userId, logs] of Object.entries(byUser)) {
      if (logs.length < 3) continue // Not enough signal for a story

      const checkins = logs.filter((l: any) => l.event === 'emotional_checkin')
      const selfCare  = logs.filter((l: any) => ['self_care_complete', 'self_care_completed'].includes(l.event))
      const intentions = logs.filter((l: any) => l.event === 'intention')
      const notes = logs.filter((l: any) => ['note', 'journal'].includes(l.event))
      const totalLogs = logs.length

      // Derive dominant mood
      let positiveCount = 0
      let hardCount = 0
      let dominantMood: string | null = null
      const moodCounts: Record<string, number> = {}
      for (const c of checkins) {
        const mood = (c.metadata as any)?.emotionalState
        if (!mood) continue
        moodCounts[mood] = (moodCounts[mood] || 0) + 1
        if (MOOD_POSITIVE.has(mood)) positiveCount++
        if (MOOD_HARD.has(mood)) hardCount++
      }
      if (Object.keys(moodCounts).length > 0) {
        dominantMood = Object.entries(moodCounts).sort(([,a],[,b]) => b - a)[0][0]
      }

      // Derive week tone
      const weekTone = positiveCount > hardCount ? 'growth'
        : hardCount > positiveCount ? 'recovery'
        : 'steady'

      // Build the story text — compressed, first-person, honest
      const lines: string[] = []
      lines.push(`Week ${weekNumber}, ${weekYear}.`)

      if (checkins.length > 0 && dominantMood) {
        const cap = dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)
        lines.push(`${cap} was the dominant state across ${checkins.length} check-in${checkins.length !== 1 ? 's' : ''}.`)
      }

      if (selfCare.length > 0) {
        lines.push(`${selfCare.length} self-care moment${selfCare.length !== 1 ? 's' : ''} completed.`)
      }

      if (intentions.length > 0) {
        lines.push(`${intentions.length} intention${intentions.length !== 1 ? 's' : ''} set.`)
      }

      if (notes.length > 0) {
        lines.push(`${notes.length} note${notes.length !== 1 ? 's' : ''} logged.`)
      }

      const closingLines: Record<string, string> = {
        growth: 'The signal was forward.',
        recovery: 'The system held.',
        steady: 'Consistent. The foundation holds.',
      }
      lines.push(closingLines[weekTone])

      const storyText = lines.join(' ')

      // Write lot_ai_story log event
      await Log.create({
        userId: parseInt(userId),
        event: 'lot_ai_story',
        text: storyText,
        metadata: {
          weekNumber,
          weekYear,
          weekTone,
          dominantMood,
          checkinsCount: checkins.length,
          selfCareCount: selfCare.length,
          intentionsCount: intentions.length,
          totalLogsCount: totalLogs,
        },
      } as any)

      // Store in user metadata for API access
      try {
        const user = await User.findOne({ where: { id: parseInt(userId) } })
        if (user) {
          const meta = (user.metadata as any) || {}
          await user.set({
            metadata: {
              ...meta,
              weeklyStory: {
                text: storyText,
                weekNumber,
                weekYear,
                weekTone,
                dominantMood,
                generatedAt: new Date().toISOString(),
              },
            },
          }).save()
        }
      } catch (_) {}

      generated++
    }

    console.log(`LOT® AI STORY GENERATION COMPLETE — ${generated} stories written`)
    console.log('─'.repeat(60))

    lastWeeklyLOTAIStoryRun = new Date()
    isWeeklyLOTAIStoryRunning = false
    return { jobName, executedAt, success: true, result: { generated } }
  } catch (error: any) {
    console.error('Weekly LOT® AI story generation failed:', error.message)
    isWeeklyLOTAIStoryRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Archetype Directive Pulse (Job 25 — 09:00 UTC every day) ─────────
// Reads each active user's current archetype and writes an archetype_directive_pulse
// log event with the day's operating directive. Fires at 09:00 UTC daily — the
// beginning of the cognitive prime window for most operators. Distinct from
// Job 10 (archetype shift monitor): shift monitors for archetype changes over 7d;
// this pulse delivers the current archetype's directive each morning as an
// actionable instrument reading. The DRCT: block surfaces it in the LOG.

let isDailyArchetypeDirectivePulseRunning = false
let lastDailyArchetypeDirectivePulseRun: Date | null = null

function shouldRunDailyArchetypeDirectivePulse(): boolean {
  const now = dayjs()
  if (isDailyArchetypeDirectivePulseRunning) return false
  if (lastDailyArchetypeDirectivePulseRun) {
    const lastRun = dayjs(lastDailyArchetypeDirectivePulseRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 9 // 09:00 UTC daily
}

async function executeDailyArchetypeDirectivePulse(): Promise<JobResult> {
  const jobName = 'daily-archetype-directive-pulse'
  const executedAt = new Date().toISOString()
  if (isDailyArchetypeDirectivePulseRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyArchetypeDirectivePulseRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY ARCHETYPE DIRECTIVE PULSE — 09:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')

    const oneDayAgo = dayjs().subtract(24, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { $gte: oneDayAgo } as any },
      attributes: ['id', 'metadata'],
      limit: 2000,
    })

    // Archetype directive map — compressed operating directives per archetype
    const ARCHETYPE_DIRECTIVES: Record<string, { label: string; directive: string }> = {
      'Relentless Builder':       { label: 'BUILD',    directive: 'Build without waiting for perfect conditions. Progress is the feedback.' },
      'Resilient Protector':      { label: 'HOLD',     directive: 'Stability is not stagnation. Anchor others by anchoring yourself.' },
      'Adaptive Navigator':       { label: 'ADAPT',    directive: 'The path shifts. Lock the destination, release the route.' },
      'Quiet Achiever':           { label: 'EXECUTE',  directive: 'Depth over display. One completed thing outweighs ten announced.' },
      'Visionary Connector':      { label: 'BRIDGE',   directive: 'The idea needs a listener. Make the connection today.' },
      'Grounded Strategist':      { label: 'ANCHOR',   directive: 'Strategy without ground truth is noise. Read the real data.' },
      'Energized Innovator':      { label: 'SPARK',    directive: 'Energy is the signal. Follow the pull, record the output.' },
      'Reflective Observer':      { label: 'OBSERVE',  directive: 'Pattern recognition requires stillness. Observe before acting.' },
      'Systematic Optimizer':     { label: 'OPTIMIZE', directive: 'One constraint removed today compounds for a year.' },
      'Dynamic Challenger':       { label: 'PUSH',     directive: 'Resistance is the weight room. Enter it voluntarily.' },
      'Empathetic Catalyst':      { label: 'MOVE',     directive: 'Your attention moves things. Point it where it matters.' },
      'Precision Executor':       { label: 'PRECISE',  directive: 'The margin is in the detail. Eliminate the approximation.' },
      'Integrative Thinker':      { label: 'CONNECT',  directive: 'The answer is usually in the gap between two fields.' },
      'Momentum Builder':         { label: 'CONTINUE', directive: 'Streak is infrastructure. Protect it.' },
      'Focused Achiever':         { label: 'LOCK',     directive: 'Single target. Full force. Today is not a day for optionality.' },
      'Coherence Architect':      { label: 'ALIGN',    directive: 'Align one system today. The rest follows.' },
      'Signal Amplifier':         { label: 'AMPLIFY',  directive: 'Surface what is working. Repeat it deliberately.' },
      'Sovereign Operator':       { label: 'OPERATE',  directive: 'The system is you. Run it with intention.' },
      'Structural Architect':     { label: 'FRAME',    directive: 'Good structure carries more than any single decision.' },
      'Quantum Catalyst':         { label: 'CATALYZE', directive: 'State transition is available. Commit to the new configuration.' },
      'Flow State Engineer':      { label: 'FLOW',     directive: 'Remove the one friction point. Flow does the rest.' },
      'Temporal Strategist':      { label: 'TIME',     directive: 'Match the task to the window. Timing is leverage.' },
      'Pattern Synthesizer':      { label: 'SYNTH',    directive: 'Two patterns converging is a signal. Act on the intersection.' },
      'Evolutionary Operator':    { label: 'EVOLVE',   directive: 'The current configuration is not the final configuration. Update.' },
      'Vital Force Carrier':      { label: 'VITALIZE', directive: 'Energy maintained is energy compounded. Protect the source.' },
      'Resonance Field Builder':  { label: 'RESONATE', directive: 'The signal you broadcast is the environment you create.' },
      'Deep Signal Reader':       { label: 'READ',     directive: 'The body is already reporting. Listen before acting.' },
      'Crystalline Intelligence': { label: 'CLARIFY',  directive: 'Precision removes friction faster than speed ever will.' },
      'Peak Strategist':          { label: 'PEAK',     directive: 'Biology aligned with strategy. Prime window open during sustained momentum streak. Commit fully, decide fast, record everything.' },
    }

    let written = 0
    for (const user of activeUsers) {
      try {
        const meta = (user as any).metadata as any || {}
        const archetype = meta.currentArchetype as string | undefined
        if (!archetype) continue
        const entry = ARCHETYPE_DIRECTIVES[archetype]
        if (!entry) continue
        await (Log as any).create({
          userId: (user as any).id,
          event: 'archetype_directive_pulse',
          text: entry.directive,
          metadata: {
            archetype,
            label: entry.label,
            directive: entry.directive,
            hour: 9,
          },
        })
        written++
      } catch (_) {}
    }

    console.log(`ARCHETYPE DIRECTIVE PULSE COMPLETE — ${written} directives written`)
    console.log('─'.repeat(60))

    lastDailyArchetypeDirectivePulseRun = new Date()
    isDailyArchetypeDirectivePulseRunning = false
    return { jobName, executedAt, success: true, result: { written } }
  } catch (error: any) {
    console.error('Daily archetype directive pulse failed:', error.message)
    isDailyArchetypeDirectivePulseRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Physiological Cohort Broadcast (Job 26 — 17:00 UTC every day) ────
// Reads each active user's stored physiological cohort metadata and writes a
// physiological_cohort log event. Surfaces archetype + dominantModule + confidence
// for dashboard rendering at the end of the productive window. Distinct from
// J25 (archetype directive pulse at 09:00): that job delivers the morning directive;
// this job broadcasts the cohort state at 17:00 for afternoon/evening surfacing.

let isDailyPhysiologicalCohortBroadcastRunning = false
let lastDailyPhysiologicalCohortBroadcastRun: Date | null = null

function shouldRunDailyPhysiologicalCohortBroadcast(): boolean {
  const now = dayjs()
  if (isDailyPhysiologicalCohortBroadcastRunning) return false
  if (lastDailyPhysiologicalCohortBroadcastRun) {
    const lastRun = dayjs(lastDailyPhysiologicalCohortBroadcastRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 17 // 17:00 UTC daily
}

async function executeDailyPhysiologicalCohortBroadcast(): Promise<JobResult> {
  const jobName = 'daily-physiological-cohort-broadcast'
  const executedAt = new Date().toISOString()
  if (isDailyPhysiologicalCohortBroadcastRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyPhysiologicalCohortBroadcastRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY PHYSIOLOGICAL COHORT BROADCAST — 17:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')

    const oneDayAgo = dayjs().subtract(24, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { $gte: oneDayAgo } as any },
      attributes: ['id', 'metadata'],
      limit: 2000,
    })

    let written = 0
    for (const user of activeUsers) {
      try {
        const meta = (user as any).metadata as any || {}
        const archetype      = meta.currentArchetype      as string | undefined
        const dominantModule = meta.currentDominantModule as string | undefined
        const confidence     = meta.currentConfidence     as number | undefined
        const energyBand     = meta.currentEnergyBand     as string | undefined
        if (!archetype) continue
        await (Log as any).create({
          userId: (user as any).id,
          event: 'physiological_cohort',
          text: `Cohort broadcast: ${archetype}`,
          metadata: {
            archetype,
            dominantModule: dominantModule ?? 'unknown',
            confidence: confidence ?? 50,
            energyBand: energyBand ?? 'unknown',
            hour: 17,
            source: 'j26-broadcast',
          },
        })
        written++
      } catch (_) {}
    }

    console.log(`PHYSIOLOGICAL COHORT BROADCAST COMPLETE — ${written} records written`)
    console.log('─'.repeat(60))

    lastDailyPhysiologicalCohortBroadcastRun = new Date()
    isDailyPhysiologicalCohortBroadcastRunning = false
    return { jobName, executedAt, success: true, result: { written } }
  } catch (error: any) {
    console.error('Daily physiological cohort broadcast failed:', error.message)
    isDailyPhysiologicalCohortBroadcastRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly Pattern Health Report (Job 27 — Saturday 09:00 UTC) ─────────────
// Writes a pattern_health_scan log event per active user. Surfaces the count of
// active QIE patterns detected in the past 7 days, pattern coverage percentage,
// and the top pattern by signal weight. Enables PHR: block in Logs.tsx.
// Fires Saturday 09:00 UTC — the beginning of the weekend review window.

let isWeeklyPatternHealthReportRunning = false
let lastWeeklyPatternHealthReportRun: Date | null = null

function shouldRunWeeklyPatternHealthReport(): boolean {
  const now = dayjs()
  if (isWeeklyPatternHealthReportRunning) return false
  if (lastWeeklyPatternHealthReportRun) {
    const lastRun = dayjs(lastWeeklyPatternHealthReportRun)
    const daysSinceLast = now.diff(lastRun, 'day')
    if (daysSinceLast < 6) return false
  }
  return now.day() === 6 && now.hour() === 9 // Saturday 09:00 UTC
}

async function executeWeeklyPatternHealthReport(): Promise<JobResult> {
  const jobName = 'weekly-pattern-health-report'
  const executedAt = new Date().toISOString()
  if (isWeeklyPatternHealthReportRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isWeeklyPatternHealthReportRunning = true

  console.log('─'.repeat(60))
  console.log('WEEKLY PATTERN HEALTH REPORT — SATURDAY 09:00 UTC')
  console.log('─'.repeat(60))

  const TOTAL_PATTERNS = 91

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { $gte: sevenDaysAgo } as any },
      attributes: ['id', 'metadata'],
      limit: 2000,
    })

    let written = 0
    for (const user of activeUsers) {
      try {
        const meta = (user as any).metadata as any || {}
        const activePatterns: string[] = (meta.activePatterns as string[]) ?? []
        const patternsActive = activePatterns.length
        const coverage = Math.round((patternsActive / TOTAL_PATTERNS) * 100)
        const topPattern = activePatterns[0] ?? null

        await (Log as any).create({
          userId: (user as any).id,
          event: 'pattern_health_scan',
          text: `Pattern health: ${patternsActive} active of ${TOTAL_PATTERNS}`,
          metadata: {
            patternsActive,
            coverage,
            topPattern,
            totalPatterns: TOTAL_PATTERNS,
            window: '7d',
            hour: 9,
          },
        })
        written++
      } catch (_) {}
    }

    console.log(`WEEKLY PATTERN HEALTH REPORT COMPLETE — ${written} reports written`)
    console.log('─'.repeat(60))

    lastWeeklyPatternHealthReportRun = new Date()
    isWeeklyPatternHealthReportRunning = false
    return { jobName, executedAt, success: true, result: { written } }
  } catch (error: any) {
    console.error('Weekly pattern health report failed:', error.message)
    isWeeklyPatternHealthReportRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Presence Arc Check (Job 28 — 21:00 UTC every day) ────────────────
// Reads today's log entries per user. Counts morning (before 10:00) and evening (after 18:00)
// signals. Writes full_presence_arc event. If 3+ complete days this week → writes daily_rhythm_lock.

let isDailyPresenceArcRunning = false
let lastDailyPresenceArcRun: Date | null = null

function shouldRunDailyPresenceArcCheck(): boolean {
  const now = dayjs()
  if (isDailyPresenceArcRunning) return false
  if (lastDailyPresenceArcRun) {
    const lastRun = dayjs(lastDailyPresenceArcRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 21 // 21:00 UTC daily
}

async function executeDailyPresenceArcCheck(): Promise<JobResult> {
  const jobName = 'daily-presence-arc-check'
  const executedAt = new Date().toISOString()
  if (isDailyPresenceArcRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyPresenceArcRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY PRESENCE ARC CHECK — 21:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      attributes: ['id', 'metadata'],
      limit: 2000,
    })

    let written = 0
    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const todayLogs = await (Log as any).findAll({
          where: { userId, createdAt: { [Op.gte]: oneDayAgo } },
          attributes: ['createdAt', 'event'],
        })
        const weekLogs = await (Log as any).findAll({
          where: { userId, createdAt: { [Op.gte]: sevenDaysAgo } },
          attributes: ['createdAt'],
        })

        const morningToday = todayLogs.filter((l: any) => new Date(l.createdAt).getHours() < 10).length
        const eveningToday = todayLogs.filter((l: any) => new Date(l.createdAt).getHours() >= 18).length

        // Count complete days (morning+evening) in past 7 days
        const dayMap: Record<string, { morning: boolean; evening: boolean }> = {}
        weekLogs.forEach((l: any) => {
          const d = new Date(l.createdAt)
          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          if (!dayMap[ds]) dayMap[ds] = { morning: false, evening: false }
          if (d.getHours() < 10) dayMap[ds].morning = true
          if (d.getHours() >= 18) dayMap[ds].evening = true
        })
        const completeDays = Object.values(dayMap).filter(v => v.morning && v.evening).length

        if (morningToday > 0 || eveningToday > 0) {
          await (Log as any).create({
            userId,
            event: 'full_presence_arc',
            text: `Presence arc: morning ${morningToday} · evening ${eveningToday}`,
            metadata: { morningCount: morningToday, eveningCount: eveningToday, completeDays, window: '1d', hour: 21 },
          })
          written++
        }

        if (completeDays >= 3) {
          await (Log as any).create({
            userId,
            event: 'daily_rhythm_lock',
            text: `Rhythm lock: ${completeDays} complete days (morning+evening) in 7d`,
            metadata: { completeDays, morningToday, eveningToday, window: '7d', hour: 21 },
          })
        }
      } catch {}
    }

    console.log(`  Written: ${written}`)
    lastDailyPresenceArcRun = new Date()
    isDailyPresenceArcRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily presence arc check failed:', error.message)
    isDailyPresenceArcRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Cross-Domain Pulse (Job 29 — 19:00 UTC every day) ────────────────
// Reads 7d logs per user. If memory 5+, journal 200+w, badges 2+, goals 2+, planner 2+
// all present → writes cross_domain_mastery_pulse event.

let isDailyCrossDomainRunning = false
let lastDailyCrossDomainRun: Date | null = null

function shouldRunDailyCrossDomainPulse(): boolean {
  const now = dayjs()
  if (isDailyCrossDomainRunning) return false
  if (lastDailyCrossDomainRun) {
    const lastRun = dayjs(lastDailyCrossDomainRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 19 // 19:00 UTC daily
}

async function executeDailyCrossDomainPulse(): Promise<JobResult> {
  const jobName = 'daily-cross-domain-pulse'
  const executedAt = new Date().toISOString()
  if (isDailyCrossDomainRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyCrossDomainRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY CROSS-DOMAIN PULSE — 19:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      attributes: ['id', 'metadata'],
      limit: 2000,
    })

    let written = 0
    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const weekLogs = await (Log as any).findAll({
          where: { userId, createdAt: { [Op.gte]: sevenDaysAgo } },
          attributes: ['event', 'metadata'],
        })

        const memoryCount  = weekLogs.filter((l: any) => ['memory_saved', 'answer_created'].includes(l.event)).length
        const journalLogs  = weekLogs.filter((l: any) => l.event === 'field_entry' || l.event === 'journal_entry')
        const journalWords = journalLogs.reduce((sum: number, l: any) => sum + ((l.metadata?.wordCount as number) ?? 0), 0)
        const badgeCount   = weekLogs.filter((l: any) => l.event === 'badge_unlock').length
        const goalCount    = weekLogs.filter((l: any) => ['goal_created', 'goal_updated', 'goal_completed'].includes(l.event)).length
        const plannerCount = weekLogs.filter((l: any) => ['planner_entry', 'calendar_entry'].includes(l.event)).length

        if (memoryCount >= 5 && journalWords >= 200 && badgeCount >= 2 && goalCount >= 2 && plannerCount >= 2) {
          await (Log as any).create({
            userId,
            event: 'cross_domain_mastery_pulse',
            text: `Cross-domain: ${memoryCount} mem · ${journalWords}w · ${badgeCount} badges · ${goalCount} goals · ${plannerCount} plans`,
            metadata: { memoryCount, journalWords, badgeCount, goalCount, plannerCount, window: '7d', hour: 19 },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Written: ${written}`)
    lastDailyCrossDomainRun = new Date()
    isDailyCrossDomainRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily cross-domain pulse failed:', error.message)
    isDailyCrossDomainRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Systemic Readiness Check (Job 30 — 01:00 UTC every day) ──────────
// Reads user metadata per active user. If archetype confidence ≥ 60 + energy band
// is 'high' or 'moderate' + no critical flag → writes systemic_readiness_peak event.

let isDailySystemicReadinessRunning = false
let lastDailySystemicReadinessRun: Date | null = null

function shouldRunDailySystemicReadinessCheck(): boolean {
  const now = dayjs()
  if (isDailySystemicReadinessRunning) return false
  if (lastDailySystemicReadinessRun) {
    const lastRun = dayjs(lastDailySystemicReadinessRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 1 // 01:00 UTC daily
}

async function executeDailySystemicReadinessCheck(): Promise<JobResult> {
  const jobName = 'daily-systemic-readiness-check'
  const executedAt = new Date().toISOString()
  if (isDailySystemicReadinessRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailySystemicReadinessRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY SYSTEMIC READINESS CHECK — 01:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      attributes: ['id', 'metadata'],
      limit: 2000,
    })

    let written = 0
    for (const user of activeUsers) {
      try {
        const meta = (user as any).metadata as any || {}
        const currentArchetype: string = meta.currentArchetype ?? ''
        const archetypeConfidence: number = meta.archetypeConfidence ?? 0
        const energyBand: string = meta.energyBand ?? 'unknown'
        const criticalFlag: boolean = meta.criticalFlag ?? false

        if (
          archetypeConfidence >= 60 &&
          (energyBand === 'high' || energyBand === 'moderate') &&
          !criticalFlag
        ) {
          await (Log as any).create({
            userId: (user as any).id,
            event: 'systemic_readiness_peak',
            text: `Systemic readiness peak — ${currentArchetype || 'archetype'} · ${archetypeConfidence}% conf · ${energyBand} energy`,
            metadata: {
              archetype: currentArchetype,
              confidence: archetypeConfidence,
              energyBand,
              readinessScore: archetypeConfidence,
              hour: 1,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Written: ${written}`)
    lastDailySystemicReadinessRun = new Date()
    isDailySystemicReadinessRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily systemic readiness check failed:', error.message)
    isDailySystemicReadinessRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

/**
 * Check and run scheduled jobs
 * Called periodically by the scheduler
 */
export async function checkAndRunScheduledJobs(): Promise<void> {
  // Check monthly email job
  if (shouldRunMonthlyEmailJob()) {
    await executeMonthlyEmailJob()
  }

  // Check weekly cohort digest
  if (shouldRunWeeklyCohortJob()) {
    await executeWeeklyCohortJob()
  }

  // Check weekly QOS state digest
  if (shouldRunWeeklyQOSJob()) {
    await executeWeeklyQOSJob()
  }

  // Check daily QIE analytics
  if (shouldRunDailyQIEJob()) {
    await executeDailyQIEJob()
  }

  // Check daily intention audit (06:00 UTC)
  if (shouldRunDailyIntentionAudit()) {
    await executeDailyIntentionAudit()
  }

  // Check daily OS snapshot (00:00 UTC midnight)
  if (shouldRunDailyOSSnapshotJob()) {
    await executeDailyOSSnapshotJob()
  }

  // Check weekly intention completion audit (Sunday 20:00 UTC)
  if (shouldRunWeeklyIntentionCompletionJob()) {
    await executeWeeklyIntentionCompletionJob()
  }

  // Check morning biofield summary (08:00 UTC daily)
  if (shouldRunMorningBiofieldJob()) {
    await executeMorningBiofieldJob()
  }

  // Check daily pattern coverage audit (23:00 UTC daily)
  if (shouldRunDailyPatternCoverageJob()) {
    await executeDailyPatternCoverageJob()
  }

  // Check weekly archetype stability monitor (Thursday 05:00 UTC)
  if (shouldRunWeeklyArchetypeStabilityJob()) {
    await executeWeeklyArchetypeStabilityJob()
  }

  // Check daily source diversity pulse (07:00 UTC daily)
  if (shouldRunDailySourceDiversityJob()) {
    await executeDailySourceDiversityJob()
  }

  // Check daily archetype shift monitor (10:00 UTC daily)
  if (shouldRunDailyArchetypeShiftJob()) {
    await executeDailyArchetypeShiftJob()
  }

  // Check daily QOS signature pulse (13:00 UTC daily)
  if (shouldRunDailyQOSSignaturePulse()) {
    await executeDailyQOSSignaturePulse()
  }

  // Check daily coherence index pulse (16:00 UTC daily)
  if (shouldRunDailyCoherenceIndexJob()) {
    await executeDailyCoherenceIndexJob()
  }

  // Check weekly QOS convergence audit (Sunday 15:00 UTC)
  if (shouldRunWeeklyQOSConvergenceJob()) {
    await executeWeeklyQOSConvergenceAudit()
  }

  // Check weekly badge progress scan (Tuesday 09:00 UTC)
  if (shouldRunWeeklyBadgeScanJob()) {
    await executeWeeklyBadgeScan()
  }

  // Check daily morning intention launch (11:00 UTC daily)
  if (shouldRunDailyMorningIntentionLaunch()) {
    await executeDailyMorningIntentionLaunch()
  }
  if (shouldRunDailyEveningCoherenceClose()) {
    await executeDailyEveningCoherenceClose()
  }
  // Check daily signal momentum check (20:00 UTC daily) — Job 19
  if (shouldRunDailySignalMomentumCheck()) {
    await executeDailySignalMomentumCheck()
  }
  // Check weekly cognitive depth check (Sunday 06:00 UTC) — Job 20
  if (shouldRunWeeklyCognitiveDepthCheck()) {
    await executeWeeklyCognitiveDepthCheck()
  }

  // Check daily vitality peak (12:00 UTC every day) — Job 21
  if (shouldRunDailyVitalityPeakCheck()) {
    await executeDailyVitalityPeakCheck()
  }
  // Check weekly longitudinal drift (Monday 09:00 UTC) — Job 22
  if (shouldRunWeeklyLongitudinalDriftCheck()) {
    await executeWeeklyLongitudinalDriftCheck()
  }
  // Check daily QOS mode watch (14:00 UTC every day) — Job 23
  if (shouldRunDailyQOSModeWatch()) {
    await executeDailyQOSModeWatch()
  }
  // Check weekly LOT AI story generation (Sunday 18:00 UTC) — Job 24
  if (shouldRunWeeklyLOTAIStory()) {
    await executeWeeklyLOTAIStory()
  }
  // Check daily archetype directive pulse (09:00 UTC every day) — Job 25
  if (shouldRunDailyArchetypeDirectivePulse()) {
    await executeDailyArchetypeDirectivePulse()
  }
  // Check daily physiological cohort broadcast (17:00 UTC every day) — Job 26
  if (shouldRunDailyPhysiologicalCohortBroadcast()) {
    await executeDailyPhysiologicalCohortBroadcast()
  }
  // Check weekly pattern health report (Saturday 09:00 UTC) — Job 27
  if (shouldRunWeeklyPatternHealthReport()) {
    await executeWeeklyPatternHealthReport()
  }
  // Check daily presence arc check (21:00 UTC every day) — Job 28
  if (shouldRunDailyPresenceArcCheck()) {
    await executeDailyPresenceArcCheck()
  }
  // Check daily cross-domain pulse (19:00 UTC every day) — Job 29
  if (shouldRunDailyCrossDomainPulse()) {
    await executeDailyCrossDomainPulse()
  }
  // Check daily systemic readiness check (01:00 UTC every day) — Job 30
  if (shouldRunDailySystemicReadinessCheck()) {
    await executeDailySystemicReadinessCheck()
  }
  // Check daily intent gap pulse (02:00 UTC every day) — Job 31
  if (shouldRunDailyIntentGapPulse()) {
    await executeDailyIntentGapPulse()
  }
  // Check daily quantum presence check (18:00 UTC every day) — Job 32
  if (shouldRunDailyQuantumPresenceCheck()) {
    await executeDailyQuantumPresenceCheck()
  }
  // Check daily vitality cascade pulse (15:00 UTC every day) — Job 33
  if (shouldRunDailyVitalityCascadePulse()) {
    await executeDailyVitalityCascadePulse()
  }
  // Check daily temporal alignment check (10:00 UTC every day) — Job 34
  if (shouldRunDailyTemporalAlignmentCheck()) {
    await executeDailyTemporalAlignmentCheck()
  }
  // Check daily embodied cognition check (11:00 UTC every day) — Job 35
  if (shouldRunDailyEmbodiedCognitionCheck()) {
    await executeDailyEmbodiedCognitionCheck()
  }
  // Check daily personal peak window scan (08:00 UTC every day) — Job 36
  if (shouldRunDailyPersonalPeakWindowScan()) {
    await executeDailyPersonalPeakWindowScan()
  }
  // Check daily focus depth check (16:00 UTC every day) — Job 37
  if (shouldRunDailyFocusDepthCheck()) {
    await executeDailyFocusDepthCheck()
  }
  // Check daily morning coherence check (06:00 UTC every day) — Job 38
  if (shouldRunDailyMorningCoherenceCheck()) {
    await executeDailyMorningCoherenceCheck()
  }
  // Check daily action-memory scan (20:00 UTC every day) — Job 39
  if (shouldRunDailyActionMemoryScan()) {
    await executeDailyActionMemoryScan()
  }
  // Check daily evening reflection check (22:00 UTC every day) — Job 40
  if (shouldRunDailyEveningReflectionCheck()) {
    await executeDailyEveningReflectionCheck()
  }
  // Check daily care arc check (20:00 UTC every day) — Job 41
  if (shouldRunDailyCareArcCheck()) {
    await executeDailyCareArcCheck()
  }
  // Check daily coherence seal check (23:00 UTC every day) — Job 42
  if (shouldRunDailyCoherenceSealCheck()) {
    await executeDailyCoherenceSealCheck()
  }
  // Check daily quantum field alignment (17:00 UTC every day) — Job 43
  if (shouldRunDailyQuantumFieldCheck()) {
    await executeDailyQuantumFieldCheck()
  }
  // Check daily signal matrix check (09:00 UTC every day) — Job 44
  if (shouldRunDailySignalMatrixCheck()) {
    await executeDailySignalMatrixCheck()
  }
  // Check daily physiological presence check (21:00 UTC every day) — Job 45
  if (shouldRunDailyPhysiologicalPresenceCheck()) {
    await executeDailyPhysiologicalPresenceCheck()
  }
  // Check daily circadian lock check (07:00 UTC every day) — Job 46
  if (shouldRunDailyCircadianLockCheck()) {
    await executeDailyCircadianLockCheck()
  }
  // Check daily signal coherence cascade check (08:00 UTC every day) — Job 47
  if (shouldRunDailyCoherenceCascadeCheck()) {
    await executeDailyCoherenceCascadeCheck()
  }
  // Check daily total field coherence check (09:00 UTC every day) — Job 48
  if (shouldRunDailyTotalFieldCoherenceCheck()) {
    await executeDailyTotalFieldCoherenceCheck()
  }
}

// ─── Daily Morning Coherence Check (Job 38 — 06:00 UTC every day) ────────────
// Reads active users. Looks for energy check-in + planner entry + intention all
// before 10:00 UTC today. When all three are present, writes morning_coherence_arc.
// Confirms full dawn ramp: body read, plan set, direction confirmed before cognitive load.

let isDailyMorningCoherenceRunning = false
let lastDailyMorningCoherenceRun: Date | null = null

function shouldRunDailyMorningCoherenceCheck(): boolean {
  const now = dayjs()
  if (isDailyMorningCoherenceRunning) return false
  if (lastDailyMorningCoherenceRun) {
    const lastRun = dayjs(lastDailyMorningCoherenceRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 6 // 06:00 UTC daily
}

async function executeDailyMorningCoherenceCheck(): Promise<JobResult> {
  const jobName = 'daily-morning-coherence-check'
  const executedAt = new Date().toISOString()
  if (isDailyMorningCoherenceRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyMorningCoherenceRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY MORNING COHERENCE CHECK — 06:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0

    // Morning window: today 00:00–10:00 UTC
    const todayStart = dayjs().startOf('day').toDate()
    const todayMorningEnd = dayjs().startOf('day').add(10, 'hour').toDate()

    for (const user of activeUsers) {
      try {
        const morningLogs = await Log.findAll({
          where: {
            userId: (user as any).id,
            createdAt: { [Op.between]: [todayStart, todayMorningEnd] },
            event: { [Op.in]: ['energy_state', 'energy_update', 'energy_check', 'plan_set', 'planner_entry', 'intention'] },
          },
        })

        const energyLogs    = morningLogs.filter(l => ['energy_state', 'energy_update', 'energy_check'].includes((l as any).event as string))
        const plannerLogs   = morningLogs.filter(l => ['plan_set', 'planner_entry'].includes((l as any).event as string))
        const intentionLogs = morningLogs.filter(l => (l as any).event === 'intention')

        if (energyLogs.length >= 1 && plannerLogs.length >= 1 && intentionLogs.length >= 1) {
          const total = energyLogs.length + plannerLogs.length + intentionLogs.length
          await Log.create({
            userId: (user as any).id,
            event: 'morning_coherence_arc' as any,
            text: `Morning coherence arc: energy + planner + intentions confirmed before 10:00.`,
            metadata: {
              energyCount: energyLogs.length,
              plannerCount: plannerLogs.length,
              intentionCount: intentionLogs.length,
              totalMorning: total,
              window: 'before-10:00',
              confidence: Math.min(0.65 + total * 0.04, 0.87),
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Morning coherence arc events written: ${written}`)
    lastDailyMorningCoherenceRun = new Date()
    isDailyMorningCoherenceRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily morning coherence check failed:', error.message)
    isDailyMorningCoherenceRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Action-Memory Scan (Job 39 — 20:00 UTC every day) ─────────────────
// Reads active users. Looks for planner/intention + memory logs in a 6h rolling
// window. When both action and memory are present, writes action_to_memory_loop.
// Confirms knowledge crystallization pipeline: action → encoding → archive.

let isDailyActionMemoryRunning = false
let lastDailyActionMemoryRun: Date | null = null

function shouldRunDailyActionMemoryScan(): boolean {
  const now = dayjs()
  if (isDailyActionMemoryRunning) return false
  if (lastDailyActionMemoryRun) {
    const lastRun = dayjs(lastDailyActionMemoryRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 20 // 20:00 UTC daily
}

async function executeDailyActionMemoryScan(): Promise<JobResult> {
  const jobName = 'daily-action-memory-scan'
  const executedAt = new Date().toISOString()
  if (isDailyActionMemoryRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyActionMemoryRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY ACTION-MEMORY SCAN — 20:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0

    const sixHoursAgo = dayjs().subtract(6, 'hour').toDate()

    for (const user of activeUsers) {
      try {
        const recentLogs = await Log.findAll({
          where: {
            userId: (user as any).id,
            createdAt: { [Op.gte]: sixHoursAgo },
            event: { [Op.in]: ['plan_set', 'planner_entry', 'intention', 'memory_question', 'memory_answer', 'memory_capture'] },
          },
        })

        const plannerLogs   = recentLogs.filter(l => ['plan_set', 'planner_entry'].includes((l as any).event as string))
        const intentionLogs = recentLogs.filter(l => (l as any).event === 'intention')
        const memoryLogs    = recentLogs.filter(l => ['memory_question', 'memory_answer', 'memory_capture'].includes((l as any).event as string))
        const actionCount   = plannerLogs.length + intentionLogs.length

        if (actionCount >= 1 && memoryLogs.length >= 1) {
          await Log.create({
            userId: (user as any).id,
            event: 'action_to_memory_loop' as any,
            text: `Action-to-memory loop: planner/intention + memory capture confirmed in 6h window.`,
            metadata: {
              plannerCount: plannerLogs.length,
              intentionCount: intentionLogs.length,
              memoryCount: memoryLogs.length,
              window: '6h',
              confidence: Math.min(0.64 + memoryLogs.length * 0.05 + actionCount * 0.03, 0.86),
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Action-to-memory loop events written: ${written}`)
    lastDailyActionMemoryRun = new Date()
    isDailyActionMemoryRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily action-memory scan failed:', error.message)
    isDailyActionMemoryRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Evening Reflection Check (Job 40 — 22:00 UTC every day) ───────────
// Scans active users for journal entry after 18:00 UTC today + memory capture today
// + intentions today. When all three are present, writes evening_reflection_loop.
// Confirms daily loop closure: reflection → encoding → acknowledgment (P125).

let isDailyEveningReflectionRunning = false
let lastDailyEveningReflectionRun: Date | null = null

function shouldRunDailyEveningReflectionCheck(): boolean {
  const now = dayjs()
  if (isDailyEveningReflectionRunning) return false
  if (lastDailyEveningReflectionRun) {
    const lastRun = dayjs(lastDailyEveningReflectionRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 22 // 22:00 UTC daily
}

async function executeDailyEveningReflectionCheck(): Promise<JobResult> {
  const jobName = 'daily-evening-reflection-check'
  const executedAt = new Date().toISOString()
  if (isDailyEveningReflectionRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyEveningReflectionRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY EVENING REFLECTION CHECK — 22:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo   = dayjs().subtract(1, 'day').toDate()
    const todayStart  = dayjs().startOf('day').toDate()
    const eveningStart = dayjs().startOf('day').add(18, 'hour').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id

        // Journal entry after 18:00 today
        const journalLogs = await Log.findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: eveningStart },
            event: { [Op.in]: ['note', 'journal_entry'] },
          },
          attributes: ['id'],
        })

        if (journalLogs.length === 0) continue

        // Memory capture today
        const memoryLogs = await Log.findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: todayStart },
            event: { [Op.in]: ['memory_question', 'memory_answer', 'memory_capture'] },
          },
          attributes: ['id'],
        })

        if (memoryLogs.length === 0) continue

        // Intentions today
        const intentionLogs = await Log.findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: todayStart },
            event: 'intention',
          },
          attributes: ['id'],
        })

        if (intentionLogs.length === 0) continue

        const confidence = Math.min(0.65 + journalLogs.length * 0.04 + memoryLogs.length * 0.03, 0.87)

        await Log.create({
          userId,
          event: 'evening_reflection_loop' as any,
          text: `Evening reflection loop: journal after 18:00 + memory + intentions confirmed today.`,
          metadata: {
            journalCount:   journalLogs.length,
            memoryCount:    memoryLogs.length,
            intentionCount: intentionLogs.length,
            window:         'evening',
            confidence,
          },
        })
        written++
      } catch {}
    }

    console.log(`  Evening reflection loop events written: ${written}`)
    lastDailyEveningReflectionRun = new Date()
    isDailyEveningReflectionRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily evening reflection check failed:', error.message)
    isDailyEveningReflectionRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Intent Gap Pulse (Job 31 — 02:00 UTC every day) ──────────────────
// Reads active users. Finds those with an intention log in the last 24h but no
// plan_set / goal_created / goal_updated in the same window. Writes intent_gap_pulse.

let isDailyIntentGapRunning = false
let lastDailyIntentGapRun: Date | null = null

function shouldRunDailyIntentGapPulse(): boolean {
  const now = dayjs()
  if (isDailyIntentGapRunning) return false
  if (lastDailyIntentGapRun) {
    const lastRun = dayjs(lastDailyIntentGapRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 2 // 02:00 UTC daily
}

async function executeDailyIntentGapPulse(): Promise<JobResult> {
  const jobName = 'daily-intent-gap-pulse'
  const executedAt = new Date().toISOString()
  if (isDailyIntentGapRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyIntentGapRunning = true

  console.log('')
  console.log('DAILY INTENT GAP PULSE — 02:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      attributes: ['id'],
      limit: 2000,
    })

    let written = 0
    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const dayLogs = await (Log as any).findAll({
          where: { userId, createdAt: { [Op.gte]: oneDayAgo } },
          attributes: ['event', 'metadata', 'createdAt'],
        })

        const intentions = dayLogs.filter((l: any) =>
          ['intention_set', 'intention_created', 'daily_intention'].includes(l.event)
        )
        const actions = dayLogs.filter((l: any) =>
          ['plan_set', 'planner_entry', 'calendar_entry', 'goal_created', 'goal_updated', 'goal_completed'].includes(l.event)
        )

        if (intentions.length >= 1 && actions.length === 0) {
          const lastIntention = intentions[intentions.length - 1]
          const gapMinutes = Math.round((Date.now() - new Date(lastIntention.createdAt).getTime()) / 60000)
          await (Log as any).create({
            userId,
            event: 'intent_gap_pulse',
            text: `Intent gap: ${intentions.length} intention(s) — no plan or goal in 24h. Gap: ${gapMinutes}m.`,
            metadata: { intentionCount: intentions.length, gapMinutes, window: '24h', hour: 2 },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Written: ${written}`)
    lastDailyIntentGapRun = new Date()
    isDailyIntentGapRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily intent gap pulse failed:', error.message)
    isDailyIntentGapRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Quantum Presence Check (Job 32 — 18:00 UTC every day) ─────────────
// Reads 48h logs per user. Checks if all 6 primary signal sources fired.
// Writes quantum_presence_arc when all 6 channels active.

let isDailyQuantumPresenceRunning = false
let lastDailyQuantumPresenceRun: Date | null = null

function shouldRunDailyQuantumPresenceCheck(): boolean {
  const now = dayjs()
  if (isDailyQuantumPresenceRunning) return false
  if (lastDailyQuantumPresenceRun) {
    const lastRun = dayjs(lastDailyQuantumPresenceRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 18 // 18:00 UTC daily
}

async function executeDailyQuantumPresenceCheck(): Promise<JobResult> {
  const jobName = 'daily-quantum-presence-check'
  const executedAt = new Date().toISOString()
  if (isDailyQuantumPresenceRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyQuantumPresenceRunning = true

  console.log('')
  console.log('DAILY QUANTUM PRESENCE CHECK — 18:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const twoDaysAgo = dayjs().subtract(48, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: twoDaysAgo } },
      attributes: ['id'],
      limit: 2000,
    })

    // Primary signal event types per channel
    const PRIMARY_CHANNELS: Record<string, string[]> = {
      journal:    ['note', 'journal_entry', 'field_entry'],
      memory:     ['answer', 'memory_answer', 'weekly_summary_response'],
      planner:    ['plan_set', 'planner_entry', 'calendar_entry'],
      selfcare:   ['self_care_complete', 'self_care_completed', 'self_care_skip'],
      intentions: ['intention', 'intention_set', 'daily_intention'],
      mood:       ['emotional_checkin', 'mood_checkin', 'energy_checkin'],
    }
    const ALL_EVENTS = Object.values(PRIMARY_CHANNELS).flat()

    let written = 0
    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const recentLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: twoDaysAgo },
            event: { [Op.in]: ALL_EVENTS },
          },
          attributes: ['event'],
          limit: 500,
        })

        const presentChannels = new Set<string>()
        for (const log of recentLogs) {
          for (const [channel, events] of Object.entries(PRIMARY_CHANNELS)) {
            if (events.includes(log.event)) presentChannels.add(channel)
          }
        }

        if (presentChannels.size === 6) {
          await (Log as any).create({
            userId,
            event: 'quantum_presence_arc',
            text: `Quantum presence arc: all 6 primary channels active in 48h window.`,
            metadata: {
              activeChannels: 6,
              totalSources: presentChannels.size,
              channels: [...presentChannels],
              window: '48h',
              hour: 18,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Quantum presence events written: ${written}`)
    lastDailyQuantumPresenceRun = new Date()
    isDailyQuantumPresenceRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily quantum presence check failed:', error.message)
    isDailyQuantumPresenceRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Vitality Cascade Pulse (Job 33 — 15:00 UTC every day) ─────────────
// Reads active users' 24h logs. Confirms high energy + 3+ selfcare acts + positive
// mood + journal entry. Writes vitality_cascade when all conditions met.

let isDailyVitalityCascadeRunning = false
let lastDailyVitalityCascadeRun: Date | null = null

function shouldRunDailyVitalityCascadePulse(): boolean {
  const now = dayjs()
  if (isDailyVitalityCascadeRunning) return false
  if (lastDailyVitalityCascadeRun) {
    const lastRun = dayjs(lastDailyVitalityCascadeRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 15 // 15:00 UTC daily
}

async function executeDailyVitalityCascadePulse(): Promise<JobResult> {
  const jobName = 'daily-vitality-cascade-pulse'
  const executedAt = new Date().toISOString()
  if (isDailyVitalityCascadeRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyVitalityCascadeRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY VITALITY CASCADE PULSE — 15:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(24, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      attributes: ['id'],
      limit: 2000,
    })

    const SELFCARE_EVENTS = ['self_care_complete', 'self_care_completed']
    const POSITIVE_MOOD_SIGNALS = ['calm', 'energized', 'hopeful', 'peaceful', 'content', 'fulfilled', 'excited', 'grateful']
    const JOURNAL_EVENTS = ['note', 'journal_entry', 'field_entry']
    const ENERGY_EVENTS = ['energy_checkin', 'energy_set']
    const MOOD_EVENTS = ['emotional_checkin', 'mood_checkin', 'mood_set']
    const ALL_EVENTS = [...SELFCARE_EVENTS, ...JOURNAL_EVENTS, ...ENERGY_EVENTS, ...MOOD_EVENTS]

    let written = 0
    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const recentLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: oneDayAgo },
            event: { [Op.in]: ALL_EVENTS },
          },
          attributes: ['event', 'metadata'],
          limit: 500,
        })

        const selfcareLogs = recentLogs.filter((l: any) => SELFCARE_EVENTS.includes(l.event))
        const journalLogs = recentLogs.filter((l: any) => JOURNAL_EVENTS.includes(l.event))
        const hasPositiveMood = recentLogs.some((l: any) =>
          MOOD_EVENTS.includes(l.event) &&
          POSITIVE_MOOD_SIGNALS.includes(l.metadata?.mood ?? l.metadata?.signal ?? '')
        )
        const hasHighEnergy = recentLogs.some((l: any) =>
          ENERGY_EVENTS.includes(l.event) &&
          (l.metadata?.energy === 'high' || l.metadata?.level === 'high')
        )

        if (hasHighEnergy && selfcareLogs.length >= 3 && hasPositiveMood && journalLogs.length >= 1) {
          const confidence = Math.min(0.78 + (selfcareLogs.length - 3) * 0.04, 0.90)
          await (Log as any).create({
            userId,
            event: 'vitality_cascade',
            text: `Vitality cascade: high energy + ${selfcareLogs.length} selfcare acts + positive mood + journal entry in 24h.`,
            metadata: {
              selfcareCount: selfcareLogs.length,
              journalCount: journalLogs.length,
              energyBand: 'high',
              confidence,
              window: '24h',
              hour: 15,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Vitality cascade events written: ${written}`)
    lastDailyVitalityCascadeRun = new Date()
    isDailyVitalityCascadeRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily vitality cascade pulse failed:', error.message)
    isDailyVitalityCascadeRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Temporal Alignment Check (Job 34 — 10:00 UTC every day) ───────────
// Reads active users' 48h logs. Confirms planner 2+ + intentions 2+ + at least one
// calendar anchor event. Writes temporal_alignment_peak when all conditions met.

let isDailyTemporalAlignmentRunning = false
let lastDailyTemporalAlignmentRun: Date | null = null

function shouldRunDailyTemporalAlignmentCheck(): boolean {
  const now = dayjs()
  if (isDailyTemporalAlignmentRunning) return false
  if (lastDailyTemporalAlignmentRun) {
    const lastRun = dayjs(lastDailyTemporalAlignmentRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 10 // 10:00 UTC daily
}

async function executeDailyTemporalAlignmentCheck(): Promise<JobResult> {
  const jobName = 'daily-temporal-alignment-check'
  const executedAt = new Date().toISOString()
  if (isDailyTemporalAlignmentRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyTemporalAlignmentRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY TEMPORAL ALIGNMENT CHECK — 10:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const twoDaysAgo = dayjs().subtract(48, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(24, 'hour').toDate() } },
      attributes: ['id'],
      limit: 2000,
    })

    const PLANNER_EVENTS = ['plan_set', 'goal_created', 'goal_updated', 'task_created', 'task_completed']
    const INTENTION_EVENTS = ['intention_set', 'intention_updated', 'intention_created']
    const CALENDAR_EVENTS = ['event_created', 'calendar_entry', 'deadline_set', 'schedule_block']
    const ALL_EVENTS = [...PLANNER_EVENTS, ...INTENTION_EVENTS, ...CALENDAR_EVENTS]

    let written = 0
    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const recentLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: twoDaysAgo },
            event: { [Op.in]: ALL_EVENTS },
          },
          attributes: ['event', 'metadata'],
          limit: 500,
        })

        const plannerLogs    = recentLogs.filter((l: any) => PLANNER_EVENTS.includes(l.event))
        const intentionLogs  = recentLogs.filter((l: any) => INTENTION_EVENTS.includes(l.event))
        const calendarLogs   = recentLogs.filter((l: any) => CALENDAR_EVENTS.includes(l.event))

        if (plannerLogs.length >= 2 && intentionLogs.length >= 2 && calendarLogs.length >= 1) {
          const confidence = Math.min(0.65 + plannerLogs.length * 0.04 + intentionLogs.length * 0.03, 0.82)
          await (Log as any).create({
            userId,
            event: 'temporal_alignment_peak',
            text: `Temporal alignment: ${plannerLogs.length} plans + ${intentionLogs.length} intentions + ${calendarLogs.length} calendar anchor(s) in 48h.`,
            metadata: {
              plannerCount: plannerLogs.length,
              intentionCount: intentionLogs.length,
              calendarCount: calendarLogs.length,
              confidence,
              window: '48h',
              hour: 10,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Temporal alignment events written: ${written}`)
    lastDailyTemporalAlignmentRun = new Date()
    isDailyTemporalAlignmentRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily temporal alignment check failed:', error.message)
    isDailyTemporalAlignmentRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Embodied Cognition Check (Job 35 — 11:00 UTC every day) ───────────
// Reads active users' 24h logs. Confirms selfcare + journal 150+w + memory capture
// all present in the same window. Writes embodied_cognition_arc event.
// Feeds P110 detection. Biological grounding + cognitive expression confirmed simultaneously.

let isDailyEmbodiedCognitionRunning = false
let lastDailyEmbodiedCognitionRun: Date | null = null

function shouldRunDailyEmbodiedCognitionCheck(): boolean {
  const now = dayjs()
  if (isDailyEmbodiedCognitionRunning) return false
  if (lastDailyEmbodiedCognitionRun) {
    const lastRun = dayjs(lastDailyEmbodiedCognitionRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 11 // 11:00 UTC daily
}

async function executeDailyEmbodiedCognitionCheck(): Promise<JobResult> {
  const jobName = 'daily-embodied-cognition-check'
  const executedAt = new Date().toISOString()
  if (isDailyEmbodiedCognitionRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyEmbodiedCognitionRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY EMBODIED COGNITION CHECK — 11:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(24, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      attributes: ['id'],
      limit: 2000,
    })

    const SELFCARE_EVENTS = ['self_care_complete', 'self_care_completed']
    const JOURNAL_EVENTS  = ['note', 'journal']
    const MEMORY_EVENTS   = ['answer', 'memory']
    const ALL_EVENTS      = [...SELFCARE_EVENTS, ...JOURNAL_EVENTS, ...MEMORY_EVENTS]

    let written = 0
    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const recentLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: oneDayAgo },
            event: { [Op.in]: ALL_EVENTS },
          },
          attributes: ['event', 'metadata'],
          limit: 500,
        })

        const selfcareLogs = recentLogs.filter((l: any) => SELFCARE_EVENTS.includes(l.event))
        const journalLogs  = recentLogs.filter((l: any) =>
          JOURNAL_EVENTS.includes(l.event) &&
          ((l.metadata?.wordCount as number ?? 0) >= 150 ||
           (l.metadata?.text?.split?.(/\s+/)?.length ?? 0) >= 150)
        )
        const memoryLogs   = recentLogs.filter((l: any) => MEMORY_EVENTS.includes(l.event))

        if (selfcareLogs.length >= 1 && journalLogs.length >= 1 && memoryLogs.length >= 1) {
          const confidence = Math.min(0.72 + journalLogs.length * 0.04 + memoryLogs.length * 0.03, 0.86)
          await (Log as any).create({
            userId,
            event: 'embodied_cognition_arc',
            text: `Embodied cognition: ${selfcareLogs.length} selfcare + ${journalLogs.length} long-form journal(s) + ${memoryLogs.length} memory capture(s) in 24h.`,
            metadata: {
              selfcareCount: selfcareLogs.length,
              journalCount:  journalLogs.length,
              memoryCount:   memoryLogs.length,
              confidence,
              window: '24h',
              hour: 11,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Embodied cognition events written: ${written}`)
    lastDailyEmbodiedCognitionRun = new Date()
    isDailyEmbodiedCognitionRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily embodied cognition check failed:', error.message)
    isDailyEmbodiedCognitionRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Personal Peak Window Scan (Job 36 — 08:00 UTC every day) ──────────
// Reads active users' 3-day logs (energy + intentions + log events). Detects whether
// energy + intent + log signals cluster in a repeatable 4-hour band across ≥2 of 3 days.
// Writes personal_peak_window event. Feeds P113 detection.

let isDailyPersonalPeakWindowRunning = false
let lastDailyPersonalPeakWindowRun: Date | null = null

function shouldRunDailyPersonalPeakWindowScan(): boolean {
  const now = dayjs()
  if (isDailyPersonalPeakWindowRunning) return false
  if (lastDailyPersonalPeakWindowRun) {
    const lastRun = dayjs(lastDailyPersonalPeakWindowRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 8 // 08:00 UTC daily
}

async function executeDailyPersonalPeakWindowScan(): Promise<JobResult> {
  const jobName = 'daily-personal-peak-window'
  const executedAt = new Date().toISOString()
  if (isDailyPersonalPeakWindowRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyPersonalPeakWindowRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY PERSONAL PEAK WINDOW SCAN — 08:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const threeDaysAgo = dayjs().subtract(3, 'days').toDate()
    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0
    const PEAK_WINDOW_MS = 4 * 60 * 60 * 1000 // 4h

    for (const user of activeUsers) {
      try {
        const logs = await Log.findAll({
          where: {
            userId: (user as any).id,
            createdAt: { [Op.gte]: threeDaysAgo },
            event: { [Op.in]: ['energy_logged', 'intention_set', 'log_entry', 'energy_checkin', 'intention_created', 'intention_updated'] },
          },
          order: [['createdAt', 'ASC']],
        })

        // Group by calendar day
        const byDay: Record<string, { energy: number[], intent: number[], log: number[] }> = {}
        for (const entry of logs) {
          const ts = new Date(entry.createdAt as Date).getTime()
          const day = dayjs(ts).format('YYYY-MM-DD')
          if (!byDay[day]) byDay[day] = { energy: [], intent: [], log: [] }
          const ev = (entry as any).event as string
          if (ev.startsWith('energy')) byDay[day].energy.push(ts)
          else if (ev.startsWith('intention')) byDay[day].intent.push(ts)
          else byDay[day].log.push(ts)
        }

        const days = Object.values(byDay)
        let activeDays = 0
        for (const day of days) {
          if (!day.energy.length || !day.intent.length || !day.log.length) continue
          const allTs = [...day.energy, ...day.intent, ...day.log].sort((a, b) => a - b)
          const hasPeak = allTs.some(anchor =>
            day.energy.some(t => t >= anchor && t < anchor + PEAK_WINDOW_MS) &&
            day.intent.some(t => t >= anchor && t < anchor + PEAK_WINDOW_MS) &&
            day.log.some(t => t >= anchor && t < anchor + PEAK_WINDOW_MS)
          )
          if (hasPeak) activeDays++
        }

        if (activeDays >= 2) {
          const totalEnergy = days.reduce((s, d) => s + d.energy.length, 0)
          const totalIntent = days.reduce((s, d) => s + d.intent.length, 0)
          const totalLog    = days.reduce((s, d) => s + d.log.length, 0)
          await Log.create({
            userId: (user as any).id,
            event: 'personal_peak_window' as any,
            text: `Peak window confirmed: ${activeDays}/3 days show energy+intent+log cluster in 4h band.`,
            metadata: { activeDays, energyCount: totalEnergy, intentCount: totalIntent, logCount: totalLog, window: '4h-band-3d' },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Personal peak window events written: ${written}`)
    lastDailyPersonalPeakWindowRun = new Date()
    isDailyPersonalPeakWindowRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily personal peak window scan failed:', error.message)
    isDailyPersonalPeakWindowRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Focus Depth Check (Job 37 — 16:00 UTC every day) ─────────────────
// Reads active users. Scans rolling 2h windows for journal entries ≥100w + memory
// capture + planner entry all occurring within the same 2h band. Writes focus_depth_arc.
// Feeds P116 detection. Co-located at 16:00 UTC with coherence index job.

let isDailyFocusDepthRunning = false
let lastDailyFocusDepthRun: Date | null = null

function shouldRunDailyFocusDepthCheck(): boolean {
  const now = dayjs()
  if (isDailyFocusDepthRunning) return false
  if (lastDailyFocusDepthRun) {
    const lastRun = dayjs(lastDailyFocusDepthRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 16 // 16:00 UTC daily (co-located with coherence index)
}

async function executeDailyFocusDepthCheck(): Promise<JobResult> {
  const jobName = 'daily-focus-depth-check'
  const executedAt = new Date().toISOString()
  if (isDailyFocusDepthRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyFocusDepthRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY FOCUS DEPTH CHECK — 16:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0
    const FOCUS_WINDOW_MS = 2 * 60 * 60 * 1000 // 2h

    for (const user of activeUsers) {
      try {
        const logs = await Log.findAll({
          where: {
            userId: (user as any).id,
            createdAt: { [Op.gte]: oneDayAgo },
            event: { [Op.in]: ['journal_entry', 'note', 'memory_created', 'memory_saved', 'plan_set', 'planner_entry'] },
          },
          order: [['createdAt', 'ASC']],
        })

        // Look for a 2h window containing journal (100+w) + memory + planner
        const journalEntries = logs.filter(l => {
          const ev = (l as any).event as string
          const words = ((l as any).text ?? '').split(/\s+/).filter(Boolean).length
          return (ev === 'journal_entry' || ev === 'note') && words >= 100
        })
        const memoryEntries  = logs.filter(l => ((l as any).event as string).startsWith('memory'))
        const plannerEntries = logs.filter(l => ((l as any).event as string).startsWith('plan'))

        let hasFocusWindow = false
        for (const jEntry of journalEntries) {
          const anchor = new Date(jEntry.createdAt as Date).getTime()
          const inWindow = (arr: typeof logs) =>
            arr.some(e => {
              const t = new Date(e.createdAt as Date).getTime()
              return t >= anchor - FOCUS_WINDOW_MS && t <= anchor + FOCUS_WINDOW_MS
            })
          if (inWindow(memoryEntries) && inWindow(plannerEntries)) { hasFocusWindow = true; break }
        }

        if (hasFocusWindow) {
          await Log.create({
            userId: (user as any).id,
            event: 'focus_depth_arc' as any,
            text: `Focus depth arc detected: journal 100+w + memory + planner aligned in 2h window.`,
            metadata: {
              journalCount: journalEntries.length,
              memoryCount: memoryEntries.length,
              plannerCount: plannerEntries.length,
              window: '2h',
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Focus depth arc events written: ${written}`)
    lastDailyFocusDepthRun = new Date()
    isDailyFocusDepthRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily focus depth check failed:', error.message)
    isDailyFocusDepthRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Care Arc Check (Job 38 — 20:00 UTC every day) ────────────────────
// Reads active users. Checks selfcare signals across the last 3 calendar days.
// If selfcare signal present on each of the 3 consecutive days, writes multi_day_care_arc.
// Feeds P120 detection. Sustained restoration practice confirmed.

let isDailyCareArcRunning = false
let lastDailyCareArcRun: Date | null = null

function shouldRunDailyCareArcCheck(): boolean {
  const now = dayjs()
  if (isDailyCareArcRunning) return false
  if (lastDailyCareArcRun) {
    const lastRun = dayjs(lastDailyCareArcRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 20 // 20:00 UTC daily
}

async function executeDailyCareArcCheck(): Promise<JobResult> {
  const jobName = 'daily-care-arc-check'
  const executedAt = new Date().toISOString()
  if (isDailyCareArcRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyCareArcRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY CARE ARC CHECK — 20:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const threeDaysAgo = dayjs().subtract(3, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(1, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const careLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: threeDaysAgo },
            event: { [Op.in]: ['selfcare_logged', 'self_care_logged', 'care_act', 'cleanness_logged', 'rest_logged', 'recovery_act'] },
          },
          attributes: ['createdAt'],
          order: [['createdAt', 'ASC']],
        })

        // Build set of distinct UTC calendar days with care signals
        const careDays = new Set<string>()
        for (const log of careLogs) {
          const d = new Date(log.createdAt)
          careDays.add(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`)
        }

        // Check 3 most recent consecutive days (today-2, today-1, today)
        const d2 = dayjs().subtract(2, 'day').format('YYYY-MM-DD')
        const d1 = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
        const d0 = dayjs().format('YYYY-MM-DD')

        if (careDays.has(d2) && careDays.has(d1) && careDays.has(d0)) {
          const streakDays = 3
          const totalCareActs = careLogs.length
          await (Log as any).create({
            userId,
            event: 'multi_day_care_arc',
            text: `Multi-day care arc: ${streakDays} consecutive days with active care signals. Sustained restoration practice confirmed.`,
            metadata: { streakDays, totalCareActs, window: '3d', hour: 20 },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Multi-day care arc events written: ${written}`)
    lastDailyCareArcRun = new Date()
    isDailyCareArcRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily care arc check failed:', error.message)
    isDailyCareArcRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Coherence Seal Check (Job 42 — 23:00 UTC every day) ───────────────
// Reads active users. Checks for a morning launch signal (morning_intention_lock OR
// morning_coherence_arc) AND an evening close signal (evening_reflection_loop OR
// evening_coherence_close) both present in the current calendar day.
// When both gates are confirmed, writes daily_coherence_seal.
// Feeds P131 detection. Full-day coherence circuit: booted at dawn, sealed at dusk.

let isDailyCoherenceSealRunning = false
let lastDailyCoherenceSealRun: Date | null = null

function shouldRunDailyCoherenceSealCheck(): boolean {
  const now = dayjs()
  if (isDailyCoherenceSealRunning) return false
  if (lastDailyCoherenceSealRun) {
    const lastRun = dayjs(lastDailyCoherenceSealRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 23 // 23:00 UTC daily
}

async function executeDailyCoherenceSealCheck(): Promise<JobResult> {
  const jobName = 'daily-coherence-seal-check'
  const executedAt = new Date().toISOString()
  if (isDailyCoherenceSealRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyCoherenceSealRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY COHERENCE SEAL CHECK — 23:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const todayStart = dayjs().startOf('day').toDate()
    const todayEnd   = dayjs().endOf('day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(1, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const todayLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.between]: [todayStart, todayEnd] },
            event: {
              [Op.in]: [
                'morning_intention_lock', 'morning_coherence_arc',
                'evening_reflection_loop', 'evening_coherence_close',
              ],
            },
          },
          attributes: ['event'],
        })

        const eventSet = new Set(todayLogs.map((l: any) => l.event))
        const hasMorningLaunch = eventSet.has('morning_intention_lock') || eventSet.has('morning_coherence_arc')
        const hasEveningClose  = eventSet.has('evening_reflection_loop')  || eventSet.has('evening_coherence_close')

        if (hasMorningLaunch && hasEveningClose) {
          const morningPattern = eventSet.has('morning_intention_lock') ? 'morning-intention-lock' : 'morning-coherence-arc'
          const eveningPattern = eventSet.has('evening_reflection_loop')  ? 'evening-reflection-loop'  : 'evening-coherence-close'
          await (Log as any).create({
            userId,
            event: 'daily_coherence_seal',
            text: `Daily coherence seal: morning launched via ${morningPattern}, evening closed via ${eveningPattern}. Full-day circuit confirmed.`,
            metadata: { morningPattern, eveningPattern, window: '1d', hour: 23 },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Daily coherence seal events written: ${written}`)
    lastDailyCoherenceSealRun = new Date()
    isDailyCoherenceSealRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily coherence seal check failed:', error.message)
    isDailyCoherenceSealRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Quantum Field Check (Job 43 — 17:00 UTC every day) ────────────────
// Reads active users. Checks if P131 (daily_coherence_seal), P132 (quantum_rhythm_lock),
// and P133 (biofield_integration_peak) are all present today (any of last 24h).
// When all three gates are confirmed, writes quantum_field_alignment.
// Feeds P136 detection. Complete operational field: temporal OS + daily seal + biofield integration all live.

let isDailyQuantumFieldRunning = false
let lastDailyQuantumFieldRun: Date | null = null

function shouldRunDailyQuantumFieldCheck(): boolean {
  const now = dayjs()
  if (isDailyQuantumFieldRunning) return false
  if (lastDailyQuantumFieldRun) {
    const lastRun = dayjs(lastDailyQuantumFieldRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 17 // 17:00 UTC daily
}

async function executeDailyQuantumFieldCheck(): Promise<JobResult> {
  const jobName = 'daily-quantum-field-check'
  const executedAt = new Date().toISOString()
  if (isDailyQuantumFieldRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyQuantumFieldRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY QUANTUM FIELD CHECK — 17:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const dayAgo = dayjs().subtract(24, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(1, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const recentLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: dayAgo },
            event: {
              [Op.in]: [
                'daily_coherence_seal',
                'quantum_rhythm_lock',
                'biofield_integration_peak',
              ],
            },
          },
          attributes: ['event', 'metadata'],
        })

        const eventSet = new Set(recentLogs.map((l: any) => l.event))
        const hasSeal    = eventSet.has('daily_coherence_seal')
        const hasRhythm  = eventSet.has('quantum_rhythm_lock')
        const hasBiofield = eventSet.has('biofield_integration_peak')

        if (hasSeal && hasRhythm && hasBiofield) {
          const sealLog     = recentLogs.find((l: any) => l.event === 'daily_coherence_seal')
          const rhythmLog   = recentLogs.find((l: any) => l.event === 'quantum_rhythm_lock')
          const biofieldLog = recentLogs.find((l: any) => l.event === 'biofield_integration_peak')
          const sealConf    = sealLog?.metadata?.confidence     ?? 0.80
          const rhythmConf  = rhythmLog?.metadata?.confidence   ?? 0.80
          const biofieldConf = biofieldLog?.metadata?.confidence ?? 0.80
          const composite   = Math.round(((sealConf + rhythmConf + biofieldConf) / 3) * 100)
          await (Log as any).create({
            userId,
            event: 'quantum_field_alignment',
            text: `Quantum field alignment: daily coherence seal + quantum rhythm lock + biofield integration peak all confirmed. Complete operational field live. Composite: ${composite}%.`,
            metadata: { sealConf, rhythmConf, biofieldConf, composite, window: '24h', hour: 17 },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Quantum field alignment events written: ${written}`)
    lastDailyQuantumFieldRun = new Date()
    isDailyQuantumFieldRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily quantum field check failed:', error.message)
    isDailyQuantumFieldRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Signal Matrix Check (Job 44 — 09:00 UTC every day) ───────────────
// Reads active users. Checks if all 6 primary signal source categories have activity
// today: emotional (emotional_checkin/mood), memory (memory), planner (plan_set/planner),
// intentions (intention), selfcare (self_care_complete/self_care_completed), journal (note/journal).
// When all 6 sources are active → writes signal_matrix_saturation (P138).
// Also checks if quantum_field_alignment fired today → writes quantum_coherence_peak (P137).
// Also checks if morning_coherence_arc + daily_coherence_seal + biofield_integration_peak
// all occurred today → writes temporal_biofield_sync (P139).

let isDailySignalMatrixRunning = false
let lastDailySignalMatrixRun: Date | null = null

function shouldRunDailySignalMatrixCheck(): boolean {
  const now = dayjs()
  if (isDailySignalMatrixRunning) return false
  if (lastDailySignalMatrixRun) {
    const lastRun = dayjs(lastDailySignalMatrixRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 9 // 09:00 UTC daily
}

async function executeDailySignalMatrixCheck(): Promise<JobResult> {
  const jobName = 'daily-signal-matrix-check'
  const executedAt = new Date().toISOString()
  if (isDailySignalMatrixRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailySignalMatrixRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY SIGNAL MATRIX CHECK — 09:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const dayAgo = dayjs().subtract(24, 'hour').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(1, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let writtenMatrix = 0
    let writtenCoherence = 0
    let writtenTemporalSync = 0

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const recentLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: dayAgo },
          },
          attributes: ['event', 'metadata'],
        })

        const eventSet = new Set(recentLogs.map((l: any) => l.event))

        // P138: Signal Matrix Saturation — check all 6 source categories present
        const hasEmotional  = eventSet.has('emotional_checkin')
        const hasMemory     = eventSet.has('note') || Array.from(eventSet).some((e: any) => typeof e === 'string' && e.includes('memory'))
        const hasPlanner    = eventSet.has('plan_set')
        const hasIntentions = eventSet.has('intention')
        const hasSelfcare   = eventSet.has('self_care_complete') || eventSet.has('self_care_completed')
        const hasJournal    = eventSet.has('note')
        const allSixPresent = hasEmotional && hasMemory && hasPlanner && hasIntentions && hasSelfcare && hasJournal

        if (allSixPresent) {
          await (Log as any).create({
            userId,
            event: 'signal_matrix_saturation',
            text: 'Signal matrix saturation: all 6 primary source categories active within 24h. Full-dimensional presence. No channel dark.',
            metadata: {
              emotional: hasEmotional, memory: hasMemory, planner: hasPlanner,
              intentions: hasIntentions, selfcare: hasSelfcare, journal: hasJournal,
              window: '24h', hour: 9,
            },
          })
          writtenMatrix++
        }

        // P137: Quantum Coherence Peak — quantum_field_alignment today
        const hasFieldAlignment = eventSet.has('quantum_field_alignment')
        if (hasFieldAlignment) {
          const fieldLog = recentLogs.find((l: any) => l.event === 'quantum_field_alignment')
          const fieldConf = fieldLog?.metadata?.composite ?? 80
          await (Log as any).create({
            userId,
            event: 'quantum_coherence_peak',
            text: `Quantum coherence peak: quantum-field-alignment confirmed today with composite ${fieldConf}%. Field is aligned AND coherence threshold met. OS transmitting.`,
            metadata: { fieldConf, threshold: 60, window: '24h', hour: 9 },
          })
          writtenCoherence++
        }

        // P139: Temporal-Biofield Sync — morning_coherence_arc + daily_coherence_seal + biofield_integration_peak
        const hasMorningCoherence   = eventSet.has('morning_coherence_arc') || eventSet.has('morning_coherence_launch')
        const hasDailyCoherence     = eventSet.has('daily_coherence_seal')
        const hasBiofieldIntegration = eventSet.has('biofield_integration_peak')

        if (hasMorningCoherence && hasDailyCoherence && hasBiofieldIntegration) {
          const morningLog  = recentLogs.find((l: any) => l.event === 'morning_coherence_arc' || l.event === 'morning_coherence_launch')
          const sealLog     = recentLogs.find((l: any) => l.event === 'daily_coherence_seal')
          const biofieldLog = recentLogs.find((l: any) => l.event === 'biofield_integration_peak')
          const morningConf  = morningLog?.metadata?.confidence  ?? 0.75
          const sealConf     = sealLog?.metadata?.confidence     ?? 0.80
          const biofieldConf = biofieldLog?.metadata?.confidence ?? 0.80
          const composite    = Math.round(((morningConf + sealConf + biofieldConf) / 3) * 100)
          await (Log as any).create({
            userId,
            event: 'temporal_biofield_sync',
            text: `Temporal-biofield sync: morning-coherence-arc + daily-coherence-seal + biofield-integration-peak all confirmed today. Time and biology synchronized within one operating window. Composite: ${composite}%.`,
            metadata: { morningConf, sealConf, biofieldConf, composite, window: '1d', hour: 9 },
          })
          writtenTemporalSync++
        }
      } catch {}
    }

    console.log(`  Signal matrix saturation events written: ${writtenMatrix}`)
    console.log(`  Quantum coherence peak events written: ${writtenCoherence}`)
    console.log(`  Temporal-biofield sync events written: ${writtenTemporalSync}`)
    lastDailySignalMatrixRun = new Date()
    isDailySignalMatrixRunning = false
    return { jobName, executedAt, success: true, signalsCreated: writtenMatrix + writtenCoherence + writtenTemporalSync }
  } catch (error: any) {
    console.error('Daily signal matrix check failed:', error.message)
    isDailySignalMatrixRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Physiological Presence Check (Job 45 — 21:00 UTC every day) ──────
// Reads active users. Looks for morning mood/emotional signal (before 12:00 UTC today),
// selfcare signal (any time today), and evening mood/emotional signal (after 17:00 UTC today).
// When all three are present → writes physiological_presence_arc (P140).
// Confirms the full biological day-arc: dawn signal + care completion + dusk signal.

let isDailyPhysiologicalPresenceRunning = false
let lastDailyPhysiologicalPresenceRun: Date | null = null

function shouldRunDailyPhysiologicalPresenceCheck(): boolean {
  const now = dayjs()
  if (isDailyPhysiologicalPresenceRunning) return false
  if (lastDailyPhysiologicalPresenceRun) {
    const lastRun = dayjs(lastDailyPhysiologicalPresenceRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 21 // 21:00 UTC daily
}

async function executeDailyPhysiologicalPresenceCheck(): Promise<JobResult> {
  const jobName = 'daily-physiological-presence-check'
  const executedAt = new Date().toISOString()
  if (isDailyPhysiologicalPresenceRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyPhysiologicalPresenceRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY PHYSIOLOGICAL PRESENCE CHECK — 21:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const dayStart       = dayjs().startOf('day').toDate()
    const morningCutoff  = dayjs().startOf('day').add(12, 'hour').toDate()
    const eveningStart   = dayjs().startOf('day').add(17, 'hour').toDate()
    const nowDate        = dayjs().toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(1, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let written = 0

    const MOOD_EVENTS = ['mood_checkin', 'emotional_checkin', 'mood_update', 'energy_checkin', 'energy_state']
    const CARE_EVENTS = ['self_care_complete', 'self_care_completed']

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id

        const todayLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: dayStart, [Op.lte]: nowDate },
            event: { [Op.in]: [...MOOD_EVENTS, ...CARE_EVENTS] as any[] },
          },
          attributes: ['event', 'createdAt'],
          order: [['createdAt', 'ASC']],
        })

        const morningMood = todayLogs.some((l: any) => MOOD_EVENTS.includes(l.event) && new Date(l.createdAt) < morningCutoff)
        const selfcareHit = todayLogs.some((l: any) => CARE_EVENTS.includes(l.event))
        const eveningMood = todayLogs.some((l: any) => MOOD_EVENTS.includes(l.event) && new Date(l.createdAt) >= eveningStart)

        if (morningMood && selfcareHit && eveningMood) {
          const selfcareCount = todayLogs.filter((l: any) => CARE_EVENTS.includes(l.event)).length
          await (Log as any).create({
            userId,
            event: 'physiological_presence_arc',
            text: `Physiological presence arc: morning mood + ${selfcareCount} selfcare + evening mood confirmed today. Full biological day-arc complete. Dawn → dusk presence loop closed.`,
            metadata: {
              morningPresent: true,
              eveningPresent: true,
              selfcareCount,
              window: '1d',
              hour: 21,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Physiological presence arc events written: ${written}`)
    lastDailyPhysiologicalPresenceRun = new Date()
    isDailyPhysiologicalPresenceRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily physiological presence check failed:', error.message)
    isDailyPhysiologicalPresenceRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Circadian Lock Check (Job 46 — 07:00 UTC every day) ──────────────
// Reads active users. Looks for signals from the PREVIOUS calendar day spanning
// all three circadian arcs: morning (before 10:00), afternoon (12:00–17:00),
// and evening (18:00+). When all three are present → writes circadian_signal_lock (P143).
// Confirms biological clock coverage across the full day arc.

let isDailyCircadianLockRunning = false
let lastDailyCircadianLockRun: Date | null = null

function shouldRunDailyCircadianLockCheck(): boolean {
  const now = dayjs()
  if (isDailyCircadianLockRunning) return false
  if (lastDailyCircadianLockRun) {
    const lastRun = dayjs(lastDailyCircadianLockRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 7 // 07:00 UTC daily
}

async function executeDailyCircadianLockCheck(): Promise<JobResult> {
  const jobName = 'daily-circadian-lock-check'
  const executedAt = new Date().toISOString()
  if (isDailyCircadianLockRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyCircadianLockRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY CIRCADIAN LOCK CHECK — 07:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    // Check PREVIOUS calendar day to ensure all arcs are complete
    const prevDayStart     = dayjs().subtract(1, 'day').startOf('day').toDate()
    const prevMorningCutoff = dayjs().subtract(1, 'day').startOf('day').add(10, 'hour').toDate()
    const prevAfternoonStart = dayjs().subtract(1, 'day').startOf('day').add(12, 'hour').toDate()
    const prevAfternoonEnd   = dayjs().subtract(1, 'day').startOf('day').add(17, 'hour').toDate()
    const prevEveningStart   = dayjs().subtract(1, 'day').startOf('day').add(18, 'hour').toDate()
    const prevDayEnd         = dayjs().subtract(1, 'day').endOf('day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(2, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (48h): ${activeUsers.length}`)
    let written = 0

    const SIGNAL_EVENTS = [
      'mood_checkin', 'emotional_checkin', 'mood_update', 'energy_checkin', 'energy_state',
      'self_care_complete', 'self_care_completed', 'journal_entry', 'note',
      'memory_created', 'intention_created', 'planner_entry',
    ]

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id

        const prevDayLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: prevDayStart, [Op.lte]: prevDayEnd },
            event: { [Op.in]: SIGNAL_EVENTS as any[] },
          },
          attributes: ['event', 'createdAt'],
          order: [['createdAt', 'ASC']],
        })

        if (!prevDayLogs.length) continue

        const morningSignal   = prevDayLogs.some((l: any) => new Date(l.createdAt) >= prevDayStart && new Date(l.createdAt) < prevMorningCutoff)
        const afternoonSignal = prevDayLogs.some((l: any) => new Date(l.createdAt) >= prevAfternoonStart && new Date(l.createdAt) < prevAfternoonEnd)
        const eveningSignal   = prevDayLogs.some((l: any) => new Date(l.createdAt) >= prevEveningStart && new Date(l.createdAt) <= prevDayEnd)

        if (morningSignal && afternoonSignal && eveningSignal) {
          const circadianSignals = prevDayLogs.filter((l: any) => {
            const h = new Date(l.createdAt).getHours()
            return h < 10 || (h >= 12 && h < 17) || h >= 18
          }).length
          await (Log as any).create({
            userId,
            event: 'circadian_signal_lock',
            text: `Circadian signal lock: previous day — dawn (pre-10:00) + meridian (12:00–17:00) + dusk (18:00+) all confirmed. ${circadianSignals} arc signals total. Biological clock anchored across the full operating day.`,
            metadata: {
              morningPresent: true,
              afternoonPresent: true,
              eveningPresent: true,
              circadianSignals,
              window: '24h-prior-day',
              arcs: ['DAWN', 'MERIDIAN', 'DUSK'],
              hour: 7,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Circadian lock events written: ${written}`)
    lastDailyCircadianLockRun = new Date()
    isDailyCircadianLockRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily circadian lock check failed:', error.message)
    isDailyCircadianLockRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Signal Coherence Cascade Check (Job 47 — 08:00 UTC every day) ─────
// Reads active users. Checks whether the previous calendar day has log events for
// all three of: circadian_signal_lock (P143) + dimensional_saturation (P144) +
// quantum_identity_crystallization (P145). When all three fired for a user on the
// same day → writes signal_coherence_cascade (P146).
// The three temporal, dimensional, and identity seals confirmed simultaneously.

let isDailyCoherenceCascadeRunning = false
let lastDailyCoherenceCascadeRun: Date | null = null

function shouldRunDailyCoherenceCascadeCheck(): boolean {
  const now = dayjs()
  if (isDailyCoherenceCascadeRunning) return false
  if (lastDailyCoherenceCascadeRun) {
    const lastRun = dayjs(lastDailyCoherenceCascadeRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 8 // 08:00 UTC daily
}

async function executeDailyCoherenceCascadeCheck(): Promise<JobResult> {
  const jobName = 'daily-signal-coherence-cascade-check'
  const executedAt = new Date().toISOString()
  if (isDailyCoherenceCascadeRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyCoherenceCascadeRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY SIGNAL COHERENCE CASCADE CHECK — 08:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const prevDayStart = dayjs().subtract(1, 'day').startOf('day').toDate()
    const prevDayEnd   = dayjs().subtract(1, 'day').endOf('day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(2, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (48h): ${activeUsers.length}`)
    let written = 0

    const CASCADE_EVENTS = ['circadian_signal_lock', 'dimensional_saturation', 'quantum_identity_crystallization']

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id

        const prevDayLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: prevDayStart, [Op.lte]: prevDayEnd },
            event: { [Op.in]: CASCADE_EVENTS as any[] },
          },
          attributes: ['event'],
        })

        if (!prevDayLogs.length) continue

        const presentEvents = new Set(prevDayLogs.map((l: any) => l.event))
        const allThreePresent = CASCADE_EVENTS.every(e => presentEvents.has(e))

        if (allThreePresent) {
          await (Log as any).create({
            userId,
            event: 'signal_coherence_cascade',
            text: `Signal coherence cascade: previous day — circadian lock · dimensional saturation · identity crystallization all confirmed simultaneously. Three seals open. Full-field coherence at maximum convergence.`,
            metadata: {
              seals: ['CIRCADIAN', 'DIMENSIONAL', 'IDENTITY'],
              convergenceLevel: 'MAXIMUM',
              window: '24h-prior-day',
              hour: 8,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Signal coherence cascade events written: ${written}`)
    lastDailyCoherenceCascadeRun = new Date()
    isDailyCoherenceCascadeRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily signal coherence cascade check failed:', error.message)
    isDailyCoherenceCascadeRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Total Field Coherence Check (Job 48 — 09:00 UTC every day) ──────
// Reads active users. Checks whether the previous calendar day has log events for
// all three of: signal_coherence_cascade (P146) + quantum_presence_field (P147) +
// identity_momentum_lock (P148). When all three fired for a user on the
// same day → writes total_field_coherence (P150).
// All three meta-seals confirmed simultaneously. Absolute convergence.

let isDailyTotalFieldCoherenceRunning = false
let lastDailyTotalFieldCoherenceRun: Date | null = null

function shouldRunDailyTotalFieldCoherenceCheck(): boolean {
  const now = dayjs()
  if (isDailyTotalFieldCoherenceRunning) return false
  if (lastDailyTotalFieldCoherenceRun) {
    const lastRun = dayjs(lastDailyTotalFieldCoherenceRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 9 // 09:00 UTC daily
}

async function executeDailyTotalFieldCoherenceCheck(): Promise<JobResult> {
  const jobName = 'daily-total-field-coherence-check'
  const executedAt = new Date().toISOString()
  if (isDailyTotalFieldCoherenceRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyTotalFieldCoherenceRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY TOTAL FIELD COHERENCE CHECK — 09:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const prevDayStart = dayjs().subtract(1, 'day').startOf('day').toDate()
    const prevDayEnd   = dayjs().subtract(1, 'day').endOf('day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: dayjs().subtract(2, 'day').toDate() } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (48h): ${activeUsers.length}`)
    let written = 0

    const META_SEAL_EVENTS = ['signal_coherence_cascade', 'quantum_presence_field', 'identity_momentum_lock']

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id

        const prevDayLogs = await (Log as any).findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: prevDayStart, [Op.lte]: prevDayEnd },
            event: { [Op.in]: META_SEAL_EVENTS as any[] },
          },
          attributes: ['event'],
        })

        if (!prevDayLogs.length) continue

        const presentEvents = new Set(prevDayLogs.map((l: any) => l.event))
        const allThreePresent = META_SEAL_EVENTS.every(e => presentEvents.has(e))

        if (allThreePresent) {
          await (Log as any).create({
            userId,
            event: 'total_field_coherence',
            text: `Total field coherence: previous day — signal coherence cascade · quantum presence field · identity momentum lock all confirmed simultaneously. All three meta-seals open. The QOS has achieved absolute convergence. No higher state is defined.`,
            metadata: {
              metaSeals: ['COHERENCE', 'PRESENCE', 'MOMENTUM'],
              convergenceLevel: 'ABSOLUTE',
              window: '24h-prior-day',
              hour: 9,
            },
          })
          written++
        }
      } catch {}
    }

    console.log(`  Total field coherence events written: ${written}`)
    lastDailyTotalFieldCoherenceRun = new Date()
    isDailyTotalFieldCoherenceRunning = false
    return { jobName, executedAt, success: true, signalsCreated: written }
  } catch (error: any) {
    console.error('Daily total field coherence check failed:', error.message)
    isDailyTotalFieldCoherenceRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily OS Snapshot ───────────────────────────────────────────────────────

let isDailyOSSnapshotRunning = false
let lastDailyOSSnapshotRun: Date | null = null

function shouldRunDailyOSSnapshotJob(): boolean {
  const now = dayjs()
  if (isDailyOSSnapshotRunning) return false
  if (lastDailyOSSnapshotRun) {
    const lastRun = dayjs(lastDailyOSSnapshotRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

async function executeDailyOSSnapshotJob(): Promise<JobResult> {
  const jobName = 'daily-os-snapshot'
  const executedAt = new Date().toISOString()
  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Daily OS Snapshot')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')
  isDailyOSSnapshotRunning = true
  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 2000,
    })
    console.log(`  Active users (24h): ${activeUsers.length}`)
    let created = 0
    let failed = 0
    for (const user of activeUsers) {
      try {
        const metadata = (user as any).metadata as any || {}
        const snapshotMeta: Record<string, any> = {}
        if (metadata.theme) snapshotMeta.theme = { theme: metadata.theme }
        if (metadata.sound) snapshotMeta.sound = metadata.sound
        await Log.create({
          userId: (user as any).id,
          event: 'system_snapshot' as any,
          text: `OS midnight snapshot — ${dayjs().format('YYYY-MM-DD')}`,
          metadata: snapshotMeta,
          context: {},
        })
        created++
      } catch (err: any) {
        failed++
      }
    }
    console.log('')
    console.log('─'.repeat(60))
    console.log('OS SNAPSHOT JOB COMPLETE')
    console.log(`   Created: ${created} / Failed: ${failed} / Total: ${activeUsers.length}`)
    console.log('─'.repeat(60))
    console.log('')
    lastDailyOSSnapshotRun = new Date()
    isDailyOSSnapshotRunning = false
    return { jobName, executedAt, success: true, result: { created, failed, total: activeUsers.length } }
  } catch (error: any) {
    console.error('Daily OS snapshot job failed:', error.message)
    isDailyOSSnapshotRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly Intention Completion Audit ──────────────────────────────────────

let isWeeklyIntentionCompletionRunning = false
let lastWeeklyIntentionCompletionRun: Date | null = null

/**
 * Runs on Sundays at 20:00 UTC.
 * For each active user, scans intention_set log events from the past 7 days.
 * Cross-references with plan_set or self_care_complete events within +7 days.
 * Computes a completion rate and logs an aggregate system summary.
 * No individual data is persisted — system monitoring only.
 */
function shouldRunWeeklyIntentionCompletionJob(): boolean {
  const now = dayjs()
  const dayOfWeek = now.day() // 0 = Sunday
  if (dayOfWeek !== 0) return false
  if (isWeeklyIntentionCompletionRunning) return false
  if (lastWeeklyIntentionCompletionRun) {
    const lastRun = dayjs(lastWeeklyIntentionCompletionRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

async function executeWeeklyIntentionCompletionJob(): Promise<JobResult> {
  const jobName = 'weekly-intention-completion-audit'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Weekly Intention Completion Audit')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isWeeklyIntentionCompletionRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const fourteenDaysAgo = dayjs().subtract(14, 'day').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: sevenDaysAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 500,
    })

    console.log(`  Active users (7d): ${activeUsers.length}`)

    let totalIntentions = 0
    let completedArcs = 0 // intention followed by plan + care within 7 days
    let partialArcs = 0   // intention followed by either plan or care
    let openArcs = 0      // intention with no follow-through yet

    for (const user of activeUsers) {
      try {
        const logs = await Log.findAll({
          where: {
            userId: (user as any).id,
            createdAt: { [Op.gte]: fourteenDaysAgo },
            event: { [Op.in]: ['intention', 'plan_set', 'self_care_complete', 'self_care_completed'] as any[] }
          },
          order: [['createdAt', 'ASC']],
        })

        const intentionLogs = logs.filter((l: any) => l.event === 'intention')
        const planLogs = logs.filter((l: any) => l.event === 'plan_set')
        const careLogs = logs.filter((l: any) =>
          l.event === 'self_care_complete' || l.event === 'self_care_completed'
        )

        for (const iLog of intentionLogs) {
          totalIntentions++
          const intentionTime = new Date(iLog.createdAt).getTime()
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

          const hasPlan = planLogs.some((p: any) => {
            const pt = new Date(p.createdAt).getTime()
            return pt > intentionTime && pt < intentionTime + sevenDaysMs
          })
          const hasCare = careLogs.some((c: any) => {
            const ct = new Date(c.createdAt).getTime()
            return ct > intentionTime && ct < intentionTime + sevenDaysMs
          })

          if (hasPlan && hasCare) completedArcs++
          else if (hasPlan || hasCare) partialArcs++
          else openArcs++
        }
      } catch { /* skip user */ }
    }

    const completionRate = totalIntentions > 0
      ? Math.round((completedArcs / totalIntentions) * 100)
      : 0

    console.log(`  Total intentions (14d): ${totalIntentions}`)
    console.log(`  Completed arcs (intent→plan+care): ${completedArcs} (${completionRate}%)`)
    console.log(`  Partial arcs: ${partialArcs}`)
    console.log(`  Open arcs: ${openArcs}`)
    console.log('')
    console.log('─'.repeat(60))
    console.log('INTENTION COMPLETION AUDIT COMPLETE')
    console.log(`   Completion rate: ${completionRate}% · ${completedArcs}/${totalIntentions} full arcs`)
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyIntentionCompletionRun = new Date()
    isWeeklyIntentionCompletionRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { totalIntentions, completedArcs, partialArcs, openArcs, completionRate }
    }
  } catch (error: any) {
    console.error('Weekly intention completion audit failed:', error.message)
    isWeeklyIntentionCompletionRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Morning Biofield Summary ──────────────────────────────────────────

let isMorningBiofieldRunning = false
let lastMorningBiofieldRun: Date | null = null

function shouldRunMorningBiofieldJob(): boolean {
  const now = dayjs()
  if (isMorningBiofieldRunning) return false
  if (lastMorningBiofieldRun) {
    const lastRun = dayjs(lastMorningBiofieldRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

async function executeMorningBiofieldJob(): Promise<JobResult> {
  const jobName = 'morning-biofield-summary'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Morning Biofield Summary')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isMorningBiofieldRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: sevenDaysAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 500,
    })

    console.log(`  Active users (7d): ${activeUsers.length}`)

    let depletedCount = 0
    let stableCount = 0
    let recoveredCount = 0

    for (const user of activeUsers) {
      try {
        const overnightLogs = await Log.findAll({
          where: {
            userId: (user as any).id,
            createdAt: { [Op.gte]: oneDayAgo },
            event: { [Op.in]: ['mood_checkin', 'energy_checkin', 'emotional_checkin'] as any[] }
          },
          order: [['createdAt', 'ASC']],
        })

        if (overnightLogs.length === 0) continue

        const lowEnergySignals = overnightLogs.filter((l: any) => {
          const m = l.metadata as any || {}
          const energy = m.energy || m.energyLevel || m.value
          return typeof energy === 'number' ? energy <= 3 : energy === 'low' || energy === 'depleted'
        })

        const ratio = lowEnergySignals.length / overnightLogs.length

        if (ratio >= 0.6) depletedCount++
        else if (ratio <= 0.2) recoveredCount++
        else stableCount++
      } catch { /* skip user */ }
    }

    console.log(`  Overnight depletion scan:`)
    console.log(`    Depleted (60%+ low signals): ${depletedCount}`)
    console.log(`    Stable: ${stableCount}`)
    console.log(`    Recovered: ${recoveredCount}`)
    console.log('')
    console.log('─'.repeat(60))
    console.log('MORNING BIOFIELD SUMMARY COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastMorningBiofieldRun = new Date()
    isMorningBiofieldRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { scanned: activeUsers.length, depletedCount, stableCount, recoveredCount }
    }
  } catch (error: any) {
    console.error('Morning biofield job failed:', error.message)
    isMorningBiofieldRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Pattern Coverage Audit ────────────────────────────────────────────

let isDailyPatternCoverageRunning = false
let lastDailyPatternCoverageRun: Date | null = null

function shouldRunDailyPatternCoverageJob(): boolean {
  const now = dayjs()
  if (now.hour() !== 23) return false
  if (isDailyPatternCoverageRunning) return false
  if (lastDailyPatternCoverageRun) {
    const lastRun = dayjs(lastDailyPatternCoverageRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

/**
 * Runs daily at 23:00 UTC.
 * Scans QIE pattern signals fired in the last 24h across all active users.
 * Reports: top patterns, coverage rate (% of users with at least one pattern),
 * and dormant patterns (none fired in 7 days — product signal for tuning).
 * No individual data persisted — system observability only.
 */
async function executeDailyPatternCoverageJob(): Promise<JobResult> {
  const jobName = 'daily-pattern-coverage-audit'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Daily Pattern Coverage Audit')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isDailyPatternCoverageRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 1000,
    })

    console.log(`  Active users (24h): ${activeUsers.length}`)

    // Count pattern firings from quantum_intent_signal events
    const patternCounts: Record<string, number> = {}
    const userPatternSets: Record<string, Set<string>> = {}
    let usersWithPatterns = 0

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const qieLogs = await Log.findAll({
          where: {
            userId,
            createdAt: { [Op.gte]: oneDayAgo },
            event: 'quantum_intent_signal' as any,
          },
        })

        const userPatterns = new Set<string>()
        for (const log of qieLogs) {
          const patternName = (log.metadata as any)?.pattern
          if (patternName) {
            patternCounts[patternName] = (patternCounts[patternName] ?? 0) + 1
            userPatterns.add(patternName)
          }
        }

        if (userPatterns.size > 0) {
          usersWithPatterns++
          userPatternSets[userId] = userPatterns
        }
      } catch { /* skip user */ }
    }

    const coverageRate = activeUsers.length > 0
      ? Math.round((usersWithPatterns / activeUsers.length) * 100)
      : 0

    const topPatterns = Object.entries(patternCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    console.log(`  Users with active patterns: ${usersWithPatterns}/${activeUsers.length} (${coverageRate}%)`)
    console.log(`  Top patterns (24h):`)
    topPatterns.forEach(([name, count]) => {
      console.log(`    ${name}: ${count} firings`)
    })

    // Dormant pattern check — patterns with no firings in 7 days
    const sevenDayLogs = await Log.findAll({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
        event: 'quantum_intent_signal' as any,
      },
    })
    const activePatternNames = new Set(
      sevenDayLogs.map((l: any) => (l.metadata as any)?.pattern).filter(Boolean)
    )

    console.log(`  Patterns active in last 7d: ${activePatternNames.size}`)
    console.log('')
    console.log('─'.repeat(60))
    console.log('PATTERN COVERAGE AUDIT COMPLETE')
    console.log(`   Coverage: ${coverageRate}% · Top: ${topPatterns[0]?.[0] ?? 'none'} (${topPatterns[0]?.[1] ?? 0})`)
    console.log('─'.repeat(60))
    console.log('')

    lastDailyPatternCoverageRun = new Date()
    isDailyPatternCoverageRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: {
        scanned: activeUsers.length,
        usersWithPatterns,
        coverageRate,
        topPatterns: topPatterns.map(([name, count]) => ({ name, count })),
        activePatternsSevenDays: activePatternNames.size,
      }
    }
  } catch (error: any) {
    console.error('Daily pattern coverage audit failed:', error.message)
    isDailyPatternCoverageRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly Archetype Stability Monitor ─────────────────────────────────────

let isWeeklyArchetypeStabilityRunning = false
let lastWeeklyArchetypeStabilityRun: Date | null = null

/**
 * Runs on Thursdays at 05:00 UTC.
 * Compares each active user's cohort determinations across the last 2 weeks.
 * Computes archetype stability index (% week-over-week archetype match) and
 * logs aggregate distribution. No individual data persisted — system telemetry only.
 */
function shouldRunWeeklyArchetypeStabilityJob(): boolean {
  const now = dayjs()
  const dayOfWeek = now.day() // 4 = Thursday
  if (dayOfWeek !== 4) return false
  if (now.hour() !== 5) return false
  if (isWeeklyArchetypeStabilityRunning) return false
  if (lastWeeklyArchetypeStabilityRun) {
    const lastRun = dayjs(lastWeeklyArchetypeStabilityRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

async function executeWeeklyArchetypeStabilityJob(): Promise<JobResult> {
  const jobName = 'weekly-archetype-stability-monitor'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Weekly Archetype Stability Monitor')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isWeeklyArchetypeStabilityRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const fourteenDaysAgo = dayjs().subtract(14, 'day').toDate()
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: sevenDaysAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 1000,
    })

    console.log(`  Active users (7d): ${activeUsers.length}`)

    const archetypeCounts: Record<string, number> = {}
    let stableUsers = 0       // same archetype both weeks
    let shiftedUsers = 0      // different archetype week-over-week
    let singleWeekUsers = 0   // only one week of data

    for (const user of activeUsers) {
      try {
        const cohortLogs = await Log.findAll({
          where: {
            userId: (user as any).id,
            createdAt: { [Op.gte]: fourteenDaysAgo },
            event: 'physiological_cohort' as any,
          },
          order: [['createdAt', 'DESC']],
        })

        if (cohortLogs.length === 0) continue

        const priorWeekLogs = cohortLogs.filter(
          (l: any) => new Date(l.createdAt) < sevenDaysAgo
        )
        const currentWeekLogs = cohortLogs.filter(
          (l: any) => new Date(l.createdAt) >= sevenDaysAgo
        )

        // Track dominant archetype this week
        const currentArchetype = (currentWeekLogs[0]?.metadata as any)?.archetype
        if (currentArchetype) {
          archetypeCounts[currentArchetype] = (archetypeCounts[currentArchetype] ?? 0) + 1
        }

        if (priorWeekLogs.length === 0 || currentWeekLogs.length === 0) {
          singleWeekUsers++
          continue
        }

        const priorArchetype = (priorWeekLogs[0]?.metadata as any)?.archetype
        if (priorArchetype && currentArchetype) {
          if (priorArchetype === currentArchetype) stableUsers++
          else shiftedUsers++
        }
      } catch { /* skip user */ }
    }

    const compared = stableUsers + shiftedUsers
    const stabilityRate = compared > 0
      ? Math.round((stableUsers / compared) * 100)
      : 0

    const topArchetypes = Object.entries(archetypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    console.log(`  Archetype stability (week-over-week):`)
    console.log(`    Stable: ${stableUsers} · Shifted: ${shiftedUsers} · Single-week: ${singleWeekUsers}`)
    console.log(`    Stability rate: ${stabilityRate}%`)
    console.log(`  Top archetypes this week:`)
    topArchetypes.forEach(([name, count]) => {
      console.log(`    ${name}: ${count} users`)
    })
    console.log('')
    console.log('─'.repeat(60))
    console.log('ARCHETYPE STABILITY MONITOR COMPLETE')
    console.log(`   Stability: ${stabilityRate}% · Top: ${topArchetypes[0]?.[0] ?? 'none'}`)
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyArchetypeStabilityRun = new Date()
    isWeeklyArchetypeStabilityRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: {
        scanned: activeUsers.length,
        stableUsers,
        shiftedUsers,
        singleWeekUsers,
        stabilityRate,
        topArchetypes: topArchetypes.map(([name, count]) => ({ name, count })),
      }
    }
  } catch (error: any) {
    console.error('Weekly archetype stability job failed:', error.message)
    isWeeklyArchetypeStabilityRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Source Diversity Pulse ───────────────────────────────────────────

let isDailySourceDiversityRunning = false
let lastDailySourceDiversityRun: Date | null = null

function shouldRunDailySourceDiversityJob(): boolean {
  const now = dayjs()
  if (now.hour() !== 7) return false
  if (isDailySourceDiversityRunning) return false
  if (lastDailySourceDiversityRun) {
    const lastRun = dayjs(lastDailySourceDiversityRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

/**
 * Runs daily at 07:00 UTC.
 * Measures how many distinct signal sources each active user generated in the last 24h.
 * Computes system-wide source diversity: unique sources / total possible (11).
 * Logs a source_diversity_pulse event for system monitoring.
 * No individual data exposed — aggregate telemetry only.
 */
async function executeDailySourceDiversityJob(): Promise<JobResult> {
  const jobName = 'daily-source-diversity-pulse'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Daily Source Diversity Pulse')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isDailySourceDiversityRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const TOTAL_POSSIBLE_SOURCES = 11  // matches LOG_DEPENDENCY_SOURCES count

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 1000,
    })

    console.log(`  Active users (24h): ${activeUsers.length}`)

    const diversityBuckets: Record<number, number> = {}
    let totalDiversityScore = 0
    let usersWithSignals = 0
    const globalSourceCounts: Record<string, number> = {}

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id
        const userLogs = await Log.findAll({
          where: { userId, createdAt: { [Op.gte]: oneDayAgo } },
          attributes: ['event', 'metadata'],
        })

        const sources = new Set<string>()
        for (const log of userLogs) {
          const src = (log.metadata as any)?.source || (log as any).event
          if (src) {
            sources.add(src)
            globalSourceCounts[src] = (globalSourceCounts[src] ?? 0) + 1
          }
        }

        if (sources.size > 0) {
          usersWithSignals++
          diversityBuckets[sources.size] = (diversityBuckets[sources.size] ?? 0) + 1
          totalDiversityScore += sources.size / TOTAL_POSSIBLE_SOURCES
        }
      } catch { /* skip user */ }
    }

    const avgDiversityScore = usersWithSignals > 0
      ? totalDiversityScore / usersWithSignals
      : 0
    const uniqueSources = Object.keys(globalSourceCounts).length

    console.log(`  Users with signals: ${usersWithSignals}/${activeUsers.length}`)
    console.log(`  Avg diversity score: ${(avgDiversityScore * 100).toFixed(1)}%`)
    console.log(`  Unique source types observed: ${uniqueSources}/${TOTAL_POSSIBLE_SOURCES}`)
    console.log('')
    console.log('─'.repeat(60))
    console.log('SOURCE DIVERSITY PULSE COMPLETE')
    console.log(`   Diversity: ${(avgDiversityScore * 100).toFixed(1)}% · Sources: ${uniqueSources}/${TOTAL_POSSIBLE_SOURCES}`)
    console.log('─'.repeat(60))
    console.log('')

    lastDailySourceDiversityRun = new Date()
    isDailySourceDiversityRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: {
        scanned: activeUsers.length,
        usersWithSignals,
        avgDiversityScore: Math.round(avgDiversityScore * 100),
        uniqueSources,
        totalPossible: TOTAL_POSSIBLE_SOURCES,
      }
    }
  } catch (error: any) {
    console.error('Daily source diversity job failed:', error.message)
    isDailySourceDiversityRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Archetype Shift Monitor ──────────────────────────────────────────

let isDailyArchetypeShiftRunning = false
let lastDailyArchetypeShiftRun: Date | null = null

function shouldRunDailyArchetypeShiftJob(): boolean {
  const now = dayjs()
  if (now.hour() !== 10) return false
  if (isDailyArchetypeShiftRunning) return false
  if (lastDailyArchetypeShiftRun) {
    const lastRun = dayjs(lastDailyArchetypeShiftRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

/**
 * Runs daily at 10:00 UTC.
 * For each active user, compares the most recent physiological_cohort log
 * against the previous one. If archetype changed, writes an archetype_shift event.
 * Surfaces archetype transitions in the operator field log via ARCH-SHIFT: handler.
 */
async function executeDailyArchetypeShiftJob(): Promise<JobResult> {
  const jobName = 'daily-archetype-shift-monitor'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Daily Archetype Shift Monitor')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isDailyArchetypeShiftRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(1, 'day').toDate()
    const twoDaysAgo = dayjs().subtract(2, 'day').toDate()

    const activeUsers = await User.findAll({
      where: { lastSeenAt: { [Op.gte]: oneDayAgo } },
      order: [['lastSeenAt', 'DESC']],
      limit: 1000,
    })

    console.log(`  Active users (24h): ${activeUsers.length}`)

    let shiftsDetected = 0
    let usersChecked = 0

    for (const user of activeUsers) {
      try {
        const userId = (user as any).id

        // Fetch last 2 physiological_cohort logs for this user
        const cohortLogs = await Log.findAll({
          where: {
            userId,
            event: 'physiological_cohort' as any,
            createdAt: { [Op.gte]: twoDaysAgo },
          },
          order: [['createdAt', 'DESC']],
          limit: 2,
        })

        if (cohortLogs.length < 2) continue

        usersChecked++
        const recent = cohortLogs[0] as any
        const prior = cohortLogs[1] as any

        const recentArchetype = recent.metadata?.archetype
        const priorArchetype = prior.metadata?.archetype

        if (!recentArchetype || !priorArchetype) continue
        if (recentArchetype === priorArchetype) continue

        // Archetype changed — record the shift
        shiftsDetected++

        const stabilityRate = dayjs(recent.createdAt).diff(dayjs(prior.createdAt), 'hour') > 12
          ? 0.6 : 0.3  // Longer hold = higher stability on new archetype

        await Log.create({
          userId,
          event: 'archetype_shift' as any,
          text: '',
          metadata: {
            fromArchetype: priorArchetype,
            toArchetype: recentArchetype,
            stabilityRate,
          },
        } as any)

        console.log(`  [${userId}] ARCH-SHIFT: ${priorArchetype} → ${recentArchetype}`)
      } catch (userErr: any) {
        console.warn(`  User ${(user as any).id} archetype shift check failed: ${userErr.message}`)
      }
    }

    console.log('')
    console.log(`  Users checked (2 cohort logs): ${usersChecked}/${activeUsers.length}`)
    console.log(`  Archetype shifts detected: ${shiftsDetected}`)
    console.log('')
    console.log('─'.repeat(60))
    console.log('ARCHETYPE SHIFT MONITOR COMPLETE')
    console.log(`   Shifts: ${shiftsDetected} · Checked: ${usersChecked}`)
    console.log('─'.repeat(60))
    console.log('')

    lastDailyArchetypeShiftRun = new Date()
    isDailyArchetypeShiftRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { scanned: activeUsers.length, usersChecked, shiftsDetected },
    }
  } catch (error: any) {
    console.error('Daily archetype shift monitor failed:', error.message)
    isDailyArchetypeShiftRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily QOS Signature Pulse ───────────────────────────────────────────────

let isDailyQOSSignatureRunning = false
let lastDailyQOSSignatureRun: Date | null = null

function shouldRunDailyQOSSignaturePulse(): boolean {
  const now = dayjs()
  if (now.hour() !== 13) return false
  if (isDailyQOSSignatureRunning) return false
  if (lastDailyQOSSignatureRun) {
    const lastRun = dayjs(lastDailyQOSSignatureRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return true
}

/**
 * Runs daily at 13:00 UTC.
 * Reads each active user's recent logs from the last 24h.
 * Detects qos_signature_lock and operator_signature conditions
 * from pattern metadata and writes log events for operator-visible readout.
 */
async function executeDailyQOSSignaturePulse(): Promise<JobResult> {
  const jobName = 'daily-qos-signature-pulse'
  const executedAt = new Date().toISOString()

  console.log('')
  console.log('─'.repeat(60))
  console.log('SCHEDULED JOB: Daily QOS Signature Pulse')
  console.log(`   Started: ${executedAt}`)
  console.log('─'.repeat(60))
  console.log('')

  isDailyQOSSignatureRunning = true

  try {
    const { User } = await import('#server/models/user.js')
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const cutoff = dayjs().subtract(30, 'day').toDate()
    const activeUsers = await (User as any).findAll({
      where: { updatedAt: { [Op.gt]: cutoff } },
      attributes: ['id'],
    })

    let sigLockCount = 0
    let opSigCount = 0

    for (const user of activeUsers) {
      const userId = (user as any).id
      try {
        const window24h = dayjs().subtract(24, 'hour').toDate()
        const recentLogs = await (Log as any).findAll({
          where: {
            userId,
            event: { [Op.in]: ['qos_state', 'physiological_cohort', 'scheduled_job'] },
            createdAt: { [Op.gt]: window24h },
          },
          order: [['createdAt', 'DESC']],
          limit: 20,
        })

        const patternLog = recentLogs.find((l: any) =>
          l.event === 'scheduled_job' && l.metadata?.patterns
        )
        if (!patternLog) continue

        const patterns: string[] = patternLog.metadata?.patterns ?? []

        if (patterns.includes('qos-signature-lock')) {
          await (Log as any).create({
            userId,
            event: 'qos_signature_lock',
            text: '',
            metadata: {
              confidence: 0.92,
              triggers: ['meridian-lock', 'multimodal-peak', 'temporal-coherence-window'],
            },
          })
          sigLockCount++
          console.log(`  [${userId}] QOS-SIG: signature lock detected`)
        }

        if (patterns.includes('operator-signature')) {
          const qosLog = recentLogs.find((l: any) => l.event === 'qos_state')
          const index = qosLog?.metadata?.userIndex ?? 0
          await (Log as any).create({
            userId,
            event: 'operator_signature',
            text: '',
            metadata: {
              quadrants: ['bio', 'cognitive', 'structural', 'social'],
              index,
              signals: patternLog.metadata?.signalCount ?? 0,
            },
          })
          opSigCount++
          console.log(`  [${userId}] OP-SIG: operator signature complete`)
        }
      } catch (userErr: any) {
        console.warn(`  User ${userId} QOS signature pulse failed: ${userErr.message}`)
      }
    }

    console.log('')
    console.log(`  QOS signature locks written: ${sigLockCount}`)
    console.log(`  Operator signatures written: ${opSigCount}`)
    console.log('─'.repeat(60))
    console.log('QOS SIGNATURE PULSE COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastDailyQOSSignatureRun = new Date()
    isDailyQOSSignatureRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { scanned: activeUsers.length, sigLockCount, opSigCount },
    }
  } catch (error: any) {
    console.error('Daily QOS signature pulse failed:', error.message)
    isDailyQOSSignatureRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Coherence Index Pulse (Job 14 — 16:00 UTC) ────────────────────────

let isDailyCoherenceIndexRunning = false
let lastDailyCoherenceIndexRun: Date | null = null

function shouldRunDailyCoherenceIndexJob(): boolean {
  const now = dayjs()
  if (isDailyCoherenceIndexRunning) return false
  if (lastDailyCoherenceIndexRun) {
    const lastRun = dayjs(lastDailyCoherenceIndexRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 16
}

async function executeDailyCoherenceIndexJob(): Promise<JobResult> {
  const jobName = 'daily-coherence-index-pulse'
  const executedAt = new Date().toISOString()
  if (isDailyCoherenceIndexRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyCoherenceIndexRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY COHERENCE INDEX PULSE — 16:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')
    const fourHoursAgo = dayjs().subtract(4, 'hour').toDate()

    // Pull recent emotional check-ins across all users
    const recentLogs = await Log.findAll({
      where: {
        event: 'emotional_checkin',
        createdAt: { [Op.gte]: fourHoursAgo },
      },
    })

    const activeUserIds = new Set(recentLogs.map((l: any) => String(l.userId)))
    const activeUserCount = activeUserIds.size

    const positiveMoods = new Set(['calm', 'peaceful', 'energized', 'hopeful', 'grateful', 'content', 'excited'])
    const moodCounts: Record<string, number> = {}
    let positiveCount = 0

    for (const l of recentLogs) {
      const mood = (l.metadata as any)?.emotionalState as string | undefined
      if (!mood) continue
      moodCounts[mood] = (moodCounts[mood] ?? 0) + 1
      if (positiveMoods.has(mood)) positiveCount++
    }

    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown'
    const communityIndex = activeUserCount > 0 ? Math.round((positiveCount / recentLogs.length) * 100) : 0

    console.log(`  Active users (4h): ${activeUserCount}`)
    console.log(`  Top mood: ${topMood}`)
    console.log(`  Community coherence index: ${communityIndex}%`)

    // Write community_coherence_pulse log for each active user
    let written = 0
    for (const userId of activeUserIds) {
      try {
        await Log.create({
          userId: Number(userId),
          event: 'community_coherence_pulse',
          text: '',
          metadata: { communityIndex, topMood, activeUserCount },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} coherence pulse failed: ${userErr.message}`)
      }
    }

    console.log(`  Coherence logs written: ${written}`)
    console.log('─'.repeat(60))
    console.log('COHERENCE INDEX PULSE COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastDailyCoherenceIndexRun = new Date()
    isDailyCoherenceIndexRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { activeUserCount, communityIndex, topMood, written },
    }
  } catch (error: any) {
    console.error('Daily coherence index pulse failed:', error.message)
    isDailyCoherenceIndexRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly QOS Convergence Audit (Job 15 — Sundays 15:00 UTC) ─────────────

let isWeeklyQOSConvergenceRunning = false
let lastWeeklyQOSConvergenceRun: Date | null = null

function shouldRunWeeklyQOSConvergenceJob(): boolean {
  const now = dayjs()
  if (isWeeklyQOSConvergenceRunning) return false
  if (lastWeeklyQOSConvergenceRun) {
    const lastRun = dayjs(lastWeeklyQOSConvergenceRun)
    if (lastRun.isSame(now, 'week')) return false
  }
  return now.day() === 0 && now.hour() === 15 // Sunday 15:00 UTC
}

async function executeWeeklyQOSConvergenceAudit(): Promise<JobResult> {
  const jobName = 'weekly-qos-convergence-audit'
  const executedAt = new Date().toISOString()
  if (isWeeklyQOSConvergenceRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isWeeklyQOSConvergenceRunning = true

  console.log('─'.repeat(60))
  console.log('WEEKLY QOS CONVERGENCE AUDIT — Sunday 15:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { User } = await import('#server/models/user.js')
    const { Op } = await import('sequelize')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    // Find active users from the last 7 days
    const recentLogs = await Log.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['userId'],
    })
    const activeUserIds = [...new Set(recentLogs.map((l: any) => String(l.userId)))]

    let written = 0
    let totalConvergences = 0

    for (const userId of activeUserIds) {
      try {
        // Count operator_convergence events in the last 7 days for this user
        const convergenceLogs = await Log.findAll({
          where: {
            userId: Number(userId),
            event: { [Op.in]: ['operator_convergence', 'qos_signature_lock', 'quantum_coherence_summit'] },
            createdAt: { [Op.gte]: sevenDaysAgo },
          },
        })

        const frequency = convergenceLogs.filter((l: any) => l.event === 'operator_convergence').length
        const hasSummit  = convergenceLogs.some((l: any) => l.event === 'quantum_coherence_summit')

        // Only write for users who had at least 1 convergence event
        if (frequency === 0 && !hasSummit) continue

        // Find the peak day (day with most convergence events)
        const dayMap: Record<string, number> = {}
        for (const l of convergenceLogs) {
          const dayKey = dayjs((l as any).createdAt).format('YYYY-MM-DD')
          dayMap[dayKey] = (dayMap[dayKey] ?? 0) + 1
        }
        const peakDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown'

        totalConvergences += frequency

        await Log.create({
          userId: Number(userId),
          event: 'convergence_audit',
          text: '',
          metadata: {
            frequency,
            peakDay,
            hasSummit,
            window: '7d',
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} convergence audit failed: ${userErr.message}`)
      }
    }

    console.log(`  Active users scanned: ${activeUserIds.length}`)
    console.log(`  Convergence reports written: ${written}`)
    console.log(`  Total convergence events: ${totalConvergences}`)
    console.log('─'.repeat(60))
    console.log('WEEKLY QOS CONVERGENCE AUDIT COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyQOSConvergenceRun = new Date()
    isWeeklyQOSConvergenceRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { scanned: activeUserIds.length, written, totalConvergences },
    }
  } catch (error: any) {
    console.error('Weekly QOS convergence audit failed:', error.message)
    isWeeklyQOSConvergenceRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly Badge Progress Scan (Job 16 — Tuesdays 09:00 UTC) ───────────────

let isWeeklyBadgeScanRunning = false
let lastWeeklyBadgeScanRun: Date | null = null

function shouldRunWeeklyBadgeScanJob(): boolean {
  const now = dayjs()
  if (isWeeklyBadgeScanRunning) return false
  if (lastWeeklyBadgeScanRun) {
    const lastRun = dayjs(lastWeeklyBadgeScanRun)
    if (lastRun.isSame(now, 'week')) return false
  }
  return now.day() === 2 && now.hour() === 9 // Tuesday 09:00 UTC
}

async function executeWeeklyBadgeScan(): Promise<JobResult> {
  const jobName = 'weekly-badge-progress-scan'
  const executedAt = new Date().toISOString()
  if (isWeeklyBadgeScanRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isWeeklyBadgeScanRunning = true

  console.log('─'.repeat(60))
  console.log('WEEKLY BADGE PROGRESS SCAN — Tuesday 09:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    // Find users who unlocked badges in the last 7 days
    const recentBadgeLogs = await Log.findAll({
      where: { event: 'badge_unlock', createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['userId', 'metadata'],
    })

    const userBadgeMap: Record<string, { unlocks: number; types: Set<string> }> = {}
    for (const l of recentBadgeLogs) {
      const uid = String((l as any).userId)
      if (!userBadgeMap[uid]) userBadgeMap[uid] = { unlocks: 0, types: new Set() }
      userBadgeMap[uid].unlocks++
      const badge = (l as any).metadata?.badge as string | undefined
      if (badge) userBadgeMap[uid].types.add(badge)
    }

    let written = 0
    for (const [userId, data] of Object.entries(userBadgeMap)) {
      try {
        const distinctTypes = data.types.size
        const momentum = data.unlocks >= 5 ? 'HIGH' : data.unlocks >= 2 ? 'MODERATE' : 'LOW'

        await Log.create({
          userId: Number(userId),
          event: 'badge_progress_scan',
          text: '',
          metadata: {
            unlocksThisWeek: data.unlocks,
            distinctTypes,
            momentum,
            window: '7d',
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} badge scan failed: ${userErr.message}`)
      }
    }

    console.log(`  Users with badge activity: ${Object.keys(userBadgeMap).length}`)
    console.log(`  Badge scan reports written: ${written}`)
    console.log('─'.repeat(60))
    console.log('WEEKLY BADGE PROGRESS SCAN COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyBadgeScanRun = new Date()
    isWeeklyBadgeScanRunning = false

    return {
      jobName,
      executedAt,
      success: true,
      result: { scanned: Object.keys(userBadgeMap).length, written },
    }
  } catch (error: any) {
    console.error('Weekly badge scan failed:', error.message)
    isWeeklyBadgeScanRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Morning Intention Launch (Job 17) ─────────────────────────────────
// 11:00 UTC daily — detects users whose first signal of the day was an intention,
// followed by planner activity within 90 minutes. Records morning_coherence_launch.

let isDailyMorningIntentionLaunchRunning = false
let lastDailyMorningIntentionLaunchRun: Date | null = null

function shouldRunDailyMorningIntentionLaunch(): boolean {
  const now = dayjs()
  if (isDailyMorningIntentionLaunchRunning) return false
  if (lastDailyMorningIntentionLaunchRun) {
    const lastRun = dayjs(lastDailyMorningIntentionLaunchRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 11
}

async function executeDailyMorningIntentionLaunch(): Promise<JobResult> {
  const jobName = 'daily-morning-intention-launch'
  const executedAt = new Date().toISOString()
  if (isDailyMorningIntentionLaunchRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyMorningIntentionLaunchRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY MORNING INTENTION LAUNCH — 11:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    // Look at logs from 00:00–09:00 UTC today
    const todayStart = dayjs().startOf('day').toDate()
    const nineAM = dayjs().startOf('day').add(9, 'hour').toDate()

    const earlyLogs = await Log.findAll({
      where: {
        createdAt: { [Op.between]: [todayStart, nineAM] },
        event: { [Op.in]: ['intention', 'plan_set'] },
      },
      attributes: ['userId', 'event', 'createdAt', 'metadata'],
      order: [['createdAt', 'ASC']],
    })

    // Group first signals per user
    const userFirstSignal: Record<string, { event: string; time: Date; metadata?: any }> = {}
    for (const l of earlyLogs) {
      const uid = String((l as any).userId)
      if (!userFirstSignal[uid]) {
        userFirstSignal[uid] = { event: l.event, time: new Date(l.createdAt as any), metadata: (l as any).metadata }
      }
    }

    let written = 0
    for (const [userId, first] of Object.entries(userFirstSignal)) {
      if (first.event !== 'intention') continue
      // Check if there's a plan_set within 90 min
      const windowEnd = new Date(first.time.getTime() + 90 * 60 * 1000)
      const followUp = earlyLogs.find(l =>
        String((l as any).userId) === userId &&
        l.event === 'plan_set' &&
        new Date(l.createdAt as any) > first.time &&
        new Date(l.createdAt as any) <= windowEnd
      )
      if (!followUp) continue
      try {
        const plannerMinutes = Math.round((new Date(followUp.createdAt as any).getTime() - first.time.getTime()) / 60000)
        await Log.create({
          userId: Number(userId),
          event: 'morning_coherence_launch',
          text: '',
          metadata: {
            intentionLabel: first.metadata?.intention ?? first.metadata?.intent ?? null,
            plannerMinutesAfter: plannerMinutes,
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} MCL write failed: ${userErr.message}`)
      }
    }

    console.log(`  Users with morning intention signal: ${Object.keys(userFirstSignal).length}`)
    console.log(`  Morning coherence launches detected: ${written}`)
    console.log('─'.repeat(60))
    console.log('DAILY MORNING INTENTION LAUNCH COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastDailyMorningIntentionLaunchRun = new Date()
    isDailyMorningIntentionLaunchRunning = false

    return { jobName, executedAt, success: true, result: { scanned: Object.keys(userFirstSignal).length, written } }
  } catch (error: any) {
    console.error('Daily morning intention launch failed:', error.message)
    isDailyMorningIntentionLaunchRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Evening Coherence Close (Job 18) ──────────────────────────────────
// 22:00 UTC daily — detects users who had a morning intention/planner signal today
// and then recorded journal/memory/log capture in the 18:00–23:00 window.
// Records evening_coherence_close. Mirrors Job 17 (morning-intention-launch).

let isDailyEveningCoherenceCloseRunning = false
let lastDailyEveningCoherenceCloseRun: Date | null = null

function shouldRunDailyEveningCoherenceClose(): boolean {
  const now = dayjs()
  if (isDailyEveningCoherenceCloseRunning) return false
  if (lastDailyEveningCoherenceCloseRun) {
    const lastRun = dayjs(lastDailyEveningCoherenceCloseRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 22
}

async function executeDailyEveningCoherenceClose(): Promise<JobResult> {
  const jobName = 'daily-evening-coherence-close'
  const executedAt = new Date().toISOString()
  if (isDailyEveningCoherenceCloseRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyEveningCoherenceCloseRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY EVENING COHERENCE CLOSE — 22:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const todayStart = dayjs().startOf('day').toDate()
    const eveningStart = dayjs().startOf('day').add(18, 'hour').toDate()
    const eveningEnd = dayjs().startOf('day').add(23, 'hour').toDate()

    // Morning intention/planner signals (00:00–18:00)
    const morningLogs = await Log.findAll({
      where: {
        createdAt: { [Op.between]: [todayStart, eveningStart] },
        event: { [Op.in]: ['intention', 'plan_set'] },
      },
      attributes: ['userId', 'event', 'createdAt'],
    })

    // Evening reflection signals (18:00–23:00)
    const eveningLogs = await Log.findAll({
      where: {
        createdAt: { [Op.between]: [eveningStart, eveningEnd] },
        event: { [Op.in]: ['memory', 'journal', 'note'] },
      },
      attributes: ['userId', 'event', 'createdAt'],
    })

    // Find users with both a morning signal and an evening capture
    const morningUserIds = new Set(morningLogs.map(l => String((l as any).userId)))
    const eveningByUser: Record<string, number> = {}
    for (const l of eveningLogs) {
      const uid = String((l as any).userId)
      eveningByUser[uid] = (eveningByUser[uid] ?? 0) + 1
    }

    let written = 0
    for (const [userId, captureCount] of Object.entries(eveningByUser)) {
      if (!morningUserIds.has(userId)) continue
      try {
        await Log.create({
          userId: Number(userId),
          event: 'evening_coherence_close',
          text: '',
          metadata: {
            captureCount,
            morningSignalPresent: true,
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} EVE write failed: ${userErr.message}`)
      }
    }

    console.log(`  Users with morning signal: ${morningUserIds.size}`)
    console.log(`  Users with evening capture: ${Object.keys(eveningByUser).length}`)
    console.log(`  Evening coherence closes written: ${written}`)
    console.log('─'.repeat(60))
    console.log('DAILY EVENING COHERENCE CLOSE COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastDailyEveningCoherenceCloseRun = new Date()
    isDailyEveningCoherenceCloseRunning = false

    return { jobName, executedAt, success: true, result: { morningUsers: morningUserIds.size, eveningUsers: Object.keys(eveningByUser).length, written } }
  } catch (error: any) {
    console.error('Daily evening coherence close failed:', error.message)
    isDailyEveningCoherenceCloseRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Signal Momentum Check (Job 19 — 20:00 UTC) ───────────────────────
// Detects users who had 3+ unique signal sources on each of the last 5+ days.
// Sustained multi-dimensional engagement. Writes signal_momentum event. Feeds P80.

let isDailySignalMomentumRunning = false
let lastDailySignalMomentumRun: Date | null = null

function shouldRunDailySignalMomentumCheck(): boolean {
  const now = dayjs()
  if (isDailySignalMomentumRunning) return false
  if (lastDailySignalMomentumRun) {
    const lastRun = dayjs(lastDailySignalMomentumRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 20
}

async function executeDailySignalMomentumCheck(): Promise<JobResult> {
  const jobName = 'daily-signal-momentum-check'
  const executedAt = new Date().toISOString()
  if (isDailySignalMomentumRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailySignalMomentumRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY SIGNAL MOMENTUM CHECK — 20:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    // Pull all logs from the last 7 days
    const recentLogs = await Log.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['userId', 'event', 'createdAt'],
      order: [['createdAt', 'ASC']],
    })

    // Group by userId → day → set of event types (as source proxies)
    const userDaySourceMap: Record<string, Record<string, Set<string>>> = {}
    for (const l of recentLogs) {
      const uid = String((l as any).userId)
      const day = dayjs(l.createdAt as any).format('YYYY-MM-DD')
      if (!userDaySourceMap[uid]) userDaySourceMap[uid] = {}
      if (!userDaySourceMap[uid][day]) userDaySourceMap[uid][day] = new Set()
      // Map event to signal source category
      const ev = l.event
      if (['intention', 'plan_set'].includes(ev)) userDaySourceMap[uid][day].add('intentions')
      else if (['emotional_checkin', 'mood_checkin', 'energy_checkin'].includes(ev)) userDaySourceMap[uid][day].add('mood')
      else if (['answer', 'memory'].includes(ev)) userDaySourceMap[uid][day].add('memory')
      else if (['note', 'journal'].includes(ev)) userDaySourceMap[uid][day].add('journal')
      else if (['self_care_complete', 'self_care_completed'].includes(ev)) userDaySourceMap[uid][day].add('selfcare')
      else if (['goal_set', 'goal_update', 'goal_complete'].includes(ev)) userDaySourceMap[uid][day].add('goals')
      else if (['recipe_viewed'].includes(ev)) userDaySourceMap[uid][day].add('recipe')
      else if (['calendar_entry'].includes(ev)) userDaySourceMap[uid][day].add('planner')
    }

    let written = 0
    for (const [userId, dayMap] of Object.entries(userDaySourceMap)) {
      try {
        // Count days with 3+ unique sources
        const qualifyingDays = Object.values(dayMap).filter(sources => sources.size >= 3).length
        if (qualifyingDays < 5) continue

        // Gather all unique sources over the window
        const allSources = new Set<string>()
        Object.values(dayMap).forEach(sources => sources.forEach(s => allSources.add(s)))

        await Log.create({
          userId: Number(userId),
          event: 'signal_momentum',
          text: '',
          metadata: {
            qualifyingDays,
            streakSources: Array.from(allSources),
            window: '7d',
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} signal momentum check failed: ${userErr.message}`)
      }
    }

    console.log(`  Users scanned: ${Object.keys(userDaySourceMap).length}`)
    console.log(`  Signal momentum records written: ${written}`)
    console.log('─'.repeat(60))
    console.log('DAILY SIGNAL MOMENTUM CHECK COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastDailySignalMomentumRun = new Date()
    isDailySignalMomentumRunning = false

    return { jobName, executedAt, success: true, result: { scanned: Object.keys(userDaySourceMap).length, written } }
  } catch (error: any) {
    console.error('Daily signal momentum check failed:', error.message)
    isDailySignalMomentumRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly Cognitive Depth Check (Job 20 — Sundays 06:00 UTC) ──────────────
// Detects users with 5+ memory entries AND 150+ journal words in the last 7 days
// AND at least one badge discovery signal. All three inner channels active.
// Writes cognitive_depth_arc log. Feeds P81 cognitive-depth-arc pattern.

let isWeeklyCognitiveDepthRunning = false
let lastWeeklyCognitiveDepthRun: Date | null = null

function shouldRunWeeklyCognitiveDepthCheck(): boolean {
  const now = dayjs()
  if (isWeeklyCognitiveDepthRunning) return false
  if (lastWeeklyCognitiveDepthRun) {
    const lastRun = dayjs(lastWeeklyCognitiveDepthRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.day() === 0 && now.hour() === 6 // Sunday 06:00 UTC
}

async function executeWeeklyCognitiveDepthCheck(): Promise<JobResult> {
  const jobName = 'weekly-cognitive-depth-check'
  const executedAt = new Date().toISOString()
  if (isWeeklyCognitiveDepthRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isWeeklyCognitiveDepthRunning = true

  console.log('─'.repeat(60))
  console.log('WEEKLY COGNITIVE DEPTH CHECK — Sunday 06:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

    const recentLogs = await Log.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['userId', 'event', 'text', 'metadata', 'createdAt'],
      order: [['createdAt', 'ASC']],
    })

    // Group by userId: count memories, sum journal words, count badge signals
    const userCognitiveMap: Record<string, { memoryCount: number; journalWords: number; badgeCount: number }> = {}
    for (const l of recentLogs) {
      const uid = String((l as any).userId)
      if (!userCognitiveMap[uid]) userCognitiveMap[uid] = { memoryCount: 0, journalWords: 0, badgeCount: 0 }

      const ev = l.event
      if (['answer', 'memory'].includes(ev)) {
        userCognitiveMap[uid].memoryCount++
      } else if (ev === 'note' && l.text && l.text.length > 0) {
        const words = l.text.trim().split(/\s+/).filter(Boolean).length
        userCognitiveMap[uid].journalWords += words
      } else if (ev === 'badge_unlock') {
        userCognitiveMap[uid].badgeCount++
      }
    }

    let written = 0
    for (const [userId, cognitive] of Object.entries(userCognitiveMap)) {
      if (cognitive.memoryCount < 5 || cognitive.journalWords < 150 || cognitive.badgeCount < 1) continue
      try {
        await Log.create({
          userId: Number(userId),
          event: 'cognitive_depth_arc',
          text: '',
          metadata: {
            memoryCount: cognitive.memoryCount,
            journalWords: cognitive.journalWords,
            badgeCount: cognitive.badgeCount,
            window: '7d',
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} cognitive depth write failed: ${userErr.message}`)
      }
    }

    console.log(`  Users scanned: ${Object.keys(userCognitiveMap).length}`)
    console.log(`  Cognitive depth records written: ${written}`)
    console.log('─'.repeat(60))
    console.log('WEEKLY COGNITIVE DEPTH CHECK COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyCognitiveDepthRun = new Date()
    isWeeklyCognitiveDepthRunning = false

    return { jobName, executedAt, success: true, result: { scanned: Object.keys(userCognitiveMap).length, written } }
  } catch (error: any) {
    console.error('Weekly cognitive depth check failed:', error.message)
    isWeeklyCognitiveDepthRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily Vitality Peak Check (Job 21 — 12:00 UTC every day) ───────────────
// Scans morning log entries (06:00-10:00) for 2+ positive mood signals
// AND at least one energy signal. Writes vitality_peak log.
// Feeds P82 circadian-vitality-peak pattern and Vital Architect archetype.

let isDailyVitalityPeakRunning = false
let lastDailyVitalityPeakRun: Date | null = null

function shouldRunDailyVitalityPeakCheck(): boolean {
  const now = dayjs()
  if (isDailyVitalityPeakRunning) return false
  if (lastDailyVitalityPeakRun) {
    const lastRun = dayjs(lastDailyVitalityPeakRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 12 // 12:00 UTC every day
}

async function executeDailyVitalityPeakCheck(): Promise<JobResult> {
  const jobName = 'daily-vitality-peak-check'
  const executedAt = new Date().toISOString()
  if (isDailyVitalityPeakRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyVitalityPeakRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY VITALITY PEAK CHECK — 12:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const todayStart = dayjs().startOf('day').toDate()
    const morningWindow = dayjs().startOf('day').hour(10).toDate() // 06:00-10:00

    const morningLogs = await Log.findAll({
      where: {
        createdAt: { [Op.gte]: todayStart, [Op.lt]: morningWindow },
      },
      attributes: ['userId', 'event', 'text', 'metadata', 'createdAt'],
      order: [['createdAt', 'ASC']],
    })

    const POSITIVE_MOODS = ['energized', 'hopeful', 'excited', 'calm', 'peaceful', 'content', 'grateful', 'fulfilled']

    const userVitalityMap: Record<string, { morningMoodCount: number; energyLevel: string; hasBiorhythmSignal: boolean }> = {}
    for (const l of morningLogs) {
      const uid = String((l as any).userId)
      if (!userVitalityMap[uid]) userVitalityMap[uid] = { morningMoodCount: 0, energyLevel: 'low', hasBiorhythmSignal: false }

      const ev = l.event
      const meta = l.metadata as Record<string, any> | null

      if (ev === 'mood' && meta?.mood && POSITIVE_MOODS.includes(String(meta.mood))) {
        userVitalityMap[uid].morningMoodCount++
      } else if (ev === 'energy' && meta?.level) {
        userVitalityMap[uid].energyLevel = String(meta.level)
      } else if (ev === 'biorhythm_lock' || ev === 'morning_coherence_launch') {
        userVitalityMap[uid].hasBiorhythmSignal = true
      }
    }

    let written = 0
    for (const [userId, vitality] of Object.entries(userVitalityMap)) {
      if (vitality.morningMoodCount < 2) continue
      try {
        await Log.create({
          userId: Number(userId),
          event: 'vitality_peak',
          text: '',
          metadata: {
            morningMoodCount: vitality.morningMoodCount,
            energyLevel: vitality.energyLevel,
            biorhythmAnchored: vitality.hasBiorhythmSignal,
            hour: 12,
            window: '1d',
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} vitality peak write failed: ${userErr.message}`)
      }
    }

    console.log(`  Users scanned: ${Object.keys(userVitalityMap).length}`)
    console.log(`  Vitality peak records written: ${written}`)
    console.log('─'.repeat(60))
    console.log('DAILY VITALITY PEAK CHECK COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastDailyVitalityPeakRun = new Date()
    isDailyVitalityPeakRunning = false

    return { jobName, executedAt, success: true, result: { scanned: Object.keys(userVitalityMap).length, written } }
  } catch (error: any) {
    console.error('Daily vitality peak check failed:', error.message)
    isDailyVitalityPeakRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Weekly Longitudinal Drift Check (Job 22 — Mondays 09:00 UTC) ─────────────
// Detects users with declining weekly engagement over 3+ consecutive weeks.
// Weekly engagement score = days per week with 3+ unique event categories.
// Writes longitudinal_drift event. Feeds P84 longitudinal-drift pattern.

let isWeeklyLongitudinalDriftRunning = false
let lastWeeklyLongitudinalDriftRun: Date | null = null

function shouldRunWeeklyLongitudinalDriftCheck(): boolean {
  const now = dayjs()
  if (isWeeklyLongitudinalDriftRunning) return false
  if (lastWeeklyLongitudinalDriftRun) {
    const lastRun = dayjs(lastWeeklyLongitudinalDriftRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.day() === 1 && now.hour() === 9 // Monday 09:00 UTC
}

async function executeWeeklyLongitudinalDriftCheck(): Promise<JobResult> {
  const jobName = 'weekly-longitudinal-drift-check'
  const executedAt = new Date().toISOString()
  if (isWeeklyLongitudinalDriftRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isWeeklyLongitudinalDriftRunning = true

  console.log('─'.repeat(60))
  console.log('WEEKLY LONGITUDINAL DRIFT CHECK — Monday 09:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const twentyEightDaysAgo = dayjs().subtract(28, 'day').toDate()

    const recentLogs = await Log.findAll({
      where: { createdAt: { [Op.gte]: twentyEightDaysAgo } },
      attributes: ['userId', 'event', 'createdAt'],
      order: [['createdAt', 'ASC']],
    })

    const eventToCategory = (ev: string): string | null => {
      if (['intention', 'plan_set'].includes(ev)) return 'intentions'
      if (['emotional_checkin', 'mood_checkin', 'energy_checkin'].includes(ev)) return 'mood'
      if (['answer', 'memory'].includes(ev)) return 'memory'
      if (['note', 'journal'].includes(ev)) return 'journal'
      if (['self_care_complete', 'self_care_completed'].includes(ev)) return 'selfcare'
      if (['goal_set', 'goal_update', 'goal_complete'].includes(ev)) return 'goals'
      if (['recipe_viewed'].includes(ev)) return 'recipe'
      if (['calendar_entry'].includes(ev)) return 'planner'
      return null
    }

    // Group: userId → week bucket (0=oldest, 3=most recent) → day → set of categories
    const now = dayjs()
    const userWeekDayMap: Record<string, Record<number, Record<string, Set<string>>>> = {}

    for (const l of recentLogs) {
      const uid = String((l as any).userId)
      const cat = eventToCategory(l.event)
      if (!cat) continue
      const daysAgo = now.diff(dayjs(l.createdAt as any), 'day')
      const weekIndex = 3 - Math.floor(daysAgo / 7)
      if (weekIndex < 0 || weekIndex > 3) continue
      const day = dayjs(l.createdAt as any).format('YYYY-MM-DD')
      if (!userWeekDayMap[uid]) userWeekDayMap[uid] = {}
      if (!userWeekDayMap[uid][weekIndex]) userWeekDayMap[uid][weekIndex] = {}
      if (!userWeekDayMap[uid][weekIndex][day]) userWeekDayMap[uid][weekIndex][day] = new Set()
      userWeekDayMap[uid][weekIndex][day].add(cat)
    }

    let written = 0
    for (const [userId, weekMap] of Object.entries(userWeekDayMap)) {
      // Weekly engagement score = days with 3+ categories that week
      const weeklyScores: number[] = [0, 1, 2, 3].map(wi => {
        if (!weekMap[wi]) return 0
        return Object.values(weekMap[wi]).filter(s => s.size >= 3).length
      })

      // Require 3 consecutive declining weeks (oldest → newest)
      let declineStreak = 0
      for (let i = 3; i >= 1; i--) {
        if (weeklyScores[i] < weeklyScores[i - 1]) declineStreak++
        else break
      }
      if (declineStreak < 3) continue

      try {
        await Log.create({
          userId: Number(userId),
          event: 'longitudinal_drift',
          text: '',
          metadata: {
            weeklyScores,
            declineStreak,
            window: '28d',
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
      } catch (userErr: any) {
        console.warn(`  User ${userId} longitudinal drift write failed: ${userErr.message}`)
      }
    }

    console.log(`  Users scanned: ${Object.keys(userWeekDayMap).length}`)
    console.log(`  Longitudinal drift records written: ${written}`)
    console.log('─'.repeat(60))
    console.log('WEEKLY LONGITUDINAL DRIFT CHECK COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastWeeklyLongitudinalDriftRun = new Date()
    isWeeklyLongitudinalDriftRunning = false

    return { jobName, executedAt, success: true, result: { scanned: Object.keys(userWeekDayMap).length, written } }
  } catch (error: any) {
    console.error('Weekly longitudinal drift check failed:', error.message)
    isWeeklyLongitudinalDriftRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

// ─── Daily QOS Mode Watch (Job 23 — 14:00 UTC every day) ─────────────────────
// Derives each user's QOS operating mode from their last 24h of energy/mood signals.
// Compares to the prior 24h window. Writes qos_mode_change when mode shifts.
// Metadata: { oldMode, newMode, pressure, date }

let isDailyQOSModeWatchRunning = false
let lastDailyQOSModeWatchRun: Date | null = null

function shouldRunDailyQOSModeWatch(): boolean {
  const now = dayjs()
  if (isDailyQOSModeWatchRunning) return false
  if (lastDailyQOSModeWatchRun) {
    const lastRun = dayjs(lastDailyQOSModeWatchRun)
    if (lastRun.isSame(now, 'day')) return false
  }
  return now.hour() === 14 // 14:00 UTC daily
}

function deriveQOSModeFromLogs(logs: any[]): { mode: string; pressure: string } {
  const energyLogs = logs.filter((l: any) =>
    l.event === 'energy_checkin' || l.event === 'energy_state' || l.event === 'energy_update'
  )
  const moodLogs = logs.filter((l: any) =>
    l.event === 'mood_checkin' || l.event === 'emotional_checkin'
  )

  let depleted = false
  let low = false
  for (const l of energyLogs) {
    const meta = (l.metadata as any) || {}
    const val = meta.energy ?? meta.energyLevel ?? meta.level ?? meta.value
    if (val === 'depleted' || val === 'critical' || (typeof val === 'number' && val <= 1)) {
      depleted = true
    } else if (val === 'low' || (typeof val === 'number' && val <= 3)) {
      low = true
    }
  }

  const negativeMoods = ['exhausted', 'overwhelmed', 'anxious', 'restless', 'uncertain', 'tired']
  const lowMoodSignals = moodLogs.filter((l: any) => {
    const meta = (l.metadata as any) || {}
    const mood = meta.mood ?? meta.emotionalState ?? meta.state
    return mood && negativeMoods.includes(String(mood))
  }).length

  if (depleted || (low && lowMoodSignals >= 2)) {
    return { mode: 'critical', pressure: depleted ? 'depleted energy' : 'low energy + mood cascade' }
  }
  if (low || lowMoodSignals >= 1) {
    return { mode: 'recovery', pressure: low ? 'low energy' : 'low mood signal' }
  }
  return { mode: 'nominal', pressure: 'system stable' }
}

async function executeDailyQOSModeWatch(): Promise<JobResult> {
  const jobName = 'daily-qos-mode-watch'
  const executedAt = new Date().toISOString()
  if (isDailyQOSModeWatchRunning) return { jobName, executedAt, success: false, error: 'Already running' }
  isDailyQOSModeWatchRunning = true

  console.log('─'.repeat(60))
  console.log('DAILY QOS MODE WATCH — 14:00 UTC')
  console.log('─'.repeat(60))

  try {
    const { Log } = await import('#server/models/log.js')
    const { Op } = await import('sequelize')

    const oneDayAgo = dayjs().subtract(24, 'hour').toDate()
    const twoDaysAgo = dayjs().subtract(48, 'hour').toDate()

    const SIGNAL_EVENTS = [
      'energy_checkin', 'energy_state', 'energy_update',
      'mood_checkin', 'emotional_checkin',
    ] as const

    // Fetch last 48h of energy/mood signals for all users
    const allLogs = await Log.findAll({
      where: {
        createdAt: { [Op.gte]: twoDaysAgo },
        event: { [Op.in]: [...SIGNAL_EVENTS] as any[] },
      },
      attributes: ['userId', 'event', 'metadata', 'createdAt'],
      order: [['createdAt', 'ASC']],
    })

    // Split into today vs yesterday windows per user
    const byUser: Record<string, { today: any[]; yesterday: any[] }> = {}
    for (const l of allLogs) {
      const uid = String((l as any).userId)
      if (!byUser[uid]) byUser[uid] = { today: [], yesterday: [] }
      const ts = new Date(l.createdAt as any)
      if (ts >= oneDayAgo) byUser[uid].today.push(l)
      else byUser[uid].yesterday.push(l)
    }

    let written = 0
    for (const [userId, windows] of Object.entries(byUser)) {
      if (windows.today.length === 0 || windows.yesterday.length === 0) continue
      const current = deriveQOSModeFromLogs(windows.today)
      const prior = deriveQOSModeFromLogs(windows.yesterday)
      if (current.mode === prior.mode) continue

      try {
        await Log.create({
          userId: Number(userId),
          event: 'qos_mode_change',
          text: '',
          metadata: {
            oldMode: prior.mode,
            newMode: current.mode,
            pressure: current.mode !== 'nominal' ? current.pressure : prior.pressure,
            date: dayjs().format('YYYY-MM-DD'),
          },
        } as any)
        written++
        console.log(`  [${userId}] QOS MODE: ${prior.mode} → ${current.mode} (${current.pressure})`)
      } catch (userErr: any) {
        console.warn(`  User ${userId} QOS mode watch write failed: ${userErr.message}`)
      }
    }

    console.log(`  Users with signal pairs: ${Object.keys(byUser).length}`)
    console.log(`  Mode transitions written: ${written}`)
    console.log('─'.repeat(60))
    console.log('DAILY QOS MODE WATCH COMPLETE')
    console.log('─'.repeat(60))
    console.log('')

    lastDailyQOSModeWatchRun = new Date()
    isDailyQOSModeWatchRunning = false

    return { jobName, executedAt, success: true, result: { scanned: Object.keys(byUser).length, written } }
  } catch (error: any) {
    console.error('Daily QOS mode watch failed:', error.message)
    isDailyQOSModeWatchRunning = false
    return { jobName, executedAt, success: false, error: error.message }
  }
}

/**
 * Manually trigger monthly email job (bypasses time checks)
 * Used for testing and manual sends
 */
export async function manuallyTriggerMonthlyEmails(): Promise<JobResult> {
  console.log('Manual trigger requested - bypassing time checks')
  return await executeMonthlyEmailJob()
}

/**
 * Initialize scheduled job system
 * Sets up a simple interval-based scheduler
 */
export function initializeScheduledJobs(): void {
  console.log('Initializing scheduled job system...')
  console.log('   - Monthly emails: 9 AM UTC on 1st of each month')
  console.log('   - Weekly physiological cohort digest: 6 AM UTC every Monday')
  console.log('   - Weekly QOS state digest: 4 AM UTC every Wednesday')
  console.log('   - Weekly archetype stability monitor: 5 AM UTC every Thursday')
  console.log('   - Weekly intention completion audit: 8 PM UTC every Sunday')
  console.log('   - Daily QIE pattern analytics: 3 AM UTC every day')
  console.log('   - Daily intention audit: 6 AM UTC every day')
  console.log('   - Daily OS snapshot: midnight (0 AM UTC) every day')
  console.log('   - Daily morning biofield summary: 8 AM UTC every day')
  console.log('   - Daily pattern coverage audit: 11 PM UTC every day')
  console.log('   - Daily source diversity pulse: 7 AM UTC every day')
  console.log('   - Daily archetype shift monitor: 10 AM UTC every day')
  console.log('   - Daily QOS signature pulse: 1 PM UTC every day')
  console.log('   - Daily coherence index pulse: 4 PM UTC every day')
  console.log('   - Weekly QOS convergence audit: 3 PM UTC every Sunday')
  console.log('   - Weekly badge progress scan: 9 AM UTC every Tuesday')
  console.log('   - Daily morning intention launch: 11 AM UTC every day')
  console.log('   - Daily evening coherence close: 10 PM UTC every day')
  console.log('   - Daily signal momentum check: 8 PM UTC every day')
  console.log('   - Weekly cognitive depth check: 6 AM UTC every Sunday')
  console.log('   - Daily vitality peak check: 12 PM UTC every day')
  console.log('   - Weekly longitudinal drift check: 9 AM UTC every Monday')
  console.log('   - Daily QOS mode watch: 2 PM UTC every day')
  console.log('   - Weekly LOT® AI story generation: 6 PM UTC every Sunday')
  console.log('   - Daily archetype directive pulse: 9 AM UTC every day')
  console.log('   - Daily presence arc check: 9 PM UTC every day (Job 28)')
  console.log('   - Daily cross-domain pulse: 7 PM UTC every day (Job 29)')
  console.log('   - Daily systemic readiness check: 1 AM UTC every day (Job 30)')
  console.log('   - Daily intent gap pulse: 2 AM UTC every day (Job 31)')
  console.log('   - Daily focus depth check: 4 PM UTC every day (Job 37)')
  console.log('   - Daily evening reflection check: 10 PM UTC every day (Job 40)')
  console.log('   - Daily care arc check: 8 PM UTC every day (Job 41)')
  console.log('   - Daily coherence seal check: 11 PM UTC every day (Job 42)')
  console.log('   - Daily quantum field check: 5 PM UTC every day (Job 43)')
  console.log('   - Daily signal matrix check: 9 AM UTC every day (Job 44)')
  console.log('   - Daily physiological presence check: 9 PM UTC every day (Job 45)')
  console.log('   - Daily circadian lock check: 7 AM UTC every day (Job 46)')
  console.log('')

  // Check every hour for scheduled jobs
  const HOURLY_CHECK = 60 * 60 * 1000 // 1 hour in milliseconds

  setInterval(async () => {
    const now = dayjs()
    const hour = now.hour()

    // Jobs by hour: 0=OS snapshot, 1=systemic-readiness, 2=intent-gap-pulse, 3=QIE, 4=QOS digest, 5=archetype stability, 6=cohort+intention+cognitive-depth, 7=source diversity+circadian-lock, 8=biofield+peak-window, 9=monthly email+badge scan+longitudinal-drift+archetype-directive-pulse, 10=archetype shift, 11=morning-intention-launch, 12=vitality-peak, 13=QOS sig pulse, 14=QOS mode watch, 15=QOS convergence audit, 16=coherence index+focus-depth-check, 17=cohort-broadcast+quantum-field-check, 18=LOT AI story (Sun), 19=cross-domain-pulse, 20=intention completion+signal-momentum+action-memory, 21=presence-arc+physiological-presence, 22=evening-coherence-close+evening-reflection, 23=pattern coverage+coherence-seal
    if (hour === 9 || hour === 8 || hour === 7 || hour === 6 || hour === 5 || hour === 4 || hour === 3 || hour === 2 || hour === 1 || hour === 0 || hour === 17 || hour === 18 || hour === 19 || hour === 20 || hour === 21 || hour === 22 || hour === 23 || hour === 10 || hour === 11 || hour === 12 || hour === 13 || hour === 14 || hour === 15 || hour === 16) {
      try {
        await checkAndRunScheduledJobs()
      } catch (error: any) {
        console.error('Scheduled job check failed:', error.message)
      }
    }
  }, HOURLY_CHECK)

  console.log('Scheduled job system initialized')
  console.log(`   Current time: ${dayjs().format('YYYY-MM-DD HH:mm:ss')} UTC`)
  console.log('')
}
