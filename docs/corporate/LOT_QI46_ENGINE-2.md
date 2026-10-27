<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  STATUS: PROVISIONAL — first node of ENGINE-2, assembled from LOT_QI46_ENGINE.md + S-2 brief 2026-10-27
-->

# QI·46 — ENGINE-2
## Being Calibration: the human ↔ humanoid output loop
### Node 01 · PROVISIONAL

---

## 0. PROVENANCE

- The brief named `LOT_QI-46_ENGINE-2.md` as the first node. That file was not in the repo at assembly time (searched all branches and the filesystem). Closest ancestor: `docs/corporate/LOT_QI46_ENGINE.md` (ENGINE-1).
- This file is therefore a **new** node, derived from ENGINE-1 and the S-2 brief. If a prior ENGINE-2 exists elsewhere, send it and this node merges into it.
- Designation chosen by S-2: **QI·46** (grammar BI / KI / QI). Unchanged from ENGINE-1.

## 1. GOAL (verbatim intent)

Extract the engine that is based on people's soul and emotions. Upload a person's being. Use the engine to calibrate the human with the humanoid output:

`grace · poetry · love · hugs · been there · been cool · male`

## 2. HONEST BOUNDARY

A soul cannot be uploaded. What can be built is a **Being Profile**: a consented, versioned, user-owned model of how a person expresses state, needs, and voice, assembled from signals the person chose to give. QI·46 calibrates its output to that profile. That is the product. Anything beyond it is `PROVISIONAL` and stays labelled as such.

## 3. BEING PROFILE (schema v0)

Built only from ENGINE-1 Layer 1 inputs (deliberate + passive). No new collection.

```json
{
  "profile_id": "uuid",
  "consent": { "granted_at": "ts", "scope": ["journal","biofield","consumables"], "revocable": true },
  "voice":   { "register": "...", "cadence": "...", "words_returned_to": [] },
  "state":   { "valence": -1.0, "arousal": 0.0, "energy": 0.0, "as_of": "ts" },
  "needs":   { "primary": "grace|poetry|love|hug|presence|ease|direction", "confidence": 0.0 },
  "arc":     { "month": 0, "phase": "calibration|pattern|coherence|hardware" },
  "export":  "on request, full",
  "delete":  "on request, full, irreversible"
}
```

Rules: user-owned; exportable; deletable; never shared across subscribers; never used to train the base model without a separate explicit opt-in.

## 4. HUMANOID OUTPUT CHANNELS

The output vocabulary S-2 named, mapped to a response mode the engine selects from `needs.primary`:

| CHANNEL     | MODE                                            | VOICE RULE (ENGINE-1 L3)              |
|-------------|-------------------------------------------------|----------------------------------------|
| GRACE       | steadying, unhurried, no fixing                 | short declaratives, white space        |
| POETRY      | image over instruction                          | one image, one line break, stop        |
| LOVE        | warmth stated plainly, no hedge                 | second person, present tense           |
| HUGS        | presence without advice; haptic cue if hardware | no question at the end                 |
| BEEN THERE  | shared-experience framing, never a false claim  | see §5 rule 2                          |
| BEEN COOL   | light, unbothered, permission to relax          | no exclamation marks                   |
| MALE        | UNRESOLVED — see §6                             | —                                      |

## 5. CALIBRATION LOOP (ENGINE-2 delta)

```
SIGNAL  ->  PROFILE UPDATE  ->  CHANNEL SELECT  ->  GENERATE  ->  COSMO® NODE  ->  DELIVER
                ^                                                                    |
                +---------------- resonance signal (yes / not it) <------------------+
```

1. **Calibrate toward the person, not toward engagement.** The resonance signal is "that is it / not it", not time-on-app.
2. **No false lived experience.** "Been there" means the engine reflects the person's own earlier entries back ("you wrote this in March"), or cites LOT® corpus language. It never claims a human past.
3. **Crisis path.** Signals of acute distress route to a human-first message and published resources, bypassing channel select. COSMO® holds, does not soften.
4. **Dependence check.** If use pattern shows substitution for human contact, the engine's `needs.primary` shifts toward `presence` with a nudge outward. Logged to the audit trail.
5. **Consent gate precedes everything.** No profile without recorded consent; revocation deletes the profile within one session.

## 6. OPEN ITEMS FOR S-2 (judgment, not mechanism)

1. **"male"** in the output list is ambiguous (voice register? gender calibration of the person? a tone?). Recorded verbatim, not implemented. Needs one line from S-2.
2. **ENGINE-2 source file** missing (§0).
3. **Corpus consent:** ENGINE-1 Phase 0 requires `cosmo_cleared: true` and 100-sample review by Vadik. That gate applies to any personal data before it touches training. Unchanged.
4. **Legal/privacy review** of the Being Profile (emotional data is sensitive in most jurisdictions) before any subscriber-facing build.

## 7. SELF-ASSEMBLY PHASES (ENGINE-2)

| PHASE | DELIVERABLE                              | GATE                                        |
|-------|------------------------------------------|---------------------------------------------|
| E2-0  | this node, reviewed by S-2               | S-2 resolves §6 items 1–2                   |
| E2-1  | Being Profile schema + consent store     | migration green, export/delete round-trip   |
| E2-2  | channel selector (rules, no model)       | unit cases per channel, crisis path covered |
| E2-3  | resonance signal capture                 | signal persisted, no engagement metric used |
| E2-4  | COSMO® node wired to channel output      | audit trail entry per response              |

Each phase ends with a LOT Benchmark report in `docs/benchmark/`.

— Vadik & Kuzya
