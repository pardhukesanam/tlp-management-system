/*
  Warnings:

  - You are about to drop the column `filePath` on the `payslips` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `payslips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payslips" DROP COLUMN "filePath",
ADD COLUMN     "pdfPath" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
