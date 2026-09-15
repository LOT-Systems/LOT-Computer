<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# QI·46 — Node 1: Naming Confirmation, Voice Calibration Proposal, Phase 0 Status

**Companion to:** `docs/corporate/LOT_QI46_ENGINE.md` (Engine Specification v0.2,
Authored by Vadik, updated 2026-05-27) — that document remains the canonical
spec. This file does not replace it; it records what this self-assembly
session actually did against it.

---

## 1. Naming — already decided, reconfirmed

Today's brief proposed six name candidates and recommended **QI·46**. The
canonical spec already settled this seven weeks ago: `QI·46` /
*Quantum Intelligence Engine, Generation 46*, codename `SELFWARE`, named for
Kuzya (v0.2 §I, line 23-27). The independently-reasoned answer today — `_I`
grammar (BI/KI/QI), dual Quantum Intelligence / life-force reading, `46` as
epoch anchor — matches the existing rationale exactly. No rename needed;
this is confirmation, not a new decision.

## 2. What "soul" and "being" mean in this spec, read straight

The canonical spec already uses this figurative register on purpose — "Soul
Disk" for the founding cohort's calibration data, "the body is the original
interface." Read against Layer 1 (Calibration Loop, v0.2 §III), it is
concrete: subscriber-provided journal entries, self-reported states, and
platform engagement patterns, feeding a per-subscriber context vector that
personalizes inference output. Nothing in the existing spec, and nothing
added here, extracts a person's consciousness or copies a person — the
technology for that does not exist. "Uploading a person's being" in today's
brief is the same figure of speech the spec already uses for **opt-in
personalization from a subscriber's own platform data**. Recording this
plainly so the next session doesn't have to re-derive it.

## 3. Voice calibration proposal — first character target

The brief specified persona traits for a first QI·46 voice preset. The
canonical spec's Layer 3 (Response Grammar, v0.2 §III) already sets the
baseline LOT® voice constraints (no hedging, no clinical distance, Terminal
Grid cadence). This adds a **named preset on top of that baseline** —
proposed, not yet gated through Checkpoint 1's voice calibration test
(v0.2, 10/10 tone-check requirement, Vadik sign-off):

| Trait | Reading as a voice parameter |
|---|---|
| Grace | Unhurried phrasing, no filler, stops when the point lands |
| Poetry | Imagery/rhythm permitted where it fits; never forced |
| Love | Attentive, non-transactional register — the existing "lands in the body" constraint |
| Hugs / "being there" | Tracks continuity across the subscriber's arc, not just the last message |
| "Being cool" | Dry, understated register over enthusiasm |
| Gender presentation | Male |

This is a **candidate preset only**. Per Checkpoint 1 in the canonical spec,
no voice configuration ships without 10/10 tone-check prompts passing and
Vadik personally reviewing sample outputs. Neither has run.

## 4. Phase 0 status — honest, not fabricated

The canonical spec's timeline puts Phase 0 (Corpus Assembly) in Q3 2026 —
now. This session is the first to touch it. The dated assembly log for
today's Step 0.1 (source inventory) is filed separately at
`docs/assembly/2026-09-15_QI46-assembly_phase-0-corpus.md`, following the
log format the spec itself defines. Its result is `HOLD`: this session
inventoried what documentation exists in this repository; it did not
tag, clear through COSMO®, or assemble the 10,000+ training pairs
Checkpoint 0 requires, and no subscriber production data was accessed. That
work is unstarted, not silently skipped.

## 5. Discrepancy found — flagged for S-2

`docs/benchmark/LOT-MANIFEST.md` lists:

```
QI-46 Engine | cool-tesla-f8j0mr | 36ef4dde | 8/8 | BEST | 8 | +2050 | QI·46 Node 3 engine integration + Soul Upload + Being Calibration
```

Neither the branch nor the commit exists in this repository or on `origin`:
`git fetch origin cool-tesla-f8j0mr` → *couldn't find remote ref*; `36ef4dde`
is not a valid object here. A wider check found **every** "BEST" branch
currently listed in the manifest (LOT Mail, Basics Tab, Calendar Alerts,
QI-46 Engine, COSMO Hardware, Health/Security, Badge RPG, Self-Assembly
v45 — collectively thousands of lines marked BEST) is equally missing from
`origin`. These were ephemeral per-session branches that appear to have
never been pushed, or were pushed and later pruned. If "Node 3" work with
real Soul Upload / Being Calibration code once existed, it is not
recoverable from this repository as it stands.

This node does not attempt to reconstruct that missing work — inventing a
plausible-looking implementation to match the manifest's claimed line count
would be exactly the kind of fabrication the self-assembly doctrine's
honesty rule forbids. Node 1 above restarts honestly from the canonical
spec, which is still intact.

**Recommendation for S-2:** any manifest "BEST" branch that still exists as
a local checkout outside this container should be pushed to `origin` now —
`git ls-remote --exit-code origin <branch>` confirms a branch is actually
safe before it's trusted as a ship candidate. Until then, the manifest's
BEST column should be read as "believed best at time of writing," not
"recoverable."

## 6. Next node

Node 2 (not started): real Step 0.1 source inventory against the actual
`/corpus/*` categories the canonical spec defines, scoped to data this
session has legitimate access to — the documentation corpus already in this
repo, not production subscriber records. No fine-tuning, no COSMO® pipeline,
no voice-preset deployment until Checkpoint 0 and Checkpoint 1 gates pass
with real data and Vadik's sign-off, per the canonical spec's own rules.
