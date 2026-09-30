# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-09-30
Session: LOT-SR-20260930-01
Author: Vadik

## Sources read
Repo-only inventory (no subscriber data, DB, or personal journal content was read or exported).
Spec: docs/corporate/LOT_QI46_ENGINE.md (5,115 words). NOTE: LOT_QI-46_ENGINE-2.md was NOT found in repo or git history; v1 used as node 1.

```
SOURCE (spec path)        REPO MAPPING                 MD FILES   WORDS
/corpus/institute/        docs/corporate/                 25      42,031
/corpus/brand + process   docs/assembly/                  98     101,645
/corpus/brand + process   docs/benchmark/                 79      56,179
/corpus/bioelectric       docs/wiki/                      33     267,866
/corpus/technical         docs/technical/                 29      51,483
/corpus/platform          (DB: journal/logs) NOT ACCESSED   -         -
/corpus/consumables       NOT FOUND                         -         -
/corpus/cosmo             NOT FOUND (COSMO® mentioned in 250 docs) - -
```
No /corpus directory exists. No JSONL exists.

## Tagging summary
Not performed. Tagging schema requires cosmo_cleared per document; COSMO® node is not callable from this session. 0 documents tagged.

## Corpus statistics
Candidate text only: ~519k words across 264 md files (≈0.7M tokens, ESTIMATE). Training pairs: 0 (gate needs >10,000).

## Vadik review notes
None. Review of 100 random samples is pending.

## Gate result
HOLD — Checkpoint 0 boxes: inventory PARTIAL, tagging NO, cosmo_cleared NO, >10k pairs NO, JSONL NO, Vadik review NO.

## Design flag (for Vadik)
"Upload a person's being" = personal journal/emotion data. Before any platform corpus is extracted: explicit per-user consent, anonymization, and COSMO® clearance are required. Not done here by design. Recommend Phase 0 start from institute+brand docs only (no personal data) to meet the voice goal (grace, poetry, love, hugs, being there).

## Next session
Phase 0.2: build /corpus layout + tagging script over docs/ sources (no personal data), emit JSONL, then Vadik samples 100.
