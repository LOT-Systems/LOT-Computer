#!/bin/bash

# Script to remove backup and working files from the repository
# These files should not be committed to git

set -e

BACKUP_FILES=(
    "package.json.backup"
    "package.json.working"
    "package.json.working-backup"
    "postcss.config.js.working-backup"
    "yarn 2.lock"
)

echo "This script will remove the following backup/working files:"
for file in "${BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
    fi
done

echo ""
read -p "Remove these files? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Removing backup files..."

for file in "${BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Removing $file..."
        rm "$file"
        # Also remove from git if tracked
        if git ls-files --error-unmatch "$file" > /dev/null 2>&1; then
            git rm --cached "$file" 2>/dev/null || true
            echo "  Removed from git tracking"
        fi
    else
        echo "File $file not found, skipping..."
    fi
done

echo ""
echo "✅ Backup files removed"
echo ""
echo "Note: These files are now in .gitignore and won't be committed in the future."
