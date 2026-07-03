import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import ExcelJS from "exceljs";

export class ReportController {

  static async getPayrollReport(
    req: Request,
    res: Response
  ) {
    try {

      const payrolls =
        await prisma.payroll.findMany({
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

      const report =
        payrolls.map((payroll) => ({
          payrollId: payroll.id,

          employeeCode:
            payroll.employee.employeeCode,

          employeeName:
            `${payroll.employee.firstName} ${payroll.employee.lastName}`,

          designation:
            payroll.employee.designation,

          month:
            payroll.payrollMonth,

          year:
            payroll.payrollYear,

          status:
            payroll.status,

          netSalary:
            Number(payroll.netSalary),

          generatedAt:
            payroll.generatedAt,
        }));

      return res.status(200).json(
        report
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Internal server error",
      });

    }
  }

  static async exportPayrollReport(
  req: Request,
  res: Response
) {
  try {

    console.log("EXPORT PAYROLL REPORT HIT");
    console.log("BEFORE QUERY");
    console.log("AFTER QUERY");
    const payrolls =
      await prisma.payroll.findMany({
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

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Payroll Report"
      );

    worksheet.columns = [
      {
        header: "Employee Code",
        key: "employeeCode",
        width: 20,
      },
      {
        header: "Employee Name",
        key: "employeeName",
        width: 25,
      },
      {
        header: "Designation",
        key: "designation",
        width: 30,
      },
      {
        header: "Month",
        key: "month",
        width: 10,
      },
      {
        header: "Year",
        key: "year",
        width: 10,
      },
      {
        header: "Status",
        key: "status",
        width: 15,
      },
      {
        header: "Net Salary",
        key: "netSalary",
        width: 20,
      },
    ];

    payrolls.forEach(
      (payroll) => {

        worksheet.addRow({

          employeeCode:
            payroll.employee.employeeCode,

          employeeName:
            `${payroll.employee.firstName} ${payroll.employee.lastName}`,

          designation:
            payroll.employee.designation,

          month:
            payroll.payrollMonth,

          year:
            payroll.payrollYear,

          status:
            payroll.status,

          netSalary:
            Number(
              payroll.netSalary
            ),

        });

      }
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=payroll-report.xlsx"
    );

    await workbook.xlsx.write(
      res
    );

    res.end();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
}
static async getLeaveReport(
  req: Request,
  res: Response
) {
  try {

    const leaves =
      await prisma.leaveRequest.findMany({
        include: {
          employee: true,
          leaveType: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const report =
      leaves.map((leave) => ({
        leaveId: leave.id,

        employeeCode:
          leave.employee.employeeCode,

        employeeName:
          `${leave.employee.firstName} ${leave.employee.lastName}`,

        leaveType:
          leave.leaveType.name,

        startDate:
          leave.startDate,

        endDate:
          leave.endDate,

        status:
          leave.status,

        reason:
          leave.reason,
      }));

    return res.status(200).json(
      report
    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });

  }
}
}