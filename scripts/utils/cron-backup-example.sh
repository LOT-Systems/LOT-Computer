#!/bin/bash
#
# Example cron job for daily database backups
#
# To set up automatic daily backups at 2 AM:
# 1. Run: crontab -e
# 2. Add this line:
#    0 2 * * * /path/to/lot-systems/cron-backup-example.sh >> /path/to/lot-systems/logs/backup.log 2>&1
#
# To test manually:
#   bash cron-backup-example.sh

# Change to project directory
cd "$(dirname "$0")"

# Load NVM if needed (for tsx/node)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Run backup
echo "========================================="
echo "Starting backup at $(date)"
echo "========================================="

npm run db:backup -- --keep 30

echo "========================================="
echo "Backup completed at $(date)"
echo "========================================="
echo ""
