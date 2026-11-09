# LOT-BASICS-SR-20261109-01 — BASIC (RATION) MODULE, SESSION 1

```
DATE     : 2026-11-09
SOURCE   : LOT-FM-001 REV A (Drive: LOT_RATION_SYSTEM_SPEC.md)
BRANCH   : claude/beautiful-johnson-ehruyw
PHASE    : MONTH 1 — LEDGER & DOCTRINE
STATUS   : MONTH 1 BUILD LANDED (in-app tab + public JSON). SEE OPEN ITEMS.
```

## ENVELOPE STATUS (ONE LINE)
Price $100/mo · landed worst case $25.60 (ceiling $40) · margin 74.4–81.7% (floor 60%) · PASS ×12 months.

## BUILT
| Path | Purpose |
|---|---|
| `src/shared/basics/manifest.ts` | 23-item register, class, cadence, month map. **No COGS.** |
| `src/shared/basics/doctrine.ts` | Doctrine + terms copy (quartermaster register). |
| `src/server/basics/cogs.ts` | COGS, fulfillment, packaging. **Server only.** (Force-added: `.gitignore` rule `server/` swallows new files here.) |
| `src/client/components/Basics.tsx` | OPEN TAB: status line, doctrine, inverted-header ledger, price, terms. |
| `src/client/stores/router.ts`, `Layout.tsx`, `entries/app.tsx` | `/basics` route; Basics nav button live for both auth states. |
| `src/server/routes/public-api.ts` | `GET /api/public/basics` — public read-only ledger JSON, COGS and month map withheld. |
| `scripts/verify-basics.ts` | Envelope gate: 23 items, landed ≤ $40, margin ≥ 60%, per month. |

## VERIFY
```
npx tsx scripts/verify-basics.ts   -> 12/12 PASS, 23 items, goods avg $13.06
tsc --noEmit                       -> 13 errors before and after (pre-existing; none in touched files)
```
Not run: browser render / visual check, server boot against `/api/public/basics`.

## FINDINGS
1. **Spec internal mismatch.** FM-001 §2.3 monthly load table does not match the §2.1 cadence register (e.g. MO 04 table $17.40 vs register-derived $8.30; goods avg ~$15 vs $13.06). Code follows the **register** (§2.1) as the single source. Needs an operator ruling on which is canonical before Month 3 load engine.
2. **Duplicate spec in Drive** (two identical `LOT_RATION_SYSTEM_SPEC.md`). Harmless; consolidate.
3. **Truly public (logged-out) page not delivered.** The SPA renders only after `getMe()`; a stranger gets the JSON endpoint but not the HTML tab. Needs a public entry (like `login`/`about` entries) — Month 1 carry-over.
4. COGS are estimates; no supplier quotes yet (Month 3 gate).

## OPEN / NEXT SESSION
- Public no-auth HTML entry for the OPEN TAB (closes Month 1 EXIT).
- Visual pass in browser against house tokens (LiberationMono-Bold, 2px rules, square). Basics uses existing theme classes `bg-acc`/`text-bac`; confirm no radius/shadow inherited.
- Begin Month 2: UPGRADE control + state machine (`USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE`); needs billing provider decision (not found in repo).

## DISTRACTION ELIMINATED
Marketing copy layer. The ledger is the page.
