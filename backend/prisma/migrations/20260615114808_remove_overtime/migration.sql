/*
  Warnings:

  - You are about to drop the column `overtimeHours` on the `payrolls` table. All the data in the column will be lost.
  - You are about to drop the column `overtimePay` on the `payrolls` table. All the data in the column will be lost.
  - You are about to drop the column `overtimeEligible` on the `salary_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `overtimeMultiplier` on the `salary_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payrolls" DROP COLUMN "overtimeHours",
DROP COLUMN "overtimePay";

-- AlterTable
ALTER TABLE "salary_profiles" DROP COLUMN "overtimeEligible",
DROP COLUMN "overtimeMultiplier";
