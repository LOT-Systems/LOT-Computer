<!-- LOT SYSTEMS CORPORATION · Vadik & Kuzya · QI·46 node 2 -->

# QI·46 — Being Calibration (Node 2)
### Extending LOT_QI46_ENGINE.md · Layer 1 (Calibration Loop) + Layer 3 (Response Grammar)

STATUS: PROVISIONAL DESIGN — not implemented in code. Nothing here ships until a gate passes.

---

## 1. Honest framing

A person's being cannot be uploaded. What can be built, with consent, is a **Being Profile**:
a compact, revocable, subscriber-owned model of how this person speaks, feels, rests and asks
for care — assembled only from what they deliberately gave LOT® (journal, check-ins, ratings,
reorder cadence). The engine calibrates *to* the profile. It never claims to be the person,
and it never claims to feel.

Spec basis: ENGINE §III Layer 1 (deliberate + passive inputs), Layer 4 (arc), Layer 5 (COSMO® node).
Note: the source file named `LOT_QI-46_ENGINE-2.md` does not exist in the repo; node 1 is
`docs/corporate/LOT_QI46_ENGINE.md`.

## 2. Being Profile (schema v0)

```json
{
  "subscriber_id": "…",
  "consent": { "granted_at": "ISO", "scope": ["journal","checkins","ratings"], "revoked": false },
  "voice":   { "cadence": "short|long", "warmth": 0-1, "humor": 0-1, "silence_tolerance": 0-1 },
  "signal":  { "stress_reach": ["…"], "calm_reach": ["…"], "arc_position": "0-3mo|3-6mo|6-12mo|12mo+" },
  "needs":   { "primary": "grace|poetry|love|presence|ease", "last_verified": "ISO" }
}
```

Rules: derived only from consented scopes · viewable and deletable by the subscriber ·
never sold or shared · excluded from any licensed-engine export (ENGINE Phase 4).

## 3. Humanoid output axes (calibration targets)

Seven axes, each scored 0–1 per response and tuned per profile:

| Axis | Meaning in LOT® voice |
|---|---|
| GRACE | unhurried, no correction-tone |
| POETRY | one image, not a paragraph |
| LOVE | regard without flattery |
| HUG | a response that holds; short, warm, no advice |
| BEING-THERE | "I was listening" — refers to the subscriber's own arc |
| COOL | relaxed, unforced, no exclamation |
| MALE | register option: a masculine voice selectable by the subscriber; one of several, never assumed |

Calibration = choose axis weights from the Being Profile, inject as a system-prompt
suffix beside the Calibration Vector, then let COSMO® classify the result.

## 4. Gates (binary, per ENGINE doctrine)

```
[ ] G1 consent captured, scoped, revocable, tested
[ ] G2 profile export + delete endpoint works
[ ] G3 COSMO® node clears every calibrated response (child-safe, stress-safe, honest)
[ ] G4 no response asserts feelings/personhood the engine does not have
[ ] G5 Vadik listening review: ≥100 sampled responses
```
Any unchecked box = HOLD.

## 5. Phase 0 corpus inventory (measured this session)

| Source dir | Files | Words |
|---|---|---|
| docs/wiki | 33 | 267,866 |
| docs/assembly | 98 | 101,645 |
| docs/benchmark | 79 | 56,179 |
| docs/technical | 30 | 55,051 |
| docs/corporate | 26 | 47,564 |

Subscriber journals / logs live in PostgreSQL and were **not** read. Any ingestion needs
consent scope + Vadik review (ENGINE Checkpoint 0).

## 6. Next session

1. Add `being_profiles` migration + consent table (no inference yet).
2. Wire axis weights into the prompt builder in `src/server/utils/ai-engines.ts`.
3. Run Checkpoint 0 against a consent-filtered sample.
