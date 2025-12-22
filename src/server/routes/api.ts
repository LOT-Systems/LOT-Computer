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
import { buildPrompt, completeAndExtractQuestion, generateMemoryStory, generateRecipeSuggestion, extractUserTraits, determineUserCohort, calculateIntelligentPacing } from '#server/utils/memory'
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
          break
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
    const metadata = req.user.metadata || {}
    req.user.deferredPing()
    return { ...profile, isAdmin, metadata }
  })

  // Memory prompt status - debugging endpoint
  fastify.get('/memory-status', async (req: FastifyRequest<{ Querystring: { d?: string } }>, reply) => {
    try {
      // Get user's local time from query parameter (like sync endpoint)
      let localDate = dayjs()
      if (req.query.d) {
        try {
          localDate = dayjs(atob(req.query.d), DATE_TIME_FORMAT)
        } catch {
          // Invalid date, use server time
        }
      }

      const pacingInfo = await calculateIntelligentPacing(
        req.user.id,
        localDate,
        fastify.models
      )

      const hour = localDate.hour()
      const isWeekend = localDate.day() === 0 || localDate.day() === 6

      // Time windows removed - prompts available 24/7
      const timeWindow = 'All day (24/7)'

      // Check if recently asked (last 2 hours)
      const twoHoursAgo = dayjs().subtract(2, 'hour')
      const recentAnswerCount = await fastify.models.Answer.count({
        where: {
          userId: req.user.id,
          createdAt: {
            [Op.gte]: twoHoursAgo.toDate(),
          },
        },
      })

      return {
        currentTime: localDate.format('h:mm A'),
        currentHour: hour,
        isWeekend,
        timeWindow,
        shouldShowPrompt: pacingInfo.shouldShowPrompt,
        promptsShownToday: pacingInfo.promptsShownToday,
        promptQuotaToday: pacingInfo.promptQuotaToday,
        remainingToday: pacingInfo.promptQuotaToday - pacingInfo.promptsShownToday,
        dayNumber: pacingInfo.dayNumber,
        answeredInLast2Hours: recentAnswerCount > 0,
        nextPromptAvailable: pacingInfo.shouldShowPrompt && recentAnswerCount === 0,
        blockReason: !pacingInfo.shouldShowPrompt
          ? 'Daily quota reached'
          : recentAnswerCount > 0
            ? 'Answered within last 2 hours'
            : null,
      }
    } catch (error: any) {
      console.error('Memory status error:', error)
      return {
        error: error.message,
      }
    }
  })

  // Visitor statistics endpoint
  fastify.get('/visitor-stats', async (req: FastifyRequest, reply) => {
    try {
      // Get total site visitors from a global counter
      const globalStats = await fastify.models.User.findOne({
        where: { email: 'system@lot' } // Special system user for global stats
      })

      const totalVisitors = globalStats?.metadata?.totalSiteVisitors || 0

      // Get current user's profile visits
      const userProfileVisits = req.user.metadata?.profileVisits || 0

      return {
        totalSiteVisitors: totalVisitors,
        userProfileVisits: userProfileVisits
      }
    } catch (error) {
      console.error('Error fetching visitor stats:', error)
      return {
        totalSiteVisitors: 0,
        userProfileVisits: 0
      }
    }
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

  fastify.post<{
    Body: {
      theme: string
      baseColor?: string
      accentColor?: string
      customThemeEnabled: boolean
    }
  }>(
    '/theme-change',
    async (req: FastifyRequest<{
      Body: {
        theme: string
        baseColor?: string
        accentColor?: string
        customThemeEnabled: boolean
      }
    }>, reply) => {
      const { theme, baseColor, accentColor, customThemeEnabled } = req.body

      // Store theme in user metadata for public profile
      const currentMetadata = req.user.metadata || {}
      const updatedMetadata = {
        ...currentMetadata,
        theme: {
          theme,
          baseColor: baseColor || null,
          accentColor: accentColor || null,
          customThemeEnabled,
        },
      }
      await req.user.set({ metadata: updatedMetadata }).save()

      // Log theme change asynchronously
      process.nextTick(async () => {
        const context = await getLogContext(req.user)
        await fastify.models.Log.create({
          userId: req.user.id,
          event: 'theme_change',
          text: '',
          metadata: {
            theme,
            baseColor: baseColor || null,
            accentColor: accentColor || null,
            customThemeEnabled,
            userTags: req.user.tags,
          },
          context,
        })
      })

      reply.ok()
    }
  )

  fastify.post<{
    Body: { soundDescription: string | null }
  }>(
    '/update-current-sound',
    async (req: FastifyRequest<{
      Body: { soundDescription: string | null }
    }>, reply) => {
      const { soundDescription } = req.body

      // Update user metadata with current sound description
      const currentMetadata = req.user.metadata || {}
      const updatedMetadata = {
        ...currentMetadata,
        currentSound: soundDescription,
      }

      await req.user.set({ metadata: updatedMetadata }).save()

      reply.ok()
    }
  )

  fastify.post<{
    Body: {
      privacy: {
        isPublicProfile: boolean
        showWeather: boolean
        showLocalTime: boolean
        showCity: boolean
        showSound: boolean
        showMemoryStory: boolean
        customUrl?: string | null
      }
    }
  }>(
    '/update-privacy',
    async (req: FastifyRequest<{
      Body: {
        privacy: {
          isPublicProfile: boolean
          showWeather: boolean
          showLocalTime: boolean
          showCity: boolean
          showSound: boolean
          showMemoryStory: boolean
          customUrl?: string | null
        }
      }
    }>, reply) => {
      const { privacy } = req.body

      // Validate custom URL if provided
      if (privacy.customUrl) {
        const urlPattern = /^[a-zA-Z0-9_-]{3,30}$/
        if (!urlPattern.test(privacy.customUrl)) {
          return reply.code(400).send({
            error: 'Invalid custom URL',
            message: 'Custom URL must be 3-30 characters (letters, numbers, dashes, underscores only)'
          })
        }

        // Check if custom URL is already taken by another user
        const users = await fastify.models.User.findAll()
        const existingUser = users.find(u =>
          u.id !== req.user.id &&
          u.metadata?.privacy?.customUrl === privacy.customUrl
        )
        if (existingUser) {
          return reply.code(400).send({
            error: 'Custom URL taken',
            message: 'This custom URL is already in use by another user'
          })
        }
      }

      // Update user metadata with privacy settings
      const currentMetadata = req.user.metadata || {}
      const updatedMetadata = {
        ...currentMetadata,
        privacy,
      }

      await req.user.set({ metadata: updatedMetadata }).save()

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

      // Get updated likes count after the toggle
      const allLikes = await fastify.models.ChatMessageLike.findAll({
        where: { messageId: req.body.messageId },
      })

      sync.emit('chat_message_like', {
        messageId: message.id,
        userId: req.user.id,
        likes: allLikes.length,
        likesCount: allLikes.length,
        isLiked,
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
    } catch (error: any) {
      // Weather API unavailable or misconfigured - return null so app still works
      console.warn('Weather API error (API key may be missing):', error?.message || error)
      return null
    }
  })

  fastify.get('/logs', async (req: FastifyRequest, reply) => {
    const allLogs = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
        ...(req.user.hideActivityLogs ? { event: 'note' } : {}),
      },
      order: [['createdAt', 'DESC']],
    })

    // Helper to check if a log is empty or has placeholder text
    const isEmptyOrPlaceholder = (log: any) => {
      if (log.event !== 'note') return false
      if (!log.text || log.text.trim().length === 0) return true

      const text = log.text.trim().toLowerCase()

      // Check for placeholder text variations (case-insensitive)
      if (text === 'the log record will be deleted') return true
      if (text === 'the log will be deleted') return true
      if (text.includes('will be deleted')) return true
      if (text.includes('log record')) return true

      // Check if text is very short (likely placeholder or test)
      if (text.length < 5) return true

      return false
    }

    // Find ALL empty/placeholder notes
    const emptyNotes = allLogs.filter(isEmptyOrPlaceholder)

    // Delete ALL empty/placeholder notes from database
    if (emptyNotes.length > 0) {
      const emptyIds = emptyNotes.map((x) => x.id)
      await fastify.models.Log.destroy({
        where: { id: emptyIds },
      })
      console.log(`🧹 Deleted ${emptyIds.length} empty/placeholder logs for user ${req.user.id}`)
    }

    // Filter to show only logs with actual content
    const contentLogs = allLogs.filter((x) => {
      if (x.event !== 'note') return true // Keep activity logs
      if (isEmptyOrPlaceholder(x)) return false // Exclude empty/placeholder
      return true // Keep notes with real content
    })

    // Always create ONE fresh empty note for input
    const emptyLog = await fastify.models.Log.create({
      userId: req.user.id,
      text: '',
      event: 'note',
    })

    // Return: [fresh empty note at top, ...content logs below]
    return [emptyLog, ...contentLogs]
  })

  // Diagnostic endpoint to manually cleanup empty logs
  fastify.post('/logs/cleanup', async (req: FastifyRequest, reply) => {
    const allLogs = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
        event: 'note',
      },
      order: [['createdAt', 'DESC']],
    })

    // Check for empty or placeholder text
    const isEmptyOrPlaceholder = (log: any) => {
      if (!log.text || log.text.trim().length === 0) return true
      const text = log.text.trim()
      return text === 'The log record will be deleted' || text === 'The log will be deleted'
    }

    const emptyNotes = allLogs.filter(isEmptyOrPlaceholder)
    const placeholderExamples = emptyNotes.slice(0, 5).map((x) => ({
      id: x.id,
      text: x.text || '(empty)',
      createdAt: x.createdAt,
    }))

    const diagnostics = {
      timestamp: new Date().toISOString(),
      codeVersion: '2024-12-21-v3', // Version marker - updated
      totalNotes: allLogs.length,
      emptyNotesFound: emptyNotes.length,
      emptyNotesDeleted: 0,
      examples: placeholderExamples,
      oldestEmpty: emptyNotes.length > 0 ? emptyNotes[emptyNotes.length - 1].createdAt : null,
      newestEmpty: emptyNotes.length > 0 ? emptyNotes[0].createdAt : null,
    }

    if (emptyNotes.length > 0) {
      const emptyIds = emptyNotes.map((x) => x.id)
      await fastify.models.Log.destroy({
        where: { id: emptyIds },
      })
      diagnostics.emptyNotesDeleted = emptyIds.length
      console.log(`🧹 [MANUAL CLEANUP] Deleted ${emptyIds.length} empty/placeholder notes for user ${req.user.id}`)
    }

    return diagnostics
  })

  fastify.post(
    '/logs',
    async (
      req: FastifyRequest<{
        Body: { text: string }
      }>,
      reply
    ) => {
      const text = (req.body.text || '').trim().slice(0, MAX_LOG_TEXT_LENGTH)
      if (!text) return reply.throw.badParams('Log text is required')

      const log = await fastify.models.Log.create({
        userId: req.user.id,
        text,
        event: 'note',
      })

      // Add context asynchronously
      process.nextTick(async () => {
        const context = await getLogContext(req.user)
        await log.set({ context }).save()
      })

      return log
    }
  )

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

      // If user backspaced all content, delete the log instead of saving empty text
      if (!text || text.length === 0) {
        await log.destroy()
        console.log(`🗑️  Deleted empty log ${log.id} for user ${req.user.id}`)
        return { id: log.id, deleted: true }
      }

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

      // INTELLIGENT PACING: Determine daily prompt quota and timing
      const { shouldShowPrompt, isWeekend, promptQuotaToday, promptsShownToday } =
        await calculateIntelligentPacing(req.user.id, localDate, fastify.models)

      console.log(`📊 Intelligent Pacing Analysis:`, {
        userId: req.user.id,
        shouldShowPrompt,
        isWeekend,
        promptQuotaToday,
        promptsShownToday,
        currentTime: localDate.format('HH:mm'),
        dayOfWeek: localDate.format('dddd')
      })

      if (!shouldShowPrompt) {
        console.log(`⏸️ Skipping prompt: quota reached or bad timing`)
        return null
      }

      // Check if a prompt was shown in the last 2 hours (not entire period)
      const twoHoursAgo = now.subtract(2, 'hour')
      const isRecentlyAsked = await fastify.models.Answer.count({
        where: {
          userId: req.user.id,
          createdAt: {
            [Op.gte]: twoHoursAgo.toDate(),
          },
        },
      }).then(Boolean)
      if (isRecentlyAsked) {
        console.log(`⏸️ Skipping prompt: answered within last 2 hours`)
        return null
      }

      // Check if user has Usership tag for AI-generated questions
      const hasUsershipTag = req.user.tags.some(
        (tag) => tag.toLowerCase() === 'usership'
      )

      console.log(`Memory question request:`, {
        userId: req.user.id,
        userEmail: req.user.email,
        userTags: req.user.tags,
        hasUsershipTag,
        isRecentlyAsked,
      })

      if (hasUsershipTag) {
        // Usership users: Generate AI-based context-aware question using Claude
        console.log(`🔍 Attempting to generate AI question for Usership user ${req.user.id}`)
        try {
          const logs = await fastify.models.Log.findAll({
            where: {
              userId: req.user.id,
            },
            order: [['createdAt', 'DESC']],
            limit: 20,
          })

          const prompt = await buildPrompt(req.user, logs, isWeekend)
          const question = await completeAndExtractQuestion(prompt, req.user)

          return question
        } catch (error: any) {
          console.error('❌ Memory question generation failed:', {
            error: error.message,
            stack: error.stack,
            userId: req.user.id,
            userTags: req.user.tags,
            timestamp: new Date().toISOString(),
            apiKeysConfigured: {
              TOGETHER_API_KEY: !!process.env.TOGETHER_API_KEY,
              GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
              MISTRAL_API_KEY: !!process.env.MISTRAL_API_KEY,
              ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
              OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
            },
            note: 'At least ONE valid API key is required. Visit /api/public/test-ai-engines to diagnose.',
          })
          // Fall back to default questions on error
        }
      }

      {
        // Non-Usership users: Use hardcoded questions
        const prevQuestionIds = await fastify.models.Answer.findAll({
          where: {
            userId: req.user.id,
          },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'metadata'],
        }).then((xs) => Array.from(new Set(xs.map((x) => x.metadata.questionId))))

        let untouchedQuestions = defaultQuestions
        if (prevQuestionIds.length) {
          untouchedQuestions = defaultQuestions.filter(
            fp.propNotIn('id', prevQuestionIds)
          )
          if (!untouchedQuestions.length) {
            const longAgoAnsweredQuestionIds = prevQuestionIds.slice(
              -1 * Math.floor(prevQuestionIds.length / 3)
            )
            untouchedQuestions = defaultQuestions.filter(
              fp.propIn('id', longAgoAnsweredQuestionIds)
            )
          }
        }

        const rng = seedrandom(
          `${req.user.id} ${localDate.format(DATE_FORMAT)} ${
            isNightPeriod ? 'N' : 'D'
          }`
        )
        const question =
          untouchedQuestions[Math.floor(rng() * untouchedQuestions.length)]
        return question
      }
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

  // Get user's own Memory story
  fastify.get('/memory/story', async (req, reply) => {
    try {
      // Check if user has Usership tag
      const hasUsershipTag = req.user.tags.some(
        (tag) => tag.toLowerCase() === 'usership'
      )

      // Get user's answer logs
      const logs = await fastify.models.Log.findAll({
        where: {
          userId: req.user.id,
          event: 'answer',
        },
        order: [['createdAt', 'DESC']],
        limit: 100,
      })

      console.log(`Memory Story: User ${req.user.id} has ${logs.length} answers, hasUsership: ${hasUsershipTag}`)

      // Check if user has any answers
      if (logs.length === 0) {
        if (hasUsershipTag) {
          return {
            story: null,
            hasUsership: true,
            message: 'Start answering Memory questions to build your story.'
          }
        } else {
          return {
            story: null,
            hasUsership: false,
            message: 'Subscribe to Usership to unlock Memory Story feature. Visit brand.lot-systems.com'
          }
        }
      }

      // Only generate story for Usership users
      if (!hasUsershipTag) {
        return {
          story: null,
          hasUsership: false,
          answerCount: logs.length,
          message: 'Subscribe to Usership to unlock Memory Story generation.'
        }
      }

      // Generate story from answers
      console.log(`Generating story for user ${req.user.id}...`)
      const story = await generateMemoryStory(req.user, logs)
      console.log(`Story generated successfully (${story?.length || 0} chars)`)

      return {
        story,
        hasUsership: true,
        answerCount: logs.length
      }
    } catch (error: any) {
      console.error('❌ Error generating memory story:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      })
      return {
        story: null,
        hasUsership: req.user?.tags.some((tag) => tag.toLowerCase() === 'usership') || false,
        message: 'Unable to generate story at this time. Please try again later.',
        error: error.message
      }
    }
  })

  // Get user's cohort profile based on their answers
  fastify.get('/user-profile', async (req: FastifyRequest, reply) => {
    try {
      // Check if user has Usership tag
      const hasUsershipTag = req.user.tags.some(
        (tag) => tag.toLowerCase() === 'usership'
      )

      if (!hasUsershipTag) {
        return {
          hasUsership: false,
          message: 'Subscribe to Usership to unlock profile analysis'
        }
      }

      // Get answer logs
      const logs = await fastify.models.Log.findAll({
        where: {
          userId: req.user.id,
          event: 'answer',
        },
        order: [['createdAt', 'DESC']],
        limit: 30,
      })

      if (logs.length === 0) {
        return {
          hasUsership: true,
          message: 'Complete Memory questions to generate your profile',
          answerCount: 0
        }
      }

      // Extract traits and determine psychological archetype + behavioral cohort
      const analysis = extractUserTraits(logs)
      const { traits, patterns, psychologicalDepth } = analysis
      const cohortResult = determineUserCohort(traits, patterns, psychologicalDepth)

      console.log(`🧠 Profile request for ${req.user.email}:`, {
        archetype: cohortResult.archetype,
        behavioralCohort: cohortResult.behavioralCohort,
        traits,
        values: psychologicalDepth.values,
        selfAwareness: psychologicalDepth.selfAwareness,
        answerCount: logs.length
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
        answerCount: logs.length,
        noteCount: logs.filter(l => l.event === 'note' && l.text && l.text.length > 20).length
      }
    } catch (error: any) {
      console.error('❌ Error generating user profile:', {
        error: error.message,
        userId: req.user?.id,
      })
      return {
        hasUsership: false,
        error: 'Unable to generate profile at this time'
      }
    }
  })

  // Generate contextual recipe suggestion
  fastify.get(
    '/recipe-suggestion',
    async (
      req: FastifyRequest<{
        Querystring: { mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack' }
      }>,
      reply
    ) => {
      try {
        const mealTime = req.query.mealTime
        if (!mealTime || !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealTime)) {
          return reply.throw.badParams('Invalid mealTime. Must be breakfast, lunch, dinner, or snack')
        }

        console.log(`📋 Recipe suggestion request for ${mealTime} from user ${req.user.email}`)

        // Get recent logs for personalization (if user has Usership tag)
        const hasUsershipTag = req.user.tags.some(
          (tag) => tag.toLowerCase() === 'usership'
        )

        let logs: any[] = []
        if (hasUsershipTag) {
          // Get ALL logs (answers + notes) for deeper psychological analysis
          logs = await fastify.models.Log.findAll({
            where: {
              userId: req.user.id,
            },
            order: [['createdAt', 'DESC']],
            limit: 50,  // Increased to capture more context including notes
          })
        }

        const recipe = await generateRecipeSuggestion(req.user, mealTime, logs)

        console.log(`✅ Recipe suggestion generated: "${recipe}"`)

        return {
          recipe,
          mealTime,
          hasUsership: hasUsershipTag
        }
      } catch (error: any) {
        console.error('❌ Error generating recipe suggestion:', {
          error: error.message,
          stack: error.stack,
          userId: req.user?.id,
        })
        // Return fallback recipe
        return {
          recipe: 'Simple fresh salad with seasonal ingredients',
          mealTime: req.query.mealTime,
          error: 'Using fallback suggestion',
        }
      }
    }
  )

  // Generate daily world element
  fastify.post('/world/generate-element', async (req, reply) => {
    try {
      // Check for Usership tag
      const hasUsership = req.user?.tags.some((tag) => tag.toLowerCase() === 'usership')
      if (!hasUsership) {
        return {
          element: null,
          message: 'Subscribe to Usership to unlock World Generation.'
        }
      }

      // Get user's current metadata
      const currentMetadata = req.user.metadata || {}
      const userWorld = currentMetadata.world || { elements: [], lastGenerated: null, theme: '' }

      // Check if already generated today
      const now = new Date()
      const lastGenerated = userWorld.lastGenerated ? new Date(userWorld.lastGenerated) : null
      const today = now.toDateString()

      if (lastGenerated && lastGenerated.toDateString() === today) {
        return {
          element: null,
          world: userWorld,
          message: 'Already generated an element today. Come back tomorrow!'
        }
      }

      // Get user context for generation
      const logs = await fastify.models.Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 90
      })
      const memoryStory = await generateMemoryStory(req.user, logs)

      // Get weather context
      let weatherContext = 'temperate climate'
      try {
        if (req.user.city && req.user.country) {
          const coordinates = await weather.getCoordinates(req.user.city, req.user.country)
          if (coordinates) {
            const weatherData = await weather.getWeather(coordinates.lat, coordinates.lon)
            if (weatherData && weatherData.tempKelvin !== null) {
              weatherContext = `${weatherData.description}, ${Math.round(weatherData.tempKelvin - 273.15)}°C`
            }
          }
        }
      } catch (e) {
        // Ignore weather errors
      }

      // Determine element type based on number of existing elements
      const elementTypes: Array<'object' | 'creature' | 'plant' | 'structure' | 'weather-effect'> =
        ['object', 'creature', 'plant', 'structure', 'weather-effect']
      const elementType = elementTypes[userWorld.elements.length % elementTypes.length]

      // Build image generation prompt from context
      const { TogetherAIEngine } = await import('#server/utils/ai-engines.js')
      const imageEngine = new TogetherAIEngine()

      if (!imageEngine.isAvailable()) {
        throw new Error('Image generation engine not available')
      }

      // Generate element description based on context
      const contextPrompt = `Based on this user's context: ${memoryStory?.substring(0, 500) || 'A mindful journey'}, weather: ${weatherContext}, location: ${req.user.city}, ${req.user.country}.

Create a short, vivid description (1-2 sentences) for a ${elementType} that would appear in their personal 3D world. The ${elementType} should reflect their current emotional state, environment, and story. Be poetic but specific.`

      const elementDescription = await imageEngine.generateCompletion(contextPrompt, 100)

      // Generate image with FLUX
      const imagePrompt = `A beautiful, isometric 3D sprite art of a ${elementType}: ${elementDescription}. Clean background, soft lighting, pixel art style, game asset, centered, high quality`

      const imageUrl = await imageEngine.generateImage!(imagePrompt, {
        width: 512,
        height: 512,
        steps: 20,
      })

      // Create new element
      const newElement = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: elementType,
        imageUrl,
        prompt: imagePrompt,
        position: {
          x: Math.random() * 10 - 5, // -5 to 5
          y: 0,
          z: Math.random() * 10 - 5
        },
        scale: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
        rotation: Math.random() * 360,
        generatedAt: now,
        context: elementDescription
      }

      // Update user world
      const updatedWorld = {
        elements: [...userWorld.elements, newElement],
        lastGenerated: now,
        theme: memoryStory?.substring(0, 200) || 'A personal journey'
      }

      // Save to metadata
      await req.user.set({
        metadata: {
          ...currentMetadata,
          world: updatedWorld
        }
      }).save()

      console.log(`✅ Generated world element for user ${req.user.id}: ${elementType}`)

      return {
        element: newElement,
        world: updatedWorld,
        message: `New ${elementType} generated!`
      }

    } catch (error: any) {
      console.error('❌ Error generating world element:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      })
      return {
        element: null,
        message: 'Unable to generate world element. Please try again later.',
        error: error.message
      }
    }
  })

  // Get user's world
  fastify.get('/world', async (req, reply) => {
    const currentMetadata = req.user.metadata || {}
    const userWorld = currentMetadata.world || { elements: [], lastGenerated: null, theme: '' }

    return userWorld
  })
}