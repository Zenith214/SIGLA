-- Migration: Add Data Export Audit Log Table
-- Purpose: Track all data exports for security and compliance
-- Created: 2024-12-02

-- Create data export audit log table
CREATE TABLE IF NOT EXISTS data_export_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  export_type VARCHAR(50) NOT NULL,
  anonymized BOOLEAN DEFAULT true,
  record_count INTEGER DEFAULT 0,
  exported_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Foreign key to user table
  CONSTRAINT fk_export_user FOREIGN KEY (user_id) 
    REFERENCES "user"(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  CONSTRAINT data_export_log_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX idx_export_log_user_id ON data_export_log(user_id);
CREATE INDEX idx_export_log_exported_at ON data_export_log(exported_at);
CREATE INDEX idx_export_log_export_type ON data_export_log(export_type);
CREATE INDEX idx_export_log_anonymized ON data_export_log(anonymized);

-- Add comment
COMMENT ON TABLE data_export_log IS 'Audit log for all data exports from the backup system';
COMMENT ON COLUMN data_export_log.user_id IS 'ID of user who performed the export';
COMMENT ON COLUMN data_export_log.export_type IS 'Type of export: survey-data, user-data, barangay-data, reports';
COMMENT ON COLUMN data_export_log.anonymized IS 'Whether personal data was anonymized';
COMMENT ON COLUMN data_export_log.record_count IS 'Number of records exported';
COMMENT ON COLUMN data_export_log.ip_address IS 'IP address of the requester';
COMMENT ON COLUMN data_export_log.user_agent IS 'Browser/client user agent string';
