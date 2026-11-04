```
╔══════════════════════════════════════════════════════════════════════╗
║               LOT SYSTEMS — AUTOMATED HEALTH CHECK REPORT            ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : HEALTH-CHECK-20261104                                    ║
║  DATE     : 2026-11-04 12:07 UTC                                     ║
║  CLASS    : AUTOMATED MONITORING                                     ║
║  RUN BY   : Scheduled Routine — System Health Check                  ║
║  BRANCH   : claude/inspiring-volta-sdx175                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 1. ACTIVE INCIDENTS

**Status: NONE**

No open GitHub issues. No active outages detected in codebase.

---

## 2. OPEN PULL REQUESTS

Two PRs are open and unmerged:

| PR | Title | Age | Status |
|----|-------|-----|--------|
| [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) | LOT-ASSEMBLY 2026-10-24 — LOT-WIKI-v88 · Badge Codex v32 · THE HERO'S JOURNEY | 11 days | Awaiting merge |
| [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) | feat(calendar): time tracking + military-grade due-event toast | ~99 days | **STALE** |

> **Action required:** PR #93 has been open since 2026-07-28. Either merge or close it to keep the PR queue clean.

---

## 3. ERRORS & WARNINGS

### 3a. TypeScript Deprecation Warnings — MEDIUM PRIORITY

**File:** `tsconfig.server.json`  
**TypeScript version:** 6.0.2  

Two deprecation warnings fire on every `tsc` invocation:

```
TS5107: Option 'moduleResolution=node10' is deprecated and will stop
        functioning in TypeScript 7.0.
TS5101: Option 'baseUrl' is deprecated and will stop functioning in
        TypeScript 7.0.
```

**Root cause:** `tsconfig.server.json` uses `moduleResolution: "node"` and `baseUrl: "."`, both deprecated in TypeScript 6.0. The config uses `ignoreDeprecations: "5.0"` which silences TS 5.0-era warnings but NOT these TS 6.0 ones.

**Investigation note:** Bumping `ignoreDeprecations` to `"6.0"` silences the warnings but causes module resolution to fully break (all `Cannot find module` errors cascade), because TS 6.0 fully disables the `node` resolver when acknowledged. This means a full migration is required:

**Required migration:**
1. Change `moduleResolution: "node"` → `"bundler"` (or `"node16"` for stricter ESM)
2. Remove `baseUrl: "."` (covered by `paths` entries already present)
3. Verify all path aliases resolve correctly after the change

**Timeline:** Must be done before TypeScript 7.0 ships or the server build will break entirely.

### 3b. TODOs in `api.ts` — LOW PRIORITY

```
src/server/routes/api.ts:367  // TODO: check if user is allowed to use chat
src/server/routes/api.ts:1064 // TODO: add "permanent: true"
```

Both have been in place since before the last tracked session. No immediate impact, but the chat authorization gap (line 367) should be addressed before the chat feature reaches production traffic.

---

## 4. SECURITY VULNERABILITIES — HIGH PRIORITY

`npm audit` reports **104 vulnerabilities** across the dependency tree:

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 36 |
| Moderate | 15 |
| Low | 52 |

### CRITICAL

| Package | Issue | Advisory |
|---------|-------|----------|
| `shell-quote@1.8.3` | (1) `quote()` does not escape newlines — shell injection via `.op` values; (2) Quadratic ReDoS in `parse()` | [GHSA-w7jw-789q-3m8p](https://github.com/advisories/GHSA-w7jw-789q-3m8p) · [GHSA-395f-4hp3-45gv](https://github.com/advisories/GHSA-395f-4hp3-45gv) |

**Dependency chain:** `shell-quote` is pulled in by `npm-run-all` (a devDependency used in build scripts). It is not a direct runtime dependency, so the blast radius is limited to build-time — but should still be updated.

**Fix:** `npm-run-all` has not shipped a fix for `shell-quote`; replace with `npm-run-all2` (maintained fork) or use native `&&`/`||` in scripts for critical paths.

### HIGH (selected)

| Package | Issue |
|---------|-------|
| `@fastify/static` | Path traversal in directory listing — [GHSA-pr96-94w5-mx2h](https://github.com/advisories/GHSA-pr96-94w5-mx2h) |
| `axios@0.27.x` | CSRF vulnerability — [GHSA-wf5p-g6vw-rhxx](https://github.com/advisories/GHSA-wf5p-g6vw-rhxx) |
| `fastify` | DoS via unbounded memory in `sendWebStream` — [GHSA-mrq3-vjjr-p77c](https://github.com/advisories/GHSA-mrq3-vjjr-p77c) |
| `sequelize@6` | SQL injection via JSON column cast type — [GHSA-6457-6jrx-69cr](https://github.com/advisories/GHSA-6457-6jrx-69cr) |
| `jws` | HMAC signature improperly verified — [GHSA-869p-cjfg-cm3x](https://github.com/advisories/GHSA-869p-cjfg-cm3x) |
| `lodash` | Code injection via `_.template` key names — [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) |
| `rollup` | Arbitrary file write via path traversal — [GHSA-mw96-cpmx-2vgc](https://github.com/advisories/GHSA-mw96-cpmx-2vgc) |
| `postcss` | XSS via unescaped `</style>` in stringify output — [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) |

**Recommended actions (priority order):**
1. **`axios`**: Update from `^0.27.2` → `^1.9.0`. This is a breaking major version — review interceptors and error shape.
2. **`fastify` / `@fastify/static`**: Run `npm update fastify @fastify/static` to pull latest patch.
3. **`sequelize`**: The SQL injection via JSON cast is a known v6 issue with no v6 patch; consider migration to Prisma (already present in `src/generated/prisma/`) or Sequelize v7.
4. **`jws` / `jsonwebtoken`**: Check if `jsonwebtoken@9.x` ships a fixed `jws`. If so, pin to the latest patch.
5. **`shell-quote` (via `npm-run-all`)**: Replace `npm-run-all` with `npm-run-all2` in devDependencies.

---

## 5. PERFORMANCE ANOMALIES

No real-time telemetry is accessible from this session. No performance data can be pulled from the application directly in this environment.

**Observable signals from code review:**

- `System.tsx` renders 64+ widgets. The `LazyMount` / `useInViewport` pattern is correctly implemented — widgets only mount when scrolled into view. No regression detected.
- `QuantumEngineWidgets.tsx` uses `localStorage` for widget collapse state — correctly wrapped in `try/catch`.
- `scheduled-jobs.ts` monthly email job has proper idempotency guards (`isMonthlyEmailJobRunning` flag + same-day deduplication).
- Server logging is currently disabled (`logger: false` in `Fastify()` constructor in `server.ts`) — this is marked as "temporary for development" but is in the main codebase. If running in production, logs are silent, which hinders observability.

> **Recommendation:** Restore `logger` to `true` or use `logger: { level: 'warn' }` in production mode. The comment says "temporarily" but no ticket or flag guards it.

---

## 6. RESOLVED ITEMS

No resolved incidents since the last session report (LOT-SR-20260805-01, 2026-08-05).

The last major engineering session resolved:
- v20/v21 badge logic gap (backfilled 62 unreachable badge types)
- v32 Hero's Journey badge set implemented (+93 badge types, 719→812)
- TypeScript compile baseline: zero errors in `badges.ts` and `easter-eggs.ts`

---

## 7. COMPONENT QUALITY ASSESSMENT

**Stack overview:**
- React 18.2.0 (React 19.x available — not critical)
- TypeScript 6.0.2
- Fastify 5.6.x
- Tailwind CSS (via PostCSS)
- Nanostores for state
- Sequelize v6 + Prisma (dual ORM — consolidation opportunity)

**64 client components** — no dead exports found in a surface scan.

**Dual ORM risk:** `src/generated/prisma/` exists alongside Sequelize v6. Having two ORMs in the same codebase adds complexity and maintenance surface. Consider completing the migration to Prisma and retiring Sequelize.

**Security config quality:** `src/server/security-config.ts` is excellent — centralized, well-commented, all security constants in one auditable file. Rate limiting, brute force protection, and email code config are all present and sane.

**CSP quality:** Content Security Policy in `server.ts` uses `'unsafe-inline'` for `script-src` and `'unsafe-eval'` is absent, which is good. CSP could be tightened further by removing `https://unpkg.com` from `connect-src` and `script-src` if not actively needed.

---

## 8. SUMMARY TABLE

| Category | Status | Priority |
|----------|--------|----------|
| Active incidents | None | — |
| Open PRs | 2 open (1 stale 99 days) | Medium |
| TypeScript TS7 deprecation migration | Pending | Medium — before TS7 |
| npm audit: CRITICAL (shell-quote) | Unresolved (dev-only risk) | Medium |
| npm audit: HIGH (axios CSRF, fastify DoS, sequelize SQLi) | Unresolved | High |
| Server logging disabled in production | Risk to observability | Medium |
| Stale PR #93 calendar feature | Awaiting decision | Low |
| Dual ORM (Sequelize + Prisma) | Tech debt | Low |

---

## 9. RECOMMENDED ACTIONS (ORDERED)

1. **[HIGH]** Update `axios` to `^1.9.0` and `fastify`/`@fastify/static` to latest patches
2. **[HIGH]** Audit `jws`/`jsonwebtoken` and update to fixed version
3. **[MEDIUM]** Migrate `tsconfig.server.json` from `moduleResolution: "node"` to `"bundler"` before TS 7.0
4. **[MEDIUM]** Replace `npm-run-all` with `npm-run-all2` in devDependencies (fixes critical shell-quote)
5. **[MEDIUM]** Restore production server logging — remove or flag `logger: false` in `server.ts`
6. **[LOW]** Close or merge PR #93 (99 days stale)
7. **[LOW]** Complete Prisma migration, retire Sequelize v6

---

*Generated by LOT Systems Automated Health Check · 2026-11-04 12:07 UTC*
