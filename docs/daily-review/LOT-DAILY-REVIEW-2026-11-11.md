# LOT® AI — Daily Documentation & Brand Review
**Date:** 2026-11-11 · **Mode:** scheduled routine · **Status:** PARTIAL (external sources unreachable, 3rd+ consecutive run)
**Previous:** 2026-11-10 (`cfe09e1cf`, branch `claude/practical-galileo-28wpev`)

## 1. Source access
| Source | Result |
|---|---|
| institute.lot-systems.com (first node) | DNS failure: host is outside the session's allowed network domains |
| lot-systems.com/about | DNS failure (same cause) |
| brand.lot-systems.com (Design System / COSMO® Style / brand standards) | DNS failure (same cause) |
| Repository: `origin/master` and all `origin/claude/*` branches | Read OK |

**Action needed (unchanged since 2026-11-03):** add `institute.lot-systems.com`, `lot-systems.com` and `brand.lot-systems.com` to the routine environment's allowed network domains. Until then, steps 1–2 cannot run. I have not summarized or guessed any web content.

## 2. Repository: changes since the last review (2026-11-10 04:15 UTC → now)
`origin/master` is still at `98971f2` (2026-08-05). **All new work is on unmerged `claude/*` branches.**

| Area | Change | Commit / branch |
|---|---|---|
| **Widgets (health)** | 2× P0 crash fixes: QIE `analyzeIntentions()` threw `dayMs is not defined` (P147) for every user with signals; `UserMetricsWidget` crashed the whole Dashboard boundary. Monthly Pulse revived (`/api/me` now returns `joinedAt`). CARE dimension field fix. The Subscribe prompt no longer flickers. Widgets below the fold are lazy-mounted. New `safeStorage` util. | `ece3fa1f7` · `charming-albattani-pslkc1` · report `docs/diagnostics/WIDGET-HEALTH-2026-11-11.md` |
| **Astrology v2** | Rokuyo now uses local midnight (it used the UTC offset). Server moon-phase skew fixed. "Now: favorable/unfavorable" time window added. "Your rhythm" personalization from Logs. ASTRO line added to the Logs SYS block. | `0cab242d9` · `practical-curie-joufvr` (also `94f0073be` on another branch) |
| **BASIC / LOT-FM-001** | `/basics` tab (OPEN TAB): 23-line ledger, cadence engine, public `GET /api/public/basics` (COGS withheld), `yarn basics:check` envelope gate (peak 39.85 ≤ 40, margin 60.2%) | `652b79381` · `beautiful-johnson-59if55` (also `cf138ab1d`) |
| **Calendar** | `/api/calendar` feed, snooze, scrub, system alerts, toast v2, E2E tests | `847be8a7b` (+ `f68900639` / `9da031a63`) |
| **Log commands** | `/story day\|week\|month\|year` compression, `/system` command grid, `/rank` Arcade | `2c3729061`, `683588aa8` |
| **LOT® Email v1** | `/email to <name>` in Log, Mail inbox in Sync, Cohort Connect hook | `036c1d803` |
| **QIE / QI·46** | QIE v132 · P180 Fourth Cycle Candidate · Arch70 · J67. Being Profile core for QI·46 Layer 6, with tests. | `06785c7d6`, `051f27007` |
| **Badges** | v45 THE ZEN TERMINAL (1215) → v46 THE JAZZ ENGINE (+31, **1246**) | `967897646` |
| **Wiki** | LOT-WIKI-v107 (Day 1170+, COSMO® 863 days) **and** LOT-WIKI-v88 / FM v114 / Badge v32: two different numbering lines | `571300d82`, `acf1f135f` |
| **Design** | Usership: The 12 Chapters, compressed Memory Story delivery spec (LOT-SR-20261110-01) | `dfdd6dc0d` |
| **Hardware** | CUBIQ Quantum Cube v.0 R02 → R03 (reaction-mass correction, foot-plunger LEAP, firmware FSM, Use Case 03 "The Practice Piano"). HW-0 pager plan and BOM. | `409f9833e`, `d10838ec3` |

**Correction to the 2026-11-10 report:** it said there had been "no repo activity for ~97 days". That is true only for `master`. The feature branches are very active, and this review now scans them too.

## 3. Coffee → Widget → Subscription → Design System → Style → Community / Robot Persons™
- **Widget → Subscription:** this is the only link in the flow that changed in code today. SubscribeWidget's display roll is now stable per mount and its storage access is guarded (`ece3fa1f7`). This improves the conversion surface. It does not change the subscription logic.
- **Coffee:** coffee is referenced in About, badges, easter-eggs, the API and memory. I saw no changes to it today.
- **Design System / Style:** the repo-side terminal-grid style was extended: `.lot-term` uses mono bold, inversion, 2px rules and square corners (BASIC). I could not check it against brand.lot-systems.com.
- **Community:** the LOT® Email Cohort Connect hook and the Usership 12-chapter spec both touch this step.
- **Robot Persons™:** there are still no references in the repo. I could not review its capabilities.
- **Puzzle:** not solved. The puzzle text lives on the unreachable web sources, and nothing in the repo matches it. I will not invent an answer.

## 4. Flags for current projects / integrations
1. **P0 fixes are unmerged.** The QIE and Dashboard crash fixes in `ece3fa1f7` affect every active user. The crash came in with `1846b80` (2026-08-03), so it is likely live in production if that commit is on the deployed branch. Merging this fix should come first.
2. **Branch fragmentation and duplicate work.** Calendar, Astrology v2, BASIC M1, CUBIQ R02 and Wiki v107 each exist as 2–3 copies on different branches. There is a high risk of merge conflicts in `System.tsx`, `intentionEngine.ts` and `Logs.tsx`, which most of these branches touch.
3. **Wiki versioning has diverged:** v88/FM v114 on one line and v107 on another. Canonical docs need one numbering line.
4. **New public endpoint:** `GET /api/public/basics` is unauthenticated. Review it before merging. COGS is withheld server-side by design.
5. **Network allowlist** still blocks all three LOT domains, so the brand and Robot Persons™ checks stay blind.

## 5. Next run
Diff against this report. Retry the web fetches once the domains are allowed. Track the merge status of `ece3fa1f7`.

— Automated review · branch `claude/practical-galileo-6f5ogu`
