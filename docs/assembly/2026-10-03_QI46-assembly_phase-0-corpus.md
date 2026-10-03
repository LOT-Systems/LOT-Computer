# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-03
Session: session_01LxthHsbwrioTq36dwTcXoX
Author: Vadik & Kuzya
Spec: docs/corporate/LOT_QI46_ENGINE.md (the "ENGINE-2" file named in the brief does not exist; this is the only QI·46 spec in the repo)

## Scope of this session
Step 0.1 only (source inventory), repo-resident sources. No subscriber data (journals, session logs, consumable feedback, COSMO® events) was read: none is in the repo, the database is not reachable from this environment, and the spec requires COSMO® clearance and Vadik review before any personal data enters a training set. Steps 0.2 (tagging) and 0.3 (JSONL) are NOT started.

## Sources read (repo-resident; markdown word counts)
SPEC DIR              FILES   WORDS     SPEC CORPUS SLOT
docs/wiki             33      267866    /corpus/brand + /corpus/platform (system docs)
docs/assembly         98      101645    /corpus/platform (assembly history)
docs/badges           73      85298     /corpus/platform (achievement codex)
docs/benchmark        79      56179     /corpus/platform (session reports, doctrine)
docs/technical        30      51483     /corpus/bioelectric + technical
docs/corporate        26      42031     /corpus/institute + /corpus/brand (CQGS, CUBIQ, COSMO® robotics)
docs/deployment       21      13684     out of corpus (infra)
docs/releases         10      11466     out of corpus
docs/backup, diagnostics, security, setup   excluded (operational / secrets posture)
Not present in repo: /corpus/consumables, /corpus/cosmo, subscriber journals.

## Tagging summary
Untagged. cosmo_cleared = false for 100% (no COSMO® pass has run). Everything is therefore flagged for Vadik review before inclusion, per Step 0.2.

## Corpus statistics
Estimated, not measured: repo markdown is ~0.6M words (~0.8M tokens). Training pairs: 0 (Step 0.3 not run). Gate requires > 10,000 pairs.

## Findings (provisional)
1. The spec describes "uploading a person's being". What the architecture actually builds is a per-subscriber context vector (Layer 1) prepended to inference calls. That is a calibration profile, not a copy of a person. The report and any copy should say so.
2. Layers 1 and 4 and the Phase 2 "founding cohort as corpus" step use personal journal and emotional data. Before Step 0.2 runs on it: explicit consent for training use (not only for the service), a deletion path, and a decision on whether fine-tuning on individual journals is wanted at all versus per-user retrieval at inference.
3. The 8-year claim (2017 cohort) cannot be verified from the repo; the oldest in-repo material is 2026.
4. The spec's "only Vadik and Kuzya as proper names" and "no external brands" rules conflict with this repo's own reports (they name Together AI, Resend, Cloudflare). Decide whether the rule applies to subscriber-facing output only.

## Vadik review notes
None yet. Required at Checkpoint 0: 100 random examples.

## Gate result
HOLD — Checkpoint 0: 1 of 6 boxes (inventory) done. Expected state for a first session, not a failure.

## Next session
Phase 0 Step 0.2: Vadik confirms the corpus scope and consent policy (finding 2), then the tagging schema is applied to the in-repo documents only.
