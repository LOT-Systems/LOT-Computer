# LOT-FM-001 / BASIC (RATION) — 90-DAY BUILD PLAN

```
MODULE   BASIC · CIVILIAN RATION · 23 LINES
PRICE    USD 100 / MO · ADDITIVE TO USERSHIP
CEILING  USD 40 LANDED PER BOX (PEAK, NOT AVERAGE)
MARGIN   >= 60% ON THE HEAVIEST BOX
WINDOW   2026-11-11 → 2027-02-09
```

This file is the running plan. Every routine session reads it, executes the
next open task, ticks it, and files a session report in `docs/basics/`.

## SOURCE OF TRUTH

| Concern | File |
|---|---|
| Doctrine, terms, 23-line manifest, cadence engine (public) | `src/shared/constants/basics.ts` |
| Landed cost per line, envelope math (server only) | `src/server/utils/basics-cogs.ts` |
| Envelope gate (CI-able, exit 1 on breach) | `scripts/basics-envelope-check.ts` → `yarn basics:check` |
| Public API | `GET /api/public/basics` (`src/server/routes/public-api.ts`) |
| UI | `src/client/components/Basics.tsx`, styles `.lot-term*` in `src/client/index.css` |
| Routes | `/basics` → `app` (member) or `basics` (stranger) entry |

## MONTH 1 — LEDGER & DOCTRINE (2026-11-11 → 12-10)

EXIT: a stranger can read what LOT issues and on what terms. Read-only. Live.

- [x] Basics tab routed (`/basics`), nav button live (was a dead placeholder)
- [x] OPEN TAB public entry for logged-out visitors (no login wall)
- [x] 23-line manifest: nomenclature, qty, cadence, phase stagger
- [x] Doctrine statement, terms/price line
- [x] Status-line component (top + bottom), terminal tokens + grid (`.lot-term`)
- [x] COGS withheld server-side; public gets envelope verdict only
- [x] Envelope gate: 12-issue cycle, peak ≤ 40, margin ≥ 60% — GREEN (39.85 peak)
- [x] Per-issue load preview (ISSUE 001–006)
- [ ] S-2 review of the 23 lines and nomenclature (DRAFT until approved)
- [ ] Self-host LiberationMono-Bold woff2 (currently a font stack fallback)
- [ ] OG image + meta description for `/basics` share links
- [ ] Wire `yarn basics:check` into CI / pre-deploy
- [ ] Production deploy + verify `/basics` live for logged-out user

## MONTH 2 — UPGRADE & ROSTER (2026-12-11 → 2027-01-09)

EXIT: a Usership member can go ON STRENGTH and back OFF, end to end.

- [ ] Model `BasicsEnrollment` (userId, state, sizes, shipping, cadenceStart, timestamps) + migration
- [ ] State machine USERSHIP → PENDING → ON_STRENGTH → STEADY_STATE; STAND DOWN → STOOD_DOWN (AI retained)
- [ ] Guard: only Usership members may UPGRADE (reuse existing Usership tag check)
- [ ] Roster intake form: sizes for `sized` lines, shipping address (CONUS validation), cadence start
- [ ] Billing: USD 100/mo additive recurring line (provider TBD — confirm with S-2 before any live charge)
- [ ] STAND DOWN control; confirm screen; drops ration only
- [ ] Issue log scaffold (table + UI section, empty state)
- [ ] Admin roster view in `/us`

## MONTH 3 — ISSUE & FULFILLMENT (2027-01-10 → 02-09)

EXIT: first real ration ships to a real subscriber. Margin verified ≥ 60%.

- [ ] Load engine per subscriber (issue number from cadenceStart; `getIssueLoad` already in place)
- [ ] Replace each ESTIMATE with QUOTED supplier figure; gate stays green
- [ ] Printed manifest card generator (PDF, 3270 register) — line D-04
- [ ] Monthly issue job: build loads, export pick list, mark DISPATCHED
- [ ] Issue log accrues; NEXT ISSUE advances on status line
- [ ] First issue dispatched to a real subscriber; margin verified on actuals

## RISKS / OPEN QUESTIONS

- Peak box sits at USD 39.85 against a USD 40 ceiling: 0.15 headroom. Any quote
  over estimate breaches. Month 3 must either confirm quotes at/below estimate,
  cut postage (regional carrier / zone skipping), or re-phase lines.
- Class C (subsistence) adds food-handling/labeling obligations. Candidate
  distraction to eliminate if supplier compliance costs time.
- LOT-FM-001 source manual was not in the repo; manifest is a first-draft
  issue authored to the envelope. Needs S-2 sign-off.
