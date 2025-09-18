import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, DollarSign, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { DatabaseService, supabase } from '../lib/supabase';
import type { Employee } from '../types';

interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  vacation_days: number;
  emergency_days: number;
  local_days: number;
  carried_over: number;
  encashed: number;
  taken: number;
}

interface LeaveBalancesProps {
  employees: Employee[];
  currentUser: any;
}

const LeaveBalances: React.FC<LeaveBalancesProps> = ({
  employees,
  currentUser
}) => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLeaveBalances();
  }, [selectedYear]);

  const fetchLeaveBalances = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('employee_leave_balances')
        .select('*')
        .eq('year', selectedYear)
        .order('employee_id');

      if (error) {
        throw new Error(error.message);
      }

      setLeaveBalances(data || []);
    } catch (error: any) {
      console.error('Error fetching leave balances:', error);
      setError('Failed to fetch leave balances');
    } finally {
      setLoading(false);
    }
  };

  const handleYearEndProcessing = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Call the Edge Function to process year-end leave balances
      const { data: result, error: processError } = await supabase.functions
        .invoke('leave_balance_calculator', {
          body: {
            year: selectedYear,
            action: 'year_end_processing'
          }
        });

      if (processError) {
        throw new Error('Failed to process year-end balances: ' + processError.message);
      }

      if (result.success) {
        setSuccess(`Year-end processing completed! ${result.employeesProcessed} employees processed.`);
        // Refresh the balances
        fetchLeaveBalances();
      } else {
        throw new Error(result.error || 'Processing failed');
      }

    } catch (error: any) {
      console.error('Error processing year-end balances:', error);
      setError(error.message || 'Failed to process year-end balances');
    } finally {
      setProcessing(false);
    }
  };

  const calculateRemainingLeave = (balance: LeaveBalance) => {
    const totalAllocated = balance.vacation_days + balance.emergency_days + balance.local_days + balance.carried_over;
    const remaining = totalAllocated - balance.taken;
    return Math.max(0, remaining);
  };

  const calculateEncashmentValue = (balance: LeaveBalance) => {
    const employee = employees.find(emp => emp.id === balance.employee_id);
    if (!employee || !employee.monthly_salary) return 0;
    
    const dailyRate = employee.monthly_salary / 22; // Assuming 22 working days per month
    const remainingDays = calculateRemainingLeave(balance);
    return remainingDays * dailyRate;
  };

  const getBalanceStatus = (balance: LeaveBalance) => {
    const remaining = calculateRemainingLeave(balance);
    if (remaining > 10) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Healthy' };
    if (remaining > 5) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Moderate' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Low' };
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-purple-600" />
            Leave Balances
          </h1>
          <p className="text-gray-600">Track employee leave balances and year-end processing</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
            <button
              onClick={handleYearEndProcessing}
              disabled={processing}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`${processing ? 'animate-spin' : ''}`} size={20} />
              {processing ? 'Processing...' : 'Year-End Processing'}
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{leaveBalances.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Remaining Days</p>
              <p className="text-2xl font-semibold text-gray-900">
                {leaveBalances.reduce((sum, balance) => sum + calculateRemainingLeave(balance), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Carried Over</p>
              <p className="text-2xl font-semibold text-gray-900">
                {leaveBalances.reduce((sum, balance) => sum + balance.carried_over, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Potential Encashment</p>
              <p className="text-2xl font-semibold text-gray-900">
                RS {leaveBalances.reduce((sum, balance) => sum + calculateEncashmentValue(balance), 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balances Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Leave Balances ({selectedYear})</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-600">Loading leave balances...</p>
            </div>
          ) : leaveBalances.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave balances found</h3>
              <p className="text-gray-600">
                Leave balances for {selectedYear} have not been initialized yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carried Over
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Encashed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Encashment Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveBalances.map((balance) => {
                    const employee = employees.find(emp => emp.id === balance.employee_id);
                    const remaining = calculateRemainingLeave(balance);
                    const status = getBalanceStatus(balance);
                    const encashmentValue = calculateEncashmentValue(balance);
                    const totalAllocated = balance.vacation_days + balance.emergency_days + balance.local_days;
                    
                    return (
                      <tr key={balance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-purple-600">
                                  {employee?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee?.name || 'Unknown Employee'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee?.employee_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Total: {totalAllocated + balance.carried_over}</div>
                            <div className="text-xs text-gray-500">
                              V:{balance.vacation_days} E:{balance.emergency_days} L:{balance.local_days}
                              {balance.carried_over > 0 && ` +${balance.carried_over}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{balance.taken}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{remaining}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{balance.carried_over}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {balance.encashed > 0 ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {balance.encashed}
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {encashmentValue > 0 ? `RS ${encashmentValue.toFixed(0)}` : '-'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Year-End Processing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Year-End Processing</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Carryover:</strong> Unused leave days are carried forward to the next year (subject to company policy limits)</p>
          <p>• <strong>Encashment:</strong> Employees can choose to receive payment for unused leave days</p>
          <p>• <strong>Forfeit:</strong> Unused leave days expire at year-end if not carried over or encashed</p>
          <p className="mt-4 font-medium">Run year-end processing to calculate and apply carryover/encashment for all employees.</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalances;
