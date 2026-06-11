-- Gemini API Settings Table
-- Stores API key and tracks token usage

CREATE TABLE IF NOT EXISTS gemini_settings (
  id SERIAL PRIMARY KEY,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  tokens_used INTEGER DEFAULT 0,
  tokens_limit INTEGER DEFAULT 1000000, -- 1M tokens for free tier
  last_reset_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Only keep one active settings record
CREATE UNIQUE INDEX IF NOT EXISTS idx_gemini_settings_active ON gemini_settings(is_active) WHERE is_active = TRUE;

-- Token usage log for detailed tracking
CREATE TABLE IF NOT EXISTS gemini_token_usage (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(100) NOT NULL,
  barangay_id INTEGER,
  cycle_id INTEGER,
  tokens_used INTEGER NOT NULL,
  request_type VARCHAR(50), -- 'generation', 'regeneration', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for token usage
CREATE INDEX IF NOT EXISTS idx_gemini_token_usage_created_at ON gemini_token_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_gemini_token_usage_endpoint ON gemini_token_usage(endpoint);

-- RLS Policies
ALTER TABLE gemini_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_token_usage ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "Allow service_role full access to gemini_settings"
  ON gemini_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service_role full access to gemini_token_usage"
  ON gemini_token_usage
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read settings (but not the API key)
CREATE POLICY "Allow authenticated users to read gemini_settings"
  ON gemini_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read gemini_token_usage"
  ON gemini_token_usage
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON gemini_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON gemini_token_usage TO service_role;
GRANT SELECT ON gemini_settings TO authenticated;
GRANT SELECT ON gemini_token_usage TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE gemini_settings_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE gemini_token_usage_id_seq TO service_role;

-- Function to log token usage
CREATE OR REPLACE FUNCTION log_gemini_token_usage(
  p_endpoint VARCHAR(100),
  p_tokens_used INTEGER,
  p_barangay_id INTEGER DEFAULT NULL,
  p_cycle_id INTEGER DEFAULT NULL,
  p_request_type VARCHAR(50) DEFAULT 'generation'
)
RETURNS VOID AS $$
BEGIN
  -- Insert usage log
  INSERT INTO gemini_token_usage (endpoint, tokens_used, barangay_id, cycle_id, request_type)
  VALUES (p_endpoint, p_tokens_used, p_barangay_id, p_cycle_id, p_request_type);
  
  -- Update total tokens used in settings
  UPDATE gemini_settings
  SET tokens_used = tokens_used + p_tokens_used,
      updated_at = NOW()
  WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset token counter (monthly reset)
CREATE OR REPLACE FUNCTION reset_gemini_token_counter()
RETURNS VOID AS $$
BEGIN
  UPDATE gemini_settings
  SET tokens_used = 0,
      last_reset_date = NOW(),
      updated_at = NOW()
  WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get token usage statistics
CREATE OR REPLACE FUNCTION get_gemini_token_stats()
RETURNS TABLE (
  total_tokens_used INTEGER,
  tokens_limit INTEGER,
  tokens_remaining INTEGER,
  usage_percentage NUMERIC,
  last_reset_date TIMESTAMP,
  daily_average NUMERIC,
  monthly_usage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.tokens_used,
    gs.tokens_limit,
    gs.tokens_limit - gs.tokens_used as tokens_remaining,
    ROUND((gs.tokens_used::NUMERIC / gs.tokens_limit::NUMERIC) * 100, 2) as usage_percentage,
    gs.last_reset_date,
    ROUND(gs.tokens_used::NUMERIC / GREATEST(EXTRACT(DAY FROM (NOW() - gs.last_reset_date)), 1), 2) as daily_average,
    (SELECT COALESCE(SUM(tokens_used), 0)::INTEGER 
     FROM gemini_token_usage 
     WHERE created_at >= DATE_TRUNC('month', NOW())) as monthly_usage
  FROM gemini_settings gs
  WHERE gs.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE gemini_settings IS 'Stores Gemini API configuration and token usage tracking';
COMMENT ON TABLE gemini_token_usage IS 'Detailed log of Gemini API token usage per request';
COMMENT ON COLUMN gemini_settings.tokens_limit IS 'Monthly token limit (default 1M for free tier)';
COMMENT ON COLUMN gemini_settings.tokens_used IS 'Total tokens used since last reset';
