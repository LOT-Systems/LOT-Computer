================================================================================
LOT SYSTEMS / TECHNICAL WHITE PAPER
DOCUMENT: LOT-LOG-SYSTEM-WHITE-PAPER
TITLE:    THE LOG — PASSIVE JOURNAL, COMMAND TERMINAL, COMPRESSION ENGINE
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-26
STATUS:   LIVE — describes shipped behavior on master unless marked PLANNED
================================================================================

--------------------------------------------------------------------------------
00 // PURPOSE
--------------------------------------------------------------------------------

This document is the single reference for the LOT® AI Log (the "Log Tab" /
Journal). It describes what the Log is, why it is built the way it is, the
full command surface (`/system`, `/story`, and every other slash trigger),
the environment-context snapshot mechanism, and the compression pipeline that
turns raw entries into a personalized narrative:

  LOT User Data -> LOT Quantum Intent Engine (QIE) -> AI Vendor Processor
  (Together AI, with automatic fallback) -> LOT Personalized Data (stored)

It also documents where the Arcade (gamified) evolution layer sits inside a
self-care product without turning the product into a game.

Source of truth for the code described here:
  src/client/components/Logs.tsx           — Log UI, editor, command dispatch
  src/client/utils/logTriggers.ts          — pure slash-command / emoji detector
  src/client/stores/intentionEngine.ts     — QIE: signal capture + pattern recognition
  src/client/stores/selfAssembly.ts        — Self-Assembly module/phase engine
  src/client/utils/badges.ts               — Arcade layer: badge/achievement catalog
  src/server/utils/memory/story-generator.ts — Memory Engine story composition
  src/server/routes/api.ts                 — /api/logs, /api/story, /api/qi, /api/prayer, /api/assembly
  src/server/utils/ai-engines.ts           — AI vendor abstraction + fallback chain

--------------------------------------------------------------------------------
01 // WHAT THE LOG IS — AND IS NOT
--------------------------------------------------------------------------------

The Log is a passive AI UI. It does not interview the operator. There is no
question box, no required field, no "how are you feeling" modal blocking the
input. The operator opens the Log tab and sees one thing: a text box, focused,
cursor ready. They write, or they don't.

This is a deliberate inversion of the typical "AI journaling app" pattern,
where the product prompts and the user answers. LOT inverts it:

  - The OPERATOR writes freely, in their own words, on their own schedule.
  - The SYSTEM watches passively — every entry is stamped with environment
    context (time, weather, location, astrology) at the moment of creation.
  - The SYSTEM follows up later, elsewhere (Memory Engine questions on the
    System tab, /story on demand, the Sunday weekly story job) — never by
    interrupting the act of writing itself.

COCKPIT-RULE (LOT-DOCTRINE, minted SR-20260611-02) governs how any system-
generated content is displayed once it lands in the Log: the event body is
instrument readings — codes, metrics, tabular key-value pairs. The Block
label (e.g. `BIO:`, `QIE:`, `STORY [WEEK]:`) names the event. Prose narration
belongs in AI-generated bodies (stories, prayers, directives), never in
System-derived instrument readouts. This keeps the passive/military aesthetic
intact even as more system-generated event types accumulate — the Log has
carried 80+ distinct event-type renderers to date and every one obeys this
rule.

--------------------------------------------------------------------------------
02 // ENVIRONMENT CONTEXT — THE SNAPSHOT
--------------------------------------------------------------------------------

Every log entry — and, more generally, every recorded click across the
System — carries a context snapshot, not just its text:

  city, country, temperature, humidity, timeZone,
  astroRokuyo, astroMoonPhase  (astrology reading for the day)

This context is attached server-side at write time (`getLogContext(user)` in
src/server/logs.ts) and rendered back whenever a log is displayed — hover on
a past entry (desktop) reveals the weather/location line without leaving the
Block. The `system_snapshot` event type (label `SYS:`) exists specifically to
record a bare environment snapshot with no accompanying text: a "moment
without a photo or a sound record," in S-2's framing — proof the operator
was here, in this weather, at this time, without capturing any media.

The astrology fields (`astroRokuyo`, the Japanese six-day calendar; and lunar
phase) are folded into the same context object as weather and geography —
astrology is treated as environmental data on the same footing as humidity,
not as a separate mystical subsystem. This is intentional: the system's job
is to compress "what surrounded you when you wrote this," and the operator's
own belief systems (weather sensitivity, lunar tracking, calendar systems —
see also `/fast`, the Orthodox fasting calendar) are context, not opinion.

--------------------------------------------------------------------------------
03 // THE COMMAND SURFACE
--------------------------------------------------------------------------------

Slash commands are secret codes the operator can type directly into a log
entry. Detection is pure and side-effect-free (`detectNewTriggers` in
logTriggers.ts) — a regex-token match, case-insensitive, word-bounded (so
`/scandalous` does not fire `/scan`). Emoji equivalents exist for several
commands (🎹 = `/synth`, 🕯️ = `/prayer`, 🧊 = `/freeze`, 🌙 = `/night`,
🎧 = `/radio`, 📖 = `/story`) — the operator can trigger the same behavior
without typing a word, which matters for the passive-UI framing: a single
glyph is a lower-friction gesture than a sentence.

/system — THIS HELP SCREEN
  Lists every live command with a one-line description, rendered as a
  `SYSTEM:` Block directly under the input. This is the self-documenting
  entry point: an operator who forgets the command surface never has to
  leave the Log to find it.

/story [day|week|month|year] — COMPRESSED NARRATIVE (see §04)
  The on-demand compression command. Bare `/story` (or the 📖 emoji)
  compresses the current day. `/story week`, `/story month`, `/story year`
  compress that window instead. This is the direct implementation of the
  requested "compressed story of your day/week/month/year" — see §04 for
  the full pipeline.

Full live roster (as surfaced by /system):
  /prayer          Generate contextual scripture
  /story           Compressed story of your day (default)
  /story week      Compressed story of your week
  /story month     Compressed story of your month
  /story year      Compressed story of your year
  /scan            System status overview (assembly %, badges, QIE patterns)
  /qi [query]      Ask the Quantum Intelligence engine (RFI -> INTSUM)
  /assembly        Self-assembly module status
  /phys            Physiological cohort report
  /qos             Quantum OS state analysis
  /fast            Orthodox fasting calendar
  /breathe         4-2-6 breathing exercise overlay
  /freeze          Pause-and-reflect protocol
  /silent          Signal silence check
  /synth           Toggle mechanical-keyboard sound
  /radio           Toggle background radio
  /night           Dark mode
  /how             Open the LOT AI check-in (System tab)

Every command follows the same wiring pattern end to end:
  1. logTriggers.ts detects the token as the operator types (pure function).
  2. Logs.tsx's onKeyDown effect matches on the fired trigger, calls the
     relevant local computation (QIE state, Self-Assembly state, badge
     count) or fires a mutation to a dedicated `/api/*` route.
  3. The response renders as a `Block` directly beneath the input, live,
     while the operator is still looking at what they just typed.
  4. AI-backed commands (`/prayer`, `/story`, `/qi`, `/assembly`) also
     persist a structured Log row server-side, so the exchange survives a
     reload and appears again in the scroll-back — provided its event type
     is present in the server's `displayableEvents` whitelist (see §06).

--------------------------------------------------------------------------------
04 // THE COMPRESSION PIPELINE (/story)
--------------------------------------------------------------------------------

Proposed logic, now implemented end to end for the on-demand path:

  LOT User Data -> LOT Quantum Intent Engine -> AI Vendor Processor
  (Together AI) -> LOT Personalized Data (stored)

STAGE 1 — LOT User Data
  POST /api/story reads the operator's own Log rows, windowed by period:

    PERIOD   WINDOW      SIGNAL CAP   TARGET LENGTH
    day      24h         100          100-200 words   (a single scene)
    week      7d         300          150-250 words   (one compressed arc)
    month    31d         600          250-350 words   (a named throughline)
    year    366d        1200          400-600 words   (a season-level retrospective)

  The window and signal cap scale together deliberately: a year of raw log
  text would overflow any prompt budget, so the AMOUNT of source material
  fed to the model grows sub-linearly against the window while the TARGET
  narrative length grows only modestly. Compression ratio increases with
  period length — that is the point of a "compressed story," not an
  incidental cost saving. Journal/log entries, mood check-ins, and
  self-care answers are extracted separately and each capped at the
  period's sample size before being handed to the prompt.

STAGE 2 — LOT Quantum Intent Engine (QIE)
  The client attaches the operator's live QIE state (`getUserState()`) and
  User Index (`getUserIndex()`) to the request — energy, clarity,
  alignment, and the 6-dimensional index with its trend. This is signal
  the QIE has already computed from the operator's behavior across every
  widget, not something the Story route recomputes. The system prompt
  frames the target period explicitly (`PERIOD_FRAME` in api.ts) so the
  model knows whether it is narrating "today" or "naming the shape of the
  year," not just given more text and left to guess the intended scope.

STAGE 3 — AI Vendor Processor (Together AI)
  `aiEngineManager.getEngine('together')` executes the compressed prompt.
  Together AI is the configured primary engine (`AI_ENGINE_PREFERENCE`);
  on failure the manager's fallback chain (ollama -> together -> gemini ->
  mistral -> claude -> openai) is walked automatically with no code change
  required to re-key. This vendor abstraction means "AI vendor processor"
  in the proposed pipeline is swappable infrastructure, not a hard
  dependency on any one provider.

STAGE 4 — LOT Personalized Data (stored)
  The generated narrative is written back as a `generated_story` Log row
  (event, not just returned to the client), carrying `period`,
  `signalCount`, and a truncated copy of the triggering entry in its
  metadata. It is also appended live into the operator's current entry
  text so the story survives a NoteEditor remount without a round trip.
  The persisted row renders on reload as a `STORY [PERIOD]:` Block —
  scroll-back, not just a one-time toast.

This is the on-demand half of the pipeline. The automated half — the
Sunday weekly `lot_ai_story` job (Job 24, 18:00 UTC, server-side, no
session required) — aggregates 7 days of logs per user, derives dominant
mood and week-tone, and writes the same shape of compressed output without
the operator asking. /story day|week|month|year is the operator pulling
the same mechanism on demand, at whatever granularity they want, rather
than waiting for Sunday. A monthly and yearly automated job is a natural
extension of Job 24's pattern (PLANNED — not yet scheduled) now that the
route itself is period-aware.

--------------------------------------------------------------------------------
05 // FOLLOW-UP — HOW THE MACHINE DETECTS SPIKES
--------------------------------------------------------------------------------

The Log itself never prompts. Follow-up happens through the QIE's pattern
library instead: 150+ named behavioral patterns (P1-P151 and counting)
each watch a rolling window of signal sources (journal, memory, planner,
intentions, selfcare, energy, mood, cohort, calendar, recipe...) for a
specific shape — a spike, a drought, a convergence, a sustained streak.
When a pattern fires, its handler writes a structured Log row (e.g. `MOM:`
for signal-momentum-lock, `SIGPEAK:` for signal-density-peak, `RECOV:` for
recovery-initiation) that surfaces in the Log stream exactly like a manual
entry, dated and context-stamped. The operator does not have to open a
report — the follow-up appears in the same feed they already read.
Separately, the Memory Engine's daily AI-generated question (System tab)
is where the system asks something proactively, tuned by the same signal
density; the Log stays purely passive on the input side. `PLANNER-CONTEXT`
(LOT-DOCTRINE) closes this loop further: text the operator wrote as a
stated daily intention is extracted and fed back into the Memory Engine's
prompt so its follow-up question is oriented on what the operator actually
said they were doing, not just inferred behavior.

--------------------------------------------------------------------------------
06 // BACKEND WHITELIST HYGIENE — A FIX SHIPPED WITH THIS DOCUMENT
--------------------------------------------------------------------------------

LOT-DOCTRINE's "Backend Whitelist Hygiene" clause (since SR-20260604-01)
states: a user-facing event type created via POST must appear in the GET
`displayableEvents` whitelist (src/server/routes/api.ts) or the write->read
loop is silently broken — the row is written, the operator sees it once in
the live response, and then it vanishes from every subsequent page load.

Auditing every AI-backed slash command against that whitelist while writing
this document surfaced exactly that bug on `generated_story` (the /story
event type): `qi_rfi`, `prayer_scripture`, and `assembly_directive` were all
present; `generated_story` was not. `/story` has been live since
SR-20260622-01 — every story an operator generated before this fix rendered
once, inline, and then disappeared from their Log on reload, recoverable
only because the story text was also appended into the entry's own text
field. `generated_story` is now in the whitelist (this session); the
`generated_story` case also gained a dedicated `STORY [PERIOD]:` renderer in
Logs.tsx so it displays with the same instrument styling as `PRAY:` and
`QI [RFI]:` rather than as an unlabeled `note`.

--------------------------------------------------------------------------------
07 // ARCADE — GAMIFIED EVOLUTION INSIDE A SELF-CARE PRODUCT
--------------------------------------------------------------------------------

LOT is a self-care company, not a game studio, and the Arcade layer is built
to respect that framing: it is a byproduct of real engagement, never a
mechanic that asks the operator to perform for the system.

WHAT ALREADY EXISTS (src/client/utils/badges.ts, rpg-narrative.ts):
  - A badge/achievement catalog (400+ entries as of the last Badge Codex,
    v20 "Navigator Protocol") organized by rarity tier (common -> cosmic)
    and category, including `achievement_rpg` and `secret_boss` categories.
  - Character-class framing and a generated story-arc per operator level
    (`generateStoryArc` in rpg-narrative.ts) — the RPG layer narrates the
    SAME underlying signal the QIE already tracks (energy, patterns,
    archetype), it does not introduce a second, competing metric.
  - `WORD_TURNS` — a word-turn lexicon (80+ triggers) that responds to
    specific phrases inside log entries with flavor text / easter eggs
    (src/client/utils/easter-eggs.ts / word-turn engines).
  - Self-Assembly phase progression (dormant -> awakening -> forming ->
    assembled -> integrated) across 18 modules, with a visible % and
    milestone toasts — the "leveling" system IS the self-care progress
    system, not a parallel game layer bolted on top of it.
  - Physiological archetypes (30+, e.g. "Peak Catalyst," "Coherence
    Holder," "Signal Architect") assigned from real behavioral signal, and
    a User Index (0-100, 6 dimensions) that plays the role of a "score"
    while remaining a direct readout of self-care engagement.

WHY THIS FRAMING MATTERS FOR THE LOG SPECIFICALLY:
  Every Arcade signal (a badge unlock, an archetype shift, a level-up
  narrative beat) is itself a Log event type — `badge_unlock`,
  `archetype_shift`, and friends already ride the same COCKPIT-RULE
  rendering pipeline as every other System event. The Arcade layer is not
  a separate screen the operator has to seek out; a badge earned from
  three days of consistent self-care shows up in the same scroll-back as
  the weather at the time they wrote about it. Gamification here means
  "the system notices and names your progress in the same voice it uses
  for everything else," not "collect points to unlock features." No
  slash command currently exists to directly query Arcade state on demand
  (badges/level are surfaced passively, via `/scan`'s badge count line and
  the System tab's own widgets) — a dedicated `/badges` or `/level` command
  is a natural, low-risk extension of the existing `/system` roster
  (PLANNED, not yet built).

--------------------------------------------------------------------------------
08 // CHANGE LOG FOR THIS DOCUMENT'S SESSION
--------------------------------------------------------------------------------

  - /story extended from a single "recent 200 logs" mode to four explicit
    compression periods (day/week/month/year), each with its own log
    window, sample cap, target word count, and prompt framing.
  - `generated_story` added to the server's `displayableEvents` whitelist
    (Backend Whitelist Hygiene fix — see §06).
  - `generated_story` given a dedicated `STORY [PERIOD]:` renderer in the
    Log's event-type switch, matching the COCKPIT-RULE styling of every
    other AI-backed command.
  - `/system` help screen updated to list the four `/story` forms
    explicitly instead of a single undifferentiated line.
  - This document — the first dedicated technical reference for the Log
    entry system as a whole, cross-referencing the passive-UI philosophy,
    the environment-context snapshot, the full command surface, the
    compression pipeline, and the Arcade layer's relationship to the Log.

See docs/benchmark/LOT-SR-* for the session report this document ships
with, and LOT-DOCTRINE.md / LOT-LEXICON.md for the compressed vocabulary
this white paper draws on.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-LOG-SYSTEM-WHITE-PAPER
================================================================================
