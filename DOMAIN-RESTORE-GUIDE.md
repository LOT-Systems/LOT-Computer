# Domain Restore Guide - lot-systems.com

## Issue
DNS was configured and working this morning, but now the domain doesn't point to a server.

## Root Cause Analysis

**What likely happened:**
1. The `domains:` section I added to app.yaml (commit 171d3f5c) broke the deployment
2. Digital Ocean may have automatically **removed the domain configuration** when the deployment failed
3. Even after reverting the YAML, the domain configuration didn't automatically restore

## Solution: Manually Re-add Domain in Digital Ocean UI

### Step 1: Check Current Domain Configuration

1. Go to: https://cloud.digitalocean.com/apps
2. Find and click your **"lot-systems"** app
3. Click **Settings** → **Domains**
4. Check if `lot-systems.com` is listed

**If domain is missing:** Continue to Step 2
**If domain is present but not working:** Skip to Step 3

### Step 2: Add Custom Domain

1. In Settings → Domains, click **"Add Domain"**
2. Enter: `lot-systems.com`
3. Click **"Add Domain"**
4. Digital Ocean will validate and show you the required DNS records

### Step 3: Verify DNS Records

Digital Ocean will show you records like:

```
Type: CNAME
Name: lot-systems.com (or @)
Value: [your-app-name].ondigitalocean.app

Type: CNAME
Name: www
Value: lot-systems.com
```

### Step 4: Check DNS Propagation

Run these commands to verify DNS:

```bash
dig lot-systems.com +short
nslookup lot-systems.com
```

**Expected result:** Should point to `[your-app].ondigitalocean.app` or an IP address

**If DNS is wrong:** You need to update DNS records at your domain registrar (see Step 5)

### Step 5: Update DNS at Domain Registrar (if needed)

If your DNS records don't match what Digital Ocean expects:

1. Log into your domain registrar (Namecheap, GoDaddy, etc.)
2. Find DNS settings for `lot-systems.com`
3. Update/add the CNAME records shown in Digital Ocean
4. Save changes
5. Wait 5-30 minutes for propagation

### Step 6: Force New Deployment

After domain is configured, trigger a fresh deployment:

```bash
git commit --allow-empty -m "Trigger deployment after domain restore"
git push origin claude/february-2025-updates-HZZTF
```

### Step 7: Verify Deployment

1. Wait 3-5 minutes for deployment to complete
2. Check: https://lot-systems.com/health
   - Should return: `{"status":"ok"}`
3. Check: https://lot-systems.com
   - Should load the app

## Quick DNS Check Commands

Run these to diagnose DNS issues:

```bash
# Check current DNS
dig lot-systems.com +short

# Check DNS with trace
dig lot-systems.com +trace

# Check www subdomain
dig www.lot-systems.com +short

# Check SSL certificate
curl -I https://lot-systems.com
```

## Alternative: Use .ondigitalocean.app Temporarily

If you need the site working immediately while DNS is being fixed:

1. Visit: https://lot-systems-dev-9wfop.ondigitalocean.app
2. This should work regardless of custom domain issues

## Files Fixed

✅ **app.yaml** - Removed broken `domains:` section, restored Together.AI key
✅ **digital-ocean-app-spec.yaml** - Removed broken `domains:` section
✅ **Latest commit:** 1e58ae90 - "Fix Together.AI API key in app.yaml"

## Why YAML Domains Don't Work

The Digital Ocean App Platform YAML spec doesn't support inline `domains:` configuration the way other platforms do. Domains must be configured through:

1. The Digital Ocean UI (Settings → Domains)
2. The Digital Ocean API
3. The `doctl` CLI tool

## Next Steps

1. **Immediate:** Check Digital Ocean UI for domain configuration
2. **If missing:** Re-add domain in UI
3. **Verify:** DNS records at your registrar match DO requirements
4. **Wait:** 5-30 minutes for DNS propagation
5. **Test:** Visit https://lot-systems.com

## Support

If the domain still doesn't work after following these steps, check:
- Digital Ocean App Platform status page
- Your domain registrar's DNS management interface
- SSL certificate provisioning status in DO UI
