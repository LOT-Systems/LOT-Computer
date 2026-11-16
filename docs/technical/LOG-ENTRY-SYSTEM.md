<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG ENTRY SYSTEM — FIELD SPECIFICATION

```
╔══════════════════════════════════════════════════════════════════════╗
║  DOC ID     : LOT-SPEC-LOG-001                                       ║
║  REVISION   : A (2026-11-16)                                         ║
║  CLASS      : RESTRICTED // S-2 EYES                                 ║
║  STATUS     : OPERATIONAL                                            ║
║  OWNER      : S-2 — VADIK MARMELADOV                                 ║
║  SURFACES   : Log tab (Journal) · /api/story · shared compression    ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 0. BLUF

The Log is the passive AI input of LOT®. The user writes; the machine does not
prompt. Every entry is stored with its moment (time, weather, humidity, place,
sky). Two slash commands are the operator's console into that stream:

| Command            | Effect                                                                 |
|--------------------|------------------------------------------------------------------------|
| `/system`          | Prints every Log command, grouped, from a single registry.             |
| `/story [scope]`   | Compresses the user's `day` / `week` / `month` / `year` into a capsule and a narrative. Default `week`. |

---

## 1. MISSION

1. Record every click and entry as a **snapshot of the moment** — no photo, no
   audio. Context is the record.
2. Keep the Journal **prompt-free**. The AI reads; it does not interrogate.
3. **Compress** the stream into a story of the day / week / month / year and
   hand it back to the person, surfacing their **high and low peaks**, so the
   next question the machine asks is sharper.
4. Gamify **showing up**, not intensity (Arcade layer, §7).

---

## 2. PIPELINE

```
 USER ENTRY (Log)                       context: getLogContext()
   │  text + Kelvin temp, humidity, city, weather, moon, zodiac, rokuyo
   ▼
 LOG ROW  event='note'  ─────────────────────────────┐
   │                                                  │
   │  /story [scope]                                  │
   ▼                                                  ▼
 CAPSULE  (src/shared/utils/story-compression.ts)  ◄── emotional_checkin,
   │  deterministic · LOT-owned · offline-capable       answer, self_care,
   │  counts · moods · valence · shift · peaks           intention rows
   │  rhythm · field · sky · arcade XP
   ▼
 QIE STATE  (client: getUserState / getUserIndex — energy, clarity, alignment)
   ▼
 AI VENDOR  Together AI via aiEngineManager.getEngine('together')
   │  700 tokens · capsule + ≤8 journal lines · no email, no name
   ▼
 STORED    Log row event='generated_story'
           metadata: { story, scope, ai, capsule, quantumState, logText }
   ▼
 RETURNED  { story, scope, header[], capsule, ai, logId } → Log UI
```

The capsule is the boundary: **everything above the AI vendor is LOT's own
deterministic compression.** The vendor receives a summary, not the archive.

---

## 3. COMMAND REGISTRY

**File:** `src/client/utils/logTriggers.ts`

- `RULES` — what text fires which trigger (emoji or `/keyword`, word-bounded:
  `/storyteller` does **not** fire `/story`).
- `LOG_COMMANDS` — what `/system` shows: command, trigger, group, description.
- `missingFromRegistry()` — returns any keyword trigger absent from
  `LOG_COMMANDS`. The verify harness asserts it is empty. **Adding a command
  without documenting it fails the gate.**
- `renderSystemHelp()` — produces the `/system` lines. Contract: command lines
  begin with `/` and separate command from description with ≥2 spaces (the
  Log renderer splits on that gap).

### Groups

| Group       | Commands                                                |
|-------------|---------------------------------------------------------|
| NARRATIVE   | `/story [scope]` `/qi [query]` `/prayer` `/how`          |
| CONTEXT     | `/scan` `/qos` `/phys` `/assembly` `/silent`             |
| SELF-CARE   | `/breathe` `/freeze` `/fast`                             |
| MODES       | `/synth` `/radio` `/night` `/system`                     |

### Adding a command (procedure)

1. Add the trigger to the `LogTrigger` union.
2. Add a `RULES` entry (keywords lower-case, no slash).
3. Add a `LOG_COMMANDS` entry.
4. Add the handler branch in `NoteEditor`'s trigger effect (`Logs.tsx`).
5. `npm run verify:story` → must print `GREEN`.

---

## 4. `/story` — SCOPES

| Token(s)                      | Scope  | Window | Target length |
|-------------------------------|--------|--------|---------------|
| `day` `today` `d` `24h`       | day    | 1 d    | 80–120 words  |
| `week` `w` `7d` *(default)*   | week   | 7 d    | 120–180 words |
| `month` `m` `30d`             | month  | 30 d   | 150–220 words |
| `year` `y` `365d`             | year   | 365 d  | 200–280 words |

Unknown tokens fall back to `week`. Free text around the command is kept and
passed as `CURRENT ENTRY` (e.g. `rain all day /story day`).

The returned story is appended to the entry as `📖 [WEEK] …` so it survives
remount and becomes part of the record.

---

## 5. CAPSULE — FIELD DEFINITIONS

**Function:** `compressStory(logs, scope, now, lifetimeXP?, hourOf?)`

| Field            | Definition                                                                 |
|------------------|----------------------------------------------------------------------------|
| `entries`        | `note` rows with non-empty text in window                                  |
| `checkins`       | `emotional_checkin` rows                                                   |
| `answers`        | `answer` · `self_care` · `intention` (+ legacy names)                      |
| `words`          | whitespace tokens across entries                                           |
| `activeDays`     | distinct UTC dates with any in-window row                                  |
| `moods`          | top 5 check-in states by count                                             |
| `valence`        | mean of per-row valence, −2..+2, 1 dp                                      |
| `shift`          | 2nd-half mean − 1st-half mean (≥4 scored rows). `rising` ≥ +0.5, `falling` ≤ −0.5 |
| `high` / `low`   | max (>0) / min (<0) valence row; latest wins ties; 140-char excerpt + city + weather |
| `rhythm`         | dominant writing period in user's timezone: night (22–05) · morning · afternoon · evening |
| `context`        | avg °C (from Kelvin), avg humidity, ≤5 cities, modal moon phase, modal zodiac |
| `arcade`         | window XP + lifetime rank (§7)                                              |

### Valence sources

- `emotional_checkin` → `MOOD_VALENCE` table (e.g. `grateful +2`, `calm +1`,
  `tired −1`, `overwhelmed −2`).
- `note` → `textValence()`: small lexicon, negation flip (`not good` → −1),
  clamped to ±2. **Purpose is ranking peaks within one window. It never labels
  the user and is never shown as a score.**

### Terminal header (`renderCapsule`)

```
STORY           WEEK · 2026-11-09 → 2026-11-16
SIGNAL          3 ENTRIES · 2 CHECK-INS · 6/7 DAYS
MOOD            TIRED×1 · CALM×1
SHIFT           RISING (+2.2)
FIELD           10°C · 70% · BROOKLYN
SKY             WAXING · SCORPIO
ARCADE          +45 XP · LV 3 RECORDER · 880 → NAVIGATOR
```

---

## 6. ACCESS & DEGRADATION

| Condition                          | Story source               | Persisted |
|------------------------------------|----------------------------|-----------|
| Usership, data present, AI OK      | Together AI                | yes (`ai: true`) |
| Usership, AI throws                | `fallbackStory(capsule)`   | yes (`ai: false`) |
| Usership, empty window             | `fallbackStory` ("Nothing was recorded…") | no |
| No Usership                        | `fallbackStory` + Usership note | no |

`/story` **never** returns an empty panel. Rate limit: 5 req/min/user.

---

## 7. ARCADE LAYER (SELF-CARE GAMIFICATION)

Doctrine: reward the **act of recording and answering**. Never reward mood
intensity, never punish gaps, never surface streak loss. AI output earns 0.

| Event                | XP |
|----------------------|----|
| `note` (non-empty)   | 10 |
| `emotional_checkin`  | 5  |
| `answer`             | 5  |
| `self_care`          | 5  |
| `intention`          | 5  |

| LV | Rank          | Lifetime XP |
|----|---------------|-------------|
| 1  | SIGNAL        | 0           |
| 2  | OBSERVER      | 100         |
| 3  | RECORDER      | 500         |
| 4  | NAVIGATOR     | 1 500       |
| 5  | CARTOGRAPHER  | 4 000       |
| 6  | ARCHIVIST     | 10 000      |
| 7  | ORACLE        | 25 000      |

Lifetime XP is one grouped `COUNT … GROUP BY event` on the server — no row
transfer. Ranks sit beside, not inside, the existing Badge Codex
(`src/client/utils/badges.ts`) and the RPG narrative
(`src/server/utils/rpg-narrative.ts`).

---

## 8. PRIVACY

- Prompt to vendor: capsule + ≤8 journal lines (≤180 chars each) + QIE state.
  No email, name or user id. City is the only place datum.
- Server log line identifies by user id only (previous version logged email —
  removed).
- Capsule stored in the `generated_story` row so future compressions
  (month-of-weeks, year-of-months) can run on capsules instead of raw text.

---

## 9. VERIFICATION

```
npm run verify:story        # 9 checks, exit 0 = GREEN
yarn run build              # client esbuild + server tsc
```

Harness: `scripts/verify/story-compression.verify.ts` — scope parsing,
command stripping, trigger word-boundaries, registry completeness, valence
negation, week/day windows, peaks, shift, XP exclusion of AI output, rank
thresholds, renderer/prompt/fallback.

---

## 10. KNOWN LIMITS / NEXT

1. `activeDays` buckets by UTC date; move to user timezone.
2. Hierarchical compression: build `month` from stored `week` capsules, `year`
   from `month` capsules (capsules are already persisted for this).
3. **Spike follow-up:** when a new capsule's `shift` is `falling` and `low` is
   new, enqueue a Memory Engine question referencing that entry (the machine
   asks first, next morning).
4. `/level` command to show Arcade status without generating a story.
5. Lexicon valence is English-only.
