import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: {
    id: string;
    email: string;
    role: string;
  }): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "30d",
      }
    );
  }
  static async hashPassword(
    password: string
  ): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}