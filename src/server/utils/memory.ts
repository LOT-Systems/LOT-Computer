import Instructor from '@instructor-ai/instructor'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import dayjs from '#server/utils/dayjs'
import config from '#server/config'
import {
  COUNTRY_BY_ALPHA3,
  DATE_TIME_FORMAT,
  USER_SETTING_NAME_BY_ID,
} from '#shared/constants'
import {
  DefaultQuestion,
  Log,
  LogEvent,
  LogSettingsChangeMetadata,
  MemoryQuestion,
  User,
  UserSettings,
  UserTag,
} from '#shared/types'
import { toCelsius } from '#shared/utils'
import { getLogContext } from './logs.js'

// OpenAI client (for non-Usership users)
const oai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const oaiClient = Instructor({
  client: oai,
  mode: 'TOOLS',
})

// Anthropic client (for Usership users) - using SDK directly
const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
})

const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
})

const userSummarySchema = z.object({
  summary: z.string(),
})

// Helper to determine which engine to use based on user tags
export function getMemoryEngine(user: User): 'claude' | 'standard' {
  const hasUsershipTag = user.tags.some(
    (tag) => tag.toLowerCase() === UserTag.Usership.toLowerCase()
  )
  return hasUsershipTag && config.anthropic.apiKey ? 'claude' : 'standard'
}

export async function completeAndExtractQuestion(
  prompt: string,
  user: User
): Promise<MemoryQuestion> {
  const engine = getMemoryEngine(user)

  if (engine === 'claude') {
    // Use Anthropic Claude for Usership users - direct SDK call
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${prompt}

Please respond with ONLY a valid JSON object in this exact format:
{
  "question": "your question here",
  "options": ["option1", "option2", "option3"]
}

Make sure the question is personalized, relevant to self-care habits, and the options are 3-4 concise choices.`
      }],
    })

    // Extract text content from Claude's response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response')
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const validatedQuestion = questionSchema.parse(parsed)
    return {
      id: randomUUID(),
      ...validatedQuestion,
    }
  } else {
    // Use OpenAI for regular users
    const extractedQuestion = await oaiClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      response_model: {
        schema: questionSchema,
        name: 'Question',
      },
    })
    const validatedQuestion = questionSchema.parse(extractedQuestion)
    return {
      id: randomUUID(),
      ...validatedQuestion,
    }
  }
}

export async function buildPrompt(user: User, logs: Log[]): Promise<string> {
  const context = await getLogContext(user)
  const localDate = context.timeZone
    ? dayjs().tz(context.timeZone).format('D MMM YYYY, HH:mm')
    : null
  let contextLine = ''
  if (localDate && context.city && context.country) {
    const country = COUNTRY_BY_ALPHA3[context.country]?.name || ''
    if (country) {
      contextLine = `It is ${localDate} in ${context.city}, ${context.country}`
    }
    if (context.temperature && context.humidity) {
      contextLine += `, with a current temperature of ${Math.round(
        toCelsius(context.temperature)
      )}℃ and humidity at ${Math.round(context.humidity)}%.`
    } else {
      contextLine += '.'
    }
  }

  // Extract Memory answers to build user's story
  const memoryLogs = logs.filter((log) => log.event === 'answer')
  let userStory = ''
  if (memoryLogs.length > 0) {
    userStory = `
User's Memory Story (what we know about them based on previous answers):
${memoryLogs
  .slice(0, 15)
  .map((log, index) => {
    const q = log.metadata.question || ''
    const a = log.metadata.answer || ''
    const date = log.context.timeZone
      ? dayjs(log.createdAt).tz(log.context.timeZone).format('D MMM')
      : ''
    return `${index + 1}. ${date ? `[${date}] ` : '"}${q} → User chose: "${a}"`
  })
  .join('\n')}

Based on these answers, you can infer the user's preferences, habits, and lifestyle. Use this knowledge to craft follow-up questions that show you remember their choices.`
  }

  const head = `
You are an AI agent of LOT Systems, a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials.

On the LOT website, users respond to prompts in the "Memory" section. Each answer helps build a story about the user's preferences, habits, and self-care approach.

**Your task:** Generate ONE personalized follow-up question with 3-4 answer choices that:
1. **Shows awareness of previous answers** - Reference what you know about them (e.g., "Since you prefer tea in the morning...")
2. **Builds on their story** - Each question should deepen understanding of their lifestyle and preferences
3. **Is contextually relevant** - Consider current time, weather, and their recent activity

**Important guidelines:**
- Speak as a supportive friend who remembers past conversations
- Be creative and engaging, avoid generic questions
- Keep tone calm and friendly
- The question should contribute to understanding their self-care habits, daily routines, and preferences
- Each answer helps build a narrative about who they are

Examples of good Memory questions (DO NOT REPEAT):
1. "What is your outfit today?" (Options: Neutral and comfortable, Light, Dressed up)
2. "How would you describe your lunch today?" (Options: Fresh salad, Balanced proteins and carbs, It's a treat day!)
3. "Pay attention to posture?" (Options: Always, Sometimes, Ask me later)
4. "Let's try no tech 1 hour before sleep?" (Options: Always, Sure, Never)
5. "Are you comfortable saying no?" (Options: Yes, No, Getting there)

${userStory}

${contextLine ? 'Current context to consider:' : ''}
${contextLine}
${
  contextLine
    ? 'Ensure the question is appropriate for this time and setting. Be direct and personal, focusing on the user\'s personality and habits.'
    : ''
}

Recent activity logs (for additional context):
  `.trim()
  const formattedLogs = logs.map(formatLog).filter(Boolean).join('\n\n')
  return head + '\n\n' + formattedLogs
}

function formatLog(log: Log): string {
  let body = ''
  switch (log.event) {
    case 'answer': {
      body = [
        `Q: "${log.metadata.question}"`,
        `O: ${((log.metadata.options || []) as string[])
          .map((x) => `"${x}"`)
          .join(', ')}`,
        `A: "${log.metadata.answer}"`,
      ].join('\n')
      break
    }
    case 'chat_message': {
      body = (log.metadata.message || '') as string
      break
    }
    case 'note': {
      body = log.text || ''
      break
    }
    case 'settings_change': {
      const metadata = log.metadata as LogSettingsChangeMetadata
      const changes = Object.keys(metadata.changes).map((_key) => {
        const key = _key as keyof UserSettings
        if (['country', 'city'].includes(key)) {
          return `${USER_SETTING_NAME_BY_ID[key]}: ${metadata.changes[key][0]} -> ${metadata.changes[key][1]}`
        }
        return ''
      })
      body = changes.filter(Boolean).join('\n').trim()
      break
    }
  }
  body = body.trim()
  if (!body) return ''

  const date = log.context.timeZone
    ? dayjs(log.createdAt).tz(log.context.timeZone).format('D MMM YYYY, HH:mm')
    : ''
  const city = date && log.context.city ? log.context.city : ''
  const country =
    date && log.context.country
      ? COUNTRY_BY_ALPHA3[log.context.country]?.name || ''
      : ''
  const temperature =
    date && log.context.temperature
      ? `T:${Math.round(toCelsius(log.context.temperature))}℃`
      : ''
  const humidity =
    date && log.context.humidity ? `H:${Math.round(log.context.humidity)}%` : ''

  return [
    `---`,
    [
      `[${MODULE_BY_LOG_EVENT[log.event as LogEvent] ?? log.event}] ${date}`,
      city,
      country,
      temperature,
      humidity,
    ]
      .map((x) => x.trim())
      .filter(Boolean)
      .join(', '),
    body,
  ].join('\n')
}

const MODULE_BY_LOG_EVENT: Record<LogEvent, string> = {
  user_login: 'Login',
  user_logout: 'Logout',
  settings_change: 'Settings',
  weather_update: 'Weather',
  note: 'Note',
  other: 'Other',
}

export async function generateUserSummary(user: User, logs: Log[]): Promise<string> {
  const context = await getLogContext(user)
  const country = user.country ? COUNTRY_BY_ALPHA3[user.country]?.name || user.country : 'Unknown'

  const tags = user.tags.length > 0 ? user.tags.join(', ') : 'None'
  const joinedDate = user.joinedAt ? dayjs(user.joinedAt).format('D MMMM YYYY') : 'Not activated'
  const lastSeen = user.lastSeenAt ? dayjs(user.lastSeenAt).fromNow() : 'Never'

  // Extract memory/answer logs specifically
  const answerLogs = logs.filter((log) => log.event === 'answer')
  const formattedAnswers = answerLogs.slice(0, 20).map(formatLog).filter(Boolean).join('\n\n')

  // Extract subscription info from metadata
  const hasSubscription = user.stripeCustomerId || (user.metadata as any)?.subscription
  const subscriptionInfo = hasSubscription
    ? `Has physical subscription history (Stripe ID: ${user.stripeCustomerId || 'in metadata'})`
    : 'No physical subscription history'

  // Count different types of activities
  const answerCount = answerLogs.length
  const otherActivityCount = logs.length - answerCount

  const prompt = `You are an AI assistant helping administrators understand LOT Systems users' self-care habits and lifestyle patterns.

LOT Systems is a subscription service focused on digital and physical necessities, wardrobes, organic self-care products, and essentials.

Analyze this user's Memory prompt answers and activity to create an insightful profile summary (2-3 paragraphs).

**Focus specifically on:**
1. **Self-care habits and understanding** - What do their answers reveal about their lifestyle, habits, and self-care approach?
2. **Memory engagement patterns** - How engaged are they with the Memory feature? What themes emerge from their answers?
3. **Subscription relationship** - Do they have physical subscription history? How does this relate to their digital engagement?

User Profile:
- Name: ${[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not provided'}
- Location: ${user.city || 'Unknown'}, ${country}
- Tags: ${tags}
- Joined: ${joinedDate}
- Last seen: ${lastSeen}
- Subscription: ${subscriptionInfo}
- Memory answers: ${answerCount} responses
- Other activities: ${otherActivityCount} actions

Memory Prompt Answers (their self-care and lifestyle responses):
${formattedAnswers || 'No Memory answers yet - user hasn\'t engaged with the Memory feature'}

${answerCount === 0 ? '\nNote: This user has not yet answered any Memory prompts, so insights are limited to their basic profile and activity patterns.' : ''}

Provide a warm, insightful summary that helps admins understand this user's self-care journey and engagement with LOT Systems.`

  const result = await oaiClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o-mini',
    response_model: {
      schema: userSummarySchema,
      name: 'UserSummary',
    },
  })

  return userSummarySchema.parse(result).summary
}