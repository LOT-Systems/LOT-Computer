<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG — COMMAND REGISTRY, STORY COMPRESSION & ARCADE RANK

```
DOCUMENT:   LOT-TECH-LOG-STORY-01
CLASS:      RESTRICTED // S-2 EYES
S-2:        VADIK MARMELADOV
DATE:       2026-10-27
STATUS:     IMPLEMENTED — GREEN (see docs/benchmark/LOT-SR-20261027-01.md)
```

## 1. MISSION

The Log is a **passive AI UI**: the user writes, nothing prompts them. Every
entry is stored with environment context (weather, humidity, city, time zone,
astrology). The machine reads that history back as a **compressed story** of
the day / week / month / year, so the loop tightens: the person is shown
themselves, and the high and low peaks surface.

```
LOT User data → compressLogs() [deterministic] → LOT Quantum Intent Engine
  → AI vendor (Together AI) narrates measured facts → LOT personalized data stored
```

Design rule: **the model narrates; it never measures.** All counts, streaks and
spikes are computed by pure code first. If no AI vendor answers, a
deterministic story built from the same facts is returned. Nothing is invented.

## 2. COMMANDS (typed in the Log)

| Command | Effect | Backend |
|---|---|---|
| `/system` | Grouped command list (MEMORY / SYSTEM / RITUAL / AMBIENT) | none (client) |
| `/story` | Compressed story of **today** | `POST /api/story` |
| `/story week` | Last 7 days | `POST /api/story` |
| `/story month` | Last 30 days | `POST /api/story` |
| `/story year` | Last 365 days | `POST /api/story` |
| `/rank` | Arcade level, XP, streak | `POST /api/rank` |
| `/qi`, `/how`, `/scan`, `/assembly`, `/phys`, `/qos`, `/silent`, `/prayer`, `/fast`, `/breathe`, `/freeze`, `/synth`, `/radio`, `/night` | Pre-existing; now listed in the registry | unchanged |

Aliases: `📖` = `/story`; `/level` = `/rank`. `/story weekly` is **not** `week`
(word-boundary enforced; falls back to `day`).

## 3. FILE MAP

| Path | Role |
|---|---|
| `src/shared/utils/logCommands.ts` | Command registry — single source of truth; `renderSystemHelp()` |
| `src/shared/utils/storyCompression.ts` | `compressLogs`, `detectSpikes`, `renderFacts`, `renderFallbackStory`, Arcade model |
| `src/client/utils/logTriggers.ts` | Trigger detection; added `arcade-rank` |
| `src/client/components/Logs.tsx` | `/system` renders registry; `/story` sends `period`; `/rank` panel |
| `src/client/queries.ts` | `useStoryGeneration` (+`period`), `useArcadeRank` |
| `src/server/routes/api.ts` | `/story` (window-bound read, compression, AI, fallback), `/rank` |
| `scripts/tests/test-story-compression.ts` | 11 deterministic test groups (`npm run test:story`) |

## 4. COMPRESSION MODEL

Input rows: `logs` where `event ∈ {log_entry, journal}` (writing) or
`{emotional_checkin, memory_answer, self_care_checkin, energy_checkin}` (signal).

Output (`CompressedStory`): entry count, active days, trailing streak, per-day
counts, time-of-day buckets (night <06, morning <12, afternoon <18, evening),
top cities, top sky descriptions, top moods, spikes, last 6 excerpts (160 chars).

**Windows:** `day` = since 00:00 UTC today; `week/month/year` = rolling 7/30/365 days.

**Spike detection** (simple and explainable by design):

| Kind | Rule |
|---|---|
| `volume` | day count ≥ 3 and > mean + 1.5σ (needs ≥ 3 active days) |
| `mood-shift` | latest `emotional_checkin` differs from prior modal mood (needs ≥ 3 check-ins) |
| `silence` | ≥ 3 consecutive empty days between first activity and now (non-`day` periods) |

At most 4 spikes are emitted. Spikes are the hook for the future *machine asks
first* follow-up: a spike is the reason to ask.

## 5. ARCADE (GAMIFIED SELF-CARE EVOLUTION)

Self-care framing: progress is earned by **showing up**, never by comparing with
others; no leaderboards, no loss states.

```
XP    = 10 × records + 25 × active days + 15 × streak days      (365-day window)
LEVEL = floor( sqrt( XP / 50 ) ) + 1
RANK  = SIGNAL · OBSERVER · KEEPER · NAVIGATOR · ARCHITECT · LUMINARY   (3 levels each, last is open-ended)
```

Output is a terminal block (`RANK / LEVEL / XP [■■■□□□□□□□] / STREAK`). The
existing 800+ badge codex (`src/client/utils/badges.ts`) is untouched; Arcade
rank is the log-derived spine those badges sit on.

## 6. DATA & PRIVACY

- Reads only the requesting user's logs (`userId = req.user.id`), time-windowed, row-capped (day 300 · week 1,500 · month 5,000 · year 20,000).
- `/story` remains **Usership-gated** (403 otherwise). `/rank` is not AI-backed and is open to any authenticated user.
- Only measured facts and ≤ 160-char excerpts reach the AI vendor.
- Generated stories persist as `event = 'generated_story'` with `metadata.period` and `metadata.facts` (counts + spikes), usable as the next loop's input.
- Rate limits: `/story` 5/min, `/rank` 10/min.
- No photo, no audio: context is metadata only.

## 7. KNOWN LIMITATIONS (HONEST)

1. `day` and daily buckets use **UTC**, not the user's local midnight (`context.timeZone` exists and is the planned fix). Late-evening entries for users far from UTC can land in the adjacent day.
2. Spike thresholds are heuristics, not tuned on production data.
3. `/story` runs on demand; the morning "machine asks first" push and scheduled daily/weekly stories are **not** part of this change.
4. Pre-existing: `Logs.tsx` carries 4 baseline `tsc` errors (lines ~101, 105, 3796, 3863) unrelated to this work; the build is unaffected.
5. Arcade XP is recomputed on request; it is not yet stored or surfaced as a persistent widget.

## 8. NEXT (PROPOSED, NOT BUILT)

1. Local-timezone windows via `context.timeZone`.
2. Scheduled morning follow-up: when `detectSpikes` fires, enqueue one question to the user's device/widget.
3. Persist weekly/monthly stories and feed prior stories into the next compression (the "loop of loops").
4. Surface Arcade rank in the System tab and award badges on level-up.
5. Route `/story` through the Quantum Intent Engine state (already sent by the client as `quantumState`) to select narrative tone server-side.

## 9. VERIFICATION

```
npm run test:story                         11 groups PASS
tsc -p tsconfig.server.json --noEmit       0 errors
tsc -p tsconfig.json --noEmit              Logs.tsx: 4 errors, identical to baseline
yarn client:js:build / yarn server:build   OK
```

AUTHORIZED BY: S-2 // VADIK MARMELADOV
