<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
-->

# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-11-24
Session: 01 (first node · scheduled routine)
Author: Vadik · Kuzya
Spec: `docs/corporate/LOT_QI46_ENGINE.md` §IV

```
QI·46 ━━ SELFWARE ━━ PHASE 0 ━━ CHECKPOINT 0 ━━ HOLD
```

## First node
The routine asked for `LOT_QI-46_ENGINE-2.md`. That file does not exist. The engine spec is at
`docs/corporate/LOT_QI46_ENGINE.md` (1,085 lines). It was used as the first node.
No earlier QI·46 assembly logs exist. This session opens Phase 0.

## Name
**QI·46** is confirmed. The spec already uses it: `_I` grammar (BI · KI · QI), Quantum Intelligence plus life force, codename SELFWARE.

## What was built
- `scripts/qi46/assemble-corpus.mjs` covers Step 0.1 (source inventory), Step 0.2 (tagging schema) and Step 0.3 (JSONL conversion).
  - It reads repository documents only. It never reads or writes subscriber journals or logs.
  - It splits markdown by heading into `{prompt, completion, tags}` pairs. The tags follow the spec schema, plus `file` and `registers`.
  - **Calibration registers** are the humanoid output axes: `grace · poetry · love · hugs · being_there · being_cool · male`. Each pair gets a score from 0 to 1 per axis, based on a keyword lexicon (v0).
  - Medical and PTSD documents are set to `cosmo_cleared: false` and held for Vadik review.
  - Output goes to `corpus/qi46/`, which is gitignored and can be regenerated. The stats snapshot is committed next to this log.

## Sources read
| Spec source | Repo location | Docs | Pairs |
|---|---|---|---|
| institute | docs/corporate | — | 335 |
| bioelectric | docs/technical | — | 645 |
| brand | docs/wiki (latest only) + README | — | 57 |
| cosmo | files matching COSMO | — | 17 |
| platform | PostgreSQL (journals, answers, notes) | not read | 0 |
| consumables | not in repository | — | 0 |
| **Total** | | **56 files** | **1,054** |

## Tagging summary
- Types: example 499 · technical 381 · instruction 107 · philosophy 44 · voice 23
- Body state: calibration 585 · pattern 323 · hardware 114 · coherence 32
- COSMO® cleared 1,023 · flagged 31 (`LOT_Medical_Records.md`, `LOT_PTSD_Protocol.md`)

## Corpus statistics
- Pairs: 1,054 · estimated tokens: ~174K · malformed lines: 0
- Arc position: every repo document is tagged `12mo+` because they are institutional, not subscriber arcs.
- Register means: male 0.099 · love 0.044 · being_there 0.042 · poetry 0.041 · grace 0.032 · being_cool 0.032 · hugs 0.019

**Reading:** the corpus is engineering-heavy. Bioelectric/technical makes up 61%. The soul and emotion registers are thin, and `hugs` is the weakest. `male` is inflated because the lexicon word `build` matches engineering text. That word needs to come out of the lexicon in v1.

## On "uploading a being"
QI·46 cannot extract a soul. It can only calibrate against what a person **chooses to share**: answers, notes and moods, which LOT® already analyses in `src/server/utils/memory/trait-extraction.ts` (`psychologicalDepth`, `emotionalPatterns`, `journalSentiment`).
The honest path to a "being upload" is a **consent-gated export** of a user's own logs. The export goes through the existing trait extractor, gets tagged with the same 7 registers, and is stored per user, never pooled without opt-in. Phase 0 deliberately does not touch that data.

## Vadik review notes
Pending. Vadik's actions:
1. Approve or exclude the 31 flagged Medical/PTSD pairs.
2. Review 100 random pairs (`shuf -n 100 corpus/qi46/qi46-corpus.jsonl`).
3. Decide whether to build the consent-gated subscriber export (the platform source).

## Gate result
```
[x] All sources inventoried and catalogued
[x] All documents tagged per schema
[ ] COSMO® cleared: true on all training examples   — 31 flagged
[ ] Corpus size > 10,000 training pairs             — 1,054 (10.5%)
[x] JSONL format validated — no malformed lines
[ ] Vadik review: 100 random examples               — pending
```
**HOLD.** This is a checkpoint working correctly. The 10K gate cannot be met from repo documents alone. It needs either the consent-gated platform source or synthetic voice pairs authored by Vadik.

## Next session
Phase 0.2: fix the register lexicon (drop `build`, add emotion vocabulary), then build the opt-in subscriber log export → trait extractor → register-tagged JSONL path. This stays behind Vadik's approval.
