-- Add logo_url field to barangay table
-- This allows storing the URL/path to uploaded barangay logos

-- Add the logo_url column if it doesn't exist
ALTER TABLE barangay 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN barangay.logo_url IS 'URL/path to the uploaded barangay logo image';

-- Create an index for faster queries (optional, since this won't be queried often)
CREATE INDEX IF NOT EXISTS idx_barangay_logo_url ON barangay(logo_url) WHERE logo_url IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'barangay' AND column_name = 'logo_url';