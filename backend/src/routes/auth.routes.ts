import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", AuthController.login);

router.get(
  "/me",
  authenticate,
  AuthController.me
);

router.post(
  "/logout",
  authenticate,
  AuthController.logout
);

router.post(
  "/change-password",
  authenticate,
  AuthController.changePassword
);

router.post(
  "/forgot-password",
  AuthController.sendResetOtp
);

router.post(
  "/verify-otp",
  AuthController.verifyResetOtp
);

router.post(
  "/reset-password",
  AuthController.resetPassword
);

export default router;