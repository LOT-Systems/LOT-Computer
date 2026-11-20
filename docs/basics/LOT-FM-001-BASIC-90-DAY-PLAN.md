# LOT-FM-001 · MODULE: BASIC (RATION) · 90-DAY BUILD PLAN

```
STATUS     MONTH 1 OF 3 · IN PROGRESS
START      2026-11-20
END        2027-02-18 (T+90)
ENVELOPE   USD 100/MO · ≥60% MARGIN · ≤USD 40 LANDED PER ISSUE
GATE       yarn basics:envelope  (exits 1 on breach — nothing ships red)
```

## SOURCE OF TRUTH

| FILE | HOLDS | PUBLIC |
|---|---|---|
| `src/shared/basics.ts` | 23-line manifest, cadence, doctrine, terms, `loadForIssue()` | YES — ships to browser |
| `src/server/basics/ledger.ts` | Unit COGS, per-issue overhead, envelope math | NO — server only |
| `scripts/basics/check-envelope.ts` | Envelope gate + public-leak check | — |
| `src/client/components/Basics.tsx` | OPEN TAB ledger UI (in-app tab + public page) | — |
| `GET /api/public/basics` | COGS-free JSON projection of the manifest | YES |
| `GET /basics` | Members → app tab. Strangers → read-only ledger | YES |

## MONTH 1 — LEDGER & DOCTRINE · 2026-11-20 → 2026-12-19

- [x] Public manifest: 23 lines, nomenclature + qty + cadence (M/Q/S/A + offset)
- [x] COGS ledger server-side, withheld from public JSON (leak check in gate)
- [x] Envelope gate across full 12-issue cycle
- [x] Cadence offsets balanced → flat load (peak landed USD 35.95)
- [x] `/basics` route, nav tab enabled, public unauthenticated page
- [x] `/api/public/basics` endpoint
- [x] Status line component, monospace grid, inversion-only hierarchy
- [ ] S-2 sign-off on nomenclature (LOAD v0.1 → v1.0)
- [ ] Self-hosted Liberation Mono Bold webfont (currently falls back to system mono when absent)
- [ ] Production verify: `/basics` renders logged-out on lot-systems.com
- [ ] Printed manifest card layout draft (feeds Month 3)

EXIT: a stranger can read what LOT issues and on what terms. Read-only. Live.

## MONTH 2 — UPGRADE & ROSTER · 2026-12-20 → 2027-01-18

- [ ] `BasicsEnlistment` model + migration: `userId, state, cadenceStart, issueIndex, sizing, shipTo, stripeSubId`
- [ ] State machine: `USERSHIP/AI → PENDING → ON_STRENGTH → STEADY_STATE`, plus `STAND_DOWN` (drops ration, keeps AI tag)
- [ ] Roster intake form: sizing (shirt, briefs, socks), US ship-to, cadence start
- [ ] Stripe: additive USD 100/mo price on existing Usership customer
- [ ] Webhooks drive transitions (payment ok → ON_STRENGTH; first issue delivered → STEADY_STATE; cancel → STAND_DOWN)
- [ ] Issue log scaffold (empty ledger rows per member)
- [ ] UPGRADE control unlocked in tab for Usership members

EXIT: a Usership member can go ON STRENGTH and back OFF, end to end.

## MONTH 3 — ISSUE & FULFILLMENT · 2027-01-19 → 2027-02-18

- [ ] Load engine: per-member `loadForIssue(issueIndex)` → pick list
- [ ] Supplier quotes for all 23 lines; flip `source: 'ESTIMATE' → 'QUOTE'`; gate must stay green
- [ ] 3PL / postage quote replaces overhead estimate (USD 10.50 today)
- [ ] Printed manifest card generator (PDF, member name, issue no., lines)
- [ ] First issue scheduled and dispatched; tracking into issue log
- [ ] NEXT ISSUE advances on dispatch
- [ ] Margin verified on actual invoice ≥60%

EXIT: first real ration ships to a real subscriber. Margin verified ≥60%.

## OPEN QUESTIONS FOR S-2

1. Nomenclature in LOAD v0.1 is an agent draft. Confirm or replace the 23 lines. The LOT-FM-001 "Section 2 cadence" table was not in the repo.
2. Margin definition: gate uses (price − landed) / price ≥ 60%. Net of card fees is also reported (min 61% today).
3. Public `/basics` has no login wall. Confirm this is the intended OPEN TAB.
4. Liberation Mono Bold: OK to self-host the font (SIL OFL)?
