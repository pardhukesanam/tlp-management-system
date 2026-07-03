import { Router } from "express";
import { HolidayController } from "../controllers/holiday.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  adminOnly,
  HolidayController.createHoliday
);

router.get(
  "/",
  authenticate,
  HolidayController.getHolidays
);

router.delete(
  "/:id",
  authenticate,
  adminOnly,
  HolidayController.deleteHoliday
);

router.put(
  "/:id",
  authenticate,
  adminOnly,
  HolidayController.updateHoliday
);

export default router;