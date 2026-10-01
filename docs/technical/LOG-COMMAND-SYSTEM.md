<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
DOCUMENT : LOG-COMMAND-SYSTEM
CLASS    : RESTRICTED // S-2 EYES
S-2      : VADIK MARMELADOV
DATE     : 2026-10-01
STATUS   : IMPLEMENTED — /system catalog · /story compression
```

# LOG COMMAND SYSTEM — `/system` and `/story`

## 1. PURPOSE

The Log is a passive AI UI: the operator writes, never answers prompts. Slash
commands are the only *active* surface, and stay invisible until invoked.

| Command | Result |
|---|---|
| `/system` | Full command catalog, grouped MEMORY / STATE / RITUAL / SYSTEM |
| `/story` | Compressed story of the operator's week (default) |
| `/story day\|week\|month\|year` | Same, for the chosen window (`today` = `day`) |

## 2. LOOP POSITION

```
LOT User data (Log 'note' rows + check-ins + context)
   → compressLogs()            shared/utils/story-compression.ts   [deterministic]
   → LOT Quantum Intent Engine (client state: energy/clarity/alignment, User Index)
   → AI vendor (Together AI)   prompt = DIGEST numbers, not raw journal
   → LOT personalized data     Log row  event 'generated_story'  (+ appended to the entry)
```

The vendor receives a compressed digest and writes prose; it remembers nothing.
If the vendor is unreachable the deterministic digest story is returned instead
(terminal-format, same facts) — `/story` never answers with an empty apology.

## 3. `/system`

Source of truth: `LOG_COMMANDS` in `src/client/utils/logTriggers.ts`.
`buildSystemHelp()` renders it; `Logs.tsx` displays the SYSTEM block.
Adding a command = one catalog row + one trigger rule. The test suite asserts
every catalog row resolves to a live trigger (this caught `/silent` mapped to a
dead `sil-check` trigger during build).

## 4. `/story`

### 4.1 Client
- Fires on `/story` (or 📖). A 1.2 s grace window lets the operator finish
  typing `week|month|year` before the request is sent; the period is read from
  the live text at send time.
- Sends `{ logText, period, quantumState, userIndex }` to `POST /api/story`.
- Output renders in the 📖 block and is appended to the entry.

### 4.2 Server (`POST /api/story`, Usership, 5 req/min)
1. Window = rolling 1 / 7 / 30 / 365 days (UTC), plus the equal window before it.
2. Reads `note`, `emotional_checkin`, `energy_checkin`, `self_care_checkin`
   (≤2000 rows) and lifetime `note` rows (≤5000) for streak and rank.
3. `compressLogs()` → **StoryDigest**.
4. Prompt = rules + digest. Rules forbid invention; require naming high peak,
   low peak, and spike/drop.
5. Result stored as `generated_story` with `metadata.period` and `metadata.digest`.

### 4.3 StoryDigest

| Field | Meaning |
|---|---|
| entries / words / activeDays | Non-empty `note` rows in window |
| streak | Consecutive active days ending today (or yesterday if today is empty) |
| peakDay | Day with most entries |
| rhythm | night 0–6 · morning 6–12 · afternoon 12–18 · evening 18–24 (UTC) |
| moods | Top 5 check-in states |
| high / low | Entries with best / worst lexicon valence, 120-char excerpt |
| trend | `spike` ≥1.8× previous window · `drop` ≤0.5× · `steady` · `new` (no prior) |
| city | Most frequent log-context city |
| arcade | See §5 |

Spike/drop is the hook for the Log's follow-up behavior (Know-how §2): the
digest already carries the pattern-change signal a later job can act on.

Valence is a small whole-word lexicon — a cheap, offline, explainable signal,
not sentiment analysis. The AI layer reads the excerpts for real meaning.

## 5. ARCADE RANK

Self-care, gamified: rank is a by-product of showing up, never a score to chase.

`XP = entries×10 + activeDays×25 + streak×15`

| LVL | TITLE | XP |
|---|---|---|
| 1 | SIGNAL | 0 |
| 2 | OPERATOR | 100 |
| 3 | NAVIGATOR | 400 |
| 4 | ARCHIVIST | 1000 |
| 5 | COMMANDER | 2500 |
| 6 | ARCHITECT | 6000 |

Computed on read from lifetime Log rows; nothing new is persisted. It is
independent of the badge system (`utils/badges.ts`); wiring story use to badges
is an open item (§8).

## 6. DEFECT FIXED

`/story` previously filtered Log rows by `event IN ('log_entry','journal')`.
Log-tab entries are stored as `event: 'note'`, so the story never saw the
operator's journal entries. Now reads `note`.

## 7. VERIFICATION

`npx esr ./scripts/tests/test-story-commands.ts` — 16 assertions, pure modules,
no DB/network: trigger mapping, help completeness, period parsing, windows,
valence, streak edge cases, spike/drop, rank monotonicity, renderers.
Strict `tsc` on the two pure modules: clean.
**Not run:** full `yarn build` (no `node_modules` in this environment) and a live
Together AI call. Run both before deploy.

## 8. OPEN ITEMS

1. Morning question (machine asks first) fed by `trend: spike|drop`.
2. Badge hooks: first `/story`, 7-day streak, one per period.
3. Cache the weekly digest per user to skip re-query on repeated `/story`.
4. User-timezone windows (currently UTC).
5. `/story` result row in the Log is appended text; consider a distinct entry.

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOG-COMMAND-SYSTEM
```
