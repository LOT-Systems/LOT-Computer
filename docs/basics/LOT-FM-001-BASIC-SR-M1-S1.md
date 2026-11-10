================================================================================
LOT SYSTEMS / SESSION REPORT
DOCUMENT: LOT-FM-001-BASIC / SR M1-S1
MODULE:   BASIC (RATION) — 90-DAY BUILD — MONTH 1 (LEDGER & DOCTRINE)
BRANCH:   claude/beautiful-johnson-yyzv82
DATE:     2026-11-10
RESULT:   GREEN (client build, server typecheck, SSR render of ledger)
================================================================================

STATUS vs ENVELOPE: M1 OPEN TAB built, not yet deployed. USD 100/mo · landed
est. below ceiling (UNVERIFIED until M3 quotes). No marketing layer.

01 // INTAKE NOTE
The LOT-FM-001 manual itself was NOT in the repo or the task text. The 23-item
load, cadences and doctrine lines are AUTHORED DRAFT from the FMCG plan
(docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md: toothbrushes, underwear,
packaged goods, hygiene paper). S-2 must reconcile against the manual.
Also: that plan prices Basic Essentials at USD 399/mo; this directive says
USD 100/mo. Directive followed. Conflict logged for S-2.

02 // SHIPPED
- src/shared/basics/manifest.ts   23-item manifest, cadence codes M/B/Q/S,
                                  itemsForIssue(n), price + margin constants.
                                  COGS deliberately absent.
- src/client/components/Basics.tsx OPEN TAB: status line, doctrine, price line,
                                  fixed-grid ledger, inverse headers, 2px
                                  rules, square, no colour/icons. UPGRADE
                                  button present, disabled (M2).
- Route basics -> /basics (in-app tab, was dead nav stub); TabPanel wired.
- Public route GET /open (no auth) + client entry open.tsx; added to both
  server.ts and index.ts and client build entry list.
- Font: 'Liberation Mono' bold via font stack; font file not yet bundled
  (see OPEN).

03 // CHECKS
client:build PASS · server tsc --noEmit PASS (needs --ignoreDeprecations 5.0
on installed TS; pre-existing) · full client tsc: no Basics errors · SSR
render prints 23 lines; issue 1 = 23 lines, issue 2 = 4, issue 3 = 13.

04 // MARGIN MODEL (INTERNAL, DRAFT — UNIT COSTS ARE ESTIMATES, NOT QUOTES)
Contents averaged over 6-month cycle ≈ USD 30.5/mo (23 lines, cadence-adjusted)
+ packaging/printed card ≈ 1.5 + outbound ≈ 7 => ≈ USD 39 landed. Margin
≈ 61%. HEADROOM ≈ 1 USD: RISK. Ceiling USD 40 breaks on any quote +3%.
Levers: drop protein bar to B cadence (-1.75), 4-roll TP, bulk-ship every 2nd
month. Decision needed from S-2 before M3.

05 // OPEN
1. Bundle LiberationMono-Bold (woff2) + @font-face; currently falls back to
   system mono.
2. Reconcile manifest with LOT-FM-001 source.
3. "CANCEL ANY TIME" term is drafted, not sourced.
4. Deploy: /open live only after next deploy; SW cache version bump advised.
5. Logged-out users cannot reach /basics (SPA login); /open is the public path.

06 // DISTRACTION ELIMINATED
Per-item COGS display / "savings vs retail" copy. Not shipped. Ledger only.

07 // NEXT (MONTH 2)
UPGRADE state machine USERSHIP/AI -> PENDING -> ON STRENGTH -> STEADY STATE,
roster intake (sizing, address, cadence start), +USD 100/mo additive billing,
STAND DOWN, issue-log table + migration.
================================================================================
