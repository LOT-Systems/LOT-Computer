# LOT® LOG COMMAND SYSTEM — FIELD MANUAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  DOC ID   : LOT-TM-LOG-CMD-01                                        ║
║  SUBJECT  : Log (Journal) entry system · /system · /story · /arcade  ║
║  STATUS   : ACTIVE                                                   ║
║  ISSUED   : 2026-11-13                                               ║
║  AUTHORITY: S-2                                                      ║
║  CLASS    : ENGINEERING / DOCTRINE                                   ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 1. MISSION

The Log is the **passive AI surface** of LOT®. The operator writes. The
machine does not prompt, does not interrogate, does not interrupt. Every
entry is stamped with environment context (weather, humidity, city, sky,
time, astrology) and becomes a coordinate in the operator's personal
narrative.

Slash commands are the **only active channel** inside the Log. They are
opt-in, typed by the operator, and resolve inline beneath the entry.

```
LOT USER DATA ──▶ QUANTUM INTENT ENGINE ──▶ STORY COMPRESSION ──▶ AI VENDOR (Together AI) ──▶ LOT PERSONALIZED DATA
 (logs + context)   (client: state/index)    (shared, deterministic)   (narrative pass)          (Log event: generated_story)
                                                     │
                                                     └──▶ FALLBACK STORY (vendor down) ──▶ operator still receives a story
```

---

## 2. COMMAND INVENTORY (AUTHORITATIVE)

Source of truth: `LOG_COMMANDS` in `src/client/utils/logTriggers.ts`.
`/system` renders directly from that registry — this table mirrors it.

| GROUP        | COMMAND                         | EFFECT                                              |
|--------------|---------------------------------|-----------------------------------------------------|
| NARRATIVE    | `/story [day\|week\|month\|year]` | Compressed story of the chosen window (default WEEK) |
| NARRATIVE    | `/prayer`                       | Contextual scripture                                |
| NARRATIVE    | `/how`                          | LOT AI check-in (navigates to System tab)           |
| INTELLIGENCE | `/qi [query]`                   | Quantum Intelligence RFI                            |
| INTELLIGENCE | `/scan`                         | System status overview                              |
| INTELLIGENCE | `/qos`                          | Quantum OS state analysis                           |
| INTELLIGENCE | `/assembly`                     | Self-assembly module status                         |
| INTELLIGENCE | `/phys`                         | Physiological cohort report                         |
| SELF-CARE    | `/breathe`                      | 4-2-6 breathing exercise                            |
| SELF-CARE    | `/freeze`                       | Pause and reflect protocol                          |
| SELF-CARE    | `/silent`                       | Signal silence check                                |
| SELF-CARE    | `/sil`                          | Signal silence (short form) — **now wired**         |
| SELF-CARE    | `/fast`                         | Orthodox fasting calendar                           |
| ARCADE       | `/arcade` · 🕹️                   | Arcade rank, badges, next tier — **new**            |
| ENVIRONMENT  | `/synth` · 🎹                    | Toggle keyboard sound                               |
| ENVIRONMENT  | `/radio` · 🎧                    | Toggle radio                                        |
| ENVIRONMENT  | `/night` · 🌙                    | Dark mode                                           |
| ENVIRONMENT  | `/system`                       | This command list                                   |

Emoji-only trigger (not a slash command, not listed): `❗` cohort-support.

---

## 3. `/story` — SCOPED COMPRESSION

### 3.1 Operator usage

```
/story            → WEEK  (default)
/story day        → last 24h      aliases: d · today · 24h
/story week       → last 7 days   aliases: w · 7d
/story month      → last 30 days  aliases: m · 30d
/story year       → last 365 days aliases: y · 365d
<unknown arg>     → WEEK
```

### 3.2 Timing — settle window

`/story` matches the moment it is typed (end-of-string is a valid token
boundary), **before** the operator can type the scope. The editor
therefore waits `STORY_SCOPE_SETTLE_MS = 1200` ms, then reads the
settled text and parses the scope. Re-editing around an existing
`/story` does not re-fire (delta detection via `detectNewTriggers`).
The timer is cleared on editor unmount.

### 3.3 Pipeline

| STEP | WHERE | WHAT |
|------|-------|------|
| 1 | `Logs.tsx` NoteEditor | Detect `story-mode`, settle 1200 ms, `parseStoryScope()` |
| 2 | client → `POST /api/story` | `{ logText, scope, quantumState, userIndex }` |
| 3 | `api.ts` | Usership gate (403 otherwise) |
| 4 | `api.ts` | `Log.findAll` with `createdAt >= storyWindowStart(scope)`, `limit = SCOPE_LOG_LIMIT[scope]` (200 / 500 / 1000 / 2000) |
| 5 | `storyCompression.compressLogs` | Digest: active days, entries, check-ins, self-care, top 3 moods, HIGH / LOW peaks, top 3 cities |
| 6 | `digestToPromptBlock` | Plain-text block → Together AI (`generateCompletion`, 512 tokens) |
| 7a | success | Persist `generated_story` log with `scope` + digest summary; respond `source: 'ai'` |
| 7b | vendor failure | Respond `fallbackStory(digest)` with `source: 'compression'` — never empty |
| 8 | `Logs.tsx` | Story appended to entry as `📖 …`; block labelled `📖 WEEK:` etc. |

### 3.4 Peaks

Emotional check-ins map to a coarse valence (−2 … +2) via
`MOOD_VALENCE`. HIGH = max valence, LOW = min valence in the window
(ties → most recent). If HIGH and LOW share a valence the line is
**flat** and no peaks are reported — the system does not invent drama.
Unknown moods score 0 but still count toward TOP MOODS.

### 3.5 Response contract

```ts
{ story: string; scope: 'day'|'week'|'month'|'year'; source: 'ai'|'compression'; logId: string|null }
```

`scope` and `source` are additive; older clients ignore them.

---

## 4. DOCTRINE

1. **One registry.** Every trigger with a slash keyword MUST have one
   row in `LOG_COMMANDS`. `unregisteredTriggers()` returns violations;
   the self-test fails on any. (This is how `/sil` was found unlisted
   and unhandled.)
2. **Passive first.** Commands never fire on the server without the
   operator typing them. No auto-stories.
3. **Never empty.** Any AI-backed command has a deterministic fallback
   grounded in the operator's own record.
4. **Never invent.** The story prompt receives the digest only; the
   fallback states counts and named peaks only.
5. **No PII in logs.** The `/story` server log line now records user
   id + counts, not the email address.

---

## 5. ARCADE — GAMIFIED EVOLUTION, SELF-CARE FIRST

`/arcade` shows rank derived **only** from earned badges. No streak
punishment, no lives, no loss state. Care is the only score.

| STAGE | RANK         | BADGES ≥ |
|-------|--------------|----------|
| 1     | INSERT COIN  | 0        |
| 2     | PLAYER ONE   | 1        |
| 3     | CONTINUE     | 5        |
| 4     | LEVEL UP     | 15       |
| 5     | COMBO        | 40       |
| 6     | HIGH SCORE   | 100      |
| 7     | BONUS STAGE  | 250      |
| 8     | FINAL BOSS   | 500      |
| 9     | GAME CLEAR   | 800      |

Card output:

```
RANK            LEVEL UP
STAGE           4 / 9
BADGES          20 / 812
PROGRESS        ████░░░░░░░░░░░░
NEXT            COMBO IN 20 BADGES
RULE            NO LOSS STATE — CARE IS THE ONLY SCORE
```

`/arcade` reads badges via `getEarnedBadges()` (read-only). It does
**not** call `getNextBadgeUnlock()`, which dequeues the unlock queue.

---

## 6. FILE MAP

| FILE | ROLE |
|------|------|
| `src/client/utils/logTriggers.ts` | Trigger detection · `LOG_COMMANDS` registry · `formatSystemHelp` · Arcade tiers |
| `src/shared/utils/storyCompression.ts` | Scope parsing · window · `compressLogs` · prompt block · fallback story (pure, shared) |
| `src/client/components/Logs.tsx` | NoteEditor wiring: settle timer, `/arcade` block, `/sil`, scoped story label |
| `src/client/queries.ts` | `useStoryGeneration` contract (+`scope`, `source`) |
| `src/server/routes/api.ts` | `POST /api/story` — windowed query, digest, vendor call, fallback |
| `scripts/tests/test-log-commands.ts` | Self-test (13 checks) |

---

## 7. VERIFICATION

```
npx tsx scripts/tests/test-log-commands.ts     → 13 / 13 PASS
npx tsc --noEmit -p tsconfig.server.json       → 0 errors
npx tsc --noEmit -p tsconfig.json              → 104 errors (= pre-existing baseline, 0 new)
yarn client:js:build                           → completed
yarn server:build                              → completed; #shared/utils/storyCompression resolves at runtime
```

---

## 8. NEXT OPERATIONS (NOT EXECUTED)

| ID   | ITEM |
|------|------|
| N-01 | Scheduled weekly `/story week` compression delivered as the Monday morning question (machine asks first) |
| N-02 | Spike detection: when a day's valence deviates ≥2 from the 30-day mean, queue a follow-up on that entry |
| N-03 | Story-of-stories: year compression built from stored monthly `generated_story` digests instead of raw logs |
| N-04 | Server-side Arcade rank so it follows the operator across devices (LOT® computer device) |
| N-05 | Command autocomplete: show `LOG_COMMANDS` matches while typing `/` |
