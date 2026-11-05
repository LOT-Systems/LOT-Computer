# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-11-05
Session: LOT-SR-20261105-01
Author: Vadik
Spec: docs/corporate/LOT_QI46_ENGINE.md (v0.2, 27 May 2026)
Note: the brief names `LOT_QI-46_ENGINE-2.md`. No such file exists. The only
QI·46 spec in the repo is `LOT_QI46_ENGINE.md`. It was used as the first node.

## Calibration targets (from S-2 brief, verbatim)
grace, poetry, love, hugs, "bing there", "bing cool", "male"
- "bing there" / "bing cool" read as "being there" / "being cool". PROVISIONAL.
- "male" is ambiguous (could be "mellow", "mail", or a literal). Not guessed. HOLD for S-2.
- These are output-tone targets for the Layer 3 Response Grammar and the Phase 1
  voice calibration test prompts. No prompts have been written yet.

## Sources read
Phase 0 expects `/corpus/{platform,institute,brand,bioelectric,consumables,cosmo}/`.
`/corpus/` does not exist in this repo. Nothing was created or fabricated.
What exists as repo-resident text (markdown only; counts are real, from `wc -w`):

```
SOURCE (spec dir)   REPO LOCATION              FILES   WORDS
institute           docs/corporate/              25    42,031   (CQGS snapshot + PDF, vision, product briefs)
brand               docs/wiki/                   33   267,866
technical           docs/technical/              29    51,483
assembly history    docs/assembly/               98   101,645   (+ this log)
badges              docs/badges/                 32    85,298
benchmark           docs/benchmark/              79    56,179
other               backup/deploy/diag/releases/security/setup  53  ~43,000
platform            NOT IN REPO (PostgreSQL on LOT® Droplet)  -   -
consumables         NOT IN REPO                               -   -
cosmo               NOT IN REPO (docs/corporate/LOT_ROBOTICS_COSMO.md is design only)
bioelectric         no dedicated dir; 148 files mention piezo/biofield/bioelectric
```

## Tagging summary
NOT PERFORMED. Documents carry no `source/type/arc_position/body_state/cosmo_cleared`
tags. Tagging requires S-2 decisions (below). 0 of N tagged. cosmo_cleared = false for all.

## Corpus statistics
- Training pairs (prompt/completion): 0. The repo holds prose documents, not pairs.
- Rough prose volume: ~650k words across docs/. Not a pair count.
- Arc-position breakdown: not computable. No per-subscriber data is in this repo.

## Vadik review notes
None yet. The 100-example corpus sample review has not happened.

## Findings for S-2 (the 10% that is judgment)
1. CONSENT HOLD. "Upload a person's being" means journal entries, emotional
   signals and passive behavior data. That lives in the production DB and was not
   touched. Ingesting it into training needs explicit, recorded, per-person opt-in
   (the 12 founding subscribers first) and a retention/deletion path. Spec
   Layer 5 and Checkpoint 0 already require COSMO® clearance and S-2 review.
   Nothing in `src/server/routes` was found that records training consent.
2. SPEC vs REPO. The spec describes a self-hosted open-weight model at
   `qi.lot-systems.com/v1/inference`. The repo uses Together AI via
   `#server/utils/ai-engines` (image generation) and hosted APIs for text. No
   QI·46 endpoint, weights, or JSONL exist. That is Phase 1+ work.
3. NAME COLLISION. LEXICON token `QI` already means the /qi operator RFI
   terminal. `QI·46` is the engine. They are related but distinct. Not minted.
4. "Soul and emotions" is the product intent. What the engine can honestly do is
   calibrate tone to recorded signals. This log makes no claim of capturing a person.

## Gate result
CHECKPOINT 0: HOLD.
```
[ ] sources inventoried        PARTIAL (repo prose only; DB sources unreachable)
[ ] documents tagged           NO
[ ] cosmo_cleared on all       NO
[ ] corpus > 10,000 pairs      NO (0)
[ ] JSONL validated            NO (none)
[ ] S-2 sample review          NO
```

## Next session
Phase 0.2: S-2 answers the three decisions below, then tag docs/corporate +
docs/wiki as `institute`/`brand` and emit a first JSONL under a new `corpus/`
directory for review.
Decisions needed: (a) meaning of "male"; (b) consent mechanism for subscriber
data; (c) whether wiki/assembly logs belong in the training corpus.
