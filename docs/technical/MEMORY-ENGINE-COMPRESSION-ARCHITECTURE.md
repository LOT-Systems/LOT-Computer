# LOT Memory Engine — Compression Architecture

## Classification: RESTRICTED // S-2 EYES

**Author:** LOT Systems Corporation
**S-2:** Vadik Marmeladov
**Date:** 10 June 2026
**Status:** OPERATIONAL
**Engine:** Together AI (Llama 3.3 70B primary)

---

## 1. Doctrine

The Memory Engine is a passive, non-intrusive intelligence system. It does not
wait for the user to speak. It observes usage patterns — login streaks, tab
switches, radio listening, journal entries, mood check-ins, widget interactions —
and generates deeply personal questions based on accumulated context. The user
answers by tapping one of 3-4 options. Each answer compresses the profile. Each
compressed profile produces a sharper question. The cycle is self-reinforcing.

The AI never initiates conversation. It asks. The user answers. The machine
remembers. This is the opposite of a chatbot: the intelligence is in the
question, not the response.

---

## 2. The Virtuous Compression Cycle

```
                    ┌─────────────────────┐
                    │   USER ACTIVITY      │
                    │   login, tabs, radio,│
                    │   journal, mood      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   CONTEXT CAPTURE    │
                    │   8 signal sources   │
                    │   (Section 4)        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   PROMPT BUILD       │
                    │   buildPrompt()      │
                    │   ~4000-8000 chars   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   TOGETHER AI        │
                    │   Llama 3.3 70B      │
                    │   1024 max tokens    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   QUESTION           │
                    │   3-4 tap options    │
                    │   1400ms fade-in     │
                    └──────────┬──────────┘
                               │
                    USER TAPS ONE OPTION
                               │
                               ▼
                    ┌─────────────────────┐
                    │   ANSWER STORED      │
                    │   Answer + Log       │
                    │   + full context     │
                    │   (weather, humidity,│
                    │    city, timezone)   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   PROFILE COMPRESSED │
                    │   traits extracted   │
                    │   archetype refined  │
                    │   cohort classified  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   NEXT QUESTION       │
                    │   sharper, deeper,    │
                    │   informed by prior   │
                    │   answers + context   │
                    └──────────┬───────────┘
                               │
                               └──── CYCLE REPEATS ────┘
```

**Compression ratio**: More answers produce fewer, more precise questions.
After 30 answers, the engine has enough profile density to generate questions
that reference specific prior choices. After 10+ answers, psychological
archetype and cohort classification activate, directing questions toward the
user's soul-level identity.

---

## 3. Non-Intrusive AI Architecture

### 3.1 The Machine Asks First

The engine generates questions without user initiation. The user opens the
site; a question appears. No prompt box. No chat interface. No typing. One
tap on a pre-composed option. This removes friction to zero and makes the
interaction feel like a daily ritual, not a task.

### 3.2 Passive Signal Collection

The engine never asks the user to report their behavior. Instead, it observes:

| Signal | Source | How Captured |
|--------|--------|-------------|
| Login streak | `user_login` log events | Day count from first answer |
| Tab switches | Log events per module | Module usage map |
| Radio listening | `isRadioOn` store / log events | Engagement analytics |
| Journal entries | `note` log events (text > 20 chars) | Extracted in buildPrompt |
| Mood check-ins | `emotional_checkin` log events | Mood trend (improving/declining/stable) |
| Weather context | WeatherResponse table cache | Temperature, humidity, description |
| Widget interactions | `quantumIntentPatterns` in user metadata | Behavioral pattern recognition |
| Self-care activity | `self_care_complete` / `self_care_skip` events | Completion vs skip ratio |

### 3.3 Question Presentation

Questions fade in with 1400ms CSS transition. Answer options appear as
full-width tap targets. On answer, a cascade fade-out (120ms stagger per
button distance from selected) plays before the response fades in. The
response displays for 6-8 seconds, then the widget fades out. The entire
interaction takes under 15 seconds.

No loading spinner. No "thinking" indicator. The question is pre-fetched
on page load via `useMemory()` React Query hook. By the time the user
scrolls to the Memory widget, the question is ready.

---

## 4. The Eight Context Sources

The `buildPrompt()` function assembles context from eight independent sources
before generating a question. Each source adds a structured section to the
prompt.

### Source 1: Location and Weather

```
getLogContext(user) → { temperature, humidity, weatherDescription,
                        country, city, timeZone, date }
```

Fetches cached weather from `WeatherResponse` table. If stale (beyond
`WEATHER_STALE_TIME_MINUTES`), derives season from month. Prompt includes:
city, country, temperature in Celsius, humidity percentage, weather
description. Ensures questions are seasonally appropriate — never asks
about snow in summer, cold beverages in winter.

### Source 2: Quantum State

Real-time user energy from client-side intention engine:

| Dimension | Values |
|-----------|--------|
| Energy | depleted, low, moderate, high |
| Clarity | confused, uncertain, clear, focused |
| Alignment | disconnected, searching, aligned, flowing |
| Needs Support | none, moderate, critical |

Prompt guidance adapts: depleted energy triggers gentle, restorative
questions. High energy triggers expansive, goal-oriented questions.
Critical support need prioritizes compassionate questions over analytical
ones.

### Source 3: Widget Interaction Patterns

Extracted from `user.metadata.quantumIntentPatterns`. Array of recognized
behavioral patterns with confidence scores (0-1). Only patterns above 50%
confidence are included. Example: "User engages most with Memory and Mood
widgets in evening hours (72% confidence)."

### Source 4: Engagement Analytics

Server-side computation from log history:

- **Active days**: Unique calendar days with activity
- **Module usage map**: Memory, Mood, Planner, Self-care, Intentions, Journal, Chat
- **Dormant modules**: Modules with zero activity (used to nudge exploration)
- **Mood trend**: Last 3 check-ins vs previous 3 — improving, declining, or stable
- **Self-care ratio**: Completed vs skipped self-care actions
- **Most/least active modules**: Directs question topics

### Source 5: Goals

`extractGoals(user, logs)` identifies active goals from patterns and
intentions. Each goal has:

- Title, category (emotional/relational/behavioral/growth/physical/creative)
- Journey stage: beginning → struggle → breakthrough → integration → mastery
- Progress markers with timestamps
- Confidence score

Prompt instructs the AI to align questions with the user's primary goal
and current journey stage. Beginning-stage users get foundational "why"
questions. Struggle-stage users get supportive, obstacle-acknowledging
questions. Breakthrough-stage users get celebration and deepening questions.

### Source 6: Memory Story (Answer History)

The last 30 answered questions are extracted with full Q&A text and dates.
This is the compression core:

- **Duplicate detection**: 30-question sliding window. No question may
  repeat, even with different wording.
- **Topic diversity**: `extractQuestionTopics()` scans last 10 questions
  against keyword clusters (beverage, food, clothing, routine, wellness,
  medical, nutrition). If 3+ of last 5 share a topic, diversity warning
  triggers.
- **Follow-up chain**: 15 most recent Q&A pairs are formatted as the
  "User's Memory Story" and included verbatim in the prompt.

### Source 7: Psychological Profile (Traits + Archetype)

Activates at 3+ answers. `extractUserTraits(logs)` identifies:

- 10 behavioral traits
- 10 psychological patterns
- 10 value orientations
- Self-awareness level (0-10 scale)
- Emotional range

`determineUserCohort()` classifies into one of 10 archetypes:

| Archetype | Question Focus |
|-----------|---------------|
| The Seeker | Growth, self-discovery, transformation |
| The Nurturer | Connection, care, emotional bonds |
| The Achiever | Goals, progress, purposeful action |
| The Philosopher | Meaning, purpose, existential reflection |
| The Harmonizer | Balance, peace, inner equilibrium |
| The Creator | Expression, creative process, innovation |
| The Protector | Safety, boundaries, stability |
| The Authentic | Truth, honesty, genuine expression |
| The Explorer | Curiosity, new experiences, discovery |
| The Wanderer | Identity exploration, openness to change |

### Source 8: Trauma-Informed Protocol

Activates at 10+ log entries. `detectTraumaIndicators(logs)` screens for:

- **PCL-5 clusters**: Re-experiencing, avoidance, negative alterations,
  hyperarousal (0-100 per cluster)
- **C-PTSD indicators**: Affect dysregulation, negative self-concept,
  interpersonal difficulty
- **Eating disorder signals**: Restriction, bingeing, body dissatisfaction,
  food anxiety, recovery signals
- **12 trauma source categories**
- **7 recovery indicators**
- **Trajectory**: Improving, declining, or stable

Risk levels: none, low, moderate, elevated.

When active, the protocol overrides question tone:
- Never asks about traumatic events or probes for details
- Frames questions about present-day functioning, not past
- Uses observational framing ("How do you...") not analytical ("Why do you...")
- Honors avoidance — if user avoids a topic, boundary is respected completely
- Tone guidance: "Like a field medic — competent, gentle, unhurried."

---

## 5. Question Generation Modes

The engine selects one of five modes per question cycle:

### Mode 1: First Question (Day 1, 0 answers)

Open, welcoming. Explores surface preferences — morning routines, beverages,
self-care habits. Sets the foundation for the compression cycle.

### Mode 2: Weekend Mode (Saturday/Sunday)

Light, easy, fun. Questions must be answerable in 2 seconds. Topics:
comfort food, relaxation, hobbies, simple pleasures. No deep soul-searching.
Quota: 12-15 prompts per weekend day.

### Mode 3: Follow-Up (85% probability, 2+ answers)

The compression engine. The AI receives the full Memory Story (15 most
recent Q&A pairs) and must:

1. Reference specific prior answers ("Since you mentioned...")
2. Progress through four depth levels:

| Level | Depth | Example |
|-------|-------|---------|
| 1 | Behavior | "How do you prepare your tea?" |
| 2 | Motivation | "What does this morning ritual provide for you?" |
| 3 | Values | "What value does this practice honor?" |
| 4 | Soul | "What does this reveal about who you're becoming?" |

Journal entries (up to 8, first 200 chars each) are included to inform
emotional awareness. The AI must show it remembers — generic questions
that could apply to anyone are explicitly forbidden.

### Mode 4: Explore New Topic (15% probability, 2+ answers)

Forces the engine to choose an unexplored area. Reviews all prior questions
and must select a topic not yet covered. Maintains story breadth while
follow-up mode deepens individual threads.

### Mode 5: Compressed Follow-Up (3+ questions on same topic)

Triggered when `detectTopicRepetition()` finds 3+ of the last 5 answers
share a topic cluster. Switches to ultra-brief format:

- Question: 8 words or fewer
- Options: 2-4 words each, 2-3 choices only
- Example: "What time usually?" → "Morning", "Afternoon", "Evening"

This is the compression made visible: as the engine learns more about a
topic, it asks shorter, more precise questions.

---

## 6. Pacing System

`calculateIntelligentPacing()` determines daily quota:

| Day | Quota | Rationale |
|-----|-------|-----------|
| Day 1 | 10 | Strong onboarding start |
| Day 2 | 8 | Continued engagement |
| Day 3 | 9 | Building momentum |
| Day 4+ | 10-15 | Deterministic by `dayNumber % 7` |
| Weekends | 12-15 | More reflection time available |

Prompts are available 24/7 (time-of-day restriction removed). Quota is the
sole frequency control. Once daily quota is reached, no further questions
appear until the next calendar day.

---

## 7. Answer Storage and Context Capture

Each answer is dual-stored:

**Answer table**: `userId`, `question`, `options`, `answer`, `metadata`
(questionId, type: regular/weekly_summary)

**Log table**: `userId`, `event` (answer/medical_record/weekly_summary_response),
`metadata` (questionId, answerId, question, options, answer), `context`
(temperature, humidity, city, country, timeZone)

Medical questions are auto-detected via 30+ keyword patterns (blood type,
allergy, medication, chronic, vision, dental, vaccination, heart rate, etc.)
and stored with event type `medical_record` for separate clinical tracking.

Context is captured at answer time — the weather and location when the user
answered, not when the question was generated. This creates a temporal record:
what they chose, where they were, what the conditions were.

---

## 8. Story Generation

The Memory Story is the accumulated narrative synthesized from all answers.
Generated via Together AI with a local fallback.

**AI path**: Together AI receives formatted Q&A pairs (up to 30) and generates
a flowing third-person narrative with key insights using en-dash formatting.

**Local fallback** (when AI unavailable): Composes a poetic portrait directly
from answer data — question-answer pairs formatted as an evolving record.

**Caching**: Generated stories are persisted to `user.metadata.lastMemoryStory`
with version number and answer count. Cached stories are returned immediately
when answer count is unchanged, avoiding unnecessary AI calls.

---

## 9. Insight Response System

After each answer, the engine returns a brief insight:

- **Answer 1**: "Thank you for starting your Memory story with LOT."
- **Answer 2-9**: Standard acknowledgment with default reply rotation
- **Answer 10+**: Archetype-based response. The engine identifies the user's
  soul archetype and returns a response that reflects their deeper nature.
  Example for "The Seeker": "Your Seeker nature is showing in your choices.
  You're drawn to growth."

Additionally, a Stoic reflection is appended to every response — a brief
philosophical observation drawn from the user's current quantum state.

---

## 10. Duplicate Prevention

Three layers prevent question repetition:

1. **Server-side**: 30-question sliding window in `buildPrompt()`. Recent
   questions listed verbatim in prompt with explicit NO-DUPLICATE POLICY.
2. **Client-side sessionStorage**: `answeredMemoryQuestions` tracks answered
   IDs within the current browser session to prevent re-showing.
3. **Client-side localStorage**: `recentMemoryQuestions` tracks shown questions
   for 7 days for server-side duplicate detection via request headers.

---

## 11. AI Engine Configuration

**Primary**: Together AI — Llama 3.3 70B Instruct Turbo
**Fallback chain** (within Together AI):

1. `meta-llama/Llama-3.3-70B-Instruct-Turbo` (primary)
2. `meta-llama/Llama-3.3-70B-Instruct-Turbo-Free` (free tier)
3. `meta-llama/Llama-4-Scout-17B-16E-Instruct` (efficient)
4. `mistralai/Mixtral-8x7B-Instruct-v0.1` (quality)
5. `Qwen/Qwen2-72B-Instruct` (multilingual)
6. `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo` (degraded)
7. `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` (legacy)

**Final fallback**: Local story composition (no AI required).
No Claude or OpenAI dependencies remain in the Memory Engine pipeline.

---

## 12. UI Performance

`MemoryWidget` is wrapped in `React.memo` (zero props). Parent component
`System.tsx` subscribes to 15+ nanostores including `stores.me` (full user
profile). Without memo, badge sync events cascade re-renders through
System → MemoryWidget → Button. The memo boundary prevents this entirely.

Answer buttons use `React.useCallback` with `[question]` dependency for
stable click handlers. Cascade fade-out uses CSS `transitionDelay` computed
from button distance to clicked index (120ms stagger).

---

**LOT Systems Corporation**
**Vadim Marmeladov — CEO, Founder, Inventor**
