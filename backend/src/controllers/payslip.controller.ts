import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class PayslipController {

  static async getPayslips(
    req: Request,
    res: Response
  ) {
    try {

      const payslips =
        await prisma.payslip.findMany({
          include: {
            payroll: {
              include: {
                employee: true,
                components: true,
              },
            },
          },

          orderBy: {
            generatedAt: "desc",
          },
        });

      return res.status(200).json(
        payslips
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }

  static async getPayslipById(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {

      const { id } = req.params;

      const payslip =
        await prisma.payslip.findUnique({
          where: { id },

          include: {
            payroll: {
              include: {
                employee: true,
              },
            },
          },
        });

      if (!payslip) {
        return res.status(404).json({
          message:
            "Payslip not found",
        });
      }

      return res.status(200).json(
        payslip
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }

  static async getDetailedPayslip(
    req: Request<{ payrollId: string }>,
    res: Response
  ) {
    try {
      const { payrollId } = req.params;

      const payroll =
        await prisma.payroll.findUnique({
          where: {
            id: payrollId,
          },
          include: {
            employee: true,
            components: true,
          },
        });
      if (!payroll) {
        return res.status(404).json({
          message: "Payroll not found",
        });
      }

      const earnings =
        payroll.components.filter(
          component =>
            component.componentType ===
            "EARNING"
        );

      const deductions =
        payroll.components.filter(
          component =>
            component.componentType ===
            "DEDUCTION"
        );

      const grossSalary =
        earnings.reduce(
          (sum, component) =>
            sum +
            Number(component.amount),
          0
        );

      const totalDeductions =
        deductions.reduce(
          (sum, component) =>
            sum +
            Number(component.amount),
          0
        );
      return res.status(200).json({
        employee: {
          id: payroll.employee.id,
          name:
            `${payroll.employee.firstName} ${payroll.employee.lastName}`,
          designation:
            payroll.employee.designation,
          employeeCode:
            payroll.employee.employeeCode,
        },
        payrollMonth:
          payroll.payrollMonth,
        payrollYear:
          payroll.payrollYear,
        earnings,
        deductions,
        grossSalary,
        totalDeductions,
        netSalary:
          Number(payroll.netSalary),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }
}