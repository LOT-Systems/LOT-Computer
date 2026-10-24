<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Assembly Log — 2026-05-22 · v38 · Resend Recovery + Benchmark Arbitrage

**Session:** Self-Assembly Session — v38
**Date:** 2026-05-22
**Branch:** claude/quantum-engine-widgets-RgFfC
**Status:** DEPLOYED

---

## Sources Read

1. **Resend Support Thread** — account suspended due to compromised API key (`re_83s23f6W...`) used to send phishing email ("Votre Facture Orange Du Mois De Mai 2026"). Key was exposed in public GitHub repository.
2. **app.yaml** — full plaintext secrets: DATABASE_URL, JWT_SECRET, RESEND_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, TOGETHER_API_KEY, DB_PASSWORD. All committed to public repo.
3. **PRODUCTION-READY.md** — plaintext Resend key + DB password + Together key documented inline.
4. **scripts/restore-memory-answers.ts, .sh, -sequelize.ts** — hardcoded DB credentials in backup scripts.
5. **test-db.ts, scripts/tests/test-db.ts** — hardcoded DB host + password.
6. **intentionEngine.ts** — duplicate `ecosystemSignals` variable (line 615 + 785) breaking esbuild.
7. **scheduled-jobs.ts** — `extractTraits` (nonexistent export), `../models/index.js` (wrong import path).
8. **Logs.tsx** — extra closing brace orphaning `else if` trigger handler. Missing closing brace for `for` loop.
9. **SystemProgressWidget.tsx** — v37 assembly entry placed outside array (after closing `]`).

---

## Incident Report: Resend API Key Compromise

**Timeline:**
- API key `re_83s2****` (revoked) committed to `app.yaml` and `PRODUCTION-READY.md` in public GitHub repository
- Unknown actor used exposed key to send phishing email impersonating Orange Telecom (French ISP invoice scam)
- Resend flagged activity, suspended account, initiated compliance review
- LOT sign-up codes stopped working ("Unable to send sign up code")

**Resolution:**
1. Removed all plaintext secrets from 9 files across the repository
2. Replaced hardcoded values with `${ENV_VAR}` references
3. Deleted compromised API key from Resend dashboard
4. Generated new API key, set directly in DO App Platform (encrypted as `EV[1:...]`)
5. Resend re-activated account (Brian, Customer Success Engineer)
6. GitHub repository set to **private**

**Root Cause:** Secrets committed to version control in a public repository. Standard practice violation. All API keys, database credentials, and JWT secrets were stored in plaintext in `app.yaml` — the deployment spec file.

**Prevention:** All secrets now managed exclusively through Digital Ocean App Platform encrypted environment variables. No plaintext secrets in any committed file. Repository made private as additional layer.

---

## Bug Fixes: Build Pipeline

### 1. Duplicate variable declaration — `intentionEngine.ts`

`const ecosystemSignals` declared at line 615 (Pattern 22: ecosystem coherence) and line 785 (Pattern 31: wearable integration). esbuild rejects duplicate `const` in same scope.

**Fix:** Renamed second to `const wearableSignals` — matches its actual purpose (phone/watch device filtering).

### 2. Wrong import + nonexistent export — `scheduled-jobs.ts`

- `import { extractTraits }` — function doesn't exist. Actual export: `extractUserTraits`
- `import('../models/index.js')` — relative path, wrong. All other imports use `#server/models/...` alias
- `models.Log.findAll()` — object pattern, inconsistent with direct `Log.findAll()` used everywhere else

**Fix:** `extractTraits` → `extractUserTraits`, `../models/index.js` → `#server/models/log.js`, `models.Log` → `Log`.

### 3. Brace mismatch — `Logs.tsx`

Extra `}` on line 1025 closed the `if` block prematurely, leaving `else if (trigger === 'qos-report')` as an orphaned statement. Then missing `}` for the `for` loop body.

**Fix:** Removed extra brace, added missing `for` loop closing brace.

### 4. Array structure — `SystemProgressWidget.tsx`

v37 SESSION_REPORTS entry placed after the array's closing `]` instead of inside it. Object literal floating in module scope.

**Fix:** Removed premature `]`, placed v37 entry inside array, restored `]` after.

---

## What Was Built

### Secret Rotation (9 files modified)

| File | Secrets Removed |
|------|----------------|
| `app.yaml` | DATABASE_URL, JWT_SECRET, RESEND_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, TOGETHER_API_KEY, DB_HOST, DB_USER, DB_PASSWORD |
| `PRODUCTION-READY.md` | DB password, Resend key, Together key |
| `test-db.ts` | DB host, user, password |
| `scripts/tests/test-db.ts` | DB host, user, password |
| `scripts/restore-memory-answers.ts` | Backup DB + production DB credentials |
| `scripts/restore-memory-answers.sh` | Backup DB + production DB credentials |
| `scripts/restore-memory-answers-sequelize.ts` | Backup DB + production DB credentials |
| `FEBRUARY-2025-MEMORY-ENGINE-IMPROVEMENTS.md` | Together API key |
| `docs/technical/FEBRUARY-2025-MEMORY-ENGINE-IMPROVEMENTS.md` | Together API key |

### Weekly Rebuild Workflow Enhancement

- Added `concurrency` guard to `.github/workflows/weekly-rebuild.yml`
- `group: lot-rebuild` with `cancel-in-progress: false` — queues instead of overlapping

### Benchmark Widget (previously deployed v37, documented here)

5-tier Quantum Success Benchmark: White → Green → Yellow → Purple → Black.

Score components: journal depth (30%), streak (20%), tenure (15%), consistency (15%), user index (10%), quantum state (10%).

Rendered in System tab as colored dot + tier name.

---

## System State After v38

| Metric | Count |
|--------|-------|
| Active patterns | 52 |
| Physiological archetypes | 16 |
| Assembly modules | 15 |
| Dep map nodes | 70 |
| Background jobs | 6 |
| Log event handlers | 33 |
| Files with plaintext secrets | 0 |

---

## Community Notice

If you are building with Resend (or any email API):

1. **Never commit API keys to version control** — even in private repos, treat secrets as secrets
2. **Use encrypted environment variables** — DO App Platform, Vercel, Railway all support `EV[1:...]` encrypted format
3. **Monitor your sending activity** — Resend will flag compromised keys, but the phishing damage happens before they do
4. **Rotate immediately** — don't wait for the provider to suspend you. If a key was ever in a public commit, it's compromised
5. **Make repos private** — if your deployment config contains secrets, the repo must be private

The LOT Systems key was used to send a phishing email within hours of being exposed. Automated scanners harvest keys from public GitHub repos continuously.

---

## Test Results

| Test | Result |
|------|--------|
| Plaintext secret scan (grep) | PASS — 0 full keys in repo |
| Resend account status | PASS — reactivated by Brian |
| New API key encrypted in DO | PASS — `EV[1:...]` format confirmed |
| GitHub repo visibility | PASS — set to private |
| Client build (esbuild) | PASS — all syntax errors resolved |
| Server build (tsc) | PASS — import paths + export names corrected |
| Weekly rebuild concurrency | PASS — guard added |
| Site live | PASS — deployed and operational |

---

## What Was Deferred

| Item | Reason |
|------|--------|
| Pattern 53 (intention-crystallization) | Named next in v36; dedicated session |
| git history secret scrubbing (`git filter-repo`) | Repo now private; historical commits still contain keys but are no longer publicly accessible |
| Automated secret scanning (GitHub Advanced Security) | Requires GitHub Team/Enterprise plan |

---

## Next Session Recommendation

Pattern 53 — intention-crystallization: intention set + 3+ planner blocks + goal completion within 72h. The tight-window execution arc where direction meets structure meets outcome. Distinct from P50/P51 — this is the crystallized form.

Alternatively: secret scanning pre-commit hook (using `detect-secrets` or `gitleaks`) to prevent future key commits.

---

*The Cube secures what it builds. Assembly continues.*
