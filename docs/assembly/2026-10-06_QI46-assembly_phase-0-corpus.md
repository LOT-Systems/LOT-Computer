# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-06
Session: QI46-P0-S01
Author: Vadik & Kuzya
Branch: claude/cool-tesla-qltmjn
First node: docs/corporate/LOT_QI46_ENGINE.md (1,085 lines, read in full for Phases 0–1 and the Assembly Card)

## Naming
Engine named **QI·46** (Quantum Intelligence Engine, Generation 46). Fits the _I grammar (BI, KI, QI). Matches the spec header.

## Sources read
Step 0.1 inventory of `docs/**/*.md`, metadata only. No content copied or modified.

| Source tag | Docs | Est. tokens |
|---|---|---|
| platform (assembly, benchmark, badges, session reports) | 233 | 666,038 |
| brand (corporate, wiki) | 54 | 669,026 |
| bioelectric (technical) | 29 | 100,391 |
| institute (CQGS, Cubiq) | 4 | 14,868 |
| cosmo (security) | 3 | 4,130 |
| **Total** | **323** | **~1.45M** |

Manifest: `docs/assembly/qi46/phase0_manifest.json`
Tool: `scripts/qi46/phase0_inventory.py` (re-runnable, read-only)

Not available in this session: `/corpus/consumables/`, `/corpus/cosmo/` event logs, and subscriber journal entries from the production database. No database access, so none were read.

## Tagging summary
- 323 documents tagged `source` and `type`.
- `arc_position` and `body_state` are `null`. They need subscriber-arc data and are not assignable to engineering docs.
- `cosmo_cleared` is `false` on all 323. Nothing has been through the COSMO® node, so none are cleared. This is flagged for Vadik review.

## Corpus statistics
- Training pairs: 0 (gate requires > 10,000). Step 0.3 (JSONL conversion) not started, because it needs the Vadik-reviewed, COSMO®-cleared set.
- Estimated tokens in candidate pool: ~1.45M.
- The pool is heavily engineering/brand voice. It has little first-person subscriber signal, so it will not teach the engine "grace, poetry, love, presence" by itself. That signal must come from consented subscriber data.

## Scope note — "upload a person's being"
The stated goal is to calibrate the human with the humanoid output (grace, poetry, love, hugs, being there, being cool). Spec Layer 1 already defines the mechanism: the Calibration Loop, with deliberate and passive inputs, injected as a context vector. Constraints carried into the build:
1. Per-person data enters only with that person's explicit consent, revocable, and deletable on request. This is a hard gate for Phase 0 Step 0.2, not a later add-on.
2. Calibration is a context vector over a narrow model. It is not a copy of the person. Responses must not claim to be the person or to replace human presence.
3. The "hugs / being there" output is voice and care language. It is not a claim of physical or emotional presence.
4. Every response passes the COSMO® node (child-safe, stress-safe, honest) before delivery, per Layer 5.
5. Journal and biofield data are sensitive health-adjacent data. Keep them self-hosted (spec Layer 2) and out of any third-party training or logging.

## Vadik review notes
None yet. No samples have been reviewed.

## Gate result
**CHECKPOINT 0: HOLD**

```
[x] Sources inventoried (repo docs only)
[~] Documents tagged — source/type done; arc/body_state pending consented data
[ ] COSMO® cleared: true on all training examples — 0/323
[ ] Corpus size > 10,000 training pairs — 0
[ ] JSONL format validated — not started
[ ] Vadik review: 100 random examples — not started
```

A HOLD is a checkpoint working correctly. It is not a failure.

## Decisions needed from Vadik
1. Approve the source map above, or add `/corpus/*` paths and DB export access for subscriber data.
2. Review a 100-document random sample. The manifest supports this.
3. Confirm the consent model for subscriber data (opt-in, revocable) before any journal data enters the corpus.
4. Choose the base model for Phase 1, which the spec defers to Phase 1.

## Next session
Phase 0 Step 0.2/0.3: run COSMO® classification on the 323 candidates, produce the 100-doc review sample for Vadik, and emit JSONL for the cleared set.
