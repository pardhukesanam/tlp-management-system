import { Router } from "express";
import { TimesheetController } from "../controllers/timesheet.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  TimesheetController.createTimeEntry
);

router.post(
  "/:id/activities",
  authenticate,
  TimesheetController.addActivity
);

router.get(
  "/my-timesheets",
  authenticate,
  TimesheetController.getMyTimesheets
);

router.get(
  "/pending",
  authenticate,
  adminOnly,
  TimesheetController.getPendingTimesheets
);

router.get(
  "/today",
  authenticate,
  TimesheetController.getTodayWorkLog
);

router.put(
  "/:id/approve",
  authenticate,
  adminOnly,
  TimesheetController.approveTimesheet
);

router.put(
  "/:id/reject",
  authenticate,
  adminOnly,
  TimesheetController.rejectTimesheet
);

router.put(
  "/:id/submit",
  authenticate,
  TimesheetController.submitWorkLog
);

router.put(
  "/activities/:activityId",
  authenticate,
  TimesheetController.updateActivity
);

router.delete(
  "/activities/:activityId",
  authenticate,
  TimesheetController.deleteActivity
);

router.get(
  "/:id",
  authenticate,
  adminOnly,
  TimesheetController.getTimesheetById
);

export default router;