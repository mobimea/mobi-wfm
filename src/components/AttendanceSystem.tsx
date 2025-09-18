import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { AttendanceRecord, Employee, Location, RosterEntry } from '../types';
import { validateGeofence, calculateLateness, calculateTotalHours } from '../utils/attendance';
import { exportAttendanceCSV } from '../utils/payroll';

// UUID generator for new attendance records
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

interface AttendanceSystemProps {
  attendance: AttendanceRecord[];
  employees: Employee[];
  locations: Location[];
  roster: RosterEntry[];
  onAttendanceUpdate?: (attendance: AttendanceRecord[]) => void;
  addAttendanceRecord?: (record: AttendanceRecord) => Promise<void>;
  editAttendanceRecord?: (recordId: string, updates: Partial<AttendanceRecord>) => Promise<void>;
  currentUser: any;
}

const AttendanceSystem: React.FC<AttendanceSystemProps> = ({
  attendance,
  employees,
  locations,
  roster,
  onAttendanceUpdate,
  addAttendanceRecord,
  editAttendanceRecord,
  currentUser
}) => {
  const isReadOnly = currentUser?.role !== 'admin';
  
  const [showMobileCheckin, setShowMobileCheckin] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionRecord, setCorrectionRecord] = useState<AttendanceRecord | null>(null);
  const [clockInNotification, setClockInNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Employee-specific settings
  const isEmployee = currentUser?.role === 'employee';
  const currentEmployeeRecord = isEmployee && currentUser?.employee_id 
    ? employees.find(emp => emp.employee_id === currentUser.employee_id) 
    : null;

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('GPS Error:', error);
          setClockInNotification({
            type: 'error',
            message: 'Could not access GPS location. Please enable location services.'
          });
        }
      );
    }
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(record => record.date === today);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (clockInNotification) {
      const timer = setTimeout(() => {
        setClockInNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [clockInNotification]);

  const handleClockInOut = (employeeId: string) => {
    if (!gpsLocation) {
      setClockInNotification({
        type: 'error',
        message: 'GPS location not available. Please enable location services.'
      });
      return;
    }

    // Find employee's assigned shift for today
    const employee = employees.find(emp => emp.id === employeeId || emp.employee_id === employeeId);
    if (!employee) {
      setClockInNotification({
        type: 'error',
        message: 'Employee record not found.'
      });
      return;
    }
    
    const todayShift = roster.find(shift => 
      shift.employee_id === employee.employee_id && shift.date === today
    );
    
    if (!todayShift) {
      setClockInNotification({
        type: 'error',
        message: `No shift assigned for today. Current roster has ${roster.filter(s => s.date === today).length} total shifts scheduled.`
      });
      return;
    }

    // Find the location details for the assigned shift
    const shiftLocation = locations.find(loc => loc.name === todayShift.location);
    
    if (!shiftLocation) {
      setClockInNotification({
        type: 'error',
        message: `Shift location "${todayShift.location}" not found. Please verify location exists in system.`
      });
      return;
    }

    // Validate employee is within geofence radius of assigned location
    const isWithinGeofence = validateGeofence(
      gpsLocation.lat,
      gpsLocation.lng,
      shiftLocation.lat,
      shiftLocation.lng,
      shiftLocation.geofence_radius
    );

    if (!isWithinGeofence) {
      setClockInNotification({
        type: 'error',
        message: `You must be within ${shiftLocation.geofence_radius} meters of ${shiftLocation.name} to clock in. Current location is too far from your assigned shift location.`
      });
      return;
    }

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const existingRecord = todayAttendance.find(record => record.employee_id === employee.employee_id);
    
    if (existingRecord?.time_in && !existingRecord.time_out) {
      // Clock out
      const totalHours = calculateTotalHours(existingRecord.time_in, timeString);
      const updatedRecord = {
        ...existingRecord,
        time_out: timeString,
        total_hours: totalHours,
        overtime_hours: Math.max(0, totalHours - 8)
      };
      
      if (editAttendanceRecord) {
        editAttendanceRecord(existingRecord.id, {
          time_out: timeString,
          total_hours: totalHours,
          overtime_hours: Math.max(0, totalHours - 8)
        }).then(() => {
          console.log('✅ Clock out recorded successfully');
          setClockInNotification({
            type: 'success',
            message: `Successfully clocked out at ${timeString}! Total hours worked: ${totalHours.toFixed(1)}h`
          });
        }).catch((error) => {
          console.error('❌ Error recording clock out:', error);
          setClockInNotification({
            type: 'error',
            message: `Failed to record clock out: ${error.message}`
          });
        });
      } else if (onAttendanceUpdate) {
        onAttendanceUpdate(attendance.map(record => 
          record.id === existingRecord.id ? updatedRecord : record
        ));
        setClockInNotification({
          type: 'success',
          message: `Successfully clocked out at ${timeString}! Total hours worked: ${totalHours.toFixed(1)}h`
        });
      }
    } else if (!existingRecord) {
      // Clock in
      const minutesLate = calculateLateness(todayShift.shift_start, timeString);
      const newRecord: AttendanceRecord = {
        id: generateUUID(),
        employee_id: employee.employee_id,
        date: today,
        status: minutesLate > 15 ? 'late' : 'present',
        time_in: timeString,
        minutes_late: minutesLate,
        location: shiftLocation.name,
        photo_url: undefined, // Real photo upload would be implemented here
        recorded_by: currentUser?.employee_id || 'system',
        checked_via: 'gps',
        total_hours: undefined,
        overtime_hours: 0
      };
      
      if (addAttendanceRecord) {
        addAttendanceRecord(newRecord).then(() => {
          console.log('✅ Clock in recorded successfully');
          setClockInNotification({
            type: 'success',
            message: `Successfully clocked in at ${timeString} at ${shiftLocation.name}! ${
              minutesLate > 15 ? `Note: ${minutesLate} minutes late.` : ''
            }`
          });
        }).catch((error) => {
          console.error('❌ Error recording clock in:', error);
          setClockInNotification({
            type: 'error',
            message: `Failed to record clock in: ${error.message}`
          });
        });
      } else if (onAttendanceUpdate) {
        onAttendanceUpdate([...attendance, newRecord]);
        setClockInNotification({
          type: 'success',
          message: `Successfully clocked in at ${timeString} at ${shiftLocation.name}! ${
            minutesLate > 15 ? `Note: ${minutesLate} minutes late.` : ''
          }`
        });
      }
    } else {
      setClockInNotification({
        type: 'error',
        message: 'Already completed attendance for today.'
      });
    }
  };

  const handleExportCSV = () => {
    const csvData = exportAttendanceCSV(attendance, employees);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${today}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRequestCorrection = (record: AttendanceRecord) => {
    setCorrectionRecord(record);
    setShowCorrection(true);
  };

  const handleApproveCorrection = (recordId: string) => {
    // Simulate approval - in real system would update status
    alert('Time correction approved and processed');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEmployee ? 'My Attendance' : 'Attendance System'}
        </h1>
        {!isEmployee && (
          <div className="flex gap-2">
            {currentUser?.role === 'admin' && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
            {!isReadOnly && (
              <button
                onClick={() => setShowMobileCheckin(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
              >
                <Camera size={16} />
                Mobile Check-in
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clock-in Notification */}
      {clockInNotification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
          clockInNotification.type === 'success' 
            ? 'bg-gray-100 border-gray-400 text-gray-900' 
            : 'bg-gray-200 border-gray-500 text-gray-900'
        }`}>
          <div className="flex items-center gap-3">
            {clockInNotification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <p className="font-medium">{clockInNotification.message}</p>
          </div>
        </div>
      )}

      {/* Live Attendance Monitor for Admins */}
      {currentUser?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Attendance Monitor
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button 
              className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-800">
                {todayAttendance.filter(r => r.time_in && !r.time_out).length}
              </div>
              <div className="text-sm text-gray-700">Currently Clocked In</div>
            </button>
            
            <button 
              className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-800">
                {todayAttendance.filter(r => r.time_in && r.time_out).length}
              </div>
              <div className="text-sm text-gray-700">Completed Shifts</div>
            </button>
            
            <button 
              className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-800">
                {todayAttendance.filter(r => r.status === 'late').length}
              </div>
              <div className="text-sm text-gray-700">Late Arrivals</div>
            </button>
            
            <button 
              className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-800">
                {employees.filter(emp => emp.status === 'employed').length - todayAttendance.filter(r => r.status !== 'absent').length}
              </div>
              <div className="text-sm text-gray-700">Not Yet Checked In</div>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Currently On-Site</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {todayAttendance.filter(r => r.time_in && !r.time_out).map(record => {
                  const employee = employees.find(emp => emp.employee_id === record.employee_id);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{employee?.name}</div>
                        <div className="text-xs text-gray-500">{record.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{record.time_in}</div>
                        <div className="text-xs text-gray-500">{record.checked_via}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recent Clock-Outs</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {todayAttendance.filter(r => r.time_out).slice(-5).map(record => {
                  const employee = employees.find(emp => emp.employee_id === record.employee_id);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{employee?.name}</div>
                        <div className="text-xs text-gray-500">{record.total_hours?.toFixed(1)}h worked</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{record.time_out}</div>
                        <div className="text-xs text-gray-500">{record.checked_via}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Quick Clock-in */}
      {isEmployee && currentEmployeeRecord && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location-Based Clock In/Out</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="text-center space-y-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg border border-gray-300">
                  <div className="flex items-center justify-center mb-4">
                    <MapPin className="h-16 w-16 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Location Verified Check-in</h3>
                  <p className="text-sm text-gray-700 mt-2">
                    System will verify you're within 10 meters of your assigned location
                  </p>
                </div>
                <button
                  onClick={() => handleClockInOut(currentEmployeeRecord.id)}
                  disabled={!gpsLocation}
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {gpsLocation ? 'Clock In/Out' : 'Getting Location...'}
                </button>
                
                {gpsLocation && (
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <CheckCircle size={12} />
                    GPS Location Ready
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">My Today's Status</h3>
              {todayAttendance.filter(record => record.employee_id === currentEmployeeRecord?.employee_id).map(record => (
                <div key={record.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {record.time_in && !record.time_out ? 'Clocked In' : 
                       record.time_in && record.time_out ? 'Clocked Out' : 'Not Clocked In'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {record.time_in} {record.time_out && `- ${record.time_out}`}
                    </span>
                  </div>
                  {record.total_hours && (
                    <div className="mt-2 text-xs text-gray-700 font-medium">
                      Total: {record.total_hours.toFixed(1)}h
                      {record.overtime_hours && record.overtime_hours > 0 && (
                        <span className="text-gray-800"> (OT: {record.overtime_hours.toFixed(1)}h)</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {todayAttendance.filter(record => record.employee_id === currentEmployeeRecord?.employee_id).length === 0 && (
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500">No attendance record for today</p>
                  <p className="text-xs text-gray-400 mt-1">Click Clock In/Out when you're at your assigned location</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isEmployee ? "My Today's Status" : "Today's Attendance"}
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(isEmployee ? 
              todayAttendance.filter(record => record.employee_id === currentEmployeeRecord?.employee_id) : 
              todayAttendance
            ).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {isEmployee ? 'No attendance record for today' : 'No attendance records for today'}
              </p>
            ) : (
              (isEmployee ? 
                todayAttendance.filter(record => record.employee_id === currentEmployeeRecord?.employee_id) : 
                todayAttendance
              ).map(record => {
                const employee = employees.find(emp => emp.employee_id === record.employee_id);
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        record.status === 'present' ? 'bg-green-500' :
                        record.status === 'late' ? 'bg-orange-500' :
                        record.status === 'absent' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        {!isEmployee && (
                          <>
                            <div className="font-medium">{employee?.name}</div>
                            <div className="text-sm text-gray-500">{employee?.employee_id}</div>
                          </>
                        )}
                        {isEmployee && (
                          <div className="font-medium">
                            {record.status === 'present' ? 'Present' :
                             record.status === 'late' ? 'Late Arrival' :
                             record.status === 'absent' ? 'Absent' : 'On Leave'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {record.time_in} {record.time_out && `- ${record.time_out}`}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {isEmployee ? 
                          (record.total_hours ? `${record.total_hours.toFixed(1)}h worked` : 'In progress') :
                          `${record.status} • GPS verified`
                        }
                      </div>
                      {currentUser?.role === 'supervisor' && (
                        <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">
                          Approve/Edit
                        </button>
                      )}
                      {isEmployee && record.minutes_late > 0 && (
                        <button 
                          onClick={() => handleRequestCorrection(record)}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          Request Correction
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Location Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Verification</h2>
          
          <div className="space-y-4">
            {gpsLocation ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">GPS Location Ready</span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Current Location</h3>
                  <div className="text-sm text-gray-600">
                    <p>Latitude: {gpsLocation.lat.toFixed(6)}</p>
                    <p>Longitude: {gpsLocation.lng.toFixed(6)}</p>
                  </div>
                </div>

                {isEmployee && currentEmployeeRecord && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Assigned Location Today</h3>
                    {(() => {
                      const todayShift = roster.find(shift => 
                        shift.employee_id === currentEmployeeRecord.employee_id && shift.date === today
                      );
                      const shiftLocation = todayShift ? locations.find(loc => loc.name === todayShift.location) : null;
                      
                      if (shiftLocation) {
                        const isWithinRange = validateGeofence(
                          gpsLocation.lat,
                          gpsLocation.lng,
                          shiftLocation.lat,
                          shiftLocation.lng,
                          10
                        );
                        
                        return (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-700">
                              <p>{shiftLocation.name}</p>
                              <p>{shiftLocation.address}</p>
                            </div>
                            <div className={`flex items-center gap-2 ${isWithinRange ? 'text-gray-700' : 'text-gray-800'}`}>
                              {isWithinRange ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                              <span className="text-sm font-medium">
                                {isWithinRange ? 'Within range (10m)' : 'Too far from location'}
                              </span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <p className="text-sm text-gray-700">No shift assigned for today</p>
                        );
                      }
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-gray-600">
                <AlertTriangle size={20} />
                <span className="font-medium">Getting GPS location...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEmployee ? 'My Attendance History' : 'Attendance History'}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {!isEmployee && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time In/Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isEmployee ? 'Hours' : 'Method'}
                </th>
                {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isEmployee ? 
                attendance.filter(record => record.employee_id === currentEmployeeRecord?.employee_id) : 
                attendance
              ).slice(-20).reverse().map((record) => {
                const employee = employees.find(emp => emp.employee_id === record.employee_id);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {!isEmployee && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee?.name}</div>
                          <div className="text-sm text-gray-500">{employee?.employee_id}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'late' ? 'bg-orange-100 text-orange-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {record.status}
                        {record.minutes_late > 0 && ` (+${record.minutes_late}m)`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.time_in} {record.time_out && `- ${record.time_out}`}
                      {record.overtime_hours && record.overtime_hours > 0 && (
                        <div className="text-xs text-purple-600 font-medium">
                          OT: {record.overtime_hours.toFixed(1)}h
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEmployee ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.total_hours ? `${record.total_hours.toFixed(1)}h` : 'In progress'}
                          </div>
                          {record.overtime_hours && record.overtime_hours > 0 && (
                            <div className="text-xs text-purple-600">
                              {record.overtime_hours.toFixed(1)}h overtime
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                          record.checked_via === 'gps' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.checked_via === 'gps' && <MapPin size={12} />}
                          {record.checked_via === 'manual' && <Clock size={12} />}
                          {record.checked_via === 'gps' ? 'GPS VERIFIED' : 'MANUAL'}
                        </span>
                      )}
                    </td>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentUser?.role === 'supervisor' && (
                          <button 
                            onClick={() => handleApproveCorrection(record.id)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Approve
                          </button>
                        )}
                        {currentUser?.role === 'admin' && (
                          <button className="text-gray-600 hover:text-gray-900">
                            Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Check-in Modal for Admin/Supervisor */}
      {showMobileCheckin && !isEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location-Based Check-in</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
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

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">GPS Location Status</h3>
                {gpsLocation ? (
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <CheckCircle size={16} />
                      <span className="font-medium">Location verified</span>
                    </div>
                    <p>Latitude: {gpsLocation.lat.toFixed(6)}</p>
                    <p>Longitude: {gpsLocation.lng.toFixed(6)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-orange-600">Getting location...</p>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Camera & Security</h3>
                <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center mb-2">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xs text-blue-600">
                  Photo will include watermark: Employee name, timestamp, GPS coordinates
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMobileCheckin(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedEmployee) {
                      handleClockInOut(selectedEmployee);
                      setShowMobileCheckin(false);
                      setSelectedEmployee('');
                    }
                  }}
                  disabled={!gpsLocation || !selectedEmployee}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Process Check In/Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Correction Request Modal */}
      {showCorrection && correctionRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Time Correction</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Record</h3>
                <div className="text-sm space-y-1">
                  <p>Date: {new Date(correctionRecord.date).toLocaleDateString()}</p>
                  <p>Time In: {correctionRecord.time_in}</p>
                  <p>Time Out: {correctionRecord.time_out || 'Not recorded'}</p>
                  <p>Status: <span className="capitalize">{correctionRecord.status}</span></p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Correction
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please explain why this time record needs to be corrected..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCorrection(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Correction request submitted to your manager');
                    setShowCorrection(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSystem;