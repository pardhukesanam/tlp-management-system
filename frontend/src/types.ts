export type LeaveType = 'Casual' | 'Sick' | 'Earned' | 'Special' | 'Unpaid';

export type RequestStatus = 'Draft' | 'Submitted for Review' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  note: string;
  rejectionComment?: string;
  submittedAt: string;
}

export interface Timesheet {
  id: string;
  weekEnding: string; // YYYY-MM-DD
  days: {
    Mon: number;
    Tue: number;
    Wed: number;
    Thu: number;
    Fri: number;
    Sat: number;
    Sun: number;
  };
  status: RequestStatus;
  rejectionComment?: string;
  submittedAt?: string;
}

export interface Employee {
  id: string;
  username: string;
  fullName: string;
  department: string;
  active: boolean;
  baseSalary: number;
  otEligible: boolean;
  otMultiplier: 1.5 | 2.0;
  leaveBalances: {
    Casual: number;
    Sick: number;
    Earned: number;
    Special: number;
  };
}

export interface Payslip {
  id: string;
  month: string; // e.g., "March 2025" or "February 2025"
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  unpaidLeaveDays: number;
  leaveDeduction: number;
  netPayout: number;
  status: 'Paid' | 'Processing';
  paidDate?: string;
}

// Global store state
export interface AppState {
  employees: Employee[];
  timesheets: Record<string, Timesheet>; // key: employeeId + "_" + weekEnding
  leaveRequests: Record<string, LeaveRequest[]>; // key: employeeId
  payslips: Record<string, Payslip[]>; // key: employeeId
}


