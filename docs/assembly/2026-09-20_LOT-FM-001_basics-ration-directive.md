<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-FM-001 / Self-Assembly Directive — BASIC (Ration) Module

**Date:** 2026-09-20
**Branch:** claude/beautiful-johnson-6e9nr4
**Run type:** Scheduled self-assembly session, no S-2 present at run time
**Class:** SELF-ASSEMBLY

---

## Directive (as received)

Build the BASIC ration module: the physical/hardware layer of the LOT System,
surfaced as a "Basics" tab. House style: LiberationMono-Bold, white ground /
black ink, inversion-only hierarchy, 2px rules, square corners, IBM 3270
register. Voice: quartermaster, imperative, terse. Issue, do not sell —
USD 100/mo, ≥60% margin, ≤USD 40 landed COGS ceiling. Planned as a 90-day
build: M1 ledger + doctrine (public OPEN TAB, read-only), M2 upgrade + roster
(Usership AI → BASIC state machine, additive billing), M3 issue + fulfillment
(load engine, supplier quotes, printed manifest, first real shipment).

## Prior State Found

`docs/benchmark/LOT-MANIFEST.md` already listed a **BEST** iteration of this
exact feature — `claude/beautiful-johnson-56p7ov` (commit `6815f550`,
"BASICS M1: OPEN TAB live — 23-item ration ledger, doctrine, status line"),
8/8 iterations, +293 lines. It was never shipped to master. `git ls-remote`
turned up **~76 branches** in the `beautiful-johnson-*` cluster — near-total
duplicates of the same M1 build, each from a separate scheduled run of this
same directive that never reached the Ship Mode merge step. This session
restores the BEST iteration's content (`Basics.tsx`, `basics/doctrine.ts`, the
router/Layout/app.tsx wiring) onto the current assigned branch rather than
re-authoring it from scratch, verifies it green on today's master base, and
files the redundancy for S-2's attention (see session report, `06 //
SELF-ASSEMBLY`). No branches were deleted — pruning ~75 stale iterations is a
destructive, S-2-confirmed action, not one this session takes unilaterally.

## Scope Decision — This Session

Real money movement ($100/mo recurring billing) and real physical fulfillment
(supplier POs, printed manifests, an actual shipment) are **out of scope for
an unattended scheduled run** — those are exactly the "hard to reverse, shared
state" actions that need a human present. This session builds and green-gates
**Month 1 only**: the public OPEN TAB — doctrine statement, 23-item ration
manifest as a read-only ledger (nomenclature + spec + cadence; COGS withheld),
price line, and a status line reading the operator's own tags. Month 2
(Upgrade + Roster) and Month 3 (Issue + Fulfillment) are scoped below as a
roadmap, not built — they require product decisions (real Stripe billing
integration, a fulfillment/supplier relationship) that are S-2's call, not
something to fabricate against a live payment rail.

## Month 2 Roadmap — Upgrade & Roster (not built this session)

- `UserTag.Basic` — formalize as an actual enum member (`src/shared/types/index.ts`),
  not just a loose string, once the tag is real.
- State machine: `USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE`, plus
  `STAND DOWN` (drop ration, retain AI). Needs a `basic_status` column or a
  tags-based transition log — follow the existing `agent_ledger` migration
  pattern (`migrations/20260530120000_add-agent-ledger-table.cjs`) for an
  append-only issue log.
- Roster intake form: sizing, shipping address, cadence start date.
- Recurring +$100/mo additive billing: this repo currently has **no Stripe
  checkout/webhook code** (subscriptions are sold off-platform via
  `brand.lot-systems.com`, per `SubscribeWidget.tsx`). Wiring real billing is
  a distinct, S-2-scoped integration — not something to stand up unattended.

## Month 3 Roadmap — Issue & Fulfillment (not built this session)

- Month-by-month load engine reading `RATION_MANIFEST` cadence (`MONTHLY` /
  `QUARTERLY`) to compute what ships in a given cycle.
  Supplier quotes must be confirmed against the USD 40 landed COGS ceiling
  before any PO — a live sourcing task, not a code task.
- Printed manifest card generation (PDF per ration, per operator).
- Issue log (extends the M2 issue log) accruing NEXT ISSUE date per operator.
- First real shipment to a real subscriber — gated on M2's billing and a real
  supplier relationship existing. Margin verification (≥60%) happens against
  real invoices, not estimates.

## Files Touched This Session

- `src/client/components/Basics.tsx` (new) — restored + minor status-line extension (NEXT ISSUE row)
- `src/client/components/basics/doctrine.ts` (new) — 23-item manifest, doctrine lines, price line (verbatim from BEST iteration)
- `src/client/stores/router.ts` — `basics` route added
- `src/client/components/ui/Layout.tsx` — Basics nav item wired to the route (both logged-in and logged-out lists — OPEN TAB is public)
- `src/client/entries/app.tsx` — `Basics` mounted in `TabPanels`
