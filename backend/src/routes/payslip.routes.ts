import { Router } from "express";
import { PayslipController } from "../controllers/payslip.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  PayslipController.getPayslips
);

router.get(
  "/:id",
  PayslipController.getPayslipById
);

router.get(
  "/payroll/:payrollId",
  authenticate,
  PayslipController.getDetailedPayslip
);

export default router;