# LOT Systems - Backup System Documentation

This directory contains comprehensive backup documentation and procedures for the LOT Systems application.

---

## 📁 Contents

### Main Documentation
- **[COMPREHENSIVE-BACKUP-2025-02-05.md](COMPREHENSIVE-BACKUP-2025-02-05.md)** - Complete backup manifest and recovery procedures
- **[DEPLOYMENT-CONFIG-SNAPSHOT-2025-02-05.md](DEPLOYMENT-CONFIG-SNAPSHOT-2025-02-05.md)** - Current deployment configuration snapshot

---

## 🚀 Quick Start

### Create a Full Backup

```bash
# Automated full backup (recommended)
./scripts/create-full-backup.sh

# Database only backup
yarn db:backup

# List existing backups
yarn db:backup -- --list
```

### Restore from Backup

See [COMPREHENSIVE-BACKUP-2025-02-05.md](COMPREHENSIVE-BACKUP-2025-02-05.md) for detailed recovery procedures.

---

## 📋 What Gets Backed Up

### Automatically (via Git)
- ✅ All application source code
- ✅ Database schema (Prisma)
- ✅ Configuration templates
- ✅ Documentation
- ✅ Scripts and utilities
- ✅ Dependencies (package.json, yarn.lock)

### Manually (Not in Git)
- ⚠️ Database dumps (use backup scripts)
- ⚠️ Environment variables with secrets (.env file)
- ⚠️ API keys and credentials
- ⚠️ SSL certificates (auto-managed by DigitalOcean)

---

## 🔧 Backup Scripts

### Full System Backup
**Location:** `scripts/create-full-backup.sh`

Creates a comprehensive backup including:
- Git repository state
- Package dependencies
- Configuration templates
- System state documentation
- Database dump (if credentials available)
- Compressed archive

**Usage:**
```bash
./scripts/create-full-backup.sh
```

**Output:**
- Directory: `backups/full-backup-YYYYMMDD_HHMMSS/`
- Archive: `backups/lot-systems-full-backup-YYYYMMDD_HHMMSS.tar.gz`

### Database Backup
**Location:** `scripts/db-backup.ts`

Creates daily database backups with automatic cleanup.

**Usage:**
```bash
# Create backup with default 30-day retention
yarn db:backup

# Create backup with custom retention
yarn db:backup -- --keep 7

# List all backups
yarn db:backup -- --list
```

**Output:**
- Location: `backups/lot-systems-db-YYYY-MM-DDTHH-MM-SS.sql.gz`
- Format: Compressed SQL dump
- Retention: Configurable (default 30 days)

### Automated Backups (Cron)
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * cd /path/to/lot-systems && ./scripts/create-full-backup.sh >> logs/backup.log 2>&1

# Or just database backup
0 2 * * * cd /path/to/lot-systems && yarn db:backup >> logs/db-backup.log 2>&1
```

---

## 💾 Backup Storage Locations

### Local Backups
```
/backups/                           # Local backup directory
  ├── lot-systems-db-*.sql.gz      # Database backups
  ├── full-backup-*/               # Full system backups
  └── lot-systems-full-backup-*.tar.gz  # Compressed archives
```

### Remote Backups (Recommended)
- **DigitalOcean Spaces:** Object storage for database dumps
- **GitHub:** Code and configuration templates
- **Secure Storage:** API keys and credentials (password manager)

---

## 🔄 Recovery Procedures

### Quick Recovery (Code Only)
```bash
git clone https://github.com/vadikmarmeladov/lot-systems.git
cd lot-systems
git checkout claude/february-2025-updates-HZZTF
yarn install
yarn build
```

### Full Recovery (Code + Database)
```bash
# 1. Restore code
git clone https://github.com/vadikmarmeladov/lot-systems.git
cd lot-systems
git checkout claude/february-2025-updates-HZZTF
yarn install

# 2. Configure environment
cp .env.example .env
# Edit .env with actual credentials

# 3. Restore database
gunzip backups/lot-systems-db-*.sql.gz
psql -h [HOST] -p 25060 -U doadmin -d defaultdb -f backups/lot-systems-db-*.sql

# 4. Run migrations
yarn prisma migrate deploy
yarn prisma generate

# 5. Build and start
yarn build
yarn start
```

For detailed recovery procedures, see [COMPREHENSIVE-BACKUP-2025-02-05.md](COMPREHENSIVE-BACKUP-2025-02-05.md#-backup-recovery-procedures).

---

## ✅ Backup Verification

### After Creating Backup
- [ ] Backup file created successfully
- [ ] Backup size is reasonable (not empty)
- [ ] Backup is compressed
- [ ] Backup manifest is included
- [ ] Git commit hash is recorded

### Periodic Verification (Monthly)
- [ ] Test database restore to staging environment
- [ ] Verify all critical files are tracked in git
- [ ] Check backup script execution
- [ ] Review backup retention policy
- [ ] Update documentation if needed

---

## 🔐 Security Considerations

### What to NEVER Commit to Git
- ❌ `.env` file with actual secrets
- ❌ API keys and credentials
- ❌ Database passwords
- ❌ JWT secrets
- ❌ SSH private keys
- ❌ SSL certificates
- ❌ `digital-ocean-app-spec.yaml` with credentials

### What IS Safe to Commit
- ✅ `.env.example` (templates only)
- ✅ `config/app.yaml.example` (templates)
- ✅ Database schema (no data)
- ✅ Application code
- ✅ Documentation
- ✅ Scripts (without hardcoded secrets)

### Secure Backup Storage
- Store database dumps in encrypted storage
- Use password manager for API keys
- Enable 2FA on all service accounts
- Regularly rotate credentials
- Limit access to production backups

---

## 📅 Backup Schedule

### Recommended Schedule
- **Hourly:** Git commits (automatic via development)
- **Daily:** Database backups (automated via cron)
- **Weekly:** Full system backup
- **Monthly:** Backup verification and testing
- **Before Major Changes:** Manual full backup

### Retention Policy
- **Daily Backups:** Keep 30 days
- **Weekly Backups:** Keep 12 weeks
- **Monthly Backups:** Keep 12 months
- **Major Release Backups:** Keep indefinitely

---

## 🆘 Emergency Procedures

### Application Data Loss
1. Stop application immediately
2. Assess extent of data loss
3. Locate most recent backup
4. Follow full recovery procedure
5. Verify data integrity
6. Resume operations

### Database Corruption
1. Do NOT delete corrupted database
2. Take snapshot of current state
3. Restore from most recent backup
4. Run integrity checks
5. Compare with corrupted database
6. Recover any missing recent data if possible

### Configuration Loss
1. Check Git history for configuration files
2. Review `docs/backup/DEPLOYMENT-CONFIG-SNAPSHOT-*.md`
3. Restore from templates
4. Update with current credentials
5. Verify all services
6. Redeploy

---

## 📞 Support & Documentation

### Related Documentation
- [DEPLOY-TO-DIGITAL-OCEAN.md](../deployment/DEPLOY-TO-DIGITAL-OCEAN.md)
- [DEPLOYMENT-READY.md](../deployment/DEPLOYMENT-READY.md)
- [PRODUCTION-BACKUP-SUMMARY.md](../deployment/PRODUCTION-BACKUP-SUMMARY.md)
- [PRODUCTION-CHECKLIST.md](../PRODUCTION-CHECKLIST.md)

### Service Providers
- **DigitalOcean:** https://cloud.digitalocean.com/
- **GitHub:** https://github.com/vadikmarmeladov/lot-systems
- **Resend:** https://resend.com/

---

## 📝 Maintenance

### Document Updates
This backup documentation should be updated:
- After major infrastructure changes
- After changing deployment configuration
- After adding new external services
- Quarterly for routine verification

### Version History
- **2025-02-05 v1.0:** Initial comprehensive backup system created
  - Added full backup script
  - Added comprehensive backup documentation
  - Added deployment configuration snapshot
  - Added this README

---

**Last Updated:** February 5, 2025
**Maintained By:** DevOps Team / Claude AI Assistant
**Status:** ✅ Active and Maintained
