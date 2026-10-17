# LOT-FM-001 / BASIC (RATION) — 90-DAY PLAN

```
STATUS   : M1 SHIPPED IN CODE (this session) · M2, M3 PLANNED
ENVELOPE : USD 100/MO · MARGIN >= 60% · LANDED COGS <= USD 40 (HARD CEILING)
STYLE    : LiberationMono-Bold · white/black · inversion hierarchy · 2px rules
           square corners · fixed grid · no color / radius / icons
```

## OPEN ITEMS (NEED S-2)

```
1. LOT-FM-001 SECTION 2 (the 23-item list + cadence) is NOT in the repo.
   src/shared/basics/ration.ts holds a PROVISIONAL draft. Ratify or replace.
2. LiberationMono-Bold is not yet loaded in src/client/index.css. Basics tab
   inherits the app font until the token pass (M1 follow-up).
3. OPEN TAB is public by intent; the app shell currently requires login.
   A logged-out surface needs its own entry (see M1 follow-up).
4. Billing provider for additive USD 100/mo not decided in-repo. Check what
   SubscribeWidget uses before choosing (M2).
```

## M1 — LEDGER & DOCTRINE (weeks 1-4)

```
W1  [DONE] Basics route (/basics), nav enabled, 23-row ledger, doctrine, price line,
           status-line component. Client build green. Typecheck delta: 0.
W2  Ratify 23 items vs FM-001 §2. Load LiberationMono-Bold. Extract terminal
    tokens (grid, 2px rule, inversion) into index.css.
W3  Public entry for logged-out users (/basics served without session).
W4  Cadence view: month-by-month load table (derived from item cadence).
EXIT: stranger reads what LOT issues and on what terms. Read-only. Live.
```

## M2 — UPGRADE & ROSTER (weeks 5-8)

```
State machine : USERSHIP/AI -> PENDING -> ON STRENGTH -> STEADY STATE
                STAND DOWN (any ration state -> USERSHIP/AI; AI retained)
W5  Prisma model: Roster (userId, state, sizing, shipTo, cadenceStart) + migration.
W6  API: POST /api/basics/upgrade, /stand-down; GET /api/basics/roster. Server owns transitions.
W7  Roster intake UI (sizing, shipping, cadence start). UPGRADE control on tab.
W8  Additive recurring billing; issue-log scaffold; end-to-end ON/OFF test.
EXIT: a Usership member goes ON STRENGTH and back OFF.
```

## M3 — ISSUE & FULFILLMENT (weeks 9-13)

```
W9   Load engine: f(item cadence, cadenceStart, month) -> issue manifest.
W10  Supplier quotes per item; landed-cost sheet; CI check fails if sum > USD 40.
W11  Printed manifest card (PDF, 1 per issue).
W12  Schedule + dispatch first issue; issue log accrues; NEXT ISSUE advances.
W13  Verify realised margin >= 60% on first real shipment.
EXIT: first ration ships to a real subscriber.
```

## COGS BUDGET RULE

```
Per-item budget caps are set in M3 W10 from real quotes. None are published and
none are asserted here. Gate: sum(landed) <= 40.00 else the item is swapped,
not the price.
```

## DISTRACTION ELIMINATED

```
Badge/RPG/quantum-widget expansion paused for the BASIC build window.
```
