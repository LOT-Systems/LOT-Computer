# LOT-FM-001 / BASIC (RATION) — 90-DAY PLAN

ENVELOPE: USD 100/mo · ≥60% margin · ≤USD 40 landed (all-in incl. payment fee) · 23 items.
MODEL: `node scripts/basics-cogs.mjs` (private; exit 1 on breach). Current: landed 36.55, all-in 39.75, margin 60.3%. HEADROOM: 0.25 USD — THIN.
ASSUMPTION: source manual (23-item list) is not in the repo. Nomenclature in `src/client/data/basicsManifest.ts` is PROVISIONAL. Unit costs are estimates until M3 quotes.

## M1 — LEDGER & DOCTRINE (read-only)  [BUILT THIS SESSION]
- Route `/basics`, nav tab live (server KNOWN_CLIENT_ROUTES updated).
- BasicsPage: status line, doctrine, 23-row ledger (no/nomenclature/qty/cadence), issue selector (shows which items load in issue N), terms line. COGS withheld.
- EXIT: stranger can read what LOT issues and on what terms. Remaining: public (logged-out) serving — see risks.

## M2 — UPGRADE & ROSTER
- State machine: USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE; STAND DOWN → AI only.
- Roster intake: sizing, shipping address, cadence start. Prisma model `Ration` + migration.
- Stripe: additive $100/mo subscription item on existing Usership customer; cancel item only on STAND DOWN.
- Issue log scaffold (`RationIssue` rows). Endpoints: POST /api/basics/upgrade, /roster, /stand-down; GET /api/basics/status.

## M3 — ISSUE & FULFILLMENT
- Load engine = `itemsForIssue(n)` (already built, client) moved to shared; issue scheduler (cron) creates RationIssue, advances NEXT ISSUE.
- Supplier quotes → replace estimates in cogs script; CI-style gate fails >40.
- Printed manifest card (PDF per issue). First issue dispatch to a real subscriber; verify margin on actuals.

## DISTRACTION ELIMINATED
Pre-existing server/type-check debt (tsconfig TS7 deprecations, router typing) — not touched.
