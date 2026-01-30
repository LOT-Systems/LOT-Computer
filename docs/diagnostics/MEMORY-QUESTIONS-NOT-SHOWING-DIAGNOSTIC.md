# Memory Questions Not Showing - Quick Diagnostic

**Issue**: Site loads but no Memory questions appear
**Date**: January 26, 2026

---

## Possible Causes

### 1. Deployment Lag
- Code pushed but Digital Ocean still deploying
- PWA cache updated but server code not yet live
- **Wait**: 3-5 minutes for deployment to complete

### 2. Intelligent Pacing Blocking Questions
- Quota reached for today
- Check: Visit `/api/memory/diagnostics` to see pacing status

### 3. Missing Usership Tag
- Memory questions only show for users with 'usership' tag
- Check: `/api/me` should show tags including "usership"

### 4. Client-Side Display Issue
- Questions generated but widget not showing
- Check browser console for errors

---

## Quick Diagnostic Steps

### Step 1: Check Deployment Status
Visit: https://cloud.digitalocean.com/apps
- Should show "Live" with recent deployment timestamp
- Build logs should show successful completion

### Step 2: Check Memory Diagnostics
Visit: `https://lot-systems.com/api/memory/diagnostics`

Should show:
```json
{
  "userId": "...",
  "hasUsership": true,
  "shouldShowPrompt": true,
  "promptsShownToday": X,
  "promptQuotaToday": 10-15
}
```

### Step 3: Check Your Tags
Visit: `https://lot-systems.com/api/me`

Should include:
```json
{
  "tags": ["usership", "admin", ...]
}
```

### Step 4: Check Browser Console
Open DevTools → Console

Look for:
```
📊 MemoryWidget state: { loadedQuestion: {...}, error: null }
✅ Memory question received: { questionId: "...", ... }
```

Or errors:
```
❌ Memory question generation failed
⏸️ Memory cooldown: already answered
```

---

## Temporary Fix: Force Show Questions

If you need questions to show immediately for testing, I can temporarily disable intelligent pacing:

**Option A**: Increase daily quota to 100 (ensures questions always show)
**Option B**: Bypass cooldown checks temporarily
**Option C**: Force generate question via `/api/memory/diagnostics?force=true`

---

## Most Likely Issue

Based on timing, the most likely issue is:

**Deployment still in progress** - The service worker cache was updated (PWA loads) but the server code with Memory Engine fixes is still building/deploying.

**Solution**: Wait 2-3 more minutes, then hard refresh (Ctrl+Shift+R)

---

## Next Steps

1. **Wait 3 minutes** for deployment to complete
2. **Hard refresh** PWA (Ctrl+Shift+R)
3. **Check** `/api/memory/diagnostics`
4. **Report** what you see

If still no questions after deployment completes, check:
- Are you logged in?
- Do you have Usership tag?
- What does `/api/memory/diagnostics` show?
- Any console errors?
