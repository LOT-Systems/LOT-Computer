# LOT® AI: Daily Documentation & Brand Review
**Date:** 2026-11-24 · **Run:** scheduled routine · **Branch:** `claude/practical-galileo-i0ca3e`
*LOT® AI: Self-care, delivered.™*

This report lists only what changed since `docs/review/LOT-DAILY-REVIEW-2026-11-23.md` (on `claude/practical-galileo-fnxd99`).

---

## 0. Source access status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | ❌ DNS not resolvable: host is outside the session network allowlist |
| https://lot-systems.com/about | ❌ Same cause |
| https://brand.lot-systems.com | ❌ Same cause |
| GitHub `LOT-Systems/LOT-Computer`: master plus every branch updated since the 11-23 review | ✅ Reviewed |

**Fix (unchanged):** add `lot-systems.com` and `*.lot-systems.com` to the environment's allowed network domains. Until then, sections 3–4 are based on the repo only.

---

## 1. State of master

`master` is still at **`9f2b88c`** (2026-11-17). **Nothing has merged in 7 days.** `main` is older still (2026-06-09, PR #49).

| Flag | Master | Change since yesterday |
|---|---|---|
| 🔴 Retired model `claude-3-5-sonnet-20241022` in `src/server/routes/public-api.ts:706`, `src/server/utils/ai-engines.ts:139`, `src/server/utils/memory.ts:1095` | unfixed | None. `inspiring-volta-4ay13w` is **still the only branch** without the retired ID. Today's health branch `inspiring-volta-pt68x6` is a report only. |
| 🔴 `dayMs` ReferenceError in `intentionEngine.ts` (P147), which breaks `analyzeIntentions` for every user with signals | unfixed | **New fix on `charming-albattani-5yeb8g`**, which also covers the Dashboard crash. One branch now carries fixes for both. |
| 🔴 Dashboard crash (`classifyPhysiologicalCohort()` called with no arguments) | unfixed | Fixed on `charming-albattani-5yeb8g` (supersedes `-ql4hko`). |

## 2. New work since the 11-23 review

| Area | Branch (latest) | What changed |
|---|---|---|
| **Widget health** | `charming-albattani-5yeb8g` | Fixes the `dayMs` crash and the UserMetrics/Dashboard crash. QIE sync now persists `lastSyncedTimestamp`, so it no longer re-uploads 7 days of signals on every load or loses in-flight signals. `/api/me` returns `joinedAt`. Lazy-loading cuts eager JS from 1357 to 1174 KB. Report: `docs/diagnostics/LOT-WIDGET-HEALTH-20261124.md`. |
| **LOT® Email v1** | `determined-turing-srvwwj` | Revision of `-mua1cf`. Adds a shared `parseEmailCommand` (`/email to Hitomi. …`), name disambiguation, and a private SSE `direct_message`. The Cohort "Send message" button opens a DM. `yarn test:email` runs 9 cases. |
| **BASICS / FMCG** | `beautiful-johnson-ufuhlf` | M1 S-01. Members get a Basics tab and strangers get a read-only **public OPEN TAB**. Adds `GET /api/public/basics/manifest` (no cost data), a server-only cost ledger, and an `npm run basics:check` envelope gate (GREEN). The 90-day plan is in `docs/basics/`. |
| **Astro Resonance** | `practical-curie-v3z6xl` | `computeAstroResonance` and `getAstroAlignment` (peak zodiac hour, moon, rokuyo). Adds a "You:" resonance line and ◆ alignment in System, and an ASTRO stamp on BIO check-ins. Resonance is fed into the QIE signal bus. |
| **Log command system (LCX-1)** | `youthful-ritchie-2v2sik` | Adds a pure engine, `log-compression.ts`, and a `POST /api/story` pipeline (QIE compression → Together AI → persisted story with a PII-free digest). **Adds `GET /api/story/latest`, as specified in the LOT-AI-PRODUCT-BRIEF.** Fixes a bug where journal text never reached `/story` because the filter used `journal` but Log writes `note`. `/system` now renders from `COMMAND_REGISTRY`. 25 checks are green. |
| **Calendar v2** | `dreamy-babbage-mg6giw` | A dedicated `GET /api/calendar` feed, not bound by the 500-row Log window. Adds HH:MM times, countdowns, T-15/T-0 alerts and Done/Scrub actions. `yarn test:calendar` has 34 assertions. |
| **QI·46 safety** | `cool-tesla-yjhw19` | Adds a read-only admin read-out panel (`Qi46ReadoutPanel` on `/us`) that masks non-label keys. Smoke tests 81/81. |
| **CUBIQ Quantum Cube** | `tender-turing-mqesdo` | DEV-REPORT-02. **ECR-001** proposes a hybrid actuator (voice coil + spring-latch). **Finding:** the 45° long jump tips the cube over above ~0.70 m/s horizontal velocity, a risk for v.1. The levitation track is narrowed. Use Case 02 is "The Quiet House". |
| **LOT·01 hardware** | `brave-lamport-9yyxhx` | S02. The device API is live behind a flag, with an AI nudge job and a P1 bench order. **Gotcha:** `.gitignore` entry `server/` hides new `src/server` files, so they had to be force-added. |
| **QIE** | `quantum-engine-widgets-RgFfC` | **v141**: P191 "Fifth Cycle Sovereign" · Arch79 · J76. The branch is 101 commits and about 150k lines ahead. Master is on v113. |
| **Badges** | `cool-hypatia-kq0okz` | Codex **v34 "Dream Laboratory"** (812→874) and **v35 "The Body Clock"** (874→905), plus LOT-WIKI-v88. This line continues from master's v33 (843). |
| Badges / wiki (parallel) | `fervent-knuth-ebxyts`, `amazing-turing-ebf72d` | Two more **LOT-WIKI-v88** variants. **That makes three different v88 wikis** across branches. |
| Usership 12-month | `elegant-mendel-48e3h0` | "The Twelve Chapters" spec plus a session report. |
| Diagnostics | `brave-rubin-msa555`, `inspiring-volta-pt68x6` | The button-lag diagnostic and a health check. TS 7 will break the deprecated `baseUrl`/`moduleResolution`. axios 0.27 is EOL and react-query v3 is unmaintained. The production logger is disabled, CSP allows `unsafe-inline`, and **PR #93 has been open for 118 days**. |

## 3. Design System, COSMO® Style and brand

- The live brand.lot-systems.com could not be checked (blocked).
- The BASICS house-style tokens (inversion-only, no gray or red) now reach `src/client/index.css` (+78 lines) on `beautiful-johnson-ufuhlf`. **They are not in a separate token file, so check them against COSMO® Style before merging.**
- QI·46 references "COSMO® screens" for the Memory prompt surface, so COSMO® is now also a safety-surface term, not just a style name.
- No changes to `LOT-STYLE-GUIDE.md` or `LOT_BENCHMARK_COLOR_SYSTEM.md` on any branch.

## 4. The Coffee → Widget → Subscription → Design System → Style → Community flow (the puzzle)

The solution still holds: *one question (coffee) → a daily ritual (widget) → a recurring relationship (subscription) → a recognizable identity (design system → style) → a shared rhythm (community).* Each step turns a single moment of care into something that repeats and is shared.

What's new today:
- **Widget → Subscription:** the QIE sync fix stops signal loss, so widget data that drives renewal hooks is now trustworthy. That data includes the Monthly Pulse, Usership chapters and Arcade level.
- **Subscription → Community:** the BASICS **public OPEN TAB** is the first surface a non-member can see, a storefront at the edge of the subscription.
- **Community:** Email v1 adds a Cohort → DM path. The flow now has a working loop from the community step back to an individual.

**LOT® Robot Persons™:** still not defined in the repo. Capabilities are unchanged. Two steps toward it:
- **The LOT·01 device API (behind a flag) and its AI nudge job** are the first server code where a device acts for LOT.
- **`GET /api/story/latest`** gives a device or robot a compressed, PII-free story to read.

## 5. Flags: what affects current projects and integrations

1. 🔴 **Model ID**: unchanged since yesterday. The fix is only on `inspiring-volta-4ay13w`. All features calling AI (`memory.ts`, `ai-engines.ts`, public API) are affected.
2. 🔴 **`dayMs` crash and Dashboard crash** are live on master. Merge `charming-albattani-5yeb8g`, which supersedes `-ql4hko` and the `brave-rubin` fixes.
3. 🟠 **`.gitignore` hides new `src/server/*` files** (found on `brave-lamport-9yyxhx`). New server routes on other branches (Email, Calendar, Story, BASICS) may be **missing from commits without any error**. Check `git status --ignored` before merging.
4. 🟠 **Merge drift is growing.** It has been 7 days without a merge. There are three LOT-WIKI-v88 variants, three badge lines (905 on `kq0okz` vs 843 on master vs 1339), and QIE v141 on the branch vs v113 on master. Most feature branches also touch `src/server/routes/api.ts`, `Logs.tsx`, `System.tsx` and `queries.ts`, so expect conflicts.
5. 🟠 **CUBIQ v.1 tip-over risk** (above ~0.70 m/s on the 45° jump): any motion use case for v.1 depends on ECR-001.
6. 🟡 **Story export**: `GET /api/story/latest` now exists on a branch, but `/api/story/:week_id/export` is still missing. Robot/vehicle export is partly unblocked.
7. 🟡 **Dependencies**: axios 0.27 (EOL), react-query v3, TS 7 config break, and CSP `unsafe-inline`.
8. 🟡 **FMCG milestone of 100 users by 2026-12-31 is 37 days away.** Billing is still `AWAITING PROVIDER`.

---
*Next run: compare against this file and check flags 1–3 first.*
