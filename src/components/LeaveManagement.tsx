import React, { useState } from 'react';
import { Plus, Calendar, Check, X, Clock, AlertTriangle, Calculator, DollarSign } from 'lucide-react';
import { LeaveRequest, Employee } from '../types';
import { calculateLeaveDeduction } from '../utils/payroll';
import { getPayrollCalculator } from '../utils/dynamicPayroll';
import { ConfigManager } from '../utils/config';

// UUID generator for new leave requests
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  onLeaveUpdate?: (leaves: LeaveRequest[]) => void;
  addLeaveRequest?: (leave: LeaveRequest) => Promise<void>;
  updateLeaveStatus?: (leaveId: string, status: 'approved' | 'rejected', approvedBy?: string) => Promise<void>;
  currentUser: any;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({
  leaves,
  employees,
  onLeaveUpdate,
  addLeaveRequest,
  updateLeaveStatus,
  currentUser
}) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const systemConfig = ConfigManager.getConfig();
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    type: 'paid_local' as LeaveRequest['type'],
    reason: '',
    start_time: '',
    end_time: ''
  });

  // Get leave types from system configuration
  const leaveTypes = Object.entries(systemConfig.leave.types).map(([key, config]) => ({
    value: key,
    label: config.name,
    color: config.color || 'bg-gray-100 text-gray-800',
    deductible: !config.is_paid,
    allows_partial_day: config.allows_partial_day,
    annual_quota: config.annual_quota,
    requires_approval: config.requires_approval
  }));

  const isPartialDay = formData.type === 'unpaid' && formData.start_time && formData.end_time;
  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateHours = () => {
    if (!formData.start_time || !formData.end_time) return 0;
    const start = new Date(`2024-01-01T${formData.start_time}:00`);
    const end = new Date(`2024-01-01T${formData.end_time}:00`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  const calculateDeduction = () => {
    if (formData.type !== 'unpaid' && formData.type !== 'unpaid_sick') return 0;
    
    if (isPartialDay) {
      return calculateLeaveDeduction(PAYROLL_CONSTANTS.MONTHLY_BASE_SALARY, 0, calculateHours());
    } else {
      return calculateLeaveDeduction(PAYROLL_CONSTANTS.MONTHLY_BASE_SALARY, calculateDays(), 0);
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find current user's employee record
    const currentEmployee = employees.find(emp => emp.employee_id === currentUser?.employee_id);
    if (!currentEmployee && currentUser?.role === 'employee') {
      alert('Employee record not found. Please contact HR.');
      return;
    }
    
    const totalDays = isPartialDay ? 0 : calculateDays();
    const totalHours = isPartialDay ? calculateHours() : 0;
    const salaryDeduction = calculateDeduction();
    
    const newRequest: LeaveRequest = {
      id: generateUUID(),
      employee_id: currentEmployee?.employee_id || employees[0]?.employee_id || 'EMP001',
      start_date: formData.start_date,
      end_date: formData.end_date,
      type: formData.type,
      status: 'pending',
      reason: formData.reason,
      start_time: formData.start_time || undefined,
      end_time: formData.end_time || undefined,
      total_days: totalDays,
      total_hours: totalHours > 0 ? totalHours : undefined,
      salary_deduction: salaryDeduction,
      applied_date: new Date().toISOString().split('T')[0]
    };

    if (addLeaveRequest) {
      addLeaveRequest(newRequest).then(() => {
        console.log('✅ Leave request submitted successfully');
        setShowRequestForm(false);
        setFormData({
          start_date: '',
          end_date: '',
          type: 'paid_local',
          reason: '',
          start_time: '',
          end_time: ''
        });
      }).catch((error) => {
        console.error('❌ Error submitting leave request:', error);
        alert('Failed to submit leave request: ' + error.message);
      });
    } else if (onLeaveUpdate) {
      onLeaveUpdate([...leaves, newRequest]);
      setShowRequestForm(false);
      setFormData({
        start_date: '',
        end_date: '',
        type: 'paid_local',
        reason: '',
        start_time: '',
        end_time: ''
      });
    }
  };

  const handleApproval = (leaveId: string, status: 'approved' | 'rejected') => {
    const approvedBy = currentUser?.employee_id || currentUser?.email || 'admin';
    
    if (updateLeaveStatus) {
      updateLeaveStatus(leaveId, status, approvedBy).then(() => {
        console.log(`✅ Leave ${status} successfully`);
      }).catch((error) => {
        console.error(`❌ Error updating leave status:`, error);
        alert(`Failed to ${status} leave: ` + error.message);
      });
    } else if (onLeaveUpdate) {
      onLeaveUpdate(leaves.map(leave =>
        leave.id === leaveId 
          ? {
              ...leave,
              status,
              approved_by: approvedBy,
              approved_date: new Date().toISOString()
            }
          : leave
      ));
    }
  };

  const userLeaves = currentUser?.role === 'employee' 
    ? leaves.filter(leave => {
        const currentEmployee = employees.find(emp => emp.employee_id === currentUser.employee_id);
        return currentEmployee && leave.employee_id === currentEmployee.employee_id;
      })
    : leaves;

  const pendingLeaves = currentUser?.role === 'supervisor'
    ? leaves.filter(leave => leave.status === 'pending' && 
        employees.find(emp => emp.employee_id === leave.employee_id)?.department === currentUser.department)
    : leaves.filter(leave => leave.status === 'pending');

  // Calculate leave balances for current user
  const getLeaveBalances = () => {
    if (currentUser?.role !== 'employee' || !currentUser.employee_id) return {};
    
    const employee = employees.find(emp => emp.employee_id === currentUser.employee_id);
    if (!employee || !employee.leave_balances) return {};

    const currentYear = new Date().getFullYear();
    const yearlyLeaves = userLeaves.filter(leave => {
      const leaveDate = new Date(leave.start_date);
      return leaveDate.getFullYear() === currentYear && leave.status === 'approved' && leave.employee_id === employee.employee_id;
    });

    const usedBalances = {
      paid_local: yearlyLeaves.filter(l => l.type === 'paid_local').reduce((sum, l) => sum + l.total_days, 0),
      paid_sick: yearlyLeaves.filter(l => l.type === 'paid_sick').reduce((sum, l) => sum + l.total_days, 0),
      vacation: yearlyLeaves.filter(l => l.type === 'vacation').reduce((sum, l) => sum + l.total_days, 0)
    };

    return {
      paid_local: Math.max(0, employee.leave_balances.paid_local - usedBalances.paid_local),
      paid_sick: Math.max(0, employee.leave_balances.paid_sick - usedBalances.paid_sick),
      vacation: Math.max(0, employee.leave_balances.vacation - usedBalances.vacation)
    };
  };

  const balances = getLeaveBalances();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Leave Management</h1>
        {(currentUser?.role === 'employee' || currentUser?.role === 'supervisor') && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            Request Leave
          </button>
        )}
      </div>

      {/* Enhanced Leave Types Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave Types & Salary Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveTypes.map(type => (
            <div key={type.value} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${type.color} mb-2`}>
                {type.label.split(' ')[0]} {type.label.split(' ')[1]}
              </div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">{type.label}</h4>
              <div className="flex items-center gap-2">
                {type.deductible ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                      <DollarSign className="h-4 w-4 text-red-600 relative z-10" />
                    </div>
                    <span className="text-xs text-red-600 font-medium">Salary Deduction</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                      <Check className="h-4 w-4 text-green-600 relative z-10" />
                    </div>
                    <span className="text-xs text-green-600 font-medium">Paid Leave</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Balances for Employees */}
      {currentUser?.role === 'employee' && Object.keys(balances).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(balances).map(([type, balance]) => (
            <button 
              key={type}
              onClick={() => {
                setFormData({ ...formData, type: type as LeaveRequest['type'] });
                setShowRequestForm(true);
              }}
              className="bg-white rounded-lg shadow-sm border p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900 capitalize mb-2">
                {type.replace('_', ' ')} Leave
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800">{balance as number}</span>
                <span className="text-sm text-gray-500">days left</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gray-700 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((balance as number) / (
                      type === 'paid_local' ? 5 :
                      type === 'paid_sick' ? 10 : 28
                    )) * 100}%` 
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pending Approvals for Managers/Admin */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && pendingLeaves.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentUser?.role === 'supervisor' ? 'Team Leave Requests' : 'Pending Approvals'}
          </h2>
          
          <div className="space-y-4">
            {pendingLeaves.map(leave => {
              const employee = employees.find(emp => emp.employee_id === leave.employee_id);
              const leaveTypeInfo = leaveTypes.find(t => t.value === leave.type);
              
              return (
                <div key={leave.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{employee?.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${leaveTypeInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          {leaveTypeInfo?.label.split(' ')[0]} {leaveTypeInfo?.label.split(' ')[1]}
                        </span>
                        {leave.salary_deduction > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            -RS{leave.salary_deduction.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>
                            {new Date(leave.start_date).toLocaleDateString()} 
                            {leave.start_date !== leave.end_date && ` - ${new Date(leave.end_date).toLocaleDateString()}`}
                          </span>
                          {leave.start_time && leave.end_time && (
                            <span className="flex items-center gap-1">
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                                <Clock className="h-3 w-3 text-gray-500 relative z-10" />
                              </div>
                              {leave.start_time} - {leave.end_time}
                            </span>
                          )}
                        </div>
                        <div>
                          {leave.total_days > 0 && `${leave.total_days} day${leave.total_days > 1 ? 's' : ''}`}
                          {leave.total_hours && ` (${leave.total_hours}h)`}
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-700">{leave.reason}</p>
                      
                      {leave.salary_deduction > 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                              <Calculator className="h-4 w-4 text-red-600 relative z-10" />
                            </div>
                            <span className="text-sm text-red-800 font-medium">
                              Salary Deduction: {getPayrollCalculator().getConfig().baseSalaryStructure.currencySymbol}{leave.salary_deduction.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproval(leave.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-black transition-colors"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                          <Check size={14} className="relative z-10" />
                        </div>
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(leave.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                          <X size={14} className="relative z-10" />
                        </div>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leave History */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userLeaves.map((leave) => {
                const employee = employees.find(emp => emp.employee_id === leave.employee_id);
                const leaveTypeInfo = leaveTypes.find(t => t.value === leave.type);
                
                return (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee?.name}</div>
                      <div className="text-sm text-gray-500">{employee?.employee_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${leaveTypeInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                        {leaveTypeInfo?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {leave.total_days > 0 && `${leave.total_days} day${leave.total_days > 1 ? 's' : ''}`}
                        {leave.total_hours && ` (${leave.total_hours}h)`}
                        {leave.start_time && leave.end_time && ` • ${leave.start_time}-${leave.end_time}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {leave.salary_deduction > 0 ? (
                        <span className="text-sm font-medium text-red-600">
                          -RS{leave.salary_deduction.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-green-600">
                          Paid Leave
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {leave.status === 'pending' && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                            <Clock className="h-4 w-4 text-orange-500 relative z-10" />
                          </div>
                        )}
                        {leave.status === 'approved' && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                            <Check className="h-4 w-4 text-green-500 relative z-10" />
                          </div>
                        )}
                        {leave.status === 'rejected' && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                            <X className="h-4 w-4 text-red-500 relative z-10" />
                          </div>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          leave.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Leave Request Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Leave</h2>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as LeaveRequest['type'];
                    setFormData({ 
                      ...formData, 
                      type: newType,
                      start_time: newType === 'unpaid' ? formData.start_time : '',
                      end_time: newType === 'unpaid' ? formData.end_time : ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {leaveTypes.find(t => t.value === formData.type)?.deductible 
                    ? "This leave type will result in salary deduction" 
                    : "This is a paid leave with no salary deduction"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Partial Day Time Selection for Unpaid Leave */}
              {formData.type === 'unpaid' && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="partialDay"
                      checked={!!formData.start_time}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setFormData({ ...formData, start_time: '', end_time: '' });
                        } else {
                          setFormData({ ...formData, start_time: '12:00', end_time: '17:00' });
                        }
                      }}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <label htmlFor="partialDay" className="text-sm text-gray-700">
                      Partial day leave (specify hours)
                    </label>
                  </div>
                  
                  {formData.start_time && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Salary Deduction Preview */}
              {(formData.type === 'unpaid' || formData.type === 'unpaid_sick') && formData.start_date && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                      <AlertTriangle className="h-5 w-5 text-red-600 relative z-10" />
                    </div>
                    <h4 className="font-medium text-red-800">Salary Deduction Preview</h4>
                  </div>
                  <div className="space-y-1 text-sm text-red-700">
                    <p>Base Monthly Salary: {getPayrollCalculator().getConfig().baseSalaryStructure.currencySymbol}{getPayrollCalculator().getConfig().baseSalaryStructure.defaultMonthlySalary.toLocaleString()}</p>
                    <p>Daily Rate: {getPayrollCalculator().getConfig().baseSalaryStructure.currencySymbol}{(getPayrollCalculator().getConfig().baseSalaryStructure.defaultMonthlySalary / getPayrollCalculator().getConfig().baseSalaryStructure.workingDaysPerMonth).toFixed(2)} (÷{getPayrollCalculator().getConfig().baseSalaryStructure.workingDaysPerMonth} working days)</p>
                    {isPartialDay && (
                      <p>Hourly Rate: {getPayrollCalculator().getConfig().baseSalaryStructure.currencySymbol}{((getPayrollCalculator().getConfig().baseSalaryStructure.defaultMonthlySalary / getPayrollCalculator().getConfig().baseSalaryStructure.workingDaysPerMonth) / getPayrollCalculator().getConfig().baseSalaryStructure.standardWorkingHours).toFixed(2)} (÷{getPayrollCalculator().getConfig().baseSalaryStructure.standardWorkingHours} hours)</p>
                    )}
                    <div className="pt-2 border-t border-red-200">
                      <p className="font-medium">
                        Estimated Deduction: {getPayrollCalculator().getConfig().baseSalaryStructure.currencySymbol}{calculateDeduction().toFixed(2)}
                        {isPartialDay && ` (${calculateHours()}h)`}
                        {!isPartialDay && ` (${calculateDays()} day${calculateDays() > 1 ? 's' : ''})`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Please provide a detailed reason for your leave request..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;