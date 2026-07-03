import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class SalaryProfileController {

  static async createSalaryProfile(
    req: Request,
    res: Response
  ) {
    try {

      const {
        employeeId,
        monthlySalary,
        basicPay,
        hra,
        specialAllowance,
        travelAllowance,
        bonus,
        effectiveDate,
      } = req.body;

      if (
        !employeeId ||
        !monthlySalary ||
        !effectiveDate
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      console.log("=== CREATE SALARY PROFILE ===");
      console.log("BODY:", req.body);
      console.log("EMPLOYEE ID:", employeeId);

      const employee =
        await prisma.employee.findUnique({
          where: {
            id: employeeId,
          },
        });

      console.log("EMPLOYEE FOUND:", employee);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const salaryProfile =
        await prisma.salaryProfile.create({
          data: {
            employeeId,
            monthlySalary,

            effectiveDate:
              new Date(effectiveDate),
          },
        });

      const existingProfile =
        await prisma.salaryProfile.findFirst({
          where: {
            employeeId,
            effectiveDate: new Date(effectiveDate),
          },
        });

      if (existingProfile) {
        return res.status(400).json({
          message:
            "Salary profile already exists for this effective date",
        });
      }

      await prisma.salaryComponent.createMany({
        data: [
          {
            salaryProfileId: salaryProfile.id,
            componentName: "Basic Pay",
            amount: basicPay ?? 0,
            componentType: "EARNING",
          },
          {
            salaryProfileId: salaryProfile.id,
            componentName: "HRA",
            amount: hra ?? 0,
            componentType: "EARNING",
          },
          {
            salaryProfileId: salaryProfile.id,
            componentName: "Special Allowance",
            amount: specialAllowance ?? 0,
            componentType: "EARNING",
          },
          {
            salaryProfileId: salaryProfile.id,
            componentName: "Travel Allowance",
            amount: travelAllowance ?? 0,
            componentType: "EARNING",
          },
          {
            salaryProfileId: salaryProfile.id,
            componentName: "Bonus",
            amount: bonus ?? 0,
            componentType: "EARNING",
          },
        ],
      });

      return res.status(201).json({
        message:
          "Salary profile created successfully",
        profile: salaryProfile,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }


  }
  static async getSalaryProfiles(
    req: Request,
    res: Response
  ) {
    try {

      const profiles =
        await prisma.salaryProfile.findMany({
          include: {
            employee: true,
            components: true,
          },

          orderBy: {
            effectiveDate: "desc",
          },
        });

      return res.status(200).json(profiles);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async getEmployeeSalaryProfiles(
    req: Request<{ employeeId: string }>,
    res: Response
  ) {
    try {

      const { employeeId } = req.params;

      const employee =
        await prisma.employee.findUnique({
          where: {
            id: employeeId,
          },
        });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const profiles =
        await prisma.salaryProfile.findMany({
          where: {
            employeeId,
          },

          include: {
            components: true,
          },

          orderBy: {
            effectiveDate: "desc",
          },
        });

      return res.status(200).json(profiles);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async updateSalaryProfile(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {
      const { id } = req.params;
      const {
        monthlySalary,
        effectiveDate,
      } = req.body;
      const profile =
        await prisma.salaryProfile.findUnique({
          where: { id },
        });
      if (!profile) {
        return res.status(404).json({
          message: "Salary profile not found",
        });
      }
      const updatedProfile =
        await prisma.salaryProfile.update({
          where: { id },

          data: {
            monthlySalary,
            effectiveDate:
              effectiveDate
                ? new Date(effectiveDate)
                : undefined,
          },
        });
      return res.status(200).json({
        message:
          "Salary profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}