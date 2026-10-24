/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { FastifyInstance } from 'fastify'
import { Op } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { models } from '#server/models'
import * as weather from '#server/utils/weather'
import { extractUserTraits, determineUserCohort, calculateCorrelatedIndexes } from '#server/utils/memory'
import { generateMemoryStory } from '#server/utils/memory/story-generator'
import { aiEngineManager } from '#server/utils/ai-engines'
import { AI_ENGINE_PREFERENCE } from '#server/utils/memory/constants'
import config from '#server/config'
import { toCelsius } from '#shared/utils'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'

// Read package.json to get version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
)
const VERSION = packageJson.version || '0.0.2'

// Demo account: real profile visit counter (persists in memory, resets on server restart)
let machiavelliProfileVisits = 1469

// Cache status checks for 2 minutes to be cost-effective
let statusCache: any = null
let lastCheck = 0
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

interface SystemCheck {
  name: string
  status: 'ok' | 'error' | 'unknown'
  message?: string
  duration?: number
}

async function checkDatabase(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    await sequelize.authenticate()
    return {
      name: 'Database stack',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Database stack',
      status: 'error',
      message: error?.message || 'Database connection failed',
      duration: Date.now() - start,
    }
  }
}

async function checkWeatherAPI(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Check Weather API
    const data = await weather.getWeather(40.7128, -74.0060)
    if (!data) {
      return {
        name: 'Engine stack',
        status: 'error',
        message: 'Weather API returned no data',
        duration: Date.now() - start,
      }
    }

    // Check React bundle exists
    const reactBundlePath = path.join(process.cwd(), 'dist/client/js/app.js')
    if (!fs.existsSync(reactBundlePath)) {
      return {
        name: 'Engine stack',
        status: 'error',
        message: 'React bundle not found',
        duration: Date.now() - start,
      }
    }

    // Check Node.js version is compatible
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    if (majorVersion < 18) {
      return {
        name: 'Engine stack',
        status: 'error',
        message: `Node.js version ${nodeVersion} is too old (requires 18+)`,
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Engine stack',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Engine stack',
      status: 'error',
      message: error?.message || 'Engine stack check failed',
      duration: Date.now() - start,
    }
  }
}

async function checkAuth(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Check if Session model is available
    await models.Session.findOne()

    // Check Resend API is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        name: 'Authentication engine',
        status: 'error',
        message: 'Resend API key not configured',
        duration: Date.now() - start,
      }
    }

    // Check manifest.webmanifest exists
    const manifestPath = path.join(process.cwd(), 'public/manifest.webmanifest')
    if (!fs.existsSync(manifestPath)) {
      return {
        name: 'Authentication engine',
        status: 'error',
        message: 'Manifest file not found',
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Authentication engine',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Authentication engine',
      status: 'error',
      message: error?.message || 'Auth check failed',
      duration: Date.now() - start,
    }
  }
}

async function checkUsers(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Check if User model is available
    await models.User.findOne()

    // Check if /us page bundle exists (admin page)
    const usPagePath = path.join(process.cwd(), 'dist/client/js/us.js')
    if (!fs.existsSync(usPagePath)) {
      return {
        name: 'Admin',
        status: 'error',
        message: '/us page bundle not found',
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Admin',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Admin',
      status: 'error',
      message: error?.message || 'User check failed',
      duration: Date.now() - start,
    }
  }
}

async function checkSettings(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Check if User model is available (settings are part of User model)
    await models.User.findOne()

    // Check if settings page bundle exists
    const settingsPagePath = path.join(process.cwd(), 'dist/client/js/app.js')
    if (!fs.existsSync(settingsPagePath)) {
      return {
        name: 'Settings',
        status: 'error',
        message: 'Settings page bundle not found',
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Settings',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Settings',
      status: 'error',
      message: error?.message || 'Settings check failed',
      duration: Date.now() - start,
    }
  }
}

async function checkSync(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Check if LiveMessage model is available (used for sync feature)
    await models.LiveMessage.findOne()
    return {
      name: 'Sync',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Sync',
      status: 'error',
      message: error?.message || 'Sync check failed',
      duration: Date.now() - start,
    }
  }
}

async function checkMemory(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Check if Answer model is available (Memory answers/prompts)
    await models.Answer.findOne()

    // Check if Log model is available (logging system)
    await models.Log.findOne()

    // Check if Anthropic API key is configured for Claude-powered Memory
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY || !!config.anthropic?.apiKey
    if (!hasAnthropicKey) {
      return {
        name: 'Memory Engine',
        status: 'error',
        message: 'Claude API key not configured',
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Memory Engine',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Memory Engine',
      status: 'error',
      message: error?.message || 'Memory/Log check failed',
      duration: Date.now() - start,
    }
  }
}

async function checkSystems(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Overall system check - verify config is loaded
    const hasConfig = !!config.appName && !!config.appHost
    if (!hasConfig) {
      return {
        name: 'Systems',
        status: 'error',
        message: 'Configuration not loaded',
        duration: Date.now() - start,
      }
    }

    // Check if node_modules exists (yarn dependencies installed)
    const nodeModulesPath = path.join(process.cwd(), 'node_modules')
    if (!fs.existsSync(nodeModulesPath)) {
      return {
        name: 'Systems',
        status: 'error',
        message: 'Dependencies not installed',
        duration: Date.now() - start,
      }
    }

    // Check if package.json exists
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      return {
        name: 'Systems',
        status: 'error',
        message: 'package.json not found',
        duration: Date.now() - start,
      }
    }

    // Check if build output exists (TypeScript compiled successfully)
    const serverBuildPath = path.join(process.cwd(), 'dist/server/server/index.js')
    if (!fs.existsSync(serverBuildPath)) {
      return {
        name: 'Systems',
        status: 'error',
        message: 'Server build not found',
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Systems',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Systems',
      status: 'error',
      message: error?.message || 'System check failed',
      duration: Date.now() - start,
    }
  }
}

async function performHealthChecks(): Promise<{
  version: string
  timestamp: string
  buildDate: string
  environment: string
  checks: SystemCheck[]
  overall: 'ok' | 'degraded' | 'error'
}> {
  const checks = await Promise.all([
    checkAuth(),
    checkSync(),
    checkSettings(),
    checkUsers(),
    checkSystems(),
    checkWeatherAPI(),
    checkDatabase(),
    checkMemory(),
  ])

  // Determine overall status
  const hasErrors = checks.some((c) => c.status === 'error')
  const overall = hasErrors ? 'error' : 'ok'

  return {
    version: VERSION,
    timestamp: new Date().toISOString(),
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    environment: config.env ? config.env.charAt(0).toUpperCase() + config.env.slice(1) : 'Unknown',
    checks,
    overall,
  }
}

let analyticsCache: any = null
let analyticsLastCheck = 0
const ANALYTICS_CACHE_DURATION = 60 * 1000 // 1 minute

export default async (fastify: FastifyInstance) => {
  fastify.get('/analytics', async (req, reply) => {
    const now = Date.now()
    if (analyticsCache && (now - analyticsLastCheck) < ANALYTICS_CACHE_DURATION) {
      return { ...analyticsCache, cached: true }
    }

    try {
      const totalUsers = await models.User.countJoined()
      const usersOnline = await models.User.countOnline()

      const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate()
      const sevenDaysAgo = dayjs().subtract(7, 'day').toDate()

      const [activeUsers30d, activeUsers7d, totalLogs, recentLogs, sessionRows, distinctEventTypes] = await Promise.all([
        models.User.count({ where: { lastSeenAt: { [Op.gte]: thirtyDaysAgo } } }),
        models.User.count({ where: { lastSeenAt: { [Op.gte]: sevenDaysAgo } } }),
        models.Log.count(),
        models.Log.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
        models.Session.findAll({
          attributes: ['userId', 'createdAt', 'lastUsedAt'],
          where: { lastUsedAt: { [Op.not]: null } },
          order: [['createdAt', 'DESC']],
          limit: 500,
          raw: true,
        }) as Promise<Array<{ userId: string; createdAt: Date; lastUsedAt: Date | null }>>,
        models.Log.findAll({
          attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('event'))), 'count']],
          where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
          raw: true,
        }),
      ])

      const returnRate = totalUsers > 0
        ? Math.round((activeUsers30d / totalUsers) * 100)
        : 0

      const avgLogsPerUser = totalUsers > 0
        ? Math.round(totalLogs / totalUsers)
        : 0

      const avgDailyLogs = activeUsers7d > 0
        ? Math.round((recentLogs / 7) / activeUsers7d * 10) / 10
        : 0

      let avgSessionMinutes = 0
      if (sessionRows.length > 0) {
        const durations = sessionRows
          .map(s => {
            const start = new Date(s.createdAt).getTime()
            const end = new Date(s.lastUsedAt!).getTime()
            return (end - start) / 60000
          })
          .filter(d => d > 0 && d < 480)
        if (durations.length > 0) {
          avgSessionMinutes = Math.round(
            (durations.reduce((a, b) => a + b, 0) / durations.length) * 10
          ) / 10
        }
      }

      const featuresBreadth = (distinctEventTypes[0] as any)?.count || 0

      // Batch streak calculation: single query for recent answers across active users
      const recentUsers = await models.User.findAll({
        attributes: ['id'],
        where: { lastSeenAt: { [Op.gte]: thirtyDaysAgo } },
        limit: 50,
        order: [['lastSeenAt', 'DESC']],
        raw: true,
      })
      const recentUserIds = recentUsers.map((u: any) => u.id)
      const allAnswers = recentUserIds.length > 0 ? await models.Answer.findAll({
        where: { userId: { [Op.in]: recentUserIds } },
        attributes: ['userId', 'createdAt'],
        order: [['createdAt', 'DESC']],
        raw: true,
      }) : []
      const answersByUser = new Map<string, string[]>()
      for (const a of allAnswers as any[]) {
        const day = dayjs(a.createdAt).format('YYYY-MM-DD')
        const list = answersByUser.get(a.userId) || []
        list.push(day)
        answersByUser.set(a.userId, list)
      }
      const streaks: number[] = []
      for (const [, days] of answersByUser) {
        const daySet = new Set(days)
        let streak = 0
        let d = dayjs()
        if (!daySet.has(d.format('YYYY-MM-DD'))) d = d.subtract(1, 'day')
        while (daySet.has(d.format('YYYY-MM-DD'))) {
          streak++
          d = d.subtract(1, 'day')
        }
        if (streak > 0) streaks.push(streak)
      }

      const avgStreak = streaks.length > 0
        ? Math.round((streaks.reduce((a, b) => a + b, 0) / streaks.length) * 10) / 10
        : 0

      const result = {
        timestamp: new Date().toISOString(),
        traffic: {
          totalUsers,
          usersOnline,
          activeUsers7d,
          activeUsers30d,
        },
        benchmarks: {
          avgSessionMinutes,
          avgDailyLogs,
          avgLogsPerUser,
          returnRate,
          avgStreakDays: avgStreak,
          featuresBreadth: Number(featuresBreadth),
        },
      }

      analyticsCache = result
      analyticsLastCheck = now
      return result
    } catch (error: any) {
      console.error('[PUBLIC-ANALYTICS] Error:', error.message)
      return reply.code(500).send({ error: 'Analytics unavailable' })
    }
  })

  // Public status endpoint - no authentication required
  // Cached for 2 minutes to be cost-effective with Digital Ocean
  fastify.get('/status', async (req, reply) => {
    const now = Date.now()

    // Return cached status if available and fresh
    if (statusCache && (now - lastCheck) < CACHE_DURATION) {
      return {
        ...statusCache,
        cached: true,
        cacheAge: Math.floor((now - lastCheck) / 1000),
      }
    }

    // Perform fresh health checks
    const status = await performHealthChecks()

    // Update cache
    statusCache = status
    lastCheck = now

    return {
      ...status,
      cached: false,
    }
  })

  // Admin configuration diagnostic endpoint
  fastify.get('/verify-admin-config', async (req, reply) => {
    const adminEmailsEnv = process.env.ADMIN_EMAILS
    const adminsList = config.admins

    return {
      timestamp: new Date().toISOString(),
      environment: config.env,
      adminConfig: {
        ADMIN_EMAILS_env_var: adminEmailsEnv || 'NOT_SET',
        parsed_admin_emails: adminsList.length > 0 ? adminsList : ['NONE'],
        admin_count: adminsList.length,
        includes_vadikmarmeladov: adminsList.includes('vadikmarmeladov@gmail.com'),
      },
      instructions: {
        step1: 'Ensure ADMIN_EMAILS is set in Digital Ocean environment variables',
        step2: 'Value should be: vadikmarmeladov@gmail.com',
        step3: 'Redeploy app after adding environment variable',
        step4: 'Log out and log back in to refresh session',
      },
      note: 'This endpoint shows how ADMIN_EMAILS is configured. Admin access is granted if user email is in this list OR has Admin tag in database.',
    }
  })

  // API key verification endpoint - shows masked API key for verification
  fastify.get('/verify-api-keys', async (req, reply) => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY || config.anthropic?.apiKey
    const resendKey = process.env.RESEND_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    const maskKey = (key: string | undefined) => {
      if (!key) return 'NOT_SET'
      if (key.length < 20) return 'INVALID_LENGTH'
      // Show first 8 and last 4 characters
      return `${key.slice(0, 8)}...${key.slice(-4)}`
    }

    return {
      timestamp: new Date().toISOString(),
      environment: config.env,
      keys: {
        anthropic: {
          configured: !!anthropicKey,
          preview: maskKey(anthropicKey),
          length: anthropicKey?.length || 0,
        },
        resend: {
          configured: !!resendKey,
          preview: maskKey(resendKey),
          length: resendKey?.length || 0,
        },
        openai: {
          configured: !!openaiKey,
          preview: maskKey(openaiKey),
          length: openaiKey?.length || 0,
        },
      },
      note: 'Keys are masked for security. Only first 8 and last 4 characters shown.',
    }
  })

  // Memory Engine diagnostic endpoint - shows why Claude might not be working
  fastify.get('/debug-memory-engine', async (req, reply) => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY || config.anthropic?.apiKey

    // Test if we can initialize Anthropic client
    let anthropicClientTest = 'NOT_TESTED'
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const testClient = new Anthropic({ apiKey: anthropicKey })
      anthropicClientTest = 'INITIALIZED_OK'
    } catch (err: any) {
      anthropicClientTest = `FAILED: ${err.message}`
    }

    return {
      timestamp: new Date().toISOString(),
      environment: config.env,
      diagnosis: {
        anthropicApiKey: {
          exists: !!anthropicKey,
          fromEnv: !!process.env.ANTHROPIC_API_KEY,
          fromConfig: !!config.anthropic?.apiKey,
          preview: anthropicKey ? `${anthropicKey.slice(0, 8)}...${anthropicKey.slice(-4)}` : 'NOT_SET',
          length: anthropicKey?.length || 0,
        },
        anthropicClient: {
          status: anthropicClientTest,
        },
        userTagCheck: {
          requiredTag: 'Usership',
          note: 'Users need the "Usership" tag (case-insensitive) to use Claude engine',
        },
        memoryEngineLogic: {
          condition: 'hasUsershipTag && config.anthropic.apiKey',
          result: !!anthropicKey ? 'WILL_USE_CLAUDE_IF_USER_HAS_TAG' : 'WILL_USE_STANDARD_ONLY',
        },
      },
      troubleshooting: {
        step1: 'Check if ANTHROPIC_API_KEY environment variable is set in Digital Ocean',
        step2: 'Verify your user has the "Usership" tag in the database',
        step3: 'Check server logs for "Memory question generation failed" errors',
        step4: 'Test Claude API key at https://console.anthropic.com/',
      },
    }
  })

  // Test all AI engines to see which are available
  fastify.get('/test-ai-engines', async (req, reply) => {
    const { aiEngineManager } = await import('#server/utils/ai-engines.js')

    const status = aiEngineManager.getStatus()
    const hasAnyEngine = aiEngineManager.hasAvailableEngine()

    // Try to get the preferred engine
    let preferredEngine = null
    let preferredEngineError = null
    try {
      const engine = aiEngineManager.getEngine('auto')
      preferredEngine = engine.name
    } catch (error: any) {
      preferredEngineError = error.message
    }

    return {
      timestamp: new Date().toISOString(),
      environment: config.env,
      engines: status,
      summary: {
        hasAvailableEngine: hasAnyEngine,
        preferredEngine: preferredEngine,
        error: preferredEngineError,
      },
      apiKeys: {
        TOGETHER_API_KEY: !!process.env.TOGETHER_API_KEY,
        GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
        MISTRAL_API_KEY: !!process.env.MISTRAL_API_KEY,
        ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      },
      instructions: {
        step1: 'At least ONE API key must be configured in environment variables',
        step2: 'Get API keys from: Together AI, Google AI Studio, Mistral, Anthropic, or OpenAI',
        step3: 'Add the key to Digital Ocean App settings (Environment Variables)',
        step4: 'Redeploy the app to load the new environment variable',
      },
      links: {
        togetherAI: 'https://api.together.xyz/',
        googleGemini: 'https://aistudio.google.com/app/apikey',
        mistralAI: 'https://console.mistral.ai/',
        anthropic: 'https://console.anthropic.com/settings/keys',
        openAI: 'https://platform.openai.com/api-keys',
      }
    }
  })

  // Test Anthropic API key with actual API call
  fastify.get('/test-anthropic-key', async (req, reply) => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY || config.anthropic?.apiKey

    if (!anthropicKey) {
      return {
        success: false,
        error: 'ANTHROPIC_API_KEY not configured',
        timestamp: new Date().toISOString(),
      }
    }

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey: anthropicKey })

      // Make a minimal API call to test the key
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Respond with just "OK"',
          },
        ],
      })

      return {
        success: true,
        message: 'API key is valid and working',
        response: message.content[0].type === 'text' ? message.content[0].text : 'OK',
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
        timestamp: new Date().toISOString(),
        note: 'This test consumed a small number of tokens. Check Anthropic dashboard for usage update.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorType: error.constructor.name,
        status: error.status,
        timestamp: new Date().toISOString(),
      }
    }
  })

  // Public profile endpoint - no authentication required
  fastify.get<{
    Params: { userIdOrUsername: string }
  }>('/profile/:userIdOrUsername', async (req, reply) => {
    const { userIdOrUsername } = req.params
    console.log('[PUBLIC-PROFILE-API] Fetching profile for:', userIdOrUsername)

    // Demo account: Niccolò Machiavelli — autonomous hardcoded LOT account
    // Legacy level unlock showcase with weather station and wallet demos
    if (userIdOrUsername === 'machiavelli') {
      console.log('[PUBLIC-PROFILE-API] Serving demo account: Machiavelli')

      // Compute real user counts so the demo board profile stays accurate
      let totalUsers = 1
      let usershipCount = 1
      try {
        totalUsers = (await models.User.count()) + 1
        const usCount = await models.User.count({
          where: sequelize.literal(`tags::jsonb @> '"usership"'::jsonb OR tags::jsonb @> '"Usership"'::jsonb`),
        })
        usershipCount = usCount + 1
      } catch (e) {
        console.error('[PUBLIC-PROFILE-API] Demo user count query failed:', e)
      }
      const freeCitizens = Math.max(0, totalUsers - usershipCount)
      const poweringCitizens = usershipCount > 0 ? Math.round(freeCitizens / usershipCount) : 0

      // Simulate Florence weather with slight seasonal variation
      const now = new Date()
      const month = now.getMonth()
      const hour = now.getHours()
      // Florence seasonal temperature ranges (°C)
      const seasonalBase = [5, 7, 10, 14, 18, 23, 26, 25, 21, 16, 10, 6][month]
      const diurnalShift = Math.sin((hour - 6) * Math.PI / 12) * 4
      const demoTemp = Math.round((seasonalBase + diurnalShift) * 10) / 10
      const demoHumidity = Math.round(55 + Math.sin(month * Math.PI / 6) * 15)
      const demoPressure = Math.round(1013 + Math.sin(hour * Math.PI / 12) * 5)

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
      const conditions = ['Clear sky', 'Few clouds', 'Scattered clouds', 'Light rain', 'Sunny']

      return {
        firstName: 'Niccolò',
        lastName: 'Machiavelli',
        city: 'Florence',
        country: 'ITA',
        isDemo: true,
        privacySettings: {
          isPublicProfile: true,
          showWeather: true,
          showLocalTime: true,
          showCity: true,
          showSound: true,
          showMemoryStory: true,
        },
        tags: ['RND', 'Usership', 'Legacy'],
        profileVisits: ++machiavelliProfileVisits,
        localTime: now.toLocaleString('en-US', {
          timeZone: 'Europe/Rome',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        weather: {
          temperature: demoTemp,
          humidity: demoHumidity,
          description: conditions[now.getDay() % conditions.length],
          windSpeed: Math.round((3 + Math.sin(hour) * 2) * 10) / 10,
          pressure: demoPressure,
          sunrise: Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30).getTime() / 1000),
          sunset: Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 45).getTime() / 1000),
        },
        soundDescription: 'Renaissance courtyard — distant church bells, fountain water, quill on parchment',
        memoryStory: 'The art of governance is the art of understanding human nature. Every morning in the Palazzo Vecchio, I observe the citizens below — their patterns of movement, their exchanges, their quiet rebellions. The weather shapes their temperament: rain brings introspection, sun brings ambition. A prince must read both the skies and the souls beneath them.',
        theme: {
          theme: 'dark',
          baseColor: null,
          accentColor: null,
          customThemeEnabled: false,
        },
        psychologicalProfile: {
          hasUsership: true,
          version: '531',
          archetype: 'The Strategist',
          archetypeDescription: 'Sees through surface appearances to underlying power dynamics. Combines pragmatic observation with philosophical depth.',
          coreValues: ['virtù', 'prudence', 'adaptability', 'fortune', 'statecraft'],
          emotionalPatterns: ['calculated restraint', 'strategic patience', 'controlled intensity'],
          selfAwarenessLevel: 87,
          streak: 1469,
          behavioralCohort: 'Renaissance Polymaths',
          behavioralTraits: ['analytical observation', 'historical pattern recognition', 'diplomatic flexibility'],
          patternStrengthIndex: 2847,
          patternStrength: [
            { trait: 'Strategic thinking', count: 842 },
            { trait: 'Historical analysis', count: 631 },
            { trait: 'Human observation', count: 574 },
            { trait: 'Political philosophy', count: 489 },
            { trait: 'Practical wisdom', count: 311 },
          ],
          answerCount: 2847,
          noteCount: 1469,
        },
        correlatedIndexes: {
          selfAwareness: 87,
          userScore: 94.2,
          personScore: 91.7,
          longevityScore: 96.8,
          composite: 92.4,
          timeline: [],
          trend: 'ascending' as const,
          correlationStrength: 0.89,
        },
        // Legacy level unlock: Weather Station
        weatherStation: {
          location: 'Florence, Tuscany — Palazzo Vecchio Observatory',
          readings: {
            temperature: demoTemp,
            humidity: demoHumidity,
            pressure: demoPressure,
            windSpeed: Math.round((3 + Math.sin(hour) * 2) * 10) / 10,
            windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(hour / 3) % 8],
            uvIndex: Math.max(0, Math.round(Math.sin((hour - 6) * Math.PI / 12) * 8)),
            visibility: Math.round(10 + Math.random() * 5),
            dewPoint: Math.round(demoTemp - (100 - demoHumidity) / 5),
          },
          forecast: dayNames.map((day, i) => ({
            day,
            high: Math.round(seasonalBase + 3 + Math.sin(i) * 2),
            low: Math.round(seasonalBase - 4 + Math.cos(i) * 2),
            condition: conditions[i % conditions.length],
          })),
          lastUpdated: now.toISOString(),
        },
        // Legacy level unlock: Wallet
        wallet: {
          address: 'LOT-MACH-1469-FLOR',
          balance: 14690.27,
          currency: 'LOT',
          transactions: [
            { id: 'tx-001', type: 'credit' as const, amount: 500.00, description: 'Usership stipend — March', date: '2026-03-01' },
            { id: 'tx-002', type: 'debit' as const, amount: 99.00, description: 'Usership subscription', date: '2026-03-01' },
            { id: 'tx-003', type: 'credit' as const, amount: 150.00, description: 'Pattern recognition bonus', date: '2026-02-28' },
            { id: 'tx-004', type: 'credit' as const, amount: 75.00, description: 'Community contribution reward', date: '2026-02-15' },
            { id: 'tx-005', type: 'debit' as const, amount: 25.00, description: 'Weather station uplink fee', date: '2026-02-01' },
          ],
          loyaltyPoints: 28470,
        },
        // Board profile for Citizen Index display
        boardProfile: {
          boardMemberNumber: 0, // Demo account — honorary member
          citizenSince: 'June 1469',
          poweringCitizens,
          boardTenureMonths: Math.round((now.getTime() - new Date('1469-06-03').getTime()) / (1000 * 60 * 60 * 24 * 30)),
          totalInvested: 14690,
          biofieldState: {
            energy: 'high',
            clarity: 'focused',
            alignment: 'purposeful',
          },
          activity: {
            memoriesCompiled: 2847,
            journalEntries: 1469,
            activeDays: 842,
          },
          memoryEngine: 'AI-Powered',
          clearanceLevel: 'Full',
          totalEntries: 4316,
        },
      }
    }

    try {
      // Prioritize custom URL over ID to avoid conflicts
      // First, try to find user by custom URL in metadata
      console.log('[PUBLIC-PROFILE-API] Searching for custom URL:', userIdOrUsername)
      let user = await models.User.findOne({
        where: sequelize.where(
          sequelize.fn('jsonb_extract_path_text', sequelize.col('metadata'), 'privacy', 'customUrl'),
          userIdOrUsername
        )
      }) as any

      if (user) {
        console.log('[PUBLIC-PROFILE-API] ✓ User found by custom URL')
        console.log('[PUBLIC-PROFILE-API] User ID:', user.id)
      }

      // If not found by custom URL, try by user ID
      if (!user) {
        console.log('[PUBLIC-PROFILE-API] Custom URL not found, trying by ID')
        user = await models.User.findOne({
          where: { id: userIdOrUsername }
        })
        if (user) {
          console.log('[PUBLIC-PROFILE-API] ✓ User found by ID:', user.id)
        }
      }

      if (!user) {
        console.log('[PUBLIC-PROFILE-API] User not found for:', userIdOrUsername)
        return reply.code(404).send({
          error: 'User not found',
          message: `No public profile exists for user: ${userIdOrUsername}`,
          debug: {
            searchedFor: userIdOrUsername,
            searchMethods: ['By ID', 'By custom URL in metadata']
          }
        })
      }

      console.log('[PUBLIC-PROFILE-API] ✓ User found!')
      console.log('[PUBLIC-PROFILE-API] User details:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        hasMetadata: !!user.metadata,
        metadata: user.metadata
      })

      // Get privacy settings from metadata (with defaults)
      // All profiles are public by default
      const privacy: any = user.metadata?.privacy || {
        isPublicProfile: true,
        showWeather: true,
        showLocalTime: true,
        showCity: true,
        showSound: true,
        showMemoryStory: true,
      }
      console.log('[PUBLIC-PROFILE-API] Privacy settings:', JSON.stringify(privacy, null, 2))
      console.log('[PUBLIC-PROFILE-API] isPublicProfile:', privacy.isPublicProfile)

      // Check if profile is public
      if (!privacy.isPublicProfile) {
        console.log('[PUBLIC-PROFILE-API] Profile is private')

        // Even in private mode, return basic info with suspended tag
        const basicProfile = {
          firstName: user.firstName,
          lastName: user.lastName,
          tags: user.tags || [],
          isPrivate: true,
          privacySettings: privacy
        }

        return basicProfile
      }

      console.log('[PUBLIC-PROFILE-API] ✓ Profile is public, building response')

      // Increment profile visit counter
      const currentVisits = user.metadata?.profileVisits || 0
      const newVisits = currentVisits + 1
      await models.User.update(
        {
          metadata: {
            ...user.metadata,
            profileVisits: newVisits
          }
        },
        { where: { id: user.id } }
      )

      // Build public profile response
      const profile: any = {
        firstName: user.firstName,
        lastName: user.lastName,
        privacySettings: privacy,
        tags: user.tags || [], // Add user tags
        profileVisits: newVisits, // Add visit count
      }

      // Add city/country if enabled
      if (privacy.showCity) {
        profile.city = user.city
        profile.country = user.country
      }

      // Add local time if enabled
      if (privacy.showLocalTime && user.city) {
        try {
          const now = new Date()
          profile.localTime = now.toLocaleString('en-US', {
            timeZone: user.timeZone || 'UTC',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        } catch (error) {
          // Timezone not found, skip
        }
      }

      // Add weather if enabled
      if (privacy.showWeather && user.city) {
        try {
          // Get latest weather for user's location
          const weatherResponse = await models.WeatherResponse.findOne({
            where: {
              city: user.city,
              country: user.country || '',
            },
            order: [['createdAt', 'DESC']],
          })

          if (weatherResponse && weatherResponse.weather) {
            const w = weatherResponse.weather as any
            profile.weather = {
              temperature: w.tempKelvin ? toCelsius(w.tempKelvin) : null,
              humidity: w.humidity,
              description: w.description,
              windSpeed: w.windSpeed,
              pressure: w.pressure,
              sunrise: w.sunrise,
              sunset: w.sunset,
            }
          }
        } catch (error) {
          // Weather not available, skip
        }
      }

      // Add sound description if enabled (this would need to be stored in user metadata)
      if (privacy.showSound && user.metadata?.currentSound) {
        profile.soundDescription = user.metadata.currentSound
      }

      // Add memory story if enabled (only for Usership users)
      const hasUsershipTag = user.tags?.some((tag: string) => tag.toLowerCase() === 'usership')
      if (privacy.showMemoryStory && hasUsershipTag) {
        try {
          const meta = user.metadata as any || {}
          if (meta.lastMemoryStory) {
            profile.memoryStory = meta.lastMemoryStory
          } else {
            const answerLogs = await models.Log.findAll({
              where: { userId: user.id, event: 'answer' },
              order: [['createdAt', 'DESC']],
              limit: 30,
            })
            if (answerLogs.length >= 3) {
              const story = await generateMemoryStory(user, answerLogs)
              profile.memoryStory = story
              await models.User.update(
                { metadata: { ...meta, lastMemoryStory: story, lastMemoryStoryDate: new Date().toISOString(), memoryStoryVersion: (meta.memoryStoryVersion || 0) + 1, memoryStoryAnswerCount: answerLogs.length } },
                { where: { id: user.id } }
              )
            }
          }
        } catch (error: any) {
          console.error('[PUBLIC-PROFILE-API] Memory story generation failed:', error.message)
        }
      }

      // Add psychological profile (for Usership users)
      if (hasUsershipTag) {
        try {
          // Get answer logs for psychological analysis
          const logs = await models.Log.findAll({
            where: {
              userId: user.id,
              event: 'answer',
            },
            order: [['createdAt', 'DESC']],
            limit: 30,
          })

          // Get note/journal entry count separately
          const noteCount = await models.Log.count({
            where: {
              userId: user.id,
              event: 'note',
            },
          })

          // Calculate streak (consecutive days with answers)
          let streak = 0
          try {
            const answers = await models.Answer.findAll({
              where: { userId: user.id },
              order: [['createdAt', 'DESC']],
              attributes: ['createdAt'],
              limit: 365,
            })

            if (answers.length > 0) {
              const today = dayjs().startOf('day')
              let currentDate = today
              const answerDays = new Set(
                answers.map(a => dayjs(a.createdAt).startOf('day').format('YYYY-MM-DD'))
              )

              // Check consecutive days backwards from today or yesterday
              if (!answerDays.has(today.format('YYYY-MM-DD'))) {
                currentDate = today.subtract(1, 'day')
              }

              while (answerDays.has(currentDate.format('YYYY-MM-DD'))) {
                streak++
                currentDate = currentDate.subtract(1, 'day')
              }
            }
          } catch (streakError) {
            console.warn('[PUBLIC-PROFILE-API] Streak calculation failed:', streakError)
          }

          if (logs.length === 0) {
            profile.psychologicalProfile = {
              hasUsership: true,
              message: 'Complete Memory questions to generate profile',
              answerCount: 0,
              noteCount: noteCount,
              streak: streak
            }
          } else {
            // Extract traits and determine psychological archetype + behavioral cohort
            const analysis = extractUserTraits(logs)
            const { traits, patterns, psychologicalDepth } = analysis
            const cohortResult = determineUserCohort(traits, patterns, psychologicalDepth)

            // Calculate OS version (months since user joined)
            const monthsSinceJoined = dayjs().diff(dayjs(user.createdAt), 'month')
            const osVersion = String(monthsSinceJoined).padStart(3, '0')

            // Calculate Pattern Strength Index with engagement weighting
            const totalPatternMatches = Object.values(patterns).reduce((sum, count) => sum + count, 0)
            const daysSinceJoined = dayjs().diff(dayjs(user.createdAt), 'day')
            const engagementFactor = Math.min(1.5, Math.max(0.5, daysSinceJoined / 30))
            const patternStrengthIndex = Math.round(totalPatternMatches * engagementFactor)

            // Helper to format camelCase to Title Case
            const formatTrait = (str: string): string => {
              const formatted = str.replace(/([A-Z])/g, ' $1').trim()
              return formatted.charAt(0).toUpperCase() + formatted.slice(1)
            }

            profile.psychologicalProfile = {
              hasUsership: true,
              version: osVersion,
              // Psychological depth (soul level)
              archetype: cohortResult.archetype,
              archetypeDescription: cohortResult.description,
              coreValues: psychologicalDepth.values.map((v: string) => v.toLowerCase()),
              emotionalPatterns: psychologicalDepth.emotionalPatterns.map((p: string) => formatTrait(p).toLowerCase()),
              selfAwarenessLevel: psychologicalDepth.selfAwareness,
              // Level badge (Aquatic Evolution)
              streak: streak,
              // Behavioral patterns (surface level)
              behavioralCohort: cohortResult.behavioralCohort,
              behavioralTraits: traits.map((t: string) => formatTrait(t).toLowerCase()),
              patternStrengthIndex: patternStrengthIndex,
              patternStrength: Object.entries(patterns)
                .filter(([_, v]) => v > 0)
                .map(([k, v]) => ({ trait: formatTrait(k), count: v as number }))
                .sort((a, b) => b.count - a.count),
              // Meta
              answerCount: logs.length,
              noteCount: noteCount
            }

            // Correlated indexes — four-dimensional long-term tracking
            const daysSinceJoinedForIndexes = dayjs().diff(dayjs(user.createdAt), 'day')
            profile.correlatedIndexes = {
              ...calculateCorrelatedIndexes(logs, {
                daysSinceStart: daysSinceJoinedForIndexes,
                streak,
                answerCount: logs.length,
                logCount: logs.length + noteCount,
              }),
              timeline: [],
              trend: 'stable' as const,
              correlationStrength: 0,
            }

            // Calculate correlation strength for public display
            const idxScores = [
              profile.correlatedIndexes.selfAwareness,
              profile.correlatedIndexes.userScore,
              profile.correlatedIndexes.personScore,
              profile.correlatedIndexes.longevityScore,
            ]
            const idxMean = idxScores.reduce((s, v) => s + v, 0) / 4
            const idxVariance = idxScores.reduce((s, v) => s + Math.pow(v - idxMean, 2), 0) / 4
            const idxCv = idxMean > 0 ? Math.sqrt(idxVariance) / idxMean : 1
            profile.correlatedIndexes.correlationStrength = Number(Math.max(0, Math.min(1, 1 - idxCv)).toFixed(2))
          }
        } catch (error) {
          console.error('[PUBLIC-PROFILE-API] Error generating psychological profile:', error)
          // Profile generation failed, set basic response
          profile.psychologicalProfile = {
            hasUsership: true,
            message: 'Profile temporarily unavailable'
          }
        }
      } else {
        // Non-Usership users don't get psychological profiles
        profile.psychologicalProfile = {
          hasUsership: false,
          message: 'Subscribe to Usership to unlock profile analysis'
        }
      }

      // Add board profile for Usership members
      if (hasUsershipTag) {
        try {
          // Board member number: sequential ordering by joinedAt among Usership users
          const allUsership = await models.User.findAll({
            where: sequelize.literal(`tags::jsonb @> '"usership"'::jsonb OR tags::jsonb @> '"Usership"'::jsonb`),
            attributes: ['id', 'joinedAt', 'createdAt'],
            order: [['createdAt', 'ASC']],
          })
          const boardMemberNumber = allUsership.findIndex(u => u.id === user.id) + 1
          const totalUsers = await models.User.count()
          const usershipCount = allUsership.length
          const freeCitizens = Math.max(0, totalUsers - usershipCount)
          const poweringCitizens = usershipCount > 0 ? Math.round(freeCitizens / usershipCount) : 0

          // Tenure and investment
          const joinDate = user.joinedAt || user.createdAt
          const boardTenureMonths = dayjs().diff(dayjs(joinDate), 'month')
          const totalInvested = Math.max(1, boardTenureMonths) * 99

          // Biofield state from quantum intent metadata
          const meta = user.metadata as any
          const quantumState = meta?.quantumIntentState
          const biofieldState = quantumState?.energy && quantumState.energy !== 'unknown' ? {
            energy: quantumState.energy,
            clarity: quantumState.clarity || 'balanced',
            alignment: quantumState.alignment || 'searching',
          } : undefined

          // Activity stats
          const totalLogs = await models.Log.count({ where: { userId: user.id } })
          const answerCount = await models.Log.count({ where: { userId: user.id, event: 'answer' } })
          const noteCount = await models.Log.count({ where: { userId: user.id, event: 'note' } })
          const [activeDaysResult] = await sequelize.query(
            `SELECT COUNT(DISTINCT DATE("createdAt")) as count FROM "Logs" WHERE "userId" = :userId`,
            { replacements: { userId: user.id }, type: 'SELECT' as any }
          ) as any[]
          const activeDays = activeDaysResult?.count ? Number(activeDaysResult.count) : 0

          // Memory engine name
          let memoryEngineName = 'Standard'
          try {
            aiEngineManager.getEngine(AI_ENGINE_PREFERENCE)
            memoryEngineName = 'AI-Powered'
          } catch {
            memoryEngineName = 'AI-Powered'
          }

          profile.boardProfile = {
            boardMemberNumber,
            citizenSince: dayjs(joinDate).format('MMMM YYYY'),
            poweringCitizens,
            boardTenureMonths,
            totalInvested,
            biofieldState,
            activity: {
              memoriesCompiled: answerCount,
              journalEntries: noteCount,
              activeDays,
            },
            memoryEngine: memoryEngineName,
            clearanceLevel: 'Full',
            totalEntries: totalLogs,
          }
        } catch (boardError: any) {
          console.error('[PUBLIC-PROFILE-API] Board profile error:', boardError.message)
        }
      }

      // Compute assembly phase from server-side engagement data
      try {
        const distinctEvents = await models.Log.findAll({
          attributes: [[sequelize.fn('DISTINCT', sequelize.col('event')), 'event']],
          where: { userId: user.id },
          raw: true,
        })
        const eventTypeCount = distinctEvents.length
        const totalLogs = await models.Log.count({ where: { userId: user.id } })
        const [activeDaysRow] = await sequelize.query(
          `SELECT COUNT(DISTINCT DATE("createdAt")) as count FROM "Logs" WHERE "userId" = :userId`,
          { replacements: { userId: user.id }, type: 'SELECT' as any }
        ) as any[]
        const activeDays = activeDaysRow?.count ? Number(activeDaysRow.count) : 0

        let assemblyPhase: 'dormant' | 'awakening' | 'forming' | 'assembled' | 'integrated' = 'dormant'
        if (totalLogs === 0) {
          assemblyPhase = 'dormant'
        } else if (eventTypeCount >= 8 && totalLogs >= 150 && activeDays >= 30) {
          assemblyPhase = 'integrated'
        } else if (eventTypeCount >= 5 && totalLogs >= 50 && activeDays >= 14) {
          assemblyPhase = 'assembled'
        } else if (eventTypeCount >= 3 && totalLogs >= 10 && activeDays >= 3) {
          assemblyPhase = 'forming'
        } else {
          assemblyPhase = 'awakening'
        }

        profile.assemblyPhase = assemblyPhase
      } catch (asmError: any) {
        console.error('[PUBLIC-PROFILE-API] Assembly phase error:', asmError.message)
      }

      // Add theme settings if available
      if (user.metadata?.theme) {
        profile.theme = user.metadata.theme
      }

      return profile
    } catch (error: any) {
      console.error('[PUBLIC-PROFILE-API] Error:', error)
      console.error('[PUBLIC-PROFILE-API] Error stack:', error.stack)
      return reply.code(500).send({
        error: 'Internal server error',
        message: error.message || 'Failed to fetch public profile',
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message,
        }
      })
    }
  })
}
