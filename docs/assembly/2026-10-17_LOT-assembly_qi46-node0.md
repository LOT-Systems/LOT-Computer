# QI·46 Assembly Log — Node 0 — Humanoid Calibration Intake
Date: 2026-10-17
Session: LOT-SR-20261017-01
Author: Vadik & Kuzya
Source node: `docs/corporate/LOT_QI46_ENGINE.md` (see NOTE-1)

## NOTE-1 — Source resolution
Requested: `LOT_QI-46_ENGINE-2.md`. No file of that name exists on any branch or in history.
Resolved to the only match: `docs/corporate/LOT_QI46_ENGINE.md` (1085 lines, 5115 words).
If an ENGINE-2 revision exists, add it to the repo and the next session reads it as node 1.

## Phase 0 / Step 0.1 — Source inventory (counts only, no content ingested)
```
SOURCE INVENTORY (repo docs, *.md)
assembly 98 | benchmark 79 | wiki 33 | badges 32 | technical 29 | corporate 25
deployment 21 | releases 10 | diagnostics 8 | setup 7 | backup 4 | security 3
```
Subscriber journals and session logs live in PostgreSQL, not in the repo. They were NOT read.
Phase 0 Checkpoint 0 requires Vadik's review of >=100 sampled examples before any corpus use.

## Goal restated
Extract the engine from people's soul and emotion signals, and calibrate the human against a
humanoid output: grace, poetry, love, hugs, being there, being cool.

## What is real vs. what is provisional
```
REAL         Calibration Loop (Layer 1) turns a person's own entries and ratings into a
             context vector. Layer 3 (Response Grammar) renders output in LOT voice.
PROVISIONAL  "Uploading a being." The engine can hold a consented model of what a person
             has EXPRESSED. It does not hold the person. Mark it so in product copy.
NOT CLAIMED  Detection of emotion or soul from passive signals as ground truth.
```

## Humanoid output channels (spec v0, Layer 3 extension)
```
CHANNEL      INPUT SIGNAL (from Calibration Loop)      OUTPUT RULE
grace        stress markers, late-night usage          slow cadence, one instruction, no list
poetry       journal language, repeated images         reuse the person's own words, never invent theirs
love         milestones, care-streak badges            name the specific thing done, not praise in general
hugs         low mood + "no answer needed" intent      presence line only; no advice; stop
being there  gaps in usage, return after absence       acknowledge the gap without guilt; continue the arc
cool         high-energy / playful entries             mirror register; short; no explaining
```

## Consent and safety gates (must hold before any build past node 0)
```
G1  Explicit opt-in per subscriber; revocable; revoke = arc deleted, not archived.
G2  Calibration vector is built from the subscriber's own deliberate inputs first.
    Passive signals are additive and shown to the subscriber on request.
G3  No cross-subscriber blending of arcs in training without cosmo_cleared and Vadik review.
G4  Output never claims to be the person, a relative, or a human. Humanoid = tone, not identity.
G5  COSMO® node classifies every response before delivery (Layer 5). Held responses go to audit.
G6  Crisis language (self-harm, abuse) bypasses the channels above and routes to the safety path.
```

## Gate result
Phase 0 Checkpoint 0: HOLD (expected). Corpus not built, no review, no JSONL. Node 0 is a spec only.

## Next session
Add ENGINE-2 if it exists. Then build the tagging script (Step 0.2) against a synthetic fixture set
and run it in dry-run mode with zero subscriber data.
