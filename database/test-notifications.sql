-- Test if cpap_notifications table exists and can be used

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'cpap_notifications'
) as table_exists;

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'cpap_notifications'
ORDER BY ordinal_position;

-- 3. Check current notifications
SELECT 
  n.id,
  n.user_id,
  u."firstName" || ' ' || u."lastName" as user_name,
  u.role,
  n.cpap_id,
  n.notification_type,
  n.message,
  n.is_read,
  n.created_at
FROM cpap_notifications n
LEFT JOIN "user" u ON u.id = n.user_id
ORDER BY n.created_at DESC;

-- 4. Try to insert a test notification (replace user_id and cpap_id with real values)
-- First, get a real officer user ID
SELECT id, "firstName", "lastName", role, "barangayDesignation" 
FROM "user" 
WHERE role ILIKE 'officer' 
LIMIT 1;

-- Get a real CPAP ID
SELECT id, barangay_id, status 
FROM cpaps 
LIMIT 1;

-- Now insert a test notification (REPLACE 10 with officer user_id and 19 with cpap_id from above)
-- INSERT INTO cpap_notifications (user_id, cpap_id, notification_type, message, is_read, created_at)
-- VALUES (10, 19, 'comment_added', 'Test notification - Admin commented on your CPAP', false, NOW());

-- 5. Check if the notification was created
-- SELECT * FROM cpap_notifications ORDER BY created_at DESC LIMIT 1;
