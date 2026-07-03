import { Router } from "express";
import { LeaveTypeController } from "../controllers/leave-type.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  LeaveTypeController.getLeaveTypes
);

router.post(
  "/",
  authenticate,
  adminOnly,
  LeaveTypeController.createLeaveType
);
export default router;