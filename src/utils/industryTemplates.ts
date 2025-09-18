import { IndustryTemplate, CompanyConfiguration } from '../types/company';

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'construction',
    name: 'Construction & Engineering',
    industry: 'construction',
    description: 'Perfect for construction companies, engineering firms, and project-based organizations',
    features: [
      'Site-based attendance with GPS verification',
      'Safety compliance tracking',
      'Equipment assignment management',
      'Weather-related leave policies',
      'Project-based cost tracking',
      'Higher transport allowances for site work'
    ],
    benefits: [
      'Ensure workers are at correct job sites',
      'Track safety incidents and compliance',
      'Manage equipment efficiently',
      'Handle weather delays automatically'
    ],
    configuration: {
      address: 'Construction Site Office',
      workingSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        workingHoursPerDay: 8,
        lunchBreakMinutes: 45,
        dinnerBreakMinutes: 30,
        teaBreakMinutes: 15,
        flexTimeAllowed: false,
        coreWorkingHours: { start: '07:00', end: '15:00' }
      },
      baseSalaryStructure: {
        defaultMonthlySalary: 25000,
        workingDaysPerMonth: 26,
        standardWorkingHours: 8,
        currency: 'MUR',
        currencySymbol: 'Rs',
        calculationMethod: 'monthly',
        minimumWage: 12000,
        salaryReviewCycle: 'annually'
      },
      overtimeRules: {
        ot1_0: { 
          enabled: true,
          rate: 120, 
          triggerHours: 0,
          triggerConditions: ['voluntary_weekend'],
          breakDeductions: ['30min lunch'],
          description: 'Voluntary weekend work'
        },
        ot1_5: { 
          enabled: true,
          rate: 150, 
          triggerHours: 8, 
          triggerConditions: ['standard_overtime'],
          breakDeductions: ['30min lunch'],
          description: 'Standard overtime after 8 hours'
        },
        ot2_0: { 
          enabled: true,
          rate: 200, 
          triggerHours: 0,
          triggers: ['weekend', 'holiday'],
          triggerConditions: ['weekend', 'holiday'],
          breakDeductions: ['45min lunch', '30min dinner if >10h'],
          description: 'Weekend and holiday work'
        },
        ot3_0: { 
          enabled: true,
          rate: 300, 
          triggerHours: 0,
          triggers: ['emergency_callout', 'night_shift'],
          triggerConditions: ['emergency_callout', 'night_shift'],
          breakDeductions: ['1h total breaks'],
          description: 'Emergency and night shift premiums'
        }
      },
      transportAllowance: {
        enabled: true,
        categories: [
          { name: 'Site Worker', dailyRate: 300, description: 'Construction site workers' },
          { name: 'Supervisor', dailyRate: 400, description: 'Site supervisors and foremen' },
          { name: 'Engineer', dailyRate: 350, description: 'Project engineers' },
          { name: 'Office Staff', dailyRate: 200, description: 'Office-based personnel' }
        ],
        taxiPolicy: 'reduced_allowance',
        monthlyCapEnabled: true,
        monthlyCap: 8000,
        gpsMandatory: true,
        receiptRequired: true
      },
      mealAllowance: {
        amount: 200,
        minimumHours: 9,
        enabled: true,
        description: 'Construction site meal allowance',
        taxable: false
      },
      leaveManagement: {
        leaveTypes: [
          {
            id: 'annual',
            name: 'Annual Leave',
            isPaid: true,
            requiresApproval: true,
            allowPartialDay: false,
            allowTimeSelection: false,
            annualQuota: 28,
            carryForward: true,
            maxCarryForwardDays: 7,
            approvalWorkflow: ['supervisor', 'admin'],
            salaryDeductionMethod: 'daily_rate',
            color: 'bg-blue-100 text-blue-800',
            icon: 'Calendar',
            description: 'Annual vacation leave'
          },
          {
            id: 'sick',
            name: 'Sick Leave',
            isPaid: true,
            requiresApproval: false,
            allowPartialDay: false,
            allowTimeSelection: false,
            annualQuota: 14,
            carryForward: false,
            medicalCertRequired: 3,
            approvalWorkflow: ['supervisor'],
            salaryDeductionMethod: 'daily_rate',
            color: 'bg-red-100 text-red-800',
            icon: 'Heart',
            description: 'Medical sick leave'
          },
          {
            id: 'safety',
            name: 'Safety Incident Leave',
            isPaid: true,
            requiresApproval: false,
            allowPartialDay: true,
            allowTimeSelection: true,
            carryForward: false,
            approvalWorkflow: [],
            salaryDeductionMethod: 'hourly_rate',
            color: 'bg-orange-100 text-orange-800',
            icon: 'Shield',
            description: 'Work-related safety incident'
          }
        ],
        unpaidLeaveCalculation: {
          divisorDays: 26,
          includeAllowances: false,
          includeOvertime: false
        },
        advanceLeaveRequests: true,
        maxAdvanceRequestDays: 90,
        blackoutPeriods: [
          { start: '12-20', end: '01-05', reason: 'Holiday season construction halt' }
        ]
      },
      attendanceSettings: {
        geofenceRadius: 50,
        lateThresholdMinutes: 10,
        gracePeriodMinutes: 5,
        requirePhotos: true,
        allowManualOverride: false,
        multipleCheckInsPerDay: true,
        autoClockOut: { enabled: true, afterHours: 12 },
        breakDeductionRules: {
          lunch: { duration: 30, threshold: 8 },
          dinner: { duration: 45, threshold: 10 },
          tea: { duration: 15, threshold: 4 }
        }
      },
      features: {
        supervisorRoster: true,
        fieldOperations: true,
        qrKiosk: false,
        aiAssistant: true,
        advancedReporting: true,
        gpsTracking: true,
        photographicVerification: true,
        shiftSwapping: true,
        performanceBonuses: true,
        mauritiusCompliance: false,
        customFields: true,
        bulkOperations: true,
        apiAccess: false,
        auditTrail: true
      },
      customFields: {
        employee: [
          { name: 'Safety Certification', type: 'dropdown', options: ['Basic', 'Advanced', 'Expert'], required: true },
          { name: 'Equipment License', type: 'text', required: false }
        ],
        attendance: [
          { name: 'Site Conditions', type: 'dropdown', options: ['Good', 'Poor Weather', 'Equipment Issues'], required: false }
        ],
        leave: []
      }
    }
  },
  
  {
    id: 'delivery',
    name: 'Delivery & Logistics',
    industry: 'delivery',
    description: 'Optimized for delivery companies, logistics providers, and courier services',
    features: [
      'Vehicle assignment tracking',
      'Route optimization integration',
      'Fuel allowance calculations',
      'Per-delivery bonus structures',
      'Real-time GPS tracking mandatory',
      'Customer delivery confirmation'
    ],
    benefits: [
      'Track delivery performance in real-time',
      'Optimize routes and reduce fuel costs',
      'Automate delivery bonuses',
      'Ensure driver safety and compliance'
    ],
    configuration: {
      address: 'Distribution Center',
      workingSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        workingHoursPerDay: 9,
        lunchBreakMinutes: 30,
        dinnerBreakMinutes: 30,
        teaBreakMinutes: 15,
        flexTimeAllowed: true,
        coreWorkingHours: { start: '08:00', end: '17:00' }
      },
      baseSalaryStructure: {
        defaultMonthlySalary: 20000,
        workingDaysPerMonth: 26,
        standardWorkingHours: 9,
        currency: 'MUR',
        currencySymbol: 'Rs',
        calculationMethod: 'monthly',
        salaryReviewCycle: 'annually'
      },
      overtimeRules: {
        ot1_0: { 
          enabled: true,
          rate: 100, 
          triggerHours: 0,
          triggerConditions: ['voluntary_extra_route'],
          breakDeductions: ['30min lunch'],
          description: 'Voluntary extra routes'
        },
        ot1_5: { 
          enabled: true,
          rate: 130, 
          triggerHours: 9, 
          triggerConditions: ['standard_overtime'],
          breakDeductions: ['30min lunch'],
          description: 'Standard delivery overtime'
        },
        ot2_0: { 
          enabled: true,
          rate: 180, 
          triggerHours: 0,
          triggers: ['weekend', 'holiday', 'express_delivery'],
          triggerConditions: ['weekend', 'holiday', 'express_delivery'],
          breakDeductions: ['30min lunch'],
          description: 'Weekend/holiday/express deliveries'
        },
        ot3_0: { 
          enabled: true,
          rate: 250, 
          triggerHours: 0,
          triggers: ['emergency_delivery', 'night_delivery'],
          triggerConditions: ['emergency_delivery', 'night_delivery'],
          breakDeductions: ['45min total'],
          description: 'Emergency and night deliveries'
        }
      },
      transportAllowance: {
        enabled: true,
        categories: [
          { name: 'Motorcycle Rider', dailyRate: 250, description: 'Motorcycle delivery riders' },
          { name: 'Van Driver', dailyRate: 350, description: 'Van and truck drivers' },
          { name: 'Warehouse Staff', dailyRate: 150, description: 'Warehouse and sorting staff' },
          { name: 'Dispatcher', dailyRate: 200, description: 'Route dispatchers' }
        ],
        taxiPolicy: 'no_allowance',
        monthlyCapEnabled: true,
        monthlyCap: 6000,
        gpsMandatory: true,
        receiptRequired: false
      },
      features: {
        supervisorRoster: true,
        fieldOperations: true,
        qrKiosk: false,
        aiAssistant: true,
        advancedReporting: true,
        gpsTracking: true,
        photographicVerification: false,
        shiftSwapping: true,
        performanceBonuses: true,
        mauritiusCompliance: false,
        customFields: true,
        bulkOperations: true,
        apiAccess: true,
        auditTrail: false
      }
    }
  },
  
  {
    id: 'manufacturing',
    name: 'Manufacturing & Production',
    industry: 'manufacturing',
    description: 'Designed for manufacturing plants, factories, and production facilities',
    features: [
      '3-shift scheduling system',
      'Production target integration',
      'Machine operator assignments',
      'Quality control tracking',
      'Safety incident reporting',
      'Productivity bonus calculations'
    ],
    benefits: [
      'Optimize production schedules',
      'Track machine efficiency',
      'Ensure safety compliance',
      'Reward productivity improvements'
    ],
    configuration: {
      address: 'Manufacturing Plant',
      workingSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHoursPerDay: 8,
        lunchBreakMinutes: 45,
        dinnerBreakMinutes: 30,
        teaBreakMinutes: 15,
        flexTimeAllowed: false,
        coreWorkingHours: { start: '06:00', end: '22:00' }
      },
      baseSalaryStructure: {
        defaultMonthlySalary: 22000,
        workingDaysPerMonth: 26,
        standardWorkingHours: 8,
        currency: 'MUR',
        currencySymbol: 'Rs',
        calculationMethod: 'monthly',
        salaryReviewCycle: 'quarterly'
      },
      overtimeRules: {
        ot1_0: { 
          enabled: true,
          rate: 110, 
          triggerHours: 0,
          triggerConditions: ['voluntary_overtime'],
          breakDeductions: ['30min lunch'],
          description: 'Voluntary extra hours'
        },
        ot1_5: { 
          enabled: true,
          rate: 140, 
          triggerHours: 8, 
          triggerConditions: ['standard_overtime'],
          breakDeductions: ['45min lunch'],
          description: 'Standard production overtime'
        },
        ot2_0: { 
          enabled: true,
          rate: 190, 
          triggerHours: 0,
          triggers: ['night_shift', 'weekend'],
          triggerConditions: ['night_shift', 'weekend'],
          breakDeductions: ['45min lunch', '30min dinner if >10h'],
          description: 'Night and weekend shifts'
        },
        ot3_0: { 
          enabled: true,
          rate: 280, 
          triggerHours: 0,
          triggers: ['emergency_production', 'holiday'],
          triggerConditions: ['emergency_production', 'holiday'],
          breakDeductions: ['1h total breaks'],
          description: 'Emergency production runs'
        }
      },
      transportAllowance: {
        enabled: true,
        categories: [
          { name: 'Production Worker', dailyRate: 180, description: 'Factory floor workers' },
          { name: 'Machine Operator', dailyRate: 220, description: 'Certified machine operators' },
          { name: 'Quality Inspector', dailyRate: 200, description: 'Quality control staff' },
          { name: 'Supervisor', dailyRate: 300, description: 'Production supervisors' },
          { name: 'Maintenance', dailyRate: 250, description: 'Maintenance technicians' }
        ],
        taxiPolicy: 'reduced_allowance',
        monthlyCapEnabled: true,
        monthlyCap: 5000,
        gpsMandatory: false,
        receiptRequired: true
      },
      features: {
        supervisorRoster: true,
        fieldOperations: false,
        qrKiosk: true,
        aiAssistant: true,
        advancedReporting: true,
        gpsTracking: false,
        photographicVerification: true,
        shiftSwapping: true,
        performanceBonuses: true,
        mauritiusCompliance: true,
        customFields: true,
        bulkOperations: true,
        apiAccess: false,
        auditTrail: true
      }
    }
  },
  
  {
    id: 'retail',
    name: 'Retail & Customer Service',
    industry: 'retail',
    description: 'Perfect for retail stores, shopping centers, and customer service operations',
    features: [
      'Flexible part-time scheduling',
      'Commission-based pay structures',
      'Customer service metrics tracking',
      'Sales target bonus calculations',
      'Inventory responsibility tracking',
      'Peak-time premium rates'
    ],
    benefits: [
      'Handle flexible retail schedules',
      'Track sales performance',
      'Reward customer service excellence',
      'Manage seasonal workforce changes'
    ],
    configuration: {
      address: 'Retail Store',
      workingSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        workingHoursPerDay: 8,
        lunchBreakMinutes: 30,
        dinnerBreakMinutes: 30,
        teaBreakMinutes: 15,
        flexTimeAllowed: true,
        coreWorkingHours: { start: '10:00', end: '18:00' }
      },
      baseSalaryStructure: {
        defaultMonthlySalary: 18000,
        workingDaysPerMonth: 26,
        standardWorkingHours: 8,
        currency: 'MUR',
        currencySymbol: 'Rs',
        calculationMethod: 'monthly',
        salaryReviewCycle: 'annually'
      },
      overtimeRules: {
        ot1_0: { 
          enabled: true,
          rate: 90, 
          triggerHours: 0,
          triggerConditions: ['part_time_weekend'],
          breakDeductions: ['15min break'],
          description: 'Part-time weekend shifts'
        },
        ot1_5: { 
          enabled: true,
          rate: 120, 
          triggerHours: 8, 
          triggerConditions: ['standard_overtime'],
          breakDeductions: ['30min lunch'],
          description: 'Standard retail overtime'
        },
        ot2_0: { 
          enabled: true,
          rate: 160, 
          triggerHours: 0,
          triggers: ['weekend', 'holiday', 'peak_season'],
          triggerConditions: ['weekend', 'holiday', 'peak_season'],
          breakDeductions: ['30min lunch'],
          description: 'Weekend and peak season work'
        },
        ot3_0: { 
          enabled: true,
          rate: 240, 
          triggerHours: 0,
          triggers: ['black_friday', 'inventory_night'],
          triggerConditions: ['black_friday', 'inventory_night'],
          breakDeductions: ['1h total breaks'],
          description: 'Special event and inventory work'
        }
      },
      transportAllowance: {
        enabled: true,
        categories: [
          { name: 'Sales Associate', dailyRate: 150, description: 'Floor sales staff' },
          { name: 'Cashier', dailyRate: 140, description: 'Checkout cashiers' },
          { name: 'Store Manager', dailyRate: 250, description: 'Store management' },
          { name: 'Security', dailyRate: 160, description: 'Security personnel' }
        ],
        taxiPolicy: 'reduced_allowance',
        monthlyCapEnabled: true,
        monthlyCap: 4000,
        gpsMandatory: false,
        receiptRequired: false
      },
      features: {
        supervisorRoster: true,
        fieldOperations: false,
        qrKiosk: true,
        aiAssistant: true,
        advancedReporting: true,
        gpsTracking: false,
        photographicVerification: false,
        shiftSwapping: true,
        performanceBonuses: true,
        mauritiusCompliance: false,
        customFields: false,
        bulkOperations: true,
        apiAccess: false,
        auditTrail: false
      }
    }
  },
  
  {
    id: 'services',
    name: 'Professional Services',
    industry: 'services',
    description: 'Ideal for consulting firms, agencies, and professional service providers',
    features: [
      'Project-based time tracking',
      'Client billing integration',
      'Flexible remote work policies',
      'Professional development tracking',
      'Performance-based compensation',
      'Meeting and travel time tracking'
    ],
    benefits: [
      'Track billable hours accurately',
      'Support remote and hybrid work',
      'Measure project profitability',
      'Reward client satisfaction'
    ],
    configuration: {
      address: 'Corporate Office',
      workingSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHoursPerDay: 8,
        lunchBreakMinutes: 60,
        dinnerBreakMinutes: 30,
        teaBreakMinutes: 15,
        flexTimeAllowed: true,
        coreWorkingHours: { start: '09:00', end: '17:00' }
      },
      baseSalaryStructure: {
        defaultMonthlySalary: 30000,
        workingDaysPerMonth: 22,
        standardWorkingHours: 8,
        currency: 'MUR',
        currencySymbol: 'Rs',
        calculationMethod: 'monthly',
        minimumWage: 18000,
        salaryReviewCycle: 'quarterly'
      },
      overtimeRules: {
        ot1_0: { 
          enabled: true,
          rate: 140, 
          triggerHours: 0,
          triggerConditions: ['training', 'development'],
          breakDeductions: ['1h lunch'],
          description: 'Training and development time'
        },
        ot1_5: { 
          enabled: true,
          rate: 180, 
          triggerHours: 8, 
          triggerConditions: ['standard_overtime'],
          breakDeductions: ['1h lunch'],
          description: 'Standard professional overtime'
        },
        ot2_0: { 
          enabled: true,
          rate: 240, 
          triggerHours: 0,
          triggers: ['client_deadline', 'weekend'],
          triggerConditions: ['client_deadline', 'weekend'],
          breakDeductions: ['1h lunch'],
          description: 'Client deadline and weekend work'
        },
        ot3_0: { 
          enabled: true,
          rate: 360, 
          triggerHours: 0,
          triggers: ['emergency_client_work'],
          triggerConditions: ['emergency_client_work'],
          breakDeductions: ['1h lunch', '30min dinner'],
          description: 'Emergency client support'
        }
      },
      transportAllowance: {
        enabled: true,
        categories: [
          { name: 'Consultant', dailyRate: 400, description: 'Senior consultants' },
          { name: 'Analyst', dailyRate: 300, description: 'Business analysts' },
          { name: 'Project Manager', dailyRate: 450, description: 'Project managers' },
          { name: 'Support Staff', dailyRate: 200, description: 'Administrative support' }
        ],
        taxiPolicy: 'full_allowance',
        monthlyCapEnabled: true,
        monthlyCap: 12000,
        gpsMandatory: false,
        receiptRequired: true
      },
      features: {
        supervisorRoster: true,
        fieldOperations: false,
        qrKiosk: false,
        aiAssistant: true,
        advancedReporting: true,
        gpsTracking: false,
        photographicVerification: false,
        shiftSwapping: true,
        performanceBonuses: true,
        mauritiusCompliance: false,
        customFields: true,
        bulkOperations: false,
        apiAccess: true,
        auditTrail: true
      }
    }
  },
  
  {
    id: 'mauritius_standard',
    name: 'Mauritius Standard Template',
    industry: 'other',
    description: 'Pre-configured for Mauritius labor laws, tax compliance, and local business practices',
    features: [
      'Full Mauritius labor law compliance',
      'NPF, NSF, CSG automatic calculations',
      '13th month salary tracking',
      'End-of-year bonus calculations',
      'Mauritius public holidays pre-loaded',
      'Local currency and date formats'
    ],
    benefits: [
      'Instant compliance with Mauritius laws',
      'Automatic tax calculations',
      'Pre-loaded public holidays',
      'Local business practices built-in'
    ],
    configuration: {
      address: 'Port Louis, Mauritius',
      workingSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHoursPerDay: 8,
        lunchBreakMinutes: 60,
        dinnerBreakMinutes: 30,
        teaBreakMinutes: 15,
        flexTimeAllowed: true,
        coreWorkingHours: { start: '09:00', end: '17:00' }
      },
      baseSalaryStructure: {
        defaultMonthlySalary: 17710, // Current Mauritius rate
        workingDaysPerMonth: 26,
        standardWorkingHours: 8,
        currency: 'MUR',
        currencySymbol: 'Rs',
        calculationMethod: 'monthly',
        minimumWage: 11000, // Mauritius minimum wage
        salaryReviewCycle: 'annually'
      },
      overtimeRules: {
        ot1_0: { 
          enabled: true,
          rate: 85, 
          triggerHours: 0,
          triggerConditions: ['part_time_sunday'],
          breakDeductions: ['30min lunch'],
          description: 'Part-time Sunday work (Mauritius compliant)'
        },
        ot1_5: { 
          enabled: true,
          rate: 127, 
          triggerHours: 8, 
          triggerConditions: ['standard_overtime'],
          breakDeductions: ['30min lunch'],
          description: 'Standard overtime (Mauritius compliant)'
        },
        ot2_0: { 
          enabled: true,
          rate: 170, 
          triggerHours: 0,
          triggers: ['weekend', 'holiday'],
          triggerConditions: ['weekend', 'holiday'],
          breakDeductions: ['30min lunch'],
          description: 'Weekend/holiday work (Mauritius compliant)'
        },
        ot3_0: { 
          enabled: true,
          rate: 255, 
          triggerHours: 0,
          triggers: ['extended_weekend', 'extended_holiday'],
          triggerConditions: ['extended_weekend', 'extended_holiday'],
          breakDeductions: ['1h total breaks'],
          description: 'Extended weekend/holiday work'
        }
      },
      transportAllowance: {
        enabled: true,
        categories: [
          { name: 'Promoter', dailyRate: 200, description: 'Promotional staff' },
          { name: 'Retail', dailyRate: 180, description: 'Retail workers' },
          { name: 'Supervisor', dailyRate: 300, description: 'Supervisory roles' },
          { name: 'HR', dailyRate: 280, description: 'HR staff' },
          { name: 'Director', dailyRate: 350, description: 'Management staff' }
        ],
        taxiPolicy: 'reduced_allowance',
        monthlyCapEnabled: true,
        monthlyCap: 10000,
        gpsMandatory: true,
        receiptRequired: false
      },
      mealAllowance: {
        amount: 150, // Current Mauritius rate
        minimumHours: 10,
        enabled: true,
        description: 'Meal allowance for long shifts',
        taxable: false
      },
      features: {
        supervisorRoster: true,
        fieldOperations: true,
        qrKiosk: true,
        aiAssistant: true,
        advancedReporting: true,
        gpsTracking: true,
        photographicVerification: true,
        shiftSwapping: true,
        performanceBonuses: true,
        mauritiusCompliance: true,
        customFields: false,
        bulkOperations: true,
        apiAccess: false,
        auditTrail: true
      },
      
      // Mauritius-specific settings
      mauritiusSettings: {
        enabled: true,
        statutoryContributions: {
          employeeNPF: { enabled: true, rate: 3.0 },
          employeeNSF: { enabled: true, rate: 2.5 },
          employeeCSG: { enabled: true, rate: 1.0 },
          employerNPF: { enabled: true, rate: 6.0 },
          employerNSF: { enabled: true, rate: 2.5 },
          employerCSG: { enabled: true, rate: 2.0 },
          trainingLevy: { enabled: true, rate: 1.5 }
        },
        thirteenthSalary: {
          enabled: true,
          paymentMonth: 12, // December
          calculationBase: 'basic_salary',
          proRated: true
        },
        eyb: {
          enabled: true,
          minimumServiceMonths: 12,
          calculationFormula: 'basic_salary / 12'
        },
        overtimeLimits: {
          maxOvertimePerWeek: 10,
          maxOvertimePerMonth: 60,
          enforceCompliance: true
        }
      }
    }
  }
];

export const getIndustryTemplate = (industryId: string): IndustryTemplate | null => {
  return INDUSTRY_TEMPLATES.find(template => template.id === industryId) || null;
};

export const createCompanyConfigFromTemplate = (
  template: IndustryTemplate,
  companyName: string,
  employeeCount: number
): CompanyConfiguration => {
  const baseConfig: CompanyConfiguration = {
    id: `company_${Date.now()}`,
    companyName,
    industry: template.industry,
    employeeCount,
    primaryColor: '#1f2937',
    address: template.configuration.address || 'Company Address',
    
    // Working Schedule
    workingSchedule: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHoursPerDay: 8,
      lunchBreakMinutes: 30,
      dinnerBreakMinutes: 30,
      teaBreakMinutes: 15,
      flexTimeAllowed: false,
      coreWorkingHours: { start: '09:00', end: '17:00' },
      ...(template.configuration.workingSchedule || {})
    },
    
    // Default structure - will be overridden by template
    baseSalaryStructure: {
      defaultMonthlySalary: 17710,
      workingDaysPerMonth: 26,
      standardWorkingHours: 8,
      currency: 'MUR',
      currencySymbol: 'Rs',
      calculationMethod: 'monthly',
      salaryReviewCycle: 'annually',
      ...(template.configuration.baseSalaryStructure || {})
    },
    
    overtimeRules: {
      ot1_0: { 
        enabled: true,
        rate: 85, 
        triggerHours: 0,
        triggerConditions: ['part_time_sunday'],
        breakDeductions: ['30min lunch'],
        description: 'Part-time Sunday work'
      },
      ot1_5: { 
        enabled: true,
        rate: 127, 
        triggerHours: 8, 
        triggerConditions: ['standard_overtime'],
        breakDeductions: ['30min lunch'],
        description: 'Standard overtime'
      },
      ot2_0: { 
        enabled: true,
        rate: 170, 
        triggerHours: 0,
        triggers: ['weekend', 'holiday'],
        triggerConditions: ['weekend', 'holiday'],
        breakDeductions: ['30min lunch'],
        description: 'Weekend/holiday work'
      },
      ot3_0: { 
        enabled: true,
        rate: 255, 
        triggerHours: 0,
        triggers: ['extended_weekend', 'extended_holiday'],
        triggerConditions: ['extended_weekend', 'extended_holiday'],
        breakDeductions: ['1h total breaks'],
        description: 'Extended weekend/holiday work'
      }
    },
    
    mealAllowance: {
      amount: 150,
      minimumHours: 10,
      enabled: true,
      description: 'Meal allowance for extended shifts',
      taxable: false
    },
    
    transportAllowance: {
      enabled: true,
      categories: [
        { name: 'Promoter', dailyRate: 200, description: 'Promotional staff' },
        { name: 'Retail', dailyRate: 180, description: 'Retail workers' },
        { name: 'Supervisor', dailyRate: 300, description: 'Supervisory roles' },
        { name: 'Management', dailyRate: 350, description: 'Management staff' }
      ],
      taxiPolicy: 'reduced_allowance',
      monthlyCapEnabled: true,
      monthlyCap: 10000,
      gpsMandatory: false,
      receiptRequired: false
    },
    
    leaveManagement: {
      leaveTypes: [
        {
          id: 'unpaid',
          name: 'Unpaid Leave',
          isPaid: false,
          requiresApproval: true,
          allowPartialDay: true,
          allowTimeSelection: true,
          carryForward: false,
          approvalWorkflow: ['supervisor'],
          salaryDeductionMethod: 'hourly_rate',
          color: 'bg-red-100 text-red-800',
          icon: 'DollarSign',
          description: 'Unpaid leave with salary deduction'
        },
        {
          id: 'paid_local',
          name: 'Paid Local Leave',
          isPaid: true,
          annualQuota: 5,
          requiresApproval: true,
          allowPartialDay: false,
          allowTimeSelection: false,
          carryForward: false,
          approvalWorkflow: ['supervisor'],
          salaryDeductionMethod: 'daily_rate',
          color: 'bg-green-100 text-green-800',
          icon: 'MapPin',
          description: 'Paid local leave days'
        },
        {
          id: 'vacation',
          name: 'Annual Vacation',
          isPaid: true,
          annualQuota: 28,
          requiresApproval: true,
          allowPartialDay: false,
          allowTimeSelection: false,
          carryForward: true,
          maxCarryForwardDays: 7,
          approvalWorkflow: ['supervisor', 'admin'],
          salaryDeductionMethod: 'daily_rate',
          color: 'bg-blue-100 text-blue-800',
          icon: 'Plane',
          description: 'Annual vacation leave'
        }
      ],
      unpaidLeaveCalculation: {
        divisorDays: 26,
        includeAllowances: false,
        includeOvertime: false
      },
      advanceLeaveRequests: true,
      maxAdvanceRequestDays: 90,
      blackoutPeriods: []
    },
    
    attendanceSettings: {
      geofenceRadius: 100,
      lateThresholdMinutes: 15,
      gracePeriodMinutes: 5,
      requirePhotos: true,
      allowManualOverride: true,
      multipleCheckInsPerDay: false,
      autoClockOut: { enabled: false, afterHours: 12 },
      breakDeductionRules: {
        lunch: { duration: 30, threshold: 8 },
        dinner: { duration: 30, threshold: 10 },
        tea: { duration: 15, threshold: 4 }
      }
    },
    
    features: {
      supervisorRoster: true,
      fieldOperations: true,
      qrKiosk: true,
      aiAssistant: true,
      advancedReporting: true,
      gpsTracking: true,
      photographicVerification: true,
      shiftSwapping: true,
      performanceBonuses: true,
      mauritiusCompliance: false,
      customFields: false,
      bulkOperations: false,
      apiAccess: false,
      auditTrail: false
    },
    
    customFields: {
      employee: [],
      attendance: [],
      leave: []
    },
    
    workflows: {
      leaveApproval: {
        steps: [{ role: 'supervisor', canSkip: false }],
        escalation: [{ afterDays: 3, toRole: 'admin' }]
      },
      overtimeApproval: {
        required: false,
        threshold: 10,
        approver: 'supervisor'
      },
      attendanceCorrection: {
        allowSelfCorrection: true,
        requireManagerApproval: true,
        maxDaysBack: 7
      }
    },
    
    localization: {
      currency: 'MUR',
      currencySymbol: 'Rs',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weekStart: 'monday',
      timezone: 'Indian/Mauritius',
      language: 'en',
      numberFormat: 'US',
      fiscalYearStart: 1
    },
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  };

  // Deep merge template configuration
  return {
    ...baseConfig,
    ...template.configuration,
    // Deep merge nested objects
    workingSchedule: { ...baseConfig.workingSchedule, ...(template.configuration.workingSchedule || {}) },
    baseSalaryStructure: { ...baseConfig.baseSalaryStructure, ...(template.configuration.baseSalaryStructure || {}) },
    overtimeRules: { ...baseConfig.overtimeRules, ...(template.configuration.overtimeRules || {}) },
    mealAllowance: { ...baseConfig.mealAllowance, ...(template.configuration.mealAllowance || {}) },
    transportAllowance: { ...baseConfig.transportAllowance, ...(template.configuration.transportAllowance || {}) },
    leaveManagement: { ...baseConfig.leaveManagement, ...(template.configuration.leaveManagement || {}) },
    attendanceSettings: { ...baseConfig.attendanceSettings, ...(template.configuration.attendanceSettings || {}) },
    features: { ...baseConfig.features, ...(template.configuration.features || {}) },
    localization: { ...baseConfig.localization, ...(template.configuration.localization || {}) },
    customFields: { ...baseConfig.customFields, ...(template.configuration.customFields || {}) },
    workflows: { ...baseConfig.workflows, ...(template.configuration.workflows || {}) },
    // Ensure some fields aren't overwritten
    id: baseConfig.id,
    companyName: baseConfig.companyName,
    employeeCount: baseConfig.employeeCount,
    createdAt: baseConfig.createdAt,
    updatedAt: baseConfig.updatedAt,
    createdBy: baseConfig.createdBy
  };
};

export const getDefaultLeaveTypes = (industry: CompanyConfiguration['industry']) => {
  const baseLeaveTypes = [
    {
      id: 'unpaid',
      name: 'Unpaid Leave',
      isPaid: false,
      requiresApproval: true,
      allowPartialDay: true,
      carryForward: false,
      color: 'bg-red-100 text-red-800',
      icon: 'DollarSign'
    },
    {
      id: 'paid_sick',
      name: 'Paid Sick Leave',
      isPaid: true,
      annualQuota: 10,
      requiresApproval: true,
      allowPartialDay: false,
      carryForward: false,
      color: 'bg-blue-100 text-blue-800',
      icon: 'Heart'
    },
    {
      id: 'vacation',
      name: 'Annual Vacation',
      isPaid: true,
      annualQuota: 28,
      requiresApproval: true,
      allowPartialDay: false,
      carryForward: true,
      color: 'bg-yellow-100 text-yellow-800',
      icon: 'Plane'
    }
  ];

  // Industry-specific additional leave types
  switch (industry) {
    case 'construction':
      return [
        ...baseLeaveTypes,
        {
          id: 'weather_delay',
          name: 'Weather Delay',
          isPaid: true,
          requiresApproval: false,
          allowPartialDay: true,
          carryForward: false,
          color: 'bg-gray-100 text-gray-800',
          icon: 'Cloud'
        },
        {
          id: 'safety_incident',
          name: 'Safety Incident Leave',
          isPaid: true,
          requiresApproval: false,
          allowPartialDay: false,
          carryForward: false,
          color: 'bg-orange-100 text-orange-800',
          icon: 'Shield'
        }
      ];
      
    case 'delivery':
      return [
        ...baseLeaveTypes,
        {
          id: 'vehicle_breakdown',
          name: 'Vehicle Breakdown',
          isPaid: true,
          requiresApproval: false,
          allowPartialDay: true,
          carryForward: false,
          color: 'bg-orange-100 text-orange-800',
          icon: 'Truck'
        }
      ];
      
    default:
      return baseLeaveTypes;
  }
};