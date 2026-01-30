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
