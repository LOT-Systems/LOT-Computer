# LOT-SR-20261121 — BASICS / LOT-FM-001 — SESSION 1 (MONTH 1 INCREMENT)

```
FORM ........ LOT-FM-001        MODULE ..... BASIC (RATION)
SESSION ..... 01 / MONTH 1      DTG ........ 20261121
BRANCH ...... claude/beautiful-johnson-js2209
STATE ....... MONTH 1 BUILT · GREEN · AWAITING DEPLOY
```

## ONE-LINE STATUS AGAINST THE ENVELOPE
OPEN TAB BUILT; 23 LINES LEDGERED; CEILING HELD 12/12 ISSUES ON ESTIMATES (PEAK USD 37.70, MIN MARGIN 62.3%); 0/23 COSTS QUOTED.

## Intake
- Prior iterations existed on `claude/nifty-allen-*` (BEST: `jWyOe`, May 2026). That branch is ~425 files behind master and
  checked the ceiling only on average. Rebuilt Month 1 cleanly on current master instead of merging it; reused the idea set, not the code.

## What shipped (this session)
| # | Item | File |
|---|---|---|
| 1 | Shared doctrine, 23-line load, load engine | `src/shared/constants/basics.ts` |
| 2 | Server-only cost sheet + per-issue envelope check | `src/server/utils/basics-envelope.ts` |
| 3 | Public ledger API | `GET /api/public/basics` in `src/server/routes/public-api.ts` |
| 4 | Public page routes | `/open-tab`; `/basics` → public entry without session, app with session (`src/server/index.ts`) |
| 5 | OPEN TAB + StatusLine components | `src/client/components/Basics/` |
| 6 | Public entry bundle | `src/client/entries/basics.tsx`, `scripts/build/client.build.ts` |
| 7 | Basics nav tab enabled for members | `Layout.tsx`, `router.ts`, `entries/app.tsx` |
| 8 | Terminal tokens `.fm*` | `src/client/index.css` |
| 9 | Envelope gate test | `scripts/tests/test-basics-envelope.ts` |
| 10 | 90-day plan | `docs/basics/LOT-FM-001-BUILD-PLAN.md` |

## Envelope (planning estimates — server side only, not public)
```
OVERHEAD/ISSUE  USD 7.85
MO  LINES  GOODS   LANDED  MARGIN
M01    15   27.15   35.00  65.0%  HELD
M02    15   26.60   34.45  65.5%  HELD
M03    15   29.70   37.55  62.5%  HELD
M04    15   29.85   37.70  62.3%  HELD
M05    16   27.50   35.35  64.7%  HELD
M06    15   29.70   37.55  62.5%  HELD
M07    15   27.15   35.00  65.0%  HELD
M08    15   26.60   34.45  65.5%  HELD
M09    15   29.70   37.55  62.5%  HELD
M10    15   29.85   37.70  62.3%  HELD
M11    15   26.60   34.45  65.5%  HELD
M12    15   29.70   37.55  62.5%  HELD
```
Overhead per issue: carton 0.95 · card 0.25 · pick/pack 1.25 · postage 5.40 = USD 7.85. Headroom at peak: USD 2.30.
Risk: postage is the largest single variable; a USD 2.50 postage rise breaches M04/M10. Month 3 must quote postage first.

## Checks
| Check | Result |
|---|---|
| `yarn build` (client + server) | PASS |
| `tsc --noEmit` whole project | 104 errors before, 104 after — none introduced |
| Envelope gate test | PASS (7/7) |
| Browser: `/open-tab` desktop 1280 / phone 390 | 23 rows render, no console errors, no horizontal scroll, no dollar figures in ledger |

Verification used a local static harness (built bundle + real envelope module); the full server was not booted (no database in this environment). The member-side tab (`/basics` with a session) was type-checked and built but not browser-tested.

## Not done / owner action
- Not deployed. Merge to master is required for "Live". No PR opened (not requested).
- Item list and cost figures are agent-drafted against the doctrine; the source manual's Section 2 load was not available in-repo. Owner review of the 23 lines is required before Month 2 opens enrollment.

## Next session (Month 2 start)
1. Read current billing integration for Usership; decide additive-line mechanism.
2. Migration + model `basic_enlistments`; transition table; `/api/basics/*`.
3. UPGRADE / roster / STAND DOWN UI in `.fm` register.
