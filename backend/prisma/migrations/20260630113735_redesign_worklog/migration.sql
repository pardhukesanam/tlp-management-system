/*
  Warnings:

  - You are about to drop the column `description` on the `time_entries` table. All the data in the column will be lost.
  - You are about to drop the column `hoursWorked` on the `time_entries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeId,workDate]` on the table `time_entries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WORK', 'BREAK', 'LUNCH', 'MEETING', 'TRAINING', 'OTHER');

-- AlterTable
ALTER TABLE "time_entries" DROP COLUMN "description",
DROP COLUMN "hoursWorked";

-- CreateTable
CREATE TABLE "work_log_entries" (
    "id" TEXT NOT NULL,
    "timeEntryId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL DEFAULT 'WORK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_entries_employeeId_workDate_key" ON "time_entries"("employeeId", "workDate");

-- AddForeignKey
ALTER TABLE "work_log_entries" ADD CONSTRAINT "work_log_entries_timeEntryId_fkey" FOREIGN KEY ("timeEntryId") REFERENCES "time_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
