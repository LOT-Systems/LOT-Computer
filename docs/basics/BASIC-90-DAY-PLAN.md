# BASIC (RATION) — 90-DAY PLAN — LOT-FM-001

ENVELOPE: USD 100/MO · MARGIN ≥ 60% · LANDED ≤ USD 40 · 23 ITEMS · NEVER BREACH CEILING.
HOUSE STYLE: LiberationMono-Bold · white/black · inversion-only · 2px rules · square · fixed grid.

| MONTH | NAME | EXIT |
|---|---|---|
| 1 | LEDGER & DOCTRINE | Stranger reads what LOT issues and on what terms. Read-only. Live. |
| 2 | UPGRADE & ROSTER | Usership member goes ON STRENGTH and back OFF, end to end. |
| 3 | ISSUE & FULFILLMENT | First real ration ships. Margin verified ≥ 60%. |

## MONTH 1 — task ledger
- [x] Manifest model, 23 items, cadence, section (`src/shared/basic/manifest.ts`) — DRAFT-0 nomenclature
- [x] Fixed-grid ledger renderer (`src/shared/basic/ledger.ts`, GRID = 54)
- [x] Public OPEN TAB `GET /basics` (stranger) + `GET /api/public/basic/manifest`
- [x] In-app Basics tab wired (router, nav, TabPanel)
- [x] Status-line component (inversion bar) + doctrine + price line
- [x] Test `scripts/tests/test-basic-manifest.ts`
- [ ] S-2: replace DRAFT-0 nomenclature with LOT-FM-001 actuals (manual not in repo)
- [ ] Terminal tokens extracted to shared CSS (currently inline in public page)

## MONTH 2 — build order
1. State machine `USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE`, `STAND DOWN` → AI retained. Pure module + tests first.
2. DB: `basic_roster` (user, state, sizing, address, cadence_start), `basic_issue_log`. Migration under `/migrations`.
3. UPGRADE control in Basics tab; roster intake form (sizing, shipping, cadence start).
4. Billing: additive $100/mo line item on top of AI plan; STAND DOWN removes only the ration line. Needs billing-provider decision (see OPEN).
5. Issue log scaffold (read-only list in tab).

## MONTH 3 — build order
1. Load engine: `issuedInMonth(n)` already exists (M1 = full load; then by cadence). Wire to roster.
2. Supplier quotes → COGS table (server-only, never in public model); assert landed ≤ USD 40 per issue.
3. Printed manifest card (PDF/print CSS, 3270 register).
4. Schedule + dispatch first issue; NEXT ISSUE advances on dispatch; issue log accrues.
5. Margin check script: fails build if margin < 60%.

## OPEN (blocks, need S-2)
- LOT-FM-001 manual: real 23-item nomenclature and cadences.
- Billing provider for recurring additive charge (Month 2 gate).
- Fulfillment partner / supplier shortlist (Month 3 gate).
- Pricing conflict: `About.tsx` still states "$399/month Basic Essentials" and "$99/month modular" — contradicts USD 100/mo.

## DISTRACTION ELIMINATED
Self-care / Kids / Home tabs: FROZEN. Remain disabled placeholders until BASIC ships. No work, no copy, no design.
