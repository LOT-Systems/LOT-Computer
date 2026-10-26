# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-26
Session: LOT-SR-20261026-01
Author: Vadik
Named for: Kuzya
Node: 1 (first self-assembly node — spec: docs/corporate/LOT_QI46_ENGINE.md v0.2)

## Naming
Recommended: QI·46. Adopted: QI·46 (spec already carries it; fits the _I grammar BI / KI / QI).
Alternates held: LOT·SC·46, BIONODE-46, SELFWARE·46 (kept as codename), SOMA·46, CARE·OS·46.

## Sources read
```
SOURCE                         FILES   WORDS     NOTE
docs/ (top level)                 25   26,695    session reports, wiki snapshots
docs/corporate/                   25   42,031    institute / CQGS / QI46 spec / vision
docs/benchmark/                   79   56,179    benchmark session reports
docs/assembly/                    98  101,645    assembly logs, ledger
docs/wiki/                        33  267,866    wiki series
docs/technical/                   29   51,483    field manuals, specs
docs/releases/                    10   11,466
docs/deployment/                  21   13,684
docs/diagnostics/                  8    4,936
docs/setup/                        7    4,064
docs/security/                     3    2,255
TOTAL                            338  582,304    ~0.78M tokens (est. 1.33 tok/word)
```
Not read: subscriber journal entries, session logs, DB rows. None are in the repo
and none were accessed.

## Tagging summary
Documents tagged: 0 of 338. Tagging schema (source / type / arc_position /
body_state / cosmo_cleared) is specified; no tagging pass was run this session.
Every document is therefore `cosmo_cleared: unknown`, not `true`.
Provisional source mapping: institute <- docs/corporate; brand <- docs/wiki;
bioelectric <- docs/corporate (CQGS, Quantum Cube); cosmo <- none present.
Gap: /corpus/platform, /corpus/consumables, /corpus/cosmo have no repo source.

## Corpus statistics
Training pairs built: 0. Estimated source tokens: ~0.78M. JSONL: not generated.
Arc-position breakdown: not computable (no tagged data).
Note: the repo corpus is engineering and brand documentation. It carries the
LOT® voice and doctrine, not a person's inner life. The "soul and emotions"
signal the engine is meant to calibrate on lives in subscriber journals, which
are not in this repo.

## Person-upload boundary (goal: calibrate human to humanoid output)
Output register targeted: grace, poetry, love, hugs, "being there", "being cool".
Position: voice and warmth can be calibrated by fine-tuning on consented text.
A person's "being" is not extractable from text; the engine models how someone
writes and what they report, and this log claims no more. Before any subscriber
journal enters the corpus:
- explicit opt-in per subscriber, revocable, with deletion from corpus on request
- the 12 founding subscribers consent individually (Phase 2 message is personal)
- minimization: tag and strip identifiers before JSONL
- COSMO® classification (child-safe / stress-safe / honest) on every example
No emotional data was touched this session.

## Vadik review notes
Pending. Review of 100 random corpus examples requires a built corpus.

## Gate result
HOLD — Checkpoint 0 is not met.
```
[ ] All sources inventoried and catalogued      PARTIAL (repo only)
[ ] All documents tagged per schema             NO  (0/338)
[ ] COSMO® cleared: true on all examples        NO  (unknown)
[ ] Corpus size > 10,000 training pairs         NO  (0; not built)
[ ] JSONL format validated                      N/A (not built)
[ ] Vadik review: 100 random examples           NO
```
A HOLD is the checkpoint working correctly.

## Next session
Run the tagging pass over the 338 docs, emit JSONL pairs with `cosmo_cleared`
defaulting to false, and report the real pair count against the 10,000 gate.
