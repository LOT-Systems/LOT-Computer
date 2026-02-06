# LOT Systems - Comprehensive Backup Documentation
**Date:** February 5, 2025
**Branch:** claude/february-2025-updates-HZZTF
**Backup Version:** 2025-02-05-v1

---

## 📋 Backup Overview

This document serves as a comprehensive backup manifest for the LOT Systems application, including all critical components, configurations, and recovery procedures.

## 🗂️ Repository Structure

### Application Code
```
/app                    # Application routing and pages
/src                    # Source code (React components, services, utilities)
/server                 # Backend server code
/public                 # Static assets
/scripts                # Utility scripts (backup, monitoring, admin)
/prisma                 # Database schema
/migrations             # SQL migration files
```

### Configuration Files
```
package.json            # Node.js dependencies
yarn.lock              # Dependency lock file
tsconfig.json          # TypeScript configuration
tailwind.config.js     # Tailwind CSS configuration
postcss.config.cjs     # PostCSS configuration
esbuild.config.js      # Build configuration
nodemon.json           # Development server config
Dockerfile             # Docker container configuration
Procfile               # Process configuration
```

### Documentation
```
/docs                  # All documentation
  /deployment          # Deployment guides
  /technical           # Technical specifications
  /security            # Security documentation
  /setup               # Setup guides
  /releases            # Release notes
  /backup              # Backup documentation (this file)
```

---

## 🔐 Critical Configuration Files

### Environment Variables Template
**File:** `.env.example`
- Contains all required environment variable templates
- **DO NOT** commit actual `.env` file with secrets

### Database Configuration
**File:** `prisma/schema.prisma`
- PostgreSQL schema definition
- Connection string: Uses `DATABASE_URL` environment variable

### Deployment Configuration
**Files:**
- `digital-ocean-app-spec.yaml` (gitignored - contains secrets)
- `config/app.yaml.example` (template version)
- `Dockerfile` (container configuration)

---

## 💾 Database Information

### Current Database Connection
```
Host: db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com
Port: 25060
Database: defaultdb
Region: NYC3
SSL: Required
```

### Database Backup Scripts
- **Script:** `scripts/db-backup.ts` - Automated backup script
- **Script:** `scripts/restore-memory-answers.ts` - Memory data restoration
- **Script:** `scripts/restore-memory-answers.sh` - Shell backup wrapper
- **Script:** `scripts/db-admin.ts` - Database administration utility

### Manual Database Backup Command
```bash
# Export full database backup
pg_dump -h db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com \
  -p 25060 \
  -U doadmin \
  -d defaultdb \
  --no-owner \
  --no-acl \
  -F c \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Or plain SQL format
pg_dump -h db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com \
  -p 25060 \
  -U doadmin \
  -d defaultdb \
  --no-owner \
  --no-acl \
  -f backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🚀 Deployment Configuration

### Current Deployment
- **Platform:** DigitalOcean App Platform
- **App Name:** lot-systems
- **Region:** NYC3
- **Instance Size:** Basic XXS
- **Branch:** claude/february-2025-updates-HZZTF
- **Repository:** vadikmarmeladov/lot-systems

### Build Configuration
```yaml
Build Command: yarn install && yarn build
Run Command: node dist/server/index.js
Port: 8080
Health Check: /health endpoint
```

### Required Environment Variables
```bash
# Application
NODE_ENV=production
PORT=8080
APP_NAME=LOT
APP_HOST=https://lot-systems.com

# Database
DATABASE_URL=postgresql://[credentials]
DB_HOST=[host]
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=[password]
DB_SSL=true

# Authentication
JWT_SECRET=[secret]

# Email Service (Resend)
RESEND_API_KEY=[key]
RESEND_FROM_EMAIL=support@lot-systems.com
RESEND_FROM_NAME=LOT

# AI Providers
TOGETHER_API_KEY=[key]        # Primary
ANTHROPIC_API_KEY=[key]       # Secondary
OPENAI_API_KEY=[key]          # Tertiary
GOOGLE_API_KEY=[key]          # Optional
MISTRAL_API_KEY=[key]         # Optional
```

---

## 📦 Dependencies

### Production Dependencies
See `package.json` for complete list. Key dependencies:
- **Framework:** React 18, Express
- **Database:** Prisma, PostgreSQL
- **Authentication:** JWT, bcrypt
- **Email:** Resend
- **AI Services:** Anthropic SDK, OpenAI SDK, Together AI
- **Build Tools:** esbuild, TypeScript

### Development Dependencies
- TypeScript, ESLint, Prettier
- Nodemon for development
- Testing utilities

---

## 🔄 Backup Recovery Procedures

### Full Application Recovery

1. **Clone Repository**
   ```bash
   git clone https://github.com/vadikmarmeladov/lot-systems.git
   cd lot-systems
   git checkout claude/february-2025-updates-HZZTF
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with actual credentials
   ```

4. **Restore Database**
   ```bash
   # Using custom format dump
   pg_restore -h [host] -p 25060 -U doadmin -d defaultdb backup.dump

   # Or using SQL format
   psql -h [host] -p 25060 -U doadmin -d defaultdb -f backup.sql
   ```

5. **Run Migrations**
   ```bash
   yarn prisma migrate deploy
   yarn prisma generate
   ```

6. **Build Application**
   ```bash
   yarn build
   ```

7. **Start Application**
   ```bash
   yarn start
   ```

### Database-Only Recovery

1. **Create new PostgreSQL database on DigitalOcean**
2. **Restore from backup dump**
   ```bash
   pg_restore -h [new-host] -p 25060 -U doadmin -d defaultdb backup.dump
   ```
3. **Update DATABASE_URL in deployment config**
4. **Redeploy application**

### Configuration Recovery

All configuration templates are stored in:
- `.env.example` - Environment variables template
- `config/app.yaml.example` - DigitalOcean app spec template
- `prisma/schema.prisma` - Database schema

---

## 🔍 Verification Checklist

After recovery, verify:

- [ ] Application loads at root URL
- [ ] Health check passes: `/health`
- [ ] Status page shows all systems OK: `/status`
- [ ] API keys verified: `/verify-api-keys`
- [ ] Database connection working
- [ ] User authentication working
- [ ] Email sending working
- [ ] Memory Engine operational
- [ ] Profile system working
- [ ] Admin panel accessible

---

## 📊 Current System State

### Application Version
- **Version:** 0.0.3+
- **Last Stable:** v0.2.0 (see STABLE-VERSIONS.md)

### Key Features
- User authentication system
- Memory Engine (AI-powered context system)
- Profile system with badges
- Admin panel
- Email verification
- Progress tracking
- Intention system
- Dark mode support

### Database Tables
```
User
Profile
Session
MemoryAnswer
Intention
Badge
UserProgress
AdminTag
UserPreferences
```

### External Services
- **Database:** DigitalOcean PostgreSQL
- **Hosting:** DigitalOcean App Platform
- **Email:** Resend
- **AI Providers:** Together AI, Anthropic, OpenAI
- **Domain:** lot-systems.com

---

## 🚨 Critical Files Backup

### Must-Have Files for Recovery
1. `package.json` & `yarn.lock` - Dependencies
2. `prisma/schema.prisma` - Database schema
3. All files in `/src`, `/app`, `/server` - Application code
4. All files in `/migrations` - Database migrations
5. All files in `/public` - Static assets
6. `Dockerfile` - Container configuration
7. `.env.example` - Configuration template
8. All documentation in `/docs`

### Files NOT in Git (Must Backup Separately)
- `.env` - Actual environment variables (store securely)
- `digital-ocean-app-spec.yaml` - Deployment config with secrets
- Database dumps (store in DigitalOcean Spaces or S3)
- API keys and credentials (store in password manager)

---

## 🔐 Security Notes

### Sensitive Data NOT in Repository
- Database credentials
- API keys (Resend, Anthropic, OpenAI, Together, Google, Mistral)
- JWT secrets
- SSL certificates
- SSH keys

### Where Sensitive Data is Stored
- **Production:** DigitalOcean App Platform environment variables (encrypted)
- **Local Development:** `.env` file (gitignored)
- **Backup:** Secure password manager or encrypted storage

---

## 📞 Emergency Contacts

### Service Providers
- **DigitalOcean:** https://cloud.digitalocean.com/
- **GitHub:** https://github.com/vadikmarmeladov/lot-systems
- **Resend:** https://resend.com/
- **Anthropic:** https://console.anthropic.com/

### Important URLs
- **Production:** https://lot-systems.com
- **Status Page:** https://lot-systems.com/status
- **Health Check:** https://lot-systems.com/health
- **Admin Panel:** https://lot-systems.com/admin

---

## 📝 Backup Schedule Recommendations

### Automated Backups
- **Database:** Daily at 2 AM UTC
- **Code:** Automatic via Git commits
- **Configuration:** Manual before each deployment

### Manual Backups
- Before major deployments
- Before database migrations
- Before infrastructure changes
- Monthly full system snapshot

---

## 🔧 Backup Script Usage

### Create Database Backup
```bash
# Using TypeScript script
yarn ts-node scripts/db-backup.ts

# Using shell script
./scripts/restore-memory-answers.sh
```

### Automated Cron Job (Example)
```bash
# Daily backup at 2 AM
0 2 * * * cd /home/user/lot-systems && ./cron-backup-example.sh
```

---

## 📚 Additional Documentation

For detailed information, see:
- `docs/deployment/DEPLOY-TO-DIGITAL-OCEAN.md` - Deployment guide
- `docs/deployment/DEPLOYMENT-READY.md` - Deployment checklist
- `docs/deployment/PRODUCTION-BACKUP-SUMMARY.md` - Backup procedures
- `docs/PRODUCTION-CHECKLIST.md` - Production requirements
- `docs/CONFIGURATION.md` - Configuration details
- `README.md` - Project overview

---

## ✅ Backup Completion Checklist

- [x] All source code committed to Git
- [x] All documentation up to date
- [x] Database schema documented
- [x] Deployment configuration templated
- [x] Environment variables documented
- [x] Recovery procedures documented
- [x] Verification checklist created
- [x] External services documented
- [x] Security notes documented
- [x] Emergency contacts listed

---

**Backup Created By:** Claude AI Assistant
**Backup Date:** February 5, 2025
**Repository:** https://github.com/vadikmarmeladov/lot-systems
**Branch:** claude/february-2025-updates-HZZTF

**Status:** ✅ Complete and Ready for Commit
