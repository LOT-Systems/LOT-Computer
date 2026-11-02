# LOT-FM-001 — BASIC (RATION) — Technical Note

Route `/basics`. Client: `src/client/components/Basics/`. Shared manifest + cadence
engine: `src/shared/utils/ration.ts`. Server COGS (never client): `src/server/utils/ration-costs.ts`.
API: `/api/basic/{subscription,upgrade,roster,stand-down,issues,margin,issues/:id/advance}`.
Tables: `basic_subscriptions`, `basic_issues`.

State machine: USERSHIP → PENDING → ON_STRENGTH → STEADY_STATE; stand-down returns to USERSHIP.
Envelope: USD 100/mo · landed ≤ USD 40 · margin ≥ 60%. Costs are ESTIMATES until quoted.
Status and open gaps: `docs/benchmark/LOT-SR-20261102-01.md`.
