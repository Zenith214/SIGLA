-- Add CPAP comments table for communication between admin and officers
-- This allows tracking of discussions about delays, progress updates, etc.

-- Drop table if it exists (for clean re-creation)
DROP TABLE IF EXISTS cpap_comments CASCADE;

-- Create the table
CREATE TABLE cpap_comments (
  id SERIAL PRIMARY KEY,
  cpap_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE cpap_comments
  ADD CONSTRAINT cpap_comments_cpap_id_fkey 
  FOREIGN KEY (cpap_id) REFERENCES cpaps(id) ON DELETE CASCADE;

ALTER TABLE cpap_comments
  ADD CONSTRAINT cpap_comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX idx_cpap_comments_cpap_id ON cpap_comments(cpap_id);
CREATE INDEX idx_cpap_comments_user_id ON cpap_comments(user_id);
CREATE INDEX idx_cpap_comments_created_at ON cpap_comments(created_at DESC);

-- Grant permissions (Supabase uses service_role for backend access)
-- Enable Row Level Security
ALTER TABLE cpap_comments ENABLE ROW LEVEL SECURITY;

-- Grant full access to service role (used by supabaseAdmin)
GRANT ALL ON cpap_comments TO service_role;
GRANT ALL ON SEQUENCE cpap_comments_id_seq TO service_role;

-- Grant access to authenticated users (if using Supabase Auth)
GRANT ALL ON cpap_comments TO authenticated;
GRANT ALL ON SEQUENCE cpap_comments_id_seq TO authenticated;

-- Grant access to postgres role (for admin operations)
GRANT ALL ON cpap_comments TO postgres;
GRANT ALL ON SEQUENCE cpap_comments_id_seq TO postgres;

-- Create RLS policies (optional - allows all authenticated users to read/write)
CREATE POLICY "Allow authenticated users to read comments"
  ON cpap_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert comments"
  ON cpap_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own comments"
  ON cpap_comments FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Allow users to delete their own comments"
  ON cpap_comments FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Add comments to explain the table
COMMENT ON TABLE cpap_comments IS 'Comments and discussions between admin and officers about CPAP implementation';
COMMENT ON COLUMN cpap_comments.cpap_id IS 'Reference to the CPAP being discussed';
COMMENT ON COLUMN cpap_comments.user_id IS 'User who posted the comment (admin or officer)';
COMMENT ON COLUMN cpap_comments.comment_text IS 'The comment content';
