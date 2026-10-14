# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-14
Session: LOT-SR-20261014-01
Author: Vadik

## Node
First node: `docs/corporate/LOT_QI46_ENGINE.md` (the brief names `LOT_QI-46_ENGINE-2.md`; no file by that name exists in the repo — S-2 to confirm this is the intended node or supply ENGINE-2).

## Sources read
Repo-resident documentation only. No subscriber data, journal entries or COSMO® event logs were read or exported.

| Directory | .md files | Words |
|---|---|---|
| docs/assembly | 98 | 101,645 |
| docs/wiki | 33 | 267,866 |
| docs/badges | 32 | 85,298 |
| docs/technical | 29 | 51,483 |
| docs/corporate | 25 | 42,031 |
| docs/benchmark | 79 | 56,179 |
| docs/deployment | 21 | 13,684 |
| docs/releases | 10 | 11,466 |
| docs/diagnostics | 8 | 4,936 |
| docs/setup | 7 | 4,064 |
| docs/backup | 4 | 6,568 |
| docs/security | 3 | 2,255 |

Spec → source mapping (Step 0.1): institute / brand / bioelectric ≈ docs/corporate + docs/wiki + docs/technical. Platform, consumables and cosmo sources live in the production database, not the repo — not inventoried.

## Tagging summary
Not run. No JSONL produced. Tagging requires `cosmo_cleared` review by Vadik first.

## Corpus statistics
Repo prose only: 374 .md files, ~647k words. Training pairs: 0 (gate requires > 10,000).

## Vadik review notes
Pending. Open questions for S-2:
1. Node file: `ENGINE-2` vs `LOT_QI46_ENGINE.md`.
2. "Upload a person's being" — the spec's mechanism is the Layer 1 Calibration Vector built from a subscriber's own journal, ratings and behavior. Anything beyond that needs explicit per-person consent, a deletion path, and COSMO® clearing before it enters a corpus. Proposed reading: calibration, not copying.
3. Target output voice (grace, poetry, love, hugs, being there, being cool, "male") — confirm "male" meaning (voice persona? grammatical gender in other languages?) before it is written into the system prompt.

## Gate result
HOLD — Checkpoint 0 boxes 2–6 unchecked (tagging, COSMO® clearing, corpus size, JSONL validation, Vadik sample review). A HOLD is a checkpoint working correctly.

## Next session
Export a consented, COSMO®-cleared sample of platform data, tag it per Step 0.2, and emit the first JSONL for Vadik's 100-example review.
