import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { generatePayslipPdf } from "../utils/payslipPdf";
import { getWorkingDaysInMonth } from "../utils/payroll";
import { AuthRequest } from "../middleware/auth.middleware";

export class PayrollController {


  static async generatePayroll(
    req: Request,
    res: Response
  ) {
    try {
      console.log("BODY:", req.body);
      console.log("=== GENERATE PAYROLL HIT ===");

      const {
        employeeId,
        payrollMonth,
        payrollYear,
      } = req.body;

      if (
        !employeeId ||
        !payrollMonth ||
        !payrollYear
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

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

      const existingPayroll =
        await prisma.payroll.findFirst({
          where: {
            employeeId,
            payrollMonth,
            payrollYear,
          },
        });

      if (existingPayroll) {
        return res.status(400).json({
          message: "Payroll already generated",
        });
      }

      const payrollDate =
        new Date(
          Date.UTC(
            payrollYear,
            payrollMonth - 1,
            1
          )
        );

      console.log(
        "Employee ID:",
        employeeId
      );

      console.log(
        "Payroll Date:",
        payrollDate
      );
      const salaryProfile =
        await prisma.salaryProfile.findFirst({
          where: {
            employeeId,
            effectiveDate: {
              lte: payrollDate,
            },
          },
          orderBy: [
            {
              effectiveDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
        });

      console.log("salaryProfile:", salaryProfile);

      if (!salaryProfile) {
        return res.status(404).json({
          message: "Salary profile not found",
        });
      }

      const components =
        await prisma.salaryComponent.findMany({
          where: {
            salaryProfileId:
              salaryProfile.id,
          },
        });

      const grossSalary = components
        .filter(c => c.componentType === "EARNING")
        .reduce((sum, c) => sum + Number(c.amount), 0);

      const regularDeductions = components
        .filter(c => c.componentType === "DEDUCTION")
        .reduce((sum, c) => sum + Number(c.amount), 0);

      const workingDays =
        await getWorkingDaysInMonth(
          payrollMonth,
          payrollYear
        );

      console.log(
        "Working Days:",
        workingDays
      );

      const unpaidLeaves =
        await prisma.leaveRequest.findMany({
          where: {
            employeeId,

            status: "APPROVED",

            leaveType: {
              name: "Loss of Pay",
            },

            startDate: {
              gte: new Date(
                payrollYear,
                payrollMonth - 1,
                1
              ),
            },

            endDate: {
              lte: new Date(
                payrollYear,
                payrollMonth,
                0
              ),
            },
          },

          include: {
            leaveType: true,
          },
        });

      const unpaidLeaveDays =
        unpaidLeaves.reduce(
          (sum, leave) =>
            sum + leave.totalDays,
          0
        );

      const dailyRate =
        grossSalary /
        workingDays;

      const leaveDeduction =
        Number(
          (
            dailyRate *
            unpaidLeaveDays
          ).toFixed(2)
        );

      const totalDeductions =
        regularDeductions + leaveDeduction;

      const netSalary = Number(
        (
          grossSalary -
          totalDeductions
        ).toFixed(2)
      );

      const payroll =
        await prisma.payroll.create({
          data: {
            employeeId,

            payrollMonth,
            payrollYear,

            baseSalary: grossSalary,

            unpaidLeaveDays,

            leaveDeduction,

            netSalary,

            status: "DRAFT",

            generatedAt: new Date(),
          },
        });

      const salaryComponents =
        await prisma.salaryComponent.findMany({
          where: {
            salaryProfileId:
              salaryProfile.id,
          },
        });

      console.log(
        "Payroll Components Payload:",
        [
          ...salaryComponents.map(
            component => ({
              payrollId: payroll.id,
              name: component.componentName,
              amount: component.amount,
              componentType: component.componentType,
            })
          ),
          {
            payrollId: payroll.id,
            name: "Loss Of Pay",
            amount: leaveDeduction,
            componentType: "DEDUCTION",
          },
        ]
      );

      const result = await prisma.payrollComponent.createMany({
        data: [
          ...salaryComponents.map((component) => ({
            payrollId: payroll.id,
            name: component.componentName,
            amount: component.amount,
            componentType: component.componentType,
            displayOrder: component.displayOrder,
          })),
          {
            payrollId: payroll.id,
            name: "Loss Of Pay",
            amount: leaveDeduction,
            componentType: "DEDUCTION",
            displayOrder: 999,
          },
        ],
      });

      console.log("CreateMany Result:", result);

      return res.status(201).json({
        message:
          "Payroll generated successfully",

        payroll,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }

  static async getPayrolls(
    req: Request,
    res: Response
  ) {
    try {

      const {
        status,
        month,
        year,
        employeeId,
      } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (month) {
        where.payrollMonth =
          Number(month);
      }

      if (year) {
        where.payrollYear =
          Number(year);
      }

      if (employeeId) {
        where.employeeId =
          employeeId;
      }

      const payrolls =
        await prisma.payroll.findMany({
          where,

          include: {
            employee: true,
          },

          orderBy: [
            {
              payrollYear: "desc",
            },
            {
              payrollMonth: "desc",
            },
          ],
        });

      console.log(
        "Payroll Created:",
        payrolls
      );

      return res.status(200).json(
        payrolls
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });

    }
  }

  static async getPayrollById(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {

      const { id } = req.params;

      const payroll =
        await prisma.payroll.findUnique({
          where: { id },

          include: {
            employee: true,
          },
        });

      if (!payroll) {
        return res.status(404).json({
          message: "Payroll not found",
        });
      }

      const earnings =
        await prisma.payrollComponent.findMany({
          where: {
            payrollId: payroll.id,
            componentType: "EARNING",
          },
          orderBy: {
            displayOrder: "asc",
          },
        });

      const deductions =
        await prisma.payrollComponent.findMany({
          where: {
            payrollId: payroll.id,
            componentType: "DEDUCTION",
          },
          orderBy: {
            displayOrder: "asc",
          },
        });

      return res.status(200).json({
        employee: {
          employeeCode:
            payroll.employee.employeeCode,

          name:
            `${payroll.employee.firstName} ${payroll.employee.lastName}`,

          designation:
            payroll.employee.designation,
        },

        payrollMonth:
          payroll.payrollMonth,

        payrollYear:
          payroll.payrollYear,

        earnings: earnings.map(item => ({
          name: item.name,
          amount: item.amount,
        })),

        deductions: deductions.map(item => ({
          name: item.name,
          amount: item.amount,
        })),

        grossEarnings:
          Number(payroll.baseSalary),

        totalDeductions:
          Number(payroll.leaveDeduction),

        netSalary:
          Number(payroll.netSalary),

        status:
          payroll.status,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async approvePayroll(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const payroll = await prisma.payroll.findUnique({
        where: {
          id,
        },
      });

      if (!payroll) {
        return res.status(404).json({
          message: "Payroll not found",
        });
      }

      if (payroll.status !== "DRAFT") {
        return res.status(400).json({
          message: "Payroll is already processed",
        });
      }

      const updatedPayroll = await prisma.payroll.update({
        where: {
          id,
        },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });

      await prisma.payslip.create({
        data: {
          payrollId: updatedPayroll.id,
        },
      });

      return res.status(200).json({
        message: "Payroll approved successfully",
        payroll: updatedPayroll,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async markPayrollPaid(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {

      const id = req.params.id as string;

      const payroll =
        await prisma.payroll.findUnique({
          where: {
            id,
          },
        });

      if (!payroll) {
        return res.status(404).json({
          message: "Payroll not found",
        });
      }

      if (payroll.status !== "APPROVED") {
        return res.status(400).json({
          message:
            "Payroll must be approved first",
        });
      }

      const updatedPayroll =
        await prisma.payroll.update({
          where: {
            id,
          },

          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

      return res.status(200).json({
        message: "Payroll marked as paid",
        payroll: updatedPayroll,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getPayslip(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {

      const { id } = req.params;

      const payroll =
        await prisma.payroll.findUnique({
          where: { id },

          include: {
            employee: true,
          },
        });

      if (!payroll) {
        return res.status(404).json({
          message: "Payroll not found",
        });
      }

      const earnings =
        await prisma.payrollComponent.findMany({
          where: {
            payrollId: payroll.id,
            componentType: "EARNING",
          },
        });

      const deductions =
        await prisma.payrollComponent.findMany({
          where: {
            payrollId: payroll.id,
            componentType: "DEDUCTION",
          },
        });

      return res.status(200).json({

        company: {
          name: "Dugong Global Services Pvt Ltd",
        },

        employee: {
          employeeCode:
            payroll.employee.employeeCode,

          name:
            `${payroll.employee.firstName} ${payroll.employee.lastName}`,

          designation:
            payroll.employee.designation,
        },

        payroll: {
          month:
            payroll.payrollMonth,

          year:
            payroll.payrollYear,

          status:
            payroll.status,
        },

        earnings:
          earnings.map(item => ({
            name: item.name,
            amount: item.amount,
          })),

        deductions:
          deductions.map(item => ({
            name: item.name,
            amount: item.amount,
          })),

        grossEarnings:
          Number(payroll.baseSalary),

        totalDeductions:
          Number(payroll.leaveDeduction),

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

  static async downloadPayslipPdf(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {

      const { id } = req.params;

      const payroll =
        await prisma.payroll.findUnique({
          where: { id },

          include: {
            employee: true,
          },
        });

      if (!payroll) {
        return res.status(404).json({
          message: "Payroll not found",
        });
      }

      const earnings =
        await prisma.payrollComponent.findMany({
          where: {
            payrollId: payroll.id,
            componentType: "EARNING",
          },
        });

      const deductions =
        await prisma.payrollComponent.findMany({
          where: {
            payrollId: payroll.id,
            componentType: "DEDUCTION",
          },
        });

      await prisma.payslip.upsert({
        where: {
          payrollId: payroll.id,
        },

        update: {
          generatedAt: new Date(),
        },

        create: {
          payrollId: payroll.id,
        },
      });

      await generatePayslipPdf(
        payroll,
        earnings,
        deductions,
        res
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }

  static async getDashboardStats(
    req: Request,
    res: Response
  ) {
    try {

      const totalEmployees =
        await prisma.employee.count();

      const totalPayrolls =
        await prisma.payroll.count();

      const paidPayrolls =
        await prisma.payroll.count({
          where: {
            status: "PAID",
          },
        });

      const approvedPayrolls =
        await prisma.payroll.count({
          where: {
            status: "APPROVED",
          },
        });

      const draftPayrolls =
        await prisma.payroll.count({
          where: {
            status: "DRAFT",
          },
        });

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const payrolls =
        await prisma.payroll.findMany({
          where: {
            payrollMonth: currentMonth,
            payrollYear: currentYear,
          },
          select: {
            netSalary: true,
          },
        });
      const totalPayrollAmount =
        payrolls.reduce(
          (sum, payroll) =>
            sum + Number(payroll.netSalary),
          0
        );

      return res.status(200).json({
        totalEmployees,
        totalPayrolls,
        paidPayrolls,
        approvedPayrolls,
        draftPayrolls,
        totalPayrollAmount,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }

  static async getMonthlySummary(
    req: Request,
    res: Response
  ) {
    try {

      const payrolls =
        await prisma.payroll.findMany({
          orderBy: [
            {
              payrollYear: "desc",
            },
            {
              payrollMonth: "desc",
            },
          ],
        });

      const summary =
        payrolls.reduce(
          (acc: any, payroll) => {

            const key =
              `${payroll.payrollMonth}-${payroll.payrollYear}`;

            if (!acc[key]) {

              acc[key] = {
                month:
                  payroll.payrollMonth,

                year:
                  payroll.payrollYear,

                payrollCount: 0,

                totalAmount: 0,
              };
            }

            acc[key].payrollCount += 1;

            acc[key].totalAmount +=
              Number(
                payroll.netSalary
              );

            return acc;

          },
          {}
        );

      return res.status(200).json(
        Object.values(summary)
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });

    }
  }

  static async generatePayrollForAllEmployees(
    req: Request,
    res: Response
  ) {
    try {

      const {
        payrollMonth,
        payrollYear,
      } = req.body;

      if (
        !payrollMonth ||
        !payrollYear
      ) {
        return res.status(400).json({
          message:
            "Payroll month and year are required",
        });
      }
      const employees =
        await prisma.employee.findMany();
      const results = [];
      for (const employee of employees) {
        try {
          const existingPayroll =
            await prisma.payroll.findFirst({
              where: {
                employeeId: employee.id,
                payrollMonth,
                payrollYear,
              },
            });
          if (existingPayroll) {
            continue;
          }

          // Call helper method later
          results.push({
            employeeId: employee.id,
            employeeName:
              `${employee.firstName} ${employee.lastName}`,
          });
        } catch (error) {
          console.error(
            `Failed for employee ${employee.id}`,
            error
          );

        }
      }
      return res.status(200).json({
        message:
          "Payroll generation started",

        processedEmployees:
          results.length,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message:
          "Internal server error",
      });

    }
  }

  static async getMyPayrolls(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const userId = req.user.id;
      const employee =
        await prisma.employee.findUnique({
          where: {
            userId,
          },
        });
      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }
      const payrolls =
        await prisma.payroll.findMany({

          where: {
            employeeId: employee.id,
          },

          include: {
            payslip: true,
          },

          orderBy: [
            {
              payrollYear: "desc",
            },
            {
              payrollMonth: "desc",
            },
          ],

        });
      return res.status(200).json(
        payrolls
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}