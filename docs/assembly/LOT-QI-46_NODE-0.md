# LOT QI·46 — NODE 0 (first node, provisional)

S-2: VADIK MARMELADOV · KUZYA · 2026-10-08 · STATUS: PROVISIONAL

## Name
**QI·46** selected (S-2 recommendation). Fits the `_I` grammar (BI, KI, QI). `46` = founding-cohort era marker.
Alternates on record: LOT·SC·46, BIONODE-46, SELFWARE·46, SOMA·46, CARE·OS·46.

## Source document
`LOT_QI-46_ENGINE-2.md` was referenced as the first node. **It is not in the repo, its git history, or the container.**
Node 0 is therefore seeded from the brief only. Commit the file to `docs/assembly/` and the next session will reconcile it into this node.

## Goal (as briefed)
Calibrate a human's recorded soul/emotion signal against humanoid output registers:
`grace · poetry · love · hugs · being-there · being-cool · male`.

## Honest boundary
No system uploads a person's being. What can be built is a **calibration profile**: consented signals
(journal, mood, QOS, check-ins already in LOT) mapped to a register vector, then used to condition output tone.
The profile is a model of expressed signal, not the person. Mark every claim beyond this `PROVISIONAL`.

## Calibration schema (draft)
| Field | Meaning |
|---|---|
| `subject` | user id, consent flag required |
| `signals[]` | existing LOT sources (journal, mood, QOS trend) with timestamps |
| `registers{}` | 0..1 weight per output register above |
| `drift` | change in registers vs previous snapshot |
| `guard` | registers never exceed subject-set ceiling; subject can zero the profile |

## Self-assembly plan (next sessions)
1. N0 (this): name, schema, boundary.
2. N1: reconcile `LOT_QI-46_ENGINE-2.md`; map `signals[]` to real tables in `prisma/`.
3. N2: register-vector computation behind a feature flag; no model call without subject consent.
4. N3: output conditioning layer + per-subject review UI.
