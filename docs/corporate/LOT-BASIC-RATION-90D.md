# LOT-FM-001 / BASIC (RATION) — 90-DAY BUILD PLAN

S-2: VADIK MARMELADOV · Opened 2026-10-25 · Status: M1 SHIPPED TO BRANCH

## ENVELOPE (fixed)
- Price USD 100/mo. Landed cost ≤ USD 40/mo. Net margin ≥ 60% (after card fees).
- Check: `npm run basics:envelope` (private cost model, `scripts/basics-envelope.ts`).
- Model today: goods 27.35 + pack/freight 8.50 + fees 3.20 = 39.05 → margin 60.9%. Headroom USD 0.95/mo.
- All unit costs are PROVISIONAL TARGETS. Supplier quotes replace them in Month 3.

## DOCTRINE
Issue, do not sell. The ledger is the marketing. COGS stays off the public surface.

## MONTH 1 — LEDGER & DOCTRINE (read-only)
- [x] Route `/basics`, nav tab live (logged-in), TabPanel wired.
- [x] 23-item manifest (`src/shared/constants/basic.ts`): nomenclature + cadence.
- [x] Doctrine block, price line, status-line component, inversion-only grid.
- [x] Envelope check script, npm script.
- [ ] Ratify the 23 items against LOT-FM-001 (S-2). Current list PROVISIONAL.
- [ ] Logged-out public render of OPEN TAB (needs routing outside auth shell).
- [ ] Visual QA against live theme (screenshot).

## MONTH 2 — UPGRADE & ROSTER
- State machine: USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE; STAND DOWN returns to USERSHIP/AI.
- Server: `ration_subscription` model + migration; routes under `/api/basic/*`.
- Roster intake: sizing, shipping address, cadence start.
- Billing: recurring USD 100/mo additive. DECISION NEEDED: Stripe vs existing processor.
- Issue log scaffold.

## MONTH 3 — ISSUE & FULFILLMENT
- Load engine: `itemsForMonth(n)` already in manifest module (M1). Add stagger offsets to flatten box cost.
- Supplier quotes → replace provisional costs; re-run envelope; block ship on FAIL.
- Printed manifest card (PDF) per issue. First issue scheduled and dispatched. NEXT ISSUE advances.

## OPEN DECISIONS (S-2)
1. 23-item list: ratify or supply LOT-FM-001 Section 2.
2. Price conflict: `LOT_FMCG_SUBSCRIPTION_PLAN_2027.md` states Basic Essentials USD 399/mo; this directive says USD 100/mo. Directive followed; reconcile the plan doc.
3. LOT-MANIFEST lists "Basics Tab · beautiful-johnson-56p7ov · M1 live" but that branch does not exist on origin and no Basics code was on master. M1 rebuilt from scratch here.
4. Payment processor for recurring billing.

## DISTRACTION ELIMINATED
Multi-tier module upsell (+Kids / +Home) from the 2027 FMCG plan. BASIC ships alone first.
