# LOT-FM-001 — BASIC (RATION)

```
================================================================================
LOT-FM-001 / FIELD MANUAL
MODULE: BASIC (RATION) — 90-DAY BUILD
TAB: BASICS (hardware / physical layer of the LOT® System)
STATUS: MONTH 1 OF 3 — LEDGER & DOCTRINE — BUILT
================================================================================
```

This is the working manual for the Basics tab. Code and this document must
agree. Where they disagree, the code (`src/shared/basics/manifest.ts`) wins
and this document is corrected.

---

## SECTION 1 — DOCTRINE

```
01. LOT ISSUES. LOT DOES NOT SELL.
02. ONE BOX. ONE CADENCE. NO CHOICES TO MAKE.
03. EVERY ITEM IS LISTED. NOTHING IS HIDDEN.
04. THE LEDGER IS THE MARKETING.
05. STAND DOWN AT ANY TIME. THE SYSTEM REMAINS.
```

Operating rules:

- Issue, do not sell. The subscriber is ON STRENGTH, not a customer.
- USD 100 / month. Margin ≥ 60%. Landed cost ≤ USD 40 **on every issue** (a
  ceiling, not an average).
- No layer between the public and the manifest. The public page *is* the
  manifest.
- BASIC is additive to USERSHIP (AI). STAND DOWN drops the ration and keeps AI.

## SECTION 2 — THE 23-ITEM LOAD

Cadence codes: `M` monthly · `B` bimonthly · `Q` quarterly · `S` semiannual ·
`A` annual · `ONCE` on enlistment (issue 000 only). `PH` = phase, the first
issue (0-based) on which the line ships.

Rule: line ships on issue N ⇔ `N ≥ PH` and `(N − PH) mod interval = 0`.

| LN | CODE | NOMENCLATURE | QTY UI | CAD | PH | CLASS |
|----|------|--------------|--------|-----|----|-------|
| 01 | LOT-8960-001 | ELECTROLYTE, POWDER, UNFLAVORED | 30 SACHET | M | 0 | I |
| 02 | LOT-8955-002 | TEA, GREEN, LOOSE LEAF, 100 G | 1 PG | M | 0 | I |
| 03 | LOT-8925-003 | CHOCOLATE, DARK, 85%, 100 G | 1 BAR | M | 0 | I |
| 04 | LOT-8950-004 | SALT, SEA, COARSE, 250 G | 1 JR | S | 5 | I |
| 05 | LOT-8960-005 | BOTTLE, WATER, STEEL, 750 ML | 1 EA | ONCE | 0 | I |
| 06 | LOT-8440-006 | SOCKS, CREW, MERINO, BLACK * | 2 PR | S | 1 | II |
| 07 | LOT-8420-007 | SHIRT, T, COTTON, WHITE * | 1 EA | S | 3 | II |
| 08 | LOT-8420-008 | UNDERWEAR, COTTON, BLACK * | 2 EA | S | 2 | II |
| 09 | LOT-8415-009 | GLOVES, WORK, LEATHER * | 1 PR | A | 5 | II |
| 10 | LOT-8530-010 | SOAP, BAR, UNSCENTED | 1 BAR | M | 0 | VIII |
| 11 | LOT-8530-011 | TOOTHPASTE, FLUORIDE, 100 ML | 1 TU | B | 0 | VIII |
| 12 | LOT-8530-012 | TOOTHBRUSH, SOFT | 1 EA | Q | 1 | VIII |
| 13 | LOT-8530-013 | FLOSS, DENTAL, 50 M | 1 EA | Q | 2 | VIII |
| 14 | LOT-8530-014 | BLADE, RAZOR, DOUBLE EDGE | 10 PG | Q | 1 | VIII |
| 15 | LOT-8510-015 | BALM, LIP, UNSCENTED | 1 EA | Q | 2 | VIII |
| 16 | LOT-8510-016 | SUNSCREEN, SPF 50, 50 ML | 1 TU | S | 4 | VIII |
| 17 | LOT-6545-017 | KIT, FIRST AID, POCKET | 1 KT | A | 11 | VIII |
| 18 | LOT-7530-018 | NOTEBOOK, A5, GRID, 96 SH | 1 EA | Q | 0 | IV |
| 19 | LOT-7510-019 | PENCIL, GRAPHITE, HB | 3 EA | Q | 2 | IV |
| 20 | LOT-6260-020 | CANDLE, BEESWAX, 4 HR | 2 EA | Q | 0 | IV |
| 21 | LOT-7920-021 | CLOTH, MICROFIBER, 30 CM | 1 EA | S | 0 | IV |
| 22 | LOT-6150-022 | CABLE, USB-C, BRAIDED, 1 M | 1 EA | A | 10 | IV |
| 23 | LOT-7690-023 | CARD, MANIFEST, PRINTED | 1 EA | M | 0 | IV |

`*` sized at roster intake (Month 2).

Supply classes: I SUBSISTENCE · II CLOTHING & INDIVIDUAL EQUIPMENT ·
IV FIELD & UTILITY · VIII HYGIENE & MEDICAL.

### 2.1 Envelope (planning estimates — not yet quoted)

COGS lives only in `src/server/utils/basics-cogs.ts` and never reaches the
client bundle (verified: 0 client chunks contain `LINE_COST`).

Fixed overhead per issue: packaging 1.80 + postage 7.70 + card processing 3.20
(2.9% + 0.30 on USD 100) = **USD 12.70**.

```
24-ISSUE AUDIT (npm run test:basics)
ITEMS 23/23 · PEAK LANDED 39.15 (ISSUE 000) · AVG 35.16 · MIN MARGIN 61.0%
ENVELOPE: GREEN
```

Issue 000 is the tightest box (enlistment bottle + notebook + candles).
Headroom on issue 000 is USD 0.85. Any supplier quote that raises a line
shipping on issue 000 must be offset before it is accepted.

## SECTION 3 — VISUAL SPEC (TERMINAL REGISTER)

| Spec | Rule | Implementation |
|------|------|----------------|
| Face | LiberationMono-Bold | `'Liberation Mono', 'LiberationMono-Bold', 'Courier New', monospace`, weight 700. No webfont shipped yet (CSP + bundle). |
| Ground / ink | white / black | theme tokens `bg-bac` / `text-acc` (default theme = white/black; follows user theme in-app). |
| Hierarchy | inversion only | section headers and status line = `bg-acc text-bac`. No size, weight or color steps. |
| Rules | 2px | `border-2 border-acc`, row rules `border-t-2`. |
| Corners | square | `rounded-none`. |
| Grid | fixed character grid | widths in `ch`; qty/cadence block is a fixed 10+2+13 char padded string. |
| Case | upper | entire module uppercase. |
| Forbidden | color, radius, icons, marketing copy | none present. |

## SECTION 4 — OPEN TAB

- In-app: `Basics` nav button → route `basics` (`/basics`), component
  `src/client/components/Basics.tsx`, `mode="member"`.
- Public: logged-out `GET /basics` serves entry `basics` (no login wall),
  same component, `mode="public"`. The logged-out nav `Basics` button links
  to it.
- Sections: DOCTRINE · TERMS · MANIFEST (by supply class) · FIRST ISSUE
  (load 000) · UPGRADE (state path, roster closed) · STATUS LINE.

Status line format:

```
BASIC · LEDGER V1 · 23/23 ITEMS · NEXT ISSUE YYYY-MM-01 · ROSTER CLOSED · YOU: <STATE>
```

## SECTION 5 — UPGRADE STATE MACHINE (MONTH 2 — NOT BUILT)

```
USERSHIP/AI ──UPGRADE──▶ PENDING ──roster complete + first charge ok──▶ ON STRENGTH
     ▲                     │                                               │
     │                 abandon/fail                                  first issue
     │                     ▼                                         dispatched
     └──────────────── USERSHIP/AI ◀──STAND DOWN── STEADY STATE ◀──────────┘
```

Planned storage: `user.metadata.basics = { state, roster: { sizes, address,
cadenceStart }, issues: [...] }` — reuses existing JSON metadata column; no
migration for the state field. Billing integration is the open question —
the repo has no payment processor wired; see Section 7.

## SECTION 6 — 90-DAY PLAN & STATUS

| Month | Build | Exit | Status |
|-------|-------|------|--------|
| 1 — LEDGER & DOCTRINE | OPEN TAB public surface, 23-line ledger, doctrine, price line, status line, terminal tokens + grid, load engine core, envelope audit | Stranger can read what LOT issues and on what terms. Read-only. | **BUILT on branch. Live after merge + deploy.** |
| 2 — UPGRADE & ROSTER | UPGRADE control + state machine, roster intake (sizing, shipping, cadence start), USD 100 additive billing, STAND DOWN, issue log scaffold | Usership member goes ON STRENGTH and back OFF end to end. | NOT STARTED |
| 3 — ISSUE & FULFILLMENT | load engine per cadence (core done in M1), supplier quotes vs ceiling, printed manifest card, first issue dispatched, issue log, NEXT ISSUE advances | First real ration ships to a real subscriber. Margin ≥ 60% verified. | NOT STARTED (engine core pulled forward) |

## SECTION 7 — OPEN DECISIONS (S-2)

1. **Payment processor.** No Stripe (or other) integration exists in the repo.
   Month 2 billing needs one. Recommendation: Stripe Billing, one Price
   (USD 100/mo), subscription item added to the Usership customer.
2. **Item list sign-off.** The 23 lines above are a first draft by the build
   agent. Swap freely; rerun `npm run test:basics` after any change.
3. **Font.** Ship Liberation Mono Bold as a self-hosted woff2, or accept the
   system monospace fallback.
4. **Ship-to region.** Postage (7.70) assumes US domestic ground, ≤ 2 lb.
