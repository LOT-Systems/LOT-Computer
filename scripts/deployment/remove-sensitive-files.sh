#!/bin/bash

# Script to remove sensitive files from git history
# WARNING: This will rewrite git history. Only run if you understand the implications.
# After running, you'll need to force push: git push --force-with-lease

set -e

echo "⚠️  WARNING: This script will remove sensitive files from git history"
echo "⚠️  This rewrites git history and requires a force push"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Files to remove from git history
SENSITIVE_FILES=(
    "LOT_2025_key_git"
    "LOT_2025_key_git.pub"
    ".pgpass"
    "app.yaml"
    "spec.yaml"
    "digital-ocean-app-spec.yaml"
)

echo ""
echo "Removing sensitive files from git history..."
echo ""

for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" > /dev/null 2>&1; then
        echo "Removing $file from git history..."
        git filter-branch --force --index-filter \
            "git rm --cached --ignore-unmatch '$file'" \
            --prune-empty --tag-name-filter cat -- --all
    else
        echo "File $file not tracked in git, skipping..."
    fi
done

echo ""
echo "✅ Sensitive files removed from git history"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Review the changes: git log --all --full-history -- <file>"
echo "2. Force push to remote: git push --force-with-lease"
echo "3. Inform all collaborators to re-clone the repository"
echo "4. ROTATE ALL EXPOSED CREDENTIALS:"
echo "   - Database password"
echo "   - JWT_SECRET"
echo "   - All API keys (Resend, Anthropic, OpenAI, Together, Google, Mistral)"
echo "   - SSH keys (generate new ones)"
echo ""
echo "⚠️  Note: If this repo was public, assume all credentials are compromised"
echo "   and rotate them immediately, even if you remove them from git."
