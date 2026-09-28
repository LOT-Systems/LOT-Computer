# LOT Log Command System — `/system` and `/story`

## Classification: RESTRICTED // S-2 EYES

**Author:** LOT Systems Corporation
**S-2:** Vadik Marmeladov
**Date:** 28 September 2026
**Status:** OPERATIONAL (Log surface) · PLANNED items marked as such
**Engine:** Together AI (Llama 3.3 70B) via `aiEngineManager`
**Test:** `npm run test:log-commands` (16 checks, no network)

---

## 0. Status Ledger — what is built and what is not

| Capability | State |
|---|---|
| `/system` prints every command, generated from one registry | BUILT |
| Log detector derives from the same registry (help cannot drift) | BUILT |
| `/story [day\|week\|month\|year]` compresses stored history | BUILT |
| Only a digest reaches the AI vendor, never the full journal | BUILT |
| Deterministic story when the vendor is down | BUILT |
| Story stored as a `generated_story` log with compression stats | BUILT |
| Prefix hints (`suggestCommands`) | BUILT (pure function) · UI hook PLANNED |
| Proactive follow-up on spike / pattern change | PLANNED (§7) |
| Morning question on any device | PLANNED (§7) |
| Story cache per period (skip vendor call on repeat) | PLANNED |
| Arcade rank derived from log behavior | PARTIAL — `/system` shows `INDEX n/100`; ranks/quests PLANNED (§6) |

Nothing in "PLANNED" is described elsewhere in this document as if it exists.

---

## 1. Doctrine

The Log is a passive AI surface. The operator writes; the machine does not
prompt, quiz or interrupt. Every entry is stored with its environment
(weather, humidity, city, time zone, moon, zodiac) — a snapshot of the moment
with no photo and no audio.

Two commands close the loop:

- `/system` — the operator asks the machine what it can do.
- `/story` — the operator asks the machine what their own record says.

The second is the important one. The story is the record compressed and handed
back, which lets the operator see their own high and low peaks and write the
next entry with that in mind. Each pass sharpens the next.

```
 LOT User data
   Log entries · check-ins · memory answers · widget clicks
   each row stamped with weather / time / place / astro context
        │
        ▼
 LOT Quantum Intent Engine            client: intentionEngine store
   user state (energy · clarity · alignment) and User Index
   sent with the request as `quantumState` / `userIndex`
        │
        ▼
 COMPRESSION (server, deterministic)  story-compression.ts  compressLogs()
   raw window  →  digest (counts · moods · themes · spike · shift · weather)
        │
        ▼
 AI vendor processor (Together AI)    buildStoryPrompt(digest)
   digest in, story out
        │
        ▼
 LOT personalized data stored         Log(event = generated_story)
   story + period + engine + compression stats
```

The compression step is the privacy boundary and the cost control. It runs
before the vendor call, with no AI involved, and is fully unit-tested.

---

## 2. Command Registry

**Source of truth:** `src/shared/utils/logCommands.ts` → `LOG_COMMANDS`.

One row per command: `id`, `primary` slash keyword, `aliases`, `emojis`,
`category`, `summary`, optional `args`. Three things read the table:

| Consumer | How |
|---|---|
| `src/client/utils/logTriggers.ts` | Builds detector rules from it |
| `Logs.tsx` (`/system`) | Renders help via `formatSystemHelp()` |
| This document | Table below, kept in step by hand |

To add a command: add one row, add its handler branch in `Logs.tsx`, run
`npm run test:log-commands`. The tests fail if a keyword is claimed twice, if
`/system` omits a command, or if the detector does not fire for a listed
command.

### 2.1 Commands

| Command | Category | Effect |
|---|---|---|
| `/story [day\|week\|month\|year]` | MEMORY | Compressed story of the operator's record (§4). Emoji: 📖 |
| `/how` | MEMORY | Open LOT AI check-in (System tab) |
| `/prayer` (alias `/candle`) | MEMORY | Contextual scripture. Emoji: 🕯️ |
| `/qi [query]` | INTELLIGENCE | Ask the Quantum Intelligence engine |
| `/scan` (alias `/ai`) | INTELLIGENCE | System status overview |
| `/qos` (alias `/os-report`) | INTELLIGENCE | Quantum OS state analysis |
| `/assembly` (alias `/assemble`) | INTELLIGENCE | Self-assembly module status |
| `/phys` (alias `/cohort-report`) | INTELLIGENCE | Physiological cohort report |
| `/sil` (alias `/silence-check`) | INTELLIGENCE | Signal silence pattern check |
| `/breathe` (alias `/breath`) | PROTOCOL | 4-2-6 breathing exercise |
| `/freeze` (alias `/pause`) | PROTOCOL | Pause and reflect protocol. Emoji: 🧊 |
| `/fast` | PROTOCOL | Orthodox fasting calendar |
| `/silent` (alias `/quiet`) | PROTOCOL | Acknowledge signal silence |
| ❗ (emoji only) | PROTOCOL | Request cohort support |
| `/synth` (alias `/keyboard`) | INTERFACE | Toggle keyboard sound. Emoji: 🎹 |
| `/radio` | INTERFACE | Toggle radio. Emoji: 🎧 |
| `/night` | INTERFACE | Dark mode. Emoji: 🌙 |
| `/system` (alias `/commands`) | INTERFACE | This list |

### 2.2 Detection rules (unchanged by this work)

- Slash keywords match as whole tokens: `/scandalous` does not fire `/scan`.
- Case-insensitive for keywords; exact for emojis.
- Triggers are additive: several may appear in one entry.
- Only **new** triggers fire (`detectNewTriggers` diffs against the previous
  text), so editing around `/system` does not re-open the screen.

---

## 3. `/system`

Typing `/system` (or `/commands`) in a Log entry renders the SYSTEM block under
the editor: sections MEMORY, INTELLIGENCE, PROTOCOL, INTERFACE, then EMOJI
TRIGGERS and SHORTCUTS, then an OPERATOR line with the current User Index
(`INDEX 47/100`) when the engine has one.

Because the text is generated from the registry, a command that exists is
listed and a command that is listed exists. Before this change the help was a
hard-coded array that could lag behind the detector.

---

## 4. `/story`

### 4.1 Invocation

| Typed | Window |
|---|---|
| `/story` | Today, since local midnight |
| `/story week` | Trailing 7 days |
| `/story month` | Trailing 30 days |
| `/story year` | Trailing 365 days |

The client waits **800 ms** after the trigger so `/story week` can be finished
before it fires (`STORY_SETTLE_MS`), then reads the final text and parses the
period with `parseStoryPeriod`. An unknown argument falls back to `day`.

If the requested window holds no signals, the server **widens** it
(`day → week → month → year`) and reports the period it actually used. If the
year is empty too, the story says so plainly.

Access: Usership members only (existing gate). Rate limit: 5 requests per
minute (existing).

### 4.2 Digest

`compressLogs(rows, period, now, timeZone)` in
`src/server/utils/story-compression.ts`. Pure and deterministic. Sources:
`log_entry`, `journal`, `emotional_checkin`, `memory_answer`,
`self_care_checkin`, `energy_checkin`. Everything else (settings changes, admin
events, prior generated stories) is excluded.

| Field | How it is computed |
|---|---|
| `entries`, `signals`, `activeDays`, `totalDays` | Counted from rows in the window |
| `peakHour` | Modal local hour of journal entries |
| `moods` | Labels the operator chose in check-ins, by frequency |
| `shift` | Leading mood in first half vs second half of mood rows (needs ≥ 4) |
| `spike` | Busiest day, only if > 2× the active-day mean and ≥ 3 active days |
| `themes` | Content words (≥ 4 chars, stop-words removed) seen ≥ 2 times |
| `weather` | Mean temperature, top conditions and cities, from per-log context |
| `excerpts` | Last ≤ 5 journal lines, each clipped to 160 chars |
| `sourceChars` / `digestChars` | Text size before and after compression |

Nothing is inferred about the person beyond these counts and the labels they
gave. No sentiment score, no diagnosis, no personality claim.

### 4.3 Privacy boundary

The vendor prompt contains the digest, an optional one-line QIE state, and the
current entry (first 300 chars). It does **not** contain the journal. The only
raw text is the ≤ 5 clipped excerpts, which are the most recent entries in
that window. A test asserts the digest is under a tenth of the source size on a
large window and that excluded events never appear.

### 4.4 Generation and fallback

1. `buildStoryPrompt(digest)` — second person, digest facts only, no invention,
   no diagnosis, one quiet forward-looking closing sentence, 60–220 words by
   period.
2. `aiEngineManager.getEngine('together').generateCompletion(prompt, 512)`.
3. On vendor error or empty output: `composeDeterministicStory(digest)` renders
   the same digest without AI (e.g. *"You wrote 12 entries across 7 of the last
   7 days. Most of it came around 08:00. You named your state calm most often.
   It moved from low to calm. The record keeps building."*).

The response carries `engine: 'together' | 'deterministic'` so the surface and
later analytics can tell them apart.

### 4.5 Storage

Each story is written as a `Log` row: `event = generated_story`, `text = story`,
full log context, and metadata:

```
story, period, requestedPeriod, engine,
entries, signals, activeDays, sourceChars, digestChars,
logText, quantumState, timestamp
```

`generated_story` is not a digest source, so stories never feed back into the
next story as if they were the operator's own words.

### 4.6 API

`POST /api/story`

```
request : { logText, period?: 'day'|'week'|'month'|'year', quantumState?, userIndex? }
response: { story, period, engine, entries, activeDays, logId | null }
403     : { story: 'Story generation is available for Usership members.', logId: null }
```

`period` in the response is the window actually used (after any widening).

---

## 5. Files

| Path | Role |
|---|---|
| `src/shared/utils/logCommands.ts` | Registry, `formatSystemHelp`, `suggestCommands`, `parseStoryPeriod` |
| `src/client/utils/logTriggers.ts` | Detector, now derived from the registry |
| `src/client/components/Logs.tsx` | `/system` render, `/story` settle + period |
| `src/client/queries.ts` | `useStoryGeneration` request/response types |
| `src/server/utils/story-compression.ts` | `compressLogs`, prompt, deterministic story |
| `src/server/routes/api.ts` | `POST /api/story` |
| `scripts/tests/test-log-commands.ts` | 16 checks; `npm run test:log-commands` |

---

## 6. Arcade evolution (gamified progression in a self-care company)

The repository already carries the arcade layer: 812 badges across the codex
series (`docs/badges/`), the Hero's Journey codex (v32), Interface Evolution
(`docs/technical/INTERFACE_EVOLUTION.md`, levels 1–100, four story chapters,
layout density from *breathable* to *instrument*), and the neon-arcade session
work (`docs/SESSION_REPORT_2026_07_20_NEON_ARCADE_v80.md`).

Design constraint for anything added here: **the game rewards care, not
compulsion.** A self-care product that pays out for maximum time-on-screen
teaches the wrong habit. So:

- Progress is earned by *consistency and honesty of record* (showing up, naming
  a state, finishing a protocol), never by volume of text or number of commands.
- No streak-loss punishment copy. A gap is met with the same tone the story
  uses for thin presence: stated, not judged.
- The interface stays military-plain (`MILITARY PURITY`): rank is a line of
  text, not a fanfare.

What exists today on this surface: `/system` shows `INDEX n/100` from the QIE
User Index. What is **not** built yet, and is proposed only:

| Proposal | Mechanic | Guard |
|---|---|---|
| `/rank` | Show level, chapter, next unlock from `calculateEvolutionState` | Read-only |
| Story milestones | First `/story week`, first `/story month`, first `/story year` as one-time badges | Once each; cannot be farmed |
| Protocol completion | Finishing `/breathe` or `/freeze` (not merely typing it) counts toward care dimension | Completion event, not the keyword |

Each requires a codex entry and a benchmark cycle before shipping.

---

## 7. Roadmap (PLANNED — not implemented)

**7.1 Spike / pattern-change follow-up.** The digest already computes `spike`
and `shift`. A scheduled job can run `compressLogs` per user on the trailing
window against the previous window and, on a threshold breach, queue one
follow-up question (Memory Engine format: 3–4 tap options). Open questions:
threshold values, quiet hours, per-user opt-out. To be specified before build.

**7.2 Morning question.** The machine asks first — on the site through a widget,
or on a personal LOT computer device. Reuses the Memory Engine question
pipeline (`docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`); the
device channel depends on the Node 0 rig spec
(`docs/technical/LOT-NODE-0-RIG-SPEC.md`).

**7.3 Periodic stories without a command.** Day / week / month / year stories
pushed back as prompts on a schedule. Weekly and monthly summaries already
exist (`weekly-summary.ts`, `monthly-summary.ts`); the natural step is for them
to consume `compressLogs` output so there is one compression path, not three.

**7.4 Per-period cache.** Store the last story per `(user, period, window
start)` and return it on repeat within a short TTL, to save vendor calls.

---

## 8. Failure modes

| Failure | Behavior |
|---|---|
| Not Usership | 403 with message; nothing generated |
| Vendor error / timeout / empty text | Deterministic story from the digest; `engine: 'deterministic'` |
| Empty window | Widen to the next period; if all empty, plain "Nothing recorded" line |
| Story log write fails | Story is still returned, `logId: null` |
| Client request fails | Existing client fallback line; entry text is not lost |
| Operator types `/story` then keeps typing | Period read after 800 ms from the final text |

## 9. Verification

```
npm run test:log-commands        # 16 checks: registry, detector, compression
npm run server:build             # tsc server config + ESM import fix
npm run client:build             # css + esbuild client bundle
npx tsc --noEmit -p tsconfig.json   # 104 pre-existing errors; must not increase
```

The 104 client type errors predate this work (badges, admin components,
`intentionEngine`); the gate compares per-file error counts against the
baseline taken at the start of the session and requires no new errors.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
