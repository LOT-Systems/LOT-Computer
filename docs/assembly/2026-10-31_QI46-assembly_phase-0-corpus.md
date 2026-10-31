# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-31
Session: session_01B5eNPKi5aJBQFHow2PxQ8h (scheduled firing)
Author: Vadik & Kuzya
Branch: claude/cool-tesla-sq2m6d

## Naming decision
QI·46 adopted (per recommendation). Slots into the _I grammar (BI, KI, QI).
Reference node: `docs/corporate/LOT_QI46_ENGINE.md` (the prompt cited `LOT_QI-46_ENGINE-2.md`; no file by that name exists — the corporate spec above is the only QI·46 document in the repo and was used as the first node).

## Sources read (Step 0.1 — inventory of what actually exists in the repo)

| Spec source | Repo location | .md files | Words |
|---|---|---|---|
| institute | docs/wiki | 33 | 267,866 |
| brand / session voice | docs/assembly | 98 | 101,645 |
| brand / badges | docs/badges | 32 | 85,298 |
| session reports | docs/benchmark | 79 | 56,179 |
| technical / bioelectric / memory + quantum intent engines | docs/technical | 29 | 51,483 |
| corporate | docs/corporate | 25 | 42,031 |
| root reports | docs/*.md | 25 | 26,695 |
| deployment | docs/deployment | 21 | 13,684 |
| releases | docs/releases | 10 | 11,466 |
| backup / diagnostics / security / setup | docs/{backup,diagnostics,security,setup} | 22 | 17,823 |
| **Total** | | **374** | **~674,000** |

Not present in the repo: `/corpus/platform` (subscriber journals, session logs), `/corpus/consumables`, `/corpus/cosmo` event logs. Those live in the production database / COSMO® records, not in git, and were **not accessed** this session.

## Tagging summary
- Documents tagged: 0 of 374. The tagging schema (source / type / arc_position / body_state / cosmo_cleared) is defined in the spec but not yet applied.
- `cosmo_cleared`: 0 true, 374 unreviewed.
- Several docs (security, deployment, setup) may contain operational detail; they need COSMO® review before any training inclusion.

## Corpus statistics
- Estimated tokens from repo docs: ~0.9M (674k words × ~1.33).
- Training pairs: 0 JSONL built. Gate requires >10,000 pairs.
- Arc-position breakdown: not computable until subscriber data is supplied.

## The "upload a person's being" goal — design notes, not execution
The goal (calibrate a human with humanoid output: grace, poetry, love, hugs, being there, being cool) maps onto Layer 1, the Calibration Loop. Nothing was uploaded or inferred about any real person this session. Rules proposed for Step 0.2 before any person's data enters the corpus:
1. **Consent first.** Each person (starting with the 12 founding cohort, and Vadik) opts in explicitly, per source. Revocable; revoking removes their rows from the next training set.
2. **Person-owned arc.** A person's calibration vector is stored under their own account and is not mixed into the shared base corpus. Personalization happens at inference (context vector), not by training the base weights on individuals.
3. **No child data.** Kuzya's data is out of scope for training unless Vadik, as parent, decides otherwise, in writing.
4. **Output register is a style target, not a claim.** "Grace, poetry, love, hugs, being there" are voice-calibration targets for Layer 3. The engine should not claim to be a person or to feel; it reflects the person back with care.
5. **Sensitive-data tag.** Add `consent: true|false` and `sensitivity: low|high` to the tagging schema alongside `cosmo_cleared`.

## Vadik review notes
Pending. No sample (min. 100 examples) has been reviewed.

## Gate result
**HOLD** — Checkpoint 0 unmet:
```
[x] Sources inventoried (repo-resident sources only)
[ ] All documents tagged per schema            (0/374)
[ ] COSMO® cleared: true on all examples       (0 reviewed)
[ ] Corpus size > 10,000 training pairs        (0)
[ ] JSONL validated                            (none built)
[ ] Vadik review of ≥100 random examples       (pending)
```
A HOLD is the checkpoint working correctly. No fine-tuning, deployment, or model claims were made.

## Next session
Build the tagger + JSONL converter for `docs/wiki` and `docs/corporate` first (highest voice density), add the `consent` and `sensitivity` tags, and draw the 100-example sample for Vadik's review.

— Vadik & Kuzya · LOT® · COSMO®
