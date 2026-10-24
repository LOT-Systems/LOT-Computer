/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import dayjs from '#server/utils/dayjs'
import { COUNTRY_BY_ALPHA3, DATE_TIME_FORMAT, USER_SETTING_NAME_BY_ID } from '#shared/constants'
import type { Log, LogEvent, LogSettingsChangeMetadata, User, UserSettings } from '#shared/types'
import { getLogContext } from '../logs.js'
import { aiEngineManager } from '../ai-engines.js'
import { toCelsius } from '#shared/utils'

const MODULE_BY_LOG_EVENT: Record<LogEvent, string> = {
  user_login: 'Login',
  user_logout: 'Logout',
  settings_change: 'Settings',
  theme_change: 'Theme',
  weather_update: 'Weather',
  note: 'Note',
  emotional_checkin: 'Check-in',
  system_feedback: 'Feedback',
  other: 'Other',
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
    console.log('Attempting Together AI for Memory Story generation')
    const engine = aiEngineManager.getEngine('together')
    console.log(`🤖 Using ${engine.name} for Memory Story generation`)

    const story = await engine.generateCompletion(prompt, 1000)
    console.log(`Story generated successfully with ${engine.name} (${story?.length || 0} chars)`)
    return story || composeLocalStory(user, answerLogs)
  } catch (error: any) {
    console.error('Together AI failed for Memory Story:', {
      message: error.message,
      preference: 'together'
    })
    console.log('Using local story composition fallback')
    return composeLocalStory(user, answerLogs)
  }
}

function composeLocalStory(user: User, answerLogs: Log[]): string {
  const name = user.firstName || 'This person'
  const answers = answerLogs
    .slice(0, 20)
    .map((log) => ({
      question: (log.metadata.question as string) || '',
      answer: (log.metadata.answer as string) || '',
      date: log.context.timeZone
        ? dayjs(log.createdAt).tz(log.context.timeZone).format('D MMM YYYY')
        : dayjs(log.createdAt).format('D MMM YYYY'),
    }))
    .filter((a) => a.question && a.answer)

  const count = answers.length
  if (count === 0) return `${name} has begun their journey. The first questions await.`

  const first = answers[answers.length - 1]
  const lines: string[] = []

  lines.push(`${name} — a portrait in ${count} answer${count !== 1 ? 's' : ''}.`)
  lines.push('')

  const sample = answers.slice(0, 6)
  for (const a of sample) {
    lines.push(`– "${a.question}" — ${a.answer}.`)
  }

  if (count > 6) {
    lines.push('')
    lines.push(`…and ${count - 6} more, woven in since ${first.date}.`)
  }

  lines.push('')
  lines.push('Each answer sharpens the portrait. The story continues.')

  return lines.join('\n')
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

  try {
    const engine = aiEngineManager.getEngine('together')
    const summary = await engine.generateCompletion(prompt, 2000)
    return summary || 'Unable to generate summary.'
  } catch (error: any) {
    console.error('Together AI failed for user summary:', error.message)
    return 'Unable to generate summary at this time.'
  }
}
