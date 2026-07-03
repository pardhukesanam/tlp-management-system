// Suppress TS error when @types/react is not installed in the environment.
// If possible, add @types/react as a dev dependency instead: npm i -D @types/react
// @ts-ignore
import { useState, useEffect } from 'react';
// @ts-ignore
import { } from 'react/jsx-runtime';
import { Employee, Timesheet, LeaveRequest, Payslip } from './types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_TIMESHEETS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYSLIPS
} from './data';
import LoginGateway from './components/LoginGateway';
import EmployeeWorkspace from './components/EmployeeWorkspace';
import AdminWorkspace from './components/AdminWorkspace';
import { api } from "./api/client";
import { mapEmployeeFromApi } from "./utils/employeeMapper";

const LOCAL_STORAGE_KEY = 'timesheet_salary_app_state_v1';

export default function App() {
  const [session, setSession] = useState<any>(null);

  // Core state declarations
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Record<string, Timesheet>>({});
  const [leaveRequests, setLeaveRequests] = useState<Record<string, LeaveRequest[]>>({});
  const [payslips, setPayslips] = useState<Record<string, Payslip[]>>({});

  const loadEmployees = async () => {
    try {
      const [
        employeeResponse,
        salaryResponse
      ] = await Promise.all([
        api.get("/employees"),
        api.get("/salary-profiles")
      ]);
      const employees =
        employeeResponse.data.map(
          mapEmployeeFromApi
        );
      const mergedEmployees =
        employees.map((emp: any) => {
          const profile =
            salaryResponse.data.find(
              (p: any) =>
                p.employeeId === emp.id
            );
          return {
            ...emp,
            baseSalary:
              Number(
                profile?.monthlySalary ?? 0
              ),
          };
        });
      setEmployees(
        mergedEmployees
      );
    } catch (error) {
      console.error(
        "Employee Load Error",
        error
      );
    }
  };

  useEffect(() => {
    if (session?.role === "ADMIN") {
      loadEmployees();
    }
  }, [session]);


  // 1. State Persistence - Update cache on every mutations
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        employees,
        timesheets,
        leaveRequests,
        payslips
      }));
    }
  }, [employees, timesheets, leaveRequests, payslips]);

  // Session routing actions
  const handleLogin = (user: string) => {
    setSession(JSON.parse(user));
  };

  const handleLogout = () => {
    setSession(null);
  };

  // State Updates: Profile customization (Admin Matrix)
  const handleUpdateEmployee = async (
    employeeId: string,
    updatedFields: Partial<Employee>
  ) => {
    setEmployees((prev: Employee[]) =>
      prev.map((emp: Employee) => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            ...updatedFields,
          };
        }
        return emp;
      })
    );
    if (
      updatedFields.baseSalary !== undefined
    ) {
      try {
        const profiles =
          await api.get(
            "/salary-profiles"
          );
        const profile =
          profiles.data.find(
            (p: any) =>
              p.employeeId === employeeId
          );
        if (profile) {
          await api.put(
            `/salary-profiles/${profile.id}`,
            {
              monthlySalary:
                updatedFields.baseSalary,
              effectiveDate:
                profile.effectiveDate,
            }
          );
        }
      } catch (error) {
        console.error(
          "Salary update error",
          error
        );
      }
    }
  };

  // State Updates: Timesheet edits (Employee Draft/Submit)
  const handleUpdateTimesheet = (employeeId: string, weekEnding: string, timesheet: Timesheet) => {
    const key = `${employeeId}_${weekEnding}`;
    setTimesheets((prev: Record<string, Timesheet>) => ({
      ...prev,
      [key]: timesheet
    }));
  };

  // State Updates: Timesheet decisions (Admin Approve/Reject)
  const handleUpdateTimesheetStatus = (
    employeeId: string,
    weekEnding: string,
    status: 'Draft' | 'Submitted for Review' | 'Approved' | 'Rejected',
    comment?: string
  ) => {
    const key = `${employeeId}_${weekEnding}`;
    setTimesheets((prev: Record<string, Timesheet>) => {
      const existing = prev[key];
      if (!existing) return prev;
      return {
        ...prev,
        [key]: {
          ...existing,
          status,
          rejectionComment: comment || undefined
        }
      };
    });
  };

  // State Updates: Leave requests (Employee Submission)
  const handleAddLeaveRequest = (employeeId: string, request: LeaveRequest) => {
    setLeaveRequests((prev: Record<string, LeaveRequest[]>) => {
      const existingList = prev[employeeId] || [];
      return {
        ...prev,
        [employeeId]: [...existingList, request]
      };
    });
  };

  // State Updates: Leave decisions (Admin Approve/Reject)
  const handleUpdateLeaveStatus = (
    employeeId: string,
    requestId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
    comment?: string
  ) => {
    let leaveRequestDetails: LeaveRequest | undefined;

    setLeaveRequests((prev: Record<string, LeaveRequest[]>) => {
      const list = prev[employeeId] || [];
      const updatedList = list.map((req: LeaveRequest) => {
        if (req.id === requestId) {
          leaveRequestDetails = { ...req, status, rejectionComment: comment || undefined };
          return leaveRequestDetails;
        }
        return req;
      });
      return {
        ...prev,
        [employeeId]: updatedList
      };
    });

    // Cascading effects: If approved and NOT unpaid, deduct right away from leaveBalances credits!
    if (status === 'Approved' && leaveRequestDetails) {
      const type = leaveRequestDetails.leaveType;
      const days = leaveRequestDetails.days;

      if (type !== 'Unpaid') {
        const balanceField = type as keyof Employee['leaveBalances'];
        setEmployees((prev: Employee[]) => prev.map((emp: Employee) => {
          if (emp.id === employeeId) {
            const currentCredits = emp.leaveBalances[balanceField] || 0;
            return {
              ...emp,
              leaveBalances: {
                ...emp.leaveBalances,
                [balanceField]: Math.max(0, currentCredits - days)
              }
            };
          }
          return emp;
        }));
      }
    }
  };

  console.log("SESSION:", session);
  console.log("CURRENT USER ID:", session?.id);
  console.log("EMPLOYEES:", employees);

  return (
    <>
      {session === null ? (
        <LoginGateway onLogin={handleLogin} />
      ) : session?.role === "ADMIN" ? (
        <AdminWorkspace
          employees={employees}
          refreshEmployees={loadEmployees}
          timesheets={timesheets}
          leaveRequests={leaveRequests}
          payslips={payslips}
          onUpdateEmployee={handleUpdateEmployee}
          onUpdateTimesheetStatus={handleUpdateTimesheetStatus}
          onUpdateLeaveStatus={handleUpdateLeaveStatus}
          onLogout={handleLogout}
        />
      ) : (
        <EmployeeWorkspace
          currentUserId={session?.employeeId}
          employees={employees}
          timesheets={timesheets}
          leaveRequests={leaveRequests}
          payslips={payslips}
          onUpdateTimesheet={handleUpdateTimesheet}
          onAddLeaveRequest={handleAddLeaveRequest}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}