-- Check if cpap_notifications table exists and has data
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'cpap_notifications'
ORDER BY ordinal_position;

-- Check for any notifications
SELECT 
  id,
  user_id,
  cpap_id,
  notification_type,
  message,
  is_read,
  created_at,
  created_by
FROM cpap_notifications
ORDER BY created_at DESC
LIMIT 10;

-- Check notification count by user
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread_count
FROM cpap_notifications
GROUP BY user_id;
