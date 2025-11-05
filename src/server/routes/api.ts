import { Op } from 'sequelize'
import { FastifyInstance, FastifyRequest } from 'fastify'
import seedrandom from 'seedrandom'
import {
  ChatMessageLikeEventPayload,
  ChatMessageLikePayload,
  PublicChatMessage,
  UserSettings,
  UserTag,
} from '#shared/types'
import config from '#server/config'
import { fp } from '#shared/utils'
import {
  COUNTRY_BY_ALPHA3,
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  LOG_MESSAGE_STALE_TIME_MINUTES,
  MAX_LOG_TEXT_LENGTH,
  MAX_SYNC_CHAT_MESSAGE_LENGTH,
  SYNC_CHAT_MESSAGES_TO_SHOW,
  USER_SETTING_NAMES,
  WEATHER_STALE_TIME_MINUTES,
} from '#shared/constants'
import { sync } from '../sync.js'
import * as weather from '#server/utils/weather'
import { getLogContext } from '#server/utils/logs'
import { defaultQuestions, defaultReplies } from '#server/utils/questions'
import { buildPrompt, completeAndExtractQuestion } from '#server/utils/memory'
import dayjs from '#server/utils/dayjs'

export default async (fastify: FastifyInstance) => {
  fastify.get('/sync', async (req, reply) => {
    // const id = String(Math.ceil(Math.random() * 99)).padStart(2, '0')
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    // if (config.admins.includes(req.user.email)) {
    //   console.log(`~~> SSE ${id}: connected`)
    // }

    const write = (data: object) => {
      const message = JSON.stringify(data)
      reply.raw.write(`data: ${message}\n\n`)
      reply.raw.flushHeaders()
    }

    // initial values
    const usersTotal = await fastify.models.User.countJoined()
    const usersOnline = await fastify.models.User.countOnline()
    const liveMessage = await fastify.models.LiveMessage.getMessage()
    write({ event: 'live_message', data: { message: liveMessage } })
    setTimeout(() => {
      write({ event: 'users_online', data: { value: usersOnline } })
      setTimeout(() => {
        write({ event: 'users_total', data: { value: usersTotal } })
      }, 300)
    }, 300)

    const { dispose } = sync.listen('*', async (data: any, event: any) => {
      // if (config.admins.includes(req.user.email)) {
      //   console.log(`~~> SSE ${id}: "${event}"`, data)
      // }
      switch (event) {
        case 'users_total':
        case 'users_online':
        case 'live_message': {
          write({ event, data })
          break
        }
        case 'chat_message': {
          // TODO: check if user is allowed to use chat
          write({ event, data })
          break
        }
        case 'chat_message_like': {
          const payload = data as ChatMessageLikeEventPayload
          const likes = await fastify.models.ChatMessageLike.findAll({
            where: { messageId: payload.messageId },
          })
          const updatedPayload: ChatMessageLikeEventPayload = {
            ...payload,
            likes: likes.length,
            likesCount: likes.length,
            isLiked: likes.some(fp.propEq('userId', req.user.id)),
          }
          write({ event, data: updatedPayload })
        }
      }
    })

    const loopId = setInterval(() => {
      const time = Date.now()
      write({ event: 'ping', data: { time } })
      // if (config.admins.includes(req.user.email)) {
      //   console.log(`~~> SSE ${id}: loop ping ${time}`)
      // }
    }, 15e3)

    await req.user.ping()

    req.raw.on('close', () => {
      // if (config.admins.includes(req.user.email)) {
      //   console.log(`~~> SSE ${id}: closed`)
      // }
      dispose()
      reply.raw.end()
      clearInterval(loopId)
    })
  })

  fastify.get('/me', async (req: FastifyRequest, reply) => {
    const profile = req.user.useProfileView()
    const isAdmin = req.user.isAdmin() || undefined
    req.user.deferredPing()
    return { ...profile, isAdmin }
  })

  fastify.post(
    '/settings',
    async (req: FastifyRequest<{ Body: UserSettings }>, reply) => {
      req.user.deferredPing()
      const prevValues = fp.pick(USER_SETTING_NAMES)(req.user)
      const body: UserSettings = fp.pick(USER_SETTING_NAMES)(req.body)
      if (body.country) {
        const country = COUNTRY_BY_ALPHA3[body.country]
        if (!country) {
          return reply.throw.badParams('Invalid country code')
        }
      }
      await req.user.set(body).save()
      process.nextTick(async () => {
        let newTimeZone = null
        if (body.city && body.country) {
          const coordinates = await weather.getCoordinates(
            body.city,
            body.country
          )
          if (coordinates) {
            newTimeZone = await weather.getTimeZone(
              coordinates.lat,
              coordinates.lon
            )
          }
        }
        await req.user.set({ timeZone: newTimeZone }).save()
      })
      process.nextTick(async () => {
        const changes = USER_SETTING_NAMES.reduce((acc, x) => {
          if (prevValues[x] !== body[x]) {
            return { ...acc, [x]: [prevValues[x], body[x]] }
          }
          return acc
        }, {} as Record<keyof UserSettings, [string, string]>)
        const context = await getLogContext(req.user)
        await fastify.models.Log.create({
          userId: req.user.id,
          event: 'settings_change',
          text: '',
          metadata: {
            changes,
          },
          context,
        })
      })
      reply.ok()
    }
  )

  fastify.get('/live-message', async (req: FastifyRequest, reply) => {
    const record = await fastify.models.LiveMessage.findOne()
    const message = record?.message || ''
    return { message }
  })

  fastify.get('/chat-messages', async (req: FastifyRequest, reply) => {
    const messages = await fastify.models.ChatMessage.findAll({
      order: [['createdAt', 'DESC']],
      limit: req.user.isAdmin() ? undefined : SYNC_CHAT_MESSAGES_TO_SHOW,
    })

    const userIds = messages.map((m) => m.authorUserId)
    const users = await fastify.models.User.findAll({
      where: { id: userIds },
    })
    const userById = users.reduce(fp.by('id'), {})

    const likes = await fastify.models.ChatMessageLike.findAll({
      where: { messageId: messages.map(fp.prop('id')) },
    })
    const likesByMessageId = likes.reduce(fp.groupBy('messageId'), {})

    const result: PublicChatMessage[] = messages.map((x) => {
      const likes = likesByMessageId[x.id] || []
      return {
        id: x.id,
        authorUserId: x.authorUserId,
        message: x.message,
        author: userById[x.authorUserId].firstName || null,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
        likes: likes.length,
        likesCount: likes.length,
        isLiked: likes.some(fp.propEq('userId', req.user.id)),
      }
    })
    return result
  })

  fastify.post(
    '/chat-messages',
    async (req: FastifyRequest<{ Body: { message: string } }>, reply) => {
      const message = req.body.message.slice(0, MAX_SYNC_CHAT_MESSAGE_LENGTH)
      const chatMessage = await fastify.models.ChatMessage.create({
        authorUserId: req.user.id,
        message,
      })
      sync.emit('chat_message', {
        id: chatMessage.id,
        message: chatMessage.message,
        author: req.user.firstName,
        createdAt: chatMessage.createdAt,
        likes: 0,
        isLiked: false,
      })
      process.nextTick(async () => {
        const context = await getLogContext(req.user)
        await fastify.models.Log.create({
          userId: req.user.id,
          event: 'chat_message',
          text: '',
          metadata: {
            chatMessageId: chatMessage.id,
            message: chatMessage.message,
          },
          context,
        })
      })
      return reply.ok()
    }
  )

  fastify.post(
    '/chat-messages/like',
    async (req: FastifyRequest<{ Body: ChatMessageLikePayload }>, reply) => {
      const message = await fastify.models.ChatMessage.findByPk(
        req.body.messageId
      )
      if (!message) return reply.throw.notFound()
      if (message.authorUserId === req.user.id) {
        return reply.ok()
      }
      let isLiked = false
      let likeRecord = await fastify.models.ChatMessageLike.findOne({
        where: { messageId: req.body.messageId, userId: req.user.id },
      })
      if (likeRecord) {
        await likeRecord.destroy()
      } else {
        isLiked = true
        likeRecord = await fastify.models.ChatMessageLike.create({
          userId: req.user.id,
          messageId: req.body.messageId,
        })
      }
      sync.emit('chat_message_like', {
        messageId: message.id,
        likes: 0,
        likesCount: 0,
        isLiked: false,
      })
      process.nextTick(async () => {
        if (isLiked) {
          const context = await getLogContext(req.user)
          await fastify.models.Log.create({
            userId: req.user.id,
            event: 'chat_message_like',
            text: '',
            metadata: {
              chatMessageLikeId: likeRecord?.id || null,
              chatMessageId: message.id,
              message: message.message,
              isLiked,
            },
            context,
          })
        } else {
          await fastify.models.Log.destroy({
            where: {
              userId: req.user.id,
              event: 'chat_message_like',
              'metadata.chatMessageId': message.id,
            },
          })
        }
      })
      return reply.ok()
    }
  )

  fastify.get('/weather', async (req: FastifyRequest, reply) => {
    try {
      const { city, country } = req.user
      if (!city || !country) {
        return null
      }
      const cachedRecord = await fastify.models.WeatherResponse.findOne({
        where: {
          city,
          country,
          createdAt: {
            [Op.gt]: dayjs()
              .subtract(WEATHER_STALE_TIME_MINUTES, 'minute')
              .toDate(),
          },
        },
      })
      if (cachedRecord) {
        return cachedRecord.useRecordView()
      }
      const coordinates = await weather.getCoordinates(city, country)
      if (!coordinates) {
        await fastify.models.WeatherResponse.create({
          city,
          country,
          weather: null,
          // TODO: add "permanent: true"
        })
        return null
      }
      const data = await weather.getWeather(coordinates.lat, coordinates.lon)
      const newCachedRecord = await fastify.models.WeatherResponse.create({
        city,
        country,
        weather: data,
      })
      return newCachedRecord.useRecordView()
    } catch (error) {
      // Weather API unavailable or misconfigured - return null so app still works
      console.warn('Weather API error (API key may be missing):', error.message)
      return null
    }
  })

  fastify.get('/logs', async (req: FastifyRequest, reply) => {
    const logs = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
        ...(req.user.hideActivityLogs ? { event: 'note' } : {}),
      },
      order: [['createdAt', 'DESC']],
    }).then((xs) =>
      xs.filter((x, i) => x.event !== 'note' || (x.text && x.text.length) || i === 0)
    )

    const recentLog = logs[0]
    const now = dayjs()
    if (
      !recentLog ||
      recentLog.event !== 'note' ||
      (recentLog.text &&
        now.diff(recentLog.updatedAt, 'minute') >
          LOG_MESSAGE_STALE_TIME_MINUTES)
    ) {
      const emptyLog = await fastify.models.Log.create({
        userId: req.user.id,
        text: '',
        event: 'note',
      })
      return [emptyLog, ...logs]
    }
    return logs
  })

  fastify.put(
    '/logs/:id',
    async (
      req: FastifyRequest<{
        Params: { id: string }
        Body: { text: string }
      }>,
      reply
    ) => {
      const text = (req.body.text || '').trim().slice(0, MAX_LOG_TEXT_LENGTH)
      const log = await fastify.models.Log.findByPk(req.params.id)
      if (!log) return reply.throw.notFound()
      if (log.event !== 'note') return log

      await log.set({ text }).save()
      process.nextTick(async () => {
        if (!Object.keys(log.context).length) {
          const context = await getLogContext(req.user)
          await log.set({ context }).save()
        }
      })
      return log
    }
  )

  fastify.get(
    '/memory',
    async (req: FastifyRequest<{ Querystring: { d: string } }>, reply) => {
      const MORNING_HOUR = 7
      const EVENING_HOUR = 19
      function getPeriodEdges(
        inputDate: dayjs.Dayjs
      ): [dayjs.Dayjs, dayjs.Dayjs] {
        const dayStart = inputDate
          .set('hour', MORNING_HOUR)
          .set('minute', 0)
          .set('second', 0)
        const dayEnd = inputDate
          .set('hour', EVENING_HOUR)
          .set('minute', 0)
          .set('second', 0)
        const nightStart = dayEnd
        const nightEnd = dayStart.add(1, 'day')

        if (inputDate.isAfter(dayStart) && inputDate.isBefore(dayEnd)) {
          return [dayStart, dayEnd]
        } else {
          return [nightStart, nightEnd]
        }
      }

      const localDate = dayjs(atob(req.query.d), DATE_TIME_FORMAT)
      if (!localDate.isValid()) {
        return reply.throw.badParams()
      }

      const now = dayjs()
      const localDateShift = now.diff(localDate, 'minute')
      const periodEdges = getPeriodEdges(localDate)
      const utcPeriodEdges = [
        periodEdges[0].add(localDateShift, 'minute'),
        periodEdges[1].add(localDateShift, 'minute'),
      ]
      const isNightPeriod = periodEdges[0].hour() === EVENING_HOUR
      const isRecentlyAsked = await fastify.models.Answer.count({
        where: {
          userId: req.user.id,
          createdAt: {
            [Op.gte]: utcPeriodEdges[0].toDate(),
            [Op.lte]: utcPeriodEdges[1].toDate(),
          },
        },
      }).then(Boolean)
      if (isRecentlyAsked) return null

      // Generate AI-based context-aware question
      const logs = await fastify.models.Log.findAll({
        where: {
          userId: req.user.id,
        },
        order: [['createdAt', 'DESC']],
        limit: 20,
      })

      const prompt = await buildPrompt(req.user, logs)
      const question = await completeAndExtractQuestion(prompt, req.user)

      return question
    }
  )

  fastify.post(
    '/memory/answer',
    async (
      req: FastifyRequest<{
        Body: {
          questionId: string
          option: string
          question?: string
          options?: string[]
        }
      }>,
      reply
    ) => {
      const { questionId, option } = req.body

      // Try to find in default questions first (backwards compatibility)
      let question = defaultQuestions.find(fp.propEq('id', questionId))
      let questionText: string
      let questionOptions: string[]

      if (question) {
        // Default question
        questionText = question.question
        questionOptions = question.options
      } else {
        // AI-generated question - accept from request body
        if (!req.body.question || !req.body.options) {
          return reply.throw.badParams()
        }
        questionText = req.body.question
        questionOptions = req.body.options
      }

      // Validate the selected option
      if (!questionOptions.includes(option)) {
        return reply.throw.badParams()
      }

      // TODO: check if user is allowed to answer

      const answer = await fastify.models.Answer.create({
        userId: req.user.id,
        question: questionText,
        options: questionOptions,
        answer: option,
        metadata: { questionId },
      })

      process.nextTick(async () => {
        const context = await getLogContext(req.user)
        await fastify.models.Log.create({
          userId: req.user.id,
          event: 'answer',
          text: '',
          metadata: {
            questionId,
            answerId: answer.id,
            question: questionText,
            options: questionOptions,
            answer: option,
          },
          context,
        })
      })

      return { response: fp.randomElement(defaultReplies) }
    }
  )
}