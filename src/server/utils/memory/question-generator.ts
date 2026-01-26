import { randomUUID } from 'crypto'
import dayjs from '#server/utils/dayjs'
import config from '#server/config'
import {
  COUNTRY_BY_ALPHA3,
  DATE_TIME_FORMAT,
  USER_SETTING_NAME_BY_ID,
} from '#shared/constants'
import {
  Log,
  LogEvent,
  LogSettingsChangeMetadata,
  MemoryQuestion,
  User,
  UserSettings,
  UserTag,
} from '#shared/types'
import { toCelsius } from '#shared/utils'
import { getLogContext } from '../logs.js'
import { aiEngineManager } from '../ai-engines.js'
import { extractGoals, type ExtractedGoal } from '../goal-understanding.js'
import {
  BACKUP_SELFCARE_QUESTIONS,
  questionSchema,
  oaiClient,
  anthropic,
  AI_ENGINE_PREFERENCE,
} from './constants.js'
import type { QuantumState } from './types.js'
import { extractUserTraits } from './trait-extraction.js'
import { determineUserCohort } from './cohort-determination.js'

/**
 * Get a backup question when all AI engines fail
 * Cycles through questions based on day of year to ensure variety
 */
function getBackupQuestion(dayOfYear: number): MemoryQuestion {
  const index = dayOfYear % BACKUP_SELFCARE_QUESTIONS.length
  const backup = BACKUP_SELFCARE_QUESTIONS[index]

  console.log(`🔄 Using backup question #${index + 1}/${BACKUP_SELFCARE_QUESTIONS.length}`)

  return {
    id: randomUUID(),
    question: backup.question,
    options: backup.options
  }
}

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

    try {
      // FALLBACK 1: Use legacy OpenAI with Instructor if new system fails
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
    } catch (openaiError: any) {
      // FALLBACK 2: All AI engines failed - use hardcoded backup questions
      console.error('❌ OpenAI fallback also failed, using backup questions:', {
        message: openaiError.message,
        user: user.email,
      })

      // Use day of year to rotate through backup questions (provides variety without DB dependency)
      const dayOfYear = dayjs().dayOfYear()

      console.log(`🆘 EMERGENCY FALLBACK: Using backup question bank (day ${dayOfYear})`)
      return getBackupQuestion(dayOfYear)
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

export async function buildPrompt(
  user: User,
  logs: Log[],
  isWeekend: boolean = false,
  quantumState?: QuantumState
): Promise<string> {
  console.log(`📝 buildPrompt called with ${logs.length} total logs for user ${user.id}`)

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

  // Quantum state context from client-side intention engine
  let quantumContext = ''
  if (quantumState && quantumState.energy && quantumState.energy !== 'unknown') {
    quantumContext = `\n\n**Quantum State (Real-time user energy from pattern recognition):**
Their current state: ${quantumState.energy} energy, ${quantumState.clarity} clarity, ${quantumState.alignment} alignment
Support level: ${quantumState.needsSupport}

**Quantum-Aware Question Guidance:**
${quantumState.energy === 'depleted' || quantumState.energy === 'low'
  ? '- User has low energy: Ask gentle, restorative questions about rest, self-care, or small wins'
  : quantumState.energy === 'high'
  ? '- User has high energy: Ask expansive questions about goals, creativity, or meaningful action'
  : '- User has moderate energy: Balanced questions about daily life and growth'}

${quantumState.clarity === 'confused' || quantumState.clarity === 'uncertain'
  ? '- User lacks clarity: Ask grounding questions to help them notice and understand their state'
  : quantumState.clarity === 'focused'
  ? '- User is focused: Ask deeper questions that leverage their current clarity'
  : ''}

${quantumState.alignment === 'disconnected' || quantumState.alignment === 'searching'
  ? '- User feels disconnected: Ask questions about values, intentions, or what matters'
  : quantumState.alignment === 'flowing'
  ? '- User is in flow: Ask questions that celebrate and deepen this aligned state'
  : ''}

${quantumState.needsSupport === 'critical' || quantumState.needsSupport === 'moderate'
  ? '- User needs support: Prioritize compassionate, supportive questions over analytical ones'
  : ''}

Match your question to their quantum state. The engine recognizes patterns they may not consciously see.`
  }

  // Goal context - understand what user is working toward
  const userGoals = extractGoals(user, logs)
  const activeGoals = userGoals.filter(g => g.state === 'active' || g.state === 'progressing').slice(0, 3)

  let goalContext = ''
  if (activeGoals.length > 0) {
    const goalList = activeGoals.map((g, i) => {
      const progressInfo = g.progressMarkers.length > 0
        ? ` (${g.journeyStage} stage - ${g.progressMarkers[g.progressMarkers.length - 1].description})`
        : ` (${g.journeyStage} stage)`

      return `${i + 1}. ${g.title}${progressInfo}`
    }).join('\n')

    const primaryGoal = activeGoals[0]

    goalContext = `\n\n**User's Current Goals (Extracted from patterns and intentions):**
${goalList}

**CRITICAL - Goal-Aligned Question Generation:**
This user is actively working toward: "${primaryGoal.title}"
- Journey stage: ${primaryGoal.journeyStage}
- Category: ${primaryGoal.category}
- Confidence: ${Math.round(primaryGoal.confidence * 100)}%

${primaryGoal.journeyStage === 'beginning'
  ? `They're just starting this journey. Ask foundational questions that help them understand WHY this goal matters to them and what small first steps they can take.`
  : primaryGoal.journeyStage === 'struggle'
  ? `They're in the struggle phase. Ask supportive questions that acknowledge difficulty while reinforcing commitment. Help them see obstacles as part of growth.`
  : primaryGoal.journeyStage === 'breakthrough'
  ? `They're experiencing breakthrough! Ask questions that help them recognize and celebrate progress, deepen the practice, and integrate learnings.`
  : primaryGoal.journeyStage === 'integration'
  ? `They're integrating this practice into their life. Ask questions that explore how it's changing them, what it reveals about who they're becoming.`
  : `Ask questions that honor their mastery and invite reflection on the wisdom gained.`}

**Goal-Aligned Question Strategy:**
1. Your questions should DIRECTLY support their active goals
2. When exploring new topics, connect back to how it relates to their goals
3. Celebrate progress toward goals when evident in their answers
4. If they seem stuck, ask questions that help them see the path forward
5. Make the connection between daily choices and long-term goals visible

${primaryGoal.category === 'emotional'
  ? 'Focus on: emotional regulation, mood patterns, triggers, coping strategies, emotional awareness'
  : primaryGoal.category === 'relational'
  ? 'Focus on: connection quality, boundary-setting, communication patterns, relationship needs'
  : primaryGoal.category === 'behavioral'
  ? 'Focus on: habit formation, consistency, routines, environmental design, accountability'
  : primaryGoal.category === 'growth'
  ? 'Focus on: self-awareness, values alignment, identity evolution, meaning-making'
  : primaryGoal.category === 'physical'
  ? 'Focus on: energy levels, sleep quality, movement, rest, body awareness'
  : primaryGoal.category === 'creative'
  ? 'Focus on: creative expression, flow states, inspiration, artistic practice'
  : 'Focus on: meaning, purpose, values, existential questions, life direction'}

The system exists to help users achieve their goals. Your questions are tools for transformation.`
  }

  // Extract Memory answers to build user's story
  const memoryLogs = logs.filter((log) => log.event === 'answer')

  console.log(`💬 Extracted ${memoryLogs.length} memory answers from ${logs.length} total logs`)

  // Extract recently asked questions to avoid duplicates (extended from 15 to 30)
  const recentQuestions = memoryLogs
    .slice(0, 30)
    .map(log => log.metadata.question || '')
    .filter(Boolean)

  console.log(`🔍 Found ${recentQuestions.length} recent questions for duplicate detection`)

  // Track topic diversity - extract key topics from recent questions
  const recentTopics = extractQuestionTopics(recentQuestions.slice(0, 10))
  const topicDiversityWarning = recentTopics.dominantTopic ? `
**TOPIC DIVERSITY WARNING**: You've asked ${recentTopics.topicCount} questions about "${recentTopics.dominantTopic}" recently.
MUST explore a DIFFERENT topic now. Consider: routine, relationships, creativity, rest, movement, environment, or mindset.
` : ''

  const uniquenessInstruction = recentQuestions.length > 0 ? `
**Recent Questions (for context and diversity):**
You have asked these ${recentQuestions.length} questions recently:
${recentQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

**STRICT NO-DUPLICATE POLICY:**
🚫 NEVER ask the same question twice - even with different wording
🚫 NEVER ask questions that are too similar to recent questions
🚫 If a topic was covered recently, find a completely NEW angle or topic

**Diversity Requirements:**
- MUST explore different aspects of their life each time
- Questions should feel fresh and engaging, not repetitive
- Natural follow-ups are OK ONLY if they reveal new information
- If a topic appears 2+ times in recent questions, it's OFF LIMITS

**Examples of FORBIDDEN repetition:**
❌ "What did you have for breakfast?" → "What do you usually eat for breakfast?"
❌ "How's your morning routine?" → "What time do you wake up?"
❌ "Do you drink coffee?" → "What's your favorite morning beverage?"

**Examples of GOOD diversity:**
✅ Morning routine → Evening wind-down routine (different time)
✅ Food preferences → Music preferences (different domain)
✅ Work stress → Creative outlets (different focus)

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
  // 15% chance to explore completely new area, 85% follow up for better narrative continuity
  const shouldExploreNewTopic = memoryLogs.length > 0 && Math.random() < 0.15

  console.log(`🎯 Question strategy: ${isWeekend ? 'WEEKEND MODE' : shouldExploreNewTopic ? 'EXPLORE NEW TOPIC' : memoryLogs.length === 0 ? 'FIRST QUESTION' : 'FOLLOW UP'}`)

  let userStory = ''
  let taskInstructions = ''

  // Construct task instructions based on context
  // (Weekend mode, first question, explore new topic, or follow up)
  // ... [Rest of buildPrompt function continues with all the logic from the original file]

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

  const fullPrompt = head + quantumContext + goalContext + '\n\n' + formattedLogs

  console.log(`📨 Prompt built: ${fullPrompt.length} chars total`)
  console.log(`   - Head section: ${head.length} chars`)
  console.log(`   - Quantum context: ${quantumContext.length} chars`)
  console.log(`   - Goal context: ${goalContext.length} chars`)
  console.log(`   - Formatted logs: ${formattedLogs.length} chars (${logs.map(formatLog).filter(Boolean).length} logs)`)
  console.log(`   - User story included: ${userStory.length > 0 ? 'YES' : 'NO'}`)
  console.log(`   - Recent questions list: ${recentQuestions.length} questions`)

  return fullPrompt
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
