# SESSION REPORT — LOT-FM-001 / BASIC (RATION) · MONTH 1 · SESSION 1
## Date: 2026-11-26 · Branch: `claude/beautiful-johnson-w1hqob` · Build day 001/090

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT-FM-001 │ BASIC │ MONTH 1 SESSION 1 │ ENVELOPE: HELD          ║
║  OPEN TAB BUILT · READ-ONLY · GATE GREEN                         ║
╚══════════════════════════════════════════════════════════════════╝
```

**ONE-LINE STATUS:** OPEN TAB built; 23-line ledger public; worst box USD 39.80 landed / 60.2% margin — envelope HELD, USD 0.20 headroom.

---

## 1. ENTRY STATE

- `Basics` existed in the nav as a disabled label. No route, no component, no data.
- No ration manifest, COGS or LOT-FM-001 source document exists in the repo. Nomenclature and
  cost figures in this session are **drafted by the build agent** and flagged for S-2 review.
- No payment provider is wired in the server (relevant to Month 2 billing).

## 2. WHAT SHIPPED

| FILE | PURPOSE |
|------|---------|
| `src/shared/constants/basics.ts` | Doctrine, price line, 23-line manifest (nomenclature/qty/class/cadence/offset), `issuesInMonth`, `loadForMonth`, strength states |
| `src/server/utils/basics-ledger.ts` | Server-only COGS per line, packaging + postage, per-month landed/margin, `envelopeReport()`, `publicEnvelopeStatus()` |
| `scripts/tests/test-basics-envelope.ts` + `yarn test:basics` | Gate: 23 lines, ordered, unique ids, every line issues in-cycle, every month ≤ USD 40 and ≥ 60% |
| `src/server/routes/public-api.ts` | `GET /api/public/basics/manifest` — lines + envelope `HELD/BREACH`; no figures |
| `src/client/components/Basics.tsx` | OPEN TAB: status line, doctrine, price, ledger with 12-mo issue grid, month load viewer, upgrade notice |
| `src/client/index.css` (`.lr-*`) | Terminal register: mono bold, white/black, inversion-only, 2px rules, square, scoped |
| `src/client/entries/basics.tsx`, `scripts/build/client.build.ts` | Public entry bundle for logged-out visitors |
| `src/server/server.ts` | `/basics` → `app` bundle if logged in, `basics` bundle if not |
| `src/client/stores/router.ts`, `ui/Layout.tsx`, `entries/app.tsx` | `basics` route, nav enabled (both states), tab panel; logged-out nav hard-navigates |

## 3. THE LOAD (12-MONTH CYCLE, PLANNING COGS)

Overhead per box: packaging + card USD 2.00, postage USD 8.00.

```
MO  ITEMS  LANDED   MARGIN  STATE
01     10   39.50    60.5%  HELD
02     11   37.10    62.9%  HELD
03     11   38.30    61.7%  HELD
04      9   39.80    60.2%  HELD
05     11   39.40    60.6%  HELD
06     11   37.60    62.4%  HELD
07      9   37.60    62.4%  HELD
08     12   38.50    61.5%  HELD
09     11   38.30    61.7%  HELD
10      9   39.60    60.4%  HELD
11     11   39.40    60.6%  HELD
12     11   37.60    62.4%  HELD
MAX 39.80 / 40.00 · AVG 38.56 · MIN MARGIN 60.2%
```

Cadence: 7 lines MONTHLY (sustain, hygiene, socks) · 7 QUARTERLY · 5 SEMIANNUAL · 4 ANNUAL.
Durables are staggered by offset so no month stacks two big-ticket items (headlamp MO 04, knife MO 10).

## 4. VERIFICATION

| CHECK | RESULT |
|-------|--------|
| `yarn test:basics` | GREEN — ENVELOPE HELD |
| `yarn build` (client + server) | exit 0; `dist/client/js/basics.js` emitted |
| `tsc --noEmit` | 104 errors before, 104 after — all pre-existing, none in new files |
| COGS leak check | no COGS table/ceiling symbols in any `dist/client/js` chunk |
| Browser render (Playwright, static harness, logged-out) | 23 rows, status line, month switch works; desktop 1280 and phone 390 — no horizontal page scroll (ledger scrolls inside its frame) |
| Live server run | NOT RUN — needs Postgres; harness served the built bundle with a stubbed manifest endpoint |

Screenshot: `docs/basics/open-tab-m1-desktop.png`.

## 5. RISKS / DECISIONS FOR S-2

1. **Headroom is USD 0.20** in MO 04. Any supplier quote above plan in that month breaches. Month 3 quotes must re-run the gate; fallback is to drop postage via regional carrier or move the headlamp to a lighter month.
2. **Nomenclature is drafted**, not sourced from the LOT-FM-001 manual (not in repo). Commit the manual to `docs/basics/` and the ledger will be reconciled line by line.
3. **Font:** LiberationMono-Bold is requested via stack but not self-hosted yet; renders in Liberation Mono where installed, else Menlo/Consolas.
4. **House-style override:** the module renders white/black regardless of the app theme (dark/mirror). Deliberate per directive.
5. **Billing (Month 2)** needs a provider decision — nothing in the repo charges cards today.

## 6. NEXT SESSION

Month 1 items 1.7–1.10 (S-2 copy review, self-host font, deploy, share meta), then open Month 2 with the enrollment migration and state machine.

**DISTRACTION ELIMINATED:** item choice / add-ons. One box. One cadence.
