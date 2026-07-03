import { Router } from "express";
import { PayrollController } from "../controllers/payroll.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.post(
  "/generate",
  authenticate,
  adminOnly,
  PayrollController.generatePayroll
);

router.get(
  "/",
  authenticate,
  adminOnly,
  PayrollController.getPayrolls
);

router.get(
  "/:id/payslip/pdf",
  PayrollController.downloadPayslipPdf
);

router.get(
  "/:id/payslip",
  authenticate,
  adminOnly,
  PayrollController.getPayslip
);

router.get(
  "/dashboard",
  PayrollController.getDashboardStats
);

router.get(
  "/monthly-summary",
  PayrollController.getMonthlySummary
);

router.get(
  "/my",
  authenticate,
  PayrollController.getMyPayrolls
);

router.get(
  "/:id",
  authenticate,
  adminOnly,
  PayrollController.getPayrollById
);

router.put(
  "/:id/approve",
  authenticate,
  PayrollController.approvePayroll
);

router.put(
  "/:id/pay",
  authenticate,
  adminOnly,
  PayrollController.markPayrollPaid
);
export default router;
