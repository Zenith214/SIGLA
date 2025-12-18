-- AlterTable
ALTER TABLE "survey_response" 
ADD COLUMN IF NOT EXISTS "unawareness_reasons" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "non_availment_reasons" JSONB DEFAULT '{}';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_survey_response_unawareness_reasons" ON "survey_response" USING GIN ("unawareness_reasons");
CREATE INDEX IF NOT EXISTS "idx_survey_response_non_availment_reasons" ON "survey_response" USING GIN ("non_availment_reasons");

-- AddComments
COMMENT ON COLUMN "survey_response"."unawareness_reasons" IS 'Stores reasons for unawareness per service indicator. Format: {"serviceId": "reason_value"}';
COMMENT ON COLUMN "survey_response"."non_availment_reasons" IS 'Stores reasons for non-availment per service indicator. Format: {"serviceId": "reason_value"}';
