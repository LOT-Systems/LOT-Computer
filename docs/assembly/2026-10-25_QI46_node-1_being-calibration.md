# QI·46 — NODE 1 — BEING CALIBRATION
Date: 2026-10-25 · Author: Vadik & Kuzya · Source: docs/corporate/LOT_QI46_ENGINE.md
Status: SPEC · PROVISIONAL · no code shipped this session

## 0. Naming
QI·46 confirmed (LOT _I grammar: BI, KI, QI). Candidates held in reserve:
LOT·SC·46 · BIONODE-46 · SELFWARE·46 · SOMA·46 · CARE·OS·46.
Note: the stored engine doc is `LOT_QI46_ENGINE.md` (no "-2" file exists in the repo). It is treated as the first node.

## 1. Goal (restated honestly)
Build the engine from people's emotional life, so a person's way of being can be
represented and the output (the humanoid register) can be calibrated to it.
What is real: a consented, user-owned **Being Profile** (a structured model of
voice, values, rhythms, emotional patterns) plus a **Humanoid Register** that
shapes engine output. What is not claimed: a literal upload of a soul or a person.
The profile is a portrait that the person can read, correct, export and delete.

## 2. Being Profile (input side, extends Layer 1 Calibration Loop)
| Field            | Source                                        | Owner |
|------------------|-----------------------------------------------|-------|
| voice            | journal text, chosen words, cadence            | person |
| affect_map       | self-reported biofield/mood check-ins          | person |
| rhythm           | sleep/routine/engagement cadence               | person |
| values           | stated intentions, completed vs dropped goals  | person |
| bonds            | who they name as close (names stay local)      | person |
| signature        | what makes them laugh, calm, steady            | person |

Rules: explicit opt-in per field; no inference of health/identity traits beyond
what the person states; every field viewable, editable, deletable; export as JSON;
deletion removes derived vectors; no training on a profile without separate consent.
Minors: no Being Profile without guardian consent.

## 3. Humanoid Register (output side, extends Layer 3 Response Grammar)
Seven registers, each a dial 0–1 stored per person, default 0.5, adjustable by them:

| Register   | Output behavior                                              |
|------------|--------------------------------------------------------------|
| GRACE      | unhurried, no hedging, never scolds                          |
| POETRY     | one image per reply, concrete nouns, Terminal Grid cadence   |
| LOVE       | names what the person did right, warmth without flattery     |
| HUGS       | short, grounding, body-first lines ("shoulders down. breathe.") |
| BEING-THERE| presence over advice: reflect, stay, do not fix              |
| COOL       | dry, light, unbothered; humor only if profile.signature allows |
| MALE       | masculine voice option (direct, steady, protective); selectable, not default |

Honesty constraints (override every dial): the engine states it is an AI when
asked; HUGS and LOVE are language, never claims of physical presence or human
feeling; no manipulation of attachment to drive retention; crisis language routes
to human help, COSMO® holds the response.

## 4. Calibration loop (human ⇄ humanoid)
1. Read Being Profile → build context vector.
2. Draft response in register mix.
3. COSMO® node classifies (safe, honest, child-safe) and logs.
4. Person rates "that is it / not it" → adjusts dials (never silent drift).
5. Weekly diff shown to the person: what the engine learned. They can veto.
Coherence metric (existing doc): proportion of "that is it" ratings per register.

## 5. Self-assembly plan (LOT® style)
| Phase | Deliverable                                   | Gate |
|-------|-----------------------------------------------|------|
| N1.0  | Being Profile schema + consent screens        | consent audit PASS |
| N1.1  | Register dials in system prompt builder       | 100-sample Vadik review |
| N1.2  | COSMO® honesty/attachment rules               | red-team set PASS |
| N1.3  | Founding cohort pilot (opt-in)                | coherence ≥ baseline, 0 safety holds unresolved |

## 6. Open decisions for Vadik & Kuzya
- Is MALE a selectable register, or a persona pack among others?
- Where Being Profile lives (per-user encrypted column vs separate store).
- Does `bonds` store names at all, or only roles.
