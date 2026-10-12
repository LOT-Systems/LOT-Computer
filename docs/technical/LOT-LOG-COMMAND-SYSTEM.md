# LOT LOG — COMMAND SYSTEM, STORY COMPRESSION, ARCADE RANK

```
DOCUMENT:   LOT-TECH-LOG-CMD-01
CLASS:      RESTRICTED // S-2 EYES
S-2:        VADIK MARMELADOV
DATE:       2026-10-12
STATUS:     IMPLEMENTED — client-side, green-gated
SCOPE:      Log tab slash commands · /system · /story · spike detection · arcade rank
```

---

## 1. PURPOSE

The Log is a passive AI interface. The operator writes; the machine records
each entry with its context (weather, humidity, place, moon, zodiac) and later
compresses the record back into a story. No prompts, no questions inside the
Log. Slash commands are the only active surface, and they are optional.

Pipeline (proposed logic, S-2):

```
LOT USER DATA → LOT QUANTUM INTENT ENGINE → AI VENDOR (Together AI) → LOT PERSONALIZED DATA
```

This document specifies the Log's share of that pipeline.

| Stage | Component | Status |
|---|---|---|
| USER DATA | Log entries + context metadata (`logs` table, `context` JSON) | LIVE |
| QUANTUM INTENT ENGINE | `intentionEngine.ts` — signals, patterns, archetype | LIVE |
| LOCAL COMPRESSION | `logStory.ts` — deterministic, offline | **NEW** |
| AI VENDOR | `POST /api/story` → Together AI | LIVE (Usership gated) |
| PERSONALIZED DATA | `generated_story` log row + appended story block | LIVE |

---

## 2. FILE MAP

| Path | Role | Pure |
|---|---|---|
| `src/client/utils/logCommands.ts` | Command registry; renders `/system` | YES |
| `src/client/utils/logTriggers.ts` | Trigger detection (`/word`, emoji); added `getTriggerKeywords()` | YES |
| `src/client/utils/logStory.ts` | Compression: window, themes, mood, context, peaks, spikes | YES |
| `src/client/utils/logArcade.ts` | XP / rank derived from the record | YES |
| `src/client/components/Logs.tsx` | Wiring: `NoteEditor` trigger effect and render blocks | NO |
| `src/server/routes/api.ts` | `POST /api/story` (AI narrative) | NO |
| `scripts/tests/test-log-commands.ts` | 13 tests — `npm run test:log` | — |

"Pure" = no stores, no DOM, no network. Everything testable runs under `tsx`.

---

## 3. COMMAND REGISTRY

`LOG_COMMANDS` in `logCommands.ts` is the single source of truth. `/system`
renders from it, so help cannot drift from behavior. Two tests enforce this:

1. every registry entry has a live trigger rule, a matching slash keyword, and
   actually fires when typed;
2. every trigger rule that has a slash keyword is either in the registry or in
   `UNLISTED_TRIGGERS` (`sil-check`, `cohort-support`).

Adding a command: add a `RULES` row in `logTriggers.ts`, add a `LOG_COMMANDS`
row, add the handler branch in `NoteEditor`. `npm run test:log` fails if the
first two are out of sync.

### 3.1 Command table

| Command | Category | Effect |
|---|---|---|
| `/story [day\|week\|month\|year]` | MEMORY | Compressed story of the record + AI narrative |
| `/how` | MEMORY | Open LOT AI check-in (System tab) |
| `/prayer` | MEMORY | Contextual scripture |
| `/qi [query]` | INTELLIGENCE | Quantum Intelligence RFI |
| `/scan` | INTELLIGENCE | System status overview |
| `/assembly` | INTELLIGENCE | Self-assembly module status |
| `/phys` | INTELLIGENCE | Physiological cohort report |
| `/qos` | INTELLIGENCE | Quantum OS state analysis |
| `/fast` | PROTOCOL | Orthodox fasting calendar |
| `/breathe` | PROTOCOL | 4-2-6 breathing |
| `/freeze` | PROTOCOL | Pause-and-reflect |
| `/silent` | PROTOCOL | Signal silence check |
| `/synth` | INTERFACE | Toggle keyboard sound |
| `/radio` | INTERFACE | Toggle radio |
| `/night` | INTERFACE | Dark mode |
| `/system` | SYSTEM | This list, plus operator rank |

Aliases remain in `logTriggers.ts` (`/commands` → `/system`, `/ai` → `/scan`,
`/quiet`, `/breath`, `/candle`, `/pause`, `/keyboard`, `/assemble`, ...).
Aliases are not listed in `/system`.

### 3.2 `/system` screen

Shows the operator line (rank, level, XP, streak, progress bar), then commands
grouped MEMORY / INTELLIGENCE / PROTOCOL / INTERFACE / SYSTEM, then shortcuts.
Line contract with the renderer in `Logs.tsx`: a line starting with `/` is a
command row (command, two or more spaces, summary); other non-empty lines are
section headers; blank lines are spacers.

---

## 4. `/story` — LOCAL COMPRESSION

`/story` produces two layers.

**Layer 1 — local compression (instant, offline, deterministic).**
`compressLogs(logs, period, now)` reads the log list already loaded in the
client (`localStore.logById`). No request is made. Output block label `STORY:`.

**Layer 2 — AI narrative (Together AI via `/api/story`, Usership).**
Appended to the log text as before. If the engine is unavailable the existing
fallback line is used, and Layer 1 is still shown.

### 4.1 Periods

| Argument | Window | Comparison window |
|---|---|---|
| `day` | last 24 h | previous 24 h |
| `week` (default) | last 7 d | previous 7 d |
| `month` | last 30 d | previous 30 d |
| `year` | last 365 d | previous 365 d |

The trigger fires the instant `/story` is typed, before an argument can be
typed. The handler therefore waits 1200 ms and reads the latest text from a
ref. An in-flight guard (`storyLoadingRef`) prevents duplicate AI calls.

### 4.2 What is counted

Entries are logs with event `note`, `log_entry` or `journal` and non-empty text
after cleaning. `cleanEntryText` removes slash commands, trigger emoji, and any
line beginning with a story/scripture marker, so machine output and commands
never count as the operator's writing.

### 4.3 Output fields

| Field | Derivation |
|---|---|
| ENTRIES | count in window, active days, total words |
| VS PRIOR | entry delta against the previous equal window |
| THEMES | top 5 non-stopword tokens (3+ chars) seen 2+ times |
| MOOD | `emotional_checkin` states in window, top 3 |
| CONTEXT | mean temperature (°C, from Kelvin), most common city, most common moon phase |
| HIGH / LOW | entries with best / worst heuristic tone, only if non-neutral |
| SPIKES | see 4.4 |
| RANK | arcade state, section 6 |

### 4.4 Spike detection — follow-up candidates

Spikes are the pattern-change signals the machine may later follow up on.

| Kind | Rule |
|---|---|
| VOLUME | day has ≥3 entries and ≥2× the mean per active day (needs ≥3 active days) |
| DEPTH | entry ≥40 words and ≥2.5× median entry length (needs ≥4 entries) |
| QUIET | prior window had ≥4 entries and this window has fewer than half |
| LOW-TONE | a day's summed tone ≤ −3 |

### 4.5 Honest limits

- Tone is a **fixed English lexicon** (27 low words, 23 high words). It is a
  heuristic, labelled as such in the output, not sentiment analysis.
- Themes are word frequency, not semantic topics.
- Only logs present in the client list are seen. `GET /api/logs` is limited to
  the most recent 500 rows, so `year` compresses at most that many logs.
- Spike thresholds are untuned constants. Tune them on real data before using
  them to trigger unprompted follow-ups.

---

## 5. FOLLOW-UP LOOP (DESIGN — NOT YET WIRED)

The spike list is the interface for the next stage: the machine asks first.

```
Log entry saved ── context attached ──┐
                                      ▼
                        compressLogs(day/week) → spikes[]
                                      ▼
            QIE pattern check (intentionEngine) corroborates
                                      ▼
        morning question (device or widget) cites the spike, once
                                      ▼
                  answer stored as a log with context
```

Rules proposed for the wiring:

1. One follow-up per spike, never repeated.
2. A spike is a candidate only; the QIE must corroborate before the machine asks.
3. The question is phrased from the operator's own words (theme tokens), not a
   generic wellness prompt.
4. `QUIET` follow-ups are gentle by default. Silence is not a failure state.

---

## 6. ARCADE RANK

Self-care company, arcade evolution. Design rule: **reward consistency and
reflection, never volume.** Entries per day are capped, so typing more cannot
buy rank; returning tomorrow can.

XP is recomputed from the record on every call. Nothing is stored, so nothing
can desync or be inflated.

| Source | XP |
|---|---|
| Active day | +10 |
| Entry that day | +5 each, max 3 counted per day |
| Reflective entry (30+ words) | +5 once per day |
| Longest streak | +5 per day, max 30 days |

| Level | Rank | XP threshold |
|---|---|---|
| 1 | BOOT | 0 |
| 2 | SIGNAL | 100 |
| 3 | OPERATOR | 300 |
| 4 | SPECIALIST | 700 |
| 5 | ARCHITECT | 1500 |
| 6 | COMMANDER | 3000 |

The current streak survives if the last active day is today or yesterday.
Streak days follow the operator's local calendar day.

This rank is separate from the 812-badge codex (`docs/badges/`). Badges mark
discrete achievements; the Log rank is a continuous measure of the journaling
habit. They are not merged in this release.

---

## 7. PRIVACY AND DATA FLOW

| Path | Leaves the device? |
|---|---|
| `/system` | No |
| `/story` Layer 1 (local compression) | No |
| `/story` Layer 2 (AI narrative) | Yes — operator text, quantum state and recent entries go to Together AI via the server |
| Arcade rank | No |

Layer 2 is Usership-gated server-side. The local layer works for every user and
offline.

---

## 8. DEFECTS FOUND AND FIXED THIS RELEASE

| ID | Defect | Fix |
|---|---|---|
| D-01 | `/api/story` selected recent entries by event `log_entry` or `journal`, but journal entries are stored as `note`. The AI never saw the operator's actual writing. | `note` added to the filter in `api.ts` |
| D-02 | An argument could not be typed after `/story`, because the trigger fires before the argument exists. | 1200 ms deferred read of the latest text |
| D-03 | `/system` text was hardcoded in the component and had drifted from the trigger table. | Generated from the registry, with sync tests |

## 9. KNOWN ISSUES — NOT FIXED

| ID | Issue | Note |
|---|---|---|
| K-01 | `/qi [query]` has the same typing-order problem as D-02: it fires at `/qi ` before a query exists, and only works when pasted. | Same deferred-read fix applies. Left out of scope. |
| K-02 | `tsc --noEmit` reports 104 errors on `master` before this change (for example `badges.ts` `"mastery"` category, duplicate object key at `badges.ts:6883`). | Unchanged: zero new errors. The esbuild client build does not type-check, so these do not block the build. |
| K-03 | Tone lexicon is English only. | Cyrillic tokens are tokenised but not scored. |

---

## 10. VERIFICATION

```
npm run test:log        13 / 13 PASS
npm run client:build    OK
npm run server:build    OK
tsc --noEmit            104 errors before, 104 after, identical set
```

Tests cover: registry/trigger sync, `/system` contents and line contract,
period parsing, empty record, command-text exclusion, window and prior-delta,
themes and context aggregation, the four spike kinds, arcade XP cap, streak
and rank math.

---

## 11. NEXT

1. Wire the follow-up loop (section 5) to the morning question, behind QIE
   corroboration.
2. Persist a nightly `day` compression as a log row so `week`/`month`/`year`
   compress compressions instead of raw entries (the loop S-2 described).
3. Tune spike thresholds on real operator data.
4. Apply the deferred-read fix to `/qi` (K-01).
5. Surface arcade rank in the System tab widgets.

AUTHORIZED BY: S-2 // VADIK MARMELADOV
