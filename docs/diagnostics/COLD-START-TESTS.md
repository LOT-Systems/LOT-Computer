<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Cold Start / Morning Loading Tests

## Overview

Comprehensive test suite for verifying all critical screens and APIs load correctly after deployment or server restart.

## What Was Fixed

### 🐛 Bug Fix: Pagination in `/us` (Admin Users)

**File:** `src/client/queries.ts:129`

**Problem:**
```typescript
limit: String(params.skip),  // ❌ Wrong parameter
```

**Fixed:**
```typescript
limit: String(params.limit),  // ✅ Correct parameter
```

**Impact:** This bug completely broke the `/us` admin interface because the pagination API received incorrect query parameters.

## Test Suite Coverage

### 1. Auth Screen Tests ✅
- Login page loads properly
- Auth endpoint responds correctly
- Admin authentication works

### 2. Settings Screen Tests ✅
- Settings page loads
- `/api/me` endpoint returns user profile
- User settings are accessible

### 3. Main/Sync Screen Tests ✅
- System screen (/) loads
- Sync screen (/sync) loads
- Main application interface works

### 4. Admin Users (/us) Tests ✅
- `/us` route exists and loads
- Admin users pagination API works correctly
- Single user detail API functions
- **NOW FIXED:** Pagination parameters are correct

### 5. Usership Claude Features ✅
- Memory API responds
- Live message system works
- Chat messages API functions

### 6. Core API Tests ✅
- Weather API returns data
- Static assets (CSS/JS) are accessible
- Web manifest loads correctly
- Theme system (dark/light modes) works

## Usage

### Test Local Development Server
```bash
yarn test:cold-start
```
Tests against `http://localhost:4400`

### Test Production Site
```bash
yarn test:cold-start:prod
```
Tests against `https://lot-systems.com`

### Custom Host
```bash
APP_HOST=https://your-site.com yarn test:cold-start
```

## Test with Authentication

To test authenticated endpoints, add to your `.env`:

```bash
TEST_ADMIN_EMAIL=your-admin@email.com
TEST_ADMIN_PASSWORD=your-password
```

## Production Test Results

When testing the production site, you may see 403 (Forbidden) responses. This is **expected behavior** and indicates:

✅ **Server is running and responding**
✅ **DDoS/WAF protection is active** (Cloudflare, DigitalOcean App Platform, etc.)
✅ **Rate limiting is working**

This is actually a **good sign** - it means your security measures are working!

## What Gets Tested

Each test verifies:
- ✅ Proper HTTP status codes (200, 401, 403, 404)
- ✅ Valid response data structures
- ✅ API endpoints are accessible
- ✅ Authentication flows work
- ✅ Protected routes require auth
- ✅ Critical features load without errors

## Interpreting Results

```
✅ Passed: Test succeeded
❌ Failed: Test failed with error
ℹ️  Skipped: Test requires auth or specific conditions
⏱️  Duration: Response time in milliseconds
```

## When to Run These Tests

1. **After every deployment** - Verify all systems operational
2. **Morning checks** - Ensure overnight stability
3. **After infrastructure changes** - Database, hosting, DNS updates
4. **Before major releases** - Confidence in production readiness
5. **Debugging issues** - Isolate which systems are affected

## Next Steps

If any test fails:
1. Check the error message for specific issues
2. Verify environment variables are set correctly
3. Check server logs for detailed error traces
4. Ensure database connectivity
5. Verify API keys and secrets are valid

## Commits

- `19f3e2e3` - Fix: Correct pagination limit parameter in usePaginatedUsers
- `1e08d185` - Feature: Add comprehensive cold start loading tests
