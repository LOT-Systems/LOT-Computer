#!/bin/bash
# Apply updated app spec to Digital Ocean

echo "📋 Getting current app ID..."
APP_ID=$(doctl apps list --format ID,Spec.Name | grep "lot-systems" | awk '{print $1}')

if [ -z "$APP_ID" ]; then
    echo "❌ Could not find app ID for lot-systems"
    echo "Please run: doctl apps list"
    exit 1
fi

echo "✅ Found app ID: $APP_ID"
echo ""
echo "📤 Applying new app spec..."
doctl apps update "$APP_ID" --spec digital-ocean-app-spec.yaml

echo ""
echo "✅ App spec updated! Digital Ocean will now redeploy using the Dockerfile."
echo "Monitor at: https://cloud.digitalocean.com/apps/$APP_ID"
