<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# MACHINE-TO-MACHINE REBUILD PROMPT
## Widget → Memory Engine Compression Loop
### LOT® Self-Assembly™ | Session 2026-06-30 | Authorized: S-2 VADIK MARMELADOV

---

## PURPOSE

This document is a complete machine-readable specification for an AI agent to
understand, audit, and reconstruct the LOT® widget signal pipeline and Memory
Engine compression loop. No conversation history required. Read this file and
the referenced source files; you have everything needed to rebuild.

---

## ARCHITECTURE SUMMARY

```
WIDGETS (client, React + nanostores)
  │
  ├─ PlannerWidget        → recordSignal('planner', 'plan_set', {...})
  │                       → Log.create({ event: 'plan_set', text: 'Intent: X • Today: Y • How: Z • Feeling: W' })
  │
  ├─ EmotionalCheckIn     → recordSignal('mood', emotionalState, {...})
  │                       → Log.create({ event: 'emotional_checkin', metadata: { emotionalState } })
  │
  ├─ PatternInsightsWidget→ recordSignal('memory'|'mood'|'intentions', action, {...})
  │
  ├─ MemoryWidget         → Log.create({ event: 'answer', metadata: { question, options, answer } })
  │
  └─ Other widgets        → recordSignal(source, signal, metadata)
         │
         ▼
CLIENT intentionEngine (localStorage: 'intention-signals')
  - 60 pattern-recognition algorithms fire on accumulated signals
  - Recognized patterns stored in user.metadata.quantumIntentPatterns
         │
         ▼  (periodic sync via POST /api/quantum-intent/sync)
SERVER
  - Log.bulkCreate({ event: 'quantum_intent_signal', ... }) → PostgreSQL logs table
  - Patterns saved to user metadata
         │
         ▼
PostgreSQL logs table (all events stored here, never elsewhere)
  - event: 'answer' | 'plan_set' | 'emotional_checkin' | 'quantum_intent_signal'
  -        'note' | 'medical_record' | 'self_care_complete' | 'self_care_skip'
  - text: primary content (plan_set: "Intent: X • Today: Y • How: Z • Feeling: W")
  - metadata: JSONB (emotionalState, question, options, answer, source, signal...)
  - context: JSONB (timeZone, city, country, temperature, humidity, weatherDescription)
  - userId, createdAt (indexed: idx_logs_userid_createdat)
         │
         ▼
Memory Engine buildPrompt() — src/server/utils/memory.ts
  Reads from logs array (passed in from route handler):
  1. answer logs          → user's Memory story (Q/A history)
  2. note logs            → journal entries (emotional depth)
  3. emotional_checkin    → mood trajectory (improving/declining/stable)
  4. plan_set             → user's declared daily intention (NEW — 2026-06-30)
  5. quantum_intent_signal→ behavioral patterns from widgets
  6. medical_record       → health context + trauma protocol
  7. user.metadata.quantumIntentPatterns → client-recognized patterns
         │
         ▼
AI Engine (Together AI primary → Claude fallback)
  Generates ONE personalized Memory question + 3-4 options
         │
         ▼
Response saved as Log.create({ event: 'answer' })
Loop closes.
```

---

## KEY FILES

### `src/server/utils/memory.ts`
The core compression engine. All critical logic lives here.

**AI engine configuration (line ~51):**
```ts
const AI_ENGINE_PREFERENCE: EnginePreference = 'together'
// Primary: Together AI (Llama-3.3-70B-Instruct-Turbo)
// Falls back automatically: Together → Gemini → Mistral → Claude → OpenAI
```

**`buildPrompt(user, logs, isWeekend, quantumState)` — the heart of the loop:**
- Receives `logs: Log[]` from the route handler (all user logs, filtered)
- Extracts memory answers, journal entries, mood trajectory
- Injects `plannerContext` from the most recent `plan_set` log (NEW 2026-06-30)
- Injects `quantumContext` from passed-in quantum state
- Injects `goalContext` from `extractGoals(user, logs)`
- Injects `cohortInfo` from `determineUserCohort()` + `extractUserTraits()`
- Returns full prompt string for AI completion

**Planner context injection (NEW 2026-06-30, ~line 305):**
```ts
let plannerContext = ''
const recentPlanLog = logs.find(log => log.event === 'plan_set')
if (recentPlanLog?.text) {
  const planDate = recentPlanLog.context?.timeZone
    ? dayjs(recentPlanLog.createdAt).tz(recentPlanLog.context.timeZone).format('D MMM')
    : dayjs(recentPlanLog.createdAt).format('D MMM')
  plannerContext = `\n\n**User's Declared Daily Intention (${planDate}):**\n${recentPlanLog.text}\n\n...`
}
```

**`formatLog(log: Log): string` — renders a log entry for the AI prompt (~line 769):**
Handles: `answer`, `chat_message`, `note`, `settings_change`, `plan_set`, `emotional_checkin`

`plan_set` handler (NEW 2026-06-30):
```ts
case 'plan_set': {
  body = log.text || ''
  break
}
```

`emotional_checkin` handler (NEW 2026-06-30):
```ts
case 'emotional_checkin': {
  const state = (log.metadata as any)?.emotionalState
  if (state) body = `Biofield check-in: ${state}`
  break
}
```

**`completeAndExtractQuestion(prompt, user, promptsShownToday)` (~line 135):**
- Gets engine: `aiEngineManager.getEngine(AI_ENGINE_PREFERENCE)`
- Calls `engine.generateCompletion(prompt, maxTokens)`
- Parses JSON response (question + options)
- On failure: falls back to `getBackupQuestion(dayOfYear, promptsShownToday)`
- Backup question bank: 29 self-care questions, cycles by day + prompt count

**Prompt assembly order:**
```ts
const fullPrompt = head + quantumContext + plannerContext + goalContext + '\n\n' + formattedLogs
```

### `src/server/utils/ai-engines.ts`
AI engine abstraction layer. Never modify memory.ts to add new providers — add them here.

**`TogetherAIEngine` model fallback chain (order matters):**
```
'meta-llama/Llama-3.3-70B-Instruct-Turbo'       // Primary: Latest, best quality
'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'  // Fallback 1: Free tier
'meta-llama/Llama-4-Scout-17B-16E-Instruct'     // Fallback 2: Efficient
'mistralai/Mixtral-8x7B-Instruct-v0.1'          // Fallback 3: Quality alternative
'Qwen/Qwen2-72B-Instruct'                        // Fallback 4: Multilingual
'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'   // Fallback 5: Degraded
'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'  // Fallback 6: Legacy/deprecated
```
Note: `Meta-Llama-3.1-70B-Instruct-Turbo` was discontinued Feb 6, 2026 (serverless).

**`AIEngineManager.getEngine(preference)` fallback logic:**
```ts
// 1. Try preferred engine (e.g. 'together') — if available, return it
// 2. If not available, walk fallback order:
//    ['ollama', 'together', 'gemini', 'mistral', 'claude', 'openai']
// 3. First available engine in that order wins
// 4. Throws if none available
```

**Engine availability = API key is set and non-placeholder:**
- Together AI: `process.env.TOGETHER_API_KEY`
- Claude: `process.env.ANTHROPIC_API_KEY` or `config.anthropic?.apiKey`
- OpenAI: `process.env.OPENAI_API_KEY`
- Gemini: `process.env.GOOGLE_API_KEY`
- Mistral: `process.env.MISTRAL_API_KEY`
- Ollama: `process.env.OLLAMA_ENABLED === 'true'` or `process.env.OLLAMA_BASE_URL`

### `src/server/routes/api.ts`
All HTTP routes. Requires `git add -f` (server files are gitignored).

**`/quantum-intent/sync` (POST, ~line 3487):**
Receives client-side intention signals. Saves via `bulkCreate` (NOT serial loop):
```ts
const rows = signals.map((signal: any) => ({
  userId: req.user.id,
  event: 'quantum_intent_signal',
  text: signal.signal,
  metadata: { source: signal.source, signal: signal.signal,
              signalMetadata: signal.metadata, timestamp: signal.timestamp },
  context: logCtx,
}))
const created = await fastify.models.Log.bulkCreate(rows, { validate: false })
```
**CRITICAL: Never revert to serial `Log.create()` loop here. It causes pool exhaustion
when multiple users sync concurrently (~28 ops per sync × 6 concurrent = pool dead).**

**`/me` (GET, ~line ~):**
Returns `usersTotal` and `usersOnline` from DB so client can seed stores immediately
before SSE fires (prevents "0" flash on first paint).

**`Answer.count()` fix:** Use `col: 'question'` (actual DB column), NOT `col: 'questionId'`
(JSONB metadata field — does not exist as a column, causes SQL error).

### `src/server/utils/db.ts`
Sequelize connection. Connection pool config (as of 2026-06-30):
```ts
pool: {
  max: 10,   // was 5 — expanded to handle concurrent quantum-intent syncs
  min: 1,
  acquire: 15000,
  idle: 10000,
  evict: 1000,
}
```
**Never set `min: 0`.** With min=0, pool can drop to zero under load and fail to
re-establish connections fast enough under burst.

### `migrations/20260630150000_add-logs-userid-createdat-index.cjs`
Adds composite index `(userId, createdAt)` on the `logs` table.
**Required:** without this index, log queries for active users hit statement timeout
(30s limit) and cascade into connection pool exhaustion.
```js
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addIndex('logs', ['userId', 'createdAt'], {
      name: 'idx_logs_userid_createdat',
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeIndex('logs', 'idx_logs_userid_createdat')
  },
}
```

### `src/client/stores/intentionEngine.ts`
Client-side signal accumulator. Key export: `recordSignal(source, signal, metadata?)`.
Stores to localStorage `'intention-signals'`. Syncs to server periodically.

**Every widget interaction that should feed the Memory Engine calls `recordSignal()`.**
If a widget click doesn't call `recordSignal()`, it is invisible to the compression loop.

### `src/client/components/PlannerWidget.tsx`
On plan submission:
```ts
recordSignal('planner', 'plan_set', { intent, today, how, feeling, hour })
createLog({ event: 'plan_set', text: `Intent: ${intent} • Today: ${today} • How: ${how} • Feeling: ${feeling}` })
```
Both are required. The `recordSignal()` goes to intentionEngine for pattern recognition.
The `createLog()` goes directly to the DB and is read by `buildPrompt()`.

### `src/client/components/EmotionalCheckIn.tsx`
Check-in flow: immediate `pendingState` display → API call → response → farewell.
The 3-hour cooldown is enforced by checking `logs` for recent `emotional_checkin` events.
`createCheckIn()` (via `useCreateEmotionalCheckIn`) POSTs to the emotional check-in route
which saves `Log.create({ event: 'emotional_checkin', metadata: { emotionalState } })`.

### `src/client/components/PatternInsightsWidget.tsx`
Pattern actions call `recordSignal()` with sources `'mood'`, `'memory'`, `'intentions'`.
These feed the intentionEngine pattern recognition, not direct DB writes.

---

## DATABASE SCHEMA: `logs` TABLE

```
id          UUID PRIMARY KEY
userId      UUID NOT NULL (FK → users.id)
event       VARCHAR (see event types below)
text        TEXT (primary human-readable content)
metadata    JSONB (event-specific structured data)
context     JSONB { timeZone, city, country, temperature, humidity, weatherDescription }
createdAt   TIMESTAMP WITH TIME ZONE
updatedAt   TIMESTAMP WITH TIME ZONE

INDEX: idx_logs_userid_createdat ON (userId, createdAt)
```

**Event types used by the compression loop:**

| event | text | key metadata fields |
|---|---|---|
| `answer` | — | `question`, `options[]`, `answer` |
| `plan_set` | `Intent: X • Today: Y • How: Z • Feeling: W` | — |
| `emotional_checkin` | — | `emotionalState` (string) |
| `note` | journal entry text | — |
| `medical_record` | — | health data fields |
| `quantum_intent_signal` | signal name | `source`, `signal`, `signalMetadata`, `timestamp` |
| `self_care_complete` | — | self-care item metadata |
| `self_care_skip` | — | self-care item metadata |

---

## ENVIRONMENT VARIABLES (DigitalOcean App Platform)

```
TOGETHER_API_KEY      Together AI API key — primary AI engine
ANTHROPIC_API_KEY     Anthropic/Claude key — fallback AI engine
DB_SSL                'false' to disable SSL (for local dev only)
DB_CA_CERT_PATH       Path to DigitalOcean DB CA cert (optional, auto-detected)
OLLAMA_BASE_URL       Local Ollama endpoint (optional, local dev only)
OLLAMA_ENABLED        'true' to enable Ollama engine
```

**Key constraint:** `TOGETHER_API_KEY` must be set on DO for Together AI to be primary.
If absent, `TogetherAIEngine.isAvailable()` returns false → `aiEngineManager` falls
to the next available engine in the chain.

---

## GIT WORKFLOW

Server files are gitignored (`.gitignore` covers `src/server/`).
Always stage server files with `git add -f`:
```bash
git add -f src/server/utils/memory.ts
git add -f src/server/utils/ai-engines.ts
git add -f src/server/routes/api.ts
git add -f src/server/utils/db.ts
```
Client files and migrations are tracked normally:
```bash
git add src/client/components/EmotionalCheckIn.tsx
git add migrations/20260630150000_add-logs-userid-createdat-index.cjs
```
Push to `master`. DigitalOcean auto-deploys from master.

---

## REBUILD CHECKLIST (for an AI agent starting fresh)

To verify the compression loop is intact:

- [ ] `memory.ts:AI_ENGINE_PREFERENCE` = `'together'`
- [ ] `memory.ts:buildPrompt()` reads `plan_set` log (finds `logs.find(log => log.event === 'plan_set')`)
- [ ] `memory.ts:buildPrompt()` injects `plannerContext` into `fullPrompt`
- [ ] `memory.ts:formatLog()` has `case 'plan_set'` and `case 'emotional_checkin'`
- [ ] `memory.ts:fullPrompt` = `head + quantumContext + plannerContext + goalContext + '\n\n' + formattedLogs`
- [ ] `api.ts:/quantum-intent/sync` uses `Log.bulkCreate()` not serial `Log.create()` loop
- [ ] `db.ts:pool.max` = 10, `pool.min` = 1
- [ ] `migrations/` contains `add-logs-userid-createdat-index.cjs`
- [ ] `api.ts:Answer.count()` uses `col: 'question'` not `col: 'questionId'`
- [ ] `api.ts:/me` returns `usersTotal` and `usersOnline`
- [ ] `app.tsx:getMe()` seeds `stores.usersTotal` and `stores.usersOnline` from response

---

## WHAT CHANGED IN THIS SESSION (2026-06-30)

1. **DB index** — `idx_logs_userid_createdat` on `(userId, createdAt)` prevents statement
   timeouts on log queries for active users.

2. **Pool expansion** — `pool.max: 5 → 10`, `pool.min: 0 → 1` absorbs burst load from
   concurrent quantum-intent syncs.

3. **`bulkCreate`** — `/quantum-intent/sync` replaced serial `Log.create()` loop.
   Prevents pool exhaustion (~28 ops × 6 concurrent users was killing the pool).

4. **Planner → Memory wiring** — `buildPrompt()` now extracts the most recent `plan_set`
   log and injects the user's declared intention as `plannerContext`. Memory questions
   can now follow up on what the user consciously chose to focus on today.

5. **`formatLog()` expansion** — Added `plan_set` and `emotional_checkin` cases so these
   events appear in the formatted log history sent to the AI (previously returned empty
   string → invisible to the model).

6. **AI engine** — `AI_ENGINE_PREFERENCE`: `'claude'` → `'together'`. Together AI
   (Llama-3.3-70B) is primary. Claude is automatic fallback if key is absent/invalid.

7. **`/me` seeding** — `/api/me` returns `usersTotal`/`usersOnline`; `app.tsx` seeds
   the nanostores immediately on login so System widget never shows 0 on first paint.

8. **EmotionalCheckIn UX** — `pendingState` shows `"[State] — logged."` immediately
   on button click, before the API responds. Closes the "goes nowhere" perception gap.

---

## AMBIENT AI™ DESIGN PRINCIPLE

> The UX is therapeutic in itself. Widget clicks are the ritual.
> The system acknowledges silently. The Memory Engine compresses toward the user.
> No perceived gap between action and signal. The loop is invisible. The growth is real.

Every widget interaction is a signal. Every signal is a data point. Every data point
feeds the Memory Engine. The Memory Engine asks a sharper question. The sharper
question produces a richer answer. The richer answer compresses the user's story.
The compressed story generates an even sharper question. This is the loop.

QIoT™ extends the loop to hardware: LOT® Station (weather + air quality), LOT® Brush
(toothbrush cadence). Physical signals enter the same `logs` table, same `buildPrompt()`
context, same compression loop. Same architecture — more signal sources.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION | 2026-06-30
