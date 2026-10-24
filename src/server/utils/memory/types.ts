/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Shared TypeScript types for the Memory Engine system
 */

export interface TraitExtractionResult {
  traits: string[]
  patterns: { [key: string]: number }
  psychologicalDepth: PsychologicalDepth
}

export interface PsychologicalDepth {
  emotionalPatterns: string[]
  values: string[]
  selfAwareness: number
  emotionalRange: number
  reflectionQuality: number
  growthTrajectory: 'emerging' | 'developing' | 'deepening' | 'integrated'
  dominantNeeds: string[]
  journalSentiment: {
    positive: number
    neutral: number
    challenging: number
  }
}

export interface CorrelatedIndexSnapshot {
  selfAwareness: number
  userScore: number
  personScore: number
  longevityScore: number
  composite: number
}

export interface CohortClassification {
  archetype: string
  behavioralCohort: string
  description: string
}

export interface PacingResult {
  shouldShowPrompt: boolean
  isWeekend: boolean
  promptQuotaToday: number
  promptsShownToday: number
  dayNumber: number
}

export interface QuantumState {
  energy?: string
  clarity?: string
  alignment?: string
  needsSupport?: string
}

export interface EatingDisorderProfile {
  restriction: number          // 0-100: food restriction, skipping meals, calorie fear
  bingeing: number             // 0-100: binge eating, loss of control around food
  purging: number              // 0-100: compensatory behavior, excessive exercise
  bodyDissatisfaction: number  // 0-100: negative body image, mirror avoidance, weight fixation
  foodAnxiety: number          // 0-100: meal-time stress, fear of certain foods
  recoverySignals: number      // 0-100: healthy relationship with food, nourishment language
}

export interface TraumaIndicatorProfile {
  score: number // 0-100 composite severity indicator
  clusters: {
    hyperarousal: number       // Sleep disruption, hypervigilance, startle, irritability
    avoidance: number          // Avoidance of thoughts, feelings, reminders, social withdrawal
    negativeAlterations: number // Negative self-concept, emotional numbing, detachment, loss of interest
    reExperiencing: number     // Intrusive thoughts, nightmares, flashbacks, distress at reminders
  }
  cptsdIndicators: {
    affectDysregulation: number    // Difficulty controlling emotions, explosive or suppressed affect
    negativeSelfConcept: number    // Persistent shame, guilt, worthlessness, feeling damaged
    interpersonalDifficulty: number // Difficulty maintaining relationships, trust issues, isolation
  }
  eatingDisorder: EatingDisorderProfile
  possibleSources: string[]    // Detected possible trauma origins (non-diagnostic)
  trajectory: 'stable' | 'improving' | 'declining' | 'emerging' | 'unknown'
  recoveryIndicators: string[] // Positive coping signals detected
  riskLevel: 'none' | 'low' | 'moderate' | 'elevated'
}
