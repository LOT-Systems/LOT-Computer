# LOT-SR-20261107-BASICS-01 — BASIC (RATION) MODULE / LOT-FM-001

```
DATE     : 2026-11-07
CLASS    : ENGINEERING
BRANCH   : claude/beautiful-johnson-fmv125
S-2      : VADIK MARMELADOV
STATUS   : M1+M2+M3 CODE ON BRANCH. BUILD NOT VERIFIED. NOT SHIPPED.
```

## INTAKE
Task: develop the Basics tab (LOT-FM-001 BASIC ration) over a 3-month plan.

## FINDING
Basics tab was nav-stubbed only (no route) on master. Nine prior feature
branches exist, none merged (nifty-allen-{jWyOe,0m1Tv,2UqYA,4UMuG,uGcQk,yhgtl}
and others). Most are large, diverged from stale bases. Branch
`nifty-allen-2UqYA` is the only one with clean month-by-month commits
(M1 / M2 / M3). Selected as BEST; cherry-picked onto current HEAD.

## ACTION
- cherry-pick cdd21e3f0, 829f1cf5b, dc0495363 -> ca2f3a6d3, 024356f8e, f38403e49
- One conflict: `src/client/entries/app.tsx` (master since refactored to
  `TabPanels`). Resolved by taking master and adding `basics` panel + route.
- Result: 19 files. Route `/basics`, nav button live.

## DELIVERED BY MONTH
| MONTH | STATE | CONTENT |
|---|---|---|
| 1 LEDGER & DOCTRINE | code present | 23-item manifest ledger (COGS withheld in UI), doctrine, price line, status line |
| 2 UPGRADE & ROSTER | code present | UpgradeControl state machine, RosterForm, IssueLog scaffold, `ration_subscriptions` migration, `/api/basics` routes |
| 3 ISSUE & FULFILLMENT | code present | `ration_issues` migration, issue-engine load-by-month, `RationIssue` model |

## MARGIN CHECK (from rationManifest.ts, COGS per item)
```
23 items            : 12 MONTHLY  22.00 | 9 QUARTERLY 14.00 | 2 SEMI-ANNUAL 3.50
Monthly box         : $22.00  -> margin 78.0%
Quarterly box       : $36.00  -> margin 64.0%
Worst box (Q + SA)  : $39.50  -> margin 60.5%   (floor 60%, ceiling $40)
```
RISK: $39.50 is item COGS only. Shipping, box, and payment fees are not in the
manifest. If "landed" includes freight, the ceiling is breached in the worst
month. Supplier quotes are ESTIMATES, not confirmed. Month 3 exit
("margin verified") is NOT met.

## NOT DONE / BLOCKERS
- Build and typecheck NOT run: no `node_modules` in the environment.
- Billing: recurring $100/mo additive billing not verified wired to Stripe.
- No real supplier quotes; no first real shipment; no printed card output.
- Migrations not applied to any database.
- Nothing deployed.

## NEXT SESSION
1. `yarn install`; run tsc + client build; fix errors.
2. Apply migrations on staging; exercise UPGRADE -> STAND DOWN end to end.
3. Add shipping/packaging to margin model; confirm landed cost <= $40.
4. Wire billing. Obtain supplier quotes.
5. Delete or archive the 8 unmerged nifty-allen branches (distraction).

## ELIMINATED DISTRACTION
Parallel Basics implementations. One path retained.
