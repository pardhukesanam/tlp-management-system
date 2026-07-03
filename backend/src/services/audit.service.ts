import { prisma } from "../utils/prisma";

interface AuditLogInput {
  userId?: string;
  module: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(data: AuditLogInput) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          module: data.module,
          action: data.action,
          description: data.description,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error("Audit Log Error:", error);
    }
  }
}