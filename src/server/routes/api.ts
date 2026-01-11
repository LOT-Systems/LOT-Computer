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
import { analyzeUserPatterns, findCohortMatches, type PatternInsight } from '#server/utils/patterns'
import { generateContextualPrompts, generatePatternAwareQuestion, analyzePatternEvolution } from '#server/utils/contextual-prompts'
import { analyzeEnergyState, generateEnergySuggestions } from '#server/utils/energy'
import { generateUserNarrative } from '#server/utils/rpg-narrative'
import { generateChatCatalysts, generateConversationStarters, shouldShowChatCatalyst } from '#server/utils/cohort-chat-catalyst'
import { generateCompassionateInterventions, shouldShowIntervention } from '#server/utils/compassionate-interventions'
import dayjs from '#server/utils/dayjs'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate compassionate response based on emotional state
 */
function generateCompassionateResponse(
  emotionalState: string,
  checkInType: 'morning' | 'evening' | 'moment'
): string {
  const responses: { [key: string]: { [key: string]: string } } = {
    energized: {
      morning: 'What a wonderful way to start the day. May this energy carry you forward.',
      evening: "It's beautiful to have energy at day's end. Honor it wisely.",
      moment: 'This vitality is a gift. Notice what created it.',
    },
    calm: {
      morning: 'Beginning with calm is a precious thing. Carry this peace with you.',
      evening: 'Ending the day in calm - this is self-care in action.',
      moment: 'Calm is always available. You found your way back to it.',
    },
    tired: {
      morning: 'Starting tired is hard. Be gentle with yourself today.',
      evening: 'Your tiredness is valid. Rest is not weakness - it\'s wisdom.',
      moment: 'Tiredness is your body\'s truth. Listen to what it needs.',
    },
    anxious: {
      morning: 'Beginning with anxiety is challenging. You don\'t have to carry this alone.',
      evening: 'Anxiety at day\'s end can feel heavy. You made it through today.',
      moment: 'Anxiety is uncomfortable, but temporary. This feeling will shift.',
    },
    hopeful: {
      morning: 'Hope in the morning light - may it guide your day.',
      evening: 'Ending with hope is a beautiful thing. Tomorrow awaits.',
      moment: 'Hope is always a choice. You chose it right now.',
    },
    fulfilled: {
      morning: 'Starting fulfilled - what a gift to yourself.',
      evening: 'Fulfillment at day\'s end means you lived well today.',
      moment: 'This sense of fulfillment - remember what created it.',
    },
    exhausted: {
      morning: 'Exhaustion in the morning is a sign. Your system needs deep rest.',
      evening: 'Complete exhaustion. Rest isn\'t optional anymore - it\'s essential.',
      moment: 'Exhaustion is your limit speaking clearly. Please listen.',
    },
    grateful: {
      morning: 'Gratitude colors everything. What a way to begin.',
      evening: 'Gratitude at day\'s end - you found the gifts in today.',
      moment: 'Gratitude shifts everything. You just shifted your world.',
    },
    restless: {
      morning: 'Restlessness has something to teach you. Listen closely.',
      evening: 'Restless energy at day\'s end - what\'s unsettled in you?',
      moment: 'Restlessness is energy seeking direction. What wants to move?',
    },
    content: {
      morning: 'Contentment is underrated. This is peace found.',
      evening: 'Contentment at sunset - you lived a day in alignment.',
      moment: 'Content means enough. Right now, you have enough.',
    },
    overwhelmed: {
      morning: 'Overwhelm this early is real. One breath, one step at a time.',
      evening: 'The weight of today - you carried it. Now you can set it down.',
      moment: 'Overwhelm means capacity reached. What can you release right now?',
    },
    peaceful: {
      morning: 'Peace in the morning is sacred. Protect it gently today.',
      evening: 'Peace at evening - you created sanctuary in your day.',
      moment: 'Peace found. This is the ground of your being.',
    },
    excited: {
      morning: 'Excitement for the day ahead - let it fuel you.',
      evening: 'Still excited at day\'s end - that\'s rare and precious.',
      moment: 'Excitement is life force moving. Ride this wave.',
    },
    uncertain: {
      morning: 'Uncertainty can feel uncomfortable. It\'s also where growth lives.',
      evening: 'Day ending in uncertainty - the path will reveal itself.',
      moment: 'Not knowing is honest. You don\'t have to have all the answers.',
    },
  }

  return responses[emotionalState]?.[checkInType] ||
    'Thank you for checking in with yourself. This awareness is self-care.'
}

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

    // FIXED: Only create new empty log if there ISN'T already an empty one at the top
    // This prevents creating endless empty logs on every page load
    const hasEmptyLogAtTop = recentLog &&
                             recentLog.event === 'note' &&
                             (!recentLog.text || recentLog.text.trim().length === 0)

    if (!hasEmptyLogAtTop) {
      // No empty log at top, create one for user input
      const emptyLog = await fastify.models.Log.create({
        userId: req.user.id,
        text: '',
        event: 'note',
      })
      return [emptyLog, ...logs]
    }

    // Already have an empty log at top, just return existing logs
    return logs
  })

  // Diagnostic endpoint to manually cleanup empty logs
  fastify.post('/logs/cleanup', async (req: FastifyRequest, reply) => {
    const allLogs = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
      },
      order: [['createdAt', 'DESC']],
      limit: 50,
    })

    // Detailed analysis of each log
    const analysis = allLogs.map((log, i) => ({
      index: i,
      id: log.id,
      event: log.event,
      text: log.text || '(empty)',
      textLength: (log.text || '').length,
      textTrimmed: (log.text || '').trim(),
      isEmpty: !log.text || log.text.trim() === '',
      hasPlaceholder: log.text ? (
        log.text.toLowerCase().includes('will be deleted') ||
        log.text.toLowerCase().includes('log record')
      ) : false,
      createdAt: log.createdAt,
      isSystemSnapshot: log.event === 'system_snapshot',
      metadata: log.metadata,
      context: log.context,
    }))

    // Count different types
    const emptyNotes = analysis.filter(x =>
      x.event === 'note' && (x.isEmpty || x.hasPlaceholder)
    )
    const snapshots = analysis.filter(x => x.isSystemSnapshot)
    const validNotes = analysis.filter(x =>
      x.event === 'note' && !x.isEmpty && !x.hasPlaceholder
    )

    return {
      timestamp: new Date().toISOString(),
      totalLogs: allLogs.length,
      counts: {
        emptyNotes: emptyNotes.length,
        systemSnapshots: snapshots.length,
        validNotes: validNotes.length,
        otherEvents: allLogs.length - emptyNotes.length - snapshots.length - validNotes.length,
      },
      emptyNotes: emptyNotes,
      systemSnapshots: snapshots,
      allLogs: analysis,
    }
  })

  // Delete empty logs from past 3 days
  fastify.post('/logs/delete-empty', async (req: FastifyRequest, reply) => {
    // Find all empty logs from past 3 days
    const threeDaysAgo = dayjs().subtract(3, 'days').toDate()

    const emptyLogs = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
        event: 'note',
        createdAt: {
          [Op.gte]: threeDaysAgo,
        },
      },
    })

    // Filter to truly empty logs (empty text or placeholder text)
    const logsToDelete = emptyLogs.filter(log => {
      if (!log.text || log.text.trim() === '') return true
      const text = log.text.trim().toLowerCase()
      return text.includes('will be deleted') || text.includes('log record')
    })

    const idsToDelete = logsToDelete.map(log => log.id)

    if (idsToDelete.length === 0) {
      return {
        deleted: 0,
        message: 'No empty logs found from past 3 days',
      }
    }

    // Delete them
    await fastify.models.Log.destroy({
      where: { id: idsToDelete },
    })

    return {
      deleted: idsToDelete.length,
      message: `Successfully deleted ${idsToDelete.length} empty logs from past 3 days`,
    }
  })

  // HTML page for mobile cleanup (no console needed)
  fastify.get('/logs/cleanup-page', async (req: FastifyRequest, reply) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cleanup Empty Logs</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 20px 0;
      font-size: 24px;
    }
    button {
      background: #007AFF;
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      margin-top: 20px;
    }
    button:hover {
      background: #0051D5;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    #result {
      margin-top: 20px;
      padding: 16px;
      border-radius: 8px;
      display: none;
    }
    .success {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #2e7d32;
    }
    .info {
      background: #e3f2fd;
      color: #1565c0;
      border: 1px solid #1565c0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧹 Cleanup Empty Logs</h1>
    <p>This will delete all empty log entries from the past 3 days.</p>
    <button id="cleanupBtn" onclick="runCleanup()">Delete Empty Logs</button>
    <div id="result"></div>
  </div>

  <script>
    async function runCleanup() {
      const btn = document.getElementById('cleanupBtn');
      const result = document.getElementById('result');

      btn.disabled = true;
      btn.textContent = 'Cleaning up...';

      try {
        const response = await fetch('/logs/delete-empty', { method: 'POST' });
        const data = await response.json();

        result.style.display = 'block';
        if (data.deleted === 0) {
          result.className = 'info';
          result.innerHTML = '✨ ' + data.message;
        } else {
          result.className = 'success';
          result.innerHTML = '✅ ' + data.message + '<br><br>Refresh your Logs page to see the results.';
        }

        btn.textContent = 'Cleanup Complete';
      } catch (error) {
        result.style.display = 'block';
        result.className = 'error';
        result.innerHTML = '❌ Error: ' + error.message;
        btn.disabled = false;
        btn.textContent = 'Try Again';
      }
    }
  </script>
</body>
</html>`;

    reply.type('text/html').send(html);
  })

  // Simple GET endpoint to delete empty logs - just visit the URL
  fastify.get('/logs/cleanup-now', async (req: FastifyRequest, reply) => {
    try {
      // Find all empty logs from past 7 days (extended from 3 to catch more)
      const sevenDaysAgo = dayjs().subtract(7, 'days').toDate()

      const emptyLogs = await fastify.models.Log.findAll({
        where: {
          userId: req.user.id,
          event: 'note',
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      })

      // Filter to truly empty logs (empty text or placeholder text)
      const logsToDelete = emptyLogs.filter(log => {
        if (!log.text || log.text.trim() === '') return true
        const text = log.text.trim().toLowerCase()
        return text.includes('will be deleted') ||
               text.includes('log record') ||
               text.includes('type here')
      })

      const idsToDelete = logsToDelete.map(log => log.id)

      if (idsToDelete.length === 0) {
        return reply.type('text/html').send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cleanup Complete</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .success { color: #28a745; font-size: 48px; }
              h1 { color: #333; }
              p { color: #666; font-size: 18px; }
              a { color: #007bff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="success">✨</div>
            <h1>Database is Clean!</h1>
            <p>No empty logs found from the past 7 days.</p>
            <p><a href="/logs">← Back to Logs</a></p>
          </body>
          </html>
        `)
      }

      // Delete them
      await fastify.models.Log.destroy({
        where: { id: idsToDelete },
      })

      return reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cleanup Complete</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #28a745; font-size: 48px; }
            h1 { color: #333; }
            p { color: #666; font-size: 18px; }
            .count { font-size: 36px; font-weight: bold; color: #007bff; }
            a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="success">✅</div>
          <h1>Cleanup Complete!</h1>
          <div class="count">${idsToDelete.length}</div>
          <p>empty logs deleted from the past 7 days</p>
          <p><a href="/logs">← Back to Logs</a></p>
        </body>
        </html>
      `)
    } catch (error: any) {
      return reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cleanup Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #dc3545; font-size: 48px; }
            h1 { color: #333; }
            p { color: #666; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="error">❌</div>
          <h1>Cleanup Failed</h1>
          <p>${error.message}</p>
        </body>
        </html>
      `)
    }
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

  // ============================================================================
  // EMOTIONAL CHECK-IN ENDPOINT
  // ============================================================================
  fastify.post(
    '/emotional-checkin',
    async (
      req: FastifyRequest<{
        Body: {
          checkInType: 'morning' | 'evening' | 'moment'
          emotionalState: string
          intensity?: number
          note?: string
        }
      }>,
      reply
    ) => {
      const { checkInType, emotionalState, intensity, note } = req.body

      if (!checkInType || !emotionalState) {
        return reply.throw.badParams('Check-in type and emotional state are required')
      }

      // Get recent emotional check-ins to generate insights
      const recentCheckIns = await fastify.models.Log.findAll({
        where: {
          userId: req.user.id,
          event: 'emotional_checkin',
        },
        order: [['createdAt', 'DESC']],
        limit: 30,
      })

      // Generate pattern insights
      const insights: string[] = []

      // Pattern: Same state multiple days in a row (only check PREVIOUS days, not today)
      // Group check-ins by day to ensure we're counting consecutive days, not just consecutive check-ins
      const checkInsByDay = new Map<string, string>()
      recentCheckIns.forEach(log => {
        const dayKey = new Date(log.createdAt).toDateString()
        if (!checkInsByDay.has(dayKey)) {
          checkInsByDay.set(dayKey, log.metadata?.emotionalState)
        }
      })

      // Get unique days (excluding today) and check for consecutive pattern
      const today = new Date().toDateString()
      const previousDays = Array.from(checkInsByDay.entries())
        .filter(([day]) => day !== today)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .slice(0, 3)

      if (previousDays.length >= 3) {
        const allSameAsToday = previousDays.every(([_, state]) => state === emotionalState)
        if (allSameAsToday) {
          insights.push(`You've felt ${emotionalState} for 3 days in a row`)
        }
      }

      // Pattern: Morning vs evening energy
      const morningCheckIns = recentCheckIns.filter(log => log.metadata?.checkInType === 'morning')
      const eveningCheckIns = recentCheckIns.filter(log => log.metadata?.checkInType === 'evening')

      if (checkInType === 'morning' && morningCheckIns.length >= 5) {
        const energizedMornings = morningCheckIns.filter(log =>
          ['energized', 'hopeful', 'excited'].includes(log.metadata?.emotionalState)
        ).length
        if (energizedMornings / morningCheckIns.length > 0.7) {
          insights.push('Your mornings tend to be energizing')
        }
      }

      if (checkInType === 'evening' && eveningCheckIns.length >= 5) {
        const tiredEvenings = eveningCheckIns.filter(log =>
          ['tired', 'exhausted'].includes(log.metadata?.emotionalState)
        ).length
        if (tiredEvenings / eveningCheckIns.length > 0.7) {
          insights.push('Your evenings often feel depleting')
        }
      }

      // Create the emotional check-in log
      // Format text for visibility in Log view
      const timeOfDay =
        checkInType === 'morning' ? 'this morning' :
        checkInType === 'evening' ? 'this evening' :
        'right now'
      const logText = note
        ? `Feeling ${emotionalState} ${timeOfDay}: ${note}`
        : `Feeling ${emotionalState} ${timeOfDay}`

      const checkIn = await fastify.models.Log.create({
        userId: req.user.id,
        text: logText,
        event: 'emotional_checkin',
        metadata: {
          checkInType,
          emotionalState,
          intensity,
          note,
          insights,
        },
      })

      // Add context asynchronously
      process.nextTick(async () => {
        const context = await getLogContext(req.user)
        await checkIn.set({ context }).save()
      })

      return {
        checkIn,
        insights,
        compassionateResponse: generateCompassionateResponse(emotionalState, checkInType),
      }
    }
  )

  // Get emotional check-in history and insights
  fastify.get(
    '/emotional-checkins',
    async (req: FastifyRequest<{ Querystring: { days?: string } }>, reply) => {
      const days = parseInt(req.query.days || '30')
      const since = dayjs().subtract(days, 'day').toDate()

      const checkIns = await fastify.models.Log.findAll({
        where: {
          userId: req.user.id,
          event: 'emotional_checkin',
          createdAt: {
            [Op.gte]: since,
          },
        },
        order: [['createdAt', 'DESC']],
      })

      // Calculate mood patterns
      const moodCounts: { [key: string]: number } = {}
      checkIns.forEach(checkIn => {
        const state = checkIn.metadata?.emotionalState as string
        if (state) {
          moodCounts[state] = (moodCounts[state] || 0) + 1
        }
      })

      const dominantMood = Object.entries(moodCounts)
        .sort(([_, a], [__, b]) => b - a)[0]?.[0]

      return {
        checkIns,
        stats: {
          total: checkIns.length,
          moodCounts,
          dominantMood,
          averageIntensity: checkIns.length > 0
            ? checkIns.reduce((sum, c) => sum + (c.metadata?.intensity || 5), 0) / checkIns.length
            : 0,
        },
      }
    }
  )

  // Export emotional check-ins as CSV
  fastify.get('/export/emotional-checkins', async (req, reply) => {
    const checkIns = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
        event: 'emotional_checkin',
      },
      order: [['createdAt', 'ASC']],
    })

    // Generate CSV
    const csvRows = ['Date,Time,Emotional State,Check-in Type,Intensity,Note']
    checkIns.forEach((log: any) => {
      const date = dayjs(log.createdAt).format('YYYY-MM-DD')
      const time = dayjs(log.createdAt).format('HH:mm:ss')
      const state = log.metadata?.emotionalState || ''
      const type = log.metadata?.checkInType || ''
      const intensity = log.metadata?.intensity || ''
      const note = (log.metadata?.note || '').replace(/"/g, '""') // Escape quotes
      csvRows.push(`${date},${time},"${state}","${type}",${intensity},"${note}"`)
    })

    const csv = csvRows.join('\n')
    reply.header('Content-Type', 'text/csv')
    reply.header('Content-Disposition', `attachment; filename="mood-checkins-${dayjs().format('YYYY-MM-DD')}.csv"`)
    return csv
  })

  // Export self-care activities as CSV
  fastify.get('/export/self-care', async (req, reply) => {
    const activities = await fastify.models.Log.findAll({
      where: {
        userId: req.user.id,
        event: {
          [Op.in]: ['self_care_complete', 'self_care_skip']
        },
      },
      order: [['createdAt', 'ASC']],
    })

    // Generate CSV
    const csvRows = ['Date,Time,Event,Activity']
    activities.forEach((log: any) => {
      const date = dayjs(log.createdAt).format('YYYY-MM-DD')
      const time = dayjs(log.createdAt).format('HH:mm:ss')
      const event = log.event === 'self_care_complete' ? 'Completed' : 'Skipped'
      const activity = (log.text || '').replace('Self-care completed: ', '').replace('Self-care skipped: ', '').replace(/"/g, '""')
      csvRows.push(`${date},${time},"${event}","${activity}"`)
    })

    const csv = csvRows.join('\n')
    reply.header('Content-Type', 'text/csv')
    reply.header('Content-Disposition', `attachment; filename="self-care-${dayjs().format('YYYY-MM-DD')}.csv"`)
    return csv
  })

  fastify.get(
    '/memory',
    async (req: FastifyRequest<{ Querystring: {
      d: string
      qe?: string // quantum energy
      qc?: string // quantum clarity
      qa?: string // quantum alignment
      qn?: string // quantum needs support
    } }>, reply) => {
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

      // Check if a prompt was shown in the last 30 minutes (reduced for more frequent questions)
      const thirtyMinutesAgo = now.subtract(30, 'minute')
      const isRecentlyAsked = await fastify.models.Answer.count({
        where: {
          userId: req.user.id,
          createdAt: {
            [Op.gte]: thirtyMinutesAgo.toDate(),
          },
        },
      }).then(Boolean)
      if (isRecentlyAsked) {
        console.log(`⏸️ Skipping prompt: answered within last 30 minutes`)
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

      // ============================================================================
      // WEEKLY SUMMARY CHECK (Priority over regular questions)
      // ============================================================================
      // Check if it's time for weekly summary (Sunday or Monday, once per week)
      const lastWeeklySummary = await fastify.models.Answer.findOne({
        where: {
          userId: req.user.id,
          metadata: {
            questionId: 'weekly_summary'
          }
        },
        order: [['createdAt', 'DESC']]
      })

      const { shouldShowWeeklySummary, generateWeeklySummary } = await import('#server/utils/weekly-summary.js')
      const showWeeklySummary = shouldShowWeeklySummary(
        req.user,
        lastWeeklySummary?.createdAt || null
      )

      if (showWeeklySummary) {
        console.log(`📊 Generating weekly summary for user ${req.user.id}`)
        try {
          // Load 200 logs to cover the week + historical context
          const logs = await fastify.models.Log.findAll({
            where: {
              userId: req.user.id,
            },
            order: [['createdAt', 'DESC']],
            limit: 200,
          })

          const weeklySummary = await generateWeeklySummary(req.user, logs)

          // Return as a special memory "question" with reflection prompt
          return {
            id: 'weekly_summary',
            question: weeklySummary.narrative,
            options: [
              'Continue forward',
              'Pause and reflect',
              'Acknowledge'
            ],
            metadata: {
              type: 'weekly_summary',
              period: weeklySummary.period,
              reflectionPrompt: weeklySummary.reflectionPrompt
            }
          }
        } catch (error: any) {
          console.error('❌ Weekly summary generation failed:', {
            error: error.message,
            userId: req.user.id,
          })
          // Fall through to regular questions on error
        }
      }

      if (hasUsershipTag) {
        // Usership users: Generate AI-based context-aware question using Claude
        console.log(`🔍 Attempting to generate AI question for Usership user ${req.user.id}`)
        try {
          // Load 120 logs for deeper narrative context and duplicate detection
          // Ensures we capture user's long-term patterns and recent activities
          const logs = await fastify.models.Log.findAll({
            where: {
              userId: req.user.id,
            },
            order: [['createdAt', 'DESC']],
            limit: 120,
          })

          // Extract quantum state from client for context-aware question generation
          const quantumState = req.query.qe ? {
            energy: req.query.qe,
            clarity: req.query.qc,
            alignment: req.query.qa,
            needsSupport: req.query.qn
          } : undefined

          const prompt = await buildPrompt(req.user, logs, isWeekend, quantumState)
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

      // Check if this is a weekly summary response
      const isWeeklySummary = questionId === 'weekly_summary'

      // Try to find in default questions first (backwards compatibility)
      let question = defaultQuestions.find(fp.propEq('id', questionId))
      let questionText: string
      let questionOptions: string[]

      if (question) {
        // Default question
        questionText = question.question
        questionOptions = question.options
      } else {
        // AI-generated question or weekly summary - accept from request body
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
        metadata: {
          questionId,
          type: isWeeklySummary ? 'weekly_summary' : 'regular'
        }
      })

      process.nextTick(async () => {
        const context = await getLogContext(req.user)
        await fastify.models.Log.create({
          userId: req.user.id,
          event: isWeeklySummary ? 'weekly_summary_response' : 'answer',
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

      // ============================================================================
      // ENHANCED INSIGHT RESPONSE SYSTEM
      // ============================================================================

      // Get user's recent answers and logs for psychological analysis
      const recentLogs = await fastify.models.Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 50,
      })

      const answerCount = await fastify.models.Answer.count({
        where: { userId: req.user.id }
      })

      // Generate personalized insight response
      let response: string
      let insight: string | null = null

      if (isWeeklySummary) {
        // Weekly summary response
        const reflectionResponses = [
          'Week witnessed. Patterns held.',
          'The week is complete. You showed up.',
          'Summary acknowledged. Forward.',
          'Your week, seen whole.'
        ]
        response = fp.randomElement(reflectionResponses)

        // No additional insight for weekly summaries - the summary itself is the insight
      } else if (answerCount === 1) {
        response = "Thank you for starting your Memory story with LOT."
      } else if (answerCount >= 10) {
        // For users with 10+ answers, analyze psychological depth and generate insights
        const analysis = extractUserTraits(recentLogs)
        const { psychologicalDepth, traits } = analysis
        const cohortResult = determineUserCohort(traits, {}, psychologicalDepth)

        // Generate archetype-based response
        if (cohortResult.archetype !== 'The Wanderer') {
          const archetypeResponses: { [key: string]: string[] } = {
            'The Seeker': [
              `Your ${cohortResult.archetype} nature is showing in your choices. You're drawn to growth.`,
              `This answer deepens your understanding of yourself - signature of ${cohortResult.archetype}.`,
              `${cohortResult.archetype} energy: always moving toward more awareness.`
            ],
            'The Nurturer': [
              `Your choices reflect ${cohortResult.archetype} - connection and care matter deeply to you.`,
              `${cohortResult.archetype}: You consider how choices affect relationships.`,
              `This reveals your nurturing nature - ${cohortResult.archetype} at heart.`
            ],
            'The Achiever': [
              `${cohortResult.archetype} showing through: purposeful and intentional choices.`,
              `Your answers reveal goal-oriented clarity - classic ${cohortResult.archetype}.`,
              `Progress-focused choices align with your ${cohortResult.archetype} nature.`
            ],
            'The Philosopher': [
              `${cohortResult.archetype}: You choose with meaning in mind.`,
              `This choice reflects your search for deeper significance - ${cohortResult.archetype}.`,
              `Meaning-making is your gift, ${cohortResult.archetype}.`
            ],
            'The Harmonizer': [
              `Balance guides your choices - pure ${cohortResult.archetype}.`,
              `${cohortResult.archetype}: Seeking equilibrium in all things.`,
              `Your answer shows your gift for finding center - ${cohortResult.archetype}.`
            ],
            'The Creator': [
              `${cohortResult.archetype} energy: Choosing what allows expression.`,
              `Creative freedom matters to you - signature ${cohortResult.archetype}.`,
              `This choice honors your need for authentic expression.`
            ],
            'The Protector': [
              `${cohortResult.archetype}: Security and stability guide you.`,
              `Grounded choice - this is ${cohortResult.archetype} wisdom.`,
              `Your answers show you value safety - ${cohortResult.archetype} at core.`
            ],
            'The Authentic': [
              `Truth-aligned choice - pure ${cohortResult.archetype}.`,
              `${cohortResult.archetype}: You refuse to pretend.`,
              `Honesty with self is your north star - ${cohortResult.archetype}.`
            ],
            'The Explorer': [
              `${cohortResult.archetype}: Always curious, always expanding.`,
              `Your choices show openness to new experiences - ${cohortResult.archetype}.`,
              `Discovery-oriented choice - signature ${cohortResult.archetype}.`
            ]
          }

          const archetypeResponseOptions = archetypeResponses[cohortResult.archetype] || []
          if (archetypeResponseOptions.length > 0) {
            response = fp.randomElement(archetypeResponseOptions)
          } else {
            response = `Your ${cohortResult.archetype} nature is revealing itself through your choices.`
          }

          // Add insight about dominant needs or values
          if (psychologicalDepth.dominantNeeds.length > 0) {
            const topNeed = psychologicalDepth.dominantNeeds[0]
            insight = `Pattern: ${topNeed} appears in your choices consistently.`
          } else if (psychologicalDepth.values.length > 0) {
            const topValue = psychologicalDepth.values[0]
            insight = `Your answers reveal ${topValue} as a core value.`
          }
        } else {
          // Still discovering archetype
          response = fp.randomElement([
            "Your patterns are beginning to emerge.",
            "Each answer reveals another layer of who you are.",
            "Your story is taking shape beautifully."
          ])
        }

        // Milestone celebrations
        if (answerCount % 20 === 0) {
          response = `${answerCount} moments captured. Your psychological profile is deepening.`
          insight = `Growth trajectory: ${psychologicalDepth.growthTrajectory} • Awareness: ${(psychologicalDepth.selfAwareness / 10).toFixed(1)}%`
        } else if (answerCount % 10 === 0) {
          insight = `${answerCount} answers reveal your ${cohortResult.archetype} archetype is ${psychologicalDepth.growthTrajectory}.`
        }
      } else {
        // For users with fewer answers, use encouraging responses
        const earlyReplies = [
          "Thank you. This helps me understand you better.",
          "Every answer deepens your Memory.",
          "Your preferences are taking shape.",
          "This adds valuable context to your story.",
          "Building your psychological profile."
        ]
        response = fp.randomElement(earlyReplies)

        // After 5 answers, hint at emerging patterns
        if (answerCount === 5) {
          response = "Five answers in - your patterns are beginning to speak."
        }
      }

      return {
        response,
        insight, // Optional additional insight about patterns
        answerCount,
      }
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

      // Get answer logs (limit to 30 for analysis performance)
      const logs = await fastify.models.Log.findAll({
        where: {
          userId: req.user.id,
          event: 'answer',
        },
        order: [['createdAt', 'DESC']],
        limit: 30,
      })

      // Get full answer count for accurate display
      const totalAnswerCount = await fastify.models.Answer.count({
        where: { userId: req.user.id }
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
        answerCount: totalAnswerCount,
        logsAnalyzed: logs.length
      })

      return {
        hasUsership: true,
        // Psychological depth (soul level)
        archetype: cohortResult.archetype,
        archetypeDescription: cohortResult.description,
        coreValues: psychologicalDepth.values.map(v => v.charAt(0).toUpperCase() + v.slice(1)),
        values: psychologicalDepth.values, // Also include raw values for compatibility
        emotionalPatterns: psychologicalDepth.emotionalPatterns.map(p => {
          const formatted = p.replace(/([A-Z])/g, ' $1').trim()
          return formatted.charAt(0).toUpperCase() + formatted.slice(1)
        }),
        selfAwarenessLevel: psychologicalDepth.selfAwareness,
        // Enhanced psychological depth metrics
        emotionalRange: psychologicalDepth.emotionalRange,
        reflectionQuality: psychologicalDepth.reflectionQuality,
        growthTrajectory: psychologicalDepth.growthTrajectory,
        dominantNeeds: psychologicalDepth.dominantNeeds,
        journalSentiment: psychologicalDepth.journalSentiment,
        // Behavioral patterns (surface level)
        behavioralCohort: cohortResult.behavioralCohort,
        behavioralTraits: traits.map(t => {
          const formatted = t.replace(/([A-Z])/g, ' $1').trim()
          return formatted.charAt(0).toUpperCase() + formatted.slice(1)
        }),
        patternStrength: Object.entries(patterns)
          .filter(([_, v]) => v > 0)
          .map(([k, v]) => ({
            trait: k.replace(/([A-Z])/g, ' $1').trim().replace(/^./, c => c.toUpperCase()),
            count: v
          }))
          .sort((a, b) => b.count - a.count),
        // Meta
        answerCount: totalAnswerCount,
        logsAnalyzedForProfile: logs.length  // Number of recent logs used for analysis
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

  // Get available radio tracks
  fastify.get('/radio/tracks', async (req, reply) => {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const radioDir = path.join(process.cwd(), 'public', 'radio')

      // Check if directory exists
      try {
        await fs.access(radioDir)
      } catch {
        return { tracks: [] }
      }

      // Read directory contents
      const files = await fs.readdir(radioDir)

      // Filter for audio files
      const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac']
      const audioFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase()
        return audioExtensions.includes(ext)
      })

      // Map to track objects
      const tracks = audioFiles.map(filename => {
        const name = path.basename(filename, path.extname(filename))
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          // Capitalize first letter of each word
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        return {
          filename,
          url: `/radio/${filename}`,
          name
        }
      })

      console.log(`📻 Found ${tracks.length} radio tracks`)

      return { tracks }
    } catch (error: any) {
      console.error('❌ Error reading radio tracks:', error)
      return { tracks: [], error: error.message }
    }
  })

  // Get user's pattern insights
  fastify.get('/patterns', async (req, reply) => {
    try {
      const Log = await import('#server/models/log.js').then(m => m.default)

      // Get last 100 logs for pattern analysis
      const logs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      if (logs.length < 5) {
        return {
          insights: [],
          message: 'Keep checking in! Patterns emerge after 5+ entries.'
        }
      }

      const insights = await analyzeUserPatterns(req.user, logs)

      console.log(`📊 Generated ${insights.length} pattern insights for user ${req.user.id}`)

      return {
        insights,
        lastAnalyzedAt: new Date().toISOString(),
        dataPointsAnalyzed: logs.length
      }

    } catch (error: any) {
      console.error('❌ Error analyzing patterns:', {
        error: error.message,
        userId: req.user?.id
      })
      return {
        insights: [],
        error: error.message
      }
    }
  })

  // Find cohort matches
  fastify.get('/cohorts', async (req, reply) => {
    try {
      const User = await import('#server/models/user.js').then(m => m.default)
      const Log = await import('#server/models/log.js').then(m => m.default)

      // Get current user's patterns
      const userLogs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      if (userLogs.length < 10) {
        return {
          matches: [],
          message: 'Keep building your journey! Cohort matching available after 10+ entries.'
        }
      }

      const userPatterns = await analyzeUserPatterns(req.user, userLogs)

      if (userPatterns.length === 0) {
        return {
          matches: [],
          message: 'No clear patterns yet. Continue your practice!'
        }
      }

      // Get all users with location data (for cohort matching)
      const allUsers = await User.findAll({
        where: {
          city: { [Op.not]: null },
          country: { [Op.not]: null },
          id: { [Op.not]: req.user.id }
        },
        attributes: ['id', 'firstName', 'lastName', 'city', 'country', 'metadata']
      })

      // Cache for pattern lookups (to avoid re-analyzing same user)
      const patternCache = new Map<string, PatternInsight[]>()

      const getUserPatterns = async (userId: string): Promise<PatternInsight[]> => {
        if (patternCache.has(userId)) {
          return patternCache.get(userId)!
        }

        const logs = await Log.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 100
        })

        const user = allUsers.find(u => u.id === userId)
        if (!user || logs.length < 5) {
          return []
        }

        const patterns = await analyzeUserPatterns(user, logs)
        patternCache.set(userId, patterns)
        return patterns
      }

      const matches = await findCohortMatches(
        req.user,
        userPatterns,
        allUsers,
        getUserPatterns
      )

      console.log(`👥 Found ${matches.length} cohort matches for user ${req.user.id}`)

      return {
        matches,
        yourPatterns: userPatterns.slice(0, 3), // Share top 3 patterns for context
        lastAnalyzedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error finding cohorts:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      })
      return {
        matches: [],
        error: error.message
      }
    }
  })

  // Get contextual prompts based on patterns and current context
  fastify.get('/contextual-prompts', async (req, reply) => {
    try {
      const Log = await import('#server/models/log.js').then(m => m.default)

      // Get user's patterns
      const logs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      if (logs.length < 5) {
        return {
          prompts: [],
          message: 'Keep building your practice! Contextual prompts emerge after 5+ entries.'
        }
      }

      const patterns = await analyzeUserPatterns(req.user, logs)

      if (patterns.length === 0) {
        return {
          prompts: [],
          message: 'No patterns detected yet.'
        }
      }

      // Get current context
      const now = new Date()
      const hour = now.getHours()
      const dayOfWeek = now.getDay()

      // Get recent check-ins (last 12 hours)
      const recentCheckIns = logs.filter(log => {
        const logAge = Date.now() - new Date(log.createdAt).getTime()
        const twelveHoursMs = 12 * 60 * 60 * 1000
        return log.event === 'emotional_checkin' && logAge < twelveHoursMs
      })

      // Get current weather
      let currentWeather = null
      if (req.user.city && req.user.country) {
        currentWeather = await weather.getWeather(req.user.city, req.user.country)
      }

      const prompts = generateContextualPrompts(patterns, {
        hour,
        dayOfWeek,
        weather: currentWeather || undefined,
        recentCheckIns
      })

      console.log(`💡 Generated ${prompts.length} contextual prompts for user ${req.user.id}`)

      return {
        prompts,
        generatedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error generating contextual prompts:', {
        error: error.message,
        userId: req.user?.id
      })
      return {
        prompts: [],
        error: error.message
      }
    }
  })

  // Get pattern evolution over time
  fastify.get('/pattern-evolution', async (req, reply) => {
    try {
      const Log = await import('#server/models/log.js').then(m => m.default)

      // Get all user logs (up to 500 for historical analysis)
      const allLogs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 500
      })

      if (allLogs.length < 20) {
        return {
          evolution: [],
          message: 'Need more data to track pattern evolution. Keep building your practice!'
        }
      }

      // Analyze patterns from different time periods
      const now = dayjs()
      const timeWindows = [
        { label: 'Current', weeks: 0, days: 14 },  // Last 2 weeks
        { label: '2 weeks ago', weeks: 2, days: 14 },
        { label: '4 weeks ago', weeks: 4, days: 14 },
        { label: '8 weeks ago', weeks: 8, days: 14 }
      ]

      const historicalPatterns: { analyzedAt: string; patterns: PatternInsight[] }[] = []

      for (const window of timeWindows) {
        const endDate = now.subtract(window.weeks, 'week')
        const startDate = endDate.subtract(window.days, 'day')

        // Filter logs within this time window
        const windowLogs = allLogs.filter(log => {
          const logDate = dayjs(log.createdAt)
          return logDate.isAfter(startDate) && logDate.isBefore(endDate)
        })

        if (windowLogs.length >= 5) {
          const patterns = await analyzeUserPatterns(req.user, windowLogs)
          if (patterns.length > 0) {
            historicalPatterns.push({
              analyzedAt: endDate.toISOString(),
              patterns
            })
          }
        }
      }

      if (historicalPatterns.length < 2) {
        return {
          evolution: [],
          message: 'Need more historical data to track evolution. Check back in a few weeks!'
        }
      }

      const evolution = analyzePatternEvolution(historicalPatterns)

      console.log(`📈 Analyzed ${evolution.length} pattern evolutions for user ${req.user.id}`)

      return {
        evolution,
        timeWindows: historicalPatterns.map(h => h.analyzedAt),
        analyzedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error analyzing pattern evolution:', {
        error: error.message,
        userId: req.user?.id
      })
      return {
        evolution: [],
        error: error.message
      }
    }
  })

  // Get user's energy state
  fastify.get('/energy', async (req, reply) => {
    try {
      const Log = await import('#server/models/log.js').then(m => m.default)

      const logs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      if (logs.length < 3) {
        return {
          energyState: null,
          message: 'Keep tracking! Energy analysis available after 3+ entries.'
        }
      }

      const energyState = analyzeEnergyState(logs)
      const suggestions = generateEnergySuggestions(energyState)

      console.log(`⚡ Energy state for user ${req.user.id}: ${energyState.status} (${energyState.currentLevel}/100)`)

      return {
        energyState,
        suggestions,
        analyzedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error analyzing energy:', {
        error: error.message,
        userId: req.user?.id
      })
      return {
        energyState: null,
        error: error.message
      }
    }
  })

  // Get user's RPG narrative and achievements
  fastify.get('/narrative', async (req, reply) => {
    try {
      const Log = await import('#server/models/log.js').then(m => m.default)

      const logs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 500
      })

      if (logs.length === 0) {
        return {
          narrative: null,
          message: 'Your story begins with your first action.'
        }
      }

      const narrative = generateUserNarrative(req.user, logs)

      console.log(`📖 Generated narrative for user ${req.user.id}: Level ${narrative.currentLevel}, Chapter ${narrative.currentArc.chapter}`)

      return {
        narrative,
        generatedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error generating narrative:', {
        error: error.message,
        userId: req.user?.id
      })
      return {
        narrative: null,
        error: error.message
      }
    }
  })

  // Get user's goal progression and narrative arc
  fastify.get('/goal-progression', async (req, reply) => {
    try {
      const { generateGoalProgression } = await import('#server/utils/goal-understanding.js')
      const Log = await import('#server/models/log.js').then(m => m.default)

      const logs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 500
      })

      if (logs.length < 5) {
        return {
          progression: null,
          message: 'Your journey unfolds with each step. Keep practicing.'
        }
      }

      const progression = generateGoalProgression(req.user, logs)

      console.log(`🎯 Generated goal progression for user ${req.user.id}: ${progression.goals.length} goals, primary: ${progression.overallJourney.primaryGoal?.title || 'none'}`)

      return {
        progression,
        generatedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error generating goal progression:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      })
      return {
        progression: null,
        error: error.message
      }
    }
  })

  // Get chat catalysts (prompts to connect with cohort)
  fastify.get('/chat-catalysts', async (req, reply) => {
    try {
      const User = await import('#server/models/user.js').then(m => m.default)
      const Log = await import('#server/models/log.js').then(m => m.default)

      // Get user's patterns and cohorts
      const userLogs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      if (userLogs.length < 10) {
        return {
          catalysts: [],
          message: 'Keep building your practice! Chat suggestions available after 10+ entries.'
        }
      }

      const userPatterns = await analyzeUserPatterns(req.user, userLogs)
      if (userPatterns.length === 0) {
        return { catalysts: [], message: 'No patterns yet to match with others.' }
      }

      // Get cohort matches
      const allUsers = await User.findAll({
        where: {
          city: { [Op.not]: null },
          country: { [Op.not]: null },
          id: { [Op.not]: req.user.id }
        },
        attributes: ['id', 'firstName', 'lastName', 'city', 'country', 'metadata', 'lastSeenAt']
      })

      const patternCache = new Map<string, PatternInsight[]>()
      const getUserPatterns = async (userId: string): Promise<PatternInsight[]> => {
        if (patternCache.has(userId)) return patternCache.get(userId)!
        const logs = await Log.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
          limit: 100
        })
        const user = allUsers.find(u => u.id === userId)
        if (!user || logs.length < 5) return []
        const patterns = await analyzeUserPatterns(user, logs)
        patternCache.set(userId, patterns)
        return patterns
      }

      const cohortMatches = await findCohortMatches(
        req.user,
        userPatterns,
        allUsers,
        getUserPatterns
      )

      // Get current emotional state
      const recentCheckIn = userLogs.find(l => l.event === 'emotional_checkin')
      const currentEmotionalState = recentCheckIn?.metadata?.emotionalState as string | undefined

      // Get social energy needs
      const energyState = analyzeEnergyState(userLogs)
      const socialNeed = energyState.needsReplenishment.find(n => n.category === 'social')

      const catalysts = generateChatCatalysts(
        req.user,
        cohortMatches,
        allUsers,
        currentEmotionalState,
        socialNeed
      )

      console.log(`💬 Generated ${catalysts.length} chat catalysts for user ${req.user.id}`)

      return {
        catalysts,
        generatedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error generating chat catalysts:', {
        error: error.message,
        userId: req.user?.id
      })
      return {
        catalysts: [],
        error: error.message
      }
    }
  })

  // Get compassionate interventions
  fastify.get('/interventions', async (req, reply) => {
    try {
      const Log = await import('#server/models/log.js').then(m => m.default)

      const logs = await Log.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      if (logs.length < 5) {
        return {
          interventions: [],
          message: 'Keep going. Caring interventions emerge as patterns develop.'
        }
      }

      // Analyze current state
      const recentCheckIns = logs.filter(l => l.event === 'emotional_checkin').slice(0, 10)
      const emotionalCounts: Record<string, number> = {}
      for (const checkIn of recentCheckIns) {
        const state = checkIn.metadata?.emotionalState as string
        if (state) {
          emotionalCounts[state] = (emotionalCounts[state] || 0) + 1
        }
      }

      const dominantMood = Object.entries(emotionalCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
      const daysInPattern = recentCheckIns.filter(c => c.metadata?.emotionalState === dominantMood).length

      const negativeStates = ['anxious', 'overwhelmed', 'exhausted', 'tired']
      const isStrugglingPattern = negativeStates.includes(dominantMood)

      const energyState = analyzeEnergyState(logs)

      const userState = {
        emotionalPattern: {
          dominantMood,
          daysInPattern,
          isStrugglingPattern
        },
        energyState,
        recentLogs: logs.slice(0, 20),
        romanticConnectionState: {
          daysDisconnected: energyState.romanticConnection.daysSinceConnection,
          qualityLevel: energyState.romanticConnection.connectionQuality
        }
      }

      const interventions = generateCompassionateInterventions(userState)

      console.log(`🫂 Generated ${interventions.length} interventions for user ${req.user.id}`)

      return {
        interventions,
        generatedAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('❌ Error generating interventions:', {
        error: error.message,
        userId: req.user?.id
      })
      return {
        interventions: [],
        error: error.message
      }
    }
  })

  /**
   * GET /api/community-emotion
   * Calculate shared community emotional state from recent check-ins
   */
  fastify.get('/api/community-emotion', async (req, reply) => {
    try {
      const userId = req.session?.userId
      if (!userId) {
        return reply.status(401).send({ error: 'Not authenticated' })
      }

      // Get emotional check-ins from the last 24 hours across all users
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const recentEmotions = await Log.findAll({
        where: {
          event: 'emotional_checkin',
          createdAt: {
            [Op.gte]: oneDayAgo
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 100, // Sample last 100 check-ins for performance
        attributes: ['emotionalState', 'createdAt']
      })

      if (recentEmotions.length === 0) {
        return reply.send({
          sharedEmotion: null,
          confidence: 0,
          participantCount: 0,
          message: 'Not enough data yet'
        })
      }

      // Count emotional states
      const emotionCounts: Record<string, number> = {}
      recentEmotions.forEach(log => {
        const emotion = log.emotionalState
        if (emotion) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
        }
      })

      // Find the most common emotion
      let dominantEmotion = ''
      let maxCount = 0
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > maxCount) {
          maxCount = count
          dominantEmotion = emotion
        }
      })

      // Calculate confidence (percentage of dominant emotion)
      const confidence = Math.round((maxCount / recentEmotions.length) * 100)

      // Get unique participant count (approximate)
      const uniqueParticipants = recentEmotions.length

      return reply.send({
        sharedEmotion: dominantEmotion,
        confidence,
        participantCount: uniqueParticipants,
        emotionBreakdown: emotionCounts,
        calculatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error calculating community emotion:', error)
      return reply.status(500).send({ error: 'Failed to calculate community emotion' })
    }
  })

  // Get direct message thread with another user
  fastify.get('/direct-messages/:userId', async (req: FastifyRequest<{
    Params: { userId: string }
  }>, reply) => {
    try {
      const otherUserId = req.params.userId

      // Verify other user exists
      const otherUser = await fastify.models.User.findByPk(otherUserId)
      if (!otherUser) {
        return reply.status(404).send({ error: 'User not found' })
      }

      // Get all messages between current user and other user
      const messages = await fastify.models.DirectMessage.findAll({
        where: {
          [Op.or]: [
            { senderId: req.user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: req.user.id }
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      return reply.send({
        messages: messages.map(m => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          message: m.message,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          isMine: m.senderId === req.user.id
        })),
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName
        }
      })
    } catch (error) {
      console.error('Error fetching direct messages:', error)
      return reply.status(500).send({ error: 'Failed to fetch messages' })
    }
  })

  // Send direct message
  fastify.post('/direct-messages', async (req: FastifyRequest<{
    Body: { receiverId: string; message: string }
  }>, reply) => {
    try {
      const { receiverId, message } = req.body

      if (!receiverId || !message || !message.trim()) {
        return reply.status(400).send({ error: 'Receiver and message are required' })
      }

      // Verify receiver exists
      const receiver = await fastify.models.User.findByPk(receiverId)
      if (!receiver) {
        return reply.status(404).send({ error: 'Receiver not found' })
      }

      // Create message
      const directMessage = await fastify.models.DirectMessage.create({
        senderId: req.user.id,
        receiverId,
        message: message.trim().slice(0, 2000) // Limit message length
      })

      // Emit SSE event to receiver
      sync.emit('direct_message', {
        id: directMessage.id,
        senderId: req.user.id,
        receiverId,
        message: directMessage.message,
        senderName: `${req.user.firstName} ${req.user.lastName}`.trim(),
        createdAt: directMessage.createdAt
      })

      // Log the sent message (for tracking social interactions)
      process.nextTick(async () => {
        try {
          const context = await getLogContext(req.user)
          await fastify.models.Log.create({
            userId: req.user.id,
            event: 'direct_message_sent',
            text: '',
            metadata: {
              directMessageId: directMessage.id,
              receiverId,
              message: directMessage.message,
            },
            context,
          })
        } catch (logError) {
          console.error('Error logging direct message:', logError)
        }
      })

      return reply.send({
        id: directMessage.id,
        senderId: directMessage.senderId,
        receiverId: directMessage.receiverId,
        message: directMessage.message,
        createdAt: directMessage.createdAt,
        updatedAt: directMessage.updatedAt
      })
    } catch (error) {
      console.error('Error sending direct message:', error)
      return reply.status(500).send({ error: 'Failed to send message' })
    }
  })
}
