# LOT® AI — Daily Ecosystem Review · 2026-11-14

> LOT® AI · Self-care, delivered.™
> Scheduled routine run · branch `claude/practical-galileo-qj99jp` · baseline: review of 2026-11-13 (`claude/practical-galileo-anl7n9`)

---

## 0. Source status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | **BLOCKED** (DNS not resolved; outside the session's allowed network domains) |
| https://lot-systems.com/about | **BLOCKED** (same) |
| https://brand.lot-systems.com | **BLOCKED** (same) |
| GitHub `LOT-Systems/LOT-Computer` (master, PRs, all remote branches) | OK |

**Action required:** add `lot-systems.com`, `institute.lot-systems.com` and `brand.lot-systems.com` to this
environment's allowed network domains (https://code.claude.com/docs/en/claude-code-on-the-web).
Nothing below comes from the websites. Every daily run since early August has been blocked the same way.

---

## 1. Repository state

- `master` HEAD is still `98971f2` (PR #96, 2026-08-05). That makes **101 days with no merge.**
- Open PRs are unchanged: **#97** (LOT-WIKI-v88 · Badge v32, last updated 2026-10-24) and **#93** (calendar time tracking, last updated 2026-08-05).
- **Correction to yesterday's review:** that review said engineering had paused. It hadn't. The work is happening on unmerged `claude/*` branches. In the last 24 hours, 16+ branches were pushed, and none of them have a PR.

## 2. Key updates (unmerged branches, last ~24h)

| Area | Branch | What changed |
|---|---|---|
| **QIE / Field Manual (furthest ahead)** | `quantum-engine-widgets-RgFfC` (80 commits ahead of master) | LOT-WIKI-v111 · FM v134 · QIE 182 patterns · 72 archetypes · 69 jobs · 226+ dep nodes. **Badge v47 THE NATURE SIGNAL: 1,277 badges**, 37 Word Turn engines, 444 trigger words. Level 17 "Fourth Cycle Deepening". Day 1173+ · COSMO® 865 |
| QIE (parallel line) | `upbeat-curie-8cgt9y` | QIE v114 · P152–P155 (COHI-SEAL, LONGLK, ADAPRES, RENAIS) · Arch52 · J49. Built from master, so it **conflicts with the v134 line** |
| Badges (parallel line) | `cool-hypatia-b603z6` | v33 THE DREAM CODEX, 812 → 843 (Word Turn v23 depth psychology, Secret Boss v20) |
| Assembly | `fervent-knuth-hja0il` | Re-does LOT-WIKI-v88 / Badge v32 sync on master (duplicates PR #97) |
| **LOT® Email v1** | `determined-turing-nyg1it` | `/email to Name` compose in Log, inbox in Sync, Cohort Connect Email. Builds pass. The branch's report says about **25 earlier runs rebuilt this feature without merging it** |
| **BASIC ration (LOT-FM-001)** | `beautiful-johnson-b9em02` | New Basics tab plus a `basic-subscription` model and migration `20261114000001`. Moves an admin endpoint behind admin-api and whitelists intake fields |
| Calendar v2 | `dreamy-babbage-b1qdkh` | Alert engine (T-15 STANDBY / T-00 ALERT), `GET /api/calendar`, ownership check on `PUT /api/logs/:id`. Replaces the stale PR #93 |
| Log commands | `youthful-ritchie-t3gz5h` | `/system` registry, scoped `/story [day/week/month/year]`, `/arcade`. Removes the user's email from the `/story` server log |
| Astrology v2 | `practical-curie-gzqkdy` | Rokuyo now changes at local midnight instead of UTC; shared `getAstrologyReading`; Logs resonance |
| Widget health | `charming-albattani-k9nmh0` | MonthlyPulse fixed (`joinedAt` was missing, so the month counter always read 0); System tail widgets lazy-mounted |
| Design / corporate | `elegant-mendel-8cknps` | *The Usership Year*: a 12-month evolution spec from barebone to LOT® AI |
| QI·46 | `cool-tesla-924mky` | S5 Being Profile storage codec |
| Hardware | `brave-lamport-1yiovy`, `tender-turing-cjpwpx` | LOT Pager S0 (BOM, specs, PDFs); CUBIQ Quantum Cube v.0 R05 |

The repo has no artefact named "LOT® AI programming language". The closest things are the QIE pattern/archetype grammar, the Word Turn lexicon engines and the new `LOG_COMMANDS` registry.

## 3. Design System · COSMO® Style · brand

- brand.lot-systems.com is unreachable, so it was **not reviewed**.
- In the repo, no brand-standard files changed. The only design-side doc today is *The Usership Year* (`docs/corporate/LOT-USERSHIP-12-MONTH-EVOLUTION.md`, unmerged).

## 4. The flow puzzle: Coffee → Widget → Subscription → Design System → Style → Community

| Step | Where it lives | Change today |
|---|---|---|
| Coffee | Onboarding options (Tea/Coffee/Water/Light breakfast), Fuel Protocol badge | None |
| Widget | System-tab widget stack | MonthlyPulse fix and lazy-mount (unmerged) |
| **Subscription** | `SubscribeWidget` | **New:** `basic-subscription` model and migration in the BASIC ration branch. This is the first server-side subscription data model, so the "Subscription" step is becoming real |
| Design System | brand site (blocked) | Not reviewed |
| Style | COSMO® Style (blocked) | Not reviewed |
| **Community** | Sync, CohortConnect, CollectiveConsciousness | **New:** LOT® Email v1 adds person-to-person mail in Sync and Cohort Connect (unmerged) |

**How I read the puzzle:** a daily act (coffee, the first signal of the day) shows up as a widget signal. The widget converts the user to a subscription (now BASIC ration). Subscribers receive the design system, the design system shows up as COSMO® style, and that style is what the community shares (now with email between members). In short, a single self-care act becomes membership.

**LOT® Robot Persons™:** the term still appears nowhere in the code or docs, on any branch. The closest capabilities are the Robot Node (6th ecosystem device), the COSMO® robotics vision and the new hardware lines (Pager S0, CUBIQ).

## 5. Flags: what affects current projects and integrations

1. **⚠ CRITICAL bug on master.** `src/client/stores/intentionEngine.ts:3332` uses `dayMs` inside `analyzeIntentions()`, where it is never declared. I checked this today: there is no declaration in L258–3465. Whenever there is at least one signal, it throws a `ReferenceError`. The 5-minute cooldown never starts, so the scan reruns on every call, and on the System tab (`System.tsx:377`) the error happens during render. The fix is one line: `const dayMs = 24 * 60 * 60 * 1000` (report: `brave-rubin-qd8lfh`). The build didn't catch it because the client is bundled with esbuild only and `src/client` is never type-checked.
2. **⚠ Merge backlog and version fragmentation.** Master is at Badge v31 docs / FM v113. One branch is at Badge v47 / FM v134, while other branches keep building v32/v33 and QIE v114 from master, which conflicts with v134. Decide on one canonical line (probably `quantum-engine-widgets-RgFfC`) and merge it, or the numbering will keep forking.
3. **Duplicated work.** Email v1 has reportedly been rebuilt about 25 times, and v88 assembly exists both in PR #97 and in `fervent-knuth-hja0il`. Scheduled routines are re-doing unmerged work every day.
4. **Security fixes waiting to merge.** Ownership check on `PUT /api/logs/:id` (calendar v2), an admin-only issue-advance endpoint (Basics), and the user's email removed from the `/story` log.
5. **DB migration pending.** `20261114000001_add-basic-subscriptions` will need a migration run when Basics merges.
6. **PR #93 is superseded** by `dreamy-babbage-b1qdkh`. Close it or replace it.
7. **Website sources are blocked** (see §0).
8. **These daily reviews are scattered too.** Each run pushes to a new `practical-galileo-*` branch, so earlier reviews never reach master.

---
*Next review: 2026-11-15.*
