# LOT-FM-001 — BASIC (RATION) — 90-DAY BUILD PLAN

STATUS: ACTIVE · OPENED 2026-11-21 · TARGET END STATE 2027-02-19
ENVELOPE: USD 100/MO · LANDED ≤ USD 40 PER ISSUE · MARGIN ≥ 60% · NO AVERAGING

## Architecture

| Layer | File | Role |
|---|---|---|
| Doctrine + load | `src/shared/constants/basics.ts` | 23 lines, nomenclature, interval, phase, load engine `basicLoadForMonth(n)`. No costs. Client-safe. |
| Envelope | `src/server/utils/basics-envelope.ts` | Server-only cost sheet. Per-issue check across a 12-month cycle. Public projection returns HELD/BREACH only. |
| Public API | `GET /api/public/basics` | Ledger + doctrine + terms + envelope verdict. Cached 300 s. |
| Public page | `/open-tab`, `/basics` (no session) | `entries/basics.tsx` — ledger only, no app chrome. |
| Member tab | `/basics` (session) | `Basics` nav enabled → `components/Basics/OpenTab.tsx`. |
| Tokens | `src/client/index.css` `.fm*` | White/black, inversion hierarchy, 2px rules, square, ch-grid, mono bold. |
| Gate | `scripts/tests/test-basics-envelope.ts` | Exit 1 on any breach / malformed load. Run after `yarn server:build`. |

Load leveling: every non-monthly line carries a `phase` offset so quarterly/semi/annual draws are spread over
months. The ceiling is checked **per issue**, never averaged. Phases are append-only once a member is on strength.

## Month 1 — LEDGER & DOCTRINE (2026-11-21 → 2026-12-20) — DELIVERED SESSION 1
- [x] OPEN TAB public surface (`/open-tab`, `/basics` for visitors)
- [x] 23-line ledger: nomenclature, qty, unit of issue, cadence, first draw, per-year. COGS withheld.
- [x] Doctrine, terms of issue, price line
- [x] StatusLine component (FORM / ENROLLMENT / CEILING / MARGIN / BASIS / DTG)
- [x] Terminal tokens + character grid; phone width verified (390 px, no h-scroll)
- [x] Envelope engine + gate test (12/12 issues HELD on estimates)
- [ ] Deploy to production and confirm `/open-tab` live (requires merge to master — owner action)
EXIT: stranger reads what LOT issues and on what terms. Read-only.

## Month 2 — UPGRADE & ROSTER (2026-12-21 → 2027-01-19)
- Migration `basic_enlistments`: userId, state, roster JSON (sizes: underwear, socks, undershirt; ship-to), cadenceStart, billingRef, timestamps.
- Model + `/api/basics/*`: `GET state`, `POST upgrade` (USERSHIP→PENDING), `POST roster` (PENDING→ON_STRENGTH), `POST stand-down` (→STOOD_DOWN, AI retained).
- Guard: only Usership members may upgrade; transitions validated server-side by a single transition table.
- Billing: additive USD 100/mo line on the existing Usership subscription (investigate current billing integration first — no second checkout).
- UI: UPGRADE button live, roster intake form in `.fm` register, STAND DOWN with confirm line.
- Issue log scaffold (empty table, render in tab).
EXIT: a Usership member goes ON STRENGTH and back OFF end to end.

## Month 3 — ISSUE & FULFILLMENT (2027-01-20 → 2027-02-19)
- Migration `basic_issues`: enlistmentId, monthIndex, lines JSON (snapshot), landedUsd (server-only), state (SCHEDULED→PACKED→DISPATCHED→DELIVERED), tracking.
- Scheduled job: on cadence date create next issue from `basicLoadForMonth(n)`; refuse to schedule if `envelopeForMonth(n).pass` is false.
- Replace each ESTIMATE in the cost sheet with a supplier QUOTE (`source: 'QUOTE'`); BASIS reads QUOTED 23/23.
- Printable manifest card (`@media print`, one sheet, 1/1 black).
- Admin (`/us`) dispatch view: pack list, mark dispatched, tracking.
- NEXT ISSUE line in member tab advances on DELIVERED → STEADY_STATE.
EXIT: first real ration ships to a real subscriber. Margin verified ≥ 60% on quotes.

## Distraction eliminated
No storefront, no product photography, no item swapping/customisation in the 90 days. One load, one price.
