# LOT-SR-20261014-BASICS-M1 — BASIC (RATION) · MONTH 1 · LEDGER & DOCTRINE

```
DATE     : 2026-10-14        CLASS : ENGINEERING        S-2 : VADIK MARMELADOV
BRANCH   : claude/beautiful-johnson-qfm5ad
STATUS   : M1 BUILT · CLIENT BUILD UNVERIFIED (no node_modules in runner)
```

## STATUS LINE (envelope)
`M1 OPEN TAB: built, wired to /basics, read-only. Envelope: 23 items, landed 39.33/40, margin 60.7% (ceiling estimates, GREEN by 0.67 USD).`

## BUILT
- `src/shared/basics/manifest.ts` — 23-item manifest (id, nomenclature, qty, cadence), doctrine lines, price (USD 100), state vocabulary (USERSHIP/AI, PENDING, ON STRENGTH, STEADY STATE), `itemsDueInIssue(n)` cadence engine seed for M3.
- `src/client/components/Basics.tsx` — OPEN TAB: header bar, doctrine, ledger (ID / NOMENCLATURE / QTY / CADENCE), issue stepper 01–12 that inverts rows due that month, terms line, status line. Inversion-only, uppercase, no color/radius/icons.
- Route `basics` -> `/basics`; nav `Basics` now live for logged-in and logged-out; TabPanel added; `/basics` added to `KNOWN_CLIENT_ROUTES` in `server/index.ts` and `server/server.ts`.
- `scripts/basics/cogs.ts` — internal envelope check (COGS withheld from client bundle). `npx tsx scripts/basics/cogs.ts` exits 1 on breach.

## VERIFIED
```
cogs.ts            : ITEMS 23/23  AMORTISED 30.33  LANDED 39.33/40  MARGIN 60.7%  GREEN
manifest.ts tsc    : strict, standalone — see run output
Client build/tsc   : NOT RUN — node_modules absent in this runner. Run `yarn && yarn build` before ship.
```

## FLAGS FOR S-2
1. **Source manual absent.** LOT-FM-001 text is not in the repo. The 23 items, quantities and unit costs are DRAFT-01, authored to fit the envelope. Replace `manifest.ts` + `cogs.ts` with the manual's list when supplied.
2. **Price conflict.** `About.tsx` (~L3284) documents Basic Essentials at $399/mo and modular upgrades at $99/mo; directive says USD 100/mo. Built to directive; About.tsx not edited.
3. **Margin headroom is 0.67 USD.** Unit costs are targets that M3 supplier quotes must meet. Heaviest lines: UNDERWEAR, UNDERSHIRT, SOCKS, RAZOR CARTRIDGE.
4. Enrollment is deliberately closed in M1 (status line says so); there is no state, billing or network call.

## ELIMINATED DISTRACTION
Per-item product photography / "shop" UX. The ledger is the page.

## NEXT (M2: UPGRADE & ROSTER)
Server model `basic_subscription` (state, roster: sizing/shipping/cadence start), UPGRADE/STAND DOWN endpoints, Stripe additive recurring price (USD 100), issue-log table scaffold, state machine tests.
