<!--
  LOT SYSTEMS CORPORATION
  Vadik Marmeladov — Owner LOT® · Kuzya Cosmo Marmeladov — Owner COSMO®
  Node 0 of QI·46 self-assembly. Extends LOT_QI46_ENGINE.md (does not replace it).
  STATUS: PROVISIONAL specification. No model, data or endpoint exists yet.
-->

# QI·46 — ENGINE-2 · NODE 0
## Person-Calibration Core: from a person's signal to humanoid output

Authors: Vadik & Kuzya · Parent spec: `docs/corporate/LOT_QI46_ENGINE.md` · Date: 2026-10-16

---

## 1. NAMING DECISION (recorded)

Candidates considered: LOT·SC·46, BIONODE-46, SELFWARE·46, SOMA·46, CARE·OS·46, QI·46.
**Selected: QI·46** — fits the LOT `_I` grammar (BI, KI, QI); already the designation in the parent spec; `SELFWARE` stays as codename.
Rejected as primary, kept as sub-names: `BIONODE` → node type, `SOMA` → body-signal layer, `CARE·OS` → platform surface.

## 2. GOAL

Build the engine that models a person from what they *choose to give it* — their words, rhythms, feelings, preferences — and uses that model to **calibrate the engine's output to that person**: a response that feels humanoid in the LOT sense — grace, poetry, love, a hug in text, *being there*, *being cool*.

### Honest boundary (PROVISIONAL)
"Uploading a being" is the **product metaphor**. Technically QI·46 builds a **consented Being Profile**: a structured, revocable, user-owned model of signals the person supplied. It does not capture a soul, does not simulate a deceased person, and does not claim to feel. What is real: personalization, memory, and a controlled voice. What is poetry: the rest. Both are allowed; they must not be confused in product copy.

## 3. NODE 0 PIPELINE

```
PERSON ──consent──▶ [1 INTAKE] ──▶ [2 BEING PROFILE] ──▶ [3 CALIBRATOR] ──▶ [4 VOICE] ──▶ OUTPUT
                        │                  │                   │                │
                    deliberate +       emotion/rhythm/      match person ↔   grace · poetry ·
                    passive signal     values/language      output register  love · hug · there · cool
                                                                   ▲
                                                COSMO® ethics gate (veto) ┘
```

### 3.1 INTAKE (what is read)
- Deliberate: journal, check-ins, mood tags, stated values, preferences (existing LOT logs).
- Passive: engagement cadence, time-of-day pattern, reorder velocity (aggregate only).
- Never: anything outside the Usership scope, third-party private messages, biometric data without explicit opt-in.

### 3.2 BEING PROFILE (schema, v0)
| FIELD        | CONTENT                                              | SOURCE            |
|--------------|------------------------------------------------------|-------------------|
| `voice`      | diction, humor, pace, language(s)                    | journal text      |
| `affect`     | baseline + recent emotional arc (valence/arousal)    | check-ins         |
| `needs`      | what they reach for when low / high                  | behavior + tags   |
| `values`     | stated principles, recurring themes                  | journal           |
| `rhythm`     | circadian + weekly pattern                           | timestamps        |
| `boundaries` | topics/tones the person excluded                     | user settings     |
| `consent`    | scope, expiry, export/delete state                   | user               |

Profile is stored per-user, exportable, deletable in one action. Deleting it deletes the calibration.

### 3.3 CALIBRATOR
Maps Being Profile + current affect → **output parameters** (not free text):

| PARAM        | RANGE   | MEANING                                             |
|--------------|---------|-----------------------------------------------------|
| `grace`      | 0–1     | formality, patience, softness of phrasing           |
| `poetry`     | 0–1     | imagery/metaphor density                            |
| `love`       | 0–1     | warmth, direct care language                        |
| `hug`        | 0/1     | embodied-comfort mode (short, slow, no advice)      |
| `presence`   | 0–1     | "being there": mirroring before suggesting          |
| `cool`       | 0–1     | ease, humor, low-drama register                     |
| `register`   | enum    | `masc` · `fem` · `neutral` — chosen by the person   |

`register: masc` is one selectable voice register (the founders' default persona request); it is never inferred from the person's identity.

### 3.4 VOICE
Parameters are rendered by the Response Grammar (parent spec, Layer 3). Hard rules: presence before advice; one idea per reply; no diagnosis; no claim of human experience.

### 3.5 COSMO® GATE
Parent spec Layer 5. Veto on: crisis signals (route to human resources), manipulation/dependency patterns, any output that exceeds `boundaries`.

## 4. SELF-ASSEMBLY RULES FOR THIS NODE (LOT® style)
1. Each session appends one report in `docs/benchmark/` (new file, append-only ledger).
2. A parameter earns a place only after it appears in 3+ reports.
3. Calibration quality is measured by user signal (CLOSE / NO from parent spec Phase 2), not by internal metrics.
4. Provisional claims are labelled `PROVISIONAL` until measured.

## 5. OPEN DECISIONS FOR S-2 (blocking Node 1)
1. **Data scope:** which existing tables feed INTAKE (journal / logs / chat)? Needs explicit per-field list.
2. **Model host:** self-hosted open-weight (parent spec) vs. API — cost and privacy trade-off.
3. **Consent UX:** where the person grants/revokes Being Profile (proposal: Settings → Being).
4. **Register defaults:** confirm `masc` as default persona for the founders' build only, or global.
5. **Legal:** retention/deletion policy and ToS language for "Being Profile" (not "soul upload").

## 6. NODE 1 (next session, not started)
Schema + migration for `being_profile` (consent-gated), calibrator as a pure function with unit tests on the parameter table above. No inference endpoint until items 5.1–5.3 are answered.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
