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
import { aiEngineManager, type EnginePreference } from './ai-engines.js'

// OpenAI client (for non-Usership users - LEGACY fallback)
const oai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const oaiClient = Instructor({
  client: oai,
  mode: 'TOOLS',
})

// Anthropic client (LEGACY - kept for backwards compatibility)
const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
})

// ============================================================================
// AI ENGINE CONFIGURATION
// ============================================================================
// Switch between 'claude', 'openai', or 'auto' (auto tries Claude first, then OpenAI)
// This is where YOU control which AI engine to use - LOT owns the decision!
const AI_ENGINE_PREFERENCE: EnginePreference = 'auto'

const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
})

const userSummarySchema = z.object({
  summary: z.string(),
})

// Helper to determine which engine to use based on user tags
export function getMemoryEngine(user: User): 'ai' | 'standard' {
  const hasUsershipTag = user.tags.some(
    (tag) => tag.toLowerCase() === UserTag.Usership.toLowerCase()
  )
  // Check if ANY AI engine is available (Together AI, Gemini, Mistral, Claude, OpenAI)
  const hasAIEngine = !!(
    process.env.TOGETHER_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.MISTRAL_API_KEY ||
    config.anthropic?.apiKey ||
    process.env.OPENAI_API_KEY
  )
  return hasUsershipTag && hasAIEngine ? 'ai' : 'standard'
}

export async function completeAndExtractQuestion(
  prompt: string,
  user: User
): Promise<MemoryQuestion> {
  // ============================================================================
  // AI ENGINE ABSTRACTION IN ACTION
  // LOT owns the prompt and logic. AI engine is just a tool to execute it.
  // ============================================================================

  try {
    // Get the best available AI engine (Claude, then OpenAI, configurable)
    console.log(`🔍 Attempting to get AI engine with preference: ${AI_ENGINE_PREFERENCE}`)
    const engine = aiEngineManager.getEngine(AI_ENGINE_PREFERENCE)

    console.log(`🤖 Using ${engine.name} for Memory question generation (user: ${user.email})`)

    // LOT's prompt stays on LOT's side - engine just executes it
    const fullPrompt = `${prompt}

Please respond with ONLY a valid JSON object in this exact format:
{
  "question": "your question here",
  "options": ["option1", "option2", "option3"]
}

Make sure the question is personalized, relevant to self-care habits, and the options are 3-4 concise choices.`

    // Execute using whichever engine is available
    const completion = await engine.generateCompletion(fullPrompt, 1024)
    console.log(`✅ Got completion from ${engine.name} (length: ${completion?.length || 0})`)

    // Parse JSON from response (works for both Claude and OpenAI)
    const jsonMatch = completion.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error(`❌ No JSON found in ${engine.name} response:`, completion?.substring(0, 200))
      throw new Error(`No JSON found in ${engine.name} response`)
    }

    const parsed = JSON.parse(jsonMatch[0])
    const validatedQuestion = questionSchema.parse(parsed)

    console.log(`✅ Successfully generated question: "${validatedQuestion.question}"`)
    return {
      id: randomUUID(),
      ...validatedQuestion,
    }
  } catch (error: any) {
    console.error('❌ AI Engine failed, falling back to legacy OpenAI:', {
      message: error.message,
      stack: error.stack,
      user: user.email,
    })

    // FALLBACK: Use legacy OpenAI with Instructor if new system fails
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
    return `${index + 1}. ${date ? `[${date}] ` : ""}${q} → User chose: "${a}"`
  })
  .join('\n')}

Based on these answers, you can infer the user's preferences, habits, and lifestyle. Use this knowledge to craft follow-up questions that show you remember their choices.`
  }

  const head = `
You are an AI agent of LOT Systems, a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials.

On the LOT website, users respond to prompts in the "Memory" section. Each answer helps build a story about the user's preferences, habits, and self-care approach.

**Your task:** Generate ONE personalized follow-up question with 3-4 answer choices that:
1. **MUST reference their previous answers** - Always start by acknowledging something they've already shared (e.g., "Since you mentioned you prefer tea in the morning, how do you usually prepare it?")
2. **Builds deeper into their story** - Each question should feel like a natural continuation of the conversation, not a random topic
3. **Is contextually relevant** - Consider current time, weather, and their recent activity patterns

**CRITICAL: User-Feedback Loop Requirements:**
- If they have previous answers, you MUST explicitly reference at least one in your new question
- Show you remember what they told you - use phrases like "You mentioned...", "Since you prefer...", "Last time you chose...", "Building on your answer about..."
- The question should feel like you're having an ongoing conversation, not starting fresh each time
- Make connections between their different answers to show you understand their overall lifestyle

**Important guidelines:**
- Speak as a supportive friend who remembers EVERY past conversation
- Be specific when referencing their choices - don't be vague
- Keep tone calm, warm, and genuinely curious
- The question should deepen understanding of their self-care habits, daily routines, and preferences
- Each answer helps build a richer narrative about who they are

Examples of good Memory questions with feedback loop (STUDY THESE PATTERNS, DO NOT COPY):
WITHOUT previous answers:
1. "What is your outfit today?" (Options: Neutral and comfortable, Light, Dressed up)

WITH previous answers (showing proper feedback loop):
2. "Since you mentioned enjoying tea in the morning, how do you usually prepare it?" (Options: Quick tea bag, Loose leaf ritual, Matcha ceremony)
3. "You chose 'Fresh salad' for lunch earlier. What's your go-to salad base?" (Options: Mixed greens, Spinach, Arugula)
4. "Last time you said you prefer comfortable outfits. What fabrics feel best to you?" (Options: Soft cotton, Linen, Merino wool)
5. "Building on your earlier answer about posture awareness, do you stretch during the day?" (Options: Regular breaks, Only when sore, Not yet)
6. "You mentioned being comfortable saying no. How do you recharge after social interactions?" (Options: Quiet alone time, Light reading, Nature walk)

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

export async function generateMemoryStory(user: User, logs: Log[]): Promise<string> {
  // ============================================================================
  // MEMORY STORY DENSIFICATION - LOT's Core Logic
  // This stays on LOT's side regardless of which AI engine executes it
  // ============================================================================

  // Extract only Memory/answer logs
  const answerLogs = logs.filter((log) => log.event === 'answer')

  if (answerLogs.length === 0) {
    return 'No Memory story yet - user hasn\'t answered any prompts.'
  }

  // Format answers for AI to synthesize - LOT owns this formatting logic
  const formattedAnswers = answerLogs
    .slice(0, 30)
    .map((log) => {
      const q = log.metadata.question || ''
      const a = log.metadata.answer || ''
      const date = log.context.timeZone
        ? dayjs(log.createdAt).tz(log.context.timeZone).format('D MMM YYYY')
        : ''
      return `[${date}] ${q} → "${a}"`
    })
    .join('\n')

  // LOT's prompt - stays on LOT's side, engine-independent
  const prompt = `You are analyzing a user's Memory answers from LOT Systems, a self-care and lifestyle subscription service.

Based on their answers to personalized questions over time, create a narrative story about their preferences, habits, and lifestyle. Write in third person ("User prefers...", "They enjoy...").

Format as a flowing narrative with bullet points for key insights. Focus on:
- Daily routines and preferences (morning beverages, meals, clothing)
- Self-care habits and priorities
- Lifestyle patterns and choices
- Personality traits evident in their answers

User's Memory Answers (chronological):
${formattedAnswers}

Generate a concise narrative story (3-5 bullet points) that captures who this person is based on their Memory answers:`

  try {
    // Use AI engine abstraction - try Claude, then OpenAI, whichever works
    console.log('🔍 Attempting to get AI engine with preference:', AI_ENGINE_PREFERENCE)
    const engine = aiEngineManager.getEngine(AI_ENGINE_PREFERENCE)
    console.log(`🤖 Using ${engine.name} for Memory Story generation`)

    const story = await engine.generateCompletion(prompt, 1000)
    console.log(`✅ Story generated successfully with ${engine.name} (${story?.length || 0} chars)`)
    return story || 'Unable to generate story.'
  } catch (error: any) {
    console.error('❌ AI Engine failed for Memory Story:', {
      message: error.message,
      stack: error.stack,
      preference: AI_ENGINE_PREFERENCE
    })

    // FALLBACK: Try legacy Claude if new system fails
    console.log('🔄 Attempting legacy Claude fallback...')
    try {
      if (!anthropic || !config.anthropic?.apiKey) {
        throw new Error('Legacy Claude client not configured - API key missing')
      }

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }],
      })

      const textContent = response.content.find((block) => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        console.error('❌ Legacy Claude returned no text content')
        return 'Unable to generate story.'
      }

      console.log(`✅ Story generated with legacy Claude fallback (${textContent.text?.length || 0} chars)`)
      return textContent.text || 'Unable to generate story.'
    } catch (fallbackError: any) {
      console.error('❌ Legacy Claude also failed:', {
        message: fallbackError.message,
        stack: fallbackError.stack,
        hasAnthropicClient: !!anthropic,
        hasApiKey: !!config.anthropic?.apiKey,
        apiKeyLength: config.anthropic?.apiKey?.length || 0
      })
      return 'Unable to generate story at this time. Please try again later.'
    }
  }
}

export async function generateUserSummary(user: User, logs: Log[]): Promise<string> {
  const context = await getLogContext(user)
  const country = user.country ? COUNTRY_BY_ALPHA3[user.country]?.name || user.country : 'Unknown'

  const tags = user.tags.length > 0 ? user.tags.join(', ') : 'None'
  const joinedDate = user.joinedAt ? dayjs(user.joinedAt).format('D MMMM YYYY') : 'Not activated'
  const lastSeen = user.lastSeenAt ? dayjs(user.lastSeenAt).format('D MMMM YYYY, HH:mm') : 'Never'

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

  // Use Claude API instead of OpenAI
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return 'Unable to generate summary.'
  }

  return textContent.text || 'Unable to generate summary.'
}