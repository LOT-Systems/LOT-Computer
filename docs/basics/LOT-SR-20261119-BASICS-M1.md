# LOT-SR-20261119 · BASICS · MONTH 1 · SESSION 01

```
DIRECTIVE  LOT-FM-001 SELF-ASSEMBLY · MODULE BASIC (RATION)
PHASE      MONTH 1 — LEDGER & DOCTRINE
BRANCH     claude/beautiful-johnson-4256wn
RESULT     GREEN · BUILD PASSES · ENVELOPE HOLDS
STATUS     OPEN TAB BUILT. NOT YET DEPLOYED.
```

## 1. STATUS AGAINST THE ENVELOPE

`USD 100/MO · PEAK BOX USD 36.35 LANDED (CEILING 40) · FLOOR MARGIN 63.6% (FLOOR 60) · COSTS ARE ESTIMATES`

## 2. WHAT WAS FOUND

- The nav already carried a dead `Basics` button (no route, greyed out) in
  `src/client/components/ui/Layout.tsx`. No prior Basics code, docs or data.
- The LOT-FM-001 manual itself is not in the repo. The 23-line load, cadence
  and doctrine below are a draft written against the directive's rules.
  **They must be checked against FM-001 Section 2 before deploy.**
- No LiberationMono webfont in `public/`. The tab uses a `local()` font stack
  (Liberation Mono → Courier New → monospace) for now.
- `npm ci` needs `--legacy-peer-deps` (nanostores peer conflict, pre-existing).
- Client `tsc --noEmit` has 104 errors on master. Same count after this
  session. None in new files.

## 3. WHAT WAS BUILT

| FILE | PURPOSE |
|------|---------|
| `src/shared/basics/manifest.ts` | 23-line manifest: code, nomenclature, class I–V, qty, cadence, offset. Doctrine, terms, price. `linesForMonth(n)`, `publicManifest()` (no cost fields). |
| `src/server/utils/basics-cogs.ts` | Server-only unit costs (ESTIMATE), carton + postage overhead, `auditMonth`, `auditCycle`. |
| `scripts/tests/test-basics-ceiling.ts` | `npm run test:basics`. Red if lines != 23, duplicate codes, bad offsets, a cost field leaks into the public view, or any box in 12 months breaks USD 40 / 60%. |
| `src/server/routes/public-api.ts` | `GET /api/public/basics/manifest` — plan, doctrine, terms, 23 lines. COGS withheld. |
| `src/client/components/Basics.tsx` | The tab: header, Section 1 Doctrine, Section 2 Ration Load ledger by class, Section 3 Terms, `StatusLine`. |
| `src/client/entries/basics.tsx` | Public guest entry for `/basics`. |
| router / Layout / app.tsx | `basics` route, nav button enabled, tab panel. |
| `src/server/index.ts`, `server.ts` | `/basics` in client routes; guests get the `basics` bundle, not login. |

## 4. ENVELOPE AUDIT (12-MONTH CYCLE)

```
MO  LINES  GOODS   LANDED  MARGIN
01     12   21.45   32.15  67.8%
02     12   22.65   33.35  66.7%
03     14   25.25   35.95  64.0%
04     13   22.05   32.75  67.3%
05     13   25.65   36.35  63.6%
06     14   22.75   33.45  66.5%
07     12   21.45   32.15  67.8%
08     12   22.65   33.35  66.7%
09     14   25.25   35.95  64.0%
10     13   22.05   32.75  67.3%
11     13   25.65   36.35  63.6%
12     14   22.75   33.45  66.5%
PEAK 36.35 (MO 5) · FLOOR MARGIN 63.6%
GREEN  envelope holds
```

Offsets stagger quarterly and semiannual lines so no box spikes. Headroom at
peak: USD 3.65.

## 5. VERIFICATION

| CHECK | RESULT |
|-------|--------|
| `npm run server:build` | PASS |
| client esbuild (incl. new `basics` entry) | PASS |
| `npm run client:css:build` | PASS |
| `npm run test:basics` | GREEN |
| client `tsc` error count | 104 → 104 (no new) |
| Headless render, 1280px | no errors, no overflow |
| Headless render, 390px | no errors, no overflow (fixed one 75px overflow) |

Screens: `docs/basics/basics-desktop.png`, `docs/basics/basics-phone.png`.

Not verified: logged-in tab inside the full app (needs DB + auth), live
server route behaviour. Both are straightforward but untested here.

## 6. OPEN ITEMS → NEXT SESSION

1. Reconcile manifest + doctrine with FM-001 Section 2 text (owner input).
2. Bundle LiberationMono-Bold as a webfont.
3. Deploy; confirm a logged-out stranger reads `/basics`.
4. Start Month 2: `basics` state field + UPGRADE control.

## 7. ONE DISTRACTION ELIMINATED

No per-item choice on the manifest. One load for everyone.
