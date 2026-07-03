import { Router } from "express";
import { LeaveController } from "../controllers/leave.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  LeaveController.createLeaveRequest
);

router.get(
  "/my-leaves",
  authenticate,
  LeaveController.getMyLeaves
);

router.get(
  "/pending",
  authenticate,
  adminOnly,
  LeaveController.getPendingLeaves
);

router.get(
  "/",
  authenticate,
  adminOnly,
  LeaveController.getAllLeaves
);

router.put(
  "/:id/approve",
  authenticate,
  adminOnly,
  LeaveController.approveLeave
);

router.put(
  "/:id/reject",
  authenticate,
  adminOnly,
  LeaveController.rejectLeave
);

router.put(
  "/:id/cancel",
  authenticate,
  LeaveController.cancelLeave
);

export default router;