import { Op, Sequelize, Filterable } from 'sequelize'
import { Literal } from 'sequelize/types/utils'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { AdminUsersSort, LogEvent, Paginated, User } from '#shared/types'
import { fp } from '#shared/utils'
import { buildPrompt, completeAndExtractQuestion, generateUserSummary, generateMemoryStory, extractUserTraits, determineUserCohort } from '#server/utils/memory'
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

  // Psychological profile endpoint for admins
  fastify.get(
    '/users/:userId/profile',
    async (req: FastifyRequest<{ Params: { userId: string } }>, reply) => {
      const user = await fastify.models.User.findByPk(req.params.userId)
      if (!user) return reply.throw.notFound()

      try {
        // Check if user has Usership tag
        const hasUsershipTag = user.tags.some(
          (tag) => tag.toLowerCase() === 'usership'
        )

        if (!hasUsershipTag) {
          return {
            hasUsership: false,
            message: 'User does not have Usership - psychological profile not available'
          }
        }

        // Get ALL logs (answers + notes) for psychological analysis
        const logs = await fastify.models.Log.findAll({
          where: {
            userId: user.id,
          },
          order: [['createdAt', 'DESC']],
          limit: 50,
        })

        if (logs.length === 0) {
          return {
            hasUsership: true,
            message: 'User has not completed any Memory questions yet',
            answerCount: 0
          }
        }

        // Extract traits and determine psychological archetype + behavioral cohort
        const analysis = extractUserTraits(logs)
        const { traits, patterns, psychologicalDepth } = analysis
        const cohortResult = determineUserCohort(traits, patterns, psychologicalDepth)

        console.log(`🧠 Admin viewing profile for user ${user.email}:`, {
          archetype: cohortResult.archetype,
          behavioralCohort: cohortResult.behavioralCohort,
          traits,
          values: psychologicalDepth.values,
          selfAwareness: psychologicalDepth.selfAwareness,
          answerCount: logs.filter(l => l.event === 'answer').length,
          noteCount: logs.filter(l => l.event === 'note' && l.text && l.text.length > 20).length
        })

        return {
          hasUsership: true,
          // Psychological depth (soul level)
          archetype: cohortResult.archetype,
          archetypeDescription: cohortResult.description,
          coreValues: psychologicalDepth.values.map(v => v.charAt(0).toUpperCase() + v.slice(1)),
          emotionalPatterns: psychologicalDepth.emotionalPatterns.map(p => p.replace(/([A-Z])/g, ' $1').trim()),
          selfAwarenessLevel: psychologicalDepth.selfAwareness,
          // Behavioral patterns (surface level)
          behavioralCohort: cohortResult.behavioralCohort,
          behavioralTraits: traits.map(t => t.replace(/([A-Z])/g, ' $1').trim()),
          patternStrength: Object.entries(patterns)
            .filter(([_, v]) => v > 0)
            .map(([k, v]) => ({ trait: k.replace(/([A-Z])/g, ' $1').trim(), count: v }))
            .sort((a, b) => b.count - a.count),
          // Meta
          answerCount: logs.filter(l => l.event === 'answer').length,
          noteCount: logs.filter(l => l.event === 'note' && l.text && l.text.length > 20).length
        }
      } catch (error: any) {
        console.error('❌ Error generating user profile for admin:', { error: error.message, userId: user.id })
        return { hasUsership: false, error: 'Unable to generate profile at this time' }
      }
    }
  )
}