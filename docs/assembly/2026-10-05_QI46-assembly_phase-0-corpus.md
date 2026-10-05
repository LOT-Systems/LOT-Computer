# QI·46 Assembly Log — Phase 0 — Corpus Assembly (Node 1)
Date: 2026-10-05
Session: LOT-SR-20261005-01
Author: Vadik & Kuzya
Spec: docs/corporate/LOT_QI46_ENGINE.md (the `ENGINE-2` filename in the brief does not exist; this is the only QI·46 spec in the repo)

## Name decision
QI·46 adopted (per brief). Slots into the _I grammar (BI, KI, QI). Already the designation in the spec; no rename needed.

## Sources read (Step 0.1 — repo-resident corpus only)
Source dir (spec)        Repo location          Files   MD words
/corpus/institute/       docs/corporate/          26     42,031
/corpus/brand/           docs/badges (md+pdf)     73     85,298
/corpus/bioelectric/     docs/technical           30     51,483
/corpus/platform/ (docs) docs/wiki                33    267,866
assembly history         docs/assembly            98    101,645
benchmark history        docs/benchmark           79     56,179
/corpus/consumables/     NOT IN REPO
/corpus/cosmo/           NOT IN REPO
/corpus/platform/ data   NOT IN REPO (subscriber journals live in the database; deliberately not touched)

## Tagging summary
Not run. Tagging needs `cosmo_cleared`, which requires the COSMO® node, and that is not wired in this repo. All documents are untagged and flagged for Vadik review.

## Corpus statistics
Repo prose is ~620k words, which is roughly 800k tokens. Gate 0 asks for >10,000 training pairs. No pairs have been generated yet. Count: 0.

## Gate result
HOLD. Unchecked: tagging, cosmo_cleared, JSONL conversion, 100-example Vadik review. Per doctrine, HOLD is a checkpoint working correctly.

## Calibration scope (the "upload a person's being" goal)
Spec Layer 1 (Calibration Loop) and Layer 4 (Memory Arc) already describe this: a per-person context vector from deliberate inputs (journal, biofield state, ratings) and passive inputs, prepended to inference. That is the buildable form of the goal, and it is what Node 1 assumes.
- What it can do: make output fit a person's recorded language, rhythm and stated feelings (grace, poetry, warmth, presence).
- What it cannot do: capture a soul or emotions. It models what a person wrote and did on the platform. Mark any claim beyond that PROVISIONAL.
- Required before any real person's data enters the corpus: explicit opt-in, per-person export and delete, COSMO® screening, and no passive signal used without disclosure.
- Humanoid output target: tone constraints only (grace, poetry, love, presence, cool). Voice rules stay as spec Layer 3.
- Open question for S-2: the brief lists "male". Unclear if this is a voice attribute, a persona, or a typo. Held, not implemented.

## Next session
Phase 0 step 0.2: build the tagging script over docs/ (pure prose, no personal data), emit JSONL, and run Checkpoint 0 against it. Needs S-2 to approve corpus sample.
