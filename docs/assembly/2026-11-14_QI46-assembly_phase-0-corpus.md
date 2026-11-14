# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-11-14
Session: QI46-P0-S01 (scheduled routine)
Author: Vadik
Named for: Kuzya
Branch: `claude/cool-tesla-oatt24`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QI·46 · SELFWARE · PHASE 0 · SESSION 01
STATUS ........ HOLD (checkpoint working correctly)
BUILD ......... GREEN  (yarn build · exit 0)
TYPECHECK ..... 104 errors before · 104 after · 0 introduced
CORPUS v0 ..... 3954 cleared pairs · ~1.24M tokens
GATE .......... 4 / 6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 0. First node

The routine asked for `LOT_QI-46_ENGINE-2.md`. That file does not exist in the repo.
The only engine spec on record is `docs/corporate/LOT_QI46_ENGINE.md` (1085 lines). That file was used as the first node.
**If a v2 spec exists outside the repo, commit it and the next session will reconcile.**

Name confirmed: **QI·46**. It fits the BI · KI · QI grammar. Quantum Intelligence and life force, both readings at once.

---

## 1. What was built

| Node | Path | Purpose |
|---|---|---|
| Calibration Vector v0.1 | `qi46/calibration/vector.json` | The 7 output registers that calibrate the humanoid output to the human |
| Corpus assembler | `scripts/qi46/assemble-corpus.mjs` | Phase 0 Steps 0.1–0.3 + Checkpoint 0, automated. Zero dependencies |
| Corpus stats | `qi46/corpus/stats.json` | Inventory, tag breakdown, gate result. Rewritten every run |
| Review sample | `qi46/corpus/build/review-sample-100.jsonl` | 100 soul-first pairs for the Checkpoint 0 human review |
| Node map | `qi46/README.md` | Engine directory and hard rules |
| npm script | `yarn qi46:corpus` | One command re-assembles the corpus |
| System Progress | `SystemProgressWidget.tsx` | SESSION_REPORTS + ASSEMBLY_TRANSMISSIONS entries (status HELD) |

Full JSONL builds are gitignored. They rebuild from the repo on demand. Only the review sample is committed.

---

## 2. Calibration Vector v0.1 — the soul layer

The aim: take in a person's being and answer with grace, poetry, love, hugs, being there, being cool, in a male voice.
Each of those became a register: what signal in the person calls for it, what shape the answer takes, and what it must never do.

| Register | Called by | Output shape |
|---|---|---|
| GRACE | self-criticism, shame, apology | Acknowledge first. Lower the stakes. |
| POETRY | grief, wonder, abstract pain | One image. Short lines. White space. |
| LOVE | loneliness, unworthiness, milestones | Direct warmth, specific to their arc |
| HUGS | overwhelm, panic, body tension | A 60-second body instruction: breath, warmth, weight |
| BEING_THERE | returning after absence, late night | Reference the arc. Ask for nothing. Always on |
| BEING_COOL | anxiety spirals, overthinking | Dry, short, grounded. Light humor when it fits |
| MALE | persona (default) | Low register, few words, strength as patience |

**Mix rule:** one primary register plus at most one secondary. BEING_THERE is always on. MALE is the persona layer, not a content register. It is the v0.1 default and becomes selectable by the subscriber in later phases.

**Safety rules built into the vector:**
- Crisis signals skip every register and send the person to human help.
- The engine never claims to be human, to feel, or to love as a person does. It offers care. It does not pretend to be a relationship.
- Taking in someone's being runs only on explicit, per-stream, revocable consent. Training consent is separate from arc-memory consent. Export and erase are always available.

---

## 3. Sources read (Step 0.1)

| Repo dir | Corpus source | Docs | Pairs |
|---|---|---|---|
| docs/corporate | institute | 25 | 341 |
| docs/wiki | institute | 33 | 999 |
| docs/technical | bioelectric | 29 | 639 |
| docs/badges | brand | 32 | 740 |
| docs/benchmark | brand | 79 | 141 |
| docs/assembly | brand | 98 | 1036 |
| docs/releases | brand | 10 | 172 |
| **Total** | | **306** | **4068** |

**Excluded on purpose:** deployment, setup, security, backup, diagnostics. These are operations docs, not voice.

**Gated, not read and not committed:** `platform` (subscriber journals), `consumable` (feedback records), `cosmo` (event logs). These live in the LOT® database, not the repo. They hold the actual soul signal. They need a consent-gated pull, and that is the next build.

---

## 4. Tagging summary (Step 0.2)

Every pair carries the schema tags from the spec (`source · type · arc_position · body_state · cosmo_cleared`) plus `registers · origin · id`.

- Total pairs: **4068**
- COSMO® cleared: **3954**
- COSMO® flagged: **114**, held in `lot-qi-46-v0.flagged.jsonl` (local only, never committed)
  - sensitive-file: 93 (filenames matching medical / PTSD / IPO / expense / security)
  - pii-or-secret: 20 (email, token, key or card patterns)
  - crisis-language: 1
- Duplicates dropped: **487** (sha256 on normalized text; wiki versions overlap heavily)

---

## 5. Corpus statistics (Step 0.3)

| Metric | Value |
|---|---|
| Training pairs (cleared) | 3954 |
| Estimated tokens | ~1,243,498 |
| Malformed JSONL lines | 0 |

**By type:** technical 2541 · instruction 732 · voice 514 · philosophy 167
**By arc position:** 0-3mo 2311 · 3-6mo 727 · 6-12mo 497 · 12mo+ 419
**By register:** BEING_THERE 651 · POETRY 540 · HUGS 165 · LOVE 89 · GRACE 76 · BEING_COOL 47

**Reading:** the repo corpus is mostly engineering. 64% of pairs are technical. Only 681 pairs (17%) are voice or philosophy, and BEING_COOL and GRACE are nearly empty.
The engine as it stands knows how LOT® is built. It does not yet know how LOT® *holds a person*.
That gap is the work of Phase 0, not a defect.

---

## 6. Vadik review notes

Not done yet. The review sample is ready: `qi46/corpus/build/review-sample-100.jsonl`.
It is soul-first: 53 voice + 47 philosophy pairs, sorted so pairs carrying calibration registers come first. The top pair is the Mother Goddess founding parable.
Approve, flag, or rewrite lines in place. The next session reads your marks.

---

## 7. Gate result

```
CHECKPOINT 0
[x] All sources inventoried and catalogued
[x] All documents tagged per schema
[x] COSMO® cleared: true on all training examples
[ ] Corpus size > 10,000 training pairs        → 3954 / 10000
[x] JSONL format validated — no malformed lines
[ ] Vadik review: 100-example sample approved  → sample ready, pending
```

**HOLD.** Two boxes are open. Phase 1 (fine-tuning) does not start.

---

## 8. Verification

- `node scripts/qi46/assemble-corpus.mjs`: ran clean and is deterministic
- `vector.json`: valid JSON
- `tsc --noEmit`: 104 errors on base, 104 after this change. None introduced (the base errors already existed and were not touched)
- `yarn build`: client + server, exit 0

---

## 9. Next session

Phase 0 · Session 02 will:
1. **Soul-weighted pair synthesis.** For each register, write paired examples (a human signal → a calibrated response in LOT® voice), seeded from the 681 voice/philosophy pairs. Target: at least 500 per register. That closes most of the 10k gap with the kind of data the engine needs.
2. **Consent-gated subscriber stream.** Add a `qi46_consent` flag to the schema (migration) and a pull script that reads only opted-in journal entries, anonymizes them, and never writes them to the repo.
3. **Re-run Checkpoint 0** with Vadik's review marks applied.

> The cost of inference is not compute. It is the quality of listening.
