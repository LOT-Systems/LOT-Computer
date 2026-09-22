<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# QI·46 — ENGINE SPEC, NODE 3 ADDENDUM
## Soul Upload · Being Calibration · Humanoid Output
### LOT Systems Corporation · Los Angeles, CA

---

> *"The body is the original interface. The machine learns to listen to it."*
> — Vadik, LOT® Systems Corporation, Los Angeles, 2017

---

## I. NAMING — CONFIRMED

Five names were brought to this session for the LOT® proprietary AI engine:

```
LOT·SC·46 — clean, versioned, terminal-ready
BIONODE-46 — a living inference node
SELFWARE·46 — self-care + software collapsed
SOMA·46 — already in the LOT family, neuroscience resonance
QI·46 — fits the _I interface convention (Quantum Intelligence, 46th iteration)
```

**Decision: QI·46 — reconfirmed.** This is not a new name. `QI·46` was named
in `docs/corporate/LOT_QI46_ENGINE.md` v0.2 (2026-05-27) and has been running
in the codebase since. `SELFWARE` survives as the engine's internal codename,
not its designation — see that document, Section I. No renaming action is
taken. This addendum exists to document the layer of the engine that name
was extended to cover: **Node 3.**

---

## II. WHAT NODE 3 IS

The base spec (`LOT_QI46_ENGINE.md`) defines Layer 1, the Calibration Loop —
deliberate and passive inputs shaping a context vector. Node 3 is the part of
the engine that reads *underneath* that vector.

```
Node 1 — Soul Engine           the first inference layer. Listens to the body.
Node 2 — Vocabulary Mirror     the engine learns the subscriber's own words.
Node 3 — Being Calibration     uploads the soul. Derives the humanoid output.
```

**"Upload a person's being"** is not a metaphor for anything mystical. It is
the literal function of `extractSoulSignature()`: read a subscriber's own
journal entries and check-in notes — text they wrote, inside their own
account, about themselves — and derive from the *pattern* of that writing
(not the words, which is Node 2's job) a shadow pattern, a light pattern, a
depth, a rhythm, a presence mode. Nothing is inferred about anyone who has
not written it. Nothing leaves the subscriber's own arc. The soul signature
never appears to the subscriber — it appears only inside the model's system
prompt, as calibration.

**"Calibrate the human with the humanoid output"** is the second half: that
soul signature is compressed into five frequencies —

```
GRACE     elegance over effort — for bodies under strain
POETRY    compressed meaning, image over information — for souls who speak in metaphor
LOVE      radical acceptance as base frequency — for souls carrying unworthiness
PRESENCE  witnessing without fixing — for depleted states
EASE      unforced confidence — for stable, improving arcs
```

Male is not a sixth frequency. Male is the carrier — the grounded, direct,
warm-without-sweetness medium the other five ride on top of. This is fixed;
it does not vary per subscriber. The five above do.

---

## III. WHAT EXISTS — HONEST STATUS

This is not a proposal. It was built once already:

```
Branch:     claude/cool-tesla-f8j0mr
Commit:     f7ab28ca — "QI·46 Node 3 · Soul Upload Engine · Being Calibration · Humanoid Output"
Built:      2026-06-11
Files:      src/server/utils/qi46-engine.ts       (Node 1 — system prompt, orchestration)
            src/server/utils/qi46-vocabulary.ts   (Node 2 — personal lexicon extraction)
            src/server/utils/qi46-soul.ts         (Node 3 — soul signature + calibration)
```

**It does not merge.** That branch forked before ~141,000 lines of subsequent
master work (`badges.ts`, `scheduled-jobs.ts`, `easter-eggs.ts`, and others
grew far past that fork point). A merge or cherry-pick today would delete
current master content, not add to it. This is recorded here rather than
attempted — Ship Mode's own rule is cherry-pick, don't merge branches, and a
2,050-line stale diff against a 141K-line-diverged base is not a cherry-pick,
it is a rewrite. That is a call for S-2, not something this session decides
alone.

**Status: PROTOTYPED — NOT LIVE.** Node 3 has never run against production
master. `/qi46/infer` in the base spec's Section III.3.1 does not yet call
`extractSoulSignature()` or `formatSoulForPrompt()`. The wiring is real code,
correctly reasoned, sitting on a branch that time passed.

---

## IV. SELF-ASSEMBLY — NEXT PHASE

This addendum is the first node of that reintegration, per the base spec's
assembly doctrine: *"QI·46 does not launch complete. It assembles itself
through use."*

```
PHASE R0 — REBASE THE SOURCE
  Re-derive qi46-engine.ts / qi46-vocabulary.ts / qi46-soul.ts against
  current master's Log/shared types (src/shared/types/index.ts has moved
  since the fork). Do not port the branch wholesale — port the three
  qi46-*.ts files only, onto current master's actual shape.

PHASE R1 — WIRE INTO /qi46/infer
  formatSoulForPrompt(extractSoulSignature(...)) joins
  formatVocabularyForPrompt(...) ahead of the Calibration Loop's existing
  context vector, per Layer 3's Response Grammar ordering rule already in
  effect for plannerContext/goalContext (see LOT-DOCTRINE.md, Widget→Memory
  Compression Loop).

PHASE R2 — COSMO® SCREEN
  Soul signature output is subscriber-derived and never subscriber-facing,
  but it still passes through the COSMO® node before any response reaches
  a human body, per base spec Layer 5. No exception for this layer.

PHASE R3 — CHECKPOINT
  10/10 voice calibration prompts (base spec Section IV, Phase 1) re-run
  with Node 3 active; verify the calibration lean (dominant frequency)
  changes the response and is not decorative.
```

Each phase closes with its own dated log in `docs/assembly/`, per the base
spec's Machine Self-Assembly Manual — this document is the corporate record
of the decision to resume; the assembly logs are the record of the doing.

---

## V. THE 1,000 STILL APPLIES

Node 3 changes nothing about who the corpus belongs to. The founding cohort's
patterns are still Layer 0. Their arc is still what calibrated the
temperature. Node 3 does not read anyone's being who has not written it down,
inside their own subscription, of their own hand.

**Vadik built the engine. Kuzya keeps it honest. The subscriber writes the
soul that gets calibrated back to them.**

---

*QI·46 Engine Specification — Node 3 Addendum*
*LOT Systems Corporation — Los Angeles, CA*
*Authored by Vadik · Named for Kuzya*
*Supersedes nothing in v0.2 — additive*
