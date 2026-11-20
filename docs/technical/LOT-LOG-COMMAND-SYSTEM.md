<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG COMMAND SYSTEM — FIELD MANUAL
## Document: LOT-FM-LOG-v1 · Effective 2026-11-20 · Authority: S-2

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — FIELD MANUAL                          ║
║  LOG COMMAND SYSTEM · LOG COMPRESSION ENGINE (LCE) v1            ║
║  CLASSIFICATION: INTERNAL · DISTRIBUTION: ENGINEERING            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. BOTTOM LINE UP FRONT (BLUF)

1. The Log is a **passive AI surface**: the operator writes, the machine listens. No prompts, no questions inside the Log.
2. Every entry is stored as `event: 'note'` with a **context snapshot** (temperature, humidity, sky, city, country, time zone, moon phase, zodiac) captured by `getLogContext()`.
3. Slash commands typed *inside* an entry invoke the system. `/system` lists them all. `/story [day|week|month|year]` returns a **compressed story** of that period.
4. The **Log Compression Engine (LCE)** (`src/shared/utils/log-compression.ts`) turns raw entries into a bounded, identifier-free **compression packet**. That packet goes to the AI vendor (Together AI). If the vendor is down, the LCE writes the story by itself, so `/story` always returns text.
5. **Arcade layer**: level, rank, XP and streak come from the Log. The rule is self-care first: XP is earned by showing up, and the XP from word count is capped.
6. **Defect fixed:** in v1, `/story` looked only for `log_entry`/`journal` events. Log entries are `note`, so stories never contained what the operator actually wrote.

---

## 1. MISSION

Turn the operator's journal into a loop that keeps shrinking:

```
LOT USER DATA ──► LOT QUANTUM INTENT ENGINE ──► AI VENDOR (Together AI) ──► LOT PERSONALIZED DATA
 (Log + context)   (LCE packet · patterns ·      (narrative render of       (generated_story log,
                    peaks · arcade)               packet only)               packet metadata)
        ▲                                                                          │
        └──────────────────── compressed story returned to operator ◄──────────────┘
```

Each loop sends the operator a smaller, more accurate story of themselves. That story then shapes what they write next.

---

## 2. COMMAND REFERENCE (`/system`)

| Command | Trigger ID | Action | AI call |
|---|---|---|---|
| `/system`, `/commands` | `system-help` | Shows every command | No |
| `/story` | `story-mode` | Compressed story of the **week** (default) | Yes (falls back to the LCE) |
| `/story day` · `today` | `story-period` | Compresses the last 24h | Yes |
| `/story week` | `story-period` | Compresses the last 7 days | Yes |
| `/story month` | `story-period` | Compresses the last 30 days | Yes |
| `/story year` | `story-period` | Compresses the last 365 days | Yes |
| `/arcade`, `/xp`, `/level`, 🕹️ | `arcade-status` | Level, rank, XP bar, streak | No |
| `/prayer`, 🕯️ | `prayer-mode` | Contextual scripture | Yes |
| `/qi [query]` | `qi-rfi` | Quantum Intelligence RFI | Yes |
| `/scan` | `ai-scan` | System status overview | — |
| `/assembly` | `assembly-check` | Self-assembly directive | Yes |
| `/phys` | `phys-report` | Physiological cohort report | No |
| `/qos` | `qos-report` | Quantum OS state | No |
| `/fast` | `force-fast` | Orthodox fasting calendar | No |
| `/breathe` | `breathe` | 4-2-6 breathing | No |
| `/freeze`, 🧊 | `freeze-widgets` | Pause and reflect | No |
| `/silent` | `silent-mode` | Signal silence check | No |
| `/synth`, 🎹 | `toggle-synth` | Keyboard sound | No |
| `/radio`, 🎧 | `radio-toggle` | Radio | No |
| `/night`, 🌙 | `night-mode` | Dark mode | No |
| `/how` | `how-checkin` | Opens the System tab check-in | No |

Short forms that `parseStoryPeriod()` accepts when the story fires: `d`, `w`, `m`, `y`, `daily`, `weekly`, `monthly`, `yearly`, `annual`. An unknown argument falls back to `week`.

### 2.1 Trigger mechanics

- Detection lives in `src/client/utils/logTriggers.ts` and is pure. `/word` only matches as a whole token, so `/storyteller` does not fire.
- `detectNewTriggers()` fires on **deltas** only, so editing around an existing command does not fire it again.
- **Story debounce (1800 ms):** `/story` fires the moment it is typed, before any period argument. The call site waits 1.8 s after the last `story-mode` or `story-period` trigger. It then reads the period from the latest text. Typing `/story month` without pausing sends one request, for `month`.
- The story is appended to the entry as a `📖 …` paragraph so it survives a remount. The LCE strips 📖 and 🕯️ paragraphs and slash commands from entries before compressing, so machine text never comes back in as operator text.

---

## 3. LOG COMPRESSION ENGINE (LCE) v1

**Location:** `src/shared/utils/log-compression.ts`. The module is pure (no DB, no DOM, no network) and runs on both the client and the server.

### 3.1 Inputs

| Field | Source |
|---|---|
| Journal entries | `Log.event ∈ {note, journal, log_entry}` |
| Mood | `emotional_checkin.metadata.emotionalState` |
| Context | `Log.context` (city, weatherDescription, timeZone, astroMoonPhase, …) |
| Baseline | An equal-length window just before the period. The server fetches 2 × period. |
| Arcade history | Lifetime journal (`event, text, createdAt` only, ≤ 10 000 rows) |

### 3.2 Compression packet (output)

```
period · since · until · entries · words · activeDays · spanDays · coverage
dominantWindow (MORNING|AFTERNOON|EVENING|NIGHT, in the entry's own time zone)
windows{} · cities[≤3] · weather[≤3] · moonPhases[≤2] · moods{}
sentiment (mean, −1..1) · peaks[high?, low?] · pattern{signal, ratio}
excerpts[≤8 day / ≤12 other, ≤220 chars each] · arcade{xp, level, rank, …}
```

### 3.3 Signal doctrine

| Signal | Rule |
|---|---|
| **Peak HIGH** | The entry with the highest lexicon sentiment, only if > 0 |
| **Peak LOW** | The entry with the lowest lexicon sentiment, only if < 0 |
| **PATTERN SPIKE** | Current daily rate ≥ 1.5 × baseline, or baseline = 0 with current > 0 |
| **PATTERN DROP** | Current daily rate ≤ 0.5 × baseline |
| **STEADY** | Anything in between |
| **INSUFFICIENT** | Fewer than 3 entries in both the period and the baseline |

The sentiment lexicon is small on purpose (about 30 positive and 30 negative words) so that every score can be explained. The AI vendor writes the prose. It does not decide what counts as a peak.

### 3.4 Render functions

| Function | Purpose |
|---|---|
| `renderPacketHeader(p)` | Terminal-grid lines shown above the story (COMPRESSION / WINDOW / PLACE / SKY / PATTERN / ARCADE) |
| `renderPacketPrompt(p)` | Data block for the AI vendor. Contains no user ID, email or name. |
| `renderPacketStory(p)` | Writes the story without AI. Used for empty periods and when the vendor fails. |

---

## 4. SERVER CONTRACT

### `POST /api/story` (Usership only, 5 req/min)

Request:
```json
{ "logText": "string", "period": "day|week|month|year", "quantumState": {}, "userIndex": {} }
```
Response:
```json
{ "story": "string", "header": ["COMPRESSION ..."], "packet": { }, "period": "week", "logId": "uuid|null" }
```

Behavior:
1. It queries journal, mood and self-care events from the last 2 × period (≤ 4000 rows), plus the lifetime journal for the Arcade.
2. `compressLogs()` → packet. **If the period has 0 entries, the server makes no AI call** and returns `renderPacketStory()`.
3. Together AI (`aiEngineManager.getEngine('together')`, 512 tokens) writes the story from the packet. The prompt says: draw ONLY from the packet and never invent events.
4. The result is saved as `Log{event:'generated_story', metadata:{period, packet (excerpts emptied), …}}`.
5. If the vendor fails, the server still returns `renderPacketStory()` with the header and packet.
6. The server log line records `user=<id> period=<p> entries=<n>` only. v1 logged the email address and entry text; that has been removed.

### `POST /api/arcade` (authenticated, 20 req/min)

Response: `{ "arcade": { xp, level, rank, xpIntoLevel, xpForNextLevel, streakDays } }`. No AI call.

---

## 5. ARCADE LAYER — GAMIFIED EVOLUTION

LOT is a self-care company. The Arcade rewards **presence, not output**.

| Rule | Value |
|---|---|
| Entry XP | 10 for showing up + 1 per 10 words, **word bonus capped at +10** |
| Streak XP | +5 per consecutive day with at least one entry. The streak runs back from today, or from yesterday if there is no entry yet today. |
| Level curve | XP to reach L(n+1) = 50 + 25·(n−1) → 50, 75, 100, 125, … |
| Machine text | 📖 / 🕯️ paragraphs and slash commands earn 0 XP |

| Level | Rank | Cumulative XP |
|---|---|---|
| 1 | INITIATE | 0 |
| 2 | OBSERVER | 50 |
| 3 | SCRIBE | 125 |
| 4 | NAVIGATOR | 225 |
| 5 | OPERATOR | 350 |
| 6 | SENTINEL | 500 |
| 7 | ARCHIVIST | 675 |
| 8 | CARTOGRAPHER | 875 |
| 9 | ORACLE | 1100 |
| 10+ | ARCHITECT | 1350 |

`/arcade` display:
```
LEVEL           4 · NAVIGATOR
XP              287 TOTAL
NEXT LEVEL      █████░░░░░ 62/125
STREAK          6 DAYS
RULE            SHOW UP. ONE LINE COUNTS.
```

The Arcade complements the Badge Codex (`docs/badges/`, 843 badges) and `EvolutionWidget`. Badges reward specific words and moments. The Arcade is the overall progress track.

---

## 6. FILES OF RECORD

| File | Change |
|---|---|
| `src/shared/utils/log-compression.ts` | **NEW**: LCE v1 |
| `src/server/routes/api.ts` | `/story` v2 (period, packet, `note` fix, offline fallback, PII-free logging) · **NEW** `/arcade` |
| `src/client/utils/logTriggers.ts` | `story-period`, `arcade-status` triggers |
| `src/client/queries.ts` | `useStoryGeneration` (period/header/packet) · **NEW** `useArcadeStatus` |
| `src/client/components/Logs.tsx` | `/system` help v2, debounced period-aware `/story`, packet header, ARCADE block |
| `scripts/tests/test-log-compression.ts` | **NEW**: 8 tests (`yarn test:lce`) |

---

## 7. VERIFICATION

| Check | Result |
|---|---|
| `tsc --project tsconfig.server.json --noEmit` | PASS (0 errors) |
| `yarn build` (client + server) | PASS. The duplicate-key warning in `badges.ts` existed before this change. |
| Runtime import `#shared/utils/log-compression` from `dist` | PASS (14 exports) |
| `yarn test:lce` | **8/8 PASS** |
| Trigger detection (`/story`, `/story month`, `/storyteller`, `/arcade`, `/system`) | PASS |
| End-to-end against a live DB and the Together AI key | **NOT RUN**: no database or AI credentials in this environment |

---

## 8. NEXT ACTIONS (BACKLOG)

1. **Follow-up on spikes:** when `pattern.signal === 'SPIKE'` or a LOW peak appears, queue a single gentle follow-up question for the next morning check-in (System tab or the LOT® device). The Log stays passive.
2. **Scheduled compression:** a weekly, monthly and yearly job that runs `compressLogs()` and saves a `generated_story` without any user action, feeding the existing `lot_ai_story` (Job 24) surface.
3. **Story of stories:** build month packets from week packets, and the year from months, so the AI context stays bounded as history grows.
4. **Arcade × Badges:** award a badge when the operator reaches each rank.
5. **Client cache:** show the last `generated_story` for each period immediately while a new one generates.

---

```
END OF DOCUMENT · LOT-FM-LOG-v1 · S-2
```
