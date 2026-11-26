<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
-->

# QI·46 Assembly Log — Phase 0.2 — Corpus Lexicon v1
Date: 2026-11-26
Session: LOT-SR-20261126-01 (scheduled routine)
Author: Vadik · Kuzya
Spec: `docs/corporate/LOT_QI-46_ENGINE-2.md` §3j

```
QI·46 ━━ SELFWARE ━━ PHASE 0.2 ━━ LEXICON v1 ━━ CHECKPOINT 0 ━━ HOLD
```

## What changed
The register lexicon now lives in its own pure module, `scripts/qi46/lexicon.mjs`. The corpus assembler and the smoke test both import it.

| | v0 (2026-11-24) | v1 (2026-11-26) |
|---|---|---|
| Match | Raw substring | Whole word on normalized text. `stem*` for word families, phrases allowed |
| `male` | `build` matched every engineering doc. `son` matched "person", "reason" | `build` removed. `son`, `father*`, `grounded`, `steady`, `protector`… as whole words |
| `hugs` | `hold` matched "threshold". `haptic` scored hardware | Body and touch words: `hug`, `embrace*`, `being held`, `breathe`, `warmth`, `shoulder*` |
| `love` | `heart` scored heart-rate data. `care` matched "careful", "scared" | `loved`, `tenderness`, `compassion*`, `you matter`, `belong`. `self care` is blanked as the LOT® category |
| `being_cool` | Design words: terminal, grid, minimal, clean | The register itself: `relax*`, `no drama`, `laugh*`, `playful*`, `chill` |
| `being_there` | `support`, `remember` (tickets, Memory Engine) | `presence`, `with you`, `not alone`, `witness*`, `listen*` |
| Exclusions | none | `self care`, `health care`, `digital ocean`, `model (ocean)`, `heart rate`, `cooling`… blanked first |
| Engine keys | none | `ENGINE_REGISTER` maps corpus keys to `QI46_REGISTERS` (`being_there → beingThere`, `male → masculine`) |

## Measured on the same run (1,089 pairs, 57 files)

| Register | v0 mean | v1 mean | v1 pairs > 0 | Top v1 words |
|---|---|---|---|---|
| grace | 0.033 | 0.021 | 79 | calm · gentle · peace · graceful · quiet |
| poetry | 0.041 | 0.005 | 20 | poet* · ocean · mythic · shore · metaphor |
| love | 0.043 | 0.018 | 78 | care · loving · compassion · love · caring |
| hugs | 0.020 | 0.007 | 36 | breathe · comfort · breath · breathing · hug |
| being_there | 0.042 | 0.013 | 54 | presence · listen · listening · alongside · with you |
| being_cool | 0.032 | 0.003 | 19 | relax · laugh · cool · playful |
| male | **0.104** | **0.014** | 55 | grounded · son · father · discipline · strength |

**Reading.** Every mean went down, and that is the result. v0 was hearing engineering text as soul. v1 hears only the registers, and it shows the repo corpus holds very little of them: no register reaches 8% of pairs. `male` was 7× inflated. `being_cool` and `poetry` are close to silent.

So the repo documents cannot teach the humanoid voice. The voice has to come from one of two places, and both wait on Vadik:
1. **Authored voice pairs.** Vadik & Kuzya write short calibrated replies per register (grace, poetry, love, hugs, being there, being cool, male). They are tagged with lexicon v1 and screened by COSMO®.
2. **Consent-gated subscriber export.** A person's own logs, only after "Calibrate me" is on (Node 5 copy released).

## Gate result
```
[x] All sources inventoried and catalogued
[x] All documents tagged per schema (now lexicon v1)
[ ] COSMO® cleared: true on all training examples   — 31 flagged (unchanged)
[ ] Corpus size > 10,000 training pairs             — 1,089 (10.9%)
[x] JSONL format validated — no malformed lines
[ ] Vadik review: 100 random examples               — pending
```
**HOLD**, as expected. Stats snapshot: `2026-11-26_qi46-corpus-stats.json` (holds `registerMean` v1, `registerMeanV0` and `registerNonZero`).
