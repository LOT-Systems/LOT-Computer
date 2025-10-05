import crypto from 'crypto'
import { FastifyInstance, FastifyRequest } from 'fastify'
import fastifyRateLimit from '@fastify/rate-limit'
import { Op } from 'sequelize'
import dayjs from '#server/utils/dayjs'
import config from '#server/config'
import { jwt } from '#server/utils'
import { sendEmail } from '#server/utils/email'
import { EMAIL_REGEX } from '#server/constants'
import { sync } from '../sync'

const EMAIL_CODE_VALID_MINUTES = 10

export default async (fastify: FastifyInstance) => {
  fastify.register(async (fastify) => {
    await fastify.register(fastifyRateLimit, {
      max: 1,
      timeWindow: 20e3,
      hook: 'preHandler',
      cache: 10e3,
      addHeadersOnExceeding: {
        'x-ratelimit-limit': false,
        'x-ratelimit-remaining': false,
        'x-ratelimit-reset': false,
      },
      addHeaders: {
        'x-ratelimit-limit': false,
        'x-ratelimit-remaining': false,
        'x-ratelimit-reset': false,
        'retry-after': false,
      },
      errorResponseBuilder: (_, context) => ({
        statusCode: 429,
        message: `Too many requests. Try after ${context.after}.`,
      }),
      onExceeded: (req: FastifyRequest) => {
        req.log.warn(
          `Rate limit exceeded for ${req.ip} at ${req.url} with ${req.method}`
        )
      },
    })
    fastify.post(
      '/email',
      {
        schema: {
          body: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string' },
            },
          },
        },
        attachValidation: true,
      },
      async (req: FastifyRequest<{ Body: { email: string } }>, reply) => {
        if (req.validationError) {
          return reply.throw.badParams('Invalid parameters.')
        }
        const email = (req.body.email || '').trim().toLowerCase()
        if (!email || !EMAIL_REGEX.test(email)) {
          return reply.throw.badParams('Invalid email.')
        }
        const code = crypto.randomInt(1e5, 1e6 - 1).toString()
        const token = crypto.randomBytes(16).toString('hex')
        const magicLinkToken = crypto.randomBytes(32).toString('hex')
        try {
          await fastify.models.EmailCode.create({
            code,
            token,
            email,
            magicLinkToken,
            validUntil: dayjs()
              .add(EMAIL_CODE_VALID_MINUTES, 'minutes')
              .toDate(),
          })
          await sendEmail({
            to: email,
            html: `${code}`,
            subject: `Your code – ${code}`,
          })
          return { token }
        } catch (err) {
          return reply.throw.internalError(
            'Unable to send sign up code. The problem was reported. Please try again later.'
          )
        }
      }
    )
  })

  fastify.post(
    '/email/code',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'code', 'token'],
          properties: {
            email: { type: 'string' },
            code: { type: 'string' },
            token: { type: 'string' },
          },
        },
      },
      attachValidation: true,
    },
    async (
      req: FastifyRequest<{
        Body: { email: string; code: string; token: string }
      }>,
      reply
    ) => {
      if (req.validationError) {
        return reply.throw.badParams('Invalid parameters.')
      }
      const { email, token } = req.body
      const code = req.body.code.trim()
      const emailCode = await fastify.models.EmailCode.findOne({
        where: {
          email,
          token,
          code,
          validUntil: { [Op.gte]: dayjs().toDate() },
        },
        order: [['createdAt', 'DESC']],
      })
      if (!emailCode) {
        return reply.throw.authException(
          'Your login code was incorrect or expired. Please try again.'
        )
      }
      await emailCode.destroy()
      let user = await fastify.models.User.findOne({ where: { email } })
      if (!user) {
        user = await fastify.models.User.create({ email })
      }
      if (!user.joinedAt) {
        await user.set({ joinedAt: new Date() }).save()
      }
      const jwtSignRes = await jwt.sign({ id: user.id })
      if (!jwtSignRes.success) {
        throw new Error('Unable to sign JWT token')
      }
      const session = await fastify.models.Session.create({
        token: jwtSignRes.data,
        userId: user.id,
      })
      reply.setCookie(config.jwt.cookieKey, session.token, {
        path: '/',
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
      })
      process.nextTick(async () => {
        await user?.ping()
        const usersTotal = await fastify.models.User.countJoined()
        const usersOnline = await fastify.models.User.countOnline()
        sync.emit('users_total', { value: usersTotal })
        sync.emit('users_online', { value: usersOnline })
      })
      return reply.ok()
    }
  )

  fastify.get('/logout', async (req, reply) => {
    return reply.clearCookie(config.jwt.cookieKey).redirect('/')
  })
}
