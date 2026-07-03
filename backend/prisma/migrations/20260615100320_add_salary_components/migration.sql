-- CreateEnum
CREATE TYPE "SalaryComponentType" AS ENUM ('EARNING', 'DEDUCTION');

-- CreateTable
CREATE TABLE "SalaryComponent" (
    "id" TEXT NOT NULL,
    "salaryProfileId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "componentType" "SalaryComponentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalaryComponent" ADD CONSTRAINT "SalaryComponent_salaryProfileId_fkey" FOREIGN KEY ("salaryProfileId") REFERENCES "salary_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
