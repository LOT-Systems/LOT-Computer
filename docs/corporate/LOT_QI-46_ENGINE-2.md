<!--
  LOT SYSTEMS CORPORATION
  Vadik Marmeladov — CEO, Owner LOT® | Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  Node 2 of QI·46. Node 1 = docs/corporate/LOT_QI46_ENGINE.md (read first).
-->

# QI·46 — ENGINE-2
## The Being Profile & Humanoid Calibration Spec
**Status:** PROVISIONAL (spec, no code yet) · **Authors:** Vadik & Kuzya · **Date:** 2026-10-01

---

## 0. Naming decision

Recommended and adopted: **QI·46** (fits the `BI / KI / QI` grammar; Node 1 already uses it).
Alternates kept on record, not adopted: LOT·SC·46, BIONODE-46, SELFWARE·46 (stays as the *codename*, already in Node 1), SOMA·46, CARE·OS·46.

## 1. Goal, stated honestly

Goal as given: *extract the engine that is based on people's soul and emotions; upload a person's being; calibrate the human with the humanoid output.*

What is buildable and what is not:

| Statement | Reality | Engine-2 interpretation |
|---|---|---|
| "Upload a person's being" | A person cannot be uploaded. What exists is the person's *expressed signal record*. | **Being Profile (BP):** a consented, user-owned, revocable model of what the person has *said, logged, chosen and returned to* inside LOT®. |
| "Extract the engine from soul and emotions" | Emotions are not read; they are *self-reported or inferred with error*. | Emotional signals are always typed `REPORTED` or `INFERRED` and never presented as fact. |
| "Calibrate human with humanoid output" | Calibration = tuning the engine's output register to fit the person, and letting the person tune it back. | **Register Dial** (section 4): two-way, human always holds the final dial. |

QI·46 does not claim to hold a soul. It claims to *listen well* (Node 1: "the cost of inference is the quality of listening").

## 2. Being Profile (BP) — schema

Built on Node 1 Layer 1 (Calibration Loop) and Layer 4 (Memory Arc). Existing signal sources: QIE (`src/client/stores/intentionEngine.ts`), journal/log entries, widget memory.

```
BP {
  id, owner_user_id, consent: { granted_at, scope[], revoked_at? }
  voice:      { words_returned_to[], rhythm, languages[] }          // REPORTED
  affect:     { baseline, recent_arc[], source: REPORTED|INFERRED } // never PRESCRIPTIVE
  needs:      { comfort_style, silence_tolerance, touch_preference }// REPORTED
  rituals:    { time_anchors[], recurring_intentions[] }            // observed (QIE)
  care_edges: { people[], places[] }                                // user-entered only
  register:   RegisterDial                                          // section 4
  provenance: every field -> source event ids (auditable)
}
```

Rules: BP is **opt-in, exportable, deletable**; `care_edges` about third parties are stored only as the user's own words; no BP field is used outside the user's own session; COSMO® (Node 1 Layer 5) screens every output.

## 3. Self-assembly loop (LOT® style)

```
LISTEN  -> read new signals since last session (journal, QIE patterns, feedback)
FOLD    -> update BP fields with provenance; drop what the user retracted
RENDER  -> generate output at the current Register Dial setting
ASK     -> one question: "did that fit?"  (yes / close / no)
CALIBRATE -> yes/close/no moves the dial; COSMO® screens; log to LEDGER
```
One cycle per session; each cycle ends with a benchmark report (docs/benchmark/).

## 4. Register Dial — the humanoid output

Seven registers requested by Vadik & Kuzya. Each is a 0–3 intensity set by the *person*, defaulted from BP, never escalated by the engine alone.

| Register | Meaning in output | Guardrail |
|---|---|---|
| **Grace** | unhurried, dignifying phrasing; no correction tone | always on, floor 1 |
| **Poetry** | image and rhythm from the person's own returned-to words | uses BP.voice only |
| **Love** | warmth, naming what the person did right | no romantic claims; care, not attachment |
| **Hugs** | *textual* hold ("I'm here, nothing to fix") or a haptic cue where hardware exists (Quantum Cube) | never implied physical presence |
| **Being there** | stays with the feeling; short; asks before advising | default for distress signals |
| **Being cool** | light, unfussy, a little humor | suppressed when affect is low |
| **Male** | a masculine-coded voice option (direct, steady, brotherly). *Interpretation of the brief's "male"; Vadik to confirm.* | an option among voice styles, never an assumption about the user |

Safety override: if distress signals cross COSMO® thresholds, dial snaps to Grace + Being there and the engine points to human help. Output is always labeled as QI·46, never as a person.

## 5. Open items for S-2 (judgment, not mechanism)

1. Confirm the reading of "male" (voice style option vs. something else).
2. Source file: the brief cited `LOT_QI-46_ENGINE-2.md`; that file did not exist in the repo, so Node 1 (`LOT_QI46_ENGINE.md`) was used and this file created as Node 2.
3. Consent text for BP (legal review; health-adjacent data, CCPA/CPRA for CA users).
4. Choose first build target: BP schema as Prisma migration + `/qi` Register Dial UI (smallest slice).

## 6. Next session

Slice 1: BP read-model derived from existing logs (no new collection), Register Dial stored per user, COSMO® screen stub. Gate: build green + one real user (Vadik) rates 10 outputs yes/close/no.
