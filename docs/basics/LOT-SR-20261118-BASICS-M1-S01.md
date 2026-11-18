# LOT-SR-20261118-BASICS-M1-S01

```
================================================================================
LOT-FM-001 / SESSION REPORT
MODULE: BASIC (RATION) — 90-DAY BUILD
SESSION: 01            MONTH: 1 / LEDGER & DOCTRINE        DATE: 2026-11-18
BRANCH: claude/beautiful-johnson-cpjmp7
STATUS: MONTH 1 INCREMENT BUILT — GREEN — AWAITING DEPLOY + S-2 REVIEW OF LOAD
================================================================================
```

## 0. ONE-LINE STATUS AGAINST THE ENVELOPE

`USD 100/MO · MAX LANDED USD 38.50 (CEILING 40.00) · MIN MARGIN 62.0% (FLOOR 60%) · AVG MARGIN 65.0% · COGS PROVISIONAL, NO SUPPLIER QUOTES YET`

## 1. SITUATION AT START

| CHECK | FINDING |
|---|---|
| Basics tab | Existed in nav as a **disabled placeholder** (`Layout.tsx`, no route, opacity 30%). |
| Prior Basics work | None. No `LOT-FM-001` document in repo. This is Session 01. |
| 23-item load / Section 2 cadence | **Not in repo.** The directive references LOT-FM-001 Section 2, but the manual was not provided. Load authored this session as **PROVISIONAL REV A** (see §4). |
| Fonts | LiberationMono is **not** bundled in `public/`. Font stack falls back to Cousine / Courier New / system mono. |
| Billing | No Stripe/billing integration exists in the codebase. Month 2 dependency. |

## 2. WHAT SHIPPED (MONTH 1 BUILD LIST)

| ITEM | STATE | WHERE |
|---|---|---|
| OPEN TAB public surface | DONE | `GET /basics` — strangers get the read-only ledger (`basics` bundle); signed-in members get the app shell on the Basics tab. Route sits inside the session scope in `src/server/index.ts`. |
| Public manifest API | DONE | `GET /api/public/basics` — nomenclature + cadence + doctrine + price, `cogs: "WITHHELD"`. 5-min public cache. |
| 23-item manifest as ledger | DONE | `src/client/components/Basics.tsx` — grouped HYGIENE / GARMENT / FIELD / OFFICE, LN · NOMENCLATURE · QTY · CADENCE. |
| COGS withheld | DONE | COGS lives only in `src/server/utils/basics-cogs.ts`. Verified: no COGS symbol in any `dist/client/js` bundle. |
| Doctrine statement | DONE | 6 lines, `BASICS_DOCTRINE` in `src/shared/constants/basics.ts`. |
| Price line | DONE | `USD 100 PER MONTH. ADDITIVE TO USERSHIP.` in TERMS + status line. |
| Status-line component | DONE | `BasicsStatusLine` — `LOT-FM-001 · BASIC · STATUS · LOAD 23 · USD 100/MO · NEXT ISSUE`. Top and bottom of ledger. `BasicsState` type already declares the Month 2 states. |
| Terminal tokens + grid | DONE | `.lot-basics*` block in `src/client/index.css`: `--fm-ground`/`--fm-ink`/`--fm-rule`, mono bold, uppercase, 2px rules, `border-radius: 0` forced, inversion-only headers, `ch`-unit columns, max 88ch. Not themed — white ground holds in dark theme by design. |
| Basics tab enabled in app nav | DONE | `router.ts` (`basics: '/basics'`), `Layout.tsx`, `app.tsx` TabPanel. |
| UPGRADE control | PLACEHOLDER | Rendered **disabled** ("UPGRADE — NOT YET OPEN"). Wired in Month 2. |
| Envelope verifier | DONE | `yarn basics:verify` — audits the 12-issue cycle, exits 1 on any breach. |

**EXIT CRITERION (MONTH 1):** *A stranger can read what LOT issues and on what terms. Read-only. Live.*
→ **MET IN CODE. NOT YET LIVE** — needs merge to `master` and deploy. Read-only: yes, no write paths added.

## 3. VERIFICATION

```
yarn build                    GREEN  (client + server)
tsc --noEmit (tsconfig.json)  104 errors before, 104 after — zero new, none in Basics files
yarn basics:verify            GREEN: ENVELOPE HOLDS
COGS leak scan (client js)    CLEAN
Playwright render             desktop 1280px: 23 lines, no console errors, no h-scroll
                              phone 390px:   23 lines, no console errors, no h-scroll
```

Screenshots: `docs/basics/basics-desktop.png`, `docs/basics/basics-phone.png`.

Defects found and fixed during the session:
1. Global `td { white-space: nowrap }` (index.css) leaked into the ledger and overlapped cells on phone → overridden under `.lot-basics-ledger`.
2. Public bundle originally imported `#client/stores` (pulls the intention engine, fires POSTs for a logged-out visitor) → `Basics.tsx` decoupled from stores; public bundle is now a 236-byte entry plus shared chunks.
3. A hidden table column under `table-layout: fixed` broke the phone grid → UI merged into the QTY column (`1 EA`).

## 4. THE 23-ITEM LOAD — PROVISIONAL REV A

Cadence model: line drawn on issue *n* when `n % P == slot`. P: M=1, Q=3, S=6, A=12. Slots staggered so no issue breaches the ceiling.

| LN | NOMENCLATURE | QTY | CAD | SLOT |
|---|---|---|---|---|
| 01 | PASTE, DENTIFRICE, FLUORIDE, 100 ML | 1 EA | M | 0 |
| 02 | SOAP, BAR, UNSCENTED, 120 G | 2 EA | M | 0 |
| 03 | SOCKS, CREW, MERINO BLEND, BLACK | 1 PR | M | 0 |
| 04 | TABLET, ELECTROLYTE, 20 CT | 1 PK | M | 0 |
| 05 | BALM, LIP, SPF 15 | 1 EA | M | 0 |
| 06 | BRUSH, TOOTH, SOFT | 1 EA | Q | 0 |
| 07 | BLADE, SAFETY RAZOR, DOUBLE EDGE, 10 CT | 1 PK | Q | 0 |
| 08 | UNDERSHIRT, CREW, COTTON, WHITE | 1 EA | Q | 0 |
| 09 | BRIEFS, BOXER, COTTON, BLACK | 1 EA | Q | 1 |
| 10 | SHAMPOO, BAR, UNSCENTED, 70 G | 1 EA | Q | 1 |
| 11 | DEODORANT, STICK, UNSCENTED | 1 EA | Q | 2 |
| 12 | BATTERY, ALKALINE, AA, 4 CT | 1 PK | Q | 2 |
| 13 | NOTEBOOK, GRID, A5, 80 SHEET | 1 EA | S | 0 |
| 14 | PEN, GEL, BLACK, 0.5 MM | 2 EA | S | 1 |
| 15 | HANDKERCHIEF, COTTON, WHITE | 2 EA | S | 2 |
| 16 | CLOTH, CLEANING, MICROFIBER | 1 EA | S | 3 |
| 17 | TAPE, DUCT, BLACK, 10 M | 1 EA | S | 4 |
| 18 | LAMP, HEAD, LED, 100 LM | 1 EA | A | 1 |
| 19 | KNIFE, UTILITY, FOLDING | 1 EA | A | 3 |
| 20 | KIT, FIRST AID, POCKET | 1 KT | A | 5 |
| 21 | CLIPPER, NAIL, STEEL | 1 EA | A | 7 |
| 22 | CAP, WATCH, KNIT, BLACK | 1 EA | A | 9 |
| 23 | BOTTLE, WATER, STEEL, 750 ML | 1 EA | A | 11 |

12-issue envelope audit (COGS estimates + USD 10.00 freight: carton 1.20, card 0.30, postage 8.50):

```
ISSUE  GOODS   LANDED  MARGIN
00001  25.00   35.00   65.0%
00002  28.50   38.50   62.0%   <- peak (Q slot 1 + S slot 1 + headlamp)
00003  21.50   31.50   69.0%
00004  28.00   38.00   62.0%
00005  23.00   33.00   67.0%
00006  23.50   33.50   67.0%
00007  25.00   35.00   65.0%
00008  24.00   34.00   66.0%
00009  21.50   31.50   69.0%
00010  27.00   37.00   63.0%
00011  23.00   33.00   67.0%
00012  24.50   34.50   66.0%
```

**RISK:** headroom at peak is USD 1.50. Payment processing (card rate ~2.9% + 0.30 ≈ USD 3.20) is **not** inside the USD 40 landed figure; if S-2 counts it against the 60% floor, peak issue 00002 lands at 58.3% and issue 00004 at 58.8% → breach. Mitigation for Month 3: cut the M-cadence floor (USD 13.50 every issue — socks LN 03 is the biggest lever) or quote freight below USD 10.00. Re-slotting alone does not fix it; it only moves the peak.

## 5. 90-DAY PLAN (SESSION GRID)

| WK | MONTH | BUILD | EXIT |
|---|---|---|---|
| 1 | M1 | OPEN TAB ledger, doctrine, price, status line, tokens/grid, verifier | **DONE (this session)** |
| 2 | M1 | Deploy to prod; bundle LiberationMono-Bold locally; `/basics` OG tags; S-2 locks load REV A or issues REV B | Stranger reads `/basics` live |
| 3 | M1 | `basics_memberships` + `basics_issues` migrations (Sequelize); state machine types; admin read view under `/us` | Schema merged, no UI change |
| 4 | M1→M2 | M1 gate review; status line reads real state from `/api/basics/me` | Month 1 closed |
| 5 | M2 | UPGRADE control live: USERSHIP/AI → PENDING; roster intake (sizing: socks/shirt/briefs/cap; shipping address; cadence start) | Member reaches PENDING |
| 6 | M2 | Billing: Stripe subscription USD 100/mo additive to Usership (needs keys + S-2 approval); webhook → ON STRENGTH | Paid member ON STRENGTH |
| 7 | M2 | STAND DOWN: cancel ration sub, retain AI; state → USERSHIP/AI; issue log scaffold (empty ledger rows) | ON → OFF end to end |
| 8 | M2→M3 | M2 gate: full loop test in staging with Stripe test mode | Month 2 closed |
| 9 | M3 | Load engine: `basicsLinesForIssue(n)` per member, NEXT ISSUE computed, STEADY STATE after issue 00002 | Per-member manifest preview |
| 10 | M3 | Supplier quotes for 23 lines + carton + postage; replace estimates in `basics-cogs.ts`; `basics:verify` must stay green | Quotes ≤ ceiling |
| 11 | M3 | Printed manifest card (HTML→PDF, same tokens) per issue; packing list export | Card prints |
| 12 | M3 | First issue scheduled + dispatched; tracking into issue log; NEXT ISSUE advances | **First ration ships** |
| 13 | M3 | Margin verified on actuals ≥ 60%; end-state report | END STATE |

## 6. DECISIONS NEEDED FROM S-2

1. **Lock the 23-item load.** REV A was authored here because LOT-FM-001 Section 2 is not in the repo. Commit the manual (or the list) to `docs/basics/` and the next session will conform the data to it.
2. **Is payment processing inside the USD 40 ceiling?** Changes whether peak issue passes (§4 risk).
3. **Billing provider + keys** for Month 2 (no billing exists today).
4. **Merge/deploy** this branch so the Month 1 exit ("Live") is met.

## 7. FILES

```
NEW  src/shared/constants/basics.ts       public manifest, cadence model, doctrine, states
NEW  src/server/utils/basics-cogs.ts      COGS (withheld), freight, envelope audit
NEW  src/client/components/Basics.tsx     BasicsLedger, BasicsStatusLine, Basics tab
NEW  src/client/entries/basics.tsx        public OPEN TAB bundle
NEW  scripts/basics/verify-envelope.ts    yarn basics:verify
NEW  docs/basics/*                        this report + screenshots
MOD  src/server/index.ts                  GET /basics (session-aware)
MOD  src/server/routes/public-api.ts      GET /api/public/basics
MOD  src/client/stores/router.ts          basics route
MOD  src/client/components/ui/Layout.tsx  Basics nav enabled (members)
MOD  src/client/entries/app.tsx           Basics TabPanel
MOD  src/client/index.css                 .lot-basics terminal tokens + grid
MOD  scripts/build/client.build.ts        basics entry
MOD  package.json                         basics:verify script
```

## 8. DISTRACTION ELIMINATED

Did not build any billing or state-machine UI ahead of schedule. The UPGRADE button is visible but disabled; the Month 1 surface is read-only, as specified.

```
END SESSION 01 — NEXT: WEEK 2 (DEPLOY, FONT, LOAD LOCK)
================================================================================
```
