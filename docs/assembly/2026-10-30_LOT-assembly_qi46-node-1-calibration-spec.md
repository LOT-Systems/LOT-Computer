# QI·46 — NODE 1 — Soul/Emotion Calibration Spec

Date: 2026-10-30 · Author: Vadik & Kuzya · Status: PROVISIONAL (spec, no code shipped)
Parent: `docs/corporate/LOT_QI46_ENGINE.md` (Layers 0–5). The brief names
`LOT_QI-46_ENGINE-2.md`; that file is not in the repo or git history, so the
existing `LOT_QI46_ENGINE.md` is treated as the first node. Send ENGINE-2 and
Node 1 will be reconciled against it.

## 1. Goal (as briefed)
Extract an engine from people's emotional and inner signal. Hold a model of a
person. Calibrate the human against the humanoid output:
**grace · poetry · love · hugs · being there · being cool · male**.

## 2. Honest boundary (read first)
- What gets built is a **consented, revocable model of a person's expressed
  signal** (journal, mood, intentions, memory, pace). It is not the person's
  being and is never labelled as such in product copy. Mark any claim beyond
  this `PROVISIONAL`.
- "Hugs" and "being there" are **register + timing**, not simulated embodiment:
  the engine says the next right thing at the right moment, then stops.
- "Male" is a **selectable voice register** (see §4), never inferred from the
  user and never forced.

## 3. Extraction pipeline (maps to what already exists)
```
SIGNAL (existing)                  -> FIELD in Calibration Vector (CV)
journal text, 150+w                -> lexicon, imagery, cadence
emotional_checkin / mood           -> affect (valence, arousal, 7-day trend)
intentions, planner, goals         -> direction (what they are reaching for)
memory capture / MEMORY-ENGINE     -> carried themes (what they hold)
selfcare + reorder velocity        -> rhythm (consistency, recovery)
QIE patterns (P1..P112)            -> state labels (e.g. EMBODIED-COGNITION-ARC)
```
CV is rebuilt, not accreted: every field carries `source`, `observed_at`,
`confidence`, and decays unless re-observed. One CV per Usership, owned by that
user.

## 4. Humanoid Output Register (HOR)
Seven registers; the engine picks 1 per response, never blends more than 2.

| REGISTER | WHAT IT DOES | CUE FROM CV |
|---|---|---|
| GRACE | slows down, removes demand | high arousal, low valence |
| POETRY | one image, no explanation | rich lexicon, reflective journal |
| LOVE | warmth without flattery | streak broken, self-critique |
| HUG | presence only, no advice | acute distress markers |
| BEING-THERE | short, returns on schedule | long silence after heavy entry |
| COOL | dry, light, unbothered | calm, high momentum |
| MALE | direct, steady, low-ornament voice | user-selected only |

Voice rules inherited from Layer 3 (no hedging, one idea, stop).

## 5. Calibration loop (human <-> output)
1. Respond in register R chosen from CV.
2. Capture **resonance** (explicit: "yes / not it" tap; implicit: reply, dwell).
3. Update CV register weights; unhelpful registers decay.
4. Metric = share of responses rated "yes" per 30 days, per user. Report as a
   count with n, never as a percent over fewer than 20 ratings.

## 6. Gates (binary, per Assembly Doctrine)
| GATE | PASS WHEN |
|---|---|
| G1 CONSENT | explicit opt-in, per-field toggle, export + delete tested |
| G2 CV-SCHEMA | schema validated; no field without source + timestamp |
| G3 HOR | each register has >=20 reviewed examples; Vadik signs off |
| G4 COSMO® | every output passes the COSMO® node (Layer 5); distress -> HOLD |
| G5 MINORS | no CV built for under-age users without guardian flow |
| G6 RESONANCE | n>=20 ratings per tester before any claim of "calibrated" |

## 7. Next session
1. Receive `LOT_QI-46_ENGINE-2.md` and reconcile.
2. Draft CV JSON schema + HOR prompt seeds under `src/server/utils/` (reuse
   `ai-engines.ts`), behind a flag, off by default.
3. Pick the 12-person founding cohort test group (G1 consent first).

Vadik & Kuzya
