import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class LeaveTypeController {
  static async getLeaveTypes(
    req: Request,
    res: Response
  ) {
    try {
      const leaveTypes =
        await prisma.leaveType.findMany({
          orderBy: {
            name: "asc",
          },
        });
      return res.status(200).json(
        leaveTypes
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async createLeaveType(
    req: Request,
    res: Response
  ) {
    try {
      const {
        name,
        isPaid,
      } = req.body;
      const leaveType =
        await prisma.leaveType.create({
          data: {
            name,
            isPaid,
          },
        });
      return res.status(201).json(
        leaveType
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}