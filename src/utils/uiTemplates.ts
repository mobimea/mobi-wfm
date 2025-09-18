import { IndustryUITemplate, CustomizableUILabels, BrandingCustomization } from '../types/uiCustomization';

export const INDUSTRY_UI_TEMPLATES: IndustryUITemplate[] = [
  {
    id: 'construction',
    name: 'Construction & Engineering',
    industry: 'construction',
    description: 'Perfect for construction sites, engineering firms, and project-based work',
    
    labels: {
      mainNavigation: {
        dashboard: 'Site Dashboard',
        employees: 'Workers',
        attendance: 'Site Attendance', 
        roster: 'Work Assignments',
        leaves: 'Time Off',
        payroll: 'Payroll',
        field: 'Site Operations',
        qr: 'Site Check-In',
        ai: 'Site Analytics',
        users: 'Access Control',
        settings: 'Site Settings',
        company: 'Company Config',
        reports: 'Project Reports',
        holidays: 'Work Calendar',
        salary: 'Wage Management'
      },
      
      formLabels: {
        employeeName: 'Worker Name',
        employeeId: 'Worker ID',
        department: 'Trade/Skill',
        position: 'Skill Level',
        salary: 'Daily Rate',
        timeIn: 'Site Arrival',
        timeOut: 'Site Departure',
        workHours: 'Hours Worked',
        overtime: 'Extra Hours',
        location: 'Job Site',
        leaveType: 'Time Off Type'
      },
      
      statusLabels: {
        active: 'Working',
        inactive: 'Not Working',
        present: 'On Site',
        absent: 'Off Site',
        late: 'Late Arrival'
      },
      
      generalTerms: {
        employee: 'Worker',
        employees: 'Workers', 
        manager: 'Site Supervisor',
        department: 'Trade',
        shift: 'Work Assignment',
        payroll: 'Wages',
        overtime: 'Extra Hours',
        allowance: 'Site Allowance'
      }
    },
    
    branding: {
      colorTheme: {
        primary: '#f97316', // Construction orange
        secondary: '#ea580c',
        accent: '#fb923c',
        navBackground: '#9a3412',
        navActive: '#ea580c'
      }
    },
    
    terminology: {
      employee: 'Worker',
      manager: 'Site Supervisor', 
      department: 'Trade',
      shift: 'Work Assignment',
      attendance: 'Site Attendance',
      leave: 'Time Off',
      payroll: 'Wages',
      overtime: 'Extra Hours'
    },
    
    commonCustomizations: {
      navigationRenames: {
        'employees': 'Workers',
        'attendance': 'Site Attendance',
        'roster': 'Work Assignments'
      },
      buttonLabels: {
        'clockIn': 'Arrive at Site',
        'clockOut': 'Leave Site'
      },
      formLabels: {
        'employeeName': 'Worker Name',
        'department': 'Trade/Skill'
      },
      statusLabels: {
        'present': 'On Site',
        'absent': 'Off Site'
      }
    },
    
    recommendedFeatures: [
      'gpsTracking',
      'photographicVerification', 
      'fieldOperations',
      'advancedReporting'
    ],
    
    useCases: [
      'Track workers across multiple job sites',
      'Ensure safety compliance with photo verification',
      'Manage skilled trades and certifications',
      'Calculate site-specific allowances'
    ]
  },
  
  {
    id: 'hospitality',
    name: 'Hospitality & Tourism',
    industry: 'hospitality',
    description: 'Designed for hotels, restaurants, and tourism businesses',
    
    labels: {
      mainNavigation: {
        dashboard: 'Front Desk',
        employees: 'Staff Directory',
        attendance: 'Duty Hours',
        roster: 'Shift Schedule',
        leaves: 'Leave Requests',
        payroll: 'Staff Payroll',
        field: 'Service Areas',
        qr: 'Staff Check-In',
        ai: 'Guest Analytics',
        users: 'Staff Access',
        settings: 'Hotel Settings',
        company: 'Property Config',
        reports: 'Service Reports',
        holidays: 'Calendar',
        salary: 'Staff Wages'
      },
      
      formLabels: {
        employeeName: 'Staff Name',
        employeeId: 'Staff Number',
        department: 'Service Area',
        position: 'Role',
        salary: 'Base Pay',
        timeIn: 'Duty Start',
        timeOut: 'Duty End',
        workHours: 'Service Hours',
        overtime: 'Extended Hours',
        location: 'Service Location',
        leaveType: 'Leave Category'
      },
      
      statusLabels: {
        active: 'On Duty',
        inactive: 'Off Duty',
        present: 'Serving',
        absent: 'Not Available',
        late: 'Delayed'
      },
      
      generalTerms: {
        employee: 'Staff Member',
        employees: 'Staff',
        manager: 'Supervisor',
        department: 'Service Area',
        shift: 'Duty Period',
        payroll: 'Staff Pay',
        overtime: 'Extended Service',
        allowance: 'Service Allowance'
      }
    },
    
    branding: {
      colorTheme: {
        primary: '#7c3aed', // Hospitality purple
        secondary: '#6d28d9',
        accent: '#a78bfa',
        navBackground: '#581c87',
        navActive: '#6d28d9'
      }
    },
    
    terminology: {
      employee: 'Staff Member',
      manager: 'Supervisor',
      department: 'Service Area', 
      shift: 'Duty Period',
      attendance: 'Duty Hours',
      leave: 'Leave Request',
      payroll: 'Staff Pay',
      overtime: 'Extended Service'
    },
    
    commonCustomizations: {
      navigationRenames: {
        'employees': 'Staff Directory',
        'attendance': 'Duty Hours',
        'roster': 'Shift Schedule'
      },
      buttonLabels: {
        'clockIn': 'Start Duty',
        'clockOut': 'End Duty'
      },
      formLabels: {
        'employeeName': 'Staff Name',
        'department': 'Service Area'
      },
      statusLabels: {
        'present': 'On Duty',
        'absent': 'Off Duty'
      }
    },
    
    recommendedFeatures: [
      'shiftSwapping',
      'qrKiosk',
      'performanceBonuses',
      'advancedReporting'
    ],
    
    useCases: [
      'Manage front desk and housekeeping staff',
      'Track service hours and guest interaction time', 
      'Handle seasonal workforce changes',
      'Calculate tips and service charge distribution'
    ]
  },
  
  {
    id: 'manufacturing',
    name: 'Manufacturing & Production',
    industry: 'manufacturing', 
    description: 'Perfect for factories, production lines, and manufacturing facilities',
    
    labels: {
      mainNavigation: {
        dashboard: 'Production Control',
        employees: 'Operators',
        attendance: 'Shift Tracking',
        roster: 'Shift Planning',
        leaves: 'Absence Management',
        payroll: 'Operator Pay',
        field: 'Production Floor',
        qr: 'Shift Clock',
        ai: 'Production Analytics',
        users: 'System Access',
        settings: 'Plant Settings',
        company: 'Facility Config',
        reports: 'Production Reports',
        holidays: 'Production Calendar',
        salary: 'Wage Administration'
      },
      
      formLabels: {
        employeeName: 'Operator Name',
        employeeId: 'Operator ID',
        department: 'Production Line',
        position: 'Operator Level',
        salary: 'Shift Rate',
        timeIn: 'Shift Start',
        timeOut: 'Shift End',
        workHours: 'Production Hours',
        overtime: 'Extended Shift',
        location: 'Production Line',
        leaveType: 'Absence Type'
      },
      
      statusLabels: {
        active: 'Operating',
        inactive: 'Not Operating',
        present: 'On Line',
        absent: 'Off Line',
        late: 'Delayed Start'
      },
      
      generalTerms: {
        employee: 'Operator',
        employees: 'Operators',
        manager: 'Line Supervisor',
        department: 'Production Line',
        shift: 'Production Shift',
        payroll: 'Operator Pay',
        overtime: 'Extended Shift',
        allowance: 'Production Bonus'
      }
    },
    
    branding: {
      colorTheme: {
        primary: '#059669', // Manufacturing green
        secondary: '#047857',
        accent: '#34d399',
        navBackground: '#064e3b',
        navActive: '#047857'
      }
    },
    
    terminology: {
      employee: 'Operator',
      manager: 'Line Supervisor',
      department: 'Production Line',
      shift: 'Production Shift', 
      attendance: 'Shift Tracking',
      leave: 'Absence',
      payroll: 'Operator Pay',
      overtime: 'Extended Shift'
    },
    
    commonCustomizations: {
      navigationRenames: {
        'employees': 'Operators',
        'attendance': 'Shift Tracking',
        'roster': 'Shift Planning'
      },
      buttonLabels: {
        'clockIn': 'Start Shift',
        'clockOut': 'End Shift'
      },
      formLabels: {
        'employeeName': 'Operator Name',
        'department': 'Production Line'
      },
      statusLabels: {
        'present': 'On Line',
        'absent': 'Off Line'
      }
    },
    
    recommendedFeatures: [
      'qrKiosk',
      'performanceBonuses',
      'advancedReporting',
      'auditTrail'
    ],
    
    useCases: [
      'Track production shift hours accurately',
      'Manage 3-shift rotation schedules',
      'Calculate productivity bonuses',
      'Monitor machine operator assignments'
    ]
  },
  
  {
    id: 'retail',
    name: 'Retail & Customer Service',
    industry: 'retail',
    description: 'Optimized for retail stores, shopping centers, and customer service teams',
    
    labels: {
      mainNavigation: {
        dashboard: 'Store Dashboard',
        employees: 'Sales Team',
        attendance: 'Floor Hours',
        roster: 'Store Schedule', 
        leaves: 'Time Off Requests',
        payroll: 'Sales Pay',
        field: 'Store Operations',
        qr: 'Store Clock',
        ai: 'Sales Analytics',
        users: 'Store Access',
        settings: 'Store Settings',
        company: 'Retail Config',
        reports: 'Sales Reports',
        holidays: 'Store Calendar',
        salary: 'Commission Management'
      },
      
      formLabels: {
        employeeName: 'Sales Associate',
        employeeId: 'Associate ID',
        department: 'Store Section',
        position: 'Sales Role',
        salary: 'Base Pay',
        timeIn: 'Shift Start',
        timeOut: 'Shift End', 
        workHours: 'Floor Time',
        overtime: 'Extended Hours',
        location: 'Store Location',
        leaveType: 'Absence Type'
      },
      
      statusLabels: {
        active: 'Selling',
        inactive: 'Not Selling',
        present: 'On Floor',
        absent: 'Off Floor',
        late: 'Late Start'
      },
      
      generalTerms: {
        employee: 'Sales Associate',
        employees: 'Sales Team',
        manager: 'Store Manager',
        department: 'Store Section',
        shift: 'Store Shift',
        payroll: 'Sales Pay',
        overtime: 'Extended Hours',
        allowance: 'Sales Bonus'
      }
    },
    
    branding: {
      colorTheme: {
        primary: '#dc2626', // Retail red
        secondary: '#b91c1c',
        accent: '#f87171',
        navBackground: '#7f1d1d',
        navActive: '#b91c1c'
      }
    },
    
    terminology: {
      employee: 'Sales Associate',
      manager: 'Store Manager',
      department: 'Store Section',
      shift: 'Store Shift',
      attendance: 'Floor Hours',
      leave: 'Time Off',
      payroll: 'Sales Pay',
      overtime: 'Extended Hours'
    },
    
    commonCustomizations: {
      navigationRenames: {
        'employees': 'Sales Team',
        'attendance': 'Floor Hours',
        'roster': 'Store Schedule'
      },
      buttonLabels: {
        'clockIn': 'Start Shift',
        'clockOut': 'End Shift'
      },
      formLabels: {
        'employeeName': 'Associate Name',
        'department': 'Store Section'
      },
      statusLabels: {
        'present': 'On Floor',
        'absent': 'Off Floor'
      }
    },
    
    recommendedFeatures: [
      'shiftSwapping',
      'performanceBonuses',
      'qrKiosk',
      'advancedReporting'
    ],
    
    useCases: [
      'Track sales floor coverage',
      'Manage part-time and seasonal staff',
      'Calculate commission and sales bonuses',
      'Handle peak shopping period scheduling'
    ]
  },
  
  {
    id: 'delivery',
    name: 'Delivery & Logistics',
    industry: 'delivery',
    description: 'Built for delivery services, logistics companies, and courier operations',
    
    labels: {
      mainNavigation: {
        dashboard: 'Dispatch Center',
        employees: 'Drivers & Staff',
        attendance: 'Route Hours',
        roster: 'Route Planning',
        leaves: 'Driver Leave',
        payroll: 'Driver Pay',
        field: 'Route Operations',
        qr: 'Mobile Check-In',
        ai: 'Route Analytics',
        users: 'Fleet Access',
        settings: 'Fleet Settings',
        company: 'Fleet Config',
        reports: 'Delivery Reports',
        holidays: 'Service Calendar',
        salary: 'Driver Wages'
      },
      
      formLabels: {
        employeeName: 'Driver Name',
        employeeId: 'Driver ID',
        department: 'Route Zone',
        position: 'Driver Level',
        salary: 'Base Rate',
        timeIn: 'Route Start',
        timeOut: 'Route End',
        workHours: 'Driving Hours',
        overtime: 'Extra Routes',
        location: 'Depot/Zone',
        leaveType: 'Absence Type'
      },
      
      statusLabels: {
        active: 'On Route',
        inactive: 'Off Route',
        present: 'Driving',
        absent: 'Not Available',
        late: 'Delayed Start'
      },
      
      generalTerms: {
        employee: 'Driver',
        employees: 'Fleet',
        manager: 'Route Manager',
        department: 'Zone',
        shift: 'Route',
        payroll: 'Driver Pay',
        overtime: 'Extra Routes',
        allowance: 'Fuel Allowance'
      }
    },
    
    branding: {
      colorTheme: {
        primary: '#1d4ed8', // Delivery blue
        secondary: '#1e40af',
        accent: '#60a5fa',
        navBackground: '#1e3a8a',
        navActive: '#1e40af'
      }
    },
    
    terminology: {
      employee: 'Driver',
      manager: 'Route Manager',
      department: 'Zone',
      shift: 'Route',
      attendance: 'Route Hours',
      leave: 'Driver Leave',
      payroll: 'Driver Pay',
      overtime: 'Extra Routes'
    },
    
    commonCustomizations: {
      navigationRenames: {
        'employees': 'Drivers & Staff',
        'attendance': 'Route Hours',
        'roster': 'Route Planning'
      },
      buttonLabels: {
        'clockIn': 'Start Route',
        'clockOut': 'End Route'
      },
      formLabels: {
        'employeeName': 'Driver Name',
        'department': 'Route Zone'
      },
      statusLabels: {
        'present': 'On Route',
        'absent': 'Off Route'
      }
    },
    
    recommendedFeatures: [
      'gpsTracking',
      'fieldOperations',
      'performanceBonuses',
      'advancedReporting'
    ],
    
    useCases: [
      'Track delivery routes and performance',
      'Manage driver schedules and vehicle assignments',
      'Calculate per-delivery bonuses',
      'Monitor fuel efficiency and costs'
    ]
  },
  
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    industry: 'healthcare',
    description: 'Specialized for hospitals, clinics, and medical facilities',
    
    labels: {
      mainNavigation: {
        dashboard: 'Medical Dashboard',
        employees: 'Medical Staff',
        attendance: 'Duty Roster',
        roster: 'Shift Assignments',
        leaves: 'Medical Leave',
        payroll: 'Staff Compensation',
        field: 'Ward Operations',
        qr: 'Staff Check-In',
        ai: 'Medical Analytics',
        users: 'Staff Access',
        settings: 'Hospital Settings',
        company: 'Facility Config',
        reports: 'Medical Reports',
        holidays: 'Medical Calendar',
        salary: 'Medical Salaries'
      },
      
      formLabels: {
        employeeName: 'Medical Staff Name',
        employeeId: 'Staff ID',
        department: 'Medical Department',
        position: 'Medical Role',
        salary: 'Professional Fee',
        timeIn: 'Duty Start',
        timeOut: 'Duty End',
        workHours: 'Medical Hours',
        overtime: 'Extended Duty',
        location: 'Ward/Department',
        leaveType: 'Leave Category'
      },
      
      statusLabels: {
        active: 'On Duty',
        inactive: 'Off Duty',
        present: 'Available',
        absent: 'Not Available',
        late: 'Delayed'
      },
      
      generalTerms: {
        employee: 'Medical Staff',
        employees: 'Medical Team',
        manager: 'Chief/Head',
        department: 'Medical Department',
        shift: 'Medical Shift',
        payroll: 'Medical Pay',
        overtime: 'Extended Duty',
        allowance: 'Medical Allowance'
      }
    },
    
    branding: {
      colorTheme: {
        primary: '#0891b2', // Medical teal
        secondary: '#0e7490',
        accent: '#22d3ee',
        navBackground: '#164e63',
        navActive: '#0e7490'
      }
    },
    
    terminology: {
      employee: 'Medical Staff',
      manager: 'Department Head',
      department: 'Medical Department',
      shift: 'Medical Shift',
      attendance: 'Duty Hours',
      leave: 'Medical Leave',
      payroll: 'Medical Compensation',
      overtime: 'Extended Duty'
    },
    
    commonCustomizations: {
      navigationRenames: {
        'employees': 'Medical Staff',
        'attendance': 'Duty Roster',
        'roster': 'Shift Assignments'
      },
      buttonLabels: {
        'clockIn': 'Start Duty',
        'clockOut': 'End Duty'
      },
      formLabels: {
        'employeeName': 'Medical Staff Name',
        'department': 'Medical Department'
      },
      statusLabels: {
        'present': 'On Duty',
        'absent': 'Off Duty'
      }
    },
    
    recommendedFeatures: [
      'auditTrail',
      'advancedReporting',
      'qrKiosk',
      'mauritiusCompliance'
    ],
    
    useCases: [
      'Track medical staff duty hours',
      'Manage nursing and doctor schedules',
      'Handle medical leave and emergency coverage',
      'Calculate medical allowances and night duty pay'
    ]
  },
  
  {
    id: 'mauritius_standard',
    name: 'Mauritius Standard',
    industry: 'mauritius',
    description: 'Full Mauritius labor law compliance with local terminology and practices',
    
    labels: {
      mainNavigation: {
        dashboard: 'HR Dashboard',
        employees: 'Staff Register',
        attendance: 'Attendance Register',
        roster: 'Work Schedule',
        leaves: 'Leave Applications',
        payroll: 'Salary Processing',
        field: 'Field Operations',
        qr: 'Attendance Kiosk',
        ai: 'HR Analytics',
        users: 'System Users',
        settings: 'System Settings',
        company: 'Company Profile',
        reports: 'Statutory Reports',
        holidays: 'Public Holidays',
        salary: 'Salary Administration'
      },
      
      formLabels: {
        employeeName: 'Employee Name',
        employeeId: 'National ID/Employee No.',
        department: 'Department',
        position: 'Designation',
        salary: 'Basic Salary',
        timeIn: 'Clock In',
        timeOut: 'Clock Out',
        workHours: 'Hours Worked',
        overtime: 'Overtime Hours',
        location: 'Work Location',
        leaveType: 'Leave Category'
      },
      
      statusLabels: {
        active: 'Active',
        inactive: 'Inactive',
        present: 'Present',
        absent: 'Absent',
        late: 'Late'
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
    },
    
    branding: {
      colorTheme: {
        primary: '#1f2937', // Professional gray
        secondary: '#374151',
        accent: '#3b82f6',
        navBackground: '#111827',
        navActive: '#374151'
      }
    },
    
    terminology: {
      employee: 'Employee',
      manager: 'Manager',
      department: 'Department',
      shift: 'Shift',
      attendance: 'Attendance',
      leave: 'Leave',
      payroll: 'Payroll',
      overtime: 'Overtime'
    },
    
    commonCustomizations: {
      navigationRenames: {},
      buttonLabels: {},
      formLabels: {},
      statusLabels: {}
    },
    
    recommendedFeatures: [
      'mauritiusCompliance',
      'advancedReporting',
      'auditTrail',
      'qrKiosk'
    ],
    
    useCases: [
      'Full Mauritius labor law compliance',
      'NPF/NSF/CSG automatic calculations',
      '13th month salary tracking',
      'Statutory report generation'
    ]
  }
];

export const getUITemplate = (templateId: string): IndustryUITemplate | null => {
  return INDUSTRY_UI_TEMPLATES.find(template => template.id === templateId) || null;
};

export const applyUITemplate = (
  template: IndustryUITemplate,
  currentLabels: CustomizableUILabels,
  currentBranding: BrandingCustomization
): { labels: CustomizableUILabels; branding: BrandingCustomization } => {
  // Deep merge template labels with current labels
  const mergedLabels: CustomizableUILabels = {
    ...currentLabels,
    ...template.labels,
    mainNavigation: { ...currentLabels.mainNavigation, ...(template.labels.mainNavigation || {}) },
    formLabels: { ...currentLabels.formLabels, ...(template.labels.formLabels || {}) },
    statusLabels: { ...currentLabels.statusLabels, ...(template.labels.statusLabels || {}) },
    generalTerms: { ...currentLabels.generalTerms, ...(template.labels.generalTerms || {}) }
  };
  
  // Deep merge template branding with current branding
  const mergedBranding: BrandingCustomization = {
    ...currentBranding,
    ...template.branding,
    colorTheme: { ...currentBranding.colorTheme, ...(template.branding?.colorTheme || {}) }
  };
  
  return { labels: mergedLabels, branding: mergedBranding };
};

export const generateCustomCSS = (branding: BrandingCustomization): string => {
  return `
    :root {
      --color-primary: ${branding.colorTheme.primary};
      --color-secondary: ${branding.colorTheme.secondary};
      --color-accent: ${branding.colorTheme.accent};
      --color-success: ${branding.colorTheme.success};
      --color-warning: ${branding.colorTheme.warning};
      --color-error: ${branding.colorTheme.error};
      --color-info: ${branding.colorTheme.info};
      --color-background: ${branding.colorTheme.background};
      --color-card-background: ${branding.colorTheme.cardBackground};
      --color-text-primary: ${branding.colorTheme.textPrimary};
      --color-text-secondary: ${branding.colorTheme.textSecondary};
      --color-border: ${branding.colorTheme.borderColor};
      
      --color-nav-background: ${branding.colorTheme.navBackground};
      --color-nav-text: ${branding.colorTheme.navText};
      --color-nav-active: ${branding.colorTheme.navActive};
      --color-nav-hover: ${branding.colorTheme.navHover};
      
      --font-family: ${branding.typography.fontFamily};
      --font-heading: ${branding.typography.headingFont || branding.typography.fontFamily};
      
      --border-radius: ${branding.layout.cardBorderRadius}px;
      --sidebar-width: ${branding.layout.sidebarWidth}px;
      --header-height: ${branding.layout.headerHeight}px;
    }
    
    .bg-primary { background-color: var(--color-primary) !important; }
    .bg-secondary { background-color: var(--color-secondary) !important; }
    .bg-accent { background-color: var(--color-accent) !important; }
    .text-primary { color: var(--color-primary) !important; }
    .text-secondary { color: var(--color-secondary) !important; }
    .border-primary { border-color: var(--color-primary) !important; }
    
    .nav-background { background-color: var(--color-nav-background) !important; }
    .nav-text { color: var(--color-nav-text) !important; }
    .nav-active { background-color: var(--color-nav-active) !important; }
    
    body { 
      font-family: var(--font-family);
      background-color: var(--color-background);
      color: var(--color-text-primary);
    }
    
    h1, h2, h3, h4, h5, h6 { 
      font-family: var(--font-heading); 
    }
    
    .card {
      background-color: var(--color-card-background);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
    }
  `;
};