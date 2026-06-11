-- Migration: Add interviewer assignment to questionnaires table
-- This allows individual questionnaires to be assigned to different interviewers
-- Date: 2025-01-XX
-- Purpose: Enable flexible slot allocation where Field Supervisors can assign
--          specific numbers of questionnaires to different interviewers

-- Add assigned_interviewer_id column to questionnaires table
ALTER TABLE questionnaires 
ADD COLUMN IF NOT EXISTS assigned_interviewer_id INTEGER REFERENCES "user"(id);

-- Add index for performance when querying by interviewer
CREATE INDEX IF NOT EXISTS idx_questionnaires_assigned_interviewer 
ON questionnaires(assigned_interviewer_id);

-- Add index for querying unassigned questionnaires
CREATE INDEX IF NOT EXISTS idx_questionnaires_spot_assignment 
ON questionnaires(spot_id, assigned_interviewer_id);

-- Add comment to document the column
COMMENT ON COLUMN questionnaires.assigned_interviewer_id IS 
'ID of the interviewer assigned to this specific questionnaire. Allows flexible slot allocation where different questionnaires in the same spot can be assigned to different interviewers.';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questionnaires' 
AND column_name = 'assigned_interviewer_id';

-- Show sample data structure
SELECT 
    q.questionnaire_id,
    q.spot_id,
    q.assigned_interviewer_id,
    u.firstName || ' ' || u.lastName as assigned_to,
    q.status
FROM questionnaires q
LEFT JOIN "user" u ON q.assigned_interviewer_id = u.id
LIMIT 5;
