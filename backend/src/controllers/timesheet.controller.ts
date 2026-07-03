import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { isValidTime, timeToMinutes, } from "../utils/time";

export class TimesheetController {

  static async getMyTimesheets(
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

      const timesheets =
        await prisma.timeEntry.findMany({
          where: {
            employeeId: employee.id,
          },

          orderBy: {
            workDate: "desc",
          },
        });

      return res.status(200).json(
        timesheets
      );

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async getPendingTimesheets(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const entries =
        await prisma.timeEntry.findMany({
          where: {
            status: "PENDING",
          },

          include: {
            employee: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      return res.status(200).json(entries);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async approveTimesheet(
    req: AuthRequest,
    res: Response
  ) {
    try {

      const id = req.params.id as string;

      const entry =
        await prisma.timeEntry.findUnique({
          where: { id },
        });

      if (!entry) {
        return res.status(404).json({
          message: "Timesheet not found",
        });
      }

      if (entry.status !== "PENDING") {
        return res.status(400).json({
          message:
            "Timesheet already processed",
        });
      }

      const updatedEntry =
        await prisma.timeEntry.update({
          where: { id },

          data: {
            status: "APPROVED",
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
          },
        });

      return res.status(200).json({
        message:
          "Timesheet approved successfully",
        timeEntry: updatedEntry,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async rejectTimesheet(
    req: AuthRequest,
    res: Response
  ) {
    try {

      const id = req.params.id as string;
      const { rejectionReason } = req.body;

      if (!rejectionReason?.trim()) {
        return res.status(400).json({
          message: "Rejection reason is required",
        });
      }

      const entry = await prisma.timeEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        return res.status(404).json({
          message: "Timesheet not found",
        });
      }

      if (entry.status !== "PENDING") {
        return res.status(400).json({
          message: "Timesheet already processed",
        });
      }

      const updatedEntry = await prisma.timeEntry.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          rejectionReason,
        },
      });

      return res.status(200).json({
        message: "Timesheet rejected successfully",
        timeEntry: updatedEntry,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async createTimeEntry(
    req: AuthRequest,
    res: Response
  ) {
    try {

      const { workDate } = req.body;

      if (!workDate) {
        return res.status(400).json({
          message: "Work date is required",
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

      const existing =
        await prisma.timeEntry.findUnique({
          where: {
            employeeId_workDate: {
              employeeId: employee.id,
              workDate: new Date(workDate),
            },
          },
        });

      if (existing) {
        return res.status(409).json({
          message: "Work log already exists",
        });
      }

      const timeEntry =
        await prisma.timeEntry.create({
          data: {
            employeeId: employee.id,
            workDate: new Date(workDate),
            status: "DRAFT",
          },
        });

      return res.status(201).json({
        message: "Work log created successfully",
        timeEntry,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });

    }
  }

  static async addActivity(
    req: AuthRequest,
    res: Response
  ) {
    try {

      const id = req.params.id as string;

      const {
        startTime,
        endTime,
        activity,
        activityType,
      } = req.body;

      if (
        !startTime ||
        !endTime ||
        !activity
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      if (
        !isValidTime(startTime) ||
        !isValidTime(endTime)
      ) {
        return res.status(400).json({
          message: "Invalid time format. Use HH:mm",
        });
      }

      if (
        timeToMinutes(endTime) <=
        timeToMinutes(startTime)
      ) {
        return res.status(400).json({
          message: "End time must be after start time",
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

      const timeEntry =
        await prisma.timeEntry.findUnique({
          where: {
            id,
          },
        });

      if (!timeEntry) {
        return res.status(404).json({
          message: "Work log not found",
        });
      }

      if (
        timeEntry.employeeId !== employee.id
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      if (
        timeEntry.status === "APPROVED"
      ) {
        return res.status(400).json({
          message:
            "Approved work logs cannot be modified",
        });
      }

      const existingActivities =
        await prisma.workLogEntry.findMany({
          where: {
            timeEntryId: id,
          },
        });

      for (const existing of existingActivities) {
        const existingStart =
          timeToMinutes(existing.startTime);
        const existingEnd =
          timeToMinutes(existing.endTime);
        const newStart =
          timeToMinutes(startTime);
        const newEnd =
          timeToMinutes(endTime);
        const overlaps =
          newStart < existingEnd &&
          newEnd > existingStart;
        if (overlaps) {
          return res.status(400).json({
            message:
              "This activity overlaps with an existing activity.",
          });
        }
      }

      const workLog =
        await prisma.workLogEntry.create({
          data: {
            timeEntryId: id,
            startTime,
            endTime,
            activity,
            activityType:
              activityType ?? "WORK",
          },
        });

      return res.status(201).json({
        message:
          "Activity added successfully",
        workLog,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });

    }
  }

  static async getTodayWorkLog(
    req: AuthRequest,
    res: Response
  ) {
    try {
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let workLog = await prisma.timeEntry.findUnique({
        where: {
          employeeId_workDate: {
            employeeId: employee.id,
            workDate: today,
          },
        },
        include: {
          activities: {
            orderBy: {
              startTime: "asc",
            },
          },
        },
      });

      if (!workLog) {
        workLog = await prisma.timeEntry.create({
          data: {
            employeeId: employee.id,
            workDate: today,
            status: "DRAFT",
          },
          include: {
            activities: true,
          },
        });
      }

      return res.status(200).json(workLog);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async submitWorkLog(
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

      const workLog = await prisma.timeEntry.findUnique({
        where: {
          id,
        },
        include: {
          activities: true,
        },
      });

      if (!workLog) {
        return res.status(404).json({
          message: "Work log not found",
        });
      }

      if (workLog.employeeId !== employee.id) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      if (workLog.activities.length === 0) {
        return res.status(400).json({
          message: "Add at least one activity before submitting",
        });
      }

      const updated = await prisma.timeEntry.update({
        where: {
          id,
        },
        data: {
          status: "PENDING",
          reviewedBy: null,
          reviewedAt: null,
          rejectionReason: null,
        },
      });

      return res.status(200).json({
        message: "Work log submitted successfully",
        workLog: updated,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async updateActivity(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const activityId = req.params.activityId as string;

      const {
        startTime,
        endTime,
        activity,
        activityType,
      } = req.body;

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

      const workActivity = await prisma.workLogEntry.findUnique({
        where: {
          id: activityId,
        },
        include: {
          timeEntry: true,
        },
      });

      if (!workActivity) {
        return res.status(404).json({
          message: "Activity not found",
        });
      }

      if (workActivity.timeEntry.employeeId !== employee.id) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      if (workActivity.timeEntry.status === "APPROVED") {
        return res.status(400).json({
          message: "Approved work logs cannot be modified",
        });
      }

      const updatedActivity = await prisma.workLogEntry.update({
        where: {
          id: activityId,
        },
        data: {
          startTime,
          endTime,
          activity,
          activityType,
        },
      });

      return res.status(200).json({
        message: "Activity updated successfully",
        activity: updatedActivity,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async deleteActivity(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const activityId = req.params.activityId as string;

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

      const activity = await prisma.workLogEntry.findUnique({
        where: {
          id: activityId,
        },
        include: {
          timeEntry: true,
        },
      });

      if (!activity) {
        return res.status(404).json({
          message: "Activity not found",
        });
      }

      if (activity.timeEntry.employeeId !== employee.id) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      if (activity.timeEntry.status === "APPROVED") {
        return res.status(400).json({
          message: "Approved work logs cannot be modified",
        });
      }

      await prisma.workLogEntry.delete({
        where: {
          id: activityId,
        },
      });

      return res.status(200).json({
        message: "Activity deleted successfully",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getTimesheetById(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const workLog = await prisma.timeEntry.findUnique({
        where: {
          id,
        },
        include: {
          employee: {
            include: {
              user: true,
            },
          },
          activities: {
            orderBy: {
              startTime: "asc",
            },
          },
        },
      });

      if (!workLog) {
        return res.status(404).json({
          message: "Work log not found",
        });
      }

      return res.status(200).json(workLog);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}