-- ML Cache Columns Migration
-- Adds service area specific columns to ml_cache table

-- Add columns for Financial Assistance
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS financial_assistance_satisfaction DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS financial_assistance_need_action DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS financial_assistance_awareness DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS financial_assistance_availment DECIMAL(5,2);

-- Add columns for Disaster Preparedness
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS disaster_preparedness_satisfaction DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS disaster_preparedness_need_action DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS disaster_preparedness_awareness DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS disaster_preparedness_availment DECIMAL(5,2);

-- Add columns for Health Services
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS health_services_satisfaction DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS health_services_need_action DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS health_services_awareness DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS health_services_availment DECIMAL(5,2);

-- Add columns for Peace and Order
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS peace_and_order_satisfaction DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS peace_and_order_need_action DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS peace_and_order_awareness DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS peace_and_order_availment DECIMAL(5,2);

-- Add columns for Infrastructure
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS infrastructure_satisfaction DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS infrastructure_need_action DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS infrastructure_awareness DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS infrastructure_availment DECIMAL(5,2);

-- Add columns for Environmental Management
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS environmental_management_satisfaction DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS environmental_management_need_action DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS environmental_management_awareness DECIMAL(5,2);
ALTER TABLE ml_cache ADD COLUMN IF NOT EXISTS environmental_management_availment DECIMAL(5,2);

-- Add foreign key constraints if not already present
DO $$ 
BEGIN
    -- Add foreign key to survey_cycle if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_ml_cache_cycle'
    ) THEN
        ALTER TABLE ml_cache 
        ADD CONSTRAINT fk_ml_cache_cycle 
        FOREIGN KEY (cycle_id) 
        REFERENCES survey_cycle(cycle_id) 
        ON DELETE CASCADE;
    END IF;

    -- Add foreign key to barangay if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_ml_cache_barangay'
    ) THEN
        ALTER TABLE ml_cache 
        ADD CONSTRAINT fk_ml_cache_barangay 
        FOREIGN KEY (barangay_id) 
        REFERENCES barangay(barangay_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ml_cache_cycle_barangay ON ml_cache(cycle_id, barangay_id);
CREATE INDEX IF NOT EXISTS idx_ml_cache_barangay ON ml_cache(barangay_id);

-- Add helpful comments
COMMENT ON COLUMN ml_cache.financial_assistance_satisfaction IS 'Satisfaction score for Financial Assistance service area (0-100)';
COMMENT ON COLUMN ml_cache.disaster_preparedness_satisfaction IS 'Satisfaction score for Disaster Preparedness service area (0-100)';
COMMENT ON COLUMN ml_cache.health_services_satisfaction IS 'Satisfaction score for Health Services service area (0-100)';
COMMENT ON COLUMN ml_cache.peace_and_order_satisfaction IS 'Satisfaction score for Peace and Order service area (0-100)';
COMMENT ON COLUMN ml_cache.infrastructure_satisfaction IS 'Satisfaction score for Infrastructure service area (0-100)';
COMMENT ON COLUMN ml_cache.environmental_management_satisfaction IS 'Satisfaction score for Environmental Management service area (0-100)';
