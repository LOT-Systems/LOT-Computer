# LOT-FM-001 / BASIC RATION — SESSION REPORT M1-S1
DATE: 2026-10-09  BRANCH: claude/beautiful-johnson-c7fguf  MONTH: 1 of 3 (LEDGER & DOCTRINE)

## STATUS vs ENVELOPE
MONTH 1 BUILD: OPEN TAB landed in code, read-only. NOT DEPLOYED. Typecheck of full app NOT RUN (npm ci failed in sandbox; shared + server-util files typechecked clean in isolation).

## RESEARCH FINDINGS
1. Prior Basics work (nifty-allen-jWyOe, beautiful-johnson-56p7ov per LOT-MANIFEST) is NOT in this repo: no such branches, no code. Built fresh.
2. The LOT-FM-001 manual was not available to this run. The 23-item load, cadences and quantities are a DRAFT authored to the stated envelope. Ratify against manual Section 2.
3. PRICE CONFLICT: `docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md` and About.tsx say Basic Essentials = USD 399/mo (and Usership USD 99/mo). This directive says USD 100/mo additive. Built to the directive; corporate docs need an S-2 decision.
4. Nav already carried a dead "Basics" button; it is now live.
5. LiberationMono-Bold is not bundled. CSS stack falls back to Liberation Mono / Courier New. Bundle the font file (Month 2).

## ENVELOPE CHECK (first finding)
First-pass cost plan landed at USD 54.07/mo (45.9% margin) — CEILING BREACHED. Re-planned bulk targets: USD 37.52/mo landed, 62.5% margin, 23 items. These are TARGETS, not quotes. Month 3 supplier quotes must confirm or the load changes. Biggest levers: fulfillment (7.00), toilet paper, coffee, underwear.

## DELIVERED
- `src/shared/constants/basics.ts` — 23-item manifest, cadences, doctrine, price, 64-col grid formatters, `itemsInMonth()`.
- `src/client/components/BasicsPage.tsx` — OPEN TAB: status line, doctrine, price line, ledger. Inversion-only, 2px rules, square, no color/icons.
- Route `/basics` (router, TabPanel, Layout nav enabled).
- `GET /api/public/basics` — public JSON of the same manifest. COGS never served.
- `src/server/utils/basics-cogs.ts` — server-only landed-cost plan + `marginReport()` (asserts 23 items, <=USD 40, >=60%).

## OPEN ITEMS
- Public (logged-out) access: logged-out visitors get the login entry, not the app, so OPEN TAB is public only via the API. Needs a public entry (like /about). Do first in S2.
- Run full `yarn build` + tsc in CI-equipped env; screenshot at phone width (64ch scrolls horizontally).
- Wire `marginReport()` into a test/CI gate.

## DISTRACTION ELIMINATED
Corporate-doc price reconciliation deferred; not touched this month.

## NEXT (M1-S2 → M2)
Public entry, font bundling, ratify load; then M2: UPGRADE state machine (USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE), roster intake, STAND DOWN.

## 90-DAY PLAN
M1 LEDGER & DOCTRINE (read-only, live) · M2 UPGRADE & ROSTER (billing, state machine, stand down) · M3 ISSUE & FULFILLMENT (load engine, quotes, manifest card, first ship, margin >=60%).
