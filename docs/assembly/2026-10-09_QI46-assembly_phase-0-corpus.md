# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-09
Session: LOT-SR-20261009-01 (see docs/benchmark/LOT-SR-20261009-01.md)
Author: Vadik
Node: 1 (first node; spec = docs/corporate/LOT_QI46_ENGINE.md v0.2, May 27 2026)

## Sources read
Repo documentation only (docs/**/*.md, 374 files). No subscriber data, database,
journal entry or session log was read or exported. The spec's `/corpus/platform/`
(subscriber journals) is NOT inventoried: it needs S-2 consent and COSMO® clearance
first.

| folder (spec source)        | docs | words   | candidate type            |
|-----------------------------|------|---------|---------------------------|
| docs/assembly   (brand)     |   98 | 101,645 | voice / instruction       |
| docs/wiki       (institute) |   33 | 267,866 | philosophy / technical    |
| docs/benchmark  (brand)     |   79 |  56,179 | voice / example           |
| docs/technical  (bioelectric)|  29 |  51,483 | technical                 |
| docs/corporate  (institute) |   25 |  42,031 | philosophy / technical    |
| docs/badges                 |   32 |  85,298 | example                   |
| docs/deployment             |   21 |  13,684 | technical (low relevance) |
| docs/releases               |   10 |  11,466 | technical (low relevance) |
| docs/backup/diag/sec/setup  |   22 |  17,823 | exclude (infra/secrets)   |

Total ≈ 650K words ≈ 0.9M tokens (ESTIMATE, ~1.4 tok/word).

## Tagging summary
Tagging NOT applied. Pre-flags for COSMO® review (keyword scan, not a classification):
- 22 files contain email addresses
- 228 files mention medical / PTSD / eating-disorder / journal terms
  (e.g. LOT_Medical_Records.md, LOT_PTSD_Protocol.md, 2026-05-30_S2_eating-disorder-medical-cohort.md)
All of these default to `cosmo_cleared: false` until Vadik reviews.

## Corpus statistics
Training pairs: 0. Spec requires >10,000. Gap is structural: 374 documents do not
yield 10,000 prompt/completion pairs without synthetic generation, which needs
a decision from Vadik (see Next session).

## Vadik review notes
None yet. Minimum 100 sampled examples required.

## Gate result
HOLD — Checkpoint 0 unmet: tagging, COSMO® clearance, pair count, JSONL, review.
A HOLD is a checkpoint working correctly.

## Observations
- Spec filename referenced as LOT_QI-46_ENGINE-2.md; repo file is LOT_QI46_ENGINE.md (v0.2).
- Manifest lists an earlier QI-46 iteration (cool-tesla-f8j0mr, "Soul Upload + Being
  Calibration", BEST, not shipped). Not cherry-picked: separate "Ship QI-46 Engine" request.
- Spec Layer 0 claims "8 years of subscriber interactions" and a 12-person 2017 cohort;
  nothing in the repo verifies these. PROVISIONAL.
- Goal "upload a person's being / calibrate human with humanoid output" is not
  technically defined by the spec. Buildable form: Calibration Loop context vector
  (Layer 1) from consented deliberate inputs. No claim beyond that is made.

## Next session
Decide corpus policy (consent + synthetic pair generation), then build the Step 0.2
tagger over docs/ and sample 100 examples for Vadik.
