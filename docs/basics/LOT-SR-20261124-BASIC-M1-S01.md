# LOT-SR-20261124 · BASIC (RATION) · MONTH 1 · SESSION 01

```
DOC        LOT-FM-001 / BASIC — SESSION REPORT
DATE       2026-11-24
BRANCH     claude/beautiful-johnson-ufuhlf
PHASE      MONTH 1 — LEDGER & DOCTRINE
STATUS     MONTH 1 CORE: BUILT · GREEN · NOT YET DEPLOYED
ENVELOPE   PEAK USD 36.30 / CEILING 40.00 · MIN MARGIN 64% (EST.) — GREEN
```

## 1. STATUS LINE AGAINST THE ENVELOPE

> M1 open tab built, read-only, 23 lines; landed est. peak USD 36.30 ≤ 40.00, margin ≥ 64%; quotes unconfirmed (M3).

## 2. WHAT WAS ISSUED

| ITEM | DETAIL |
|---|---|
| Basics tab | Nav button `Basics` enabled for members, route `/basics` |
| OPEN TAB | Strangers hitting `/basics` get the public read-only ledger (new `basics` entry). No login wall |
| Ledger | 23 lines · LN · NOMENCLATURE · QTY · U/I · CADENCE. Cost basis withheld |
| Doctrine | 6 lines. Terms: 4 lines. Price line `USD 100/MO · 23 LINES · ISSUED MONTHLY` |
| Status line | `PLAN BASIC │ ROLL … │ LOAD 23 LN │ NEXT ISSUE NOT SCHEDULED │ UPGRADE NOT YET OPEN`. ROLL = `USERSHIP / AI` for Usership tag holders, else `NOT ON ROLL` |
| Public JSON | `GET /api/public/basics/manifest` — doctrine, terms, manifest, price. No cost |
| Cost ledger | `src/server/basics/cogs.ts` — server-only, all lines `ESTIMATE` |
| Envelope gate | `npm run basics:check` — 23 lines, sequential, uppercase, 12-cycle ceiling, margin floor, state machine table |
| State machine | `basicsTransition()` encoded + tested now so Month 2 builds against fixed doctrine |
| Load engine core | `basicsLoadForCycle()` pure function — used by envelope gate, reused by M3 |
| Plan | `docs/basics/LOT-FM-001-BASIC-90-DAY-PLAN.md` |

## 3. FILES

```
NEW  src/shared/basics.ts                     doctrine · manifest · cadence · SM
NEW  src/server/basics/cogs.ts                cost ledger (server only)
NEW  src/client/components/Basics.tsx         Basics / BasicsTab / BasicsStatusLine
NEW  src/client/entries/basics.tsx            public OPEN TAB entry
NEW  scripts/basics/envelope-check.ts         envelope gate
NEW  docs/basics/*                            plan · this report · screenshots
MOD  src/client/stores/router.ts              + basics route
MOD  src/client/components/ui/Layout.tsx      Basics nav enabled
MOD  src/client/entries/app.tsx               Basics TabPanel
MOD  src/client/index.css                     .lot-basics scoped style
MOD  src/server/index.ts                      /basics route (member→app, stranger→open tab)
MOD  src/server/routes/public-api.ts          /api/public/basics/manifest
MOD  scripts/build/client.build.ts            + basics entry
MOD  package.json                             + basics:check
```

## 4. VERIFICATION

| CHECK | RESULT |
|---|---|
| `npm run build` (client + server) | PASS |
| `tsc -p tsconfig.server.json` | PASS, 0 errors |
| `tsc -p tsconfig.json` (client) | 104 pre-existing errors, **0 new** (baseline diffed per file) |
| `npm run basics:check` | GREEN |
| Cost data absent from client bundle (`grep ESTIMATE/BASICS_UNIT_COST dist/client/js`) | PASS |
| Render, Chromium 1280px + 390px | No console errors, no horizontal page scroll |
| Phone ledger | Cadence column switches to MO/QTR/SEMI/ANN under 480px — first render clipped `SEMIANNUAL`, fixed |

Screenshots: `docs/basics/open-tab-m1-desktop.png`, `docs/basics/open-tab-m1-phone.png`.

Not verified: the `/basics` server route against a live database (no DB in this
container). The route is a copy of the existing `KNOWN_CLIENT_ROUTES` pattern.

## 5. DECISIONS TAKEN WITHOUT S-2 (REVIEW)

1. **The 23 lines.** LOT-FM-001 Section 2 was not in the repo. The load was authored
   this session: garments (5), hygiene (11), medical (1), provisions (2), power (2),
   stationery (2). Line numbers are now load-bearing. Replace freely before M2 — after
   the first subscriber, never renumber.
2. **Unit costs are estimates.** Overhead USD 10.00/issue assumes a ≤1 lb mailer at
   USD 7.50 postage.
3. **Font.** Stack is `Liberation Mono → Cousine → Courier New`, weight 700. No font
   file is shipped yet; machines without Liberation Mono get a fallback (task 1.9).
4. **Theme isolation.** The tab forces white ground / black ink whatever theme the
   member picked, per the directive.
5. **Logged-out nav.** The login screen's disabled `Basics` button is unchanged; the
   public surface is the URL `/basics`.

## 6. NEXT SESSION

1. Self-host Liberation Mono Bold (task 1.9).
2. OG/meta tags for `/basics` (task 1.10).
3. Start M2 schema: `basics_enrollments`, `basics_events` migrations.

**Blocker for M2 that needs S-2:** billing provider and account for the
USD 100/mo additive line item.

## 7. ONE DISTRACTION ELIMINATED

No per-line price on the public ledger. The ledger shows what is issued, not what it
costs LOT. One fewer thing to argue about.
