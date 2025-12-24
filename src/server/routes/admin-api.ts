import { Op, Sequelize, Filterable } from 'sequelize'
import { Literal } from 'sequelize/types/utils'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { AdminUsersSort, LogEvent, Paginated, User } from '#shared/types'
import { fp } from '#shared/utils'
import { buildPrompt, completeAndExtractQuestion, generateUserSummary, generateMemoryStory } from '#server/utils/memory'
import { sync } from '../sync.js'
import dayjs from '../utils/dayjs.js'

export default async (fastify: FastifyInstance) => {
  // Add parser for form-encoded data from HTML forms
  // This allows the cleanup page's HTML form to POST without 415 errors
  fastify.addContentTypeParser('application/x-www-form-urlencoded',
    { parseAs: 'string' },
    function (req, body, done) {
      // We don't use the body data, so just pass empty object
      done(null, {})
    }
  )

  fastify.get(
    '/users',
    async (
      req: FastifyRequest<{
        Querystring: {
          limit: string
          skip: string
          sort: AdminUsersSort
          tags: string
          query?: string
        }
      }>,
      reply
    ) => {
      const skip = parseInt(req.query.skip) || 0
      const limit = Math.min(parseInt(req.query.limit) || 100, 250)
      const query = (req.query.query || '').trim()
      const tags = (req.query.tags || '')
        .split(',')
        .map(fp.trim)
        .filter(Boolean)
        .map((tag) => tag.toLowerCase()) // Normalize to lowercase for database lookup
      let order: [string, string] | Literal = ['createdAt', 'ASC']
      if (req.query.sort === 'newest') {
        order = ['createdAt', 'DESC']
      } else if (req.query.sort === 'last_seen') {
        order = Sequelize.literal(`
          CASE
            WHEN "lastSeenAt" IS NOT NULL THEN "lastSeenAt"
            WHEN "joinedAt" IS NOT NULL THEN "joinedAt"
            ELSE "createdAt" END DESC
        `)
      }
      // const where: WhereOptions<User> = {}
      const where: Filterable<User>['where'] = {}

      if (tags.length) {
        where.tags = { [Op.overlap]: tags }
      }
      if (query) {
        // FIX: Use type assertion for symbol-keyed property
        (where as any)[Op.or] = [
          {
            email: {
              [Op.iLike]: `%${query}%`,
            },
          },
          {
            email: {
              [Op.iLike]: `%${query.replace(/\s/, '')}%`,
            },
          },
          Sequelize.where(
            Sequelize.fn(
              'CONCAT',
              Sequelize.col('firstName'),
              ' ',
              Sequelize.col('lastName')
            ),
            {
              [Op.iLike]: `%${query}%`,
            }
          ),
        ]
      }
      const { count, rows } = await fastify.models.User.findAndCountAll({
        where,
        order: [order],
        offset: skip,
        limit,
      })
      const result: Paginated<User> = {
        items: rows,
        data: rows,
        total: count,
        page: Math.floor(skip / limit),
        pageSize: limit,
        skip: parseInt(req.query.skip) || 0,
        limit,
      }
      return result
    }
  )

  fastify.get(
    '/users/:userId',
    async (req: FastifyRequest<{ Params: { userId: string } }>, reply) => {
      const user = await fastify.models.User.findByPk(req.params.userId)
      return user
    }
  )

  fastify.post(
    '/live-message',
    async (req: FastifyRequest<{ Body: { message: string } }>, reply) => {
      const message = req.body.message || ''
      let record = await fastify.models.LiveMessage.findOne()
      if (!record) {
        record = await fastify.models.LiveMessage.create({
          message,
          authorUserId: req.user.id,
        })
      }
      await record.set({ message }).save()
      sync.emit('live_message', { message })
      return reply.ok()
    }
  )

  fastify.put(
    '/users/:userId',
    async (
      req: FastifyRequest<{ Params: { userId: string }; Body: Partial<User> }>,
      reply
    ) => {
      const user = await fastify.models.User.findByPk(req.params.userId)
      if (!user) {
        return reply.throw.notFound()
      }
      const body = fp.pick(['tags'])(req.body)
      if (!Object.keys(body).length) {
        return reply.throw.badParams()
      }
      // Only vadikmarmeladov@gmail.com (CEO) can edit user tags
      if (body.tags && !req.user.canEditTags()) {
        reply.status(403)
        throw new Error('Access denied: Only the CEO can edit user tags')
      }
      // Normalize tags to lowercase for database storage
      if (body.tags) {
        body.tags = body.tags.map((tag: string) => tag.toLowerCase())
      }
      await user.set(body).save()
      return user
    }
  )

  fastify.get(
    '/users/:userId/memory-prompt',
    async (req: FastifyRequest<{ Params: { userId: string } }>, reply) => {
      const user = await fastify.models.User.findByPk(req.params.userId)
      if (!user) return reply.throw.notFound()

      const logs = await fastify.models.Log.findAll({
        where: {
          userId: user.id,
          // event: {
          //   [Op.in]: [
          //     'settings_change',
          //     'chat_message',
          //     'chat_message_like',
          //     'answer',
          //   ] as LogEvent[],
          // },
        },
        order: [['createdAt', 'DESC']],
        limit: 50,
      })
      return { prompt: await buildPrompt(user, logs) }
    }
  )

  fastify.post(
    '/users/:userId/memory-prompt',
    async (
      req: FastifyRequest<{
        Params: { userId: string }
        Body: { prompt: string }
      }>,
      reply
    ) => {
      const user = await fastify.models.User.findByPk(req.params.userId)
      if (!user) return reply.throw.notFound()
      return await completeAndExtractQuestion(req.body.prompt, user)
    }
  )

  fastify.get(
    '/users/:userId/summary',
    async (req: FastifyRequest<{ Params: { userId: string } }>, reply) => {
      const user = await fastify.models.User.findByPk(req.params.userId)
      if (!user) return reply.throw.notFound()

      const logs = await fastify.models.Log.findAll({
        where: {
          userId: user.id,
        },
        order: [['createdAt', 'DESC']],
        limit: 50,
      })

      const summary = await generateUserSummary(user, logs)
      return { summary }
    }
  )

  fastify.get(
    '/users/:userId/memory-story',
    async (req: FastifyRequest<{ Params: { userId: string } }>, reply) => {
      const user = await fastify.models.User.findByPk(req.params.userId)
      if (!user) return reply.throw.notFound()

      const logs = await fastify.models.Log.findAll({
        where: {
          userId: user.id,
          event: 'answer',
        },
        order: [['createdAt', 'DESC']],
        limit: 100,
      })

      const story = await generateMemoryStory(user, logs)
      return { story }
    }
  )

  // Admin endpoint: Clean up ALL empty logs across all users
  fastify.post('/cleanup-all-empty-logs', async (req: FastifyRequest, reply) => {
    try {
      console.log(`🧹 [ADMIN] Starting global empty logs cleanup...`)
      console.log(`📝 [ADMIN] Request content-type: ${req.headers['content-type']}`)

      // Find ALL empty notes across all users
      const allNotes = await fastify.models.Log.findAll({
        where: {
          event: 'note',
        },
      })

      // Filter to find truly empty notes and placeholder text
      const emptyLogs = allNotes.filter(log => {
        if (!log.text || log.text.trim() === '') return true
        const text = log.text.trim().toLowerCase()
        // ONLY match exact placeholder text, not user content containing these words
        return text === 'the log record will be deleted' ||
               text === 'type here...' ||
               text === 'type here'
      })

      if (emptyLogs.length === 0) {
        console.log('✅ [ADMIN] No empty logs found - database is clean')

        // If it's an HTML form submission (no Accept: application/json), return HTML
        const acceptsJson = req.headers.accept?.includes('application/json')
        if (!acceptsJson) {
          return reply.type('text/html').send(generateResultPage(0, 0, {}))
        }

        return {
          success: true,
          deleted: 0,
          message: 'No empty logs found across all users'
        }
      }

      // Group by user for reporting
      const byUser = emptyLogs.reduce((acc, log) => {
        acc[log.userId] = (acc[log.userId] || 0) + 1
        return acc
      }, {} as { [userId: string]: number })

      const userCount = Object.keys(byUser).length

      console.log(`📊 [ADMIN] Found ${emptyLogs.length} empty logs across ${userCount} users`)
      console.log(`🗑️  [ADMIN] Deleting...`)

      // Delete by IDs
      const idsToDelete = emptyLogs.map(log => log.id)
      await fastify.models.Log.destroy({
        where: { id: idsToDelete },
      })

      console.log(`✅ [ADMIN] Successfully deleted ${emptyLogs.length} empty logs from ${userCount} users`)

      // If it's an HTML form submission, return HTML
      const acceptsJson = req.headers.accept?.includes('application/json')
      if (!acceptsJson) {
        return reply.type('text/html').send(generateResultPage(emptyLogs.length, userCount, byUser))
      }

      return {
        success: true,
        deleted: emptyLogs.length,
        affectedUsers: userCount,
        message: `Deleted ${emptyLogs.length} empty logs across ${userCount} users`,
        breakdown: byUser
      }
    } catch (error: any) {
      console.error('❌ [ADMIN] Cleanup failed:', error.message)
      return reply.throw.serverError(error.message)
    }
  })

  // Helper function to generate result page
  function generateResultPage(deleted: number, userCount: number, breakdown: { [key: string]: number }) {
    const breakdownHtml = Object.entries(breakdown)
      .map(([userId, count]) => `${userId.substring(0, 8)}...: ${count} logs`)
      .join('<br>')

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cleanup Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    .icon { font-size: 64px; margin-bottom: 20px; }
    h1 { color: #28a745; margin: 0 0 20px 0; }
    .stats {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 18px;
    }
    .breakdown {
      margin-top: 20px;
      font-family: monospace;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      text-align: left;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
    }
    a:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="container">
    ${deleted === 0 ? `
      <div class="icon">✨</div>
      <h1>Database is Clean!</h1>
      <p>No empty logs found across all users.</p>
    ` : `
      <div class="icon">✅</div>
      <h1>Cleanup Complete!</h1>
      <div class="stats">
        <strong>${deleted}</strong> empty logs deleted<br>
        from <strong>${userCount}</strong> users
      </div>
      ${breakdownHtml ? `<div class="breakdown"><strong>Breakdown by user:</strong><br>${breakdownHtml}</div>` : ''}
    `}
    <a href="/admin-api/cleanup-all-empty-logs">← Back to Cleanup Page</a>
  </div>
</body>
</html>`
  }

  // Admin endpoint: Get cleanup page (HTML interface)
  fastify.get('/cleanup-all-empty-logs', async (req: FastifyRequest, reply) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin: Cleanup All Empty Logs</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #dc3545; margin: 0 0 10px 0; }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      color: #856404;
    }
    form {
      margin: 30px 0;
    }
    button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      width: 100%;
      max-width: 400px;
    }
    button:hover { background: #c82333; }
    button:active { background: #bd2130; }
    .info { color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧹 Admin: Cleanup All Empty Logs</h1>
    <p>This will delete ALL empty log entries across ALL users in the database.</p>

    <div class="warning">
      ⚠️ <strong>Warning:</strong> This action affects all users. Only use this if you're sure empty logs are accumulating due to a bug.
    </div>

    <form method="POST" action="/admin-api/cleanup-all-empty-logs" onsubmit="return confirm('Are you sure you want to delete ALL empty logs from ALL users? This cannot be undone.');">
      <button type="submit">Delete All Empty Logs (All Users)</button>
    </form>

    <div class="info">
      <strong>What gets deleted:</strong>
      <ul>
        <li>Notes with empty text</li>
        <li>Notes with placeholder text ("will be deleted", "log record", "type here")</li>
      </ul>
      <strong>What's preserved:</strong>
      <ul>
        <li>All notes with actual content</li>
        <li>All other log types (answers, activities, etc.)</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

    reply.type('text/html').send(html);
  })
}