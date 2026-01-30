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
  extractUserTraits
} from './trait-extraction.js'

// Cohort determination
export {
  determineUserCohort
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
  CohortClassification,
  PacingResult,
  QuantumState
} from './types.js'
