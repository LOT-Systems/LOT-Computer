# QI·46 Assembly Log — Phase 0 — Node 1 (Corpus Assembly, Source Inventory)
Date: 2026-09-27
Session: claude/cool-tesla-08es67
Author: Vadik

## Sources read
docs/corporate/LOT_QI46_ENGINE.md (v0.2, base spec) — Sections I–VIII.
docs/benchmark/LOT-MANIFEST.md — QI-46 Engine row (cool-tesla-f8j0mr, BEST,
8/8, +2050 lines, "Node 3 + Soul Upload + Being Calibration" — a prior
session's branch-level iteration; not present on current branch/master).
src/client/components/About.tsx — confirmed QI·46 is documented there as a
Field Manual changelog entry (v43), not as running inference code.

## Tagging summary
Not started this node. Step 0.1 (source inventory) complete; Step 0.2
(per-document tagging schema) deferred to Node 2. See LOT_QI46_ENGINE-2.md
Section II for the honest inventory: 374 markdown files / 674,170 words
under docs/, plus About.tsx (50,348 words) as the live Field Manual corpus.
No subscriber data exists in this repository to tag against the spec's
cosmo_cleared / arc_position schema — that schema targets a Usership
corpus this pre-revenue project does not yet have.

## Corpus statistics
374 files, 674,170 words, docs/ tree, by source:
  corporate 25/42,031 · wiki 33/267,866 · assembly 98/101,645 ·
  benchmark 79/56,179 · badges 32/85,298 · technical 29/51,483 ·
  security 3/2,255 · deployment 21/13,684 · releases 10/11,466.
About.tsx: 1 file, 50,348 words (live Field Manual, separate from docs/).
No JSONL exists; no training pairs exist. 0 of the spec's >10,000-pair
target — recorded honestly, not fabricated.

## Vadik review notes
Pending — this session records the inventory for S-2 review, per Node 1
scope. No sample review has occurred yet.

## Gate result
HOLD — by design. Checkpoint 0 in the base spec requires a fine-tuning
corpus (JSONL, cosmo_cleared tags, >10,000 pairs) this project has no
subscriber base or training infrastructure to produce yet. Node 1's actual
deliverable — the honest source inventory — is complete. Advancing further
into Checkpoint 0 would require either (a) live Usership data that does
not exist, or (b) fabricating training pairs, which the benchmark protocol's
honest-engineering rule forbids.

## Next session
Node 2: S-2 decides whether Phase 0 proceeds against the documentation
corpus as Layer 0 material, waits on live Usership signal, or defers until
the self-hosted inference host (spec Layer 2) is actually built.
