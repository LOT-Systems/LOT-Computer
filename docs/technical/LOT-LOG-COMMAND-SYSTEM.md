<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / TECHNICAL SPECIFICATION
DOCUMENT: LOT-SPEC-LOG-COMMANDS-01
TITLE:    LOG COMMAND SYSTEM · /system · /story · /rank · ARCADE
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
REV:      A
DATE:     2026-11-09
STATUS:   IMPLEMENTED (client, server, tests) · PLANNED items marked [PLANNED]
================================================================================
```

## 0. PURPOSE

The Log is a **passive AI interface**. The operator writes; there are no prompts,
forms or questions. Every entry is silently stamped with context metadata.
Three slash-commands let the operator *pull* the machine's understanding back out
without leaving the text field:

| COMMAND | EFFECT |
|---------|--------|
| `/system [group]` | Lists every command, grouped. Filter: `/system memory` |
| `/story [day\|week\|month\|year]` | Compressed story of the period (default `week`) |
| `/rank` | Arcade standing — rank, XP, streak. No AI call. |

Product loop served (see `docs/corporate/LOT-AI-PRODUCT-BRIEF.md`):

```
LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN
```

`/story` is the **COMPRESS** step made visible. Spikes it names are the seed for
the **ASK** step (§8, planned).

## 1. DATA FLOW

```
 LOT USER DATA            LOG STORY COMPRESSION        AI VENDOR              LOT PERSONALIZED DATA
 ─────────────            ─────────────────────        ─────────              ─────────────────────
 Log rows (event='note')  shared/utils/log-story.ts    Together AI            Log row, event=
 + context metadata  ───▶ compressLogs() → StoryDigest ─▶ (digest only) ─────▶ 'generated_story'
 (time·place·weather·     deterministic, no network    generateCompletion()   metadata.digest/scope/
  moon) + check-ins                                    512 tokens max         source
```

> **Boundary note (HONEST).** The proposed chain names a "LOT Quantum Intent Engine"
> stage between user data and the vendor. In this release that stage is the
> deterministic compressor above. The client-side QIE (`intentionEngine`,
> `getUserState`, `getUserIndex`) contributes `quantumState`/`userIndex` fields to the
> request, which are appended to the prompt when present. Server-side QIE pattern
> output is **not** yet fed into `/story` — see §8.

### 1.1 What leaves the platform

Only to the configured vendor (`aiEngineManager.getEngine('together')`):

- the rendered **digest** (counts, day-part distribution, city names, average temperature,
  weather words, mood tallies, spike notes, Arcade rank/XP);
- up to **5 excerpts**, each ≤ 160 chars, with slash-commands and generated 📖/🕯️
  blocks removed;
- the operator note typed alongside the command (≤ 300 chars, commands stripped);
- optional `quantumState` / `userIndex` scalars.

Never sent: user id, email, name, full log history, raw log rows. The server log line
records the user **id** only (the previous revision logged email and entry text; removed).

## 2. COMMAND DETECTION

`src/client/utils/logTriggers.ts` — pure detectors. A command fires when `/word` appears
as a whole token (so `/scandalous` does not fire `/scan`) **and was not present in the
previous text** (editing around an existing command does not re-fire it).

**Argument-taking commands (`/story`, `/system`)** cannot fire on first sight, because the
detector sees `/story` before the operator has typed `month`. `Logs.tsx` therefore defers
these two by **1200 ms**, re-reads the live text from `valueRef`, re-checks the command is
still present, then parses the argument. Commands with no argument fire immediately.

| TRIGGER | KEYWORDS | EMOJI |
|---------|----------|-------|
| `system-help` | `system`, `commands` | — |
| `story-mode` | `story` | 📖 |
| `rank-status` | `rank`, `arcade`, `xp` | — |

(full table: `LOG_COMMANDS` in `src/client/utils/logCommands.ts`)

## 3. /system

Source of truth: **`LOG_COMMANDS`** in `src/client/utils/logCommands.ts`
(trigger, usage, summary, group, aliases, emoji). `buildSystemHelp(filter?)` renders it.

Groups: `MEMORY` · `CONTEXT` · `BODY` · `MODES` · `SYSTEM`.

**Drift guard.** `scripts/tests/test-log-story.ts` fails the build gate if (a) a registry
usage does not actually fire its trigger, (b) a documented alias does not, or (c) a trigger
exists that is neither in the registry nor in `UNLISTED_TRIGGERS` (currently only `❗`,
the emoji-only cohort-support signal). A command cannot ship undocumented.

Renderer contract (`Logs.tsx`, `SYSTEM:` block): a line containing a run of 2+ spaces is a
command row (usage, then summary); any other line is a heading or note.

## 4. /story

### 4.1 Scope

| ARG | WINDOW | ALIASES |
|-----|--------|---------|
| `day` | today | `today`, `d` |
| `week` (default) | 7 days | `weekly`, `w` |
| `month` | 30 days | `monthly`, `m` |
| `year` | 365 days | `yearly`, `y` |

Unknown argument → `week`. Windows end at the end of the operator's **local** day
(user `timeZone` → UTC offset), start `N-1` local days earlier.

### 4.2 Compression — `compressLogs(rows, scope, {now, tzOffsetMinutes}) → StoryDigest`

Counted as operator entries: `event === 'note'` with non-blank text. Everything else
(generated stories, check-ins, badge events) is excluded from entry counts.

> **DEFECT FIXED.** The prior `/story` filtered on `event === 'log_entry' | 'journal'`.
> Journal rows are stored as `event: 'note'` (`api.ts` `/logs`), so the story never saw
> the operator's own entries — only mood/self-care rows. See report LOT-SR-20261109-01.

Digest fields: entry count · active days · streak · average words · day-part histogram
(night 00–06, morning 06–12, afternoon 12–18, evening 18–24) · top cities · average
temperature (°C, from Kelvin context) · top weather descriptions · mood tallies
(`emotional_checkin.metadata.emotionalState`) · spikes · last 5 excerpts · Arcade.

### 4.3 Spike / pattern-change detection

Deterministic thresholds — no model involved. This is the "detects a spike or a pattern
change" requirement of the Log design.

| KIND | RULE | MIN DATA |
|------|------|----------|
| `volume-spike` | day count ≥ 3 **and** > mean + 1.5σ across window days | window ≥ 7 d |
| `silence-gap` | ≥ 3 consecutive empty days between two active days | — |
| `rhythm-shift` | dominant day-part of 1st half ≠ 2nd half (by time) | ≥ 6 entries |
| `mood-shift` | dominant mood of 1st half ≠ 2nd half | ≥ 4 check-ins |
| `length-spike` | longest entry ≥ 80 words and > 3× median | ≥ 4 entries |

Max 6 spikes returned. Thresholds are constants in `detectSpikes()`; changing one is a
spec change (bump REV).

### 4.4 Generation and fallback

1. Server builds the digest, then the **card** (terminal-grid status block, §4.5).
2. Prompt = system prompt (second person, grounded, no invention, name spikes gently,
   Arcade mentioned at most once, no pep talk, 80–160 words) + `renderDigestForPrompt()`.
3. `together` engine, 512 tokens. On error **or empty completion**, the server returns
   `composeLocalStory(digest)` — a deterministic, fact-only story — with `source: 'local'`.
   The command always answers.
4. Result persisted as `Log{event:'generated_story', metadata:{story, scope, source,
   digest (excerpts removed), logText, quantumState}}`.
5. Client shows the card above the story and appends `📖 <story>` to the entry text
   (existing behaviour, retained).

Access: AI story requires the `usership` tag (unchanged). Rate limit 5/min.

### 4.5 Response

```
POST /api/story   { logText?, scope?, cardOnly?, quantumState?, userIndex? }
→ 200 { story, card, scope, source: 'ai'|'local', logId }
→ 403 { story, card: null, logId: null }          (no usership, non-cardOnly)
```

Card sample:

```
STORY           WEEK  2026-11-03 → 2026-11-09
ENTRIES         6  ·  4/7 DAYS ACTIVE
STREAK          3 DAYS
ARCADE          RECORDER  L2  316 XP
NEXT RANK       ██░░░░░░░░  134 XP
SIGNAL          3 DAYS OF SILENCE AFTER 2026-11-03
```

## 5. ARCADE — gamified evolution (self-care framing)

The operator's rank is a **presence ledger**, not a score to beat. There is no failure
state, no loss of XP, no leaderboard in this release.

```
XP = 10·entries + 25·activeDays + 15·streakDays + 5·checkins
LEVEL = floor( sqrt(XP / 50) )         level n begins at 50·n² XP
```

Showing up daily (25 + streak 15) outweighs volume (10) by design.

| LEVEL | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9+ |
|-------|---|---|---|---|---|---|---|---|---|----|
| RANK | INITIATE | OBSERVER | RECORDER | OPERATOR | NAVIGATOR | CARTOGRAPHER | ARCHITECT | SENTINEL | LUMINARY | FOUNDER-CLASS |

**Season.** Arcade is computed over the trailing **365 days** (one query, ≤ 3000 rows),
independent of the story scope. `streakDays` counts consecutive active local days ending
today — or yesterday, so a day not yet written is not a broken streak. XP in this release
is therefore a *derived* number, recomputed per call, not a stored balance.

`/rank` calls `POST /api/story {cardOnly:true}`: no AI call, no Usership gate.

**Relation to Badges.** The Badge Codex (`src/client/utils/badges.ts`, 812 badges at
v32) is a separate, client-evaluated system. Arcade rank is server-derived from Log data.
Unifying them (badge unlocks granting XP) is [PLANNED], not built.

## 6. FILES

| PATH | ROLE |
|------|------|
| `src/shared/utils/log-story.ts` | compression, spikes, Arcade, local story (pure) |
| `src/client/utils/logCommands.ts` | command registry + `/system` renderer text |
| `src/client/utils/logTriggers.ts` | detectors (+ `rank-status`, `ALL_TRIGGERS`) |
| `src/client/components/Logs.tsx` | wiring: deferred commands, SYSTEM / 📖 / ARCADE blocks |
| `src/client/queries.ts` | `useStoryGeneration` request/response types |
| `src/server/routes/api.ts` | `POST /api/story` |
| `scripts/tests/test-log-story.ts` | 75 self-checks incl. registry drift guard |

## 7. VERIFICATION

```
npx tsx scripts/tests/test-log-story.ts      # 75 PASS, exit 0
npx tsc --noEmit -p tsconfig.server.json     # clean
yarn client:js:build && yarn server:build    # OK
npx tsc --noEmit -p tsconfig.json            # 104 errors = pre-existing baseline
                                             # (badges.ts, Admin*.tsx, Logs.tsx L101/105/3803/3870); 0 new
```

The AI path (Together AI) and the rendered UI were **not** exercised in this
environment (no API key, no database, no browser session against a running app).
Verified by type-check, build, module import under Node ESM, and unit self-checks only.

## 8. [PLANNED] — NOT BUILT

Recorded so the next session does not mistake intent for fact.

1. **Machine asks first.** Morning question on any device or widget, seeded by the
   digest's top spike (`silence-gap` → rest question; `mood-shift` → "what changed?").
   Needs: scheduled job, delivery channel, one-question-at-a-time ranking
   (Product Brief, *Design Principles*).
2. **Passive follow-up.** On a new entry, compare against the rolling digest and surface
   a follow-up only on spike. Needs a per-entry hook server-side.
3. **Stored story cadence.** Daily/weekly/monthly/yearly stories generated by cron and
   stored, so `/story` can return a cached one instantly. Weekly story already exists
   as Job 24 (`lot_ai_story`); not yet unified with this path.
4. **Server QIE → /story.** Feed pattern/archetype output (P1–P151) into the prompt.
5. **Story export** (`/api/story/latest`, `/:week_id`, export targets) per Product Brief.
6. **Badge ⇄ Arcade unification** (§5).
7. **Per-user timezone for client-side cleaning** — spec assumes the stored `timeZone`.

## 9. KNOWN LIMITS

- Arcade streak/XP are bounded by the 3000-row / 365-day fetch; a very heavy user's
  oldest entries in the season may be omitted.
- Entries are dedup-free: edits to a note update one row, but a note rewritten into many
  separate notes counts as many entries.
- The 1200 ms deferral means `/story` visibly waits a beat; this is deliberate.
- The `/api/story` 403 for non-Usership still applies to `/story`; `/rank` and `/system`
  are open to all.

```
================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-SPEC-LOG-COMMANDS-01
================================================================================
```
