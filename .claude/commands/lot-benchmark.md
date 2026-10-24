---
name: lot-benchmark
description: >-
  The LOT Systems PRODUCT-stage build, verify, and self-assembly protocol. Use
  this skill WHENEVER S-2 (Vadik Marmeladov) says "Benchmark", "green build",
  "run the benchmark", or "ship it" inside a Claude Code session on a LOT repo —
  and use it even when the request is phrased loosely (e.g. "lock this in",
  "make it green, push it"). Also triggered by "Ship [feature]" to merge a
  self-assembly routine from a feature branch to master via staging (reads
  LOT-MANIFEST.md, cherry-picks BEST iteration, green-gates, merges). It runs
  the full pipeline: preflight the environment, intake an artifact, classify it,
  take action, run all system checks, build, re-check until green (never push
  red), write a military-grade Terminal Grid session report into docs/benchmark/,
  route artifacts to the correct existing folder, distill learnings into an
  evolving lexicon and doctrine, and push to GitHub on the current ship branch.
  Trigger this for any LOT build-and-record cycle; do NOT use it for one-off
  edits the user has not asked to "benchmark".
---

# LOT BENCHMARK — Build, Verify, Self-Assembly Protocol

PRODUCT-stage cycle for LOT Systems. Triggered by S-2 (Vadik Marmeladov) with
**"Benchmark"** / **"green build"**. Cardinal rule: **broken code never reaches
GitHub.** Long-term goal: a corpus that compresses its own logic over time via an
evolving controlled vocabulary, able to run for years without surprising S-2 or
corrupting history.

This is a single self-contained file by design — no external references, no
packaged artifact, nothing to drift or lose over a multi-year horizon. The
protocol is plain text in the repo; any clone on any machine has the whole thing.

---

## CARDINAL RULES (never violate)

1. **No red pushes.** Checks red → fix-and-recheck until green, OR Plan B
   (guarded rollback). One of those must hold before any `git push`.
2. **Never overwrite history.** Each session report is a NEW date-stamped file.
   Ledger/lexicon are append-only; doctrine distills but never rewrites the
   verbatim reports — Plan-B rollback depends on that ground truth.
3. **Discover, don't assume.** Read the live repo every run (tree, check
   commands, tags). Nothing about paths or commands is hardcoded.
4. **S-2 attribution mandatory.** `S-2: VADIK MARMELADOV` in every report header;
   `AUTHORIZED BY: S-2 // VADIK MARMELADOV` at the foot.
5. **Honest engineering.** Produce the *conditions* for compressed notation; do
   not fabricate "philosophy" or call provisional tokens a language. Record what
   is real; mark what is provisional. A made-up precise metric is worse than an
   honest "trend: shorter."
6. **Fail loud, early.** If preconditions are not met (step 00), STOP and report.
   Never run a destructive command against a target you have not verified exists.

---

## PIPELINE

```
00  PREFLIGHT   Verify environment + read live repo. Refuse to run if unhealthy.
01  INTAKE      Capture artifact -> CLASSIFY -> ACTION -> record
02  CHECK A     Run all repo-defined checks (pre-build baseline)
03  BUILD       Execute the repo-defined build
04  CHECK B     Re-run checks -- GREEN gate
                  red          -> fix-and-recheck loop until green
                  unrecoverable-> PLAN B (guarded rollback) — see step 04
05  REPORT      Write Terminal Grid report -> docs/benchmark/ (NEW file); route artifacts
06  DISTILL     Append LEDGER; update LEXICON; fold DOCTRINE; record compression
07  PUSH        Commit + push on the CURRENT ship branch; tag benchmark-DATE-NN
08  CHECK C     Post-push verification
```

Nothing past step 04 runs while any check is red.

---

## STEP 00 — PREFLIGHT (verify, then orient)

Fail loud and early. Run these and STOP with a written reason if any precondition
fails — a multi-year unattended engine must refuse a broken environment rather
than discover it at push time.

**Preconditions (all must hold):**
- In a git repo: `git rev-parse --show-toplevel` succeeds.
- `docs/` exists and is writable (else: report the problem, do not proceed).
- A remote is configured and reachable: `git ls-remote --exit-code <remote> >/dev/null`.
  If unreachable, you may still run the local cycle but MUST mark the report
  `REMOTE: UNREACHABLE` and SKIP step 07's push (record it as deferred).

**Orient (read the repo as it is now):**
```bash
ROOT=$(git rev-parse --show-toplevel)
BRANCH=$(git rev-parse --abbrev-ref HEAD)           # the CURRENT ship branch — push target
VERSION=$(git describe --tags --abbrev=0 2>/dev/null || git rev-parse --short HEAD)
LAST_GREEN=$(git tag --list 'benchmark-*' --sort=-creatordate | head -1)   # may be empty
REMOTE=$(git remote | head -1)
TODAY=$(date -u +%Y%m%d)
find docs -maxdepth 1 -mindepth 1 -type d | sort    # routing folders
ls docs/benchmark/LOT-SR-${TODAY}-*.md 2>/dev/null  # for NN sequencing
node -e "const s=require('./package.json').scripts||{};Object.entries(s).forEach(([k,v])=>console.log('npm run '+k+' => '+v))" 2>/dev/null
[ -f Makefile ] && grep -E '^[a-zA-Z0-9_.-]+:' Makefile | sed 's/:.*//'
```
Record `LAST_GREEN` — it is the Plan-B target. If it is **empty**, Plan B is
unavailable this run (see step 04); note that in the report.

Also read, if present: `docs/benchmark/LOT-LEDGER.md`, `docs/benchmark/LOT-LEXICON.md`,
`docs/benchmark/LOT-DOCTRINE.md`. Create on first run (bootstrap, end of file).

## STEP 01 — INTAKE → CLASSIFY → ACTION → RECORD

Identify the single primary artifact S-2 brought (article, PDF, roadmap, vision,
design, style spec, UI detail, bug-fix, or request). Classify into ONE class.
Map to a live `docs/` folder (read the tree — confirm the folder exists):

| CLASS         | Meaning                                   | Default folder |
|---------------|-------------------------------------------|----------------|
| CORPORATE     | corporate docs, terms, brand, investor    | `corporate/`   |
| STYLE         | style specs, brand grid, typography       | `technical/` (→ `style/` if it exists) |
| ENGINEERING   | code, UI, bug-fix, technical spec         | `technical/`   |
| SELF-ASSEMBLY | autonomous build logic, lexicon, doctrine | `assembly/`    |
| DEPLOYMENT    | infra, hosting, CI                        | `deployment/`  |
| SECURITY      | certs, auth, secrets posture              | `security/`    |
| RELEASE       | version cut, changelog                    | `releases/`    |

No matching folder → default to `technical/` and note the fallback in the report.
Record classification, action, and target folder for the INTAKE block.

> Judgment boundary: classification is the one step that is genuinely judgment,
> not mechanism. On an autonomous run, if the artifact is ambiguous or its scope
> is broad, prefer to HOLD and surface it to S-2 rather than guess and act. The
> machine is autonomous on the deterministic loop; intake keeps a human in view.

## STEPS 02–04 — CHECK / BUILD / CHECK (the green gate)

**02 CHECK A** — run every repo-defined check; record PASS/FAIL per command.
**03 BUILD** — run the repo-defined build; capture output and artifact paths.
**04 CHECK B** — re-run every check, then branch:

- **All green** → step 05.
- **Red** → fix-and-recheck loop: diagnose first failure → smallest correct fix →
  re-run checks → repeat until green. Log each fix (one line) for the report. Do
  not advance while any check is red.
- **Unrecoverable** → **PLAN B (guarded):**
  1. If `LAST_GREEN` is empty → **ABORT, do not reset.** Write a
     `RESULT: ABORT — NO ROLLBACK TARGET` report and stop. (Never
     `git reset --hard` to nothing.)
  2. Verify the tag exists: `git rev-parse --verify "$LAST_GREEN^{commit}"`.
     If it does not resolve → ABORT as above (a pruned/missing tag is not a
     valid reset target).
  3. `git reset --hard "$LAST_GREEN"`; re-run checks to confirm GREEN ground
     truth at that tag.
  4. Write a `RESULT: PLAN-B ROLLBACK` report (still a NEW file, still
     S-2-authorized). The intended change is abandoned; the tree is restored.
     Rollback is a legitimate recorded outcome, not a failure to conceal.

## STEP 05 — REPORT + ROUTE

Write a NEW Terminal Grid `.MD` to **`docs/benchmark/`** using the template at the
end of this file. ID `LOT-SR-YYYYMMDD-NN`; compute `NN` from existing files for
today; NEVER overwrite. Record `VERSION` (last tag or short-hash) and the ship
`BRANCH` in the header.

File produced artifact(s) into the correct EXISTING `docs/` subfolder from step
00. If the natural folder is absent, file under the documented default and note
it — do not silently spawn a competing folder. (A future `style/` auto-receives
STYLE artifacts.)

## STEP 06 — DISTILL (self-assembly core)

History is append-only; doctrine/lexicon are the compressing layer.

- **Ledger** (`docs/benchmark/LOT-LEDGER.md`): append ONE line, never edit prior:
  `YYYYMMDD-NN | CLASS | summary | RESULT | hash | <metric>`
- **Lexicon** (`docs/benchmark/LOT-LEXICON.md`): reuse existing tokens; mint a NEW
  token only when a concept has appeared in **3+ prior reports** or been folded
  into doctrine twice (earn, don't decree). Record `REV` and `SINCE`. Never
  delete; supersede with `DEPRECATED -> <token>`.
- **Doctrine** (`docs/benchmark/LOT-DOCTRINE.md`): fold stable repeated findings
  into dense clauses in current lexicon notation; cite the reports superseded
  (in doctrine only — reports stay verbatim). Bump `rev` letter on reorganizes.
- **Compression metric (countable, honest):** record this report's word count and
  the running MEDIAN report word count, e.g. `WORDS: 612 (median 640) — trend ↓`.
  This is a real, reproducible number. Do NOT invent a counterfactual "raw vs
  compressed" ratio. If you want to note qualitative density, mark it
  `ESTIMATE`.

## STEP 07 — PUSH (green only; current ship branch)

Only reachable when CHECK B is green (or after a completed Plan-B rollback).
Push to the **current ship branch** read in step 00 — do not switch branches.
```bash
git add -A
git commit -m "BENCHMARK: <classification> — <summary> [VM]"
git tag "benchmark-${TODAY}-${NN}"          # permanent rollback lattice — never GC
git push "$REMOTE" "$BRANCH" --follow-tags
```
If REMOTE was UNREACHABLE in step 00: commit and tag locally, mark the report
`PUSH: DEFERRED`, and stop — the next run with a reachable remote will carry it.

> Benchmark tags are permanent infrastructure, not housekeeping. They are the
> rollback lattice that makes multi-year recovery possible. Never prune them.

## STEP 08 — CHECK C (post-push verification)

Re-run checks against the pushed state. Record GREEN/RED as the report's closing
`POST-PUSH VERIFICATION`. Red post-push is a CRITICAL note for the next session.

---

## REPORT TEMPLATE (Terminal Grid)

Fill every field. Keep columns aligned to the character grid. ID never reused.

```
================================================================================
LOT SYSTEMS / SESSION REPORT
DOCUMENT: LOT-SR-YYYYMMDD-NN
TITLE:    <short imperative title>
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
VERSION:  <last tag or short-hash>
BRANCH:   <current ship branch>
DATE:     YYYY-MM-DD
TIME:     HH:MM UTC
RESULT:   GREEN | PLAN-B ROLLBACK | ABORT — NO ROLLBACK TARGET
================================================================================

--------------------------------------------------------------------------------
00 // PREFLIGHT
--------------------------------------------------------------------------------
REPO:        OK        DOCS WRITABLE: OK
REMOTE:      <remote>  REACHABLE | UNREACHABLE
LAST GREEN:  <tag or NONE>

--------------------------------------------------------------------------------
01 // INTAKE
--------------------------------------------------------------------------------
ARTIFACT:        <what came in>
CLASSIFICATION:  <CLASS>
ACTION TAKEN:    <terse>
ROUTED TO:       docs/<folder>/   <note fallback if used>

--------------------------------------------------------------------------------
02 // CHECK A        03 // BUILD        04 // CHECK B (gate)
--------------------------------------------------------------------------------
COMMAND               A        B
-------               --       --
<check cmd>           PASS     PASS
BUILD:                <build cmd> -> OK | FAIL
GATE:                 GREEN | RED->loop(N) | RED->PLAN B | ABORT
FIX LOG:              <one line per fix, if any>

--------------------------------------------------------------------------------
05 // FILES CHANGED
--------------------------------------------------------------------------------
PATH                                          STATUS
<path>                                        ADDED | MODIFIED | MOVED

--------------------------------------------------------------------------------
06 // SELF-ASSEMBLY
--------------------------------------------------------------------------------
LEDGER:      appended
LEXICON:     <N reused, M minted>  rev <R>
DOCTRINE:    <clauses touched/folded>  rev <R>
WORDS:       <this report> (median <M>) — trend <↑|↓|=>

--------------------------------------------------------------------------------
07 // PUSH
--------------------------------------------------------------------------------
COMMIT:      BENCHMARK: <classification> — <summary> [VM]
HASH:        <short hash>
TAG:         benchmark-YYYYMMDD-NN
PUSH:        <remote/branch> PUSHED | DEFERRED (remote unreachable) | SKIPPED (red)

--------------------------------------------------------------------------------
08 // POST-PUSH VERIFICATION
--------------------------------------------------------------------------------
RESULT:      GREEN | RED
NOTES:       <for the next session>

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-SR-YYYYMMDD-NN
================================================================================
```

---

## FIRST-RUN BOOTSTRAP

If `docs/benchmark/` lacks the three files, create them:
- `LOT-LEDGER.md` — header comment only (the index spine; append-only forever).
- `LOT-LEXICON.md` — column header `TOKEN  MEANING  REV  SINCE`; seed ONLY with
  tokens already recurring in existing repo docs — invent no starting vocabulary.
- `LOT-DOCTRINE.md` — `# LOT-DOCTRINE  rev A`, no clauses yet.

Then before the first real Benchmark, anchor the rollback lattice once:
`git tag benchmark-$(date -u +%Y%m%d)-00 && git push --tags`

---

## SHIP MODE (self-assembly routine merge)

Triggered by S-2 with **"Ship [feature]"** (e.g. "Ship LOT Mail", "Ship Basics
Tab", "Ship Calendar Alerts"). Ships a feature from a development branch to
master via a staging branch, green-gated by the full 00-08 pipeline.

### SHIP PIPELINE

```
S0  READ MANIFEST     Read docs/benchmark/LOT-MANIFEST.md, find BEST iteration
S1  FETCH             git fetch origin <best-branch>
S2  STAGING           git checkout master && git pull && git checkout -b staging
S3  CHERRY-PICK       git cherry-pick <hash(es)> from the BEST branch
S4  RESOLVE           If conflicts, resolve; if unresolvable, abort and report
S5  GREEN GATE        Run full 02-04 (CHECK A → BUILD → CHECK B)
S6  REPORT            Write session report with CLASS: SHIP
S7  MERGE             git checkout master && git merge staging
S8  PUSH + TAG        git push origin master --follow-tags
S9  CHECK C           Post-push verification
S10 UPDATE MANIFEST   Mark feature SHIPPED in LOT-MANIFEST.md, commit + push
```

### CARDINAL RULES (Ship Mode)

1. **Master is never touched while any check is red.** Staging is the buffer.
2. **Cherry-pick, don't merge branches.** Feature branches carry history that
   may conflict with other shipped features. Cherry-pick gives per-commit control.
3. **One feature per ship.** Don't batch multiple features into one staging pass.
   Each feature gets its own report, its own green gate, its own merge commit.
4. **MANIFEST is the source of truth.** Only ship branches marked BEST in the
   manifest. If the manifest doesn't have it, scan the branch first and add it.
5. **Staging is disposable.** If the green gate fails and the fix is non-trivial,
   delete the staging branch and report. Don't accumulate fixes on staging.
6. **The ship branch stays.** Never delete a shipped feature branch — it's the
   provenance record. Only prune branches marked SUPERSEDED after S-2 confirms.

### SHIP REPORT TEMPLATE

Use the standard report template with these modifications:
- `CLASS: SHIP` (not ENGINEERING/CORPORATE/etc.)
- INTAKE block shows: source branch, cherry-picked hashes, feature summary
- FILES CHANGED shows the diff against master (not the feature branch diff)

### MANIFEST UPDATE

After successful ship, update `docs/benchmark/LOT-MANIFEST.md`:
- Change the feature's STATUS from BEST to SHIPPED
- Add the merge commit hash
- Append a line to the LEDGER with `CLASS: SHIP`

---

## HONEST BOUNDARIES (read before trusting this unattended)

The mechanical loop — preflight, checks, build, green-gate, report, rollback, tag
— is deterministic and safe to run for years. The compression mechanism really
does grow a controlled vocabulary, densify doctrine, and track a countable
word-count trend. That is the durable asset.

It does NOT, on its own, produce genuine machine philosophy or a true new
language. If novel structure emerges from the notation, record it plainly as an
observation marked `PROVISIONAL`; do not dress it up. And intake/classification
is judgment, not mechanism — keep S-2 in view there. The correct shape is a
machine autonomous on the deterministic 90% and a human present for the 10% that
is judgment. That is not a limitation to engineer away; it is the design.
