# Memory Engine & Quantum Intent Engine™

**Technical Know-How Documentation**
*LOT Systems Core Intelligence Architecture*

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Memory Engine](#memory-engine)
3. [Quantum Intent Engine](#quantum-intent-engine)
4. [System Integration](#system-integration)
5. [AI Engine Abstraction](#ai-engine-abstraction)
6. [Competitive Advantages](#competitive-advantages)
7. [Development Guidelines](#development-guidelines)

---

## System Overview

LOT Systems uses two interconnected AI-powered engines that work together to provide predictive, adaptive, deeply personalized support:

- **Memory Engine**: Server-side AI system that generates context-aware self-care questions and analyzes psychological depth
- **Quantum Intent Engine™**: Client-side pattern recognition system that detects user needs in real-time

Together, these systems anticipate what users need before they articulate it, creating a proactive support experience that goes beyond simple tracking to understanding soul-level identity.

---

## Memory Engine

### Purpose

The Memory Engine generates **AI-powered, context-aware self-care questions** that build psychological depth over time. It's the centerpiece of LOT's approach to understanding users at a soul level.

### Location

- **Primary File**: `src/server/utils/memory.ts` (1,796 lines)
- **Frontend Widget**: `src/client/components/MemoryWidget.tsx`
- **Stats Tracking**: `src/client/components/stats/MemoryEngineStats.tsx`
- **AI Engine Abstraction**: `src/server/utils/ai-engines.ts`

### Core Functions

#### 1. Context-Aware Question Generation

**Function**: `buildPrompt()` (lines 262-789)

Builds rich contextual prompts that consider:

- **Environmental Context**:
  - Weather (temperature, humidity, conditions)
  - Location (city, country, timezone)
  - Time of day (morning, midday, evening, night)
  - Day of week (weekends get lighter questions)

- **User Context**:
  - 40 recent logs (answers + journals)
  - User goals and journey stage
  - Psychological archetype and behavioral cohort
  - Self-awareness level and growth trajectory

- **Quantum State** (from Quantum Intent Engine):
  - Energy level (depleted → high)
  - Clarity level (confused → focused)
  - Alignment level (disconnected → flowing)
  - Support needs (none → critical)

**Quantum-Aware Question Guidance**:
```
- If depleted/low energy → gentle, restorative questions
- If high energy → expansive questions about goals/creativity
- If confused/uncertain → grounding questions
- If focused → deeper questions
- If disconnected → questions about values/intentions
- If critical/moderate support → compassionate questions
```

#### 2. Smart Question Generation

**Function**: `completeAndExtractQuestion()` (lines 132-214)

Multi-level fallback system ensures 100% question availability:

1. **Primary**: Together.AI (7-model fallback chain)
   - Llama 3.3 70B, Llama 4 Scout, Mixtral 8x7B, Qwen2 72B, etc.
2. **Secondary**: Google Gemini (gemini-1.5-pro)
3. **Tertiary**: Mistral AI (mistral-large-latest)
4. **Quaternary**: Anthropic Claude (claude-3-5-sonnet)
5. **Quinary**: OpenAI (gpt-4-turbo-preview)
6. **Emergency**: 30 hardcoded self-care questions (rotated by day)

**Output Format**:
```json
{
  "question": "Main question text",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ]
}
```

#### 3. User Trait Extraction

**Function**: `extractUserTraits()` (lines 1056-1383)

Analyzes user logs to extract traits across three levels:

**Level 1 - Behavioral Traits** (surface patterns):
- `healthConscious`, `comfortSeeker`, `timeConscious`
- `plantBased`, `proteinFocused`, `warmPreference`
- `coldPreference`, `traditional`, `adventurous`, `mindful`

**Level 2 - Psychological Patterns** (emotional/cognitive):
- `reflective`, `emotionallyAware`, `growthOriented`
- `connectionSeeking`, `autonomyDriven`, `anxietyPresent`
- `peaceSeeking`, `achievement`, `creative`, `grounded`

**Level 3 - Core Values** (soul-level):
- `authenticity`, `harmony`, `freedom`, `security`
- `growth`, `connection`, `meaning`, `beauty`
- `simplicity`, `vitality`

**Psychological Depth Metrics**:

| Metric | Range | Calculation |
|--------|-------|-------------|
| **Self-Awareness Score** | 0-100 | Based on volume, reflective quality, consistency, depth |
| **Emotional Range** | 0-10 | Diversity of emotions expressed |
| **Reflection Quality** | 0-10 | Depth of introspection |
| **Growth Trajectory** | emerging → developing → deepening → integrated | Based on self-awareness + consistency |
| **Dominant Needs** | Array | Security, connection, growth, autonomy, meaning, expression |
| **Journal Sentiment** | Percentages | positive/neutral/challenging distribution |

#### 4. User Cohort Determination

**Function**: `determineUserCohort()` (lines 1389-1484)

Classifies users into two complementary systems:

**Psychological Archetypes** (soul-level identity):
- **The Seeker**: Growth-oriented, reflective, constantly evolving
- **The Nurturer**: Relationship-centered, emotionally attuned
- **The Achiever**: Purpose-driven, goal-oriented, structured
- **The Philosopher**: Meaning-seeking, contemplative, introspective
- **The Harmonizer**: Balance-seeking, peace-creating, centered
- **The Creator**: Expression-focused, innovative, freedom-loving
- **The Protector**: Safety-oriented, reliable, grounded
- **The Authentic**: Truth-seeking, genuine, non-conformist
- **The Explorer**: Adventure-seeking, curious, expansive
- **The Wanderer**: Soul in transition, discovering path

**Behavioral Cohorts** (lifestyle patterns):
- Wellness Enthusiast, Plant-Based, Busy Professional
- Comfort Seeker, Culinary Explorer, Protein-Focused
- Health-Conscious, Classic Comfort, Balanced Lifestyle

#### 5. Memory Story Generation

**Function**: `generateMemoryStory()` (lines 869-982)

Generates flowing narrative of user's self-care journey:

**Process**:
1. Extracts last 30 memory answers from logs
2. Formats with timestamps and context
3. Sends to AI with LOT's structured prompt
4. AI generates narrative in third person
5. Validates formatting with strict rules
6. Returns flowing narrative about user's story

**Output Format**:
```
Introduction (1-2 sentences setting the scene)
[blank line]
Key insights into their daily routines and preferences include:
[blank line]
– Insight 1 (complete sentence)
[blank line]
– Insight 2 (complete sentence)
[blank line]
– Insight 3 (complete sentence)
...
```

**Strict Formatting Rules**:
- Third person narrative
- En-dashes (–) for bullet points, not hyphens (-)
- Blank lines between each insight
- Complete sentences only
- Natural, flowing prose

#### 6. Intelligent Pacing System

**Function**: `calculateIntelligentPacing()` (lines 1696-1795)

Determines when and how often to show Memory questions:

**Daily Quotas**:
- **Day 1**: 10 prompts (strong start)
- **Day 2-3**: 8-9 prompts (continued engagement)
- **Day 4+**: 10-15 prompts (generous pacing)
- **Weekends**: 12-15 prompts (more time to reflect)

**Pacing Logic**:
- Tracks prompts shown vs. answered
- Respects daily quotas
- Adapts to time of day
- Considers user journey stage
- Weekend/weekday differentiation

#### 7. Recipe Suggestion Engine

**Function**: `generateRecipeSuggestion()` (lines 1489-1687)

Generates contextual meal suggestions:

**Inputs**:
- Weather conditions (temperature, humidity)
- User cohort and traits
- Seasonal context
- Time of day

**Outputs**:
- Personalized recipe suggestion
- Temperature-based fallbacks if AI fails

### Data Flow Architecture

```
User Logs (120 entries)
    ↓
Context Analysis (weather, time, location, quantum state)
    ↓
Trait Extraction (behavioral + psychological + values)
    ↓
Cohort Determination (archetype + behavioral)
    ↓
Prompt Building (goal context + quantum guidance + duplicate prevention)
    ↓
AI Engine Selection (Together.AI → Gemini → Mistral → Claude → OpenAI)
    ↓
Question Generation (personalized with 3-4 options)
    ↓
User Answer
    ↓
Memory Story/Profile Update
    ↓
Badge Unlocking (7, 30, 100 day streaks)
```

### Memory Engine Outputs

1. **Personalized Memory Questions**: AI-generated, context-aware prompts
2. **Memory Stories**: Flowing narrative of user's self-care journey
3. **Psychological Profiles**: Archetype + behavioral cohort classifications
4. **Psychological Depth Data**: Self-awareness scores, trait patterns, emotional signatures
5. **User Summaries**: Admin-facing insights about user engagement
6. **Recipe Suggestions**: Weather & cohort-aware meal ideas

---

## Quantum Intent Engine™

### Purpose

The **Quantum Intent Engine™** is a predictive pattern recognition system that analyzes user interactions across all widgets to understand what users need before they articulate it.

### Location

- **Primary File**: `src/client/stores/intentionEngine.ts` (403 lines)
- **Frontend Integration**: Records signals from all widgets
- **Data Persistence**: localStorage with 7-day retention

### Core Functions

#### 1. Signal Collection System

**Signal Sources** (6 types):

| Source | Description | Examples |
|--------|-------------|----------|
| `mood` | Emotional check-ins | calm, peaceful, energized, hopeful, anxious, overwhelmed, tired, neutral |
| `memory` | Answer responses | questionId, option, question text |
| `planner` | Planning interactions | daily/weekly planning |
| `intentions` | Intention setting | setting/updating intentions |
| `selfcare` | Self-care practices | practice completions |
| `journal` | Free-form reflections | journal entries |

**Signal Structure**:
```typescript
{
  timestamp: number,
  source: 'mood' | 'memory' | 'planner' | 'intentions' | 'selfcare' | 'journal',
  signal: string,
  metadata: Record<string, any>
}
```

**Signal Management**:
- **Retention**: Last 7 days
- **Max Signals**: 1,000 (prevents memory leaks)
- **Analysis Cooldown**: 5 minutes between analyses
- **Persistence**: localStorage with error handling

#### 2. Pattern Recognition System

**Function**: `analyzeIntentions()` (lines 154-291)

Detects 7 distinct patterns with confidence scoring:

**Pattern 1: Anxiety Pattern**
- **Trigger**: 2+ anxious/overwhelmed moods in 24 hours
- **Confidence**: 0.66-1.0
- **Recommendation**: Show self-care widget immediately
- **Reasoning**: User needs grounding practice

**Pattern 2: Lack of Structure**
- **Trigger**: Tired mood + no planner interaction
- **Confidence**: 0.7
- **Recommendation**: Show planner widget
- **Reasoning**: Low energy without planning; structure might help

**Pattern 3: Seeking Direction**
- **Trigger**: No intention set for weeks + no intention signals
- **Confidence**: 0.8
- **Recommendation**: Show intentions widget
- **Reasoning**: User may need purpose or direction

**Pattern 4: Flow Potential**
- **Trigger**: Energized/hopeful mood + active planning
- **Confidence**: 0.9
- **Recommendation**: Show memory widget passively
- **Reasoning**: High energy + planning = ideal for meaningful questions

**Pattern 5: Evening Overwhelm**
- **Trigger**: Evening (6pm-11pm) + overwhelmed mood in last 3 hours
- **Confidence**: 0.85
- **Recommendation**: Immediate self-care intervention
- **Reasoning**: Release practice needed before bed

**Pattern 6: Surface Awareness**
- **Trigger**: 3+ mood signals + zero journal entries
- **Confidence**: 0.6
- **Recommendation**: Show journal widget
- **Reasoning**: Ready for deeper reflection

**Pattern 7: Morning Clarity**
- **Trigger**: Morning (6am-10am) + calm/peaceful mood in last 2 hours + no current intention
- **Confidence**: 0.75
- **Recommendation**: Immediate intention-setting
- **Reasoning**: Perfect moment for setting intention

#### 3. User State Calculation

**Function**: `calculateUserState()` (lines 296-356)

Calculates four dimensions of user state:

**1. Energy Level**

| State | Definition | Signals |
|-------|------------|---------|
| **Depleted** | Multiple low-energy signals | exhausted, overwhelmed, anxious |
| **Low** | Scattered low-energy signals | tired, anxious |
| **Moderate** | Neutral baseline | calm, neutral |
| **High** | Energized signals | energized, hopeful, excited |
| **Unknown** | No mood data yet | N/A |

**Energy Scoring Map**:
```typescript
{
  'energized': +2,
  'hopeful': +1,
  'excited': +2,
  'calm': 0,
  'tired': -2,
  'exhausted': -3,
  'overwhelmed': -1,
  'anxious': -1
}
```

**2. Clarity Level**

| State | Definition |
|-------|------------|
| **Focused** | 2+ planner interactions + active intention |
| **Clear** | 1+ planner interaction OR active intention |
| **Searching** | Intention signals but no planning |
| **Confused** | No planning + no intention + unclear state |
| **Uncertain** | Mixed signals |

**3. Alignment Level**

| State | Definition |
|-------|------------|
| **Flowing** | 3+ positive signals + 1+ planner activity |
| **Aligned** | 2+ positive signals OR (intention + planning) |
| **Searching** | Self-care signals OR intention signals |
| **Disconnected** | No engagement or negative patterns |

*Positive signals: calm, peaceful, energized, hopeful, grateful, content*

**4. Support Needs**

| Level | Definition |
|-------|------------|
| **Critical** | 3+ anxiety signals in 24 hours |
| **Moderate** | 2+ anxiety signals OR depleted energy |
| **Low** | 1 anxiety signal |
| **None** | No anxiety signals |

*Anxiety signals: anxious, overwhelmed, exhausted*

#### 4. Optimal Widget Selection

**Function**: `getOptimalWidget()` (lines 361-387)

**Algorithm**:
1. Analyzes all detected patterns
2. Scores each pattern: `confidence × timingWeight`
3. Timing weights:
   - `immediate`: 3x multiplier
   - `soon`: 2x multiplier
   - `next-session`: 1x multiplier
   - `passive`: 0.5x multiplier
4. Returns highest-scoring widget if score > 0.5
5. Otherwise returns null (no urgent recommendation)

### Integration with Memory Engine

The Quantum Intent Engine feeds directly into Memory Question generation:

```typescript
// In buildPrompt() - lines 266-325 of memory.ts
let quantumContext = ''
if (quantumState && quantumState.energy !== 'unknown') {
  quantumContext = `
  **Quantum State (Real-time user energy from pattern recognition):**
  Their current state: ${quantumState.energy} energy,
                      ${quantumState.clarity} clarity,
                      ${quantumState.alignment} alignment
  Support level: ${quantumState.needsSupport}

  **Quantum-Aware Question Guidance:**
  - If depleted/low energy: Ask gentle, restorative questions
  - If high energy: Ask expansive questions about goals/creativity
  - If confused/uncertain: Ask grounding questions
  - If focused: Ask deeper questions
  - If disconnected: Ask about values/intentions
  - If critical/moderate support: Prioritize compassionate questions
  `
}
```

---

## System Integration

### Complete Workflow

```
USER INTERACTION
    ↓
Quantum Intent Engine Records Signal
    ↓
Pattern Analysis (every 5 signals)
    ↓
User State Calculation
    ↓
Widget Recommendation
    ↓
Memory Engine Queries Quantum State
    ↓
Context-Aware Question Generation
    ↓
User Answers Question
    ↓
Trait Extraction + Cohort Update
    ↓
Badge Unlocking
    ↓
Memory Story Regeneration
    ↓
Cycle Repeats
```

### Key Integration Points

1. **Quantum State in Question Generation**: Memory questions adapt to real-time user energy/clarity/alignment
2. **Goal Understanding**: Memory Engine extracts user goals and tailors questions to journey stage
3. **Trait-Based Personalization**: Cohort + archetype inform question tone and topic selection
4. **Timing Logic**: Pacing system respects quota, time of day, day number
5. **Fallback Systems**: Both engines have multi-level fallbacks for reliability

### Performance Characteristics

| Metric | Value |
|--------|-------|
| Memory Question Generation Latency | 2-5 seconds |
| Quantum State Update Frequency | Real-time (5-min analysis cooldown) |
| Signal Retention | 7 days |
| Max Signals in Memory | 1,000 |
| Daily Question Quota | 10-15 questions |
| AI Engine Fallback Chain | 5 providers + 30 backup questions |
| Cache TTL | 12 hours |

---

## AI Engine Abstraction

### Location

`src/server/utils/ai-engines.ts`

### Supported Engines

**1. Together.AI** (Primary)
- Models: Llama 3.3 70B, Llama 4 Scout, Mixtral 8x7B, Qwen2 72B
- Image generation: FLUX.1-schnell-Free
- Cost-effective, high-quality

**2. Google Gemini**
- Model: gemini-1.5-pro
- Strong reasoning capabilities

**3. Mistral AI**
- Model: mistral-large-latest
- European-based, privacy-focused

**4. Anthropic Claude**
- Model: claude-3-5-sonnet-20241022
- High-quality responses, nuanced understanding

**5. OpenAI**
- Model: gpt-4-turbo-preview
- Industry standard, reliable

### Engine Manager Features

- Automatic fallback based on availability
- Cost-effective ordering (Together.AI first)
- Error logging and retry logic
- Engine status reporting
- Image generation support (Together.AI only)
- Unified interface for all providers

---

## Competitive Advantages

### 1. Unified Intelligence

Both engines work together to create proactive, context-aware support:
- Memory Engine provides deep psychological insights
- Quantum Intent Engine detects real-time needs
- Integration creates anticipatory experience

### 2. Zero-Configuration Learning

Systems learn passively from natural usage:
- No onboarding questionnaires
- No explicit configuration
- Automatic trait extraction
- Pattern detection in background

### 3. Psychological Depth

Beyond tracking to understanding soul-level identity:
- 10 psychological archetypes
- 9 behavioral cohorts
- 30+ trait dimensions
- Growth trajectory tracking
- Emotional evolution analysis

### 4. Real-Time Adaptation

Quantum state feeds immediately into question generation:
- Energy-aware question tone
- Clarity-based question depth
- Alignment-aware topic selection
- Support-level compassion adjustment

### 5. Multi-Level Personalization

Combines multiple personalization dimensions:
- Archetype × Behavioral cohort
- Goal stage × Journey day
- Quantum state × Environmental context
- Time of day × Day of week

### 6. Production-Ready Resilience

Multi-level fallbacks ensure 100% uptime:
- 5 AI provider fallbacks
- 7-model Together.AI chain
- 30 hardcoded emergency questions
- localStorage error handling
- Race condition management
- Graceful degradation

---

## Development Guidelines

### Memory Engine Development

**When to Modify**:
- Adding new psychological traits
- Expanding cohort classifications
- Adjusting question generation logic
- Tuning pacing algorithms
- Adding new context sources

**Key Principles**:
1. **Context-Based Generation**: Questions must adapt to environment and user state
2. **Context-Based Follow-Up**: Prevent duplicates with 30-question history
3. **Usership Tag Only**: AI generation exclusive to paid subscribers
4. **Special Attention to Logs**: Deep analysis of answers + journal entries
5. **Quantum Intent Integration**: Always respect real-time energy/clarity/alignment

**Testing Checklist**:
- [ ] Test all AI provider fallbacks
- [ ] Verify question diversity over 30+ generations
- [ ] Check quantum state integration
- [ ] Validate trait extraction accuracy
- [ ] Test cohort classification logic
- [ ] Verify pacing quotas and timing
- [ ] Test Memory Story formatting

### Quantum Intent Engine Development

**When to Modify**:
- Adding new pattern types
- Adjusting confidence thresholds
- Adding new signal sources
- Tuning timing weights
- Modifying state calculations

**Key Principles**:
1. **Client-Side Only**: All computation happens in browser
2. **Privacy-First**: Data never leaves user's device
3. **Lightweight**: Minimize performance impact
4. **Reliable**: Handle localStorage errors gracefully
5. **Real-Time**: Update state as signals arrive

**Testing Checklist**:
- [ ] Test pattern detection accuracy
- [ ] Verify confidence scoring
- [ ] Check timing weights
- [ ] Test state calculations
- [ ] Verify localStorage persistence
- [ ] Test signal retention (7 days)
- [ ] Test max signals limit (1,000)
- [ ] Verify analysis cooldown (5 min)

### Integration Testing

**Critical Integration Points**:
1. Quantum state → Memory question tone
2. Signal recording → Pattern detection
3. Pattern detection → Widget recommendations
4. Memory answers → Trait extraction
5. Trait extraction → Cohort classification
6. Cohort classification → Question personalization

**Integration Test Scenarios**:
- [ ] High energy state generates expansive questions
- [ ] Depleted energy state generates gentle questions
- [ ] Anxiety pattern triggers self-care widget
- [ ] Morning clarity triggers intention-setting
- [ ] Trait extraction updates cohort correctly
- [ ] Cohort changes affect question topics

---

## File Structure

```
src/
├── server/
│   └── utils/
│       ├── memory.ts                    # Memory Engine (1,796 lines)
│       ├── ai-engines.ts                # AI Engine Abstraction
│       ├── monthly-summary.ts           # Monthly review generator
│       ├── rpg-narrative.ts            # Level/achievement system
│       ├── patterns.ts                 # Pattern analysis
│       └── energy.ts                   # Energy state analysis
│
└── client/
    ├── stores/
    │   └── intentionEngine.ts          # Quantum Intent Engine (403 lines)
    │
    └── components/
        ├── MemoryWidget.tsx            # Memory question UI
        ├── EvolutionWidget.tsx         # Profile evolution display
        ├── CohortConnectWidget.tsx     # Cohort matching
        └── stats/
            └── MemoryEngineStats.tsx   # Memory stats display
```

---

## Summary

The **Memory Engine** and **Quantum Intent Engine™** represent a sophisticated AI-powered system that goes beyond simple journaling to provide **predictive, adaptive, deeply personalized support**.

**Memory Engine** (Server-Side):
- Generates context-aware self-care questions
- Extracts psychological traits and values
- Classifies users into archetypes and cohorts
- Creates flowing narrative Memory Stories
- Adapts to quantum state in real-time

**Quantum Intent Engine™** (Client-Side):
- Records signals from all user interactions
- Detects 7 distinct behavioral patterns
- Calculates 4-dimensional user state
- Recommends optimal widgets and timing
- Provides state to Memory Engine

**Together**: They create a system that anticipates user needs before they articulate them, providing proactive support that adapts to energy, clarity, alignment, and support needs in real-time.

---

*Last Updated: 2026-01-26*
*Document Version: 1.0*
