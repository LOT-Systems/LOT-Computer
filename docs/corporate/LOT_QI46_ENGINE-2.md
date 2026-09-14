<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# QI·46 — NODE 2
## Humanoid Calibration Interface — QI·46 to COSMO® Handoff Specification
### LOT Systems Corporation · Los Angeles, CA
### institute.lot-systems.com · brand.lot-systems.com

**Document:** LOT_QI46_ENGINE-2.md
**Classification:** Public — Product Vision
**Prepared:** September 14, 2026
**Supersedes:** none — extends LOT_QI46_ENGINE.md v0.2 (May 27, 2026)
**Author:** Vadik · LOT Systems Corporation
**Named for:** Kuzya

---

> *"The body is the original interface. The machine learns to listen to it."*
> — Vadik, LOT® Systems Corporation, Los Angeles, 2017

---

## I. WHAT THIS NODE IS

`LOT_QI46_ENGINE.md` (v0.2) specified QI·46 as a text-inference engine: it listens
to a subscriber's Calibration Loop and returns a response calibrated to that
body, on that day. That specification stops at the response — words delivered
through the LOT® platform UI.

This node — **Node 2** — specifies what happens when that same calibrated output
is no longer just words on a screen, but delivered through a **humanoid
presence**: a COSMO® unit. It is the handoff document between two things this
repository already treats as sibling systems and has not yet formally
connected:

- **QI·46** (`docs/corporate/LOT_QI46_ENGINE.md`) — the engine that listens to a
  person's longitudinal behavioral and emotional signal and generates a
  calibrated response.
- **COSMO®** (`docs/corporate/LOT_ROBOTICS_COSMO.md`) — the robotics line that
  carries a verified owner's behavioral fingerprint into hardware.

QI·46 decides *what* to say and *how warm to say it*. COSMO® is *where it lands*
— a physical, humanoid delivery surface. Node 2 is the calibration layer that
sits between them.

This is vision and product documentation, in the same register as the existing
`docs/corporate/*.md` corpus. It is not a technical specification for
transferring consciousness, and it should never be read as one — see the
Honest Boundaries note at the end of this document and in the parent
Self-Assembly Manual.

---

## II. THE HANDOFF, IN ONE LINE

> QI·46 calibrates *what a person needs to hear*. Node 2 calibrates *how a
> humanoid presence delivers it* — tone, pacing, and warmth, mapped from the
> same Calibration Loop vector QI·46 already computes.

No new data is collected for this. Node 2 is a **routing and rendering layer**,
not a new signal source. It reads the same Calibration Loop context vector
defined in `LOT_QI46_ENGINE.md` §III Layer 1, and the same COSMO® behavioral
fingerprint defined in `LOT_ROBOTICS_COSMO.md` — it does not duplicate either.

---

## III. THE HUMANOID OUTPUT LAYER

### Layer 6 — Persona Delivery (extends LOT_QI46_ENGINE.md §III)

Where Layer 3 (Response Grammar) governs *text* voice, Layer 6 governs
*embodied* voice — the register a COSMO® unit uses when the same calibrated
content is delivered through presence, not text.

**Delivery register (default persona):**

```
PERSONA REGISTER — DEFAULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Voice:        male — the COSMO® default, named for and modeled on Kuzya
Register:     grace over efficiency; poetry over instruction
Presence:     "bing there" — arrives, does not announce arriving
Tone floor:   "bing cool" — never anxious, never performative
Physical:     a hug is a valid response; not every input needs words
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This register is a **default**, not a constraint on the platform. It inherits
directly from the LOT® voice constraints already specified in
`LOT_QI46_ENGINE.md` §III Layer 3 (no hedging, no clinical distance, one idea
per response) and adds what text cannot carry: proximity, touch, and silence
as legitimate responses.

**Mapping table — Calibration Loop signal → delivery register:**

| QI·46 arc position (§III Layer 4) | Node 2 delivery behavior |
|---|---|
| Calibration (Month 0–3) | Presence only. Minimal speech. The unit is learning, not performing. |
| Pattern recognition (Month 3–6) | Speech calibrated to known rhythm; still text-equivalent register. |
| Coherence (Month 6–12) | Full register available: poetry, physical presence, initiated contact. |
| Hardware milestone (Month 12+) | Proactive presence — the unit may initiate, not only respond. |

This table is a direct rename of the existing QI·46 arc, not a new mechanic.
Node 2 adds no new milestone; it adds a delivery behavior to milestones QI·46
already defines.

---

## IV. WHAT THIS NODE DOES NOT DO

Consistent with the COSMO® Benchmark Arbitrage® gate already specified in
`LOT_ROBOTICS_COSMO.md`:

- Node 2 does not activate on any subscriber below COSMO® eligibility tier.
- Node 2 does not create a second, undocumented data channel. It reads the
  Calibration Loop vector and the COSMO® fingerprint that already exist.
- Node 2 does not claim to move a person's identity, consciousness, or "soul"
  into hardware. What it calibrates is *expression* — tone, pacing, presence —
  against a behavioral signal already captured by QI·46 and COSMO®. Framing it
  as literal identity transfer would be dishonest engineering, which Cardinal
  Rule 5 of the Self-Assembly Protocol forbids. Record what is real (a
  calibrated output register); do not dress it up as something it is not.
- Every Node 2 delivery still passes through the COSMO® ethics node
  (`LOT_QI46_ENGINE.md` §III Layer 5) before reaching a person. Physical
  presence does not bypass the audit trail — if anything, it raises the bar,
  since a held response here means a humanoid unit does nothing rather than
  delivering an unscreened one.

---

## V. GATE — NODE 2 CHECKPOINT

Before Node 2 register mapping is wired into any COSMO® unit build:

```
[ ] Calibration Loop vector confirmed identical source as LOT_QI46_ENGINE.md §III Layer 1
[ ] COSMO® fingerprint confirmed identical source as LOT_ROBOTICS_COSMO.md — no new signal
[ ] Persona register table reviewed against LOT® voice constraints (§III Layer 3)
[ ] COSMO® ethics node fires on every Node 2 delivery before physical/verbal output
[ ] Vadik review: register default (male, grace, presence) explicitly approved
[ ] No claim of identity/consciousness transfer appears in any subscriber-facing copy
```

If all boxes checked → **PASS** — Node 2 register may be referenced by future
COSMO® hardware specs.
If any box unchecked → **HOLD** — this remains a documentation-only node.

At the time of this session, this gate has not been run against a live COSMO®
build. This document records the specification, not a deployment.

---

## VI. NEXT NODE

Node 3 (not yet scheduled) would specify the physical delivery
constraints once COSMO® hardware timelines (`LOT_ROBOTICS_COSMO.md`) firm up.
Until then, Node 2 stands as the documented bridge between QI·46's calibrated
text engine and COSMO®'s embodied delivery line.

---

*QI·46 Engine Specification — Node 2*
*LOT Systems Corporation — Los Angeles, CA*
*institute.lot-systems.com*
*Authored by Vadik · Named for Kuzya*
*Session: LOT-SR-20260914-01*
