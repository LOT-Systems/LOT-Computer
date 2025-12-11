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

  // Extract traits and determine cohort for personalized questioning
  let cohortInfo = ''
  let cohort = ''
  let traits: string[] = []
  if (memoryLogs.length >= 3) {
    const { traits: extractedTraits, patterns } = extractUserTraits(logs)
    cohort = determineUserCohort(extractedTraits, patterns)
    traits = extractedTraits

    if (cohort && extractedTraits.length > 0) {
      cohortInfo = `\n\n**User Cohort Profile:**
- Identified Cohort: "${cohort}"
- Key Traits: ${extractedTraits.map(t => t.replace(/([A-Z])/g, ' $1').trim()).join(', ')}
- Answer Count: ${memoryLogs.length}

Use this cohort profile to ask questions that are HIGHLY RELEVANT to their lifestyle pattern. Questions should feel like they're designed specifically for someone in their cohort.`

      console.log(`🎯 Memory question for cohort "${cohort}":`, { traits: extractedTraits, answerCount: memoryLogs.length })
    }
  }

  // Decide whether to explore a new topic or follow up on existing ones
  // 35% chance to explore completely new area, 65% follow up
  const shouldExploreNewTopic = memoryLogs.length > 0 && Math.random() < 0.35

  let userStory = ''
  let taskInstructions = ''

  if (memoryLogs.length === 0) {
    // First question - always explore
    taskInstructions = `
**Your task:** Generate ONE personalized question with 3-4 answer choices that:
1. **Explores a new aspect of their life** - Since this is the beginning, ask about their daily routines, preferences, or self-care habits
2. **Is open and welcoming** - Make them feel comfortable sharing
3. **Is contextually relevant** - Consider current time and weather

**Topic areas to explore:**
- Morning/evening routines
- Food and beverage preferences
- Clothing and comfort choices
- Self-care and wellness habits
- Social preferences and boundaries
- Work and rest balance
- Seasonal preferences`
  } else if (shouldExploreNewTopic) {
    // Show story but ask to explore NEW topic
    userStory = `
User's Memory Story (what we know about them so far):
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

Based on these answers, we're building their story. Now let's explore a NEW area of their life that we haven't asked about yet.`

    taskInstructions = `
**Your task:** Generate ONE question that EXPLORES A NEW TOPIC AREA we haven't covered yet:
1. **Choose an unexplored area** - Look at their existing answers and identify what aspects of their life we DON'T know about yet
2. **Start fresh** - Don't reference their previous answers; ask about something completely new
3. **Build story breadth** - Each question should explore a different dimension of their lifestyle
4. **Is contextually relevant** - Consider current time and weather

**Examples of exploring new topics:**
- If we know their morning beverage → Ask about their meal preferences
- If we know their clothing style → Ask about their evening wind-down routine
- If we know their social boundaries → Ask about their workspace preferences
- If we know their food choices → Ask about their movement/exercise habits

**Topic areas to explore (choose one we haven't covered):**
- Morning/evening routines and rituals
- Food, beverages, and meal preferences
- Clothing, fabrics, and comfort
- Self-care, skincare, and wellness
- Social energy and recharge methods
- Work environment and productivity
- Seasonal preferences and adaptation
- Movement, posture, and physical awareness
- Sleep and rest patterns
- Creative or hobby pursuits

${cohortInfo ? `**Cohort-Specific Question Guidance:**
Tailor your question to their identified cohort "${cohort}":
- "Wellness Enthusiast": Ask about mindfulness practices, organic choices, holistic wellness
- "Plant-Based": Explore plant protein sources, meal planning, nutritional knowledge
- "Busy Professional": Focus on time-saving routines, efficiency hacks, quick self-care
- "Comfort Seeker": Ask about cozy rituals, soothing routines, warm environments
- "Culinary Explorer": Inquire about new ingredients, cooking experiments, flavor preferences
- "Protein-Focused": Explore meal prep, protein timing, energy and performance
- "Health-Conscious": Ask about fresh food sourcing, organic preferences, nutrient awareness
- "Classic Comfort": Focus on familiar routines, traditional choices, consistency
- "Balanced Lifestyle": Explore how they balance different aspects of wellness

The question should feel like it was designed specifically for someone in their cohort.` : ''}`
  } else {
    // Follow up on existing answers
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

    taskInstructions = `
**Your task:** Generate ONE personalized follow-up question with 3-4 answer choices that:
1. **MUST reference their previous answers** - Always start by acknowledging something they've already shared (e.g., "Since you mentioned you prefer tea in the morning, how do you usually prepare it?")
2. **Builds deeper into their story** - Each question should feel like a natural continuation of the conversation, not a random topic
3. **Is contextually relevant** - Consider current time, weather, and their recent activity patterns

**CRITICAL: User-Feedback Loop Requirements:**
- If they have previous answers, you MUST explicitly reference at least one in your new question
- Show you remember what they told you - use phrases like "You mentioned...", "Since you prefer...", "Last time you chose...", "Building on your answer about..."
- The question should feel like you're having an ongoing conversation, not starting fresh each time
- Make connections between their different answers to show you understand their overall lifestyle

**Examples of good follow-up questions:**
- "Since you mentioned enjoying tea in the morning, how do you usually prepare it?" (Options: Quick tea bag, Loose leaf ritual, Matcha ceremony)
- "You chose 'Fresh salad' for lunch earlier. What's your go-to salad base?" (Options: Mixed greens, Spinach, Arugula)
- "Last time you said you prefer comfortable outfits. What fabrics feel best to you?" (Options: Soft cotton, Linen, Merino wool)
- "Building on your earlier answer about posture awareness, do you stretch during the day?" (Options: Regular breaks, Only when sore, Not yet)

${cohortInfo ? `**Cohort-Specific Follow-Up Guidance:**
Since this is a FOLLOW-UP question, build deeper into their cohort "${cohort}":
- "Wellness Enthusiast": Connect wellness practices together (morning tea → afternoon meditation)
- "Plant-Based": Explore plant-based nutrition depth (favorite veggies → protein sources)
- "Busy Professional": Link efficiency strategies (morning routine → evening wind-down)
- "Comfort Seeker": Deepen comfort preferences (favorite tea → preferred ambient temperature)
- "Culinary Explorer": Progress from ingredients to techniques (spices → cooking methods)
- "Protein-Focused": Connect protein habits (breakfast eggs → post-workout fuel)
- "Health-Conscious": Build health knowledge (organic produce → supplement awareness)
- "Classic Comfort": Explore traditional rituals (family recipes → holiday traditions)
- "Balanced Lifestyle": Connect different wellness dimensions (nutrition → movement)

CRITICAL: Make sure the follow-up EXPLICITLY references a previous answer AND feels cohort-appropriate.` : ''}`
  }

  const head = `
You are an AI agent of LOT Systems, a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials.

On the LOT website, users respond to prompts in the "Memory" section. Each answer helps build a story about the user's preferences, habits, and self-care approach.

${taskInstructions}

**Important guidelines:**
- Speak as a supportive friend who is genuinely curious
- Keep tone calm, warm, and personal
- The question should deepen understanding of their self-care habits, daily routines, and preferences
- Each answer helps build a richer, multi-dimensional narrative about who they are

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

Format as a flowing narrative with key insights. Focus on:
- Daily routines and preferences (morning beverages, meals, clothing)
- Self-care habits and priorities
- Lifestyle patterns and choices
- Personality traits evident in their answers

User's Memory Answers (chronological):
${formattedAnswers}

Generate a concise narrative story that captures who this person is based on their Memory answers.

IMPORTANT FORMATTING RULES:
1. Start with a brief introductory paragraph (1-2 sentences)
2. Add a blank line after the introduction
3. Write "Key insights into their daily routines and preferences include:"
4. Add a blank line
5. List key insights using "–" (en dash, not bullet points or hyphens) at the start of each line
6. Ensure each insight is a complete sentence
7. Do not use asterisks, bullets (•), or other symbols - only the en dash (–)

Example format:
This user is [brief description of their personality/situation].

Key insights into their daily routines and preferences include:

– They enjoy [specific preference with details].

– They prioritize [habit or routine], engaging in it [frequency].

– They have [characteristic or goal], using [method or approach].`

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

/**
 * Extract user traits from their answer logs for cohort analysis
 */
export function extractUserTraits(logs: Log[]): {
  traits: string[]
  patterns: { [key: string]: number }
} {
  const answerLogs = logs.filter((log) => log.event === 'answer')
  if (answerLogs.length === 0) {
    return { traits: [], patterns: {} }
  }

  // Analyze answers for patterns
  const patterns: { [key: string]: number } = {
    healthConscious: 0,    // salads, fresh, organic, wellness
    comfortSeeker: 0,      // warm, cozy, comfort, relaxing
    timeConscious: 0,      // quick, efficient, fast, easy
    plantBased: 0,         // vegetarian, vegan, plant-based
    proteinFocused: 0,     // meat, protein, eggs, chicken
    warmPreference: 0,     // hot, warm, tea, soup
    coldPreference: 0,     // cold, iced, chilled, fresh
    traditional: 0,        // classic, traditional, familiar
    adventurous: 0,        // new, try, different, variety
    mindful: 0,            // mindful, aware, intentional, present
  }

  // Keywords for each trait
  const keywords = {
    healthConscious: ['salad', 'fresh', 'organic', 'healthy', 'wellness', 'nutritious', 'greens', 'vegetables'],
    comfortSeeker: ['warm', 'cozy', 'comfort', 'relax', 'soft', 'gentle', 'soothing', 'calm'],
    timeConscious: ['quick', 'fast', 'efficient', 'easy', 'simple', 'convenient', 'busy', 'short'],
    plantBased: ['vegetarian', 'vegan', 'plant', 'vegetables', 'beans', 'lentils', 'tofu'],
    proteinFocused: ['meat', 'protein', 'chicken', 'beef', 'fish', 'eggs', 'salmon'],
    warmPreference: ['hot', 'warm', 'tea', 'soup', 'heated', 'steaming', 'cooked'],
    coldPreference: ['cold', 'iced', 'chilled', 'cool', 'refrigerated', 'raw'],
    traditional: ['classic', 'traditional', 'familiar', 'usual', 'regular', 'standard'],
    adventurous: ['new', 'try', 'different', 'variety', 'explore', 'experiment', 'unique'],
    mindful: ['mindful', 'aware', 'intentional', 'present', 'conscious', 'deliberate'],
  }

  // Count keyword matches in answers
  answerLogs.forEach((log) => {
    const answer = (log.metadata.answer || '').toLowerCase()
    const question = (log.metadata.question || '').toLowerCase()
    const combinedText = `${question} ${answer}`

    Object.entries(keywords).forEach(([trait, words]) => {
      words.forEach((word) => {
        if (combinedText.includes(word)) {
          patterns[trait]++
        }
      })
    })
  })

  // Extract top traits (those with 2+ matches)
  const traits: string[] = Object.entries(patterns)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 4) // Top 4 traits
    .map(([trait, _]) => trait)

  return { traits, patterns }
}

/**
 * Determine user cohort based on trait patterns
 */
export function determineUserCohort(traits: string[], patterns: { [key: string]: number }): string {
  // Cohort classification based on dominant traits
  if (traits.includes('healthConscious') && traits.includes('mindful')) {
    return 'Wellness Enthusiast'
  }
  if (traits.includes('plantBased') || patterns.plantBased >= 3) {
    return 'Plant-Based'
  }
  if (traits.includes('timeConscious') && patterns.timeConscious >= 3) {
    return 'Busy Professional'
  }
  if (traits.includes('comfortSeeker') && traits.includes('warmPreference')) {
    return 'Comfort Seeker'
  }
  if (traits.includes('adventurous') && patterns.adventurous >= 2) {
    return 'Culinary Explorer'
  }
  if (traits.includes('proteinFocused') && patterns.proteinFocused >= 3) {
    return 'Protein-Focused'
  }
  if (traits.includes('healthConscious')) {
    return 'Health-Conscious'
  }
  if (traits.includes('traditional')) {
    return 'Classic Comfort'
  }

  return 'Balanced Lifestyle'
}

/**
 * Generate contextual recipe suggestion based on user's memory, weather, and time
 */
export async function generateRecipeSuggestion(
  user: User,
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  logs: Log[] = []
): Promise<string> {
  const context = await getLogContext(user)
  const localDate = context.timeZone
    ? dayjs().tz(context.timeZone).format('D MMM YYYY, HH:mm')
    : null

  let contextLine = ''
  if (localDate && context.city && context.country) {
    const country = COUNTRY_BY_ALPHA3[context.country]?.name || ''
    if (country) {
      contextLine = `It is ${localDate} in ${context.city}, ${country}`
    }
    if (context.temperature && context.humidity) {
      const tempC = Math.round(toCelsius(context.temperature))
      contextLine += `, with a current temperature of ${tempC}℃ and humidity at ${Math.round(context.humidity)}%.`
    } else {
      contextLine += '.'
    }
  }

  // Check if user has Usership tag for personalized suggestions
  const hasUsershipTag = user.tags.some(
    (tag) => tag.toLowerCase() === UserTag.Usership.toLowerCase()
  )

  let userStory = ''
  let cohortInfo = ''
  if (hasUsershipTag && logs.length > 0) {
    // Extract traits and determine cohort
    const { traits, patterns } = extractUserTraits(logs)
    const cohort = determineUserCohort(traits, patterns)

    if (traits.length > 0) {
      cohortInfo = `\n\n**User Profile Analysis:**
- Cohort: "${cohort}"
- Key Traits: ${traits.map(t => t.replace(/([A-Z])/g, ' $1').trim()).join(', ')}
- Pattern Strength: ${Object.entries(patterns).filter(([_, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join(', ')}`

      console.log(`👤 User cohort analysis for ${user.email}:`, { cohort, traits, patterns })
    }

    // Get recent answer logs to understand user preferences
    const answerLogs = logs.filter((log: Log) => log.event === 'answer').slice(0, 10)

    if (answerLogs.length > 0) {
      userStory = `\n\nRecent answers:
${answerLogs
  .map((log: Log, index: number) => {
    const q = log.metadata.question || ''
    const a = log.metadata.answer || ''
    return `${index + 1}. ${q} → "${a}"`
  })
  .join('\n')}`
    }
  }

  const mealLabels = {
    breakfast: 'breakfast',
    lunch: 'lunch',
    dinner: 'dinner',
    snack: 'snack or light meal'
  }

  const prompt = `You are an AI agent for LOT Systems, a self-care subscription service focused on wellness and mindful living.

Generate ONE simple ${mealLabels[mealTime]} suggestion that is:
1. **Contextually appropriate** - Consider the current weather and location
2. **Simple and achievable** - Easy to prepare, not overly complex
3. **Wellness-focused** - Nutritious, mindful, and supportive of self-care
${hasUsershipTag && cohortInfo ? '4. **Deeply personalized** - Match their cohort profile and trait patterns' : ''}

${contextLine ? `Current context:\n${contextLine}` : ''}${cohortInfo}${userStory}

**Weather-based guidance:**
- If it's cold (below 15℃): Suggest warming, comforting foods
- If it's hot (above 25℃): Suggest light, refreshing foods
- If humid: Suggest lighter options

${cohortInfo ? `**Cohort-specific guidance:**
Use the user's cohort profile to guide your suggestion:
- "Wellness Enthusiast": Focus on nutrient-dense, mindful meals (smoothie bowls, buddha bowls, herbal teas)
- "Plant-Based": Ensure 100% plant-based ingredients (tofu, tempeh, legumes, nuts)
- "Busy Professional": Quick prep, minimal cooking (overnight oats, grab-and-go salads, pre-prepped ingredients)
- "Comfort Seeker": Warm, soothing, nostalgic foods (porridge, soup, baked goods, tea)
- "Culinary Explorer": Unique ingredients or preparations (matcha, kimchi, tahini, exotic spices)
- "Protein-Focused": Include clear protein source (eggs, chicken, fish, Greek yogurt, protein)
- "Health-Conscious": Emphasize fresh, whole foods (salads, lean proteins, vegetables, fruits)
- "Classic Comfort": Traditional, familiar recipes (scrambled eggs, grilled cheese, chicken soup)
- "Balanced Lifestyle": Well-rounded, moderate approach (mix of macros, variety)

**IMPORTANT**: The cohort and traits are derived from pattern analysis. Prioritize their cohort profile over generic suggestions.
` : ''}
**Examples of good suggestions:**
- "Warm oatmeal with cinnamon and banana" (cold morning, comfort seeker)
- "Chilled cucumber and avocado salad" (hot day, health-conscious)
- "Tofu scramble with turmeric and greens" (morning, plant-based)
- "Quick Greek yogurt bowl with berries" (busy professional, protein-focused)

Please respond with ONLY the recipe/meal suggestion - just a simple, clear description (5-8 words maximum). No explanation, no preamble, just the meal suggestion itself.`

  try {
    // Use AI engine abstraction
    console.log(`🍽️ Generating ${mealTime} recipe for user ${user.email}`)
    const engine = aiEngineManager.getEngine(AI_ENGINE_PREFERENCE)
    console.log(`🤖 Using ${engine.name} for recipe generation`)

    const suggestion = await engine.generateCompletion(prompt, 100)
    const cleaned = suggestion?.trim().replace(/^["']|["']$/g, '') || ''

    console.log(`✅ Recipe generated: "${cleaned}"`)
    return cleaned
  } catch (error: any) {
    console.error('❌ AI Engine failed for recipe generation:', {
      message: error.message,
      user: user.email,
    })

    // Fallback to simple context-based suggestions
    const temp = context.temperature ? toCelsius(context.temperature) : 20

    if (mealTime === 'breakfast') {
      return temp < 15 ? 'Warm oatmeal with cinnamon and banana' : 'Greek yogurt with honey and berries'
    } else if (mealTime === 'lunch') {
      return temp < 15 ? 'Warm lentil soup with crusty bread' : 'Grilled chicken salad'
    } else if (mealTime === 'dinner') {
      return temp < 15 ? 'Roasted vegetables with quinoa' : 'Baked salmon with asparagus'
    } else {
      return temp < 15 ? 'Warm almond butter on toast' : 'Fresh fruit with nuts'
    }
  }
}