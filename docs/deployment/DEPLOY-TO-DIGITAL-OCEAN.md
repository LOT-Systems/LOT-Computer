# Deploy LOT Systems to Digital Ocean

This guide explains how to deploy or update your LOT Systems app on Digital Ocean using the app spec.

## 📋 Prerequisites

- Digital Ocean account
- LOT Systems repository on GitHub: `vadikmarmeladov/lot-systems`
- PostgreSQL database running on Digital Ocean

## 🚀 Deployment Methods

### Method 1: Update Existing App via Dashboard (Recommended)

1. **Go to Digital Ocean Dashboard**
   - Navigate to: https://cloud.digitalocean.com/apps
   - Select your app: `lot-systems-dev`

2. **Update App Spec**
   - Click on **"Settings"** tab
   - Scroll down to **"App Spec"** section
   - Click **"Edit"** button

3. **Paste New App Spec**
   - Copy the contents of `digital-ocean-app-spec.yaml`
   - Paste into the editor
   - Click **"Save"**
   - Digital Ocean will automatically validate and redeploy

4. **Monitor Deployment**
   - Go to **"Activity"** tab
   - Watch the deployment progress
   - Should complete in 3-5 minutes

---

### Method 2: Deploy via `doctl` CLI

If you have the Digital Ocean CLI installed:

```bash
# Login to Digital Ocean
doctl auth init

# Get your app ID
doctl apps list

# Update the app with new spec
doctl apps update YOUR_APP_ID --spec digital-ocean-app-spec.yaml

# Monitor deployment
doctl apps logs YOUR_APP_ID --type BUILD --follow
```

---

### Method 3: Create New App from Spec

If starting fresh:

```bash
# Create new app from spec
doctl apps create --spec digital-ocean-app-spec.yaml

# Get app info
doctl apps list
```

---

## 🔧 Environment Variables Included

The app spec includes all required environment variables:

### **Application**
- `NODE_ENV` - Production mode
- `PORT` - HTTP port (8080)
- `APP_NAME` - LOT
- `APP_HOST` - Your app's public URL
- `APP_DESCRIPTION` - Service description
- `BUILD_DATE` - Deployment timestamp

### **Database (PostgreSQL)**
- `DATABASE_URL` - Full connection string
- `DB_HOST` - Database hostname
- `DB_PORT` - Database port (25060)
- `DB_NAME` - Database name (defaultdb)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_SSL` - SSL mode (true)

### **Security**
- `JWT_SECRET` - Session encryption key

### **Email Service (Resend)**
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - support@lot-systems.com
- `RESEND_FROM_NAME` - LOT

### **AI Services**
- `ANTHROPIC_API_KEY` - Claude API for Memory Engine
- `OPENAI_API_KEY` - OpenAI fallback

---

## ✅ What Happens After Deployment

1. **Build Process:**
   - Installs dependencies with yarn
   - Builds client (React) and server (Node.js)
   - Verifies build output

2. **Health Check:**
   - Digital Ocean pings `/health` endpoint
   - Waits 30 seconds before first check
   - Checks every 10 seconds
   - Marks as healthy after 1 success
   - Marks as unhealthy after 3 failures

3. **Live Deployment:**
   - App becomes accessible at public URL
   - Old version kept running until new version is healthy
   - Zero-downtime deployment

---

## 🔍 Verify Deployment

After deployment completes:

### **1. Check Status Page**
Visit: `https://your-app-url.ondigitalocean.app/status`

Should show:
```json
{
  "version": "0.0.2",
  "environment": "Production",
  "overall": "ok",
  "checks": [
    {"name": "Authentication engine", "status": "ok"},
    {"name": "Sync", "status": "ok"},
    {"name": "Settings", "status": "ok"},
    {"name": "Admin", "status": "ok"},
    {"name": "Systems check", "status": "ok"},
    {"name": "Engine stack check", "status": "ok"},
    {"name": "Database stack check", "status": "ok"},
    {"name": "Memory Engine check", "status": "ok"}
  ]
}
```

### **2. Check API Keys**
Visit: `https://your-app-url.ondigitalocean.app/verify-api-keys`

Should show masked API keys:
```json
{
  "keys": {
    "anthropic": {
      "configured": true,
      "preview": "sk-ant-a...hQAA"
    },
    "resend": {
      "configured": true,
      "preview": "re_83s23...1HA7u"
    },
    "openai": {
      "configured": true,
      "preview": "sk-proj-...nAIAA"
    }
  }
}
```

### **3. Test Login**
- Visit your app URL
- Try logging in with email verification
- Verify email is sent and code works

---

## 🐛 Troubleshooting

### **"Missing required environment variables"**
- Check that all DB_* variables are set in app spec
- Variables must be in `RUN_AND_BUILD_TIME` scope

### **"Cannot connect to database"**
- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD are correct
- Check that DB_SSL is set to "true"
- Ensure PostgreSQL database is running

### **"Build failed"**
- Check build logs in Activity tab
- Look for TypeScript errors or missing dependencies
- Verify yarn.lock is committed to repository

### **"Health check failed"**
- App might be crashing on startup
- Check runtime logs for errors
- Verify all required environment variables are set

---

## 📊 Current Deployment

- **Branch:** `claude/deploy-status-page-011CUs6NQRyEJRe6h8NDvobt`
- **Region:** NYC3
- **Instance:** Basic XXS
- **Node Version:** 20.x
- **Package Manager:** Yarn

---

## 🔄 Update API Keys

To update API keys after deployment:

1. Go to **Settings** → **Environment Variables**
2. Find the key (e.g., `ANTHROPIC_API_KEY`)
3. Click **Edit**
4. Paste new value
5. Click **Save**
6. App will automatically redeploy

**Note:** Digital Ocean encrypts SECRET type variables. They'll show as `EV[...]` in the UI but will be decrypted at runtime.

---

## 📝 Notes

- All SECRET type environment variables are encrypted by Digital Ocean
- App automatically redeploys when app spec or environment variables change
- Zero-downtime deployments keep old version running until new version is healthy
- Build logs and runtime logs available in Activity tab
- Health check endpoint must return 200 status code

---

## 🆘 Support

If you encounter issues:

1. Check Activity tab for deployment logs
2. Check Runtime logs for application errors
3. Visit `/status` endpoint to see system health checks
4. Verify all environment variables are set correctly
