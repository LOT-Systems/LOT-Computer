# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-13
Session: 012MUiVDSXSh9MLB9kcPqdVA (scheduled firing)
Author: Vadik

## Sources read
Spec: `docs/corporate/LOT_QI46_ENGINE.md` (5,115 words). The requested `LOT_QI-46_ENGINE-2.md` does not exist in the repo; the spec above is treated as the first node. NOTE: if ENGINE-2 is a newer file, add it and the next session will diff it.

Step 0.1 inventory of repo-resident text (docs only, Markdown):

| Folder (`docs/`) | Files | Words |
|---|---|---|
| wiki | 33 | 267,866 |
| assembly | 98 | 101,645 |
| badges | 32 | 85,298 |
| benchmark | 79 | 56,179 |
| technical | 29 | 51,483 |
| corporate | 25 | 42,031 |
| deployment | 21 | 13,684 |
| releases | 10 | 11,466 |
| backup | 4 | 6,568 |
| diagnostics | 8 | 4,936 |
| setup | 7 | 4,064 |
| security | 3 | 2,255 |

Not read (not accessible from this session): subscriber journal entries and session logs (`/corpus/platform/`), COSMO® event logs, consumable feedback. No production database was queried. Personal data is not pulled into a corpus without consent and COSMO® clearance.

## Tagging summary
0 documents tagged. Tagging needs a Vadik decision on the source-to-`type` mapping (e.g. `wiki` = philosophy/technical, `assembly` = instruction). `cosmo_cleared`: 0 true / all unreviewed.

## Corpus statistics
Training pairs: 0 (gate needs more than 10,000). Raw text available: about 647k words, roughly 0.9M tokens ESTIMATE. Arc-position breakdown: not yet computed.

## Vadik review notes
None yet. The 100-random-example review has not happened.

## Gate result
HOLD. Open boxes: tagging, COSMO® clearance, pair count, JSONL validation, Vadik sample review. This is a checkpoint working correctly.

## Next session
Phase 0 Step 0.2 begins by proposing the folder-to-tag mapping for Vadik to approve, then tagging `docs/` with `cosmo_cleared:false` by default.

## Note on the stated goal (PROVISIONAL)
"Upload a person's being" and calibrate the humanoid output (grace, poetry, love, hugs, presence) maps to Layers 1, 3 and 4 of the spec (calibration loop, response grammar, memory arc). Nothing in this session builds or claims that capability. The honest path is opt-in, consented personal data, COSMO® screened, which Phase 0 gates enforce.
