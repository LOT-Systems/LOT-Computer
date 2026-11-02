# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-11-02
Session: LOT-SR-20261102-01 (claude.ai/code session_01B5eNPPXnK9TCcsM3Fr6SEx)
Author: Vadik
Spec: docs/corporate/LOT_QI46_ENGINE.md (v0.2). The brief named `LOT_QI-46_ENGINE-2.md`; no such file exists. The v0.2 spec above was used as the first node.

## Naming decision
Name adopted: **QI·46**. It matches the spec, the LOT _I grammar (BI, KI, QI) and the existing `QI` token in LOT-LEXICON. No new lexicon token was minted. The other five candidates were not used.

## Sources read (Step 0.1 — source inventory, repo-only, read-only)
Counts are from the repo as it stands, not from the production database.

| Spec source dir | Repo reality | Files (md) | Words |
|---|---|---|---|
| /corpus/institute/ | docs/corporate (CQGS, Quantum Cube, vision, product briefs) | 25 | 47,564 |
| /corpus/brand/ | docs/wiki (LOT-WIKI), docs/technical, About copy | 33 + 29 | 267,866 + 55,051 |
| /corpus/bioelectric/ | docs/badges (badge/pattern codex), docs/assembly (QIE engine logs) | 32 + 98 | 212,926 + 101,645 |
| /corpus/cosmo/ | no COSMO event logs in repo (only the ROBOTICS_COSMO doc and mentions in corporate docs) | 0 | 0 |
| /corpus/platform/ | no subscriber journals in repo (they live in the database: log, answer, chat-message models) | 0 | 0 |
| /corpus/consumables/ | not present | 0 | 0 |

Process docs (docs/benchmark, backup, deployment, diagnostics, releases, security, setup) hold 98,000+ words. They are excluded from the corpus as non-voice material.

## Tagging summary
Not started. Nothing was tagged and no JSONL exists (`find *.jsonl` → 0). The spec's tag schema needs a `cosmo_cleared` flag per document. No COSMO® node exists in code that can set it.

## Corpus statistics
Training pairs: **0** (gate requires more than 10,000). Prose available in repo is roughly 685k words across the institute, brand and bioelectric sources. It is unlabeled and holds no prompt/completion pairs.

## Vadik review notes
None this session. Review is a human gate (minimum 100 random examples) and has not happened.

## Gate result
**CHECKPOINT 0 — HOLD.** Every box is unchecked, as expected for a first inventory.
- [ ] Sources inventoried: partial. The repo side is done. The platform, cosmo and consumables sources need database or ops access.
- [ ] Tagged per schema
- [ ] COSMO® cleared on all examples
- [ ] More than 10,000 pairs
- [ ] JSONL validated
- [ ] Vadik review of 100 samples

## Honest boundaries (PROVISIONAL)
- **"Upload a person's being" maps to the Calibration Loop (Layer 1).** That is a user-specific context vector built from journals, self-reported states and passive signals. It is personalization, not a copy of a person. Nothing in this session ingests or trains on anyone's data.
- **Humanoid output (grace, poetry, love, hugs, "being there", "being cool")** maps to Layer 3, the Response Grammar. It is a voice target tested by the Phase 1 tone prompts.
- **"Bing there, bing cool, male" is ambiguous.** It reads as "being there", "being cool" and possibly "mail" (LOT® Mail). It is held for S-2 to confirm and was not acted on.
- **Consent gate before any Phase 0 ingest of subscriber data.** The spec says subscribers "are the corpus". No consent or data-use basis is recorded in the repo. Before `/corpus/platform/` is built, S-2 needs to confirm what subscribers agreed to. This matters most for journal content, and for the medical and PTSD cohort material in docs/corporate (LOT_Medical_Records, LOT_PTSD_Protocol), which should stay out of the training corpus until reviewed.
- **No model was trained or run.** Phases 1–4 are future work and need GPU compute and a base-model decision. The spec says that decision is made at Phase 1.
- **Brand rule conflict.** The Assembly Card says "only LOT® and COSMO® as brand names". The spec itself names external products (Cloudflare Tunnel, Fastify, PostgreSQL, a Resend-compatible mailer). This is for S-2 to resolve before the voice corpus is cut.

## Next session
Phase 0 Step 0.2: draft the tagging script and a consent/exclusion list (medical and PTSD material out by default), then inventory the platform tables read-only and count rows only, with no content export.
