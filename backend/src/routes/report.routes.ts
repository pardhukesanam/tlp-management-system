import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.get(
  "/payroll/excel",
  authenticate,
  adminOnly,
  ReportController.exportPayrollReport
);

router.get(
  "/payroll",
  authenticate,
  adminOnly,
  ReportController.getPayrollReport
);

router.get(
  "/leaves",
  authenticate,
  adminOnly,
  ReportController.getLeaveReport
);

export default router;