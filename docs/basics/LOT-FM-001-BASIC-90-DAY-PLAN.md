# LOT-FM-001 / BASIC (RATION) — 90-DAY BUILD PLAN

```
FORM ........ LOT-FM-001
MODULE ...... BASIC (RATION) — the Basics tab, hardware/physical layer of LOT®
PRICE ....... USD 100 / MONTH, ADDITIVE TO USERSHIP (AI)
ENVELOPE .... LANDED ≤ USD 40 / ISSUE  →  MARGIN ≥ 60%
WINDOW ...... 2026-11-13 → 2027-02-11 (3 × 30-DAY INCREMENTS)
BRANCH ...... claude/beautiful-johnson-uyf9zk
```

Operating rules: issue, do not sell. The member is ON STRENGTH. The ledger is
the marketing. Ship a working, demonstrable increment at the end of every
month. Never breach the ceiling.

---

## 0. PRIOR ART

Branch `claude/nifty-allen-jWyOe` (commit `8b07ca96`, 2026-05-30) built all
three months in one pass. It was never merged and now sits ~400 files behind
master. Defects noted in review:

- One-shot build; nothing demonstrable per month, no envelope gate.
- Manifest carried a sizing form (shirt/pants/shoe) but no apparel lines.
- Every non-monthly item landed on issue 01 — guaranteed ceiling breach on the
  first box, the one that matters most.
- No public surface for strangers; the tab was login-only.

This plan rebuilds on current master in monthly increments and reuses only
the doctrine and the state-machine vocabulary.

---

## 1. MONTH 1 — LEDGER & DOCTRINE (2026-11-13 → 2026-12-12)

The System exists, read-only.

| ID | Build | Status |
|----|-------|--------|
| M1.1 | Shared 23-line load: nomenclature, qty, unit of issue, cadence + phase (`src/shared/constants/basics.ts`) | DONE S-01 |
| M1.2 | Server-only cost envelope, planning COGS, 12-issue cycle check (`src/server/utils/basics-envelope.ts`) | DONE S-01 |
| M1.3 | Envelope gate script, exits 1 on breach (`yarn basics:envelope`) | DONE S-01 |
| M1.4 | `GET /api/public/basics`: ledger header + envelope status only. No COGS | DONE S-01 |
| M1.5 | Public OPEN TAB at `/basics` for strangers (`basics` entry) | DONE S-01 |
| M1.6 | Basics nav tab enabled for signed-in members (`/basics` route) | DONE S-01 |
| M1.7 | Terminal tokens: mono bold, ground/ink, inversion, 2px rules, square, char grid | DONE S-01 |
| M1.8 | Status-line component (FORM / PHASE / STATE / ENVELOPE / DTG) | DONE S-01 |
| M1.9 | Deploy to production; verify `/basics` signed-out returns the OPEN TAB | OPEN: needs merge |
| M1.10 | Self-hosted Liberation Mono Bold woff2 (currently a system font stack) | OPEN |
| M1.11 | OG/meta tags so a shared `/basics` link previews the ledger | OPEN |

**EXIT:** A stranger can read what LOT issues and on what terms. Read-only. Live.

## 2. MONTH 2 — UPGRADE & ROSTER (2026-12-13 → 2027-01-11)

Usership (AI) → BASIC, end to end.

| ID | Build |
|----|-------|
| M2.1 | Migration `basic_enlistments`: userId, state, roster JSON, cadenceStart, billingRef, timestamps |
| M2.2 | State machine (server-authoritative): `USERSHIP → PENDING → ON_STRENGTH → STEADY_STATE`, plus `STAND_DOWN → USERSHIP`. Illegal transitions return 409 |
| M2.3 | UPGRADE control in the tab: one inverted button, one confirm line. Available only to active Usership |
| M2.4 | Roster intake: sizing for the 3 sized lines (09 socks, 10 underwear, 16 t-shirt), CONUS shipping address, cadence start date |
| M2.5 | Billing: USD 100/mo recurring, additive to the existing Usership subscription (same processor/customer). Proration rule: none. First charge on cadence start |
| M2.6 | STAND DOWN: cancels the ration line item at period end. AI plan untouched. Confirm-once |
| M2.7 | Issue log scaffold: `basic_issues` table + read-only list in the tab (empty until Month 3) |
| M2.8 | Log events in Logs tab: `BASIC-ENL:`, `BASIC-ONS:`, `BASIC-SD:` |
| M2.9 | Admin `/us` view: roster list, state, cadence start |

**EXIT:** A Usership member can go ON STRENGTH and back OFF, end to end.
**Decision needed from S-2 before M2.5:** which billing processor / product ID
Usership runs on today, and whether a test-mode key exists in the environment.

## 3. MONTH 3 — ISSUE & FULFILLMENT (2027-01-12 → 2027-02-11)

The box ships.

| ID | Build |
|----|-------|
| M3.1 | Load engine: `basicLoadForIssue(n)` (already shipped M1) + per-member issue numbering from cadence start |
| M3.2 | Supplier quotes for all 23 lines + carton + postage; replace planning COGS; envelope gate must stay WITHIN |
| M3.3 | Printed manifest card generator (PDF, A6, same terminal grid): issue no., member call sign, lines, DTG |
| M3.4 | Scheduler job: create next issue T-7 days, status `SCHEDULED → PACKED → DISPATCHED → DELIVERED` |
| M3.5 | Tracking number capture (admin) + DISPATCHED log event |
| M3.6 | NEXT ISSUE block in the tab: issue no., date, lines that ride on it |
| M3.7 | First real issue dispatched to a real subscriber. Margin recorded per issue against actual landed cost |

**EXIT:** First real ration ships to a real subscriber. Margin verified ≥ 60%.

---

## 4. LOAD (23 LINES)

Cadence phase is staggered so no issue carries every non-monthly item.

| LN | Nomenclature | Qty | UI | Cadence | Phase |
|----|--------------|-----|----|---------|-------|
| 01 | SOAP, BAR, CASTILE, UNSCENTED | 1 | 4 OZ | M | 0 |
| 02 | TOOTHPASTE, FLUORIDE | 1 | 4 OZ | M | 0 |
| 03 | FLOSS, DENTAL, WAXED | 1 | 50 YD | M | 0 |
| 04 | DEODORANT, SOLID, UNSCENTED | 1 | EA | M | 0 |
| 05 | SHAMPOO, CONCENTRATE, UNSCENTED | 1 | 8 OZ | M | 0 |
| 06 | BLADE, RAZOR, DOUBLE-EDGE | 5 | EA | M | 0 |
| 07 | BALM, LIP, PLAIN | 1 | EA | M | 0 |
| 08 | LOTION, BODY, UNSCENTED | 1 | 8 OZ | M | 0 |
| 09 | SOCKS, CREW, COTTON, BLACK (sized) | 2 | PR | M | 0 |
| 10 | UNDERWEAR, BRIEF, COTTON, BLACK (sized) | 2 | EA | M | 0 |
| 11 | COFFEE, GROUND, DARK | 1 | 12 OZ | M | 0 |
| 12 | TEA, BLACK, BAGGED | 20 | EA | M | 0 |
| 13 | BAR, RATION, OAT-NUT | 6 | EA | M | 0 |
| 14 | ELECTROLYTE, POWDER, SACHET | 10 | EA | M | 0 |
| 15 | TOOTHBRUSH, MANUAL, SOFT | 1 | EA | Q | 0 |
| 16 | T-SHIRT, CREW, COTTON, BLACK (sized) | 1 | EA | Q | 0 |
| 17 | BANDAGE, ADHESIVE, ASSORTED | 20 | EA | Q | 1 |
| 18 | CLOTH, MICROFIBER, BLACK | 1 | EA | Q | 1 |
| 19 | BATTERY, AA, ALKALINE | 4 | EA | Q | 1 |
| 20 | SUNSCREEN, MINERAL, SPF 30 | 1 | 3 OZ | Q | 2 |
| 21 | CLIPPER, NAIL, STEEL | 1 | EA | S | 2 |
| 22 | NOTEBOOK, FIELD, RULED, 48 PG | 1 | EA | S | 4 |
| 23 | HANDLE, RAZOR, SAFETY, STEEL | 1 | EA | A | 0 |

## 5. RISKS

| Risk | Mitigation |
|------|-----------|
| Issue 01 headroom is USD 0.95 on planning numbers | M3.2 quotes are a hard gate. Fallback: move LN 23 handle to phase 1 (issue 02) — saves USD 4.00 on issue 01 |
| Postage is the largest single line (USD 7.50 est.) | Quote a 2 lb ground commercial rate; weigh a packed sample carton in M3 |
| Apparel sizing returns | Size exchange is free once per member; cost carried in the margin above the floor |
| Payment processing (~3% + USD 0.30) is outside "landed" | Net margin after processing on the worst issue ≈ 57.8%. Ceiling is defined on landed per LOT-FM-001; flagged for S-2 |
