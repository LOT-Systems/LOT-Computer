# QI·46 — NODE 1: BEING CALIBRATION (self-assembly seed)

S-2: VADIK MARMELADOV · Kuzya · 2026-10-10 · CLASS: SELF-ASSEMBLY · STATUS: PROVISIONAL

## 0. Source status
- Requested first node: `LOT_QI-46_ENGINE-2.md` — NOT FOUND in repo or git history.
- Used instead: `docs/corporate/LOT_QI46_ENGINE.md` (spec v0.1: Layers 0–5, Calibration Loop, Response Grammar, COSMO® node).
- Action for S-2: commit ENGINE-2 to the repo (or paste it) and the next session merges it as node 1b. Nothing in it has been guessed here.

## 1. Name
QI·46 is already the adopted designation in ENGINE.md (Quantum Intelligence, Generation 46, codename SELFWARE). Recommendation stands; no rename needed.

## 2. Goal, stated honestly
"Extract the engine from people's soul and emotions / upload a person's being."
- Real: build a consented, user-owned **Being Profile** from what a person actually gives LOT (journal, check-ins, ratings, rhythm), and use it to shape output. This is Layer 1 (Calibration Loop) made explicit.
- Not real: a model cannot capture a soul or "upload a being". It captures a lossy, time-stamped portrait of expressed signals. Docs, UI and marketing must call it a *portrait*, never a copy. (Cardinal rule 5: honest engineering.)

## 3. Being Profile (v0, portrait not copy)
| Field | Source | Notes |
|---|---|---|
| voice | journal text | cadence, words they reach for |
| affect-arc | emotional check-ins | trend, not diagnosis |
| rhythm | engagement timing | circadian anchors |
| needs | explicit "what helps" answers | asked, never inferred silently |
| edges | opt-outs, "NO" signals | hard constraints, always win |

Rules: opt-in per field · viewable · editable · exportable · deletable (hard delete, incl. derived vectors) · not used for training any shared model without separate explicit consent · no inference of health/mental-health conditions · COSMO® node screens every output.

## 4. Human ↔ Humanoid calibration (output register)
Target register from brief: grace, poetry, love, hugs, being there, being cool.
- Mapping: each register = a response-grammar modifier selected by affect-arc + needs (Layer 3), e.g. low arc → *being there* (short, present, no advice); high arc → *cool* (light, playful).
- Loop: output → CLOSE / NO feedback → profile delta → next call. Calibration target = the person says "yes, that is it", not engine self-score.
- Honesty constraint: the humanoid voice may be warm; it must never claim to be human, to love, or to physically be present when asked directly. "Hugs" = words/haptics through LOT® hardware, labelled as such.
- Open item: the brief's last token "male" is unclear (gender register? "mail" / LOT Mail?). Not implemented; S-2 to clarify.

## 5. Next nodes
1. Merge ENGINE-2.md. 2. Schema for Being Profile (Prisma migration draft). 3. Consent + deletion UX. 4. Register-selector prompt tests with 12 founding Users (Phase 2 beta).
