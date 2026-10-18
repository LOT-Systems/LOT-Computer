# LOT® Log Commands & Story Compression

**Classification:** ENGINEERING · **Status:** IMPLEMENTED (Arcade tuning PROVISIONAL)
**Owner:** S-2 // Vadik Marmeladov · **Report:** `docs/benchmark/LOT-SR-20261018-01.md`

## 1. Purpose

The Log is a passive journal: the user writes, without prompts or questions. Every entry is stored with context metadata (city, temperature, weather, moon phase, zodiac, local time). Slash commands are the only *active* surface in the Log:

| Command | Behaviour |
|---|---|
| `/system` | Lists every available command (generated from the registry; cannot drift). |
| `/story [day\|week\|month\|year]` | Compressed story of the journal for that window. Default `week`. |

All other commands (`/scan`, `/qi`, `/prayer`, ...) are unchanged; see `/system`.

## 2. Data flow

```
LOT User data (logs: note, emotional_checkin, self_care_*)
   │
   ▼  src/server/utils/story-compression.ts   (pure, no I/O)
DIGEST  window filter → strip machine text → moods → peaks → pattern change → context-tagged samples
   │
   ▼  POST /api/story   (Usership-gated, rate-limited 5/min)
QUANTUM INTENT ENGINE state (energy / clarity / alignment, user index) — passed from client
   │
   ▼  aiEngineManager.getEngine('together')
AI VENDOR (Together AI) → 2-paragraph second-person story
   │
   ▼  Log row, event = 'generated_story', metadata = { period, digestStats, arcade }
LOT personalized data stored
```

If the vendor fails, `fallbackStory()` returns a deterministic sentence built only from counted facts. If the window has zero entries, the AI is **not called**.

## 3. Files

| Path | Role |
|---|---|
| `src/shared/utils/log-commands.ts` | Command registry, `/system` text, `parseStoryPeriod()` |
| `src/client/utils/logTriggers.ts` | Trigger detection (unchanged; test asserts every registry command has a trigger) |
| `src/server/utils/story-compression.ts` | `buildDigest`, `digestToPrompt`, `fallbackStory`, `stripGenerated`, `computeArcade` |
| `src/server/routes/api.ts` (`POST /story`) | Route, prompt, persistence |
| `src/client/components/Logs.tsx` | Sends `period`; renders story + Arcade line |
| `scripts/tests/test-log-commands-story.ts` | 8 assertions (`npx tsx scripts/tests/test-log-commands-story.ts`) |

## 4. Defects fixed

`/story` previously queried `event === 'log_entry' || 'journal'`. Journal entries are stored as `event = 'note'`. The story therefore never saw what the user actually wrote. It now reads `note`.

A second defect closed: stories are appended to the note as `📖 ...` (and scripture as `🕯️ ...`). Left in place they would be fed back into the next story. `stripGenerated()` removes those blocks and bare `/command` lines before digesting.

## 5. Digest rules (deterministic, countable)

- **Window:** day 1 · week 7 · month 30 · year 365 days back from now.
- **Peak:** a note longer than `max(2 × median length, 200 chars)`, or a day with ≥3 notes and >3× median daily count.
- **Pattern change** (windows ≥ 7 days, ≥ 4 notes): entry count of 2nd half vs 1st half is ≤ ½ ("slowed") or ≥ 2× ("picked up").
- **Sampling:** evenly sampled newest-first, budget day 12 / week 14 / month 18 / year 24 entries, 220 chars each.
- **Context tag per entry:** `date, city, °C, weather, moon phase` (only fields present).

The model is instructed to use only the supplied facts; no invented events or numbers.

## 6. Arcade (gamified evolution) — PROVISIONAL

`computeArcade(logs)`: XP = 10 per journal entry + 5 per active day + 3 per self-care action + 2 per mood check-in. Level starts at 1 and advances while `xp ≥ 25·(level+1)·level` (L2 at 50, L3 at 150, L4 at 300). Rank by level band: 1–3 SIGNAL, 4–6 PILOT, 7–9 OPERATOR, 10–12 NAVIGATOR, 13+ ARCHITECT.

Design intent: XP rewards **showing up**, never positivity or volume of feeling. Shown under every story as `ARCADE  LVL n RANK  xp/next XP`. Weights are untested guesses; tune after real data.

## 7. Known limits / next steps

1. **Proactive loop not built here.** "The machine asks first" (morning question, spike follow-up) needs a scheduler; `digest.peaks` and `digest.patternChange` are the intended triggers.
2. Story is generated on demand; no caching per (user, period, day). Rate limit protects cost.
3. Year window reads at most 2000 recent rows; heavy users get a truncated year.
4. Quantum Intent Engine state is client-supplied (unauthenticated numbers inside an authenticated request); it only colours tone, never facts.
5. Arcade XP is recomputed from rows, not stored; unify with badge system when tuned.

## 8. Verification

`npx tsx scripts/tests/test-log-commands-story.ts` → 8 passed · `tsc -p tsconfig.server.json` clean · `npm run build` OK · client `tsc` has 104 pre-existing errors, unchanged by this work.
