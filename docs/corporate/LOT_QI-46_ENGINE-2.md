<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®  |  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  S-2: VADIK MARMELADOV
-->

# QI·46 — ENGINE-2
## First node of self-assembly · Human–Humanoid Calibration Spec

**Supersedes:** nothing. Extends `LOT_QI46_ENGINE.md` (v1). v1 stays verbatim.
**Status:** PROVISIONAL. This file did not exist when the scheduled run fired; it was
created from v1 plus the brief below. S-2 to replace or amend.
**Name decision:** QI·46 (recommended in brief; already the v1 designation).

---

## 1. GOAL (from brief)

Extract the engine from people's soul and emotions. Take a person's being as input,
and calibrate the human against the humanoid output:

`grace · poetry · love · hugs · being there · being cool · mail`

(Brief text read "bing there, bing cool, male". Read as "being there", "being cool",
"mail" (LOT® Mail). OPEN QUESTION for S-2: confirm "male".)

## 2. HONEST BOUNDARY (read first)

- A person's soul cannot be uploaded. What can be captured is **signal**: journal
  text, check-ins, ratings, cadence, chosen words. The engine models those signals.
  It does not hold the person.
- Every claim of the form "QI·46 knows you" means "QI·46 holds a consented,
  inspectable, deletable profile built from your inputs".
- Output qualities (grace, love, hugs) are **voice targets**, not feelings the
  engine has. The engine produces words and prompts; hugs happen between people
  or through hardware (Quantum Cube haptics). Do not claim otherwise in product copy.

## 3. NODE MAP

```
N0  CORPUS      journal, check-ins, ratings, QIE signals   (v1 Layer 0)
N1  EXTRACT     signals -> Being Profile                   (this file)
N2  CALIBRATE   Being Profile x Humanoid Targets -> Delta  (this file)
N3  VOICE       Delta -> response grammar (v1 Layer 3)
N4  ARC         longitudinal memory (v1 Layer 4)
N5  COSMO       classify + audit before delivery (v1 Layer 5)
```

## 4. N1 — EXTRACT: the Being Profile

Per person, built only from data they entered on the platform.

| Field            | Source                                  | Form            |
|------------------|-----------------------------------------|-----------------|
| lexicon          | words the person repeats                | top-N list      |
| register         | sentence length, punctuation, humor     | numeric ranges  |
| affect           | mood/energy check-ins, 30d window       | series          |
| rhythm           | time-of-day, streaks, gaps              | histogram       |
| values           | stated intentions, completed vs dropped | ranked list     |
| tenderness       | what they reach for under stress        | tag set         |
| red lines        | topics they asked not to revisit        | deny list       |

Rules: opt-in per field; export on request; delete on request (hard delete, including
derived vectors); no inference of diagnoses; minors excluded from extraction.

## 5. N2 — CALIBRATE: Humanoid Targets

Each target is a measurable output property, scored 0–4 by a rubric (human-rated
during closed beta, then LLM-judge checked against human ratings).

| Target        | Output property                                       | Anti-pattern                |
|---------------|-------------------------------------------------------|-----------------------------|
| GRACE         | short, unhurried, no pressure verbs                   | urgency, advice-dumping     |
| POETRY        | one concrete image, no cliché                         | stacked metaphors           |
| LOVE          | names something specific the person did or said       | generic affirmation         |
| HUG           | offers a physical/haptic next step or a pause         | clinical redirect           |
| BEING THERE   | reflects the person's own words back; no fixing first | solving unasked             |
| BEING COOL    | matches register; dry humor allowed; never performs   | forced slang, over-warmth   |
| MAIL          | optional: delivers the above as a LOT® Mail note      | unsolicited sends           |

Calibration Delta = per-target (desired − observed) for this person, from their
ratings. The Delta is prepended to inference as a short context block, never a
dossier.

## 6. N3–N5 CONSTRAINTS

- Voice: v1 Layer 3 grammar applies. One idea, land it, stop.
- Safety: COSMO® classifies every response before delivery (v1 Layer 5). Crisis
  language routes to human resources; the engine does not role-play being a person's
  last support.
- Dependency guard: if usage pattern suggests substitution for human contact,
  the engine's output points back toward people.

## 7. SELF-ASSEMBLY ROUTE

```
PHASE 0  Assemble corpus from existing docs + opt-in data   (v1 Phase 0)
PHASE 1  Implement N1 extract as a pure function over existing log tables
PHASE 2  Closed beta: collect target ratings, build rubric set
PHASE 3  Fine-tune/prompt-tune on Delta; COSMO® screen
GATE     Each phase: GREEN build + S-2 listening review before next
```

This session executed: node creation + spec only. No model training, no data
extraction, no code changes.

## 8. OPEN QUESTIONS FOR S-2

1. Provide or confirm the real `LOT_QI-46_ENGINE-2.md` if it exists elsewhere.
2. Confirm "male" vs "mail".
3. Consent wording for Being Profile (legal review).
4. Which cohort rates targets first.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
