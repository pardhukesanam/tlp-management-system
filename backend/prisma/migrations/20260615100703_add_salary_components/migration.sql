/*
  Warnings:

  - You are about to drop the `SalaryComponent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SalaryComponent" DROP CONSTRAINT "SalaryComponent_salaryProfileId_fkey";

-- DropTable
DROP TABLE "SalaryComponent";

-- CreateTable
CREATE TABLE "salary_components" (
    "id" TEXT NOT NULL,
    "salaryProfileId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "componentType" "SalaryComponentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "salary_components" ADD CONSTRAINT "salary_components_salaryProfileId_fkey" FOREIGN KEY ("salaryProfileId") REFERENCES "salary_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
