-- Check notification details
SELECT 
  n.id,
  n.user_id,
  u."firstName" || ' ' || u."lastName" as user_name,
  u.role,
  u.email,
  n.cpap_id,
  n.notification_type,
  n.message,
  n.is_read,
  n.created_at,
  n.created_by
FROM cpap_notifications n
LEFT JOIN "user" u ON u.id = n.user_id
ORDER BY n.created_at DESC;

-- Check which user is the officer for barangay 24 (CPAP ID 19)
SELECT 
  id,
  "firstName",
  "lastName",
  email,
  role,
  "barangayDesignation"
FROM "user"
WHERE "barangayDesignation" = 24
  AND role ILIKE 'officer';

-- Check all officers
SELECT 
  id,
  "firstName",
  "lastName",
  email,
  role,
  "barangayDesignation"
FROM "user"
WHERE role ILIKE 'officer'
ORDER BY id;
