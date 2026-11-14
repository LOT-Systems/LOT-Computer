# LOT® LOG COMMAND SYSTEM — TECHNICAL SPECIFICATION

```
╔══════════════════════════════════════════════════════════════════════╗
║  DOC ID    : LOT-SPEC-LOG-CMD-v1                                     ║
║  DATE      : 2026-11-14                                              ║
║  CLASS     : ENGINEERING / NARRATIVE INTELLIGENCE                    ║
║  STATUS    : OPERATIONAL                                             ║
║  S-2       : VADIK MARMELADOV                                        ║
║  SUPERSEDES: /story v0 (2026-07, 10-entry prompt, event-filter bug)  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 0. BLUF (Bottom Line Up Front)

1. The Log is LOT's **passive AI surface**: the user writes, the machine listens. No prompts, no forms. Every entry is stamped with environment context (place, weather, humidity, moon phase, sun sign, rokuyo) by `getLogContext()`.
2. Two commands anchor the Log's intelligence layer:
   - **`/system`** — renders the full command index from a single registry (`LOG_COMMANDS`). It cannot drift from what the detector recognises; a test enforces this.
   - **`/story [day|week|month|year]`** — compresses the user's context-stamped records for that horizon into a **Story Packet**, hands only the packet to the AI vendor (Together AI), and returns a short second-person narrative, a terminal header (peaks, presence, Arcade XP) and **one follow-up question** that closes the loop.
3. **Critical defect fixed:** `/story` v0 filtered for event names `log_entry`, `journal` and `memory_answer`. Production writes Journal entries as **`note`** and Memory answers as **`answer`**. v0 therefore built stories from mood check-ins only and ignored the Journal entirely. v1 reads the correct events.
4. **Second defect fixed:** triggers fired on the first keystroke that completed the command, so `/story week` and `/qi <question>` could never read their argument when typed live. Argument-bearing commands now fire after 1.2 s of typing silence.

---

## 1. MISSION CONTEXT

LOT® AI is a context-based personal narrative system. Each widget contributes a signal; each click is a snapshot of the moment (no photo, no sound). The loop:

```
 ┌──────────────┐   ┌──────────────────────┐   ┌───────────────────┐   ┌────────────────────┐
 │ LOT USER DATA│──▶│ LOT QUANTUM INTENT   │──▶│ AI VENDOR         │──▶│ LOT PERSONALIZED   │
 │ Log · mood · │   │ ENGINE (client state)│   │ PROCESSOR         │   │ DATA STORED        │
 │ Memory · ctx │   │ + STORY COMPRESSION  │   │ (Together AI)     │   │ generated_story log│
 └──────────────┘   │ ENGINE (packet)      │   └───────────────────┘   └─────────┬──────────┘
        ▲           └──────────────────────┘                                     │
        │                                                                        │
        └──────────── follow-up question ("↳ …") returned to the Log ◀────────────┘
```

The machine asks first (morning question on any device or widget). The Log answers passively. `/story` compresses and returns the pattern; the follow-up question re-opens the loop, surfacing high and low peaks the user may not have named.

---

## 2. COMPONENT MAP

| Component | Path | Role |
|---|---|---|
| Trigger detector + **command registry** | `src/client/utils/logTriggers.ts` | `RULES` (detection), `LOG_COMMANDS` (index), `DEFERRED_TRIGGERS`, `renderSystemHelp()` |
| **Story Compression Engine (SCE v1)** | `src/shared/utils/story-compression.ts` | Pure: horizon parsing, auto-horizon, packet compression, peaks, Arcade XP, prompt/header render, fallback story, follow-up |
| Log editor wiring | `src/client/components/Logs.tsx` (`NoteEditor`) | Immediate vs deferred trigger dispatch, SYSTEM block, 📖 block (header + story + follow-up) |
| Client mutation | `src/client/queries.ts` → `useStoryGeneration` | `POST /api/story` with `horizon` |
| Server endpoint | `src/server/routes/api.ts` → `POST /api/story` | Fetch → compress → frame → Together AI → persist |
| Verification | `scripts/tests/test-log-commands.ts` | 34 offline assertions (`yarn test:log-commands`) |

---

## 3. COMMAND INDEX (`/system`)

Rendered from `LOG_COMMANDS`. Grouped:

| Group | Command | Args | Effect |
|---|---|---|---|
| NARRATIVE | `/story` | `[day\|week\|month\|year]` | Compressed story + peaks + XP + follow-up |
| NARRATIVE | `/prayer` (`/candle`, 🕯️) | — | Contextual scripture |
| INTELLIGENCE | `/qi` | `[question]` | Quantum Intelligence RFI |
| INTELLIGENCE | `/scan` (`/ai`) | — | System status overview |
| INTELLIGENCE | `/qos` | — | Quantum OS state |
| INTELLIGENCE | `/assembly` | — | Self-assembly status |
| INTELLIGENCE | `/phys` | — | Physiological cohort report |
| SELF-CARE | `/how` | — | Open LOT AI check-in (System tab) |
| SELF-CARE | `/breathe` | — | 4-2-6 breathing |
| SELF-CARE | `/freeze` (`/pause`, 🧊) | — | Pause and reflect |
| SELF-CARE | `/silent` (`/quiet`; `/sil` routes to same handler) | — | Signal silence check |
| SELF-CARE | `/fast` | — | Orthodox fasting calendar |
| ENVIRONMENT | `/radio` (🎧) | — | Toggle radio |
| ENVIRONMENT | `/synth` (`/keyboard`, 🎹) | — | Keyboard sound |
| ENVIRONMENT | `/night` (🌙) | — | Dark mode |
| SYSTEM | `/system` (`/commands`) | — | This index |

**Adding a command (SOP):**
1. Add the trigger to the `LogTrigger` union and a `RULES` row (keywords lower-case, no slash).
2. Add one `LOG_COMMANDS` row (group, description, optional `usage`/`aliases`).
3. If it reads an argument, add the trigger to `DEFERRED_TRIGGERS`.
4. Add the handler branch in `runTriggers()` in `Logs.tsx`.
5. `yarn test:log-commands` — the registry test fails if a command or alias does not resolve to its trigger.

### 3.1 Dispatch rules

- Detection is **delta-based** (`detectNewTriggers(text, previousText)`): editing around an existing command does not re-fire it.
- **Immediate** triggers run on the keystroke that completes them.
- **Deferred** triggers (`/story`, `/qi`) are queued; each keystroke re-arms a `DEFERRED_TRIGGER_IDLE_MS` (1200 ms) timer. On expiry the handler reads the **latest** text, so `/story month` is parsed whole. If the user deleted the command before expiry, it does not fire.
- Timer is cleared on unmount.

---

## 4. STORY COMPRESSION ENGINE (SCE v1)

### 4.1 Horizons

| Horizon | Window (rolling) | Journal excerpts | Excerpt cap | Target words |
|---|---|---|---|---|
| `day` | 24 h | 6 | 220 ch | 70–130 |
| `week` | 7 d | 8 | 220 ch | 110–190 |
| `month` | 30 d | 10 | 220 ch | 110–190 |
| `year` | 365 d | 10 | 140 ch | 150–230 |

Aliases: `today/d/24h`, `w/7d`, `m/30d`, `y/365d`.

**Auto-horizon** (no argument): the smallest horizon holding **≥ 3 valid signals**. A quiet day widens to the week, a quiet week to the month. The response carries `auto: true`.

### 4.2 Signal classification

| Kind | Events (as written to `logs`) | Valid when |
|---|---|---|
| journal | `note`, `journal`, `log_entry` | text non-empty after cleaning |
| mood | `emotional_checkin` | `metadata.emotionalState` present |
| answer | `answer`, `memory_answer` | `metadata.answer` (or `option`) present |
| selfcare | `self_care_checkin`, `energy_checkin`, `selfcare`, `self_care` | always |
| **excluded** | `generated_story`, `prayer_scripture` | never — machine output never feeds back |

**Cleaning:** appended machine blocks (`📖 …`, `🕯️ …`) are cut; slash commands and their horizon argument are stripped; whitespace collapsed. A Log entry consisting only of `/system` is not a signal.

### 4.3 Valence & peaks

- Mood valence (−2…+2) from `MOOD_VALENCE`, amplified by intensity (1–10) up to 1.5× → range ±3.
- Journal valence from a 40-word lexicon, **capped at ±2**. Doctrine: *what the user says they feel outranks what a word list guesses.*
- **HIGH PEAK** = max positive valence; **LOW PEAK** = min negative valence.
- **SPIKE** = low peak ≤ −2, or high−low swing ≥ 3. A spike drives the follow-up question.
- **Trajectory** = mean valence of second half vs first half of the window (threshold 0.5): `rising | falling | steady | unknown`.

### 4.4 Context aggregation

Cities (unique, ≤5), mean temperature (°C, from stored Kelvin), mean humidity, dominant moon phase, dominant sun sign, active days, longest consecutive-day streak, words written.

### 4.5 Packet → vendor

`renderPacketForPrompt()` produces the only text the vendor receives. Raw rows never leave the server. The packet is bounded (week packet < 4 KB, asserted). Compression ratio `rawChars / packetChars` is reported in the header and stored.

### 4.6 Follow-up (loop closure)

Deterministic, computed from the packet — no vendor required:

| Condition | Question |
|---|---|
| no signals | "What is one thing from this {horizon} you want the machine to remember?" |
| spike | "You logged feeling {low} on {date}. Is it still with you, or has it passed?" |
| rising | "Your signal has been rising. What has been carrying you?" |
| falling | "Your signal has been dipping. What would one small act of care look like tomorrow?" |
| high peak | "What made {date} feel lighter — and can you repeat it?" |

Rendered as `↳ …` under the story. Stored in `metadata.followUp` for downstream (morning question, LOT device).

### 4.7 Failure modes

| Fault | Behaviour |
|---|---|
| Zero signals | No vendor call. Local invitation story. |
| Vendor error / empty completion | `composeFallbackStory(packet)` — second-person, packet-only facts. `engine: 'local'`. |
| Persistence error | Story still returned; `logId: null`. |
| Non-Usership | HTTP 403 with explanatory story text (unchanged). |
| Rate limit | 5 req/min/user (unchanged). |

---

## 5. ARCADE LAYER (gamified evolution, self-care doctrine)

XP rewards **presence and honesty, never positivity**. A low check-in earns the same XP as a high one (asserted by test).

| Source | XP |
|---|---|
| Journal entry | 10 + 1 per 20 words (max +10) |
| Mood check-in | 5 |
| Memory answer | 8 |
| Self-care event | 6 |
| Active day | 15 |
| Streak (if > 1 day) | 5 × longest streak |

Level = ⌊√(XP / 50)⌋ + 1. Rank every two levels:
`INITIATE → OBSERVER → OPERATOR → NAVIGATOR → ARCHITECT → CARTOGRAPHER → SAGE`.

Header line: `ARCADE  +245 XP · LV 3 OBSERVER ▓▓▓▓░░░░░░`. XP here is **horizon XP** ("what this week earned"); it complements, not replaces, the badge Codex in `src/client/utils/badges.ts`.

---

## 6. API CONTRACT

```
POST /api/story            (auth required · Usership tag · 5/min)
Body: {
  logText: string,
  horizon?: 'day'|'week'|'month'|'year',   // omit → auto
  quantumState?: { energy, clarity, alignment, needsSupport },
  userIndex?: { overall, dimensions, trend }
}
200: {
  story: string,
  logId: string|null,
  horizon: 'day'|'week'|'month'|'year',
  auto: boolean,
  header: string[],        // terminal lines
  followUp: string|null,
  engine: 'together'|'local'
}
```

Persisted log: `event: 'generated_story'`, `metadata: { story, horizon, auto, engine, followUp, packet, logText, quantumState, timestamp }`. The full packet is stored so future compressions (week → month → year) can be built from prior stories.

Query bound: signal events only, last 365 days, ≤ 3000 rows, columns `createdAt, event, text, metadata, context`.

---

## 7. VERIFICATION

```
yarn test:log-commands      → 34 PASS · 0 FAIL
tsc --noEmit (tsconfig.json) → 128 pre-existing errors, 0 new
yarn build                   → client + server green
```

Coverage: horizon parsing (5), auto-horizon (2), compression & event regression (14), Arcade (4), fallback (2), registry consistency (5), cleaning (1), bounds (1).

---

## 8. KNOWN LIMITS / NEXT ACTIONS

1. Windows are rolling UTC intervals, not the user's local calendar day. Next: anchor `day` to local midnight via `user.timeZone`.
2. Journal valence is lexicon-based (English). Next: route through QIE signal scores when available client-side.
3. Hierarchical compression (stories-of-stories): `metadata.packet` is stored; a scheduled job can fold 7 day-packets into a week-story without re-reading raw logs.
4. Feed `metadata.followUp` into the morning question generator (`src/server/utils/memory/question-generator.ts`) so the machine asks first.
5. `cohort-support` (❗) has a detector rule but no Log handler.
