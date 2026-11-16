# LOT-FM-001 · BASIC (RATION) MODULE · 90-DAY BUILD PLAN

```
FM ............ LOT-FM-001
MODULE ........ BASIC (RATION) — the Basics tab
PRICE ......... USD 100 / MO, additive to Usership (AI plan)
CEILING ....... USD 40 landed per issue · margin floor 60%
START ......... 2026-11-16 (Phase 01, day 1)
EXITS ......... P01 2026-12-15 · P02 2027-01-14 · P03 2027-02-13
STATUS ........ PHASE 01 — LEDGER & DOCTRINE — BUILT, READ-ONLY
```

Living document. Update the status block and the phase checklists at the
end of every session. Session reports go in `docs/basics/reports/`.

---

## 0. WHERE THINGS LIVE

| Concern | File | Ships to public? |
|---|---|---|
| 23-line manifest, cadence, doctrine, price line, state vocabulary | `src/shared/constants/basic.ts` | YES (client bundle) |
| Unit COGS, fixed per-issue cost, ceiling check | `src/server/utils/basic-envelope.ts` | NO (server only) |
| Envelope gate (exits 1 on breach) | `scripts/basic-envelope.ts` · `yarn basic:envelope` | — |
| Tab + public OPEN TAB UI | `src/client/components/Basics.tsx` | YES |
| House style tokens (`.lot-basic`) | `src/client/index.css` (end of file) | YES |
| Public entry (no session) | `src/client/entries/basics.tsx` | YES |
| `/basics` route (member → app tab, visitor → OPEN TAB) | `src/server/index.ts` | — |
| Public JSON manifest | `GET /api/public/basic/manifest` in `src/server/routes/public-api.ts` | YES |

Rule: **COGS never enters `src/shared` or `src/client`.** The public sees
nomenclature, quantity, unit, class, cadence. Nothing else.

---

## 1. PHASE 01 — LEDGER & DOCTRINE (DAYS 1–30)

The System exists, read-only.

- [x] `/basics` route; Basics nav tab enabled for members
- [x] Public OPEN TAB at `/basics` for visitors (not the login wall)
- [x] 23-line manifest ledger: SEQ · NOMENCLATURE · QTY · UNIT · CLASS · CADENCE · 12-issue rotation grid
- [x] Doctrine statement (5 lines)
- [x] Price line
- [x] Status line (3270 operator-information line: phase · state · next issue · UTC stamp)
- [x] Terminal tokens: mono bold, white/black, inversion-only, 2px rules, square corners, fixed grid
- [x] Public JSON manifest (`/api/public/basic/manifest`)
- [x] Envelope gate script — 12-issue year GREEN, peak USD 39.70
- [ ] Deploy to production and confirm `/basics` loads logged-out (needs prod access — owner action)
- [ ] Vendor Liberation Mono Bold (SIL OFL) into `public/fonts/` with `@font-face`; today the stack falls back to Courier New when the font is not installed locally
- [ ] Add `/basics` to `sitemap`/OG tags so a stranger can find it

**EXIT:** a stranger can read what LOT issues and on what terms. Read-only. Live.

## 2. PHASE 02 — UPGRADE & ROSTER (DAYS 31–60)

Usership AI → BASIC and back.

- [ ] Migration `basic_subscriptions` (userId, state, roster JSON, startedAt, stoodDownAt, billing ref)
- [ ] Model + `GET /api/basic/subscription`
- [ ] State machine, server-enforced: `USERSHIP → PENDING → ON_STRENGTH → STEADY_STATE`; `STAND DOWN` from any non-USERSHIP state → `USERSHIP` (AI plan untouched)
- [ ] UPGRADE control in the tab (members with Usership only)
- [ ] Roster intake: underwear size, sock size, shirt size (lines 17–19), shipping address, cadence start date
- [ ] Recurring USD 100/mo additive billing. Reuse the existing Usership billing path; a second line item, not a second customer. **Decision needed from owner: billing provider/product ID.**
- [ ] STAND DOWN: cancels the ration line item at period end, keeps Usership
- [ ] Issue log scaffold: `basic_issues` table (issueNo, load snapshot, status, tracking) — empty until Phase 03
- [ ] Status line reads live state instead of `BASIC_PHASE`

**EXIT:** a Usership member can go ON STRENGTH and back OFF, end to end.

## 3. PHASE 03 — ISSUE & FULFILLMENT (DAYS 61–90)

The box ships.

- [ ] Load engine: `loadForIssue(n)` already defined in shared; persist a load snapshot per issue
- [ ] Supplier quotes for all 23 lines; replace estimates in `UNIT_COGS_USD`; `yarn basic:envelope` must stay GREEN
- [ ] Printed manifest card (print stylesheet / PDF): issue no., member call sign, load lines, NEXT ISSUE
- [ ] Admin dispatch: mark PACKED → SHIPPED (tracking) → DELIVERED; DELIVERED advances member to STEADY_STATE and schedules next issue
- [ ] Issue log in tab accrues; NEXT ISSUE advances
- [ ] First real ration to a real subscriber; record actual landed cost and margin

**EXIT:** first real ration ships. Margin verified ≥ 60%.

---

## 4. ENVELOPE (PLANNING ESTIMATES)

Fixed per issue: box 1.20 · manifest card 0.60 · pick/pack 2.50 · postage 8.50 = **USD 12.80**.
Goods budget therefore ≤ USD 27.20 in every issue.

```
ISSUE  LINES  GOODS   LANDED  MARGIN
01     10     23.20   36.00   64.0%
02     11     26.90   39.70   60.3%   ← peak
03     12     24.60   37.40   62.6%
04     10     26.10   38.90   61.1%
05     12     25.20   38.00   62.0%
06     11     22.00   34.80   65.2%
...    (07–12 repeat the 6-issue shape; 11 = 36.80)
AVG LANDED USD 37.37 · PEAK USD 39.70 · CEILING USD 40.00
```

**Risk:** headroom at peak is USD 0.30. Any quote overrun on line 08
(razor refill) or 17 (underwear) in an even issue breaches. Levers in
order: (1) negotiate postage via a fulfillment partner's rate,
(2) move line 08 to quarterly, (3) drop line 15 (electrolyte) to quarterly.
Never raise the price; never breach the ceiling.

---

## 5. OPEN DECISIONS (OWNER)

1. Billing: which provider/product carries the USD 100 line item (Phase 02 blocker).
2. Supplements (lines 14, 15): keep in the ration or swap for non-ingestibles to avoid label/liability work.
3. Fulfillment: self-pack vs. 3PL. 3PL likely needed to hold postage at USD 8.50.
4. Shipping territory: US-only at launch (assumed).

## 6. ONE DISTRACTION ELIMINATED

Earlier attempt `claude/nifty-allen-jWyOe` built all three phases in one
commit (2026-05-30) on a base that is now ~6 months stale and was never
merged. Its 23-line manifest had no textile lines, though its roster asked
for sizes. This plan supersedes it: one phase per month, each one live
before the next starts.
