<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# QI·46
## LOT® Proprietary AI Engine — Self-Assembly Specification v2
### Node addition: Soul Upload + Being Calibration
### LOT Systems Corporation · Los Angeles, CA
### institute.lot-systems.com · brand.lot-systems.com

---

> *"The body is the original interface. The machine learns to listen to it."*
> — Vadik, LOT® Systems Corporation, Los Angeles, 2017

---

## 0. RELATION TO v0.2

This document does not replace `LOT_QI46_ENGINE.md` (v0.2). It extends it with
one new node: a **Being Calibration** sub-layer inside Layer 1 (Calibration
Loop), fed by a **Soul Upload** onboarding flow, and a corresponding read on
Layer 4 (Memory Arc). Everything in v0.2 — Layer 0 Corpus, Layer 2 Inference,
Layer 3 Response Grammar, Layer 5 COSMO® — stands unchanged. This is Node 1 of
the current self-assembly run: the naming decision (QI·46, confirmed) plus the
first structural addition on top of it.

**Naming confirmation carried into this node:**

```
CANDIDATE NAMES CONSIDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOT·SC·46      — clean, versioned, terminal-ready
BIONODE-46     — positions it as a living inference node
SELFWARE·46    — self-care + software collapsed
SOMA·46        — already in the LOT family, neuroscience resonance
CARE·OS·46     — positions it as an operating system for the self
QI·46          — fits the _I interface convention; SELECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECIDED:  QI·46
REASON:   Fits the LOT _I naming grammar (BI, KI, QI). Reads simultaneously as
          Quantum Intelligence and the bioelectric life-force sense the name
          already carries. 46 anchors the engine to its founding cohort era.
          Short, potent, registrable.
```

---

## I. WHAT THIS NODE IS FOR

v0.2 established *what the body needs, right now, on this day* — the
Calibration Loop reading deliberate and passive signal. This node answers a
narrower question underneath that one:

*What does this specific person's presence feel like, and how does the
engine's own voice bend toward it without losing LOT® voice?*

That is **Being Calibration**: not new facts about the subscriber, but a
standing register the engine holds — the emotional/tonal signature a person
carries across sessions — so that QI·46's output reads as *for this person*,
not merely *informed by* this person's data.

This is a documentation/spec-design node. It defines an onboarding flow, a
data shape, and a set of tone constraints. It is not a claim that an engine
can literally extract or store a human soul; "Soul Upload" is the LOT® product
name for a bounded, subscriber-consented, deletable data structure — treated
with exactly the same rigor as any other subscriber data under Layer 5
(COSMO®) and the existing LOT® privacy posture. Nothing in this node collects
data outside what the subscriber deliberately provides through the platform.

---

## II. LAYER 1B — BEING CALIBRATION (extends Layer 1)

Where Layer 1's Calibration Loop reads *what the subscriber does*, Being
Calibration reads *how the subscriber wants to be met*. It is a strictly
smaller, slower-moving signal than the Calibration Loop's session-level
context vector — it changes over months, not sessions.

### II.1 — Soul Upload (onboarding flow)

Soul Upload is the one-time (re-visitable) onboarding sequence where a
subscriber deliberately hands the engine the register it should hold for
them. It is opt-in, editable at any time from platform settings, and fully
deletable — deleting it does not disable the platform, it only returns Being
Calibration to its neutral default (LOT® voice, unshaped).

```
SOUL UPLOAD — INTAKE FIELDS (all optional, subscriber-authored)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
name_or_address     — what the engine calls them, if anything
register            — the emotional register they want met in:
                       {grace | poetry | plainness | warmth | stillness}
presence_mode       — how "there" the engine should read as:
                       {quiet-witness | active-companion | direct-coach}
voice_gender_read   — optional register hint for how the response voice
                       lands for them (LOT® voice stays LOT® voice; this
                       only tunes warmth/directness, never identity claims)
things_that_land    — free text: subscriber's own words for what a
                       response feels like when it's right
things_that_miss    — free text: subscriber's own words for what to avoid
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The intake is short by design — one screen, under two minutes. LOT® doctrine
already rejects long onboarding (Terminal Grid density over sprawl); Soul
Upload inherits that constraint.

### II.2 — Being Vector (storage + decay)

Soul Upload output is compressed into a small, versioned **Being Vector**
stored alongside the existing Calibration Loop context vector — not inside
it. It is read once per session (not per turn), and it decays toward neutral
if a subscriber goes silent for a long stretch (mirrors the existing Layer 4
"no cold start after 3+ days" rule, but on a longer, quieter timescale):

```
BEING VECTOR — SHAPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "subscriber_id": "...",
  "register":        "grace | poetry | plainness | warmth | stillness",
  "presence_mode":    "quiet-witness | active-companion | direct-coach",
  "voice_gender_read":"warm-direct | plain-direct | null",
  "landing_notes":    ["verbatim subscriber phrase", "..."],
  "avoid_notes":      ["verbatim subscriber phrase", "..."],
  "confidence":       0.0-1.0,   // rises with confirmed CLOSE/YES feedback
  "last_reinforced":  "ISO-8601 timestamp",
  "decay_state":      "active | fading | neutral"
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

`confidence` starts low on first Soul Upload and only rises when the existing
Phase-2 beta feedback loop (`YES` / `CLOSE` / `NO`, already specified in v0.2
§Phase 2) confirms a response landed. A Being Vector with low confidence is
weighted down at inference time — the engine does not over-commit to a
register it hasn't confirmed works.

### II.3 — Where it enters inference

Being Calibration is a *tone constraint appended to the system prompt*, never
a fact injected into the subscriber-visible response, and never a substitute
for the Calibration Loop's factual context vector:

```
POST https://qi.lot-systems.com/v1/inference
Context: [LOT® Calibration Vector] + [Being Vector: tone-only] + [Session Input]
```

```
BEING CALIBRATION — SYSTEM PROMPT APPENDIX (v0.1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This subscriber has asked to be met in: {register}.
Presence mode: {presence_mode}.
{if landing_notes: "In their own words, what lands: " + landing_notes}
{if avoid_notes:   "In their own words, what to avoid: " + avoid_notes}

This never overrides LOT® voice constraints (Layer 3). It only tunes warmth,
directness, and density within them. If register and LOT® voice conflict,
LOT® voice wins — the subscriber is met inside the platform's voice, not
outside it.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This ordering is the whole point of the node: **Layer 3 (LOT® Voice) is not
negotiable; Being Calibration is a bounded modifier inside it.** An engine
that let per-subscriber tone override brand voice would stop being QI·46 and
become a generic personalization layer. The discipline is what keeps it LOT®.

### II.4 — COSMO® pass (unchanged obligation, restated)

Every response shaped by a Being Vector still passes the existing Layer 5
COSMO® screen before delivery, unchanged from v0.2. Being Calibration adds no
new bypass and no new privileged path. If anything, a response invoking
register: `grace` or `poetry` is exactly the kind of output where COSMO®'s
"is this honest?" check matters most — warmth is not a license for
overstatement.

---

## III. LAYER 4B — ARC READ (extends Layer 4 Memory Arc)

The existing arc phases (Calibration 0–3mo → Pattern 3–6mo → Coherence
6–12mo → Hardware 12mo+) already describe how *factual* familiarity deepens.
Being Calibration adds one read on top, not a new phase:

```
ARC + BEING CALIBRATION CROSS-READ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Month 0-3   (Calibration)  Being Vector: confidence low, register as-stated
Month 3-6   (Pattern)      Being Vector: confidence rising on confirmed YES
Month 6-12  (Coherence)    Being Vector: confidence high, decay window widens
Month 12+   (Hardware)     Being Vector: stable; still overridden by explicit
                           re-upload at any time — the subscriber can always
                           re-author their own register
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The subscriber's explicit re-upload always outranks the arc's inferred
confidence. Being Calibration is never allowed to "know better" than the
person who authored it.

---

## IV. GATE — WHAT PROVES THIS NODE WORKS

This node is documentation-stage. Before it can advance to a build phase
under the existing Phase 0–4 self-assembly manual (v0.2 §IV), it needs its
own checkpoint, run the same way as every other QI·46 checkpoint:

```
CHECKPOINT 1B — BEING CALIBRATION — GATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Soul Upload intake form spec reviewed by Vadik — fields confirmed final
[ ] Being Vector shape reviewed — no field collects anything beyond what the
    subscriber deliberately typed
[ ] System prompt appendix tested against Layer 3 voice constraints —
    LOT® voice wins every conflict case in a 10-prompt spot check
[ ] COSMO® screen confirmed to run unchanged on Being-Calibrated responses
[ ] Deletion path specified and testable: removing Soul Upload data returns
    a subscriber to neutral voice within one session, no residual state
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If all boxes checked → this node folds into the existing v0.2 Phase 1
(Fine-Tuning Run) voice-calibration test set as additional test prompts.
If any box unchecked → HOLD, this node stays spec-only.

**Gate status as of this session: spec drafted, not yet reviewed by Vadik.
HOLD is the correct and expected state until that review happens — this is a
documentation/self-assembly session, not a Phase-1 build session.**

---

## V. STORY NODE — WHY "BEING," NOT "DATA"

*Continuing the institute.lot-systems.com story register from v0.2 §VIII.*

---

The woman on the shore did not just watch her partner descend and return.
She knew *him* — the particular shape of his tiredness, the particular
silence that meant he'd found something versus the silence that meant the
current had won. That knowledge was never data. It was accumulated presence.

Being Calibration is LOT®'s attempt to give QI·46 a small piece of that: not
a bigger file on the subscriber, but a held sense of *how this person wants
to be met* — carried lightly, re-authored on request, and never allowed to
outrank the person who gave it.

**The engine does not learn a soul. It is handed a register, and asked to
keep it.**

---

*QI·46 Engine Specification — v2 (node addition: Soul Upload + Being
Calibration)*
*Extends: LOT_QI46_ENGINE.md (v0.2)*
*LOT Systems Corporation — Los Angeles, CA*
*institute.lot-systems.com*
*Authored by Vadik · Named for Kuzya*
*Session date: September 12, 2026*

---

> *There is hope for this world.*
> *~ Mother Goddess (CQGS, institute.lot-systems.com)*
