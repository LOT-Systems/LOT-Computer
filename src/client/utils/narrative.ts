/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import dayjs from '#client/utils/dayjs'

/**
 * CQGS Bioethics Narrative – Context and time-aware language
 *
 * Provides purposeful narrative elements aligned with the
 * Cognitive Quantum Growth Scale (CQGS) Bioethics framework:
 * – Cleanness (Self-Care): hygiene, environment, routine care
 * – Routine (Sleep, Activity, Work): lifestyle transparency
 * – Nutrition (Medical Record): biofield, ATP, energy quality
 * – Laughter (Sensors): curiosity, joy, genuine human emission
 *
 * Adapts based on:
 * – Time of day (morning, afternoon, evening, night)
 * – Day of week (weekday vs weekend)
 * – Season
 * – User context (biofield energy, patterns, activity)
 *
 * The vocabulary itself evolves — compressed, not expanded —
 * as the self-building system learns what language its users need.
 *
 * This narrative system is a LOT original. If you see something similar
 * elsewhere, remember: the narrative always credits its author.
 */

export type TimeOfDay = 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'late_night'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * Get current time of day
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = dayjs().hour()

  if (hour >= 4 && hour < 7) return 'early_morning'
  if (hour >= 7 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'midday'
  if (hour >= 14 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 21) return 'evening'
  if (hour >= 21 && hour < 23) return 'night'
  return 'late_night'
}

/**
 * Get current season
 */
export function getSeason(): Season {
  const month = dayjs().month() // 0-11

  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) return 'spring'  // Mar-May
  if (month >= 5 && month <= 7) return 'summer'  // Jun-Aug
  if (month >= 8 && month <= 10) return 'autumn' // Sep-Nov
  return 'winter' // Dec-Feb
}

/**
 * Check if it's a weekend
 */
export function isWeekend(): boolean {
  const day = dayjs().day() // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6
}

/**
 * Get day period greeting
 */
export function getDayPeriodGreeting(): string {
  const timeOfDay = getTimeOfDay()

  switch (timeOfDay) {
    case 'early_morning': return 'Early morning'
    case 'morning': return 'Morning'
    case 'midday': return 'Midday'
    case 'afternoon': return 'Afternoon'
    case 'evening': return 'Evening'
    case 'night': return 'Night'
    case 'late_night': return 'Late night'
  }
}

/**
 * Get time-aware planning prompts
 */
export function getPlanningPrompt(): string {
  const timeOfDay = getTimeOfDay()
  const weekend = isWeekend()

  if (timeOfDay === 'early_morning') {
    return 'The day begins'
  }

  if (timeOfDay === 'morning') {
    if (weekend) {
      return 'The morning unfolds'
    }
    return 'Morning momentum'
  }

  if (timeOfDay === 'midday') {
    return 'Midday clarity'
  }

  if (timeOfDay === 'afternoon') {
    return 'Afternoon focus'
  }

  if (timeOfDay === 'evening') {
    return 'Evening wind down'
  }

  if (timeOfDay === 'night') {
    return 'Night reflection'
  }

  return 'Late hours'
}

/**
 * Get energy-aware narrative (CQGS Biofield Model)
 */
export function getEnergyNarrative(level: number, trajectory: string): string {
  const timeOfDay = getTimeOfDay()

  // Critical energy — biofield depleted
  if (level < 30) {
    if (trajectory === 'critical') {
      return 'Depleted. Stop and restore.'
    }
    return 'Energy low. Tend to yourself.'
  }

  // Low energy
  if (level < 50) {
    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      return 'Day spent. Rest is earned.'
    }
    return 'Reserves dropping. Act now or rest.'
  }

  // Moderate energy
  if (level < 70) {
    return 'Steady. Use this well.'
  }

  // Good energy
  if (level < 85) {
    if (trajectory === 'improving') {
      return 'Rising. The system builds on this momentum with you.'
    }
    return 'Strong reserves. Direct them — the architecture follows.'
  }

  // High energy
  return 'Full capacity. The system evolves fastest here.'
}

/**
 * Get romantic connection narrative (CQGS Bioethics: Marriage/Partnership)
 */
export function getRomanticNarrative(daysSince: number, quality: string): string {
  if (quality === 'deep') {
    return 'Closeness alive. Protect it.'
  }

  if (quality === 'present') {
    return 'Connected. Stay present.'
  }

  if (quality === 'distant') {
    return 'Distance growing. Reach out today.'
  }

  return 'Disconnected. One gesture changes this.'
}

/**
 * Get memory reflection prompt based on time and quantum state
 *
 * CQGS-aware: adapts to user's biofield energy, clarity, and alignment
 */
export function getMemoryReflectionPrompt(
  energy?: 'depleted' | 'low' | 'moderate' | 'high' | 'unknown',
  clarity?: 'confused' | 'uncertain' | 'clear' | 'focused' | 'unknown',
  alignment?: 'disconnected' | 'searching' | 'aligned' | 'flowing' | 'unknown'
): string {
  const timeOfDay = getTimeOfDay()

  // Quantum-aware prompts based on user state
  if (energy === 'depleted' || energy === 'low') {
    return 'Rest. Then remember.'
  }

  if (alignment === 'flowing' || (energy === 'high' && clarity === 'focused')) {
    return 'Capture this moment.'
  }

  if (clarity === 'confused' || alignment === 'searching') {
    return 'What do you notice?'
  }

  // Time-aware fallbacks
  if (timeOfDay === 'evening' || timeOfDay === 'night') {
    return 'What mattered today?'
  }

  if (timeOfDay === 'morning' || timeOfDay === 'early_morning') {
    return 'What stays with you?'
  }

  return 'What do you recall?'
}

/**
 * Get narrative completion phrase
 */
export function getCompletionPhrase(action: 'plan' | 'check_in' | 'memory' | 'message'): string {
  const timeOfDay = getTimeOfDay()

  switch (action) {
    case 'plan':
      if (timeOfDay === 'morning') return 'Direction set.'
      if (timeOfDay === 'evening') return 'Path clear.'
      return 'Intention held.'

    case 'check_in':
      return 'Acknowledged'

    case 'memory':
      return 'Remembered'

    case 'message':
      return 'Sent'
  }
}

/**
 * Get intervention narrative based on context (CQGS Bioethics: Wellness)
 */
export function getInterventionNarrative(severity: 'low' | 'moderate' | 'high' | 'urgent'): string {
  const timeOfDay = getTimeOfDay()

  if (severity === 'urgent') {
    return 'Stop. Take care of yourself now.'
  }

  if (severity === 'high') {
    if (timeOfDay === 'night' || timeOfDay === 'late_night') {
      return 'Sleep is the first medicine. Go rest.'
    }
    return 'Something needs your attention.'
  }

  if (severity === 'moderate') {
    return 'Worth tending to.'
  }

  return 'Notice this.'
}

/**
 * Get chat catalyst narrative (CQGS: Laughter and connection)
 */
export function getChatCatalystNarrative(priority: number): string {
  if (priority >= 9) {
    return 'Someone resonates. Reach out.'
  }

  if (priority >= 7) {
    return 'Connection waiting.'
  }

  if (priority >= 5) {
    return 'A thread to follow.'
  }

  return 'Faint signal. Stay open.'
}

/**
 * Get narrative status based on day state
 */
export function getDayStateNarrative(): string {
  const timeOfDay = getTimeOfDay()
  const hour = dayjs().hour()

  // Very early
  if (hour >= 4 && hour < 6) {
    return 'Dawn approaches'
  }

  // Morning
  if (hour >= 6 && hour < 9) {
    return 'Morning rises'
  }

  // Late morning
  if (hour >= 9 && hour < 12) {
    return 'Day progresses'
  }

  // Afternoon
  if (hour >= 12 && hour < 15) {
    return 'Afternoon unfolds'
  }

  // Late afternoon
  if (hour >= 15 && hour < 18) {
    return 'Day wanes'
  }

  // Evening
  if (hour >= 18 && hour < 21) {
    return 'Evening settles'
  }

  // Night
  if (hour >= 21 && hour < 24) {
    return 'Night deepens'
  }

  // Late night
  return 'Late hours'
}

/**
 * Stoic Wisdom - Context-aware reflections (CQGS Bioethics aligned)
 *
 * Provides guidance based on time, energy, and circumstances.
 * Rooted in CQGS principles: cleanness, routine, nutrition, laughter.
 */
export function getStoicReflection(context: {
  timeOfDay?: TimeOfDay
  energy?: 'depleted' | 'low' | 'moderate' | 'high'
  streak?: number
  actionsToday?: number
}): string {
  const time = context.timeOfDay || getTimeOfDay()

  // Low energy or depletion
  if (context.energy === 'depleted' || context.energy === 'low') {
    const reflections = [
      'Stillness is not defeat. It is how you recharge.',
      'Pause now. Strength returns through rest, not force.',
      'Care for yourself first. Everything else follows.',
    ]
    return reflections[Math.floor(Math.random() * reflections.length)]
  }

  // Morning wisdom
  if (time === 'morning' || time === 'early_morning') {
    const reflections = [
      'One deliberate act this morning changes the whole day.',
      'Today compounds into who you become. Begin.',
      'Clarity lives in the first hour. Use it.',
      'Be honest with yourself before anything else.',
    ]
    return reflections[Math.floor(Math.random() * reflections.length)]
  }

  // Evening reflections
  if (time === 'evening' || time === 'night') {
    const reflections = [
      'Review without judgment. Growth integrates at rest.',
      'A meal made by hand. A candle lit. Joy lives here.',
      'Honest work earns honest rest. Take it.',
      'What made you curious today? Follow that thread.',
    ]
    return reflections[Math.floor(Math.random() * reflections.length)]
  }

  // Streak-based wisdom
  if (context.streak && context.streak > 3) {
    return 'You showed up again. That compounds.'
  }

  // General wisdom — CQGS aligned
  const general = [
    'Patience is not passive. It is disciplined trust.',
    'Small acts, repeated, become who you are — and what the system becomes.',
    'Curiosity is the seed of real joy.',
    'You are here. That is the starting point.',
    'Excellence is built daily. Start with one clean surface.',
    'Your space mirrors your mind. This system mirrors both.',
    'Tend your thoughts like you tend your room.',
    'Order is not rigidity. It is care made visible.',
  ]
  return general[Math.floor(Math.random() * general.length)]
}

/**
 * Cleanness Prompts - CQGS Bioethics self-care reminders
 */
export function getSelfCarePrompt(context: {
  timeOfDay?: TimeOfDay
  energy?: 'depleted' | 'low' | 'moderate' | 'high'
  lastBreak?: number // minutes since last break
  screenTime?: number // hours today
}): string | null {
  const time = context.timeOfDay || getTimeOfDay()

  // Critical energy - immediate care
  if (context.energy === 'depleted') {
    return 'You are running on empty. Pause. Now.'
  }

  // Long screen time
  if (context.screenTime && context.screenTime > 3) {
    const prompts = [
      'Eyes up. Look at something far away.',
      'Stand. Stretch. Your body carried you this far.',
      'Step away from the screen. Move.',
    ]
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  // Long work session
  if (context.lastBreak && context.lastBreak > 90) {
    return '90 minutes without a break. Move your body.'
  }

  // Time-based care prompts
  if (time === 'midday') {
    return 'Eat something real. Your body needs fuel.'
  }

  if (time === 'night' || time === 'late_night') {
    return 'Rest rebuilds everything. Go to sleep.'
  }

  return null
}

/**
 * Breathing Exercise Prompts (CQGS: Biofield regulation)
 */
export function getBreathingPrompt(context: {
  stress?: 'low' | 'moderate' | 'high'
  timeOfDay?: TimeOfDay
}): string {
  if (context.stress === 'high') {
    return 'Breathe. Nothing else matters right now.'
  }

  if (context.stress === 'moderate') {
    return 'Three deep breaths. Feel the shift.'
  }

  const time = context.timeOfDay || getTimeOfDay()

  if (time === 'morning' || time === 'early_morning') {
    return 'First breath of the day. Make it count.'
  }

  if (time === 'evening' || time === 'night') {
    return 'Exhale the day. Let it go.'
  }

  return 'Pause. Breathe. Return.'
}

/**
 * Cleanness Pulse - Experimental CQGS Bioethics cleanness nudges
 *
 * Returns time-aware, gentle cleanness prompts that encourage users
 * to maintain their physical space, personal hygiene, and environmental order.
 * The cleanness pillar treats the body and its surroundings as a unified biofield.
 */
export function getCleannessPulse(context: {
  timeOfDay?: TimeOfDay
  energy?: 'depleted' | 'low' | 'moderate' | 'high'
  lastCleanness?: number // minutes since last cleanness action
  dayStreak?: number // consecutive cleanness days
}): { nudge: string; intensity: 'whisper' | 'gentle' | 'clear' | 'direct' } {
  const time = context.timeOfDay || getTimeOfDay()
  const streak = context.dayStreak || 0

  // Depleted users get compassionate whispers, never demands
  if (context.energy === 'depleted') {
    return {
      nudge: 'One small act. A glass of water. A wiped surface. That counts.',
      intensity: 'whisper'
    }
  }

  // Long gap since last cleanness action — escalate gently
  if (context.lastCleanness && context.lastCleanness > 360) {
    return {
      nudge: 'One cleared surface shifts everything. Start there.',
      intensity: 'clear'
    }
  }

  // Morning cleanness — foundational
  if (time === 'early_morning' || time === 'morning') {
    const morningNudges = [
      { nudge: 'Make your bed. First act of order. The day follows.', intensity: 'gentle' as const },
      { nudge: 'Wash your face. Water resets. Begin fresh.', intensity: 'gentle' as const },
      { nudge: 'Clear yesterday from your surfaces. Today starts clean.', intensity: 'gentle' as const },
      { nudge: 'Open a window. Fresh air first.', intensity: 'whisper' as const },
      { nudge: 'Brush, wash, dress with attention. Body first.', intensity: 'gentle' as const },
    ]
    return morningNudges[Math.floor(Math.random() * morningNudges.length)]
  }

  // Midday cleanness — maintenance
  if (time === 'midday') {
    const middayNudges = [
      { nudge: 'Wash your hands slowly. Feel the water. Reset.', intensity: 'whisper' as const },
      { nudge: 'Clear your workspace. Clear space, clear mind.', intensity: 'gentle' as const },
      { nudge: 'Clean plate. Clean surface. Midday renewal.', intensity: 'gentle' as const },
    ]
    return middayNudges[Math.floor(Math.random() * middayNudges.length)]
  }

  // Evening cleanness — restoration
  if (time === 'evening' || time === 'night') {
    const eveningNudges = [
      { nudge: 'Reset your space before rest. Tomorrow you will thank yourself.', intensity: 'gentle' as const },
      { nudge: 'Dishes done. Surfaces clear. Clothes away. Sleep well.', intensity: 'clear' as const },
      { nudge: 'Clean sheets, clean air, clean mind. Prepare for rest.', intensity: 'gentle' as const },
      { nudge: 'Warm shower. Let the day wash off.', intensity: 'whisper' as const },
    ]
    return eveningNudges[Math.floor(Math.random() * eveningNudges.length)]
  }

  // Afternoon cleanness — micro-resets
  const afternoonNudges = [
    { nudge: 'Clear one surface. Five seconds. Feel the difference.', intensity: 'whisper' as const },
    { nudge: 'Five minutes of tidying now saves thirty tonight.', intensity: 'gentle' as const },
    { nudge: 'Does this space reflect who you are becoming?', intensity: 'gentle' as const },
  ]
  return afternoonNudges[Math.floor(Math.random() * afternoonNudges.length)]
}

/**
 * Environment Scan Prompt - CQGS Cleanness assessment language
 *
 * Experimental: Guides users to observe their physical space
 * as a mirror of their internal state. Cleanness is not just tidying —
 * it's a diagnostic of the biofield's relationship with its container.
 */
export function getEnvironmentScanPrompt(context: {
  timeOfDay?: TimeOfDay
  recentMood?: string
}): string {
  const time = context.timeOfDay || getTimeOfDay()

  // Mood-aware scan prompts
  if (context.recentMood === 'overwhelmed' || context.recentMood === 'anxious') {
    return 'Look around. One surface cleared is one weight lifted.'
  }

  if (context.recentMood === 'calm' || context.recentMood === 'peaceful') {
    return 'Use this calm. Create order your future self will thank you for.'
  }

  if (context.recentMood === 'energized') {
    return 'Channel this energy into your space. What has been waiting?'
  }

  // Time-based scans
  if (time === 'morning' || time === 'early_morning') {
    return 'Scan your space. Start with what you see first.'
  }

  if (time === 'evening' || time === 'night') {
    return 'See your space through tomorrow morning\'s eyes. What needs clearing?'
  }

  return 'One act of cleanness ripples through the day — and through the system that builds around you.'
}

/**
 * Cleanness Streak Language - Progressive encouragement
 *
 * Language evolves as the user builds cleanness habits,
 * shifting from instructional to affirmational to technical.
 */
export function getCleanessStreakMessage(streakDays: number): string {
  if (streakDays === 0) {
    return 'Day one. One surface. The system starts building here.'
  }
  if (streakDays === 1) {
    return 'Day two. A pattern — the architecture takes notice.'
  }
  if (streakDays < 7) {
    return `${streakDays} days. Habit forming. System adapting.`
  }
  if (streakDays < 14) {
    return `${streakDays} days. Becoming who you are. The site reshapes around it.`
  }
  if (streakDays < 30) {
    return `${streakDays} days. Space mirrors growth. System mirrors you.`
  }
  if (streakDays < 60) {
    return `${streakDays} days. Cleanness integrated. Self-building accelerates.`
  }
  if (streakDays < 100) {
    return `${streakDays} days. Mastery emerging. The system evolves in kind.`
  }
  return `${streakDays} days. No longer practice — you and this system are self-sustaining.`
}

/**
 * Progress Affirmations - Recognition of effort (CQGS Citizen Index)
 */
export function getProgressAffirmation(achievement: {
  type: 'streak' | 'milestone' | 'consistency' | 'first_action'
  value?: number
}): string {
  switch (achievement.type) {
    case 'streak':
      if (achievement.value && achievement.value >= 30) {
        return 'A month of showing up. The system has self-built around your consistency.'
      }
      if (achievement.value && achievement.value >= 7) {
        return 'A full week. Habit rooting. Architecture evolving.'
      }
      return 'You showed up. The system noticed.'

    case 'milestone':
      return 'Milestone reached. New structures unlocked.'

    case 'consistency':
      return 'Steady effort compounds. The site evolves with you.'

    case 'first_action':
      return 'First signal received. Self-assembly begins here.'

    default:
      return 'Progress.'
  }
}

// ─── Self-Assembly Narrative ─────────────────────────────────

export type AssemblyPhase = 'dormant' | 'awakening' | 'forming' | 'assembled' | 'integrated'

/**
 * Self-Assembly Module Narrative
 *
 * Returns time-aware language for a specific module's assembly state.
 * The system describes its own construction through the user's lens.
 */
export function getModuleAssemblyNarrative(
  moduleLabel: string,
  phase: AssemblyPhase,
  density: number
): string {
  const timeOfDay = getTimeOfDay()

  switch (phase) {
    case 'dormant':
      if (timeOfDay === 'morning' || timeOfDay === 'early_morning') {
        return `${moduleLabel} awaits. One signal this morning begins it.`
      }
      return `${moduleLabel} dormant. Awaiting its first signal.`

    case 'awakening':
      return `${moduleLabel} stirring. The architecture senses a pattern forming.`

    case 'forming':
      if (density >= 50) {
        return `${moduleLabel} taking shape. Structure crystallizing from your rhythm.`
      }
      return `${moduleLabel} forming. Patterns becoming scaffold.`

    case 'assembled':
      return `${moduleLabel} self-assembled. Built from your signals alone.`

    case 'integrated':
      return `${moduleLabel} integrated. Wired deep into the system fabric.`
  }
}

/**
 * Ecosystem Assembly Narrative
 *
 * Language for the Quantum Engine ecosystem (Car + Home + Computer)
 * based on how many devices are connected.
 */
export function getEcosystemNarrative(connectedCount: number, totalDevices: number): string {
  if (connectedCount === 0) {
    return 'Ecosystem offline. Connect a device to extend the biofield.'
  }

  if (connectedCount === 1) {
    return 'Single node active. The ecosystem begins with one connection.'
  }

  if (connectedCount === 2) {
    return 'Two nodes linked. Ecosystem coherence forming.'
  }

  if (connectedCount >= totalDevices) {
    return 'Full ecosystem connected. Car, home, and computer unified. The biofield extends beyond the screen.'
  }

  return `${connectedCount}/${totalDevices} nodes active. Ecosystem assembling.`
}

/**
 * Assembly Milestone Narrative
 *
 * Special language when a module transitions to a new phase.
 */
export function getAssemblyMilestoneNarrative(
  moduleLabel: string,
  newPhase: AssemblyPhase
): string | null {
  switch (newPhase) {
    case 'awakening':
      return `${moduleLabel} detected its first signal. Assembly initiated.`
    case 'forming':
      return `${moduleLabel} recognizes a pattern. Structure forming from use.`
    case 'assembled':
      return `${moduleLabel} self-assembled. Built entirely from your activity.`
    case 'integrated':
      return `${moduleLabel} fully integrated. It is now part of the system's core.`
    default:
      return null
  }
}

/**
 * Overall Assembly Progress Narrative
 *
 * Describes the system's total self-assembly state.
 * Used by SystemProgressWidget and System.tsx.
 */
export function getAssemblyProgressNarrative(
  assembledCount: number,
  totalModules: number,
  overallAssembly: number
): string {
  const timeOfDay = getTimeOfDay()
  const ratio = assembledCount / totalModules

  if (overallAssembly === 0) {
    if (timeOfDay === 'morning' || timeOfDay === 'early_morning') {
      return 'The system awaits. Your first signal this morning begins the self-assembly.'
    }
    return 'No signals yet. The system awaits its first interaction to begin self-assembly.'
  }

  if (ratio >= 1) {
    return 'Every module self-assembled. The system is fully self-built. Co-evolution achieved.'
  }

  if (ratio >= 0.7) {
    return `${assembledCount}/${totalModules} modules assembled. The system nears completion. It builds fastest in these final stages.`
  }

  if (ratio >= 0.4) {
    return `${assembledCount}/${totalModules} modules assembled. Foundation solidifying. Each interaction compounds.`
  }

  if (overallAssembly >= 20) {
    return `Assembly at ${overallAssembly}%. Patterns emerging. The architecture shapes around your use.`
  }

  return `Assembly at ${overallAssembly}%. Early signals. The system learns what to become.`
}
