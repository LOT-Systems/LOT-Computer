# QI·46 Assembly Log — Node 1 — Phase 0 — Corpus Assembly
Date: 2026-11-07
Session: session_01B5eNPPboAYyUvd3DfdA3Gz · branch `claude/cool-tesla-6ys1s5`
Author: Vadik & Kuzya

## Naming
Adopted: **QI·46** (Quantum Intelligence Engine, Gen 46, codename SELFWARE). First node = `docs/corporate/LOT_QI46_ENGINE.md`
(the file named `LOT_QI-46_ENGINE-2.md` in the brief does not exist in the repo; this is its only match).

## Goal (restated)
Extract an engine built on a person's soul and emotion; calibrate the human to the humanoid output
(grace, poetry, love, hugs, being there, being cool). Mapped to the spec: Layer 1 Calibration Loop
(user context vector) + Layer 3 Response Grammar + Layer 4 Memory Arc + Layer 5 COSMO® node.

## Sources read (Step 0.1, repo-only; real counts)
| Source | Dirs | Pairs |
|---|---|---|
| institute | docs/corporate, docs/wiki | 1133 |
| platform | docs/assembly, docs/benchmark, docs/releases | 860 |
| bioelectric | docs/badges | 445 |
| technical | docs/technical, diagnostics, security | 352 |
| brand | docs/setup, docs/deployment | 200 |

Not present in this checkout: subscriber journals, consumable feedback, COSMO® event logs (`/corpus/platform`, `/consumables`, `/cosmo`).

## Tagging summary (Step 0.2)
345 documents → 2,990 section-level pairs · ~713k words · ~963k est. tokens.
COSMO® pre-screen (regex for emails/phones/secrets): 2,934 cleared · 56 flagged for Vadik review.
Tool: `node scripts/qi46-corpus-inventory.mjs [--jsonl out.jsonl]` (dry run, writes no training data by default).

## Gate result — CHECKPOINT 0: **HOLD**
- [x] Sources inventoried (repo portion)
- [x] Tagged per schema (source/type/cosmo_cleared; arc_position/body_state pending)
- [ ] COSMO® cleared on all — 56 flagged
- [ ] Corpus > 10,000 pairs — 2,990 (company docs only; subscriber data absent)
- [ ] JSONL prompt/completion format — only tag/ref stubs emitted; completions not authored
- [ ] Vadik review of ≥100 random samples — not done

HOLD is the gate working. Doctrine: fix, re-run from Phase 0.

## "Upload a person's being" — design guardrails (carry into Phase 1)
Soul/Being upload ingests the most sensitive data there is. Binding rules for the node:
1. Opt-in, per person, revocable; the person owns the profile; delete = true delete (corpus + vectors).
2. Per-person context vector only; never pooled into the shared base model without separate consent.
3. Humanoid output is *calibration to the person*, not impersonation of them or of others.
4. COSMO® node holds any response failing: safe for a child / safe for a body under stress / honest.
5. Output voice: grace, poetry, love, presence, cool — Terminal Grid cadence, one idea, no hedging.

## Next session
Fix the 56 flags, author prompt/completion pairs from the 12-cohort material with consent, add `arc_position`/`body_state`
tags, reach 10k pairs, then Vadik samples 100 — Checkpoint 0 re-run.
