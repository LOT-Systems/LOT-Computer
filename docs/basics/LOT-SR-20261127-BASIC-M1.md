# LOT-SR-20261127 · BASIC · MONTH 1 · SESSION 01

```
================================================================================
LOT SESSION REPORT · LOT-FM-001 · MODULE BASIC (RATION)
DATE 2026-11-27 · PHASE MONTH 1 / LEDGER & DOCTRINE · SESSION 01
BRANCH claude/beautiful-johnson-uwnvkg · BUILD GREEN · ENVELOPE GREEN
================================================================================
```

## STATUS LINE

**M1: OPEN TAB BUILT, READ-ONLY, 23/23 ITEMS ON LEDGER · PEAK LANDED USD 39.80 ≤ 40 · AVG MARGIN 61.3% · AWAITING DEPLOY.**

## 1. INTAKE

Scheduled directive LOT-FM-001: build the BASIC ration module over 90 days.
First session on this module. No prior BASIC code or reports in the repo.
The `Basics` nav button existed as a disabled placeholder in
`src/client/components/ui/Layout.tsx`.

The directive cites a 23-item load and a "Section 2 cadence" from the
LOT-FM-001 manual. That manual is not in the repo. This session authored the
23-item load and cadence to fit the envelope. **S-2: replace with the manual's
list if it differs** — edit `src/shared/constants/basics.ts` and re-run the gate.

## 2. ACTIONS

| # | ACTION | FILE |
|---|---|---|
| 1 | 23-item manifest, doctrine, terms, cadence + load functions | `src/shared/constants/basics.ts` (new) |
| 2 | Server-only COGS, pack, freight, envelope calculator | `src/server/utils/basics-cogs.ts` (new) |
| 3 | Envelope gate, exits 1 on breach | `scripts/basics-envelope.ts` (new), `yarn basics:envelope` |
| 4 | Public ledger API, verdict only, no figures | `src/server/routes/public-api.ts` → `GET /api/public/basics` |
| 5 | OPEN TAB terminal sheet + `StatusLine` component | `src/client/components/Basics.tsx` (new) |
| 6 | Public entry bundle | `src/client/entries/basics.tsx` (new), `scripts/build/client.build.ts` |
| 7 | `/basics` route: members → app tab, strangers → public sheet | `src/server/index.ts`, `src/server/server.ts` |
| 8 | Router + tab panel + nav button enabled | `stores/router.ts`, `entries/app.tsx`, `ui/Layout.tsx` |
| 9 | Terminal tokens: mono bold, white/black, 2px rules, inversion, square | `src/client/index.css` (`.lot-basics*`) |
| 10 | 90-day plan + risk register | `docs/basics/LOT-FM-001-BASIC-90-DAY-PLAN.md` |

## 3. ENVELOPE (SERVER-ONLY FIGURES — INTERNAL REPORT)

The first draft load breached: peak USD 53.00, average margin 56.6%. Fixed by
moving slow-burn items to quarterly packs (toothpaste ×2, deodorant ×2,
facial tissue ×2, dish concentrate 1L, multivitamin 90 CT), replacing the
fleece sweatshirt with a knit watch cap, and staggering offsets.

```
LOT-FM-001 · BASIC · ENVELOPE · 12-MONTH CYCLE
MANIFEST 23 · CEILING USD 40
MO  ITEMS  GOODS   LANDED  MARGIN  STATE
 1     12   26.70   37.00     63%  OK
 2     11   29.30   39.60     60%  OK
 3     10   28.40   38.70     61%  OK
 4     13   28.60   38.90     61%  OK
 5     10   27.80   38.10     62%  OK
 6     10   28.40   38.70     61%  OK
 7     13   29.50   39.80     60%  OK
 8     11   29.30   39.60     60%  OK
 9     10   28.40   38.70     61%  OK
10     13   28.60   38.90     61%  OK
11     10   27.80   38.10     62%  OK
12     10   28.40   38.70     61%  OK
PEAK USD 39.80 · AVG USD 38.73 · AVG MARGIN 61.3%
ENVELOPE: GREEN
```

## 4. CHECKS

| CHECK | RESULT |
|---|---|
| `yarn server:build` (tsc) | PASS |
| `yarn client:js:build` (esbuild) | PASS (pre-existing duplicate-key warnings in badges.ts, unrelated) |
| `yarn client:css:build` | PASS, `.lot-basics` in output |
| `tsc --noEmit` on touched client files | No new errors (11 pre-existing in app.tsx/router.ts, same count before and after) |
| Envelope gate | GREEN |
| Render, desktop 1280 | PASS, 0 console errors |
| Render, phone 390 | PASS after fix (was 17px horizontal overflow; sticky status line overlapped rows, now static) |
| Live server + DB | NOT RUN (no DB in session). `/basics` route and API verified by build only |

## 5. SURFACE

- `/basics` logged out: public OPEN TAB. Doctrine, terms, ledger, LOG IN.
- `/basics` logged in: Basics tab in the app nav. Same sheet, UPGRADE shown
  disabled (opens Month 2).
- Status line: `STATE · ISSUE 01 n ITEMS · ENVELOPE GREEN/BREACH`.
- Theme-independent: the ledger stays white on black on every theme.
- Font: `Liberation Mono` bold, falling back to Courier New. No font file is
  shipped, so most visitors get the fallback. Bundling the OFL font file is
  queued for M2.

## 6. OPEN ITEMS → NEXT SESSION

1. S-2: confirm the 23-item list against the LOT-FM-001 manual (not in repo).
2. S-2: confirm USD 100 supersedes the USD 399 physical tier in `docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md`.
3. Deploy and verify `/basics` live while logged out. This is the M1 exit.
4. M2 start: identify the billing processor, write the `basics_enlistment` migration, build the UPGRADE state machine.
5. Bundle the Liberation Mono Bold font file.

## 7. ONE DISTRACTION ELIMINATED

Considered and declined: per-item images, a cart, any color. The ledger is
text only.
