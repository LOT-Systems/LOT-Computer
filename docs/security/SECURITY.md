<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Systems Security Guide

## Overview

This document covers the security architecture, best practices, and operational procedures for LOT Systems.

---

## Authentication & Session Security

### How Authentication Works

1. User submits email → server generates a 6-digit code + 32-char token
2. Code is sent via email (Resend API)
3. User submits code + token → constant-time comparison
4. On success: 256-bit random session token created, stored in httpOnly cookie
5. Sessions expire after 30 days (configurable) with absolute max of 90 days

### Session Protection

- **Session tokens**: 32 bytes (256 bits) of `crypto.randomBytes` entropy
- **Cookie flags**: `httpOnly`, `secure` (production), `sameSite: lax`
- **Expiry enforcement**: Sessions checked on every request; expired sessions destroyed
- **Browser fingerprint**: Lightweight fingerprint stored to detect session hijacking
- **IP tracking**: Session creation IP logged for audit trail
- **Periodic pruning**: Expired sessions cleaned up every hour

### Brute-Force Protection

- Max 5 failed verification attempts per IP
- 15-minute lockout after threshold
- Credential stuffing detection: flags IPs trying 5+ different emails
- Rate limiting: 100 req/min global, stricter on auth routes

---

## Backup & Disaster Recovery

### Encrypted Backups to GitHub

```bash
# Setup (one-time)
export BACKUP_ENCRYPTION_KEY=$(openssl rand -hex 32)
export BACKUP_GITHUB_REPO=git@github.com:your-org/lot-backups.git

# Run backup
./scripts/backup-to-github.sh

# Database only
./scripts/backup-to-github.sh --db-only

# Verify latest backup
./scripts/backup-to-github.sh --verify

# Decrypt a backup
./scripts/backup-to-github.sh --decrypt /path/to/file.enc
```

### Backup Strategy

| What | How | Where | Frequency | Retention |
|------|-----|-------|-----------|-----------|
| Database | pg_dump → gzip → AES-256 encrypt | GitHub (private repo) | Daily 3 AM | 90 days |
| Database | pg_dump → gzip | Local `/backups/` | Daily 2 AM | 30 days |
| App state | tar → gzip → AES-256 encrypt | GitHub (private repo) | Daily 3 AM | 90 days |
| Code | git push | GitHub (main repo) | Every deploy | Forever |
| Config templates | In backup archive | GitHub (backup repo) | Daily | 90 days |

### Recovery Procedure

1. **Clone backup repo** and checkout `backup/automated` branch
2. **Decrypt database**: `./scripts/backup-to-github.sh --decrypt lot-db-DATE.sql.gz.enc`
3. **Decompress**: `gunzip lot-db-DATE.sql.gz`
4. **Restore**: `psql -h HOST -p PORT -U USER -d DB < lot-db-DATE.sql`
5. **Restore code**: `git checkout COMMIT_HASH && yarn install && yarn build`
6. **Set environment**: Copy `.env.example`, fill in credentials
7. **Run migrations**: `yarn migrations:up`
8. **Start**: `yarn start`

### IMPORTANT: Key Storage

The `BACKUP_ENCRYPTION_KEY` must be stored separately from the backup repo:
- Use a password manager (1Password, Bitwarden)
- Store a physical copy in a secure location
- **NEVER** commit the key to any repository

---

## Environment Variables Security

### Required Secrets

| Variable | Purpose | Rotation |
|----------|---------|----------|
| `JWT_SECRET` | Session signing | Every 6 months |
| `DB_PASSWORD` | Database access | Every 3 months |
| `RESEND_API_KEY` | Email delivery | If compromised |
| `TOGETHER_API_KEY` | AI provider | If compromised |
| `ANTHROPIC_API_KEY` | AI provider | If compromised |
| `OPENAI_API_KEY` | AI provider | If compromised |
| `BACKUP_ENCRYPTION_KEY` | Backup encryption | If compromised |

### Key Rotation Procedure

1. Generate new secret: `openssl rand -hex 32`
2. Update in DigitalOcean App Platform environment
3. Deploy new version
4. Old sessions using previous JWT_SECRET will naturally expire

### What Never Goes in Git

- `.env` files (use `.env.example` as template)
- API keys, passwords, secrets
- SSH private keys
- Database connection strings with credentials
- DigitalOcean app spec files (contain secrets)
- Backup encryption keys

---

## Network Security

### Headers (via Fastify Helmet + custom)

- `Content-Security-Policy`: Nonce-based script/style loading
- `X-Frame-Options: SAMEORIGIN`: Prevents clickjacking
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `X-DNS-Prefetch-Control: off`: Prevents DNS prefetch leaks
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: Camera, microphone, USB disabled
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Cache-Control: no-store` on all API responses

### Rate Limiting

- Global: 100 requests/minute per IP
- Auth routes: 10 requests/minute per IP
- Custom brute-force tracking on verification endpoints

### TLS/SSL

- Database connections: SSL required, CA certificate verified when available
- Application: HTTPS enforced in production via `upgrade-insecure-requests` CSP
- Cookies: `secure` flag in production

---

## Audit Logging

### Events Tracked

| Event | When |
|-------|------|
| `auth.login.success` | Successful authentication |
| `auth.login.failed` | Failed verification attempt |
| `auth.login.blocked` | IP blocked by brute-force protection |
| `auth.logout` | User logout |
| `auth.session.expired` | Expired session detected and destroyed |
| `admin.access` | Any request to admin API (granted or denied) |
| `security.rate_limited` | Rapid-fire request detection |
| `security.suspicious` | Vulnerability scans, credential stuffing |

### Log Format

Audit logs are written as structured JSON to stderr:
```json
{
  "_type": "audit",
  "timestamp": "2026-04-10T12:00:00Z",
  "event": "auth.login.success",
  "ip": "1.2.3.4",
  "userAgent": "Mozilla/5.0...",
  "userId": "uuid",
  "details": { "email": "user@example.com", "isNewUser": false }
}
```

In production, pipe stderr to your log aggregation service for monitoring and alerting.

---

## Vulnerability Scan Detection

Known vulnerability scan paths are detected and short-circuited:
- WordPress paths (`/wp-admin`, `/wp-login`, `/xmlrpc.php`)
- Config exposure (`/.env`, `/.git/config`)
- Debug endpoints (`/debug`, `/trace`, `/console`)
- Common frameworks (`/phpinfo`, `/phpmyadmin`, `/actuator`)

Requests to these paths return 404 immediately and generate an audit log entry.

---

## Data Protection

### Privacy Architecture

- All user data stored in LOT's database, NOT with AI providers
- AI providers are stateless - no persistent memory of user data
- User controls all public profile visibility settings
- Suspended users cannot post messages

### Data at Rest

- PostgreSQL database: Managed by DigitalOcean (encrypted at rest)
- Backups: AES-256-CBC encrypted before leaving the server
- Local backups: Stored in server filesystem (within DigitalOcean's encrypted infra)

### Data in Transit

- All external connections over TLS
- Database connections require SSL
- API responses: `no-store` Cache-Control prevents intermediary caching

---

## Operational Checklist

### Monthly

- [ ] Review audit logs for unusual patterns
- [ ] Verify backup integrity: `./scripts/backup-to-github.sh --verify`
- [ ] Check that all API keys are still valid
- [ ] Review user accounts for suspicious activity

### Quarterly

- [ ] Rotate database password
- [ ] Update dependencies: `yarn upgrade-interactive`
- [ ] Review and update CSP directives if new services added
- [ ] Test disaster recovery procedure

### On Incident

- [ ] Rotate ALL exposed credentials immediately
- [ ] Review audit logs for scope of compromise
- [ ] Check backup integrity
- [ ] Notify affected users if data was accessed
- [ ] Document incident and remediation
