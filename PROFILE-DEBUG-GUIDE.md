# Profile Page Loading - Debugging Guide

## Issue: Profile page shows blank screen

This guide helps debug when clicking user names in chat results in a blank page.

## Quick Fixes to Try First

### 1. Force PWA Refresh
After deploying, you must **completely uninstall and reinstall** the PWA:

**On iOS:**
1. Long-press the app icon → Delete App
2. Go to Safari → your-domain.com
3. Share → Add to Home Screen

**On Android:**
1. Long-press app icon → App info → Uninstall
2. Go to Chrome → your-domain.com
3. Install app when prompted

**Important:** Just closing and reopening the app is NOT enough. Service workers aggressively cache assets.

### 2. Check Browser Console
1. Visit `/u/{userId}` directly in mobile browser (not PWA)
2. Open developer tools / inspect
3. Look for errors in Console tab
4. Common issues:
   - `Failed to fetch` - Network/CORS issue
   - `Unexpected token` - JavaScript syntax error
   - CSP violations - Content Security Policy blocking script

### 3. Check Network Tab
1. Open Network tab in dev tools
2. Visit `/u/{userId}`
3. Look for:
   - `public-profile.js` - should be 200 OK, ~7-8KB
   - Any 404s or 500s
   - Blocked by CSP errors

## Build Verification

### Check if public-profile.js exists:
```bash
ls -lh dist/client/js/public-profile.js
# Should show ~7-8KB file
```

### Rebuild if needed:
```bash
yarn run client:build
```

### Verify build output:
```bash
cat dist/client/js/public-profile.js | head -1
# Should be minified JavaScript starting with "import"
```

## Server-Side Checks

### 1. Verify route registration
Check server logs when visiting `/u/test123`:
```
🟢 [PUBLIC-PROFILE-ROUTE] Serving profile page for: test123
```

If you don't see this log, the route isn't registered properly.

### 2. Check template rendering
The server should be serving `generic-spa` template with:
- `scriptName: 'public-profile'`
- Current cache version (e.g., `?v=20241212-001`)

### 3. Verify API endpoint works
Test the data endpoint directly:
```bash
curl https://your-domain.com/api/public/profile/{userId}
```

Should return JSON with user profile data including `psychologicalProfile` for Usership users.

## Common Issues and Solutions

### Issue: "Loading..." shows forever
**Cause:** JavaScript bundle not loading or executing
**Fix:**
1. Check browser console for errors
2. Verify public-profile.js is being served (Network tab)
3. Check CSP isn't blocking the script
4. Ensure cache version is updated in template

### Issue: "User not found" error
**Cause:** API endpoint returning 404
**Fix:**
1. Verify userId exists in database
2. Check if user has public profile enabled (should be automatic now)
3. Check server logs for actual error

### Issue: Blank white screen, no error
**Cause:** Usually service worker serving old cached version
**Fix:**
1. **Uninstall and reinstall PWA** (not just refresh)
2. Clear all site data in browser settings
3. Increment cache version in `templates/generic-spa.ejs`

### Issue: Profile shows but psychological data missing
**Cause:** User doesn't have Usership tag OR hasn't answered questions
**Fix:**
- Verify user has "Usership" tag in admin panel
- Check if user has completed Memory questions
- Should show message: "User does not have Usership..." or "User has not completed any Memory questions yet"

## Cache Version Management

When you make changes to client code, always update the cache version in `templates/generic-spa.ejs`:

```html
<script type="module" nonce="..." src="/js/<%= scriptName %>.js?v=YYYYMMDD-NNN"></script>
```

Increment the date or counter (e.g., `20241212-001` → `20241212-002`)

This forces browsers and PWAs to fetch fresh JavaScript instead of using cached versions.

## Testing Checklist

Before marking as "fixed":

- [ ] Visit `/u/{userId}` in desktop browser - loads correctly
- [ ] Visit `/u/{userId}` in mobile browser - loads correctly
- [ ] Click user name from chat in desktop browser - navigates and loads
- [ ] Click user name from chat in mobile browser - navigates and loads
- [ ] Click user name from chat in PWA - navigates and loads
- [ ] Psychological profile shows for Usership users
- [ ] Graceful message shows for non-Usership users
- [ ] All privacy settings respected (weather, city, etc.)

## Recent Changes (Dec 12, 2024)

1. **Unified profile views** - All users now go to `/u/{userId}` (not split between `/u` and `/us`)
2. **Added psychological profiles** to public API response
3. **Updated PublicProfile type** to include `psychologicalProfile` field
4. **Cache version bumped** to `20241212-001`

## Still Not Working?

If you've tried everything above:

1. Check that ALL these commits are deployed:
   - `57a7c344` - Unify profile views
   - `b2eb9218` - Update cache version
   - `a715632f` - Add psychological profile type

2. Verify the deployed build includes the latest `dist/client/js/public-profile.js`

3. Test with a completely different browser/device that has never visited the site

4. Check server logs during the page load for any errors

5. Create a minimal test page at `/test-simple` that just renders "Hello World" to verify basic routing works
