-- CreateTable
CREATE TABLE "salary_profiles" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "monthlySalary" DECIMAL(65,30) NOT NULL,
    "overtimeEligible" BOOLEAN NOT NULL DEFAULT false,
    "overtimeMultiplier" DECIMAL(5,2),
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_profiles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "salary_profiles" ADD CONSTRAINT "salary_profiles_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
