# LOT® AI — Daily Documentation & Brand Review
**Date:** 2026-11-20 · **Run:** scheduled routine · **Branch:** `claude/practical-galileo-3csnxg`
*LOT® AI — Self-care, delivered.™*

---

## 0. Source access status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | ❌ Not reachable — host not in session network allowlist |
| https://lot-systems.com/about | ❌ Not reachable — same cause |
| https://brand.lot-systems.com | ❌ Not reachable — same cause |
| GitHub repo `LOT-Systems/LOT-Computer` (master @ `9f2b88c`) | ✅ Reviewed |

**Action needed:** add `lot-systems.com` and its subdomains (`institute.`, `brand.`) to the
environment's allowed network domains so future runs can read the live papers and brand site.
Everything below is from the repository only.

---

## 1. Latest repository activity

| Date | Commit | Change |
|---|---|---|
| 2026-11-17 | `9f2b88c` | Badge Codex **v33 "THE ARCANE TERMINAL"** — 812 → 843 badges (+31; alchemy/magic vocabulary). Session report `docs/LOT-SR-20261117-CODEX-v33.md`, codex in `docs/badges/`. Docs only, no source changes. |
| 2026-08-05 | `91e3648` / PR #96 | Badge Codex v32 "Hero's Journey" (+93 in `src/client/utils/badges.ts`, `easter-eggs.ts`). |
| 2026-08-05 | `8ac3690` | LOT-WIKI-v87 · FM v113 sync · `SystemProgressWidget.tsx` update. |
| 2026-08-04 | `d7f076e` | QIE v113 (P149–P151, Arch51, J48) — `intentionEngine.ts`, `scheduled-jobs.ts`, `api.ts`, `Logs.tsx`, `About.tsx`. |

**Gap:** nothing landed between Aug 5 and Nov 17. The v33 codex (Nov 17) has docs only. Its 31 new
badges are **not yet in `src/client/utils/badges.ts`**, so they don't exist in the product.
The v33 report also names a LOT-WIKI-v88, but no `docs/wiki/LOT-WIKI-v88.md` file exists.
The latest wiki file is v87.

## 2. Key updates to LOT® AI and the ecosystem (from the repo)

- **LOT® AI = public face of QIE.** Core loop: `LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN`. See `docs/corporate/LOT-AI-PRODUCT-BRIEF.md`, v1.0, June 2026, which has not been revised since.
- **Story API** (weekly Story-Report): `GET /api/story/latest`, `GET /api/story/:week_id`,
  `POST /api/story/:week_id/export {target: robot|vehicle|dashboard}`. This is documented in the brief.
  Verify that it is implemented in `src/server/routes/api.ts` before any integration relies on it.
- **Badge engine** is the most active area: 843 badges in 8 categories. The largest are Word Turns (276) and Achievement RPG (126).
- **QIE / FM v113** is the latest engine version. There have been no engine commits since Aug 4.

## 3. Brand, the LOT® Design System and COSMO® (from the repo)

- Brand header standard: LOT® founded 7 Apr 2016 · COSMO® founded 1 Jul 2024 · Made in the USA ·
  brand.lot-systems.com. All the `docs/corporate/*` files use it consistently.
- Color system: `docs/corporate/LOT_BENCHMARK_COLOR_SYSTEM.md`. Design Lab: `LOT_DESIGN_LAB_SUMMER_2026.md`.
- No design-system or style changes in the repo since August. The live brand.lot-systems.com could not be checked.

## 4. Coffee → Widget → Subscription → Design System → Style → Community: the puzzle

This is my reading of how the flow maps onto the codebase. It is not documented as one chain anywhere:

1. **Coffee:** the first Memory Engine question: *"What's your go-to morning beverage?"*
   (`src/server/utils/memory/constants.ts:68`, `questions.ts:13`). One small, intimate ask starts the compression loop.
2. **Widget:** the answers feed the System and Quantum Engine widgets
   (`SystemProgressWidget.tsx`, `QuantumEngineWidgets.tsx`, `PatternRecognitionWidget.tsx`).
3. **Subscription:** the value the widgets show leads to Usership ($1,188/yr digital), then the Basic Essentials
   physical tier ($4,788/yr) per `LOT_FMCG_SUBSCRIPTION_PLAN_2027.md`. The morning-beverage ritual is the natural first physical refill.
4. **Design System:** the LOT® Design System and color system give a consistent face across screen, packaging and hardware.
5. **Style:** COSMO® Style carries that language to the robotics/hardware line.
6. **Community:** Sync events and the shared emotion signal (the "Community Sync" section of the Product Brief) close the loop. Collective signal becomes personal context, which leads to the next question.

**The answer in one line:** a single question (coffee) becomes a daily ritual (widget), then a recurring relationship (subscription), then a recognizable identity (design system → style), then a shared rhythm (community).

**LOT® Robot Persons™:** the repo contains no document under this name. The nearest material is
`docs/corporate/LOT_ROBOTICS_COSMO.md` (May 2026). It describes "soul transfer": a COSMO® unit
does not activate without a verified LOT behavioral profile. The Story API also has a `robot` export target.
No capability changes since May.

## 5. Flags for current projects and integrations

1. ⚠️ **Badge Codex v33 is not implemented.** 31 badges are documented but missing from `badges.ts`.
2. ⚠️ **LOT-WIKI-v88 file is missing**, even though the v33 report references it.
3. ⚠️ **Story API:** endpoints are documented in the brief and still need to be checked against `api.ts`. They matter for the robot and vehicle integrations.
4. ⚠️ **FMCG plan milestone:** 100 annualized users by **2026-12-31**. That is 41 days away, and the repo shows no tracking of it.
5. ℹ️ The three external sites are blocked in this environment, so the live papers and brand changes were not reviewed.
6. ℹ️ "Robot Persons™" has no definition in the repo. Consider adding a spec doc.

---
*Next run: compare against this file. Report only the deltas.*
