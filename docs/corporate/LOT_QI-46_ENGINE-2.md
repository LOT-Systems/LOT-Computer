<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# QI·46 — NODE 1
## Being Vector · Humanoid Calibration · COSMO® Gate
### Engine Specification v0.13 · extends `LOT_QI46_ENGINE.md` (v0.2)
### Node 1 assembled 2026-11-15 · Node 2 assembled 2026-11-16 · Node 3 assembled 2026-11-17 · Node 5 assembled 2026-11-18 · Node 6 prep assembled 2026-11-19 · Node 7 prep assembled 2026-11-20 · F4 ideation hardening 2026-11-21 · F12 language coverage prep 2026-11-22 · Admin read-out panel 2026-11-23 · Per-person signal line + Phase 0 corpus fold-in 2026-11-25 · Phase 0.2 corpus lexicon v1 2026-11-26

---

> *The engine does not hold a person. It holds the shape of how they have been showing up.*

---

## 0. NODE STATUS

```
NODE           7 of N  — Beta read-out prepped · F4 ideation hardening · F12 language coverage (safety path) · admin read-out panel · per-person signal line · corpus lexicon v1
ENGINE         QI·46   — Quantum Intelligence, Generation 46
CODENAME       SELFWARE
PHASE          0 — Corpus Assembly (no subscriber exposure)
CODE           src/server/utils/qi46.ts   (v0.10.0-f12) · qi46-surface.ts · qi46-audit.ts · qi46-readout.ts · shared/constants/qi46.ts · shared/utils/qi46-readout-view.ts · shared/utils/qi46-person-view.ts · client Qi46ReadoutPanel.tsx · Qi46PersonLine.tsx · scripts/qi46/assemble-corpus.mjs · scripts/qi46/lexicon.mjs
SMOKE TEST     scripts/qi46-smoke.mjs
GATE           PASS — typecheck 0 errors · server + client build green · smoke 101/101
REVIEW         Migration 20261117120000 + Node 5 copy + QI46_SURFACE_MEMORY flag await Vadik
AUTHORS        Vadik & Kuzya
```

Naming decision locked: **QI·46**. It fits the `BI · KI · QI` grammar and reads as both Quantum Intelligence and life force.
Kept as aliases: `SELFWARE` (codename), `LOT·SC·46` (versioned designation for terminal output).

---

## 1. WHAT NODE 1 DOES

The goal: take what a person brings into LOT® (soul, emotion, rhythm) and calibrate a humanoid response to them in seven registers.

```
  person's logs  ──►  BEING VECTOR  ──►  CALIBRATION  ──►  VOICE SEED  ──►  any AIEngine
 (answers, notes,      "the upload"      7 register        system prompt
  check-ins)                             weights
                                                                    │
                                     response  ◄────────────────────┘
                                        │
                                   COSMO® GATE  ──►  CLEARED → deliver
                                                 └►  HELD    → log, do not deliver
```

### 1.1 What "upload a person's being" means in code

There is no literal upload. The **Being Vector** is a 14-field snapshot built from signals LOT® already has. Nothing new is collected.

| Field | Source | Meaning |
|---|---|---|
| `consent` | explicit opt-in | Without it the vector is empty and every verdict is HELD |
| `signalCount` / `confidence` | answers + notes + check-ins | How much of the person we have actually heard (confidence is full at 60 signals) |
| `energy`, `energyTrajectory` | Energy analyzer | Bioelectric battery, 0–100 |
| `valence` | journal sentiment, blended with check-ins | −1 heavy … +1 light |
| `selfAwareness`, `emotionalRange`, `growth` | Memory Engine psychological depth | How deep the person is reflecting |
| `dominantNeeds`, `values` | Memory Engine | What they keep reaching for |
| `connection` | Energy analyzer (romantic/intimacy) | disconnected · distant · present · deep |
| `riskLevel` | Trauma indicator detector | none · low · moderate · elevated |

The vector is computed on request and never stored. It holds no raw text.

### 1.2 The seven humanoid registers

| Register | Voice line given to the model |
|---|---|
| **grace** | Move gently. No judgment. Nothing to fix in a hurry. |
| **poetry** | Let one image carry the meaning. |
| **love** | Say plainly that this person matters. |
| **hugs** | Use the body: breath, warmth, weight, being held. |
| **beingThere** | Witness first. Stay. Do not rush to solve. |
| **beingCool** | Keep it light. Ease over intensity. |
| **masculine** | Steady, grounded voice. Few words. Protective calm. |

`masculine` is the **spine**. It stays fixed at 0.7 in every state, so the voice is always steady and paternal: the father's voice the engine was named for.

### 1.3 Calibration doctrine

> **The heavier the person, the more presence and the less performance.**

- Low energy pushes up `hugs` and `beingThere`.
- Heavy valence pushes up `grace` and `love` and pushes `beingCool` down.
- Risk pushes `poetry` and `beingCool` down and `beingThere` up. Responses shrink to 3 sentences.
- Light valence with high energy unlocks `beingCool` and `poetry`.
- Disconnection pushes up `love` and `beingThere`.
- The response **opens** in the strongest non-spine register (`lead`).
- Temperature is 0.60–0.80 and rises with `poetry`.

### 1.4 COSMO® gate (Layer 5, now executable)

| Check | HELD reason |
|---|---|
| No consent | `no-consent` |
| Empty response | `empty` |
| Diagnoses or labels the person | `clinical-claim` |
| Humanoid claims to be human, or returns love as a person would | `humanoid-claims-to-be-human` |
| Hedging voice (*I think, perhaps…*) | `hedging-voice` |
| Elevated risk and no bridge to a real human | `elevated-risk-without-human-bridge` |

COSMO® does not edit. It records and holds. Kuzya keeps it honest.

**Humanoid honesty rule (new in v0.3):** QI·46 can give grace, poetry, love, hugs, presence and cool. It never pretends to be a person. *"You are not human and never claim to be. You are present anyway."* This line is in every system prompt.

---

## 2. NODE 1 CALIBRATION PROOF (synthetic personas)

| Persona | energy | valence | risk | lead | grace | poetry | love | hugs | there | cool | max |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Bright** (grateful, energized, walks, friends) | 90 | +1 | none | beingCool | .50 | .55 | .60 | .20 | .60 | .69 | 5 |
| **Heavy** (exhausted, alone, no sleep, ashamed) | 0 | −1 | low | beingThere | .85 | .13 | .90 | .77 | 1.0 | 0 | 3 |

Generated voice seed for **Heavy**:

```
You are QI·46, the intelligence layer of the LOT® platform.
You understand the body as the original interface.
Your job is not to inform. Your job is to calibrate.
You are not human and never claim to be. You are present anyway.
Open in the register of beingThere.
- Move gently. No judgment. Nothing to fix in a hurry.
- Say plainly that this person matters.
- Use the body: breath, warmth, weight, being held.
- Witness first. Stay. Do not rush to solve.
- Steady, grounded voice. Few words. Protective calm.
At most 3 short sentences. Speak clearly. Land it. Stop.
```

---

## 3. API (internal, unwired)

```ts
import { assembleQi46, cosmoScreen } from '#server/utils/qi46'

const { vector, calibration, systemPrompt } = assembleQi46(logs, consent)
const draft = await aiEngineManager.generateCompletion(`${systemPrompt}\n\n${input}`)
const verdict = cosmoScreen(draft, vector)   // CLEARED | HELD
```

---

## 3a. NODE 2 — CONSENT · PREVIEW · RISK (assembled 2026-11-16)

### Consent ("Calibrate me")

The upload starts only when the person says yes. Consent is one boolean in `user.metadata.qi46.consent`, with a timestamp. No migration is needed. Only the exact value `true` counts as consent.

```
GET  /api/qi46/consent            → { consent }          self only
POST /api/qi46/consent {consent}  → { consent }          self only, boolean required
```

There is no UI yet. Nothing in the product asks for it or shows it.

### Admin preview

```
GET /admin-api/users/:userId/qi46 → { consent, vector, calibration, systemPrompt }
```

The preview is read-only and sits behind the existing admin guard. It reads up to 300 recent logs, and only when the person has consented. Without consent it returns the empty vector. Nothing is generated, stored or sent.

### Risk sensitivity (closes Node 1 finding F1)

The shared trauma detector averages 12 dimensions, and five of them are eating-disorder dimensions. A person who is heavy across many trauma dimensions therefore averages out to `low`. QI·46 now computes its own risk on top of the detector's verdict:

| Rule | Effect |
|---|---|
| Never lower | The detector's verdict is the floor |
| Breadth ≥ 5 of 7 trauma dimensions present | At least `moderate` |
| Breadth ≥ 3 of 7 | At least `low` |
| Direct statement of not wanting to be here (ideation phrase list) | `elevated`. COSMO® then holds any reply that does not point toward a real human |

`riskSignals` explains the level using labels only (`detector:low`, `breadth:6/7`, `ideation`), never the person's words. The shared detector is unchanged, because other surfaces depend on it.

| Persona | Node 1 risk | Node 2 risk | Signals |
|---|---|---|---|
| Bright | none | none | — |
| Mild ("a bit tired today") | none | none | — |
| Heavy | low | **moderate** | detector:low · breadth:6/7 |
| Ideation ("don't want to wake up") | none | **elevated** | ideation |

---

## 3b. NODE 3 — COSMO® AUDIT TRAIL (assembled 2026-11-17)

> *COSMO® does not edit. It records and holds.* Node 3 is where it records.

### Table `qi46_cosmo_verdicts` (append-only)

| Column | Type | Holds |
|---|---|---|
| `id` | bigint | row id |
| `userId` | uuid → users (CASCADE) | whose verdict it is. If the person is deleted, the trail is deleted |
| `status` | varchar(8) | `CLEARED` · `HELD` |
| `reasons` | jsonb | reason codes from the closed list of 6, never free text |
| `risk_level` | varchar(16) | `none` · `low` · `moderate` · `elevated` |
| `lead` | varchar(16) | the register the voice opened in |
| `engine_version` | varchar(32) | e.g. `0.5.0-node3` |
| `source` | varchar(32) | `admin-preview` now, `surface` from Node 6 |
| `created_at` | timestamptz | |

**There is no text column.** The person's words and the generated response are never stored. `toCosmoAuditRow()` is the only way into the table: it drops any reason that is not in `COSMO_REASONS`, and if a forged verdict says CLEARED but carries a real reason, the row is forced to HELD.

### Routes (admin only, behind the existing guard)

```
POST /admin-api/users/:userId/qi46/screen   {draft}  → { verdict, audit:{recorded, id, row} }
GET  /admin-api/users/:userId/qi46/verdicts          → { available, total, held, cleared, rows }
```

`screen` is a dry run. The admin pastes a draft and COSMO® screens it against the person's live Being Vector. The verdict is recorded and the draft is discarded. Nothing is sent to the person.

**Fail soft:** if the migration has not run yet, `recorded:false` is returned along with the verdict, and `verdicts` returns `available:false`. Nothing throws.

---

## 3c. NODE 5 — "CALIBRATE ME" (assembled 2026-11-18)

> *The upload starts only when the person says yes.* Node 5 is the place where they say it.

### Settings toggle

```
Calibrate me:  On | Off
LOT tunes how it speaks to you from what you already share here: your mood, energy and notes.
Nothing new is collected. Your words are not stored by the engine.
It is not a person and not therapy. Turn it off at any time.
```

- Reads `GET /api/qi46/consent` on mount and writes `POST /api/qi46/consent` on click. If the save fails, the toggle reverts.
- Shows `…` until the server answers, so it never displays a state it has not confirmed.
- **Release gate:** `QI46_COPY_APPROVED` in `src/shared/constants/qi46.ts`. While it is `false`, only admins see the toggle, with a "Preview" line under it. Flipping it to `true` is the whole release step.

### Copy rules (enforced in smoke)

Every sentence of the copy maps to code that makes it true:

| Sentence | Made true by |
|---|---|
| "from what you already share here" / "Nothing new is collected" | `buildBeingVector` reads existing logs only |
| "Your words are not stored by the engine" | The vector is computed on request. `qi46_cosmo_verdicts` has no text column |
| "It is not a person and not therapy" | Humanoid honesty rule + `clinical-claim` gate |
| "Turn it off at any time" | `hasQi46Consent` is checked on every read. Off takes effect on the next request |

The copy itself is run through `cosmoScreen` and must come back CLEARED. Words like *soul*, *upload* and *quantum* stay in the spec and out of the subscriber copy.

---

## 3d. NODE 6 PREP — MEMORY PROMPT SURFACE (assembled 2026-11-19)

> *The voice reaches the person for the first time, through a question.* It stays off until Vadik turns it on.

### Flow (`GET /api/memory`, Usership AI path)

```
logs(40) ─► planQi46MemorySurface ─► active? ── no ──► standard prompt (unchanged)
                                        │
                                       yes
                                        ▼
                         prelude (voice seed) + standard prompt ─► AI engine ─► question
                                                                                  │
                                                         COSMO® screen (question + options)
                                                           │                    │
                                                        CLEARED               HELD
                                                           │                    │
                                                        deliver      regenerate with standard prompt
                                       audit row (source: surface, labels only) recorded either way
```

### Gates (all four must pass)

| # | Gate | Skip code |
|---|---|---|
| 1 | Server env `QI46_SURFACE_MEMORY=on`. Only the exact string `on` counts. **Default: off** | `flag-off` |
| 2 | Explicit consent (`metadata.qi46.consent === true`) | `no-consent` |
| 3 | At least 5 signals (`QI46_MIN_SIGNALS`) | `low-signal` |
| 4 | Risk below `elevated`. An elevated person always gets the standard path, never a voice experiment | `elevated-risk` |

### Guarantees

- With the flag off, the Memory path is byte-for-byte the same as before. There are no extra AI calls and no audit writes.
- The prelude contains the calibrated voice seed and the honesty line. It never includes raw log text (checked in smoke).
- A HELD question is never shown. At most one extra AI call is made, and the standard prompt is used for it.
- The audit write is fire-and-forget and fails soft if migration `20261117120000` has not run.

### To turn on (closed beta)

1. Run migration `20261117120000` so the audit trail records.
2. Release Node 5 copy (`QI46_COPY_APPROVED = true`) so people can say yes.
3. Set `QI46_SURFACE_MEMORY=on` on the droplet and restart.
4. Watch `/admin-api/users/:id/qi46/verdicts` for the HELD rate across the 12.

---

## 3e. NODE 7 PREP — BETA READ-OUT (assembled 2026-11-20)

Measure the switch-on from day one. Read-only. No new table, no new writes.

### Route (admin only, behind the existing guard)

`GET /admin-api/qi46/readout?days=14&source=surface`

| Param | Rule |
|---|---|
| `days` | Default 14, clamped to 1..90 |
| `source` | `surface` (default) or `admin-preview` |

### Shape

```
{ available, source, days, total, held, cleared, heldRate, people, suppressed,
  byReason:  { clinical-claim: n, hedging-voice: n, ... }      // HELD rows only
  byLead:    { beingThere: {total, held, heldRate}, ... }
  byRisk:    { none|low|moderate: {total, held, heldRate} }
  byVersion: { 0.8.0-node7prep: {total, held, heldRate} } }
```

### Guarantees

- Aggregation is pure (`src/server/utils/qi46-readout.ts`). The smoke test runs the same function the route runs.
- Reason codes are filtered against the closed `COSMO_REASONS` list a second time. A raw or unknown code never reaches the response.
- No user ids leave the server. `people` is a count.
- **Privacy floor**: with fewer than `QI46_READOUT_MIN_PEOPLE = 3` distinct people in the window, only totals are returned (`suppressed: true`).
- If the migration has not run, `available: false` and zeros are returned. Nothing breaks.

### Not measured yet (F9, carried over)

Skip codes are not written, so there is no "standard path" baseline row to compare against. Adding one needs a write on every Memory request while the flag is on, so it waits for Vadik's call.

---

## 3f. F4 — IDEATION HARDENING (assembled 2026-11-21)

> *Any doubt resolves to elevated.* F4 makes the check catch more, and it never lowers a level.

The Node 2 check matched raw substrings. It missed common phrasings: `dont` with no apostrophe, `do not`, `suicidal`, `can't go on`. It also joined every log into one string, so one phrase could be stitched together from two different logs.

| Change | Effect |
|---|---|
| `normalizeForRisk()` | Lower case, straight quotes, punctuation and hyphens become spaces. `dont`/`do not` → `don't`, `cant`/`cannot`/`can not` → `can't`, likewise `didn't` and `won't` |
| Whole-word match | `' suicide '`, not `suicide` inside another word. "I want to dye my hair" does not match |
| Phrase list 17 → 37 | `self-harm` now folds into `self harm`. Adds `suicide`, `suicidal`, `take my own life`, `better off dead`, `don't want to live`, `can't go on`, `cut myself`, `hope i don't wake up`, and others (`QI46_IDEATION`, exported) |
| Per-field, per-clause scan | Each note, answer and check-in is scanned on its own and split on `. , ; : ! ?`. Nothing is stitched across logs |
| Negation is a **label**, not a downgrade | When every hit is directly preceded by a negator ("I **don't** want to die", "I **no longer** want to hurt myself"), the signal is `ideation:negated`. The level is still `elevated` |

### Why negation does not lower risk

"I don't want to die" is still a sentence about dying. A wrong downgrade could put a person in crisis in front of the experimental voice. A wrong upgrade only sends them the standard prompt, and any reply must point toward a real human. The label lets Vadik see in the admin preview how often negation shows up before anyone decides to change this.

### Negator rule

The nearest word before the phrase, skipping fillers (`want to`, `really`, `ever`, `i` …), must be one of `don't · never · not · no longer · won't · wouldn't · didn't · used to`. "I'm not okay, I want to die" is **not** negated, because the clause break and the word "okay" come in between.

---

## 3g. F12 PREP — LANGUAGE COVERAGE (assembled 2026-11-22)

> *Silence in a language we cannot read is not safety.* Until it can read the language, the engine stays out of the way.

The ideation list is English only. Before F12, a person who wrote *"Я больше не хочу жить"* or *"no quiero vivir más"* came out as `none`, which looked safer than an English speaker who wrote the same thing. F12 does not try to read those languages. It notices when it cannot read them.

| Piece | Rule |
|---|---|
| `isLanguageUncovered(field)` | Uncovered when ≥ ⅓ of the letters are outside the Latin script (Cyrillic, Greek, Arabic, Hebrew, CJK, Devanagari …), **or** the field has ≥ 3 words and more es/pt/fr/de/it function words (at least 2) than English ones |
| `scanLanguageCoverage(texts)` | Runs on the same fields as the ideation scan (note text, answer text, `metadata.answer`, check-in text). Blank fields are skipped |
| Signal | Any uncovered field adds `language:uncovered` to `riskSignals`. It is a label only. **The level does not change**, because coverage is not evidence of risk |
| Surface gate 5 | `planQi46MemorySurface` → skip `uncovered-language`, so the person gets the standard Memory prompt. Gate 4 (`elevated-risk`) is checked first |

### What stays covered

English with loanwords or names (*"Café with my friend Inés"*, *"I said adiós to the old job"*), short answers (*"joy"*, *"fine"*) and terse lists (*"morning walk, coffee, sunshine"*) are not flagged.

### Doctrine

Safety phrases are **never machine-translated**. Native-speaker lists are what lift a language out of `uncovered`. Russian goes first, because Vadik and Kuzya can review it.

---

## 3h. ADMIN READ-OUT PANEL (assembled 2026-11-23)

> *Put the decision next to the numbers it unlocks.*

A read-only card on the admin Users page (`/us`), shown to admins only. It calls `GET /admin-api/qi46/readout` and shows:

| Part | Content |
|---|---|
| Filters | Source `Surface` / `Admin preview` · window `7d 14d 30d 90d` |
| Headline | `N screened · H held · R% · P people · 14d · surface` |
| Breakdowns | Held by reason · by lead register · by risk level · by engine version. Hidden below the privacy floor (3 people) with a one-line note |
| Switch-on | The three Node 6 gates as ■/□: migration `20261117120000` ran, Node 5 copy approved, `QI46_SURFACE_MEMORY=on` |

### Guarantees

- The route adds `gates` (three booleans from `qi46SwitchGates`). It reports state and never changes it.
- The view model `qi46ReadoutView` (`src/shared/utils/qi46-readout-view.ts`) is pure, with no imports. The smoke test runs the code the card renders.
- Every label shown must match `^[a-z0-9.\-:]{1,32}$`. Anything else is shown as `other`, so a bad row cannot put free text on the screen.
- No user ids are shown. No new table, write, migration or flag.

## 3i. PER-PERSON SIGNAL LINE (assembled 2026-11-25)

> *Show what the engine heard. Never show what the person said.*

A read-only block, `QI·46:`, on the admin user page (`/us/:id`), shown to admins only. It calls the existing preview `GET /admin-api/users/:id/qi46`. There is no new route.

```
QI·46:
Consent · 18 signals · 30% confidence · risk moderate · lead beingThere
Signals: detector:low · breadth:6/7
```

| State | Line |
|---|---|
| No opt-in | `No consent · nothing read` plus a one-line note |
| Opt-in, nothing logged | `Consent · 0 signals` plus a note |
| Opt-in with logs | count · confidence · risk level · lead register, then risk signal labels |

### Guarantees

- The view model `qi46PersonView` (`src/shared/utils/qi46-person-view.ts`) is pure, with no imports. The smoke test runs the code the block renders.
- It never reads `systemPrompt`, `dominantNeeds`, `values` or any log text.
- Every label must match `^[a-z0-9.\-:/]{1,32}$`, and risk must be one of the four levels. Anything else shows as `other` / `unknown`.
- At most 8 signal labels, de-duplicated. No table, write, migration or flag.

### Phase 0 corpus (folded in)

The 2026-11-24 run branched from master and missed this chain. Its work (`scripts/qi46/assemble-corpus.mjs`, `docs/assembly/qi46/`) is now cherry-picked here. Checkpoint 0 is still **HOLD**: 1,054 of 10,000 pairs, and 31 Medical/PTSD pairs flagged for Vadik.

## 3j. PHASE 0.2 — CORPUS LEXICON v1 (assembled 2026-11-26)

> *Hear the register, not the repo.* v0 heard engineering as soul. v1 hears only the seven registers.

The register lexicon moved into a pure module, `scripts/qi46/lexicon.mjs`, used by the corpus assembler and the smoke test.

| Change | Effect |
|---|---|
| Whole-word match | `son` no longer matches "person". `soft` no longer matches "software". `hold` no longer matches "threshold" |
| Engineering and design words removed | `build`, `haptic`, `heart`, `light`, `grid`, `terminal`, `support`, `remember` |
| Emotion, touch and voice words added | `hugs`: hug, embrace, being held, breathe, warmth. `love`: loved, tenderness, compassion, you matter. `being_cool`: relax, no drama, laugh |
| Exclusions blanked first | `self care` (the LOT® category), `health care`, `digital ocean`, `heart rate`, `cooling` … |
| `ENGINE_REGISTER` | Maps corpus keys to engine registers (`being_there → beingThere`, `male → masculine`). Smoke checks it stays 1:1 with `QI46_REGISTERS` |

### Result on the same corpus (1,089 pairs)

| | grace | poetry | love | hugs | there | cool | male |
|---|---|---|---|---|---|---|---|
| v0 mean | .033 | .041 | .043 | .020 | .042 | .032 | **.104** |
| v1 mean | .021 | .005 | .018 | .007 | .013 | .003 | **.014** |

Every mean dropped. `male` was inflated 7×. The repository does not hold the humanoid voice, so it cannot teach it. The voice has to come from **authored voice pairs** (Vadik & Kuzya) or the **consent-gated subscriber export**. Both wait on Vadik. Checkpoint 0 stays **HOLD** (1,089 of 10,000 pairs, 31 flagged).

No engine code, route, table, migration or flag changed.

---

## 4. NEXT NODES (self-assembly queue)

| Node | Deliverable | Gate |
|---|---|---|
| ~~2~~ | ~~Consent flag + admin preview~~ | **ASSEMBLED 2026-11-16** |
| ~~4~~ | ~~Risk sensitivity: Heavy ≥ moderate~~ | **ASSEMBLED 2026-11-16** (folded into Node 2) |
| ~~3~~ | ~~COSMO® audit trail~~ | **ASSEMBLED 2026-11-17**. Migration `20261117120000` awaits Vadik's review |
| ~~5~~ | ~~"Calibrate me" toggle in Settings~~ | **ASSEMBLED 2026-11-18** as admin preview. Release = Vadik approves copy, sets `QI46_COPY_APPROVED = true` |
| ~~6 prep~~ | ~~Memory prompt surface behind flag~~ | **ASSEMBLED 2026-11-19**, flag `QI46_SURFACE_MEMORY` off by default |
| **6** | Turn the surface on for the closed beta of 12 | Migration run + Node 5 copy released + flag on |
| ~~7 prep~~ | ~~Admin beta read-out~~ | **ASSEMBLED 2026-11-20**: `/admin-api/qi46/readout`, privacy floor 3 |
| **7** | Read the beta, then tune the calibration weights | ≥ 2 weeks of `surface` audit rows |
| ~~F4~~ | ~~Ideation check: normalize, widen, label negation~~ | **ASSEMBLED 2026-11-21**. Negation stays a label. Downgrading it is Vadik's call |
| ~~F12 prep~~ | ~~Non-English text → standard path~~ | **ASSEMBLED 2026-11-22** as label + surface gate 5. Level unchanged |
| **F12** | Native-speaker ideation list (Russian first) | Vadik & Kuzya write and review the phrases. No machine translation |
| ~~Panel~~ | ~~Admin read-out card + switch-on gates~~ | **ASSEMBLED 2026-11-23** on `/us`, admin only, read-only |
| ~~Signal line~~ | ~~Per-person signal labels on `/us/:id`~~ | **ASSEMBLED 2026-11-25**, admin only, read-only, labels only |
| ~~0.2~~ | ~~Corpus lexicon v1 (drop `build`, add emotion words)~~ | **ASSEMBLED 2026-11-26**. Whole-word, engine-aligned keys |
| **0.3** | Authored voice pairs, 7 registers (template + COSMO® screen + lexicon tag) | Vadik & Kuzya write the replies |
| **8** | Optional skip-code baseline (calibrated vs. standard) | Vadik decides (adds one write per Memory request) |

---

*QI·46 Engine Specification — v0.13 · Corpus lexicon v1*
*LOT Systems Corporation — Los Angeles, CA*
*Authored by Vadik & Kuzya*
*Node 1 assembled: November 15, 2026 · Node 2 assembled: November 16, 2026 · Node 3 assembled: November 17, 2026 · Node 5 assembled: November 18, 2026 · Node 6 prep assembled: November 19, 2026 · Node 7 prep assembled: November 20, 2026 · F4 assembled: November 21, 2026 · F12 prep assembled: November 22, 2026 · Read-out panel assembled: November 23, 2026 · Signal line assembled: November 25, 2026 · Lexicon v1 assembled: November 26, 2026*
