# BASICS (LOT-FM-001) — 90-DAY BUILD PLAN
S-2: VADIK MARMELADOV · Canonical branch: `claude/beautiful-johnson-p2vj1x` · Updated 2026-10-28

Envelope: USD 100/mo · margin ≥60% · landed COGS ≤USD 40 · 23-item load · issued, not sold.

## MONTH 1 — LEDGER & DOCTRINE — DONE
- Public OPEN TAB at `/basics` (served to logged-out visitors via login entry; no auth).
- 23-item ledger (nomenclature · spec · cadence; COGS withheld), doctrine, price line, status line.
- Terminal tokens: bold mono, ink/ground, inversion bands, 2px rules, square corners, fixed grid.
- Known gap: LiberationMono-Bold file is not in the repo; UI uses Tailwind `font-mono` (Liberation Mono on most Linux, Courier/Menlo elsewhere). Ship the font file + `@font-face` to lock the register.

## MONTH 2 — UPGRADE & ROSTER — CODE COMPLETE, BILLING NOT WIRED
- State machine (`src/shared/basics/roster.ts`): USERSHIP → PENDING → ON STRENGTH → STEADY STATE; STAND DOWN from any state returns to USERSHIP (ration dropped, AI retained, roster kept).
- Roster intake: shipping, sizing (S–XL), issue day 1–28. Validated on client and server (same function).
- Persistence: `users.metadata.basic`, row-locked transaction, append-only issue log (`seq`, UTC date, kind, text). No migration. Every transition also written to `agent_ledger`.
- Routes: `GET /api/basics`, `POST /api/basics/enlist` (requires Usership), `POST /api/basics/stand-down`; admin: `POST /admin-api/basics/:userId/confirm`, `.../first-issue`.
- `Basic` tag set on CONFIRM, removed on STAND DOWN.
- **OPEN (S-2 decision): no payment processor exists in the repo** (no Stripe SDK; only a `stripeCustomerId` column). CONFIRM is the hand-off point and today is an admin action after payment is verified out-of-band. Recurring USD 100/mo additive billing is recorded in the log, not charged. Needs: processor choice, webhook → `confirm()`, failed-payment → `standDown()`.
- Verified: `scripts/tests/test-basics.ts` 8/8 (transitions, validation, cadence math, envelope). Not verified: live DB round-trip (no database in this environment).

## MONTH 3 — ISSUE & FULFILLMENT — NOT STARTED
1. Load engine: per-month issue = 20 monthly lines + quarterly lines (21–23) on months 1,4,7,10 from cadence start. Pure function, unit-tested, feeds the manifest card.
2. Supplier quotes → COGS table (admin only, never public). Gate: landed ≤ USD 40.00 or issue refuses to cut. **No quotes exist yet; no COGS figure is asserted anywhere in code.**
3. Printed manifest card (PDF, terminal grid) per issue.
4. Dispatch: admin "cut issue" → log ISSUE entry → NEXT ISSUE advances → first delivery triggers STEADY STATE.
5. Exit: first real ration shipped; margin ≥60% verified from actual invoices.

## BLOCKERS FOR S-2
1. Payment processor decision.
2. Supplier quotes for the 23 lines (needed to prove ≤USD 40 landed).
3. LiberationMono-Bold font file.
4. Ship path: this branch → master via Ship Mode when approved.
