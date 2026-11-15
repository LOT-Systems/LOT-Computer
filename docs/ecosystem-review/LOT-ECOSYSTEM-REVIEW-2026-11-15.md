# LOT® AI — Daily Ecosystem Review · 2026-11-15

> LOT® AI · Self-care, delivered.™
> Scheduled routine run · branch `claude/practical-galileo-uiivhq` · baseline: review of 2026-11-14 (`claude/practical-galileo-qj99jp`)

---

## 0. Source status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | **BLOCKED** (DNS `ENOTFOUND`; outside the session's allowed network domains) |
| https://lot-systems.com/about | **BLOCKED** (same) |
| https://brand.lot-systems.com | **BLOCKED** (same) |
| GitHub `LOT-Systems/LOT-Computer` (master, open PRs, 15 branches pushed since the last review) | OK |

**Action still required:** allow `lot-systems.com`, `institute.lot-systems.com` and `brand.lot-systems.com`
in this environment's network settings (https://code.claude.com/docs/en/claude-code-on-the-web). Until that
happens, this review covers only the repository. Nothing in it comes from the websites.

---

## 1. Repository state

- `master` HEAD is still `98971f2` (PR #96, 2026-08-05). That makes **102 days with no merge.**
- Open PRs are unchanged: **#97** (LOT-WIKI-v88 · Badge v32, 2026-10-24) and **#93** (calendar, 2026-08-05).
- **15 branches** were pushed since the last review (2026-11-14 04:18 UTC). None of them opened a PR.

## 2. Key updates since the last review (all unmerged)

| Area | Branch | What's new vs. 11-14 |
|---|---|---|
| **Widget health** | `charming-albattani-5xmz2g` | **8 defects fixed.** A shared `useLogContext` cache cuts a logs update from 368 ms to 25 ms at 3k logs, shared across about 15 widgets. Subscribe no longer flickers. Intentions no longer hides itself after one render. QIE CARE row read `selfcare` where the field is `selfCare`. UserMetrics read fields that don't exist. MonthlyPulse revived as a 15-month program. Duplicate profile fetches replaced with `useProfile()`. Report: `docs/diagnostics/WIDGET-HEALTH-SCAN-2026-11-15.md` |
| **BASIC ration (LOT-FM-001)** | `beautiful-johnson-vpc5dm` | M1 S1: a 23-line ration load with doctrine, terms and an upgrade state machine. A server-only COGS sheet with a per-issue envelope gate (peak 34.35 ≤ 40, min margin 62.45%). New `GET /api/public/ration`, an in-app `/basics` tab and a **public `/open` OPEN TAB** page. 90-day plan in `docs/basics/` |
| **Hardware: LOT TILE (LOT-HW-01)** | `brave-lamport-gpbw0e` | **New device line.** A 40×40 mm steel pager. It shows autonomous notifications ("Coffee time!"), and its one **Copy** button writes the line back to the user's Log, with an optional camera photo and an environmental sensor. Includes an ESP32-S3 firmware skeleton, `lotctl.py` provisioning plus a mock `/api/device` server, a costed BOM, a PCBWay 100-unit plan and 10 PDF manuals. Nothing fabricated yet, and no `src/` changes |
| Hardware: CUBIQ | `tender-turing-t33oga` | v.0 R06: v.1 long-jump numbers, friction-cone and runway-sensing corrections, **signal contract v0.2 (30 vectors)**, Use Case 06 "The Maker's Bench" |
| **QI·46** | `cool-tesla-oatt24` | Phase 0 S01: Calibration Vector v0.1 (7 registers: GRACE, POETRY, LOVE, HUGS, BEING_THERE, BEING_COOL, MALE persona, with COSMO safety and consent rules) and a corpus assembler. Corpus v0 has 306 docs, 4,068 pairs, 3,954 cleared and 114 flagged. **Checkpoint 0 is HOLD:** a human must review the 100-pair sample, and subscriber journals need a consent-gated pull |
| Usership Year | `elegant-mendel-kbsmr0` | Spec moved to `docs/technical/`. Adds a Memory Capsule → Chapter → Year ladder, `usership-journey.ts` config and Usership Dial badges. Same `joinedAt` fix as the widget branch, **duplicated** |
| Log commands | `youthful-ritchie-ytv17r` | `/story` Story Compression Engine (`shared/utils/story-compression.ts`, day to year horizons, spikes, Arcade XP). Fixes `/story` ignoring the Journal (it read the wrong log types). Argument commands now wait for 1.2 s of typing silence. 34 tests pass |
| Calendar | `dreamy-babbage-l2t01i` | Uncapped `GET /api/calendar` (entries were lost past the 500-row logs cap). `POST /api/calendar/status` and `/alert`. Event-sourced core with 15 tests. App-wide T-15/T-0 alerts |
| Astrology v2 | `practical-curie-wab7ly` | Reading unified on `timeZone`, Logs resonance personalisation, rokuyo/moon fixes |
| QIE (parallel line) | `upbeat-curie-61wb9e` | Finalised QIE v114 "Sovereign Epoch" (154P · 52A · 49J), still built from master |
| QIE (lead line) | `quantum-engine-widgets-RgFfC` | Maintenance only: LOT-WIKI-v112 · FM v134 · 1,277 badges · Day 1174+ · **COSMO® 866** |
| Health check | `inspiring-volta-yvuj2d` | `npm audit`: **52 vulns (1 critical: `shell-quote`, 36 high, 15 moderate)**. P0: fastify DoS update. P1: axios CSRF fix, `@fastify/static` |
| Assembly | `fervent-knuth-ukym8j` | Yet another LOT-WIKI-v88 / Badge v32 sync (the 3rd copy of PR #97's content) |

**LOT® AI "programming language":** the repo still has no artefact by that name. Today the nearest things are
the new `LOG_COMMANDS` registry and `/system` (a command grammar), the QI·46 Calibration Vector registers,
and the QIE pattern/archetype grammar.

## 3. Design System · COSMO® Style · brand

- brand.lot-systems.com is unreachable, so it was **not reviewed**.
- In the repo, no brand-standard files changed. Design-adjacent work today: the OPEN TAB public page and RationSheet UI
  (Basics), LOT TILE industrial design (brushed steel bezel, mirror-polished 316L back), and the Usership Year spec.

## 4. The flow puzzle: Coffee → Widget → Subscription → Design System → Style → Community

| Step | Where it lives | Change today |
|---|---|---|
| **Coffee** | Onboarding drink options, Fuel Protocol badge, and now **LOT TILE's "Coffee time!" notification** | **New.** For the first time, Coffee shows up as a *push* from the system, through a hardware device, rather than only an onboarding answer |
| **Widget** | System-tab widget stack | 8 wiring and lag fixes. Subscribe widget no longer flickers |
| **Subscription** | `SubscribeWidget`, BASIC ration | **Advanced.** Ration ledger, COGS envelope, upgrade state machine and a public `/open` OPEN TAB. The subscription is now priced and gated |
| Design System | brand site (blocked) | Not reviewed |
| Style | COSMO® Style (blocked) | Not reviewed |
| Community | Sync, Cohort Connect, Email v1 | No new push today. Email v1 is still unmerged (`determined-turing-nyg1it`) |

**How I read the puzzle (refined from yesterday):** the chain is a *signal → retention → identity* loop.
1. A daily ritual (**Coffee**) gets captured, and as of today the TILE device can prompt it.
2. The capture surfaces as a **Widget** signal.
3. The widget converts the user to a **Subscription** (BASIC ration, with the upgrade path now coded).
4. The subscription delivers the **Design System**.
5. The design system is experienced as COSMO® **Style**.
6. That style is the shared language of the **Community**.

Today's TILE "Copy → Log" loop closes the cycle physically: what the system says to you becomes your own entry.

**LOT® Robot Persons™:** the term still appears in no code or doc on any branch. The closest capabilities are the QI·46
Calibration Vector, which gives an engine a *persona* with 7 registers, consent and safety rules. That is the first
artefact that looks like the "person" half. Hardware bodies are the "robot" half: TILE, Pager, CUBIQ and the Robot Node.

## 5. Flags: what affects current projects and integrations

1. **⚠ CRITICAL bug on master, still open (day 2).** `src/client/stores/intentionEngine.ts:3332` uses `dayMs` in
   `analyzeIntentions()` (L258–3465), where it is never declared. The only declarations are at L3543 and L4620, inside
   other functions. When there are signals, this throws a `ReferenceError` on the System tab. I re-checked today: the bug is
   **still present on master and on every branch pushed today**, including `charming-albattani-5xmz2g` (the widget-health fix)
   and the lead line `RgFfC`. The fix is one line: `const dayMs = 24 * 60 * 60 * 1000`.
2. **⚠ Critical dependency CVE.** `npm audit` reports `shell-quote` critical plus 36 highs (`inspiring-volta-yvuj2d`).
   Fastify DoS and axios CSRF are the cheap fixes.
3. **⚠ 102 days without a merge, with fragmenting versions.** The lead line is at FM v134 / 1,277 badges. Parallel lines are
   still building QIE v114 and v88/v32 from master. A 3rd v88 sync was pushed today.
4. **Duplicate fixes are colliding.** `joinedAt` on `/api/me` + MonthlyPulse is fixed separately in `charming-albattani-5xmz2g`
   and `elegant-mendel-kbsmr0`, which edit the same files differently. Expect merge conflicts.
5. **New public surfaces, so review before shipping.** `GET /api/public/ration` and `/open` (Basics), and the TILE `/api/device`
   contract (mock only). These are integration points for any partner or hardware work.
6. **QI·46 is blocked on a human.** Checkpoint 0 HOLD: S-2 needs to review `qi46/corpus/build/review-sample-100.jsonl`
   and decide on the consent-gated pull from subscriber journals.
7. **PR #93 is superseded** by `dreamy-babbage-l2t01i` (uncapped calendar API). Close it or replace it.
8. **Website sources are blocked** (see §0).

---
*Next review: 2026-11-16.*
