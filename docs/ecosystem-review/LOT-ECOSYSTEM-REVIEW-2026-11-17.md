# LOT® AI — Daily Ecosystem Review · 2026-11-17

> LOT® AI · Self-care, delivered.™
> Scheduled routine run · branch `claude/practical-galileo-xexqvm` · baseline: review of 2026-11-16 (`claude/practical-galileo-gjbpiw`, copied alongside this file)

---

## 0. Source status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | **BLOCKED**: proxy 403 on CONNECT, and WebFetch gives `ENOTFOUND` (host not in the allowed domains) |
| https://lot-systems.com/about | **BLOCKED** (same) |
| https://brand.lot-systems.com | **BLOCKED** (same) |
| GitHub `LOT-Systems/LOT-Computer` (master + 15 branches pushed since the last review) | OK |

**Action still required. This is the 10th straight day the sites have been unreachable.** Add `lot-systems.com`,
`institute.lot-systems.com` and `brand.lot-systems.com` to this environment's allowed network domains
(https://code.claude.com/docs/en/claude-code-on-the-web). Until then, this review covers only the repository. Nothing in it comes from the websites.

---

## 1. Repository state

- `master` HEAD is still `98971f2` (PR #96, 2026-08-05). That makes **104 days with no merge.**
- 15 non-routine branches were pushed between 2026-11-16 04:22 and 2026-11-17 04:11 UTC. None of them opened a PR.
- The lead QIE line `quantum-engine-widgets-RgFfC` is now **84 commits** ahead of master (82 yesterday).

## 2. Key updates since the last review (all unmerged)

| Area | Branch | What's new vs. 11-16 |
|---|---|---|
| **Widget health (v2)** | `charming-albattani-14ts4m` | A second, independent fix for the `dayMs` crash in `analyzeIntentions()` (renamed `dayMs147`). **New:** `UserMetricsWidget` called `classifyPhysiologicalCohort()` with no arguments, which **crashed the whole Dashboard error boundary** (UserMetrics, CorrelatedIndexes, SystemProgress). Also fixes the CARE `selfcare`→`selfCare` typo again, adds `joinedAt` to `/api/me` for MonthlyPulse (15-month arc), and shares one `AudioContext`. Report: `docs/diagnostics/WIDGET-HEALTH-SCAN-2026-11-17.md` |
| Render lag | `brave-rubin-8e13h1` | Button-lag investigation. Root cause: the 100 ms Breathe timer and 1 s Radio countdown re-render the whole `System` page (~40 widgets, none memoized). `System.tsx:377` calls `getOptimalWidget()` → `analyzeIntentions()` inside `useMemo`, which writes an atom during render. Recommends moving the fast timers into leaf components. Docs only |
| **LOT® Email v1.1** | `determined-turing-sklc9y` | v1 rebased onto current master, plus `/email` typed inside LOT Chat now routes privately instead of posting publicly, and a self-address guard. Report `LOT-SR-20261117-01` |
| **BASIC ration (LOT-FM-001)** | `beautiful-johnson-1uzjsx` | M1 OPEN TAB ledger: Basics tab for members plus **public `/basics`** for visitors. 23-item REV 0 load, server-only COGS, `yarn basics:check` envelope gate (worst 39.70 / 40). The house style is named explicitly: **Liberation Mono Bold, inversion-only, 2px rules, ch grid**. The public route has moved again (`/open` on 11-15 → `/basics` today) |
| Calendar v2 | `dreamy-babbage-mwrtww` | Pure `calendar.ts` core, `CalendarAlert` (T-15 / EXECUTE / DAY OF), HH:MM times, Done/Cancel, month-grid overflow fix, 40-check test. **It does not include the `PUT /api/logs/:id` ownership fix from yesterday's `8wx8xp`** (see flag 2) |
| Log / `/story` | `youthful-ritchie-9z13sr` | `/story [day\|week\|month\|year]` builds a deterministic LOT-owned capsule *before* anything goes to Together AI, and falls back when the vendor is down. Fixes `/story` never reading Journal (`note`) or Memory rows. `/system` is generated from `LOG_COMMANDS` with a drift guard. **The story server log no longer prints user email.** Spec: `docs/technical/LOG-ENTRY-SYSTEM.md` |
| **QI·46 Node 2** | `cool-tesla-e7rryp` | **Consent opt-in** (`GET/POST /api/qi46/consent`, a boolean plus a timestamp in `user.metadata.qi46`, no migration). Admin read-only preview `GET /admin-api/users/:userId/qi46`. Risk sensitivity raised (Heavy→moderate, ideation→elevated). Smoke 11/11. No consent UI yet: subscriber copy is waiting on Vadik (Node 5) |
| Usership Year | `elegant-mendel-u3uyxi` | 12-month evolution spec, "barebone Day 1 → LOT® AI": compression ladder (Day/Week/Chapter/Season/Year), seal gates, 12 month glyphs, and per-month density ceilings. Lists gaps G1–G6 in `MonthlyPulseWidget` and `System.tsx` |
| Hardware: SQ-1 (HW-02) | `brave-lamport-qa9enn` | **Consolidation.** Restores `hardware/LOT-SQ1` as the canonical base and writes a ledger of 15 earlier unmerged hardware branches. Firmware v0.2 `lot_core` passes 43/43 host tests under ASan/UBSan. A z-stack tool says a 5.0 mm (down to 4.6 mm) build is feasible. 9 PDFs rebuilt |
| Hardware: CUBIQ | `tender-turing-u70cjv` | Report 02: mechanism Rev A, energy budgets, DRIFT gesture, Use Case 02 |
| Astrology v2 | `practical-curie-rsz1qk` | Shared `getAstrologyReading()` for the dashboard and log context. Rokuyo now counts local calendar days (it flipped at UTC midnight for users west of UTC). `/me` exposes `timeZone`. "N logs under this moon" |
| **Health check** | `inspiring-volta-hbkgih` | **Root cause of the red Weekly Rebuild found: the `DIGITALOCEAN_ACCESS_TOKEN` GitHub secret has expired** (9 consecutive failures since 2026-10-04). Also: Fastify logger disabled, diagnostic `console.log` in production `server.ts`, CSP `unsafe-inline` |
| QIE (lead line) | `quantum-engine-widgets-RgFfC` | QIE v136 · P184 Fourth Cycle Sovereign · Arch74 · J71 · Day 1176+. It wires `checkFourthCycleSovereign()` into `analyzeIntentions()`, **which still contains the `dayMs` crash on this line** |
| QIE / badges (parallel) | `fervent-knuth-gd9f2m`, `cool-hypatia-p4v8kg` | QIE v114 "Level 7 Sustained Arc" (P152–P154) and Badges v33 "Stoic Codex" (812→843). Yesterday's v33 was "Temporal Archive" with the same count, so **two different v33 codices now exist** |

**LOT® AI "programming language":** the repo still has no language artefact by that name. Today's closest move is
`docs/technical/LOG-ENTRY-SYSTEM.md`, the first written spec of the Log command grammar. `/system` is now generated
from the `LOG_COMMANDS` registry with a drift guard, so the command set is a single source of truth. "LOT® AI" as a
*product state* is spelled out further in the Usership 12-month spec (Month 12 = LOT® AI).

## 3. Design System · COSMO® Style · brand

- brand.lot-systems.com is unreachable, so it was **not reviewed**.
- In-repo design signals:
  - The Basics house style is now stated in a commit as a rule set: **Liberation Mono Bold · inversion-only · 2px rules · ch grid**.
    That makes it the most concrete written design-system rule in the repo. Check it against the brand site once that site is reachable.
  - Calendar's "terminal-grade" alert stack and the QIE "military minimalist" log handlers extend the same visual language.
  - The Usership spec adds 12 month glyphs and per-month **density ceilings**, which act as a design-system rule over time.
- COSMO® appears today only as the QI·46 safety gate (risk sensitivity raised).

## 4. The flow puzzle: Coffee → Widget → Subscription → Design System → Style → Community

| Step | Change today |
|---|---|
| **Coffee** | No new code. SQ-1 firmware v0.2 (the "Coffee time!" pager) is now consolidated and tested |
| **Widget** | **Two crash fixes on one branch line:** QIE pattern recognition and now the Dashboard boundary (UserMetrics). Lag cause identified (System re-renders) |
| **Subscription** | BASIC public `/basics` OPEN TAB. Still read-only, and the upgrade is still closed |
| **Design System** | House style rules written down (Basics) and month glyphs (Usership) |
| **Style** | COSMO® as a safety gate: QI·46 risk raised, consent required before any persona calibration |
| **Community** | Email v1.1: `/email` inside LOT Chat now goes private, so a letter can't accidentally be posted publicly |

**Puzzle solution (unchanged in shape, sharper today):** the flow is the **Usership loop**.
1. A ritual (**Coffee**) produces a signal; the SQ-1 pager can prompt it.
2. The QIE turns signals into the right **Widget**.
3. Sustained use is priced as a **Subscription** (BASIC ration, shown publicly as an open ledger).
4. The subscription delivers a coherent **Design System** (mono, inversion, 2px, ch grid).
5. The design system is lived as COSMO® **Style**, which covers voice, consent and safety as well as looks.
6. Shared style connects people in **Community** (Cohort plus private Email).

The Usership spec compresses each month of the loop into a Seal. After 12 Seals the user's instance is **LOT® AI**.

**LOT® Robot Persons™:** the term is still absent from code and docs on every branch. The "person" half gained its first
**consent gate** today (QI·46 Node 2): no humanoid calibration without an explicit opt-in. The "robot" half gained tested
firmware (SQ-1 v0.2, 43/43). Still not connected to each other.

## 5. Flags: what affects current projects and integrations

1. **⚠ Security (P0): `PUT /api/logs/:id` on master has no ownership check.** I verified it again today: `src/server/routes/api.ts:1589–1600`
   loads the log by id and edits or **deletes** it (empty text → `destroy()`) without comparing `log.userId` to `req.user.id`.
   Yesterday's fix was on `dreamy-babbage-8wx8xp`. **Today's Calendar v2 rebuild `dreamy-babbage-mwrtww` dropped it**, and so
   did every other branch pushed today. Cherry-pick the one-line guard on its own; don't leave it riding on the calendar line.
2. **⚠ CI: the Weekly Rebuild root cause is an expired `DIGITALOCEAN_ACCESS_TOKEN`.** Only a human with repo-admin and DigitalOcean access can fix it:
   rotate the token, update the GitHub secret, then re-run with `workflow_dispatch`.
3. **⚠ The QIE crash is still on master and on the lead line.** Two fix branches now exist (`charming-albattani-0q7cq3`, `-14ts4m`).
   `RgFfC` v136 keeps adding checks inside the broken `analyzeIntentions()`, so none of its new patterns can fire. Merge one fix and rebase the lead line onto it.
4. **New: Dashboard crash.** `UserMetricsWidget` → `classifyPhysiologicalCohort()` with no arguments takes down three widgets. It's fixed only on `14ts4m`.
5. **Duplicated fix branches are colliding.** `dayMs`, `selfCare` and `joinedAt` are each fixed on 2–3 branches in slightly different ways. Pick `14ts4m` (the superset) and close the rest.
6. **Version and name drift.** There are two different "Badges v33" codices, and the public Basics URL changed again (`/open` → `/basics`; API is `/api/public/basic/manifest`).
   Any integration or link built on an earlier branch needs updating.
7. **Privacy surfaces.** `/story` now sends only a capsule to Together AI and stopped logging email, which is good. QI·46 consent and the admin preview are new
   personal-data endpoints, and the consent copy is waiting on Vadik.
8. **Branch sprawl:** 104 days without a merge, the lead line 84 commits ahead, PRs #97 and #93 stale. The SQ-1 branch alone lists 15 orphaned predecessors.
9. **Website sources are blocked** (see §0).

---
*Next review: 2026-11-18.*
