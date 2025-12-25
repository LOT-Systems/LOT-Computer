#!/bin/bash
#
# Restore Memory Answer Events from Backup
#
# This script restores deleted Memory answer events from a backup database
# to the production database using psql.

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting Memory Answer Restoration${NC}\n"

# Backup database credentials
BACKUP_HOST="db-postgresql-nyc3-92053-dec-24-backup-do-user-22640384-0.l.db.ondigitalocean.com"
BACKUP_PORT="25060"
BACKUP_USER="doadmin"
BACKUP_PASS="AVNS_8V6Hqzuxwj0JkMxgNvR"
BACKUP_DB="defaultdb"

# Production database credentials
PROD_HOST="db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com"
PROD_PORT="25060"
PROD_USER="doadmin"
PROD_PASS="AVNS_8V6Hqzuxwj0JkMxgNvR"
PROD_DB="defaultdb"

# Calculate 4 days ago
FOUR_DAYS_AGO=$(date -u -d '4 days ago' '+%Y-%m-%d %H:%M:%S')

echo -e "${BLUE}📦 Analyzing backup database...${NC}"

# Query backup database for answer events from past 4 days
BACKUP_QUERY="
SELECT
  id, user_id, event, text,
  metadata::text as metadata,
  context::text as context,
  created_at, updated_at
FROM logs
WHERE event = 'answer'
  AND created_at >= '$FOUR_DAYS_AGO'::timestamp
ORDER BY created_at DESC;
"

# Get count from backup
BACKUP_COUNT=$(PGPASSWORD="$BACKUP_PASS" psql \
  -h "$BACKUP_HOST" \
  -p "$BACKUP_PORT" \
  -U "$BACKUP_USER" \
  -d "$BACKUP_DB" \
  -t -c "SELECT COUNT(*) FROM logs WHERE event = 'answer' AND created_at >= '$FOUR_DAYS_AGO'::timestamp;")

echo -e "   Found ${GREEN}$(echo $BACKUP_COUNT | tr -d ' ')${NC} answer events in backup\n"

echo -e "${BLUE}🗄️  Analyzing production database...${NC}"

# Get count from production
PROD_COUNT=$(PGPASSWORD="$PROD_PASS" psql \
  -h "$PROD_HOST" \
  -p "$PROD_PORT" \
  -U "$PROD_USER" \
  -d "$PROD_DB" \
  -t -c "SELECT COUNT(*) FROM logs WHERE event = 'answer';")

echo -e "   Found ${GREEN}$(echo $PROD_COUNT | tr -d ' ')${NC} answer events in production\n"

# Export backup data to temp file
echo -e "${BLUE}💾 Exporting missing answer events...${NC}"

TEMP_FILE="/tmp/backup_answers_$(date +%s).sql"

PGPASSWORD="$BACKUP_PASS" psql \
  -h "$BACKUP_HOST" \
  -p "$BACKUP_PORT" \
  -U "$BACKUP_USER" \
  -d "$BACKUP_DB" \
  -t -A -F"," -c "$BACKUP_QUERY" > "$TEMP_FILE.csv"

# Count lines in export
EXPORT_COUNT=$(wc -l < "$TEMP_FILE.csv")
echo -e "   Exported ${GREEN}$EXPORT_COUNT${NC} records\n"

if [ "$EXPORT_COUNT" -eq "0" ]; then
  echo -e "${GREEN}✅ No missing answer events found. Database is complete!${NC}"
  rm "$TEMP_FILE.csv"
  exit 0
fi

# Show sample
echo -e "${BLUE}📝 Sample of data to restore:${NC}"
head -3 "$TEMP_FILE.csv" | while IFS=',' read -r id user_id event text metadata context created updated; do
  # Parse question from metadata (basic extraction)
  question=$(echo "$metadata" | grep -oP '"question":"[^"]*"' | cut -d'"' -f4 | head -c 60)
  echo -e "   ID: $id"
  echo -e "   Q: $question..."
  echo -e "   Date: $created"
  echo ""
done

# Create restoration SQL
echo -e "${BLUE}🔄 Preparing restoration SQL...${NC}"

cat > "$TEMP_FILE" << 'EOSQL'
-- Restore Memory Answer Events
-- This will restore missing answer events without overwriting existing ones

CREATE TEMP TABLE backup_answers (
  id UUID,
  user_id UUID,
  event VARCHAR(50),
  text TEXT,
  metadata JSONB,
  context JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

EOSQL

# Add COPY command
echo "\COPY backup_answers FROM '$TEMP_FILE.csv' WITH (FORMAT CSV, DELIMITER ',');" >> "$TEMP_FILE"

# Add INSERT command
cat >> "$TEMP_FILE" << 'EOSQL'

-- Insert only records that don't already exist
INSERT INTO logs (id, user_id, event, text, metadata, context, created_at, updated_at)
SELECT id, user_id, event, text, metadata::jsonb, context::jsonb, created_at, updated_at
FROM backup_answers
WHERE id NOT IN (SELECT id FROM logs WHERE event = 'answer')
ON CONFLICT (id) DO NOTHING;

-- Show results
SELECT COUNT(*) as "Restored Records" FROM backup_answers
WHERE id NOT IN (SELECT id FROM logs WHERE event = 'answer');

DROP TABLE backup_answers;
EOSQL

echo -e "${YELLOW}⚠️  Ready to restore records to production database${NC}"
echo -e "   This will insert missing answer events without overwriting existing data.\n"
echo -e "${YELLOW}Press Enter to continue or Ctrl+C to cancel...${NC}"
read

# Execute restoration
echo -e "${BLUE}💾 Executing restoration...${NC}\n"

PGPASSWORD="$PROD_PASS" psql \
  -h "$PROD_HOST" \
  -p "$PROD_PORT" \
  -U "$PROD_USER" \
  -d "$PROD_DB" \
  -f "$TEMP_FILE"

# Verify
echo -e "\n${BLUE}🔍 Verifying restoration...${NC}"

NEW_PROD_COUNT=$(PGPASSWORD="$PROD_PASS" psql \
  -h "$PROD_HOST" \
  -p "$PROD_PORT" \
  -U "$PROD_USER" \
  -d "$PROD_DB" \
  -t -c "SELECT COUNT(*) FROM logs WHERE event = 'answer';")

echo -e "   Total answer events in production: ${GREEN}$(echo $NEW_PROD_COUNT | tr -d ' ')${NC}"
echo -e "   Previous count: ${BLUE}$(echo $PROD_COUNT | tr -d ' ')${NC}"
echo -e "   Difference: ${GREEN}+$(($(echo $NEW_PROD_COUNT | tr -d ' ') - $(echo $PROD_COUNT | tr -d ' ')))${NC}\n"

# Cleanup
rm "$TEMP_FILE" "$TEMP_FILE.csv"

echo -e "${GREEN}✨ Memory Answer restoration completed successfully!${NC}\n"
