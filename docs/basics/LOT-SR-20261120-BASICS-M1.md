# LOT-SR-20261120 · BASIC (RATION) · BUILD MONTH 1 · SESSION 01

```
MODULE     LOT-FM-001 · BASIC (RATION)
PHASE      MONTH 1 — LEDGER & DOCTRINE
SESSION    01 · 2026-11-20 · SCHEDULED ROUTINE
BRANCH     claude/beautiful-johnson-lxijcg
VERDICT    GREEN · INCREMENT DEMONSTRABLE · NOT YET DEPLOYED
```

## STATUS LINE (AGAINST ENVELOPE)

`23 LINES · PEAK USD 35.95 LANDED / 40.00 CEILING · MIN MARGIN 64% (61% NET OF CARD FEES) · COGS 23 ESTIMATE / 0 QUOTE`

## WHAT WAS FOUND

- The nav already had a **Basics** button, disabled (no route). No prior Basics code, docs or manifest existed.
- The LOT-FM-001 manual (Section 2 cadence, 23-item load) is **not in the repo**. The load below is an agent draft, marked `LOAD v0.1 · DRAFT`.
- Server entry is `src/server/index.ts`. `src/server/server.ts` is a legacy copy and was not touched.

## WHAT WAS BUILT

| # | CHANGE | FILE |
|---|---|---|
| 1 | Public manifest: 23 lines, 4 classes (SUSTAIN / HYGIENE / GARMENT / KIT), cadence M/Q/S/A with offsets, doctrine, terms, `loadForIssue()` | `src/shared/basics.ts` |
| 2 | Server-only COGS ledger: unit estimates, overhead (mailer 1.10, pick/pack 2.00, postage 7.40), envelope math | `src/server/basics/ledger.ts` |
| 3 | Envelope gate: 23-line check, duplicate NSN check, public-JSON leak check, per-issue ceiling/margin | `scripts/basics/check-envelope.ts` · `yarn basics:envelope` |
| 4 | `GET /api/public/basics`: COGS-free manifest, 5 min cache | `src/server/routes/public-api.ts` |
| 5 | `GET /basics`: members get the app tab, strangers get the read-only ledger (no login wall) | `src/server/index.ts` |
| 6 | Basics nav tab enabled; `basics` route; tab panel | `Layout.tsx` · `router.ts` · `app.tsx` |
| 7 | OPEN TAB UI: status line, 01 doctrine, 02 terms, 03 manifest, 04 12-issue cadence matrix, 05 upgrade (locked) | `src/client/components/Basics.tsx` |
| 8 | Public entry bundle | `src/client/entries/basics.tsx` · `scripts/build/client.build.ts` |

## ENVELOPE — FIRST RUN WAS RED

First draft offsets breached: issue 08 landed USD 40.25, issue 10 landed USD 43.25 (57% margin). Offsets were rebalanced with a min-peak search over Q/S/A items. Cost per line did not change. Result:

```
ISSUE  LINES  GOODS   OVHD    LANDED  MARGIN  NET
01     12     25.45   10.50   35.95   64%     61%
02     11     25.35   10.50   35.85   64%     61%
03     10     25.45   10.50   35.95   64%     61%
04     12     25.45   10.50   35.95   64%     61%
05     11     24.95   10.50   35.45   65%     61%
06     11     24.55   10.50   35.05   65%     62%
07     12     25.45   10.50   35.95   64%     61%
08     11     24.45   10.50   34.95   65%     62%
09     10     22.95   10.50   33.45   67%     63%
10     12     25.45   10.50   35.95   64%     61%
11     11     24.95   10.50   35.45   65%     61%
12     11     24.55   10.50   35.05   65%     62%
PEAK 35.95 · MEAN 35.42 · CEILING 40.00 · ENVELOPE: GREEN
```

Headroom at peak: USD 4.05 per issue before the ceiling. That buffer is for supplier quotes that come in above estimate in Month 3.

## HOUSE STYLE COMPLIANCE

| RULE | STATE |
|---|---|
| Monospace bold | YES. Stack: Liberation Mono → Courier New → monospace. **Font is not self-hosted yet** |
| Ink on ground, no colour | YES. Uses theme tokens `acc`/`bac`, so it is black on white in the default theme and follows the member's theme elsewhere |
| Hierarchy by inversion only | YES. No opacity, no grey, no weight changes |
| 2px rules, square corners | YES. `border-2`, no radius |
| Fixed character grid | YES. `ch`-based columns; 12-issue matrix fits a 390px phone |
| No icons / marketing | YES |

## VERIFICATION

| CHECK | RESULT |
|---|---|
| `tsc -p tsconfig.server.json` | 0 errors (baseline 0) |
| `tsc -p tsconfig.json` (client) | 104 errors; baseline 104 on master. All pre-existing, 0 new |
| `yarn client:js:build` · `client:css:build` · `server:build` | GREEN |
| `yarn basics:envelope` | GREEN |
| Headless render of `/js/basics.js`, 1280 and 390 wide | Renders. No page errors. No horizontal page scroll |
| Full server with DB / production | **NOT RUN.** No database in this container. `/basics` server routing is unverified at runtime |

Screenshots: `LOT-SR-20261120-BASICS-M1-desktop.png`, `LOT-SR-20261120-BASICS-M1-phone.png` (this folder).

## MONTH 1 EXIT CRITERIA

> A stranger can read what LOT issues and on what terms. Read-only. Live.

- READ: **MET** in a build.
- READ-ONLY: **MET**.
- LIVE: **NOT MET.** The branch needs to be merged and deployed.

## NEXT SESSION

1. S-2 confirms or replaces LOAD v0.1 nomenclature.
2. Self-host Liberation Mono Bold.
3. Verify `/basics` logged-out after deploy.
4. Start Month 2: `BasicsEnlistment` model and state machine.

## ELIMINATED DISTRACTION

No separate marketing or landing page. The public URL is the ledger itself.

Plan: `docs/basics/LOT-FM-001-BASIC-90-DAY-PLAN.md`
