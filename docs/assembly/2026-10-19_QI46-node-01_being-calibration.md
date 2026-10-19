# QI·46 — NODE 01 — BEING CALIBRATION
### Extension of `docs/corporate/LOT_QI46_ENGINE.md` (note: the brief named `LOT_QI-46_ENGINE-2.md`; the repo holds `LOT_QI46_ENGINE.md` — treated as the first node)
Author: Vadik · Named for: Kuzya · Status: SPEC v0.1 — PROVISIONAL (no code shipped)

---

## 1. GOAL

Extract an engine from a person's emotional signal and use it to **calibrate the human with the humanoid output**.

Humanoid output = **grace · poetry · love · hugs · being there · being cool · male**.

## 2. HONEST FRAME

A person cannot be uploaded. What QI·46 can build is a **Being Profile**: a consented, versioned, user-owned model of how this person expresses and receives care. It is a map, not the person.

The engine does not claim to feel. It claims to *fit*: the output is tuned to the body that is asking (Layer 1, Calibration Loop). This node adds the *humanoid register* on top of that fit.

## 3. THE BEING PROFILE (extraction)

Built from the existing Calibration Loop streams (Layer 1). No new data class is collected without opt-in.

| Facet | Source signal | Stored as |
|---|---|---|
| VOICE | journal language: cadence, length, words they return to | style vector |
| AFFECT | self-reported biofield state, resonance ratings, drop-off under stress | 7-axis affect vector (below) |
| TOUCH | haptic preference (Quantum Cube), consumable cadence | preference scalars |
| PRESENCE | when they reach for the platform; what they reach for under stress vs. calm | time/need pattern |
| LINEAGE | arc position (Memory Arc, Layer 4) | arc node |

Rules: user-owned, exportable, deletable; `cosmo_cleared` must be true before any facet enters training; raw journal text never leaves the LOT® Droplet.

## 4. THE HUMANOID REGISTER (output calibration)

Seven channels. Each is a 0.0–1.0 gain set per person, learned from resonance ratings ("yes. that is it."), never set globally.

| Channel | Meaning in output | Constraint |
|---|---|---|
| GRACE | unhurried; no pressure, no correction tone | Terminal Grid cadence, one idea |
| POETRY | image over instruction; one concrete image max | no ornament without payload |
| LOVE | addressed to *this* person, by what they have carried | never generic affection |
| HUGS | haptic/embodied language; may trigger Cube feedback (month 12+) | only if TOUCH facet opted in |
| BEING THERE | presence over advice: stays, reflects, stops | may return no advice at all |
| BEING COOL | steady, unbothered, no alarm language | never dismisses distress |
| MALE | masculine register (plain, grounded, protective) | **selectable voice profile, not a default**; user chooses register |

```
calibrate(person, draft):
  gain   = person.humanoid_gain            # 7 channels
  tone   = match(draft, gain)              # rewrite pass, not new content
  score  = resonance_predict(person, tone) # trained on past ratings
  return tone if score >= person.floor else draft
```

Calibration shifts *tone*, never *facts*. Honesty check (COSMO® STEP 1) runs after calibration.

## 5. SAFETY GATES (COSMO® node, Layer 5)

- Love/hugs language must not imply the engine is a person, a partner, or a replacement for people. It speaks as the platform.
- BEING COOL cannot suppress distress signals; a crisis signal overrides all channels and routes to the plain, direct safety response.
- Dependence guard: if daily engagement rises while Calibration Loop outcomes fall, HOLD and notify Vadik.
- Minors: Kuzya-safe test applies to every output ("safe for a child who might read it").
- Consent ledger: every facet has an opt-in timestamp; withdrawal deletes the facet and retrains gains.

## 6. SELF-ASSEMBLY PLAN (LOT® style: phase → gate → log)

| Phase | Deliverable | Gate (binary) |
|---|---|---|
| N1.0 | Being Profile schema + consent ledger (Prisma migration) | schema review by Vadik; typecheck green |
| N1.1 | Affect vector from existing journal/resonance data (offline job) | ≥100 reviewed samples; no raw text off-host |
| N1.2 | Humanoid gain learning from resonance ratings | held-out resonance predict beats untuned baseline |
| N1.3 | Calibration pass in Layer 3 (rewrite step) + COSMO® re-check | zero safety-gate regressions over test set |
| N1.4 | Opt-in UI in Calibration Loop | cold-start test passes |

Next session begins at **N1.0**: inspect `prisma/schema.prisma` and the existing journal/calibration modules, then draft the migration.

## 7. OPEN DECISIONS FOR VADIK

1. MALE: confirm as a selectable voice profile (recommended) versus a fixed engine register.
2. Which of the seven channels are enabled at launch (recommend GRACE, BEING THERE, POETRY first; HUGS after month 12 hardware).
3. Naming: `QI·46` per recommendation — confirmed in the engine doc; registrability check is outside this repo.
