# Deployment Configuration Snapshot
**Date:** February 5, 2025
**Environment:** Production
**Platform:** DigitalOcean App Platform

---

## 🚀 Current Deployment Configuration

### Application Details
```yaml
Name: lot-systems
Region: NYC3
Instance Size: basic-xxs
Instance Count: 1
Platform: DigitalOcean App Platform
```

### Repository Configuration
```yaml
Repository: vadikmarmeladov/lot-systems
Branch: claude/february-2025-updates-HZZTF
Auto Deploy: On push to branch
Build Method: Dockerfile
```

### Build Configuration
```dockerfile
# Using Dockerfile for build
Base Image: node:20-alpine
Build Command: yarn install && yarn build
Output Directory: dist/
Package Manager: yarn
```

### Runtime Configuration
```yaml
Start Command: node dist/server/index.js
HTTP Port: 8080
Health Check Path: /health
Health Check Initial Delay: 30 seconds
Health Check Period: 10 seconds
Health Check Timeout: 5 seconds
Success Threshold: 1
Failure Threshold: 3
```

---

## 🗄️ Database Configuration

### PostgreSQL Database
```yaml
Provider: DigitalOcean Managed PostgreSQL
Cluster Name: db-postgresql-nyc3-92053
Region: NYC3
Version: PostgreSQL 14+
Connection Pool: Enabled
SSL Mode: Required

# Connection Details
Host: db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com
Port: 25060
Database: defaultdb
User: doadmin
SSL: Required (sslmode=require)
```

### Connection String Format
```
postgresql://doadmin:[PASSWORD]@db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

### Database Schema
- Managed via Prisma ORM
- Schema file: `prisma/schema.prisma`
- Migrations: Automatic via Prisma Migrate
- Connection pooling: Enabled

---

## 🔐 Environment Variables

### Application Variables
```bash
NODE_ENV=production
PORT=8080
APP_NAME=LOT
APP_HOST=https://lot-systems.com
APP_DESCRIPTION="LOT is a subscription service that distributes digital and physical necessities..."
BUILD_DATE=${_self.CREATED_AT}  # Auto-populated by DigitalOcean
```

### Database Variables
```bash
# Full connection string
DATABASE_URL=postgresql://doadmin:[PASSWORD]@[HOST]:25060/defaultdb?sslmode=require

# Individual components
DB_HOST=db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=[SECRET]
DB_SSL=true
```

### Authentication
```bash
JWT_SECRET=[SECRET]  # 32-character hex string
```

### Email Service (Resend)
```bash
RESEND_API_KEY=[SECRET]  # Format: re_*
RESEND_FROM_EMAIL=support@lot-systems.com
RESEND_FROM_NAME=LOT
```

### AI Service Providers

#### Primary: Together AI
```bash
TOGETHER_API_KEY=[SECRET]  # Format: tgp_v1_*
# Used for: Memory Engine primary provider
# Model: Llama or Mistral models
# Endpoint: api.together.xyz
```

#### Secondary: Anthropic Claude
```bash
ANTHROPIC_API_KEY=[SECRET]  # Format: sk-ant-api03-*
# Used for: Memory Engine fallback
# Model: claude-3-sonnet, claude-3-haiku
# Endpoint: api.anthropic.com
```

#### Tertiary: OpenAI
```bash
OPENAI_API_KEY=[SECRET]  # Format: sk-proj-*
# Used for: Memory Engine fallback
# Model: gpt-3.5-turbo, gpt-4
# Endpoint: api.openai.com
```

#### Optional: Google Gemini
```bash
GOOGLE_API_KEY=[OPTIONAL]
# Status: Not actively used
```

#### Optional: Mistral AI
```bash
MISTRAL_API_KEY=[OPTIONAL]
# Status: Not actively used
```

### Variable Scopes
- **RUN_TIME:** Available only during runtime
- **BUILD_TIME:** Available only during build
- **RUN_AND_BUILD_TIME:** Available during both build and runtime

### Variable Types
- **Plain:** Visible in logs and UI
- **SECRET:** Encrypted by DigitalOcean, shown as EV[...]

---

## 🌐 Domain Configuration

### Primary Domain
```
Domain: lot-systems.com
SSL: Automatic (Let's Encrypt)
HTTPS: Enforced
DNS Provider: DigitalOcean or external
```

### Endpoints
```
Production URL: https://lot-systems.com
Health Check: https://lot-systems.com/health
Status Page: https://lot-systems.com/status
API Keys Verify: https://lot-systems.com/verify-api-keys
Admin Panel: https://lot-systems.com/admin
```

---

## 📦 Build Process

### Build Steps
1. **Clone repository** from GitHub
2. **Checkout branch:** `claude/february-2025-updates-HZZTF`
3. **Load Dockerfile** from repository root
4. **Build Docker image**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package.json yarn.lock ./
   RUN yarn install --frozen-lockfile
   COPY . .
   RUN yarn build
   ```
5. **Run Prisma migrations**
   ```bash
   yarn prisma generate
   yarn prisma migrate deploy
   ```
6. **Verify build artifacts** in `dist/` directory

### Build Caching
- Docker layer caching: Enabled
- Node modules cache: Enabled
- Build time: ~3-5 minutes

---

## 🔍 Health Checks

### HTTP Health Check
```yaml
Path: /health
Method: GET
Expected Status: 200
Initial Delay: 30 seconds
Check Interval: 10 seconds
Timeout: 5 seconds
Success Threshold: 1 failure before marking healthy
Failure Threshold: 3 failures before marking unhealthy
```

### Health Check Response
```json
{
  "status": "ok",
  "timestamp": "2025-02-05T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Status Page
Additional detailed status available at `/status`:
```json
{
  "version": "0.0.3",
  "environment": "Production",
  "overall": "ok",
  "checks": [
    {"name": "Authentication engine", "status": "ok"},
    {"name": "Sync", "status": "ok"},
    {"name": "Settings", "status": "ok"},
    {"name": "Admin", "status": "ok"},
    {"name": "Systems check", "status": "ok"},
    {"name": "Engine stack check", "status": "ok"},
    {"name": "Database stack check", "status": "ok"},
    {"name": "Memory Engine check", "status": "ok"}
  ]
}
```

---

## 🔄 Deployment Workflow

### Automatic Deployments
1. **Trigger:** Push to `claude/february-2025-updates-HZZTF` branch
2. **Build:** DigitalOcean builds new Docker image
3. **Deploy:** Zero-downtime rolling deployment
4. **Health Check:** New instance must pass health checks
5. **Traffic Switch:** Old instance remains until new is healthy
6. **Cleanup:** Old instance terminated after successful switch

### Manual Deployments
- Via DigitalOcean Dashboard → Deploy button
- Via `doctl` CLI: `doctl apps create-deployment <app-id>`
- Via API: POST to /v2/apps/{app_id}/deployments

### Rollback Procedure
1. Navigate to DigitalOcean Dashboard → Activity
2. Select previous successful deployment
3. Click "Rollback to this deployment"
4. Confirm rollback
5. Monitor health checks

---

## 📊 Monitoring & Logging

### Application Logs
- **Location:** DigitalOcean Dashboard → Runtime Logs
- **Retention:** 7 days
- **Access:** Via dashboard or `doctl apps logs`

### Metrics
- **CPU Usage:** Monitored
- **Memory Usage:** Monitored
- **HTTP Response Time:** Tracked
- **Error Rate:** Tracked

### Alerts
```yaml
# Can be configured in app spec:
alerts:
  - rule: DEPLOYMENT_FAILED
  - rule: DOMAIN_FAILED
  - rule: HIGH_CPU_USAGE
  - rule: HIGH_MEMORY_USAGE
```

---

## 💰 Resource Limits

### Basic XXS Instance
```yaml
CPU: Shared vCPU
Memory: 512 MB
Disk: Ephemeral (container filesystem)
Bandwidth: Unlimited
Concurrent Connections: Based on memory
```

### Scaling Considerations
- Current instance suitable for <1000 concurrent users
- Can scale to Basic S or Pro for more resources
- Horizontal scaling available (multiple instances)

---

## 🔒 Security Configuration

### SSL/TLS
- **Certificate:** Automatic via Let's Encrypt
- **Renewal:** Automatic
- **Protocols:** TLS 1.2+
- **HTTPS:** Enforced

### Network Security
- **Firewall:** Managed by DigitalOcean
- **DDoS Protection:** Included
- **IP Whitelisting:** Not configured

### Database Security
- **SSL:** Required for all connections
- **Authentication:** Password-based
- **Encryption:** At rest and in transit
- **Backups:** Daily automatic backups

### Environment Variables
- **Secrets:** Encrypted in DigitalOcean
- **Access Control:** Limited to app runtime
- **Rotation:** Manual (recommended quarterly)

---

## 🔧 Maintenance Procedures

### Update Application Code
1. Push changes to branch
2. Automatic deployment triggered
3. Monitor deployment in Activity tab
4. Verify via health check and status page

### Update Environment Variables
1. Navigate to Settings → Environment Variables
2. Edit/Add variable
3. Click Save
4. App automatically redeploys

### Update Dependencies
1. Update `package.json` or `yarn.lock`
2. Commit and push
3. Rebuild triggers automatically

### Database Maintenance
```bash
# Backup
yarn db:backup

# Migrations
yarn prisma migrate deploy

# Reset (DANGEROUS - only in development)
yarn prisma migrate reset
```

---

## 📝 Configuration File Locations

### In Repository
```
/prisma/schema.prisma           # Database schema
/Dockerfile                     # Container configuration
/.env.example                   # Environment template
/config/app.yaml.example        # App spec template
/package.json                   # Dependencies
/yarn.lock                      # Dependency lock
/tsconfig.json                  # TypeScript config
```

### In DigitalOcean (Not in Repo)
```
Environment Variables           # Actual secrets
App Spec                        # Current deployment config
Database Connection String      # Full credentials
SSL Certificates               # Auto-managed
```

---

## 🚨 Emergency Procedures

### Application Down
1. Check DigitalOcean Status Page
2. Review Runtime Logs for errors
3. Check Database connectivity
4. Verify environment variables
5. Rollback to last known good deployment

### Database Connection Issues
1. Verify DATABASE_URL is correct
2. Check database cluster status
3. Verify SSL requirements
4. Check connection pool limits
5. Restart application if needed

### High Memory/CPU Usage
1. Check Runtime Logs for memory leaks
2. Review recent deployments
3. Consider scaling to larger instance
4. Optimize database queries
5. Enable connection pooling

---

## 📚 Related Documentation

- `docs/deployment/DEPLOY-TO-DIGITAL-OCEAN.md` - Deployment guide
- `docs/deployment/DEPLOYMENT-READY.md` - Deployment checklist
- `docs/backup/COMPREHENSIVE-BACKUP-2025-02-05.md` - Backup procedures
- `docs/PRODUCTION-CHECKLIST.md` - Production requirements

---

## ✅ Configuration Verified

- [x] Application deployed and running
- [x] Database connected
- [x] Health checks passing
- [x] SSL/HTTPS working
- [x] Environment variables configured
- [x] AI services operational
- [x] Email service working
- [x] Domain configured

---

**Document Created:** February 5, 2025
**Last Verified:** February 5, 2025
**Next Review:** Monthly or after major changes
**Maintained By:** DevOps Team / Claude AI Assistant
