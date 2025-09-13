-- Add seal_expiration_date column to barangay table
ALTER TABLE barangay ADD COLUMN seal_expiration_date TIMESTAMP;

-- Update existing records with seal='yes' to have an expiration date of 1 year from now
UPDATE barangay 
SET seal_expiration_date = NOW() + INTERVAL '1 year' 
WHERE seal = 'yes';

-- Create an index on seal_expiration_date for faster queries
CREATE INDEX idx_barangay_seal_expiration ON barangay(seal_expiration_date);