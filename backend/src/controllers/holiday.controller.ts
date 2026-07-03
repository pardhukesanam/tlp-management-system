import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class HolidayController {
  static async createHoliday(
    req: Request,
    res: Response
  ) {
    try {
      const {
        name,
        holidayDate,
      } = req.body;
      const holiday =
        await prisma.holiday.create({
          data: {
            name,
            holidayDate:
              new Date(holidayDate),
          },
        });
      return res.status(201).json(
        holiday
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async getHolidays(
    req: Request,
    res: Response
  ) {
    try {
      const holidays =
        await prisma.holiday.findMany({
          orderBy: {
            holidayDate: "asc",
          },
        });
      return res.status(200).json(
        holidays
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async deleteHoliday(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id as string;
      await prisma.holiday.delete({
        where: { id },
      });
      return res.status(200).json({
        message:
          "Holiday deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }

  static async updateHoliday(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id as string;
      const {
        name,
        holidayDate,
      } = req.body;
      const holiday =
        await prisma.holiday.update({
          where: { id },
          data: {
            name,
            holidayDate:
              new Date(holidayDate),
          },
        });
      return res.status(200).json(
        holiday
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