import React, { useState } from 'react';
import { Calendar, Plus, Upload, MapPin, Clock, Eye } from 'lucide-react';
import { RosterEntry, Employee, Location } from '../types';
import MapComponent from './MapComponent';

// UUID generator for new roster entries
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

interface RosterManagementProps {
  roster: RosterEntry[];
  employees: Employee[];
  locations: Location[];
  onRosterUpdate?: (roster: RosterEntry[]) => void;
  addRosterEntry?: (entry: RosterEntry) => Promise<void>;
  editRosterEntry?: (entryId: string, updates: Partial<RosterEntry>) => Promise<void>;
  removeRosterEntry?: (entryId: string) => Promise<void>;
  currentUser: any;
  onViewChange?: (view: string) => void;
}

const RosterManagement: React.FC<RosterManagementProps> = ({
  roster,
  employees,
  locations,
  onRosterUpdate,
  addRosterEntry,
  editRosterEntry,
  removeRosterEntry,
  currentUser,
  onViewChange
}) => {
  const isReadOnly = currentUser?.role !== 'admin';
  const isEmployee = currentUser?.role === 'employee';
  
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return startOfWeek.toISOString().split('T')[0];
  });
  
  const [showAddShift, setShowAddShift] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showMapView, setShowMapView] = useState(true);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    shift_start: '09:00',
    shift_end: '17:00',
    location: '',
    recurring: false
  });

  const getWeekDates = (startDate: string) => {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedEmployee = employees.find(emp => emp.id === formData.employee_id);
    if (!selectedEmployee) {
      alert('Selected employee not found');
      return;
    }
    
    const newShift: RosterEntry = {
      id: generateUUID(),
      employee_id: selectedEmployee.employee_id,
      date: formData.date,
      shift_start: formData.shift_start,
      shift_end: formData.shift_end,
      location: formData.location,
      recurring: formData.recurring
    };

    if (addRosterEntry) {
      addRosterEntry(newShift).then(() => {
        console.log('✅ Shift added successfully');
        setFormData({
          employee_id: '',
          date: '',
          shift_start: '09:00',
          shift_end: '17:00',
          location: '',
          recurring: false
        });
        setShowAddShift(false);
      }).catch((error) => {
        console.error('❌ Error adding shift:', error);
        alert('Failed to add shift: ' + error.message);
      });
    } else if (onRosterUpdate) {
      onRosterUpdate([...roster, newShift]);
      setFormData({
        employee_id: '',
        date: '',
        shift_start: '09:00',
        shift_end: '17:00',
        location: '',
        recurring: false
      });
      setShowAddShift(false);
    }
  };

  // Create map markers for roster visualization
  const createMapMarkersForRoster = () => {
    const weekRoster = roster.filter(s => weekDates.includes(s.date));
    const locationShiftCounts: { [locationName: string]: number } = {};
    
    weekRoster.forEach(shift => {
      locationShiftCounts[shift.location] = (locationShiftCounts[shift.location] || 0) + 1;
    });
    
    return locations
      .filter(loc => locationShiftCounts[loc.name] > 0)
      .map(loc => ({
        id: loc.id,
        name: `${loc.name} (${locationShiftCounts[loc.name]} shifts)`,
        lat: loc.lat,
        lng: loc.lng,
        color: locationShiftCounts[loc.name] > 5 ? '#ef4444' : 
               locationShiftCounts[loc.name] > 2 ? '#f59e0b' : '#10b981'
      }));
  };

  const mapMarkers = createMapMarkersForRoster();

  const getRosterForDate = (date: string) => {
    // Filter by current user if employee, or by supervisor's department
    if (currentUser?.role === 'employee' && currentEmployeeRecord) {
      return roster.filter(entry => entry.date === date && entry.employee_id === currentEmployeeRecord.employee_id);
    } else if (currentUser?.role === 'supervisor' && currentUser.department) {
      const departmentEmployees = employees.filter(emp => emp.department === currentUser.department);
      const departmentEmployeeIds = departmentEmployees.map(emp => emp.employee_id);
      return roster.filter(entry => entry.date === date && departmentEmployeeIds.includes(entry.employee_id));
    } else {
      return roster.filter(entry => entry.date === date);
    }
  };

  const currentEmployeeRecord = isEmployee && currentUser?.employee_id 
    ? employees.find(emp => emp.employee_id === currentUser.employee_id)
    : null;

  const deleteShift = (shiftId: string) => {
    if (removeRosterEntry) {
      removeRosterEntry(shiftId).then(() => {
        console.log('✅ Shift deleted successfully');
      }).catch((error) => {
        console.error('❌ Error deleting shift:', error);
        alert('Failed to delete shift: ' + error.message);
      });
    } else if (onRosterUpdate) {
      onRosterUpdate(roster.filter(shift => shift.id !== shiftId));
    }
  };

  // Get filtered employees based on user role
  const getAvailableEmployees = () => {
    if (currentUser?.role === 'supervisor' && currentUser.department) {
      return employees.filter(emp => emp.department === currentUser.department && emp.status === 'employed');
    }
    return employees.filter(emp => emp.status === 'employed');
  };

  const availableEmployees = getAvailableEmployees();
  
  // Calculate roster statistics based on current user's view
  const getRosterStats = () => {
    const weekRoster = roster.filter(s => weekDates.includes(s.date));
    
    if (currentUser?.role === 'employee' && currentEmployeeRecord) {
      const myShifts = weekRoster.filter(s => s.employee_id === currentEmployeeRecord.employee_id);
      const myHours = myShifts.reduce((total, shift) => {
        const hours = (new Date(`2024-01-01T${shift.shift_end}:00`).getTime() - 
                     new Date(`2024-01-01T${shift.shift_start}:00`).getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      
      return {
        totalShifts: myShifts.length,
        activeEmployees: 1,
        totalHours: myHours,
        locations: new Set(myShifts.map(s => s.location)).size
      };
    } else if (currentUser?.role === 'supervisor' && currentUser.department) {
      const departmentEmployees = employees.filter(emp => emp.department === currentUser.department);
      const departmentEmployeeIds = departmentEmployees.map(emp => emp.employee_id);
      const teamRoster = weekRoster.filter(s => departmentEmployeeIds.includes(s.employee_id));
      const teamHours = teamRoster.reduce((total, shift) => {
        const hours = (new Date(`2024-01-01T${shift.shift_end}:00`).getTime() - 
                     new Date(`2024-01-01T${shift.shift_start}:00`).getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      
      return {
        totalShifts: teamRoster.length,
        activeEmployees: new Set(teamRoster.map(s => s.employee_id)).size,
        totalHours: teamHours,
        locations: new Set(teamRoster.map(s => s.location)).size
      };
    } else {
      const totalHours = weekRoster.reduce((total, shift) => {
        const hours = (new Date(`2024-01-01T${shift.shift_end}:00`).getTime() - 
                     new Date(`2024-01-01T${shift.shift_start}:00`).getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      
      return {
        totalShifts: weekRoster.length,
        activeEmployees: new Set(weekRoster.map(s => s.employee_id)).size,
        totalHours: totalHours,
        locations: new Set(weekRoster.map(s => s.location)).size
      };
    }
  };

  const rosterStats = getRosterStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Roster Management</h1>
        {!isReadOnly && (
          <div className="flex gap-2">
            {!isEmployee && (
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Upload size={16} />
              Bulk Upload
            </button>
            )}
            {!isEmployee && (
            <button
              onClick={() => setShowAddShift(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              <Plus size={16} />
              Add Shift
            </button>
            )}
          </div>
        )}
      </div>

      {/* Week Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Week starting:</label>
          <input
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <div className="text-sm text-gray-500">
            {new Date(selectedWeek).toLocaleDateString()} - {new Date(weekDates[6]).toLocaleDateString()}
          </div>
          {/* Quick Week Navigation */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setShowMapView(!showMapView)}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
                showMapView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Eye size={12} />
              {showMapView ? 'Hide' : 'Show'} Map
            </button>
            <button 
              onClick={() => onViewChange?.('attendance')}
              className="px-3 py-1 text-xs bg-gray-800 text-white rounded-full hover:bg-black transition-colors"
            >
              Attendance
            </button>
            <button 
              onClick={() => onViewChange?.('reports')}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Map View for Scheduled Locations */}
      {showMapView && mapMarkers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isEmployee ? 'My Scheduled Work Locations' : 
             currentUser?.role === 'supervisor' ? 'Team Work Locations' : 'Scheduled Work Locations'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isEmployee ? 'Your work locations for this week.' :
             currentUser?.role === 'supervisor' ? 'Your team\'s work locations for this week.' :
             'All scheduled work locations for this week.'} 
            Color coding: <span className="text-green-600">●</span> Low activity (1-2 shifts) 
            <span className="text-yellow-600 ml-2">●</span> Medium activity (3-5 shifts) 
            <span className="text-red-600 ml-2">●</span> High activity (6+ shifts)
          </p>
          
          <MapComponent
            center={mapMarkers[0] ? { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng } : { lat: 3.1390, lng: 101.6869 }}
            zoom={mapMarkers.length === 1 ? 14 : 11}
            markers={mapMarkers}
            mapHeight="350px"
          />
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Showing {mapMarkers.length} location{mapMarkers.length !== 1 ? 's' : ''} with scheduled shifts for this week
              </span>
              <div className="text-xs text-gray-500">
                Week: {new Date(selectedWeek).toLocaleDateString()} - {new Date(weekDates[6]).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {showMapView && mapMarkers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Scheduled Locations This Week
            </h3>
            <p className="text-gray-600">
              {isEmployee ? 'You have no shifts scheduled for this week.' :
               currentUser?.role === 'supervisor' ? 'Your team has no shifts scheduled for this week.' :
               'No shifts have been scheduled for this week.'}
            </p>
            {!isEmployee && (
              <button
                onClick={() => setShowAddShift(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus size={16} />
                Schedule First Shift
              </button>
            )}
          </div>
        </div>
      )}

      {/* Weekly Calendar View */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEmployee ? 'My Weekly Schedule' : 
             currentUser?.role === 'supervisor' ? 'Team Weekly Roster' : 'Weekly Roster'}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-7 gap-0 border-b">
              {weekDates.map((date, index) => (
                <div key={date} className="p-4 border-r last:border-r-0 bg-gray-50">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{weekdays[index]}</div>
                    <div className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-0 min-h-96">
              {weekDates.map((date, dayIndex) => {
                const dayRoster = getRosterForDate(date);
                
                return (
                  <div key={date} className="p-2 border-r last:border-r-0 space-y-2">
                    {dayRoster.map((shift) => {
                      const employee = employees.find(emp => emp.employee_id === shift.employee_id);
                      const shiftHours = (new Date(`2024-01-01T${shift.shift_end}:00`).getTime() - 
                                        new Date(`2024-01-01T${shift.shift_start}:00`).getTime()) / (1000 * 60 * 60);
                      
                      return (
                        <div
                          key={shift.id}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs hover:bg-blue-100 transition-colors group relative"
                        >
                          <div className="font-medium text-blue-900 mb-1">{employee?.name}</div>
                          <div className="space-y-1 text-blue-700">
                            <div className="flex items-center gap-1">
                              <Clock size={10} />
                              {shift.shift_start} - {shift.shift_end}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={10} />
                              {shift.location}
                            </div>
                            <div className="text-blue-600">{shiftHours}h shift</div>
                          </div>
                          
                          <button
                            onClick={() => deleteShift(shift.id)}
                            className={`absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all ${
                              (isReadOnly || isEmployee) ? 'hidden' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    {/* Add shift shortcut for empty days */}
                    {dayRoster.length === 0 && !isEmployee && currentUser?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setFormData({ ...formData, date });
                          setShowAddShift(true);
                        }}
                        className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Roster Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isEmployee ? 'My Weekly Summary' : 
           currentUser?.role === 'supervisor' ? 'Team Weekly Summary' : 'Weekly Summary'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{rosterStats.totalShifts}</div>
            <div className="text-sm text-blue-700">{isEmployee ? 'My Shifts' : 'Total Shifts'}</div>
          </div>
          
          {!isEmployee && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {rosterStats.activeEmployees}
            </div>
            <div className="text-sm text-green-700">
              {currentUser?.role === 'supervisor' ? 'Team Members' : 'Active Employees'}
            </div>
          </div>
          )}
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(rosterStats.totalHours)}h
            </div>
            <div className="text-sm text-purple-700">{isEmployee ? 'My Hours' : 'Total Hours'}</div>
          </div>
          
          {!isEmployee && (
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {rosterStats.locations}
            </div>
            <div className="text-sm text-orange-700">Locations</div>
          </div>
          )}
          
          {isEmployee && (
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {rosterStats.locations}
            </div>
            <div className="text-sm text-orange-700">Locations</div>
          </div>
          )}
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddShift && !isEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Shift</h2>
            
            <form onSubmit={handleAddShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employee</option>
                  {availableEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.shift_start}
                    onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.shift_end}
                    onChange={(e) => setFormData({ ...formData, shift_end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.name}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  Recurring shift (apply to future weeks)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddShift(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && !isEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Upload Roster</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">CSV Format Expected:</h3>
                <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded">
                  Employee ID,Date,Start Time,End Time,Location<br />
                  EMP001,2024-12-16,09:00,17:00,HQ Office<br />
                  EMP002,2024-12-16,10:00,18:00,Mall Branch
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // For now, close modal - real CSV processing would happen here
                    alert('CSV upload feature will process the selected file. File parsing and validation would happen here.');
                    setShowBulkUpload(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Process Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterManagement;