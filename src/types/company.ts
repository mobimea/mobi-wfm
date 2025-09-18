export interface CompanyConfiguration {
  // Basic Info
  id: string;
  companyName: string;
  industry: string; // Allow custom industries
  employeeCount: number;
  logo?: string;
  primaryColor: string;
  address: string;
  
  // Working Schedule Configuration
  workingSchedule: {
    workingDays: string[]; // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    workingHoursPerDay: number; // Default 8
    lunchBreakMinutes: number; // Default 30
    dinnerBreakMinutes: number; // Default 30
    teaBreakMinutes: number; // Default 15
    flexTimeAllowed: boolean;
    coreWorkingHours: { start: string; end: string; };
  };
  
  // Payroll Configuration  
  baseSalaryStructure: {
    defaultMonthlySalary: number;
    workingDaysPerMonth: number;
    standardWorkingHours: number;
    currency: string;
    currencySymbol: string;
    calculationMethod: 'monthly' | 'daily' | 'hourly';
    minimumWage?: number;
    salaryReviewCycle: 'monthly' | 'quarterly' | 'annually';
  };
  
  // Overtime Rules (Customizable)
  overtimeRules: {
    ot1_5: { 
      rate: number; 
      triggerHours: number; 
      breakDeductions: string[];
      description: string;
    };
    ot2_0: { 
      rate: number; 
      triggers: string[];
      enabled: boolean;
      breakDeductions: string[];
      description: string;
    };
    ot3_0: { 
      triggerConditions: string[];
      rate: number; 
      triggers: string[];
      enabled: boolean;
      breakDeductions: string[];
      description: string;
    };
    ot1_0: { 
      triggerConditions: string[];
      enabled: boolean;
      rate: number;
      enabled: boolean;
      triggers: string[];
      breakDeductions: string[];
      description: string;
      triggerConditions: string[];
      triggerConditions: string[];
    };
  };
  
  // Meal & Transport
  mealAllowance: { 
    amount: number; 
    minimumHours: number;
    enabled: boolean;
    description: string;
    taxable: boolean;
  };
  
  transportAllowance: {
    enabled: boolean;
    categories: { name: string; dailyRate: number; description: string; }[];
    taxiPolicy: 'no_allowance' | 'reduced_allowance' | 'full_allowance';
    monthlyCapEnabled: boolean;
    monthlyCap: number;
    gpsMandatory: boolean;
    receiptRequired: boolean;
  };
  
  // Leave Configuration
  leaveManagement: {
    leaveTypes: {
      id: string;
      name: string;
      isPaid: boolean;
      requiresApproval: boolean;
      allowPartialDay: boolean;
      allowTimeSelection: boolean;
      annualQuota?: number;
      carryForward: boolean;
      maxCarryForwardDays?: number;
      medicalCertRequired?: number;
      approvalWorkflow: string[];
      salaryDeductionMethod: 'daily_rate' | 'hourly_rate' | 'custom';
      color: string;
      icon: string;
      description: string;
    }[];
    
    // Unpaid leave calculation settings
    unpaidLeaveCalculation: {
      divisorDays: number; // Currently 26
      includeAllowances: boolean;
      includeOvertime: boolean;
    };
    
    // Advanced leave settings
    advanceLeaveRequests: boolean;
    maxAdvanceRequestDays: number;
    blackoutPeriods: { start: string; end: string; reason: string; }[];
  };
  
  // Features Toggle
  features: {
    supervisorRoster: boolean;
    fieldOperations: boolean;
    qrKiosk: boolean;
    aiAssistant: boolean;
    advancedReporting: boolean;
    gpsTracking: boolean;
    photographicVerification: boolean;
    shiftSwapping: boolean;
    performanceBonuses: boolean;
    mauritiusCompliance: boolean;
    customFields: boolean;
    bulkOperations: boolean;
    apiAccess: boolean;
    auditTrail: boolean;
  };
  
  // Mauritius Compliance (Optional Module)
  mauritiusSettings?: {
    enabled: boolean;
    
    // Statutory Contributions
    statutoryContributions: {
      employeeNPF: { enabled: boolean; rate: number; }; // 3%
      employeeNSF: { enabled: boolean; rate: number; }; // 2.5%
      employeeCSG: { enabled: boolean; rate: number; }; // 1%
      employerNPF: { enabled: boolean; rate: number; }; // 6%
      employerNSF: { enabled: boolean; rate: number; }; // 2.5%
      employerCSG: { enabled: boolean; rate: number; }; // 2%
      trainingLevy: { enabled: boolean; rate: number; }; // 1.5%
    };
    
    // 13th Month Salary
    thirteenthSalary: {
      enabled: boolean;
      paymentMonth: number;
      calculationBase: 'basic_salary' | 'total_earnings';
      proRated: boolean;
    };
    
    // End of Year Bonus
    eyb: {
      enabled: boolean;
      minimumServiceMonths: number; // Default 12
      calculationFormula: string;
    };
    
    // Overtime Limits (Mauritius Law)
    overtimeLimits: {
      maxOvertimePerWeek: number; // 10 hours per law
      maxOvertimePerMonth: number; // 60 hours per law
      enforceCompliance: boolean;
    };
  };
  
  // Attendance Configuration
  attendanceSettings: {
    geofenceRadius: number;
    lateThresholdMinutes: number;
    gracePeriodMinutes: number;
    requirePhotos: boolean;
    allowManualOverride: boolean;
    multipleCheckInsPerDay: boolean;
    autoClockOut: { enabled: boolean; afterHours: number; };
    breakDeductionRules: {
      lunch: { duration: number; threshold: number; };
      dinner: { duration: number; threshold: number; };
      tea: { duration: number; threshold: number; };
    };
  };
  
  // Localization
  localization: {
    currency: string;
    currencySymbol: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    weekStart: 'sunday' | 'monday';
    timezone: string;
    language: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ar';
    numberFormat: 'US' | 'EU' | 'IN'; // 1,000.00 vs 1.000,00 vs 1,00,000.00
    fiscalYearStart: number; // Month (1-12)
  };
  
  // Custom Fields
  customFields: {
    employee: { name: string; type: 'text' | 'number' | 'date' | 'dropdown'; options?: string[]; required: boolean; }[];
    attendance: { name: string; type: string; required: boolean; }[];
    leave: { name: string; type: string; required: boolean; }[];
  };
  
  // Workflow Configuration
  workflows: {
    leaveApproval: {
      steps: { role: string; canSkip: boolean; autoApprove?: string[]; }[];
      escalation: { afterDays: number; toRole: string; }[];
    };
    overtimeApproval: {
      required: boolean;
      threshold: number; // Hours after which approval needed
      approver: string;
    };
    attendanceCorrection: {
      allowSelfCorrection: boolean;
      requireManagerApproval: boolean;
      maxDaysBack: number;
    };
  };
  
  // Created/Updated
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CustomRole {
  id: string;
  roleName: string;
  displayName: string;
  companyId: string;
  permissions: {
    employeeManagement: 'none' | 'view' | 'edit' | 'full';
    attendance: 'own' | 'team' | 'department' | 'all';
    payroll: 'none' | 'view' | 'process' | 'full';
    reporting: 'basic' | 'advanced' | 'full';
    systemSettings: boolean;
    scheduling: 'none' | 'view' | 'edit' | 'full';
    leaveManagement: 'own' | 'approve' | 'full';
  };
  canApprove: string[]; // leave, overtime, expenses, schedule_changes, etc.
  dashboardWidgets: string[];
  menuAccess: string[];
  isSystemRole: boolean; // true for admin, supervisor, employee
  createdAt: string;
  updatedAt: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: CompanyConfiguration['industry'];
  description: string;
  configuration: Partial<CompanyConfiguration>;
  features: string[];
  benefits: string[];
}

export interface CompanySetupStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
}