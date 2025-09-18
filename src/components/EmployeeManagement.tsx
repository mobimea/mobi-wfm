import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { Employee, Location } from '../types';
import EmployeeExcelUpload from './EmployeeExcelUpload';

interface EmployeeManagementProps {
  employees: Employee[];
  locations: Location[];
  onEmployeeUpdate: (employees: Employee[]) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
  editEmployee: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
  removeEmployee: (employeeId: string) => Promise<void>;
  currentUser: any;
  attendance?: any[];
  leaves?: any[];
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  locations,
  onEmployeeUpdate,
  addEmployee,
  editEmployee,
  removeEmployee,
  currentUser,
  attendance = [],
  leaves = []
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Added import of EmployeeExcelUpload component and integration in tab content

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    start_date: '',
    status: 'employed',
    hourly_rate: '',
    monthly_salary: '',
    primary_location_id: ''
  });

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
    const matchesStatus = !statusFilter || emp.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department))];

  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      department: '',
      position: '',
      phone: '',
      start_date: '',
      status: 'employed',
      hourly_rate: '',
      monthly_salary: '',
      primary_location_id: ''
    });
    setEditingEmployee(null);
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      phone: employee.phone || '',
      start_date: employee.start_date,
      status: employee.status || 'employed',
      hourly_rate: employee.hourly_rate?.toString() || '',
      monthly_salary: employee.monthly_salary?.toString() || '',
      primary_location_id: employee.primary_location_id || ''
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const employeeData = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        monthly_salary: formData.monthly_salary ? parseFloat(formData.monthly_salary) : null,
        primary_location_id: formData.primary_location_id || null
      };

      if (editingEmployee) {
        await editEmployee(editingEmployee.id, employeeData);
        setSuccess('Employee updated successfully!');
      } else {
        const newEmployee = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...employeeData
        };
        await addEmployee(newEmployee as Employee);
        setSuccess('Employee added successfully!');
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      setError(error.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await removeEmployee(employee.id);
      setSuccess(`${employee.name} has been deleted successfully!`);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      setError(error.message || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (employee: Employee) => {
    const newStatus = employee.status === 'employed' ? 'unemployed' : 'employed';
    
    try {
      await editEmployee(employee.id, { status: newStatus });
      setSuccess(`${employee.name} status updated to ${newStatus}!`);
    } catch (error: any) {
      console.error('Error updating employee status:', error);
      setError(error.message || 'Failed to update employee status');
    }
  };

  const getEmployeeStats = (employee: Employee) => {
    const empAttendance = attendance.filter(a => a.employee_id === employee.employee_id);
    const empLeaves = leaves.filter(l => l.employee_id === employee.employee_id);
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyAttendance = empAttendance.filter(a => {
      const date = new Date(a.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const pendingLeaves = empLeaves.filter(l => l.status === 'pending').length;
    
    return {
      monthlyDays: monthlyAttendance.length,
      pendingLeaves
    };
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            Employee Management
          </h1>
          <p className="text-gray-600">Manage your workforce and employee information</p>
        </div>
        
        {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Employee
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle size={20} />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('list')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Employee List
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('upload')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Excel Upload
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <>
            {/* Filters */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="temporary">Temporary</option>
                </select>

                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Filter size={16} />
                  Showing {filteredEmployees.length} of {employees.length} employees
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="p-6 pt-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Directory</h2>
          
              
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                  <p className="text-gray-600">
                    {employees.length === 0 
                      ? "Get started by adding your first employee."
                      : "Try adjusting your search filters."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredEmployees.map((employee) => {
                    const stats = getEmployeeStats(employee);
                    const location = locations.find(l => l.id === employee.primary_location_id);
                    
                    return (
                      <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{employee.name}</h3>
                              <p className="text-sm text-gray-600">{employee.position}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              employee.status === 'employed' ? 'bg-green-100 text-green-800' :
                              employee.status === 'unemployed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {employee.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            {employee.email}
                          </div>
                          
                          {employee.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              {employee.phone}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 size={14} />
                            {employee.department}
                          </div>
                          
                          {location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin size={14} />
                              {location.name}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            Started {new Date(employee.start_date).toLocaleDateString()}
                          </div>
                          
                          {(employee.hourly_rate || employee.monthly_salary) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign size={14} />
                              {employee.monthly_salary 
                                ? `$${employee.monthly_salary}/month`
                                : `$${employee.hourly_rate}/hour`
                              }
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{stats.monthlyDays}</div>
                            <div className="text-xs text-gray-600">Days This Month</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{stats.pendingLeaves}</div>
                            <div className="text-xs text-gray-600">Pending Leaves</div>
                          </div>
                        </div>

                        {/* Actions */}
                        {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(employee)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Employee"
                              >
                                <Edit3 size={16} />
                              </button>
                              
                              <button
                                onClick={() => handleStatusToggle(employee)}
                                className={`p-2 rounded-lg transition-colors ${
                                  employee.status === 'employed'
                                    ? 'text-orange-600 hover:bg-orange-50'
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={employee.status === 'employed' ? 'Deactivate' : 'Activate'}
                              >
                                {employee.status === 'employed' ? <UserX size={16} /> : <UserCheck size={16} />}
                              </button>
                            </div>

                            {currentUser.role === 'admin' && (
                              <button
                                onClick={() => handleDelete(employee)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Employee"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'upload' && (
          <div className="p-6">
            <EmployeeExcelUpload
              currentUser={currentUser}
              onUploadComplete={() => {
                // Refresh employee list after upload
                onEmployeeUpdate(employees);
                setActiveTab('list');
                setSuccess('Employee data imported successfully! Switched back to employee list.');
              }}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingEmployee}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Promoter">Promoter</option>
                    <option value="Retail">Retail</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="HR">HR</option>
                    <option value="Director">Director</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Salary ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthly_salary}
                    onChange={(e) => setFormData({...formData, monthly_salary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Location
                  </label>
                  <select
                    value={formData.primary_location_id}
                    onChange={(e) => setFormData({...formData, primary_location_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingEmployee ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    editingEmployee ? 'Update Employee' : 'Add Employee'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;