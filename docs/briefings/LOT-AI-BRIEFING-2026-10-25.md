# LOT® AI Daily Briefing — 2026-10-25

Scheduled documentation and brand review. Self-care, delivered.™

## 0. Source coverage (read this first)

| Source | Status |
|---|---|
| institute.lot-systems.com | NOT REACHED. DNS/proxy failure (`ENOTFOUND`; direct curl got proxy 403). |
| lot-systems.com/about | NOT REACHED. Same failure. |
| brand.lot-systems.com | NOT REACHED. Same failure. |
| Repository `LOT-Systems/LOT-Computer` (`docs/`, `src/client/components/About.tsx`, remote branches) | Read. |

Nothing below about the websites is verified. The summary covers the repo only. The sandbox network policy probably needs to allow `*.lot-systems.com`. Until it does, steps 1–2 of the routine can't run.

## 1. Repository state

- `master` HEAD is `98971f2` (2026-08-05, PR #96). It has not moved in about 81 days.
- The newest docs on `master` are `LOT-SR-20260805-01` (Badge v32), `LOT-WIKI-v87` and Field Manual v113.
- Four branches carry unmerged work dated 2026-10-25. Their content is not in `master` or in the docs above:
  - `determined-turing-80rpgm`: **LOT Email v1**. `/email to Name.` in Log, inbox in Sync, Cohort Email button.
  - `charming-albattani-39adwr`: widget health scan. Fixes the P147 `dayMs` crash and the UserMetrics cohort crash, and adds `joinedAt` to `/api/me` (MonthlyPulse reveal).
  - `practical-curie-lvg50z`: astrology. Profile timeZone on the dashboard, log resonance, richer ASTRO log line.
  - `beautiful-johnson-xapdcp`: BASICS M1 open-tab ledger.

## 2. LOT® AI and the QIE ecosystem (as of last merged state)

- **Product framing** (`docs/corporate/LOT-AI-PRODUCT-BRIEF.md`, v1.0, June 2026): LOT® AI is the public face of the Quantum Intent Engine. The core loop is `LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN`. It asks one earned question at a time instead of offering a chatbot.
- **QIE v113**: 151 patterns, 51 archetypes, 48 jobs, 190+ dependency nodes. Latest additions are P149–P151, Arch51 Quantum Presence Crystallizer and job J48 (09:00 UTC).
- **Badge Codex**: v32 "Hero's Journey" took the count from 719 to 812. The session report found that v20/v21 badge logic was documented but never implemented in TypeScript, so those badges were unreachable until v32. The pre-existing infra `tsc` errors are unchanged.
- **"LOT AI programming language"**: no language spec, grammar or release notes exist in the repo. I found only the product brief, the QIE docs and `LOT_QUANTUM_AI_SYSTEM_PROMPT.md`. Any language changes would be on the unreachable sites.

## 3. Coffee → Widget → Subscription → Design System → Style → Community flow

- This flow is not described as a sequence anywhere in the repo. A grep for the chain and for "robot person" found no matches.
- Pieces that exist: widgets (40+, the QEW cohort view), subscription planning (`LOT_FMCG_SUBSCRIPTION_PLAN_2027.md`), design (`LOT_DESIGN_LAB_SUMMER_2026.md`, `LOT_BENCHMARK_COLOR_SYSTEM.md`) and cohorts/community features in the app.
- No change to the flow is detectable from the repo.

## 4. LOT® Robot Persons™ (puzzle)

- The closest source is `docs/corporate/LOT_ROBOTICS_COSMO.md` (2026-05-25). Its thesis: a robot carries the owner's behavioral fingerprint (patterns, archetypes, values) and acts accordingly. COSMO® is the robotics division.
- The "puzzle" is not solved. The term "Robot Persons™" appears nowhere in the repo, and the likely clue lives on institute.lot-systems.com, which I couldn't reach. I did not guess at an answer.

## 5. Flags for current projects

1. **Network access:** allow `*.lot-systems.com` for this routine. Without it the brand and design-system review is blank.
2. **Branch drift:** four Oct-25 branches are unmerged and `master` is 81 days old. Docs (About.tsx phase row, Field Manual) are behind the branches.
3. **Crash fixes** in `charming-albattani-39adwr` (P147 `dayMs`, UserMetrics cohort) affect production widgets, so they should be merged soon.
4. **`/api/me` gains `joinedAt`** on that branch. Check any client or integration that relies on the response shape.
5. **LOT Email v1** adds new user-facing surfaces (Log, Sync, Cohort), so it needs review for privacy and consent before release.

— Automated briefing
