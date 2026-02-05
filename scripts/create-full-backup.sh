#!/bin/bash
###############################################################################
# LOT Systems - Full System Backup Script
#
# Creates a comprehensive backup including:
# - Database dump
# - Application state documentation
# - Configuration snapshot
# - Git repository state
#
# Usage: ./scripts/create-full-backup.sh
###############################################################################

set -e  # Exit on error

echo "================================"
echo "LOT Systems - Full System Backup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/full-backup-${BACKUP_TIMESTAMP}"

echo -e "${BLUE}Creating backup directory...${NC}"
mkdir -p "${BACKUP_DIR}"

# 1. Git repository state
echo ""
echo -e "${BLUE}[1/5] Capturing Git repository state...${NC}"
git status > "${BACKUP_DIR}/git-status.txt"
git log -10 --oneline > "${BACKUP_DIR}/git-recent-commits.txt"
git branch -a > "${BACKUP_DIR}/git-branches.txt"
git remote -v > "${BACKUP_DIR}/git-remotes.txt"
echo "Current branch: $(git branch --show-current)" > "${BACKUP_DIR}/git-current-branch.txt"
echo "Latest commit: $(git rev-parse HEAD)" >> "${BACKUP_DIR}/git-current-branch.txt"
echo -e "${GREEN}✓ Git state captured${NC}"

# 2. Package dependencies
echo ""
echo -e "${BLUE}[2/5] Backing up dependency information...${NC}"
cp package.json "${BACKUP_DIR}/package.json"
cp yarn.lock "${BACKUP_DIR}/yarn.lock"
echo -e "${GREEN}✓ Dependencies backed up${NC}"

# 3. Configuration files (templates only, no secrets)
echo ""
echo -e "${BLUE}[3/5] Backing up configuration templates...${NC}"
cp .env.example "${BACKUP_DIR}/.env.example" 2>/dev/null || echo "No .env.example found"
cp prisma/schema.prisma "${BACKUP_DIR}/schema.prisma" 2>/dev/null || echo "No schema.prisma found"
cp Dockerfile "${BACKUP_DIR}/Dockerfile" 2>/dev/null || echo "No Dockerfile found"
cp tsconfig.json "${BACKUP_DIR}/tsconfig.json" 2>/dev/null || echo "No tsconfig.json found"

# Copy app spec template if it exists
if [ -f "config/app.yaml.example" ]; then
    cp config/app.yaml.example "${BACKUP_DIR}/app.yaml.example"
fi

echo -e "${GREEN}✓ Configuration templates backed up${NC}"

# 4. System state documentation
echo ""
echo -e "${BLUE}[4/5] Documenting system state...${NC}"

cat > "${BACKUP_DIR}/system-state.txt" << EOF
LOT Systems - System State Snapshot
====================================
Backup Date: ${BACKUP_DATE}
Backup Time: $(date +%H:%M:%S)
Hostname: $(hostname)
Working Directory: $(pwd)

Git Information:
- Branch: $(git branch --show-current)
- Commit: $(git rev-parse HEAD)
- Status: $(git status --short | wc -l) modified file(s)

Node.js Version: $(node --version 2>/dev/null || echo "Not found")
Yarn Version: $(yarn --version 2>/dev/null || echo "Not found")

Database:
- Provider: PostgreSQL
- Connection: Via DATABASE_URL environment variable

Deployment:
- Platform: DigitalOcean App Platform
- Region: NYC3
- Instance: Basic XXS

Application:
- Name: LOT Systems
- Version: $(grep '"version"' package.json | head -1 | cut -d'"' -f4)
- Port: 8080

External Services:
- Email: Resend (support@lot-systems.com)
- AI Providers: Together AI, Anthropic, OpenAI
- Domain: lot-systems.com
EOF

echo -e "${GREEN}✓ System state documented${NC}"

# 5. Database backup (if pg_dump is available and env vars are set)
echo ""
echo -e "${BLUE}[5/5] Creating database backup...${NC}"

if command -v pg_dump &> /dev/null && [ -n "$DB_HOST" ]; then
    echo "Running database backup..."

    # Load environment variables
    source .env 2>/dev/null || true

    if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD="$DB_PASSWORD" pg_dump \
            -h "$DB_HOST" \
            -p "${DB_PORT:-25060}" \
            -U "$DB_USER" \
            -d "${DB_NAME:-defaultdb}" \
            -F p \
            -f "${BACKUP_DIR}/database-backup.sql" 2>/dev/null

        if [ -f "${BACKUP_DIR}/database-backup.sql" ]; then
            # Compress the backup
            gzip "${BACKUP_DIR}/database-backup.sql"
            DB_SIZE=$(du -h "${BACKUP_DIR}/database-backup.sql.gz" | cut -f1)
            echo -e "${GREEN}✓ Database backup created (${DB_SIZE})${NC}"
        else
            echo -e "${YELLOW}⚠ Database backup failed (check credentials)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Database credentials not found in .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠ pg_dump not available or DB_HOST not set${NC}"
    echo "To enable database backups:"
    echo "  1. Install PostgreSQL client tools"
    echo "  2. Set DB_HOST, DB_USER, DB_PASSWORD in .env"
fi

# 6. Create backup manifest
echo ""
echo -e "${BLUE}Creating backup manifest...${NC}"

cat > "${BACKUP_DIR}/BACKUP-MANIFEST.md" << EOF
# LOT Systems Backup Manifest
**Date:** ${BACKUP_DATE}
**Time:** $(date +%H:%M:%S)
**Backup ID:** ${BACKUP_TIMESTAMP}

## Contents

### Repository State
- \`git-status.txt\` - Current git status
- \`git-recent-commits.txt\` - Last 10 commits
- \`git-branches.txt\` - All branches
- \`git-remotes.txt\` - Remote repositories
- \`git-current-branch.txt\` - Current branch and commit

### Dependencies
- \`package.json\` - Node.js package definition
- \`yarn.lock\` - Dependency lock file

### Configuration
- \`.env.example\` - Environment variables template
- \`schema.prisma\` - Database schema
- \`Dockerfile\` - Container configuration
- \`tsconfig.json\` - TypeScript configuration
- \`app.yaml.example\` - Deployment configuration template

### System State
- \`system-state.txt\` - Complete system snapshot

### Database
$(if [ -f "${BACKUP_DIR}/database-backup.sql.gz" ]; then
    echo "- \`database-backup.sql.gz\` - Full database dump"
else
    echo "- (Database backup not included)"
fi)

## Recovery Instructions

### 1. Restore Code
\`\`\`bash
git checkout $(git rev-parse HEAD)
yarn install
\`\`\`

### 2. Restore Configuration
\`\`\`bash
cp .env.example .env
# Edit .env with actual credentials
\`\`\`

### 3. Restore Database (if backup included)
\`\`\`bash
gunzip database-backup.sql.gz
psql -h [HOST] -p 25060 -U doadmin -d defaultdb -f database-backup.sql
\`\`\`

### 4. Build and Deploy
\`\`\`bash
yarn build
yarn start
\`\`\`

## Notes
- This backup does NOT include secrets (.env file, API keys)
- Store sensitive credentials separately in a secure location
- Database backup requires valid credentials
- See docs/backup/COMPREHENSIVE-BACKUP-2025-02-05.md for detailed recovery

## Verification
After restoration, verify:
- [ ] Application starts without errors
- [ ] Database connection works
- [ ] Health check passes (/health)
- [ ] Status page shows OK (/status)
- [ ] User authentication works

---
**Backup Script Version:** 1.0.0
**Repository:** https://github.com/vadikmarmeladov/lot-systems
EOF

echo -e "${GREEN}✓ Backup manifest created${NC}"

# 7. Create compressed archive
echo ""
echo -e "${BLUE}Creating compressed archive...${NC}"
tar -czf "backups/lot-systems-full-backup-${BACKUP_TIMESTAMP}.tar.gz" -C backups "full-backup-${BACKUP_TIMESTAMP}"
ARCHIVE_SIZE=$(du -h "backups/lot-systems-full-backup-${BACKUP_TIMESTAMP}.tar.gz" | cut -f1)
echo -e "${GREEN}✓ Archive created (${ARCHIVE_SIZE})${NC}"

# Summary
echo ""
echo "================================"
echo -e "${GREEN}Backup Complete!${NC}"
echo "================================"
echo ""
echo "Backup Location:"
echo "  Directory: ${BACKUP_DIR}"
echo "  Archive:   backups/lot-systems-full-backup-${BACKUP_TIMESTAMP}.tar.gz"
echo ""
echo "Contents:"
ls -lh "${BACKUP_DIR}" | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
echo "To extract archive:"
echo "  tar -xzf backups/lot-systems-full-backup-${BACKUP_TIMESTAMP}.tar.gz"
echo ""
echo "For recovery instructions, see:"
echo "  ${BACKUP_DIR}/BACKUP-MANIFEST.md"
echo ""
