<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Force Dockerfile Deployment - Digital Ocean

## Problem
Digital Ocean is still using **buildpack mode** despite `dockerfile_path: Dockerfile` being set in the app spec. This is because:
- Pushing code updates the codebase, NOT the app configuration
- The app spec needs to be explicitly re-applied

## Evidence
Error shows `/workspace/` (buildpack path) instead of `/app/` (Dockerfile WORKDIR):
```
Error: Cannot find module '/workspace/dist/server/server/index.js'
```

## Solution: Update the App Spec

### Option 1: Digital Ocean CLI (Recommended - Instant)

```bash
# Run the provided script
./APPLY-NEW-SPEC.sh
```

Or manually:
```bash
# 1. Get your app ID
doctl apps list

# 2. Apply the new spec (replace APP_ID with your actual ID)
doctl apps update YOUR_APP_ID --spec digital-ocean-app-spec.yaml

# 3. Monitor the deployment
doctl apps logs YOUR_APP_ID --follow
```

### Option 2: Digital Ocean Web UI

1. Go to https://cloud.digitalocean.com/apps
2. Click on **lot-systems** app
3. Click **Settings** tab
4. Scroll to **App Spec**
5. Click **Edit**
6. Replace the entire spec with contents of `digital-ocean-app-spec.yaml`
7. Click **Save**
8. Digital Ocean will automatically trigger a new deployment

### Option 3: Force Rebuild via UI (Quick Test)

1. Go to your app in Digital Ocean dashboard
2. Click **Actions** → **Force Rebuild and Deploy**
3. This MIGHT pick up the new spec if it's synced from GitHub

## What Should Happen After Update

### ✅ Build Phase
```
🔨 Building application...
✅ Build completed
📦 Server entry point verified (XXXXX bytes)
```

### ✅ Runtime Phase
```
🗄️ Running migrations...
✅ Migrations completed
🚀 Starting server...
Server is running on port 8080
```

### ✅ Key Differences
- Working directory: `/app/` (not `/workspace/`)
- Dockerfile commands visible in logs
- No MODULE_NOT_FOUND error

## Verification After Success

Visit: https://lot-systems.com/api/ping/

Should show:
- ✅ Memory Engine Phase 1 Complete
- All 9 modules verified
- Test question generation working

## Current App Spec Status

File: `digital-ocean-app-spec.yaml`
- ✅ `dockerfile_path: Dockerfile` is set
- ✅ `environment_slug: node-js` is removed (was conflicting)
- ✅ All environment variables configured
- ✅ Health checks configured

**The spec is correct in the repo, but Digital Ocean hasn't picked it up yet.**
