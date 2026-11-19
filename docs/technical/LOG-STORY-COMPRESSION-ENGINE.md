# LOT® LOG — STORY COMPRESSION ENGINE (SCE) v1
## Field Specification · Classification: INTERNAL · Authority: S-2

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS — FIELD SPECIFICATION                               ║
║  SUBSYSTEM: LOG (JOURNAL) · /system · /story                     ║
║  MODULE:    src/shared/utils/storyCompression.ts                 ║
║  STATUS:    OPERATIONAL · 13/13 SELF-TEST PASS · BUILD GREEN     ║
║  EFFECTIVE: 2026-11-19                                           ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. MISSION

The Log is a **passive AI UI**. The operator writes; the system never prompts inside the
editor. Every entry is stamped with the moment's context (time, city, weather, humidity,
moon phase, zodiac hour) — a snapshot without photo or sound.

SCE turns that stream into a **compressed story** of a day, week, month or year, and gives
it back to the operator. That closes the loop:

```
 ┌──────────────┐   ┌────────────────────┐   ┌─────────────────┐   ┌──────────────────┐
 │ LOT USER DATA│──▶│ SCE PACKET (pure)  │──▶│ AI VENDOR       │──▶│ generated_story  │
 │ note · check │   │ presence · shift   │   │ Together AI     │   │ log + packet     │
 │ -in · context│   │ peaks · context    │   │ (narrative only)│   │ stored per user  │
 └──────────────┘   │ arcade             │   └────────┬────────┘   └────────┬─────────┘
                    └─────────┬──────────┘            │ fail                │
                              │                       ▼                     ▼
                              │              fallbackNarrative()   📖 block in the Log
                              └───────────────▶ LEDGER (always) ──────────▶ next entry
```

The packet is the **only** structured data sent to the vendor, plus at most five entry
excerpts clipped to 200 characters. The vendor writes prose; it does not compute.

---

## 1. OPERATOR COMMANDS

| Command | Effect |
|---|---|
| `/system` | Lists every Log command, shortcuts, emoji triggers and what each entry records. |
| `/story` | Compressed story of the **last 7 days** (default). |
| `/story day` · `/story d` · `/story today` | Last 24 hours. |
| `/story week` · `/story w` · `/story 7d` | Last 7 days. |
| `/story month` · `/story m` · `/story 30d` | Last 30 days. |
| `/story year` · `/story y` · `/story 365d` | Last 365 days. |
| `📖` / `📖 month` | Emoji form, same horizons. |

**Settle timer.** `/story` is detected the moment the word is complete, but the request
fires **1200 ms after the last keystroke**. Every keystroke re-arms the timer, so
`/story month` can be typed in full and the horizon is read from the final text.

**Output in the Log.** A `📖 <HORIZON>` block shows:
1. **LEDGER** — fixed-width deterministic summary (always present, even offline).
2. **NARRATIVE** — 100–200 words, second person. Appended to the entry as `📖 …` so it
   survives a remount (unchanged behaviour).

---

## 2. STORY PACKET — FIELDS

| Field | Meaning | Source |
|---|---|---|
| `horizon`, `windowStart`, `windowEnd`, `spanDays` | Rolling window ending now. | `now − {1,7,30,365} d` |
| `entries`, `words` | Journal entries with text after stripping generated blocks. | `note` · `journal` · `log_entry` |
| `checkins` | Emotional check-ins in window. | `emotional_checkin` |
| `activeDays` | Distinct local days with any signal. | `context.date` (wall clock), else UTC |
| `prevEntries`, `shift`, `shiftPct` | Pattern change vs previous equal window. | see §3 |
| `timeOfDay`, `dominantTime` | night <05 · morning <12 · afternoon <17 · evening <22 · night | local hour |
| `cities`, `avgTempC`, `avgHumidity`, `weather`, `moonPhase` | Environmental context. | `log.context` (temperature stored in Kelvin) |
| `moods`, `valence` | Top 4 moods; mean valence in [−2, +2]. | check-ins + text lexicon |
| `peaks[]` | One HIGH ▲ and one LOW ▼ moment with excerpt + context line. | see §4 |
| `excerpts[]` | Up to 5 newest entries, 200 chars each. | journal |
| `arcade` | Lifetime XP, level, rank. | see §5 |

---

## 3. PATTERN SHIFT DOCTRINE

| Condition | `shift` |
|---|---|
| 0 entries in window | `silent` |
| entries > 0, previous window 0 | `new` |
| Δ ≥ +50 % | `surge` |
| Δ ≤ −50 % | `drop` |
| otherwise | `steady` |

`surge` and `drop` are the hooks the follow-up layer uses: a spike or a fall in writing is
the first signal that something changed. The prompt tells the vendor to name the shift
without interpreting it.

---

## 4. PEAK DETECTION

Each in-window moment is scored:

- **Journal entry:** `textValence(text)`, a small, auditable lexicon of 24 positive and
  24 negative markers, clamped to [−3, +3].
- **Check-in:** `MOOD_VALENCE[state] + 0.5 · textValence(note)`.

HIGH = max score if > 0. LOW = min score if < 0. Ties go to the most recent moment.
At least 2 moments are needed. No peaks are invented on thin data.

> The lexicon is deliberately transparent. It is a pointer, not a diagnosis. The vendor
> prompt forbids medical claims and invented events.

---

## 5. ARCADE EVOLUTION (SELF-CARE FRAMED)

XP rewards **showing up**, never the volume or intensity of distress.

```
XP = 10 · journal entries + 5 · check-ins + 15 · active days + 25 · stories
LEVEL n reached at 100 · n²   (100, 400, 900, 1600, …)
RANK  = RANKS[floor(level / 2)]
        Initiate → Observer → Keeper → Chronicler → Navigator → Archivist → Sage → Oracle
```

Arcade is **lifetime**: the server runs one extra query that returns only `event`, `text`
and `createdAt`, capped at 20 000 rows. It appears as the last LEDGER line:
`ARCADE  LV 3 KEEPER · 410/700 XP`.

---

## 6. SAFEGUARDS

| Risk | Control |
|---|---|
| The model compresses its own output | `stripGenerated()` drops `📖`/`🕯` paragraphs and slash commands before counting or excerpting. |
| Vendor outage | `fallbackNarrative(packet)` returns a deterministic story; `source: 'offline'`. |
| PII in server logs | Log line changed from the user's email to the user id and an entry count. |
| Over-fetch | Window query is limited by event type, by `createdAt ≥ now − 2·horizon` and to 5 000 rows. |
| Abuse | Existing route rate limit kept: 5 / minute. Usership gate kept. |
| Hallucination | Prompt: "Never invent events, people or places that are not in the data." |

---

## 7. DEFECT CORRECTED

**BUG-SCE-001 (pre-existing, severity HIGH):** `POST /api/story` selected journal entries
with `event === 'log_entry' || event === 'journal'`. The Log editor saves entries as
`event: 'note'` (see `LogEvent` in `src/shared/types/index.ts`, plus `memory.ts` and
`energy.ts`). **Result: `/story` never saw the operator's actual Journal.** It saw only
check-ins. SCE's `JOURNAL_EVENTS = ['note','journal','log_entry']` fixes this.

---

## 8. API CONTRACT

`POST /api/story` (auth, Usership, 5 req/min)

```jsonc
// request
{ "logText": "slept badly /story month", "horizon": "month",   // horizon optional; parsed from text if absent
  "quantumState": { … }, "userIndex": { … } }
// response
{ "story": "…", "horizon": "month", "ledger": "STORY  MONTH · …",
  "packet": { /* StoryPacket */ }, "logId": "uuid|null", "source": "ai|offline" }
```

The stored `generated_story` log now carries `metadata.horizon` and `metadata.packet`.
Future month and year compressions can compose from stored packets rather than raw logs.

---

## 9. VERIFICATION

```
npm run test:story          # 13/13 PASS — parser, stripper, valence, windows, shift,
                            # peaks, determinism, arcade curve, ledger, fallback
npm run build               # client + server GREEN
tsc (server)                # 0 errors
tsc (client)                # 104 errors, all pre-existing on master; 0 introduced
```

---

## 10. FILES

| File | Change |
|---|---|
| `src/shared/utils/storyCompression.ts` | **NEW.** SCE v1, pure, used by server and client. |
| `src/server/routes/api.ts` | `/story` rebuilt on SCE: horizon, packet, ledger, offline fallback, BUG-SCE-001. |
| `src/client/components/Logs.tsx` | Settle timer, horizon parsing, LEDGER render, expanded `/system`. |
| `src/client/queries.ts` | `useStoryGeneration` types: `horizon`, `ledger`, `packet`, `source`. |
| `src/client/utils/logTriggers.ts` | Doc comment for `story-mode`. |
| `scripts/tests/test-story-compression.ts` | **NEW.** Deterministic self-test. |
| `package.json` | `test:story` script. |

---

## 11. NEXT OBJECTIVES (NOT YET BUILT)

1. **Follow-up engine:** a scheduled job runs `compressStory(…, 'week')` per user. On
   `surge`, `drop` or a new LOW peak, it queues **one** morning question (System widget
   or LOT® device). It never posts inside the Log.
2. **Hierarchical compression:** build year stories from 12 stored month packets, not raw logs.
3. **Quantum Intent Engine bridge:** feed `shift` and `peaks` into QIE as signals.
4. **`/peaks` command:** LEDGER only, no vendor call, zero cost.
5. **Lexicon expansion** for RU/JA entries, matching the multilingual operator base.
