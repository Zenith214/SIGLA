-- Backup History Table Schema
-- Add this to your Supabase database

CREATE TABLE IF NOT EXISTS backup_history (
  id BIGSERIAL PRIMARY KEY,
  backup_type VARCHAR(50) NOT NULL DEFAULT 'Manual',
  file_size VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'Success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  file_path TEXT,
  checksum VARCHAR(64),
  
  -- Constraints
  CONSTRAINT backup_history_status_check CHECK (status IN ('Success', 'Failed', 'In Progress'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status);
CREATE INDEX IF NOT EXISTS idx_backup_history_type ON backup_history(backup_type);

-- Enable Row Level Security (RLS)
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to view backup history" 
ON backup_history FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to insert backup history" 
ON backup_history FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_backup_history_updated_at 
    BEFORE UPDATE ON backup_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO backup_history (backup_type, file_size, status, metadata) VALUES
('Automatic', '2.4 MB', 'Success', '{"export_type": "full", "records_count": 1250}'),
('Manual', '1.8 MB', 'Success', '{"export_type": "survey_data", "records_count": 890}'),
('Automatic', '2.1 MB', 'Failed', '{"export_type": "full", "error": "Connection timeout"}');