-- Manual Memory Answers Restoration
-- Run this in Digital Ocean database console
--
-- Instructions:
-- 1. Open DO dashboard -> Databases -> Your backup database
-- 2. Go to "Console" tab
-- 3. Paste this query to see what will be restored
-- 4. Then run the INSERT query below

-- Step 1: Check what's missing (run this first to preview)
SELECT
  COUNT(*) as missing_count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM backup.logs
WHERE event = 'answer'
  AND created_at >= NOW() - INTERVAL '4 days'
  AND id NOT IN (
    SELECT id FROM production.logs WHERE event = 'answer'
  );

-- Step 2: See sample of missing records
SELECT
  id,
  created_at,
  metadata->>'question' as question,
  metadata->>'answer' as answer
FROM backup.logs
WHERE event = 'answer'
  AND created_at >= NOW() - INTERVAL '4 days'
  AND id NOT IN (
    SELECT id FROM production.logs WHERE event = 'answer'
  )
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Restore the missing records (run after reviewing above)
-- NOTE: Replace 'backup' and 'production' with your actual database names

INSERT INTO production.logs (id, user_id, event, text, metadata, context, created_at, updated_at)
SELECT id, user_id, event, text, metadata, context, created_at, updated_at
FROM backup.logs
WHERE event = 'answer'
  AND created_at >= NOW() - INTERVAL '4 days'
  AND id NOT IN (
    SELECT id FROM production.logs WHERE event = 'answer'
  )
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify restoration
SELECT COUNT(*) as total_answer_events
FROM production.logs
WHERE event = 'answer';
