# LOT Systems — Health Check Report
**Date:** 2026-09-21 12:11 UTC  
**Session:** Automated System Health Check  
**Branch:** `claude/inspiring-volta-0fyqd2`  
**Baseline commit:** `98971f2` (Merge PR #96 · quantum-engine-widgets)

---

## Summary

**No active incidents detected.** The repository is clean and the production deployment configuration is sound. Three code bugs were found and patched in this session. Six additional items (two security, four quality) are flagged for team review.

---

## 1. Active Incidents

**None.** All monitored components are structurally sound. The `/health` endpoint is correctly wired to DigitalOcean's health-check path (`/health`). The `/api/public/status` endpoint covers 8 component checks with a 2-minute cache.

---

## 2. Bugs Fixed This Session

### BUG-01 — `memoryEngineName` always reports "AI-Powered" (incorrect fallback)
**File:** `src/server/routes/public-api.ts` · line 1285  
**Severity:** Medium — public profile pages display wrong memory engine label  
**Root cause:** The `catch` branch of the engine check was set to `'AI-Powered'` instead of `'Standard'`, making failure indistinguishable from success.  
**Fix applied:** Changed catch-branch value to `'Standard'`.

### BUG-02 — Node.js version gate requires 18+ instead of 20+
**File:** `src/server/routes/public-api.ts` · line 92  
**Severity:** Low — misleading status message; `package.json` engines field already declares `>=20.x`  
**Fix applied:** Updated check from `majorVersion < 18` → `< 20` and message to `"requires 20+"`.

### BUG-03 — `app.yaml` passes literal placeholder strings as optional API key values
**File:** `app.yaml` · lines 93, 97  
**Severity:** Medium — DigitalOcean injects the string `PLACEHOLDER_GOOGLE_API_KEY_OPTIONAL` as the actual env-var value for `GOOGLE_API_KEY` and `MISTRAL_API_KEY`, causing silent auth failures on any request that reaches the Gemini or Mistral backends.  
**Fix applied:** Changed both values to the `${VAR}` secret-reference form so DigitalOcean resolves them from the app's environment variables panel (empty/unset if not configured).

---

## 3. Security Findings — Team Review Required

### SEC-01 — Unauthenticated diagnostic endpoints expose sensitive configuration
**Endpoints:** `GET /api/public/verify-api-keys`, `/verify-admin-config`, `/debug-memory-engine`, `/test-ai-engines`, `/test-anthropic-key`  
**Severity:** High — any unauthenticated caller can enumerate which AI providers are configured, preview partial API key characters (8+4 format), and discover admin email addresses. `/test-anthropic-key` makes a real paid Anthropic API call on each request — it can be used to drain API credits.  
**Recommendation:** Gate all five endpoints behind admin-session authentication, or remove them from production. For internal diagnostics, add an `Authorization` header check against a strong admin token or session cookie.

---

## 4. Performance / Architecture Notes

### PERF-01 — Status-page `findOne()` calls do full-table scans
**File:** `src/server/routes/public-api.ts` · lines 120, 162, 194  
`checkAuth()`, `checkUsers()`, and `checkSettings()` call `findOne()` with no `where` clause, resulting in `SELECT … LIMIT 1` full-table scans. For large tables this adds unnecessary load. Since the DB connection is already verified by `checkDatabase()`, these three checks only need to confirm model availability. Consider `Model.count({ limit: 1 })` or a narrowed `where` clause.

---

## 5. Code Quality Findings

| # | File | Line | Finding |
|---|------|------|---------|
| Q1 | `public-api.ts` | 82 | `checkWeatherAPI()` is misnamed — it checks React bundle existence and Node version, not a weather API. Should be renamed to `checkEngineStack()`. |
| Q2 | `public-api.ts` | 345 | `'degraded'` is declared as a return type for `performHealthChecks` but no code path produces it. Either implement partial-failure logic or remove it from the union type. |
| Q3 | `public-api.ts` | 190 | `checkSettings()` duplicates `checkSystems()` — both check `dist/client/js/app.js` and run `User.findOne()`. One check is redundant. |
| Q4 | `public-api.ts` | 1 | `machiavelliProfileVisits` starts at `1469` and resets on every server restart — the counter is not meaningful. Either persist it to the DB or remove the demo counter. |

---

## 6. Outdated Dependencies (Low Priority)

| Package | Current | Latest stable | Impact |
|---------|---------|---------------|--------|
| `axios` | `^0.27.2` | `1.x` | Security patches; v0.x unmaintained |
| `react-query` | `^3.39.3` | `5.x` (TanStack Query) | Major API changes; v3 is EOL |
| `tailwind-merge` | `^1.6.0` | `2.x` | Breaking API changes in v2 |
| `@types/node` | `^18.0.3` | `20.x` | Type gaps for Node 20 APIs |
| `prettier` | `^2.7.1` | `3.x` | Minor — formatting toolchain |
| `nodemon` | `^2.0.19` | `3.x` | Minor — dev-only |

---

## 7. Component Status Matrix

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication engine | ✅ OK | Session model + Resend key + manifest checked |
| Sync | ✅ OK | CategoryEntry model |
| Settings | ✅ OK | UserSettings model + app.js bundle |
| Admin | ✅ OK | User model + us.js bundle |
| Systems check | ✅ OK | node_modules + build output |
| Engine stack | ✅ OK | Weather API + React bundle + Node version *(now correctly 20+)* |
| Database stack | ✅ OK | PostgreSQL connectivity via Sequelize |
| Story AI stack | ✅ OK | OpenAI API key + UserMemory model |
| Memory Engine | ✅ OK | Memory model availability |
| app.yaml secrets | ✅ Fixed | Placeholder strings replaced with secret references |

---

## 8. Resolved Items This Session

| ID | Item | Action |
|----|------|--------|
| BUG-01 | `memoryEngineName` always 'AI-Powered' | Fixed |
| BUG-02 | Node version gate at 18 instead of 20 | Fixed |
| BUG-03 | Literal placeholder strings in `app.yaml` | Fixed |

---

## Deployment Notes

- **Platform:** DigitalOcean App Platform · region `nyc3` · `basic-xs` (1 node)
- **CI trigger:** Push to `master` → auto-deploy
- **Weekly forced rebuild:** Sundays 21:00 UTC via `weekly-rebuild.yml`
- **Health check path:** `GET /health` · initial delay 30s
- **DB:** Managed PostgreSQL · port 25060 · SSL required

---

*Report generated by automated health check routine · 2026-09-21 12:11 UTC*  
*Branch: `claude/inspiring-volta-0fyqd2`*
