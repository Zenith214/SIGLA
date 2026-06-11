-- Add CPAP notifications table for simple notification system
-- Shows badge indicators for CPAP-related events

-- Drop table if it exists (for clean re-creation)
DROP TABLE IF EXISTS cpap_notifications CASCADE;

-- Create the table
CREATE TABLE cpap_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  cpap_id INTEGER NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'cpap_submitted', 'cpap_approved', 'cpap_revision_requested', 'cpap_updated', 'comment_added'
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER -- User who triggered the notification
);

-- Add foreign key constraints
ALTER TABLE cpap_notifications
  ADD CONSTRAINT cpap_notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE cpap_notifications
  ADD CONSTRAINT cpap_notifications_cpap_id_fkey 
  FOREIGN KEY (cpap_id) REFERENCES cpaps(id) ON DELETE CASCADE;

ALTER TABLE cpap_notifications
  ADD CONSTRAINT cpap_notifications_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES "user"(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_cpap_notifications_user_id ON cpap_notifications(user_id);
CREATE INDEX idx_cpap_notifications_cpap_id ON cpap_notifications(cpap_id);
CREATE INDEX idx_cpap_notifications_is_read ON cpap_notifications(is_read);
CREATE INDEX idx_cpap_notifications_created_at ON cpap_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE cpap_notifications ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON cpap_notifications TO service_role;
GRANT ALL ON SEQUENCE cpap_notifications_id_seq TO service_role;
GRANT ALL ON cpap_notifications TO authenticated;
GRANT ALL ON SEQUENCE cpap_notifications_id_seq TO authenticated;
GRANT ALL ON cpap_notifications TO postgres;
GRANT ALL ON SEQUENCE cpap_notifications_id_seq TO postgres;

-- Create RLS policies
CREATE POLICY "Users can read their own notifications"
  ON cpap_notifications FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications"
  ON cpap_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Add comments
COMMENT ON TABLE cpap_notifications IS 'Notifications for CPAP-related events (submissions, approvals, comments, updates)';
COMMENT ON COLUMN cpap_notifications.notification_type IS 'Type of notification: cpap_submitted, cpap_approved, cpap_revision_requested, cpap_updated, comment_added';
COMMENT ON COLUMN cpap_notifications.is_read IS 'Whether the user has read/acknowledged the notification';
