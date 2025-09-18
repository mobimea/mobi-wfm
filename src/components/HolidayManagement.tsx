import React, { useState } from 'react';
import { Plus, Calendar, Globe, MapPin, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Holiday } from '../types';

// UUID generator for new holidays
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

interface HolidayManagementProps {
  holidays: Holiday[];
  onHolidayUpdate?: (holidays: Holiday[]) => void;
  addHoliday?: (holiday: Holiday) => Promise<void>;
  editHoliday?: (holidayId: string, updates: Partial<Holiday>) => Promise<void>;
  removeHoliday?: (holidayId: string) => Promise<void>;
  currentUser: any;
}

const HolidayManagement: React.FC<HolidayManagementProps> = ({ 
  holidays, 
  onHolidayUpdate, 
  addHoliday,
  editHoliday,
  removeHoliday,
  currentUser 
}) => {

  const [selectedYear, setSelectedYear] = useState(2024);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [calendarView, setCalendarView] = useState<'list' | 'calendar'>('list');

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'company' as Holiday['type'],
    is_paid: true,
    applies_to: 'all' as Holiday['applies_to'],
    departments: [] as string[],
    locations: [] as string[],
    description: '',
    recurring_annually: true
  });

  const currentYearHolidays = holidays.filter(holiday => 
    new Date(holiday.date).getFullYear() === selectedYear
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingHolidays = currentYearHolidays.filter(holiday => 
    new Date(holiday.date) >= new Date()
  ).slice(0, 5);

  const calculateHolidayStats = () => {
    const total = currentYearHolidays.length;
    const paid = currentYearHolidays.filter(h => h.is_paid).length;
    const public_holidays = currentYearHolidays.filter(h => h.type === 'public' || h.type === 'national').length;
    const company_holidays = currentYearHolidays.filter(h => h.type === 'company').length;
    const religious_holidays = currentYearHolidays.filter(h => h.type === 'religious').length;
    
    return { total, paid, public_holidays, company_holidays, religious_holidays };
  };

  const stats = calculateHolidayStats();

  // Check for conflicts or issues
  const getHolidayConflicts = () => {
    const conflicts = [];
    const today = new Date();
    
    // Check for holidays too close to weekends
    currentYearHolidays.forEach(holiday => {
      const holidayDate = new Date(holiday.date);
      const dayOfWeek = holidayDate.getDay();
      if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday or Friday
        conflicts.push({
          type: 'weekend_bridge',
          holiday: holiday.name,
          message: `${holiday.name} falls on ${dayOfWeek === 1 ? 'Monday' : 'Friday'} - consider bridge day policy`
        });
      }
    });
    
    // Check for overlapping holidays
    for (let i = 0; i < currentYearHolidays.length - 1; i++) {
      const current = new Date(currentYearHolidays[i].date);
      const next = new Date(currentYearHolidays[i + 1].date);
      const diffDays = (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        conflicts.push({
          type: 'consecutive',
          holiday: currentYearHolidays[i].name,
          message: `${currentYearHolidays[i].name} and ${currentYearHolidays[i + 1].name} are consecutive`
        });
      }
    }

    return conflicts;
  };

  const conflicts = getHolidayConflicts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newHoliday: Holiday = {
      id: generateUUID(),
      name: formData.name,
      date: formData.date,
      type: formData.type,
      is_paid: formData.is_paid,
      applies_to: formData.applies_to,
      departments: formData.departments,
      locations: formData.locations,
      description: formData.description,
      recurring_annually: formData.recurring_annually,
      created_by: currentUser?.email || 'admin',
      created_date: editingHoliday ? editingHoliday.created_date : new Date().toISOString().split('T')[0]
    };

    if (editingHoliday && editHoliday) {
      editHoliday(editingHoliday.id, newHoliday).then(() => {
        console.log('✅ Holiday updated successfully');
        resetForm();
      }).catch((error) => {
        console.error('❌ Error updating holiday:', error);
        alert('Failed to update holiday: ' + error.message);
      });
    } else if (addHoliday) {
      addHoliday(newHoliday).then(() => {
        console.log('✅ Holiday added successfully');
        resetForm();
      }).catch((error) => {
        console.error('❌ Error adding holiday:', error);
        alert('Failed to add holiday: ' + error.message);
      });
    } else {
      // Fallback to old method
      if (editingHoliday) {
        onHolidayUpdate?.(holidays.map(holiday => 
          holiday.id === editingHoliday.id ? newHoliday : holiday
        ));
      } else {
        onHolidayUpdate?.([...holidays, newHoliday]);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      type: 'company',
      is_paid: true,
      applies_to: 'all',
      departments: [],
      locations: [],
      description: '',
      recurring_annually: true
    });
    setShowAddForm(false);
    setEditingHoliday(null);
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      is_paid: holiday.is_paid,
      applies_to: holiday.applies_to,
      departments: holiday.departments || [],
      locations: holiday.locations || [],
      description: holiday.description,
      recurring_annually: holiday.recurring_annually
    });
    setShowAddForm(true);
  };

  const handleDelete = (holidayId: string) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      if (removeHoliday) {
        removeHoliday(holidayId).then(() => {
          console.log('✅ Holiday deleted successfully');
        }).catch((error) => {
          console.error('❌ Error deleting holiday:', error);
          alert('Failed to delete holiday: ' + error.message);
        });
      } else if (onHolidayUpdate) {
        onHolidayUpdate(holidays.filter(h => h.id !== holidayId));
      }
    }
  };

  const getTypeColor = (type: Holiday['type']) => {
    switch (type) {
      case 'public': return 'bg-blue-100 text-blue-800';
      case 'national': return 'bg-red-100 text-red-800';
      case 'religious': return 'bg-purple-100 text-purple-800';
      case 'company': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateCalendarView = () => {
    const monthsInYear = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(selectedYear, i, 1);
      return {
        name: date.toLocaleDateString('en-US', { month: 'long' }),
        number: i,
        holidays: currentYearHolidays.filter(h => new Date(h.date).getMonth() === i)
      };
    });

    return monthsInYear;
  };

  const calendarMonths = generateCalendarView();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holiday Management</h1>
          <p className="text-gray-600 mt-1">Manage company and public holidays</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCalendarView('list')}
              className={`px-3 py-2 text-sm rounded ${calendarView === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              List
            </button>
            <button
              onClick={() => setCalendarView('calendar')}
              className={`px-3 py-2 text-sm rounded ${calendarView === 'calendar' ? 'bg-white shadow-sm' : ''}`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Holiday
          </button>
        </div>
      </div>

      {/* Holiday Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Holidays</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <Calendar className="h-6 w-6 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Holidays</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.paid}</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
              <Globe className="h-6 w-6 text-gray-600 relative z-10" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Public Holidays</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.public_holidays}</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
              <Globe className="h-6 w-6 text-gray-600 relative z-10" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Company Holidays</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.company_holidays}</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
              <MapPin className="h-6 w-6 text-gray-600 relative z-10" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Religious Holidays</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.religious_holidays}</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
              <Globe className="h-6 w-6 text-gray-600 relative z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Conflicts/Alerts */}
      {conflicts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Holiday Planning Alerts
          </h2>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm text-orange-800">{conflict.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Holidays */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Holidays</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {upcomingHolidays.map(holiday => {
            const daysUntil = Math.ceil((new Date(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={holiday.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {new Date(holiday.date).getDate()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="mt-2 font-medium text-gray-900 text-sm">
                    {holiday.name}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                  </div>
                  <span className={`inline-flex px-2 py-1 mt-2 text-xs font-medium rounded-full ${getTypeColor(holiday.type)}`}>
                    {holiday.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holiday List/Calendar View */}
      {calendarView === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Holidays {selectedYear}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holiday
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applies To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentYearHolidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{holiday.name}</div>
                        <div className="text-sm text-gray-500">{holiday.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(holiday.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(holiday.type)}`}>
                        {holiday.type ? holiday.type.replace('_', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {holiday.applies_to === 'all' ? 'All Employees' : holiday.applies_to.replace('_', ' ')}
                      </div>
                      {holiday.departments && holiday.departments.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {holiday.departments.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        holiday.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {holiday.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(holiday)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        {holiday.type === 'company' && (
                          <button
                            onClick={() => handleDelete(holiday.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {calendarMonths.map(month => (
              <div key={month.number} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">
                  {month.name} {selectedYear}
                </h3>
                <div className="space-y-2">
                  {month.holidays.length > 0 ? (
                    month.holidays.map(holiday => (
                      <div key={holiday.id} className="p-2 bg-gray-50 rounded text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(holiday.date).getDate()}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {holiday.name}
                        </div>
                        <span className={`inline-block px-1 py-0.5 mt-1 text-xs rounded ${getTypeColor(holiday.type)}`}>
                          {holiday.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      No holidays
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Holiday Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Company Fun Day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Holiday['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="company">Company Holiday</option>
                  <option value="public">Public Holiday</option>
                  <option value="national">National Holiday</option>
                  <option value="religious">Religious Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applies To
                </label>
                <select
                  required
                  value={formData.applies_to}
                  onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as Holiday['applies_to'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Employees</option>
                  <option value="specific_departments">Specific Departments</option>
                  <option value="specific_locations">Specific Locations</option>
                </select>
              </div>

              {formData.applies_to === 'specific_departments' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Departments
                  </label>
                  <div className="space-y-2">
                    {['Sales', 'Operations', 'HR', 'Management'].map(dept => (
                      <label key={dept} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.departments.includes(dept)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, departments: [...formData.departments, dept] });
                            } else {
                              setFormData({ ...formData, departments: formData.departments.filter(d => d !== dept) });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paid"
                  checked={formData.is_paid}
                  onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="paid" className="text-sm text-gray-700">
                  Paid Holiday
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring_annually}
                  onChange={(e) => setFormData({ ...formData, recurring_annually: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  Recurring annually (same date each year)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the holiday..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingHoliday ? 'Update' : 'Add'} Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;