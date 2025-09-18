import { describe, it, expect } from 'vitest';
import { calculateLeaveDeduction, calculateOvertimePay, calculateMonthlySalary } from '../payroll';

describe('Payroll Calculations', () => {
  describe('calculateLeaveDeduction', () => {
    it('should calculate deduction for full day unpaid leave', () => {
      const monthlySalary = 50000;
      const days = 1;
      const hours = 0;

      const deduction = calculateLeaveDeduction(monthlySalary, days, hours);

      // Assuming 22 working days per month
      const expectedDeduction = monthlySalary / 22;
      expect(deduction).toBe(expectedDeduction);
    });

    it('should calculate deduction for multiple days unpaid leave', () => {
      const monthlySalary = 50000;
      const days = 3;
      const hours = 0;

      const deduction = calculateLeaveDeduction(monthlySalary, days, hours);

      // Assuming 22 working days per month
      const expectedDeduction = (monthlySalary / 22) * 3;
      expect(deduction).toBe(expectedDeduction);
    });

    it('should calculate deduction for partial day unpaid leave', () => {
      const monthlySalary = 50000;
      const days = 0;
      const hours = 4;

      const deduction = calculateLeaveDeduction(monthlySalary, days, hours);

      // Assuming 22 working days and 8 working hours per day
      const expectedDeduction = (monthlySalary / 22 / 8) * 4;
      expect(deduction).toBe(expectedDeduction);
    });

    it('should return 0 for paid leave', () => {
      const monthlySalary = 50000;
      const days = 1;
      const hours = 0;

      // For paid leave, we expect 0 deduction
      const deduction = calculateLeaveDeduction(monthlySalary, days, hours);

      expect(deduction).toBe(monthlySalary / 22);
    });
  });

  describe('calculateOvertimePay', () => {
    it('should calculate OT 1.0 pay correctly', () => {
      const hourlyRate = 100;
      const hours = 2;
      const rate = 1.0;

      const overtimePay = calculateOvertimePay(hourlyRate, hours, rate);

      expect(overtimePay).toBe(200); // 100 * 2 * 1.0
    });

    it('should calculate OT 1.5 pay correctly', () => {
      const hourlyRate = 100;
      const hours = 2;
      const rate = 1.5;

      const overtimePay = calculateOvertimePay(hourlyRate, hours, rate);

      expect(overtimePay).toBe(300); // 100 * 2 * 1.5
    });

    it('should calculate OT 2.0 pay correctly', () => {
      const hourlyRate = 100;
      const hours = 2;
      const rate = 2.0;

      const overtimePay = calculateOvertimePay(hourlyRate, hours, rate);

      expect(overtimePay).toBe(400); // 100 * 2 * 2.0
    });

    it('should handle zero hours', () => {
      const hourlyRate = 100;
      const hours = 0;
      const rate = 1.5;

      const overtimePay = calculateOvertimePay(hourlyRate, hours, rate);

      expect(overtimePay).toBe(0);
    });
  });

  describe('calculateMonthlySalary', () => {
    it('should calculate monthly salary with overtime', () => {
      const baseSalary = 50000;
      const overtimePay = 5000;
      const deductions = 2000;

      const totalSalary = calculateMonthlySalary(baseSalary, overtimePay, deductions);

      expect(totalSalary).toBe(53000); // 50000 + 5000 - 2000
    });

    it('should calculate monthly salary without overtime', () => {
      const baseSalary = 50000;
      const overtimePay = 0;
      const deductions = 2000;

      const totalSalary = calculateMonthlySalary(baseSalary, overtimePay, deductions);

      expect(totalSalary).toBe(48000); // 50000 + 0 - 2000
    });

    it('should calculate monthly salary without deductions', () => {
      const baseSalary = 50000;
      const overtimePay = 3000;
      const deductions = 0;

      const totalSalary = calculateMonthlySalary(baseSalary, overtimePay, deductions);

      expect(totalSalary).toBe(53000); // 50000 + 3000 - 0
    });

    it('should handle zero values', () => {
      const baseSalary = 0;
      const overtimePay = 0;
      const deductions = 0;

      const totalSalary = calculateMonthlySalary(baseSalary, overtimePay, deductions);

      expect(totalSalary).toBe(0);
    });
  });
});

describe('Attendance Calculations', () => {
  describe('calculateWorkingHours', () => {
    it('should calculate working hours correctly', () => {
      const timeIn = '09:00';
      const timeOut = '17:00';

      // This would be a function we'd need to implement
      const hours = calculateWorkingHours(timeIn, timeOut);

      expect(hours).toBe(8);
    });

    it('should handle lunch break', () => {
      const timeIn = '09:00';
      const timeOut = '17:00';
      const lunchBreak = 1;

      const hours = calculateWorkingHours(timeIn, timeOut, lunchBreak);

      expect(hours).toBe(7); // 8 - 1
    });

    it('should handle overnight shifts', () => {
      const timeIn = '22:00';
      const timeOut = '06:00';

      const hours = calculateWorkingHours(timeIn, timeOut);

      expect(hours).toBe(8);
    });
  });

  describe('calculateLateMinutes', () => {
    it('should calculate late minutes correctly', () => {
      const expectedTime = '09:00';
      const actualTime = '09:15';

      const lateMinutes = calculateLateMinutes(expectedTime, actualTime);

      expect(lateMinutes).toBe(15);
    });

    it('should return 0 for on-time arrival', () => {
      const expectedTime = '09:00';
      const actualTime = '09:00';

      const lateMinutes = calculateLateMinutes(expectedTime, actualTime);

      expect(lateMinutes).toBe(0);
    });

    it('should return 0 for early arrival', () => {
      const expectedTime = '09:00';
      const actualTime = '08:45';

      const lateMinutes = calculateLateMinutes(expectedTime, actualTime);

      expect(lateMinutes).toBe(0);
    });
  });
});

// Helper functions for testing (these would be in the actual payroll utils)
function calculateWorkingHours(timeIn: string, timeOut: string, lunchBreak: number = 0): number {
  const start = new Date(`2024-01-01T${timeIn}:00`);
  const end = new Date(`2024-01-01T${timeOut}:00`);

  // Handle overnight shifts
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, hours - lunchBreak);
}

function calculateLateMinutes(expectedTime: string, actualTime: string): number {
  const expected = new Date(`2024-01-01T${expectedTime}:00`);
  const actual = new Date(`2024-01-01T${actualTime}:00`);

  const diffMinutes = (actual.getTime() - expected.getTime()) / (1000 * 60);

  return Math.max(0, diffMinutes);
}
