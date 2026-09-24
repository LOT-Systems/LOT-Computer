<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-FM-001 — BASIC (RATION) MODULE

**CLASS:** INTERNAL — CONTAINS COST MODEL. Do not ship this file's Section 3 to
any client surface. The public ledger (Basics tab, `GET /api/public/basics`)
carries nomenclature + cadence only — COGS is withheld by construction; it
does not exist in `src/shared/constants/index.ts` or in the server response.

**Status:** MONTH 1 of 3 — LIVE. See Section 5 for exit-criteria verification.

---

## 1. Doctrine

LOT issues the BASIC ration. It does not sell it. A subscriber who accepts
issue is ON STRENGTH — a term borrowed deliberately from a quartermaster's
roll, because that is the relationship: LOT maintains the subscriber's supply
of fixed necessities the way a unit maintains its personnel, not the way a
storefront maintains a cart.

Governing constraints, non-negotiable:

- **Price:** USD 100.00 / month, flat, no line-item variance.
- **Margin floor:** ≥ 60%.
- **Landed COGS ceiling:** ≤ USD 40.00 / month, blended across all 23 lines
  at their respective cadences. Breaching the ceiling is not permitted under
  any circumstance — the fix is to drop or substitute a line, never to widen
  the ceiling.
- **Transparency:** the ledger is the marketing. There is no persuasive layer
  between what is public (the manifest) and what is actually issued. The
  23-line manifest a stranger reads on the OPEN TAB is the literal same array
  the server issues from (`BASIC_RATION_MANIFEST` in
  `src/shared/constants/index.ts` — one definition, read by both the public
  API and the client).

Voice for every surface touching this module: quartermaster. Imperative,
terse, IBM 3270 register. No marketing adjectives, no color, no icons, no
emoji, no rounded corners. This is a deliberate visual break from the rest of
the LOT product (which uses the soft Tailwind `acc`/`bac` theme) — the Basics
module reads as issued equipment, not a consumer surface.

---

## 2. The 23-Item Ration Load

Full manifest, by category, with cadence. Nomenclature and cadence are public
(served at `GET /api/public/basics`, rendered on the Basics tab). Source of
truth: `BASIC_RATION_MANIFEST` in `src/shared/constants/index.ts`.

```
HYGIENE
LOT-BR-01  TOOTHBRUSH, SOFT-BRISTLE                MONTHLY
LOT-BR-02  TOOTHPASTE, FLUORIDE, 4.6OZ              MONTHLY
LOT-BR-03  FLOSS, WAXED, 50M                        MONTHLY
LOT-BR-04  DEODORANT, UNSCENTED, STICK              MONTHLY
LOT-BR-05  SOAP, BAR, UNSCENTED, 4OZ                MONTHLY
LOT-BR-06  RAZOR, SAFETY, BLADE PACK-5              MONTHLY
LOT-BR-07  SANITIZER, HAND, 2OZ                     MONTHLY
LOT-BR-08  MULTIVITAMIN, 30-CT                      MONTHLY

APPAREL
LOT-BR-09  UNDERWEAR, COTTON, PR                    MONTHLY
LOT-BR-10  SOCKS, CREW, COTTON, PR                  MONTHLY
LOT-BR-11  T-SHIRT, COTTON, CREW-NECK               QUARTERLY
LOT-BR-12  TOWEL, BATH, COTTON                      SEMI-ANNUAL

HOUSEHOLD
LOT-BR-13  TISSUE, BATH, ROLL PACK-4                MONTHLY
LOT-BR-14  TOWEL, PAPER, ROLL PACK-2                MONTHLY
LOT-BR-15  DETERGENT, LAUNDRY, POD-12                MONTHLY
LOT-BR-16  SOAP, DISH, 12OZ                         MONTHLY
LOT-BR-17  BAG, TRASH, 13GAL, CT-20                 MONTHLY
LOT-BR-18  CARTRIDGE, WATER FILTER                  QUARTERLY
LOT-BR-19  COFFEE, GROUND, 12OZ                     MONTHLY

FIELD-SUNDRY
LOT-BR-20  NOTEBOOK, POCKET, RULED                  QUARTERLY
LOT-BR-21  PEN, BLACK INK, PACK-2                   QUARTERLY
LOT-BR-22  BATTERY, AA, PACK-4                      QUARTERLY
LOT-BR-23  KIT, FIRST-AID, POCKET                   SEMI-ANNUAL
```

23 lines. 16 MONTHLY, 5 QUARTERLY, 2 SEMI-ANNUAL. A subscriber's box composition
varies by month (quarterly/semi-annual lines only appear on their cycle month)
— the month-by-month load engine that resolves this is Month 3 scope (Section 6).

---

## 3. Cost Model (INTERNAL — illustrative, not shipped)

Illustrative landed unit costs (materials + pack + allocated freight), USD.
These numbers exist to prove the ceiling clears — they are planning estimates
for the Month 3 supplier-quote pass, not confirmed procurement prices.

**Monthly lines** (full cost hits every box):

| NSN | Item | Est. landed |
|---|---|---:|
| LOT-BR-01 | Toothbrush | 0.60 |
| LOT-BR-02 | Toothpaste 4.6oz | 1.20 |
| LOT-BR-03 | Floss 50m | 0.50 |
| LOT-BR-04 | Deodorant stick | 1.50 |
| LOT-BR-05 | Soap bar 4oz | 0.60 |
| LOT-BR-06 | Razor blade pack-5 | 2.00 |
| LOT-BR-07 | Hand sanitizer 2oz | 0.80 |
| LOT-BR-08 | Multivitamin 30ct | 2.50 |
| LOT-BR-09 | Underwear, pr | 3.50 |
| LOT-BR-10 | Socks, pr | 2.00 |
| LOT-BR-13 | Tissue 4-roll | 2.20 |
| LOT-BR-14 | Paper towel 2-roll | 2.00 |
| LOT-BR-15 | Laundry pod-12 | 2.50 |
| LOT-BR-16 | Dish soap 12oz | 1.30 |
| LOT-BR-17 | Trash bags 20ct | 2.00 |
| LOT-BR-19 | Coffee, ground, 12oz | 4.50 |
| **Monthly subtotal** | | **29.70** |

**Quarterly lines** (full cost / 3, amortized across the cycle):

| NSN | Item | Full cost | /mo |
|---|---|---:|---:|
| LOT-BR-11 | T-shirt | 6.00 | 2.00 |
| LOT-BR-18 | Water filter cartridge | 8.00 | 2.67 |
| LOT-BR-20 | Notebook, pocket | 1.50 | 0.50 |
| LOT-BR-21 | Pen pack-2 | 1.00 | 0.33 |
| LOT-BR-22 | Battery pack-4 | 2.50 | 0.83 |
| **Quarterly subtotal (amortized)** | | | **6.33** |

**Semi-annual lines** (full cost / 6):

| NSN | Item | Full cost | /mo |
|---|---|---:|---:|
| LOT-BR-12 | Bath towel | 7.00 | 1.17 |
| LOT-BR-23 | First-aid kit, pocket | 9.00 | 1.50 |
| **Semi-annual subtotal (amortized)** | | | **2.67** |

**Blended landed COGS: 29.70 + 6.33 + 2.67 = USD 38.70 / month.**

Ceiling: ≤ USD 40.00. Clearance: USD 1.30 (3.25% buffer under ceiling).

Margin: (100.00 − 38.70) / 100.00 = **61.3%**. Floor: ≥ 60%. Clearance: 1.3
points.

Both floors hold, but narrowly. The Month 3 supplier-quote pass (Section 6)
either confirms this model or forces a line substitution — do not add lines,
raise cadence, or upgrade any item's spec without re-running this table and
reconfirming both the ≤$40 ceiling and the ≥60% margin floor.

---

## 4. Visual Identity — Terminal Tokens

Implemented in `src/client/components/Basics.tsx`, scoped locally (inline
styles) — does not touch the app's global Tailwind theme or `acc`/`bac`
tokens used elsewhere in the product.

- **Type:** `"Liberation Mono", "DejaVu Sans Mono", Menlo, Consolas, "Courier New", monospace`, weight 700 throughout.
- **Ground / ink:** white background, black text. No color anywhere.
- **Hierarchy:** inversion only — emphasis is black-on-white flipping to
  white-on-black (see the header block and category dividers in the ledger
  table), never a color or weight-only change.
- **Rules:** 2px solid black, square corners (`border-radius: 0` throughout).
- **Grid:** fixed-width table columns (LINE / NOMENCLATURE / CADENCE),
  monospace alignment.
- **Voice:** doctrine statement, price line, ledger, status line — all terse,
  imperative, no marketing copy, no icons, no emoji.

---

## 5. Month 1 — LEDGER & DOCTRINE (LIVE)

**Built this session:**

- `BASIC_RATION_MANIFEST` + `BASIC_RATION_PRICE_USD` — single source of
  truth, `src/shared/constants/index.ts`. No COGS field exists in this type.
- `GET /api/public/basics` — unauthenticated, read-only, 1-hour cache
  (`src/server/routes/public-api.ts`). Returns doctrine statement, price
  line, the 23-line ledger (nomenclature + cadence only), and status.
- Standalone public route `GET /basics` (`src/server/index.ts`) serving a
  dedicated bundle (`src/client/entries/basics.tsx` →
  `dist/client/js/basics.js`) — same pattern as `/status` and `/about`. No
  login required. A stranger hitting `/basics` cold gets the ledger.
  In-app, the same `<Basics />` component is also reachable as a normal tab
  (`goTo('basics')`, wired into the nav in `src/client/components/ui/Layout.tsx`,
  previously a disabled placeholder with no route).
- `src/client/components/Basics.tsx` — doctrine statement, price line,
  fixed-grid ledger table grouped by category, status line.

**Exit criterion:** *"A stranger can read what LOT issues and on what terms.
Read-only. Live."* — MET. `/basics` requires no session; the API requires no
session; both are wired to the same manifest as the in-app tab.

---

## 6. Forward Plan

### Month 2 — UPGRADE & ROSTER (Usership AI → BASIC)

Not built this session — depends on payment infrastructure this module does
not yet have wired end to end. The `User` model already reserves a
`stripeCustomerId` column (`src/server/models/user.ts`, `src/shared/types/index.ts`)
but no Stripe SDK dependency, checkout route, or webhook handler exists
anywhere in the repo (`grep -i stripe package.json` — no hits;
`grep -rli checkout src/server/routes` — no hits). The column is a reserved
slot, not a working integration. Month 2 opens by wiring the actual
integration against that column, not inventing a new one.

- State machine: `USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE`,
  persisted per-user (new `UserTag` or metadata field — extend
  `src/shared/types/index.ts` `UserTag` enum, do not overload `Usership`).
- UPGRADE control on the Basics tab, visible only to authenticated Usership
  members, absent from the public `/basics` standalone surface.
- Roster intake: sizing (apparel lines 09–12), shipping address (reuse
  existing `UserSettings.address`/`city`/`country` fields — already present),
  cadence start date.
- Recurring $100/mo additive billing on top of existing $99/mo Usership —
  requires a real payment processor integration (none present in this repo;
  first task of Month 2 is selecting and wiring one).
- STAND DOWN: downgrade control that drops the ration and reverts to
  `PENDING`/`USERSHIP-AI`, retaining full AI/Usership access. Never deletes
  the user's Usership tag.
- Issue log scaffold: a `Log` event type (e.g. `basics_issue_scheduled`) so
  the existing `Log` model/table carries ration history without a new table.

**Exit criterion:** a Usership member can go ON STRENGTH and back OFF,
end to end, with no manual database edits.

### Month 3 — ISSUE & FULFILLMENT (the box ships)

- Month-by-month load engine: resolves which of the 23 lines are due in a
  given cycle month from each line's cadence (Section 2) and the
  subscriber's cadence start date.
- Real supplier quotes gathered and checked against the Section 3 ceiling
  line-by-line — Section 3's numbers are planning estimates, not confirmed
  procurement; this is where they get confirmed or the manifest gets revised.
  Do not source or place an order until this is done.
- Printed manifest card generation (per-shipment card listing that
  shipment's actual lines — reuses `BASIC_RATION_MANIFEST` nomenclature
  strings, filtered to the resolved cycle).
- First issue scheduled and dispatched to a real subscriber.
- Issue log accrues (extends the Month 2 scaffold); `NEXT ISSUE` date
  advances per cadence after each dispatch.

**Exit criterion:** first real ration ships to a real subscriber. Margin
verified ≥60% against actual (not estimated) supplier invoices.

---

## 7. Eliminate One Distraction

Per directive, each build cycle drops one distraction rather than adding
scope. This cycle: the Basics nav tab existed as a **dead, disabled button**
(`{ label: 'Basics' }`, no route, `opacity-30 pointer-events-none`) since
before this session — a visible promise the product wasn't keeping. It is now
live. The next distraction to eliminate, flagged for Month 2: `stripeCustomerId`
has sat as a reserved-but-unwired column on `User` with no SDK, checkout
route, or webhook behind it. Billing cannot be simulated further; Month 2
opens by wiring the actual integration against that column.
