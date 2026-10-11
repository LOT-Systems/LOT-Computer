/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import ejs from 'ejs'
import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyCookie from '@fastify/cookie'
import fastifyView from '@fastify/view'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import { sequelize } from '#server/utils/db'
import logger from '#server/utils/log'
import {
  okReplyDecorator,
  throwReplyDecorator,
  gzipFile,
  jwt,
} from '#server/utils'
import { models, SessionWithUser } from '#server/models'
import config from '#server/config'
import {
  auditFromRequest,
  AuditEvent,
  isVulnerabilityScan,
  trackRapidRequests,
  ADDITIONAL_SECURITY_HEADERS,
} from '#server/utils/security'
import authRoutes from './routes/auth.js'
import apiRoutes from './routes/api.js'
import adminApiRoutes from './routes/admin-api.js'
import publicApiRoutes from './routes/public-api.js'

const CWD = process.cwd()

const fastify = Fastify({
  logger: false,
  // Generate unique request IDs for audit trails
  genReqId: () => crypto.randomBytes(8).toString('hex'),
  // Reject excessively large payloads (1MB default)
  bodyLimit: 1_048_576,
})

const KNOWN_CLIENT_ROUTES = ['/', '/settings', '/sync', '/log', '/basics']

// ==============================================================================
// SECURITY PLUGINS
// ==============================================================================

fastify.register(fastifyCookie)

// Global rate limiting: 100 requests per minute per IP
fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (_req: FastifyRequest, context: { after: string; statusCode: number }) => {
    return {
      statusCode: context.statusCode,
      message: 'Too many requests. Please slow down.',
    }
  },
})

fastify.register(fastifyHelmet, {
  enableCSPNonces: true,
  // Prevent MIME type sniffing
  xContentTypeOptions: true,
  // Prevent clickjacking
  xFrameOptions: { action: 'sameorigin' as const },
  // Disable browser DNS prefetching
  xDnsPrefetchControl: { allow: false },
  // Prevent IE from executing downloads in site context
  xDownloadOptions: true,
  // Referrer policy: only send origin on cross-origin requests
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' as const },
  contentSecurityPolicy: {
    useDefaults: config.env === 'production',
    directives: {
      'default-src': ["'self'"],
      'connect-src': [
        "'self'",
        ...(config.env === 'development' ? ['http://127.0.0.1:*'] : []),
      ],
      'font-src': ["'self'", 'https://rsms.me'],
      'form-action': ["'self'"],
      'frame-src': [
        'www.youtube-nocookie.com',
        'www.youtube.com',
        'youtube.com',
      ],
      // Use nonces instead of unsafe-inline for scripts
      'script-src': [
        "'self'",
        'https://www.youtube.com/iframe_api',
        'https://www.youtube.com',
        'https://unpkg.com/tone',
      ],
      'style-src': ["'self'", 'https://rsms.me'],
      'img-src': ["'self'", 'data:', 'https:'],
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
      ...(config.env === 'production'
        ? { 'upgrade-insecure-requests': [] }
        : {}),
    },
  },
})
fastify.register(fastifyStatic, {
  root: path.join(CWD, 'public'),
  decorateReply: true,
})
fastify.register(fastifyStatic, {
  root: path.join(CWD, 'dist/client/js'),
  prefix: '/js/',
  decorateReply: false,
})
fastify.register(fastifyStatic, {
  root: path.join(CWD, 'dist/client/css'),
  prefix: '/css/',
  decorateReply: false,
})
fastify.register(fastifyView, {
  engine: { ejs },
  root: path.join(CWD, 'templates'),
  includeViewExtension: true,
  defaultContext: {
    appName: config.appName,
    appHost: config.appHost,
    appDescription: config.appDescription,
    useHttpsRedirect: config.env === 'production',
  },
})

// gzip assets - TEMPORARILY DISABLED FOR TESTING
/*
if (config.env === 'production') {
  fastify.get(
    '/js/:file',
    async (req: FastifyRequest<{ Params: { file: string } }>, reply) => {
      const filePath = path.join(CWD, `dist/client/js/${req.params.file}.gz`)
      reply.type('text/javascript')
      reply.header('Content-Encoding', 'gzip')
      try {
        const file = fs.readFileSync(filePath)
        reply.send(file)
      } catch (err) {
        reply.status(404).send()
      }
    }
  )
  gzipFile(path.join(process.cwd(), 'dist/client/css/index.css'))
  fastify.get('/css/index.css', async (req, reply) => {
    const file = path.join(CWD, 'dist/client/css/index.css.gz')
    reply.type('text/css')
    reply.header('Content-Encoding', 'gzip')
    reply.send(fs.readFileSync(file))
    reply.sendFile('')
  })
}
*/

// ==============================================================================
// SECURITY: Additional headers, vulnerability scan detection, session pruning
// ==============================================================================

// Apply additional security headers to all responses
fastify.addHook('onRequest', async (req, reply) => {
  // Permissions-Policy and Cross-Origin headers for all responses
  for (const [header, value] of Object.entries(ADDITIONAL_SECURITY_HEADERS)) {
    reply.header(header, value)
  }

  // Set security headers for all HTML responses
  if (req.headers.accept?.includes('text/html')) {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    reply.header('Pragma', 'no-cache')
  }
  // Prevent caching of API responses with sensitive data
  if (req.url.startsWith('/api/') || req.url.startsWith('/admin-api/')) {
    reply.header('Cache-Control', 'no-store')
  }
})

// Detect and short-circuit vulnerability scans (saves resources)
fastify.addHook('onRequest', async (req, reply) => {
  if (isVulnerabilityScan(req.url)) {
    auditFromRequest(req, AuditEvent.SUSPICIOUS_ACTIVITY, {
      reason: 'vulnerability_scan',
      path: req.url,
    })
    return reply.code(404).send({ statusCode: 404, message: 'Not found' })
  }

  // Detect rapid-fire request patterns (potential DDoS/scraping)
  if (trackRapidRequests(req.ip)) {
    auditFromRequest(req, AuditEvent.RATE_LIMITED, {
      reason: 'rapid_requests',
    })
  }
})

// Prune expired sessions periodically (every hour)
const SESSION_PRUNE_INTERVAL = 60 * 60 * 1000
setInterval(() => {
  models.Session.pruneExpired().catch((err) => {
    console.error('[security] Session pruning failed:', err.message)
  })
}, SESSION_PRUNE_INTERVAL)

// Health check endpoint (required for Digital Ocean)
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Public API routes (no authentication required)
fastify.register(publicApiRoutes, { prefix: '/api/public' })

// Public status page route (no authentication required)
fastify.get('/status', async (req, reply) => {
  return reply.view('generic-spa', {
    scriptName: 'status',
    scriptNonce: reply.cspNonce.script,
    styleNonce: reply.cspNonce.style,
  })
})

// Database
fastify.addHook('onClose', () => sequelize.close())

// ==============================================================================
// PUBLIC PROFILE ROUTES - ABSOLUTE TOP LEVEL - HIGHEST PRIORITY
// These MUST be registered before ANY other routes to avoid conflicts
// ==============================================================================

// Public profile route - serve the React app
fastify.get('/u/:userIdOrUsername', async function (req, reply) {
  const { userIdOrUsername } = req.params as { userIdOrUsername: string }

  return reply.view('generic-spa', {
    scriptName: 'public-profile',
    scriptNonce: reply.cspNonce.script,
    styleNonce: reply.cspNonce.style,
  })
})

// ==============================================================================
// END PUBLIC PROFILE ROUTES
// ==============================================================================

// About page — standalone template, loads independently from main app
fastify.get('/about', async (req, reply) => {
  return reply.view('about-standalone', {
    scriptNonce: reply.cspNonce.script,
    styleNonce: reply.cspNonce.style,
  })
})

// Routes
fastify.register(async (fastify: FastifyInstance) => {
  fastify.decorate('models', models)
  fastify.decorate('sequelize', sequelize)
  fastify.decorateReply('ok', okReplyDecorator)
  fastify.decorateReply('throw', throwReplyDecorator)

  fastify.register(async (fastify) => {
    fastify.decorateReply('user', null)
    fastify.addHook('onRequest', async (req: FastifyRequest, reply) => {
      const token = req.cookies[config.jwt.cookieKey]
      if (token) {
        try {
          const session: SessionWithUser | null =
            await fastify.models.Session.findOne({
              where: { token },
              include: [
                {
                  model: fastify.models.User,
                  as: "user",
                },
              ],
            })
          if (session && session.user) {
            // Enforce session expiry
            if (session.isExpired()) {
              auditFromRequest(req, AuditEvent.SESSION_EXPIRED, {
                userId: session.userId,
              })
              await session.destroy()
              reply.clearCookie(config.jwt.cookieKey, { path: '/' })
              return
            }

            // Update last-used timestamp (fire and forget)
            session.touch()

            req.user = session.user
          }
        } catch (err) {
          // Log but don't crash - allow page to render as logged-out
          console.error('[auth] Session lookup failed:', (err as Error).message)
        }
      }
    })

    // Public API
    fastify.register(authRoutes, { prefix: '/auth' })

    // User API
    fastify.register(async (fastify) => {
      fastify.addHook('onRequest', async (req, reply) => {
        if (!req.user) {
          reply.status(401)
          throw new Error('Access denied')
        }
      })
      fastify.register(apiRoutes, { prefix: '/api' })
    })

    // Admin API (accessible by Usership members only)
    fastify.register(async (fastify) => {
      fastify.addHook('onRequest', async (req, reply) => {
        if (!req.user || !req.user.canAccessUsSection()) {
          auditFromRequest(req, AuditEvent.ADMIN_ACCESS, {
            granted: false,
            path: req.url,
          })
          reply.status(401)
          throw new Error('Access denied: Usership access required')
        }
        // Log successful admin access
        auditFromRequest(req, AuditEvent.ADMIN_ACCESS, {
          granted: true,
          path: req.url,
          userId: req.user.id,
        })
      })
      fastify.register(adminApiRoutes, { prefix: '/admin-api' })
    })

    // Client app / index page
    fastify.register(async (fastify) => {
      KNOWN_CLIENT_ROUTES.forEach((route) => {
        fastify.get(route, async function (req, reply) {
          if (req.user) {
            return reply.view('generic-spa', {
              scriptName: 'app',
              scriptNonce: reply.cspNonce.script,
              styleNonce: reply.cspNonce.style,
            })
          }
          return reply.view('generic-spa', {
            scriptName: 'login',
            scriptNonce: reply.cspNonce.script,
            styleNonce: reply.cspNonce.style,
          })
        })
      })
    })

    // Admin app (accessible by Usership members only)
    fastify.register(async (fastify) => {
      fastify.addHook('onRequest', async (req, reply) => {
        if (!req.user || !req.user.canAccessUsSection()) {
          return reply.redirect('/')
        }
      })

      // Internal profile route within /us context
      fastify.get('/us/u/:userId', async function (req, reply) {
        return reply.view('generic-spa', {
          scriptName: 'public-profile',
          scriptNonce: reply.cspNonce.script,
          styleNonce: reply.cspNonce.style,
        })
      })

      ;['/us', '/us/:userId'].forEach((route) => {
        fastify.get(route, async function (req, reply) {
          return reply.view('generic-spa', {
            scriptName: 'us',
            scriptNonce: reply.cspNonce.script,
            styleNonce: reply.cspNonce.style,
          })
        })
      })
      fastify.get('/ui', async (req, reply) => {
        return reply.view('generic-spa', {
          scriptName: 'ui-lib',
          scriptNonce: reply.cspNonce.script,
          styleNonce: reply.cspNonce.style,
        })
      })
    })
  })
})

// ==============================================================================
// ERROR HANDLING - hardened for production
// ==============================================================================
fastify.setErrorHandler((error, req, reply) => {
  const initialStatusCode = error.statusCode || reply.statusCode
  const statusCode = initialStatusCode >= 400 ? initialStatusCode : 500
  const defaultMessage = 'Internal error'
  let message: string = error.message || defaultMessage

  if (statusCode >= 500) {
    console.error(`[error] ${req.id} ${req.method} ${req.url}:`, error.message)
    if (config.env === 'development') {
      console.error(error.stack)
    }
    message = defaultMessage
  }

  if (req.headers.accept?.includes('text/html')) {
    return reply.status(statusCode).redirect(`/error.html?code=${statusCode}`)
  }

  return reply.status(statusCode).send({ statusCode, message })
})

fastify.setNotFoundHandler(async (req, res) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/admin-api/')) {
    return res.code(404).send({ statusCode: 404, message: 'Not found' })
  }

  if (req.headers.accept?.includes('text/html')) {
    return res.redirect('/')
  }
  res.code(404).send({ statusCode: 404, message: 'Not found' })
})

// Start server - use PORT from environment or default to 8080
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080
try {
  const address = await fastify.listen({ port, host: '0.0.0.0' })
  console.log(`Server is running at ${address}`)

  // Initialize scheduled jobs (monthly emails, etc.)
  try {
    const { initializeScheduledJobs } = await import('./scheduled-jobs.js')
    initializeScheduledJobs()
  } catch (error) {
    console.error('Failed to initialize scheduled jobs:', error)
  }
  console.log(`App launched: ${config.appHost}`)
} catch (err) {
  console.error(err)
  process.exit(1)
}