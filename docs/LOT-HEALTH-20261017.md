<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Systems — Health Check Report

```
╔══════════════════════════════════════════════════════════════════════╗
║                LOT SYSTEMS — HEALTH CHECK REPORT                     ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-HEALTH-20261017                                      ║
║  DATE     : 2026-10-17                                               ║
║  CLASS    : DIAGNOSTICS                                              ║
║  STATUS   : DEGRADED — 1 CRITICAL, 3 WARNINGS                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 1. Active Incidents

### 🔴 CRITICAL — Weekly Rebuild CI/CD: 4 Consecutive Failures

**Service:** GitHub Actions — `Weekly Rebuild & Self-Assembly Sync`
**Affected since:** 2026-09-20 (4 weeks running)
**Last success:** 2026-09-13 (Run #16)
**Latest failure:** 2026-10-12 (Run #20)

**Failure point:** Step 2 — `Install doctl` (DigitalOcean CLI setup)

The `digitalocean/action-doctl@v2` step fails immediately on every run since
Sept 20, causing all subsequent steps (Get App ID, Trigger rebuild, Verify
deployment) to be skipped. This means the production app on DigitalOcean App
Platform has **not received a weekly forced rebuild since September 13, 2026**.

**Root cause:** The `DIGITALOCEAN_ACCESS_TOKEN` GitHub secret appears to be
expired, revoked, or invalid. This is a credential issue — the doctl installer
authenticates with the token and fails if the token is bad. Nothing changed in
the workflow file itself.

**Action required:** Rotate `DIGITALOCEAN_ACCESS_TOKEN` in GitHub repository
secrets (`Settings → Secrets → Actions`). Generate a fresh Personal Access
Token in the DigitalOcean control panel with App Platform read/write scope.

**Links:**
- Latest failed run: https://github.com/LOT-Systems/LOT-Computer/actions/runs/38187315134
- All workflow runs: https://github.com/LOT-Systems/LOT-Computer/actions/workflows/weekly-rebuild.yml

---

## 2. Errors and Warnings

### ⚠️ WARNING — Stale Open PR #93 (81 days)

**Service:** GitHub — Pull Requests
**PR:** feat(calendar): time tracking + military-grade due-event toast
**Branch:** `claude/dreamy-babbage-4iv1xo`
**Opened:** 2026-07-28 | **Last updated:** 2026-08-05
**Age:** 81 days with no merge or close

This PR has been open since late July with no activity in over two months.
Either it should be merged into master or closed if the work was superseded
by later sessions.

**Link:** https://github.com/LOT-Systems/LOT-Computer/pull/93

---

### ⚠️ WARNING — TypeScript Config Deprecations (will break in TS 7.0)

**Service:** Build System — `tsconfig.json`

Two options are deprecated as of TypeScript 6.0 and will **stop functioning
in TypeScript 7.0**:

| Option | Current Value | Issue |
|---|---|---|
| `baseUrl` | `"src"` | Deprecated in TS 6.0 |
| `moduleResolution` | `"Node"` | Deprecated alias for `Node10` |

Additionally, 11 entries in `types` array reference packages that have no
corresponding `@types/*` installed in the container (argparse, bluebird,
debug, ejs, estree, ms, prop-types, react-dom, seedrandom, sequelize — plus
`node`), producing `TS2688: Cannot find type definition file for 'X'` errors
on full `tsc --noEmit`.

**Recommended fix for tsconfig.json:**
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "ignoreDeprecations": "6.0"
  }
}
```
Or migrate path aliases from `baseUrl + paths` to the modern
`paths`-only approach without `baseUrl`.

---

### ⚠️ WARNING — Outdated Package Versions

**Service:** Node.js dependencies — `package.json`

Several packages are significantly behind current stable releases:

| Package | Current | Latest | Notes |
|---|---|---|---|
| `@anthropic-ai/sdk` | `^0.32.1` | `^0.55.x` | +23 minor versions; new streaming API, tool_use improvements |
| `openai` | `^4.52.0` | `^4.104.x` | Realtime API, structured outputs since 4.52 |
| `react` / `react-dom` | `^18.2.0` | `^19.1.0` | React 19 stable — Actions, `use()` hook, compiler |
| `tailwindcss` | `^3.1.6` | `^4.1.0` | v4 is a ground-up rewrite; breaking changes |
| `react-query` | `^3.39.3` | `^5.x (TanStack)` | v3 is EOL; v5 has different API shape |
| `axios` | `^0.27.2` | `^1.9.x` | v0.x is unmaintained; v1.x has breaking changes |
| `zod` | `^3.23.8` | `^3.25.x` | Minor — `z.templateLiteral()`, perf fixes |

**Priority order for upgrades:**
1. `@anthropic-ai/sdk` — active product dependency, security + API fixes
2. `openai` — active product dependency
3. `axios` v0 → v1 — v0.x has known CVEs
4. React 18 → 19 — requires testing, not urgent
5. Tailwind v3 → v4 — major rewrite, plan a dedicated session
6. react-query v3 → v5 — major API changes, plan a dedicated session

---

## 3. Performance Anomalies

**No performance data available from this session** — no live runtime metrics,
APM, or error tracking service (Sentry, Datadog, etc.) is connected to this
repository. All health checks are static analysis only.

The `StatusPage.tsx` component does poll `/api/public/status` and
`/api/memory-status` in-browser (2-minute cache, auto-refresh), but those
endpoints are only accessible when the app is running.

---

## 4. Resolved Items

None since last report. The last session report was `LOT-SR-20260805-01`
(2026-08-05).

---

## 5. Component & Code Quality Assessment

**Overall grade: A- (Top-tier architecture, minor housekeeping needed)**

### Strengths

| Area | Assessment |
|---|---|
| Component architecture | 64 components, all namespaced, well-separated concerns |
| Error boundaries | `WidgetErrorBoundary.tsx` wraps all widgets — no unhandled crashes bubble up |
| Lazy loading | `LazyMount` defers heavy widgets until viewport — prevents off-screen store subscriptions |
| Design system | Custom CSS variable token system with dark/light/mirror theming; consistent `bac`/`acc` palette |
| Type safety | `strict: true` in tsconfig; Zod for runtime validation |
| State management | Nanostores (atomic, zero-dependency) — excellent for this scale |
| Server framework | Fastify 5.x — fast, schema-based, correct security headers via `@fastify/helmet` |
| Rate limiting | `@fastify/rate-limit` in place |
| Authentication | JWT + cookie-based session model |
| Multi-AI | Anthropic, OpenAI, Google, Mistral all integrated |
| Codebase size | `badges.ts` 8149 lines, `intentionEngine.ts` 6503 lines — large files but logically dense |

### Areas to Improve

| Area | Issue | Priority |
|---|---|---|
| tsconfig.json | Deprecated options (see §2) | Medium |
| `axios` v0.x | Unmaintained; security risk in HTTP client | High |
| `@anthropic-ai/sdk` | 23 versions behind; missing new features | High |
| `react-query` v3 | EOL; no bug fixes upstream | Medium |
| No integration tests | No test suite found; only `test:cold-start` script | Medium |
| No Sentry/APM | No runtime error tracking beyond in-app status page | Low |

### UI/UX Quality (Top Designer Site Standard)

The design system uses a **variable-first approach** (`--acc-color-*`,
`--evolution-*`, `--theme-*` CSS variables) which enables the dynamic
evolution theming system (badge-unlocked theme changes). This is
sophisticated and production-grade.

The `Block` component handles the `isMirrorOn` state for the mirror/invert
mode properly — subtle design consideration. `Button` correctly handles the
`primary` / `secondary` / `secondary-rounded` variants with theme-aware
styling and proper `rel="noreferrer"` on `target="_blank"` links.

The `Page` component uses responsive spacing (`p-16` → `p-64`) across
`phone` / `tablet` / `desktop` breakpoints, which is clean.

**One gap:** `tailwindcss@^3.1.6` is well behind `v3.4.x` stable (the last
v3 release with `@starting-style`, `size-*` utilities, etc.), and v4 is
production-ready. The design system would benefit from the v3.4 utilities
before the v4 migration.

---

## Summary

```
┌──────────────────────────────────────────────────┐
│  CRITICAL   1   Weekly Rebuild CI broken 4 weeks  │
│  WARNING    3   Stale PR, TS config, dependencies  │
│  NOMINAL    —   Issues tracker clean (0 open)      │
│  NOMINAL    —   64 components, all error-bounded   │
└──────────────────────────────────────────────────┘
```

**Immediate action required:**
1. Rotate `DIGITALOCEAN_ACCESS_TOKEN` secret in GitHub → restores weekly rebuilds
2. Review / merge or close PR #93 (81 days open)
3. Upgrade `axios` to v1.x (security) and `@anthropic-ai/sdk` to latest

---

*Report generated: 2026-10-17 by Claude Code automated health check*
*Repo: LOT-Systems/LOT-Computer | Branch: master (HEAD: 98971f2)*
