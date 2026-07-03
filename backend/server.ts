import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import employeeRoutes from "./src/routes/employee.routes";
import authRoutes from "./src/routes/auth.routes";
import leaveRoutes from "./src/routes/leave.routes";
import timesheetRoutes from "./src/routes/timesheet.routes";
import salaryProfileRoutes from "./src/routes/salary-profile.routes";
import salaryComponentRoutes from "./src/routes/salary-component.routes";
import payrollRoutes from "./src/routes/payroll.routes";
import payslipRoutes from "./src/routes/payslip.routes";
import reportRoutes from "./src/routes/report.routes";
import leaveBalanceRoutes from "./src/routes/leave-balance.routes";
import leaveTypeRoutes from "./src/routes/leave-type.routes";
import holidayRoutes from "./src/routes/holiday.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Workforce Management API Running");
});

app.use("/api/auth", authRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/timesheets", timesheetRoutes);

app.use("/api/leaves", leaveRoutes);

app.use(
  "/api/salary-profiles",
  salaryProfileRoutes
);

app.use(
  "/api/salary-components",
  salaryComponentRoutes
);

app.use(
  "/api/payrolls",
  payrollRoutes
);

app.use(
  "/api/payslips",
  payslipRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/leave-balances",
  leaveBalanceRoutes
);

app.use(
  "/api/leave-types",
  leaveTypeRoutes
);

app.use(
  "/api/holidays",
  holidayRoutes
);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  app.get("/api/direct-test", (_, res) => {
  res.json({
    message: "DIRECT TEST WORKING",
  });
});
});