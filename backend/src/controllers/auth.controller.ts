import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

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

      return res.status(200).json({
        token,
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
    return res.status(200).json({
      user: req.user,
    });
  }
}