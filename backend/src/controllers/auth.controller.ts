import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateOtp } from "../utils/otp";
import { sendEmail } from "../utils/mail";
import { AuditService } from "../services/audit.service";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          employee: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const validPassword =
        await AuthService.comparePassword(
          password,
          user.passwordHash
        );

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const token =
        AuthService.generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

      await AuditService.log({
        userId: user.id,
        module: "Authentication",
        action: "LOGIN",
        description: `${user.email} logged into the system`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] as string,
      });
      return res.status(200).json({
        token,
        mustChangePassword: user.mustChangePassword,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          employeeId: user.employee?.id ?? null,
        },
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async logout(req: Request, res: Response) {
    return res.status(200).json({
      message: "Logged out successfully",
    });
  }

  static async me(
    req: AuthRequest,
    res: Response
  ) {

    await AuditService.log({
      userId: req.user.id,
      module: "Authentication",
      action: "LOGOUT",
      description: `${req.user.email} logged out`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
    });
    return res.status(200).json({
      user: req.user,
    });
  }

  static async changePassword(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Current password and new password are required",
        });
      }
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      const validPassword =
        await AuthService.comparePassword(
          currentPassword,
          user.passwordHash
        );
      if (!validPassword) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }
      const passwordHash =
        await AuthService.hashPassword(
          newPassword
        );
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
          mustChangePassword: false,
        },
      });
      await AuditService.log({
        userId: user.id,
        module: "Authentication",
        action: "CHANGE_PASSWORD",
        description: "Password changed successfully",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] as string,
      });
      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async sendResetOtp(
    req: Request,
    res: Response
  ) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({
          message: "Email not found",
        });
      }

      const otp = generateOtp();

      await prisma.passwordResetOtp.create({
        data: {
          email,
          otp,
          expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
          ),
        },
      });

      await sendEmail(
        email,
        "Password Reset OTP",
        `
        <h2>Dharitri HRMS</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP expires in 10 minutes.</p>
      `
      );

      return res.status(200).json({
        message: "OTP sent successfully",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async verifyResetOtp(
    req: Request,
    res: Response
  ) {
    try {
      const { email, otp } = req.body;

      const record =
        await prisma.passwordResetOtp.findFirst({
          where: {
            email,
            otp,
            verified: false,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (!record) {
        return res.status(400).json({
          message: "Invalid or expired OTP",
        });
      }

      await prisma.passwordResetOtp.update({
        where: {
          id: record.id,
        },
        data: {
          verified: true,
        },
      });

      return res.status(200).json({
        message: "OTP verified successfully",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async resetPassword(
    req: Request,
    res: Response
  ) {
    try {
      const {
        email,
        otp,
        newPassword,
      } = req.body;

      const otpRecord =
        await prisma.passwordResetOtp.findFirst({
          where: {
            email,
            otp,
            verified: true,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (!otpRecord) {
        return res.status(400).json({
          message: "OTP verification required",
        });
      }

      const passwordHash =
        await AuthService.hashPassword(
          newPassword
        );

      await prisma.user.update({
        where: {
          email,
        },
        data: {
          passwordHash,
          mustChangePassword: false,
        },
      });

      await prisma.passwordResetOtp.delete({
        where: {
          id: otpRecord.id,
        },
      });

      await AuditService.log({
        userId: undefined,
        module: "Authentication",
        action: "RESET_PASSWORD",
        description: `${email} reset their password using OTP`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] as string,
      });
      return res.status(200).json({
        message: "Password reset successfully",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}