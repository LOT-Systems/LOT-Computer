# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-09-15
Session: self-assembly (branch claude/cool-tesla-4ipq1k)
Author: Vadik (via session, per S-2 authorization — see `LOT_QI-46_ENGINE-2.md`)

## Sources read

The canonical corpus map in `docs/corporate/LOT_QI46_ENGINE.md` §IV Step 0.1
names `/corpus/platform`, `/corpus/institute`, `/corpus/brand`,
`/corpus/bioelectric`, `/corpus/consumables`, `/corpus/cosmo` — conceptual
categories, not directories that exist in this repository. No production
subscriber data (journal entries, session logs, consumable feedback) was
accessed this session; none is reachable from this container.

What was actually inventoried instead is the documentation corpus already in
the repo, as the nearest real proxy for `/corpus/institute` and
`/corpus/brand`:

```
docs/wiki/        33 files
docs/corporate/    25 files
docs/technical/    31 files
docs/assembly/     98 files
docs/deployment/   21 files
docs/security/      3 files
docs/releases/     10 files
docs/diagnostics/   8 files
──────────────────────────
Total               212 files (documentation only — not the same corpus the spec targets)
```

## Tagging summary

Not performed. The tagging schema in v0.2 Step 0.2 requires
`cosmo_cleared` classification per document; no COSMO® screening pipeline
exists in this codebase yet (`grep -rli "cosmoScreen\|cosmo.node" src/`
returns nothing). Tagging 212 files by hand against a schema built for a
different corpus (subscriber records, not internal docs) would produce
numbers that look precise but mean nothing — the honesty rule in
`docs/benchmark/LOT-DOCTRINE.md`'s parent protocol forbids exactly this.

## Corpus statistics

Not applicable — see above. Training-pair count: 0. Checkpoint 0 requires
> 10,000.

## Vadik review notes

Not run this session — requires S-2 directly, per Checkpoint 0's own gate.

## Gate result

**HOLD.** Checkpoint 0 requires: all sources inventoried (partial — proxy
inventory only, real corpus unreachable), all documents tagged (not done, no
tagging pipeline exists), COSMO® cleared on all training examples (no
COSMO® pipeline exists), corpus size > 10,000 training pairs (0), JSONL
validated (n/a), Vadik review of 100 samples (not run). None of the six
boxes in the canonical spec's Checkpoint 0 are checked. This is recorded as
a HOLD, not skipped or silently passed.

## Next session

Before Phase 0 can advance: (1) confirm what production data sources this
engine is actually allowed to draw from and how this container reaches
them, (2) build the COSMO® classification pipeline referenced throughout
the spec but not yet implemented anywhere in `src/`, (3) get Vadik's
explicit scope sign-off before any real subscriber data — not repo
documentation — is used as training input.
