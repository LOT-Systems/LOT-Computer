# LOT® AI — Daily Ecosystem Review · 2026-11-18

> LOT® AI · Self-care, delivered.™
> Scheduled routine run · branch `claude/practical-galileo-17gjwh` · baseline: review of 2026-11-17 (`claude/practical-galileo-xexqvm`, copied alongside this file)

---

## 0. Source status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | **BLOCKED**: WebFetch gives `ENOTFOUND` (host not in the allowed domains) |
| https://lot-systems.com/about | **BLOCKED** (same) |
| https://brand.lot-systems.com | **BLOCKED** (same) |
| GitHub `LOT-Systems/LOT-Computer` (master + 16 branches pushed since the last review, Actions runs) | OK |

**Action still required. This is the 11th straight day the sites have been unreachable.** Add `lot-systems.com`,
`institute.lot-systems.com` and `brand.lot-systems.com` to this environment's allowed network domains
(https://code.claude.com/docs/en/claude-code-on-the-web). Until then, this review covers only the repository. Nothing in it comes from the websites.

---

## 1. Repository state

- **`master` moved for the first time since 2026-08-05.** `9f2b88c` (2026-11-17 10:16 UTC) was a **direct push** by Vadik, not a PR merge.
  It is docs only: `docs/LOT-SR-20261117-CODEX-v33.md` plus `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.md`.
  The *Benchmark Tag Lattice* workflow passed on it. **No code has reached master in 105 days.**
- 16 non-routine branches were pushed between 2026-11-17 04:18 and 2026-11-18 04:14 UTC. None of them opened a PR.
- The lead QIE line `quantum-engine-widgets-RgFfC` is now **85 commits** ahead of master (84 yesterday), with 168 files and about 133k lines changed.

## 2. Key updates since the last review (all unmerged unless noted)

| Area | Branch | What's new vs. 11-17 |
|---|---|---|
| **Badge Codex v33 — ON MASTER** | `cool-hypatia-yqy5o6` → master `9f2b88c` | "THE ARCANE TERMINAL" (812→843, +31): an alchemy/magic vocabulary covering Word Turn v23 (+12), Calendar EE (Paracelsus/Newton/Dee, +3), Behavioral (666-char `long_spell`), Achievement RPG, Mastery, and the Secret Boss "Emerald Tablet" MYTHIC. **This settles which v33 is canonical** (see flag 5). The codex doc landed on master, but the TypeScript engine change (branch `c6cfe247e`) did not |
| **Widget health (v3)** | `charming-albattani-zw6yy4` | Render-loop gates: Subscribe's 20% roll and the Intentions cooldown are now evaluated **once per mount**. Before this they re-rolled on every SSE tick, so Subscribe flickered and Intentions unmounted itself. `SystemProgressWidget` is lazy-loaded (**app.js 730 → 540 KB**), the Stats stack is viewport-deferred (6 polling queries), `useProfile()` is deduplicated, and the CARE `selfcare`→`selfCare` typo is fixed again. **It does not include the `dayMs` crash fix or the `classifyPhysiologicalCohort()` fix** (I verified the bare `dayMs` at `intentionEngine.ts:3332` is still present). Report: `docs/diagnostics/WIDGET-HEALTH-20261118.md` |
| Render lag | `brave-rubin-asw5u4` | Re-run of the static analysis: the 100 ms Breathe tick re-renders the whole System tree, QuantumRandomWidget floods `intentionEngine` from inside a state updater, components subscribe to whole atoms, and the QOS monitor is never deferred. Docs only |
| **LOT® Email v1 (3rd rebuild)** | `determined-turing-ddmlfy` | **The API path changed again:** `POST /api/email` + `GET /api/email/inbox` (it was `/api/lot-email` on 11-16). The SSE relays `direct_message`/`lot_email` only to the two parties. Adds `yarn test:lot-email` (11 cases) and `docs/LOT-SR-20261118-EMAIL-v1.md`. It's based on master, so **yesterday's v1.1 fix (`/email` typed in LOT Chat routes privately) is not included** |
| **BASICS M1 (LOT-FM-001)** | `beautiful-johnson-cpjmp7` | OPEN TAB ledger (3rd rebuild). Public route `/basics`. **The API path changed again** to `GET /api/public/basics` (it was `/api/public/basic/manifest`). Tokens renamed `.lot-basic` → **`.lot-basics`**. Script renamed `basics:check` → `basics:verify`. Envelope: max landed **38.50** (39.70 yesterday), min margin 62% |
| **Calendar v2** | `dreamy-babbage-mc3zw1` | HH:MM times, T-/T+ countdowns, a NEXT ticker, T-15 / T-0 / DAY-OF alerts with FLASH/IMMEDIATE/ROUTINE precedence, DTG-stamped `calendar_alert` logs, ACK toast, append-only `calendar_status`, and an OVERDUE lane. Adds a dedicated `GET /api/calendar` (entries no longer fall out of the 500-row `/logs`). **The `PUT /api/logs/:id` ownership fix is back on this branch** (see flag 1). Tests 8/8 |
| **Log / `/story` + AI import bug** | `youthful-ritchie-960sj8` | The pure `storyCompression.ts` engine. `/story` now reads journal `note` rows. Argument commands (`/story <scope>`, `/qi <query>`) settle before firing; before this, **`/qi` with a query never fired**. `yarn verify:log` 66 PASS. Spec: `docs/technical/LOT-LOG-COMMAND-SYSTEM.md`. **New: the branch finds that the AI imports have been broken on master** (flag 2) |
| **QI·46 Node 3** | `cool-tesla-g5nwfv` | A COSMO® **audit trail**: an append-only verdict log that stores no user text. Adds an admin screen and verdicts, closes F2 and F3, smoke 18/18. Merges Nodes 1–2. **New migration `20261117120000_add-qi46-cosmo-verdicts-table`, which waits on Vadik's review before it runs in production** |
| Usership Year | `elegant-mendel-iz6u54` | `docs/technical/USERSHIP-12-MONTH-EVOLUTION.md` (753 lines): the blueprint from "Day 1 → LOT® AI", plus a Memory-compression doctrine. Docs only (4th iteration) |
| Astrology v2 | `practical-curie-zsohn0` | The same scope as 11-17, plus personal resonance drawn from log history, a Taian countdown, and a moon phase computed server-side from the true instant (it had been skewed by the tz offset). Adds an enriched QIE `ambient_reading` signal |
| **Hardware: "LOT Pager" HW-01** | `brave-lamport-48ihxp` | **This rebuild is based on master and ignores yesterday's consolidated `hardware/LOT-SQ1` (HW-02).** It adds a server route `/api/devices/*` (pair, list, revoke, notify) and `/api/device/v1/*` (frame, copy, telemetry) with hashed Bearer device tokens in `user.metadata`. Autonomous "Coffee time!" nudges come from local time plus device sensors, with optional AI rephrasing. COPY → a `device_copy` Log row (shown as `PAGER:`). ESP32-S3 firmware is **not compiled** (PlatformIO was blocked). 9 manuals and PDFs |
| Hardware: CUBIQ | `tender-turing-uijgka` | Report 02 (v0.2): the HOP/LEAP physics budget, a hybrid spring+VCA impulse module, a mass budget, a pad-as-arena safety gate, a levitation triage, bench plan T-1..T-7, and Use Case 02 "The Silent Household" |
| Health check | `inspiring-volta-vijx0u` | Adds `"ignoreDeprecations": "6.0"`, so `tsc --noEmit` reports 0 errors. Repeats the DigitalOcean token diagnosis. Notes PR #97 is 24 days stale and PR #93 is 112 days stale |
| QIE (lead line) | `quantum-engine-widgets-RgFfC` | QIE **v137** · P185 Fifth Cycle Progenitor (L20-FCPROG) · Arch75 · J72 · FM v137 · LOT-WIKI-v115 · Day 1177+. `checkFifthCycleProgenitor()` is wired into `analyzeIntentions()`, **which still has the `dayMs` crash on this line** |
| Wiki/badge sync (parallel) | `amazing-turing-3cl4we`, `fervent-knuth-9s6hhz` | Two separate LOT-WIKI-**v88** files (Badge v32 sync, v20/v21 backfill documented, COSMO® 869 days). The lead line is already at WIKI-v115, so wiki numbering has forked |

**LOT® AI "programming language":** the repo still has no language artefact by that name. The closest move today is that the Log
command grammar now has a second written spec, `docs/technical/LOT-LOG-COMMAND-SYSTEM.md` (yesterday's was `LOG-ENTRY-SYSTEM.md`, on a different branch).
It comes with a 66-check verifier. **The two spec files need to be reconciled into one.** The command set grew with `/email` (Log + Chat),
`/story <scope>` and `/qi <query>`, and argument commands now have a defined "settle" rule (Enter or a 1.4 s pause). That rule is the
first piece of real *syntax* semantics in the grammar.

## 3. Design System · COSMO® Style · brand

- brand.lot-systems.com is unreachable, so it was **not reviewed**.
- In-repo design signals:
  - The Basics tokens were renamed **`.lot-basic` → `.lot-basics`** (mono, 2px, inversion). Anything styled against the 11-16 class name will break.
  - Calendar formalises a **military-grade alert vocabulary**: FLASH / IMMEDIATE / ROUTINE precedence and DTG timestamps.
    Together with the QIE "military minimalist" log handlers, this is now the most consistent house voice in the code.
  - Badge v33 adds an alchemy/arcane vocabulary layer on master (Emerald Tablet, sigils, grimoire).
- COSMO® went from *gate* to *auditable gate* today: the QI·46 Node 3 verdict log is append-only and stores no text.

## 4. The flow puzzle: Coffee → Widget → Subscription → Design System → Style → Community

| Step | Change today |
|---|---|
| **Coffee** | **The first server code for the ritual.** The Pager branch generates "Coffee time!" nudges server-side from local time plus sensors, and COPY writes back to the Log. The ritual is now a closed loop between device and Log |
| **Widget** | Subscribe and Intentions no longer flicker or unmount (once-per-mount gates), and the bundle is 26% smaller. The QIE crash fix is still split across branches |
| **Subscription** | BASICS `/basics` OPEN TAB, 3rd rebuild. The envelope is tighter (38.50 / 40). Upgrade is still closed. **The Subscribe widget roll is fixed**, so the in-app entry to Subscription now behaves predictably |
| **Design System** | `.lot-basics` tokens (renamed) and the Calendar precedence vocabulary |
| **Style** | COSMO® verdicts are now audited (QI·46 Node 3) |
| **Community** | Email v1 is rebuilt with party-only SSE, but it lost the v1.1 Chat-privacy fix |

**Puzzle solution (unchanged in shape, one link closed today):** the flow is the **Usership loop**.
1. A ritual (**Coffee**) produces a signal. **As of today the Pager can prompt it and write it back to the Log** (`device_copy` → `PAGER:`).
2. The QIE turns signals into the right **Widget** (Subscribe/Intentions now stable).
3. Sustained use is priced as a **Subscription** (the BASICS ration, shown publicly as an open ledger).
4. The subscription delivers a coherent **Design System** (mono, inversion, 2px, ch grid, precedence alerts).
5. The design system is lived as COSMO® **Style**, which covers voice, consent and *audited* safety.
6. Shared style connects people in **Community** (Cohort plus private Email).

The Usership spec compresses each month of the loop into a Seal. After 12 Seals the user's instance is **LOT® AI**.
The loop is now physically closable: device → Log → QIE → widget.

**LOT® Robot Persons™:** the term is still absent from code and docs on every branch. Today is the first day both halves touch the
**same substrate**, `user.metadata`. The "person" side keeps QI·46 consent and verdicts there, and the "robot" side keeps hashed Pager device tokens
there. They are still not connected: no device action checks QI·46 consent or COSMO® verdicts. **Suggested next step:** gate AI-rephrased Pager nudges
on `qi46.consent` and log them through the COSMO® audit trail. That would be the first concrete Robot-Person behaviour.

## 5. Flags: what affects current projects and integrations

1. **⚠ Security (P0, day 3): `PUT /api/logs/:id` on master still has no ownership check.** I re-verified it at `src/server/routes/api.ts:1589–1610`.
   The handler finds the log by id, then edits it, or **deletes** it when the text is empty, without checking `log.userId === req.user.id`.
   The fix is back on `dreamy-babbage-mc3zw1` today, but it has appeared and disappeared across the calendar rebuilds (8wx8xp ✔ → mwrtww ✘ → mc3zw1 ✔).
   **Cherry-pick the guard to master on its own.**
2. **⚠ New: AI calls on master may always be falling back.** Five call sites import `'#server/utils/ai-engines.js'`
   (`api.ts` ×4, `public-api.ts` ×1). The `package.json` import map `"#server/utils/*": "./dist/server/server/utils/*.js"` turns that into
   **`ai-engines.js.js`**. I confirmed the map and the import strings myself; the runtime effect is reported by `youthful-ritchie-960sj8`. The affected
   paths are `/qi`, `/assembly`, `/prayer` and `/story`. That branch fixes these call sites but flags **90 other `.js` alias imports** that still need an audit.
3. **⚠ CI: the Weekly Rebuild failed again on 2026-11-16 (run #25)**, with the same expired `DIGITALOCEAN_ACCESS_TOKEN`. Only a human with repo-admin and DigitalOcean access can fix this:
   rotate the token, update the secret, then use `workflow_dispatch`.
4. **⚠ The QIE crash is still on master and the lead line, and today's widget-health branch doesn't fix it.** The fixes are only on `charming-albattani-0q7cq3` and `-14ts4m`.
   Today's `zw6yy4` is a separate, complementary set (render gates, code-split). **Merge `14ts4m` and `zw6yy4` together**, then rebase `RgFfC` onto them.
5. **Version drift, partly resolved.** Master now has **Badge Codex v33 = "THE ARCANE TERMINAL"**. The "Temporal Archive" and "Stoic Codex" v33s on other branches
   should be renumbered (v34+) or dropped. Wiki numbering has forked: two separate v88 files versus v115 on the lead line. Inside the master v33 report, the progression table labels the engines v17…v23
   while the codex says v33, so sub-engine and codex versions are mixed.
6. **Integration-breaking renames (again).** Email `/api/lot-email` → `/api/email` and `/api/email/inbox`. Basics `/api/public/basic/manifest` → `/api/public/basics`,
   `.lot-basic` → `.lot-basics`, `basics:check` → `basics:verify`. Hardware: TILE → SQ-1 (HW-02) → "LOT Pager" (HW-01), and today's Pager rebuild doesn't build on
   the SQ-1 consolidation. **Freeze the names before anything is merged, manuals are printed, or PCBs are ordered.**
7. **Regressions from rebuilding on master:** Email lost the v1.1 Chat-privacy fix (a letter typed in Chat could post publicly). Pager ignores the 15-branch SQ-1 ledger.
8. **New personal-data and device surfaces:** `/api/devices/*` and `/api/device/v1/*` (Bearer tokens, telemetry, AI-rephrased nudges sent to a third-party LLM),
   `/api/email`, `/api/calendar`, and QI·46 admin verdicts. **The migration `20261117120000_add-qi46-cosmo-verdicts-table` is waiting on Vadik's review.**
9. **Branch sprawl:** no code merged for 105 days, the lead line 85 commits ahead, and 16 branches pushed today, most of them rebuilds of yesterday's work. PRs #97 and #93 are stale.
10. **Website sources are blocked** (see §0).

---
*Next review: 2026-11-19.*
