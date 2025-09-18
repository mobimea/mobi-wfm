import React, { useState } from 'react';
import { Download, TrendingUp, DollarSign, Users, Clock, AlertTriangle, Calendar, PieChart } from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, RosterEntry, Location, Holiday } from '../types';
import { calculatePayroll, exportPayrollCSV, exportAttendanceCSV } from '../utils/payroll';

interface PayrollReportsProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  roster: RosterEntry[];
  locations: Location[];
  holidays: Holiday[];
  currentUser?: any;
}

const PayrollReports: React.FC<PayrollReportsProps> = ({
  employees,
  attendance,
  leaves,
  roster,
  locations,
  holidays,
  currentUser
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payroll' | 'attendance'>('dashboard');

  const calculateMonthlyPayroll = () => {
    return employees.map(employee => 
      calculatePayroll(employee, attendance, selectedMonth, selectedYear, holidays, leaves)
    );
  };

  const payrollRecords = calculateMonthlyPayroll();
  
  // Dashboard calculations
  const currentMonthData = {
    totalPayroll: payrollRecords.reduce((sum, record) => sum + record.total_pay, 0),
    totalRegularHours: payrollRecords.reduce((sum, record) => sum + record.regular_hours, 0),
    totalOvertimeHours: payrollRecords.reduce((sum, record) => sum + record.overtime_hours, 0),
    totalOvertimePay: payrollRecords.reduce((sum, record) => sum + record.overtime_pay, 0),
    avgHoursPerEmployee: payrollRecords.length > 0 ? 
      payrollRecords.reduce((sum, record) => sum + (record.regular_hours + record.overtime_hours), 0) / payrollRecords.length : 0
  };

  // Budget analysis (calculated based on employees)
  const monthlyBudget = employees.filter(emp => emp.status === 'employed').length * 20000; // RS 20k per employee
  const budgetVariance = ((currentMonthData.totalPayroll - monthlyBudget) / monthlyBudget) * 100;

  // Department breakdown
  const departmentBreakdown = [...new Set(employees.map(emp => emp.department))].map(dept => {
    const deptEmployees = employees.filter(emp => emp.department === dept);
    const deptRecords = payrollRecords.filter(record => 
      deptEmployees.some(emp => emp.employee_id === record.employee_id)
    );
    
    const totalCost = deptRecords.reduce((sum, record) => sum + record.total_pay, 0);
    const avgCost = deptRecords.length > 0 ? totalCost / deptRecords.length : 0;
    const overtimeHours = deptRecords.reduce((sum, record) => sum + record.overtime_hours, 0);
    
    return {
      department: dept,
      employees: deptEmployees.length,
      totalCost,
      avgCost,
      overtimeHours,
      percentage: currentMonthData.totalPayroll > 0 ? (totalCost / currentMonthData.totalPayroll) * 100 : 0
    };
  }).filter(dept => dept.employees > 0);

  // Cost trends (based on actual historical data if available, otherwise current month data)
  const costTrends = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - (5 - i));
    const monthNum = monthDate.getMonth();
    const yearNum = monthDate.getFullYear();
    
    // Get actual data for this month if available
    const monthAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === monthNum && recordDate.getFullYear() === yearNum;
    });
    
    const monthPayroll = employees.map(employee => 
      calculatePayroll(employee, monthAttendance, monthNum, yearNum, holidays, leaves)
    );
    
    const actualAmount = monthPayroll.reduce((sum, record) => sum + record.total_pay, 0);
    const targetAmount = employees.length * 20000; // Target budget
    const variance = targetAmount > 0 ? ((actualAmount - targetAmount) / targetAmount) * 100 : 0;
    
    return {
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: Math.round(actualAmount || targetAmount * 0.9), // Fallback for months with no data
      variance: Math.round(variance)
    };
  });

  // Overtime analysis
  const overtimeAnalysis = employees.map(employee => {
    const empRecord = payrollRecords.find(record => record.employee_id === employee.employee_id);
    return {
      employee,
      overtimeHours: empRecord?.overtime_hours || 0,
      overtimePay: empRecord?.overtime_pay || 0,
      overtimeRate: empRecord ? (empRecord.overtime_hours / Math.max(empRecord.regular_hours, 1)) * 100 : 0
    };
  }).filter(data => data.overtimeHours > 0).sort((a, b) => b.overtimeHours - a.overtimeHours);

  const handleExportPayroll = () => {
    const csvData = exportPayrollCSV(payrollRecords);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_${selectedYear}_${String(selectedMonth + 1).padStart(2, '0')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportAttendance = () => {
    const csvData = exportAttendanceCSV(attendance, employees);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${selectedYear}_${String(selectedMonth + 1).padStart(2, '0')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDetailedReport = () => {
    const reportData = payrollRecords.map(record => [
      record.employee_id,
      record.name,
      record.position,
      record.department,
      record.regular_hours,
      record.overtime_hours,
      record.regular_pay.toFixed(2),
      record.overtime_pay.toFixed(2),
      record.total_pay.toFixed(2),
      record.days_present,
      record.days_late,
      record.days_absent
    ]);

    const csvContent = [
      ['Employee ID', 'Name', 'Position', 'Department', 'Regular Hours', 'OT Hours', 'Regular Pay', 'OT Pay', 'Total Pay', 'Present', 'Late', 'Absent'],
      ...reportData
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detailed_report_${months[selectedMonth]}_${selectedYear}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Dashboard & Reports</h1>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
          <button
            onClick={exportDetailedReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'payroll' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Payroll Reports
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'attendance' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Attendance Reports
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payroll Cost</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    RS{currentMonthData.totalPayroll.toLocaleString()}
                  </p>
                  <p className={`text-sm mt-1 ${
                    budgetVariance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {budgetVariance > 0 ? '+' : ''}{budgetVariance.toFixed(1)}% vs budget
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                    <DollarSign className="h-6 w-6 text-gray-600 relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overtime Cost</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    RS{currentMonthData.totalOvertimePay.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentMonthData.totalOvertimeHours.toFixed(1)} hours total
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                    <Clock className="h-6 w-6 text-gray-600 relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Hours/Employee</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {currentMonthData.avgHoursPerEmployee.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentMonthData.totalRegularHours.toFixed(0)} regular hours
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                    <TrendingUp className="h-6 w-6 text-gray-600 relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Employees</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {employees.filter(emp => emp.status === 'employed').length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    RS{(currentMonthData.totalPayroll / employees.length).toFixed(0)} avg/employee
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                    <Users className="h-6 w-6 text-gray-600 relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Analysis & Cost Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget vs Actual</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Budget:</span>
                  <span className="font-semibold text-gray-900">RS{monthlyBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Actual Payroll:</span>
                  <span className={`font-semibold ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    RS{currentMonthData.totalPayroll.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-gray-600">Variance:</span>
                  <span className={`font-bold ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {budgetVariance > 0 ? '+' : ''}RS{Math.abs(currentMonthData.totalPayroll - monthlyBudget).toLocaleString()}
                    ({budgetVariance > 0 ? '+' : ''}{budgetVariance.toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {budgetVariance > 5 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Budget Exceeded</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Payroll is {Math.abs(budgetVariance).toFixed(1)}% over budget. Review overtime and staffing levels.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Trend (6 Months)</h2>
              <div className="space-y-3">
                <div className="flex items-end justify-between h-32">
                  {costTrends.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-blue-500 rounded-t w-full transition-all duration-500 ease-in-out hover:bg-blue-600"
                        style={{ height: `${(data.amount / 220000) * 100}%` }}
                      />
                      <div className="mt-2 text-center">
                        <div className="text-xs font-medium text-gray-900">RS{(data.amount / 1000).toFixed(0)}k</div>
                        <div className="text-xs text-gray-500">{data.month}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Department Cost Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Cost Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departmentBreakdown.map(dept => (
                <div key={dept.department} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{dept.department}</h3>
                    <span className="text-sm text-gray-500">{dept.employees} emp</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost:</span>
                      <span className="text-sm font-medium text-gray-900">RS{dept.totalCost.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg/Employee:</span>
                      <span className="text-sm font-medium text-gray-900">RS{dept.avgCost.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Overtime:</span>
                      <span className="text-sm font-medium text-purple-600">{dept.overtimeHours.toFixed(1)}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {dept.percentage.toFixed(1)}% of total payroll
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overtime Analysis & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Overtime Earners</h2>
              <div className="space-y-3">
                {overtimeAnalysis.slice(0, 8).map((data, index) => (
                  <div key={data.employee.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{data.employee.name}</div>
                        <div className="text-sm text-gray-500">{data.employee.employee_id} • {data.employee.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-purple-600">{data.overtimeHours.toFixed(1)}h</div>
                      <div className="text-sm text-gray-500">RS{data.overtimePay.toFixed(0)}</div>
                    </div>
                  </div>
                ))}
                
                {overtimeAnalysis.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No overtime recorded for this period
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payroll Insights & Alerts</h2>
              <div className="space-y-4">
                {budgetVariance > 5 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Budget Overrun Alert</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Payroll costs are {Math.abs(budgetVariance).toFixed(1)}% over budget. 
                      Consider reviewing overtime policies and staffing levels.
                    </p>
                  </div>
                )}
                
                {currentMonthData.totalOvertimeHours > 100 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">High Overtime Volume</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      {currentMonthData.totalOvertimeHours.toFixed(0)} overtime hours this month. 
                      Review workload distribution and consider additional hiring.
                    </p>
                  </div>
                )}
                
                {currentMonthData.totalOvertimeHours < 20 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Efficient Workforce</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Low overtime indicates good workforce planning and scheduling efficiency.
                    </p>
                  </div>
                )}
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Cost Efficiency</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Average cost per employee: RS{(currentMonthData.totalPayroll / employees.length).toFixed(0)} 
                    ({currentMonthData.avgHoursPerEmployee.toFixed(1)} hours avg)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Payroll Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">RS{currentMonthData.totalPayroll.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Hours</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{currentMonthData.totalRegularHours.toFixed(1)}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{currentMonthData.totalOvertimeHours.toFixed(1)}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Employees</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{employees.length}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Options</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportPayroll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                Export Payroll CSV
              </button>
              <button
                onClick={exportDetailedReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Export Detailed Report
              </button>
            </div>
          </div>

          {/* Payroll Details Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Payroll Details - {months[selectedMonth]} {selectedYear}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Regular Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overtime Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Regular Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overtime Pay
                    </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Transport
                     </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Pay
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollRecords.map((record) => (
                    <tr key={record.employee_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.name}</div>
                          <div className="text-sm text-gray-500">{record.employee_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.position}</div>
                        <div className="text-sm text-gray-500">{record.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.regular_hours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.overtime_hours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RS{record.regular_pay.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RS{record.overtime_pay.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RS{record.total_pay.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Present Days</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {attendance.filter(a => a.status === 'present').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {attendance.filter(a => a.status === 'late').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent Days</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {attendance.filter(a => a.status === 'absent').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Attendance Reports</h2>
            <div className="flex gap-3">
              <button
                onClick={handleExportAttendance}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Export Attendance CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollReports;