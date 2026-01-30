#!/bin/bash
# Check Digital Ocean deployment status and logs

echo "📊 Checking deployment status..."
echo ""

# Get app ID
APP_ID=$(doctl apps list --format ID,Spec.Name | grep "lot-systems" | awk '{print $1}')

if [ -z "$APP_ID" ]; then
    echo "❌ Could not find app ID"
    echo "Please check manually at: https://cloud.digitalocean.com/apps"
    exit 1
fi

echo "App ID: $APP_ID"
echo ""

# Get deployment status
echo "=== DEPLOYMENT STATUS ==="
doctl apps get "$APP_ID" --format ID,Spec.Name,ActiveDeployment.Phase,UpdatedAt
echo ""

# Get recent logs
echo "=== RECENT LOGS (last 50 lines) ==="
doctl apps logs "$APP_ID" --tail 50 --type build
echo ""
echo "=== RUNTIME LOGS ==="
doctl apps logs "$APP_ID" --tail 50 --type run
echo ""

echo "To follow live logs, run:"
echo "  doctl apps logs $APP_ID --follow"
