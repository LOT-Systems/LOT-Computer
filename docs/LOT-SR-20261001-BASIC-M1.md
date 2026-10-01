# LOT-SR-20261001-BASIC-M1 — BASIC (RATION) / MONTH 1 / SESSION 1

```
DATE     : 2026-10-01
CLASS    : ENGINEERING
MODULE   : BASIC (RATION) — LOT-FM-001
PHASE    : MONTH 1 — LEDGER & DOCTRINE (read-only)
STATUS   : INCREMENT BUILT. CLIENT BUILD NOT VERIFIED (see CHECKS).
```

## ENVELOPE (one line)
M1: OPEN TAB ledger built, read-only, 23 items / USD 100 / PROVISIONAL manifest. M2, M3 not started.

## FINDINGS
- Basics was a dead nav stub (`Layout.tsx`, no route). Now routed at `/basics`, enabled for logged-in and logged-out nav.
- LOT-FM-001 manual is NOT in the repo. The 23-item list is a DRAFT built from doctrine. Reconcile when the manual is committed. Marked `PROVISIONAL` in code and UI.
- No billing, subscription or plan model exists in `prisma/schema.prisma`. Usership is a user tag (`usership`). M2 UPGRADE must add a ration-subscription model; a payment processor is not present in repo.

## BUILD
| File | Change |
|---|---|
| `src/shared/constants/ration.ts` | NEW. 23-item manifest, cadence, doctrine, price, margin/landed ceilings, `itemsInIssue(month)` load engine seed. No COGS stored. |
| `src/client/components/BasicsPage.tsx` | NEW. StatusLine component, doctrine, ledger grouped by cadence, ISSUE 01–04 selector (dims items not in that issue), terms line. |
| `src/client/stores/router.ts` | `basics: '/basics'` route. |
| `src/client/components/ui/Layout.tsx` | Basics nav enabled. |
| `src/client/entries/app.tsx` | Basics TabPanel. |
| `src/server/index.ts`, `server.ts` | `/basics` added to KNOWN_CLIENT_ROUTES. |

## CHECKS
```
ration.ts strict tsc standalone : PASS
itemsInIssue lines/issue        : 1:23  2:13  3:13  4:20  7:21  13:22  (23 items verified)
Full client build / tsc project : NOT RUN — node_modules absent, registry 403 in sandbox
Visual check in browser         : NOT RUN
```
House style note: used existing tokens (`bg-acc`, `text-bac`, `border-acc`, `font-mono`, 2px rule, no radius). LiberationMono-Bold not verified against app font stack; the app's global font is inherited.

## MARGIN ENVELOPE (ESTIMATE, internal, not public)
Draft 23-item load, steady-state landed estimate roughly USD 30–36/mo at volume; issue 1 (23 lines incl. flash drive) higher. Unquoted. No supplier quotes exist; M3 must confirm. Ceiling USD 40 / floor 60% margin NOT yet verified.

## RISKS
1. Build unverified — run `yarn client:build` in CI before merge.
2. Item list is invented; owner must approve or replace.
3. Payments absent; M2 scope larger than the directive implies.

## DISTRACTION ELIMINATED
Self-care/badge widget expansion paused for this module.

## NEXT (SESSION 2 → MONTH 2)
UPGRADE control + state machine (USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE), roster intake schema (migration), STAND DOWN, issue-log scaffold. Needs owner decision: payment processor.
