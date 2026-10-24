/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Memory Engine - Main Entry Point
 *
 * This module provides a unified interface to the Memory Engine system,
 * which generates context-aware self-care questions and analyzes psychological depth.
 */

// Question generation
export {
  completeAndExtractQuestion,
  buildPrompt,
  getMemoryEngine
} from './question-generator.js'

// Story generation
export {
  generateMemoryStory,
  generateUserSummary
} from './story-generator.js'

// Trait extraction
export {
  extractUserTraits,
  calculateCorrelatedIndexes,
  detectTraumaIndicators
} from './trait-extraction.js'

// Cohort determination
export {
  determineUserCohort,
  assessMedicalProfile,
  qualifiesForPaidCohort,
} from './cohort-determination.js'

// Recipe suggestions
export {
  generateRecipeSuggestion
} from './recipe-suggestions.js'

// Pacing
export {
  calculateIntelligentPacing
} from './pacing.js'

// Constants
export {
  BACKUP_SELFCARE_QUESTIONS,
  BACKUP_MEDICAL_QUESTIONS,
  BACKUP_TRAUMA_INFORMED_QUESTIONS,
  BACKUP_EATING_RECOVERY_QUESTIONS,
  AI_ENGINE_PREFERENCE,
  questionSchema,
  userSummarySchema,
  oaiClient,
  anthropic
} from './constants.js'

// Types
export type {
  TraitExtractionResult,
  PsychologicalDepth,
  CorrelatedIndexSnapshot,
  CohortClassification,
  PacingResult,
  QuantumState,
  TraumaIndicatorProfile,
  EatingDisorderProfile
} from './types.js'
