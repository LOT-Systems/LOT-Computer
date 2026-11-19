# LOT-FM-001 · BASIC (RATION) · 90-DAY BUILD PLAN

```
MODULE   BASIC (RATION)          TAB      BASICS  (/basics)
PRICE    USD 100 / MO            MARGIN   >= 60%
CEILING  USD 40 LANDED / BOX     LINES    23
START    2026-11-19              END      2027-02-17
```

The Basics tab is the hardware / physical arm of the LOT System. It issues
one civilian ration per month to a Usership member who goes ON STRENGTH.

House style: monospace bold, theme ink on theme ground, hierarchy by
inversion only, 2px rules, square corners, fixed character grid, IBM 3270
register. Voice: quartermaster. No color, no radius, no icons, no marketing.

---

## MONTH 1 — LEDGER & DOCTRINE  (2026-11-19 → 2026-12-18)

| #   | TASK                                                         | STATE |
|-----|--------------------------------------------------------------|-------|
| 1.1 | Shared 23-line manifest (nomenclature, class, qty, cadence)  | DONE  |
| 1.2 | Server-only COGS ledger + envelope audit (12-mo cycle)       | DONE  |
| 1.3 | `npm run test:basics` — red if any box > USD 40 or < 60%     | DONE  |
| 1.4 | Public API `GET /api/public/basics/manifest` (no COGS)       | DONE  |
| 1.5 | Basics tab enabled in nav, route `/basics`                   | DONE  |
| 1.6 | OPEN TAB: guests at `/basics` read the ledger, no login wall | DONE  |
| 1.7 | StatusLine component (BASIC · STATE · NEXT ISSUE · LINES)    | DONE  |
| 1.8 | Bundle LiberationMono-Bold webfont (currently local() stack) | OPEN  |
| 1.9 | Reconcile manifest with FM-001 Section 2 source text         | OPEN  |
| 1.10| Deploy to production, verify `/basics` live for a stranger   | OPEN  |

EXIT: a stranger can read what LOT issues and on what terms. Read-only. Live.

## MONTH 2 — UPGRADE & ROSTER  (2026-12-19 → 2027-01-17)

State machine, persisted per user (`user.metadata.basics` first, own table
once billing lands):

```
USERSHIP/AI --UPGRADE--> PENDING --roster complete + first charge--> ON STRENGTH
ON STRENGTH --first issue delivered--> STEADY STATE
ANY (except USERSHIP/AI) --STAND DOWN--> USERSHIP/AI   (AI retained)
```

| #   | TASK                                                              |
|-----|-------------------------------------------------------------------|
| 2.1 | `basics` state field + server transitions (guarded, logged)       |
| 2.2 | UPGRADE control in tab (only for Usership tag)                    |
| 2.3 | Roster intake: shirt/brief size, ship-to, cadence start date      |
| 2.4 | Recurring USD 100/mo additive billing (Stripe sub item)           |
| 2.5 | STAND DOWN: cancel ration line, keep AI Usership                  |
| 2.6 | Issue log scaffold (table: user, month, lines, status, tracking)  |
| 2.7 | Admin view in `/us` — roster + state                              |

EXIT: a Usership member can go ON STRENGTH and back OFF, end to end.

## MONTH 3 — ISSUE & FULFILLMENT  (2027-01-18 → 2027-02-17)

| #   | TASK                                                              |
|-----|-------------------------------------------------------------------|
| 3.1 | Load engine: `linesForMonth(n)` per subscriber (already exists)   |
| 3.2 | Supplier quotes: flip each COGS line ESTIMATE → QUOTED → CONFIRMED|
| 3.3 | Printed manifest card (PDF, 3270 register, line 23)               |
| 3.4 | Monthly issue job in `scheduled-jobs.ts` → issue log rows         |
| 3.5 | NEXT ISSUE advances in StatusLine; issue history in tab           |
| 3.6 | First real issue dispatched; margin re-verified on actual costs   |

EXIT: first real ration ships to a real subscriber. Margin verified >= 60%.

---

## ENVELOPE (ESTIMATE, 2026-11-19)

```
PEAK BOX     USD 36.35 (MO 5)     CEILING  USD 40.00
FLOOR MARGIN 63.6%                FLOOR    60.0%
OVERHEAD     CARTON 1.20 + POSTAGE 9.50 per box
```

ELIMINATE ONE DISTRACTION: no item choice. One load for everyone.
