```
╔══════════════════════════════════════════════════════════════════════════╗
║               LOT SYSTEMS — HEALTH CHECK REPORT                         ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-HEALTH-20261115                                          ║
║  DATE     : 2026-11-15                                                   ║
║  CLASS    : AUTOMATED HEALTH CHECK                                       ║
║  COVERAGE : CI/CD · Code Quality · Component Audit · Open PRs            ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## SUMMARY

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 CRITICAL | 1 | Weekly Rebuild CI/CD — 8 consecutive failures |
| 🟡 WARNING  | 4 | Code quality: TODOs, stale dev flag, open long-running PRs |
| 🟢 NOMINAL  | — | Core architecture, UI system, Benchmark Lattice workflow |

---

## 1. ACTIVE INCIDENTS

### 🔴 CRITICAL — Weekly Rebuild Workflow Failing (8 consecutive runs)

**Service:** GitHub Actions — `Weekly Rebuild & Self-Assembly Sync`
**Workflow:** `.github/workflows/weekly-rebuild.yml`
**Link:** https://github.com/LOT-Systems/LOT-Computer/actions/runs/42541025983

**Status:** Every scheduled Sunday rebuild has failed since **2026-09-20**. The last
successful run was **2026-09-13**.

**Failure point:** Step 2 — `Install doctl` (`digitalocean/action-doctl@v2`) exits
non-zero before any subsequent steps run. Steps 3–5 (Get App ID, Trigger rebuild,
Verify deployment) are all skipped.

**Likely root cause:** The `DIGITALOCEAN_ACCESS_TOKEN` repository secret has either
expired, been revoked, or the `digitalocean/action-doctl@v2` action itself has a
breaking change with current GitHub runner images. The secret needs rotation or
the action pin needs an update.

**Impact:** The DigitalOcean App Platform has not received an automated weekly
forced rebuild since September 13. Manual deploys on code push (if configured
separately on DO) may still be working, but the weekly clean-rebuild cadence
intended to pick up dependency and runtime updates is broken.

**Recommended action:**
1. Rotate `DIGITALOCEAN_ACCESS_TOKEN` in repo Settings → Secrets → Actions
2. Consider pinning `digitalocean/action-doctl@v3` or the latest stable version
3. Re-run the workflow manually after the fix to verify

---

## 2. ERRORS AND WARNINGS

### 🟡 WARNING — Fastify logger disabled with "Temporarily" comment in production server

**File:** `src/server/server.ts:35`

```ts
const fastify = Fastify({
  logger: false  // Temporarily disable logging for development
})
```

The comment says "temporarily" and "development" but this code runs in production.
Server-level structured logging (request tracing, error logging, response times) is
completely off. Errors that reach Fastify's logger layer are silently swallowed.

**Recommended fix:** Restore structured logging or gate by environment:
```ts
const fastify = Fastify({
  logger: config.env !== 'production' ? false : { level: 'warn' },
})
```

---

### 🟡 WARNING — CSP allows `'unsafe-inline'` scripts in production

**File:** `src/server/server.ts:58`

The Content Security Policy includes `'unsafe-inline'` in `script-src`. This
weakens XSS protection — any inline script injected via XSS runs without restriction.

```ts
'script-src': ["'self'", "'unsafe-inline'", ...]
```

**Recommended fix:** Migrate to CSP nonces (Helmet's `enableCSPNonces: true` is
already set — wire the nonce into inline scripts) and remove `'unsafe-inline'`.

---

### 🟡 WARNING — Auth TODO: chat permission check missing

**File:** `src/server/routes/api.ts:367`

```ts
// TODO: check if user is allowed to use chat
```

An authorization check is documented but not implemented. If this endpoint is live,
any authenticated user may be able to use chat regardless of their role or plan.

---

### 🟡 WARNING — TypeScript suppression in router

**File:** `src/client/stores/router.ts:38`

```ts
// @ts-ignore FIXME:
```

An unresolved type error is suppressed. Same pattern at `src/shared/utils/fp.ts:149`.
These should be properly typed or at minimum have a comment explaining the invariant.

---

## 3. PERFORMANCE ANOMALIES

No live performance data is available from this environment (no access to DO metrics,
Datadog, or runtime logs). The following static code observations are relevant:

### Observation — `ToggleSection` uses `max-h-[2000px]` for CSS transition

**File:** `src/client/components/ui/ToggleSection.tsx:50`

```ts
isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
```

This is a common pattern but causes a 2000px→0 CSS transition that is proportional
to the hardcoded cap, not the actual content height. For short content the animation
feels instant; for content near 2000px it animates correctly. If any section grows
past 2000px it clips silently.

**Recommended fix:** Use `grid-template-rows: 0fr/1fr` transition (zero-gap subgrid
approach) for true height-agnostic CSS animation, or apply JS-measured `max-h`.

### Observation — `Clock` component: `@ts-ignore` on setInterval

**File:** `src/client/components/ui/Clock.tsx:27`

```ts
// @ts-ignore
loop.current = setInterval(...)
```

Should be `loop.current = window.setInterval(...)` or typed as
`React.useRef<ReturnType<typeof setInterval>>`. Minor but pollutes type safety.

---

## 4. RESOLVED ITEMS

No incidents or alerts have been resolved since the last check; the Weekly Rebuild
failure is ongoing and predates previous reports.

---

## 5. COMPONENT QUALITY AUDIT

### Architecture Grade: A

The UI system is well-structured. Key strengths:

| Component | Quality | Notes |
|-----------|---------|-------|
| `Button` | ✅ Excellent | Split into sub-components per store subscription to minimize re-renders |
| `WidgetErrorBoundary` | ✅ Excellent | Per-widget isolation + timing instrumentation via `__LOT_WIDGET_PERF__` |
| `Block` | ✅ Excellent | Sophisticated click-propagation guard on interactive children |
| `Layout` | ✅ Excellent | Circular dependency (`ui/index → Layout → ui/index`) documented and broken correctly |
| `System.tsx` | ✅ Good | `React.memo`, astrology 15-min re-tick with `document.hidden` guard, viewport-aware `LazyMount` |
| `ConnectionStatus` | ✅ Good | Flicker-prevention via `hasConnectedOnce` gate |
| `Tag` | ✅ Good | `useMemo` for className computation |
| `ToggleSection` | ⚠️ Acceptable | `max-h-[2000px]` animation cap (see above) |
| `Clock` | ⚠️ Acceptable | `@ts-ignore` on interval ref type |
| `Page` | ✅ Good | Minimal, clean; no unnecessary store subscriptions |
| `Input` | ✅ Good | Properly memoized onChange with `useCallback` |

### Design System Grade: A

- Token-based theming (`--acc-color-*`, `--base-color`) with full `dark`/`light`/`mirror` coverage
- Custom spacing scale matching the LOT visual rhythm
- `grid-fill-hover` utility for the signature grid hover effect is consistent across interactive elements
- Font: Arial/Helvetica system stack — fast, no FOUT

### Server Architecture Grade: B+

- Fastify with `@fastify/helmet`, proper CSP (minus the `unsafe-inline` above)
- Route separation: `auth`, `api`, `admin-api`, `public-api`, `os-api`
- Worker pattern for background jobs via `src/server/lib/worker.js`
- Scheduled jobs via `src/server/scheduled-jobs.ts`
- Deduct: logger disabled in production; auth TODO in api routes

---

## 6. OPEN PULL REQUESTS

| # | Title | Age | Status |
|---|-------|-----|--------|
| #97 | `[LOT-ASSEMBLY] 2026-10-24 — LOT-WIKI-v88 · Badge Codex v32 · THE HERO'S JOURNEY` | 22 days | Open, not draft |
| #93 | `feat(calendar): time tracking + military-grade due-event toast` | 110 days | Open, not draft |

PR #93 is over 3 months old. It should be merged, rebased against master, or closed
to keep the PR list clean and prevent significant merge conflicts.

PR #97 (LOT-WIKI-v88 / Badge Codex v32 assembly) is recent and actionable — merging
it will also trigger the `benchmark-tag-lattice` workflow to tag the new benchmark
commits.

---

## 7. CI STATUS SUMMARY

| Workflow | Last Run | Result |
|----------|----------|--------|
| `Benchmark Tag Lattice` | 2026-08-05 (run #6) | ✅ success |
| `Weekly Rebuild & Self-Assembly Sync` | 2026-11-09 (run #24) | 🔴 failure (8 consecutive) |

The Benchmark Lattice workflow only fires on pushes to `master`. Since no new pushes
to master have happened since 2026-08-05, it correctly shows no new runs. It was
healthy on its last execution.

---

## RECOMMENDED ACTIONS (PRIORITY ORDER)

1. **🔴 URGENT** — Rotate `DIGITALOCEAN_ACCESS_TOKEN` secret and fix or update
   `digitalocean/action-doctl@v2` in `weekly-rebuild.yml`. Run manually to verify.
2. **🟡 HIGH** — Merge or close PR #93 (110 days stale, calendar feature).
3. **🟡 HIGH** — Merge PR #97 (LOT-WIKI-v88 assembly) to advance Badge Codex v32 to master.
4. **🟡 MEDIUM** — Remove `logger: false` from production Fastify config.
5. **🟡 MEDIUM** — Remove `'unsafe-inline'` from CSP by wiring Helmet nonces to inline scripts.
6. **🟢 LOW** — Fix `@ts-ignore` in `Clock.tsx` and `router.ts`.
7. **🟢 LOW** — Implement `max-h` animation in `ToggleSection` via grid subgrid pattern.

---

*Report generated: 2026-11-15 by automated health check session.*
*Repo: LOT-Systems/LOT-Computer · Branch: claude/inspiring-volta-mtafkp*
