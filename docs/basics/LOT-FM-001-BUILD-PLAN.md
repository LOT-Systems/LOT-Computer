================================================================================
LOT-FM-001 / BASICS (RATION) — 90-DAY BUILD PLAN + STATE TRACKER
================================================================================
OWNER:     S-2 (VADIK MARMELADOV)
AGENT:     LOT BUILD AGENT (SCHEDULED ROUTINE)
BRANCH:    claude/beautiful-johnson-ob3h5a
DAY 0:     2026-11-23
DAY 90:    2027-02-21
ENVELOPE:  USD 100/MO · ≥60% MARGIN · ≤USD 40 LANDED · NEVER BREACH

Every scheduled session reads this file first, advances the next open line,
and updates the STATE column. Session reports go to docs/benchmark/.

--------------------------------------------------------------------------------
00 // WHERE THE CODE LIVES
--------------------------------------------------------------------------------
src/shared/basics.ts                   23-ITEM LEDGER (NOMENCLATURE+CADENCE), LOAD RULE
src/server/utils/ration-cogs.ts        COGS LEDGER — SERVER ONLY, QUOTE REFS
src/server/utils/issue-engine.ts       LOAD ENGINE, CEILING GATE, 12-ISSUE ENVELOPE
src/server/routes/basics-api.ts        /api/basics/* (MEMBER + QUARTERMASTER)
src/server/models/ration-*.ts          RationSubscription, RationIssue
migrations/20261123120000_*.cjs        ration_subscriptions
migrations/20261123130000_*.cjs        ration_issues
src/client/components/Basics/          TAB UI (tokens, upgrade, roster, issue log)
src/client/entries/basics.tsx          PUBLIC OPEN TAB (logged-out /basics)

--------------------------------------------------------------------------------
01 // MONTH 1 — LEDGER & DOCTRINE           DAYS 1–30   (11-23 → 12-22)
--------------------------------------------------------------------------------
ID     TASK                                                    STATE
M1.1   Basics nav tab enabled, /basics route in app            DONE  S01
M1.2   23-item manifest ledger, COGS withheld from bundle      DONE  S01
M1.3   Doctrine block, price line, terms                        DONE  S01
M1.4   Status-line component                                    DONE  S01
M1.5   Terminal tokens + fixed character grid (tokens.ts)      DONE  S01
M1.6   Public OPEN TAB for strangers (logged-out /basics)      DONE  S01
M1.7   Bundle LiberationMono-Bold font file (self-hosted)      OPEN  — needs licence-clean TTF/WOFF2 in public/fonts
M1.8   OG/meta for /basics (shareable ledger)                  OPEN
M1.9   Deploy to production + smoke test as stranger           OPEN  — needs merge to master (S-2)
EXIT:  STRANGER CAN READ WHAT LOT ISSUES AND ON WHAT TERMS.    CODE READY, NOT DEPLOYED

--------------------------------------------------------------------------------
02 // MONTH 2 — UPGRADE & ROSTER            DAYS 31–60  (12-23 → 01-21)
--------------------------------------------------------------------------------
M2.1   State machine USERSHIP/AI→PENDING→ON STRENGTH→STEADY    DONE  S01 (server-enforced)
M2.2   Usership gate on UPGRADE (tag `Usership` or admin)      DONE  S01
M2.3   Roster intake: sizing, shipping, cadence start           DONE  S01
M2.4   STAND DOWN (drops ration, AI plan untouched)            DONE  S01 (two-step confirm)
M2.5   Issue log scaffold                                       DONE  S01
M2.6   Recurring USD 100/mo additive billing                    BLOCKED — no payment provider in repo.
                                                                S-2 DECISION: provider + account.
M2.7   Run migrations on staging DB, E2E ON/OFF strength       OPEN
M2.8   Roster edit (address change without stand-down)         OPEN
EXIT:  USERSHIP MEMBER GOES ON STRENGTH AND BACK OFF.          CODE PATH DONE; BILLING BLOCKED

--------------------------------------------------------------------------------
03 // MONTH 3 — ISSUE & FULFILLMENT         DAYS 61–90  (01-22 → 02-21)
--------------------------------------------------------------------------------
M3.1   Month-by-month load engine (cadence)                     DONE  S01
M3.2   Ceiling gate: refuse dispatch on breach                  DONE  S01
M3.3   Quote gate: refuse live dispatch if any COGS unquoted   DONE  S01
M3.4   Billing gate: refuse dispatch if member not billed       DONE  S01
M3.5   Printed manifest card (HTML, print CSS, escaped)         DONE  S01
M3.6   Quartermaster endpoints: envelope/roster/dispatch/adv   DONE  S01
M3.7   Quartermaster UI in /us (dispatch + advance buttons)    OPEN
M3.8   Supplier quotes for all 23 lines → quoteRef filled      OPEN  — S-2 / procurement
M3.9   Scheduled job: 1st-of-month dispatch queue report        OPEN
M3.10  First real issue dispatched to a real member             OPEN
EXIT:  FIRST REAL RATION SHIPS. MARGIN VERIFIED ≥60%.          ENGINE READY; NOTHING SHIPPED

--------------------------------------------------------------------------------
04 // ENVELOPE (PLANNING ESTIMATES — NOT YET QUOTED)
--------------------------------------------------------------------------------
ISSUE PATTERN           ITEMS   COGS     MARGIN   GATE
#1, #7 (FULL LOAD)      23      $39.50   60.5%    PASS — $0.50 HEADROOM
#4, #10 (QUARTERLY)     21      $36.00   64.0%    PASS
ALL OTHERS (MONTHLY)    12      $22.00   78.0%    PASS
12-ISSUE AVERAGE        —       $27.25   72.8%    PASS
RISK: full-load months sit $0.50 under the ceiling. Any quote above estimate
on lines 001–023 can breach. Mitigation options in session report.
================================================================================
