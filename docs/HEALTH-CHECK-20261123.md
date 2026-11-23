# LOT SYSTEMS — HEALTH CHECK REPORT
## Date: 2026-11-23 · Automated Session · v1.3.0

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — HEALTH CHECK                         ║
║  Automated Monitoring Run · 2026-11-23                          ║
║  Branch: claude/inspiring-volta-pt68x6                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. ACTIVE INCIDENTS

**None.** No open GitHub issues. All tracked services show no active outage signals.

---

## 2. ERRORS & WARNINGS

### 🔴 TypeScript Config Deprecations (Breaking in TS 7.0)

**File:** `tsconfig.json`

| Error | Detail |
|-------|--------|
| `TS5101` | `baseUrl` option is deprecated — will stop functioning in TypeScript 7.0 |
| `TS5107` | `moduleResolution: "Node"` is deprecated — will stop functioning in TypeScript 7.0 |
| `TS2688 ×11` | Cannot find type definitions for: `argparse`, `bluebird`, `debug`, `ejs`, `estree`, `ms`, `node`, `prop-types`, `react-dom`, `seedrandom`, `sequelize` |

**Recommended Fix:**
```json
// tsconfig.json — add to compilerOptions:
"ignoreDeprecations": "6.0",
"moduleResolution": "bundler"  // or "node16" if staying Node-native
```
Type packages missing from `node_modules` likely because they aren't installed or tsconfig `types` array lists packages not present. Run `npm install` to verify all `@types/*` entries resolve.

---

### 🟡 Code Quality TODOs (Unresolved Business Logic Gaps)

| File | Line | Issue |
|------|------|-------|
| `src/server/routes/api.ts` | 367 | `// TODO: check if user is allowed to use chat` — authorization guard missing |
| `src/server/routes/api.ts` | 1064 | `// TODO: add "permanent: true"` — session flag not applied |
| `src/shared/utils/fp.ts` | 149 | `@ts-ignore FIXME:` — suppressed type error |
| `src/client/stores/router.ts` | 38 | `@ts-ignore FIXME:` — suppressed type error |
| `src/server/utils/ai-engines.ts` | 227 | Deprecated AI model in fallback chain: `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` |

**Most critical:** Line 367 in `api.ts` — the missing authorization check is a potential access-control gap if the chat feature is behind a subscription wall.

---

### 🟡 Server Logger Disabled

**File:** `src/server/server.ts:35`

```ts
const fastify = Fastify({
  logger: false  // Temporarily disable logging for development
})
```

The comment says "Temporarily" but this is on the main branch (v1.3.0). If this is production code, structured logging is off — errors and request traces are silent. Recommend enabling with Pino config for production.

---

### 🟡 CSP `'unsafe-inline'` in script-src

**File:** `src/server/server.ts:58`

`script-src` includes `'unsafe-inline'` which weakens XSS protection. The CSP nonce (`enableCSPNonces: true`) is configured but `'unsafe-inline'` overrides nonces. Removing `'unsafe-inline'` and relying solely on nonces would tighten the policy.

---

## 3. PERFORMANCE ANOMALIES

### Large File Sizes (Potential Maintainability Bottleneck)

| File | Lines | Concern |
|------|-------|---------|
| `src/server/routes/api.ts` | 5,617 | Monolithic route file — complex to audit, test, or extend |
| `src/server/routes/public-api.ts` | 1,361 | Public profile endpoint contains full psychological profile computation inline |
| `src/client/components/System.tsx` | 1,071 | Main dashboard orchestrator — 60+ widget imports |

**No runtime performance data available** (server not running in this check environment). Widget performance is monitored client-side via `WidgetErrorBoundary` with 50ms mount threshold warnings — this is working as intended.

---

## 4. DEPENDENCY AUDIT — OUTDATED PACKAGES

| Package | Installed | Status | Notes |
|---------|-----------|--------|-------|
| `axios` | `^0.27.2` | 🔴 Major outdated | Current: `1.x`. v0.x is EOL. Security patches on 1.x only. |
| `react-query` | `^3.39.3` | 🔴 Major outdated | Rebranded to `@tanstack/react-query`. v5 is current. v3 unmaintained. |
| `@anthropic-ai/sdk` | `^0.32.1` | 🟡 Check update | Current SDK is in 0.3x–0.4x range; verify latest for new model support |
| `@google/generative-ai` | `^0.24.1` | 🟡 Package renamed | Google renamed to `@google/genai` — old package may stop receiving updates |
| `openai` | `^4.52.0` | 🟡 Check update | v5 may be available; v4 still maintained but newer streaming/tool APIs in v5 |
| `react` / `react-dom` | `^18.2.0` | 🟡 React 19 available | React 19 adds Actions, `use()`, compiler. Not a blocker; v18 is LTS. |
| `tailwind-merge` | `^1.6.0` | 🟡 Major outdated | Current: v2.x with breaking changes but improved conflict resolution |
| `tailwindcss` | `^3.1.6` | 🟡 Minor outdated | Current: 3.4.x. Tailwind v4 alpha also available. |

**Priority upgrades:** `axios` (security) and `react-query` (unmaintained) are the most urgent.

---

## 5. OPEN PULL REQUESTS

| PR | Title | Age | Status |
|----|-------|-----|--------|
| [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) | LOT-ASSEMBLY 2026-10-24 — LOT-WIKI-v88 · Badge Codex v32 · THE HERO'S JOURNEY | 30 days | Open, not merged |
| [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) | feat(calendar): time tracking + military-grade due-event toast | ~118 days | Open, not merged |

PR #93 has been open since July 28 — the longest-running unmerged branch. Recommend reviewing for merge readiness or closing if superseded.

---

## 6. RESOLVED / NOMINAL

| Item | Status |
|------|--------|
| GitHub Issues | ✓ Zero open issues |
| Security config | ✓ Centralized in `security-config.ts` with brute-force, rate-limit, session policies |
| Widget error isolation | ✓ `WidgetErrorBoundary` with perf tracking on all widgets |
| Lazy viewport mounting | ✓ `LazyMount` pattern in `System.tsx` preventing off-screen widget init |
| Auth routes | ✓ Rate-limited (10 req/min per IP) |
| AI endpoints | ✓ Rate-limited (10/min general, 5/min heavy) |
| Session security | ✓ 30-day cookie, 90-day absolute, 7-day idle timeout |
| CSP headers | ✓ Helmet configured with per-environment policies |
| Last deploy | ✓ 2026-11-17 (Badge Codex v33 — 6 days ago) |

---

## 7. COMPONENT QUALITY ASSESSMENT

The UI design system (`src/client/components/ui/`) is clean and consistent:

- **Block** — label/content layout with theme-aware hover, robust click delegation
- **Button / GhostButton** — polymorphic (renders `<button>` or `<a>` based on props), accessible, correctly sets `rel="noreferrer"` for `target="_blank"`
- **Layout** — avoids barrel import circular dependency (documented inline — good)
- **Page** — minimal, responsive spacing with mirror mode support
- **WidgetErrorBoundary** — class component (required for `componentDidCatch`), correctly isolates widget crashes with retry, tracks mount timing

**Recommendation for top-designer-level quality:** The `Block` component label column uses fixed pixel widths (`w-[150px] phone:w-[170px]`). Consider switching to CSS grid with `grid-template-columns: max-content 1fr` to prevent label overflow on very long label strings without media query coupling.

---

## SUMMARY

```
OVERALL HEALTH:  NOMINAL — No active incidents
PRIORITY ACTION: Upgrade axios (security) + fix tsconfig deprecations (TS 7.0 readiness)
OPEN PRs:        2 (oldest: 118 days — PR #93 needs attention)
NEXT CHECK:      2026-11-30
```

---

*Generated by Claude Code automated health check · 2026-11-23*
