# BASICS — 90-DAY PLAN (LOT-FM-001)

Envelope: USD 100/MO · margin ≥ 60% · landed ≤ USD 40 · 23-line load.

| MONTH | BUILD | EXIT | STATE (2026-10-03) |
|-------|-------|------|--------------------|
| 1 | OPEN TAB: 23-line ledger, doctrine, price, status line, public JSON `GET /api/public/basics` | stranger reads what LOT issues, on what terms | DONE in-app; public web page OPEN |
| 2 | UPGRADE state machine, roster intake, additive billing record, STAND DOWN, issue log | Usership member goes ON STRENGTH and back OFF | DONE (billing LEDGERED only — no processor) |
| 3 | load engine (monthly + quarterly), supplier quotes vs ceiling, printed manifest card, first dispatch, NEXT ISSUE advance | first real ration ships; margin verified ≥ 60% | NOT STARTED |

## Modules
- `src/shared/basics/manifest.ts` — 23 lines, doctrine, price (no COGS).
- `src/shared/basics/engine.ts` — pure state machine, roster validation, billing math, envelope check.
- `src/server/routes/basics.ts` — `GET /api/basics`, `POST /api/basics/{upgrade,roster,stand-down}`; record in `user.metadata.basics`.
- `src/client/components/Basics.tsx`, `basics/Enroll.tsx`, `basics/useBasic.ts` — tab UI.
- `scripts/tests/basics-engine.test.ts` — `node --experimental-strip-types scripts/tests/basics-engine.test.ts`.

## State machine
USERSHIP → (UPGRADE) PENDING → (ROSTER_COMPLETE) ON STRENGTH → (ISSUE_DISPATCHED) STEADY STATE.
STAND DOWN from PENDING / ON STRENGTH / STEADY STATE → USERSHIP. Drops ration, retains AI.

## Month 3 prerequisites (need S-2 / outside the repo)
1. Payment processor (none in repo). Billing is ledgered, not charged.
2. Supplier quotes for all 23 lines. Margin cannot be verified without them; the repo holds no COGS.
3. Fulfillment partner / ship-from address; US-only until decided.
4. Public (logged-out) OPEN TAB page — app is login-gated; JSON endpoint exists.
5. Legal review of ingestible items (supplements) and the "issued, not sold" wording.
