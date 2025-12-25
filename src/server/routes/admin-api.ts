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

      // Find ALL empty logs from past 7 days across all users (any event type)
      const sevenDaysAgo = dayjs().subtract(7, 'days').toDate()
      const allLogs = await fastify.models.Log.findAll({
        where: {
          createdAt: {
            [Op.gte]: sevenDaysAgo
          }
        },
      })

      // Filter to find truly empty logs (empty string or whitespace only)
      // EXCLUDE 'answer' events - they store data in metadata, not text
      const emptyLogs = allLogs.filter(log => {
        // Skip answer events - they have empty text but data is in metadata
        if (log.event === 'answer') return false

        // Match logs with no text or only whitespace
        return !log.text || log.text.trim() === ''
      })

      if (emptyLogs.length === 0) {
        console.log('✅ [ADMIN] No empty logs found from past 7 days - database is clean')

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

      console.log(`📊 [ADMIN] Found ${emptyLogs.length} empty logs from past 7 days across ${userCount} users`)
      console.log(`🗑️  [ADMIN] Deleting...`)

      // Delete by IDs
      const idsToDelete = emptyLogs.map(log => log.id)
      await fastify.models.Log.destroy({
        where: { id: idsToDelete },
      })

      console.log(`✅ [ADMIN] Successfully deleted ${emptyLogs.length} empty logs from past 7 days (${userCount} users affected)`)

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
    <p>This will delete empty log entries from the <strong>past 7 days</strong> across ALL users.</p>

    <div class="warning">
      ⚠️ <strong>Warning:</strong> This action affects all users. Only use this if you're sure empty logs are accumulating due to a bug.
    </div>

    <form method="POST" action="/admin-api/cleanup-all-empty-logs" onsubmit="return confirm('Are you sure you want to delete empty logs from the past 7 days from ALL users? This cannot be undone.');">
      <button type="submit">Delete Empty Logs from Past 7 Days (All Users)</button>
    </form>

    <div class="info">
      <strong>What gets deleted:</strong>
      <ul>
        <li>ANY logs from the past 7 days with empty text (null or empty string)</li>
        <li>ANY logs from the past 7 days with only whitespace (spaces, tabs, newlines)</li>
        <li>This includes notes, theme_change events, and any other event types</li>
      </ul>
      <strong>What's preserved:</strong>
      <ul>
        <li>All logs with actual content</li>
        <li>All logs older than 4 days</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

    reply.type('text/html').send(html);
  })

  // Diagnostic endpoint to inspect what's in "empty" logs
  fastify.get('/inspect-empty-logs', async (req: FastifyRequest, reply) => {
    const fourDaysAgo = dayjs().subtract(4, 'days').toDate()
    const allLogs = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
        createdAt: {
          [Op.gte]: fourDaysAgo
        }
      },
      order: [['createdAt', 'DESC']],
    })

    // Find logs that appear empty
    const suspiciousLogs = allLogs.map(log => {
      const text = log.text || ''
      const trimmed = text.trim()
      const charCodes = [...text].map(c => c.charCodeAt(0))

      return {
        id: log.id,
        event: log.event,
        length: text.length,
        trimmedLength: trimmed.length,
        isEmpty: !text || text.trim() === '',
        text: text,
        trimmedText: trimmed,
        charCodes: charCodes,
        hasOnlyWhitespace: text.length > 0 && trimmed.length === 0,
        createdAt: log.createdAt,
      }
    }).filter(log => log.isEmpty || log.hasOnlyWhitespace)

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Empty Logs Inspection</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff; }
    .log { border: 1px solid #444; margin: 10px 0; padding: 10px; background: #2a2a2a; }
    .empty { background: #3a2020; }
    .whitespace { background: #3a3a20; }
    pre { background: #1a1a1a; padding: 10px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>Empty Logs Inspection (Past 4 Days)</h1>
  <p>Found ${suspiciousLogs.length} empty logs from the past 4 days</p>
  ${suspiciousLogs.map(log => `
    <div class="log ${log.isEmpty ? 'empty' : 'whitespace'}">
      <strong>ID:</strong> ${log.id}<br>
      <strong>Event Type:</strong> ${log.event}<br>
      <strong>Created:</strong> ${log.createdAt}<br>
      <strong>Length:</strong> ${log.length} | <strong>Trimmed:</strong> ${log.trimmedLength}<br>
      <strong>Is Empty:</strong> ${log.isEmpty}<br>
      <strong>Has Only Whitespace:</strong> ${log.hasOnlyWhitespace}<br>
      <strong>Text (raw):</strong> <pre>"${log.text.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"</pre>
      <strong>Char codes:</strong> <pre>[${log.charCodes.join(', ')}]</pre>
    </div>
  `).join('')}
</body>
</html>`

    reply.type('text/html').send(html)
  })

  // Restore Memory Answers from Backup
  fastify.get('/restore-memory-answers', async (req: FastifyRequest, reply) => {
    try {
      const { Sequelize } = await import('sequelize')

      // Connect to backup database
      const backupDb = new Sequelize('defaultdb', 'doadmin', 'AVNS_8V6Hqzuxwj0JkMxgNvR', {
        host: 'db-postgresql-nyc3-92053-dec-24-backup-do-user-22640384-0.l.db.ondigitalocean.com',
        port: 25060,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: { require: true, rejectUnauthorized: false }
        }
      })

      const fourDaysAgo = dayjs().subtract(4, 'days').toDate()

      // Get answer events from backup
      const [backupAnswers] = await backupDb.query(`
        SELECT id, "userId", metadata, "createdAt"
        FROM logs
        WHERE event = 'answer'
          AND "createdAt" >= :fourDaysAgo
        ORDER BY "createdAt" DESC
      `, { replacements: { fourDaysAgo } })

      // Get existing answer IDs from production
      const prodAnswers = await fastify.models.Log.findAll({
        where: { event: 'answer' },
        attributes: ['id']
      })

      const existingIds = new Set(prodAnswers.map(r => r.id))
      const missing = (backupAnswers as any[]).filter(r => !existingIds.has(r.id))

      await backupDb.close()

      // Generate HTML
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restore Memory Answers</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin-top: 0; }
    .stats {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .stats strong { color: #1976d2; font-size: 24px; }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .success {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 20px 0;
    }
    button {
      background: #28a745;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
    }
    button:hover { background: #218838; }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .sample {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔄 Restore Memory Answers</h1>
    <p>This will restore deleted Memory answer events from the backup database.</p>

    <div class="stats">
      <strong>${backupAnswers.length}</strong> answer events in backup (past 4 days)<br>
      <strong>${existingIds.size}</strong> answer events currently in production<br>
      <strong>${missing.length}</strong> missing (to restore)
    </div>

    ${missing.length === 0 ? `
      <div class="success">
        ✅ <strong>No missing answer events found!</strong><br>
        Your database is complete. All Memory answers are present.
      </div>
    ` : `
      <div class="warning">
        ⚠️ <strong>${missing.length} Memory answer events are missing from production.</strong><br>
        These can be safely restored without overwriting any existing data.
      </div>

      <h3>Sample of missing answers:</h3>
      ${missing.slice(0, 3).map((a: any) => {
        const meta = typeof a.metadata === 'string' ? JSON.parse(a.metadata) : a.metadata
        const q = meta?.question || 'Unknown'
        const ans = meta?.answer || 'Unknown'
        return `<div class="sample">
          <strong>Q:</strong> ${q.substring(0, 80)}${q.length > 80 ? '...' : ''}<br>
          <strong>A:</strong> ${ans.substring(0, 80)}${ans.length > 80 ? '...' : ''}<br>
          <small>${new Date(a.createdAt).toLocaleString()}</small>
        </div>`
      }).join('')}
      ${missing.length > 3 ? `<p><em>... and ${missing.length - 3} more</em></p>` : ''}

      <form method="POST" action="/admin-api/restore-memory-answers" onsubmit="return confirm('Restore ${missing.length} Memory answer events? This is safe and will not overwrite existing data.');">
        <button type="submit">Restore ${missing.length} Memory Answers</button>
      </form>
    `}

    <p style="margin-top: 20px; font-size: 14px; color: #666;">
      <a href="/admin-api/cleanup-all-empty-logs">← Back to Admin Tools</a>
    </p>
  </div>
</body>
</html>`

      reply.type('text/html').send(html)
    } catch (error: any) {
      console.error('Restore preview error:', error)
      reply.type('text/html').send(`
        <!DOCTYPE html>
        <html><body style="font-family: sans-serif; padding: 20px;">
        <h1>Error</h1>
        <p>${error.message}</p>
        <p><a href="/admin-api/restore-memory-answers">Try Again</a></p>
        </body></html>
      `)
    }
  })

  fastify.post('/restore-memory-answers', async (req: FastifyRequest, reply) => {
    try {
      const { Sequelize } = await import('sequelize')

      // Connect to backup database
      const backupDb = new Sequelize('defaultdb', 'doadmin', 'AVNS_8V6Hqzuxwj0JkMxgNvR', {
        host: 'db-postgresql-nyc3-92053-dec-24-backup-do-user-22640384-0.l.db.ondigitalocean.com',
        port: 25060,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: { require: true, rejectUnauthorized: false }
        }
      })

      const fourDaysAgo = dayjs().subtract(4, 'days').toDate()

      console.log('🔄 [RESTORE] Starting Memory answer restoration...')

      // Get answer events from backup
      const [backupAnswers] = await backupDb.query(`
        SELECT id, "userId", event, text, metadata, context, "createdAt", "updatedAt"
        FROM logs
        WHERE event = 'answer'
          AND "createdAt" >= :fourDaysAgo
        ORDER BY "createdAt" DESC
      `, { replacements: { fourDaysAgo } })

      // Get existing answer IDs
      const prodAnswers = await fastify.models.Log.findAll({
        where: { event: 'answer' },
        attributes: ['id']
      })

      const existingIds = new Set(prodAnswers.map(r => r.id))
      const missing = (backupAnswers as any[]).filter(r => !existingIds.has(r.id))

      console.log(`📊 [RESTORE] Found ${missing.length} missing answer events`)

      if (missing.length === 0) {
        await backupDb.close()
        return reply.type('text/html').send(`
          <!DOCTYPE html>
          <html><body style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h1>✅ No Restoration Needed</h1>
          <p>All Memory answers are already present in the database.</p>
          <p><a href="/admin-api/restore-memory-answers">← Back</a></p>
          </body></html>
        `)
      }

      // Restore missing answers
      let restored = 0
      for (const answer of missing) {
        await fastify.models.Log.create({
          id: answer.id,
          userId: answer.userId,
          event: answer.event,
          text: answer.text || '',
          metadata: answer.metadata,
          context: answer.context || {},
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt
        })
        restored++
      }

      await backupDb.close()

      console.log(`✅ [RESTORE] Successfully restored ${restored} Memory answer events`)

      // Success page
      reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restoration Complete</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .success {
              background: #d4edda;
              border: 2px solid #28a745;
              padding: 30px;
              border-radius: 8px;
            }
            h1 { color: #28a745; margin: 0 0 20px 0; }
            .stats {
              font-size: 48px;
              font-weight: bold;
              color: #28a745;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <div style="font-size: 64px;">✅</div>
            <h1>Restoration Complete!</h1>
            <div class="stats">${restored}</div>
            <p>Memory answer events have been successfully restored.</p>
            <p style="margin-top: 30px;">
              <a href="/admin-api/restore-memory-answers">← Back to Restore Page</a>
            </p>
          </div>
        </body>
        </html>
      `)
    } catch (error: any) {
      console.error('❌ [RESTORE] Restoration failed:', error)
      reply.type('text/html').send(`
        <!DOCTYPE html>
        <html><body style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: red;">❌ Restoration Failed</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
        <p><a href="/admin-api/restore-memory-answers">← Try Again</a></p>
        </body></html>
      `)
    }
  })
}