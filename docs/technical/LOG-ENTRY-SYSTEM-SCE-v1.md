<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG ENTRY SYSTEM — STORY COMPRESSION ENGINE (SCE v1)

```
╔══════════════════════════════════════════════════════════════════╗
║  CLASSIFICATION   INTERNAL // ENGINEERING                        ║
║  DOCUMENT         LOT-TECH-LOG-SCE-v1                            ║
║  DATE             2026-11-22                                     ║
║  AUTHORITY        S-2 // VADIK MARMELADOV                        ║
║  STATUS           OPERATIONAL · GREEN BUILD                      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. BLUF (BOTTOM LINE UP FRONT)

1. The Log is a **passive AI surface**: the operator writes, the machine never prompts inside the Log. Every entry is stored with its **environment snapshot** (temperature, humidity, weather, city, country, time zone, moon phase, rokuyo, hourly + western zodiac) — a record of the moment with no photo and no sound.
2. `/system` now renders a **grouped command index generated from one registry** (`COMMANDS` in `src/client/utils/logTriggers.ts`). The help screen can no longer drift from the real commands; a test asserts that every listed usage fires its trigger.
3. `/story` is now **time-scoped compression**: `/story day | week | month | year` (default `week`). A deterministic engine compresses the Log stream into a digest — entries, active days, streak, tone, places, temperature range, moon, recurring themes, **HIGH PEAK / LOW PEAK**, and **PATTERN SHIFTS** against the previous equal-length window. Together AI narrates the digest; if it is offline, a deterministic fallback story is returned.
4. **Critical defect fixed:** the previous `/story` filtered `event === 'log_entry' || 'journal'`, but Log entries are persisted as `event: 'note'`. The story generator had **never seen a single journal entry**. SCE reads `note | journal | log_entry`.
5. **Feedback-loop defect fixed:** generated stories (`📖 …`) and scriptures (`🕯️ …`) are appended into the note text. SCE strips them before compression so the machine never summarises its own output.
6. **Arcade evolution:** `/level` (aliases `/xp`, `/arcade`, `🕹️`) returns rank, level, XP bar, streak and XP breakdown. Self-care framed: daily caps, no leaderboards, ranks are stages of care.

---

## 1. MISSION

> Click by click, create a context. Entry by entry, compress a life into a story the person recognises.

The Log captures. The engine compresses. The story returns as the next prompt — closing the loop:

```
 ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐   ┌─────────────────┐   ┌──────────────────┐
 │ LOT USER DATA│──▶│ SCE DIGEST       │──▶│ QUANTUM INTENT   │──▶│ AI VENDOR       │──▶│ LOT PERSONALIZED │
 │ Log + context│   │ (deterministic)  │   │ ENGINE state     │   │ Together AI     │   │ DATA STORED      │
 │ moods, care  │   │ peaks · shifts   │   │ energy/clarity   │   │ narrates digest │   │ generated_story  │
 └──────────────┘   └──────────────────┘   └──────────────────┘   └─────────────────┘   └──────────────────┘
        ▲                                                                                        │
        └──────────── story ends with ONE question → answered in the next Log entry ─────────────┘
```

Design invariant: **the AI vendor receives compressed signal, never raw journal dumps.** Only the two peak excerpts (≤96 chars each) leave the building verbatim.

---

## 2. COMPONENT MAP

| # | Component | File | Role |
|---|-----------|------|------|
| 1 | Story Compression Engine | `src/shared/utils/story-compression.ts` | Pure, dependency-free. Scope parsing, text hygiene, valence, compression, rendering, fallback story, Arcade XP. Shared by client and server. |
| 2 | Command registry + triggers | `src/client/utils/logTriggers.ts` | `LogTrigger` union, detection rules, `COMMANDS` registry, `renderSystemHelp()`. |
| 3 | Log editor wiring | `src/client/components/Logs.tsx` (`NoteEditor`) | Fires triggers on text delta; debounced `/story`; renders `SYSTEM:`, `📖 SCOPE:` and `ARCADE:` blocks. |
| 4 | Client queries | `src/client/queries.ts` | `useStoryGeneration` (+`scope`, `digest`, `source`), `useArcadeLevel`. |
| 5 | API | `src/server/routes/api.ts` | `POST /api/story`, `POST /api/arcade`. |
| 6 | Test suite | `scripts/tests/test-story-compression.ts` | 37 assertions. `yarn test:story`. |

---

## 3. OPERATOR COMMAND REFERENCE (`/system`)

| Group | Command | Effect |
|-------|---------|--------|
| STORY | `/story` | Compressed story of the last 7 days |
| STORY | `/story day` | Last 24 h (aliases `today`, `d`, `24h`) |
| STORY | `/story week` | Last 7 days (aliases `w`, `7d`) |
| STORY | `/story month` | Last 30 days (aliases `m`, `30d`) |
| STORY | `/story year` | Last 365 days (aliases `y`, `365d`) |
| INTELLIGENCE | `/qi [query]` | Quantum Intelligence RFI |
| INTELLIGENCE | `/scan` | System status overview |
| INTELLIGENCE | `/qos` | Quantum OS state analysis |
| INTELLIGENCE | `/phys` | Physiological cohort report |
| INTELLIGENCE | `/assembly` | Self-assembly directive |
| SELF-CARE | `/how` | Open LOT AI check-in (System tab) |
| SELF-CARE | `/breathe` | 4-2-6 breathing |
| SELF-CARE | `/freeze` | Pause and reflect protocol |
| SELF-CARE | `/prayer` | Contextual scripture |
| SELF-CARE | `/fast` | Orthodox fasting calendar |
| SELF-CARE | `/silent` | Signal silence check |
| ARCADE | `/level` | Rank, level, XP, streak (aliases `/xp`, `/arcade`, `🕹️`) |
| ENVIRONMENT | `/night` · `/radio` · `/synth` | Dark mode · radio · keyboard sound |
| SYSTEM | `/system` | Command index (alias `/commands`) |

**To add a command:** (1) add the trigger to `LogTrigger`, (2) add a `RULES` entry, (3) add a `COMMANDS` row, (4) handle it in `NoteEditor`. The test `every registry usage fires its trigger` fails if (2) and (3) disagree.

---

## 4. STORY COMPRESSION ENGINE — SPECIFICATION

### 4.1 Scope resolution

`parseStoryScope(text)` matches `/story` followed by an optional scope token. Unknown token → `week`.
Because triggers fire on every keystroke delta, `/story` is **debounced 1200 ms** in the editor: the scope is parsed from the live value when the timer fires, so `/story month` typed at normal speed resolves to `month`.

### 4.2 Windows

| Scope | Window | Baseline window (for shifts) | Server fetch |
|-------|--------|------------------------------|--------------|
| day   | 1 d    | previous 1 d                 | 2 d |
| week  | 7 d    | previous 7 d                 | 14 d |
| month | 30 d   | previous 30 d                | 60 d |
| year  | 365 d  | previous 365 d               | 730 d (cap 4000 rows) |

Events read: `note`, `journal`, `log_entry` (journal) · `emotional_checkin` (mood) · `self_care`, `self_care_checkin`, `energy_checkin`, `answer`, `memory_answer` (self-care).

### 4.3 Text hygiene — `cleanJournalText`

- Drops lines beginning with `📖` or `🕯️` and the paragraph that follows (machine output appended to notes).
- Drops slash-command tokens (`/story`, `/system`, …).
- An entry that is empty after cleaning is **not** counted (a bare `/system` is not a journal entry).

### 4.4 Valence

Deterministic lexicon (≈40 positive / ≈40 negative terms) with single-token negation (`not good` → negative). Range −1…+1 per entry. Mood check-ins map to ±1 / 0. Tone labels:

| Valence | Label |
|---------|-------|
| ≥ 0.40  | BRIGHT |
| ≥ 0.10  | WARM |
| > −0.10 | LEVEL |
| > −0.40 | HEAVY |
| ≤ −0.40 | LOW |

### 4.5 Peaks

Strongest positive entry → **HIGH PEAK**; strongest negative entry → **LOW PEAK**. Ties resolve to the most recent. Excerpt ≤ 96 chars, with city if known.

### 4.6 Pattern shifts (the machine's follow-up trigger)

| Signal | Condition | Label |
|--------|-----------|-------|
| entries ↑ | current ≥ 2× baseline (baseline floor 1; requires ≥3 current or ≥2 baseline) | `WRITING SPIKE ×n` |
| entries ↓ | baseline ≥ 2 and current ≤ 0.5× baseline | `WRITING DROP ×n` |
| valence | both windows ≥ 2 entries, |Δ| ≥ 0.40 | `TONE LIFTING` / `TONE DARKENING` |
| night-writing | share of entries 23:00–04:00 rises ≥ 30 pts (≥3 entries) | `LATE-NIGHT WRITING RISING` |

These are the hooks for proactive follow-up: a future scheduled job can call `compressLogs(…, 'week')` per user and enqueue a morning question when `shifts.length > 0`.

### 4.7 Environment aggregation

Most frequent city (top 3), temperature range (stored °F → °C), dominant weather description, dominant moon phase, dominant phase-of-day (`night`, `pre-dawn`, `morning`, `late-morning`, `midday`, `afternoon`, `evening`, `late-evening`), recurring themes (top 5 non-stopword terms ≥3 chars appearing ≥2×).

### 4.8 Digest output (terminal grid — illustrative example)

```
SCOPE           WEEK · 7D
ENTRIES         4 · 31 WORDS
ACTIVE DAYS     4/7
STREAK          4D
TONE            WARM (+0.25)
PHASE           MORNING
MOOD            CALM
LOCATION        LOS ANGELES
TEMP            15–20°C · CLEAR SKY
MOON            WAXING GIBBOUS
THEMES          TEA · CALM · GRATEFUL
HIGH PEAK       "Shipped the project, proud and happy"
LOW PEAK        "Tired and anxious after work, tea did not help"
SHIFT           WRITING SPIKE ×4
```

### 4.9 AI narration contract (Together AI)

- Second person. **Only facts in the digest — never invent events, people, places.**
- Must name HIGH / LOW peaks when present, and any pattern shift.
- One clause of environment, not a weather report.
- Word budget: day 60–120 · week/month 100–200 · year 150–250.
- **Ends with one question** the operator can answer in the next Log entry (closes the loop).
- Token budget: 512 (700 for `year`).

### 4.10 Fallback chain

| Condition | Response `source` | Behaviour |
|-----------|-------------------|-----------|
| No Usership tag | `fallback` | Deterministic story + digest (previously: hard "available for Usership" refusal) |
| Empty window | `fallback` | "The Log stayed quiet…" — no vendor call |
| Vendor error / empty completion | `fallback` | Deterministic story + digest |
| Success | `ai` | Story persisted as `event: 'generated_story'` with `metadata.scope`, `metadata.digest`, `metadata.source` |

---

## 5. API CONTRACT

### `POST /api/story` — rate limit 5/min

Request:
```json
{ "logText": "string", "scope": "day|week|month|year", "quantumState": { }, "userIndex": { } }
```
Response:
```json
{ "story": "string", "logId": "uuid|null", "scope": "week", "digest": ["SCOPE           WEEK · 7D", "…"], "source": "ai|fallback" }
```
Backward compatible: `scope` optional (defaults to `week`); old clients ignore the new fields.

### `POST /api/arcade` — rate limit 10/min

Response:
```json
{ "lines": ["RANK            KEEPER", "…"], "level": 7, "rank": "KEEPER", "xp": 1890 }
```

---

## 6. ARCADE — GAMIFIED EVOLUTION (SELF-CARE DOCTRINE)

LOT is a self-care company. The Arcade rewards **showing up and being honest**, not volume.

### 6.1 XP economy (anti-grind)

| Action | XP | Daily cap |
|--------|----|-----------|
| Journal entry (non-empty after hygiene) | +10 | 5 entries |
| Words | +1 per 25 words | 20 per entry |
| Mood check-in | +5 | 3 |
| Self-care / memory answer | +8 | 5 |
| Current streak | +15 per day | — |

### 6.2 Curve

`xpForLevel(n) = 50 · (n − 1)²` → L2 = 50 · L5 = 800 · L10 = 4 050 · L20 = 18 050.

### 6.3 Rank ladder

| Level | Rank |
|-------|------|
| 1  | SIGNAL |
| 3  | OBSERVER |
| 6  | KEEPER |
| 10 | NAVIGATOR |
| 15 | CARTOGRAPHER |
| 21 | ARCHIVIST |
| 28 | ORACLE |
| 36 | SAGE |

Rules of engagement: no public leaderboard, no loss of XP, no shaming for broken streaks. The Arcade integrates with the existing Badge Codex (843 badges) and the RPG narrative (`src/server/utils/rpg-narrative.ts`) without replacing them.

---

## 7. PRIVACY & SECURITY POSTURE

- Digest computed server-side from the operator's own rows (`userId = req.user.id`).
- Vendor receives: counts, labels, top themes (single words), city names, two ≤96-char excerpts. Never the full journal.
- Story log line no longer prints the user's email; it logs user id + counts only.
- Rate limits unchanged for `/story` (5/min); `/arcade` 10/min.

---

## 8. VERIFICATION

| Check | Result |
|-------|--------|
| `yarn test:story` | **37 PASS · 0 FAIL** |
| `tsc -p tsconfig.server.json --noEmit` | 0 errors |
| `tsc -p tsconfig.json --noEmit` (client) | 104 errors — identical to baseline before this change, 0 new |
| `yarn build` (client + server) | GREEN (pre-existing duplicate-key warnings in `badges.ts` only) |
| Compiled module import (`dist/server/shared/utils/story-compression.js`) | OK — 22 exports |

---

## 9. KNOWN LIMITATIONS / NEXT ORDERS

1. **Valence lexicon is English-only.** Next: delegate per-entry valence to the QIE when available, keep lexicon as offline fallback.
2. **Proactive follow-up not yet scheduled.** Wire `compressLogs(…,'week').shifts` into `scheduled-jobs.ts` to enqueue a morning question on the System tab / LOT device when a shift is detected.
3. **Year scope caps at 4000 rows.** For heavy writers, pre-compress monthly digests into `generated_story` logs and compress the compressions (hierarchical compression: day → week → month → year).
4. **Digest font.** Terminal-grid padding renders in Arial for brand consistency; a monospace variant would align columns precisely.
5. `/story` debounce (1200 ms) means a very slow typist may get `week` before finishing `month`. Delete the `/story` command and type it again to re-run (triggers fire on appearance, not presence).

```
END OF DOCUMENT — LOT-TECH-LOG-SCE-v1
```
