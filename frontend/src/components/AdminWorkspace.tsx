import React, { useState } from 'react';
import { Employee, Timesheet, LeaveRequest, Payslip } from '../types';
import {
  Users,
  ShieldAlert,
  CheckSquare,
  Coins,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  Check,
  Slash,
  CheckCircle,
  AlertCircle,
  Settings,
  Calculator,
  Download,
  FileCode,
  TrendingUp,
  Percent,
  Wallet,
  GripVertical,
  UserX,
  UserCheck,
  Pencil,
  Search,
  User,
  IndianRupee
} from 'lucide-react';
import { useEffect } from "react";
import { api } from "../api/client";
import { Calendar } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPendingWorkLogs, getWorkLogById } from '../api/timesheet.api';
import {
  approvePayroll,
  markPayrollPaid,
} from "../api/payroll.api";
import { response } from 'express';

interface AdminWorkspaceProps {
  employees: Employee[];
  refreshEmployees: () => Promise<void>;
  timesheets: Record<string, Timesheet>;
  leaveRequests: Record<string, LeaveRequest[]>;
  payslips: Record<string, Payslip[]>;
  onUpdateEmployee: (employeeId: string, updatedFields: Partial<Employee>) => void;
  onUpdateTimesheetStatus: (employeeId: string, weekEnding: string, status: 'Draft' | 'Submitted for Review' | 'Approved' | 'Rejected', comment?: string) => void;
  onUpdateLeaveStatus: (employeeId: string, requestId: string, status: 'Pending' | 'Approved' | 'Rejected', comment?: string) => void;
  onLogout: () => void;
}

interface SortableRowProps {
  component: any;
  salaryComponents: any[];
  setSalaryComponents: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  deleteComponent: (
    id: string
  ) => void;
}

function SortableRow({
  component,
  salaryComponents,
  setSalaryComponents,
  deleteComponent,
}: any) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: component.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-[#30363d]/40"
    >

      <td className="py-3 w-10">

        <button
          {...attributes}
          {...listeners}
          className="cursor-grab"
        >
          <GripVertical size={16} />
        </button>

      </td>

      <td className="py-3 pr-4">
        <input
          type="text"
          value={component.componentName}
          onChange={(e) => {
            const updated =
              salaryComponents.map(
                (c: any) =>
                  c.id === component.id
                    ? {
                      ...c,
                      componentName:
                        e.target.value,
                    }
                    : c
              );

            setSalaryComponents(updated);
          }}
          className="w-full bg-[#121212] border border-[#30363d] rounded px-3 py-2"
        />
      </td>

      <td className="py-3 text-center">
        <select
          value={component.componentType}
          onChange={(e) => {
            const updated =
              salaryComponents.map(
                (c: any) =>
                  c.id === component.id
                    ? {
                      ...c,
                      componentType:
                        e.target.value,
                    }
                    : c
              );

            setSalaryComponents(updated);
          }}
          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
        >
          <option value="EARNING">
            EARNING
          </option>

          <option value="DEDUCTION">
            DEDUCTION
          </option>
        </select>
      </td>

      <td className="py-3 text-right">
        <input
          type="number"
          value={component.amount}
          onChange={(e) => {
            const updated =
              salaryComponents.map(
                (c: any) =>
                  c.id === component.id
                    ? {
                      ...c,
                      amount:
                        e.target.value,
                    }
                    : c
              );

            setSalaryComponents(updated);
          }}
          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2 w-40 text-right"
        />
      </td>

      <td className="py-3 text-center">

        <button
          onClick={() =>
            deleteComponent(
              component.id
            )
          }
          className="text-red-400"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

function EditableSortableRow({
  component,
  salaryComponents,
  setSalaryComponents,
  deleteComponent,
}: SortableRowProps) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: component.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-[#30363d]/40"
    >
      <td className="py-3 w-12">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-[#8b949e]"
          type="button"
        >
          <GripVertical size={18} />
        </button>
      </td>

      <td className="py-3 pr-4">
        <input
          type="text"
          value={component.componentName}
          onChange={(e) => {
            const updated =
              salaryComponents.map(
                (c: any) =>
                  c.id === component.id
                    ? {
                      ...c,
                      componentName:
                        e.target.value,
                    }
                    : c
              );

            setSalaryComponents(
              updated
            );
          }}
          className="w-full bg-[#121212] border border-[#30363d] rounded px-3 py-2"
        />
      </td>

      <td className="py-3 text-center">
        <select
          value={
            component.componentType
          }
          onChange={(e) => {
            const updated =
              salaryComponents.map(
                (c: any) =>
                  c.id === component.id
                    ? {
                      ...c,
                      componentType:
                        e.target.value,
                    }
                    : c
              );

            setSalaryComponents(
              updated
            );
          }}
          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
        >
          <option value="EARNING">
            EARNING
          </option>

          <option value="DEDUCTION">
            DEDUCTION
          </option>
        </select>
      </td>

      <td className="py-3 text-right">
        <input
          type="number"
          value={component.amount}
          onChange={(e) => {
            const updated =
              salaryComponents.map(
                (c: any) =>
                  c.id === component.id
                    ? {
                      ...c,
                      amount:
                        e.target.value,
                    }
                    : c
              );

            setSalaryComponents(
              updated
            );
          }}
          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2 w-40 text-right"
        />
      </td>

      <td className="py-3 text-center">
        <button
          onClick={() =>
            deleteComponent(
              component.id
            )
          }
          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
          type="button"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function AdminWorkspace({
  employees,
  refreshEmployees,
  timesheets,
  leaveRequests,
  payslips,
  onUpdateEmployee,
  onUpdateTimesheetStatus,
  onUpdateLeaveStatus,
  onLogout,
}: AdminWorkspaceProps) {
  const [activeTab, setActiveTab] =
    useState<
      'overview' |
      'employees' |
      'approvals' |
      'payroll' |
      'leaveAllocation' |
      'holidays' |
      'salary-structures' |
      'exports'
    >('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rejection comments state triggers
  const [rejectingTimesheetId, setRejectingTimesheetId] = useState<string | null>(null);
  const [rejectingTimesheetComment, setRejectingTimesheetComment] = useState('');

  const [rejectingLeaveId, setRejectingLeaveId] = useState<string | null>(null);
  const [rejectingLeaveComment, setRejectingLeaveComment] = useState('');

  // Active sub-tab in approvals
  const [approvalsSubTab, setApprovalsSubTab] = useState<'timesheets' | 'leaves'>('timesheets');

  // Export success alerts toast state
  const [toastMessage, setToastMessage] = useState('');

  // Payroll run states
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [leaveList, setLeaveList] = useState<any[]>([]);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [payrollReport, setPayrollReport] = useState<any[]>([]);
  const [leaveReport, setLeaveReport] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [searchHoliday, setSearchHoliday] = useState("");
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [selectedSalaryProfile, setSelectedSalaryProfile] = useState<string>("");
  const [salaryComponents, setSalaryComponents] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [currentSalaryProfile, setCurrentSalaryProfile] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ firstName: "", lastName: "", email: "", phone: "", designation: "", joiningDate: "" });
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [editEmployeeForm, setEditEmployeeForm] =
    useState({
      firstName: "",
      lastName: "",
      phone: "",
      designation: "",
      status: "ACTIVE",
    });
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeErrors, setEmployeeErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    designation: "",
  });
  const [pendingWorkLogs, setPendingWorkLogs] = useState<any[]>([]);
  const [selectedWorkLog, setSelectedWorkLog] = useState<any>(null);
  const [loadingWorkLogs, setLoadingWorkLogs] = useState(false);
  const [workLogModalOpen, setWorkLogModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);





  const loadDashboard = async () => {
    try {

      const response =
        await api.get(
          `/payrolls/dashboard?month=${selectedMonth}&year=${selectedYear}`
        );

      setDashboardStats(
        response.data
      );

    } catch (error) {

      console.error(
        "Dashboard API Error",
        error
      );

    }
  };

  useEffect(() => {
    loadPendingWorkLogs();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [
    selectedMonth,
    selectedYear
  ]);

  useEffect(() => {
    const loadLeaves =
      async () => {
        try {
          const response =
            await api.get(
              "/leaves"
            );
          setLeaveList(
            response.data
          );
        } catch (error) {
          console.error(
            "Leave API Error",
            error
          );
        }
      };
    loadLeaves();
  }, []);

  useEffect(() => {
    const grid =
      employees.map((employee) => {
        const casual =
          leaveBalances.find(
            (b) =>
              b.employeeId === employee.id &&
              b.leaveType.name ===
              "Casual Leave"
          );
        const sick =
          leaveBalances.find(
            (b) =>
              b.employeeId === employee.id &&
              b.leaveType.name ===
              "Sick Leave"
          );
        const earned =
          leaveBalances.find(
            (b) =>
              b.employeeId === employee.id &&
              b.leaveType.name ===
              "Earned Leave"
          );
        const lop =
          leaveBalances.find(
            (b) =>
              b.employeeId === employee.id &&
              b.leaveType.name ===
              "Loss of Pay"
          );
        return {
          employeeId: employee.id,
          employeeName: employee.fullName,
          casual:
            casual?.allocatedDays ?? 0,

          sick:
            sick?.allocatedDays ?? 0,

          earned:
            earned?.allocatedDays ?? 0,

          lop:
            lop?.allocatedDays ?? 0,
        };
      });
    setAllocationData(grid);
  }, [employees, leaveBalances]);

  useEffect(() => {

    console.log(
      "Selected Employee:",
      selectedEmployeeId
    );

    const loadSalaryProfile =
      async () => {

        if (!selectedEmployeeId)
          return;

        const response =
          await api.get(
            "/salary-profiles"
          );

        console.log(
          "Salary Profiles:",
          response.data
        );

        const profile =
          response.data
            .filter(
              (p: any) =>
                p.employeeId ===
                selectedEmployeeId
            )
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0];

        console.log(
          "Matched Profile:",
          profile
        );

        setCurrentSalaryProfile(
          profile
        );

        console.log(
          "Current Salary Profile:",
          profile
        );

        if (profile) {
          loadSalaryComponents(
            profile.id
          );
        }
      };

    loadSalaryProfile();

  }, [selectedEmployeeId]);

  // Load Holidays

  useEffect(() => {
    const loadHolidays =
      async () => {
        try {
          const response =
            await api.get(
              "/holidays"
            );
          setHolidays(
            response.data
          );
        } catch (error) {
          console.error(
            "Holiday Load Error",
            error
          );
        }
      };
    loadHolidays();
  }, []);

  // Create Holidays

  const createHoliday =
    async () => {
      try {
        await api.post(
          "/holidays",
          {
            name:
              holidayName,
            holidayDate:
              holidayDate,
          }
        );
        const response =
          await api.get(
            "/holidays"
          );
        setHolidays(
          response.data
        );
        setHolidayName("");
        setHolidayDate("");
        triggerToast(
          "Holiday added successfully"
        );
      } catch (error) {
        console.error(error);
      }
    };

  // Delete Holiday

  const deleteHoliday =
    async (id: string) => {

      try {

        await api.delete(
          `/holidays/${id}`
        );

        setHolidays(
          holidays.filter(
            (holiday) =>
              holiday.id !== id
          )
        );

        triggerToast(
          "Holiday deleted successfully"
        );

      } catch (error) {

        console.error(error);

      }

    };

  // Approve Leave

  const approveLeave =
    async (id: string) => {
      try {
        await api.put(
          `/leaves/${id}/approve`
        );
        setLeaveList(
          prev =>
            prev.map(
              leave =>
                leave.id === id
                  ? {
                    ...leave,
                    status: "APPROVED",
                  }
                  : leave
            )
        );
        triggerToast(
          "Leave approved successfully"
        );
      } catch (error) {
        console.error(error);
      }
    };

  // Count Holidays

  const filteredHolidays =
    holidays.filter((holiday) =>
      holiday.name
        .toLowerCase()
        .includes(
          searchHoliday.toLowerCase()
        )
    );

  // Save Holiday

  const saveHoliday =
    async () => {
      try {
        await api.put(
          `/holidays/${editingHolidayId}`,
          {
            name:
              editingName,
            holidayDate:
              editingDate,
          }
        );
        const response =
          await api.get(
            "/holidays"
          );
        setHolidays(
          response.data
        );
        setEditingHolidayId(
          null
        );
        triggerToast(
          "Holiday updated"
        );
      } catch (error) {
        console.error(error);
      }
    };


  // Reject Leave

  const rejectLeave =
    async (id: string) => {
      try {
        await api.put(
          `/leaves/${id}/reject`
        );
        setLeaveList(
          prev =>
            prev.map(
              leave =>
                leave.id === id
                  ? {
                    ...leave,
                    status: "REJECTED",
                  }
                  : leave
            )
        );
        triggerToast(
          "Leave rejected successfully"
        );
      } catch (error) {
        console.error(error);
      }
    };

  // Payroll Loader

  useEffect(() => {
    loadPayrolls();
  }, []);
  const loadPayrolls = async () => {
    try {

      const response =
        await api.get("/payrolls");

      console.log(
        "Payrolls Loaded:",
        response.data
      );

      setPayrollList(
        response.data
      );

    } catch (error) {
      console.error(
        "Payroll API Error",
        error
      );
    }
  };

  // Payroll Approve

  const approvePayroll = async (
    payrollId: string
  ) => {
    try {
      await api.put(
        `/payrolls/${payrollId}/approve`
      );
      console.log(
        "Approved Payroll:",
        payrollId
      );
      await loadPayrolls();
      await loadDashboard();
      triggerToast("Payroll Approved Successfully");
    } catch (error) {
      console.error(error);
    }
    console.log(
      "Approving Payroll:",
      payrollId
    );
  };

  // Payroll Mark as Paid 

  const markPayrollPaid =
    async (id: string) => {
      try {

        await api.put(
          `/payrolls/${id}/pay`
        );

        await loadPayrolls();
        await loadDashboard();

        triggerToast(
          "Payroll marked as paid"
        );

      } catch (error) {

        console.error(error);

        triggerToast(
          "Failed to mark payroll paid"
        );

      }
    };

  // Genarate Payroll

  const generatePayroll = async () => {
    try {

      if (!selectedEmployeeId) {
        triggerToast("Please Select Employee");
        return;
      }
      setIsGeneratingPayroll(true);
      await api.post(
        "/payrolls/generate",
        {
          employeeId:
            selectedEmployeeId,

          payrollMonth:
            selectedMonth,

          payrollYear:
            selectedYear,
        }
      );
      triggerToast("Payroll Generated successfully");
      await loadPayrolls();
      await loadDashboard();
    } catch (error: any) {
      console.error(error);
      triggerToast(error?.response?.data?.message || "Failed to generate payroll");
    } finally {
      setIsGeneratingPayroll(false);
    }
  };

  // Download Payslip PDF

  const downloadPayslip = (
    payrollId: string
  ) => {
    const token =
      localStorage.getItem("token");
    window.open(
      `http://localhost:5001/api/payrolls/${payrollId}/payslip/pdf?token=${token}`,
      "_blank"
    );
  };

  // Payroll in Excel

  const downloadPayrollExcel = async () => {
    try {
      const response = await api.get(
        "/reports/payroll/excel",
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );
      const link =
        document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        "payroll-report.xlsx"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(
        "Excel Download Error",
        error
      );
    }
  };

  // View payroll report

  const viewPayrollReport =
    async () => {
      try {
        const response =
          await api.get(
            "/reports/payroll"
          );
        setPayrollReport(
          response.data
        );
      } catch (error) {
        console.error(error);
      }
    };

  // View leave report

  const viewLeaveReport =
    async () => {
      try {
        const response =
          await api.get(
            "/reports/leaves"
          );
        setLeaveReport(
          response.data
        );
      } catch (error) {
        console.error(error);
      }
    };

  // Leave Balance
  useEffect(() => {
    const loadLeaveBalances =
      async () => {
        try {
          const response =
            await api.get(
              "/leave-balances"
            );
          setLeaveBalances(
            response.data
          );
        } catch (error) {
          console.error(
            "Leave Balance API Error",
            error
          );
        }
      };
    loadLeaveBalances();
  }, []);

  // Load Leave Types

  useEffect(() => {

    const loadLeaveTypes =
      async () => {
        try {
          const response =
            await api.get(
              "/leave-types"
            );
          setLeaveTypes(
            response.data
          );
        } catch (error) {
          console.error(
            "Leave Types API Error",
            error
          );
        }
      };
    loadLeaveTypes();
  }, []);


  // Save Leave Balance

  const saveLeaveBalance =
    async (
      employeeId: string,
      leaveTypeId: string,
      allocatedDays: number
    ) => {
      try {
        await api.put(
          "/leave-balances/assign",
          {
            employeeId,
            leaveTypeId,
            allocatedDays,
          }
        );
        triggerToast(
          "Leave balance updated"
        );
      } catch (error) {
        console.error(error);
      }
    };

  // Leave Types

  const loadLeaveTypes = async () => {
    try {
      const token =
        localStorage.getItem("token");
      const response =
        await fetch(
          "http://localhost:5001/api/leave-types",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      const data =
        await response.json();
      setLeaveTypes(data);
    } catch (error) {
      console.error(error);
      triggerToast(
        "Failed to load leave types"
      );
    }
  };

  // Load Leave Balanace

  const loadLeaveBalances = async () => {
    try {
      const token =
        localStorage.getItem("token");
      const response =
        await fetch(
          "http://localhost:5001/api/leave-balances",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      const data =
        await response.json();
      setLeaveBalances(data);
    } catch (error) {
      console.error(error);
      triggerToast(
        "Failed to load leave balances"
      );
    }
  };

  // Update Leave Allocation

  const updateAllocation = async (
    employeeId: string,
    leaveTypeName: string,
    allocatedDays: number
  ) => {
    try {
      const token =
        localStorage.getItem("token");
      const leaveType =
        leaveTypes.find(
          (lt) =>
            lt.name === leaveTypeName
        );
      if (!leaveType) return;
      await fetch(
        "http://localhost:5001/api/leave-balances/assign",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            employeeId,
            leaveTypeId:
              leaveType.id,
            allocatedDays,
          }),
        }
      );
      triggerToast(
        "Leave allocation updated"
      );
      loadLeaveBalances();
    } catch (error) {
      console.error(error);
      triggerToast(
        "Failed to update allocation"
      );
    }
  };

  // Approve Timesheet

  const approveTimesheet = async (
    id: string
  ) => {
    try {
      await api.put(
        `/timesheets/${id}/approve`
      );
      triggerToast(
        "Timesheet approved successfully"
      );
      loadPendingWorkLogs();
    } catch (error) {
      console.error(error);
      triggerToast(
        "Failed to approve timesheet"
      );
    }
  };

  // Reject Timesheet

  const rejectTimesheet = async (
    id: string
  ) => {
    try {
      await api.put(
        `/timesheets/${id}/reject`
      );
      triggerToast(
        "Timesheet rejected successfully"
      );
      loadPendingWorkLogs();
    } catch (error) {
      console.error(error);
      triggerToast(
        "Failed to reject timesheet"
      );
    }
  };

  const loadSalaryComponents = async (
    salaryProfileId: string
  ) => {
    console.log(
      "Loading Components For:",
      salaryProfileId
    );
    try {
      const response =
        await api.get(
          `/salary-components/${salaryProfileId}`
        );
      console.log(
        "Components Loaded:",
        response.data
      );
      setSalaryComponents(
        response.data
      );
    } catch (error) {
      console.error(
        "Salary Components Error:",
        error
      );
    }
  };

  console.log("Current Salary Profile:", currentSalaryProfile);

  console.log("Salary Components:", salaryComponents);

  const saveSalaryComponents = async () => {
    try {

      for (const component of salaryComponents) {

        if (component.isNew) {

          await api.post(
            "/salary-components",
            {
              salaryProfileId:
                currentSalaryProfile.id,

              componentName:
                component.componentName,

              amount:
                Number(component.amount),

              componentType:
                component.componentType,
            }
          );

        } else {

          await api.put(
            `/salary-components/${component.id}`,
            {
              componentName:
                component.componentName,

              amount:
                Number(component.amount),

              componentType:
                component.componentType,
            }
          );
        }
      }

      const totalSalary =
        salaryComponents
          .filter(
            (component: any) =>
              component.componentType ===
              "EARNING"
          )
          .reduce(
            (sum, component) =>
              sum +
              Number(component.amount),
            0
          );

      await api.put(
        `/salary-profiles/${currentSalaryProfile.id}`,
        {
          monthlySalary:
            totalSalary,
        }
      );

      setCurrentSalaryProfile(
        (prev: any) => ({
          ...prev,
          monthlySalary:
            totalSalary,
        })
      );

      triggerToast("Salary Structure Saved successfully");

    } catch (error) {

      console.error(
        "Save Error:",
        error
      );

      triggerToast("Failed to Save Salary Structure");
    }
  };

  // Add Component 
  const addComponent = () => {

    setSalaryComponents([
      ...salaryComponents,
      {
        id: `temp-${Date.now()}`,
        componentName: "",
        amount: 0,
        componentType: "EARNING",
        isNew: true,
      },
    ]);

  };

  // Delete Component
  const deleteComponent = (
    componentId: string
  ) => {
    setSalaryComponents(
      salaryComponents.filter(
        (component: any) =>
          component.id !== componentId
      )
    );
  };

  // Drag components
  const handleDragEnd =
    async (
      event: DragEndEvent
    ) => {

      const {
        active,
        over,
      } = event;

      if (!over) return;

      if (
        active.id !== over.id
      ) {

        const oldIndex =
          salaryComponents.findIndex(
            (item: any) =>
              item.id === active.id
          );

        const newIndex =
          salaryComponents.findIndex(
            (item: any) =>
              item.id === over.id
          );

        const reordered =
          arrayMove(
            salaryComponents,
            oldIndex,
            newIndex
          );

        setSalaryComponents(
          reordered
        );

        try {

          await api.put(
            "/salary-components/reorder",
            {
              components:
                reordered.map(
                  (
                    component: any,
                    index: number
                  ) => ({
                    id: component.id,
                    displayOrder:
                      index + 1,
                  })
                ),
            }
          );
        } catch (error) {
          console.error(error);
        }
      }
    };

  // Create Employee
  const createEmployee = async () => {
    try {

      await api.post(
        "/employees",
        employeeForm
      );
      await refreshEmployees();
      triggerToast("Employee created successfully");
      setShowEmployeeModal(false);
      setEmployeeForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        designation: "",
        joiningDate: "",
      });

    } catch (error) {
      console.error(
        "Create Employee Error:",
        error
      );
      triggerToast("Failed to Create Employee");
    }
  };

  // Save Employee changes
  const saveEmployeeChanges = async () => {

    const errors = {
      firstName: "",
      lastName: "",
      phone: "",
      designation: "",
    };
    let hasError = false;

    if (!editEmployeeForm.firstName.trim()) {
      errors.firstName = "First name is required";
      hasError = true;
    }

    if (!editEmployeeForm.lastName.trim()) {
      errors.lastName = "Last name is required";
      hasError = true;
    }

    if (!editEmployeeForm.designation.trim()) {
      errors.designation = "Designation is required";
      hasError = true;
    }

    if (
      editEmployeeForm.phone &&
      !/^[0-9]{10}$/.test(editEmployeeForm.phone)
    ) {
      errors.phone =
        "Phone number must be exactly 10 digits";
      hasError = true;
    }

    setEmployeeErrors(errors);

    if (hasError) { return; }

    try {
      await api.put(
        `/employees/${editingEmployee.id}`,
        editEmployeeForm
      );

      triggerToast(
        "Employee updated successfully"
      );

      await refreshEmployees();

      setEditingEmployee(null);

    } catch (error) {

      console.error(error);

      triggerToast(
        "Failed to update employee"
      );

    }
  };

  const filteredEmployees =
    employees.filter(
      (employee: any) => {

        const searchText =
          employeeSearch.toLowerCase();

        return (
          employee.fullName
            ?.toLowerCase()
            .includes(searchText) ||

          employee.username
            ?.toLowerCase()
            .includes(searchText) ||

          employee.department
            ?.toLowerCase()
            .includes(searchText)
        );
      }
    );

  const toggleEmployeeStatus =
    async (employee: any) => {

      try {
        console.log(
          "Updating:",
          employee.id
        );
        const response =
          await api.put(
            `/employees/${employee.id}`,
            {
              status:
                employee.active
                  ? "INACTIVE"
                  : "ACTIVE",
            }
          );
        console.log(
          "Update Response:",
          response.data
        );
        await refreshEmployees();
      } catch (error) {
        console.error(
          "Toggle Error:",
          error
        );

      }
    };

  // Load Pending Work Logs 
  const loadPendingWorkLogs = async () => {
    try {
      setLoadingWorkLogs(true);
      const logs = await getPendingWorkLogs();
      console.log("Pending Work Logs:", logs);
      setPendingWorkLogs(logs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingWorkLogs(false);
    }
  };

  const handleApproveWorkLog = async () => {
    if (!selectedWorkLog) return;

    try {
      setReviewLoading(true);

      await approveTimesheet(selectedWorkLog.id);

      triggerToast("Work log approved successfully.");

      setWorkLogModalOpen(false);
      setSelectedWorkLog(null);

      await loadPendingWorkLogs();

    } catch (error) {
      console.error(error);
      triggerToast("Failed to approve work log.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleRejectWorkLog = async () => {
    if (!selectedWorkLog) return;

    if (!rejectionReason.trim()) {
      triggerToast("Please enter a rejection reason.");
      return;
    }

    try {
      setReviewLoading(true);

      await api.put(
        `/timesheets/${selectedWorkLog.id}/reject`,
        {
          rejectionReason,
        }
      );

      triggerToast("Work log rejected successfully.");

      setShowRejectModal(false);
      setWorkLogModalOpen(false);

      setSelectedWorkLog(null);
      setRejectionReason("");

      await loadPendingWorkLogs();

    } catch (error) {
      console.error(error);
      triggerToast("Failed to reject work log.");
    } finally {
      setReviewLoading(false);
    }
  };


  // Handle View Work Log
  const handleViewWorkLog = async (id: string) => {
    try {
      const workLog = await getWorkLogById(id);
      console.log(workLog);
      setSelectedWorkLog(workLog);
      setWorkLogModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprovePayroll = async (
    payrollId: string
  ) => {
    try {
      await approvePayroll(payrollId);
      await loadPayrolls();
      triggerToast(
        "Payroll approved successfully."
      );
    } catch (error) {
      console.error(error);
      triggerToast(
        "Failed to approve payroll."
      );
    }
  };

  const handleMarkPayrollPaid = async (
    payrollId: string
  ) => {
    try {
      await markPayrollPaid(payrollId);
      await loadPayrolls();
      triggerToast(
        "Payroll marked as paid."
      );
    } catch (error) {
      console.error(error);
      triggerToast(
        "Failed to update payroll."
      );
    }
  };

  // Helper metrics calculations
  const pendingLeavesList: Array<{ req: LeaveRequest; emp: Employee }> = [];
  employees.forEach(emp => {
    const list = leaveRequests[emp.id] || [];
    list.forEach(req => {
      if (req.status === 'Pending') {
        pendingLeavesList.push({ req, emp });
      }
    });
  });



  const pendingLeaveCount =
    leaveList.filter(
      (leave) => leave.status === "PENDING"
    ).length;

  // Let's compute running monthly payroll projects for ALL active profiles
  // Based on current active timesheet data
  const calculateEmployeeSalaryFields = (emp: Employee) => {
    // Current timesheet total hours for week ending '2023-10-22'
    const weekEnding = '2023-10-22';
    const tsKey = `${emp.id}_${weekEnding}`;
    const ts = timesheets[tsKey];

    let otHours = 0;
    if (ts) {
      const totalHours = ts.days.Mon + ts.days.Tue + ts.days.Wed + ts.days.Thu + ts.days.Fri + ts.days.Sat + ts.days.Sun;
      if (emp.otEligible) {
        otHours = Math.max(0, totalHours - 40);
      }
    }

    // Unpaid leave days
    const approvedUnpaidLeaves = (leaveRequests[emp.id] || []).filter(
      r => r.leaveType === 'Unpaid' && r.status === 'Approved'
    );
    const unpaidLeaveDays = approvedUnpaidLeaves.reduce((acc, curr) => acc + curr.days, 0);

    const leaveDeduction = 0;
    const overtimePay = 0;
    const netPayout = 0;

    return {
      otHours,
      overtimePay,
      unpaidLeaveDays,
      leaveDeduction,
      netPayout: emp.active ? netPayout : 0 // If archived, pay is $0
    };
  };

  // Export handlers
  const handleExportModule = (moduleTitle: string) => {
    triggerToast(`Export Successful: Saved "${moduleTitle}" dataset package to secure folder.`);
  };

  interface TabConfig {
    id:
    | 'overview'
    | 'employees'
    | 'approvals'
    | 'payroll'
    | 'leaveAllocation'
    | 'holidays'
    | 'salary-structures'
    | 'exports';

    label: string;
    icon: React.ComponentType<any>;
    badge?: number;
  }

  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Overview Panel', icon: Users },
    { id: "employees", label: "Employee Management", icon: Users },
    { id: 'approvals', label: 'Staff Approvals', icon: CheckSquare, badge: pendingLeavesList.length + pendingWorkLogs.length },
    { id: "salary-structures", label: "Salary Structures", icon: Wallet },
    { id: 'payroll', label: 'Payroll Engine', icon: Coins },
    { id: 'leaveAllocation', label: 'Leave Allocation', icon: Calendar },
    { id: "holidays", label: "Holiday Management", icon: Calendar },
    { id: 'exports', label: 'Export Center', icon: FileSpreadsheet },
  ];

  const calculateMinutes = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const workMinutes =
    selectedWorkLog?.activities
      ?.filter((a: any) => a.activityType === "WORK")
      .reduce(
        (sum: number, a: any) =>
          sum + calculateMinutes(a.startTime, a.endTime),
        0
      ) ?? 0;

  const breakMinutes =
    selectedWorkLog?.activities
      ?.filter((a: any) => a.activityType === "BREAK")
      .reduce(
        (sum: number, a: any) =>
          sum + calculateMinutes(a.startTime, a.endTime),
        0
      ) ?? 0;

  const lunchMinutes =
    selectedWorkLog?.activities
      ?.filter((a: any) => a.activityType === "LUNCH")
      .reduce(
        (sum: number, a: any) =>
          sum + calculateMinutes(a.startTime, a.endTime),
        0
      ) ?? 0;

  const totalMinutes =
    workMinutes +
    breakMinutes +
    lunchMinutes;

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${h}h ${m}m`;
  };

  console.log("STATE:", pendingWorkLogs);
  return (
    <div className="h-screen w-full bg-[#121212] text-[#c9d1d9] flex flex-col md:flex-row antialiased font-sans overflow-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-950 border border-emerald-800 text-emerald-200 py-3 px-5 rounded-xl text-xs font-semibold tracking-wide flex items-center space-x-2.5 z-50 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-[#1e1e1e] border-b border-[#30363d] shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-[#30363d] flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <div>
            <div className="text-sm font-medium leading-none text-white">Admin Console</div>
            <div className="text-[10px] text-[#8b949e]">Workforce Monitoring Central</div>
          </div>
        </div>
        <button
          id="admin-mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-[#30363d] bg-[#121212] text-[#c9d1d9]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        id="admin-sidebar"
        className={`bg-[#1e1e1e] border-r border-[#30363d] w-full md:w-64 shrink-0 transition-all duration-250 ease-in-out z-40
          ${mobileMenuOpen ? 'block fixed inset-x-0 top-[65px] bottom-0' : 'hidden md:flex flex-col'}
        `}
      >
        {/* Desktop Profile Header within Sidebar */}
        <div className="hidden md:flex flex-col p-6 border-b border-[#30363d]">
          <div
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
          >
            <div className="w-8 h-8 bg-[#30363d] rounded flex items-center justify-center text-white font-bold text-sm font-mono">
              ADM
            </div>
            <span className="font-semibold tracking-tight text-white text-sm">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-nav-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors cursor-pointer ${isActive
                  ? 'bg-[#30363d] text-white font-medium'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#252525]'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#30363d] text-white border border-[#444d56]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-[#30363d]">
          <button
            id="admin-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2.5 px-3 py-2 bg-[#121212] hover:bg-amber-950/20 hover:text-amber-400 border border-[#30363d] hover:border-amber-900/60 rounded text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-[#121212] border-b border-[#30363d] items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-medium text-white">Administrator Workspace</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[#8b949e] uppercase tracking-widest font-semibold">Session Active</p>
              <p className="text-sm font-medium text-[#c9d1d9]">System Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#30363d] flex items-center justify-center text-xs font-semibold text-[#8b949e]">
              ADMIN
            </div>
          </div>
        </header>

        {/* Scrollable sub-container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 container max-w-7xl mx-auto">

          {/* VIEW 1: OVERVIEW INCIDENT PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#c9d1d9]">Oversight Dashboard</h1>
                <p className="text-sm text-[#8b949e] mt-1">Global payroll projections, team availability metrics, and clearance backlog.</p>
              </div>

              {/* Indicator widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Backlog Leaves Card */}
                <div
                  id="metric-card-leaves"
                  onClick={() => { setActiveTab('approvals'); setApprovalsSubTab('leaves'); }}
                  className="bg-[#1e1e1e] hover:bg-[#252525] border border-[#30363d] rounded-xl p-5 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Paid Payrolls</span>
                    <span className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500">
                      <ShieldAlert className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline space-x-1">
                    <span className="text-3xl font-mono font-bold text-[#c9d1d9]">{dashboardStats?.paidPayrolls ?? 0}</span>
                    <span className="text-xs text-[#8b949e]">requests</span>
                  </div>
                  <span className="text-[11px] text-[#8b949e] leading-snug block">Absence files requiring immediate decision.</span>
                </div>

                {/* Backlog Timesheets Card */}
                <div
                  id="metric-card-timesheets"
                  onClick={() => { setActiveTab('approvals'); setApprovalsSubTab('timesheets'); }}
                  className="bg-[#1e1e1e] hover:bg-[#252525] border border-[#30363d] rounded-xl p-5 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Draft Payrolls</span>
                    <span className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500">
                      <CheckSquare className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline space-x-1">
                    <span className="text-3xl font-mono font-bold text-[#c9d1d9]">{dashboardStats?.draftPayrolls ?? 0}</span>
                    <span className="text-xs text-[#8b949e]">timesheets</span>
                  </div>
                  <span className="text-[11px] text-[#8b949e] leading-snug block">Duty logs submitted for official payroll clearance.</span>
                </div>

                {/* Running Payroll Projections Card */}
                <div
                  id="metric-card-finance"
                  onClick={() => setActiveTab('payroll')}
                  className="bg-[#1e1e1e] hover:bg-[#252525] border border-[#30363d] rounded-xl p-5 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Projected Remittance Cycle</span>
                    <span className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <Coins className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline space-x-1">
                    <span className="text-2xl font-mono font-bold text-[#c9d1d9]">
                      ₹{(dashboardStats?.totalPayrollAmount ?? 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8b949e] leading-snug block">Calculated sum of net payouts for active personnel.</span>
                </div>
              </div>

              {/* Quick Action Cards / Helpful guidelines */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                <div className="lg:col-span-8 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">Backlog Overview Quick Queue</h3>

                  <div className="space-y-3.5 text-xs">
                    {pendingLeavesList.length > 0 ? (
                      <div className="p-4 bg-[#121212] border border-[#30363d] rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-white">Pending Leaves Checklist Backlog</p>
                            <p className="text-[10px] text-[#8b949e] mt-0.5">There are urgent vacation files waiting decision. Ready to action.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setActiveTab('approvals'); setApprovalsSubTab('leaves'); }}
                          className="py-1 px-3 bg-[#30363d] hover:bg-[#444d56] rounded font-mono text-[10px] font-bold text-[#c9d1d9] cursor-pointer"
                        >
                          Action Drawer
                        </button>
                      </div>
                    ) : null}

                    {pendingWorkLogs.length > 0 ? (
                      <div className="p-4 bg-[#121212] border border-[#30363d] rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-white">Verify Duty Timesheets Backlog</p>
                            <p className="text-[10px] text-[#8b949e] mt-0.5">Employees have submitted daily duty hours for weekly approval.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setActiveTab('approvals'); setApprovalsSubTab('timesheets'); }}
                          className="py-1 px-3 bg-[#30363d] hover:bg-[#444d56] rounded font-mono text-[10px] font-bold text-[#c9d1d9] cursor-pointer"
                        >
                          Action Drawer
                        </button>
                      </div>
                    ) : null}

                    {pendingLeavesList.length === 0 && pendingWorkLogs.length === 0 ? (
                      <div className="p-8 text-center bg-[#121212]/60 border border-[#30363d]/60 rounded-xl">
                        <CheckCircle className="w-10 h-10 text-emerald-500/80 mx-auto mb-2" />
                        <p className="font-semibold text-white text-sm">System Backlog Clear!</p>
                        <p className="text-xs text-[#8b949e] mt-1">All employee submissions are evaluated and processed.</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Active Core Variables card */}
                <div className="lg:col-span-4 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">Official Payroll Formula Config</h3>
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-[#121212] border border-[#30363d] rounded-lg">
                      <span className="block text-[10px] uppercase font-mono tracking-wider text-amber-400">Deduction Rule</span>
                      <p className="text-white mt-1 leading-relaxed">
                        Leave Dec = (Base Salary / Working Days Calculated From Calendar & Holidays) * Approved Unpaid Leave Days.
                      </p>
                    </div>
                    <div className="p-3 bg-[#121212] border border-[#30363d] rounded-lg">
                      <span className="block text-[10px] uppercase font-mono tracking-wider text-emerald-400">Overtime Rule</span>
                      <p className="text-white mt-1 leading-relaxed">
                        OT Pay = (Base Salary / 176 Hours) * OT Hours worked * Elegibility Multiplier.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* VIEW 2: STAFF APPROVALS CENTER */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#c9d1d9]">Backlog Approvals Center</h1>
                <p className="text-sm text-[#8b949e] mt-1">Review pending files, issue approvals, or submit detailed rejection reasons instantly.</p>
              </div>

              {/* Split sub-tabs */}
              <div className="flex border-b border-[#30363d] text-sm">
                <button
                  id="approvals-subtab-timesheets"
                  onClick={() => setApprovalsSubTab('timesheets')}
                  className={`pb-3 px-6 font-semibold border-b-2 transition cursor-pointer ${approvalsSubTab === 'timesheets'
                    ? 'border-amber-500 text-[#c9d1d9]'
                    : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                >
                  Timesheet Submissions ({dashboardStats?.draftPayrolls ?? 0})
                </button>
                <button
                  id="approvals-subtab-leaves"
                  onClick={() => setApprovalsSubTab('leaves')}
                  className={`pb-3 px-6 font-semibold border-b-2 transition cursor-pointer ${approvalsSubTab === 'leaves'
                    ? 'border-amber-500 text-[#c9d1d9]'
                    : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                >
                  Leave Request Submissions ({pendingLeaveCount})
                </button>
              </div>

              {/* Subtab Timesheets */}
              {approvalsSubTab === "timesheets" && (
                <div className="space-y-6">

                  <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl overflow-hidden">

                    <div className="px-6 py-4 border-b border-[#30363d]">
                      <h2 className="text-lg font-semibold">
                        Pending Work Logs
                      </h2>
                    </div>

                    {loadingWorkLogs ? (

                      <div className="p-8 text-center text-[#8b949e]">
                        Loading...
                      </div>
                    ) : pendingWorkLogs.length === 0 ? (
                      <div className="p-8 text-center text-[#8b949e]">
                        No pending work logs.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#161b22]">
                            <tr className="text-left text-sm text-[#8b949e]">
                              <th className="px-6 py-4">Employee</th>
                              <th className="px-6 py-4">Work Date</th>
                              <th className="px-6 py-4">Activities</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingWorkLogs.map((log: any) => (
                              <tr
                                key={log.id}
                                className="border-t border-[#30363d] hover:bg-[#161b22]"
                              >

                                <td className="px-6 py-4">
                                  {log.employee.firstName} {log.employee.lastName}
                                </td>

                                <td className="px-6 py-4">
                                  {new Date(log.workDate).toLocaleDateString()}
                                </td>

                                <td className="px-6 py-4">
                                  {log.activities?.length ?? 0}
                                </td>

                                <td className="px-6 py-4">

                                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                                    {log.status}
                                  </span>

                                </td>

                                <td className="px-6 py-4 text-right">

                                  <button
                                    onClick={() => handleViewWorkLog(log.id)}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    )}

                  </div>

                </div>
              )}


              {/* Subtab Leaves */}
              {approvalsSubTab === 'leaves' && (
                <div className="space-y-4">
                  {leaveList
                    .filter(
                      leave =>
                        leave.status === "PENDING"
                    )
                    .map((leave) => {
                      const isRejecting = rejectingLeaveId === leave.id;

                      return (
                        <div key={leave.id} className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#30363d]/60 gap-3">
                            <div>
                              <span className="text-[10px] font-mono tracking-wider text-[#8b949e] uppercase">Sponsor Employee</span>
                              <h4 className="text-sm font-semibold text-white">{`${leave.employee.firstName} ${leave.employee.lastName}`} ({leave.employee.designation})</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono tracking-wider text-[#8b949e] uppercase">Leave category / request reference</span>
                              <p className="text-xs font-mono text-amber-400 font-semibold">{leave.leaveType.name} Absence (ID: {leave.id})</p>
                            </div>
                          </div>

                          {/* Details specs */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono bg-[#121212]/40 p-4 border border-[#30363d]/45 rounded-lg">
                            <div className="md:col-span-8">
                              <span className="text-[#8b949e] block text-[10px] uppercase font-sans">Statement Reasons</span>
                              <div className="text-[#c9d1d9] mt-0.5 leading-relaxed font-sans font-medium">"{leave.reason || 'No notes specified'}"</div>
                            </div>
                            <div className="md:col-span-4 md:border-l md:border-[#30363d]/70 md:pl-4">
                              <div className="mb-2">
                                <span className="text-[#8b949e] text-[10px] uppercase font-sans block">Date Range Duration</span>
                                <span className="text-white font-bold">{new Date(
                                  leave.startDate
                                ).toLocaleDateString()} to {new Date(
                                  leave.endDate
                                ).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#8b949e] text-[10px] uppercase font-sans block">Aggregated Days</span>
                                <span className="text-emerald-400 font-bold">{leave.totalDays} days requested</span>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons or rejecting feedback drawer */}
                          {!isRejecting ? (
                            <div className="flex justify-end space-x-3.5">
                              <button
                                id={`leave-reject-trigger-btn-${leave.id}`}
                                onClick={() => {
                                  setRejectingLeaveId(leave.id);
                                  setRejectingLeaveComment('');
                                }}
                                className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-300 border border-red-900/40 rounded-lg text-xs font-medium transition cursor-pointer"
                              >
                                Reject & Block
                              </button>
                              <button
                                id={`leave-approve-btn-${leave.id}`}
                                onClick={() => {
                                  approveLeave(
                                    leave.id
                                  );
                                  triggerToast(
                                    `Leave request approved for ${leave.employee.firstName} ${leave.employee.lastName}.`
                                  );
                                }}
                                className="px-4 py-1.5 bg-emerald-950/20 hover:bg-emerald-950/45 text-emerald-300 border border-emerald-900/40 rounded-lg text-xs font-medium transition cursor-pointer"
                              >
                                Approve Action
                              </button>
                            </div>
                          ) : (
                            <div className="bg-[#121212] border border-red-900/40 p-4 rounded-xl space-y-3">
                              <label htmlFor={`reject-comment-input-lv-${leave.id}`} className="block text-xs font-medium uppercase tracking-wider text-red-00 font-sans">
                                Provide Rejection Review Comments
                              </label>
                              <textarea
                                id={`reject-comment-input-lv-${leave.id}`}
                                rows={3}
                                value={rejectingLeaveComment}
                                onChange={(e) => setRejectingLeaveComment(e.target.value)}
                                placeholder="Input details on why leave cannot be granted..."
                                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#30363d] rounded text-xs text-[#c9d1d9] placeholder-[#8b949e]/45 focus:outline-none focus:border-red-500"
                              />
                              <div className="flex justify-end space-x-2 text-xs">
                                <button
                                  id={`leave-cancel-reject-btn-${leave.id}`}
                                  onClick={() => setRejectingLeaveId(null)}
                                  className="px-3.5 py-1.5 bg-[#30363d] hover:bg-[#444d56] rounded font-medium text-[#c9d1d9]"
                                >
                                  Cancel Rejection
                                </button>
                                <button
                                  id={`leave-confirm-reject-btn-${leave.id}`}
                                  onClick={() => {
                                    rejectLeave(leave.id);
                                    setRejectingLeaveId(null);
                                    triggerToast(`Leave request rejected with audit comments.`);
                                  }}
                                  className="px-3.5 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded font-semibold cursor-pointer"
                                >
                                  Confirm Rejection Review
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {pendingLeavesList.length === 0 && (
                    <div className="text-center py-12 text-sm text-[#8b949e] italic bg-[#1e1e1e] border border-[#30363d] rounded-xl">
                      No Pending Absences files in queue.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: MATHEMATICAL PAYROLL ENGINE HUD */}
          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#c9d1d9]">Mathematical Payroll Engine Real-Time HUD</h1>
                <p className="text-sm text-[#8b949e] mt-1">Computes granular formulas against base salary components, overtime hours, and unpaid deductions.</p>
              </div>

              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#30363d]/60 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e]">System Engine Actions</h3>
                    <p className="text-xs text-[#8b949e]">Calculation basis: No.of Work Days / No.of Work Hours per month.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">

                    <select
                      value={selectedEmployeeId}
                      onChange={(e) =>
                        setSelectedEmployeeId(
                          e.target.value
                        )
                      }
                      className="bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2 text-sm min-w-[220px] text-white"
                    >
                      <option value="">
                        Select Employee
                      </option>

                      {employees.map((employee: any) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.fullName}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(
                          Number(e.target.value)
                        )
                      }
                      className="bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2 text-sm"
                    >
                      <option value={1}>Jan</option>
                      <option value={2}>Feb</option>
                      <option value={3}>Mar</option>
                      <option value={4}>Apr</option>
                      <option value={5}>May</option>
                      <option value={6}>Jun</option>
                      <option value={7}>Jul</option>
                      <option value={8}>Aug</option>
                      <option value={9}>Sep</option>
                      <option value={10}>Oct</option>
                      <option value={11}>Nov</option>
                      <option value={12}>Dec</option>
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(
                          Number(e.target.value)
                        )
                      }
                      className="bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2 text-sm"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                    </select>

                    <button
                      onClick={generatePayroll}
                      disabled={isGenerating}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-sm font-semibold"
                    >
                      {isGenerating
                        ? "Generating..."
                        : "Generate Payroll"}
                    </button>

                    <button
                      id="refresh-payroll-btn"
                      onClick={loadPayrolls}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-[#121212] rounded-lg text-sm"
                    >
                      Refresh Payroll Records
                    </button>

                  </div>
                </div>

                {/* AUDIT SPREADSHEET BLOCK GRID */}
                {payrollList.length > 0 ? (
                  <div className="space-y-4">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Engine Audit Spreadsheet Block Grid</span>
                    <div className="overflow-x-auto border border-[#30363d]/80 rounded-xl bg-[#121212]/40">
                      <table id="payroll-spreadsheet-grid" className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="bg-[#121212] border-b border-[#30363d] text-slate-400">
                            <th className="p-3 font-semibold">Employee Code</th>
                            <th className="p-3 font-semibold">Employee Name</th>
                            <th className="p-3 font-semibold text-right">Base Salary</th>
                            <th className="p-3 font-semibold text-right">Month</th>
                            <th className="p-3 font-semibold text-right">Leave Deduction</th>
                            <th className="p-3 font-semibold text-right">Net Salary</th>
                            <th className="p-3 font-semibold">Status</th>
                            <th className="p-3 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]/60 text-[#c9d1d9]">
                          {payrollList.map((payroll) => (
                            <tr
                              key={payroll.id}
                              className="hover:bg-[#30363d]/20 transition-all"
                            >
                              <td className="p-3 text-[#8b949e]">
                                {payroll.employee.employeeCode}
                              </td>

                              <td className="p-3 font-bold text-white">
                                {payroll.employee.firstName}{" "}
                                {payroll.employee.lastName}
                              </td>

                              {/* Base Salary */}
                              <td className="p-3 text-right">
                                ₹{Number(payroll.baseSalary).toLocaleString("en-IN")}
                              </td>

                              {/* Month */}
                              <td className="p-3 text-right">
                                {payroll.payrollMonth}/{payroll.payrollYear}
                              </td>

                              {/* Leave Deduction */}
                              <td className="p-3 text-right">
                                ₹{Number(payroll.leaveDeduction).toLocaleString("en-IN")}
                              </td>

                              {/* Net Salary */}
                              <td className="p-3 text-right font-bold text-emerald-400">
                                ₹{Number(payroll.netSalary).toLocaleString("en-IN")}
                              </td>

                              {/* Status */}
                              <td className="p-3">
                                <span className="px-2 py-1 rounded text-xs bg-slate-700">
                                  {payroll.status}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="p-3 space-x-2">
                                <button
                                  onClick={() => downloadPayslip(payroll.id)}
                                  className="px-2 py-1 bg-slate-700 rounded text-xs"
                                >
                                  Payslip
                                </button>

                                {payroll.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleApprovePayroll(payroll.id)}
                                    className="px-2 py-1 bg-blue-600 rounded text-xs"
                                  >
                                    Approve
                                  </button>
                                )}

                                {payroll.status === "APPROVED" && (
                                  <button
                                    onClick={() => handleMarkPayrollPaid(payroll.id)}
                                    className="px-2 py-1 bg-green-600 rounded text-xs"
                                  >
                                    Pay
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[11px] text-[#8b949e] flex items-center space-x-1.5 pt-2 italic">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500/80" />
                      <span>Spreadsheet is audited, aligned, and ready to be loaded for direct bank dispatch.</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-[#8b949e] bg-[#121212]/40 border border-[#30363d]/60 rounded-xl space-y-3">
                    <Calculator className="w-10 h-10 text-amber-500/40 mx-auto" />
                    <div>
                      <h4 className="font-semibold text-sm text-[#c9d1d9]">Payroll Calculations Pending</h4>
                      <p className="max-w-sm mx-auto mt-1">Initiate calculations above to query timesheets against base parameters and view real-time breakdown audits.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* VIEW 4: Leave Balance */}
          {activeTab === 'leaveAllocation' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-[#c9d1d9]">
                  Leave Allocation Management
                </h1>
                <p className="text-sm text-[#8b949e] mt-1">
                  Allocate annual leave quotas for employees across all leave categories.
                </p>
              </div>
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#30363d]">
                      <th className="py-3">
                        Employee
                      </th>
                      <th className="py-3">
                        Casual Leave
                      </th>
                      <th className="py-3">
                        Sick Leave
                      </th>
                      <th className="py-3">
                        Earned Leave
                      </th>
                      <th className="py-3">
                        Loss Of Pay
                      </th>
                      <th className="py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationData.map((row) => (
                      <tr
                        key={row.employeeId}
                        className="border-b border-[#30363d]/40"
                      >
                        <td className="py-3 font-semibold text-white">
                          {row.employeeName}
                        </td>

                        <td className="py-3">
                          <input
                            type="number"
                            defaultValue={row.casual}
                            className="bg-[#121212] border border-[#30363d] rounded px-2 py-1 w-20"
                            onBlur={(e) =>
                              updateAllocation(
                                row.employeeId,
                                "Casual Leave",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        <td className="py-3">
                          <input
                            type="number"
                            defaultValue={row.sick}
                            className="bg-[#121212] border border-[#30363d] rounded px-2 py-1 w-20"
                            onBlur={(e) =>
                              updateAllocation(
                                row.employeeId,
                                "Sick Leave",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        <td className="py-3">
                          <input
                            type="number"
                            defaultValue={row.earned}
                            className="bg-[#121212] border border-[#30363d] rounded px-2 py-1 w-20"
                            onBlur={(e) =>
                              updateAllocation(
                                row.employeeId,
                                "Earned Leave",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        <td className="py-3">
                          <input
                            type="number"
                            defaultValue={row.lop}
                            className="bg-[#121212] border border-[#30363d] rounded px-2 py-1 w-20"
                            onBlur={(e) =>
                              updateAllocation(
                                row.employeeId,
                                "Loss of Pay",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>

                        <td className="py-3">
                          <span className="text-emerald-400 text-xs font-semibold">
                            Auto Saved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* VIEW 5: HOLIDAYS*/}
          {activeTab === 'holidays' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-[#c9d1d9]">
                  Holiday Management
                </h1>
                <p className="text-sm text-[#8b949e] mt-1">
                  Manage company holidays used for payroll calculations.
                </p>
              </div>
              {/* Add Holiday */}
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                <h3 className="font-semibold mb-4">
                  Add Holiday
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Holiday Name"
                    value={holidayName}
                    onChange={(e) =>
                      setHolidayName(
                        e.target.value
                      )
                    }
                    className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                  />
                  <input
                    type="date"
                    value={holidayDate}
                    onChange={(e) =>
                      setHolidayDate(
                        e.target.value
                      )
                    }
                    className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                  />
                  <button
                    onClick={createHoliday}
                    className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2"
                  >
                    Add Holiday
                  </button>
                </div>
              </div>

              {/* Edit Holiday */}
              {editingHolidayId && (
                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                  <h3 className="font-semibold mb-4">
                    Edit Holiday
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) =>
                        setEditingName(
                          e.target.value
                        )
                      }
                      className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                    />
                    <input
                      type="date"
                      value={editingDate}
                      onChange={(e) =>
                        setEditingDate(
                          e.target.value
                        )
                      }
                      className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveHoliday}
                        className="bg-green-600 hover:bg-green-700 rounded px-4 py-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() =>
                          setEditingHolidayId(
                            null
                          )
                        }
                        className="bg-gray-600 hover:bg-gray-700 rounded px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Holiday List */}
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    placeholder="Search holiday..."
                    value={searchHoliday}
                    onChange={(e) =>
                      setSearchHoliday(
                        e.target.value
                      )
                    }
                    className="bg-[#121212] border border-[#30363d] rounded px-3 py-2 w-64"
                  />
                  <div className="text-sm text-[#8b949e]">
                    Total Holidays:
                    <span className="ml-2 font-bold text-white">
                      {filteredHolidays.length}
                    </span>
                  </div>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#30363d]">
                      <th className="text-left py-3">
                        Holiday
                      </th>
                      <th className="text-left py-3">
                        Date
                      </th>
                      <th className="text-left py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHolidays.map(
                      (holiday) => (
                        <tr
                          key={holiday.id}
                          className="border-b border-[#30363d]/40"
                        >
                          <td className="py-3">
                            {holiday.name}
                          </td>
                          <td className="py-3">
                            {new Date(
                              holiday.holidayDate
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 space-x-2">

                            <button
                              onClick={() => {
                                setEditingHolidayId(
                                  holiday.id
                                );

                                setEditingName(
                                  holiday.name
                                );

                                setEditingDate(
                                  holiday.holidayDate
                                    .split("T")[0]
                                );
                              }}
                              className="px-2 py-1 bg-blue-600 rounded text-xs"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteHoliday(
                                  holiday.id
                                )
                              }
                              className="px-2 py-1 bg-red-600 rounded text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 6: EMPLOYEE*/}
          {activeTab === 'employees' && (
            <div className="space-y-6">

              <div className="flex justify-between items-center">

                <div>
                  <h1 className="text-2xl font-semibold text-[#c9d1d9]">
                    Employee Management
                  </h1>

                  <p className="text-sm text-[#8b949e]">
                    Create and manage employees
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowEmployeeModal(true)
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  + Add Employee
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5 hover:border-blue-500/40 transition-all">
                    <div className="flex justify-between items-center">
                      <div>

                        <p className="text-xs uppercase tracking-widest text-[#8b949e] font-semibold">
                          Total Employees
                        </p>

                        <h2 className="text-4xl font-bold text-white mt-3">
                          {employees.length}
                        </h2>

                        <p className="text-sm text-[#8b949e] mt-2">
                          Registered in System
                        </p>

                      </div>
                      <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">

                        <Users className="w-7 h-7 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5 hover:border-green-500/40 transition-all">
                    <div className="flex justify-between items-center">
                      <div>

                        <p className="text-xs uppercase tracking-widest text-[#8b949e] font-semibold">
                          Active Employees
                        </p>

                        <h2 className="text-4xl font-bold text-green-400 mt-3">
                          {employees.filter((e: any) => e.active).length}
                        </h2>

                        <p className="text-sm text-[#8b949e] mt-2">
                          Can Access System
                        </p>

                      </div>
                      <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">

                        <UserCheck className="w-7 h-7 text-green-400" />

                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5 hover:border-red-500/40 transition-all">

                    <div className="flex justify-between items-center">

                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#8b949e] font-semibold">
                          Inactive Employees
                        </p>

                        <h2 className="text-4xl font-bold text-red-400 mt-3">
                          {employees.filter((e: any) => !e.active).length}
                        </h2>

                        <p className="text-sm text-[#8b949e] mt-2">
                          Access Revoked
                        </p>
                      </div>

                      <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center">

                        <UserX className="w-7 h-7 text-red-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]"
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full bg-[#121212] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 focus:border-blue-500 outline-none"
                  />
                </div>

              </div>
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl overflow-hidden">
                <table className="w-full">

                  <thead>
                    <tr className="border-b border-[#30363d]">
                      <th className="p-4 text-left">
                        Code
                      </th>
                      <th className="p-4 text-left">
                        Name
                      </th>
                      <th className="p-4 text-left">
                        Designation
                      </th>
                      <th className="p-4 text-left">
                        Monthly Salary
                      </th>
                      <th className="p-4 text-left">
                        Status
                      </th>
                      <th className="p-4 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-20 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-5">

                              <User
                                size={30}
                                className="text-[#8b949e]"
                              />

                            </div>

                            <h3 className="text-xl font-semibold text-white">
                              No Employees Found
                            </h3>

                            <p className="text-sm text-[#8b949e] mt-2">
                              No employees match your search criteria.
                            </p>

                            <button
                              onClick={() =>
                                setShowEmployeeModal(true)
                              }
                              className="mt-6 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                            >
                              + Add Employee
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee: any) => {
                        console.log("Employee Row:", employee);
                        return (
                          <tr
                            key={employee.id}
                            className="border-b border-[#30363d]/40"
                          >

                            <td className="p-4">
                              {employee.username}
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="
                                  w-10
                                  h-10
                                  rounded-full
                                  bg-blue-600
                                  flex
                                  items-center
                                  justify-center
                                  font-semibold
                                  text-white
                                  ">
                                  {
                                    employee.fullName
                                      .split(" ")
                                      .map((n: any) => n[0])
                                      .join("")
                                  }
                                </div>

                                <div>
                                  <div className="font-semibold text-white">
                                    {employee.fullName}
                                  </div>
                                  <div className="text-xs text-[#8b949e]">
                                    {employee.username}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              {employee.department}
                            </td>

                            <div className="flex items-center gap-2">
                              <IndianRupee
                                size={15}
                                className="text-emerald-400"
                              />

                              <span className="font-semibold">
                                {Number(employee.baseSalary).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <input
                                  type="checkbox"
                                  checked={employee.active}
                                  onChange={() => toggleEmployeeStatus(employee)}
                                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                />
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${employee.active
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                    }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${employee.active
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                      }`}
                                  />
                                  {employee.active ? "ACTIVE" : "INACTIVE"}
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await api.get(
                                      `/employees/${employee.id}`
                                    );
                                    const emp = response.data;
                                    setEditingEmployee(emp);
                                    setEditEmployeeForm({
                                      firstName: emp.firstName,
                                      lastName: emp.lastName,
                                      phone: emp.phone || "",
                                      designation: emp.designation,
                                      status: emp.status,
                                    });
                                  } catch (error) {
                                    console.error(
                                      "Employee Load Error:",
                                      error
                                    );
                                    triggerToast(
                                      "Failed to Load Employee Details"
                                    );

                                  }
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all duration-200"
                              >
                                <Pencil size={16} />
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {editingEmployee && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="w-full max-w-3xl bg-[#1e1e1e] border border-[#30363d] rounded-2xl shadow-2xl p-8">

                      <div className="border-b border-[#30363d] pb-5 mb-6">
                        <h2 className="text-2xl font-bold text-white">
                          Edit Employee
                        </h2>

                        <p className="text-sm text-[#8b949e] mt-1">
                          Update employee information.
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-8">

                        <div>
                          <label className="block text-xs text-[#8b949e] mb-1">
                            Employee Code
                          </label>

                          <input
                            value={editingEmployee.employeeCode}
                            disabled
                            className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2 text-[#8b949e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-[#8b949e] mb-1">
                            Email
                          </label>

                          <input
                            value={editingEmployee.email}
                            disabled
                            className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2 text-[#8b949e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-[#8b949e] mb-1">
                            Joining Date
                          </label>

                          <input
                            value={
                              new Date(editingEmployee.joiningDate)
                                .toLocaleDateString("en-IN")
                            }
                            disabled
                            className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2 text-[#8b949e]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">

                        <div>
                          <label className="block text-sm text-[#c9d1d9] mb-2">
                            First Name
                          </label>
                          <input
                            value={editEmployeeForm.firstName}
                            onChange={(e) => {
                              setEditEmployeeForm({
                                ...editEmployeeForm,
                                firstName: e.target.value,
                              });
                              setEmployeeErrors({
                                ...employeeErrors,
                                firstName: "",
                              });
                            }}
                            className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                          />
                          {employeeErrors.firstName && (
                            <p className="text-red-400 text-xs mt-1">
                              {employeeErrors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-[#c9d1d9] mb-2">
                            Last Name
                          </label>

                          <input
                            value={editEmployeeForm.lastName}
                            onChange={(e) => {
                              setEditEmployeeForm({
                                ...editEmployeeForm,
                                lastName: e.target.value,
                              });

                              setEmployeeErrors({
                                ...employeeErrors,
                                lastName: "",
                              });
                            }}
                            className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                          />
                          {employeeErrors.lastName && (
                            <p className="text-red-400 text-xs mt-1">
                              {employeeErrors.lastName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-[#c9d1d9] mb-2">
                            Phone Number
                          </label>

                          <input
                            value={editEmployeeForm.phone}
                            onChange={(e) => {
                              setEditEmployeeForm({
                                ...editEmployeeForm,
                                phone: e.target.value,
                              });

                              setEmployeeErrors({
                                ...employeeErrors,
                                phone: "",
                              });
                            }}
                            className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                          />

                          {employeeErrors.phone && (
                            <p className="text-red-400 text-xs mt-1">
                              {employeeErrors.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-[#c9d1d9] mb-2">
                            Designation
                          </label>

                          <input
                            value={editEmployeeForm.designation}
                            onChange={(e) => {
                              setEditEmployeeForm({
                                ...editEmployeeForm,
                                designation: e.target.value,
                              });

                              setEmployeeErrors({
                                ...employeeErrors,
                                designation: "",
                              });
                            }}
                            className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                          />

                          {employeeErrors.designation && (
                            <p className="text-red-400 text-xs mt-1">
                              {employeeErrors.designation}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#30363d]">

                        <button
                          onClick={() => setEditingEmployee(null)}
                          className="px-5 py-2.5 bg-[#30363d] hover:bg-[#3b424a] rounded-lg transition"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={saveEmployeeChanges}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition"
                        >
                          Save Changes
                        </button>

                      </div>
                    </div>
                  </div>
                )}

                {showEmployeeModal && (

                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="w-full max-w-2xl bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                      <h2 className="text-xl font-semibold mb-6">
                        Add Employee
                      </h2>

                      <div className="grid grid-cols-2 gap-4">

                        <input
                          placeholder="First Name"
                          value={employeeForm.firstName}
                          onChange={(e) =>
                            setEmployeeForm({
                              ...employeeForm,
                              firstName: e.target.value,
                            })
                          }
                          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                        />

                        <input
                          placeholder="Last Name"
                          value={employeeForm.lastName}
                          onChange={(e) =>
                            setEmployeeForm({
                              ...employeeForm,
                              lastName: e.target.value,
                            })
                          }
                          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                        />

                        <input
                          placeholder="Email"
                          value={employeeForm.email}
                          onChange={(e) =>
                            setEmployeeForm({
                              ...employeeForm,
                              email: e.target.value,
                            })
                          }
                          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                        />

                        <input
                          placeholder="Phone"
                          value={employeeForm.phone}
                          onChange={(e) =>
                            setEmployeeForm({
                              ...employeeForm,
                              phone: e.target.value,
                            })
                          }
                          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                        />

                        <input
                          placeholder="Designation"
                          value={employeeForm.designation}
                          onChange={(e) =>
                            setEmployeeForm({
                              ...employeeForm,
                              designation: e.target.value,
                            })
                          }
                          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                        />

                        <input
                          type="date"
                          value={employeeForm.joiningDate}
                          onChange={(e) =>
                            setEmployeeForm({
                              ...employeeForm,
                              joiningDate: e.target.value,
                            })
                          }
                          className="bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">

                        <button
                          onClick={() =>
                            setShowEmployeeModal(false)
                          }
                          className="px-4 py-2 bg-gray-700 rounded"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={createEmployee}
                          className="px-4 py-2 bg-emerald-600 rounded"
                        >
                          Create Employee
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* VIEW 7: SALARY STRUCTURES */}
          {activeTab === 'salary-structures' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-[#c9d1d9]">
                  Salary Structures
                </h1>
                <p className="text-sm text-[#8b949e] mt-1">
                  Configure salary components for employees.
                </p>
              </div>
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                <label className="block text-sm mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) =>
                    setSelectedEmployeeId(
                      e.target.value
                    )
                  }
                  className="w-full bg-[#121212] border border-[#30363d] rounded px-3 py-2"
                >
                  <option value="">
                    Select Employee
                  </option>
                  {employees.map((emp) => (
                    <option
                      key={emp.id}
                      value={emp.id}
                    >
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEmployeeId && (
                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Salary Components
                      </h3>

                      <p className="text-sm text-[#8b949e]">
                        Configure employee earnings structure
                      </p>
                    </div>

                    <div className="flex items-center gap-4">

                      <button
                        onClick={addComponent}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium"
                      >
                        + Add Component
                      </button>

                      <div className="text-right">
                        <div className="text-xs text-[#8b949e]">
                          Total Earnings
                        </div>

                        <div className="text-xl font-bold text-emerald-400">
                          ₹{
                            salaryComponents
                              .reduce(
                                (sum, component) =>
                                  sum + Number(component.amount),
                                0
                              )
                              .toLocaleString("en-IN")
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="w-12"></th>
                        <th className="text-left py-3">
                          Component
                        </th>

                        <th className="text-center py-3">
                          Type
                        </th>

                        <th className="text-right py-3">
                          Amount
                        </th>

                        <th className="text-center py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <DndContext
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={salaryComponents.map(
                          (component: any) =>
                            component.id
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        <tbody>
                          {salaryComponents.map((component) => (
                            <SortableRow
                              key={component.id}
                              component={component}
                              salaryComponents={
                                salaryComponents
                              }
                              setSalaryComponents={
                                setSalaryComponents
                              }
                              deleteComponent={
                                deleteComponent
                              }
                            />
                          ))}
                        </tbody>
                      </SortableContext>
                    </DndContext>
                  </table>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={saveSalaryComponents}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                    >
                      Save Salary Structure
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* VIEW 8: EXPORT CENTER */}
          {activeTab === 'exports' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#c9d1d9]">Commercial reports Export Center</h1>
                <p className="text-sm text-[#8b949e] mt-1">Extract certified database reporting modules built for accounting logs and management audits.</p>
              </div>

              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-5">Prepared Extractable Modules</h3>

                <div className="space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={viewPayrollReport}
                      className="px-4 py-2 bg-blue-600 rounded text-sm"
                    >
                      View Payroll Report
                    </button>
                    <button
                      onClick={viewLeaveReport}
                      className="px-4 py-2 bg-amber-600 rounded text-sm"
                    >
                      View Leave Report
                    </button>
                    <button
                      onClick={downloadPayrollExcel}
                      className="px-4 py-2 bg-emerald-600 rounded text-sm"
                    >
                      Download Excel
                    </button>
                    {payrollReport.length > 0 && (
                      <div className="mt-6 overflow-x-auto border border-[#30363d]/80 rounded-xl bg-[#121212]/40">
                        <table className="w-full text-left border-collapse font-mono text-xs">
                          <thead>
                            <tr className="bg-[#121212] border-b border-[#30363d] text-slate-400">
                              <th className="p-3">Employee</th>
                              <th className="p-3">Designation</th>
                              <th className="p-3">Month</th>
                              <th className="p-3">Year</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Net Salary</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-[#30363d]/60 text-[#c9d1d9]">
                            {payrollReport.map((row) => (
                              <tr
                                key={row.payrollId}
                                className="hover:bg-[#30363d]/20 transition-all"
                              >
                                <td className="p-3">{row.employeeName}</td>
                                <td className="p-3">{row.designation}</td>
                                <td className="p-3">{row.month}</td>
                                <td className="p-3">{row.year}</td>

                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded text-[10px] font-semibold ${row.status === "PAID"
                                      ? "bg-emerald-950/40 text-emerald-400"
                                      : row.status === "APPROVED"
                                        ? "bg-blue-950/40 text-blue-400"
                                        : "bg-amber-950/40 text-amber-400"
                                      }`}
                                  >
                                    {row.status}
                                  </span>
                                </td>

                                <td className="p-3 text-right font-bold text-emerald-400">
                                  ₹{Number(row.netSalary).toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {leaveReport.length > 0 && (
                      <div className="mt-6 overflow-x-auto border border-[#30363d]/80 rounded-xl bg-[#121212]/40">
                        <table className="w-full text-left border-collapse font-mono text-xs">
                          <thead>
                            <tr className="bg-[#121212] border-b border-[#30363d] text-slate-400">
                              <th className="p-3">Employee</th>
                              <th className="p-3">Leave Type</th>
                              <th className="p-3">Start Date</th>
                              <th className="p-3">End Date</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-[#30363d]/60 text-[#c9d1d9]">
                            {leaveReport.map((row) => (
                              <tr
                                key={row.leaveId}
                                className="hover:bg-[#30363d]/20 transition-all"
                              >
                                <td className="p-3">{row.employeeName}</td>

                                <td className="p-3 text-amber-400">
                                  {row.leaveType}
                                </td>

                                <td className="p-3">
                                  {new Date(row.startDate)
                                    .toLocaleDateString("en-IN")}
                                </td>

                                <td className="p-3">
                                  {new Date(row.endDate)
                                    .toLocaleDateString("en-IN")}
                                </td>

                                <td className="p-3">
                                  <span className="px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 text-[10px]">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main >

      {workLogModalOpen && selectedWorkLog && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#30363d]">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedWorkLog.employee.firstName}{" "}
                  {selectedWorkLog.employee.lastName}
                </h2>

                <p className="text-[#8b949e]">
                  {selectedWorkLog.employee.designation}
                </p>
              </div>

              <button
                onClick={() => setWorkLogModalOpen(false)}
                className="text-[#8b949e] hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Employee Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <p className="text-xs text-[#8b949e]">Work Date</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(selectedWorkLog.workDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <p className="text-xs text-[#8b949e]">Status</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    {selectedWorkLog.status}
                  </p>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <p className="text-xs text-[#8b949e]">Activities</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedWorkLog.activities.length}
                  </p>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <p className="text-xs text-[#8b949e]">Employee ID</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedWorkLog.employee.employeeCode}
                  </p>
                </div>

              </div>

              {/* Work Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs text-[#8b949e]">
                    Working Time
                  </p>

                  <h3 className="text-2xl font-bold text-green-400 mt-2">
                    {formatMinutes(workMinutes)}
                  </h3>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs text-[#8b949e]">
                    Break Time
                  </p>

                  <h3 className="text-2xl font-bold text-yellow-400 mt-2">
                    {formatMinutes(breakMinutes)}
                  </h3>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs text-[#8b949e]">
                    Lunch Time
                  </p>

                  <h3 className="text-2xl font-bold text-orange-400 mt-2">
                    {formatMinutes(lunchMinutes)}
                  </h3>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs text-[#8b949e]">
                    Total Logged
                  </p>

                  <h3 className="text-2xl font-bold text-blue-400 mt-2">
                    {formatMinutes(totalMinutes)}
                  </h3>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="border border-[#30363d] rounded-xl overflow-hidden">

                <div className="px-5 py-4 border-b border-[#30363d] bg-[#0d1117]">
                  <h3 className="font-semibold text-lg">
                    Activity Timeline
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#161b22]">
                      <tr className="text-left text-sm text-[#8b949e]">
                        <th className="px-5 py-3">Start</th>
                        <th className="px-5 py-3">End</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWorkLog.activities.map((activity: any) => (
                        <tr
                          key={activity.id}
                          className="border-t border-[#30363d] hover:bg-[#0d1117]"
                        >
                          <td className="px-5 py-4">
                            {activity.startTime}
                          </td>

                          <td className="px-5 py-4">
                            {activity.endTime}
                          </td>

                          <td className="px-5 py-4">
                            <span className="px-2 py-1 rounded-md bg-[#30363d] text-xs">
                              {activity.activityType}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {activity.activity}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="border border-[#30363d] rounded-xl p-6 bg-[#0d1117]">

              <h3 className="text-lg font-semibold mb-4">
                Review Decision
              </h3>

              <textarea
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(e.target.value)
                }
                placeholder="Enter rejection reason (required only if rejecting)..."
                rows={4}
                className="w-full rounded-lg bg-[#161b22] border border-[#30363d] px-4 py-3 text-white placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 resize-none"
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={reviewLoading}
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>

                <button
                  onClick={handleApproveWorkLog}
                  disabled={reviewLoading}
                  className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#30363d] bg-[#161b22]">

            <div className="px-6 py-4 border-b border-[#30363d]">
              <h2 className="text-xl font-semibold text-white">
                Reject Work Log
              </h2>

              <p className="text-sm text-[#8b949e] mt-1">
                Please provide a reason for rejecting this work log.
              </p>
            </div>

            <div className="p-6">

              <textarea
                rows={5}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-white resize-none"
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="px-5 py-2 rounded-lg border border-[#30363d]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRejectWorkLog}
                  disabled={!rejectionReason.trim() || reviewLoading}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Work Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
function refreshEmployees() {
  throw new Error('Function not implemented.');
}

