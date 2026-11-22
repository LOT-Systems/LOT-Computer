# SESSION REPORT — LOT-SR-20261122-BASICS-M1

```
================================================================================
LOT SYSTEMS — SESSION REPORT
MODULE: BASIC (RATION) · LOT-FM-001 · MONTH 1 — LEDGER & DOCTRINE
DATE: 2026-11-22 · BRANCH: claude/beautiful-johnson-me0w45
RUN: SCHEDULED (unattended)
STATUS LINE: M1 BUILT · 23/23 LINES · PEAK LANDED 39.15 ≤ 40.00 · MIN MARGIN 61.0% · ENVELOPE GREEN
================================================================================
```

## 1. STATE ON ENTRY

- No prior Basics work in repo. `Basics` nav button existed but was disabled
  (no route).
- No LOT-FM-001 manual in repo; the 23-item load, cadence and COGS were
  authored this session (draft — needs S-2 sign-off, see FM Section 7).

## 2. WHAT WAS BUILT

| File | Change |
|------|--------|
| `src/shared/basics/manifest.ts` | NEW. 23-line manifest (nomenclature, code, qty/UI, supply class, cadence, phase, sized flag), doctrine, terms, `shipsOnIssue` / `loadForIssue` load engine, `nextIssueDate`. No COGS. |
| `src/server/utils/basics-cogs.ts` | NEW. Server-only unit costs + overhead, `envelopeForIssue`, `auditCycle`. |
| `scripts/tests/basics-envelope.ts` + `npm run test:basics` | NEW. Fails red on: any issue > USD 40 landed, margin < 60%, item count ≠ 23, duplicate line, missing cost, recurring line not shipping within 12 issues. |
| `src/client/components/Basics.tsx` | NEW. OPEN TAB: header bar, DOCTRINE, TERMS, MANIFEST by class, FIRST ISSUE load 000, UPGRADE path (roster closed), status line. Terminal register. |
| `src/client/entries/basics.tsx` + build entry | NEW public entry for logged-out `/basics`. |
| `src/client/stores/router.ts` | `basics: '/basics'` route. |
| `src/client/components/ui/Layout.tsx` | Basics nav enabled (logged in: route; logged out: `href` full-page nav). Logged-out System gets `href: '/'` so it leaves the public page. |
| `src/client/entries/app.tsx` | Basics TabPanel. |
| `src/server/index.ts`, `src/server/server.ts` | `/basics` added to client routes; logged-out visitors get the public entry instead of login. |
| `docs/basics/LOT-FM-001-BASIC-RATION.md` | NEW field manual: doctrine, load table, envelope, visual spec, state machine, 90-day plan, open decisions. |

## 3. CHECKS

| Check | Result |
|-------|--------|
| `npm run test:basics` (24-issue audit) | GREEN — peak 39.15, avg 35.16, min margin 61.0% |
| First draft of load | RED (peak 45.05, avg 40.38) → rebalanced: chocolate 2→1 bar, clothing Q→S, phases spread. Then GREEN. |
| `tsc -p tsconfig.server.json` | 0 errors |
| `tsc -p tsconfig.json` (client) | 128 lines before, 128 after — no new errors (all pre-existing) |
| `npm run client:build` | completed |
| `npm run server:build` | completed; `#shared/basics/manifest` resolves in dist |
| COGS leak scan of `dist/client/js/*` | 0 chunks contain `LINE_COST` / `ISSUE_OVERHEAD` |
| Playwright render of public `/basics`, 1280 + 390 wide | 0 page errors, no horizontal scroll |
| Full server boot against DB | NOT RUN (no database in this container) |

Screenshots: `docs/basics/img/m1-open-tab-desktop.png`,
`docs/basics/img/m1-open-tab-phone.png`.

## 4. ENVELOPE (24 ISSUES)

```
ISSUE  LINES                              CONTENTS  LANDED  MARGIN
000    01 02 03 05 10 11 18 20 21 23      26.45     39.15   61.0%
001    01 02 03 06 10 12 14 23            24.65     37.35   63.0%
002    01 02 03 08 10 11 13 15 19 23      21.95     34.65   65.0%
003    01 02 03 07 10 18 20 23            22.95     35.65   64.0%
004    01 02 03 10 11 12 14 16 23         21.05     33.75   66.0%
005    01 02 03 04 09 10 13 15 19 23      20.65     33.35   67.0%
006    01 02 03 10 11 18 20 21 23         19.95     32.65   67.0%
007    01 02 03 06 10 12 14 23            24.65     37.35   63.0%
008    01 02 03 08 10 11 13 15 19 23      21.95     34.65   65.0%
009    01 02 03 07 10 18 20 23            22.95     35.65   64.0%
010    01 02 03 10 11 12 14 16 22 23      23.65     36.35   64.0%
011    01 02 03 04 10 13 15 17 19 23      21.95     34.65   65.0%
(issues 012–023 repeat 000–011 without line 05)
```

All costs are planning estimates (`quoted: false`). Month 3 replaces them
with supplier quotes.

## 5. MONTH 1 EXIT AGAINST CRITERIA

> A stranger can read what LOT issues and on what terms. Read-only. Live.

- Read what LOT issues: YES — 23 lines, nomenclature + cadence, COGS withheld.
- On what terms: YES — price, requirement, dispatch day, stand-down rule.
- Read-only: YES — no inputs, no fetches.
- Live: NO, NOT YET — on branch `claude/beautiful-johnson-me0w45`, not merged
  or deployed. Needs a PR + deploy (no PR opened; not requested).

## 6. NEXT SESSION (MONTH 2 — UPGRADE & ROSTER)

1. `user.metadata.basics` state + server routes: `POST /api/basics/upgrade`,
   `POST /api/basics/roster`, `POST /api/basics/stand-down`, `GET /api/basics/me`.
2. Pure state-machine module in `src/shared/basics/state.ts` with transition
   table + tests.
3. Roster intake form in the tab (sizes for lines 06–09, ship-to, cadence
   start), terminal register.
4. Billing: blocked on S-2 processor decision (FM Section 7.1). Build behind
   an interface with a manual/admin "mark paid" adapter so the state machine
   can be demonstrated end to end without a processor.
5. Issue log scaffold (empty ledger rendered under status line).

## 7. DECISIONS NEEDED FROM S-2

1. Payment processor for USD 100/mo additive billing (recommend Stripe).
2. Sign-off on the drafted 23 lines.
3. Self-hosted Liberation Mono Bold vs system monospace fallback.

```
ELIMINATED DISTRACTION: per-month landed-cost averaging. The ceiling is enforced per issue.
END OF REPORT
```
