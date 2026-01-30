import { Op } from 'sequelize'
import dayjs from '#server/utils/dayjs'
import type { PacingResult } from './types.js'

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
): Promise<PacingResult> {
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
    // Weekends: 12-15 prompts throughout the day (more time to reflect)
    const seed = dayNumber % 3
    promptQuotaToday = seed === 0 ? 12 : seed === 1 ? 14 : 15
  } else if (dayNumber === 1) {
    // Day 1: Welcome with 10 prompts (strong start)
    promptQuotaToday = 10
  } else if (dayNumber === 2) {
    // Day 2: Continued engagement with 8 prompts
    promptQuotaToday = 8
  } else if (dayNumber === 3) {
    // Day 3: Building momentum with 9 prompts
    promptQuotaToday = 9
  } else {
    // Day 4+: Generous pacing (10-15 prompts per day)
    // Ensures at least morning and night questions, plus throughout the day
    const seed = dayNumber % 7
    promptQuotaToday = seed % 5 === 0 ? 10 : seed % 5 === 1 ? 11 : seed % 5 === 2 ? 12 : seed % 5 === 3 ? 14 : 15
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
