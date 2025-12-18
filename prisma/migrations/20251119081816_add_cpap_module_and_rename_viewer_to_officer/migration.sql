-- CreateEnum
CREATE TYPE "CPAPStatus" AS ENUM ('Draft', 'Submitted', 'Approved', 'Revision_Requested');

-- AlterTable: Update User role default from 'viewer' to 'officer'
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'officer';

-- CreateTable: cpaps
CREATE TABLE "cpaps" (
    "id" SERIAL NOT NULL,
    "barangay_id" INTEGER NOT NULL,
    "cycle_id" INTEGER NOT NULL,
    "status" "CPAPStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "admin_comments" TEXT,

    CONSTRAINT "cpaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable: cpap_items
CREATE TABLE "cpap_items" (
    "id" SERIAL NOT NULL,
    "cpap_id" INTEGER NOT NULL,
    "priority_area" VARCHAR(255) NOT NULL,
    "target_output" TEXT NOT NULL,
    "success_indicator" TEXT NOT NULL,
    "responsible_person" VARCHAR(255) NOT NULL,
    "timeline_start" DATE NOT NULL,
    "timeline_end" DATE NOT NULL,
    "actual_output" TEXT,
    "accomplishment_status" VARCHAR(50),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpap_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on barangay_id and cycle_id combination
CREATE UNIQUE INDEX "cpaps_barangay_id_cycle_id_key" ON "cpaps"("barangay_id", "cycle_id");

-- CreateIndex: Index on status for query optimization
CREATE INDEX "cpaps_status_idx" ON "cpaps"("status");

-- CreateIndex: Index on barangay_id for query optimization
CREATE INDEX "cpaps_barangay_id_idx" ON "cpaps"("barangay_id");

-- CreateIndex: Index on cycle_id for query optimization
CREATE INDEX "cpaps_cycle_id_idx" ON "cpaps"("cycle_id");

-- CreateIndex: Index on cpap_id for query optimization
CREATE INDEX "cpap_items_cpap_id_idx" ON "cpap_items"("cpap_id");

-- AddForeignKey: cpaps to barangay
ALTER TABLE "cpaps" ADD CONSTRAINT "cpaps_barangay_id_fkey" FOREIGN KEY ("barangay_id") REFERENCES "barangay"("barangay_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: cpaps to survey_cycle
ALTER TABLE "cpaps" ADD CONSTRAINT "cpaps_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "survey_cycle"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: cpap_items to cpaps
ALTER TABLE "cpap_items" ADD CONSTRAINT "cpap_items_cpap_id_fkey" FOREIGN KEY ("cpap_id") REFERENCES "cpaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data Migration: Update existing 'viewer' roles to 'officer'
UPDATE "user" SET "role" = 'officer' WHERE "role" = 'viewer';
