import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  adminOnly,
  EmployeeController.createEmployee
);
router.get(
  "/",
  authenticate,
  adminOnly,
  EmployeeController.getEmployees
);

router.get(
  "/me",
  authenticate,
  EmployeeController.getMyProfile
);

router.get(
  "/:id",
  authenticate,
  adminOnly,
  EmployeeController.getEmployeeById
);
router.put(
  "/:id",
  authenticate,
  adminOnly,
  EmployeeController.updateEmployee
);

export default router;