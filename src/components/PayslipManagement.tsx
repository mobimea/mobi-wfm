import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, User, Building2, Plus, Search, Filter } from 'lucide-react';
import { DatabaseService, supabase } from '../lib/supabase';
import type { Employee } from '../types';

interface Payslip {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  pdf_url?: string;
  created_at: string;
}

interface PayslipManagementProps {
  employees: Employee[];
  currentUser: any;
}

const PayslipManagement: React.FC<PayslipManagementProps> = ({
  employees,
  currentUser
}) => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: '',
    allowances: '',
    deductions: ''
  });

  // Fetch payslips on component mount
  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setPayslips(data || []);
    } catch (error: any) {
      console.error('Error fetching payslips:', error);
      setError('Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const employee = employees.find(emp => emp.id === formData.employee_id);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Create payslip record first
      const payslipData = {
        employee_id: formData.employee_id,
        month: formData.month,
        year: formData.year,
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0
      };

      const result = await DatabaseService.insertRecord('payslips', payslipData);

      if (result.error) {
        throw new Error(result.error);
      }

      // Call the Edge Function to generate PDF payslip
      const { data: pdfResult, error: pdfError } = await supabase.functions
        .invoke('payslip_generator', {
          body: {
            payslipId: result.data.id,
            employeeData: {
              ...employee,
              basic_salary: payslipData.basic_salary,
              allowances: payslipData.allowances,
              deductions: payslipData.deductions,
              net_pay: payslipData.basic_salary + payslipData.allowances - payslipData.deductions,
              month: payslipData.month,
              year: payslipData.year
            }
          }
        });

      if (pdfError) {
        console.warn('PDF generation failed:', pdfError.message);
        // Continue without PDF - payslip record is still created
      }

      setSuccess(`Payslip generated successfully for ${employee.name}!${pdfResult?.pdfUrl ? ' PDF available for download.' : ''}`);
      setShowGenerateForm(false);
      setFormData({
        employee_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basic_salary: '',
        allowances: '',
        deductions: ''
      });
      
      // Refresh payslips list
      fetchPayslips();

    } catch (error: any) {
      console.error('Error generating payslip:', error);
      setError(error.message || 'Failed to generate payslip');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = (payslip: Payslip) => {
    const employee = employees.find(emp => emp.id === payslip.employee_id);
    if (!employee) return;

    // Generate a simple HTML payslip for download
    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${employee.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .employee-info { margin-bottom: 20px; }
          .payslip-table { width: 100%; border-collapse: collapse; }
          .payslip-table th, .payslip-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .payslip-table th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PAYSLIP</h1>
          <h3>Month: ${payslip.month}/${payslip.year}</h3>
        </div>
        
        <div class="employee-info">
          <p><strong>Employee Name:</strong> ${employee.name}</p>
          <p><strong>Employee ID:</strong> ${employee.employee_id}</p>
          <p><strong>Department:</strong> ${employee.department}</p>
          <p><strong>Position:</strong> ${employee.position}</p>
        </div>

        <table class="payslip-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (RS)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td>${payslip.basic_salary.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Allowances</td>
              <td>${payslip.allowances.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Deductions</td>
              <td>-${payslip.deductions.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Net Pay</strong></td>
              <td><strong>${payslip.net_pay.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px;">
          <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([payslipHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${employee.employee_id}_${payslip.month}_${payslip.year}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter payslips based on search and filters
  const filteredPayslips = payslips.filter(payslip => {
    const employee = employees.find(emp => emp.id === payslip.employee_id);
    const matchesSearch = !searchTerm || 
      employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !monthFilter || payslip.month.toString() === monthFilter;
    const matchesYear = !yearFilter || payslip.year.toString() === yearFilter;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Payslip Management
          </h1>
          <p className="text-gray-600">Generate and manage employee payslips</p>
        </div>
        
        {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
          <button
            onClick={() => setShowGenerateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Generate Payslip
          </button>
        )}
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Months</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Filter size={16} />
            Showing {filteredPayslips.length} payslips
          </div>
        </div>
      </div>

      {/* Payslips List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payslips</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-600">Loading payslips...</p>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payslips found</h3>
              <p className="text-gray-600">
                {payslips.length === 0 
                  ? "Generate your first payslip to get started."
                  : "Try adjusting your search filters."}
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
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Basic Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayslips.map((payslip) => {
                    const employee = employees.find(emp => emp.id === payslip.employee_id);
                    
                    return (
                      <tr key={payslip.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
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
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {months.find(m => m.value === payslip.month.toString())?.label} {payslip.year}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {payslip.basic_salary.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm font-medium text-green-600">
                              {payslip.net_pay.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDownloadPayslip(payslip)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Download size={16} />
                            Download
                          </button>
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

      {/* Generate Payslip Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Payslip</h2>
            
            <form onSubmit={handleGeneratePayslip} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month *
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary (RS) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({...formData, basic_salary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowances (RS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.allowances}
                  onChange={(e) => setFormData({...formData, allowances: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deductions (RS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
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
                  {loading ? 'Generating...' : 'Generate Payslip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipManagement;
