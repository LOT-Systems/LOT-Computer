# LOT Systems — Health Check Report
**Date:** 2026-09-23 12:13 UTC  
**Routine:** System health check · `trig_01QGKrtpwyBBdfpg9o6Xeq4d`  
**Repo:** [LOT-Systems/LOT-Computer](https://github.com/LOT-Systems/LOT-Computer) · v1.3.0  
**Head commit:** `98971f2` (master) — Merge PR #96

---

## 🔴 Active Incidents

### CI-001 — Weekly Rebuild Failing: DigitalOcean Token Expired
**Severity:** CRITICAL  
**Service:** GitHub Actions → DigitalOcean App Platform  
**Workflow:** [Weekly Rebuild & Self-Assembly Sync — Run #17](https://github.com/LOT-Systems/LOT-Computer/actions/runs/35543446652)  
**Triggered:** 2026-09-20 23:02 UTC  

**Root cause:** `DIGITALOCEAN_ACCESS_TOKEN` secret is invalid — DO returned HTTP 401.

```
Validating token... ✘
Error: Unable to authenticate you
GET https://cloud.digitalocean.com/v1/oauth/token/info: 401
```

The `Install doctl` step authenticates immediately after download; all downstream steps (Get App ID, Trigger rebuild, Verify deployment) were skipped. **Production has not had a scheduled weekly rebuild since 2026-09-13.**

**Action required:**
1. Regenerate a DigitalOcean personal access token (or API token scoped to App Platform).
2. Update the `DIGITALOCEAN_ACCESS_TOKEN` secret in GitHub repo Settings → Secrets → Actions.
3. Re-run the workflow manually (`workflow_dispatch`) to confirm recovery.

**Pattern note:** Runs #11, #12 (Aug 9 & 16) also failed with the same authentication failure. Runs #13–#16 (Aug 23 – Sep 13) succeeded — the token was refreshed then but has now expired again. Consider using a long-lived token or adding a token-expiry alert.

---

## 🟡 Open Pull Requests

### PR #93 — Calendar: Time Tracking + Due-Event Toast (STALE, 57 days)
**Severity:** MEDIUM  
**PR:** [feat(calendar): time tracking + military-grade due-event toast](https://github.com/LOT-Systems/LOT-Computer/pull/93)  
**Branch:** `claude/dreamy-babbage-4iv1xo` → master  
**Opened:** 2026-07-28  **Last activity:** 2026-08-05  

This PR has been open for 57 days with no merge or close. It was opened the same day as PRs #91 and #92 which were both merged immediately; #93 was left behind. It needs a review decision: merge, close, or rebase onto latest master and re-evaluate.

---

## 🟡 Errors & Warnings

### DEP-001 — Dependency Version Drift (Multiple Packages)
**Severity:** MEDIUM  
**Service:** npm dependency tree

Several packages are significantly behind current stable releases. For a top-tier designer site, these represent security exposure, missing performance improvements, and API surface debt.

| Package | Current pinned | Recommended | Notes |
|---|---|---|---|
| `axios` | `^0.27.2` | `^1.7.x` | v0.x is EOL; v1 has security fixes and a rewritten adapter layer |
| `react-query` | `^3.39.3` | TanStack Query `^5.x` | v3 is unmaintained; v5 is a full rewrite with much better TS types |
| `react` / `react-dom` | `^18.2.0` | `^19.x` | React 19 is stable; brings Server Components, `use()`, and compiler optimisations |
| `@anthropic-ai/sdk` | `^0.32.1` | `^0.43.x` | 11 minor versions behind; streaming and tool-use APIs have changed |
| `prettier` | `^2.7.1` | `^3.x` | v3 drops CJS default, faster, cleaner output |
| `nodemon` | `^2.0.19` | `^3.x` | v3 drops Node <14 cruft |
| `tailwindcss` | `^3.1.6` | `^4.x` | Tailwind v4 ships a new engine with 10× faster build and CSS-first config |
| `@types/react-dom` | `^19.2.2` | — | **Mismatch**: types pinned at v19 but `react-dom` itself pinned at v18. This likely causes type errors. Fix by either upgrading `react`/`react-dom` to v19 or pinning `@types/react-dom` to `^18.x`. |

**Note:** The `@types/react-dom` / `react-dom` version mismatch (#last row) is an active type-safety gap that can mask runtime bugs during development.

### DEP-002 — `.pgpass` Committed to Repository
**Severity:** HIGH (Security)  
**File:** `.pgpass` in repository root (tracked in git, visible on GitHub)  

A `.pgpass` file contains database credentials in plaintext format. Even if the credentials are for a dev environment or are already rotated, having this file committed is a security posture violation. It should be added to `.gitignore` and removed from git history.

```bash
git rm --cached .pgpass && echo ".pgpass" >> .gitignore
```

### DEP-003 — `.DS_Store` Files Committed
**Severity:** LOW  
Two macOS `.DS_Store` files are tracked in the repo (`.DS_Store` and `.!79925!.DS_Store`). These should be removed and added to `.gitignore`.

---

## 🟡 Performance Anomalies

### PERF-001 — `About.tsx` God Component (4,889 lines)
**Severity:** MEDIUM  
**File:** `src/client/components/About.tsx`  

At 4,889 lines, `About.tsx` is the largest single file in the project and a top-tier architectural concern. For a LOT Systems-calibre product this is a significant maintainability and performance risk:

- React reconciliation for a monolithic component this large is expensive.
- Code-splitting is impossible at the component level.
- Any hot-module replacement during development reprocesses the full 4,889-line module.

**Recommendation:** Break `About.tsx` into domain sections (e.g. `AboutHero`, `AboutMetrics`, `AboutTimeline`, `AboutTeam`) each under ~200 lines, and lazy-load with `React.lazy` + `Suspense`.

### PERF-002 — `System.tsx` at 1,071 lines
**Severity:** LOW  
`System.tsx` is the primary quantum engine observer component. At 1,071 lines it is approaching the same risk profile. The July 2026 memoisation work (PR #95) was a positive step; splitting the subscriber widgets further would continue that trajectory.

---

## ✅ Resolved Since Last Check

| Item | Status | Date |
|---|---|---|
| Weekly rebuild runs #13–#16 | All succeeded (Aug 23 – Sep 13) | Recovered after previous token rotation |
| PR #95 — `perf: memoize heavy per-render work` | Merged | 2026-07-28 |
| PR #96 — Quantum engine widgets | Merged | 2026-08-05 |
| Benchmark Tag Lattice CI | Green on both PR #95 and #96 merges | 2026-07-28, 2026-08-05 |
| Merge conflict in `System.tsx` (circadian/astrology import clash) | Resolved in commit `73edd95` | 2026-08-05 |

---

## 📊 CI Run Summary (Last 10 Runs)

| Run # | Date | Result | Notes |
|---|---|---|---|
| 17 | 2026-09-20 | 🔴 FAIL | DO token 401 — **active** |
| 16 | 2026-09-13 | ✅ PASS | |
| 15 | 2026-09-06 | ✅ PASS | |
| 14 | 2026-08-30 | ✅ PASS | |
| 13 | 2026-08-23 | ✅ PASS | |
| 12 | 2026-08-16 | 🔴 FAIL | DO token 401 |
| 11 | 2026-08-09 | 🔴 FAIL | DO token 401 |
| 10 | 2026-08-02 | ✅ PASS | |
| Benchmark | 2026-08-05 | ✅ PASS | Push to master |
| Benchmark | 2026-07-28 | ✅ PASS | Push to master |

**Failure pattern:** Token expires roughly every 4–5 weeks. Consider switching to a DO API token with a 1-year expiry and adding a calendar reminder, or automating a token-refresh job.

---

## Summary

| Severity | Count | Items |
|---|---|---|
| 🔴 Critical | 1 | Weekly rebuild failing (DO token expired) |
| 🟡 Medium | 3 | Stale PR #93 · axios/react-query/React dependency drift · About.tsx size |
| 🟡 High | 1 | `.pgpass` committed to repo |
| 🟢 Low | 2 | `.DS_Store` files · System.tsx size |
| ✅ Resolved | 5 | See above |

**Immediate actions (in priority order):**
1. Rotate DigitalOcean API token and update `DIGITALOCEAN_ACCESS_TOKEN` secret → re-run weekly rebuild.
2. Remove `.pgpass` from git tracking and add to `.gitignore`.
3. Decision on PR #93 (merge or close).
4. Upgrade `@types/react-dom` to match `react-dom` v18, or upgrade both to React 19.
