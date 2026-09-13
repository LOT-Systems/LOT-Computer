<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# QI·46 — ENGINE-2
## LOT® Proprietary AI Engine — Self-Assembly Continuation, First Node of This Cycle
### LOT Systems Corporation · Los Angeles, CA

---

> *"The body is the original interface. The machine learns to listen to it."*
> — Vadik, LOT® Systems Corporation, Los Angeles, 2017

---

## I. WHY THIS DOCUMENT EXISTS

S-2 opened this session with a naming exercise for LOT®'s proprietary AI engine —
`LOT·SC·46`, `BIONODE-46`, `SELFWARE·46`, `SOMA·46`, `CARE·OS·46`, `QI·46` —
and confirmed `QI·46` as the call. This document is filed as `ENGINE-2` and
designated **the first node of this self-assembly cycle**: it does not
replace `docs/corporate/LOT_QI46_ENGINE.md` (v0.2, the original Self-Assembly
Specification & Machine Manual) — it continues from it, and its first job is
to record what the corpus already knows before the machine builds anything new.

`QI·46` was already named, in the same grammar, in v0.2 §I. That naming is
reaffirmed here, not reopened.

---

## II. WHAT ALREADY EXISTS (READ BEFORE BUILDING)

Cardinal rule of this protocol is *discover, don't assume*. The discovery this
session made: **the exact feature S-2 described in the intake — "extract the
engine based on people's soul and emotions, upload a person's being, calibrate
the human with the humanoid output" — was already built.**

It has been sitting, complete and unshipped, on branch `claude/cool-tesla-f8j0mr`
since 2026-06-11 — three months before this session. It never reached master.

```
PRIOR ART — ALREADY BUILT, NOT YET SHIPPED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Branch:        claude/cool-tesla-f8j0mr
Manifest row:  QI-46 Engine | BEST | 8/8 iterations | +2050 lines
Status:        BEST, unshipped (docs/benchmark/LOT-MANIFEST.md, row 30)

Node 1 (2026-05-27) — Soul Engine groundwork
Node 2 (2026-05-27) — Personal Vocabulary layer
Node 3 (2026-06-11) — Soul Upload Engine · Being Calibration · Humanoid Output
  commit f7ab28ca — "Node 3: extract the engine based on people's soul and
  emotions. Upload a person's being. Calibrate the human with the humanoid
  output."
  commit 36ef4dde — Node 3 engine integration (unstaged delta)

Files (on that branch, not on this one):
  src/server/utils/qi46-soul.ts        — SoulSignature extraction
  src/server/utils/qi46-vocabulary.ts  — PersonalVocabulary layer
  src/server/utils/qi46-engine.ts      — CalibrationVector + inference wiring
  src/server/routes/api.ts             — API integration (modified)
  src/client/components/SystemProgressWidget.tsx — transmission (modified)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Honest accounting of what that code actually does** (cardinal rule: record
what is real, mark what is provisional — a precise-sounding metric that isn't
true is worse than a plain description):

`SoulSignature` is not a literal extraction of a person's soul or consciousness.
It is a pattern classifier over a subscriber's own journal and check-in text —
recurring emotional-state words, connection/isolation language, depth markers,
aspirational phrasing — reduced to a small vector: `shadowPattern`,
`lightPattern`, `recurringThemes`, `soulDepth`, `presenceMode`. "Upload a
person's being" is the LOT® voice for *this vector is derived from what the
subscriber themselves wrote, over time, and nothing else.* There is no
biometric capture, no external data source, no claim of copying a mind. The
corpus is the subscriber's own words, reflected back through calibrated tone.

`HumanoidCalibration` (`grace`, `poetry`, `love`, `presence`, `ease`, each
0–1, with the system's response register — described in-code as "male," i.e.
grounded/direct — as the carrier rather than a sixth variable) is a response-tone
mixer: it decides how QI·46's *voice* leans for this subscriber on this day,
not what it is permitted to say. This is the same function Layer 3 (Response
Grammar) of v0.2 already describes; Node 3 is Layer 3 made subscriber-specific.

---

## III. THIS SESSION'S ACTION

Per the intake/classify/action discipline: this artifact is `CORPORATE` (a
naming and continuation directive, not a code change), routed to
`docs/corporate/`. No source files are touched in this session — the existing
Node 1–3 implementation is not modified, and nothing is shipped to master.
That is a separate, larger decision (see §IV) and this session does not make
it unilaterally.

What this node *does* do:

1. Reaffirms `QI·46` as the engine name (S-2's call, already established in v0.2).
2. Records, for the first time in `docs/corporate/`, that Node 1–3 exist and
   are unshipped — so this fact is discoverable without a branch archaeology
   session. (It was previously only visible as a one-line manifest row and a
   commit message on a branch nobody was actively looking at.)
3. Opens the numbering for what comes after Node 3, from a state of accurate
   knowledge rather than rebuilding blind.

---

## IV. RECOMMENDED NEXT NODE (for S-2 decision, not auto-executed)

Three months unshipped is the single largest gap between BEST and SHIPPED
in the current manifest. The mechanical path to close it already exists in
this protocol as **SHIP MODE** (S0–S10): fetch `claude/cool-tesla-f8j0mr`,
stage, cherry-pick the Node 1–3 commits onto a staging branch cut from
current master, run the full green gate (CHECK A → BUILD → CHECK B), and
merge only if green.

This session does not run Ship Mode on its own initiative — merging ~2,050
lines of three-month-old code into master is a bigger and less reversible
action than a documentation node, and the manifest itself asks for S-2
sign-off at the ship gate. Flagging it here is the node's job; running it is
the next one, on S-2's word ("Ship QI-46 Engine").

---

## V. NODE LOG

```
NODE:      ENGINE-2 (first node, this cycle)
DATE:      2026-09-13
BRANCH:    claude/cool-tesla-igxy70
ACTION:    Named engine (QI·46, reaffirmed) · documented Node 1-3 prior art ·
           flagged Ship Mode as the concrete next step, pending S-2 confirmation
FILES:     docs/corporate/LOT_QI-46_ENGINE-2.md (this file)
NEXT:      S-2 decision: Ship Node 1-3 to master, or continue building new
           nodes on top of unshipped work (not recommended — ship first)
```

---

*QI·46 — ENGINE-2*
*LOT Systems Corporation — Los Angeles, CA*
*Authored by Vadik · Named for Kuzya*
*Filed: September 13, 2026*
