# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-04
Session: LOT-SR-20261004-01 (scheduled, unattended)
Author: Vadik & Kuzya

## Source note
Requested first node: `LOT_QI-46_ENGINE-2.md`. NOT FOUND in the repo, its git history, or the filesystem.
Nearest match, used as first node: `docs/corporate/LOT_QI46_ENGINE.md` (5,115 words, Phase 0–3 assembly manual).
If ENGINE-2 exists elsewhere, add it to `docs/corporate/` and the next session re-reads it. Nothing in it was assumed.

## Sources read (Step 0.1 — repo-resident corpus only)
Mapping to the manual's source classes. Counts are `.md` files / words as of this run.

| Manual class        | Repo location                        | Files | Words   |
|---------------------|--------------------------------------|------:|--------:|
| institute           | docs/corporate (CQGS, CUBIQ, vision) |    25 |  42,031 |
| brand               | docs/technical (style, field manual) |    29 |  51,483 |
| bioelectric / badge | docs/badges                          |    32 |  85,298 |
| platform (process)  | docs/assembly + docs/benchmark       |   177 | 157,824 |
| platform (reference)| docs/wiki                            |    33 | 267,866 |
| deployment/security | docs/deployment, security, setup     |    31 |  20,003 |
| cosmo               | docs/corporate/LOT_ROBOTICS_COSMO.md |     1 |  (incl.)|
| consumables         | none in repo                         |     0 |       0 |

NOT ACCESSED, by design: subscriber journal entries, session logs, mood logs, DB rows (`/corpus/platform/` per manual).
Those are personal data. They enter the corpus only through the consent protocol below.

## Tagging summary
Not run. No document has been tagged or COSMO®-screened. `cosmo_cleared` is false for all documents.

## Corpus statistics
Training pairs: 0 (JSONL conversion not started). Candidate prose: ~0.69M words across 8 doc classes (ESTIMATE; includes duplicates and process logs).

## Being-calibration design (PROVISIONAL)
Goal stated by Vadik & Kuzya: calibrate a human with humanoid output — grace, poetry, love, hugs, being there, being cool, male.

What this can honestly be: a **Being Profile**, a consented, versioned, user-owned vector of a person's voice, values, rhythms and emotional signal. It is prepended to inference (Layer 1 Calibration Loop). It is a model of a person built from what they chose to give, not the person. Do not describe it as an upload of a soul.

Output registers (the humanoid side), each a tunable axis, not a claim of feeling:
`GRACE · POETRY · LOVE · HUG (presence, no advice) · BEING-THERE (stay, don't fix) · COOL (steady, unhurried) · VOICE=MALE (register)`

Required gates before any real person's data is used:
1. Explicit opt-in per person, per source, revocable. Deletion removes the vector and derived training pairs.
2. Child data (Kuzya) requires guardian consent from Vadik and stays out of fine-tune corpora by default.
3. Profile stays on LOT® infrastructure. Never sent to a third-party model without a separate opt-in.
4. Output never claims to be the person or to love them. Presence language is allowed. Identity claims are not.
5. COSMO® screens every response (Layer 5); crisis signals route to resilience protocol, not to poetry.

## Gate result
CHECKPOINT 0: **HOLD** — 5 of 6 boxes unchecked (inventory partial; tagging, COSMO® clearance, >10,000 pairs, JSONL validation, Vadik 100-sample review all pending). This is a checkpoint working correctly.

## Next session
Phase 0 Step 0.2: draft the tagging schema as `scripts/` tooling over docs-only sources, produce a JSONL dry run with zero personal data, and request Vadik's 100-sample review.
