import dayjs from '#server/utils/dayjs'
import { COUNTRY_BY_ALPHA3 } from '#shared/constants'
import type { User, Log, UserTag } from '#shared/types'
import { toCelsius } from '#shared/utils'
import { getLogContext } from '../logs.js'
import { aiEngineManager } from '../ai-engines.js'
import { AI_ENGINE_PREFERENCE } from './constants.js'
import { extractUserTraits } from './trait-extraction.js'
import { determineUserCohort } from './cohort-determination.js'

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
    (tag) => tag.toLowerCase() === 'usership'
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
