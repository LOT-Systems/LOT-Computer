<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              LOT SYSTEMS — SYSTEM HEALTH CHECK REPORT                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ID       : HEALTH-CHECK-20261110                                            ║
║  DATE     : 2026-11-10 12:06 UTC                                             ║
║  CLASS    : AUTOMATED HEALTH MONITORING                                      ║
║  BRANCH   : claude/inspiring-volta-d22j0p                                   ║
║  APP VER  : v1.3.0                                                           ║
║  FM VER   : v113 (last sync 2026-08-05)                                      ║
║  LAST DEPLOY : 2026-08-05 (Badge Engine v32 / QIE v113)                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## OVERALL STATUS: ⚠️ ATTENTION REQUIRED

```
ACTIVE INCIDENTS   : 0 critical / 0 SEV-1
OPEN WARNINGS      : 3 (security hygiene, TypeScript deprecations, stale PRs)
PERFORMANCE        : No anomalies detected
RESOLVED           : N/A (no prior automated health check to diff)
```

---

## 1. ACTIVE INCIDENTS

```
STATUS: NO ACTIVE OUTAGES
```

No live error feeds or status pages are connected to this environment. No
server process or database is running in this sandbox. All checks below
are static analysis of the codebase and repository state.

---

## 2. ERRORS AND WARNINGS

### 2a. ⚠️ TypeScript Deprecation Warnings (tsconfig.json)

**Severity**: MEDIUM — Will break in TypeScript 7.0  
**Files**: `tsconfig.json`

TypeScript 5.9.3 flags two deprecated compiler options that will stop functioning
in TS 7.0:

| Option | Status | Fix |
|--------|--------|-----|
| `"baseUrl": "src"` | DEPRECATED (TS 6.0+) | Use `paths` only; set `"ignoreDeprecations": "6.0"` or migrate to bundler resolution |
| `"moduleResolution": "Node"` | DEPRECATED (TS 6.0+) | Migrate to `"moduleResolution": "Bundler"` or `"NodeNext"` |

**Current tsc output includes:**
```
tsconfig.json(12,5): error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
tsconfig.json(18,25): error TS5107: Option 'moduleResolution=node10' is deprecated.
```

**Recommended fix:**
```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "ignoreDeprecations": "6.0"
  }
}
```

---

### 2b. 🔴 Sensitive Files Still Tracked in Git

**Severity**: HIGH — Security hygiene (carry-over from Jan 2026 audit)  
**Files**: `.pgpass`, `app.yaml`

Both files are listed in `.gitignore` but are still tracked by git
(confirmed via `git ls-files`). This means:
- They appear in `git show HEAD:.pgpass` and `git show HEAD:app.yaml`
- Any developer who clones the repo receives a copy of these files
- The Jan 2026 security audit identified this and stated credentials rotation
  was required — status of that rotation is UNKNOWN

**Action required:**
```bash
git rm --cached .pgpass app.yaml
git commit -m "security: untrack sensitive credential files from git"
git push
# Then rotate ALL credentials that were ever in these files
```

The security doc (`docs/security/SECURITY-FIXES.md`) notes this was flagged
in January 2026. It has been 10 months without resolution.

---

### 2c. ⚠️ Two Long-Standing Open Pull Requests

**Severity**: MEDIUM — Merge queue health

| PR | Title | Age | Branch |
|----|-------|-----|--------|
| [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) | LOT-ASSEMBLY 2026-10-24 — LOT-WIKI-v88 · Badge Codex v32 | 17 days | `claude/fervent-knuth-xwjh4h` |
| [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) | feat(calendar): time tracking + military-grade due-event toast | 105 days | `claude/dreamy-babbage-4iv1xo` |

PR #93 is 105 days old and targets `master`. It may have significant merge
conflicts and its feature may be superseded by work since July. Needs
review/close decision.

PR #97 targets `main` (not `master`). The repo default branch appears to be
`master`. This may indicate an incorrect base branch on the PR.

---

## 3. PERFORMANCE ANOMALIES

```
STATUS: NO ANOMALIES DETECTED (static scan only)
```

**Memoization** — `src/client/components/System.tsx` received memoization
improvements in commit `9364aba` (perf: memoize last heavy per-render work
in System subscriber widgets). This was the last active performance work.

**Rate limiting** — Properly configured in `src/server/security-config.ts`:
- Global: 100 req/min per IP
- Auth: 10 req/min per IP
- AI: 10 req/min per IP
- AI Heavy: 5 req/min per IP

No observable runtime performance data available without a live server.

---

## 4. RESOLVED ITEMS

No prior automated health check baseline exists. First run.

---

## 5. COMPONENT QUALITY ASSESSMENT

### Application Stack

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Runtime | Node.js | (from Dockerfile) | ✅ |
| Framework | Fastify | ^5.6.1 | ✅ Modern |
| Frontend | React | ^18.2.0 | ⚠️ v19 available |
| Language | TypeScript | ^5.9.3 | ✅ Current |
| Bundler | Vite | ^7.1.9 | ✅ Current |
| CSS | Tailwind CSS | ^3.1.6 | ⚠️ v4.x available |
| AI SDK | @anthropic-ai/sdk | ^0.32.1 | ⚠️ Likely outdated |
| AI SDK | openai | ^4.52.0 | ⚠️ Likely outdated |
| ORM | Sequelize | ^6.29.0 | ⚠️ v7 available |
| Auth | jsonwebtoken | ^9.0.1 | ✅ |
| Validation | Zod | ^3.23.8 | ✅ |
| State | nanostores | ^0.9.0 | ✅ |
| Email | resend | ^6.1.3 | ✅ Current |

### Security Architecture

```
BRUTE FORCE PROTECTION    : ✅ — 5 attempts → 15 min lockout
RATE LIMITING             : ✅ — Global + per-route
SESSION MANAGEMENT        : ✅ — 30 day cookie, 90 day absolute, 7 day idle
EMAIL VERIFICATION        : ✅ — 6-digit OTP, 10 minute TTL
CSRF / CSP                : ✅ — fastify-helmet with nonces
INPUT VALIDATION          : ✅ — Zod schemas on all auth routes
VULNERABILITY SCAN BLOCK  : ✅ — /wp-admin, /.env, /phpinfo, etc. blocked
BACKUP ENCRYPTION         : ✅ — AES-256-CBC, PBKDF2 100k iterations
SENSITIVE FILE GITIGNORE  : ✅ — Patterns present
SENSITIVE FILES UNTRACKED : 🔴 — .pgpass and app.yaml still tracked
```

### Component Inventory

```
Client Components     : 64 widgets + UI primitives
Server Routes         : api, auth, admin-api, public-api, os-api
Database Models       : User, Session, Log, ChatMessage, DirectMessage,
                        EmailCode, LiveMessage, WeatherResponse, Answer
Scheduled Jobs        : Monthly email (1st of month, 09:00 UTC)
Badge Engine          : v32 · 812 badges · Hero's Journey Codex (latest)
QIE (Intent Engine)   : v113 · P149–P151 · 151 patterns · 51 archetypes · 48 jobs
Field Manual          : v113
```

### Design System Assessment

The LOT Systems design language is a coherent, custom system:

**Strengths:**
- CSS custom properties for theming (`--acc-color-*`, `--base-color`)
- Dark mode via `.class` strategy in Tailwind
- Consistent spacing scale (8px base, up to 512px)
- Semantic color tokens (acc, bac, time, blue, gold)
- WidgetErrorBoundary wrapping all widget components
- Font stack: Arial/Helvetica (system sans — fast, predictable)

**Upgrade opportunities for top-tier designer site:**

1. **CSS Variables completeness** — Only accent and base colors are tokens.
   Text, border, and surface colors are hardcoded in component classes. A
   full token set (`--color-surface-*`, `--color-text-*`, `--color-border-*`)
   would enable instant theme switching.

2. **React 18 → 19 migration** — React 19 ships concurrent features, improved
   Suspense, and the new `use()` hook. The codebase is a good candidate given
   the existing query structure.

3. **Tailwind v3 → v4** — v4 uses a pure CSS config (no `tailwind.config.js`),
   is significantly faster, and has better dark mode primitives.

4. **@anthropic-ai/sdk** — Should be pinned to latest to access Claude 3.5+ and
   claude-sonnet-4-6 model family.

5. **TypeScript path aliases** — Migrate from deprecated `baseUrl`+`paths` to
   pure `paths` with `"moduleResolution": "Bundler"` for Vite compatibility.

---

## 6. RECOMMENDATIONS BY PRIORITY

### P0 — Immediate (Security)
- [ ] `git rm --cached .pgpass app.yaml && git commit && push` — stop leaking credentials
- [ ] Confirm all credentials in those files were rotated (Jan 2026 action item)

### P1 — This Week
- [ ] Merge or close PR #93 (105 days old, calendar feature)
- [ ] Review PR #97 base branch — it targets `main`, not `master`
- [ ] Add `"ignoreDeprecations": "6.0"` to tsconfig.json (stops TS 7.0 breakage)

### P2 — Next Sprint
- [ ] Upgrade `@anthropic-ai/sdk` to latest (Claude 4/5 model support)
- [ ] Upgrade `openai` to latest
- [ ] Evaluate React 18 → 19 migration path

### P3 — Backlog
- [ ] Tailwind v3 → v4 migration
- [ ] Extend CSS token coverage (surface, text, border tokens)
- [ ] Clean up legacy badge PDF generator scripts (`scripts/generate_badge_pdf_v*.py`)

---

## 7. GITHUB REPOSITORY STATUS

```
Repo     : LOT-Systems/LOT-Computer
Default  : master
Branch   : claude/inspiring-volta-d22j0p (at HEAD = master)
Open PRs : 2 (#93, #97)
Open Issues : 0
CI Workflow : benchmark-tag-lattice (auto-tags BENCHMARK: commits on master push)
```

---

## 8. BADGE ENGINE STATUS

```
Current codex  : v32 — THE HERO'S JOURNEY
Total badges   : 812
Last update    : 2026-08-05 (LOT-SR-20260805-01)
Implementation : badges.ts (v20–v22 logic implemented; prior v19 gap resolved)
```

PR #97 on GitHub contains **LOT-WIKI-v88** documentation updates for Badge Codex v32,
but it has been unmerged for 17 days and its branch (`claude/fervent-knuth-xwjh4h`)
does not appear in the local clone. The badge engine implementation IS in master
(merged via PR #96 on 2026-08-05). PR #97 contains the wiki documentation only.

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  NEXT HEALTH CHECK: Scheduled — next automated run                          ║
║  REPORT AUTHOR    : Claude Code (Automated Health Monitor)                  ║
║  SESSION          : https://claude.ai/code/session_01B5eNPPM97Uk8SWYzRWSSB3 ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
