import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthService } from "../services/auth.service";
import { generatePassword } from "../utils/password";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendEmail } from "../utils/mail";

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

      await sendEmail(
        email,
        "Welcome to Dharitri HRMS",
        `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2>Welcome to Dugong HRMS 🎉</h2>

    <p>Hello <strong>${firstName} ${lastName}</strong>,</p>

    <p>Your employee account has been created successfully.</p>

    <table style="border-collapse:collapse;">
      <tr>
        <td><strong>Employee Code</strong></td>
        <td>${employee.employeeCode}</td>
      </tr>
      <tr>
        <td><strong>Email</strong></td>
        <td>${email}</td>
      </tr>
      <tr>
        <td><strong>Temporary Password</strong></td>
        <td>${temporaryPassword}</td>
      </tr>
    </table>

    <br>

    <p>
      Please log in using the above credentials.
      You will be required to change your password on your first login.
    </p>

    <br>

    <p>
      Regards,<br>
      <strong>Dugong HRMS</strong>
    </p>
  </div>
  `
      );
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