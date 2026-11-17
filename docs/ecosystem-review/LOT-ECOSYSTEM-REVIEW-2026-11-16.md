# LOT® AI — Daily Ecosystem Review · 2026-11-16

> LOT® AI · Self-care, delivered.™
> Scheduled routine run · branch `claude/practical-galileo-gjbpiw` · baseline: review of 2026-11-15 (`claude/practical-galileo-uiivhq`, copied alongside this file)

---

## 0. Source status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | **BLOCKED**: the proxy returns 403 `connect_rejected` and DNS gives `ENOTFOUND` (the host isn't in the allowed domains) |
| https://lot-systems.com/about | **BLOCKED** (same) |
| https://brand.lot-systems.com | **BLOCKED** (same) |
| GitHub `LOT-Systems/LOT-Computer` (master + 15 branches pushed since the last review) | OK |

**Action still required. This is the 9th straight day the sites have been unreachable.** Add `lot-systems.com`,
`institute.lot-systems.com` and `brand.lot-systems.com` to this environment's allowed network domains
(https://code.claude.com/docs/en/claude-code-on-the-web). Until then, this review covers only the repository.

---

## 1. Repository state

- `master` HEAD is still `98971f2` (PR #96, 2026-08-05). That makes **103 days with no merge.**
- 15 non-routine branches were pushed between 2026-11-15 04:18 and 2026-11-16 04:18 UTC. None of them opened a PR.

## 2. Key updates since the last review (all unmerged)

| Area | Branch | What's new vs. 11-15 |
|---|---|---|
| **✅ QIE crash FIX** | `charming-albattani-0q7cq3` | **Fixes the critical `dayMs` ReferenceError flagged on 11-14 and 11-15.** `analyzeIntentions()` had thrown on every run with signals since QIE v112 (2026-08-03). Verified: L3332 no longer references the undeclared `dayMs`. The branch also fixes a race in `syncToServer` (signals recorded mid-flight were being dropped). It throttles QuantumRandomWidget from about 320 to 1 signal per minute, which was evicting real signals from the 1000-slot buffer. It moves render-phase `recordSignal()` calls into effects in 6 widgets. Lazy-loading SESSION_REPORTS cuts app.js gzip by 22.7%. Adds `yarn test:qie` |
| Diagnostics | `brave-rubin-sxob36` | Separately confirms the `dayMs` root cause: the cooldown never engages, and `getOptimalWidget()` throws during render. It also documents that the whole Logs list re-renders on every mouse idle/active toggle. Docs only |
| **LOT® Email v1** | `determined-turing-9gibo3` | `/email to <Name>. <letter>` in Log, stored as `direct_messages` with a ✉ prefix (no migration). Adds `GET/POST /api/lot-email` with a 30-per-hour flood guard, private SSE, a Sync MAIL section with a reply composer, and an [Email] button in Cohort Connect |
| **BASIC ration (LOT-FM-001)** | `beautiful-johnson-kre6vi` | Phase 01 Ledger & Doctrine. The Basics tab is now enabled (read-only). 12-issue year is GREEN, peak USD 39.70 / 40.00 (the envelope is tighter than yesterday's 34.35). **Endpoint renamed** to `GET /api/public/basic/manifest` (COGS withheld). New `.lot-basic` house tokens. Upgrade path closed until Phase 02 |
| Calendar | `dreamy-babbage-8wx8xp` | Alert engine (T-15 WARN / ALERT / MISSED) with a live clock and a `calendar_alert` Log event. **Security fix:** `PUT /api/logs/:id` had no ownership check, and now does. Adds `PUT /api/calendar/:id` |
| Log commands | `youthful-ritchie-87xg48` | Story Compression pipeline: logs → QIE packet → Together AI (packet only) → deterministic fallback. New commands `/day /week /month /year /level`, plus `/system` from `LOG_COMMANDS`. 9/9 tests pass |
| **Usership: The Twelve Seals** | `elegant-mendel-1ai5xk` | `LOT-USERSHIP-12-MONTH-EVOLUTION.md` lays out a 12-month evolution. Each month seals one Memory artifact plus a badge. Version strings run `LOT® OS 0.1 … LOT® AI 1.0` (Month 12) |
| QI·46 | `cool-tesla-sp9fp7` | Node 1 Being Vector: a 7-register humanoid calibration behind a COSMO® gate. Adds `src/server/utils/qi46.ts` (pure, not wired in) and spec v0.3 |
| Hardware: LOT SQ-1 pager | `brave-lamport-45y5w8` | Yesterday's "LOT TILE" now appears as **LOT SQ-1** (HW-01). Firmware v0.1, Device API v1 as a Fastify plugin (not registered), simulator contract tests 14/14, 8 PDF manuals |
| Hardware: CUBIQ | `tender-turing-an498u` | Report 02: split actuation (spring-latch + voice-coil), CUBIQ-LINK v0 packets, spec v0.2, Use Case 02 "Paired Cubes" |
| Astrology v2 | `practical-curie-i1ffkt` | Meeus lunisolar engine: true rokuyo, leap months, real lunation moon phase, profile-time-zone personalisation |
| Health check | `inspiring-volta-mtafkp` | **Weekly Rebuild CI has failed 8 times in a row since 2026-09-20.** It breaks at the `Install doctl` step (`digitalocean/action-doctl@v2`). Also flags CSP `unsafe-inline` |
| QIE (lead line) | `quantum-engine-widgets-RgFfC` | QIE v135: P183 Fourth Cycle Integration · Arch73 · J70 · FM v135 · Day 1175+. Now 82 commits and about 125k lines ahead of master |
| QIE / badges (parallel) | `fervent-knuth-p6u32p`, `amazing-turing-mcsmkx` | QIE v114 + Badge v33 "Temporal Archive" (812→843). This is another v88/v32 sync, the 4th copy of PR #97's content |

**LOT® AI "programming language":** the repo still has no language artefact by that name. What's new today is
that **"LOT® AI 1.0" is now defined as a product version**: the Month-12 state of the Twelve Seals Usership ladder.
The nearest things to a "language" are still the command grammar (`LOG_COMMANDS`, `/system`, and now `/email`,
`/day…/year`, `/level`), the QI·46 register vocabulary and the QIE pattern/archetype grammar.

## 3. Design System · COSMO® Style · brand

- brand.lot-systems.com is unreachable, so it was **not reviewed**.
- In-repo design signals: the **`.lot-basic` house tokens** (mono bold, white/black, inversion-only, 2px rules,
  square corners). This is the first explicit, scoped token set added in weeks. It's worth checking against the brand site
  once that site is reachable. The other one is the "military minimalist" overlay language (Calendar alerts, FCINT log handler).
- COSMO® day counter: 868 (`amazing-turing-mcsmkx`).

## 4. The flow puzzle: Coffee → Widget → Subscription → Design System → Style → Community

| Step | Change today |
|---|---|
| **Coffee** | No new code. The pager "Coffee time!" prompt carries over as SQ-1 |
| **Widget** | **Big one.** The QIE crash fix means widget *selection* (`getOptimalWidget`) can actually work again, and signal flooding is fixed. The step that had been broken since August is repaired, on a branch |
| **Subscription** | BASIC is enabled read-only, with a public manifest endpoint. Upgrade is still closed (Phase 02) |
| **Design System** | `.lot-basic` tokens (repo side only) |
| **Style** | COSMO® gate on the QI·46 Being Vector. Style is now a *safety and voice* gate as well as a visual one |
| **Community** | **Advanced.** LOT® Email v1 gives Cohort Connect its first direct channel (an [Email] action plus a Sync MAIL inbox) |

**Puzzle solution (refined):** the flow is the **Usership loop**, and the Twelve Seals doc turns it into a timeline.
1. A ritual (**Coffee**) creates a signal.
2. The QIE turns the signal into the right **Widget**.
3. Sustained use is priced as a **Subscription** (the BASIC ration).
4. The subscription delivers a coherent **Design System** (house tokens).
5. The design system is lived as COSMO® **Style**, which covers voice and safety as well as looks.
6. Shared style connects people in **Community** (Cohort plus Email).

Each month the loop is compressed into one Seal. After 12 Seals the user's instance reaches **LOT® AI 1.0**.
So the puzzle's answer is: *the product becomes LOT® AI by going around this loop for a year.*

**LOT® Robot Persons™:** the term is still absent from code and docs. The "person" half advanced today with the QI·46 Node 1
**Being Vector** (7-register humanoid calibration, COSMO®-gated). The "robot" half advanced with the SQ-1 pager's Device API v1
and CUBIQ-LINK v0. Neither one is wired to the other yet.

## 5. Flags: what affects current projects and integrations

1. **✅ Critical QIE crash: a fix exists (`charming-albattani-0q7cq3`), but master is still broken.** Merge this first,
   because every other widget and QIE branch is built on the crashing code.
2. **⚠ Security: missing ownership check on `PUT /api/logs/:id` on master.** Any authenticated user may be able to edit another
   user's log. It's fixed only on `dreamy-babbage-8wx8xp`. Treat it as P0 and cherry-pick it separately.
3. **⚠ Weekly Rebuild CI has been red for 8 weeks** (doctl install step). Self-assembly sync isn't running.
4. **⚠ Basics endpoint renamed:** `/api/public/ration` (11-15) → `/api/public/basic/manifest` (11-16). Anyone integrating against
   yesterday's branch needs to update.
5. **Hardware naming drift:** TILE (11-15) → SQ-1 (11-16) for HW-01. Pick one name before manuals or PCB orders go out.
6. **New public and partner surfaces to review:** `/api/lot-email` (cross-user messaging, needs abuse review beyond 30/h),
   the public basic manifest, Device API v1, and Story Compression sending packets to Together AI (a third-party data flow;
   check consent copy).
7. **Branch sprawl:** 103 days without a merge. The lead line is 82 commits ahead. There are 4 copies of the v88/v32 sync. PRs #97/#93 are stale (#93 is superseded by the calendar branch).
8. **Website sources are blocked** (see §0).

---
*Next review: 2026-11-17.*
