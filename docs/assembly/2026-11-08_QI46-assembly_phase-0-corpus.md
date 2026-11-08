# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-11-08
Session: session_01B5eNPLhAYgG1JEs8G5DoSP
Author: Vadik & Kuzya (scheduled run)

## Sources read
Spec: `docs/corporate/LOT_QI46_ENGINE.md` (prompt named `LOT_QI-46_ENGINE-2.md`; no such file exists — canonical path used).
Repo documentation corpus (the only data reachable from this environment):

| Spec source dir        | Repo mapping            | .md files | Words   |
|------------------------|-------------------------|-----------|---------|
| /corpus/institute/     | docs/corporate, wiki    | 25 + 33   | ~310k   |
| /corpus/brand/         | docs/badges, corporate  | 32        | ~85k    |
| /corpus/bioelectric/   | docs/technical          | 29        | ~51k    |
| (assembly memory)      | docs/assembly, benchmark| 98 + 79   | ~158k   |
| /corpus/platform/      | NOT AVAILABLE (live DB) | 0         | —       |
| /corpus/consumables/   | NOT AVAILABLE           | 0         | —       |
| /corpus/cosmo/         | NOT AVAILABLE           | 0         | —       |

## Tagging summary
Not performed. Tagging (spec 0.2) requires per-document judgment and COSMO® clearance; no document has been tagged `cosmo_cleared: true`.

## Corpus statistics
0 training pairs built. Gate requires >10,000. Doc-derived words available: ~600k (PROVISIONAL, includes overlap).

## Vadik review notes
None — no human review occurred (unattended run).

## Gate result
HOLD — Checkpoint 0 unmet: platform/consumables/cosmo sources absent, no tagging, no JSONL, no 100-sample review.

## Soul-upload goal (grace, poetry, love, hugs, being there) — design notes
- The "human ↔ humanoid output" calibration maps to Layer 1 (context vector) + Layer 3 (response grammar). Nothing new is built yet.
- BLOCKER, by design: ingesting a person's journals/emotional data into a corpus requires explicit per-person opt-in, an export/delete path, and COSMO® clearance before any record enters training. This run did not touch subscriber data and will not without that.
- Honest boundary: the engine can model a person's *expression patterns*; it does not capture a being. Keep "calibration," not "upload," in user-facing copy.

## Next session
Phase 0.1 against real sources: Vadik provides/approves a consented export of platform journal data, then tag + COSMO®-screen a 100-doc sample.
