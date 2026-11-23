# LOT® AI: Daily Documentation & Brand Review
**Date:** 2026-11-23 · **Run:** scheduled routine · **Branch:** `claude/practical-galileo-fnxd99`
*LOT® AI: Self-care, delivered.™*

This report lists only what changed since `docs/review/LOT-DAILY-REVIEW-2026-11-22.md` (on `claude/practical-galileo-xar65i`).

---

## 0. Source access status

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | ❌ DNS not resolvable: host is outside the session network allowlist |
| https://lot-systems.com/about | ❌ Same cause |
| https://brand.lot-systems.com | ❌ Same cause |
| GitHub `LOT-Systems/LOT-Computer`: master plus every branch updated since 2026-11-22 | ✅ Reviewed |

These sites are still blocked, as they have been for about 4 months.
**Fix:** add `lot-systems.com` and `*.lot-systems.com` to the environment's allowed network domains.

---

## 1. State of master

`master` is still at **`9f2b88c`** (2026-11-17). **Nothing has merged in 6 days.**

Both red flags from yesterday are **still open on master**:

| Flag | Master | Fix available on |
|---|---|---|
| 🔴 Retired model `claude-3-5-sonnet-20241022` is used in `public-api.ts:706`, `ai-engines.ts:139` and `memory.ts:1095` | unfixed | `claude/inspiring-volta-4ay13w` only. **Note:** the newer health branch `inspiring-volta-wnn7cd` (11-22) was cut from master and does **not** include the upgrade, so merging the newest health branch alone will not fix this. |
| 🔴 `dayMs` ReferenceError at `intentionEngine.ts:3332`, which causes QIE cooldown failure and button lag | unfixed | `claude/brave-rubin-0yrlod` (`4e94578`, new today) and `brave-rubin-mgng2z` (`1e701c3`) |

## 2. New work on branches since the 11-22 review

| Area | Branch (latest) | What changed |
|---|---|---|
| **Widget health** | `charming-albattani-ql4hko` | Fixes a **Dashboard crash**: `classifyPhysiologicalCohort()` was called with no arguments and took down the whole boundary. `/api/me` now returns `joinedAt`, which the Monthly Pulse month count needs. Adds `GET /api/export/all-logs`, which the ApiPage advertised but returned 404. Also fixes duplicate answers in MemoryWidget and a 10×/s re-render in Breathe, and lazy-loading cuts app.js by 27%. |
| **LOT® Email v1** | `determined-turing-mua1cf` | `POST /api/email` resolves the recipient by first name, ranked by prior correspondents, then same city, then recently seen. Adds `GET /api/email/inbox` with SSE. **SSE now sends `direct_message` only to the sender and receiver** (a privacy fix). The Cohort Email button seeds a draft in Log. |
| **BASICS / FMCG** | `beautiful-johnson-ob3h5a` | Session 01 hardening. `/api/basics` is now mounted in the real `src/server/index.ts`; the earlier attempt registered it in an unused file. COGS moved to server-only code and margin is withheld from member responses. Fixes an **XSS in the printable manifest**. The Stripe stub was removed, so billing reads `AWAITING PROVIDER`. Adds Quartermaster endpoints. |
| Astrology v2 | `practical-curie-hqfg8e` | Shared `getAmbientReading` feeds the dashboard, Logs and QIE. Adds rokuyo guidance and astro context on every log. Moon-phase windows are now centered, so a full-moon night no longer reads "Waxing Gibbous". |
| CUBIQ Quantum Cube | `tender-turing-5c0bpq` | v.0 R10. Signal contract v0.6-draft with 72 vectors and a clean 100k-case fuzz. Platform wiring map: `badge_rare` and `cohort_ping` **have no event source in the server today**, and `achievement_unlocked` is read but never written. Device events are proposed in a separate store, kept out of Log. Use Case 10 "The Mooring". |
| Hardware | `brave-lamport-fqxxwb` | LOT·01 pager, 40×40×5 mm stainless: ESP32-S3 firmware skeleton, a device-API plugin (not wired in), a simulator and 5 PDF manuals. |
| QIE | `quantum-engine-widgets-RgFfC` | **v140**: P190 · Arch78 · J75 · FM v140 "Fifth Cycle Integration". Master is still on v113. |
| QI·46 safety | `cool-tesla-kwzob8` | F12 language coverage. Non-English fields are labelled `language:uncovered` and fall back to the standard prompt, with no machine-translated safety phrases. Smoke tests 72/72. |
| Calendar v2 | `dreamy-babbage-36qafj` | Idempotent alert orders, logged to Log. |
| Log SCE | `youthful-ritchie-1s0gak` | `/story day\|week\|month\|year`, the `/system` registry and Arcade `/level` (iteration only). |
| Usership 12-month | `elegant-mendel-53g88a` | Spec iteration: chapters, compressed Memory, widgets and badges. |
| Badges | `fervent-knuth-syyus2` | Engine v33 "Arcane Terminal" and v34 "Dream Laboratory", 781→812. The numbering still conflicts with Codex v33 = 843 on master and with the v49 line (1339). |

## 3. Design System, COSMO® Style and brand

- The live brand.lot-systems.com could not be checked.
- In the repo, the BASICS branch introduces a **"house style" rule set**: a single token file, hierarchy by inversion only, and no gray or red. This is the first new style constraint in code since August. Check whether it matches COSMO® Style before merging.
- No changes to `LOT-STYLE-GUIDE.md` or `LOT_BENCHMARK_COLOR_SYSTEM.md`.

## 4. The Coffee → Widget → Subscription → Design System → Style → Community flow

The solution still holds: *one question (coffee) → a daily ritual (widget) → a recurring relationship (subscription) → a recognizable identity (design system → style) → a shared rhythm (community).*

What's new today:
- **Widget → Subscription:** the `joinedAt` fix makes the Monthly Pulse month count real. That count is the "Months unlocked N/12" renewal hook from the Usership spec.
- **Subscription:** BASICS now gates UPGRADE on Usership. This is the first code-level link between a subscription and a physical refill.
- **Style:** the BASICS house-style tokens (inversion-only, no gray or red) are the first code-level expression of the Design System → Style step.
- **Community:** Email's recipient ranking (correspondents > city > recent) is the first community graph used for routing.

**LOT® Robot Persons™:** still not defined in the repo. Capabilities are unchanged.
- The CUBIQ R10 platform map is the most concrete step toward one: it defines how a physical object subscribes to LOT events, and keeps device data out of user Logs.
- That is the event surface a Robot Person would need.

## 5. Flags: what affects current projects and integrations

1. 🔴 **Model ID**: unchanged since yesterday. Merge `inspiring-volta-4ay13w`, not only `wnn7cd`.
2. 🔴 **`dayMs` bug**: still on master. Merge `brave-rubin-0yrlod`.
3. 🔴 **Dashboard crash and the 404 on the advertised all-logs export** are live on master. The fix is on `charming-albattani-ql4hko`.
4. 🟠 **XSS in the BASICS printable manifest.** BASICS is not on master, but any merge of the older BASICS branches (`me0w45`, `js2209`, `lxijcg`, `4256wn`) would ship it. **Use `ob3h5a`.**
5. 🟠 **CUBIQ found that badge and cohort events have no server source.** Any device integration (CUBIQ, LOT·01, LD-01) that subscribes to them will get nothing until those events are added.
6. 🟠 **6 days without a merge.** Three diverging badge/wiki numbering lines (843 / 812 / 1339), plus QIE v113 on master versus v140 on the branch.
7. 🟡 **Story API from the brief** (`/api/story/:week_id/export`) is still not implemented, which blocks the robot and vehicle export.
8. 🟡 **FMCG milestone of 100 users by 2026-12-31 is 38 days away.** Billing is now `AWAITING PROVIDER`, so payment is unwired.

---
*Next run: compare against this file and check flags 1–3 first.*
