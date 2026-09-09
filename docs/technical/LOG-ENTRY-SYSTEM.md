<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Computer — Log Entry System

> The Log (Journal) is the passive-input core of LOT® AI: a place the user types
> into without prompts or questions, that quietly accumulates context-tagged
> data the rest of the system reads from. This document is the reference for
> how it works today, current as of `LOT-SR-20260909-01`.

---

## 1. Design intent

LOT® AI is a context-based, narrative and self-care system. Every widget on the
site — weather, time, humidity, sky, location, astrology — participates in
building a personalized narrative for the user, click by click. The Log is
where that narrative gets a voice:

1. **Environment context capture.** Any click anywhere in the app can record a
   context snapshot (weather, time, astrology, location) without a photo or
   sound recording — see `system_snapshot` log events.
2. **Passive Journal UI.** The user just types. No prompts, no questions. Each
   entry is stamped with context metadata at write time (`log.context`). The
   machine can follow up later if it detects a spike or a pattern change — this
   is the Quantum Intent Engine's job (§5).
3. **Compression.** The LOT® AI periodically compresses the accumulated log
   history into a story — a prompt/story/compression of the person — to
   further understand them and surface intimate high and low peaks. This is
   the `/story` command (§4) plus the Sunday Self-Assembly weekly story job
   (`docs/benchmark/LOT-MANIFEST.md` §06).

Pipeline, as implemented:

```
LOT User data (Log entries, clicks, context)
  → LOT Quantum Intent Engine   (src/client/stores/intentionEngine.ts,
                                  src/server/utils/patterns.ts)
  → AI vendor processor          (Together AI — src/server/utils/ai-engines.ts,
                                  TogetherAIEngine, api.together.xyz/v1)
  → LOT personalized data stored (Log rows with event-typed metadata,
                                  user.metadata cache fields)
```

Every AI-backed command below calls `aiEngineManager.getEngine('together')`
explicitly (not `'auto'`) — Together AI is the vendor of record for Log
commands; the manager's fallback order (`ollama → together → gemini → mistral
→ claude → openai`) exists for engine outages, not routine load-balancing.

---

## 2. Where the code lives

| Concern                        | File                                             |
|---------------------------------|---------------------------------------------------|
| Log list, primary editor, event-type rendering | `src/client/components/Logs.tsx` (`Logs`, `NoteEditor`, `LogContainer`) |
| Slash-command / emoji trigger detection (pure) | `src/client/utils/logTriggers.ts` |
| Behavioral easter eggs on journal text          | `src/client/utils/easter-eggs.ts` |
| Client data hooks (`useLogs`, `useUpdateLog`, `useStoryGeneration`, …) | `src/client/queries.ts` |
| Log persistence, context snapshotting | `src/server/models/log.ts`, `src/server/utils/log.ts`, `src/server/utils/logs.ts` |
| Command endpoints (`/story`, `/prayer`, `/qi`, `/assembly`) | `src/server/routes/api.ts` |
| Quantum Intent Engine (client-side signal recording + pattern recognition) | `src/client/stores/intentionEngine.ts` |
| Server-side pattern analysis, cohort matching | `src/server/utils/patterns.ts` |
| AI vendor abstraction | `src/server/utils/ai-engines.ts` |

The primary (most recent) Log entry is an always-open `NoteEditor` at the top
of the Logs view; everything below it is read-only past entries, rendered by
event type (30+ event types as of this writing — `quantum_intent_signal`,
`energy_state`, `qos_state`, `self_assembly`, `settings_change`, etc.). Typing
a new primary entry autosaves after a 7s debounce, feeds a journal-depth signal
into the Quantum Intent Engine (`recordJournalSignal`), and — once saved —
waits 7s more before pushing the entry down into history and opening a fresh
primary editor.

---

## 3. Command surface

Commands are plain text typed into the Log — an emoji or a `/keyword` — not a
separate command bar. Detection is pure and testable
(`detectTriggers` / `detectNewTriggers` in `logTriggers.ts`): keywords match as
a whole `/word` token (word-boundary regex, so `/scandalous` does not fire
`/scan`), emojis match by substring. `detectNewTriggers` diffs against the
previous keystroke so editing *around* an existing trigger never re-fires it.

Typing `/system` prints this table in-app (`system-help` trigger); it is kept
in sync with the table below by hand — if you add a command, update both.

| Command | Emoji alt | Effect |
|---|---|---|
| `/prayer` | 🕯️ | Contextual scripture from the AI engine, appended to the entry |
| `/story` | 📖 | Compressed narrative from **recent** data (last ~200 logs, no date bound) |
| `/story day\|week\|month\|year` | — | Compressed narrative for that **calendar period**, with high/low peaks (§4) |
| `/scan` | — | Local system status overview (assembly %, badges, QIE pattern count) |
| `/qi <query>` | — | Ask the Quantum Intelligence engine a free-text question |
| `/assembly` | — | Self-assembly module status directive from the AI engine |
| `/phys` | — | Physiological cohort report (archetype, ATP, clarity, alignment) |
| `/qos` | — | Quantum OS state analysis (`analyzeIntentions()`) |
| `/fast` | — | Orthodox fasting calendar state for today |
| `/breathe` | — | Toggles a 4-2-6 breathing exercise overlay |
| `/freeze` | 🧊 | Pause-and-reflect protocol snapshot |
| `/silent` | — | Signal-silence check (hours since last recorded signal) |
| `/synth` | 🎹 | Toggles the Soviet-keyboard synth click sound |
| `/radio` | 🎧 | Toggles the ambient radio |
| `/night` | 🌙 | Forces dark theme |
| `/how` | — | Navigates to the System tab (LOT AI check-in) |
| `/system` | — | This help screen |
| — | ❗ / ‼️ | `cohort-support` — heavy exclamation triggers a distinct signal from `!` |

Shortcut: `Ctrl+Enter` / `Cmd+Enter` saves the current entry immediately
instead of waiting for the debounce.

Known gap: commands only resolve on submit (i.e., once the full `/word` token
is typed) — there is no live autocomplete dropdown while typing `/`. `/system`
is effectively that dropdown today; a true inline autocomplete is future work,
not yet built.

---

## 4. `/story` — compression, day/week/month/year (this session)

Before `LOT-SR-20260909-01`, `/story` only ever looked at an unbounded
"recent" window (last 200 logs, no date filter) — it could not answer "what
was my week." This session added period-scoped compression, directly toward
the spec: *"creates a compressed story of your day/week/month/year ... surface
more intimate high and low peaks."*

**Client** (`Logs.tsx`, `story-mode` trigger): parses an optional period out of
the triggering text — `/story week`, `/story month`, `/story year`, or
`/story day` / `/story today` (normalized to `day`). No period → unchanged
"recent" behavior. The requested period is stashed in a ref so the async
response can be labeled (`📖 [WEEK] ...`) once it returns.

**Server** (`POST /api/story`, `src/server/routes/api.ts`):

1. Validates `period` against `['day','week','month','year']`; anything else
   is treated as unbounded (back-compatible with old clients).
2. Computes `since = dayjs().tz(user.timeZone || 'UTC').startOf(period)` and
   queries Log rows with `createdAt >= since` (unbounded query keeps the old
   `limit: 200`; a bounded period raises the limit to 2000 since a year of
   BIO/QIE signals is large).
3. **Peaks** — the only numeric, comparable signal captured per log is energy
   `level` (0-100, on `energy_state` / `energy_update` / `energy_check` /
   `energy_checkin` events), so it anchors the "high and low" compression: the
   max and min `level` in the window, each with its timestamp.
4. **Compression line** — active day count, journal word count, self-care act
   count, and total signal count for the window, fed to the prompt as
   `COMPRESSION WINDOW: THIS WEEK — 4 active days, 812 journal words, 6
   self-care acts, 143 total signals`.
5. The system prompt is period-aware: it asks the model to compress the whole
   period (not just react to "recent" text) and, when a PEAKS block is
   present, to name the specific high and low moments as the narrative's
   emotional spine.
6. The generated story is persisted as a `generated_story` Log with
   `metadata.period` set, so period-story generation is itself an event the
   Quantum Intent Engine and future badge logic can read.

This is an honest, scoped increment — it does not claim new "philosophy," just
a wider, correctly-bounded read of the same data plus one comparable numeric
signal (energy level) for peak detection. Mood (`emotional_checkin`) is
qualitative text, not a magnitude, so it is passed to the model as color
(`RECENT MOODS: ...`) rather than used to compute a peak.

---

## 5. Follow-up detection (Quantum Intent Engine)

The Log is the primary sensor for the Quantum Intent Engine (QIE):
`recordJournalSignal` (primary entry) and `recordLogSignal` (past entries)
feed word-count and context-presence into `src/client/stores/intentionEngine.ts`
on every autosave. Server-side, `src/server/utils/patterns.ts` and
`scheduled-jobs.ts` scan accumulated signals for spikes and pattern changes —
these surface back into the Log as `quantum_intent_signal`,
`physiological_cohort`, and dozens of named pattern-peak events (see the
`log.event === '...'` branches in `Logs.tsx` — `focus_depth_arc`,
`morning_intention_lock`, `evening_reflection_loop`, etc.). The QIE currently
implements 65+ patterns across 19+ physiological archetypes
(`docs/benchmark/LOT-MANIFEST.md` §05). This is the "machine asks first"
mechanic from the spec, expressed as passive log entries rather than a modal
prompt — the modal/morning-question channel (System tab check-in, Job 24
weekly story) is the other half, unchanged by this session.

---

## 6. Arcade — gamified evolution

LOT is a self-care company, not a game studio, but the badge/RPG layer
(`src/client/utils/badges.ts`, `src/server/utils/rpg-narrative.ts`) is how
consistent Log/Journal use turns into a legible sense of progress without
turning self-care into a chore list. As of this session:

- **635+ badge definitions** (`BADGES` in `badges.ts` — count is a `grep`
  over object keys, marked `ESTIMATE`; two duplicate keys, `quarter_drop` and
  `elixir_found`, exist pre-this-session and surface as esbuild warnings —
  noted here, not fixed, since de-duplicating badge IDs is a content decision
  for whoever owns the Codex, not a build-correctness bug).
- Organized into versioned "Word Turn" engines, RPG "Achievement" story arcs,
  and character classes (Caster, Navigator, Mission Commander, Oracle
  Commander, Alchemist, Quantum, Broadcast, Bio, Reader's Guild, Arcade Class
  — see the `// ── Achievement RPG vN — X Class ──` section headers in
  `badges.ts`).
  Rarity tiers run COMMON → UNCOMMON → LEGENDARY.
- `rpg-narrative.ts` turns earned badges + level into a `StoryArc` — a
  levelled narrative layer distinct from, but complementary to, the `/story`
  command's data-driven narrative.
- Every command in §3, and ordinary journaling itself, is a candidate trigger
  for badge unlocks via `runJournalEasterEggs` and the signal recorders in
  §5 — the Arcade layer reads the same event stream the compression story
  reads, it just scores it differently.

No new badges were minted this session — Arcade work here is documentation
(this section) plus the honest note that period-scoped `/story` calls are now
a distinguishable event (`metadata.period`) a future badge could key off
(e.g. "used all four `/story` periods in one week"). That badge does not
exist yet; do not claim it does.

---

## 7. Honest boundaries

- Live `/` autocomplete does not exist (§3). `/system` is the workaround.
- `/story`'s peak detection uses energy `level` only, because it is the only
  numeric per-entry signal on record. Mood, clarity, and alignment are
  qualitative and are passed as narrative color, not peaks.
- The Sunday weekly story (Job 24) and the System-tab morning check-in are the
  "machine asks first" half of the spec; they were not touched this session —
  see `docs/benchmark/LOT-MANIFEST.md` §06 for their current definition.
- Badge count above is `ESTIMATE` (regex count over source, not a runtime
  assertion) — this is disclosed, not asserted as verified.
