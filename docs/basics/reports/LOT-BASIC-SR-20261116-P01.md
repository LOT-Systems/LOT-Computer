# LOT-BASIC-SR-20261116-P01 · SESSION REPORT

```
FM ............ LOT-FM-001 · BASIC (RATION)
SESSION ....... 2026-11-16 · scheduled routine · session 1 of the 90-day build
PHASE ......... 01/03 — LEDGER & DOCTRINE
BRANCH ........ claude/beautiful-johnson-kre6vi
RESULT ........ PHASE 01 BUILT · READ-ONLY · NOT YET DEPLOYED
ENVELOPE ...... GREEN · peak USD 39.70 / 40.00 · avg USD 37.37 · margin ≥ 60.3%
```

**STATUS LINE:** Phase 01 built and green on build. Envelope holds at USD 0.30 peak headroom. Production deploy pending.

---

## 1. WHAT WAS FOUND

- Basics tab existed in the nav as a disabled placeholder (`Layout.tsx`).
- An earlier attempt, `claude/nifty-allen-jWyOe` (2026-05-30), built all three
  phases at once on a base ~6 months behind master. Never merged. Not reused
  wholesale; manifest and state vocabulary were reviewed and revised.
- The app SPA requires a session, so a "public" tab inside it would never reach
  a stranger. The OPEN TAB needed its own entry and server route.

## 2. WHAT WAS BUILT

| # | Change | File |
|---|---|---|
| 1 | Shared manifest: 23 lines, class, qty/unit, cadence (every N months + offset), `isDue` / `loadForIssue`, doctrine, price line, state vocabulary, phase block | `src/shared/constants/basic.ts` |
| 2 | Server-only envelope: unit COGS, fixed per-issue cost, 12-issue ceiling check | `src/server/utils/basic-envelope.ts` |
| 3 | Envelope gate, exits 1 on breach; `yarn basic:envelope` | `scripts/basic-envelope.ts`, `package.json` |
| 4 | `Basics` component: header, 3270 status line, DOCTRINE, TERMS, MANIFEST ledger with 12-issue rotation grid, UPGRADE (path shown, closed until Phase 02), footer | `src/client/components/Basics.tsx` |
| 5 | `.lot-basic` house tokens: mono bold, white/black, inversion-only, 2px rules, no radius, tabular numerals | `src/client/index.css` |
| 6 | Public entry for visitors without a session | `src/client/entries/basics.tsx`, `scripts/build/client.build.ts` |
| 7 | `/basics`: member → app with Basics tab; visitor → OPEN TAB | `src/server/index.ts` |
| 8 | Router route `basics`, nav tab enabled; logged-out nav links to `/basics` | `src/client/stores/router.ts`, `ui/Layout.tsx`, `entries/app.tsx` |
| 9 | `GET /api/public/basic/manifest` (COGS withheld, 1h cache) | `src/server/routes/public-api.ts` |
| 10 | 90-day plan (living) | `docs/basics/LOT-FM-001-BASIC-PLAN.md` |

### Manifest revision vs. earlier attempt
- Added textile lines 17–19 (underwear, socks, white tee) — these are what roster sizing is for.
- Liquids swapped for bars where possible (shampoo, conditioner) to hold postage weight.
- Every line carries a cadence and an offset so the monthly load is staggered, not lumped.

## 3. VERIFICATION

| Check | Result |
|---|---|
| `tsc -p tsconfig.server.json --noEmit` | 0 errors |
| `tsc -p tsconfig.json --noEmit` (client) | 104 errors, all pre-existing; 0 new |
| `yarn build` | exit 0 |
| `basics.js` emitted; `.lot-basic` in CSS | yes |
| COGS leakage into client bundle (`UNIT_COGS`, `manifestCard`, `pickPack`) | none found |
| Headless render, 1280px and 390px | no console errors; page scrollWidth = viewport (ledger scrolls inside its frame on phone) |
| `yarn basic:envelope` | GREEN, 12/12 issues within ceiling |

**Not verified:** the in-app tab and the `/basics` server route against a
running server — no database in this container. Both are type-checked and
built; first deploy should confirm (1) logged-out `/basics` shows the OPEN TAB,
(2) logged-in `/basics` opens the app on the Basics tab,
(3) `/api/public/basic/manifest` returns 23 lines.

Screens: `docs/basics/img/open-tab-m1-desktop.png`, `docs/basics/img/open-tab-m1-phone.png`.

## 4. ENVELOPE

```
ISSUE  LINES  GOODS   FIXED   LANDED  MARGIN  STATUS
   01     10   23.20   12.80   36.00   64.0%  GO
   02     11   26.90   12.80   39.70   60.3%  GO
   03     12   24.60   12.80   37.40   62.6%  GO
   04     10   26.10   12.80   38.90   61.1%  GO
   05     12   25.20   12.80   38.00   62.0%  GO
   06     11   22.00   12.80   34.80   65.2%  GO
   07     10   23.20   12.80   36.00   64.0%  GO
   08     11   26.90   12.80   39.70   60.3%  GO
   09     12   24.60   12.80   37.40   62.6%  GO
   10     10   26.10   12.80   38.90   61.1%  GO
   11     11   24.00   12.80   36.80   63.2%  GO
   12     11   22.00   12.80   34.80   65.2%  GO
PEAK ISSUE 2: USD 39.70 / CEILING 40 · AVG USD 37.37 · FLOOR 60%
ENVELOPE: GREEN
```

First draft breached (issues 3, 4, 9, 10 at USD 40.40–41.40). Fixed by moving
electrolyte to bi-monthly and re-staggering tea and sunscreen. Estimates, not
quotes. Peak headroom USD 0.30 is the main risk for Phase 03.

## 5. OPEN ITEMS FOR THE OWNER

1. Deploy and smoke-test `/basics` (logged out and logged in).
2. Pick the billing product for the USD 100 line item — blocks Phase 02.
3. Supplements (lines 14–15): keep or swap for non-ingestibles.
4. Fulfillment: self-pack or 3PL (postage at USD 8.50 assumes a negotiated rate).

## 6. NEXT SESSION

Close Phase 01 (font vendoring, OG tags, deploy confirmation), then open
Phase 02: `basic_subscriptions` migration, server-enforced state machine,
roster intake.

**ONE DISTRACTION ELIMINATED:** the stale all-in-one branch. One phase per month.
