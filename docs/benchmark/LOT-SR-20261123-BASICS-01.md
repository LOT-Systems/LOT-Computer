================================================================================
LOT SYSTEMS / SESSION REPORT
DOCUMENT: LOT-SR-20261123-BASICS-01
TITLE:    LOT-FM-001 BASICS (RATION) — SESSION 01 / DAY 0 OF 90
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
BRANCH:   claude/beautiful-johnson-ob3h5a
DATE:     2026-11-23
RESULT:   GREEN (BUILD) · AMBER (ENVELOPE HEADROOM) · BLOCKED (BILLING)
================================================================================

STATUS LINE: M1 CODE COMPLETE · M2 CODE COMPLETE EXCEPT BILLING · M3 ENGINE
READY, NOTHING SHIPPED · ENVELOPE HOLDS AT $39.50 WORST CASE (60.5%).

--------------------------------------------------------------------------------
00 // RECON
--------------------------------------------------------------------------------
Master had a greyed-out "Basics" nav button and no implementation.
Six prior Basics attempts found on stale branches (claude/nifty-allen-*),
none merged. Most complete: nifty-allen-2UqYA (3 commits, one per month).
Decision: port 2UqYA onto current master, then fix what was broken.

DEFECTS FOUND IN THE PRIOR ATTEMPT
  D1  API never mounted. Routes were added to src/server/routes/index.ts,
      which nothing imports. Real server is src/server/index.ts.
  D2  Server imported from #client/… — not in tsconfig.server paths.
      Server build produced 11 type errors.
  D3  COGS shipped in the client bundle (rationManifest.ts), and margin %
      was returned to members. Doctrine says COGS WITHHELD.
  D4  Stripe: `import('stripe')` with no dependency installed, and it
      passed a customer ID as a subscription ID. Never worked.
  D5  No Usership gate — any logged-in user could "upgrade from Usership".
  D6  No public surface — logged-out /basics rendered the login page.
  D7  House-style breaches: gray fills (#f0f0f0, #f9f9f9), red error text
      (#c00), regular-weight text, alternating row tints.
  D8  Manifest card interpolated user-entered address into HTML unescaped
      (stored XSS on a page served from the app origin).
  D9  Migrations dated 2026-06-02, earlier than migrations already on
      master. Renamed to 2026-11-23 so they order correctly.

--------------------------------------------------------------------------------
01 // WHAT SHIPPED THIS SESSION (ON BRANCH)
--------------------------------------------------------------------------------
LEDGER (M1)
  · Basics tab live in nav → /basics. Persistent TabPanel like Sync/Log.
  · 23-item ledger: nomenclature + cadence (12 monthly / 9 quarterly /
    2 semi-annual). Source: src/shared/basics.ts. COGS absent from the
    client bundle (grep of dist/client/js returns nothing).
  · Doctrine, price line, terms, status line.
  · Single token file (tokens.ts): bold mono, white/black, 2px rules,
    square corners, ch-based grid, inversion as the only emphasis.
  · Public OPEN TAB: logged-out /basics serves a read-only entry
    (entries/basics.tsx). No fetch, no controls.

UPGRADE (M2)
  · State machine enforced server-side:
      USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE
                       └──── STAND DOWN ────┘
  · Upgrade gated on the `Usership` tag (or admin).
  · Roster intake: address, size chart XS–3XL, cadence start shown.
    Server trims, uppercases, length-limits, validates size.
  · STAND DOWN: two-step in-UI confirm. Drops ration. Usership untouched.
  · Billing shows "AWAITING BILLING PROVIDER — NOT CHARGED". Honest.

ISSUE (M3 ENGINE)
  · Load engine: issue N carries monthly items always, quarterly when
    N%3==1, semi-annual when N%6==1. Issue #1 = full 23.
  · Three dispatch gates, in order: CEILING (≤$40, ≥60%) → QUOTES (all
    23 COGS lines must have quoteRef) → BILLING (member billed).
    `drill: true` runs the math without writing.
  · Quartermaster API: GET /envelope, GET /roster, POST /dispatch,
    POST /issues/:id/advance (DISPATCHED → IN_TRANSIT → DELIVERED).
  · Printable manifest card with CHK column, all fields escaped.
  · NEXT ISSUE advances from the scheduled date, not from "now".

--------------------------------------------------------------------------------
02 // CHECKS
--------------------------------------------------------------------------------
CHECK                                   RESULT
yarn build (client + server)            PASS
tsc server (tsconfig.server.json)       PASS — 0 errors (prior attempt: 11)
tsc client                              104 PRE-EXISTING, 0 IN BASICS FILES
COGS in client bundle                   ABSENT
Envelope (12 issues)                    ALL PASS — worst $39.50 / 60.5%
Visual: public @390px                   PASS — no horizontal scroll
Visual: OPEN TAB / STEADY / ROSTER      PASS — rendered with mocked API
Live DB / E2E                           NOT RUN — no database in session

--------------------------------------------------------------------------------
03 // ENVELOPE
--------------------------------------------------------------------------------
ISSUE   1     2     3     4     5     6     7     8     9     10    11    12
ITEMS   23    12    12    21    12    12    23    12    12    21    12    12
COGS    39.50 22.00 22.00 36.00 22.00 22.00 39.50 22.00 22.00 36.00 22.00 22.00
MARGIN  60.5  78.0  78.0  64.0  78.0  78.0  60.5  78.0  78.0  64.0  78.0  78.0
AVG COGS $27.25 · AVG MARGIN 72.8% · ALL ≤ CEILING

AMBER: full-load issues (#1, #7) sit $0.50 under the ceiling, and every
COGS figure is still an estimate. One quote $0.51 over plan breaches.
OPTIONS FOR S-2 (pick one before quotes come back):
  A  Stagger semi-annual items to issues 4/10 (full-load drops to $36.00).
  B  Stagger quarterly items across months 1/2/3 (peak ≈ $27).
  C  Hold as is, accept that a high quote blocks dispatch.
Recommendation: B. It flattens the curve and costs no code beyond the load rule.

--------------------------------------------------------------------------------
04 // BLOCKERS — NEED S-2
--------------------------------------------------------------------------------
B1  BILLING PROVIDER. Repo has no payment integration. Month 2 exit
    ("goes ON STRENGTH end to end") cannot be met without one.
    Decide: provider + account. Agent wires it on the next session.
B2  MERGE TO MASTER. Branch is not deployed. Month 1 exit ("live") needs
    review + merge + migration run (2 new tables).
B3  SUPPLIER QUOTES. 23 lines, all estimates. Live dispatch is hard-
    blocked until every line has a quoteRef.
B4  FONT. LiberationMono-Bold is not bundled. Stack falls back to
    Courier New. Needs a self-hosted WOFF2 in public/fonts.

--------------------------------------------------------------------------------
05 // NEXT SESSION (ORDERED)
--------------------------------------------------------------------------------
1  If B1 decided: wire billing (subscribe → billingRef; stand-down → cancel).
2  Quartermaster UI in /us: roster table, DRILL, DISPATCH, ADVANCE.
3  Load rule per S-2 envelope decision (A/B/C).
4  Roster edit without stand-down.
5  1st-of-month dispatch queue job (scheduled-jobs.ts).
6  OG/meta for public /basics.

--------------------------------------------------------------------------------
06 // FILES
--------------------------------------------------------------------------------
ADDED     src/shared/basics.ts
ADDED     src/server/utils/ration-cogs.ts
ADDED     src/server/utils/issue-engine.ts
ADDED     src/server/routes/basics-api.ts
ADDED     src/server/models/ration-subscription.ts, ration-issue.ts
ADDED     migrations/20261123120000_add-ration-subscriptions.cjs
ADDED     migrations/20261123130000_add-ration-issues.cjs
ADDED     src/client/components/Basics/{index,tokens,types,UpgradeControl,
          RosterForm,IssueLog}.tsx|ts
ADDED     src/client/entries/basics.tsx
ADDED     docs/basics/LOT-FM-001-BUILD-PLAN.md (state tracker)
MODIFIED  src/server/index.ts (mount /api/basics, public /basics)
MODIFIED  src/server/models/index.ts
MODIFIED  src/client/components/ui/Layout.tsx (Basics tab enabled)
MODIFIED  src/client/stores/router.ts (/basics)
MODIFIED  src/client/entries/app.tsx (Basics TabPanel)
MODIFIED  scripts/build/client.build.ts (basics entry)

ELIMINATE ONE DISTRACTION: removed the dead Stripe stub. Billing reads
"AWAITING PROVIDER" until a real one is wired.
================================================================================
