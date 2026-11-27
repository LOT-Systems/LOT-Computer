# LOT-FM-001 · BASIC (RATION) · 90-DAY BUILD PLAN

```
================================================================================
LOT-FM-001 / SELF-ASSEMBLY DIRECTIVE · MODULE: BASIC (RATION) · 90-DAY BUILD
WINDOW: 2026-11-27 → 2027-02-25 · OWNER: LOT BUILD AGENT · AUTH: S-2
================================================================================
```

## 0. ENVELOPE (NEVER BREACH)

| TERM | VALUE |
|---|---|
| PRICE | USD 100 / MO, additive to Usership (AI) |
| LANDED CEILING | ≤ USD 40, **every** month (not averaged) |
| MARGIN FLOOR | ≥ 60% |
| GATE | `yarn basics:envelope` exits 1 on any breach. Never ship red. |

Doctrine: issue, do not sell. The ledger is the marketing. No layer between
public and manifest. COGS never leaves the server — only the verdict
(GREEN/BREACH).

## 1. ARCHITECTURE

| LAYER | FILE | ROLE |
|---|---|---|
| Manifest (public) | `src/shared/constants/basics.ts` | 23 items · NSN · nomenclature · qty · U/I · cadence · offset · class. Doctrine. Terms. Load function. |
| COGS (server only) | `src/server/utils/basics-cogs.ts` | Landed cost per issue event · pack + freight · 12-month envelope · gap check. |
| Gate | `scripts/basics-envelope.ts` | Prints 12-month cycle, exits 1 on breach/gap/count≠23. |
| Public API | `GET /api/public/basics` | Manifest + doctrine + terms + envelope verdict. No figures. |
| Surface | `src/client/components/Basics.tsx` | Terminal sheet. In-app tab (`/basics`) and public OPEN TAB (`/basics` logged out → `basics` entry). |
| Style | `src/client/index.css` `.lot-basics*` | Mono bold · white/black · 2px rules · inversion-only · square. Theme-independent. |

Cadence codes: `M` monthly · `Q` quarterly · `S` semiannual · `A` annual.
Cycle LCM = 12 months; `offset` staggers Q/S/A items so each monthly box
stays under the ceiling.

## 2. MONTH 1 — LEDGER & DOCTRINE (read-only) · 2026-11-27 → 2026-12-26

- [x] OPEN TAB public surface at `/basics` (no login)
- [x] Basics nav tab live for members (was a disabled placeholder)
- [x] 23-item manifest ledger, nomenclature + cadence, COGS withheld
- [x] Doctrine statement · price line · terms
- [x] Status-line component (`StatusLine`)
- [x] Terminal tokens + character grid (`.lot-basics`)
- [x] Envelope gate script, green
- [ ] Deploy to production and confirm `/basics` logged out (needs S-2 merge)

EXIT: a stranger can read what LOT issues and on what terms.

## 3. MONTH 2 — UPGRADE & ROSTER · 2026-12-27 → 2027-01-25

State machine (stored on user, audited in Log):

```
USERSHIP/AI ──UPGRADE──▶ PENDING ──roster complete + payment ok──▶ ON STRENGTH
     ▲                     │                                          │
     │                  CANCEL                                 first issue ships
     │                     ▼                                          ▼
     └────STAND DOWN─── (any) ◀──────────STAND DOWN────────── STEADY STATE
```

- Migration: `basics_enlistment` table (userId, state, cadenceStart, roster JSON, billingRef, timestamps) + `basics_issue_log` scaffold.
- Roster intake form: sizing (UNDERWEAR, SOCKS, T-SHIRT), ship-to (CONUS), cadence start date.
- Billing: recurring USD 100/mo as an additive line on existing Usership billing. Confirm current processor before coding (see `SubscribeWidget.tsx`).
- STAND DOWN: ends ration at cycle end, retains AI. Inverse of UPGRADE, one control.
- API: `GET/POST /api/basics/enlistment`, `POST /api/basics/stand-down`.
- UI: UPGRADE button live; status line shows STATE + NEXT ISSUE.

EXIT: a Usership member goes ON STRENGTH and back OFF, end to end.

## 4. MONTH 3 — ISSUE & FULFILLMENT · 2027-01-26 → 2027-02-25

- Load engine: per-member month index from `cadenceStart`; `basicsLoadForMonth(m)` already exists.
- Supplier quotes replace every `ESTIMATE` in `basics-cogs.ts` with `QUOTED`; gate re-run.
- Printed manifest card: server-rendered 3270-style card (PDF/HTML print) per box.
- Scheduled job: generate issue N, write issue log, advance NEXT ISSUE.
- First real ration dispatched to a real subscriber. Margin verified ≥ 60% on actuals.

EXIT: first real ration ships. Margin verified.

## 5. RISK REGISTER

| ID | RISK | STATE | ACTION |
|---|---|---|---|
| R1 | Peak month landed USD 39.80 — USD 0.20 headroom | OPEN | M3 quotes must land at or below estimates; fallback: move LB-14 to a lighter month or cut freight via zone-skip |
| R2 | All COGS are ESTIMATES | OPEN | Supplier quotes in M3 |
| R3 | Freight USD 8.50 assumes ≤ 5 LB; 12 RL toilet tissue is bulky | OPEN | Weigh a packed sample box before M3 |
| R4 | Billing processor not yet identified for additive line | OPEN | Resolve at M2 start |
| R5 | Prior plan doc (`LOT_FMCG_SUBSCRIPTION_PLAN_2027.md`) prices physical tier at USD 399/mo | NOTED | This directive (USD 100) supersedes for BASIC; S-2 to confirm |
