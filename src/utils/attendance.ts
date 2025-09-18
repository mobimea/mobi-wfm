import { AttendanceRecord, RosterEntry, Employee } from '../types';

export const calculateLateness = (shiftStart: string, actualStart: string): number => {
  const shift = new Date(`2024-01-01T${shiftStart}:00`);
  const actual = new Date(`2024-01-01T${actualStart}:00`);
  
  const diffMinutes = (actual.getTime() - shift.getTime()) / (1000 * 60);
  return Math.max(0, diffMinutes);
};

export const calculateTotalHours = (timeIn: string, timeOut: string): number => {
  const startTime = new Date(`2024-01-01T${timeIn}:00`);
  const endTime = new Date(`2024-01-01T${timeOut}:00`);
  
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
};

export const calculateOvertime = (totalHours: number): number => {
  return Math.max(0, totalHours - 8);
};

export const recordAttendance = (
  employeeId: string,
  type: 'in' | 'out',
  location: string,
  photoUrl?: string,
  recordedBy: string = 'system',
  checkedVia: 'qr' | 'gps' | 'manual' = 'manual'
): Partial<AttendanceRecord> => {
  const now = new Date();
  const time = now.toTimeString().slice(0, 5);
  const date = now.toISOString().split('T')[0];
  
  return {
    employee_id: employeeId,
    date,
    location,
    photo_url: photoUrl,
    recorded_by: recordedBy,
    checked_via: checkedVia,
    ...(type === 'in' ? { time_in: time } : { time_out: time })
  };
};

export const validateGeofence = (
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  radius: number
): boolean => {
  const R = 6371; // Earth's radius in km
  const dLat = (targetLat - currentLat) * Math.PI / 180;
  const dLng = (targetLng - currentLng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(currentLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c * 1000; // Convert to meters
  
  return distance <= radius;
};

export const generateQRToken = (): { token: string; timestamp: number; expires_at: number } => {
  const timestamp = Date.now();
  const token = btoa(`${timestamp}_${Math.random().toString(36).substr(2, 9)}`);
  
  return {
    token,
    timestamp,
    expires_at: timestamp + (15 * 60 * 1000) // 15 minutes
  };
};

export const validateQRToken = (token: string): boolean => {
  try {
    const decoded = atob(token);
    const [timestamp] = decoded.split('_');
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    
    return (now - tokenTime) < (15 * 60 * 1000); // Valid for 15 minutes
  } catch {
    return false;
  }
};

export const matchAttendanceToRoster = (
  attendance: AttendanceRecord[],
  roster: RosterEntry[]
): AttendanceRecord[] => {
  return attendance.map(record => {
    const rosterEntry = roster.find(r => 
      r.employee_id === record.employee_id && r.date === record.date
    );
    
    if (rosterEntry && record.time_in) {
      const lateness = calculateLateness(rosterEntry.shift_start, record.time_in);
      return {
        ...record,
        minutes_late: lateness,
        status: lateness > 15 ? 'late' : 'present'
      };
    }
    
    return record;
  });
};