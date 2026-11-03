# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-11-03
Session: session_01B5eNPMevPDA45orXVt3wW8
Author: Vadik & Kuzya
Node: 1 (spec: docs/corporate/LOT_QI46_ENGINE.md)

## Naming
QI·46 adopted (grammar BI / KI / QI, matches existing LEXICON token `QI`). Candidates not chosen: LOT·SC·46, BIONODE-46, SELFWARE·46 (kept as codename), SOMA·46, CARE·OS·46.

## Node resolution
Requested file `LOT_QI-46_ENGINE-2.md` does not exist in the repo or git history. Resolved to `docs/corporate/LOT_QI46_ENGINE.md` (5115 words), the only QI·46 spec. If an ENGINE-2 exists elsewhere, supply it; it becomes node 2.

## Sources read (docs/ only; /corpus/ does not exist yet)
| Spec source (Step 0.1)  | Live repo mapping              | MD files | Words   |
|-------------------------|--------------------------------|---------:|--------:|
| /corpus/institute/      | docs/corporate/                |       25 |  42,031 |
| /corpus/brand/          | docs/badges/, docs/wiki/       |   32, 33 | 85,298 / 267,866 |
| /corpus/platform/       | docs/assembly/, docs/benchmark/|   98, 79 | 101,645 / 56,179 |
| /corpus/bioelectric/    | none identified               |        0 |       0 |
| /corpus/consumables/    | none identified               |        0 |       0 |
| /corpus/cosmo/          | none identified               |        0 |       0 |
| (engineering, excluded) | technical, deployment, releases, security, setup, diagnostics, backup | 82 | ~94k |

Subscriber data (journal entries, logs) lives in PostgreSQL (migrations/ define logs, chat_messages, answers, audit/agent ledger tables). It was NOT read this session.

## Tagging summary
No documents tagged. Tagging schema from the spec needs `arc_position` and `body_state`, which repo docs do not carry. Only `source` and `type` can be assigned mechanically. `cosmo_cleared` is false for all by default (no COSMO® screen exists in code).

## Corpus statistics
Training pairs: 0 (gate requires > 10,000). Doc word total ~600k, but these are system documents, not prompt/completion pairs.

## The upload goal — what is real, what is provisional
Goal as stated: extract the engine from people's soul and emotions; upload a person's being; calibrate human to humanoid output (grace, poetry, love, hugs, being there, being cool, male).

REAL / buildable: a consented per-person Calibration Vector (Layer 1) built from journal entries, self-reported states and ratings, injected into each inference. Voice targets above become a tone rubric in Layer 3 / Step 1.3 calibration prompts.
PROVISIONAL: "upload of a being." Nothing in this pipeline captures a person; it captures what they chose to write and rate. Record it as a profile, not a person.
BOUNDARIES to decide before any real subscriber data enters the corpus (HOLD items for Vadik):
1. Explicit opt-in per person; deletion path that also removes derived vectors.
2. Emotional data is sensitive; training the shared model on it needs separate consent from per-user context use.
3. "Hugs", "being there" are outputs a text engine can only simulate. Voice layer should not claim presence or physical contact.
4. "male" is a persona attribute; make it a configurable tone setting, not a baked-in default for every subscriber.

Proposed tone rubric (PROVISIONAL, for Step 1.3 test prompts): grace = restraint; poetry = image over explanation; love = specific attention to the person's own words; being-there = stays in the moment, no fix-it list; cool = unhurried, short.

## Gate result
HOLD — Checkpoint 0: 0/6 boxes met (inventory partial; no tags; no cosmo_cleared; 0 pairs; no JSONL; no Vadik review).

## Next session
Create /corpus/ layout and a read-only exporter that tags docs/ by `source`/`type` into JSONL (no subscriber data), then Vadik reviews 100 samples.
