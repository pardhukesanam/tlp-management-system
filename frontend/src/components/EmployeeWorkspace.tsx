import React, { useEffect, useState } from 'react';
import {
  Employee,
  Timesheet,
  LeaveRequest,
  Payslip,
  LeaveType
} from '../types';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Download,
  CalendarCheck,
  Pencil,
  Trash2
} from 'lucide-react';
import { getEmployeeDashboard } from "../api/dashboard.api";
import { getTodayWorkLog, addActivity, deleteActivity, updateActivity, submitWorkLog } from "../api/timesheet.api";
import { getMyLeaves, createLeave, cancelLeave, } from "../api/leave.api";
import { api } from "../api/client";

interface EmployeeWorkspaceProps {
  currentUserId: string;
  employees: Employee[];
  timesheets: Record<string, Timesheet>;
  leaveRequests: Record<string, LeaveRequest[]>;
  payslips: Record<string, Payslip[]>;
  onUpdateTimesheet: (employeeId: string, weekEnding: string, timesheet: Timesheet) => void;
  onAddLeaveRequest: (employeeId: string, request: LeaveRequest) => void;
  onLogout: () => void;
}

export default function EmployeeWorkspace({
  currentUserId,
  employees,
  timesheets,
  leaveRequests,
  payslips,
  onUpdateTimesheet,
  onAddLeaveRequest,
  onLogout,
}: EmployeeWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "timesheets" | "leaves" | "payslips"
  >("dashboard");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [employeeLeaves, setEmployeeLeaves] = useState<any[]>([]);
  const [employeeTimesheets, setEmployeeTimesheets] = useState<any[]>([]);
  const [employeePayrolls, setEmployeePayrolls] = useState<any[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null);

  const loadProfile = async () => {
    try {
      const dashboard = await getEmployeeDashboard();

      setCurrentEmployee(dashboard.profile);

      const todayWorkLog = await getTodayWorkLog();

      setWorkLog(todayWorkLog);
      setActivities(todayWorkLog.activities);

      setEmployeeLeaves(dashboard.leaves);
      setEmployeeTimesheets(dashboard.timesheets);
      setEmployeePayrolls(dashboard.payrolls);

      if (dashboard.payrolls.length > 0) {
        setSelectedPayroll(dashboard.payrolls[0]);
      }

    } catch (err) {
      console.error("Profile Error:", err);
    }
  };
  useEffect(() => {
    loadProfile();
  }, []);

  const isArchived = currentEmployee?.status === "INACTIVE";

  const [workDate, setWorkDate] = useState("");
  const [hoursWorked, setHoursWorked] = useState(8);
  const [description, setDescription] = useState("");
  const [workLog, setWorkLog] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [workLogNotification, setWorkLogNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const isWorkLogLocked = false;

  const activeWeekEnding = "2023-10-22";

  const timesheetKey = currentEmployee
    ? `${currentEmployee.id}_${activeWeekEnding}`
    : "";

  const userTimesheet: Timesheet =
    currentEmployee && timesheets[timesheetKey]
      ? timesheets[timesheetKey]
      : {
        id: "temp",
        weekEnding: activeWeekEnding,
        days: {
          Mon: 8,
          Tue: 8,
          Wed: 8,
          Thu: 8,
          Fri: 8,
          Sat: 0,
          Sun: 0,
        },
        status: "Draft",
        rejectionComment: undefined,
      };

  const userLeaves = currentEmployee
    ? leaveRequests[currentEmployee.id] || []
    : [];

  const hasPendingLeave = employeeLeaves.some(
    (leave: any) => leave.status === "PENDING"
  );

  const userPayslips = currentEmployee
    ? payslips[currentEmployee.id] || []
    : [];

  const [leaveType, setLeaveType] = useState<LeaveType>("Casual");
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveNote, setLeaveNote] = useState("");
  const [leaveSuccessMessage, setLeaveSuccessMessage] = useState("");
  const [leaveErrorMessage, setLeaveErrorMessage] = useState("");
  const [monHr, setMonHr] = useState(userTimesheet.days.Mon);
  const [tueHr, setTueHr] = useState(userTimesheet.days.Tue);
  const [wedHr, setWedHr] = useState(userTimesheet.days.Wed);
  const [thuHr, setThuHr] = useState(userTimesheet.days.Thu);
  const [friHr, setFriHr] = useState(userTimesheet.days.Fri);
  const [satHr, setSatHr] = useState(userTimesheet.days.Sat);
  const [sunHr, setSunHr] = useState(userTimesheet.days.Sun);
  const [timesheetNotification, setTimesheetNotification] = useState("");

  useEffect(() => {
    const loadLeaveTypes = async () => {
      try {
        const response = await api.get("/leave-types");
        setLeaveTypes(response.data);
      } catch (error) {
        console.error("Leave Types Error:", error);
      }
    };

    loadLeaveTypes();
  }, []);

  useEffect(() => {
    setMonHr(userTimesheet.days.Mon);
    setTueHr(userTimesheet.days.Tue);
    setWedHr(userTimesheet.days.Wed);
    setThuHr(userTimesheet.days.Thu);
    setFriHr(userTimesheet.days.Fri);
    setSatHr(userTimesheet.days.Sat);
    setSunHr(userTimesheet.days.Sun);
  }, [userTimesheet.id, userTimesheet.status]);

  const totalTimesheetHours =
    Number(monHr) +
    Number(tueHr) +
    Number(wedHr) +
    Number(thuHr) +
    Number(friHr) +
    Number(satHr) +
    Number(sunHr);

  const overtimeHoursClaimedByTimesheet =
    Math.max(0, totalTimesheetHours - 40);
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("10:30");
  const [activityType, setActivityType] = useState("WORK");
  const [activity, setActivity] = useState("");

  useEffect(() => {
    console.log("workLogNotification:", workLogNotification);
  }, [workLogNotification]);

  if (!currentEmployee) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        Loading employee profile...
      </div>
    );
  }

  // Handle Timesheet Save as Draft
  const handleSaveTimesheetDraft = () => {
    if (isArchived) return;
    const updatedTS: Timesheet = {
      ...userTimesheet,
      days: {
        Mon: Number(monHr),
        Tue: Number(tueHr),
        Wed: Number(wedHr),
        Thu: Number(thuHr),
        Fri: Number(friHr),
        Sat: Number(satHr),
        Sun: Number(sunHr),
      },
      status: "Draft",
    };
    onUpdateTimesheet(currentEmployee.id, activeWeekEnding, updatedTS);
    setTimesheetNotification(
      "Timesheet saved as draft successfully!"
    );
    setTimeout(() => {
      setTimesheetNotification("");
    }, 4000);
  };

  // Handle Timesheet Submit
  const handleSubmitTimesheet = () => {
    if (isArchived) return;
    const updatedTS: Timesheet = {
      ...userTimesheet,
      days: {
        Mon: Number(monHr),
        Tue: Number(tueHr),
        Wed: Number(wedHr),
        Thu: Number(thuHr),
        Fri: Number(friHr),
        Sat: Number(satHr),
        Sun: Number(sunHr),
      },
      status: "Submitted for Review",
      submittedAt: new Date().toISOString(),
    };
    onUpdateTimesheet(currentEmployee.id, activeWeekEnding, updatedTS);
    setTimesheetNotification(
      "Timesheet submitted for review successfully!"
    );
    setTimeout(() => {
      setTimesheetNotification("");
    }, 4000);
  };

  // Handle Leave Submission
  const handleLeaveSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLeaveSuccessMessage("");
    setLeaveErrorMessage("");
    if (isArchived) {
      setLeaveErrorMessage(
        "This account is archived. Leave request actions are locked."
      );
      return;
    }
    if (!startDate || !endDate) {
      setLeaveErrorMessage("Please select both dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setLeaveErrorMessage(
        "End Date cannot occur prior to Start Date."
      );
      return;
    }
    try {
      const selectedLeaveType = leaveTypes.find(
        (type: any) => type.name === `${leaveType} Leave`
      );
      if (!selectedLeaveType) {
        setLeaveErrorMessage(
          "Invalid leave type selected."
        );
        return;
      }
      await createLeave({
        leaveTypeId: selectedLeaveType.id,
        startDate,
        endDate,
        reason: leaveNote,
      });
      setLeaveSuccessMessage(
        "Leave request submitted successfully."
      );
      setLeaveNote("");
      setStartDate("");
      setEndDate("");
      await loadProfile();
    } catch (error: any) {
      console.error(error);

      console.log(error.response?.data);
      console.log(error.response?.status);

      setLeaveErrorMessage(
        error.response?.data?.message ??
        "Failed to submit leave request."
      );
    }
  };

  // Handle Payslip Download
  const handleDownloadPayslip = async (payrollId: string) => {
    try {
      const response = await api.get(
        `/payrolls/${payrollId}/payslip`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Unable to download payslip.");
    }
  };

  const latestLeave = employeeLeaves.length > 0 ? employeeLeaves[0] : null;
  const latestTimesheetState = employeeTimesheets.length > 0 ? employeeTimesheets[0] : null;
  const latestPayroll =
  employeePayrolls.length > 0
    ? employeePayrolls[0]
    : null;


  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "timesheets",
      label: "Timesheets",
      icon: Clock,
    },
    {
      id: "leaves",
      label: "Leave Request",
      icon: CalendarDays,
    },
    {
      id: "payslips",
      label: "Payslips",
      icon: FileText,
    },
  ] as const;

  const workMinutes = activities
    .filter((a: any) => a.activityType === "WORK")
    .reduce((total: number, a: any) => {
      const [sh, sm] = a.startTime.split(":").map(Number);
      const [eh, em] = a.endTime.split(":").map(Number);
      return total + ((eh * 60 + em) - (sh * 60 + sm));
    }, 0);

  const breakMinutes = activities
    .filter((a: any) => a.activityType === "BREAK")
    .reduce((total: number, a: any) => {
      const [sh, sm] = a.startTime.split(":").map(Number);
      const [eh, em] = a.endTime.split(":").map(Number);
      return total + ((eh * 60 + em) - (sh * 60 + sm));
    }, 0);

  const lunchMinutes = activities
    .filter((a: any) => a.activityType === "LUNCH")
    .reduce((total: number, a: any) => {
      const [sh, sm] = a.startTime.split(":").map(Number);
      const [eh, em] = a.endTime.split(":").map(Number);
      return total + ((eh * 60 + em) - (sh * 60 + sm));
    }, 0);
  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const handleAddActivity = async () => {
    try {
      if (!workLog) return;

      if (editingActivityId) {
        await updateActivity(editingActivityId, {
          startTime,
          endTime,
          activityType,
          activity,
        });

        setEditingActivityId(null);
      } else {
        console.log("Sending activity:", {
          workLogId: workLog?.id,
          startTime,
          endTime,
          activityType,
          activity,
        });
        console.log("Current Work Log:", workLog);
        await addActivity(workLog.id, {
          startTime,
          endTime,
          activityType,
          activity,
        });
      }

      const updated = await getTodayWorkLog();

      setWorkLog(updated);
      setActivities(updated.activities);

      setActivity("");
      setStartTime("09:30");
      setEndTime("10:30");
      setActivityType("WORK");

      setWorkLogNotification({
        type: "success",
        message: editingActivityId
          ? "Activity updated successfully."
          : "Activity added successfully.",
      });

      setTimeout(() => {
        setWorkLogNotification(null);
      }, 4000);

    } catch (error) {
      console.error(error);

      setWorkLogNotification({
        type: "error",
        message: "Something went wrong. Please try again.",
      });

      setTimeout(() => {
        setWorkLogNotification(null);
      }, 4000);
    }
  };



  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);

      const updated = await getTodayWorkLog();

      setWorkLog(updated);
      setActivities(updated.activities);

      setWorkLogNotification({
        type: "success",
        message: "Activity deleted successfully.",
      });

      setTimeout(() => {
        setWorkLogNotification(null);
      }, 4000);

    } catch (error) {
      console.error(error);

      setWorkLogNotification({
        type: "error",
        message: "Failed to delete activity.",
      });

      setTimeout(() => {
        setWorkLogNotification(null);
      }, 4000);
    }
  };

  const handleSubmitWorkLog = async () => {
    try {
      if (!workLog) return;

      await submitWorkLog(workLog.id);

      const updated = await getTodayWorkLog();

      setWorkLog(updated);
      setActivities(updated.activities);

      setWorkLogNotification({
        type: "success",
        message: "Work log submitted successfully for review.",
      });

      setTimeout(() => {
        setWorkLogNotification(null);
      }, 4000);

    } catch (error) {
      console.error(error);

      setWorkLogNotification({
        type: "error",
        message: "Failed to submit work log.",
      });

      setTimeout(() => {
        setWorkLogNotification(null);
      }, 4000);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await cancelLeave(leaveId);

      setLeaveSuccessMessage("Leave request cancelled successfully.");
      setLeaveErrorMessage("");

      await loadProfile();
    } catch (error) {
      console.error(error);

      setLeaveErrorMessage("Failed to cancel leave request.");
      setLeaveSuccessMessage("");
    }
  };

  console.log(workLog?.status);
  console.log(isWorkLogLocked);


  return (
    <div className="h-screen w-full bg-[#121212] text-[#c9d1d9] flex flex-col md:flex-row antialiased font-sans overflow-hidden">
      {/* Dynamic Archived Overlay banner */}
      {isArchived && (
        <div className="fixed top-0 left-0 right-0 bg-red-950/80 border-b border-red-800 text-red-200 py-2.5 px-4 text-center text-xs font-semibold tracking-wide z-50">
          ⚠️ ACCOUNT DEACTIVATED & ARCHIVED. ALL WORKSPACES AND ACTION CONTROLS ARE LOCKED IN READ-ONLY HISTORIC VIEW.
        </div>
      )}

      {/* Mobile Top Header */}
      <div className={`md:hidden flex items-center justify-between px-5 py-4 bg-[#1e1e1e] border-b border-[#30363d] shrink-0 ${isArchived ? 'mt-9' : ''}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-[#30363d] flex items-center justify-center font-mono font-bold text-xs">
            {`${currentEmployee.firstName} ${currentEmployee.lastName}`
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="text-sm font-medium leading-none text-white">{currentEmployee.firstName} {currentEmployee.lastName}</div>
            <div className="text-[10px] text-[#8b949e]">
              {currentEmployee.designation}
            </div>
          </div>
        </div>
        <button
          id="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-[#30363d] bg-[#121212] text-[#c9d1d9]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation - Fixed Desktop / Hamburger Expansion Mobile */}
      <aside
        id="employee-sidebar"
        className={`bg-[#1e1e1e] border-r border-[#30363d] w-full md:w-64 shrink-0 transition-all duration-250 ease-in-out z-40 
          ${mobileMenuOpen ? 'block fixed inset-x-0 top-[65px] bottom-0' : 'hidden md:flex flex-col'}
          ${isArchived && !mobileMenuOpen ? 'pt-9' : ''}
        `}
      >
        {/* Desktop Profile Header within Sidebar */}
        <div className="hidden md:block p-6 border-b border-[#30363d]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#30363d] flex items-center justify-center text-lg font-bold text-white">
              {`${currentEmployee.firstName} ${currentEmployee.lastName}`
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-base lg:text-lg font-semibold text-white truncate">
                {currentEmployee.firstName} {currentEmployee.lastName}
              </h2>

              <p className="text-xs text-[#8b949e] mt-1">
                {currentEmployee.designation}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                <span className="px-2 py-1 rounded-md bg-[#121212] border border-[#30363d] text-[11px] text-[#c9d1d9]">
                  {currentEmployee.employeeCode}
                </span>

                <span
                  className={`px-2 py-1 rounded-md text-[11px] border ${currentEmployee.status === "ACTIVE"
                    ? "bg-emerald-900/20 text-emerald-400 border-emerald-700/40"
                    : "bg-red-900/20 text-red-400 border-red-700/40"
                    }`}
                >
                  {currentEmployee.status}
                </span>
              </div>
            </div>
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
                id={`emp-nav-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors cursor-pointer ${isActive
                  ? 'bg-[#30363d] text-white font-medium'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#252525]'
                  }`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-[#30363d]">
          <button
            id="employee-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2.5 px-3 py-2 bg-[#121212] hover:bg-amber-950/20 hover:text-amber-400 border border-[#30363d] hover:border-amber-900/60 rounded text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-[#121212] border-b border-[#30363d] items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-medium text-white">Workstation Terminal</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[#8b949e] uppercase tracking-widest font-semibold">{currentEmployee.department} DEPARTMENT</p>
              <p className="text-sm font-medium text-[#c9d1d9]">{currentEmployee.firstName} {currentEmployee.lastName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#30363d] flex items-center justify-center text-xs font-semibold text-[#8b949e]">
              {currentEmployee.id}
            </div>
          </div>
        </header>

        {/* Scrollable sub-container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 container max-w-7xl mx-auto">

          {/* VIEW A: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header / Intro */}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#c9d1d9]">Workstation Dashboard</h1>
                <p className="text-sm text-[#8b949e] mt-1">Real-time leave credits, alert history, and salary dispatch access.</p>
              </div>

              {/* Leave Balance Counter Grid (4 Balance types) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {currentEmployee.leaveBalances.map((leave: any) => {
                  const remaining = leave.allocatedDays - leave.usedDays;

                  return (
                    <div
                      key={leave.id}
                      className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between"
                    >
                      <span className="text-xs font-medium uppercase tracking-wider text-[#8b949e]">
                        {leave.leaveType.name}
                      </span>

                      <div className="my-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold font-mono text-[#c9d1d9]">
                          {remaining}
                        </span>

                        <span className="text-xs text-[#8b949e]">
                          days
                        </span>
                      </div>

                      <div className="text-[11px] text-[#8b949e] space-y-1">
                        <div>Allocated : {leave.allocatedDays}</div>
                        <div>Used : {leave.usedDays}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Notification Pane */}
                <div className="lg:col-span-7 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">
                      <Bell className="w-4 h-4 text-[#8b949e]" />
                      <span>Real-time System Audit & Approvals Pane</span>
                    </div>

                    <div className="space-y-4">
                      {/* Active Timesheet Notification */}
                      {latestTimesheetState ? (
                        <div className="p-4 bg-[#121212] border border-[#30363d] rounded-lg flex items-start space-x-3">
                          <div className="p-1 rounded bg-[#30363d]/40 border border-[#30363d] mt-0.5 text-[#c9d1d9]">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#c9d1d9]">Weekly Timesheet Review State</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${latestTimesheetState.status === "APPROVED" ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' :
                                latestTimesheetState.status === "REJECTED" ? 'bg-red-950/40 text-red-400 border-red-800/60' :
                                  latestTimesheetState.status === "PENDING" ? 'bg-amber-950/40 text-amber-400 border-amber-800/60' :
                                    'bg-[#30363d]/40 text-[#c8d1d9] border-[#c8d1d9]/20'
                                }`}>
                                {latestTimesheetState.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#8b949e] mt-2">
                              Week Ending {latestTimesheetState.weekEnding}: {monHr + tueHr + wedHr + thuHr + friHr + satHr + sunHr} total hours tracked.
                              {latestTimesheetState.rejectionComment && (
                                <span className="block mt-1 text-red-300 bg-red-950/20 border border-red-900/40 p-2 rounded">
                                  Rejection feedback: "{latestTimesheetState.rejectionComment}"
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#8b949e] italic py-4">
                          No timesheets submitted yet.
                        </div>
                      )}

                      {/* Active Leave Request Notification */}
                      {latestLeave ? (
                        <div className="p-4 bg-[#121212] border border-[#30363d] rounded-lg flex items-start space-x-3">
                          <div className="p-1 rounded bg-[#30363d]/40 border border-[#30363d] mt-0.5 text-[#c9d1d9]">
                            <CalendarCheck className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#c9d1d9]">Leave Request [{latestLeave.leaveType.name}]</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${latestLeave.status === 'APPROVED' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' :
                                latestLeave.status === 'REJECTED' ? 'bg-red-950/40 text-red-400 border-red-800/60' :
                                  'bg-amber-950/40 text-amber-400 border-amber-800/60'
                                }`}>
                                {latestLeave.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#8b949e] mt-2">
                              Period: {latestLeave.startDate} to {latestLeave.endDate} ({latestLeave.days} days).
                              {latestLeave.rejectionComment && (
                                <span className="block mt-1 text-red-300 bg-red-950/20 border border-red-900/40 p-2 rounded">
                                  Rejection feedback: "{latestLeave.rejectionComment}"
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#8b949e] text-center py-4 italic">
                          No leave history records logged for this session.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#30363d]/40 text-[11px] text-[#8b949e] flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500/80" />
                    <span>Real-time persistence with executive database synced.</span>
                  </div>
                </div>

                {/* Payslip Access Shortcut */}
                <div className="lg:col-span-5 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">
                      Latest Remittance dispatch
                    </div>
                    <div className="bg-[#121212] border border-[#30363d] rounded-lg p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs text-[#8b949e] uppercase font-mono">Latest cycle</span>
                          <h4 className="text-lg font-bold text-[#c9d1d9] mt-0.5">
                            {latestPayroll
                              ? `${latestPayroll.payrollMonth}/${latestPayroll.payrollYear}`
                              : "No Payroll"}
                          </h4>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${latestPayroll?.status === "PAID"
                            ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/50"
                            : latestPayroll?.status === "APPROVED"
                              ? "bg-blue-950/30 text-blue-400 border-blue-800/50"
                              : "bg-amber-950/30 text-amber-400 border-amber-800/50"
                            }`}
                        >
                          {latestPayroll?.status ?? "N/A"}
                        </span>
                      </div>

                      <div className="space-y-2 border-t border-[#30363d]/60 pt-3 text-xs font-mono">

                        <div className="flex justify-between">
                          <span className="text-[#8b949e]">
                            Base Salary
                          </span>

                          <span className="text-[#c9d1d9]">
                            ₹{Number(latestPayroll?.baseSalary ?? 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[#8b949e]">
                            Leave Deduction
                          </span>

                          <span className="text-red-400">
                            ₹{Number(latestPayroll?.leaveDeduction ?? 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between font-bold pt-2 border-t border-[#30363d]/45">
                          <span className="text-white">
                            Net Salary
                          </span>

                          <span className="text-emerald-400">
                            ₹{Number(latestPayroll?.netSalary ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    id="dashboard-pay-shortcut-btn"
                    onClick={() => setActiveTab('payslips')}
                    className="mt-6 w-full py-2 bg-[#30363d] hover:bg-[#444d56] text-[#c9d1d9] text-xs font-medium border border-[#444d56] rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <span>Review Historic Remittances Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: TIMESHEETS TRACKING */}
          {activeTab === "timesheets" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    Work Log
                  </h1>

                  <p className="text-[#8b949e] mt-1">
                    {new Date(workLog?.workDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {workLogNotification && (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm font-medium ${workLogNotification.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                >
                  {workLogNotification.message}
                </div>
              )}
              {workLog?.status === "PENDING" && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 text-xl">🟡</div>

                    <div>
                      <h3 className="font-semibold text-yellow-400">
                        Work Log Submitted
                      </h3>

                      <p className="text-sm text-[#c9d1d9] mt-1">
                        Your work log has been submitted successfully and is awaiting for review.
                        You cannot modify activities until it has been reviewed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {workLog?.status === "APPROVED" && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-green-400 text-xl">🟢</div>

                    <div>
                      <h3 className="font-semibold text-green-400">
                        Work Log Approved
                      </h3>

                      <p className="text-sm text-[#c9d1d9] mt-1">
                        Your Task has been approved.
                        This record is now locked and cannot be edited.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {workLog?.status === "REJECTED" && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-red-400 text-xl">🔴</div>

                    <div>
                      <h3 className="font-semibold text-red-400">
                        Work Log Rejected
                      </h3>

                      <p className="text-sm text-[#c9d1d9] mt-1">
                        Please review the rejected task's comments, update your activities, and submit again.
                      </p>

                      {workLog.rejectionReason && (
                        <div className="mt-3 rounded-lg bg-[#161b22] border border-red-500/20 p-3">
                          <p className="text-xs text-[#8b949e] uppercase tracking-wide">
                            Reason
                          </p>

                          <p className="mt-1 text-red-300">
                            {workLog.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs uppercase text-[#8b949e]">Working Time</p>
                  <h2 className="text-3xl font-bold mt-2">{formatMinutes(workMinutes)}</h2>
                </div>

                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs uppercase text-[#8b949e]">Break Time</p>
                  <h2 className="text-3xl font-bold mt-2">{formatMinutes(breakMinutes)}</h2>
                </div>

                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs uppercase text-[#8b949e]">Activities</p>
                  <h2 className="text-3xl font-bold mt-2">{activities.length}</h2>
                </div>

                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5">
                  <p className="text-xs uppercase text-[#8b949e]">Status</p>
                  <div className="mt-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold
      ${workLog?.status === "APPROVED"
                          ? "bg-green-500/20 text-green-400"
                          : workLog?.status === "REJECTED"
                            ? "bg-red-500/20 text-red-400"
                            : workLog?.status === "PENDING"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-slate-500/20 text-slate-300"
                        }`}
                    >
                      {workLog?.status ?? "DRAFT"}
                    </span>

                  </div>
                </div>

              </div>
              {/* Add Activity */}
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">

                <h2 className="text-lg font-semibold mb-6">
                  Add Activity
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

                  <div>
                    <label className="text-xs text-[#8b949e] mb-2 block">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                      disabled={isWorkLogLocked}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8b949e] mb-2 block">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                      disabled={isWorkLogLocked}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8b949e] mb-2 block">
                      Type
                    </label>

                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                      disabled={isWorkLogLocked}
                    >
                      <option value="WORK">Work</option>
                      <option value="BREAK">Break</option>
                      <option value="LUNCH">Lunch</option>
                      <option value="MEETING">Meeting</option>
                      <option value="TRAINING">Training</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="xl:col-span-2">
                    <label className="text-xs text-[#8b949e] mb-2 block">
                      Activity
                    </label>

                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      placeholder="Enter activity..."
                      className="w-full bg-[#121212] border border-[#30363d] rounded-lg px-3 py-2"
                    />
                  </div>

                </div>

                <button
                  onClick={handleAddActivity}
                  className="mt-6 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                  disabled={isWorkLogLocked}
                >
                  Add Activity
                </button>

              </div>
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl overflow-hidden">

                <div className="px-6 py-4 border-b border-[#30363d]">
                  <h2 className="text-lg font-semibold">
                    Today's Work Log
                  </h2>
                </div>

                {activities.length === 0 ? (
                  <div className="p-10 text-center text-[#8b949e]">
                    No activities added yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="hidden lg:block">
                      <table className="w-full">
                        <thead className="bg-[#161b22]">
                          <tr>
                            <th className="text-left px-6 py-3">#</th>
                            <th className="text-left px-6 py-3">Time</th>
                            <th className="text-left px-6 py-3">Type</th>
                            <th className="text-left px-6 py-3">Activity</th>
                            <th className="text-right px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities.map((item: any, index: number) => {

                            console.log(item);

                            return (

                              <tr
                                key={item.id}
                                className="border-t border-[#30363d]"
                              >

                                <td className="px-6 py-4">
                                  {index + 1}
                                </td>

                                <td className="px-6 py-4">
                                  {item.startTime} - {item.endTime}
                                </td>

                                <td className="px-6 py-4">

                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium
                                   ${item.activityType === "WORK"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : item.activityType === "BREAK"
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : item.activityType === "LUNCH"
                                            ? "bg-orange-500/20 text-orange-400"
                                            : item.activityType === "MEETING"
                                              ? "bg-purple-500/20 text-purple-400"
                                              : item.activityType === "TRAINING"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-gray-500/20 text-gray-400"
                                      }`}
                                  >
                                    {item.activityType}
                                  </span>

                                </td>

                                <td className="px-6 py-4">
                                  {item.activity}
                                </td>

                                <td className="px-6 py-4 text-right">

                                  <div className="flex justify-end gap-3">

                                    <button
                                      onClick={() => {
                                        setEditingActivityId(item.id);
                                        setStartTime(item.startTime);
                                        setEndTime(item.endTime);
                                        setActivityType(item.activityType);
                                        setActivity(item.activity);
                                      }}
                                      className="text-blue-400 hover:text-blue-300"
                                    >
                                      <Pencil size={18} />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteActivity(item.id)}
                                      className="text-red-400 hover:text-red-300"
                                      disabled={isWorkLogLocked}
                                    >
                                      <Trash2 size={18} />
                                    </button>

                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-5">
                    Summary
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Working Time</span>
                      <span>{formatMinutes(workMinutes)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Break Time</span>
                      <span>{formatMinutes(breakMinutes)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Lunch Time</span>
                      <span>{formatMinutes(lunchMinutes)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8b949e]">Activities</span>
                      <span>{activities.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6 flex flex-col justify-end">
                  <button
                    className="w-full py-3 rounded-lg bg-[#30363d] hover:bg-[#444d56] mb-3"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handleSubmitWorkLog}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700"
                    disabled={
                      isWorkLogLocked ||
                      activities.length === 0
                    }
                  >
                    Submit Work Log
                  </button>
                </div>
              </div>
              <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl overflow-hidden">

                <div className="px-6 py-4 border-b border-[#30363d]">
                  <h2 className="text-lg font-semibold">
                    Work Log History
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#161b22]">
                      <tr>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Reviewed On</th>
                      </tr>
                    </thead>

                    <tbody>
                      {employeeTimesheets.map((log: any) => (
                        <tr
                          key={log.id}
                          className="border-t border-[#30363d]"
                        >
                          <td className="px-6 py-4">
                            {new Date(log.workDate).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold
                                ${log.status === "APPROVED"
                                  ? "bg-green-500/20 text-green-400"
                                  : log.status === "REJECTED"
                                    ? "bg-red-500/20 text-red-400"
                                    : log.status === "PENDING"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-slate-500/20 text-slate-300"
                                }`}
                            >
                              {log.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {log.reviewedAt
                              ? new Date(log.reviewedAt).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* VIEW C: LEAVE REQUEST */}
          {activeTab === 'leaves' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#c9d1d9]">Self-Service Absence Registry</h1>
                <p className="text-sm text-[#8b949e] mt-1">Submit formal absence requests. Dynamically adjusts against remaining credits immediately.</p>
              </div>

              {leaveSuccessMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-sm text-emerald-200">
                  {leaveSuccessMessage}
                </div>
              )}

              {leaveErrorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-sm text-red-200">
                  {leaveErrorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form panel */}
                <div className="lg:col-span-5 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6 h-fit">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">Request Paid or Unpaid Leave</h3>
                  <form onSubmit={handleLeaveSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="leave-type-select" className="block text-xs font-medium uppercase tracking-wider text-[#8b949e]">Leave Type Category</label>
                      <select
                        id="leave-type-select"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                        disabled={isArchived}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] focus:outline-none focus:border-[#8b949e]"
                      >
                        <option value="Casual">Casual Leave ({currentEmployee.leaveBalances.Casual} remaining)</option>
                        <option value="Sick">Sick Leave ({currentEmployee.leaveBalances.Sick} remaining)</option>
                        <option value="Earned">Earned Leave ({currentEmployee.leaveBalances.Earned} remaining)</option>
                        <option value="Special">Special Leave ({currentEmployee.leaveBalances.Special} remaining)</option>
                        <option value="Unpaid">Unpaid Leave (No limit/Deducted on Payroll)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="leave-start-date" className="block text-xs font-medium uppercase tracking-wider text-[#8b949e]">From Date</label>
                        <input
                          id="leave-start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          disabled={isArchived}
                          className="w-full px-3 py-2 bg-[#121212] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] focus:outline-none focus:border-[#8b949e] font-mono text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="leave-end-date" className="block text-xs font-medium uppercase tracking-wider text-[#8b949e]">To Date</label>
                        <input
                          id="leave-end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            if (e.target.value < startDate) {
                              setLeaveErrorMessage(
                                "End date cannot be earlier than start date."
                              );
                              return;
                            }
                            setLeaveErrorMessage("");
                            setEndDate(e.target.value);
                          }}
                          min={startDate}
                          disabled={isArchived}
                          className="w-full px-3 py-2 bg-[#121212] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] focus:outline-none focus:border-[#8b949e] font-mono text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="leave-reason-textarea" className="block text-xs font-medium uppercase tracking-wider text-[#8b949e]">Reason & Notes</label>
                      <textarea
                        id="leave-reason-textarea"
                        rows={3}
                        value={leaveNote}
                        onChange={(e) => setLeaveNote(e.target.value)}
                        placeholder="Provide reasoning details here..."
                        disabled={isArchived}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] placeholder-[#8b949e]/50 focus:outline-none focus:border-[#8b949e] text-left"
                      />
                    </div>

                    {hasPendingLeave && (
                      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
                        You already have a leave request awaiting approval. You cannot submit another request until it has been reviewed.
                      </div>
                    )}

                    <button
                      id="leave-submit-btn"
                      type="submit"
                      disabled={isArchived || hasPendingLeave}
                      className="w-full py-2.5 bg-[#30363d] hover:bg-[#444d56] text-white text-xs font-medium border border-[#444d56] rounded-lg transition duration-150 cursor-pointer"
                    >
                      Submit Absence File
                    </button>
                  </form>
                </div>

                {/* History table panel */}
                <div className="lg:col-span-7 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">Historical Requests Ledger</h3>

                  <div className="overflow-x-auto">
                    <table id="leave-history-table" className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#30363d] text-xs uppercase tracking-wider text-[#8b949e]">
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Interval Days</th>
                          <th className="pb-3 font-medium">Duration</th>
                          <th className="pb-3 font-medium">Status State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#30363d]/60 text-xs">
                        {employeeLeaves.map((req: any) => (
                          <tr key={req.id} className="hover:bg-[#121212]/30 transition-all">
                            <td className="py-3.5 font-medium text-[#c9d1d9]">
                              <div>{req.leaveType.name}</div>
                              <span className="text-[10px] text-[#8b949e]">
                                {req.reason}
                              </span>
                            </td>
                            <td className="py-3.5 text-[#8b949e] font-mono">
                              {new Date(req.startDate).toLocaleDateString()}{" "}
                              to{" "}
                              {new Date(req.endDate).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-white font-semibold font-mono">
                              {req.totalDays}{" "}
                              {req.totalDays === 1 ? "day" : "days"}
                            </td>
                            <td className="py-3.5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${req.status === 'APPROVED' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' :
                                req.status === 'REJECTED' ? 'bg-red-950/40 text-red-400 border-red-800/60' :
                                  'bg-amber-950/40 text-amber-400 border-amber-800/60'
                                }`}>
                                {req.status}
                              </span>
                              {req.status === "PENDING" && (
                                <button
                                  onClick={() => handleCancelLeave(req.id)}
                                  className="ml-3 text-xs text-red-400 hover:text-red-300"
                                >
                                  Cancel
                                </button>
                              )}
                              {req.rejectionReason && (
                                <div className="mt-1 text-[10px] text-red-300 max-w-xs leading-relaxed bg-red-950/10 border border-red-900/30 p-1.5 rounded">
                                  Reason: {req.rejectionReason}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {userLeaves.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-xs text-[#8b949e] italic">No Absence Requests logged.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW D: PAYSLIPS */}
          {activeTab === 'payslips' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#c9d1d9]">Remittances Receipts Hub</h1>
                <p className="text-sm text-[#8b949e] mt-1">Review granular tax-compliant income calculations and payouts generated by the engine.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Pane: Verticall Scroll List */}
                <div className="lg:col-span-4 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-5 flex flex-col h-[520px]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8b949e] mb-3">Historical Months List</span>
                  <div id="payslip-left-panel" className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {employeePayrolls.map((payroll) => {
                      const isSelected = payroll.id === selectedPayroll?.id;
                      return (
                        <button
                          key={payroll.id}
                          id={`payslip-select-btn-${payroll.id}`}
                          onClick={() => setSelectedPayroll(payroll)}
                          className={`w-full text-left p-3.5 rounded-lg border transition cursor-pointer ${isSelected
                            ? 'bg-[#30363d] border-[#444d56] text-[#c9d1d9]'
                            : 'bg-[#121212]/80 border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/30 hover:text-[#c9d1d9]'
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm text-[#c9d1d9]">{`${payroll.payrollMonth}/${payroll.payrollYear}`}</span>
                            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${payroll.status === "PAID" ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-yellow-950/40 text-yellow-500'
                              }`}>
                              {payroll.status}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mt-2 text-xs">
                            <span className="text-[11px] text-[#8b949e]">Net Remitted:</span>
                            <span className="font-mono font-bold text-emerald-400">${Number(payroll.netSalary).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </button>
                      );
                    })}
                    {employeePayrolls.length === 0 && (
                      <div className="text-center py-10 text-xs text-[#8b949e] italic">No historic payslips have been registered yet.</div>
                    )}
                  </div>
                </div>

                {/* Right Pane: Ledger Detail View */}
                <div id="payslip-ledger-pane" className="lg:col-span-8 bg-[#1e1e1e] border border-[#30363d] rounded-xl p-6 flex flex-col justify-between h-[520px]">
                  {selectedPayroll ? (
                    <>
                      <div className="space-y-6">
                        <div className="flex justify-between items-start pb-4 border-b border-[#30363d]">
                          <div>
                            <div className="text-xs uppercase font-mono tracking-wider text-[#8b949e]">Remittance Item Ledger</div>
                            <h3 className="text-lg font-bold text-[#c9d1d9] mt-0.5">{selectedPayroll.payrollMonth}/{selectedPayroll.payrollYear} Ledger</h3>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-[#8b949e] uppercase font-mono">Status Status</div>
                            <span className="text-xs leading-none font-bold text-emerald-400 mt-1 block">Paid & Remitted</span>
                          </div>
                        </div>

                        {/* Recipient Details */}
                        <div className="grid grid-cols-2 gap-4 text-xs bg-[#121212]/60 p-4 border border-[#30363d]/60 rounded-xl">
                          <div>
                            <div className="text-xs text-[#8b949e]">Assignee Recipient</div>
                            <div className="font-bold text-[#c9d1d9] mt-0.5">{currentEmployee.firstName} {currentEmployee.lastName}</div>
                            <div className="text-[#8b949e]">{currentEmployee.department} Workstation</div>
                          </div>
                          <div>
                            <div className="text-xs text-[#8b949e]">Tax Identifier / Account ID</div>
                            <div className="font-mono text-[#c9d1d9] mt-0.5">X-PAY-REF-{selectedPayroll.id.toUpperCase()}</div>
                            <div className="text-[#8b949e]">Ref Cycle:
                              {selectedPayroll.payrollMonth}/{selectedPayroll.payrollYear}</div>
                          </div>
                        </div>

                        {/* Line Item Breakdown */}
                        <div className="space-y-3">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Earnings & Deductions Ledger</span>

                          <div className="space-y-2 text-xs font-mono">
                            {/* Base salary components */}
                            <div className="flex justify-between items-center py-2 border-b border-[#30363d]/40">
                              <span className="text-[#8b949e]">Base Salary Component (Contractual)</span>
                              <span className="text-[#c9d1d9]">$₹{Number(selectedPayroll.baseSalary).toLocaleString("en-IN")}</span>
                            </div>

                            {/* Unpaid leave deductions */}
                            <div className="flex justify-between items-center py-2 border-b border-[#30363d]/40 text-red-400">
                              <div>
                                <span>Unpaid Absence Deductions</span>
                                <span className="text-[10px] text-red-400/80 block">{selectedPayroll.unpaidLeaveDays} days unpaid</span>
                              </div>
                              <span>-${selectedPayroll.leaveDeduction.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom aggregate ledger */}
                      <div className="pt-4 border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs uppercase font-mono tracking-wider text-[#8b949e]">Calculated Net Remitted:</span>
                          <span className="text-2xl font-mono font-bold text-emerald-400">
                            ₹{Number(selectedPayroll.netSalary).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <button
                          id="download-payslip-pdf-btn"
                          onClick={() => handleDownloadPayslip(selectedPayroll.id)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-[#30363d] hover:bg-[#444d56] text-[#c9d1d9] text-xs font-medium border border-[#444d56] rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Receipt</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-[#8b949e] italic">
                      Select a paycheck month from the sidebar list to audit.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main >
    </div >
  );
}


