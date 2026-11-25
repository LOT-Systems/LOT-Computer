<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / TECHNICAL ORDER
DOCUMENT:  LOT-TO-LOG-CMD-001
TITLE:     LOG COMMAND SYSTEM — /system INDEX · /story COMPRESSION · ARCADE
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
REV:       A
DATE:      2026-11-25
SESSION:   LOT-SR-20261125-01
================================================================================
```

## 0. SITUATION

The Log (Journal) is the passive AI surface of LOT®. The operator writes; the
machine records each entry with an environment snapshot (weather, humidity,
city, time zone, moon phase, Rokuyo, zodiac hour — `LogContext` in
`src/shared/types/index.ts`). No prompts, no questions inside the Log.

Slash commands typed into an entry are the operator's only *explicit* control
channel into the machine. Prior to this order:

| DEFICIENCY | EFFECT |
|---|---|
| `/system` help text was a hand-typed list in `Logs.tsx`, separate from the detector table in `logTriggers.ts` | Commands could exist undocumented or be documented but undetectable. Drift was already present (`/sil`, ❗ not listed; 18 entries hand-maintained). |
| `/story` read events `log_entry` / `journal` | Those events do not exist. Journal entries are `note`. **The story never saw a single journal entry** — silent erasure (see DOCTRINE, PLANNER-CONTEXT clause 1). |
| `/story` had no time scope | "Last 10 rows" is not a day, week, month, or year. No compression in the sense of the LOT loop. |
| No peak / spike / trend measurement | The AI was asked to "reflect the journey" without measured highs or lows — invites invented narrative. |
| No AI-outage path with content | On vendor failure the operator got one generic sentence. |
| Arcade evolution existed only as badges + `totalXP` (raw activity count) | No rank, no level curve, no anti-farming, no streak doctrine visible from the Log. |

## 1. MISSION

Make the Log command layer self-documenting, make `/story` a real
compression of day / week / month / year built on measured signal, and give
the operator a self-care Arcade progression readable from the Log. Do not
change how ordinary entries save.

## 2. EXECUTION — ARCHITECTURE

```
 OPERATOR TYPES "/story week" IN LOG
          │
          ▼
 logTriggers.detectNewTriggers()  ── LOG_COMMANDS registry (single source)
          │  story-mode
          ▼
 NoteEditor arms story → 1.2 s typing pause → parseStoryPeriod(text)
          │  POST /api/story { logText, period, quantumState, userIndex }
          ▼
 api.ts /story ── Usership gate (403 otherwise)
          │  Log.findAll(user, 5000, cols: event,text,metadata,context,createdAt)
          ▼
 compressStory(logs, period, now)           ← src/shared/utils/story-compression.ts
   · window filter · noise filter (xpForLog > 0)
   · mood valence + journal valence per day → HIGH / LOW PEAK
   · half-vs-half trend → RISING / FALLING / STEADY
   · activity SPIKE days · silence days
   · context: avg °C, humidity, sky, cities, moon, time band
   · Arcade delta (computeArcadeProgress at window start vs now)
          │  StoryDigest
          ▼
 formatDigestForPrompt(digest) → Together AI (aiEngineManager 'together')
          │  narrative ‖ composeFallbackStory(digest) on failure
          ▼
 Log.create(event 'generated_story', metadata { story, period, source, digest })
          │  { story, logId, period, source, digest }
          ▼
 Log renders: 📖 block = digest grid + story; entry text gets
 "📖 [WEEK] <story>" appended (persists across remount)
```

Pipeline mapping to the LOT doctrine *User data → Quantum Intent Engine →
AI vendor → LOT personalized data stored*: the digest is the deterministic
compression stage that sits ahead of the vendor. Quantum state + User Index
from the client QIE are passed through unchanged.

## 3. COMMAND INDEX (`/system`)

`/system` (alias `/commands`) renders `formatSystemHelp()` — generated from
`LOG_COMMANDS` in `src/client/utils/logTriggers.ts`. The header line carries
the operator's Arcade rank, level, and XP.

| CATEGORY | COMMAND | ALIASES / EMOJI | FUNCTION |
|---|---|---|---|
| NARRATIVE | `/story [day\|week\|month\|year]` | 📖 | Compressed story — peaks, context, XP |
| NARRATIVE | `/prayer` | `/candle`, 🕯️ | Contextual scripture |
| INTELLIGENCE | `/qi [query]` | — | Quantum Intelligence RFI |
| INTELLIGENCE | `/scan` | `/ai` | System status overview |
| INTELLIGENCE | `/qos` | `/os-report` | Quantum OS state analysis |
| INTELLIGENCE | `/assembly` | `/assemble` | Self-assembly directive |
| INTELLIGENCE | `/phys` | `/cohort-report` | Physiological cohort report |
| RITUAL | `/breathe` | `/breath` | 4-2-6 breathing |
| RITUAL | `/freeze` | `/pause`, 🧊 | Pause and reflect |
| RITUAL | `/silent` | `/quiet` | Signal silence check |
| RITUAL | `/fast` | — | Orthodox fasting calendar |
| ENVIRONMENT | `/synth` | `/keyboard`, 🎹 | Keyboard sound |
| ENVIRONMENT | `/radio` | 🎧 | Radio |
| ENVIRONMENT | `/night` | 🌙 | Dark mode |
| ARCADE | `/arcade` | `/xp`, `/level` | **NEW** — rank, level, XP, streak |
| SYSTEM | `/how` | — | LOT AI check-in (System tab) |
| SYSTEM | `/system` | `/commands` | This index |
| *hidden* | `/sil` | `/silence-check` | Silence pattern check |
| *hidden* | — | ❗ ‼️ | Cohort support flag |

**Adding a command (procedure):** add one row to `LOG_COMMANDS` and one
`LogTrigger` union member; add the handler branch in `NoteEditor`'s trigger
effect. `/system` updates itself. The test `registry keywords are unique`
rejects alias collisions.

Detection rule (unchanged): `/word` matches only as a whole token — `/storytelling`
does not fire `/story`. Detection is delta-based: editing around an existing
command does not re-fire it.

## 4. `/story` — COMPRESSION SPEC

### 4.1 Periods

| INPUT | PERIOD | WINDOW |
|---|---|---|
| `/story day` · `today` · `d` · `24h` | day | UTC midnight → now |
| `/story week` · `w` · `7d` | week | now − 7 d → now |
| `/story month` · `m` · `30d` | month | now − 30 d → now |
| `/story year` · `y` · `365d` | year | now − 365 d → now |
| `/story` (no argument) | **auto** | `day` if ≥ 3 meaningful records today, else `week` |

`/story:week` is also accepted. Unknown arguments fall back to auto.

**Timing:** detection fires the moment `/story` is a complete token, before the
operator can type the period. The editor therefore *arms* the story and
fires it after **1.2 s** without keystrokes. The 📖 block shows
`COMPRESSING WEEK…` while armed.

### 4.2 Signal rules

| SIGNAL | RULE |
|---|---|
| Meaningful record | `xpForLog(log) > 0` — excludes `weather_update`, `ping`, login/logout, settings, presence counters, empty notes |
| Journal text | `cleanJournalText()` — strips slash commands and everything after the first generated `📖` / `🕯️` block (machine output is never read back as the operator's voice) |
| Mood valence | `MOOD_VALENCE` table, −2…+2, weight 2. Unknown moods ignored, not guessed |
| Journal valence | 15-word positive / 15-word negative lexicon, clamped −2…+2, weight 1. Deliberately small and inspectable |
| Day score | weighted mean of the above; days with no valence signal are not scored |
| HIGH / LOW PEAK | max / min day score. One scored level only → reported as a single reading, not two peaks |
| TREND | needs ≥ 4 scored days; second-half mean − first-half mean ≥ 0.5 → RISING, ≤ −0.5 → FALLING, else STEADY |
| SPIKE | ≥ 3 active days, day count ≥ 4 and ≥ 2× median daily count |
| Context | mean Kelvin → °C, mean humidity, mode of sky description, up to 5 cities, up to 4 moon phases, mode of local time band (from `context.timeZone`) |

### 4.3 AI vendor contract

* Engine: `aiEngineManager.getEngine('together')` (existing fallback chain applies).
* Prompt receives the **digest**, at most 6–8 journal samples of ≤ 220 chars,
  and ≤ 6 self-care answers — never a raw dump.
* Word budget per period: day 80–140 · week 120–200 · month 160–260 · year 220–340.
* Instructions: second person; use only details in the digest; name the high
  and the low; Arcade mentioned at most once; end with one quiet forward sentence.
* Output < 40 chars or exception → `composeFallbackStory(digest)`; response
  `source: 'fallback'`.

### 4.4 Response

```ts
{ story: string, logId: string|null, period: 'day'|'week'|'month'|'year',
  source: 'ai'|'fallback', digest: StoryDigest | null }
```

Stored as `Log { event: 'generated_story', metadata: { story, period, source, digest, … } }`
— the compressed story becomes future context for the Memory Engine and QIE,
closing the loop.

## 5. ARCADE — SELF-CARE PROGRESSION (`src/shared/utils/arcade.ts`)

Doctrine: **XP rewards presence, not outcomes.** A heavy day logged honestly
earns the same as a bright day. No loss states, no shaming resets.

| PARAMETER | VALUE |
|---|---|
| Journal entry (`note`) | 10 XP + 1 per 80 chars (depth bonus max +10) |
| Emotional check-in | 6 · Memory / self-care answer 6–8 · Intention / plan 6 · Energy 5 |
| Generated story | 3 · Scripture 2 · Other meaningful events 1 · System noise 0 |
| Daily cap | 120 XP before multiplier (anti-farming) |
| Streak multiplier | ×1.00 day 1, +0.05 per consecutive day, cap ×1.50 |
| Missed day | multiplier returns to ×1.00 — XP already earned is never removed |
| Level curve | XP to reach level L = 25·(L−1)·L → 0, 50, 150, 300, 500 … |

| RANK | FROM LEVEL | GLYPH |
|---|---|---|
| INITIATE | 1 | · |
| OBSERVER | 3 | ∘ |
| KEEPER | 5 | ○ |
| NAVIGATOR | 8 | ◌ |
| CARTOGRAPHER | 12 | ◯ |
| STEWARD | 17 | ◎ |
| ARCHIVIST | 23 | ◉ |
| ORACLE | 30 | ● |

`/arcade` output (terminal grid):

```
RANK            ○ KEEPER
LEVEL           6
XP              812
NEXT LEVEL      ▓▓░░░░░░░░ 62/300
STREAK          4D · ×1.15
TODAY           +34 XP
ACTIVE DAYS     41
NEXT RANK       NAVIGATOR @ L8
```

Arcade XP is computed client-side from the cached `/api/logs` query (no new
request) and server-side inside the story digest. It is independent of the
existing `narrative.totalXP` (badge/Evolution widget) and does not modify it.

## 6. FILES

| PATH | STATUS | ROLE |
|---|---|---|
| `src/shared/utils/arcade.ts` | ADDED | Pure Arcade engine |
| `src/shared/utils/story-compression.ts` | ADDED | Pure digest, period parser, prompt + fallback composer |
| `src/client/utils/logTriggers.ts` | MODIFIED | `LOG_COMMANDS` registry, `formatSystemHelp()`, `arcade-status` trigger |
| `src/client/components/Logs.tsx` | MODIFIED | Registry-driven `/system`, `/arcade`, armed `/story` with period, digest grid |
| `src/client/queries.ts` | MODIFIED | `useStoryGeneration` types: `period`, `source`, `digest` |
| `src/server/routes/api.ts` | MODIFIED | `/api/story` rebuilt on the digest; `note` events now read |
| `scripts/tests/test-log-commands.ts` | ADDED | 20 deterministic tests |
| `package.json` | MODIFIED | `test:log-commands` script |

## 7. VERIFICATION

```
npm run server:build        → tsc exit 0
npm run client:build        → esbuild exit 0
npm run test:log-commands   → 20 PASS · 0 FAIL
```

Client `tsc --noEmit -p tsconfig.json` shows 4 errors in `Logs.tsx`
(lines ~101, ~105, ~3798, ~3865). All 4 exist on the parent commit
(`9f2b88c`) and are unchanged by this order. No new type errors.

**Not verified in this session:** a live browser run of the Log against a
database and Together AI (no DB or vendor key in the build container).
First production use should confirm: (1) `/story week` shows `COMPRESSING
WEEK…` then the grid + story; (2) `source: 'ai'` in the stored
`generated_story` metadata.

## 8. SERVICE & SUPPORT — KNOWN LIMITS

1. Day boundaries are UTC. An operator at UTC−8 writing at 22:00 local lands
   on the next UTC day. Local-day bucketing via `context.timeZone` is the
   next increment.
2. Journal valence is a 30-word lexicon — intentionally crude and
   transparent. It is a tiebreaker under mood check-ins, not a sentiment model.
3. Year stories read up to 5,000 most recent logs. Operators above that
   ceiling get an Arcade baseline that undercounts history; window counts
   are unaffected unless the year itself exceeds 5,000 records.
4. Rate limit unchanged: 5 stories / minute / user.
5. Proactive follow-up ("the machine asks first" on a spike or a pattern
   change) is **not** implemented here. `spikeDays` and `trend: FALLING` are
   the detection primitives a scheduled job can consume next.

```
================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-TO-LOG-CMD-001
================================================================================
```
