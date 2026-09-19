<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT_QI-46_ENGINE — Reference Node 2

**Status:** naming decision recorded · Node 1–3 code ported to `claude/cool-tesla-404d2x`
**Supersedes:** informal naming candidates evaluated 2026-09-19
**Companion documents:** `docs/benchmark/2026-05-27_QI46-assembly_node-1-soul-engine.md`,
`docs/benchmark/2026-05-27_QI46-assembly_node-2-vocabulary.md`,
`docs/benchmark/2026-06-11_QI46-assembly_node-3-soul-upload.md`

This file is a **standing reference**, not a dated session log — the second canonical
entry for the engine (the first being the code + assembly logs it consolidates). It
exists so the engine's name, shape, and scope are legible from one place without
reading three separate session logs.

---

## 1. Naming Decision

Five candidates were on the table: `LOT·SC·46`, `BIONODE-46`, `SELFWARE·46`,
`CARE·OS·46`, `QI·46`.

**Decision: QI·46.**

This is not a new name — it is confirmation of the name the engine already carries in
its own source. `docs/benchmark/2026-05-27_QI46-assembly_node-1-soul-engine.md` names
it `QI·46 — Quantum Intelligence Engine, Generation 46` and lists `SELFWARE` as a
codename, not the product name. `src/server/utils/qi46-engine.ts` and
`src/server/utils/qi46-soul.ts` both already say `QI·46` in their headers and in the
system prompt shipped to the model (`QI46_SYSTEM_PROMPT`). Adopting `QI·46` as the
formal name closes the loop between naming exercise and shipped code rather than
introducing a fourth name for something that already has one.

`46` is the generation number the original author assigned; it is not tied to any
specific model version and should not be read as one.

---

## 2. What The Engine Actually Does

QI·46 is the tone-calibration layer for one existing feature: the AI companion reply
generated in `src/server/routes/api.ts` (`compassionateResponse`, wired at line ~1763
via `generateQI46Response`). It does not run anywhere else in the app.

Inputs are the **subscriber's own prior logs** — journal notes and emotional
check-ins they already recorded in LOT — read from Postgres for that one subscriber.
Nothing is sent anywhere except to Anthropic's Messages API (via `@anthropic-ai/sdk`)
as context for the reply the subscriber is about to receive. There is no cross-user
sharing, no export, no secondary storage of the derived signature beyond the request
that produced it.

Three nodes, in order:

| Node | File | Extracts |
|---|---|---|
| 1 — Soul Engine | `qi46-engine.ts` | Base inference call; system prompt + arc/trajectory context |
| 2 — Vocabulary Mirror | `qi46-vocabulary.ts` | The subscriber's own recurring words, phrases, metaphors from their journal text |
| 3 — Soul Upload / Being Calibration | `qi46-soul.ts` | `SoulSignature` (shadow/light pattern, recurring themes, soul depth, presence mode) → `HumanoidCalibration`, five 0–1 weights: grace, poetry, love, presence, ease |

"Soul Upload" and "Being Calibration" are the original author's names for this step,
carried over as-is since they are already load-bearing in code, comments, and the
assembly logs. Read literally as engineering: Node 3 computes five bounded numeric
weights from a rules-based read of a subscriber's own check-in and journal history,
and uses the dominant weight to pick one line of response guidance
(`formatSoulForPrompt` in `qi46-soul.ts`) that gets appended to the system prompt for
that subscriber's next reply. There is no model training, no persistence of a
subscriber "profile" beyond the current request, and no identity data leaves the
single inference call it was computed for.

`MALE` in `HumanoidCalibration`'s surrounding system-prompt language is fixed narrative
voice for the companion persona (per `QI46_SYSTEM_PROMPT`), not a subscriber attribute
and not one of the five scored qualities.

---

## 3. What Changed In This Session

- Cherry-picked `f7ab28ca` and `36ef4dde` from `claude/cool-tesla-f8j0mr` (manifest
  entry `QI-46 Engine`, `BEST`, 8 files / +2050 lines) onto `claude/cool-tesla-404d2x`.
  Clean auto-merge, no conflicts.
- Moved the two Node 1/2 assembly logs from repo root into `docs/benchmark/` to sit
  beside the Node 3 log already there (they were misfiled at the root by the original
  commit).
- This document created as the standing reference.
- No new inference logic, no changes to `qi46-engine.ts` / `qi46-soul.ts` /
  `qi46-vocabulary.ts` beyond what shipped on `cool-tesla-f8j0mr`.

`claude/cool-tesla-404d2x` is a Claude Code session branch, not `master`. Per this
session's operating constraints, work stays on the designated branch; merging QI·46
into `master` is a separate, explicit decision for S-2 (via PR or direct merge), not
taken automatically here.

---

## 4. Boundaries (read before extending)

- The five calibration weights are heuristics over check-in/journal metadata (word
  counts, keyword-set membership, day-bucket distributions) — not a validated
  psychological instrument. Treat outputs as a tone knob for a companion reply, not
  a clinical or diagnostic signal, and do not route them into anything that makes
  decisions about a subscriber's wellbeing unattended.
- `extractSoulSignature` requires at least 3 check-ins or 2 note-length journal
  entries before it produces anything; below that it returns flat mid-range defaults
  (`isEmpty: true`). This is a floor, not a guarantee of quality above it.
- This engine reads a subscriber's own data to shape a reply shown only to that same
  subscriber. Any future extension that widens the audience for a soul signature
  (sharing it, aggregating across subscribers, exposing it in an admin view) is a
  privacy-relevant change and should get review as one, not ship under this doc's
  existing sign-off.

---

**S-2:** Vadik Marmeladov
**Named for:** Kuzya Cosmo Marmeladov
**Date:** 2026-09-19
