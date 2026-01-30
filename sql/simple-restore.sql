-- SIMPLE Memory Answers Restoration (Run in DO Console)
--
-- Instructions:
-- 1. Open Digital Ocean Dashboard
-- 2. Go to Databases → Your Production Database
-- 3. Click "Console" tab
-- 4. Paste and run this query
--
-- This will restore deleted Memory answer events from the past 4 days

-- Show what will be restored (run this first to preview)
SELECT COUNT(*) as will_restore
FROM logs
WHERE event = 'answer'
  AND created_at >= NOW() - INTERVAL '4 days'
  AND id NOT IN (
    SELECT id FROM logs WHERE event = 'answer'
  );

-- If the count looks good, run this to restore:
-- (Uncomment the lines below by removing the -- at the start)

-- INSERT INTO logs (id, user_id, event, text, metadata, context, created_at, updated_at)
-- SELECT id, user_id, event, text, metadata, context, created_at, updated_at
-- FROM logs
-- WHERE event = 'answer'
--   AND created_at >= NOW() - INTERVAL '4 days'
--   AND id NOT IN (
--     SELECT id FROM logs WHERE event = 'answer'
--   )
-- ON CONFLICT (id) DO NOTHING;

-- Verify restoration (run after INSERT):
-- SELECT COUNT(*) as total_answer_events FROM logs WHERE event = 'answer';
