# QI·46 — NODE 1 — Human ↔ Humanoid Calibration Spec

S-2: VADIK MARMELADOV · with Kuzya · 2026-10-21
Parent node (Node 0): `docs/corporate/LOT_QI46_ENGINE.md`
NOTE: the requested `LOT_QI-46_ENGINE-2.md` does not exist in the repo or git history. Node 0 is the closest file (`LOT_QI46_ENGINE.md`). Rename/supply if a different file was meant.

## Name decision
QI·46 (matches the `_I` grammar: BI, KI, QI; Node 0 already uses it). Existing QIE and `/qi` terminal are untouched.

## Goal (as stated)
Extract the engine from people's soul and emotions; "upload a person's being"; calibrate the human against humanoid output: grace, poetry, love, hugs, being there, being cool, male.

## What is real vs. provisional
| Claim | Status |
|---|---|
| A person's being can be uploaded | NOT POSSIBLE. No such technique exists. |
| A consented, longitudinal profile built from the person's own journal, mood, and signal data | REAL. QIE patterns/archetypes + Calibration Loop (Node 0, Layer 1) already do this. |
| Humanoid output tuned to that profile | REAL (prompt/context conditioning; fine-tune in Node 0 Phase 1). |
| "Emotion" in the output | PROVISIONAL. The engine models and expresses; it does not feel. Mark as such in UI. |

## BEING-PROFILE v0 (the calibration vector)
Derived only from the operator's own deliberate inputs plus passive signals they have opted into.
```
being_profile:
  rhythm:      circadian anchor, energy arc          # existing QIE signals
  affect:      mood/emotional check-in trajectory    # existing log types
  voice:       lexicon + cadence of own journal text # Layer 3 grammar
  care_style:  what lands (silence / instruction / warmth)
  consent:     { granted_at, scopes[], revoked_at }
  provenance:  every field cites its source log ids
```
Rules: opt-in per scope; operator can export and delete the whole profile; no cross-operator mixing; COSMO node clears every output (Node 0, Layer 5).

## OUTPUT CHANNELS (humanoid calibration targets)
Each channel = one target with a binary gate (PASS/HOLD), same as the Assembly Doctrine.
| Channel | Meaning | Gate (draft) |
|---|---|---|
| GRACE | unhurried, no correction-tone | 10/10 tone prompts, Vadik sign-off |
| POETRY | one image, no filler (Terminal Grid cadence) | 10/10, word-count cap |
| LOVE | specific to this person, never generic | cites >=1 profile field |
| HUG | presence without advice | no instructions, <= 2 sentences |
| BEING-THERE | continuity: references the arc, not the session | cites arc position |
| COOL | steady, low-affect, no exclamation | tone check |
| MALE | UNRESOLVED — see below | HELD |

OPEN FOR S-2: "male" (end of the channel list) is ambiguous. Options: (a) a voice register selectable by the operator, (b) a typo for another word (e.g. "mail", the LOT Mail channel), (c) a profile field the operator sets. Not implemented until clarified. A register must be operator-chosen, never inferred from the person.

## SELF-ASSEMBLY PHASES (Node 1)
1. N1.0 Schema: add `being_profile` + consent record (design only; no DB migration this session).
2. N1.1 Derive: build the vector from existing logs (read-only job, per operator).
3. N1.2 Condition: prepend vector to inference context (Node 0 Layer 2).
4. N1.3 Gate: channel tone tests + COSMO clearance.
5. N1.4 Report: one .MD per session (benchmark report).

## Held this session (needs S-2)
- Resolve "male".
- Confirm consent model (opt-in per scope) before any data is read.
- Confirm Node 0 file name.
