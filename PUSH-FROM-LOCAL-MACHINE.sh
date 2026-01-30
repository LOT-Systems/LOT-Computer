#!/bin/bash
#
# Script to push unpushed commits from your local machine
#
# This script helps you push the 1241 commits that are currently
# stuck in the Docker environment due to proxy session ID validation.
#

set -e

echo "=== LOT Systems - Push Script ==="
echo ""
echo "This script will help you push 1241 unpushed commits from branch:"
echo "  claude/february-2025-updates-HZZTF"
echo ""
echo "Repository: https://github.com/vadikmarmeladov/lot-systems"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "ERROR: Not in a git repository. Please run this from your lot-systems directory."
    exit 1
fi

# Check if the branch exists
if ! git rev-parse --verify claude/february-2025-updates-HZZTF > /dev/null 2>&1; then
    echo "ERROR: Branch claude/february-2025-updates-HZZTF not found."
    echo ""
    echo "You may need to fetch it first:"
    echo "  git fetch origin claude/february-2025-updates-HZZTF"
    echo "  git checkout claude/february-2025-updates-HZZTF"
    exit 1
fi

# Checkout the branch
echo "Checking out branch..."
git checkout claude/february-2025-updates-HZZTF

# Check how many commits are ahead
COMMITS_AHEAD=$(git rev-list --count origin/claude/february-2025-updates-HZZTF..HEAD 2>/dev/null || echo "0")

echo ""
echo "Commits ahead of remote: $COMMITS_AHEAD"
echo ""

if [ "$COMMITS_AHEAD" -eq "0" ]; then
    echo "✓ No commits to push. You're already up to date!"
    exit 0
fi

# Show latest commit
echo "Latest local commit:"
git log -1 --oneline
echo ""

echo "Latest remote commit:"
git log -1 --oneline origin/claude/february-2025-updates-HZZTF
echo ""

# Ask for confirmation
read -p "Push $COMMITS_AHEAD commits to origin? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Push cancelled."
    exit 0
fi

# Push to remote
echo ""
echo "Pushing to remote..."
git push origin claude/february-2025-updates-HZZTF

echo ""
echo "✓ Successfully pushed $COMMITS_AHEAD commits!"
echo ""
echo "Next steps:"
echo "  1. Verify the push at: https://github.com/vadikmarmeladov/lot-systems/tree/claude/february-2025-updates-HZZTF"
echo "  2. Create a pull request if needed"
echo ""
