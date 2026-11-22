# LOT® AI: Daily Documentation & Brand Review
**Date:** 2026-11-22 · **Run:** scheduled routine · **Branch:** `claude/practical-galileo-xar65i`
*LOT® AI: Self-care, delivered.™*

This report lists only the changes since the last review, `docs/review/LOT-DAILY-REVIEW-2026-11-20.md` on `claude/practical-galileo-3csnxg`.

---

## 0. Source access status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | ❌ DNS not resolvable: host is outside the session network allowlist |
| https://lot-systems.com/about | ❌ Same cause |
| https://brand.lot-systems.com | ❌ Same cause |
| GitHub `LOT-Systems/LOT-Computer`, master + all 133 commits on any branch since 2026-11-15 | ✅ Reviewed |

**The sites have been blocked on every run since about 2026-07-28** (roughly 100 consecutive daily reports on `practical-galileo-*` branches).
None of those runs could read the live papers, the Design System or the COSMO® Style pages.
**Fix:** add `lot-systems.com` and `*.lot-systems.com` to the environment's allowed network domains.

---

## 1. State of master

`master` is still at **`9f2b88c`** (2026-11-17, Badge Codex v33). **Nothing has merged in 5 days.**
Every item below sits on an unmerged `claude/*` branch, so none of it is live in the product yet.

## 2. New work on branches since 2026-11-20

| Area | Branch (latest) | What changed |
|---|---|---|
| **AI model upgrade** | `inspiring-volta-4ay13w` (`bccc7ba`) | Changes `claude-3-5-sonnet-20241022` to `claude-sonnet-5-5` in `ai-engines.ts`, `memory.ts` and `public-api.ts`. Also adds degraded health status. |
| **Critical bug diagnosis** | `brave-rubin-usr5ic` (`abe8a76`) | `dayMs` ReferenceError in `analyzeIntentions()` (QIE v112 regression). A fix commit `1e701c3` exists, but only on `brave-rubin-mgng2z`. |
| Usership 12-month evolution | `elegant-mendel-5qey5p` (`c1ae980`) | `docs/corporate/LOT-USERSHIP-12-MONTH-EVOLUTION.md` (741 lines). Covers Day 1 barebone UI → Month 12 full LOT® AI (`/u/machiavelli` reference), a compressed Memory Story each month, and "Months unlocked N/12". |
| Log Story Compression Engine | `youthful-ritchie-9p5qbg` (`a4e26aa`) | `/story [day\|week\|month\|year]`, `/system` registry and Arcade ranks. |
| QIE engine | `quantum-engine-widgets-RgFfC` (`ec32150`) | QIE **v139**: P189 · Arch77 · J74 · "Fifth Cycle Deepening". Master is still on v113. |
| Badges / Wiki | several | Badge line v48 "Body Electric" and v49 "Dream Laboratory" (1339 badges). LOT-WIKI-v119 / FM v138. A parallel line syncs Codex v33 → LOT-WIKI-v88 (843). There are **two diverging badge/wiki numbering lines**. |
| QI·46 safety | `cool-tesla-23rp8k` (`7c5a276`) | Ideation hardening: 37 phrases, negation handled as a label, smoke tests 60/60. Admin beta read-out has a privacy floor of 3. |
| LOT® Email | `determined-turing-syfzer` (`d2c6e87`) | v1.2: `/email` compose and reply in Log, receive in Sync. |
| Calendar | `dreamy-babbage-wxofhj` (`b5ca38b`) | v2: time tracking, Log lifecycle, military-precedence alerts. |
| Astrology | `practical-curie-6jk0fr` (`8de77e1`) | v2: saved time zone, rokuyo day-boundary fix, Logs echo. |
| Widgets health | `charming-albattani-rrt4uo` (`749670a`) | Breathe frame skip, `staleTime` on stats queries, badge-key dedupe (`elixir_found`, `quarter_drop`). |
| BASICS / FMCG | `beautiful-johnson-me0w45` (`8dca033`) | LOT-FM-001 Month 1 "open tab": 23-line ration ledger, envelope audit. |
| Hardware | `brave-lamport-s3mbee`, `tender-turing-b3uj90` | LD-01 "Tile" Phase 0 (BOM, PCBWay 100-unit plan). The firmware compile is blocked by the network. CUBIQ Quantum Cube v.0 R09, signal contract v0.5 (59 vectors), Use Case 09 "The Coffee Table". |

## 3. Design System, COSMO® Style and brand

- The live brand.lot-systems.com could not be checked.
- In the repo: no changes to `LOT-STYLE-GUIDE.md`, `LOT_BENCHMARK_COLOR_SYSTEM.md` or the Design Lab docs since August.
- The brand header standard (LOT® 2016 · COSMO® 2024 · Made in the USA) is used consistently in the new session reports.

## 4. The Coffee → Widget → Subscription → Design System → Style → Community flow

The solution from 11-20 still holds: *one question (coffee) → a daily ritual (widget) → a recurring relationship (subscription) → a recognizable identity (design system → style) → a shared rhythm (community).*

**What's new:** the chain now shows up in work that is under way.
- **Coffee → hardware:** CUBIQ Use Case 09 *"The Coffee Table"* puts the first ritual on a physical object.
- **Widget → Subscription:** the Usership 12-month spec makes the widget-to-subscription step concrete. Each month unlocks UI, and the "Months unlocked N/12" widget plus the monthly Memory Story give a reason to renew.
- **Subscription → physical:** the BASICS LOT-FM-001 ledger is the first FMCG refill tier going live.
- **Community:** LOT® Email (Log ↔ Sync) adds a person-to-person channel inside the community layer.

**LOT® Robot Persons™:** still not defined anywhere in the repo, on any branch.
- The closest materials are `docs/corporate/LOT_ROBOTICS_COSMO.md` (May 2026, "soul transfer") and the new hardware tracks (LD-01 Tile, CUBIQ, Pager L-01). Together they give a device path that a future Robot Person could run on.
- The device API connectors in those branches are the first concrete integration surface.
- No change to Robot Persons capabilities.

## 5. Flags: what affects current projects and integrations

1. 🔴 **The production AI model ID on master is `claude-3-5-sonnet-20241022`**, in 3 places (`src/server/utils/ai-engines.ts:139`, `src/server/utils/memory.ts:1095`, `src/server/routes/public-api.ts:706`).
   - That model is retired, so LOT® AI generation calls (Memory, engines, public API) are likely failing or falling back.
   - The fix is ready on `claude/inspiring-volta-4ay13w`. **Merge it.**
2. 🔴 **`dayMs` ReferenceError is still on master** at `src/client/stores/intentionEngine.ts:3332`.
   - It breaks the QIE cooldown, which causes button lag.
   - It can also crash `System.tsx` through `AppErrorBoundary`.
   - The fix is one line, and `1e701c3` on `claude/brave-rubin-mgng2z` already contains it. **Merge it.**
3. 🟠 **No merges for 5 days, and 130+ branch commits are waiting.** The parallel badge/wiki lines (v33/WIKI-v88 versus v49/WIKI-v119, and QIE v114 versus v139) will conflict. One canonical line should be picked before merging.
4. 🟠 **Story API from the Product Brief is still not implemented.**
   - The brief lists `/api/story/latest`, `/api/story/:week_id` and `/api/story/:week_id/export`.
   - Master only has `GET /memory/story` (`api.ts:2610`).
   - The robot and vehicle export integrations depend on these endpoints.
5. 🟡 **The FMCG milestone of 100 annualized users by 2026-12-31 is 39 days away.** The BASICS ledger is progressing on a branch only.
6. 🟡 **The hardware firmware toolchain is blocked by the network** (LD-01). This is the same allowlist problem as the brand sites.
7. ℹ️ **The external sites have been blocked for about 4 months**, as covered in §0.

---
*Next run: compare against this file and report only the changes. Check first whether #1 and #2 have merged.*
