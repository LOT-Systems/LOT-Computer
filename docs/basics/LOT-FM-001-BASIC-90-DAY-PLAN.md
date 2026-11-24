# LOT-FM-001 · BASIC (RATION) · 90-DAY BUILD PLAN

```
DOC        LOT-FM-001 / SELF-ASSEMBLY DIRECTIVE
MODULE     BASIC (RATION) — the hardware/physical tab of the LOT® System
TAB        Basics  (/basics)
WINDOW     2026-11-24 → 2027-02-22  (90 days)
ENVELOPE   USD 100/MO · MARGIN ≥ 60% · LANDED ≤ USD 40.00 PER ISSUE
STYLE      LiberationMono-Bold · white ground / black ink · inversion-only
           hierarchy · 2px rules · square corners · fixed character grid
```

---

## 0. ARCHITECTURE (FIXED FOR ALL 3 MONTHS)

| LAYER | FILE | VISIBILITY |
|---|---|---|
| Doctrine, terms, 23-line manifest, cadence, state machine | `src/shared/basics.ts` | PUBLIC (client + server) |
| Unit cost, overhead, envelope report | `src/server/basics/cogs.ts` | SERVER ONLY — never bundled to client |
| Open Tab / in-app tab UI | `src/client/components/Basics.tsx` | PUBLIC |
| Public entry (logged-out visitors) | `src/client/entries/basics.tsx` | PUBLIC |
| Route `/basics` | `src/server/index.ts` | member → app tab · stranger → open tab |
| Ledger JSON | `GET /api/public/basics/manifest` | PUBLIC, cached 300s |
| Envelope gate | `scripts/basics/envelope-check.ts` (`npm run basics:check`) | CI / pre-ship |
| Scoped style | `.lot-basics` block in `src/client/index.css` | immune to member themes |

Rule: cost data and cadence offsets never share a file that ships to the browser
with anything that reveals price per line. The public ledger shows nomenclature,
qty, unit of issue, cadence. Nothing else.

---

## MONTH 1 — LEDGER & DOCTRINE  (2026-11-24 → 2026-12-23)

The System exists, read-only.

| # | TASK | STATE |
|---|---|---|
| 1.1 | `/basics` route; Basics nav button enabled for members | DONE (S-01) |
| 1.2 | Public OPEN TAB entry for strangers — no login wall | DONE (S-01) |
| 1.3 | 23-line manifest as ledger (LN · NOMENCLATURE · QTY · U/I · CADENCE) | DONE (S-01) |
| 1.4 | Doctrine (6 lines) + Terms (4 lines) + price line | DONE (S-01) |
| 1.5 | Status-line component (PLAN · ROLL · LOAD · NEXT ISSUE · UPGRADE) | DONE (S-01) |
| 1.6 | Terminal tokens + grid (`--lb-ground`, `--lb-ink`, `--lb-rule`, 1ch cell) | DONE (S-01) |
| 1.7 | Public JSON ledger `/api/public/basics/manifest` | DONE (S-01) |
| 1.8 | Envelope gate script (23 lines, 12-cycle ceiling, margin, SM table) | DONE (S-01) |
| 1.9 | Self-host Liberation Mono Bold (woff2) — current stack falls back to Cousine/Courier | OPEN |
| 1.10 | OG/meta tags for `/basics` (title, description) so shared links read as a ledger | OPEN |
| 1.11 | Copy review of nomenclature by S-2 — lock line numbers | OPEN |

**EXIT:** a stranger can read what LOT issues and on what terms. Read-only. Live.
Met in code on S-01; live on next deploy of `master`.

---

## MONTH 2 — UPGRADE & ROSTER  (2026-12-24 → 2027-01-22)

Usership (AI) → BASIC. Additive, reversible.

### State machine (already encoded + tested in `src/shared/basics.ts`)

```
USERSHIP/AI ──UPGRADE──▶ PENDING ──ROSTER_COMPLETE──▶ ON STRENGTH ──FIRST_ISSUE_DISPATCHED──▶ STEADY STATE
     ▲                      │                              │                                        │
     └────CANCEL_PENDING────┘                              └──────────STAND_DOWN────────────────────┘
```
Illegal events return `null` and are refused server-side.

| # | TASK |
|---|---|
| 2.1 | Migration: `basics_enrollments` (userId, state, cycleStart, sizeShirt, sizeBrief, shipTo JSON, billingRef, createdAt, updatedAt, standDownAt) |
| 2.2 | Migration: `basics_events` — append-only issue/state log (enrollmentId, event, fromState, toState, at, actor) |
| 2.3 | API `GET /api/basics/me` · `POST /api/basics/upgrade` · `POST /api/basics/roster` · `POST /api/basics/stand-down` · `POST /api/basics/cancel` — every write goes through `basicsTransition()` |
| 2.4 | UPGRADE control in tab: one inverted button, visible only to Usership tag holders |
| 2.5 | Roster intake form: shirt size, brief size, ship-to (US only), cycle start (1st of next month) — fixed-grid inputs, no placeholders beyond field codes |
| 2.6 | Billing: recurring USD 100/mo line added to the member's existing Usership billing (provider TBD by S-2 — Stripe subscription item is the default assumption). ROSTER_COMPLETE fires only on confirmed payment method |
| 2.7 | STAND DOWN: removes ration billing item at cycle close, keeps Usership + AI tag untouched |
| 2.8 | Issue log scaffold in tab (section 4 · ISSUE LOG — empty table until first dispatch) |
| 2.9 | Status line becomes live: ROLL from enrollment state, NEXT ISSUE from cycleStart |
| 2.10 | Admin view under `/us`: roster list (state, size, ship-to region, cycle) |

**EXIT:** a Usership member can go ON STRENGTH and back OFF, end to end.

**BLOCKERS TO CLEAR BEFORE MONTH 2:** billing provider and account (S-2),
legal terms for a physical subscription (returns, damaged goods, US-only).

---

## MONTH 3 — ISSUE & FULFILLMENT  (2027-01-23 → 2027-02-22)

The box ships.

| # | TASK |
|---|---|
| 3.1 | Load engine: `basicsLoadForCycle(cycle)` (already pure + tested) → per-member pick list per month |
| 3.2 | Supplier quotes: replace every `ESTIMATE` in `cogs.ts` with a confirmed quote, `confirmed: true`, source = supplier + quote ref. `basics:check` must stay GREEN |
| 3.3 | Printed manifest card: server-rendered PDF/HTML at 4×6 in the same terminal style (member callsign, cycle, lines issued this cycle) |
| 3.4 | Dispatch job: monthly scheduled job builds pick lists, writes `ISSUE_SCHEDULED` events, exports CSV to fulfillment |
| 3.5 | Dispatch confirm: tracking number in → `FIRST_ISSUE_DISPATCHED` (first time) → STEADY STATE |
| 3.6 | Issue log accrues in tab; NEXT ISSUE advances |
| 3.7 | Margin verification against real invoice for issue #1 |

**EXIT:** first real ration ships to a real subscriber. Margin verified ≥ 60%.

---

## ENVELOPE (S-01 ESTIMATES — 12-CYCLE YEAR)

```
CYC  LINES  LANDED   MARGIN        overhead/issue USD 10.00
001     10   34.00   66%           (box 1.00 · card 0.50 · pack 1.00 · postage 7.50)
002     10   32.80   67%
003     11   33.10   67%
004     10   35.20   65%
005     11   36.30   64%   ← peak
006     11   33.20   67%
007     10   34.00   66%
008     11   35.30   65%
009     11   33.10   67%
010     10   35.20   65%
011     11   36.30   64%
012     11   33.20   67%
PEAK 36.30 · MEAN 34.31 · CEILING 40.00 · HEADROOM 3.70 AT PEAK
```

Cadence offsets stagger quarterly/semiannual/annual lines so no single issue
breaches. Any change to manifest, offsets or cost must re-run `npm run basics:check`.

---

## RISKS

| RISK | MITIGATION |
|---|---|
| Postage above USD 7.50 (zone 8, dimensional weight) | Box spec ≤ 1 lb flat mailer; re-quote in M3; headroom 3.70 at peak |
| Garment sizing returns | Roster locks size; one free size swap per member |
| Billing provider not decided | Month 2 blocker — flagged to S-2 now |
| Font licence / availability | Liberation Mono is SIL OFL — self-host in M1 (task 1.9) |
