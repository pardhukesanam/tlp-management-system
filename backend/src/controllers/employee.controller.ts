import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthService } from "../services/auth.service";
import { generatePassword } from "../utils/password";
import { AuthRequest } from "../middleware/auth.middleware";

export class EmployeeController {
  static async createEmployee(
    req: Request,
    res: Response
  ) {
    try {

      const firstName = req.body?.firstName;
      const lastName = req.body?.lastName;
      const email = req.body?.email;
      const phone = req.body?.phone;
      const designation = req.body?.designation;
      const joiningDate = req.body?.joiningDate;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !designation ||
        !joiningDate
      ) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const employeeCount =
        await prisma.employee.count();

      const employeeCode = `EMP${String(
        employeeCount + 1
      ).padStart(3, "0")}`;

      const temporaryPassword =
        generatePassword(10);

      const passwordHash =
        await AuthService.hashPassword(
          temporaryPassword
        );

      const user = await prisma.user.create({
        data: {
          username: email.split("@")[0],
          email,
          passwordHash,
          role: "EMPLOYEE",
          mustChangePassword: true,
        },
      });

      const employee =
        await prisma.employee.create({
          data: {
            userId: user.id,

            employeeCode,

            firstName,
            lastName,

            email,
            phone,

            designation,

            joiningDate: new Date(joiningDate),
          },
        });

      await prisma.salaryProfile.create({
        data: {
          employeeId: employee.id,

          monthlySalary: 0,

          effectiveDate: new Date(),
        },
      });

      return res.status(201).json({
        message: "Employee created successfully",

        employee: {
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
        },

        credentials: {
          email,
          temporaryPassword,
        },
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getEmployees(
    req: Request,
    res: Response
  ) {
    try {
      const employees = await prisma.employee.findMany({
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
          designation: true,
          status: true,
        },
        orderBy: {
          employeeCode: "asc",
        },
      });

      return res.status(200).json(employees);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getEmployeeById(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const employee =
        await prisma.employee.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            designation: true,
            joiningDate: true,
            status: true,
          },
        });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      return res.status(200).json(employee);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async updateEmployee(
    req: Request<{ id: string }>,
    res: Response
  ) {
    try {
      const { id } = req.params;

      const {
        firstName,
        lastName,
        phone,
        designation,
        status,
      } = req.body;

      const employee =
        await prisma.employee.findUnique({
          where: { id },
        });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const updatedEmployee =
        await prisma.employee.update({
          where: { id },

          data: {
            firstName,
            lastName,
            phone,
            designation,
            status,
          },
        });

      return res.status(200).json({
        message: "Employee updated successfully",
        employee: updatedEmployee,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async getMyProfile(
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

          include: {

            user: {
              select: {
                username: true,
                email: true,
              },
            },

            leaveBalances: {
              include: {
                leaveType: true,
              },
            },

          },

        });

      if (!employee) {

        return res.status(404).json({
          message: "Employee profile not found",
        });

      }

      return res.status(200).json(employee);

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });

    }
  }
}