# LOT-FM-001 — BASIC (RATION) MODULE — 90-DAY BUILD PLAN

```
DOCUMENT:  LOT-BASICS-PLAN-90D
MODULE:    BASIC (RATION) — Basics tab
START:     2026-11-15  (M1 D1)
END:       2027-02-13  (M3 D90)
ENVELOPE:  USD 100/MO · MARGIN ≥ 60% · LANDED ≤ USD 40 PER BOX
BRANCH:    claude/beautiful-johnson-vpc5dm
```

This is the running plan. Each session updates the STATUS column and writes a
session report next to this file (`LOT-BASICS-SR-YYYYMMDD-*.md`).

---

## Architecture (fixed)

| Layer | File | Role |
|---|---|---|
| Manifest (public) | `src/shared/constants/ration.ts` | 23 lines, cadence, offsets, doctrine, terms, state machine. No COGS. |
| Cost sheet (internal) | `src/server/ration/cogs.ts` | Per-line COGS, pack, postage, processing. Envelope checks. Server-only. |
| Public API | `src/server/routes/ration-public.ts` | `GET /api/public/ration`. Manifest + envelope verdict (HOLDING/BREACH). No figures. |
| Sheet UI | `src/client/components/Basics.tsx` | `RationSheet` (shared), `Basics` (in-app tab), `RationStatusLine`. |
| Public surface | `src/client/entries/open-tab.tsx` → `/open` | OPEN TAB. No auth. |
| In-app tab | route `basics` → `/basics` | Nav "Basics" (logged in). Logged-out nav "Basics" links to `/open`. |
| M2 (planned) | `migrations/` + `src/server/models/ration-*.ts` + `src/server/routes/ration.ts` | Ration enrolment, roster, state transitions, issue log. |
| M3 (planned) | `src/server/ration/issue-engine.ts`, `scripts/ration/` | Monthly load engine, manifest card, dispatch. |

House style: mono bold, white ground / black ink, inversion-only hierarchy, 2px
rules, square corners, fixed character grid. The ration sheet does not follow
the app theme.

---

## MONTH 1 — LEDGER & DOCTRINE (2026-11-15 → 2026-12-14)

| # | Task | Status |
|---|---|---|
| 1.1 | Manifest constants: 23 lines, 4 classes, cadence M1/M2/M3/M6, stagger offsets | DONE S1 |
| 1.2 | Internal COGS sheet + envelope check (per-issue peak and margin) | DONE S1 (ESTIMATES) |
| 1.3 | Public API `/api/public/ration` (verdict only, COGS withheld) | DONE S1 |
| 1.4 | `RationSheet` UI: status line, doctrine, ledger, cadence grid, terms, upgrade strip | DONE S1 |
| 1.5 | Basics tab route + nav wiring; OPEN TAB at `/open` | DONE S1 |
| 1.6 | Bundle LiberationMono-Bold webfont (self-hosted, `font-src 'self'`) | OPEN |
| 1.7 | `/open` server-side meta (title, description, og image) for link previews | OPEN |
| 1.8 | Doctrine + nomenclature review by S-2 (lines, sizes, sustenance class) | OPEN — S-2 DECISION |
| 1.9 | Deploy; confirm `/open` live to a logged-out stranger | OPEN |

EXIT: A stranger can read what LOT issues and on what terms. Read-only. Live.

## MONTH 2 — UPGRADE & ROSTER (2026-12-15 → 2027-01-13)

| # | Task | Status |
|---|---|---|
| 2.1 | Migration: `ration_enrolments` (userId, state, startedAt, cadenceStart, issueNo) | OPEN |
| 2.2 | Migration: `ration_roster` (sizes: underwear/socks/tee; ship-to; validated US address) | OPEN |
| 2.3 | `POST /api/ration/upgrade` → PENDING; server-side `canTransitionRation` guard | OPEN |
| 2.4 | Roster intake form in Basics tab (sizing, shipping, cadence start date) | OPEN |
| 2.5 | Billing: additive USD 100/mo recurring line on existing Usership billing; webhook → ON STRENGTH | OPEN — needs billing provider decision |
| 2.6 | STAND DOWN: cancel ration line at period end; AI retained; state → STOOD_DOWN → USERSHIP_AI | OPEN |
| 2.7 | Issue log scaffold (`ration_issues` table, empty ledger renders in tab) | OPEN |
| 2.8 | Log events: `RATION:` handler codes (UPGRADE, ON STRENGTH, STAND DOWN) | OPEN |

EXIT: A Usership member can go ON STRENGTH and back OFF, end to end.

## MONTH 3 — ISSUE & FULFILLMENT (2027-01-14 → 2027-02-13)

| # | Task | Status |
|---|---|---|
| 3.1 | Load engine: `rationLoadForIssue(n)` per enrolment; NEXT ISSUE date advances | ENGINE DONE S1; scheduler OPEN |
| 3.2 | Supplier quotes for all 23 lines; flip `ESTIMATE → QUOTED → CONFIRMED` in cost sheet | OPEN |
| 3.3 | Envelope gate: dispatch blocked if any issue breaches ceiling or margin | OPEN (check exists) |
| 3.4 | Printed manifest card (line 23): PDF, mono, per-subscriber issue number + load | OPEN |
| 3.5 | Pick list / packing slip export for fulfilment | OPEN |
| 3.6 | First issue scheduled and dispatched to a real subscriber; tracking in issue log | OPEN |
| 3.7 | Margin verified ≥ 60% against confirmed invoices | OPEN |

EXIT: First real ration ships to a real subscriber. Margin verified ≥ 60%.

---

## Envelope (current, ESTIMATES)

| Issue | Lines | Landed USD | Margin |
|---|---|---|---|
| 01 | 15 | 30.35 | 66.45% |
| 02 | 16 | 34.35 | 62.45% |
| 03 | 16 | 31.15 | 65.65% |
| 04 | 17 | 34.35 | 62.45% |
| 05 | 15 | 32.15 | 64.65% |
| 06 | 17 | 33.35 | 63.45% |
| **PEAK / AVG / MIN** | | **34.35 / 32.62** | **62.45%** |

Margin = (100 − landed − card processing 3.20) / 100. Pack 1.20 + postage 6.50 per box.
Without stagger offsets every line ships on issue 01: landed 42.95 → **ceiling breach**.
Offsets are load-bearing. Do not remove them.
