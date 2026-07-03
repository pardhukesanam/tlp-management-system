import { Employee } from "../types";

export const mapEmployeeFromApi = (
  employee: any
): Employee => {
  return {
    id: employee.id,
    username:
      employee.employeeCode ||
      employee.email ||
      employee.id,
    fullName:
      `${employee.firstName} ${employee.lastName}`,
    department:
      employee.designation,
    active:
      employee.status === "ACTIVE",
    baseSalary: 0,
    otEligible: false,
    otMultiplier: 1.5,
    leaveBalances: {
      Casual: 0,
      Sick: 0,
      Earned: 0,
      Special: 0,
    },
  };
};