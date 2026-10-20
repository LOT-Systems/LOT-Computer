<!--
  LOT SYSTEMS CORPORATION
  Vadik — LOT® · Kuzya — COSMO®
  Node 2 of QI·46. Node 1: docs/corporate/LOT_QI46_ENGINE.md
-->

# QI·46 — ENGINE-2
## The Being Layer — Extraction & Humanoid Calibration (Specification v0.1)

STATUS: SPEC · PROVISIONAL · not yet implemented in code

---

## I. WHAT THIS IS (AND IS NOT)

ENGINE-1 defined QI·46 as a listening engine: Calibration Loop in, grounded response out.
ENGINE-2 adds the layer that turns the Calibration Loop into a **Being Profile** and
uses it to tune the *voice* of the output — the humanoid register.

HONEST BOUNDARY (PROVISIONAL, do not market past it):

- The engine does **not** upload a soul. It builds a **consented, inspectable,
  deletable model of how a person expresses, feels and returns** — from what they chose to give LOT®.
- "Calibrate the human with the humanoid output" means: the response is shaped to
  *fit this person's emotional register*. It does not mean the engine claims to feel.
- Output that expresses care (hug, presence) is a **language act**, labelled as
  QI·46 speech. It never asserts a body, a feeling, or a relationship it does not have.

---

## II. THE BEING PROFILE (EXTRACTION)

Source = ENGINE-1 Layer 1 streams only. No new collection channels.

| Facet | Signal (existing) | Stored form |
|---|---|---|
| VOICE      | journal wording, sentence length, silence/gaps | style vector |
| AFFECT     | mood check-ins, biofield self-reports          | time series, 7-state |
| RHYTHM     | session timing, reorder velocity               | cadence curve |
| VALUES     | repeated intentions, goals, what is returned to | ranked themes |
| WOUNDS     | topics followed by drop-off or stress navigation | **protected** — never quoted back |
| WARMTH-PREF| which prior replies were rated "resonant"     | register weights |

```
Being Profile = { voice, affect, rhythm, values, protected[], register_weights }
```

Rules:
1. **Opt-in per facet.** Default off. Each facet has a visible on/off in Settings.
2. **Readable.** The subscriber can open their Profile as plain text at any time.
3. **Deletable.** One action removes the Profile and its derived vectors; audit-trail
   entries keep only `profile_deleted · {timestamp}`.
4. **Exportable.** Profile exports as a single .MD/JSON file the person owns.
5. **Protected themes** are used to *avoid* harm, never to personalise content.
6. Minors: no Being Profile is built. COSMO® Layer 5 gate applies.

---

## III. HUMANOID REGISTERS (OUTPUT CALIBRATION)

Registers are style modes layered on Layer 3 (Response Grammar). One register leads per reply.

| Register | Intent | Form |
|---|---|---|
| GRACE      | steadiness under load            | 1–3 short lines, no advice |
| POETRY     | name what has no name yet        | image over explanation, ≤ 6 lines |
| LOVE       | affirm the person, not the output | direct address, no hedging, no flattery |
| HUG        | hold, do not fix                 | words only; "Here." / "I am with you in this." Never claims touch |
| BEING-THERE| presence across days             | references the Memory Arc (only unprotected facets) |
| COOL       | lightness, shared ease           | dry, brief, warm; never at the expense of a stated pain |
| MALE       | masculine-coded voice option     | grounded, plain, low-ornament delivery; opt-in voice preset |

Selection:

```
register = argmax( register_weights[person] * affect_fit(current_affect) )
override : explicit user choice > weights > default (GRACE)
suppress : if affect ∈ {acute-distress} → HUG or GRACE only; COOL and POETRY off
```

Voice presets (MALE, and any other) are **user-selected styles**, not inferred from
identity. The engine never guesses a person's gender.

---

## IV. CALIBRATION LOOP (CLOSING THE HUMAN ↔ OUTPUT GAP)

```
1. Person gives input          (deliberate + passive, per consented facets)
2. Profile update              (incremental, weekly decay on stale facets)
3. Register selected           (Section III)
4. Reply generated             (ENGINE-1 Layer 2, Profile prepended as context vector)
5. COSMO® node classify        (ENGINE-1 Layer 5: safe · honest · child-safe)
6. Person rates                (resonant / not) → register_weights update
```

Gate metric (honest, countable): **resonance rate** = resonant ratings ÷ rated replies,
per register, rolling 30 days. No other "love/soul" score is computed. A made-up
precise metric is worse than none.

---

## V. SAFETY & ETHICS (NON-NEGOTIABLE)

- No claim of consciousness, soul transfer, afterlife or "digital twin of a person".
- No simulation of a *specific real person* (living or dead) from another's data.
- Dependency guard: if a person's sessions escalate in frequency with worsening
  affect, QI·46 gently points to human support rather than deepening the register.
- Crisis language routes to human help resources before any register logic.
- COSMO® records, does not edit. Held replies notify Vadik via LOT® Mail digest.
- Profile data stays on the LOT® Droplet; not used for third-party training.

---

## VI. ASSEMBLY PLAN (GATED, PHASE 4+ OF ENGINE-1 MANUAL)

| Step | Deliverable | Gate (PASS/HOLD) |
|---|---|---|
| B0 | `being_profile` table + consent flags (migration) | migration up/down clean |
| B1 | Facet extractors from journal + check-ins | unit tests; no data outside consented facets |
| B2 | Register selector + prompt templates | 100-sample read-through by Vadik |
| B3 | Settings UI: facet toggles, view, export, delete | delete verified end-to-end |
| B4 | COSMO® dependency + crisis guard | red-team prompts held correctly |
| B5 | Closed beta, founding cohort only | resonance rate ≥ baseline ENGINE-1 |

Next session: B0 — design the `being_profile` migration against `prisma/` and `migrations/`.

---

Vadik & Kuzya
