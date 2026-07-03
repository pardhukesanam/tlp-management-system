import { Employee, Timesheet, LeaveRequest, Payslip } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'employee1',
    username: 'employee1',
    fullName: 'Sarah Jenkins',
    department: 'Engineering',
    active: true,
    baseSalary: 4250.00,
    otEligible: true,
    otMultiplier: 2.0,
    leaveBalances: {
      Casual: 12,
      Sick: 8,
      Earned: 18,
      Special: 4,
    },
  },
  {
    id: 'employee2',
    username: 'employee2',
    fullName: 'Michael Chen',
    department: 'Operations',
    active: true,
    baseSalary: 5100.00,
    otEligible: false,
    otMultiplier: 1.5,
    leaveBalances: {
      Casual: 10,
      Sick: 12,
      Earned: 15,
      Special: 5,
    },
  },
  {
    id: 'employee3',
    username: 'employee3',
    fullName: 'Aisha Rahman',
    department: 'Product Design',
    active: true,
    baseSalary: 3800.00,
    otEligible: true,
    otMultiplier: 1.5,
    leaveBalances: {
      Casual: 15,
      Sick: 10,
      Earned: 20,
      Special: 6,
    },
  },
];

export const INITIAL_TIMESHEETS: Record<string, Timesheet> = {
  'employee1_2023-10-22': {
    id: 'ts_emp1_1',
    weekEnding: '2023-10-22',
    days: {
      Mon: 8.0,
      Tue: 7.5,
      Wed: 8.0,
      Thu: 4.0,
      Fri: 6.0,
      Sat: 0.0,
      Sun: 0.0,
    },
    status: 'Draft',
  },
  'employee2_2023-10-22': {
    id: 'ts_emp2_1',
    weekEnding: '2023-10-22',
    days: {
      Mon: 8.0,
      Tue: 8.0,
      Wed: 8.0,
      Thu: 8.0,
      Fri: 8.0,
      Sat: 0.0,
      Sun: 0.0,
    },
    status: 'Submitted for Review',
    submittedAt: '2023-10-20T17:15:00Z',
  },
  'employee3_2023-10-22': {
    id: 'ts_emp3_1',
    weekEnding: '2023-10-22',
    days: {
      Mon: 10.0,
      Tue: 9.0,
      Wed: 8.5,
      Thu: 8.0,
      Fri: 7.0,
      Sat: 0.0,
      Sun: 0.0,
    },
    status: 'Submitted for Review',
    submittedAt: '2023-10-21T09:30:00Z',
  },
};

export const INITIAL_LEAVE_REQUESTS: Record<string, LeaveRequest[]> = {
  employee1: [
    {
      id: 'lv_emp1_1',
      leaveType: 'Earned',
      startDate: '2023-12-20',
      endDate: '2023-12-28',
      days: 6.5,
      status: 'Approved',
      note: 'Family vacation',
      submittedAt: '2023-11-01',
    },
    {
      id: 'lv_emp1_2',
      leaveType: 'Sick',
      startDate: '2023-11-12',
      endDate: '2023-11-12',
      days: 1.0,
      status: 'Approved',
      note: 'Medical appointment',
      submittedAt: '2023-11-05',
    },
    {
      id: 'lv_emp1_3',
      leaveType: 'Casual', // Resolved to fit Casual balance
      startDate: '2023-10-05',
      endDate: '2023-10-07',
      days: 3.0,
      status: 'Pending',
      note: 'Personal relocation',
      submittedAt: '2023-10-01',
    },
  ],
  employee2: [
    {
      id: 'lv_emp2_1',
      leaveType: 'Sick',
      startDate: '2025-01-10',
      endDate: '2025-01-11',
      days: 2.0,
      status: 'Approved',
      note: 'Recovering from fever',
      submittedAt: '2025-01-08',
    },
    {
      id: 'lv_emp2_2',
      leaveType: 'Unpaid',
      startDate: '2025-03-04',
      endDate: '2025-03-04',
      days: 1.0,
      status: 'Approved',
      note: 'Personal business errands',
      submittedAt: '2025-03-01',
    },
  ],
  employee3: [
    {
      id: 'lv_emp3_1',
      leaveType: 'Earned',
      startDate: '2025-02-02',
      endDate: '2025-02-06',
      days: 5.0,
      status: 'Approved',
      note: 'Home renovation setup',
      submittedAt: '2025-01-20',
    },
  ],
};

export const INITIAL_PAYSLIPS: Record<string, Payslip[]> = {
  employee1: [
    {
      id: 'pay_emp1_1',
      month: 'March 2025',
      baseSalary: 4250.00,
      overtimeHours: 12.5,
      overtimePay: 603.69, // Math: (4250 / 176) * 12.5 * 2.0 = 603.69
      unpaidLeaveDays: 0,
      leaveDeduction: 0.00,
      netPayout: 4853.69,
      status: 'Paid',
      paidDate: 'Mar 28',
    },
    {
      id: 'pay_emp1_2',
      month: 'February 2025',
      baseSalary: 4250.00,
      overtimeHours: 0,
      overtimePay: 0,
      unpaidLeaveDays: 0,
      leaveDeduction: 0,
      netPayout: 4250.00,
      status: 'Paid',
      paidDate: 'Feb 26',
    },
    {
      id: 'pay_emp1_3',
      month: 'January 2025',
      baseSalary: 4250.00,
      overtimeHours: 4.5,
      overtimePay: 217.33,
      unpaidLeaveDays: 1,
      leaveDeduction: 193.18, // Math: (4250 / 22) * 1 = 193.18
      netPayout: 4274.15,
      status: 'Paid',
      paidDate: 'Jan 27',
    },
  ],
  employee2: [
    {
      id: 'pay_emp2_1',
      month: 'February 2025',
      baseSalary: 5100.00,
      overtimeHours: 0,
      overtimePay: 0,
      unpaidLeaveDays: 1,
      leaveDeduction: 231.82, // Math: (5100 / 22) * 1 = 231.82
      netPayout: 4868.18,
      status: 'Paid',
      paidDate: 'Feb 26',
    },
  ],
  employee3: [
    {
      id: 'pay_emp3_1',
      month: 'February 2025',
      baseSalary: 3800.00,
      overtimeHours: 8.0,
      overtimePay: 259.09, // Math: (3800 / 176) * 8.0 * 1.5 = 259.09
      unpaidLeaveDays: 0,
      leaveDeduction: 0,
      netPayout: 4059.09,
      status: 'Paid',
      paidDate: 'Feb 26',
    },
  ],
};
