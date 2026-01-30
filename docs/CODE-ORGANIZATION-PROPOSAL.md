# Code Organization Proposal: Memory & Quantum Intent Engines

**Status**: Proposal
**Created**: 2026-01-26
**Purpose**: Improve maintainability and code clarity through modularization

---

## Current State

### Memory Engine (`src/server/utils/memory.ts`)
- **Size**: 1,796 lines
- **Functions**: 12 exported functions
- **Concerns**: Multiple distinct responsibilities in single file

### Quantum Intent Engine (`src/client/stores/intentionEngine.ts`)
- **Size**: 403 lines
- **Organization**: Well-structured, single responsibility
- **Status**: ✅ No changes needed

---

## Problem Statement

The Memory Engine (`memory.ts`) has grown to handle multiple distinct concerns:

1. **Question Generation**: AI engine coordination, prompt building, fallback logic
2. **Story Generation**: Memory Story and user summary creation
3. **Trait Extraction**: Behavioral and psychological trait analysis
4. **Cohort Determination**: Archetype and behavioral cohort classification
5. **Recipe Suggestions**: Contextual meal recommendations
6. **Pacing Logic**: Intelligent timing and quota management

**Challenges**:
- Hard to navigate 1,796 lines when debugging
- Changes in one area risk breaking others
- Difficult to test individual concerns in isolation
- New developers face steep learning curve

---

## Proposed Refactoring

### Module Structure

```
src/server/utils/
├── memory/
│   ├── index.ts                        # Main interface (re-exports)
│   ├── question-generator.ts           # Question generation + AI engine coordination
│   ├── story-generator.ts              # Memory Story + user summary
│   ├── trait-extraction.ts             # Trait analysis logic
│   ├── cohort-determination.ts         # Archetype + behavioral cohort
│   ├── recipe-suggestions.ts           # Recipe generation
│   ├── pacing.ts                       # Intelligent pacing logic
│   ├── constants.ts                    # Backup questions, schemas, config
│   └── types.ts                        # Shared types for memory system
│
├── memory.ts                           # LEGACY: Re-export from memory/index.ts
└── intentionEngine.ts                  # No changes (client-side)
```

### Migration Strategy

**Phase 1: Create Module Structure** (No Breaking Changes)
1. Create `src/server/utils/memory/` directory
2. Split `memory.ts` into modules
3. Create `memory/index.ts` that re-exports everything
4. Update `memory.ts` to re-export from `memory/index.ts`
5. All existing imports continue to work

**Phase 2: Update Imports** (Gradual)
1. Update imports one file at a time
2. Change from `import { X } from '#server/utils/memory.js'`
3. To `import { X } from '#server/utils/memory/index.js'`
4. No functional changes, just cleaner imports

**Phase 3: Remove Legacy** (Breaking Change - Optional)
1. Delete `memory.ts` wrapper file
2. Update all imports to use specific modules
3. Only do this if team agrees on breaking change

---

## Detailed Module Breakdown

### 1. `memory/question-generator.ts`

**Responsibility**: Generate AI-powered Memory questions

**Exports**:
```typescript
export async function completeAndExtractQuestion(...)
export async function buildPrompt(...)
export function getMemoryEngine(user: User): 'ai' | 'standard'
function extractQuestionTopics(...) // internal
function formatLog(...) // internal
function getBackupQuestion(...) // internal
```

**Dependencies**:
- AI engine manager
- Goal understanding
- Logs utility
- Constants (backup questions)

**Size**: ~650 lines

---

### 2. `memory/story-generator.ts`

**Responsibility**: Generate Memory Stories and user summaries

**Exports**:
```typescript
export async function generateMemoryStory(user: User, logs: Log[]): Promise<string>
export async function generateUserSummary(user: User, logs: Log[]): Promise<string>
```

**Dependencies**:
- AI engine manager
- Logs utility

**Size**: ~180 lines

---

### 3. `memory/trait-extraction.ts`

**Responsibility**: Extract behavioral and psychological traits from logs

**Exports**:
```typescript
export function extractUserTraits(logs: Log[]): {
  behavioral: Record<string, boolean>
  psychological: Record<string, boolean>
  values: Record<string, boolean>
  psychologicalDepth: {
    selfAwarenessScore: number
    emotionalRange: number
    reflectionQuality: number
    growthTrajectory: string
    dominantNeeds: string[]
    journalSentiment: {
      positive: number
      neutral: number
      challenging: number
    }
  }
}
```

**Dependencies**:
- Logs utility
- Dayjs

**Size**: ~330 lines

---

### 4. `memory/cohort-determination.ts`

**Responsibility**: Classify users into archetypes and behavioral cohorts

**Exports**:
```typescript
export function determineUserCohort(
  traits: ReturnType<typeof extractUserTraits>,
  logs: Log[]
): {
  archetype: string
  archetypeDescription: string
  behavioralCohort: string
  behavioralDescription: string
}
```

**Dependencies**:
- trait-extraction (for type)

**Size**: ~100 lines

---

### 5. `memory/recipe-suggestions.ts`

**Responsibility**: Generate contextual recipe suggestions

**Exports**:
```typescript
export async function generateRecipeSuggestion(
  user: User,
  cohort: string,
  traits: any,
  weatherTemp: number | null,
  weatherHumidity: number | null
): Promise<string>
```

**Dependencies**:
- AI engine manager

**Size**: ~200 lines

---

### 6. `memory/pacing.ts`

**Responsibility**: Intelligent timing and quota management

**Exports**:
```typescript
export async function calculateIntelligentPacing(
  user: User,
  logs: Log[]
): Promise<{
  shouldShow: boolean
  reason: string
  quotaUsed: number
  quotaMax: number
  dayNumber: number
}>
```

**Dependencies**:
- Logs utility
- Dayjs

**Size**: ~100 lines

---

### 7. `memory/constants.ts`

**Responsibility**: Shared constants, schemas, configuration

**Exports**:
```typescript
export const BACKUP_SELFCARE_QUESTIONS: Array<{ question: string; options: string[] }>
export const AI_ENGINE_PREFERENCE: EnginePreference
export const questionSchema: z.ZodObject<...>
export const userSummarySchema: z.ZodObject<...>
```

**Size**: ~80 lines

---

### 8. `memory/types.ts`

**Responsibility**: Shared TypeScript types

**Exports**:
```typescript
export interface TraitExtractionResult { ... }
export interface CohortClassification { ... }
export interface PacingResult { ... }
export interface QuestionGenerationContext { ... }
```

**Size**: ~40 lines

---

### 9. `memory/index.ts`

**Responsibility**: Main interface, re-exports everything

```typescript
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
  userSummarySchema
} from './constants.js'

// Types
export type * from './types.js'
```

**Size**: ~50 lines

---

## Benefits

### 1. Improved Maintainability
- Each module has single responsibility
- Changes isolated to relevant files
- Easier to locate specific functionality

### 2. Better Testing
- Can test modules in isolation
- Mock dependencies cleanly
- Faster test execution

### 3. Clearer Documentation
- Each module can have focused documentation
- Easier to understand individual concerns
- Better for onboarding new developers

### 4. Performance
- Potential for lazy loading
- Tree-shaking optimization
- Reduced memory footprint

### 5. Collaboration
- Multiple developers can work on different modules
- Reduced merge conflicts
- Clearer code ownership

---

## Implementation Checklist

### Phase 1: Create Module Structure
- [ ] Create `src/server/utils/memory/` directory
- [ ] Create `memory/constants.ts` (shared constants)
- [ ] Create `memory/types.ts` (shared types)
- [ ] Create `memory/question-generator.ts` (extract question generation logic)
- [ ] Create `memory/story-generator.ts` (extract story generation logic)
- [ ] Create `memory/trait-extraction.ts` (extract trait extraction logic)
- [ ] Create `memory/cohort-determination.ts` (extract cohort logic)
- [ ] Create `memory/recipe-suggestions.ts` (extract recipe logic)
- [ ] Create `memory/pacing.ts` (extract pacing logic)
- [ ] Create `memory/index.ts` (re-export everything)
- [ ] Update `memory.ts` to re-export from `memory/index.ts`
- [ ] Run tests to verify no breaking changes
- [ ] Commit: "Refactor: Modularize Memory Engine (backward compatible)"

### Phase 2: Update Imports (Gradual)
- [ ] Update imports in `src/server/routes/admin-api.ts`
- [ ] Update imports in `src/server/utils/monthly-summary.ts`
- [ ] Update imports in other server files
- [ ] Run tests after each file
- [ ] Commit incrementally

### Phase 3: Remove Legacy (Optional)
- [ ] Delete `memory.ts` wrapper file
- [ ] Update path aliases if needed
- [ ] Update documentation
- [ ] Commit: "Remove legacy memory.ts wrapper"

---

## Testing Strategy

### Unit Tests (per module)
```typescript
// memory/question-generator.test.ts
describe('Memory Question Generator', () => {
  test('generates AI questions with proper fallback', ...)
  test('builds context-aware prompts', ...)
  test('returns backup questions when all engines fail', ...)
})

// memory/trait-extraction.test.ts
describe('Memory Trait Extraction', () => {
  test('extracts behavioral traits correctly', ...)
  test('calculates self-awareness score', ...)
  test('determines growth trajectory', ...)
})
```

### Integration Tests
```typescript
// memory/index.test.ts
describe('Memory Engine Integration', () => {
  test('full flow: question generation → answer → trait extraction → cohort', ...)
  test('quantum state integration with question generation', ...)
})
```

---

## Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation**: Phase 1 maintains backward compatibility via re-exports

### Risk 2: Circular Dependencies
**Mitigation**: Clear dependency hierarchy, types in separate file

### Risk 3: Import Path Changes
**Mitigation**: Path aliases remain the same, gradual migration

### Risk 4: Performance Impact
**Mitigation**: ES modules optimize automatically, no perf degradation expected

### Risk 5: Testing Burden
**Mitigation**: Automated tests run on every commit, CI/CD catches issues

---

## Alternative: Keep As-Is

**Pros**:
- No migration effort
- No risk of breaking changes
- Familiar structure for current team

**Cons**:
- Continues to grow larger
- Harder to maintain over time
- Steep learning curve for new developers
- Testing remains difficult

---

## Recommendation

**Proceed with Phase 1 immediately**:
- Low risk (backward compatible)
- High value (improved maintainability)
- Can be done incrementally
- Reversible if issues arise

**Defer Phase 2-3**:
- Not urgent
- Can be done gradually over time
- Only if team sees value

---

## Questions for Team

1. Do we want to pursue this refactoring?
2. Should we do all phases or just Phase 1?
3. Who will own the migration?
4. What's the timeline?
5. Should we create a tracking issue?

---

*Document Version: 1.0*
*Last Updated: 2026-01-26*
