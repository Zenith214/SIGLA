-- ML Cache Table for storing computed ML results
-- This dramatically improves performance by caching expensive computations

-- Create ml_cache table without foreign key constraints
-- Foreign keys are optional and will be added if the referenced tables exist
CREATE TABLE IF NOT EXISTS ml_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  cycle_id INTEGER,
  barangay_id INTEGER,
  data JSONB NOT NULL,
  computed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_stale BOOLEAN DEFAULT FALSE,
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_ml_cache_key ON ml_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ml_cache_endpoint_cycle ON ml_cache(endpoint, cycle_id);
CREATE INDEX IF NOT EXISTS idx_ml_cache_expires_at ON ml_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ml_cache_is_stale ON ml_cache(is_stale);

-- Function to automatically mark expired cache as stale
CREATE OR REPLACE FUNCTION mark_expired_cache_stale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() THEN
    NEW.is_stale := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to mark cache as stale when accessed after expiration
CREATE TRIGGER trigger_mark_expired_cache_stale
  BEFORE UPDATE ON ml_cache
  FOR EACH ROW
  EXECUTE FUNCTION mark_expired_cache_stale();

-- Function to clean up old cache entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_ml_cache(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ml_cache
  WHERE computed_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE ml_cache ENABLE ROW LEVEL SECURITY;

-- Allow service_role (backend) full access
CREATE POLICY "Allow service_role full access to ml_cache"
  ON ml_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read cache
CREATE POLICY "Allow authenticated users to read ml_cache"
  ON ml_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert cache
CREATE POLICY "Allow authenticated users to insert ml_cache"
  ON ml_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update cache
CREATE POLICY "Allow authenticated users to update ml_cache"
  ON ml_cache
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete cache
CREATE POLICY "Allow authenticated users to delete ml_cache"
  ON ml_cache
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_cache TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE ml_cache_id_seq TO authenticated;

-- Grant permissions to service_role (for backend operations)
GRANT ALL ON ml_cache TO service_role;
GRANT ALL ON SEQUENCE ml_cache_id_seq TO service_role;

-- Add helpful comments
COMMENT ON TABLE ml_cache IS 'Caches expensive ML computation results to improve performance';
COMMENT ON COLUMN ml_cache.cache_key IS 'Unique identifier for the cached computation';
COMMENT ON COLUMN ml_cache.endpoint IS 'API endpoint that generated this cache';
COMMENT ON COLUMN ml_cache.expires_at IS 'When this cache entry should be considered stale';
COMMENT ON COLUMN ml_cache.is_stale IS 'Whether this cache is expired but can be used while recomputing';
COMMENT ON COLUMN ml_cache.hit_count IS 'Number of times this cache has been accessed';

-- Optional: Add foreign key constraints if your tables exist
-- Uncomment and run these lines if you have survey_cycle and barangay tables:

-- For survey_cycle table (if it exists):
-- ALTER TABLE ml_cache 
--   ADD CONSTRAINT fk_ml_cache_cycle 
--   FOREIGN KEY (cycle_id) 
--   REFERENCES survey_cycle(cycle_id) 
--   ON DELETE CASCADE;

-- For barangay/barangays table (if it exists):
-- First, check your table name (might be 'barangay' or 'barangays')
-- Then uncomment ONE of these:

-- If your table is named 'barangay':
-- ALTER TABLE ml_cache 
--   ADD CONSTRAINT fk_ml_cache_barangay 
--   FOREIGN KEY (barangay_id) 
--   REFERENCES barangay(barangay_id) 
--   ON DELETE CASCADE;

-- If your table is named 'barangays':
-- ALTER TABLE ml_cache 
--   ADD CONSTRAINT fk_ml_cache_barangay 
--   FOREIGN KEY (barangay_id) 
--   REFERENCES barangays(barangay_id) 
--   ON DELETE CASCADE;
