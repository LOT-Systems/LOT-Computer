# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-24
Session: LOT-SR-20261024-01
Author: Vadik

## Sources read
Spec: docs/corporate/LOT_QI46_ENGINE.md (v0.2, 2026-05-27). Requested name
`LOT_QI-46_ENGINE-2.md` does not exist in the repo; v0.2 is the only QI·46 spec.

Inventoried by `node scripts/qi46/corpus-inventory.cjs` (repo docs only):

```
source        docs   words
institute        5    12978
brand           85   450418
bioelectric      0        0   (no doc reaches the 5-keyword threshold)
unmapped       284   295792   (engineering logs: assembly, benchmark, technical)
platform         -        -   NOT INVENTORIED (DB journals/logs — see below)
consumable       -        -   NOT INVENTORIED (no records in repo)
cosmo            -        -   NOT INVENTORIED (no event logs in repo)
TOTAL          374   759188
```

## Tagging summary
374 docs tagged (source, type, arc_position unset, body_state unset).
cosmo_cleared: true = 0, false = 374. The tool never sets true; that is a
Vadik review decision.

## Corpus statistics
Training pairs: 0 (no prompt/completion conversion run). Gate needs > 10,000.
Raw material exists (759k words of docs) but docs are not pairs; building
pairs from them is Step 0.3 and needs a pairing rule S-2 has not defined.

## Vadik review notes
None yet. 100-sample review not performed.

## Gate result
HOLD
- [x] all documents tagged
- [ ] 6/6 sources inventoried (3 of 6 are subscriber/hardware data, not in repo)
- [ ] cosmo_cleared on all
- [ ] corpus > 10,000 pairs
- [ ] JSONL validated (none emitted)
- [ ] Vadik 100-sample review

## Decision needed from Vadik (before Step 0.3)
1. Consent rule for the `platform` source. Journals are personal. Proposed:
   a subscriber's entries enter the corpus only on explicit opt-in, with
   per-person removal. Without it, "upload a person's being" has no gate.
2. Pairing rule: how a journal entry or doc becomes prompt -> completion.
3. Naming: spec says `46` = founding epoch/year; the kickoff note reads it as
   Sonnet 4.6. The spec says Phase 1 trains an open-weight base, so 46 is
   branding, not a dependency. Confirm which reading is canonical.

## Next session
Phase 0 Step 0.3: after S-2 answers 1-2, emit a JSONL of cleared-candidate docs
and run the 100-sample review.
