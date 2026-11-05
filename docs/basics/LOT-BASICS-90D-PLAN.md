# LOT BASICS — 90-DAY PLAN (LOT-FM-001 REV A)

Source: Drive `LOT_RATION_SYSTEM_SPEC.md` (LOT-FM-001). Envelope: USD 100/mo, >=60% margin, <=USD 40 landed.
House style: LiberationMono-Bold, white/black, inversion-only, 2px rules, square, no color/icons.

| MONTH | BUILD | EXIT | STATE |
|-------|-------|------|-------|
| 1 | OPEN TAB `/basics` public, 23-line ledger, doctrine, price, terms, status line, tokens | Stranger reads what LOT issues and on what terms | SHIPPED (this branch) |
| 2 | UPGRADE state machine (USERSHIP/AI > PENDING > ON STRENGTH > STEADY), roster intake, recurring $100 additive billing, STAND DOWN, issue-log scaffold | Usership member goes ON and OFF strength end to end | OPEN |
| 3 | Month load engine (`loadForMonth` exists), supplier quotes vs ceiling, printed manifest card, first dispatch, log accrues | First real ration ships; margin >=60% verified | OPEN |

## Month 2 open decisions (need S-2)
1. Payment rail: Stripe? (no payment code exists in repo; `SubscribeWidget.tsx` to be inspected.)
2. Where tier lives: new `UserTag.Basic` vs a `ration_subscriptions` table (recommended: table; tag derived).
3. Roster fields: sizing (sock, brief, shirt, cap), shipping address (reuse UserSettings), cadence start date.

## Distraction eliminated (Month 1)
Per-tab bespoke styling. One token block (`TOKENS` in `Basics.tsx`) governs the surface.
