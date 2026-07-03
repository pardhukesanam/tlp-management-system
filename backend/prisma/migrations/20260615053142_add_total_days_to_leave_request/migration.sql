/*
  Warnings:

  - Added the required column `totalDays` to the `leave_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leave_requests" ADD COLUMN     "totalDays" INTEGER NOT NULL;
