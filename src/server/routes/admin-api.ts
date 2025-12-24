import { Op, Sequelize, Filterable } from 'sequelize'
import { Literal } from 'sequelize/types/utils'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { AdminUsersSort, LogEvent, Paginated, User } from '#shared/types'
import { fp } from '#shared/utils'
import { buildPrompt, completeAndExtractQuestion, generateUserSummary, generateMemoryStory } from '#server/utils/memory'
import { sync } from '../sync.js'
import dayjs from '../utils/dayjs.js'

export default async (fastify: FastifyInstance) => {
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
        // Catch placeholder text that might have been saved
        return text.includes('will be deleted') ||
               text.includes('log record') ||
               text.includes('type here')
      })

      if (emptyLogs.length === 0) {
        console.log('✅ [ADMIN] No empty logs found - database is clean')
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
    button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    button:hover { background: #c82333; }
    button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    #result {
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
      display: none;
    }
    .success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
    .error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
    .info { color: #666; font-size: 14px; margin-top: 20px; }
    .breakdown {
      margin-top: 15px;
      font-family: monospace;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧹 Admin: Cleanup All Empty Logs</h1>
    <p>This will delete ALL empty log entries across ALL users in the database.</p>

    <div class="warning">
      ⚠️ <strong>Warning:</strong> This action affects all users. Only use this if you're sure empty logs are accumulating due to a bug.
    </div>

    <button id="cleanupBtn" onclick="runCleanup()">Delete All Empty Logs (All Users)</button>
    <div id="result"></div>

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

  <script>
    async function runCleanup() {
      const btn = document.getElementById('cleanupBtn');
      const result = document.getElementById('result');

      if (!confirm('Are you sure you want to delete ALL empty logs from ALL users?')) {
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Cleaning up...';
      result.style.display = 'none';

      try {
        const response = await fetch('/admin-api/cleanup-all-empty-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        result.style.display = 'block';
        if (data.deleted === 0) {
          result.className = 'info';
          result.innerHTML = '✨ <strong>Database is clean!</strong><br>No empty logs found.';
        } else {
          result.className = 'success';
          result.innerHTML = \`
            ✅ <strong>Cleanup Complete!</strong><br>
            Deleted <strong>\${data.deleted}</strong> empty logs from <strong>\${data.affectedUsers}</strong> users<br>
            \${data.breakdown ? '<div class="breakdown">Breakdown by user:<br>' + Object.entries(data.breakdown).map(([userId, count]) => \`\${userId.substring(0, 8)}...: \${count} logs\`).join('<br>') + '</div>' : ''}
          \`;
        }

        btn.disabled = false;
        btn.textContent = 'Delete All Empty Logs (All Users)';
      } catch (error) {
        result.style.display = 'block';
        result.className = 'error';
        result.innerHTML = '❌ <strong>Error:</strong> ' + error.message;
        btn.disabled = false;
        btn.textContent = 'Try Again';
      }
    }
  </script>
</body>
</html>`;

    reply.type('text/html').send(html);
  })
}