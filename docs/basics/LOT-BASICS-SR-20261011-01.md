# LOT-FM-001 / BASIC (RATION) — SESSION REPORT 01

```
ID      : LOT-BASICS-SR-20261011-01
DATE    : 2026-10-11
MODULE  : BASICS TAB (hardware / physical layer)
PHASE   : MONTH 1 — LEDGER & DOCTRINE   (day 1 of 90)
BRANCH  : claude/beautiful-johnson-68tr9u
STATUS  : OPEN TAB BUILT, READ-ONLY. NOT YET VERIFIED IN A BROWSER. NOT DEPLOYED.
```

## FINDINGS

- Basics was a dead nav stub (`Layout.tsx`, no route). Now routed at `/basics`.
- LOT-FM-001 is **not in the repo**. The 23-item load, cadences and COGS are
  **provisional**, derived from the About page ("basic wardrobe, organic
  self-care, home"). Reconcile against the manual's Section 2 before launch.
- No `node_modules` in this container: full `tsc`/build/browser check NOT run.
  Only `src/shared/basics.ts` was typechecked standalone (strict, pass).
  `Basics.tsx` and the wiring edits are unverified by compiler.

## SHIPPED (Month 1 increment)

| File | Change |
|---|---|
| `src/shared/basics.ts` | 23-item manifest (nomenclature, qty, cadence, phase), price, margin floor, `dueInMonth()`. COGS deliberately absent from client bundle. |
| `src/client/components/Basics.tsx` | OPEN TAB: status line, doctrine, ledger by group, terms. Inversion-only, 2px rules, uppercase, no color/radius/icons. |
| `stores/router.ts`, `Layout.tsx`, `entries/app.tsx` | `basics` route, enabled nav link, tab panel. |
| `server/index.ts`, `server/server.ts` | `/basics` added to KNOWN_CLIENT_ROUTES. |

Load: 8 WEAR / 9 CARE / 6 HOME. Items per month (phased): 12,15,14,13,14,13,11,14,14,13,14,13.

## ENVELOPE CHECK (planning estimates, NOT supplier quotes)

```
Fixed per issue (pack+ship+card) : USD 6.50 assumed
Avg landed / issue (12-mo)       : USD 35.82   ceiling 40   -> PASS
Avg margin                       : 64.2%       floor 60%    -> PASS
Peak issue                       : USD 41.00 (months 3, 9)  -> BREACH by 1.00
```

Unstaggered cadence (all items due month 1) landed at ~USD 85 in issue 1.
Cadence **phase** was added to stagger the load. Residual two-month breach is
open: Month 3 must re-balance phases / swap SKUs against real quotes.
The USD 40 ceiling is read as per-issue. If it is an average, current state passes.

## OPEN QUESTIONS FOR S-2

1. Supply LOT-FM-001 (or confirm the provisional 23). Is ceiling per-issue or average?
2. Public access: tab shows for logged-out users only if the app shell renders
   without auth. Not verified. Needs a decision on a dedicated public route.

## 90-DAY PLAN

- **M1 (now)**: ledger live. Remaining: install deps, build, browser check,
  deploy; status-line component extraction; reconcile with manual.
- **M2**: UPGRADE state machine USERSHIP/AI → PENDING → ON STRENGTH → STEADY
  STATE; roster intake; recurring USD 100 additive billing (Stripe, check the
  existing SubscribeWidget); STAND DOWN; issue log scaffold (Prisma migration).
- **M3**: load engine on `dueInMonth`; supplier quotes vs ceiling; printed
  manifest card; first dispatch; margin verification.

## DISTRACTION ELIMINATED

Badge-codex expansion cycle (v20–v32 style sessions) paused for this module.

## STATUS vs ENVELOPE

`M1: ledger built, unverified, unlaunched. COGS avg in envelope, 2 peak months over.`
