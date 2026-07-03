import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendEmail } from "../utils/mail";

export class LeaveController {
  static async createLeaveRequest(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const {
        leaveTypeId,
        startDate,
        endDate,
        reason,
      } = req.body;

      if (
        !leaveTypeId ||
        !startDate ||
        !endDate ||
        !reason
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      if (
        new Date(startDate) >
        new Date(endDate)
      ) {
        return res.status(400).json({
          message:
            "Start date cannot be after end date",
        });
      }
      const employee =
        await prisma.employee.findUnique({
          where: {
            userId: req.user.id,
          },
        });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      const totalDays =
        Math.ceil(
          (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
        ) + 1;

      const leaveRequest =
        await prisma.leaveRequest.create({
          data: {
            employeeId: employee.id,
            leaveTypeId,

            startDate: start,
            endDate: end,

            totalDays,

            reason,
          },
        });

      return res.status(201).json({
        message:
          "Leave request submitted successfully",
        leaveRequest,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getMyLeaves(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const employee =
        await prisma.employee.findUnique({
          where: {
            userId: req.user.id,
          },
        });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const leaves =
        await prisma.leaveRequest.findMany({
          where: {
            employeeId: employee.id,
          },
          include: {
            leaveType: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.status(200).json(leaves);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getPendingLeaves(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const leaves =
        await prisma.leaveRequest.findMany({
          where: {
            status: "PENDING",
          },

          include: {
            employee: true,
            leaveType: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      return res.status(200).json(leaves);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async approveLeave(
    req: AuthRequest & {
      params: {
        id: string;
      };
    },
    res: Response
  ) {
    try {
      const { id } = req.params;

      const leave =
        await prisma.leaveRequest.findUnique({
          where: { id },
        });

      if (!leave) {
        return res.status(404).json({
          message: "Leave request not found",
        });
      }

      if (leave.status !== "PENDING") {
        return res.status(400).json({
          message: "Leave request already processed",
        });
      }

      const balance =
        await prisma.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId: {
              employeeId: leave.employeeId,
              leaveTypeId: leave.leaveTypeId,
            },
          },
        });

      if (!balance) {
        return res.status(400).json({
          message: "Leave balance not assigned",
        });
      }

      const remaining =
        balance.allocatedDays -
        balance.usedDays;

      if (remaining < leave.totalDays) {
        return res.status(400).json({
          message:
            "Insufficient leave balance",
        });
      }

      const updatedLeave =
        await prisma.$transaction(
          async (tx) => {

            const updatedLeave =
              await tx.leaveRequest.update({
                where: { id },

                data: {
                  status: "APPROVED",
                  reviewedBy: req.user.id,
                  reviewedAt: new Date(),
                },
              });

            await tx.leaveBalance.update({
              where: {
                employeeId_leaveTypeId: {
                  employeeId: leave.employeeId,
                  leaveTypeId: leave.leaveTypeId,
                },
              },

              data: {
                usedDays: {
                  increment: leave.totalDays,
                },
              },
            });

            return updatedLeave;
          }
        );

      const employee =
        await prisma.employee.findUnique({
          where: {
            id: leave.employeeId,
          },
          include: {
            user: true,
          },
        });

      if (employee?.user?.email) {
        await sendEmail(
          employee.user.email,
          "Leave Request Approved",
          `
    <h2>Leave Approved ✅</h2>

    <p>Hello <b>${employee.firstName}</b>,</p>

    <p>Your leave request has been approved.</p>

    <table>
      <tr>
        <td><b>From</b></td>
        <td>${leave.startDate.toDateString()}</td>
      </tr>

      <tr>
        <td><b>To</b></td>
        <td>${leave.endDate.toDateString()}</td>
      </tr>

      <tr>
        <td><b>Total Days</b></td>
        <td>${leave.totalDays}</td>
      </tr>
    </table>

    <br>

    Regards,<br>
    <b>Dugong Global Services</b>
    `
        );
      }
      return res.status(200).json({
        message: "Leave approved successfully",
        leave: updatedLeave,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async rejectLeave(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const leave =
        await prisma.leaveRequest.findUnique({
          where: { id },
        });

      if (!leave) {
        return res.status(404).json({
          message: "Leave request not found",
        });
      }

      if (leave.status !== "PENDING") {
        return res.status(400).json({
          message: "Leave request already processed",
        });
      }

      const updatedLeave =
        await prisma.leaveRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
          },
        });

      const employee =
        await prisma.employee.findUnique({
          where: {
            id: leave.employeeId,
          },
          include: {
            user: true,
          },
        });

      if (employee?.user?.email) {
        await sendEmail(
          employee.user.email,
          "Leave Request Rejected",
          `
        <h2>Leave Rejected ❌</h2>

        <p>Hello <b>${employee.firstName}</b>,</p>

        <p>Your leave request has been rejected.</p>

        <table>
          <tr>
            <td><b>From</b></td>
            <td>${leave.startDate.toDateString()}</td>
          </tr>

          <tr>
            <td><b>To</b></td>
            <td>${leave.endDate.toDateString()}</td>
          </tr>

          <tr>
            <td><b>Total Days</b></td>
            <td>${leave.totalDays}</td>
          </tr>
        </table>

        <br>

        Regards,<br>
        <b>Dugong Global Services</b>
        `
        );
      }

      return res.status(200).json({
        message: "Leave rejected successfully",
        leave: updatedLeave,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async cancelLeave(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const employee = await prisma.employee.findUnique({
        where: {
          userId: req.user.id,
        },
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const leave = await prisma.leaveRequest.findUnique({
        where: {
          id,
        },
      });

      if (!leave) {
        return res.status(404).json({
          message: "Leave request not found",
        });
      }

      if (leave.employeeId !== employee.id) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      if (leave.status !== "PENDING") {
        return res.status(400).json({
          message: "Only pending leave requests can be cancelled",
        });
      }

      const cancelledLeave =
        await prisma.leaveRequest.update({
          where: {
            id,
          },
          data: {
            status: "CANCELLED",
          },
        });

      return res.status(200).json({
        message: "Leave request cancelled successfully",
        leave: cancelledLeave,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getAllLeaves(
    req: AuthRequest,
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

      return res.status(200).json(
        leaves
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });

    }
  }
  static async getAllBalances(
    req: AuthRequest,
    res: Response
  ) {
    const balances =
      await prisma.leaveBalance.findMany({
        include: {
          employee: true,
          leaveType: true,
        },
      });

    return res.status(200).json(balances);
  }
}