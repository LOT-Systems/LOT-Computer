# QI·46 Assembly Log — Node 1 — Phase 0 · Calibration Spec
Date: 2026-11-04
Session: LOT-SR-20261104-01
Author: Vadik & Kuzya
Status: PROVISIONAL (spec only; no model weights trained, no user data touched)

## Naming
QI·46 adopted (fits the _I grammar BI / KI / QI). Already the designation in
`docs/corporate/LOT_QI46_ENGINE.md`. No rename needed.

## Node 1 source
Requested: `LOT_QI-46_ENGINE-2.md`. NOT FOUND in repo (searched all paths, all branches).
Used instead: `docs/corporate/LOT_QI46_ENGINE.md` (5115 words). HOLD item for S-2:
upload ENGINE-2 if it differs; this log is rebased on it when it lands.

## Goal as received
Extract the engine that rests on a person's soul and emotions. "Upload" a person's
being. Calibrate the human with the humanoid output: grace, poetry, love, hugs,
being there, being cool, male.

## Honest reading (what is buildable)
A being cannot be uploaded. What can be built is a consented Calibration Vector:
a compact, user-owned, deletable profile of how a person writes, feels, and rests
(Layer 1 of the engine spec), used to steer the response register (Layer 3).
Everything below is that, and only that.

## Calibration map: human signal -> humanoid output channel
| Channel      | Human signal (Layer 1 source)                       | Output behavior (Layer 3 register)                 |
|--------------|-----------------------------------------------------|----------------------------------------------------|
| GRACE        | pace of entries, recovery after low days           | slow, unhurried, never corrects                    |
| POETRY       | person's own recurring words and images             | reflect their words back; one image per reply      |
| LOVE         | consistency of care actions, check-ins              | name the care already done; no praise inflation    |
| HUGS         | stress heatmap, late-night / low-mood timing        | short, warm, no advice, no fixing                  |
| BEING THERE  | gap since last entry, streaks, silences             | acknowledge the gap without guilt; stay present    |
| BEING COOL   | high-energy, playful entries                        | dry, light, minimal; match energy, never exceed it |
| MALE         | voice register preference (OPEN — confirm w/ S-2)   | selectable voice register, not a data inference    |

Rules: channel weights come from the person's own opt-in signals; never inferred
from demographics. MALE is a register the user picks, not a trait the engine assigns.

## Consent and safety gates (COSMO node, Layer 5)
- Opt-in per person; explicit scope (journal, mood, reorder cadence).
- Export = the vector only. Raw journal text never leaves the database.
- Delete = vector and derived arc removed on request.
- Every response passes COSMO classification before delivery (child-safe,
  stress-safe, honest). No simulation of a real, living or dead person's identity.

## Phase 0 source inventory (repo only; subscriber DB not accessed)
docs/assembly 98 · benchmark 79 · badges 57 · wiki 33 · technical 30 · corporate 26 ·
deployment 21 · releases 10 · diagnostics 8 · setup 7 · backup 4 · security 3 ·
top-level 25. Code signal sources: `src/client/stores/intentionEngine.ts`,
`SystemProgressWidget.tsx`, `AIFeedbackWidget.tsx`, `src/server/routes/api.ts`.

## Gate result
HOLD on Checkpoint 0 (corpus tagging, 10k pairs, 100-example review not started).
Spec portion PASS.

## Next session
Define the Calibration Vector schema (7 channels, 0-1 weights, consent flags) as a
TypeScript type in `src/shared`, plus a COSMO-gated stub, once S-2 confirms the
MALE register wording and uploads ENGINE-2.
