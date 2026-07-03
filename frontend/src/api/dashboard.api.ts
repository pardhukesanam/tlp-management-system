import { api } from "./client";

export const getEmployeeDashboard = async () => {
  const [profile, leaves, timesheets, payrolls] =
    await Promise.all([
      api.get("/employees/me"),
      api.get("/leaves/my-leaves"),
      api.get("/timesheets/my-timesheets"),
      api.get("/payrolls/my"),
    ]);

  return {
    profile: profile.data,
    leaves: leaves.data,
    timesheets: timesheets.data,
    payrolls: payrolls.data,
  };
};