import { AttendanceRecord, Employee, Holiday } from '../types';
import { CompanyConfiguration } from '../types/company';

export class DynamicPayrollCalculator {
  constructor(private config: CompanyConfiguration) {}

  public isPublicHoliday = (date: Date, holidays: Holiday[]): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return holidays.some(holiday => holiday.date === dateString);
  };

  public isSunday = (date: Date): boolean => {
    return date.getDay() === 0;
  };

  private calculateBreakDeductions = (
    totalHours: number, 
    isHolidayOrSunday: boolean, 
    isExtendedHours: boolean
  ): number => {
    const workingSchedule = this.config.workingSchedule || {
      lunchBreakMinutes: 30,
      dinnerBreakMinutes: 30,
      teaBreakMinutes: 15
    };
    const breakRules = this.config.attendanceSettings.breakDeductionRules || {
      lunch: { duration: workingSchedule.lunchBreakMinutes, threshold: 8 },
      dinner: { duration: workingSchedule.dinnerBreakMinutes, threshold: 10 },
      tea: { duration: workingSchedule.teaBreakMinutes, threshold: 4 }
    };
    
    if (isHolidayOrSunday && isExtendedHours) {
      return (breakRules.lunch.duration + breakRules.dinner.duration) / 60; // Convert minutes to hours
    } else if (isHolidayOrSunday || totalHours > breakRules.lunch.threshold) {
      return breakRules.lunch.duration / 60; // Convert minutes to hours
    } else {
      return breakRules.lunch.duration / 60; // Default lunch break
    }
  };

  public calculateDailyPay = (
    employee: Employee,
    workDate: Date,
    timeIn: string,
    timeOut: string,
    holidays: Holiday[]
  ): {
    regularPay: number;
    overtimePay: number;
    mealAllowance: number;
    totalPay: number;
    overtimeHours: number;
    regularHours: number;
    otRate: string;
  } => {
    const startTime = new Date(`2024-01-01T${timeIn}:00`);
    const endTime = new Date(`2024-01-01T${timeOut}:00`);
    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    const isHoliday = this.isPublicHoliday(workDate, holidays);
    const isSun = this.isSunday(workDate);
    const isPartTimeWeekdayOff = false; // This would be determined from employee record
    
    const salaryStructure = this.config.baseSalaryStructure;
    const overtimeRules = this.config.overtimeRules;
    const mealConfig = this.config.mealAllowance;
    
    const dailyRate = salaryStructure.defaultMonthlySalary / salaryStructure.workingDaysPerMonth;
    const hourlyRate = dailyRate / salaryStructure.standardWorkingHours;

    let regularPay = 0;
    let overtimePay = 0;
    let mealAllowance = 0;
    let overtimeHours = 0;
    let regularHours = 0;
    let otRate = '';

    // Meal allowance check
    if (mealConfig.enabled && totalHours >= mealConfig.minimumHours) {
      mealAllowance = mealConfig.amount;
    }

    // Check if OT rules are enabled before applying
    if (isHoliday || isSun) {
      // Holiday or Sunday work
      if (isPartTimeWeekdayOff && isSun && !isHoliday) {
        // OT 1.0 Rate (if enabled)
        if (overtimeRules.ot1_0.enabled) {
          const breakDeduction = this.calculateBreakDeductions(totalHours, true, false);
          const payableHours = Math.max(0, totalHours - breakDeduction);
          overtimePay = payableHours * overtimeRules.ot1_0.rate;
          overtimeHours = payableHours;
          otRate = `OT 1.0 (${salaryStructure.currencySymbol}${overtimeRules.ot1_0.rate}/hr)`;
        } else {
          // Fallback to regular if OT 1.0 disabled
          regularHours = totalHours;
          regularPay = totalHours * hourlyRate;
          otRate = 'Regular Rate';
        }
      } else if (totalHours <= salaryStructure.standardWorkingHours) {
        // OT 2.0 Rate (if enabled)
        if (overtimeRules.ot2_0.enabled) {
          const breakDeduction = this.calculateBreakDeductions(totalHours, true, false);
          const payableHours = Math.max(0, totalHours - breakDeduction);
          overtimePay = payableHours * overtimeRules.ot2_0.rate;
          overtimeHours = payableHours;
          otRate = `OT 2.0 (${salaryStructure.currencySymbol}${overtimeRules.ot2_0.rate}/hr)`;
        } else {
          regularHours = totalHours;
          regularPay = totalHours * hourlyRate;
          otRate = 'Regular Rate';
        }
      } else {
        // Mixed rates: First standard hours at OT 2.0, remaining at OT 3.0
        const standardHours = salaryStructure.standardWorkingHours;
        const extendedHours = totalHours - standardHours;
        
        if (overtimeRules.ot2_0.enabled && overtimeRules.ot3_0.enabled) {
          const workingSchedule = this.config.workingSchedule || { lunchBreakMinutes: 30 };
          const breakDeduction1 = workingSchedule.lunchBreakMinutes / 60;
          const ot2PayableHours = Math.max(0, standardHours - breakDeduction1);
          const ot2Pay = ot2PayableHours * overtimeRules.ot2_0.rate;
          
          const breakDeduction2 = this.calculateBreakDeductions(totalHours, true, true) - breakDeduction1;
          const ot3PayableHours = Math.max(0, extendedHours - breakDeduction2);
          const ot3Pay = ot3PayableHours * overtimeRules.ot3_0.rate;
          
          overtimePay = ot2Pay + ot3Pay;
          overtimeHours = ot2PayableHours + ot3PayableHours;
          otRate = `OT 2.0+3.0 (${ot2PayableHours.toFixed(1)}h @ ${salaryStructure.currencySymbol}${overtimeRules.ot2_0.rate} + ${ot3PayableHours.toFixed(1)}h @ ${salaryStructure.currencySymbol}${overtimeRules.ot3_0.rate})`;
        } else if (overtimeRules.ot2_0.enabled) {
          // Only OT 2.0 enabled
          const breakDeduction = this.calculateBreakDeductions(totalHours, true, false);
          const payableHours = Math.max(0, totalHours - breakDeduction);
          overtimePay = payableHours * overtimeRules.ot2_0.rate;
          overtimeHours = payableHours;
          otRate = `OT 2.0 (${salaryStructure.currencySymbol}${overtimeRules.ot2_0.rate}/hr)`;
        } else {
          // No OT rules enabled, use regular rate
          regularHours = totalHours;
          regularPay = totalHours * hourlyRate;
          otRate = 'Regular Rate';
        }
      }
    } else {
      // Regular workday
      if (totalHours <= salaryStructure.standardWorkingHours) {
        const breakDeduction = this.calculateBreakDeductions(totalHours, false, false);
        regularHours = Math.max(0, totalHours - breakDeduction);
        regularPay = regularHours * hourlyRate;
        otRate = 'Regular Day';
      } else {
        // OT 1.5 for weekday overtime (if enabled)
        if (overtimeRules.ot1_5.enabled) {
          const standardHours = salaryStructure.standardWorkingHours;
          const extraHours = totalHours - standardHours;
          
          const workingSchedule = this.config.workingSchedule || { lunchBreakMinutes: 30 };
          const regularBreakDeduction = workingSchedule.lunchBreakMinutes / 60;
          regularHours = Math.max(0, standardHours - regularBreakDeduction);
          regularPay = regularHours * hourlyRate;
          
          const overtimeBreakDeduction = this.calculateBreakDeductions(totalHours, false, true) - regularBreakDeduction;
          overtimeHours = Math.max(0, extraHours - overtimeBreakDeduction);
          overtimePay = overtimeHours * overtimeRules.ot1_5.rate;
          otRate = `Regular + OT 1.5 (${overtimeHours.toFixed(1)}h @ ${salaryStructure.currencySymbol}${overtimeRules.ot1_5.rate})`;
        } else {
          // No OT 1.5, treat all as regular hours
          const breakDeduction = this.calculateBreakDeductions(totalHours, false, false);
          regularHours = Math.max(0, totalHours - breakDeduction);
          regularPay = regularHours * hourlyRate;
          otRate = 'Regular Rate (OT 1.5 disabled)';
        }
      }
    }

    // Validate Mauritius overtime limits if compliance is enabled
    if (this.config.features.mauritiusCompliance && this.config.mauritiusSettings?.overtimeLimits.enforceCompliance) {
      const maxWeeklyOT = this.config.mauritiusSettings.overtimeLimits.maxOvertimePerWeek;
      const maxMonthlyOT = this.config.mauritiusSettings.overtimeLimits.maxOvertimePerMonth;
      
      // In a real system, you'd check against weekly/monthly totals
      // For now, just cap daily overtime if it would exceed weekly limit
      if (overtimeHours > maxWeeklyOT / 5) {
        const cappedOvertimeHours = maxWeeklyOT / 5;
        const reduction = overtimeHours - cappedOvertimeHours;
        overtimeHours = cappedOvertimeHours;
        overtimePay = (overtimePay / (overtimeHours + reduction)) * overtimeHours;
        otRate += ` (Capped: Mauritius limit ${maxWeeklyOT}h/week)`;
      }
    }

    return {
      regularPay: Math.round(regularPay * 100) / 100,
      overtimePay: Math.round(overtimePay * 100) / 100,
      mealAllowance,
      totalPay: Math.round((regularPay + overtimePay + mealAllowance) * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      regularHours: Math.round(regularHours * 100) / 100,
      otRate
    };
  };

  public calculateLeaveDeduction = (
    totalDays?: number,
    totalHours?: number
  ): number => {
    const leaveSettings = this.config.leaveManagement?.unpaidLeaveCalculation || {
      divisorDays: 26,
      includeAllowances: false,
      includeOvertime: false
    };
    
    const salaryStructure = this.config.baseSalaryStructure;
    let baseSalary = salaryStructure.defaultMonthlySalary;
    
    // Include allowances in deduction calculation if configured
    if (leaveSettings.includeAllowances) {
      if (this.config.mealAllowance.enabled) {
        baseSalary += this.config.mealAllowance.amount * leaveSettings.divisorDays; // Monthly meal allowance
      }
      // Transport allowance would be calculated based on working days, so not included in leave deduction
    }
    
    const dailyRate = baseSalary / leaveSettings.divisorDays;
    
    if (totalHours && totalHours > 0) {
      const hourlyRate = dailyRate / salaryStructure.standardWorkingHours;
      return Math.round(hourlyRate * totalHours * 100) / 100;
    } else if (totalDays && totalDays > 0) {
      return Math.round(dailyRate * totalDays * 100) / 100;
    }
    
    return 0;
  };

  public calculateMauritiusContributions = (grossSalary: number) => {
    if (!this.config.features.mauritiusCompliance || !this.config.mauritiusSettings) {
      return {
        employeeContributions: { npf: 0, nsf: 0, csg: 0, total: 0 },
        employerContributions: { npf: 0, nsf: 0, csg: 0, trainingLevy: 0, total: 0 },
        netSalary: grossSalary
      };
    }

    const contributions = this.config.mauritiusSettings.statutoryContributions;
    
    const employeeNPF = contributions.employeeNPF.enabled ? (grossSalary * contributions.employeeNPF.rate) / 100 : 0;
    const employeeNSF = contributions.employeeNSF.enabled ? (grossSalary * contributions.employeeNSF.rate) / 100 : 0;
    const employeeCSG = contributions.employeeCSG.enabled ? (grossSalary * contributions.employeeCSG.rate) / 100 : 0;
    
    const employerNPF = contributions.employerNPF.enabled ? (grossSalary * contributions.employerNPF.rate) / 100 : 0;
    const employerNSF = contributions.employerNSF.enabled ? (grossSalary * contributions.employerNSF.rate) / 100 : 0;
    const employerCSG = contributions.employerCSG.enabled ? (grossSalary * contributions.employerCSG.rate) / 100 : 0;
    const trainingLevy = contributions.trainingLevy.enabled ? (grossSalary * contributions.trainingLevy.rate) / 100 : 0;
    
    const totalEmployeeContributions = employeeNPF + employeeNSF + employeeCSG;
    const totalEmployerContributions = employerNPF + employerNSF + employerCSG + trainingLevy;
    
    return {
      employeeContributions: {
        npf: Math.round(employeeNPF * 100) / 100,
        nsf: Math.round(employeeNSF * 100) / 100,
        csg: Math.round(employeeCSG * 100) / 100,
        total: Math.round(totalEmployeeContributions * 100) / 100
      },
      employerContributions: {
        npf: Math.round(employerNPF * 100) / 100,
        nsf: Math.round(employerNSF * 100) / 100,
        csg: Math.round(employerCSG * 100) / 100,
        trainingLevy: Math.round(trainingLevy * 100) / 100,
        total: Math.round(totalEmployerContributions * 100) / 100
      },
      netSalary: Math.round((grossSalary - totalEmployeeContributions) * 100) / 100
    };
  };

  public getConfig(): CompanyConfiguration {
    return this.config;
  }
}

// Global instance that will be updated when company configuration changes
let globalPayrollCalculator: DynamicPayrollCalculator | null = null;

export const initializePayrollCalculator = (config: CompanyConfiguration) => {
  console.log('🔧 Initializing payroll calculator with config:', config.companyName);
  globalPayrollCalculator = new DynamicPayrollCalculator(config);
};

export const getPayrollCalculator = (): DynamicPayrollCalculator => {
  if (!globalPayrollCalculator) {
    console.warn('⚠️ Payroll calculator not initialized, using fallback');
    // Create a fallback calculator with default config
    const fallbackConfig = {
      baseSalaryStructure: {
        defaultMonthlySalary: 17710,
        workingDaysPerMonth: 26,
        standardWorkingHours: 8,
        currency: 'MUR',
        currencySymbol: 'Rs'
      },
      overtimeRules: {
        ot1_0: { enabled: true, rate: 85, breakDeductions: ['30min lunch'] },
        ot1_5: { enabled: true, rate: 127, triggerHours: 8, breakDeductions: ['30min lunch'] },
        ot2_0: { enabled: true, rate: 170, triggers: ['weekend', 'holiday'], breakDeductions: ['30min lunch'] },
        ot3_0: { enabled: true, rate: 255, triggers: ['extended_weekend'], breakDeductions: ['1h total breaks'] }
      },
      mealAllowance: {
        enabled: true,
        amount: 150,
        minimumHours: 10
      },
      workingSchedule: {
        lunchBreakMinutes: 30,
        dinnerBreakMinutes: 30,
        teaBreakMinutes: 15
      },
      attendanceSettings: {
        breakDeductionRules: {
          lunch: { duration: 30, threshold: 8 },
          dinner: { duration: 30, threshold: 10 },
          tea: { duration: 15, threshold: 4 }
        }
      },
      features: {
        mauritiusCompliance: false
      }
    } as CompanyConfiguration;
    
    globalPayrollCalculator = new DynamicPayrollCalculator(fallbackConfig);
  }
  return globalPayrollCalculator;
};

// Backward compatibility functions
export const calculateDailyPay = (
  employee: Employee,
  workDate: Date,
  timeIn: string,
  timeOut: string,
  holidays: Holiday[]
) => {
  return getPayrollCalculator().calculateDailyPay(employee, workDate, timeIn, timeOut, holidays);
};

export const calculateLeaveDeduction = (
  baseSalary: number, // This parameter is ignored in new system
  totalDays?: number,
  totalHours?: number
): number => {
  return getPayrollCalculator().calculateLeaveDeduction(totalDays, totalHours);
};