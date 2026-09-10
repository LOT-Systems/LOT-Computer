================================================================================
LOT FIELD MANUAL — LOT-FM-001
DOCUMENT: BASIC (RATION) — THE PHYSICAL LAYER OF THE LOT SYSTEM
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
REV:      A
DATE:     2026-09-10
================================================================================

--------------------------------------------------------------------------------
00 // PURPOSE
--------------------------------------------------------------------------------
LOT is, at present, an intelligence layer with no hardware of its own — a
system that reads the operator's signal (mood, memory, planner, journal,
selfcare, cohort) and returns questions, patterns, and direction. BASIC is
the first physical extension of that system: a fixed monthly ration of
material goods, issued to the operator on the same terms the software
already runs on — a subscription, not a purchase; a roster, not a
customer list; STAND DOWN, not "cancel."

BASIC is deliberately small. It is not the FMCG Basic Essentials plan
(docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md, $399/mo, 2027 target,
bulk-manufactured). LOT-FM-001 is the near-term, low-volume, hand-fulfilled
ration that proves the doctrine works before that plan is built. Two
different programs, two different scales, same house style.

--------------------------------------------------------------------------------
01 // DOCTRINE
--------------------------------------------------------------------------------
LOT ISSUES. LOT DOES NOT SELL.

The operator ON STRENGTH receives a fixed ration of material support, month
on month, at the same rate, with no catalog and no upsell. The ledger is
the marketing — there is no separate sales layer between the public manifest
and what actually ships. What LOT states it issues is what LOT issues.

Price ceiling: USD 100.00 / month, billed monthly, no contract, STAND DOWN
at will. Landed cost per ration ceiling: USD 40.00. Target margin: >= 60%.
The ceiling is never breached — a Section 2 cadence revision that would
break it is rejected, not absorbed into a higher price without an explicit
S-2 decision.

--------------------------------------------------------------------------------
02 // THE RATION LOAD — 23 ITEMS
--------------------------------------------------------------------------------
Nomenclature and cadence are public (rendered on the OPEN TAB). Landed cost
per item is withheld from the public ledger — the manifest states what
ships and how often, not what it costs LOT to ship it.

14 items ship every cycle (MONTHLY). 9 items rotate one per quarter across
the roster's individual cadence start (QUARTERLY) — a given operator sees a
different quarterly item in month 1, 2, 3 of their own clock, not a
calendar-quarter reset shared across the roster.

MONTHLY (14):
 1. FIELD JOURNAL, POCKET, 96-LEAF
 2. WRITING INSTRUMENT, INK, BLACK, FIXED-LINE
 3. TOOTHBRUSH, SOFT BRISTLE
 4. TOOTHPASTE, TRAVEL TUBE, 50ML
 5. SOAP, BAR, UNSCENTED
 6. UNDERWEAR, COTTON, PAIR
 7. SOCKS, CREW, PAIR
 8. RAZOR, SAFETY, REPLACEABLE HEAD
 9. RAZOR BLADES, PACK OF 5
10. VITAMIN D3, 30-COUNT
11. MAGNESIUM, 30-COUNT
12. ELECTROLYTE PACKET, 10-COUNT
13. TEA, LOOSE-LEAF, 50G
14. COTTON SWABS, 100-COUNT

QUARTERLY (9, one per cycle in rotation):
15. CHARGING CABLE, USB-C, 1M
16. FIRST-AID PATCH KIT
17. CANDLE, UNSCENTED, WHITE
18. EAR PLUGS, FOAM, PAIR
19. SLEEP MASK, BLACKOUT
20. NOTECARD SET, INDEX, BLANK, 25-COUNT
21. ENVELOPE SET, LOT LETTERHEAD
22. PATCH, LOT INSIGNIA, CLOTH
23. FIELD MANUAL, PRINTED, CURRENT REV

Rationale: the load mirrors the software's own signal sources. The journal
and pen answer Log. The vitamins and electrolytes answer the biofield/QOS
signal. The printed Field Manual (item 23) is the same About.tsx canonical
reference the operator already reads on-screen, issued as a physical object
once per quarter. Nothing on the load is aspirational hardware (no COSMO
Cube parts here — that is a separate division) — every item is a real,
cheaply sourced, low-COGS consumable that keeps the ration inside the
USD 40 landed ceiling with room for shipping and packaging.

--------------------------------------------------------------------------------
03 // VISUAL SPEC (house style, translated to code)
--------------------------------------------------------------------------------
SPEC:        LiberationMono-Bold, white ground / black ink, inversion-only
             hierarchy, 2px rules, square corners, fixed character grid,
             IBM 3270 register. No marketing. No color. No radius. No icons.
IMPLEMENTED: Tailwind `font-mono` (system monospace stack) approximates the
             register for Month 1 — LiberationMono is not yet bundled as a
             webfont in this codebase. `border-2`, `rounded-none` (default,
             not overridden), `bg-acc`/`text-bac` inversion for the status
             line, uppercase tracking-wide throughout. HONEST GAP: the exact
             LiberationMono-Bold typeface is not wired in; visually adjacent,
             not identical. Follow-up: bundle the real font file before this
             is called visually complete.
VOICE:       Quartermaster, imperative, terse — enforced by hand in the copy
             (doctrine statement, ISSUE RATE block, status line fields). No
             automated linter for voice; reviewed on read.

--------------------------------------------------------------------------------
04 // OPEN TAB (public surface)
--------------------------------------------------------------------------------
Reachable two ways on one component (src/client/components/BasicsTab.tsx):
  - Standalone, unauthenticated: GET /basics -> scriptName 'basics' ->
    src/client/entries/basics.tsx. No login required, no cookie read. A
    stranger reads the doctrine, price line, and full 23-item ledger.
  - Embedded, authenticated: the "Basics" nav tab inside the main app
    (client-side route 'basics', src/client/stores/router.ts), rendered by
    the same component with noWrapper=true so it sits inside the existing
    Layout/Page chrome instead of duplicating it.
Status line (BasicsStatusLine, exported and reusable): OPEN TAB · READ-ONLY
· 0 ON STRENGTH · LOT-FM-001 / M1. The "0 ON STRENGTH" figure is real, not
a placeholder — there is no roster yet (that is Month 2), so the honest
count is zero. It will read from the real roster count starting Month 2.

--------------------------------------------------------------------------------
05 // 90-DAY BUILD PLAN
--------------------------------------------------------------------------------
MONTH 1 — LEDGER & DOCTRINE                                    STATUS: LIVE
  OPEN TAB public surface. 23-item ledger (nomenclature + cadence, COGS
  withheld). Doctrine statement. Price line. Status-line component.
  Built: 2026-09-10, feature branch claude/beautiful-johnson-eqc3r6.
  EXIT MET: a stranger can read what LOT issues and on what terms,
  read-only, live at /basics and inside the app as the Basics tab.

MONTH 2 — UPGRADE & ROSTER                                 STATUS: PLANNED
  UPGRADE control + state machine: USERSHIP/AI -> PENDING -> ON STRENGTH ->
  STEADY STATE, with STAND DOWN downgrade (drops the ration, keeps AI
  Usership intact — the two are billed and gated independently). Roster
  intake: sizing, shipping address, cadence start date. Recurring $100/mo
  additive charge layered on top of existing Usership billing. Issue log
  scaffold (one row per operator per cycle, empty until Month 3 ships
  anything into it).
  NOT YET BUILT. Needs: a RationSubscription-shaped table (status, sizing,
  shipping address, cadence start, linked userId), API endpoints to drive
  the state machine, and a payment processor integration for the recurring
  $100/mo charge. The processor integration is explicitly flagged here as
  requiring an S-2 decision (which processor, which keys, PCI posture)
  before it is wired — this manual plans the state machine; it does not
  authorize standing up live billing unattended.

MONTH 3 — ISSUE & FULFILLMENT                               STATUS: PLANNED
  Month-by-month load engine reading the Section 2 cadence (which monthly
  items ship, which quarterly item is due this cycle per operator clock).
  Supplier quotes confirmed against the USD 40 landed COGS ceiling. Printed
  manifest card generation (one per box, per issue). First issue scheduled
  and dispatched to the first real roster member. Issue log accrues; NEXT
  ISSUE advances on schedule.
  NOT YET BUILT. This month is inherently partly non-code: supplier
  sourcing and physical dispatch are S-2 business operations, not something
  a build session can complete alone. The code side (load engine, manifest
  card generator, issue-log accrual) can be built ahead of the first real
  supplier relationship; actual shipping cannot.

--------------------------------------------------------------------------------
06 // OPEN QUESTIONS FOR S-2
--------------------------------------------------------------------------------
- Payment processor for the recurring $100/mo charge (Month 2 blocker).
- Confirmed supplier(s) per ration item, with landed cost quotes, to verify
  the USD 40 ceiling and >=60% margin target before Month 3 fulfillment.
- Whether BASIC issues to the existing Usership roster only, or opens
  independently of AI Usership (current plan: UPGRADE path FROM Usership,
  per the self-assembly directive — BASIC is additive on top of Usership,
  not a standalone entry point).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-FM-001 rev A
================================================================================
