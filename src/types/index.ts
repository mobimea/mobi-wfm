export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: 'Promoter' | 'Retail' | 'Supervisor' | 'HR' | 'Director';
  phone: string;
  start_date: string;
  primary_location_id?: string;
  status: 'employed' | 'unemployed' | 'temporary';
  monthly_salary?: number; // Override default monthly salary for this employee
  hourly_rate?: number; // Hourly rate for this employee
  transport_daily_rate?: number; // Custom rate per employee
  transport_category?: string;
  leave_balances?: {
    paid_local: number;
    paid_sick: number;
    vacation: number;
    maternity?: number;
    paternity?: number;
    // Unpaid leaves don't have balance limits
  };
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'public' | 'national' | 'religious' | 'company';
  is_paid: boolean;
  applies_to: 'all' | 'specific_departments' | 'specific_locations';
  departments?: string[];
  locations?: string[];
  description: string;
  recurring_annually: boolean;
  created_by: string;
  created_date: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  time_in?: string;
  time_out?: string;
  minutes_late: number;
  location: string;
  photo_url?: string;
  recorded_by: string;
  checked_via: 'qr' | 'gps' | 'manual';
  total_hours?: number;
  overtime_hours?: number;
}

export interface RosterEntry {
  id: string;
  employee_id: string;
  date: string;
  shift_start: string;
  shift_end: string;
  location: string;
  recurring: boolean;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: 'unpaid' | 'unpaid_sick' | 'paid_local' | 'paid_sick' | 'maternity' | 'paternity' | 'mortality' | 'vacation';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  start_time?: string; // For partial day leaves
  end_time?: string;   // For partial day leaves
  total_days: number;
  total_hours?: number; // For partial day leaves
  salary_deduction: number; // Calculated automatically
  approved_by?: string;
  approved_date?: string;
  applied_date: string;
  documents?: string[]; // Medical certificates, etc.
}

export interface TransportAllowance {
  employee_id: string;
  daily_rate: number; // Based on staff category
  working_days: number;
  taxi_usage_days: number;
  total_allowance: number;
  month: string;
  year: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  geofence_radius: number;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  operating_hours?: string;
  status?: 'active' | 'inactive';
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'employee';
  employee_id?: string;
  department?: string;
}

export interface SystemConfig {
  company: {
    name: string;
    timezone: string;
    currency: string;
    country: string;
  };
  payroll: {
    monthly_base_salary: number;
    working_days_per_month: number;
    working_hours_per_day: number;
    overtime_rates: {
      ot_1_0: number;
      ot_1_5: number;
      ot_2_0: number;
      ot_3_0: number;
    };
    meal_allowance: number;
    meal_allowance_threshold: number;
    max_overtime_hours: number;
  };
  attendance: {
    geofence_radius: number;
    require_photos: boolean;
    auto_approve_adjustments: boolean;
    late_threshold_minutes: number;
    grace_period_minutes: number;
  };
  leave: {
    types: {
      [key: string]: {
        name: string;
        is_paid: boolean;
        annual_quota?: number;
        requires_approval: boolean;
        allows_partial_day: boolean;
        color: string;
        icon: string;
      };
    };
    auto_approve_paid: boolean;
    max_advance_days: number;
    blackout_periods: string[];
  };
  transport: {
    default_rates: {
      [position: string]: number;
    };
    enable_taxi_tracking: boolean;
    monthly_cap: number;
  };
  roles: {
    [role: string]: {
      permissions: string[];
      dashboard_widgets: string[];
      menu_access: string[];
    };
  };
}

export interface QRToken {
  token: string;
  timestamp: number;
  expires_at: number;
}

export interface PayrollRecord {
  employee_id: string;
  name: string;
  position: string;
  department: string;
  regular_hours: number;
  overtime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  total_pay: number;
  days_present: number;
  days_late: number;
  days_absent: number;
  meal_allowance: number;
  transport_allowance?: number;
  leave_deduction?: number;
  adjusted_base_salary?: number;
}
