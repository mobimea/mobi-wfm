export interface CustomizableUILabels {
  // Main Navigation Menu (100% Customizable)
  mainNavigation: {
    dashboard: string;
    employees: string;
    attendance: string;
    roster: string;
    leaves: string;
    payroll: string;
    field: string;
    qr: string;
    ai: string;
    users: string;
    settings: string;
    company: string;
    reports: string;
    holidays: string;
    salary: string;
  };
  
  // Page Titles & Headers
  pageTitles: {
    employeeDashboard: string;
    attendanceOverview: string;
    payrollSummary: string;
    leaveManagement: string;
    rosterManagement: string;
    fieldOperations: string;
    userManagement: string;
    companySettings: string;
    holidayManagement: string;
    salaryManagement: string;
    aiAssistant: string;
    reports: string;
  };
  
  // Button Labels (Everything Customizable)
  buttons: {
    // Common Actions
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    submit: string;
    approve: string;
    reject: string;
    
    // Specific Actions
    clockIn: string;
    clockOut: string;
    requestLeave: string;
    approveLeave: string;
    generatePayslip: string;
    exportData: string;
    importData: string;
    viewDetails: string;
    createEmployee: string;
    scheduleShift: string;
  };
  
  // Form Labels & Field Names
  formLabels: {
    // Employee Form
    employeeName: string;
    employeeId: string;
    department: string;
    position: string;
    salary: string;
    email: string;
    phone: string;
    startDate: string;
    address: string;
    
    // Attendance Form  
    timeIn: string;
    timeOut: string;
    workHours: string;
    overtime: string;
    location: string;
    notes: string;
    
    // Leave Form
    leaveType: string;
    leaveStartDate: string;
    leaveEndDate: string;
    reason: string;
    duration: string;
    approver: string;
  };
  
  // Status Labels
  statusLabels: {
    // Employee Status
    active: string;
    inactive: string;
    terminated: string;
    onLeave: string;
    
    // Attendance Status
    present: string;
    absent: string;
    late: string;
    onBreak: string;
    
    // Leave Status
    pending: string;
    approved: string;
    rejected: string;
    cancelled: string;
  };
  
  // General Terms
  generalTerms: {
    employee: string; // "Employee" → "Worker", "Staff Member", "Team Member"
    employees: string; // "Employees" → "Workers", "Staff", "Team"
    manager: string; // "Manager" → "Supervisor", "Lead", "Head"
    department: string; // "Department" → "Division", "Section", "Unit"
    shift: string; // "Shift" → "Assignment", "Schedule", "Duty"
    payroll: string; // "Payroll" → "Salary", "Wages", "Compensation"
    overtime: string; // "Overtime" → "Extra Hours", "Additional Time"
    allowance: string; // "Allowance" → "Benefit", "Additional Pay"
  };
}

export interface BrandingCustomization {
  // Company Branding
  branding: {
    companyLogo?: string;
    companyName: string;
    tagline?: string;
    favicon?: string;
    loginMessage?: string;
  };
  
  // Color Scheme (Complete Theme Customization)
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    borderColor: string;
    
    // Navigation Colors
    navBackground: string;
    navText: string;
    navActive: string;
    navHover: string;
    
    // Button Colors
    primaryButton: string;
    secondaryButton: string;
    dangerButton: string;
    
    // Status Colors
    statusSuccess: string;
    statusWarning: string;
    statusError: string;
    statusInfo: string;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    headingFont?: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
      heading1: string;
      heading2: string;
      heading3: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  
  // Layout Preferences
  layout: {
    sidebarWidth: number;
    headerHeight: number;
    cardBorderRadius: number;
    spacing: 'compact' | 'comfortable' | 'spacious';
    maxWidth: string;
  };
}

export interface IndustryUITemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  
  // Pre-configured UI customizations
  labels: Partial<CustomizableUILabels>;
  branding: Partial<BrandingCustomization>;
  
  // Industry-specific terminology
  terminology: {
    // Core concepts renamed for industry
    employee: string;
    manager: string;
    department: string;
    shift: string;
    attendance: string;
    leave: string;
    payroll: string;
    overtime: string;
  };
  
  // Common customizations for this industry
  commonCustomizations: {
    navigationRenames: Record<string, string>;
    buttonLabels: Record<string, string>;
    formLabels: Record<string, string>;
    statusLabels: Record<string, string>;
  };
  
  // Suggested features for this industry
  recommendedFeatures: string[];
  
  // Sample use cases
  useCases: string[];
}

export interface UICustomizationState {
  labels: CustomizableUILabels;
  branding: BrandingCustomization;
  activeTemplate?: string;
  customizations: Record<string, any>;
  isCustomized: boolean;
  lastModified: string;
}

// Default UI Labels
export const DEFAULT_UI_LABELS: CustomizableUILabels = {
  mainNavigation: {
    dashboard: 'Dashboard',
    employees: 'Employees',
    attendance: 'Attendance',
    roster: 'Roster',
    leaves: 'Leaves',
    payroll: 'Payroll Reports',
    field: 'Field Operations',
    qr: 'QR Kiosk',
    ai: 'AI Assistant',
    users: 'User Management',
    settings: 'Admin Settings',
    company: 'Company Settings',
    reports: 'Reports',
    holidays: 'Holiday Calendar',
    salary: 'Salary Management'
  },
  
  pageTitles: {
    employeeDashboard: 'Employee Dashboard',
    attendanceOverview: 'Attendance Overview',
    payrollSummary: 'Payroll Summary',
    leaveManagement: 'Leave Management',
    rosterManagement: 'Roster Management',
    fieldOperations: 'Field Operations',
    userManagement: 'User Management',
    companySettings: 'Company Settings',
    holidayManagement: 'Holiday Management',
    salaryManagement: 'Salary Management',
    aiAssistant: 'AI Assistant',
    reports: 'Reports'
  },
  
  buttons: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    approve: 'Approve',
    reject: 'Reject',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    requestLeave: 'Request Leave',
    approveLeave: 'Approve Leave',
    generatePayslip: 'Generate Payslip',
    exportData: 'Export',
    importData: 'Import',
    viewDetails: 'View Details',
    createEmployee: 'Create Employee',
    scheduleShift: 'Schedule Shift'
  },
  
  formLabels: {
    employeeName: 'Name',
    employeeId: 'Employee ID',
    department: 'Department',
    position: 'Position',
    salary: 'Salary',
    email: 'Email',
    phone: 'Phone',
    startDate: 'Start Date',
    address: 'Address',
    timeIn: 'Time In',
    timeOut: 'Time Out',
    workHours: 'Work Hours',
    overtime: 'Overtime',
    location: 'Location',
    notes: 'Notes',
    leaveType: 'Leave Type',
    leaveStartDate: 'Start Date',
    leaveEndDate: 'End Date',
    reason: 'Reason',
    duration: 'Duration',
    approver: 'Approver'
  },
  
  statusLabels: {
    active: 'Active',
    inactive: 'Inactive',
    terminated: 'Terminated',
    onLeave: 'On Leave',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    onBreak: 'On Break',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  },
  
  generalTerms: {
    employee: 'Employee',
    employees: 'Employees',
    manager: 'Manager',
    department: 'Department',
    shift: 'Shift',
    payroll: 'Payroll',
    overtime: 'Overtime',
    allowance: 'Allowance'
  }
};

// Default Branding
export const DEFAULT_BRANDING: BrandingCustomization = {
  branding: {
    companyName: 'HR Workforce Management',
    tagline: 'Complete Management System',
    loginMessage: 'Access your workforce management dashboard'
  },
  
  colorTheme: {
    primary: '#1f2937',
    secondary: '#374151',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#f9fafb',
    cardBackground: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    borderColor: '#e5e7eb',
    navBackground: '#1e293b',
    navText: '#f1f5f9',
    navActive: '#374151',
    navHover: '#334155',
    primaryButton: '#1f2937',
    secondaryButton: '#6b7280',
    dangerButton: '#dc2626',
    statusSuccess: '#10b981',
    statusWarning: '#f59e0b',
    statusError: '#ef4444',
    statusInfo: '#3b82f6'
  },
  
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
    fontSize: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      xlarge: '1.25rem',
      heading1: '2.25rem',
      heading2: '1.875rem',
      heading3: '1.5rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '600'
    }
  },
  
  layout: {
    sidebarWidth: 256,
    headerHeight: 64,
    cardBorderRadius: 8,
    spacing: 'comfortable',
    maxWidth: '1200px'
  }
};