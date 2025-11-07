import { FastifyInstance } from 'fastify'
import { sequelize } from '#server/utils/db'
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
      name: 'Database stack check',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Database stack check',
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
        name: 'Engine stack check',
        status: 'error',
        message: 'Weather API returned no data',
        duration: Date.now() - start,
      }
    }

    // Check React bundle exists
    const reactBundlePath = path.join(process.cwd(), 'dist/client/js/app.js')
    if (!fs.existsSync(reactBundlePath)) {
      return {
        name: 'Engine stack check',
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
        name: 'Engine stack check',
        status: 'error',
        message: `Node.js version ${nodeVersion} is too old (requires 18+)`,
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Engine stack check',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Engine stack check',
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
    await sequelize.models.Session.findOne()

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
    await sequelize.models.User.findOne()

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
    // Check if UserSettings model is available
    await sequelize.models.UserSettings.findOne()
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
    // Check if CategoryEntry model is available
    await sequelize.models.CategoryEntry.findOne()
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
    // Check if Memory model is available (prompt system)
    await sequelize.models.Memory.findOne()

    // Check if Log model is available (logging system)
    await sequelize.models.Log.findOne()

    return {
      name: 'Memory Engine check',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Memory Engine check',
      status: 'error',
      message: error?.message || 'Memory/Log check failed',
      duration: Date.now() - start,
    }
  }
}

async function checkStoryAI(): Promise<SystemCheck> {
  const start = Date.now()
  try {
    // Check if ANTHROPIC_API_KEY (Claude API) is configured for Usership users
    const hasKey = !!process.env.ANTHROPIC_API_KEY || !!config.anthropic?.apiKey
    if (!hasKey) {
      return {
        name: 'Story AI stack check',
        status: 'error',
        message: 'Claude API key not configured',
        duration: Date.now() - start,
      }
    }

    // Check if UserMemory model is available (for Usership tagged users)
    await sequelize.models.UserMemory.findOne()
    return {
      name: 'Story AI stack check',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Story AI stack check',
      status: 'error',
      message: error?.message || 'Story AI check failed',
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
        name: 'Systems check',
        status: 'error',
        message: 'Configuration not loaded',
        duration: Date.now() - start,
      }
    }

    // Check if node_modules exists (yarn dependencies installed)
    const nodeModulesPath = path.join(process.cwd(), 'node_modules')
    if (!fs.existsSync(nodeModulesPath)) {
      return {
        name: 'Systems check',
        status: 'error',
        message: 'Dependencies not installed',
        duration: Date.now() - start,
      }
    }

    // Check if package.json exists
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      return {
        name: 'Systems check',
        status: 'error',
        message: 'package.json not found',
        duration: Date.now() - start,
      }
    }

    // Check if build output exists (TypeScript compiled successfully)
    const serverBuildPath = path.join(process.cwd(), 'dist/server/server/index.js')
    if (!fs.existsSync(serverBuildPath)) {
      return {
        name: 'Systems check',
        status: 'error',
        message: 'Server build not found',
        duration: Date.now() - start,
      }
    }

    return {
      name: 'Systems check',
      status: 'ok',
      duration: Date.now() - start,
    }
  } catch (error: any) {
    return {
      name: 'Systems check',
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
    checkStoryAI(),
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
}
