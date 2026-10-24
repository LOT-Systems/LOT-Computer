<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Memory Engine - Working Configuration (December 2025)

## ✅ VERIFIED WORKING - DO NOT CHANGE

### Critical Changes That Fixed Prompts

1. **Time Windows: REMOVED** ✓
   - Location: `src/server/utils/memory.ts` line ~1238
   - Code: `const isGoodTime = true`
   - Effect: Prompts available 24/7 (was restricted to 12-17 hours/day)
   - Commit: `53d95813`

2. **Cooldown: 2 Hours** ✓
   - Location: `src/server/routes/api.ts` line ~721
   - Code: `const twoHoursAgo = now.subtract(2, 'hour')`
   - Effect: Prompts can appear every 2 hours (was 12-hour periods)
   - Commit: `1eba0176`

3. **AI Engine: Together.AI Only** ✓
   - Location: `src/server/utils/memory.ts` line ~48
   - Code: `const AI_ENGINE_PREFERENCE: EnginePreference = 'together'`
   - Effect: Uses Together.AI exclusively (was auto-fallback)
   - Commit: `5551842b`

### Daily Quotas (Working - Keep As-Is)
```javascript
// src/server/utils/memory.ts lines 1190-1206
if (isWeekend) {
  promptQuotaToday = 6
} else if (dayNumber === 1) {
  promptQuotaToday = 5
} else if (dayNumber === 2) {
  promptQuotaToday = 3
} else if (dayNumber === 3) {
  promptQuotaToday = 4
} else {
  const seed = dayNumber % 7
  promptQuotaToday = seed % 3 === 0 ? 3 : seed % 3 === 1 ? 4 : 5
}
```

### Blocking Logic (Current State)
Only TWO conditions block prompts:
1. Daily quota reached (3-6 prompts depending on day)
2. Answered within last 2 hours

## 📊 Debugging Tools Added

1. **Status Page Integration** ✓
   - Endpoint: `/api/memory-status`
   - UI: Visit `/status` to see Memory section
   - Shows: quota, cooldown, availability, block reasons

2. **Enhanced Logging** ✓
   - Server logs show time checks, quotas, decisions
   - Helps diagnose issues without user access to logs

## 🔒 Environment Variables

From `spec.yaml`:
```yaml
- key: APP_HOST
  value: https://lot-systems.com
- key: TOGETHER_API_KEY
  value: [set in deployment]
```

## 📝 Recent Commits (Keep These)

```
dc7cb917 - Fix Status Page link stuck on Loading in Settings
53d95813 - Remove time window restrictions - enable 24/7 prompts ★
5551842b - Add Memory prompt status to Status Page + switch to Together.AI only ★
ccca3b92 - Add enhanced debugging for Memory prompt timing
1eba0176 - Fix Memory engine prompt frequency ★
```

★ = Critical for prompts working

## ⚠️ DO NOT Revert These Changes

- Do NOT add back time window restrictions
- Do NOT change back to 12-hour period checks
- Do NOT change AI engine to 'auto' fallback
- Keep Together.AI as primary engine

## ✅ Safe to Modify

- Daily quotas (currently 3-6 per day)
- 2-hour cooldown (could adjust to 1-3 hours)
- Status Page UI/styling
- Debug logging verbosity

## 🐛 Debugging Guide

If prompts stop working:

1. **Check Status Page** (`/status`)
   - Look at "Memory Prompts (Your Status)" section
   - Check quota remaining
   - Check cooldown status

2. **Verify Time**
   - Should show "All day (24/7)"
   - If not, time window restrictions were re-added

3. **Check AI Engine**
   - Should be Together.AI only
   - Verify TOGETHER_API_KEY is set

4. **Review Server Logs**
   - Look for "⏰ Time check" entries
   - Should show `isGoodTime: true`
   - Check quota vs shown counts
