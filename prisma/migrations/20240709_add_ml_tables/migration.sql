-- CreateEnum
CREATE TYPE "model_type" AS ENUM ('classifier', 'regressor');

-- CreateEnum
CREATE TYPE "quadrant_type" AS ENUM ('MAINTAIN', 'OPPORTUNITIES', 'MONITOR', 'FIX_NOW');

-- CreateEnum
CREATE TYPE "insight_type" AS ENUM ('performance_summary', 'bottleneck_analysis', 'recommendations', 'comparative_analysis', 'trend_prediction');

-- CreateEnum
CREATE TYPE "recommendation_type" AS ENUM ('immediate', 'medium_term', 'long_term');

-- CreateEnum
CREATE TYPE "priority_level" AS ENUM ('high', 'medium', 'low');

-- CreateTable
CREATE TABLE "ml_model" (
    "model_id" SERIAL NOT NULL,
    "model_name" VARCHAR(100) NOT NULL,
    "model_type" VARCHAR(20) NOT NULL DEFAULT 'classifier',
    "algorithm" VARCHAR(50) NOT NULL DEFAULT 'random_forest',
    "version" VARCHAR(20) NOT NULL,
    "model_data" BYTEA NOT NULL,
    "feature_names" TEXT NOT NULL,
    "performance_metrics" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ml_model_pkey" PRIMARY KEY ("model_id")
);

-- CreateTable
CREATE TABLE "ml_prediction" (
    "prediction_id" SERIAL NOT NULL,
    "model_id" INTEGER NOT NULL,
    "barangay_id" INTEGER NOT NULL,
    "prediction_type" VARCHAR(50) NOT NULL,
    "predicted_value" DECIMAL(5,2),
    "predicted_class" VARCHAR(50),
    "confidence_score" DECIMAL(5,4),
    "feature_importance" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_prediction_pkey" PRIMARY KEY ("prediction_id")
);

-- CreateTable
CREATE TABLE "action_grid_classification" (
    "classification_id" SERIAL NOT NULL,
    "barangay_id" INTEGER NOT NULL,
    "section_name" VARCHAR(100) NOT NULL,
    "satisfaction_score" DECIMAL(5,2) NOT NULL,
    "need_for_action_score" DECIMAL(5,2) NOT NULL,
    "quadrant" VARCHAR(20) NOT NULL,
    "recommendations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_grid_classification_pkey" PRIMARY KEY ("classification_id")
);

-- CreateTable
CREATE TABLE "ai_insight" (
    "insight_id" SERIAL NOT NULL,
    "barangay_id" INTEGER NOT NULL,
    "insight_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "key_findings" TEXT,
    "recommendations" TEXT,
    "confidence_score" DECIMAL(5,4),
    "ml_prediction_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ai_insight_pkey" PRIMARY KEY ("insight_id")
);

-- CreateTable
CREATE TABLE "ai_recommendation" (
    "recommendation_id" SERIAL NOT NULL,
    "insight_id" INTEGER NOT NULL,
    "barangay_id" INTEGER NOT NULL,
    "recommendation_type" VARCHAR(20) NOT NULL,
    "priority_level" VARCHAR(10) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "expected_impact" VARCHAR(500),
    "resource_requirements" TEXT,
    "implementation_timeline" VARCHAR(100),
    "success_metrics" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendation_pkey" PRIMARY KEY ("recommendation_id")
);

-- Add indexes to existing tables
CREATE INDEX "barangay_is_active_idx" ON "barangay"("is_active");
CREATE INDEX "barangay_seal_idx" ON "barangay"("seal");
CREATE INDEX "survey_target_barangay_id_idx" ON "survey_target"("barangay_id");
CREATE INDEX "assignment_barangay_id_idx" ON "assignment"("barangay_id");
CREATE INDEX "assignment_user_id_idx" ON "assignment"("user_id");
CREATE INDEX "assignment_status_idx" ON "assignment"("status");
CREATE INDEX "survey_barangay_id_idx" ON "survey"("barangay_id");
CREATE INDEX "survey_status_idx" ON "survey"("status");
CREATE INDEX "user_role_idx" ON "user"("role");
CREATE INDEX "user_status_idx" ON "user"("status");
CREATE INDEX "user_name_idx" ON "user"("lastName", "firstName");
CREATE INDEX "survey_answer_question_id_idx" ON "survey_answer"("question_id");
CREATE INDEX "survey_answer_response_id_idx" ON "survey_answer"("response_id");
CREATE INDEX "survey_attachment_response_id_idx" ON "survey_attachment"("response_id");
CREATE INDEX "survey_attachment_file_type_idx" ON "survey_attachment"("file_type");
CREATE INDEX "survey_log_survey_id_idx" ON "survey_log"("survey_id");
CREATE INDEX "survey_log_created_at_idx" ON "survey_log"("created_at");
CREATE INDEX "survey_metadata_response_id_idx" ON "survey_metadata"("response_id");
CREATE INDEX "survey_metadata_key_name_idx" ON "survey_metadata"("key_name");
CREATE INDEX "survey_question_section_id_idx" ON "survey_question"("section_id");
CREATE INDEX "survey_question_question_key_idx" ON "survey_question"("question_key");
CREATE INDEX "survey_question_question_type_idx" ON "survey_question"("question_type");
CREATE INDEX "survey_response_barangay_id_idx" ON "survey_response"("barangay_id");
CREATE INDEX "survey_response_interviewer_id_idx" ON "survey_response"("interviewer_id");
CREATE INDEX "survey_response_status_idx" ON "survey_response"("status");
CREATE INDEX "survey_response_created_at_idx" ON "survey_response"("created_at");
CREATE INDEX "survey_section_response_id_idx" ON "survey_section"("response_id");
CREATE INDEX "survey_section_status_idx" ON "survey_section"("status");
CREATE INDEX "survey_validation_response_id_idx" ON "survey_validation"("response_id");
CREATE INDEX "survey_validation_type_status_idx" ON "survey_validation"("validation_type", "validation_status");
CREATE INDEX "barangay_history_barangay_id_idx" ON "barangay_history"("barangay_id");
CREATE INDEX "barangay_history_year_idx" ON "barangay_history"("year");
CREATE INDEX "barangay_history_status_idx" ON "barangay_history"("status");

-- Create indexes for new ML tables
CREATE INDEX "ml_model_name_version_idx" ON "ml_model"("model_name", "version");
CREATE INDEX "ml_prediction_barangay_type_idx" ON "ml_prediction"("barangay_id", "prediction_type");
CREATE INDEX "action_grid_classification_barangay_section_idx" ON "action_grid_classification"("barangay_id", "section_name");
CREATE INDEX "ai_insight_barangay_type_idx" ON "ai_insight"("barangay_id", "insight_type");
CREATE INDEX "ai_recommendation_barangay_priority_idx" ON "ai_recommendation"("barangay_id", "priority_level");

-- Add foreign key constraints
ALTER TABLE "ml_prediction" ADD CONSTRAINT "ml_prediction_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ml_model"("model_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ml_prediction" ADD CONSTRAINT "ml_prediction_barangay_id_fkey" FOREIGN KEY ("barangay_id") REFERENCES "barangay"("barangay_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "action_grid_classification" ADD CONSTRAINT "action_grid_classification_barangay_id_fkey" FOREIGN KEY ("barangay_id") REFERENCES "barangay"("barangay_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ai_insight" ADD CONSTRAINT "ai_insight_barangay_id_fkey" FOREIGN KEY ("barangay_id") REFERENCES "barangay"("barangay_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ai_insight" ADD CONSTRAINT "ai_insight_ml_prediction_id_fkey" FOREIGN KEY ("ml_prediction_id") REFERENCES "ml_prediction"("prediction_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "ai_insight"("insight_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_barangay_id_fkey" FOREIGN KEY ("barangay_id") REFERENCES "barangay"("barangay_id") ON DELETE RESTRICT ON UPDATE CASCADE;