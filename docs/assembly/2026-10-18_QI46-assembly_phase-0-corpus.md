# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-18
Session: QI46-S01 (claude/cool-tesla-03ecbe)
Author: Vadik & Kuzya

## Source note
Requested first node: `LOT_QI-46_ENGINE-2.md`. NOT FOUND in repo (any path).
Used the only matching spec: `docs/corporate/LOT_QI46_ENGINE.md` (5115 words). Upload ENGINE-2 to supersede.

## Sources read (Step 0.1 — repo-doc inventory only; no subscriber data touched)
| Source (spec dir)      | Repo location          | Files | Words   |
|------------------------|------------------------|-------|---------|
| institute / brand      | docs/corporate/        | 26    | 42,031  |
| bioelectric / technical| docs/technical/        | 30    | 51,483  |
| cosmo / assembly       | docs/assembly/         | 98    | 101,645 |
| platform lexicon       | docs/wiki/             | 33    | 267,866 |
| badges                 | docs/badges/           | 57    | 85,298  |
| benchmark ledger       | docs/benchmark/        | 79    | 56,179  |
| platform / consumables | database (NOT READ)    | —     | —       |

## Tagging summary
Schema from the spec (source, type, arc_position, body_state, cosmo_cleared) adopted unchanged. 0 documents tagged. All default to cosmo_cleared: false.

## Corpus statistics
0 training pairs built. Gate needs > 10,000. Doc word total ≈ 618k words available as raw material (not yet pairs).

## Calibration scope (Vadik & Kuzya brief) — PROVISIONAL
Goal as stated: take a person's soul/emotion signal and calibrate the human against humanoid output (grace, poetry, love, hugs, "been there", "been cool").
What is real and buildable: a CONSENTED calibration profile (journal, mood, self-care, intentions already in LOT®) -> context vector -> QI·46 response in LOT® voice. Layers 1, 3, 4 of the spec.
What is NOT real: "uploading a being". No method exists to capture a person's soul. Do not claim it in product copy. The profile is a model of expressed signals, not the person.
Output-register targets to encode as voice-calibration prompts (Layer 3): grace, poetry, love, presence ("been there"), ease ("been cool"). Hugs = Quantum Cube haptic channel (Layer 4, month 12+); not a text output.
Open item: "male" in the brief is unspecified — needs Vadik clarification (voice register? profile field?). Not guessed.

## Gate result
HOLD. Checkpoint 0 unmet: corpus not built, no tagging, no COSMO® clearance, no 100-sample Vadik review.

## Blockers needing Vadik (judgment, not mechanism)
1. Consent + privacy: subscriber journals/emotional data may enter training only with explicit opt-in per person, revocable, with a deletion path. Define before Phase 0.2 touches the DB.
2. Locate or upload LOT_QI-46_ENGINE-2.md.
3. Clarify "male".
4. Base-model choice is deferred to Phase 1 (spec); this repo has no GPU/training pipeline today (inference runs via hosted providers in src/server/utils/ai-engines.ts).

## Next session
Phase 0.2: write a tagger over docs/ (non-subscriber) to emit JSONL with the schema, then queue Vadik's 100-sample review.
