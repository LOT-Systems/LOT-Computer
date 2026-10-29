# BASICS (LOT-FM-001) — 90-DAY PLAN

Status line: M1 BUILT (this session) / M2 PLANNED / M3 PLANNED.

ENVELOPE: USD 100/mo, margin >= 60%, landed <= USD 40 (enforced in `src/shared/constants/basics.ts`: `withinCeiling`, `marginPct`).

| MONTH | EXIT | STATE |
|-------|------|-------|
| M1 LEDGER & DOCTRINE | stranger reads what LOT issues and on what terms | BUILT: `/basics` (public when logged out, in-app tab when logged in) |
| M2 UPGRADE & ROSTER | Usership member goes ON STRENGTH and back OFF | PLANNED |
| M3 ISSUE & FULFILLMENT | first real ration ships, margin verified | PLANNED |

## M2 PLAN
- Prisma model `RationSubscription` (userId, state, sizing, shipping, cadenceStart, stripe ids) + migration.
- State machine USERSHIP/AI > PENDING > ON STRENGTH > STEADY STATE; STAND DOWN returns to USERSHIP/AI.
- Additive $100/mo Stripe price; STAND DOWN cancels the ration item only.
- `RationIssue` log table (scaffold). Routes under `/api/basics/*`. UPGRADE control in Basics.tsx.

## M3 PLAN
- Load engine: per-month list from RATION_LOAD cadence (I at issue 1; M every issue; Q every 3; S every 6).
- Supplier quote table, gated by `withinCeiling` per issue. Printed manifest card (PDF). NEXT ISSUE advances on dispatch.

## OPEN ITEMS FOR S-2
1. The 23-item manifest (LOT-FM-001) is NOT in the repo. RATION_LOAD is PROVISIONAL, derived from the About text (toothbrushes, underwear, packaged goods, hygiene). Supply the real list.
2. No supplier quotes exist; no COGS figure has been asserted anywhere.
3. Prior branch `beautiful-johnson-56p7ov` (manifest: M1 BEST) is not on the remote; M1 rebuilt from scratch.
4. ELIMINATED DISTRACTION: further widget/badge/QIE pattern work paused for the Basics build window.
