import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export class LeaveBalanceController {
    static async assignBalance(
        req: Request,
        res: Response
    ) {
        try {
            const {
                employeeId,
                leaveTypeId,
                allocatedDays,
            } = req.body;
            const balance =
                await prisma.leaveBalance.upsert({
                    where: {
                        employeeId_leaveTypeId: {
                            employeeId,
                            leaveTypeId,
                        },
                    },
                    update: {
                        allocatedDays,
                    },
                    create: {
                        employeeId,
                        leaveTypeId,
                        allocatedDays,
                        usedDays: 0,
                    },
                });
            return res.status(200).json(balance);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }
    static async getMyBalances(
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

            const balances =
                await prisma.leaveBalance.findMany({
                    where: {
                        employeeId: employee.id,
                    },

                    include: {
                        leaveType: true,
                    },
                });

            return res.status(200).json(
                balances.map((balance) => ({
                    id: balance.id,

                    leaveType:
                        balance.leaveType.name,

                    allocatedDays:
                        balance.allocatedDays,

                    usedDays:
                        balance.usedDays,

                    remainingDays:
                        balance.allocatedDays -
                        balance.usedDays,
                }))
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