================================================================================
LOT SYSTEMS / SESSION REPORT
DOCUMENT: LOT-SR-20261018-BASICS-01
TITLE:    BASICS TAB — SESSION 01 (M1 PORT + M2 CORE)
CLASS:    RESTRICTED // S-2 EYES
BRANCH:   claude/beautiful-johnson-59jtgz
DATE:     2026-10-18
RESULT:   GREEN (selftest, client build) / AMBER (no payment processor)
================================================================================

00 // FINDINGS
M1 existed only on stale branch beautiful-johnson-56p7ov (6815f550), never on
this tree. It also broke house style (opacity tints, accent classes, 11px
type). Ported and rebuilt: black ink, white ground, inversion headers, 2px
rules, square corners, uppercase mono. No icons, no color, no radius.
Nav item "Basics" was a dead label; now routed at /basics (logged-in).

01 // BUILT
M1 — LEDGER & DOCTRINE
  src/shared/basics/manifest.ts   23-line manifest, doctrine, price, envelope
  src/client/components/Basics.tsx  OPEN TAB: doctrine, price line, ledger by
                                    category, status block (COGS withheld)
  GET /api/public/basics          public ledger JSON, no auth, no COGS
M2 — UPGRADE & ROSTER
  src/shared/basics/state.ts      pure state machine, roster validation
    NONE|USERSHIP -> PENDING -> ON_STRENGTH -> STEADY_STATE (after 3 issues)
    STAND_DOWN from any ration state -> USERSHIP (roster+billing dropped,
    issue log kept, AI untouched)
  src/server/routes/basics-api.ts
    GET  /api/basics/status
    POST /api/basics/upgrade        roster intake -> PENDING
    POST /api/basics/stand-down
    POST /api/basics/confirm/:id    admin only -> ON STRENGTH
    POST /api/basics/dispatch/:id   admin only -> issue log + NEXT ISSUE
  Storage: user.metadata.basic (JSON). No migration.
  UI: UPGRADE control, roster intake, STAND DOWN, issue log, NEXT ISSUE.
M3 groundwork (pure, tested): loadForIssue(n) cadence engine (quarterly lines
  on issues 1,4,7...), marginAt(), withinEnvelope() quote gate.

02 // CHECKS
node scripts/basics-selftest.ts   GREEN (manifest=23, cadence, envelope
                                  gate, full lifecycle, stand-down)
tsc client                        no errors in new/changed Basics files
                                  (111 pre-existing repo errors, unchanged
                                  class; baseline not touched)
client build                      completed

03 // OPEN ITEMS / HONEST GAPS
- BILLING NOT WIRED. No processor in this repo. UPGRADE records intent and
  holds at PENDING until an admin CONFIRMs. Recurring USD 100/mo needs a
  Stripe subscription product + webhook calling CONFIRM. NEEDS S-2: keys.
- OPEN TAB is in-app only (auth-gated app). A logged-out page needs a new
  entry bundle; the public JSON endpoint is ready for it.
- Not exercised against a live DB or browser this session (no DB in env).
- No supplier quotes exist. COGS ceiling USD 40 / margin 60% are enforced in
  code as a gate but NOT verified against reality. Do not claim margin.
- 3-issue STEADY STATE threshold is my choice; spec names the state only.

04 // 90-DAY ENVELOPE (today = day 0)
M1 (to ~11-17): public logged-out ledger page; visual QA in browser.
M2 (to ~12-17): Stripe subscription + webhook; admin roster view; email on
  state change; end-to-end run with a test member.
M3 (to ~01-17): supplier quotes into gate; printed manifest card (PDF per
  roster/issue); first real dispatch; margin check on actuals.

05 // DISTRACTION ELIMINATED
Cosmetic variants of the tab (alt designs on eager-clarke / nifty-allen
branches). One design. Ledger only.
================================================================================
