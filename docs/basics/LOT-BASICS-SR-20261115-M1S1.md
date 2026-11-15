```
================================================================================
LOT SYSTEMS / SESSION REPORT
DOCUMENT: LOT-BASICS-SR-20261115-M1S1
TITLE:    LOT-FM-001 BASIC (RATION) — MONTH 1 SESSION 1 — LEDGER & DOCTRINE
MODULE:   BASIC (RATION) — Basics tab
PHASE:    MONTH 1 — LEDGER & DOCTRINE   (DAY 1 OF 90)
BRANCH:   claude/beautiful-johnson-vpc5dm
DATE:     2026-11-15
MODE:     SCHEDULED ROUTINE (unattended)
RESULT:   GREEN
================================================================================
```

## STATUS LINE (against the envelope)

```
M1 S1 │ LEDGER BUILT │ OPEN TAB /open │ ENVELOPE HOLDING (EST) │ PEAK USD 34.35 ≤ 40 │ MIN MARGIN 62.45% ≥ 60
```

---

## 00 // PREFLIGHT

| Check | Result |
|---|---|
| Repo / branch | `claude/beautiful-johnson-vpc5dm` = `master` @ `98971f2` (no prior BASIC work on this branch) |
| Prior art | `About.tsx` references a `nifty-allen-jWyOe` ration branch — **not reachable** from this session (only `master` + this branch on remote). Built from scratch against the directive. |
| LOT-FM-001 source | Not in repo. Manifest, doctrine and cadence authored here from the directive + About.tsx notes (toothbrushes, underwear, hygiene, packaged goods). **S-2 review required (plan item 1.8).** |
| Dependencies | `yarn install --frozen-lockfile` — OK |

## 01 // INTAKE

| Field | Value |
|---|---|
| Artifact | Scheduled directive LOT-FM-001 / SELF-ASSEMBLY — BASIC (RATION) 90-day build |
| Classification | PRODUCT / ENGINEERING |
| Action | Month 1 increment built: ledger, doctrine, price line, status line, terminal tokens, OPEN TAB, Basics tab |

## 02 // BUILD — WHAT SHIPPED

### New files

| File | Purpose |
|---|---|
| `src/shared/constants/ration.ts` | 23-line load (4 classes), cadence codes M1/M2/M3/M6, stagger offsets, doctrine (5 articles), terms, UPGRADE state machine (`USERSHIP_AI → PENDING → ON_STRENGTH → STEADY_STATE`, `STOOD_DOWN`), `canTransitionRation`, `rationLoadForIssue(n)`. **No COGS.** |
| `src/server/ration/cogs.ts` | Internal cost sheet (all lines `ESTIMATE`), pack/postage/processing, `envelopeForIssue`, `envelopeCycle` (6-issue gate). Server-only. |
| `src/server/routes/ration-public.ts` | `GET /api/public/ration` — manifest + `envelope: HOLDING/BREACH`, phase, intake state. No cost figures leave the server. |
| `src/client/components/Basics.tsx` | `RationSheet` (status line · doctrine · ledger · cadence grid · terms · upgrade strip), `Basics` tab wrapper. |
| `src/client/entries/open-tab.tsx` | Public OPEN TAB entry. |
| `docs/basics/LOT-BASICS-PLAN-90D.md` | Running 90-day plan with per-task status. |

### Modified

| File | Change |
|---|---|
| `src/client/stores/router.ts` | `basics: '/basics'` route |
| `src/client/components/ui/Layout.tsx` | "Basics" nav enabled → `basics` route (logged in); logged-out "Basics" → `/open` via new `href` nav option |
| `src/client/entries/app.tsx` | `TabPanel` for `basics`; Usership members shown at `USERSHIP / AI` on the upgrade strip |
| `src/server/index.ts`, `src/server/server.ts` | `/basics` added to client routes; public `/open` route (entry `open-tab`); ration API registered under `/api/public` |
| `scripts/build/client.build.ts` | `open-tab.tsx` entry point |
| `src/client/index.css` | `[data-lot-ration-strip]` grid (2px rules via gap; 2×2 under 600px). Moved out of an inline `<style>` because CSP `style-src` uses nonces. |

### The sheet (top to bottom)

1. **Status line** (inverted): `LOT-FM-001 │ BASIC │ MONTH 1 — LEDGER & DOCTRINE │ ENVELOPE HOLDING │ INTAKE CLOSED [│ state]`
2. **Header**: LOT® BASICS / CIVILIAN RATION — ISSUED MONTHLY
3. **Section 1 Doctrine**: five numbered articles
4. **Section 2 Load manifest**: LN · STOCK NO · NOMENCLATURE · U/I · QTY · CADENCE, grouped under inverted class bars. `[SZ]` marks garment lines sized at roster intake. "COST OF GOODS WITHHELD."
5. **Section 3 Cadence**: fixed-grid ■/· matrix, issues 01–06 × lines 01–23, lines per box
6. **Section 4 Terms**: plan, rate USD 100/month, additive billing, eligibility, stand down
7. **Section 5 Upgrade path**: 4-state strip (current state inverted) + disabled `UPGRADE — USD 100/MO` (intake opens Month 2)

Screenshots: `docs/basics/img/open-tab-m1-desktop.png`, `docs/basics/img/open-tab-m1-phone.png`

### The 23-line load

| Class | Lines |
|---|---|
| I HYGIENE | 01 toothbrush · 02 dentifrice · 03 floss · 04 soap ×2 · 05 shampoo · 06 deodorant · 07 razor cartridges · 08 lip balm · 09 sunscreen |
| II GARMENT | 10 underwear ×2 [SZ] · 11 merino socks ×2 [SZ] · 12 heavyweight tee [SZ] · 13 hand towel |
| III SUSTENANCE | 14 black tea · 15 oats · 16 buckwheat · 17 sea salt · 18 raw honey · 19 electrolyte tabs |
| IV HOUSEHOLD | 20 laundry sheets · 21 sponges · 22 candles ×2 · 23 printed manifest card |

## 03 // CHECKS

| Check | Result |
|---|---|
| `yarn server:build` (tsc + ESM fix) | PASS |
| `yarn client:build` (esbuild + postcss) | PASS (pre-existing duplicate-key warnings in `badges.ts`, unrelated) |
| `tsc --noEmit -p tsconfig.json` | 104 errors = **baseline 104**. Zero new. |
| COGS leak scan on `dist/client` (`RATION_COGS`, `POSTAGE`, `withinCeiling`) | **CLEAN** — no cost data in any client bundle |
| `envelopeCycle()` on compiled server | `green: true`, 23/23 lines costed |
| Headless render `/open` @1280 and @390 | No console/page errors; status line populated from API (`ENVELOPE HOLDING`); page scrollWidth = viewport (ledger and cadence grid scroll inside their own frame on phones) |

## 04 // ENVELOPE

| Issue | Lines | Landed | Margin |
|---|---|---|---|
| 01 | 15 | 30.35 | 66.45% |
| 02 | 16 | 34.35 | 62.45% |
| 03 | 16 | 31.15 | 65.65% |
| 04 | 17 | 34.35 | 62.45% |
| 05 | 15 | 32.15 | 64.65% |
| 06 | 17 | 33.35 | 63.45% |

**Finding:** without stagger, every line lands on issue 01 → **USD 42.95 landed, ceiling breached.**
Fix: per-line `offset` staggers the M2/M3/M6 lines across the cycle. Peak now USD 34.35.
All costs are **estimates** at 100-subscriber volume; Month 3 replaces them with quotes.

## 05 // DECISIONS NEEDED FROM S-2

1. **Approve the 23-line load and doctrine text** (authored here; LOT-FM-001 Section 2 was not in the repo). Edit `src/shared/constants/ration.ts`. Sizes, sustenance class and line 23 (the manifest card counted as an item) are the likeliest changes.
2. **Billing provider for the additive USD 100/mo line** (Month 2, item 2.5). The repo has no recurring-billing integration I could reuse without a decision.
3. **Font**: LiberationMono-Bold is named in the stack but not bundled; the browser falls back to Courier New. Self-host the font (OFL licence) in M1 item 1.6.
4. **Where `nifty-allen-jWyOe` lives**: About.tsx says a 6-iteration ration branch exists. If it does, point the routine at it and the next session will merge what's useful.

## 06 // NEXT SESSION (M1 S2)

- 1.6 self-host LiberationMono-Bold
- 1.7 server-rendered meta for `/open`
- Start 2.1 / 2.2 migrations behind a flag so Month 2 begins with schema in place

## 07 // DISTILLED

- **Stagger is load-bearing.** Cadence alone puts every line in box 01. Check peak per box, not average per month.
- **COGS stays server-side by import boundary**: the shared file never imports the cost sheet; the cost sheet imports the shared file.
- **CSP**: helmet nonces apply to `style-src` — inline `<style>` tags are blocked; React `style={}` props are not. Put selector rules in `index.css`.
- **`.gitignore` matches `server/`** — new files under `src/server/` must be `git add -f`'d.

ELIMINATE ONE DISTRACTION: the ration sheet ignores the app theme engine. One register, ink on paper.
