import { FastifyInstance } from 'fastify'
import { sequelize } from '#server/utils/db'
import { models } from '#server/models'
import * as weather from '#server/utils/weather'
import config from '#server/config'
import fs from 'fs'
import path from 'path'

// Read package.json to get version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
)
const VERSION = packageJson.version || '0.0.2'

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

export default async (fastify: FastifyInstance) => {
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

    try {
      // Try to find user by ID or custom URL
      let user = await models.User.findOne({
        where: { id: userIdOrUsername }
      })
      console.log('[PUBLIC-PROFILE-API] User found by ID:', !!user)
      if (user) {
        console.log('[PUBLIC-PROFILE-API] User ID:', user.id)
        console.log('[PUBLIC-PROFILE-API] User metadata:', JSON.stringify(user.metadata, null, 2))
      }

      // If not found by ID, try custom URL in metadata
      if (!user) {
        const users = await models.User.findAll()
        user = users.find(u =>
          u.metadata?.privacy?.customUrl === userIdOrUsername
        ) || null
        console.log('[PUBLIC-PROFILE-API] User found by custom URL:', !!user)
      }

      if (!user) {
        console.log('[PUBLIC-PROFILE-API] ❌ User not found')
        return reply.code(404).send({
          error: 'User not found',
          message: 'No public profile exists for this user'
        })
      }

      // Get privacy settings from metadata (with defaults)
      const privacy: any = user.metadata?.privacy || {
        isPublicProfile: false,
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
        console.log('[PUBLIC-PROFILE-API] ❌ Profile is private')
        return reply.code(403).send({
          error: 'Profile is private',
          message: 'This user has not enabled their public profile',
          debug: {
            userId: user.id,
            hasMetadata: !!user.metadata,
            hasPrivacy: !!user.metadata?.privacy,
            privacySettings: privacy
          }
        })
      }

      console.log('[PUBLIC-PROFILE-API] ✓ Profile is public, building response')

      // Build public profile response
      const profile: any = {
        firstName: user.firstName,
        lastName: user.lastName,
        privacySettings: privacy,
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
            hour: '2-digit',
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
              temperature: w.tempKelvin ? w.tempKelvin - 273.15 : null,
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

      // Add memory story if enabled
      if (privacy.showMemoryStory) {
        try {
          // Get latest memory story from user metadata
          if (user.metadata?.memoryStory) {
            profile.memoryStory = user.metadata.memoryStory
          }
        } catch (error) {
          // Story not available, skip
        }
      }

      return profile
    } catch (error: any) {
      console.error('[PUBLIC-PROFILE-API] ❌ Error:', error)
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
