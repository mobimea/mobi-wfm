import { SystemConfig } from '../types';

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  company: {
    name: 'HR Workforce Management',
    timezone: 'Indian/Mauritius',
    currency: 'MUR',
    country: 'Mauritius'
  },
  payroll: {
    monthly_base_salary: 17710,
    working_days_per_month: 26,
    working_hours_per_day: 8,
    overtime_rates: {
      ot_1_0: 85,   // Part-time Sunday work
      ot_1_5: 127,  // Regular overtime
      ot_2_0: 170,  // Sunday/Holiday work
      ot_3_0: 255   // Extended Sunday/Holiday work
    },
    meal_allowance: 150,
    meal_allowance_threshold: 10,
    max_overtime_hours: 60
  },
  attendance: {
    geofence_radius: 100,
    require_photos: true,
    auto_approve_adjustments: false,
    late_threshold_minutes: 15,
    grace_period_minutes: 5
  },
  leave: {
    types: {
      unpaid: {
        name: 'Unpaid Leave',
        is_paid: false,
        requires_approval: true,
        allows_partial_day: true,
        color: 'bg-red-100 text-red-800',
        icon: 'DollarSign'
      },
      unpaid_sick: {
        name: 'Unpaid Sick Leave',
        is_paid: false,
        requires_approval: true,
        allows_partial_day: false,
        color: 'bg-red-100 text-red-800',
        icon: 'AlertTriangle'
      },
      paid_local: {
        name: 'Paid Local Leave',
        is_paid: true,
        annual_quota: 5,
        requires_approval: true,
        allows_partial_day: false,
        color: 'bg-green-100 text-green-800',
        icon: 'MapPin'
      },
      paid_sick: {
        name: 'Paid Sick Leave',
        is_paid: true,
        annual_quota: 10,
        requires_approval: true,
        allows_partial_day: false,
        color: 'bg-blue-100 text-blue-800',
        icon: 'Heart'
      },
      maternity: {
        name: 'Maternity Leave',
        is_paid: true,
        annual_quota: 84,
        requires_approval: true,
        allows_partial_day: false,
        color: 'bg-pink-100 text-pink-800',
        icon: 'Baby'
      },
      paternity: {
        name: 'Paternity Leave',
        is_paid: true,
        annual_quota: 5,
        requires_approval: true,
        allows_partial_day: false,
        color: 'bg-purple-100 text-purple-800',
        icon: 'Users'
      },
      mortality: {
        name: 'Mortality Leave',
        is_paid: true,
        annual_quota: 3,
        requires_approval: false,
        allows_partial_day: false,
        color: 'bg-gray-100 text-gray-800',
        icon: 'Heart'
      },
      vacation: {
        name: 'Vacation Leave',
        is_paid: true,
        annual_quota: 28,
        requires_approval: true,
        allows_partial_day: false,
        color: 'bg-yellow-100 text-yellow-800',
        icon: 'Plane'
      }
    },
    auto_approve_paid: false,
    max_advance_days: 90,
    blackout_periods: []
  },
  transport: {
    default_rates: {
      'Promoter': 200,
      'Retail': 180,
      'Supervisor': 300,
      'HR': 280,
      'Director': 350
    },
    enable_taxi_tracking: true,
    monthly_cap: 10000
  },
  roles: {
    admin: {
      permissions: [
        'full_access',
        'user_management',
        'system_settings',
        'payroll_management',
        'reports_access',
        'employee_management'
      ],
      dashboard_widgets: [
        'total_payroll',
        'overtime_cost',
        'budget_variance',
        'employee_count',
        'pending_approvals'
      ],
      menu_access: [
        'dashboard',
        'employees',
        'user-management',
        'salary-management',
        'holiday-management',
        'roster',
        'attendance',
        'leaves',
        'reports',
        'field-ops',
        'ai-assistant',
        'admin-settings'
      ]
    },
    supervisor: {
      permissions: [
        'team_management',
        'approve_leaves',
        'view_reports',
        'schedule_management',
        'attendance_tracking'
      ],
      dashboard_widgets: [
        'team_attendance',
        'pending_leaves',
        'team_performance',
        'schedule_overview'
      ],
      menu_access: [
        'dashboard',
        'employees',
        'roster',
        'attendance',
        'leaves',
        'reports',
        'field-ops'
      ]
    },
    employee: {
      permissions: [
        'self_service',
        'view_schedule',
        'request_leave',
        'clock_in_out',
        'view_payslips'
      ],
      dashboard_widgets: [
        'my_schedule',
        'leave_balances',
        'timesheet',
        'announcements'
      ],
      menu_access: [
        'dashboard',
        'roster',
        'attendance',
        'leaves',
        'reports'
      ]
    }
  }
};

// Configuration management functions
export class ConfigManager {
  private static config: SystemConfig = { ...DEFAULT_SYSTEM_CONFIG };

  static getConfig(): SystemConfig {
    return this.config;
  }

  static updateConfig(updates: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  static resetToDefault(): void {
    this.config = { ...DEFAULT_SYSTEM_CONFIG };
  }

  static getLeaveTypes() {
    return this.config.leave.types;
  }

  static getPayrollRates() {
    return this.config.payroll;
  }

  static getTransportRates() {
    return this.config.transport;
  }

  static getRoleConfig(role: string) {
    return this.config.roles[role] || this.config.roles.employee;
  }
}