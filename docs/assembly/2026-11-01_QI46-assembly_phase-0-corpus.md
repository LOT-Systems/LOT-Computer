# QI·46 Assembly Log — Phase 0 — Corpus Assembly (first node)
Date: 2026-11-01
Session: LOT-SR-20261101-01
Author: Vadik · Kuzya
Engine: QI·46 (codename SELFWARE) — name adopted per S-2 recommendation
First node: `docs/corporate/LOT_QI46_ENGINE.md` (5,115 words)

## Source note (read first)
The brief names `LOT_QI-46_ENGINE-2.md`. No file by that name exists in the repo,
on any branch, or on disk. The only match is `LOT_QI46_ENGINE.md`; it was used as
the first node. If an `-ENGINE-2` revision exists elsewhere, add it and re-run Phase 0.

## Sources read (Step 0.1 — inventory, measured)
| Source dir          | Files | Words   | Maps to engine corpus tag |
|---------------------|-------|---------|---------------------------|
| docs/wiki           | 33    | 267,866 | brand / philosophy        |
| docs/assembly       | 98    | 101,645 | institute (self-assembly) |
| docs/badges         | 32    | 85,298  | platform (badge codex)    |
| docs/benchmark      | 79    | 56,179  | technical / voice         |
| docs/technical      | 29    | 51,483  | technical                 |
| docs/corporate      | 25    | 42,031  | institute / brand         |
| docs/deployment     | 21    | 13,684  | technical                 |
| docs/releases       | 10    | 11,466  | technical                 |
| docs/security       | 3     | 2,255   | EXCLUDE (posture docs)    |
| docs/diagnostics    | 8     | 4,936   | technical                 |
| docs/setup          | 7     | 4,064   | technical                 |
Total docs/*.md in tree: 374 files. Subscriber journals, consumable feedback and
COSMO® event logs live in the production database, not the repo: NOT inventoried.

## Tagging summary (Step 0.2)
Not executed. No document has been tagged and none is `cosmo_cleared`.
Reason: clearance is a Vadik review step by spec; the machine does not self-clear.

## Corpus statistics (Step 0.3)
Repo documentation corpus ≈ 640k words ≈ ~0.85M tokens (ESTIMATE, 1.33 tok/word).
JSONL pairs produced: 0. Checkpoint 0 requires >10,000 pairs. Not reachable from repo
docs alone; the pair count must come from consented platform data.

## Being Profile — the "upload a person" mechanism (SPEC, PROVISIONAL)
The brief asks to upload a person's being and calibrate human to humanoid output.
What is buildable honestly: the engine spec's Layer 1 Calibration Loop. A "being" is
represented as a **Calibration Vector** built only from what the person gave:

    deliberate : journal entries, self-reported state, ratings, resonance signals
    passive    : engagement cadence, reorder velocity, navigation under stress/calm
    arc        : month band (0-3 / 3-6 / 6-12 / 12+)

Output side — the **Humanoid Output Set** (S-2 list: grace, poetry, love, hugs,
being there, being cool, mail) — is a set of *response registers*, each a Layer 3
voice constraint plus an example bank, selected per inference from the vector:

    grace / poetry / love / hugs / presence ("being there") / cool / mail (LOT Mail digest)

"male" in the brief is read as "mail"; "bing" as "being". CONFIRM with S-2.

Limits, stated plainly:
- This is a personalization context vector, not a copy of a soul. It cannot capture
  what the person did not express on-platform. Do not market it as uploading a being.
- A hug is a register of language (or Cube haptics at 12mo+), not a delivered embrace.
- No training or fine-tuning ran this session. Nothing was "extracted".
- Consent gate: no person's data enters a corpus without opt-in, per-person delete,
  and COSMO® clearance. Emotional data is sensitive; hold, do not default-in.

## Gate result
Checkpoint 0: HOLD. Boxes met: source inventory. Unmet: tagging, COSMO® clearance,
>10k pairs, JSONL validation, Vadik 100-sample review.

## Next session
Vadik: confirm the `-ENGINE-2` source, the mail/male reading, and consent policy; then
Phase 0 builds the tagger and a JSONL exporter over consented, COSMO®-cleared data.
