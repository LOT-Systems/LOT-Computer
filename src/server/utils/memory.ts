import Instructor from '@instructor-ai/instructor'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { Op } from 'sequelize'
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
// Switch between 'together', 'claude', 'openai', or 'auto'
// This is where YOU control which AI engine to use - LOT owns the decision!
const AI_ENGINE_PREFERENCE: EnginePreference = 'together'

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

Make sure the question is personalized, relevant to self-care habits, and the options are 3-4 concise choices.

${context.weatherDescription ? `**WEATHER-AWARE QUESTIONS:**
The current weather is "${context.weatherDescription}". Consider asking questions that acknowledge this:
- If rainy/stormy: Ask about indoor comfort, cozy activities, or mood during rainy weather
- If sunny/clear: Ask about outdoor activities, energy levels, or sun exposure
- If cloudy/overcast: Ask about indoor vs outdoor preferences, lighting needs
- If extreme weather (very hot/cold/humid): Ask about coping strategies, comfort needs
` : ''}`

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

/**
 * Extract dominant topics from recent questions to ensure diversity
 */
function extractQuestionTopics(questions: string[]): {
  dominantTopic: string | null
  topicCount: number
} {
  const topicKeywords = {
    beverage: ['tea', 'coffee', 'drink', 'beverage', 'water', 'juice', 'caffeine', 'hydration'],
    food: ['food', 'meal', 'eat', 'lunch', 'dinner', 'breakfast', 'snack', 'recipe', 'cooking'],
    sleep: ['sleep', 'rest', 'bed', 'nap', 'tired', 'wake', 'morning routine', 'evening'],
    movement: ['exercise', 'walk', 'movement', 'stretch', 'yoga', 'activity', 'fitness', 'posture'],
    wellness: ['health', 'wellness', 'care', 'mindful', 'meditation', 'breath'],
    environment: ['space', 'room', 'environment', 'home', 'surroundings', 'temperature', 'light'],
    routine: ['routine', 'habit', 'daily', 'schedule', 'ritual', 'practice'],
    social: ['people', 'social', 'friends', 'family', 'connection', 'relationship'],
    creativity: ['create', 'creative', 'art', 'expression', 'hobby', 'interest'],
    mindset: ['feel', 'think', 'mindset', 'mental', 'emotion', 'mood', 'perspective']
  }

  const topicCounts: { [key: string]: number } = {}

  questions.forEach(question => {
    const lowerQ = question.toLowerCase()
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerQ.includes(keyword))) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      }
    })
  })

  // Find dominant topic (appears in 3+ recent questions)
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count >= 3)

  if (sortedTopics.length > 0) {
    return {
      dominantTopic: sortedTopics[0][0],
      topicCount: sortedTopics[0][1]
    }
  }

  return { dominantTopic: null, topicCount: 0 }
}

export async function buildPrompt(user: User, logs: Log[], isWeekend: boolean = false): Promise<string> {
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
      const tempC = Math.round(toCelsius(context.temperature))
      const weatherDesc = context.weatherDescription ? ` The weather is: ${context.weatherDescription}.` : ''
      contextLine += `, with a current temperature of ${tempC}℃ and humidity at ${Math.round(context.humidity)}%.${weatherDesc}`
    } else {
      contextLine += '.'
    }
  }

  // Extract Memory answers to build user's story
  const memoryLogs = logs.filter((log) => log.event === 'answer')

  // Extract recently asked questions to avoid duplicates (extended from 15 to 30)
  const recentQuestions = memoryLogs
    .slice(0, 30)
    .map(log => log.metadata.question || '')
    .filter(Boolean)

  // Track topic diversity - extract key topics from recent questions
  const recentTopics = extractQuestionTopics(recentQuestions.slice(0, 10))
  const topicDiversityWarning = recentTopics.dominantTopic ? `
**TOPIC DIVERSITY WARNING**: You've asked ${recentTopics.topicCount} questions about "${recentTopics.dominantTopic}" recently.
MUST explore a DIFFERENT topic now. Consider: routine, relationships, creativity, rest, movement, environment, or mindset.
` : ''

  const uniquenessInstruction = recentQuestions.length > 0 ? `
**❌ CRITICAL: ABSOLUTE DUPLICATE PREVENTION ❌**
You have ALREADY asked these ${recentQuestions.length} questions. NEVER ask anything similar:
${recentQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

🚨 MANDATORY RULES:
- Your new question MUST be about a COMPLETELY DIFFERENT topic
- DO NOT ask variations, follow-ups, or rephrased versions of the above
- Check EVERY word of your question against the list above
- If even 3 words match, REJECT IT and think of something else
- Ask about habits/routines that haven't been covered yet

Example of what NOT to do:
❌ If you asked "What did you have for breakfast?" DON'T ask "What did you eat this morning?"
❌ If you asked "How did you sleep?" DON'T ask "How was your sleep quality?"
✅ Instead, ask about a DIFFERENT area entirely (exercise, social time, creativity, etc.)

${topicDiversityWarning}` : ''

  // Extract journal entries for deeper persona research
  const journalLogs = logs.filter((log) => log.event === 'note' && log.text && log.text.length > 20)

  // Extract traits and determine psychological archetype + behavioral cohort
  let cohortInfo = ''
  let archetype = ''
  let behavioralCohort = ''
  let traits: string[] = []
  if (memoryLogs.length >= 3) {
    const analysis = extractUserTraits(logs)
    const { traits: extractedTraits, patterns, psychologicalDepth } = analysis
    const cohortResult = determineUserCohort(extractedTraits, patterns, psychologicalDepth)

    archetype = cohortResult.archetype
    behavioralCohort = cohortResult.behavioralCohort
    traits = extractedTraits

    if (archetype && extractedTraits.length > 0) {
      cohortInfo = `\n\n**Deep Psychological Profile:**
- Soul Archetype: "${archetype}" - ${cohortResult.description}
- Behavioral Cohort: "${behavioralCohort}"
- Core Values: ${psychologicalDepth.values.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ') || 'Still discovering'}
- Emotional Patterns: ${psychologicalDepth.emotionalPatterns.map(p => p.replace(/([A-Z])/g, ' $1').trim()).join(', ') || 'Still emerging'}
- Self-Awareness Level: ${psychologicalDepth.selfAwareness}/10
- Behavioral Traits: ${extractedTraits.map(t => t.replace(/([A-Z])/g, ' $1').trim()).join(', ')}

CRITICAL: Use this SOUL-LEVEL understanding to craft questions that speak to their deeper nature. Ask questions that ${archetype === 'The Seeker' ? 'invite reflection and growth' : archetype === 'The Nurturer' ? 'explore connection and care' : archetype === 'The Philosopher' ? 'probe meaning and purpose' : archetype === 'The Creator' ? 'celebrate expression and creativity' : archetype === 'The Harmonizer' ? 'support balance and peace' : archetype === 'The Achiever' ? 'honor goals and progress' : archetype === 'The Protector' ? 'respect security and stability' : archetype === 'The Authentic' ? 'encourage honesty and truth' : archetype === 'The Explorer' ? 'spark curiosity and discovery' : 'invite self-discovery'}.`

      console.log(`🧠 Memory question for "${archetype}" (${behavioralCohort}):`, {
        archetype,
        behavioralCohort,
        values: psychologicalDepth.values,
        emotionalPatterns: psychologicalDepth.emotionalPatterns,
        selfAwareness: psychologicalDepth.selfAwareness,
        answerCount: memoryLogs.length,
        journalCount: journalLogs.length
      })
    }
  }

  // Detect if recent questions are on similar topics (for compression)
  const detectTopicRepetition = (logs: Log[]): boolean => {
    if (logs.length < 3) return false

    const recentQuestions = logs.slice(0, 5).map(log => {
      const q = (log.metadata.question || '').toLowerCase()
      const a = (log.metadata.answer || '').toLowerCase()
      return `${q} ${a}`
    })

    // Common topic keywords
    const topics = {
      beverage: ['tea', 'coffee', 'drink', 'beverage', 'water', 'juice'],
      food: ['food', 'meal', 'eat', 'lunch', 'dinner', 'breakfast', 'salad', 'protein'],
      clothing: ['wear', 'clothing', 'fabric', 'outfit', 'dress', 'comfort'],
      routine: ['morning', 'evening', 'routine', 'ritual', 'habit', 'daily'],
      wellness: ['wellness', 'health', 'exercise', 'stretch', 'posture', 'sleep'],
    }

    // Count how many recent questions share the same topic
    let maxTopicCount = 0
    Object.values(topics).forEach(keywords => {
      let count = 0
      recentQuestions.forEach(text => {
        if (keywords.some(keyword => text.includes(keyword))) count++
      })
      maxTopicCount = Math.max(maxTopicCount, count)
    })

    // If 3+ of last 5 questions are on same topic, it's repetitive
    return maxTopicCount >= 3
  }

  const isRepetitiveFollowUp = detectTopicRepetition(memoryLogs)

  // Decide whether to explore a new topic or follow up on existing ones
  // 35% chance to explore completely new area, 65% follow up
  const shouldExploreNewTopic = memoryLogs.length > 0 && Math.random() < 0.35

  let userStory = ''
  let taskInstructions = ''

  // WEEKEND MODE: Lighter, easier prompts
  if (isWeekend) {
    taskInstructions = `
**WEEKEND MODE - Light & Easy Question**

**Your task:** Generate ONE light, easy, fun question with 3 simple answer choices:
1. **Keep it simple** - Weekend questions should be easy to answer, not require deep thought
2. **Make it enjoyable** - Focus on pleasant topics: food, comfort, relaxation, hobbies
3. **Quick to answer** - The user should be able to answer in 2 seconds
4. **Positive vibe** - Weekend questions should feel uplifting and stress-free

**Perfect weekend topics:**
- Favorite weekend breakfast or brunch items
- Comfort activities (reading, music, walks, cooking)
- Relaxation preferences (bath, nap, movie, nature)
- Simple pleasures (coffee, sunshine, cozy clothes)
- Weekend hobbies or interests

**Examples of good weekend questions:**
- "What's your ideal Saturday morning drink?" (Options: Fresh coffee, Herbal tea, Smoothie, Orange juice)
- "How do you prefer to unwind on weekends?" (Options: Reading a book, Taking a walk, Watching shows, Cooking something nice)
- "What's your go-to weekend comfort food?" (Options: Pancakes, Fresh pastries, Homemade soup, Favorite snacks)

**CRITICAL: Keep it LIGHT, SIMPLE, and FUN. No deep soul-searching on weekends - just pleasant, easy questions.**
${userStory ? '\n\nWhat we know about the user so far:\n' + userStory : ''}

${uniquenessInstruction}`
  } else if (memoryLogs.length === 0) {
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
- Seasonal preferences

${uniquenessInstruction}`
  } else if (shouldExploreNewTopic) {
    // Show story but ask to explore NEW topic
    const journalInsights = journalLogs.length > 0 ? `

Journal Entries (their deeper thoughts and reflections):
${journalLogs
  .slice(0, 8)
  .map((log, index) => {
    const text = (log.text || '').substring(0, 200) // First 200 chars for context
    const date = log.context.timeZone
      ? dayjs(log.createdAt).tz(log.context.timeZone).format('D MMM')
      : ''
    return `${index + 1}. ${date ? `[${date}] ` : ""}"${text}${text.length >= 200 ? '...' : ''}"`
  })
  .join('\n')}

These journal entries reveal their inner world - use them to understand their emotional state, concerns, and aspirations.` : ''

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
  .join('\n')}${journalInsights}

Based on these answers and journal entries, we're building their story. Now let's explore a NEW area of their life that we haven't asked about yet.`

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

${cohortInfo ? `**Soul Archetype Question Guidance:**
Tailor your question to their soul archetype "${archetype}":
- "The Seeker": Ask deep questions about growth, self-discovery, transformation, inner wisdom
- "The Nurturer": Explore connection, caring for others, emotional bonds, community support
- "The Achiever": Focus on goals, accomplishment, progress tracking, purposeful action
- "The Philosopher": Probe meaning, purpose, life's deeper questions, existential reflection
- "The Harmonizer": Ask about balance, peace-finding, conflict resolution, inner equilibrium
- "The Creator": Inquire about self-expression, creative process, artistic manifestation, innovation
- "The Protector": Explore safety needs, boundary-setting, stability creation, grounding practices
- "The Authentic": Focus on truth-telling, self-honesty, genuine expression, living aligned
- "The Explorer": Ask about new experiences, adventure, curiosity, expanding horizons
- "The Wanderer": Invite self-discovery, identity exploration, path-finding, openness to change

The question should speak to their SOUL LEVEL, not just surface behaviors. Make them think, feel, and reflect on who they truly are.` : ''}

${uniquenessInstruction}`
  } else {
    // Follow up on existing answers
    const journalInsights = journalLogs.length > 0 ? `

Journal Entries (their deeper thoughts and reflections):
${journalLogs
  .slice(0, 8)
  .map((log, index) => {
    const text = (log.text || '').substring(0, 200) // First 200 chars for context
    const date = log.context.timeZone
      ? dayjs(log.createdAt).tz(log.context.timeZone).format('D MMM')
      : ''
    return `${index + 1}. ${date ? `[${date}] ` : ""}"${text}${text.length >= 200 ? '...' : ''}"`
  })
  .join('\n')}

These journal entries reveal their inner world, emotional patterns, and personal reflections. Use them to ask questions that acknowledge what's truly on their mind.` : ''

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
  .join('\n')}${journalInsights}

Based on these answers and journal entries, you can infer the user's preferences, habits, lifestyle, and inner emotional state. Use this knowledge to craft follow-up questions that show you remember their choices AND understand what matters to them.`

    // COMPRESSED FORMAT for repetitive follow-ups (3+ questions on same topic)
    if (isRepetitiveFollowUp) {
      taskInstructions = `
**Your task:** Generate ONE BRIEF follow-up question with 2-3 SHORT answer choices.

**CRITICAL COMPRESSION RULES:**
- Question must be 8 words or less
- Each option must be 2-4 words maximum (no full sentences)
- Reference their previous answer briefly
- No lengthy explanations

**Examples of BRIEF follow-ups:**
- "What time usually?" → Options: "Morning", "Afternoon", "Evening"
- "How often?" → Options: "Daily", "Few times weekly", "Occasionally"
- "What temperature?" → Options: "Hot", "Warm", "Cold"
- "Alone or with others?" → Options: "Solo", "With someone", "Varies"

Keep it SHORT and SIMPLE. The user is answering many prompts - make this quick and easy.

${uniquenessInstruction}`
    } else {
      // DETAILED FORMAT for initial follow-ups (exploring depth)
      taskInstructions = `
**Your task:** Generate ONE personalized follow-up question with 3-4 answer choices that:
1. **MUST reference their previous answers** - Always start by acknowledging something they've already shared (e.g., "Since you mentioned you prefer tea in the morning, how do you usually prepare it?")
2. **Builds PROGRESSIVELY deeper into their psychological and soul profile** - Each follow-up should probe ONE level deeper than the previous question, moving from surface behaviors → underlying motivations → core values → soul-level identity
3. **Is contextually relevant** - Consider current time, weather, and their recent activity patterns

**CRITICAL: Progressive Depth Requirement:**
Follow-ups must build on BOTH behavioral patterns AND psychological/soul dimensions:
- **First follow-up**: Surface behavior details (how, when, what specifically)
- **Second follow-up**: Motivations and reasons (why this choice, what it provides)
- **Third follow-up**: Values and meaning (what this reveals about priorities, what matters)
- **Fourth+ follow-up**: Soul-level identity (who they are becoming, their deeper nature)

**CRITICAL: User-Feedback Loop Requirements:**
- If they have previous answers, you MUST explicitly reference at least one in your new question
- Show you remember what they told you - use phrases like "You mentioned...", "Since you prefer...", "Last time you chose...", "Building on your answer about..."
- If they have journal entries, acknowledge their deeper thoughts and feelings - their journal reveals what truly matters to them
- The question should feel like you're having an ongoing conversation, not starting fresh each time
- Make connections between their different answers AND journal reflections to show you understand their overall lifestyle and inner world

**Examples of progressive follow-up questions:**
LEVEL 1 (Behavior details): "Since you mentioned enjoying tea in the morning, how do you usually prepare it?" (Options: Quick tea bag, Loose leaf ritual, Matcha ceremony)
LEVEL 2 (Motivations): "You chose 'Loose leaf ritual' - what does this morning ritual provide for you?" (Options: Peaceful start, Mindful moment, Sensory pleasure)
LEVEL 3 (Values): "This ritual seems important to you. What value does it honor?" (Options: Presence, Self-care, Beauty in simplicity)
LEVEL 4 (Soul identity): "Reflecting on this practice, what does it reveal about who you're becoming?" (Options: Someone who values slowness, A mindful being, One who honors small rituals)

${cohortInfo ? `**Soul Archetype Follow-Up Guidance:**
Build deeper into their soul archetype "${archetype}" with this follow-up:
- "The Seeker": Connect growth practices (morning reflection → evening integration), deepen self-awareness
- "The Nurturer": Explore care rituals (how you care for others → how you care for yourself)
- "The Achiever": Link accomplishment patterns (morning productivity → evening reflection on progress)
- "The Philosopher": Probe meaning-making (what matters to you → why it matters, life philosophy)
- "The Harmonizer": Deepen balance practices (finding peace in mornings → maintaining it through challenges)
- "The Creator": Progress through creative process (inspiration → manifestation → expression)
- "The Protector": Connect safety needs (physical boundaries → emotional boundaries)
- "The Authentic": Explore honesty layers (being honest with self → being honest with others)
- "The Explorer": Build on curiosity (what you're exploring → what you're discovering about yourself)
- "The Wanderer": Invite clarity emergence (what you're questioning → what's becoming clearer)

CRITICAL: Make the follow-up SOUL-TOUCHING - reference their previous answer AND probe their deeper nature. Ask questions that make them pause and truly reflect on who they are becoming.` : ''}

${uniquenessInstruction}`
    }
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
  theme_change: 'Theme',
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
 * Analyzes both behavioral patterns AND psychological/emotional dimensions
 */
export function extractUserTraits(logs: Log[]): {
  traits: string[]
  patterns: { [key: string]: number }
  psychologicalDepth: {
    emotionalPatterns: string[]
    values: string[]
    selfAwareness: number
    emotionalRange: number
    reflectionQuality: number
    growthTrajectory: 'emerging' | 'developing' | 'deepening' | 'integrated'
    dominantNeeds: string[]
    journalSentiment: { positive: number; neutral: number; challenging: number }
  }
} {
  const answerLogs = logs.filter((log) => log.event === 'answer')
  const noteLogs = logs.filter((log) => log.event === 'note' && log.text && log.text.length > 20)

  if (answerLogs.length === 0) {
    return {
      traits: [],
      patterns: {},
      psychologicalDepth: {
        emotionalPatterns: [],
        values: [],
        selfAwareness: 0,
        emotionalRange: 0,
        reflectionQuality: 0,
        growthTrajectory: 'emerging',
        dominantNeeds: [],
        journalSentiment: { positive: 0, neutral: 0, challenging: 0 }
      }
    }
  }

  // Behavioral patterns (surface level)
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

  // Psychological patterns (deep level)
  const psychPatterns: { [key: string]: number } = {
    reflective: 0,         // think, reflect, consider, ponder, wonder
    emotionallyAware: 0,   // feel, emotion, mood, sense, notice
    growthOriented: 0,     // learn, grow, improve, develop, evolve
    connectionSeeking: 0,  // together, connection, share, community, relate
    autonomyDriven: 0,     // independent, alone, self, own, personal
    anxietyPresent: 0,     // worry, stress, anxious, overwhelm, pressure
    peaceSeeking: 0,       // calm, peace, quiet, stillness, gentle
    achievement: 0,        // accomplish, succeed, achieve, goal, productive
    creative: 0,           // create, express, art, imagine, design
    grounded: 0,           // stable, steady, routine, consistent, reliable
  }

  // Value indicators (soul level)
  const valuePatterns: { [key: string]: number } = {
    authenticity: 0,       // real, authentic, genuine, true, honest
    harmony: 0,            // balance, harmony, equilibrium, centered
    freedom: 0,            // free, choice, open, flexible, spontaneous
    security: 0,           // safe, secure, protected, stable, certain
    growth: 0,             // grow, expand, develop, evolve, transform
    connection: 0,         // love, connect, belong, together, bond
    meaning: 0,            // purpose, meaning, why, matter, significance
    beauty: 0,             // beautiful, aesthetic, lovely, pleasing, elegant
    simplicity: 0,         // simple, minimal, essential, clear, pure
    vitality: 0,           // energy, alive, vibrant, dynamic, zest
  }

  // Keywords for behavioral traits
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

  // Keywords for psychological patterns
  const psychKeywords = {
    reflective: ['think', 'reflect', 'consider', 'ponder', 'wonder', 'contemplate', 'realize', 'understand'],
    emotionallyAware: ['feel', 'feeling', 'emotion', 'mood', 'sense', 'notice', 'aware', 'experience'],
    growthOriented: ['learn', 'grow', 'improve', 'develop', 'evolve', 'better', 'progress', 'change'],
    connectionSeeking: ['together', 'connection', 'share', 'community', 'relate', 'friend', 'people', 'social'],
    autonomyDriven: ['independent', 'alone', 'self', 'own', 'personal', 'individual', 'myself', 'solo'],
    anxietyPresent: ['worry', 'stress', 'anxious', 'overwhelm', 'pressure', 'tense', 'nervous', 'uncertain'],
    peaceSeeking: ['calm', 'peace', 'peaceful', 'quiet', 'stillness', 'gentle', 'serene', 'tranquil'],
    achievement: ['accomplish', 'succeed', 'achieve', 'goal', 'productive', 'finish', 'complete', 'done'],
    creative: ['create', 'creative', 'express', 'art', 'imagine', 'design', 'craft', 'make'],
    grounded: ['stable', 'steady', 'routine', 'consistent', 'reliable', 'regular', 'predictable', 'grounded'],
  }

  // Keywords for values
  const valueKeywords = {
    authenticity: ['real', 'authentic', 'genuine', 'true', 'honest', 'sincere', 'actual', 'myself'],
    harmony: ['balance', 'balanced', 'harmony', 'harmonious', 'equilibrium', 'centered', 'middle', 'moderate'],
    freedom: ['free', 'freedom', 'choice', 'open', 'flexible', 'spontaneous', 'liberated', 'unrestricted'],
    security: ['safe', 'safety', 'secure', 'protected', 'stable', 'certain', 'sure', 'comfort'],
    growth: ['grow', 'growth', 'expand', 'develop', 'evolve', 'transform', 'become', 'potential'],
    connection: ['love', 'loving', 'connect', 'connection', 'belong', 'together', 'bond', 'relationship'],
    meaning: ['purpose', 'purposeful', 'meaning', 'meaningful', 'why', 'matter', 'significance', 'important'],
    beauty: ['beautiful', 'beauty', 'aesthetic', 'lovely', 'pleasing', 'elegant', 'graceful', 'pretty'],
    simplicity: ['simple', 'simplicity', 'minimal', 'essential', 'clear', 'pure', 'basic', 'uncomplicated'],
    vitality: ['energy', 'energetic', 'alive', 'vibrant', 'dynamic', 'zest', 'vigorous', 'lively'],
  }

  // Combine all text from answers AND notes for deeper analysis
  const allText = [
    ...answerLogs.map(log => `${log.metadata.question || ''} ${log.metadata.answer || ''}`),
    ...noteLogs.map(log => log.text || '')
  ].join(' ').toLowerCase()

  // Count behavioral matches in answers only
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

  // Count psychological patterns across ALL logs (answers + notes)
  Object.entries(psychKeywords).forEach(([trait, words]) => {
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
      const matches = allText.match(regex)
      if (matches) {
        psychPatterns[trait] += matches.length
      }
    })
  })

  // Count value indicators across ALL logs
  Object.entries(valueKeywords).forEach(([value, words]) => {
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
      const matches = allText.match(regex)
      if (matches) {
        valuePatterns[value] += matches.length
      }
    })
  })

  // Calculate self-awareness score (0-100) for long-term growth tracking
  // This becomes 0-10% when divided by 10 in the frontend
  // Growth is gradual with decimal precision (e.g., 2.3%, 5.7%)
  const reflectiveScore = psychPatterns.reflective + psychPatterns.emotionallyAware
  const totalLogs = answerLogs.length + noteLogs.length

  // Components of awareness (each contributes to 0-100 scale):
  // 1. Volume of engagement (0-40 points): More interactions = deeper self-knowledge
  const volumeScore = Math.min(40, Math.sqrt(totalLogs) * 4) // Logarithmic growth

  // 2. Reflective quality (0-30 points): Ratio of reflective content
  const reflectiveRatio = reflectiveScore / Math.max(1, totalLogs)
  const qualityScore = reflectiveRatio * 30

  // 3. Consistency bonus (0-15 points): Regular engagement over time
  const daysSinceStart = logs.length > 0
    ? Math.floor((Date.now() - new Date(logs[logs.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const consistencyScore = Math.min(15, (totalLogs / Math.max(1, daysSinceStart)) * 100)

  // 4. Depth bonus (0-15 points): Long-form journaling and emotional check-ins
  const journalEntries = noteLogs.filter(log => log.text && log.text.length > 100).length
  const depthScore = Math.min(15, journalEntries * 1.5)

  // Combine all components (max 100)
  const rawScore = volumeScore + qualityScore + consistencyScore + depthScore

  // Return as 0-100 with 1 decimal precision (frontend will divide by 10 for %)
  const selfAwareness = Math.min(100, Number(rawScore.toFixed(1)))

  // Extract top behavioral traits (2+ matches required)
  const traits: string[] = Object.entries(patterns)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 4)
    .map(([trait, _]) => trait)

  // Extract top psychological patterns (3+ matches for significance)
  const emotionalPatterns: string[] = Object.entries(psychPatterns)
    .filter(([_, count]) => count >= 3)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([pattern, _]) => pattern)

  // Extract top values (2+ matches for significance)
  const values: string[] = Object.entries(valuePatterns)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([value, _]) => value)

  // ============================================================================
  // ENHANCED PSYCHOLOGICAL DEPTH METRICS
  // ============================================================================

  // 1. Emotional Range (0-10): Diversity of emotions expressed
  const uniqueEmotionKeywords = [
    'happy', 'sad', 'angry', 'anxious', 'peaceful', 'excited', 'frustrated',
    'grateful', 'overwhelmed', 'calm', 'energized', 'tired', 'hopeful',
    'worried', 'content', 'restless', 'joyful', 'fearful', 'confident', 'uncertain'
  ]
  const emotionsFound = uniqueEmotionKeywords.filter(emotion =>
    allText.includes(emotion)
  ).length
  const emotionalRange = Math.min(10, Math.round((emotionsFound / uniqueEmotionKeywords.length) * 10))

  // 2. Reflection Quality (0-10): Depth of introspection beyond surface word count
  const deepReflectionKeywords = [
    'realize', 'understand', 'discover', 'learn', 'notice', 'recognize',
    'aware', 'insight', 'reflection', 'wonder', 'question', 'explore',
    'meaning', 'purpose', 'truth', 'authentic', 'becoming', 'transform'
  ]
  const deepReflectionMatches = deepReflectionKeywords.filter(word =>
    allText.includes(word)
  ).length
  const avgJournalLength = noteLogs.length > 0
    ? noteLogs.reduce((sum, log) => sum + (log.text?.length || 0), 0) / noteLogs.length
    : 0
  const journalDepthBonus = avgJournalLength > 200 ? 2 : avgJournalLength > 100 ? 1 : 0
  const reflectionQuality = Math.min(10, deepReflectionMatches + journalDepthBonus)

  // 3. Growth Trajectory: Stage of self-discovery journey
  let growthTrajectory: 'emerging' | 'developing' | 'deepening' | 'integrated'
  const journeyDepth = answerLogs.length + (noteLogs.length * 2) // Notes count double
  if (journeyDepth < 10) {
    growthTrajectory = 'emerging'
  } else if (journeyDepth < 30) {
    growthTrajectory = 'developing'
  } else if (journeyDepth < 60) {
    growthTrajectory = 'deepening'
  } else {
    growthTrajectory = 'integrated'
  }

  // 4. Dominant Needs: Identify core psychological needs
  const needsKeywords = {
    security: ['safe', 'secure', 'stable', 'certain', 'predictable', 'reliable', 'grounded'],
    connection: ['connect', 'together', 'belong', 'relationship', 'love', 'friend', 'community'],
    growth: ['grow', 'learn', 'develop', 'improve', 'evolve', 'transform', 'change'],
    autonomy: ['independent', 'freedom', 'choice', 'own', 'self', 'control', 'decide'],
    meaning: ['purpose', 'meaning', 'matter', 'significance', 'why', 'value', 'important'],
    expression: ['creative', 'express', 'create', 'art', 'voice', 'authentic', 'unique']
  }
  const needCounts: { [key: string]: number } = {}
  Object.entries(needsKeywords).forEach(([need, keywords]) => {
    needCounts[need] = keywords.filter(word => allText.includes(word)).length
  })
  const dominantNeeds = Object.entries(needCounts)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([need, _]) => need)

  // 5. Journal Sentiment: Emotional tone analysis
  const positiveKeywords = [
    'grateful', 'happy', 'joy', 'love', 'peace', 'calm', 'content', 'hopeful',
    'excited', 'wonderful', 'beautiful', 'amazing', 'good', 'great', 'blessed'
  ]
  const challengingKeywords = [
    'difficult', 'hard', 'struggle', 'worry', 'stress', 'anxious', 'overwhelm',
    'tired', 'exhaust', 'frustrat', 'sad', 'angry', 'fear', 'pain', 'hurt'
  ]

  let positiveCount = 0
  let challengingCount = 0
  let totalSentimentWords = 0

  noteLogs.forEach(log => {
    const text = (log.text || '').toLowerCase()
    positiveKeywords.forEach(word => {
      if (text.includes(word)) {
        positiveCount++
        totalSentimentWords++
      }
    })
    challengingKeywords.forEach(word => {
      if (text.includes(word)) {
        challengingCount++
        totalSentimentWords++
      }
    })
  })

  const neutralCount = Math.max(0, noteLogs.length - (positiveCount + challengingCount))
  const totalForPercentage = Math.max(1, positiveCount + challengingCount + neutralCount)

  const journalSentiment = {
    positive: Math.round((positiveCount / totalForPercentage) * 100),
    neutral: Math.round((neutralCount / totalForPercentage) * 100),
    challenging: Math.round((challengingCount / totalForPercentage) * 100)
  }

  return {
    traits,
    patterns,
    psychologicalDepth: {
      emotionalPatterns,
      values,
      selfAwareness,
      emotionalRange,
      reflectionQuality,
      growthTrajectory,
      dominantNeeds,
      journalSentiment
    }
  }
}

/**
 * Determine user cohort based on psychological depth and behavioral patterns
 * Returns both a psychological archetype and a behavioral cohort
 */
export function determineUserCohort(
  traits: string[],
  patterns: { [key: string]: number },
  psychologicalDepth?: {
    emotionalPatterns: string[]
    values: string[]
    selfAwareness: number
  }
): { archetype: string; behavioralCohort: string; description: string } {

  // Determine psychological archetype (soul-level understanding)
  let archetype = 'The Explorer'
  let archetypeDescription = ''

  if (psychologicalDepth) {
    const { emotionalPatterns, values, selfAwareness } = psychologicalDepth

    // High self-awareness + growth + reflective = The Seeker
    if (selfAwareness >= 6 && emotionalPatterns.includes('growthOriented') && emotionalPatterns.includes('reflective')) {
      archetype = 'The Seeker'
      archetypeDescription = 'Growth-oriented soul on a journey of self-discovery. Deeply reflective, constantly evolving, values transformation.'
    }
    // Connection + emotionally aware + peace = The Nurturer
    else if (emotionalPatterns.includes('connectionSeeking') && emotionalPatterns.includes('emotionallyAware') && values.includes('connection')) {
      archetype = 'The Nurturer'
      archetypeDescription = 'Relationship-centered soul who finds meaning in caring for others. Emotionally attuned, values deep connection.'
    }
    // Achievement + grounded + autonomy = The Achiever
    else if (emotionalPatterns.includes('achievement') && emotionalPatterns.includes('grounded') && values.includes('growth')) {
      archetype = 'The Achiever'
      archetypeDescription = 'Purpose-driven soul focused on accomplishment and personal excellence. Structured, goal-oriented, values progress.'
    }
    // Reflective + meaning + high self-awareness = The Philosopher
    else if (emotionalPatterns.includes('reflective') && values.includes('meaning') && selfAwareness >= 7) {
      archetype = 'The Philosopher'
      archetypeDescription = 'Meaning-seeking soul who contemplates life\'s deeper questions. Introspective, values wisdom and understanding.'
    }
    // Peace + harmony + emotionally aware = The Harmonizer
    else if (emotionalPatterns.includes('peaceSeeking') && values.includes('harmony') && emotionalPatterns.includes('emotionallyAware')) {
      archetype = 'The Harmonizer'
      archetypeDescription = 'Balance-seeking soul who creates peace in their environment. Values equilibrium, avoids extremes, seeks centeredness.'
    }
    // Creative + freedom + vitality = The Creator
    else if (emotionalPatterns.includes('creative') && values.includes('freedom') && values.includes('vitality')) {
      archetype = 'The Creator'
      archetypeDescription = 'Expression-focused soul who brings ideas into reality. Values artistic freedom, innovation, and authentic self-expression.'
    }
    // Grounded + security + autonomy = The Protector
    else if (emotionalPatterns.includes('grounded') && values.includes('security') && emotionalPatterns.includes('autonomyDriven')) {
      archetype = 'The Protector'
      archetypeDescription = 'Safety-oriented soul who creates stability for themselves and others. Practical, reliable, values security and consistency.'
    }
    // Authenticity + freedom + high self-awareness = The Authentic
    else if (values.includes('authenticity') && values.includes('freedom') && selfAwareness >= 6) {
      archetype = 'The Authentic'
      archetypeDescription = 'Truth-seeking soul committed to living genuinely. Values honesty, self-expression, refuses to conform to expectations.'
    }
    // Growth + vitality + adventurous = The Explorer
    else if (values.includes('growth') && values.includes('vitality') && emotionalPatterns.includes('growthOriented')) {
      archetype = 'The Explorer'
      archetypeDescription = 'Adventure-seeking soul energized by new experiences. Curious, expansive, values discovery and possibility.'
    }
    // Default: The Wanderer (still discovering themselves)
    else {
      archetype = 'The Wanderer'
      archetypeDescription = 'Soul in transition, discovering their path. Open to possibilities, exploring what resonates, values self-discovery.'
    }
  }

  // Determine behavioral cohort (practical lifestyle patterns)
  let behavioralCohort = 'Balanced Lifestyle'

  if (traits.includes('healthConscious') && traits.includes('mindful')) {
    behavioralCohort = 'Wellness Enthusiast'
  } else if (traits.includes('plantBased') || patterns.plantBased >= 3) {
    behavioralCohort = 'Plant-Based'
  } else if (traits.includes('timeConscious') && patterns.timeConscious >= 3) {
    behavioralCohort = 'Busy Professional'
  } else if (traits.includes('comfortSeeker') && traits.includes('warmPreference')) {
    behavioralCohort = 'Comfort Seeker'
  } else if (traits.includes('adventurous') && patterns.adventurous >= 2) {
    behavioralCohort = 'Culinary Explorer'
  } else if (traits.includes('proteinFocused') && patterns.proteinFocused >= 3) {
    behavioralCohort = 'Protein-Focused'
  } else if (traits.includes('healthConscious')) {
    behavioralCohort = 'Health-Conscious'
  } else if (traits.includes('traditional')) {
    behavioralCohort = 'Classic Comfort'
  }

  return {
    archetype,
    behavioralCohort,
    description: archetypeDescription
  }
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
      const weatherDesc = context.weatherDescription ? ` The weather is: ${context.weatherDescription}.` : ''
      contextLine += `, with a current temperature of ${tempC}℃ and humidity at ${Math.round(context.humidity)}%.${weatherDesc}`
    } else {
      contextLine += '.'
    }
  }

  // Check if user has Usership tag for personalized suggestions
  const hasUsershipTag = user.tags.some(
    (tag) => tag.toLowerCase() === UserTag.Usership.toLowerCase()
  )

  // Track recent recipes to avoid repetition
  const recentRecipeLogs = logs
    .filter((log: Log) => log.event === 'note' && log.text &&
            (log.text.includes('Breakfast idea') ||
             log.text.includes('Lunch idea') ||
             log.text.includes('Dinner idea') ||
             log.text.includes('Snack idea')))
    .slice(0, 14) // Last 2 weeks of recipes

  const recentRecipes = recentRecipeLogs.map(log => {
    const text = log.text || ''
    // Extract recipe after "idea: " or "idea "
    const match = text.match(/idea[:\s]+(.+)$/i)
    return match ? match[1].toLowerCase().trim() : text.toLowerCase()
  })

  const avoidanceInstruction = recentRecipes.length > 0 ? `
**RECIPE DIVERSITY - AVOID RECENT SUGGESTIONS:**
${recentRecipes.slice(0, 7).map((r, i) => `${i + 1}. ${r}`).join('\n')}

CRITICAL: Suggest something DIFFERENT from the above. Vary ingredients, cooking methods, and flavor profiles.
` : ''

  // Add seasonal awareness
  const month = dayjs().month() // 0-11
  const season = month >= 2 && month <= 4 ? 'spring' :
                 month >= 5 && month <= 7 ? 'summer' :
                 month >= 8 && month <= 10 ? 'fall' : 'winter'

  const seasonalGuidance = `
**SEASONAL INGREDIENTS (${season}):**
${season === 'spring' ? '- Spring: asparagus, peas, strawberries, artichokes, fresh greens' :
  season === 'summer' ? '- Summer: tomatoes, cucumbers, berries, watermelon, peaches, zucchini' :
  season === 'fall' ? '- Fall: squash, pumpkin, apples, Brussels sprouts, sweet potatoes, mushrooms' :
  '- Winter: root vegetables, citrus, kale, cabbage, pomegranate, warming spices'}
Consider seasonal ingredients when appropriate.
`

  let userStory = ''
  let cohortInfo = ''
  if (hasUsershipTag && logs.length > 0) {
    // Extract traits and determine psychological archetype + behavioral cohort
    const analysis = extractUserTraits(logs)
    const { traits, patterns, psychologicalDepth } = analysis
    const cohortResult = determineUserCohort(traits, patterns, psychologicalDepth)

    if (traits.length > 0) {
      // Helper to format camelCase to Title Case
      const formatTrait = (str: string): string => {
        const formatted = str.replace(/([A-Z])/g, ' $1').trim()
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
      }

      cohortInfo = `\n\n**Deep Psychological Profile:**
- Soul Archetype: "${cohortResult.archetype}" - ${cohortResult.description}
- Behavioral Cohort: "${cohortResult.behavioralCohort}"
- Core Values: ${psychologicalDepth.values.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ') || 'Still discovering'}
- Emotional Patterns: ${psychologicalDepth.emotionalPatterns.map(p => formatTrait(p)).join(', ') || 'Still emerging'}
- Self-Awareness: ${psychologicalDepth.selfAwareness}/10

Suggest a meal that resonates with their SOUL ARCHETYPE "${cohortResult.archetype}" - not just their behavioral patterns. Consider their core values and emotional nature.`

      console.log(`🧠 Recipe for "${cohortResult.archetype}" (${cohortResult.behavioralCohort}):`, {
        archetype: cohortResult.archetype,
        behavioralCohort: cohortResult.behavioralCohort,
        values: psychologicalDepth.values,
        emotionalPatterns: psychologicalDepth.emotionalPatterns
      })
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
5. **Seasonal** - Incorporate seasonal ingredients when possible
6. **Varied** - Different from recent suggestions

${contextLine ? `Current context:\n${contextLine}` : ''}${seasonalGuidance}${avoidanceInstruction}${cohortInfo}${userStory}

**Weather-based guidance:**
${context.weatherDescription ? `Current weather: "${context.weatherDescription}"
- If rainy/stormy: Suggest warm, comforting, cozy foods (soups, warm drinks, baked goods)
- If sunny/clear: Suggest fresh, light, energizing foods (salads, fruits, cold drinks)
- If cloudy/overcast: Suggest balanced comfort foods
- ` : ''}Temperature: ${context.temperature ? Math.round(toCelsius(context.temperature)) : 'unknown'}℃
- If cold (below 15℃): Suggest warming, comforting foods (soups, hot meals, warm drinks)
- If hot (above 25℃): Suggest light, refreshing, cooling foods (cold salads, smoothies, chilled items)
- If moderate (15-25℃): Suggest balanced, versatile options
Humidity: ${context.humidity ? Math.round(context.humidity) : 'unknown'}%
- If very humid (above 80%): Suggest lighter, less rich options to avoid feeling heavy

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
    const cleaned = suggestion?.trim().replace(/^["']|["']$/g, '').replace(/[.!?]$/g, '') || ''

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
/**
 * INTELLIGENT PACING SYSTEM
 * Determines when and how many prompts to show based on:
 * - User's day number (progressive onboarding)
 * - Day of week (weekends are lighter)
 * - Time of day (natural moments)
 * - Random variation (feels organic)
 */
export async function calculateIntelligentPacing(
  userId: string,
  currentDate: dayjs.Dayjs,
  models: any
): Promise<{
  shouldShowPrompt: boolean
  isWeekend: boolean
  promptQuotaToday: number
  promptsShownToday: number
  dayNumber: number
}> {
  // Get user's first answer to calculate day number
  const firstAnswer = await models.Answer.findOne({
    where: { userId },
    order: [['createdAt', 'ASC']],
  })

  const dayNumber = firstAnswer
    ? currentDate.diff(dayjs(firstAnswer.createdAt), 'day') + 1
    : 1

  // Check if weekend
  const dayOfWeek = currentDate.day() // 0=Sunday, 6=Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Determine daily prompt quota based on day number and weekend status
  let promptQuotaToday: number

  if (isWeekend) {
    // Weekends: 6 prompts throughout the day (increased from 4)
    promptQuotaToday = 6
  } else if (dayNumber === 1) {
    // Day 1: Welcome with 5 prompts (increased from 3)
    promptQuotaToday = 5
  } else if (dayNumber === 2) {
    // Day 2: Gentle follow-up with 3 prompts (increased from 1)
    promptQuotaToday = 3
  } else if (dayNumber === 3) {
    // Day 3: Building rhythm with 4 prompts (increased from 2)
    promptQuotaToday = 4
  } else {
    // Day 4+: Variable pacing (3-5 prompts, increased from 1-3)
    // Use day number as seed for consistent daily variation
    const seed = dayNumber % 7
    promptQuotaToday = seed % 3 === 0 ? 3 : seed % 3 === 1 ? 4 : 5
  }

  // Count prompts shown today
  const startOfDay = currentDate.startOf('day')
  const endOfDay = currentDate.endOf('day')
  
  const promptsShownToday = await models.Answer.count({
    where: {
      userId,
      createdAt: {
        [Op.gte]: startOfDay.toDate(),
        [Op.lte]: endOfDay.toDate(),
      },
    },
  })

  // Check if quota reached
  if (promptsShownToday >= promptQuotaToday) {
    return {
      shouldShowPrompt: false,
      isWeekend,
      promptQuotaToday,
      promptsShownToday,
      dayNumber,
    }
  }

  // Check if it's a good time of day to show a prompt
  const hour = currentDate.hour()
  // ALWAYS allow prompts - removed time window restrictions
  // Quota system controls frequency, not time of day
  const isGoodTime = true

  console.log(`⏰ Time check for user ${userId}:`, {
    currentHour: hour,
    currentTime: currentDate.format('HH:mm'),
    isWeekend,
    isGoodTime: true,
    promptsShownToday,
    promptQuotaToday,
    dayNumber,
    timeWindow: 'All day (24/7)'
  })

  const shouldShowPrompt = isGoodTime

  return {
    shouldShowPrompt,
    isWeekend,
    promptQuotaToday,
    promptsShownToday,
    dayNumber,
  }
}
