import type { Log, User } from '#shared/types'
import dayjs from '#server/utils/dayjs'

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt: string | null
  category: 'exploration' | 'consistency' | 'depth' | 'connection' | 'courage' | 'care' | 'romance'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon: string
}

export interface StoryArc {
  chapter: number
  title: string
  narrative: string
  activeQuests: Quest[]
  milestones: Milestone[]
}

export interface Quest {
  id: string
  title: string
  description: string
  progress: number // 0-100
  complete: boolean
  reward: string // What unlocks when complete
  category: 'daily' | 'weekly' | 'growth' | 'mastery'
}

export interface Milestone {
  level: number
  title: string
  reached: boolean
  reachedAt: string | null
  narrative: string
}

export interface UserNarrative {
  archetype: string // From existing profile data
  currentLevel: number // 1-100 based on engagement
  storyline: string // Current chapter narrative
  achievements: Achievement[]
  currentArc: StoryArc
  totalXP: number
  nextMilestone: Milestone | null
}

/**
 * Calculate user level from total activity
 */
function calculateLevel(totalActivities: number): number {
  // Level curve: 1-10 (beginner), 11-30 (explorer), 31-60 (practitioner), 61-90 (master), 91-100 (sage)
  if (totalActivities < 10) return Math.floor(totalActivities) + 1
  if (totalActivities < 50) return Math.floor(10 + (totalActivities - 10) / 2)
  if (totalActivities < 150) return Math.floor(30 + (totalActivities - 50) / 4)
  if (totalActivities < 500) return Math.floor(60 + (totalActivities - 150) / 12)
  return Math.min(100, Math.floor(90 + (totalActivities - 500) / 50))
}

/**
 * Define all achievements
 */
function defineAchievements(logs: Log[]): Achievement[] {
  const now = dayjs()

  // Count different activity types
  const checkIns = logs.filter(l => l.event === 'emotional_checkin')
  const answers = logs.filter(l => l.event === 'answer')
  const chatMessages = logs.filter(l => l.event === 'chat_message')
  const plans = logs.filter(l => l.event === 'plan_set')
  const notes = logs.filter(l => l.event === 'note')

  // Detect streaks
  const consecutiveDays = calculateConsecutiveDays(checkIns)

  // Detect romantic mentions
  const romanticNotes = notes.filter(n => {
    const text = (n.text || '').toLowerCase()
    return text.includes('love') || text.includes('partner') || text.includes('intimacy')
  })

  const achievements: Achievement[] = [
    // Exploration achievements
    {
      id: 'first_checkin',
      title: 'First Breath',
      description: 'Your first emotional check-in',
      unlocked: checkIns.length >= 1,
      unlockedAt: checkIns.length >= 1 ? checkIns[checkIns.length - 1].createdAt.toISOString() : null,
      category: 'exploration',
      rarity: 'common',
      icon: '🌱'
    },
    {
      id: 'first_answer',
      title: 'Mirror Gazer',
      description: 'Answered your first memory question',
      unlocked: answers.length >= 1,
      unlockedAt: answers.length >= 1 ? answers[answers.length - 1].createdAt.toISOString() : null,
      category: 'exploration',
      rarity: 'common',
      icon: '🪞'
    },
    {
      id: 'community_voice',
      title: 'Community Voice',
      description: 'Shared your first message with the community',
      unlocked: chatMessages.length >= 1,
      unlockedAt: chatMessages.length >= 1 ? chatMessages[chatMessages.length - 1].createdAt.toISOString() : null,
      category: 'connection',
      rarity: 'uncommon',
      icon: '💬'
    },

    // Consistency achievements
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Checked in 7 days in a row',
      unlocked: consecutiveDays >= 7,
      unlockedAt: consecutiveDays >= 7 ? checkIns[0].createdAt.toISOString() : null,
      category: 'consistency',
      rarity: 'uncommon',
      icon: '🔥'
    },
    {
      id: 'moon_cycle',
      title: 'Moon Cycle',
      description: '30 consecutive days of practice',
      unlocked: consecutiveDays >= 30,
      unlockedAt: consecutiveDays >= 30 ? checkIns[0].createdAt.toISOString() : null,
      category: 'consistency',
      rarity: 'rare',
      icon: '🌙'
    },
    {
      id: 'unwavering',
      title: 'Unwavering',
      description: '100 days of continuous practice',
      unlocked: consecutiveDays >= 100,
      unlockedAt: consecutiveDays >= 100 ? checkIns[0].createdAt.toISOString() : null,
      category: 'consistency',
      rarity: 'epic',
      icon: '⭐'
    },

    // Depth achievements
    {
      id: 'deep_diver',
      title: 'Deep Diver',
      description: 'Answered 50 memory questions',
      unlocked: answers.length >= 50,
      unlockedAt: answers.length >= 50 ? answers[49].createdAt.toISOString() : null,
      category: 'depth',
      rarity: 'rare',
      icon: '🌊'
    },
    {
      id: 'self_scholar',
      title: 'Self Scholar',
      description: 'Answered 100 memory questions',
      unlocked: answers.length >= 100,
      unlockedAt: answers.length >= 100 ? answers[99].createdAt.toISOString() : null,
      category: 'depth',
      rarity: 'epic',
      icon: '📚'
    },
    {
      id: 'soul_cartographer',
      title: 'Soul Cartographer',
      description: 'Answered 250 memory questions',
      unlocked: answers.length >= 250,
      unlockedAt: answers.length >= 250 ? answers[249].createdAt.toISOString() : null,
      category: 'depth',
      rarity: 'legendary',
      icon: '🗺️'
    },

    // Connection achievements
    {
      id: 'bridge_builder',
      title: 'Bridge Builder',
      description: 'Sent 20 community messages',
      unlocked: chatMessages.length >= 20,
      unlockedAt: chatMessages.length >= 20 ? chatMessages[19].createdAt.toISOString() : null,
      category: 'connection',
      rarity: 'uncommon',
      icon: '🌉'
    },

    // Romance achievements
    {
      id: 'heart_tender',
      title: 'Heart Tender',
      description: 'Acknowledged romantic connection in your practice',
      unlocked: romanticNotes.length >= 1,
      unlockedAt: romanticNotes.length >= 1 ? romanticNotes[0].createdAt.toISOString() : null,
      category: 'romance',
      rarity: 'uncommon',
      icon: '💕'
    },
    {
      id: 'intimacy_keeper',
      title: 'Intimacy Keeper',
      description: 'Regularly tending to romantic connection',
      unlocked: romanticNotes.length >= 10,
      unlockedAt: romanticNotes.length >= 10 ? romanticNotes[9].createdAt.toISOString() : null,
      category: 'romance',
      rarity: 'rare',
      icon: '💝'
    },

    // Care achievements
    {
      id: 'gentle_with_self',
      title: 'Gentle With Self',
      description: 'Practiced self-care 10 times',
      unlocked: logs.filter(l => l.event === 'self_care_completed').length >= 10,
      unlockedAt: logs.filter(l => l.event === 'self_care_completed').length >= 10 ?
        logs.filter(l => l.event === 'self_care_completed')[9].createdAt.toISOString() : null,
      category: 'care',
      rarity: 'uncommon',
      icon: '🫂'
    },

    // Courage achievements
    {
      id: 'truth_speaker',
      title: 'Truth Speaker',
      description: 'Logged 50 honest entries',
      unlocked: notes.length >= 50,
      unlockedAt: notes.length >= 50 ? notes[49].createdAt.toISOString() : null,
      category: 'courage',
      rarity: 'rare',
      icon: '🔊'
    }
  ]

  return achievements
}

/**
 * Calculate consecutive days from check-ins
 */
function calculateConsecutiveDays(checkIns: Log[]): number {
  if (checkIns.length === 0) return 0

  // Sort by date (newest first)
  const sorted = [...checkIns].sort((a, b) =>
    dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
  )

  let streak = 0
  let currentDate = dayjs()

  for (const checkIn of sorted) {
    const checkInDate = dayjs(checkIn.createdAt)
    const daysDiff = currentDate.diff(checkInDate, 'day')

    if (daysDiff === streak || (streak === 0 && daysDiff === 0)) {
      streak++
      currentDate = checkInDate
    } else if (daysDiff > streak + 1) {
      break // Streak broken
    }
  }

  return streak
}

/**
 * Generate story arc based on user progress
 */
function generateStoryArc(level: number, achievements: Achievement[], logs: Log[]): StoryArc {
  const checkIns = logs.filter(l => l.event === 'emotional_checkin')
  const answers = logs.filter(l => l.event === 'answer')

  // Determine chapter based on level
  let chapter = 1
  let title = 'Awakening'
  let narrative = 'You have begun to notice yourself. Each breath, each moment of awareness, is a step toward knowing who you are.'

  if (level >= 10) {
    chapter = 2
    title = 'Exploration'
    narrative = 'You are exploring the landscape of your inner world. Patterns emerge, connections form. You are learning your own language.'
  }

  if (level >= 30) {
    chapter = 3
    title = 'Integration'
    narrative = 'Your practice deepens. You see how everything connects - your moods, your patterns, your relationships. You are weaving meaning from experience.'
  }

  if (level >= 60) {
    chapter = 4
    title = 'Mastery'
    narrative = 'You have become fluent in the language of yourself. Your awareness is sharp, your compassion is deep. You guide yourself with wisdom.'
  }

  if (level >= 90) {
    chapter = 5
    title = 'Sage'
    narrative = 'You have walked the path and know it well. Your practice is second nature, your wisdom hard-won. You embody what you have learned.'
  }

  // Generate quests based on current state
  const activeQuests: Quest[] = []

  // Daily quest: check-in
  const todayCheckins = checkIns.filter(c =>
    dayjs().diff(dayjs(c.createdAt), 'day') === 0
  )
  activeQuests.push({
    id: 'daily_checkin',
    title: 'Today\'s Presence',
    description: 'Check in with yourself today',
    progress: todayCheckins.length > 0 ? 100 : 0,
    complete: todayCheckins.length > 0,
    reward: '+10 XP',
    category: 'daily'
  })

  // Growth quest: deeper reflection
  if (answers.length < 100) {
    activeQuests.push({
      id: 'reflection_journey',
      title: 'Reflection Journey',
      description: 'Answer 100 memory questions',
      progress: Math.floor((answers.length / 100) * 100),
      complete: answers.length >= 100,
      reward: 'Self Scholar achievement',
      category: 'growth'
    })
  }

  // Milestones
  const milestones: Milestone[] = [
    {
      level: 10,
      title: 'Explorer',
      reached: level >= 10,
      reachedAt: level >= 10 ? dayjs().toISOString() : null,
      narrative: 'You are no longer a beginner. You have crossed into exploration.'
    },
    {
      level: 30,
      title: 'Practitioner',
      reached: level >= 30,
      reachedAt: level >= 30 ? dayjs().toISOString() : null,
      narrative: 'Your practice has become part of you. You are a practitioner now.'
    },
    {
      level: 60,
      title: 'Master',
      reached: level >= 60,
      reachedAt: level >= 60 ? dayjs().toISOString() : null,
      narrative: 'You have mastered the art of self-awareness. Few reach this depth.'
    },
    {
      level: 90,
      title: 'Sage',
      reached: level >= 90,
      reachedAt: level >= 90 ? dayjs().toISOString() : null,
      narrative: 'You have become a sage of self-knowledge. Your wisdom lights the way.'
    }
  ]

  return {
    chapter,
    title,
    narrative,
    activeQuests,
    milestones
  }
}

/**
 * Generate complete user narrative
 */
export function generateUserNarrative(user: User, logs: Log[]): UserNarrative {
  const totalActivities = logs.length
  const currentLevel = calculateLevel(totalActivities)
  const achievements = defineAchievements(logs)
  const currentArc = generateStoryArc(currentLevel, achievements, logs)

  // Find next milestone
  const nextMilestone = currentArc.milestones.find(m => !m.reached) || null

  // Calculate XP (1 XP per activity)
  const totalXP = totalActivities

  // Get archetype from user metadata
  const archetype = user.metadata?.archetype || 'The Explorer'

  return {
    archetype,
    currentLevel,
    storyline: currentArc.narrative,
    achievements,
    currentArc,
    totalXP,
    nextMilestone
  }
}
