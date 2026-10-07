================================================================================
LOT SYSTEMS / SESSION REPORT
DOCUMENT: LOT-SR-20261007-BASICS-M1
TITLE:    BASICS (BASIC RATION) — MONTH 1 / LEDGER & DOCTRINE
BRANCH:   claude/beautiful-johnson-r51r2g
DATE:     2026-10-07
RESULT:   M1 BUILD GREEN (client build PASS; 0 new tsc errors)
================================================================================

00 // STATUS AGAINST ENVELOPE
M1 OPEN TAB: BUILT. Not yet deployed. Price USD 100/MO. COGS ceiling USD 40
landed. Margin floor 60%. Envelope INTACT (no COGS data shipped; see 04).

01 // FINDING
Master carried only dead "Basics" nav label. Prior M1 work (branches
nifty-allen / beautiful-johnson-56p7ov per MANIFEST) is NOT on master or
remote. Rebuilt from zero.

02 // SHIPPED THIS SESSION
FILE                                   CHANGE
src/shared/basics/ration.ts            NEW  23-item load, cadence, doctrine, price, issue calc
src/client/components/Basics.tsx       NEW  status line, doctrine, ledger, price line
src/client/stores/router.ts            +route basics -> /basics
src/client/components/ui/Layout.tsx    Basics nav live (logged-in: route; logged-out: hard link)
src/client/entries/app.tsx             Basics TabPanel
src/client/entries/login.tsx           PUBLIC surface: /basics renders ledger w/o login
src/server/index.ts, server.ts         /basics added to KNOWN_CLIENT_ROUTES

OPEN TAB: ledger renders nomenclature, qty, cadence. Rows issued in the
current calendar month are inverted (inversion-only hierarchy). COGS withheld.

03 // FLAGS FOR S-2 (ACTION REQUIRED)
1. LOT-FM-001 text was not in the repo or the prompt. The 23 items in
   ration.ts are a PLACEHOLDER LOAD. Supply Section 2 and replace RATION_LOAD.
2. Font: LiberationMono-Bold requested by family name; font file not bundled.
   Falls back to system mono until the TTF is added to /public.
3. Visual spec is partial: ledger uses existing theme tokens (bg-acc/text-bac),
   2px rules, no radius/icons/color. Nav buttons remain the global rounded style
   (Layout is shared; changing them is out of scope for BASICS).
4. About.tsx prices Basics at $399/mo; brief says USD 100/mo. Conflict, not
   edited. Decide which is canon.
5. Install needed --legacy-peer-deps (npm ci fails ERESOLVE). Pre-existing.

04 // MARGIN MODEL (ESTIMATE, UNVERIFIED — INTERNAL ONLY)
Revenue USD 100. 60% floor => COGS+fulfillment <= USD 40 landed. Month 3
supplier quotes must confirm per-item COGS; quarterly/annual items amortize
per month. Any item breaching ceiling is cut or substituted, never the price.

05 // 90-DAY PLAN
M1 (now)  LEDGER: OPEN TAB live, read-only. REMAINING: deploy, load fix,
          font file. EXIT: stranger reads what LOT issues and terms.
M2        UPGRADE + ROSTER: state machine USERSHIP -> PENDING -> ON_STRENGTH ->
          STEADY_STATE (type RationState already defined). Prisma model
          RationSubscription {userId,state,sizing,address,startMonth}; routes
          POST /api/ration/upgrade, /stand-down; Stripe additive $100 price
          item on the existing subscription; STAND DOWN drops ration, keeps AI;
          issue log table. EXIT: member ON STRENGTH and back OFF end to end.
M3        ISSUE ENGINE: itemsIssuedIn(month) drives box; supplier quotes vs
          ceiling; printed manifest card (PDF); first dispatch; NEXT ISSUE
          advances on dispatch. EXIT: first real ration ships; margin >= 60%.

06 // DISTRACTION ELIMINATED
The $399 "Basic Essentials / Kids / Home" tier modularity. BASIC is one box,
one price, one load. Other tabs stay dark until BASIC ships.

07 // NEXT SESSION
Receive FM-001 Section 2 from S-2; swap load; wire sizing fields; start M2
schema + state machine with tests.
================================================================================
