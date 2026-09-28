# LOT-FM-001 — BASIC (RATION)
## 90-Day Self-Assembly Directive — Hardware / Physical System

**Status:** MONTH 1 shipped (LEDGER & DOCTRINE). MONTH 2–3 scoped, not built.
**Owner:** S-2 Vadik Marmeladov
**Surface:** `Basics` tab — `src/client/components/Basics.tsx`, route `/basics`
**Effective:** 2026-09-28

---

## 1. Doctrine

LOT does not sell the ration. LOT issues it. The user is ON STRENGTH — carried
on the roster, resupplied on a fixed cadence, without negotiation and without
an upsell funnel. The ledger is the marketing: there is no layer between what
the public reads on the OPEN TAB and what physically ships.

**Economics (binding ceiling, not a target to drift toward):**
- Issue rate: **USD 100.00 / month**, additive to LOT Usership (AI plan).
- Landed cost ceiling: **≤ USD 40.00** per issue.
- Margin floor: **≥ 60%** (40% COGS at the ceiling satisfies this exactly —
  any supplier quote that breaches USD 40 landed breaches the directive and
  must not ship, not be absorbed into a lower margin).

**House style, non-negotiable for this surface:**
Monospace grid, white ground / black ink, inversion-only hierarchy, 2px
rules, square corners (no `border-radius`), fixed character grid, IBM 3270
register. Quartermaster voice: imperative, terse. No marketing copy, no
color, no icons. This is deliberately a different register from the rest of
the app (soft, opacity-hierarchy, theme-following) — the ration manifest is a
printed document, not a mood, and does not follow dark mode or accent theme.

---

## 2. The 23-Item Ration Load

Nomenclature and cadence are public (this is the OPEN TAB contract). COGS is
withheld from the public ledger — the cost sheet is an internal instrument,
not because of a marketing layer, but because publishing landed cost invites
negotiation, and LOT issues, it does not negotiate.

| No. | Nomenclature | Category | Cadence |
|-----|---|---|---|
| 01 | Toothbrush | Hygiene | Q |
| 02 | Toothpaste, travel | Hygiene | M |
| 03 | Dental floss | Hygiene | M |
| 04 | Soap, bar | Hygiene | M |
| 05 | Shampoo, travel | Hygiene | M |
| 06 | Deodorant | Hygiene | M |
| 07 | Razor, disposable (3-pack) | Hygiene | M |
| 08 | Nail clipper | Hygiene | A |
| 09 | Cotton swabs, box | Hygiene | Q |
| 10 | Hand sanitizer, travel | Hygiene | M |
| 11 | Underwear, crew (3-pack) | Apparel | Q |
| 12 | Socks, crew (3-pair) | Apparel | Q |
| 13 | Undershirt, crew neck | Apparel | Q |
| 14 | Toilet paper (4-roll) | Paper goods | M |
| 15 | Paper towels (2-roll) | Paper goods | M |
| 16 | Tissues, box | Paper goods | M |
| 17 | Trash bags, 13-gal (10-count) | Home | M |
| 18 | Dish soap | Home | M |
| 19 | All-purpose cleaner, travel | Home | Q |
| 20 | Sponges (2-pack) | Home | Q |
| 21 | Batteries, AA (4-pack) | Home | Q |
| 22 | Multivitamin, 30-day supply | Ration | M |
| 23 | First-aid kit, basic | Ration | A |

Cadence: **M** = monthly issue. **Q** = quarterly issue. **A** = issued on
intake, replenished only on request (durable, not consumable).

This load is a draft manifest authored to satisfy the FM-001 directive's
23-item / cadence-tagged / COGS-withheld structure. It has not been priced
against real supplier quotes — that is MONTH 3 work (Section 5).

---

## 3. Upgrade State Machine (design, not yet wired)

```
USERSHIP/AI  --[UPGRADE]-->  PENDING  --[roster intake confirmed]-->  ON STRENGTH  --[cadence established]-->  STEADY STATE
                                                                           |
                                                                    [STAND DOWN]
                                                                           v
                                                                     USERSHIP/AI
                                                                (ration dropped, AI plan retained)
```

- **USERSHIP/AI** — existing $99/mo digital plan. No physical issue.
- **PENDING** — UPGRADE clicked; roster intake in progress (sizing, shipping
  address, cadence start date not yet confirmed).
- **ON STRENGTH** — intake confirmed; $100/mo additive billing active;
  scheduled for next issue.
- **STEADY STATE** — first issue has shipped at least once; recurring cadence
  running.
- **STAND DOWN** — user downgrades; ration billing and shipping stop; AI plan
  (Usership) is retained, not cancelled.

None of these transitions are implemented yet. MONTH 1 ships the ledger only.

---

## 4. Month-by-Month Build

### MONTH 1 — LEDGER & DOCTRINE — **SHIPPED 2026-09-28**
- `Basics` tab wired into the nav and router (`/basics`), public — no login
  gate, matching "a stranger can read what LOT issues."
- Renders the 23-item manifest (nomenclature + category + cadence; COGS
  column withheld) as a fixed-grid ledger.
- Doctrine statement, price line (USD 100.00/month), status-line component
  (`TAB / PHASE / STATE`).
- Terminal register tokens (monospace stack, 2px rule, square corner, fixed
  white/black) established directly in `Basics.tsx` — not yet promoted to a
  shared design-token file since this is the first surface using them.
- Explicitly marks UPGRADE as **LOCKED** rather than shipping a dead button —
  read-only means read-only, nothing on the tab pretends to transact.

**Exit criteria met:** tab is live on the branch, read-only, a stranger can
open it and read the full manifest and price with no auth.

### MONTH 2 — UPGRADE & ROSTER — not started
Scope: UPGRADE control + the state machine in Section 3; roster intake form
(sizing, shipping address, cadence start date); recurring $100/mo additive
billing line (Stripe or existing billing rail — needs server-side
investigation into how Usership billing is currently wired before this can
be scoped precisely); STAND DOWN downgrade path; an issue-log scaffold
(schema + empty state, no shipments yet).

This is the first month that touches real user PII (shipping address) and
real recurring billing. It should not ship without a human reviewing the
billing wiring and data-handling path before it goes live — that review is
a blocker for this month, not a formality to skip.

### MONTH 3 — ISSUE & FULFILLMENT — not started
Scope: month-by-month load engine walking the Section 2 cadence; supplier
quotes confirmed against the ≤USD 40 landed ceiling (real quotes, not
estimates — the 40% COGS target in the FMCG 2027 plan doc is a planning
assumption, not a confirmed number); printed manifest card generation; first
real issue scheduled and dispatched to a real subscriber; issue log accruing
and NEXT ISSUE advancing; margin verified ≥60% against actual landed cost,
not the planning estimate.

This month requires a real supply chain relationship LOT does not yet have
in this codebase — it is business development work as much as engineering,
and shouldn't be scheduled as a pure code sprint.

---

## 5. Known Gap Against the FMCG 2027 Plan

`docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md` prices "Basic
Essentials" at $399/month with $99/month modular add-ons (Basics/Kids/Home).
LOT-FM-001 prices the BASIC ration at $100/month flat, additive to the
existing $99/month Usership plan. These are two different pricing models for
overlapping physical-goods concepts written at different times. This
document (FM-001) is the one implemented in the shipped `Basics` tab. The
discrepancy should be resolved by S-2 before MONTH 2 introduces real
billing — shipping two live prices for the same category of goods is a
support and trust problem, not just a docs inconsistency.

---

**LOT® Systems Corporation**
**S-2: Vadik Marmeladov**
