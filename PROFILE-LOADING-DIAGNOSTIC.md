# Profile Page Loading Diagnostic

## Issue: Profile page won't load "internally"

This guide helps identify why `/u/{userId}` pages won't load when accessed from within the app.

## Step 1: Test Basic Routing

Visit these URLs directly in your browser (replace `your-domain.com` with actual domain):

### Test 1: Diagnostic Route
```
https://your-domain.com/u/test-route-works
```

**Expected:** Green page saying "✓ Route is working!"

**If you see this:** Server routing is working correctly ✅
**If you don't see this:** Server code hasn't been deployed or route registration failed ❌

### Test 2: Actual Profile Route (Direct)
```
https://your-domain.com/u/{actual-user-id}
```
Replace `{actual-user-id}` with a real user ID from your database.

**Expected:** Profile page loads with user information
**If blank page:** Check browser console for JavaScript errors
**If 404:** Route not registered correctly

### Test 3: API Endpoint (Data Layer)
```
https://your-domain.com/api/public/profile/{actual-user-id}
```

**Expected:** JSON response with user profile data including `psychologicalProfile` field
**If error:** API endpoint issue, check server logs

## Step 2: Check Browser Console

When the profile page is blank, open browser console (F12) and look for:

### JavaScript Errors
```
Uncaught TypeError: Cannot read property 'X' of undefined
Uncaught SyntaxError: Unexpected token
```
**Action:** Check which file/line is causing the error

### Network Errors
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
Failed to load resource: the server responded with a status of 404
```
**Action:** Check Network tab to see which resource failed

### Service Worker Messages
```
[PWA] Service worker registered: /
[SW] Service worker loaded, version: v2024-12-12-002
```
**Expected:** Should see service worker load with version `v2024-12-12-002`

### Profile Component Messages
```
[PublicProfile] Component rendering at: [timestamp]
[PublicProfile] Pathname: /u/[userId]
[PublicProfile] Extracted ID: [userId]
[PublicProfile] Fetching profile for: [userId]
[PublicProfile] Profile loaded: {data}
```
**If you see all these:** Component is working, check if data is rendering
**If you only see "Component rendering":** Component is stuck in loading state
**If you see "Fetching" but no "Profile loaded":** API call is failing

## Step 3: Check What "Internally" Means

### Scenario A: Clicking Names in Chat (Sync page)
1. Go to `/sync` (chat page)
2. Click on a user's name
3. **Expected behavior:** Full page navigation to `/u/{userId}`
4. **Check:** Look at URL bar - did it change to `/u/{userId}`?

**If URL doesn't change:** JavaScript click handler not working
**If URL changes but page is blank:** See Step 2 (console errors)

### Scenario B: Logged In vs Logged Out
1. Test profile page while logged out (incognito window)
2. Test profile page while logged in (normal window)

**If works logged out, fails logged in:** Authentication hook or Layout issue
**If fails in both:** General component/build issue

### Scenario C: PWA vs Browser
1. Test in regular mobile browser (Chrome/Safari)
2. Test in installed PWA

**If works in browser, fails in PWA:** Service worker caching old version
**If fails in both:** Component/API issue

## Step 4: Common Issues and Fixes

### Issue: Blank white page, no console errors
**Cause:** Service worker serving old cached version
**Fix:**
1. Uninstall PWA completely
2. Clear all site data in browser
3. Reinstall PWA
4. Check service worker version in console (should be `v2024-12-12-002`)

### Issue: "Loading..." forever
**Cause:** API call hanging or failing silently
**Fix:**
1. Open Network tab
2. Look for call to `/api/public/profile/{userId}`
3. Check response status and data
4. If 500 error, check server logs

### Issue: Console error "Cannot read property 'psychologicalProfile'"
**Cause:** Type mismatch or undefined data
**Fix:**
1. Verify API returns `psychologicalProfile` field
2. Check if user has Usership tag
3. Rebuild client with latest types

### Issue: "Profile not found" or 404
**Cause:** User doesn't exist or privacy settings blocking
**Fix:**
1. Verify userId is correct
2. Check user exists in database
3. Check `/api/public/profile/{userId}` returns data

### Issue: Page loads but psychological profile section missing
**Cause:** User doesn't have Usership tag
**Expected behavior:** Should show message "User does not have Usership - psychological profile not available"
**If no message shows:** Component rendering issue, check console

## Step 5: Verify Latest Code is Deployed

### Check Service Worker Version
Open browser console on any page:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW state:', reg.active?.state)
})
```

Then visit any page and check console for:
```
[SW] Service worker loaded, version: v2024-12-12-002
```

**If version is older:** Clear cache and reload
**If no service worker:** Check `/sw.js` is accessible

### Check Build Files
Verify these files exist and are fresh:
```
https://your-domain.com/js/public-profile.js
https://your-domain.com/sw.js
https://your-domain.com/css/index.css
```

**public-profile.js should be ~7.4KB**
**If smaller:** Old version or incomplete build

### Check Server Logs
When visiting `/u/{userId}`, you should see in server logs:
```
[GLOBAL] Request to: GET /u/{userId}
🟢 [PUBLIC-PROFILE-ROUTE] Serving profile page for: {userId}
```

**If you don't see these logs:** Route not being hit, possible routing conflict

## Step 6: Nuclear Option - Force Complete Refresh

If nothing else works:

1. **Update service worker version:**
   - Edit `/home/user/lot-systems/public/sw.js`
   - Change line 4: `const CACHE_VERSION = 'v2024-12-12-003';`
   - Commit and deploy

2. **Clear everything:**
   - Uninstall PWA
   - Clear browser cache (Settings → Privacy → Clear browsing data → All time)
   - Clear site data (Application tab → Clear site data)
   - Restart browser

3. **Fresh install:**
   - Visit site in browser
   - Wait for service worker to register (check console)
   - Install PWA
   - Test `/u/{userId}`

## What to Report Back

If still not working, report:

1. ✅ or ❌ for each test above
2. Full console output when visiting `/u/{userId}`
3. Network tab screenshot showing `/api/public/profile/{userId}` response
4. Service worker version from console
5. Whether issue is in browser, PWA, or both
6. Whether logged in or logged out

This will help identify the exact issue.
