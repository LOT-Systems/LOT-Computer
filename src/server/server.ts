import path from 'path'
import fs from 'fs'
import ejs from 'ejs'
import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyCookie from '@fastify/cookie'
import fastifyView from '@fastify/view'
import fastifyHelmet from '@fastify/helmet'
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
import authRoutes from './routes/auth.js'
import apiRoutes from './routes/api.js'
import adminApiRoutes from './routes/admin-api.js'
import publicApiRoutes from './routes/public-api.js'

const CWD = process.cwd()

const fastify = Fastify({
  logger: false  // Temporarily disable logging for development
})

const KNOWN_CLIENT_ROUTES = ['/', '/settings', '/sync', '/log']

// Plugins
fastify.register(fastifyCookie)
fastify.register(fastifyHelmet, {
  enableCSPNonces: true,
  contentSecurityPolicy: {
    useDefaults: config.env === 'production',
    directives: {
      'default-src': ["'self'"],
      'connect-src': ["'self'", 'http://127.0.0.1:*'],
      'font-src': ["'self'", 'https://rsms.me'],
      'form-action': ["'self'"],
      'frame-src': [
        'www.youtube-nocookie.com',
        'www.youtube.com',
        'youtube.com',
      ],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'https://www.youtube.com/iframe_api',
        'https://www.youtube.com',
        'https://unpkg.com/tone',
      ],
      'style-src': ["'self'", 'https://rsms.me'],
      'img-src': ['*', 'data:'],
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

// gzip assets
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

// Global request logger for debugging
fastify.addHook('onRequest', async (req, reply) => {
  if (req.url.startsWith('/u/')) {
    console.log('[GLOBAL] Request to:', req.method, req.url)
  }
})

// Database
fastify.addHook('onClose', () => sequelize.close())

// ==============================================================================
// PUBLIC PROFILE ROUTES - ABSOLUTE TOP LEVEL - HIGHEST PRIORITY
// These MUST be registered before ANY other routes to avoid conflicts
// ==============================================================================

// Diagnostic test route
fastify.get('/u/test-route-works', async function (req, reply) {
  console.log('[DIAGNOSTIC] Test route hit!')
  reply.type('text/html')
  return `
    <!DOCTYPE html>
    <html>
      <head><title>Route Test</title></head>
      <body style="font-family: monospace; padding: 40px;">
        <h1 style="color: green;">✓ Route is working!</h1>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>The /u/ route is being matched correctly.</p>
      </body>
    </html>
  `
})

// Public profile route
fastify.get('/u/:userIdOrUsername', async function (req, reply) {
  const { userIdOrUsername } = req.params as { userIdOrUsername: string }
  console.log('[PUBLIC-PROFILE-ROUTE] ✓✓✓ Route hit for:', userIdOrUsername)
  console.log('[PUBLIC-PROFILE-ROUTE] Request URL:', req.url)
  console.log('[PUBLIC-PROFILE-ROUTE] Request method:', req.method)

  reply.type('text/html')
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Public Profile - ${userIdOrUsername}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1 style="color: green;">✓ Route Matched!</h1>
        <p><strong>User:</strong> ${userIdOrUsername}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <div id="result" style="margin-top: 20px;"></div>
        <script>
          console.log('Fetching profile for: ${userIdOrUsername}');
          fetch('/api/public/profile/${userIdOrUsername}')
            .then(res => res.json())
            .then(data => {
              console.log('Profile data:', data);
              document.getElementById('result').innerHTML =
                '<div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">' +
                '<h3 style="color: green;">✓ Profile Data:</h3>' +
                '<pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
            })
            .catch(err => {
              console.error('Error:', err);
              document.getElementById('result').innerHTML =
                '<div style="background: #ffebee; padding: 20px; border-radius: 8px;">' +
                '<h3 style="color: red;">✗ Error:</h3>' +
                '<p>' + err.message + '</p></div>';
            });
        </script>
      </body>
    </html>
  `
})

// ==============================================================================
// END PUBLIC PROFILE ROUTES
// ==============================================================================

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
        const verifyReq = await jwt.verify(token)
        if (verifyReq.success) {
          const userId = verifyReq.data.id
          const session: SessionWithUser | null =
            await fastify.models.Session.findOne({
              where: { token },
              include: [
                {
                  model: fastify.models.User,
                  as: 'user',
                  where: { id: userId },
                },
              ],
            })
          if (session && session.user) {
            req.user = session.user
          }
        }
      }
    })

    // Public API (no authentication required)
    fastify.register(authRoutes, { prefix: '/auth' })
    fastify.register(publicApiRoutes, { prefix: '/api/public' })

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

    // Admin API
    fastify.register(async (fastify) => {
      fastify.addHook('onRequest', async (req, reply) => {
        if (!req.user || !req.user.isAdmin()) {
          reply.status(401)
          throw new Error('Access denied')
        }
      })
      fastify.register(adminApiRoutes, { prefix: '/admin-api' })
    })

    // Client app / index page
    fastify.register(async (fastify) => {
      // Note: /u/ routes are registered at top level (lines 131-191)

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

    // Admin app
    fastify.register(async (fastify) => {
      fastify.addHook('onRequest', async (req, reply) => {
        if (!req.user || !req.user.isAdmin()) {
          return reply.redirect('/')
        }
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

// Handle errors
fastify.setErrorHandler((error, req, reply) => {
  const initialStatusCode = error.statusCode || reply.statusCode
  const statusCode = initialStatusCode >= 400 ? initialStatusCode : 500
  const defaultMessage = 'Internal error'
  let message: string = error.message || defaultMessage
  if (statusCode >= 500) {
    const errorObject = {
      reqId: req.id,
      req: {
        method: req.method,
        url: req.url,
      },
      stack: error.stack || null,
    }
    if (config.env === 'development') {
      console.error(error, `${message} @ ${req.id} ${req.method} ${req.url}`)
    } else {
      console.error(errorObject, message)
      message = defaultMessage
    }
  }
  return reply.status(statusCode).send({ statusCode, message })
})

fastify.setNotFoundHandler(async (req, res) => {
  console.log('[NOT-FOUND] URL:', req.url)
  console.log('[NOT-FOUND] Method:', req.method)
  console.log('[NOT-FOUND] Headers Accept:', req.headers.accept)
  console.log('[NOT-FOUND] Is HTML request:', req.headers.accept?.includes('text/html'))

  if (req.headers.accept?.includes('text/html')) {
    console.log('[NOT-FOUND] Redirecting HTML request to /')
    return res.redirect('/')
  }
  console.log('[NOT-FOUND] Returning 404')
  res.code(404).send('Not found')
})

// Start server
fastify.listen({ port: config.port, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`🚀 App launched: ${config.appHost}`)
})
