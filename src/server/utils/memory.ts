import Instructor from '@instructor-ai/instructor'
import OpenAI from 'openai'
// import Anthropic from '@anthropic-ai/sdk' // Temporarily disabled
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

// Anthropic client (for Usership users)
// TODO: Fix Anthropic client initialization with Instructor library
// const anthropic = new Anthropic({
//   apiKey: config.anthropic.apiKey,
// })
//
// const anthropicClient = Instructor({
//   client: anthropic,
//   mode: 'TOOLS',
// })

const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
})

// Helper to determine which engine to use based on user tags
export function getMemoryEngine(user: User): 'claude' | 'standard' {
  // Temporarily disabled Anthropic integration due to Instructor compatibility issues
  // TODO: Re-enable once Anthropic client is properly configured with Instructor
  return 'standard'

  // const hasUsershipTag = user.tags.some(
  //   (tag) => tag.toLowerCase() === UserTag.Usership.toLowerCase()
  // )
  // return hasUsershipTag && config.anthropic.apiKey ? 'claude' : 'standard'
}

export async function completeAndExtractQuestion(
  prompt: string,
  user: User
): Promise<MemoryQuestion> {
  const engine = getMemoryEngine(user)

  // Temporarily using OpenAI for all users until Anthropic integration is fixed
  // TODO: Re-enable Claude for Usership users once Anthropic client is properly configured
  // if (engine === 'claude') {
  //   // Use Anthropic Claude for Usership users
  //   const extractedQuestion = await anthropicClient.messages.create({
  //     messages: [{ role: 'user', content: prompt }],
  //     model: 'claude-3-5-haiku-20241022',
  //     max_tokens: 1024,
  //     response_model: {
  //       schema: questionSchema,
  //       name: 'Question',
  //     },
  //   })
  //   return questionSchema.parse(extractedQuestion)
  // } else {
    // Use OpenAI for all users
    const extractedQuestion = await oaiClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      response_model: {
        schema: questionSchema,
        name: 'Question',
      },
    })
    return questionSchema.parse(extractedQuestion)
  // }
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

  const head = `
You are an AI agent of LOT Systems, a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials.

On the LOT website, users can:
- Modify their settings, such as country and city of residence, in the "Settings" section.
- Engage with the community by leaving chat messages in the "Sync" section and upvoting other's messages.
- Write private notes in the "Note" section.
- Respond to prompts in the "Memory" section.

Each action taken within these modules generates a log record. This log captures a snapshot of data relevant to the moment the action was performed, which may include:
- Local time
- Local temperature and humidity
- City, country, and time zone

Your task is to analyze the logs and formulate one personalized question for the user, offering three answer choices. Your response must consist only of the question and the three choices, without any additional text. The question should be general rather than specific to the log's content, designed to gauge the user's mood or state of mind. Aim for creativity, friendliness, and an engaging tone, avoiding overly generic queries. Speak to the user as if you were a friend. Keep the tone calm and supportive.

Examples of some of built-in questions (DO NOT REPEAT THEM):
1. What is your outfit today? (Options: Neutral and comfortable, Light, Dressed up)
2. How would you describe your lunch today? (Options: Fresh salad, Balanced proteins and carbs, It's a treat day!)
3. Pay attention to posture? (Options: Always, Sometimes, Ask me later)
4. Let’s try no tech 1 hour before sleep? (Options: Always, Sure, Never)
5. Are you comfortable saying no? (Options: Yes, No, Getting there)

Each log entry is formatted as follows:

\`\`\`
---
[<MODULE>] 19 Oct 2023 22:35, Paris, France, T:13℃, H:55%
<CONTENT>
\`\`\`
Where \`<MODULE>\` indicates the section of the website the log is associated with: Settings, Sync, Note, or Memory.
For the Memory module, the content includes a question, options, and a selected answer. You need to continue the conversation by asking a new question based on the user's context and previous responses.

${
  contextLine
    ? 'Keep the current user context in mind when crafting your question.'
    : ''
}
${contextLine}
${
  contextLine
    ? 'Ensure the question is appropriate for this time and setting.'
    : ''
}
${
  contextLine && context.city
    ? `Please avoid asking generic questions about the city as if the user were merely a tourist there. Instead, be direct and personal, delving into the user's personality.`
    : ''
}

User logs:
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