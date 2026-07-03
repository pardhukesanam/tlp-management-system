import { Router } from "express";
import { SalaryProfileController } from "../controllers/salary-profile.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  adminOnly,
  SalaryProfileController.createSalaryProfile
);

router.get(
  "/:employeeId",
  authenticate,
  adminOnly,
  SalaryProfileController.getEmployeeSalaryProfiles
);

router.get(
  "/",
  authenticate,
  adminOnly,
  SalaryProfileController.getSalaryProfiles
);

router.put(
  "/:id",
  authenticate,
  adminOnly,
  SalaryProfileController.updateSalaryProfile
);

export default router;