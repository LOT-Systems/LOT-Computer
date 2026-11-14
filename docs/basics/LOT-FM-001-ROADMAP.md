# LOT-FM-001 / BASIC (RATION) — 90-DAY BUILD ROADMAP

LIVING DOCUMENT. EACH SESSION UPDATES STATUS COLUMNS AND APPENDS A SESSION REPORT
IN `docs/basics/`. THE LEDGER IS THE MARKETING.

```
ENVELOPE   PRICE USD 100/MO · LANDED COGS ≤ USD 40 · MARGIN ≥ 60%
CLOCK      DAY 0 = 2026-11-14 · M1 ENDS 2026-12-14 · M2 ENDS 2027-01-13 · M3 ENDS 2027-02-12
SOURCE     src/shared/constants/basic-ration.ts   (manifest + load engine, single source)
UI         src/client/components/Basics/           (tab at /basics)
API        /api/basic/*  (user) · /admin-api/basic/* (operator) · /api/public/basic/manifest (open)
```

## MONTH 1 — LEDGER & DOCTRINE (READ-ONLY, LIVE)

| # | ITEM | STATUS |
|---|------|--------|
| 1.1 | Basics tab enabled in nav, `/basics` route, server serves SPA at `/basics` | DONE (S-01) |
| 1.2 | 23-item manifest ledger — nomenclature + cadence, COGS withheld | DONE (S-01) |
| 1.3 | Doctrine block + price line (USD 100/MO) | DONE (S-01) |
| 1.4 | Status-line component | DONE (S-01) |
| 1.5 | Terminal tokens: mono, white/black, 2px rules, square corners | DONE (S-01) — CSS now actually ships |
| 1.6 | Public manifest endpoint `GET /api/public/basic/manifest` | DONE (S-01) |
| 1.7 | OPEN TAB for logged-out strangers (public page rendering 1.6) | OPEN — logged-out `/basics` still serves login bundle |
| 1.8 | Ratify the 23-item load with S-2 (current list is a draft, see report §4) | OPEN — DECISION |

EXIT: A STRANGER CAN READ WHAT LOT ISSUES AND ON WHAT TERMS. → BLOCKED ON 1.7.

## MONTH 2 — UPGRADE & ROSTER (USERSHIP/AI → BASIC)

| # | ITEM | STATUS |
|---|------|--------|
| 2.1 | State machine USERSHIP → PENDING → ON STRENGTH → STEADY STATE | DONE (S-01) |
| 2.2 | UPGRADE control | DONE (S-01) |
| 2.3 | Roster intake (sizing, shipping, cadence start) — whitelisted + validated | DONE (S-01) |
| 2.4 | STAND DOWN from any non-USERSHIP state; issue log retained; re-up continues numbering | DONE (S-01) |
| 2.5 | Issue log scaffold | DONE (S-01) |
| 2.6 | Recurring USD 100/MO additive billing | BLOCKED — no billing integration in codebase (only `users.stripeCustomerId`). Needs S-2 decision + Stripe keys |
| 2.7 | Gate UPGRADE on active Usership (AI plan) | OPEN — define what "Usership" means in data (tag? metadata?) |
| 2.8 | Run migrations `20261114000001/2` against prod DB | OPEN — on deploy |

EXIT: A USERSHIP MEMBER CAN GO ON STRENGTH AND BACK OFF, END TO END. → BLOCKED ON 2.6.

## MONTH 3 — ISSUE & FULFILLMENT (THE BOX SHIPS)

| # | ITEM | STATUS |
|---|------|--------|
| 3.1 | Month-by-month load engine (single shared source) | DONE (S-01) |
| 3.2 | Next-issue block + printable manifest card | DONE (S-01) |
| 3.3 | Operator fulfillment API: forward-only SCHEDULED→PACKED→SHIPPED→DELIVERED, auto-schedule next | DONE (S-01), admin-only |
| 3.4 | Operator fulfillment UI (queue in admin) | OPEN |
| 3.5 | Supplier quotes per item; landed cost per issue type (full / quarterly / monthly) | OPEN — off-platform |
| 3.6 | `marginCheck()` wired to real landed costs; badge flips UNVERIFIED → VERIFIED | OPEN — needs 3.5 |
| 3.7 | First issue scheduled and dispatched to a real subscriber | OPEN |

EXIT: FIRST REAL RATION SHIPS TO A REAL SUBSCRIBER. MARGIN VERIFIED ≥60%.

## LOAD ENGINE (CANONICAL)

```
ISSUE N, MONTH INDEX m = N-1
MONTHLY        every issue          18 items
QUARTERLY      m % 3 == 0           +4  (07 TOOTHBRUSH, 14 BANDAGES, 22 NOTECARD, 23 PEN)
SEMI-ANNUALLY  m % 6 == 0           +1  (13 NAIL CLIPPERS)
ANNUALLY       m % 12 == 0          +0  (none in current load)

ISSUE   1  2  3  4  5  6  7  8  9 10 11 12 13
ITEMS  23 18 18 22 18 18 23 18 18 22 18 18 23
```

The full 23-item load (issues 1, 7, 13…) is the COGS-critical box: it must clear the
USD 40 ceiling on its own, not on average.
