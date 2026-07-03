import { Router } from "express";
import { LeaveBalanceController } from "../controllers/leave-balance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.put(
  "/assign",
  authenticate,
  adminOnly,
  LeaveBalanceController.assignBalance
);

router.get(
  "/my-balances",
  authenticate,
  LeaveBalanceController.getMyBalances
);

router.get(
  "/",
  authenticate,
  adminOnly,
  LeaveBalanceController.getAllBalances
);

export default router;