import { Router } from "express";
import { SalaryComponentController } from "../controllers/salary-component.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  adminOnly,
  SalaryComponentController.createSalaryComponent
);

router.get(
  "/:salaryProfileId",
  authenticate,
  adminOnly,
  SalaryComponentController.getSalaryComponents
);

router.put(
  "/reorder",
  authenticate,
  adminOnly,
  SalaryComponentController.reorderSalaryComponents
);

router.put(
  "/:id",
  authenticate,
  adminOnly,
  SalaryComponentController.updateSalaryComponent
);

router.delete(
  "/:id",
  authenticate,
  adminOnly,
  SalaryComponentController.deleteSalaryComponent
);

export default router;