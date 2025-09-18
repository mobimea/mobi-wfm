import React from 'react';
import { Users, Clock, TrendingUp, AlertTriangle, Calendar, CheckCircle, DollarSign, Timer, Bell, Award, Target } from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, RosterEntry } from '../types';
import { useUICustomization } from '../hooks/useUICustomization';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  roster: RosterEntry[];
  currentUser?: any;
  onViewChange?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, attendance, leaves, roster, currentUser, onViewChange }) => {
  const { getLabel, getNavLabel, getButtonLabel, getFormLabel, getStatusLabel, getGeneralTerm, labels } = useUICustomization();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(new Date().getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const todayAttendance = attendance.filter(record => record.date === today);
  
  const presentToday = todayAttendance.filter(record => record.status === 'present').length;
  const lateToday = todayAttendance.filter(record => record.status === 'late').length;
  const absentToday = todayAttendance.filter(record => record.status === 'absent').length;
  const onLeaveToday = todayAttendance.filter(record => record.status === 'leave').length;

  const pendingLeaves = leaves.filter(leave => leave.status === 'pending').length;
  const currentEmployee = currentUser?.role === 'employee' && currentUser?.employee_id 
    ? employees.find(emp => emp.employee_id === currentUser.employee_id) 
    : null;
  
  const totalEmployees = employees.filter(emp => emp.status === 'employed').length;

  // Calculate real overtime alerts
  const getOvertimeAlerts = () => {
    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    const weekAttendance = attendance.filter(record => thisWeek.includes(record.date));
    const overtimeEmployees = employees.map(emp => {
      const empWeekRecords = weekAttendance.filter(record => record.employee_id === emp.employee_id);
      const totalOvertimeHours = empWeekRecords.reduce((sum, record) => sum + (record.overtime_hours || 0), 0);
      return { employee: emp, overtimeHours: totalOvertimeHours };
    }).filter(emp => emp.overtimeHours > 40); // Approaching 60h monthly limit
    
    return overtimeEmployees;
  };

  // Calculate unfilled shifts for tomorrow
  const getUnfilledShifts = () => {
    const tomorrowShifts = roster.filter(shift => shift.date === tomorrowStr);
    const employeesWithShifts = new Set(tomorrowShifts.map(shift => shift.employee_id));
    const requiredStaffing = Math.ceil(totalEmployees * 0.8); // Assume 80% staffing needed
    const actualStaffing = tomorrowShifts.length;
    
    return Math.max(0, requiredStaffing - actualStaffing);
  };

  // Calculate attendance rate
  const getAttendanceRate = () => {
    if (totalEmployees === 0) return 100;
    const expectedToday = totalEmployees - onLeaveToday;
    const actualPresent = presentToday + lateToday;
    return expectedToday > 0 ? Math.round((actualPresent / expectedToday) * 100) : 100;
  };

  // Calculate budget variance (based on actual overtime costs)
  const getBudgetVariance = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
    });
    
    const totalOvertimeCost = monthlyAttendance.reduce((sum, record) => {
      return sum + (record.overtime_hours || 0) * 127; // Standard OT rate
    }, 0);
    
    const baseSalaryCost = totalEmployees * 17710; // Base monthly salary
    const totalCost = baseSalaryCost + totalOvertimeCost;
    const budgetTarget = totalEmployees * 20000; // Assume 20k per employee budget
    
    return budgetTarget > 0 ? ((totalCost - budgetTarget) / budgetTarget) * 100 : 0;
  };

  const overtimeAlerts = getOvertimeAlerts();
  const unfilledShifts = getUnfilledShifts();
  const attendanceRate = getAttendanceRate();
  const budgetVariance = getBudgetVariance();

  // Calculate 7-day trends
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const attendanceTrends = last7Days.map(date => {
    const dayRecords = attendance.filter(record => record.date === date);
    const present = dayRecords.filter(record => record.status === 'present' || record.status === 'late').length;
    const onLeaveDay = leaves.filter(leave => {
      return date >= leave.start_date && date <= leave.end_date && leave.status === 'approved';
    }).length;
    const expected = totalEmployees - onLeaveDay;
    const total = Math.max(expected, 1);
    return {
      date,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  });

  // Employee-specific data
  const employeeStats = currentEmployee ? (() => {
    const empAttendance = attendance.filter(record => record.employee_id === currentEmployee.employee_id);
    const thisWeekAttendance = empAttendance.filter(record => {
      const recordDate = new Date(record.date);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return recordDate >= weekStart;
    });
    const totalHoursThisWeek = thisWeekAttendance.reduce((sum, record) => sum + (record.total_hours || 0), 0);
    const empLeaves = leaves.filter(leave => leave.employee_id === currentEmployee.employee_id);
    const pendingEmpLeaves = empLeaves.filter(leave => leave.status === 'pending').length;
    const approvedAnnualLeaves = empLeaves.filter(leave => leave.type === 'vacation' && leave.status === 'approved')
      .reduce((sum, leave) => sum + leave.total_days, 0);
    
    return { totalHoursThisWeek, pendingEmpLeaves, approvedAnnualLeaves };
  })() : null;

  // Admin-specific KPIs
  const adminStats = currentUser?.role === 'admin' ? (() => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
    });
    
    const totalScheduledHours = monthlyAttendance.reduce((sum, record) => sum + (record.total_hours || 8), 0);
    const overtimeHours = monthlyAttendance.reduce((sum, record) => sum + (record.overtime_hours || 0), 0);
    const actualUnfilledShifts = unfilledShifts;
    const laborCostVsBudget = 100 + budgetVariance;
    
    return { totalScheduledHours, overtimeHours, unfilledShifts: actualUnfilledShifts, laborCostVsBudget };
  })() : null;

  const getKpiCards = () => {
    if (currentUser?.role === 'employee') {
      return [
        {
          title: `${getFormLabel('workHours')} This Week`,
          value: employeeStats?.totalHoursThisWeek?.toFixed(1) || '0',
          icon: Clock,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        },
        {
          title: 'Annual Leave Used',
          value: employeeStats?.approvedAnnualLeaves || 0,
          icon: Calendar,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        },
        {
          title: `Pending ${getNavLabel('leaves')}`,
          value: employeeStats?.pendingEmpLeaves || 0,
          icon: Bell,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        },
        {
          title: 'Annual Leave Left',
          value: Math.max(0, 28 - (employeeStats?.approvedAnnualLeaves || 0)),
          icon: Award,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        }
      ];
    }
    
    if (currentUser?.role === 'admin') {
      return [
        {
          title: `Scheduled ${getFormLabel('workHours')} (Month)`,
          value: Math.round(adminStats?.totalScheduledHours || 0).toLocaleString(),
          icon: Clock,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        },
        {
          title: `${getGeneralTerm('payroll')} Cost vs Budget`,
          value: `${(adminStats?.laborCostVsBudget || 100).toFixed(1)}%`,
          icon: Target,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        },
        {
          title: `Unfilled ${getGeneralTerm('shift')}s`,
          value: unfilledShifts,
          icon: AlertTriangle,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        },
        {
          title: `${getGeneralTerm('overtime')} Hours (Month)`,
          value: Math.round(adminStats?.overtimeHours || 0),
          icon: Timer,
          color: 'bg-gray-500',
          textColor: 'text-gray-600'
        }
      ];
    }
    
    return [
      {
        title: getGeneralTerm('employees'),
        value: totalEmployees,
        icon: Users,
        color: 'bg-gray-500',
        textColor: 'text-gray-600'
      },
      {
        title: `${getStatusLabel('present')} Today`,
        value: presentToday,
        icon: Clock,
        color: 'bg-gray-500',
        textColor: 'text-gray-600'
      },
      {
        title: `${getStatusLabel('late')} Today`,
        value: lateToday,
        icon: AlertTriangle,
        color: 'bg-gray-500',
        textColor: 'text-gray-600'
      },
      {
        title: `${getStatusLabel('absent')} Today`,
        value: absentToday,
        icon: TrendingUp,
        color: 'bg-gray-500',
        textColor: 'text-gray-600'
      }
    ];
  };

  const kpiCards = getKpiCards();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentUser?.role === 'employee' ? `My ${getNavLabel('dashboard')}` : 
             currentUser?.role === 'supervisor' ? `Supervisor ${getNavLabel('dashboard')}` : getNavLabel('dashboard')}
          </h1>
          {currentEmployee && (
            <p className="text-gray-600 mt-1">Welcome back, {currentEmployee.name}</p>
          )}
          {currentUser?.role === 'supervisor' && (
            <p className="text-gray-600 mt-1">Managing: {currentUser.department} {getGeneralTerm('department')}</p>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Admin Approval Queue */}
      {currentUser?.role === 'admin' && (pendingLeaves > 0 || overtimeAlerts.length > 0 || unfilledShifts > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              {pendingLeaves > 0 && (
                <button 
                  onClick={() => onViewChange?.('leaves')}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{getNavLabel('leaves')} Pending</span>
                  </div>
                  <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    {pendingLeaves}
                  </span>
                </button>
              )}
              {unfilledShifts > 0 && (
                <button 
                  onClick={() => onViewChange?.('roster')}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Unfilled {getGeneralTerm('shift')}s Tomorrow</span>
                  </div>
                  <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {unfilledShifts}
                  </span>
                </button>
              )}
              {overtimeAlerts.length > 0 && (
                <button 
                  onClick={() => onViewChange?.('reports')}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Overtime Alerts</span>
                  </div>
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                    {overtimeAlerts.length}
                  </span>
                </button>
              )}
              {pendingLeaves === 0 && unfilledShifts === 0 && overtimeAlerts.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">All tasks up to date</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-400 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Exceptions</h2>
            <div className="space-y-3">
              {budgetVariance > 5 && (
                <button 
                  onClick={() => onViewChange?.('reports')}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Budget Overrun</p>
                    <p className="text-sm text-gray-700">{budgetVariance.toFixed(1)}% over monthly budget</p>
                  </div>
                </button>
              )}
              {overtimeAlerts.length > 0 && (
                <button 
                  onClick={() => onViewChange?.('reports')}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Overtime Alert</p>
                    <p className="text-sm text-gray-700">{overtimeAlerts.length} employees approaching weekly OT limit</p>
                  </div>
                </button>
              )}
              {attendanceRate < 85 && (
                <button 
                  onClick={() => onViewChange?.('attendance')}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <Users className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Low Attendance</p>
                    <p className="text-sm text-gray-700">Only {attendanceRate}% attendance today</p>
                  </div>
                </button>
              )}
              {unfilledShifts > 0 && (
                <button 
                  onClick={() => onViewChange?.('roster')}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Unfilled Shifts</p>
                    <p className="text-sm text-gray-700">{unfilledShifts} open shifts for tomorrow</p>
                  </div>
                </button>
              )}
              {budgetVariance <= 5 && overtimeAlerts.length === 0 && attendanceRate >= 85 && unfilledShifts === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">All Systems Normal</p>
                      <p className="text-sm text-green-700">No alerts or exceptions detected</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Admin/Manager Pending Tasks */}
      {currentUser?.role === 'supervisor' && pendingLeaves > 0 && (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-400 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Team Actions Required</h3>
                <p className="text-sm text-gray-700">
                  {pendingLeaves} leave request{pendingLeaves !== 1 ? 's' : ''} awaiting your approval
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onViewChange?.('leaves')}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors"
              >
                Review Requests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Quick Actions */}
      {currentUser?.role === 'employee' && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => onViewChange?.('attendance')}
              className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Clock className="h-6 w-6 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">{getButtonLabel('clockIn')}/{getButtonLabel('clockOut')}</div>
                <div className="text-sm text-gray-700">Location & Camera</div>
              </div>
            </button>
            <button 
              onClick={() => onViewChange?.('leaves')}
              className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-6 w-6 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">{getButtonLabel('requestLeave')}</div>
                <div className="text-sm text-gray-700">Submit PTO</div>
              </div>
            </button>
            <button 
              onClick={() => onViewChange?.('roster')}
              className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-gray-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">View {getGeneralTerm('shift')} Schedule</div>
                <div className="text-sm text-gray-700">Check shifts</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                    <Icon className="h-6 w-6 text-gray-600 relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Trend Chart */}
      {currentUser?.role !== 'employee' && (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentUser?.role === 'supervisor' ? 'Team' : 'Company'} 7-Day {getNavLabel('attendance')} Trend
        </h2>
        <div className="flex items-end justify-between h-40 space-x-2">
          {attendanceTrends.map((day, index) => (
            <div key={day.date} className="flex flex-col items-center flex-1">
              <div
                className="bg-gray-700 rounded-t w-full transition-all duration-500 ease-in-out hover:bg-black"
                style={{ height: `${day.percentage}%` }}
              />
              <div className="mt-2 text-center">
                <div className="text-xs font-medium text-gray-900">{day.percentage}%</div>
                <div className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Quick Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Next Shifts */}
        {currentUser?.role === 'employee' && currentEmployee && roster.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Upcoming Shifts</h2>
            <div className="space-y-3">
              {(() => {
                const upcomingShifts = roster.filter(shift => {
                  const shiftDate = new Date(shift.date);
                  const today = new Date();
                  const daysDiff = (shiftDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                  return shift.employee_id === currentEmployee.employee_id && daysDiff >= 0 && daysDiff <= 7;
                }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
                
                return upcomingShifts.length > 0 ? upcomingShifts.map(shift => {
                  const shiftDate = new Date(shift.date);
                  const dayName = shiftDate.toLocaleDateString('en-US', { weekday: 'long' });
                  const shiftHours = (new Date(`2024-01-01T${shift.shift_end}:00`).getTime() - 
                                   new Date(`2024-01-01T${shift.shift_start}:00`).getTime()) / (1000 * 60 * 60);
                  
                  return (
                    <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {shiftDate.toDateString() === new Date(tomorrow).toDateString() ? 'Tomorrow' : dayName}
                        </div>
                        <div className="text-sm text-gray-500">{shift.shift_start} - {shift.shift_end} • {shift.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{shiftHours} hours</div>
                        <div className="text-xs text-gray-500">
                          {shiftHours === 8 ? 'Regular shift' : shiftHours > 8 ? 'Extended shift' : 'Part-time shift'}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-500">No upcoming shifts scheduled</p>
                  </div>
                );
              })()}
              {/* Quick Action Buttons */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onViewChange?.('roster')}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors text-sm"
                  >
                    View All Shifts
                  </button>
                  <button 
                    onClick={() => onViewChange?.('leaves')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Request Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Breakdown */}
        {currentUser?.role !== 'employee' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentUser?.role === 'supervisor' ? 'My Team Breakdown' : 'Department Breakdown'}
          </h2>
          <div className="space-y-4">
            {(() => {
              const departments = currentUser?.role === 'admin' 
                ? [...new Set(employees.map(emp => emp.department))]
                : currentUser?.role === 'supervisor' && currentUser.department 
                  ? [currentUser.department] 
                  : [];
              
              return departments.length > 0 ? departments.map(dept => {
              const deptEmployees = employees.filter(emp => emp.department === dept && emp.status === 'employed');
              const deptPresent = todayAttendance.filter(record => {
                const employee = employees.find(emp => emp.employee_id === record.employee_id);
                return employee?.department === dept && (record.status === 'present' || record.status === 'late');
              }).length;
              
              const percentage = deptEmployees.length > 0 ? Math.round((deptPresent / deptEmployees.length) * 100) : 0;
              
              return (
                <button 
                  key={dept}
                  onClick={() => onViewChange?.('employees')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <span className="font-medium text-gray-700">{dept}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{deptPresent}/{deptEmployees.length}</span>
                    <span className="text-sm font-semibold text-gray-900">({percentage}%)</span>
                  </div>
                </button>
              );
              }) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No employees or departments found</p>
                </div>
              );
            })()}
            {/* Quick Management Actions */}
            {currentUser?.role === 'admin' && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onViewChange?.('employees')}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors text-sm"
                  >
                    {getButtonLabel('edit')} {getGeneralTerm('employees')}
                  </button>
                  <button 
                    onClick={() => onViewChange?.('salary-management')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    {getNavLabel('salary')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentUser?.role === 'employee' ? 'My Recent Activity' : 'Recent Activity'}
          </h2>
          <div className="space-y-3">
            {currentUser?.role === 'employee' && employeeStats?.pendingEmpLeaves && employeeStats.pendingEmpLeaves > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {employeeStats.pendingEmpLeaves} leave request{employeeStats.pendingEmpLeaves > 1 ? 's' : ''} pending
                  </p>
                </div>
              </div>
            ) : (currentUser?.role !== 'employee' && pendingLeaves > 0 && (
              <button 
                onClick={() => onViewChange?.('leaves')}
                className="w-full flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {pendingLeaves} leave request{pendingLeaves > 1 ? 's' : ''} pending approval
                    {currentUser?.role === 'supervisor' && ' from your team'}
                  </p>
                </div>
              </button>
            ))}
            
            {currentUser?.role !== 'employee' && lateToday > 0 && (
              <button 
                onClick={() => onViewChange?.('attendance')}
                className="w-full flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <AlertTriangle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {lateToday} employee{lateToday > 1 ? 's' : ''} arrived late today
                  </p>
                </div>
              </button>
            )}
            
            {currentUser?.role !== 'employee' && absentToday > 0 && (
              <button 
                onClick={() => onViewChange?.('attendance')}
                className="w-full flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {absentToday} employee{absentToday > 1 ? 's' : ''} absent today
                  </p>
                </div>
              </button>
            )}

            {currentUser?.role !== 'employee' && presentToday === totalEmployees && presentToday > 0 && (
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Perfect attendance today! All {currentUser?.role === 'supervisor' ? 'team members' : 'employees'} present.
                  </p>
                </div>
              </div>
            )}

            {currentUser?.role === 'employee' && !employeeStats?.pendingEmpLeaves && (
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {todayAttendance.find(record => record.employee_id === currentEmployee?.employee_id) 
                      ? "You're clocked in for today. Have a great shift!" 
                      : "Ready to start your shift. Don't forget to clock in!"}
                  </p>
                </div>
              </div>
            )}
            
            {/* Show message when no activity */}
            {currentUser?.role === 'employee' && !employeeStats?.pendingEmpLeaves && 
             !todayAttendance.find(record => record.employee_id === currentEmployee?.employee_id) &&
             currentUser?.role !== 'employee' && pendingLeaves === 0 && lateToday === 0 && absentToday === 0 && 
             (presentToday !== totalEmployees || presentToday === 0) && (
               <div className="text-center py-4 text-gray-500">
                 <p>No recent activity to display</p>
               </div>
            )}
          </div>
          {/* Interactive Quick Navigation */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {currentUser?.role === 'admin' && (
                <>
                  <button 
                    onClick={() => onViewChange?.('reports')}
                    className="px-3 py-1 text-xs bg-gray-800 text-white rounded-full hover:bg-black transition-colors"
                  >
                    View Reports
                  </button>
                  <button 
                    onClick={() => onViewChange?.('ai-assistant')}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Ask AI
                  </button>
                  <button 
                    onClick={() => onViewChange?.('admin-settings')}
                    className="px-3 py-1 text-xs bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => onViewChange?.('company-settings')}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Company
                  </button>
                </>
              )}
              {currentUser?.role === 'supervisor' && (
                <>
                  <button 
                    onClick={() => onViewChange?.('roster')}
                    className="px-3 py-1 text-xs bg-gray-800 text-white rounded-full hover:bg-black transition-colors"
                  >
                    Team Roster
                  </button>
                  <button 
                    onClick={() => onViewChange?.('field-ops')}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Field Ops
                  </button>
                </>
              )}
              {currentUser?.role === 'employee' && (
                <>
                  <button 
                    onClick={() => onViewChange?.('attendance')}
                    className="px-3 py-1 text-xs bg-gray-800 text-white rounded-full hover:bg-black transition-colors"
                  >
                    Check In
                  </button>
                  <button 
                    onClick={() => onViewChange?.('reports')}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  >
                    My Reports
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;