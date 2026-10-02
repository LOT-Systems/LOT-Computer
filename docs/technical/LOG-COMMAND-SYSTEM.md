<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Made in the USA | brand.lot-systems.com
-->

```
DOCUMENT : LOG-COMMAND-SYSTEM
CLASS    : TECHNICAL REFERENCE
S-2      : VADIK MARMELADOV
DATE     : 2026-10-02
STATUS   : LIVE (client + server); tests green
```

# LOG COMMAND SYSTEM — `/system` · `/story` · Passive AI UI

## 1. PURPOSE

The Log is a passive AI interface. The user writes entries with no prompts and
no questions; every entry is stamped with context meta-data (weather, humidity,
sky, city, time, moon / zodiac). Slash commands are the *only* explicit
interface, and are optional.

| Command | Result |
|---|---|
| `/system` | Lists every command (generated from one registry). |
| `/story [day\|week\|month\|year]` | Compressed story of the period. Default: `week`. `/story today` = `day`. |

## 2. LOOP POSITION

```
LOT User data (Log rows + context meta-data)
   │
   ▼
Story Compression  (src/shared/utils/story-compression.ts)   ← deterministic, no vendor
   │   StoryDigest: entries, mood arc, environment, SPIKES, self-care, arcade rank
   ▼
LOT Quantum Intent Engine  (client userState / userIndex passed with the request)
   │
   ▼
AI vendor processor — Together AI  (aiEngineManager.getEngine('together'))
   │   vendor receives the digest only; it stores nothing
   ▼
LOT personalized data stored  (Log row, event = generated_story, metadata.digest)
```

Vendor independence is preserved: the digest is vendor-neutral. If the vendor
fails, `composeFallbackStory()` renders the same digest locally.

## 3. `/system` — COMMAND REGISTRY

Single source of truth: `LOG_COMMANDS` in `src/client/utils/logTriggers.ts`.
`formatSystemHelp()` renders it grouped (AI · SYSTEM · SELF-CARE · ENVIRONMENT)
and the Log help block displays it. **Adding a command = one `RULES` entry
+ one `LOG_COMMANDS` entry** — the test suite fails if the two drift.

Registered commands: `/story /qi /prayer /how /scan /assembly /qos /phys /sil
/system /breathe /freeze /silent /fast /synth /radio /night`.

## 4. `/story` — COMPRESSION SPEC

### 4.1 Windows
| Period | Window | Prompt length |
|---|---|---|
| day | 24 h | 60–100 words |
| week | 7 d | 100–160 |
| month | 30 d | 140–200 |
| year | 365 d | 180–260 |

### 4.2 StoryDigest fields
`entryCount · activeDays/totalDays · wordCount · moods + topMood · cities ·
avgTempC · avgHumidity · skies · moonPhases · spikes · careNotes · excerpts ·
rank`.  Only `log_entry` / `journal` rows count as journal text;
`generated_story` rows are never fed back (no self-echo). Excerpts are sampled
evenly across the window and cut to 200 chars.

### 4.3 Spike detection (follow-up trigger)
| Kind | Rule |
|---|---|
| `volume` | day entries ≥ max(3, 2 × median of active-day counts) |
| `silence-break` | first entry after ≥ 3 quiet days inside the window |

Median is used, not σ: one burst inflates σ on small windows and hides itself.
Spikes are the hook for machine follow-up (morning question / widget). They are
computed deterministically; the vendor only narrates them.

### 4.4 Arcade rank (gamified evolution)
`XP = entries + 3 × activeDays + 2 × moodCheckins + 5 × badgesEarned`

| Level | Title | XP ≥ |
|---|---|---|
| 1 | SIGNAL | 0 |
| 2 | OPERATOR | 25 |
| 3 | NAVIGATOR | 100 |
| 4 | ARCHITECT | 300 |
| 5 | STEWARD | 800 |
| 6 | ELDER | 2000 |

Design rule: showing up beats volume (active days weigh 3×). Self-care tone —
no pressure, no medical advice. `badgesEarned` comes from the client badge
engine (`getEarnedBadges()`), sent in `arcade`.

### 4.5 API
`POST /api/story` (Usership only, 5 req/min)
```
body     : { logText, period?, quantumState?, userIndex?, arcade? }
response : { story, logId, period, fallback? }
```
Period precedence: `body.period` → `/story <period>` in `logText` → `week`.
Reads ≤ 2000 Log rows from the last 365 days for the user.
Stored: `Log{event:'generated_story', metadata:{story, period, digest}}`.

## 5. FAILURE MODES

| Failure | Behaviour |
|---|---|
| Vendor error / no key | Local fallback story from digest; `fallback:true`; not stored |
| HTTP error client-side | Client shows its own fallback line |
| No data in window | Honest "nothing logged yet" message — never fabricated |
| Non-Usership user | 403 with explanatory message |

## 6. PRIVACY
Vendor sees the digest + ≤ 14 excerpts of 200 chars, no user id, email or
raw log dump. Story and digest live in LOT's DB (user-exportable).

## 7. VERIFICATION
```
yarn test:story        # 34 checks: windows, spikes, fallback, rank, registry↔detector parity
tsc --noEmit (strict)  # story-compression.ts, logTriggers.ts clean
```
Full `yarn build` was NOT run in this session (dependencies not installed in
the scheduled container); `Logs.tsx` / `api.ts` edits were reviewed by hand.
Run `yarn build` on first deploy.

## 8. NEXT (not built)
1. Morning question: use `spikes` to pick the follow-up prompt on any device.
2. Scheduled daily/weekly digest persisted per user (cron job) so `/story` is instant.
3. Arcade rank surfaced in the System Progress widget.
4. `/story` period picker chips under the entry.
