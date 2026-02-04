#!/bin/bash
# LOT-Computer Database Backup Script
# For Akamai Connected Cloud (Linode)

set -e

# Configuration
BACKUP_DIR="/opt/lot-computer-backups/db"
MAX_BACKUPS=30
DB_CONTAINER="lot-computer-db"
DB_USER="${DB_USER:-lot_user}"
DB_NAME="${DB_NAME:-lot_computer}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Database Backup ===${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Create backup
echo -e "${YELLOW}Creating database backup...${NC}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify backup
if [ -s "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}Backup created: $BACKUP_FILE ($SIZE)${NC}"
else
    echo -e "${RED}Backup failed or empty!${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up old backups (keeping $MAX_BACKUPS)...${NC}"
ls -t "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm

echo -e "${GREEN}=== Backup Complete ===${NC}"

# Optional: Upload to Linode Object Storage
if [ -n "$LINODE_STORAGE_ACCESS_KEY" ] && [ -n "$LINODE_STORAGE_SECRET_KEY" ]; then
    echo -e "${YELLOW}Uploading to Linode Object Storage...${NC}"
    # Requires s3cmd or aws cli configured for Linode
    # s3cmd put "$BACKUP_FILE" "s3://lot-computer-backups/db/"
    echo -e "${YELLOW}Object storage upload not configured${NC}"
fi
