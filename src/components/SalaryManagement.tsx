import React, { useState } from 'react';
import { Plus, Edit2, TrendingUp, DollarSign, Award, AlertCircle, Search } from 'lucide-react';
import { Employee } from '../types';
import PayslipManagement from './PayslipManagement';

const MONTHLY_SALARIES: { [key: string]: number } = {
  'Manager': 21000,
  'Supervisor': 20000,
  'Sales Associate': 15000,
  'Cashier': 12000,
  'Security Guard': 14000,
  'Cleaner': 10000,
  'Driver': 16000,
  'Receptionist': 13000,
  'Warehouse Worker': 14000,
  'IT Support': 22000,
  'Accountant': 18000,
  'HR Officer': 17000,
  'Marketing Coordinator': 19000,
  'Chef': 20000,
  'Waiter/Waitress': 11000,
  'Bartender': 13000,
  'Housekeeper': 10500,
  'Maintenance Technician': 16000,
  'Electrician': 18000,
  'Plumber': 17500,
  'Painter': 14000,
  'Gardener': 12000,
  'Pool Attendant': 11500,
  'Lifeguard': 12500,
  'Fitness Instructor': 15000,
  'Spa Therapist': 16000,
  'Concierge': 13500,
  'Valet': 11000,
  'Bellhop': 10500,
  'Room Service': 11500,
  'Laundry Attendant': 10000,
  'Dishwasher': 9500,
  'Line Cook': 13000,
  'Sous Chef': 18000,
  'Executive Chef': 25000,
  'Pastry Chef': 17000,
  'Baker': 14000,
  'Barista': 11000,
  'Host/Hostess': 11500,
  'Server': 12000,
  'Sommelier': 20000,
  'Event Coordinator': 18000,
  'Wedding Planner': 19000,
  'Tour Guide': 13000,
  'Activity Coordinator': 15000,
  'Ski Instructor': 16000,
  'Golf Pro': 20000,
  'Tennis Instructor': 15500,
  'Yoga Instructor': 14000,
  'Personal Trainer': 17000,
  'Spa Manager': 22000,
  'Beauty Therapist': 15000,
  'Hair Stylist': 16000,
  'Nail Technician': 13000,
  'Makeup Artist': 14000,
  'Photographer': 18000,
  'Videographer': 19000,
  'Graphic Designer': 20000,
  'Web Developer': 25000,
  'Software Engineer': 30000,
  'Data Analyst': 22000,
  'Project Manager': 28000,
  'Business Analyst': 24000,
  'Consultant': 26000,
  'Researcher': 21000,
  'Teacher': 18000,
  'Professor': 25000,
  'Librarian': 16000,
  'Counselor': 19000,
  'Social Worker': 17000,
  'Nurse': 20000,
  'Doctor': 35000,
  'Pharmacist': 22000,
  'Dentist': 30000,
  'Veterinarian': 25000,
  'Lab Technician': 18000,
  'Radiologist': 28000,
  'Physical Therapist': 20000,
  'Occupational Therapist': 19500,
  'Speech Therapist': 18500,
  'Dietitian': 17000,
  'Nutritionist': 16500,
  'Psychologist': 24000,
  'Psychiatrist': 32000,
  'Therapist': 19000,
  'Case Manager': 18000,
  'Paralegal': 16000,
  'Legal Assistant': 15000,
  'Lawyer': 30000,
  'Attorney': 32000,
  'Judge': 40000,
  'Clerk': 14000,
  'Court Reporter': 17000,
  'Probation Officer': 19000,
  'Police Officer': 20000,
  'Detective': 22000,
  'Sergeant': 24000,
  'Lieutenant': 26000,
  'Captain': 28000,
  'Chief': 35000,
  'Firefighter': 18000,
  'Paramedic': 19000,
  'EMT': 16000,
  'Dispatcher': 15000,
  'Security Officer': 14000,
  'Guard': 13500,
  'Patrol Officer': 14500,
  'Investigator': 20000,
  'Inspector': 19000,
  'Auditor': 21000,
  'Compliance Officer': 20000,
  'Risk Manager': 24000,
  'Underwriter': 18000,
  'Claims Adjuster': 16000,
  'Insurance Agent': 17000,
  'Financial Advisor': 22000,
  'Investment Banker': 35000,
  'Stockbroker': 25000,
  'Trader': 28000,
  'Analyst': 20000,
  'Portfolio Manager': 30000,
  'CPA': 22000,
  'Bookkeeper': 15000,
  'Payroll Specialist': 16000,
  'Tax Preparer': 17000,
  'Controller': 25000,
  'CFO': 40000,
  'Treasurer': 28000,
  'Bank Teller': 13000,
  'Loan Officer': 18000,
  'Credit Analyst': 19000,
  'Mortgage Broker': 20000,
  'Financial Planner': 21000,
  'Wealth Manager': 25000,
  'Economist': 23000,
  'Statistician': 20000,
  'Research Analyst': 19000,
  'Data Scientist': 28000,
  'Machine Learning Engineer': 32000,
  'AI Engineer': 35000,
  'DevOps Engineer': 27000,
  'System Administrator': 20000,
  'Network Engineer': 22000,
  'Database Administrator': 24000,
  'Cloud Architect': 30000,
  'Security Engineer': 26000,
  'Cybersecurity Analyst': 23000,
  'IT Manager': 28000,
  'CTO': 40000,
  'CIO': 38000,
  'Product Manager': 29000,
  'Product Owner': 27000,
  'Scrum Master': 25000,
  'UX Designer': 24000,
  'UI Designer': 23000,
  'Art Director': 26000,
  'Creative Director': 30000,
  'Copywriter': 19000,
  'Content Writer': 17000,
  'Editor': 18000,
  'Journalist': 20000,
  'Reporter': 19000,
  'Publisher': 25000,
  'Marketing Manager': 24000,
  'Brand Manager': 23000,
  'Advertising Manager': 22000,
  'Public Relations': 21000,
  'Social Media Manager': 18000,
  'SEO Specialist': 19000,
  'Content Strategist': 20000,
  'Event Planner': 17000,
  'Meeting Planner': 16000,
  'Conference Coordinator': 17500,
  'Travel Agent': 15000,
  'Tour Operator': 16000,
  'Hotel Manager': 22000,
  'Restaurant Manager': 20000,
  'Retail Manager': 18000,
  'Store Manager': 19000,
  'Department Manager': 20000,
  'Operations Manager': 24000,
  'General Manager': 26000,
  'CEO': 50000,
  'President': 35000,
  'Vice President': 35000,
  'Director': 30000,
  'Executive Assistant': 20000,
  'Administrative Assistant': 16000,
  'Office Manager': 18000,
  'Secretary': 15000,
  'Data Entry': 12000,
  'File Clerk': 12500,
  'Mail Clerk': 12000,
  'Shipping Clerk': 13000,
  'Receiving Clerk': 13500,
  'Warehouse Supervisor': 17000,
  'Logistics Coordinator': 18000,
  'Supply Chain Manager': 25000,
  'Purchasing Manager': 23000,
  'Buyer': 19000,
  'Procurement Specialist': 20000,
  'Vendor Manager': 21000,
  'Contract Manager': 22000,
  'Quality Control': 17000,
  'Quality Assurance': 18000,
  'Tester': 15000,
  'Technician': 16500,
  'Mechanic': 17000,
  'Repair Technician': 17500,
  'Field Service': 18000,
  'Installation Technician': 16500,
  'Service Technician': 17000,
  'Equipment Operator': 16000,
  'Machine Operator': 15500,
  'Production Worker': 14000,
  'Assembler': 13500,
  'Packager': 12500,
  'Loader': 12000,
  'Unloader': 12000,
  'Forklift Operator': 15000,
  'Delivery Driver': 15500,
  'Truck Driver': 17000,
  'Bus Driver': 16500,
  'Taxi Driver': 14000,
  'Courier': 13000,
  'Messenger': 12500,
  'Pilot': 40000,
  'Flight Attendant': 20000,
  'Air Traffic Controller': 25000,
  'Ground Crew': 15000,
  'Ticket Agent': 14000,
  'Reservations Agent': 13500,
  'Customer Service': 13000,
  'Support Specialist': 14500,
  'Help Desk': 14000,
  'Technical Support': 15000,
  'Client Services': 16000,
  'Account Manager': 20000,
  'Sales Manager': 24000,
  'Sales Representative': 18000,
  'Business Development': 22000,
  'Key Account Manager': 23000,
  'Inside Sales': 17000,
  'Outside Sales': 19000,
  'Telemarketer': 14000,
  'Retail Associate': 12500,
  'Stock Clerk': 12000,
  'Merchandiser': 13500,
  'Visual Merchandiser': 15000,
  'Planner': 17000,
  'Coordinator': 16000,
  'Specialist': 18500,
  'Advisor': 20000,
  'Expert': 21000,
  'Trainer': 18000,
  'Instructor': 17000,
  'Coach': 17500,
  'Mentor': 18500,
  'Facilitator': 16500,
  'Moderator': 16000,
  'Presenter': 17000,
  'Speaker': 18000,
  'Lecturer': 19000,
  'Educator': 18500,
  'Tutor': 15000,
  'Teaching Assistant': 14000,
  'Research Assistant': 16000,
  'Lab Assistant': 15000,
  'Student Worker': 12000,
  'Intern': 13000,
  'Apprentice': 13500,
  'Trainee': 12500,
  'Entry Level': 12000,
  'Junior': 14000,
  'Senior': 22000,
  'Lead': 23000,
  'Principal': 25000,
  'Head': 24000,
  'Administrator': 18000,
  'Assistant': 15000,
  'Officer': 18500,
  'Representative': 15500,
  'Agent': 15000,
  'Worker': 12500,
  'Operator': 14000,
  'Engineer': 24000,
  'Developer': 23000,
  'Designer': 20000,
  'Architect': 25000,
  'Strategist': 21000,
  'Executive': 28000
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
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'salary' | 'payslips'>('salary');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [salaryAdjustments, setSalaryAdjustments] = useState<SalaryAdjustment[]>([
    {
      id: '1',
      employee_id: 'EMP001',
      previous_rate: 18.00,
      new_rate: 20.00,
      adjustment_type: 'performance',
      adjustment_percentage: 11.1,
      effective_date: '2024-11-01',
      reason: 'Excellent leadership and team performance',
      approved_by: 'HR Director',
      status: 'approved'
    },
    {
      id: '2',
      employee_id: 'EMP003',
      previous_rate: 14.00,
      new_rate: 15.00,
      adjustment_type: 'market_adjustment',
      adjustment_percentage: 7.1,
      effective_date: '2024-10-15',
      reason: 'Market rate adjustment for retail positions',
      approved_by: 'HR Director',
      status: 'approved'
    }
  ]);

  const [performanceBonuses, setPerformanceBonuses] = useState<PerformanceBonus[]>([
    {
      id: '1',
      employee_id: 'EMP002',
      bonus_type: 'attendance',
      amount: 500,
      reason: 'Perfect attendance for Q4 2024',
      awarded_date: '2024-12-15',
      status: 'approved'
    },
    {
      id: '2',
      employee_id: 'EMP007',
      bonus_type: 'performance',
      amount: 750,
      reason: 'Exceeded sales targets by 25%',
      awarded_date: '2024-12-10',
      status: 'pending'
    }
  ]);

  const [adjustmentForm, setAdjustmentForm] = useState({
    employee_id: '',
    new_rate: 0,
    adjustment_type: 'raise' as SalaryAdjustment['adjustment_type'],
    effective_date: '',
    reason: ''
  });

  const [bonusForm, setBonusForm] = useState({
    employee_id: '',
    bonus_type: 'performance' as PerformanceBonus['bonus_type'],
    amount: 0,
    reason: ''
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate salary statistics
  const salaryStats = {
    totalPayrollCost: employees.reduce((sum, emp) =>
      sum + ((emp.hourly_rate || 17710) * 160), 0), // 160 hours/month
    avgSalary: employees.length > 0 ?
      employees.reduce((sum, emp) => sum + (emp.hourly_rate || 17710), 0) / employees.length : 0,
    avgTransportAllowance: employees.length > 0 ?
      employees.reduce((sum, emp) => sum + (emp.transport_daily_rate || 50), 0) / employees.length : 0, // Default 50 if not set
    highestPaid: employees.reduce((max, emp) =>
      Math.max(max, emp.hourly_rate || 17710), 0),
    lowestPaid: employees.reduce((min, emp) =>
      Math.min(min, emp.hourly_rate || 17710), 999),
    pendingAdjustments: salaryAdjustments.filter(adj => adj.status === 'pending').length,
    totalBonusPayout: performanceBonuses.filter(bonus => bonus.status === 'approved').reduce((sum, bonus) => sum + bonus.amount, 0)
  };

  const handleSalaryAdjustment = (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees.find(emp => emp.id === adjustmentForm.employee_id);
    if (!employee) return;

    const currentSalary = employee.monthly_salary || MONTHLY_SALARIES[employee.position] || 17710;
    const adjustmentPercentage = ((adjustmentForm.new_rate - currentSalary) / currentSalary) * 100;

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
      status: 'approved' // Auto-approve for demo
    };

    setSalaryAdjustments([newAdjustment, ...salaryAdjustments]);

    // Update employee record
    const updatedEmployees = employees.map(emp =>
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
      reason: ''
    });
    setShowAdjustmentForm(false);
  };

  const handleBonusAward = (e: React.FormEvent) => {
    e.preventDefault();

    const newBonus: PerformanceBonus = {
      id: `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employee_id: bonusForm.employee_id,
      bonus_type: bonusForm.bonus_type,
      amount: bonusForm.amount,
      reason: bonusForm.reason,
      awarded_date: new Date().toISOString().split('T')[0],
      status: 'approved'
    };

    setPerformanceBonuses([newBonus, ...performanceBonuses]);

    setBonusForm({
      employee_id: '',
      bonus_type: 'performance',
      amount: 0,
      reason: ''
    });
    setShowBonusForm(false);
  };

  return (
    <div className="space-y-6">
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

      {/* Tab Navigation */}
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

      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Monthly Payroll</p>
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
              <p className="text-sm font-medium text-gray-600">Avg Transport Allowance</p>
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
              <p className="text-sm font-medium text-gray-600">Pending Adjustments</p>
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
              <p className="text-sm font-medium text-gray-600">Bonus Payouts</p>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  aria-label="Search employees for salary management"
                  placeholder="Search employees for salary management..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
      </div>

      {/* Employee Salary Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Employee Salary Overview</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Adjustment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const currentRate = employee.hourly_rate || MONTHLY_SALARIES[employee.position];
                const monthlySalary = employee.monthly_salary || MONTHLY_SALARIES[employee.position] || 17710;
                const annualSalary = monthlySalary * 12;
                const lastAdjustment = salaryAdjustments.find(adj => adj.employee_id === employee.employee_id);

                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.employee_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        RS{monthlySalary.toLocaleString()}/month
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RS{monthlySalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RS{annualSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lastAdjustment ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {lastAdjustment.adjustment_percentage > 0 ? '+' : ''}{lastAdjustment.adjustment_percentage.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(lastAdjustment.effective_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setAdjustmentForm({
                            ...adjustmentForm,
                            employee_id: employee.id,
                            new_rate: monthlySalary
                          });
                          setShowAdjustmentForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        aria-label="Edit salary"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setBonusForm({
                            ...bonusForm,
                            employee_id: employee.employee_id
                          });
                          setShowBonusForm(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        aria-label="Award bonus"
                      >
                        <Award size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* Salary Adjustment Modal */}
      {showAdjustmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary Adjustment</h2>

            <form onSubmit={handleSalaryAdjustment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  required
                  value={adjustmentForm.employee_id}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employee</option>
                  {employees.filter(emp => emp.status === 'employed').map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id}) - Current: RS{(employee.monthly_salary || MONTHLY_SALARIES[employee.position] || 17710).toLocaleString()}/month
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Monthly Salary (RS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={adjustmentForm.new_rate}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, new_rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {adjustmentForm.employee_id && adjustmentForm.new_rate > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      const emp = employees.find(e => e.id === adjustmentForm.employee_id);
                      if (emp) {
                        const currentSalary = emp.monthly_salary || MONTHLY_SALARIES[emp.position] || 17710;
                        const change = adjustmentForm.new_rate - currentSalary;
                        const percentage = (change / currentSalary) * 100;
                        return (
                          <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {change >= 0 ? '+' : ''}RS{change.toFixed(2)} ({percentage.toFixed(1)}% {change >= 0 ? 'increase' : 'decrease'})
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Type
                </label>
                <select
                  required
                  value={adjustmentForm.adjustment_type}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustment_type: e.target.value as SalaryAdjustment['adjustment_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="raise">Raise</option>
                  <option value="promotion">Promotion</option>
                  <option value="performance">Performance</option>
                  <option value="market_adjustment">Market Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  required
                  value={adjustmentForm.effective_date}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, effective_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  required
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for salary adjustment..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bonus Award Modal */}
      {showBonusForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Award Performance Bonus</h2>

            <form onSubmit={handleBonusAward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  required
                  value={bonusForm.employee_id}
                  onChange={(e) => setBonusForm({ ...bonusForm, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employee</option>
                  {employees.filter(emp => emp.status === 'employed').map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus Type
                </label>
                <select
                  required
                  value={bonusForm.bonus_type}
                  onChange={(e) => setBonusForm({ ...bonusForm, bonus_type: e.target.value as PerformanceBonus['bonus_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="performance">Performance</option>
                  <option value="attendance">Attendance</option>
                  <option value="milestone">Milestone</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus Amount (RS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={bonusForm.amount}
                  onChange={(e) => setBonusForm({ ...bonusForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  required
                  value={bonusForm.reason}
                  onChange={(e) => setBonusForm({ ...bonusForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for bonus..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBonusForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Award Bonus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;
