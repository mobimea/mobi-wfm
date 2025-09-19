import React, { useState } from 'react';
import {
  Plus,
  TrendingUp,
  DollarSign,
  Award,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Employee } from '../types';
import PayslipManagement from './PayslipManagement';

// Default fallback salaries (example values)
const MONTHLY_SALARIES: { [key: string]: number } = {
  Manager: 21000,
  Cashier: 12000,
  Driver: 16000,
  Receptionist: 13000,
  'IT Support': 22000,
  'HR Officer': 17000,
  // ... (keep only what you need, or load from DB later)
};

interface SalaryManagementProps {
  employees: Employee[];
  onEmployeeUpdate: (employees: Employee[]) => void;
  currentUser: any;
}

interface SalaryAdjustment {
  id: string;
  employee_id: string;
  previous_rate: number;
  new_rate: number;
  adjustment_type: 'raise' | 'promotion' | 'performance' | 'market_adjustment';
  adjustment_percentage: number;
  effective_date: string;
  reason: string;
  approved_by: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PerformanceBonus {
  id: string;
  employee_id: string;
  bonus_type: 'performance' | 'attendance' | 'milestone' | 'project';
  amount: number;
  reason: string;
  awarded_date: string;
  status: 'pending' | 'approved' | 'paid';
}

const SalaryManagement: React.FC<SalaryManagementProps> = ({
  employees,
  onEmployeeUpdate,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'salary' | 'payslips'>('salary');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [salaryAdjustments, setSalaryAdjustments] = useState<SalaryAdjustment[]>(
    []
  );

  const [performanceBonuses, setPerformanceBonuses] = useState<PerformanceBonus[]>(
    []
  );

  const [adjustmentForm, setAdjustmentForm] = useState({
    employee_id: '',
    new_rate: 0,
    adjustment_type: 'raise' as SalaryAdjustment['adjustment_type'],
    effective_date: '',
    reason: '',
  });

  const [bonusForm, setBonusForm] = useState({
    employee_id: '',
    bonus_type: 'performance' as PerformanceBonus['bonus_type'],
    amount: 0,
    reason: '',
  });

  // Salary statistics
  const salaryStats = {
    totalPayrollCost: employees.reduce(
      (sum, emp) =>
        sum +
        (emp.monthly_salary ||
          MONTHLY_SALARIES[emp.position] ||
          17710),
      0
    ),
    avgSalary:
      employees.length > 0
        ? employees.reduce(
            (sum, emp) =>
              sum +
              (emp.monthly_salary || MONTHLY_SALARIES[emp.position] || 17710),
            0
          ) / employees.length
        : 0,
    avgTransportAllowance:
      employees.length > 0
        ? employees.reduce(
            (sum, emp) => sum + (emp.transport_daily_rate || 50),
            0
          ) / employees.length
        : 0,
    pendingAdjustments: salaryAdjustments.filter(
      (adj) => adj.status === 'pending'
    ).length,
    totalBonusPayout: performanceBonuses
      .filter((bonus) => bonus.status === 'approved')
      .reduce((sum, bonus) => sum + bonus.amount, 0),
  };

  const handleSalaryAdjustment = (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees.find(
      (emp) => emp.id === adjustmentForm.employee_id
    );
    if (!employee) return;

    const currentSalary =
      employee.monthly_salary ||
      MONTHLY_SALARIES[employee.position] ||
      17710;
    const adjustmentPercentage =
      ((adjustmentForm.new_rate - currentSalary) / currentSalary) * 100;

    const newAdjustment: SalaryAdjustment = {
      id: Date.now().toString(),
      employee_id: employee.employee_id,
      previous_rate: currentSalary,
      new_rate: adjustmentForm.new_rate,
      adjustment_type: adjustmentForm.adjustment_type,
      adjustment_percentage: Math.round(adjustmentPercentage * 100) / 100,
      effective_date: adjustmentForm.effective_date,
      reason: adjustmentForm.reason,
      approved_by: currentUser?.email || 'admin',
      status: 'approved',
    };

    setSalaryAdjustments([newAdjustment, ...salaryAdjustments]);

    // Update employee record
    const updatedEmployees = employees.map((emp) =>
      emp.id === adjustmentForm.employee_id
        ? { ...emp, monthly_salary: adjustmentForm.new_rate }
        : emp
    );
    onEmployeeUpdate(updatedEmployees);

    setAdjustmentForm({
      employee_id: '',
      new_rate: 0,
      adjustment_type: 'raise',
      effective_date: '',
      reason: '',
    });
  };

  const handleBonusAward = (e: React.FormEvent) => {
    e.preventDefault();

    const newBonus: PerformanceBonus = {
      id: `bonus_${Date.now()}`,
      employee_id: bonusForm.employee_id,
      bonus_type: bonusForm.bonus_type,
      amount: bonusForm.amount,
      reason: bonusForm.reason,
      awarded_date: new Date().toISOString().split('T')[0],
      status: 'approved',
    };

    setPerformanceBonuses([newBonus, ...performanceBonuses]);

    setBonusForm({
      employee_id: '',
      bonus_type: 'performance',
      amount: 0,
      reason: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdjustmentForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            <Plus size={16} />
            Salary Adjustment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('salary')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'salary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Salary Management
            </button>
            <button
              onClick={() => setActiveTab('payslips')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payslips'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payslip Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'salary' && (
          <div className="p-6">
            {/* Salary Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Monthly Payroll
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      RS{salaryStats.totalPayrollCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100">
                    <DollarSign className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Transport Allowance
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      RS{salaryStats.avgTransportAllowance.toFixed(0)}/day
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100">
                    <TrendingUp className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Adjustments
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {salaryStats.pendingAdjustments}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100">
                    <AlertCircle className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Bonus Payouts
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      RS{salaryStats.totalBonusPayout.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100">
                    <Award className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Search */}
            <div className="relative mt-6">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* TODO: Employee table & modals (same logic as your version) */}

          </div>
        )}

        {activeTab === 'payslips' && (
          <div className="p-6">
            <PayslipManagement employees={employees} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryManagement;
