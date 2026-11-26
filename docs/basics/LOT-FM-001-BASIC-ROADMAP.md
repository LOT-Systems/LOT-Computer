# LOT-FM-001 / MODULE: BASIC (RATION) — 90-DAY BUILD PLAN

```
STATUS LINE ── LOT-FM-001 │ BASIC │ BUILD DAY 001/090 │ MONTH 1 │ ENVELOPE: HELD
```

Start: 2026-11-26 · End state due: 2027-02-24 · Branch: `claude/beautiful-johnson-w1hqob`

## 0. ENVELOPE (NEVER BREACH)

| TERM            | VALUE                         |
|-----------------|-------------------------------|
| PRICE           | USD 100 / MO, additive to Usership |
| LANDED CEILING  | ≤ USD 40.00 per box, every month |
| MARGIN FLOOR    | ≥ 60% every month             |
| GATE            | `yarn test:basics` must be GREEN before any push |

## 1. MONTH 1 — LEDGER & DOCTRINE (2026-11-26 → 2026-12-25)

EXIT: a stranger can read what LOT issues and on what terms. Read-only. Live.

| # | TASK | STATE |
|---|------|-------|
| 1.1 | 23-line manifest as shared data (nomenclature, qty, class, cadence, offset) | DONE S1 |
| 1.2 | Server-only COGS ledger + 12-month envelope check | DONE S1 |
| 1.3 | `yarn test:basics` envelope gate | DONE S1 |
| 1.4 | Public endpoint `GET /api/public/basics/manifest` (COGS withheld) | DONE S1 |
| 1.5 | OPEN TAB UI: status line, doctrine, price line, ledger, 12-mo load viewer | DONE S1 |
| 1.6 | `/basics` route: public entry (logged out) + in-app tab (logged in); nav enabled | DONE S1 |
| 1.7 | S-2 review of nomenclature + doctrine copy against LOT-FM-001 source | OPEN |
| 1.8 | Self-host LiberationMono-Bold (SIL OFL) in `public/fonts` — currently system fallback | OPEN |
| 1.9 | Deploy to production; verify `/basics` live for logged-out visitor | OPEN |
| 1.10 | OG/meta tags for `/basics` so the link reads as the ledger when shared | OPEN |

## 2. MONTH 2 — UPGRADE & ROSTER (2026-12-26 → 2027-01-24)

EXIT: a Usership member can go ON STRENGTH and back OFF, end to end.

| # | TASK |
|---|------|
| 2.1 | DB migration: `basic_enrollments` (userId, state, startedAt, standDownAt, cycleMonth, sizing, ship-to, cadenceStart) + `basic_issue_log` |
| 2.2 | State machine server-side: `USERSHIP_AI → PENDING → ON_STRENGTH → STEADY_STATE`, `STAND_DOWN → USERSHIP_AI`; transitions logged; illegal transitions rejected |
| 2.3 | UPGRADE control on Basics tab (Usership only); STAND DOWN control (drops ration, retains AI) |
| 2.4 | Roster intake form: sock size, ship-to, cadence start date. Terminal-grid inputs |
| 2.5 | Recurring USD 100/mo billing, additive line on existing Usership billing (provider decision required from S-2 — no payment provider is wired in repo today) |
| 2.6 | Issue log scaffold rendered on tab (empty until Month 3) |
| 2.7 | Status line driven by real state; NEXT ISSUE computed from cadenceStart |

## 3. MONTH 3 — ISSUE & FULFILLMENT (2027-01-25 → 2027-02-24)

EXIT: first real ration ships to a real subscriber. Margin verified ≥ 60%.

| # | TASK |
|---|------|
| 3.1 | Load engine: `loadForMonth(cycleMonth)` per subscriber (already pure + tested) → pick list |
| 3.2 | Supplier quotes for all 23 lines replace planning COGS; gate re-run on real figures |
| 3.3 | Printed manifest card generation (PDF, 3270 register, per box) |
| 3.4 | Admin dispatch view in `/us`: due boxes, pick list, mark DISPATCHED + tracking |
| 3.5 | First issue scheduled and dispatched; issue log accrues; NEXT ISSUE advances |
| 3.6 | Margin verification report from actual landed cost of box #1 |

## 4. DISTRACTION ELIMINATED

No item choice, no add-ons, no tiers. One box, one cadence. Rejected for the whole build.
