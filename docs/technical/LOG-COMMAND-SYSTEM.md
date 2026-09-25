<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOG COMMAND SYSTEM — Operator Reference

**CLASS:** RESTRICTED // S-2 EYES
**Author:** Vadik Marmeladov, CEO & Founder, LOT Systems
**Copyright:** © 2025-2026 LOT Systems. All rights reserved.
**Scope:** The Log (Journal) entry system — passive capture, slash commands,
context snapshots, the compression loop, and the Arcade (gamified) layer
that runs underneath it.

---

## 1. DOCTRINE — WHY THE LOG HAS NO PROMPTS

The Log is a passive AI UI. The user types. Nothing asks a question first.
The system observes and, only when a spike or pattern-change condition is
met, follows up — the machine initiates, not the interface. This is the
inversion that distinguishes LOT from a chatbot: **the input surface is
silent; the intelligence is in what happens after the keystroke.**

Every keystroke is potentially two things at once:

1. **A journal entry** — free text, no schema, no required fields.
2. **A command** — a `/keyword` or emoji embedded in that same text box,
   detected without leaving the writing flow (see §3).

Both paths write to the same `Log` row and receive the same environmental
context snapshot (see §4). There is no separate "command console" — the
operator never leaves the sentence they were writing.

---

## 2. DATA FLOW

```
 LOT User data                LOT Quantum Intent Engine         AI vendor processor         LOT personalized data
 (Log text, mood,      ─▶     (client: intentionEngine.ts —  ─▶  (Together AI via     ─▶    stored (Log row +
  self-care, planner,          151+ patterns, 50+ archetypes,    aiEngineManager,             intentionEngine
  calendar, badges,            signal sources, 7-day/1000-       server/utils/ai-             signals + user-index,
  weather/astro context)       signal working set, cooldown)     engines.ts)                  localStorage +
                                                                                                 server sync)
```

Concretely, for every AI-backed slash command (`/story`, `/prayer`, `/qi`,
`/assembly`):

1. **Capture** — `Logs.tsx` detects the trigger in the text box
   (`detectNewTriggers`, `logTriggers.ts`) and strips the command token from
   the log text before it is persisted.
2. **Intent state** — the client reads `getUserState()` / `getUserIndex()`
   from the Quantum Intent Engine (`src/client/stores/intentionEngine.ts`) —
   the compressed, already-analyzed picture of the user (mood trajectory,
   signal sources active, recognized patterns, archetype) — and attaches it
   to the request. The AI vendor never sees raw historical logs beyond what
   the specific route pulls server-side; it sees the QIE's compression of
   them plus a bounded recent-log excerpt.
3. **Server route** (`src/server/routes/api.ts`) pulls the relevant recent
   `Log` rows (e.g. `/story` reads the last 200, extracting the last 10
   journal excerpts, 10 mood check-ins, 10 self-care notes), builds a system
   prompt, and calls `aiEngineManager.getEngine('together').generateCompletion()`
   (`src/server/utils/ai-engines.ts`) — Together AI is the primary/default
   vendor; the manager can fail over to Claude, OpenAI, Gemini, Mistral or a
   local Ollama engine without changing call sites.
4. **Persist** — the AI response is written back as a new `Log` row
   (`event: 'generated_story'`, `'scripture_reading'`, `'assembly_directive'`,
   `'qi_rfi'`, etc.) stamped with `getLogContext(user)` — the same
   weather/time/astrology snapshot every ordinary entry gets
   (`src/server/utils/logs.ts`, §4 below) — so a generated story is itself a
   moment with a context, not a stateless API response.
5. **Loop closes** — the new row flows back into the QIE on next read
   (`recordLogSignal`, `recordJournalSignal`), so a `/story` compression can
   itself become a signal the engine reasons about later. This is the
   "compress the loop" behavior described in the product brief: Log → QIE →
   vendor → Log → QIE, converging rather than diverging.

**LOT owns the compression logic, not the vendor.** Together AI (or
whichever engine `aiEngineManager` is configured to use) performs the raw
language completion; the prompt construction, the QIE state that seeds it,
and the persistence/re-ingestion loop are LOT-owned code
(`docs/technical/AI-ENGINE-GUIDE.md` documents the provider-agnostic
engine layer in full).

---

## 3. SLASH COMMANDS — SINGLE SOURCE OF TRUTH

Detection is a pure function, deliberately store-free and DOM-free so it can
be reasoned about (and tested) in isolation:

- `src/client/utils/logTriggers.ts` — `RULES: TriggerRule[]` is now the
  **single source of truth** for every command: its trigger id, its
  emoji/keyword aliases, and its one-line help text. `detectTriggers()` /
  `detectNewTriggers()` scan log text for a whole-token `/keyword` match
  (so `/scandalous` does not fire `/scan`) or a literal emoji.
- `getCommandHelpLines()` renders the `/system` help screen directly from
  `RULES` — a command added to the registry with `help` set appears in
  `/system` automatically. Nothing is hand-maintained in a second location
  anymore.
- Wiring (what each trigger actually *does*) lives in
  `src/client/components/Logs.tsx`, in the trigger-effect dispatcher
  (search `detectNewTriggers(value` in that file).

### Current registry (as of this document)

| Command | Type | What it does |
|---|---|---|
| `/prayer` 🕯️ | AI (Together) | Contextual scripture selection — reads log text + QIE weakest dimension. |
| `/story` 📖 | AI (Together) | **Compressed personal narrative** — see §5. |
| `/scan` | client | System status overview — modules, badges, QIE pattern count, connection. |
| `/qi <query>` | AI (Together) | Quantum Intelligence RFI — free-form question against QIE + signal record. |
| `/assembly` | AI (Together) | Self-assembly module status + long-term directive. |
| `/phys` | client | Physiological cohort report — archetype, ATP, clarity, alignment. |
| `/qos` | client | Forces an immediate `analyzeIntentions()` pass. |
| `/fast` | client | Orthodox fasting calendar state for today. |
| `/breathe` | client | Toggles the 4-2-6 breathing exercise overlay. |
| `/freeze` 🧊 | client | "Pause and reflect" protocol readout. |
| `/silent` | client | Signal-silence readout (hours since last signal). |
| `/sil` | client | Signal-silence *pattern* check (P.51). |
| `/synth` 🎹 | client | Toggles the Soviet-keyboard click sound. |
| `/radio` 🎧 | client | Toggles the ambient radio stream. |
| `/night` 🌙 | client | Forces dark theme. |
| `/how` | navigation | Jumps to the System tab (LOT AI check-in). |
| `/system` | client | **This list, generated live from the registry.** See §3. |
| `!` / `‼️` (no `/`) | automatic | Punctuation-engine urgency detection — not a typed command. |

Adding command #19 is now a two-step change, not three: (1) add one row to
`RULES` in `logTriggers.ts` with real `help` text, (2) add the `else if`
branch in `Logs.tsx` that does the work. `/system` and the in-app Field
Manual (`About.tsx` → "Log Triggers") stay in sync automatically for step
(1); the Field Manual's longer prose description for a new command is still
a manual addition, since `/system`'s one-liner is intentionally terse.

---

## 4. ENVIRONMENTAL CONTEXT SNAPSHOT

Every click that produces a `Log` row — a journal entry, a command result,
a badge unlock — is stamped with a snapshot of the moment, **without a
photo or sound recording.** `getLogContext(user)`
(`src/server/utils/logs.ts`) computes:

- **Time** — the user's local wall-clock time from their stored time zone.
- **Weather** — cached temperature (Kelvin), humidity, and description for
  the user's city/country (refreshed on a staleness window).
- **Astrology** — Rokuyo, moon phase + illumination, hourly zodiac, Western
  zodiac (`src/shared/utils/astrology.ts`) — structural time context, not
  horoscope predictions (see `About.tsx` → "Astrology Widget").

This is the literal implementation of "any click by the user creates a
record/snapshot of the moment" — the context is attached server-side at
write time, not reconstructed later, so it is exact to the second the row
was created.

---

## 5. THE COMPRESSED STORY (`/story`)

`/story` is the mechanism for "the machine creates a compressed story of
your day/week/month/year and sends it back as a prompt/story/compression."

- Route: `POST /api/story` (`src/server/routes/api.ts`), usership-gated.
- Reads the last 200 `Log` rows for the user; extracts up to 10 recent
  journal/log-entry excerpts, 10 mood check-ins, and 10 self-care /
  memory-answer / energy-check-in notes.
- Builds a system prompt constraining the output to 1-2 paragraphs
  (100-200 words), second person, required to reference actual data points
  from the pulled logs, tone matched to the user's recent energy, closing
  on one forward-looking sentence.
- `aiEngineManager.getEngine('together').generateCompletion(prompt, 512)`.
- Persists the result as `event: 'generated_story'` with a full
  `getLogContext()` snapshot, and appends it back into the Log editor with
  a 📖 prefix.

This is a *daily/weekly-scale* compression triggered on demand today. The
same route and prompt-construction pattern is the extension point for a
scheduled (morning-question / device-initiated) weekly, monthly, or yearly
compression pass — the "asks first, either through the question in the
morning on any of the devices... or through widgets" behavior described in
the product brief is architecturally the same `/story` pipeline fired by a
cron/QIE trigger instead of a typed command.

---

## 6. ARCADE — THE GAMIFIED EVOLUTION LAYER

LOT Systems is a self-care company; the Arcade is its game layer, not a
separate product. There is no file or folder literally named "Arcade" —
the badge/achievement system (`src/client/utils/badges.ts`, 8,000+ lines,
812+ badges as of Codex v32) *is* the Arcade, and it is wired directly into
the same Log input the user already writes in:

- **Trigger point** — every debounced save of the primary journal entry
  runs `runJournalEasterEggs(text)` (`src/client/utils/easter-eggs.ts`),
  scanning the just-typed text and session state for badge-unlock
  conditions: word-turn keywords ("ritual", "breathe", "grateful", "LOT",
  "COSMO"...), time-of-day easter eggs (`night_owl`, `mirror_hour`,
  `pi_hour`...), calendar easter eggs (solstice, `lot_birthday`,
  `palindrome_day`...), streaks, and behavioral milestones.
  Command usage counts too — the slash commands in §3 are themselves
  signal sources the badge/pattern layer watches.
- **Dual metaphor** — every badge has a "water" (∘ → ≈ → ≋, organic growth)
  and "architecture" (├─ → ╞═╡ → ║·║, structural growth) rendering; the
  user picks the metaphor that fits how they want their own progress to
  read (`getBadgeTheme`/`setBadgeTheme`).
  Category coverage now spans "Sci-Fi Arcade" mastery tiers (`quantum_leap`,
  `speedrun`, "Hero's Journey" tiers) alongside the original milestone/
  easter-egg categories — the game surface has grown a genre, not just a
  badge count.
- **Persistence + loop-in** — a badge unlock is itself a `Log` row
  (`event: 'badge_unlock'`), rendered in the tactical log feed
  (`BADGE:` event code, see `About.tsx` → "Military Log Event Codes"), and
  fed back into the QIE via `recordBadgeSignal(badge, category)` — so
  earning a badge is a signal the pattern engine can build later patterns
  on top of, exactly like a journal entry or a mood check-in.
- **Read surface** — `BadgeUnlockFeed.tsx` shows recent unlocks; the full
  catalog is exported to PDF codices for human reading
  (`docs/badges/pdf/*.pdf`), regenerated by
  `scripts/generate-badge-codex-pdf.cjs`.

The Arcade is therefore not a detour from the self-care mission — it is
the same Log → QIE → compression loop wearing a game-feel skin, so that
"click by click, creating a context" has a legible reward surface without
turning the core journal into a game *interface*. The journal stays silent
and promptless (§1); the game runs underneath it.

---

## 7. REFERENCES

- `src/client/utils/logTriggers.ts` — command registry + detection (source
  of truth for §3).
- `src/client/components/Logs.tsx` — Log editor, trigger dispatch, context
  rendering.
- `src/client/stores/intentionEngine.ts` — Quantum Intent Engine (client).
- `src/server/utils/ai-engines.ts` — provider-agnostic AI engine manager
  (Together AI primary).
- `src/server/utils/logs.ts` — `getLogContext()`, the environmental
  snapshot builder.
- `src/client/utils/badges.ts`, `src/client/utils/easter-eggs.ts` — Arcade
  layer.
- `docs/technical/AI-ENGINE-GUIDE.md` — full AI provider configuration.
- `docs/technical/QUANTUM-INTENT-ENGINE-WHITE-PAPER.md`,
  `docs/technical/MEMORY-AND-QUANTUM-INTENT-ENGINES.md` — QIE architecture.
- `src/client/components/About.tsx` (in-app Field Manual) — "Log Triggers"
  and "Military Log Event Codes" sections, kept in prose sync with this
  document.

---

**AUTHORIZED BY:** S-2 // VADIK MARMELADOV
