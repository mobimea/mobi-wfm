import { describe, it, expect } from 'vitest';

// Validation utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function isValidEmployeeId(employeeId: string): boolean {
  const employeeIdRegex = /^EMP\d{3,}$/;
  return employeeIdRegex.test(employeeId);
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function isValidTime(timeString: string): boolean {
  const timeRegex = /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('john@example.com')).toBe(true);
      expect(isValidEmail('user.name@company.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@gmail.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('+1234567890')).toBe(true);
      expect(isValidPhoneNumber('123 456 7890')).toBe(true);
      expect(isValidPhoneNumber('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('abc1234567')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('Employee ID Validation', () => {
    it('should validate correct employee IDs', () => {
      expect(isValidEmployeeId('EMP001')).toBe(true);
      expect(isValidEmployeeId('EMP123')).toBe(true);
      expect(isValidEmployeeId('EMP9999')).toBe(true);
    });

    it('should reject invalid employee IDs', () => {
      expect(isValidEmployeeId('EMP01')).toBe(false);
      expect(isValidEmployeeId('EMP')).toBe(false);
      expect(isValidEmployeeId('123456')).toBe(false);
      expect(isValidEmployeeId('')).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('should validate correct date strings', () => {
      expect(isValidDate('2023-01-01')).toBe(true);
      expect(isValidDate('2023-12-31')).toBe(true);
      expect(isValidDate('2024-02-29')).toBe(true); // Leap year
    });

    it('should reject invalid date strings', () => {
      expect(isValidDate('2023-13-01')).toBe(false);
      expect(isValidDate('2023-01-32')).toBe(false);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('Time Validation', () => {
    it('should validate correct time strings', () => {
      expect(isValidTime('09:00')).toBe(true);
      expect(isValidTime('17:30')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('9:00')).toBe(true); // Allow single digit hour
    });

    it('should reject invalid time strings', () => {
      expect(isValidTime('25:00')).toBe(false);
      expect(isValidTime('09:60')).toBe(false);
      expect(isValidTime('invalid-time')).toBe(false);
      expect(isValidTime('')).toBe(false);
    });
  });

  describe('Working Days Calculation', () => {
    it('should calculate working days correctly', () => {
      expect(calculateWorkingDays('2023-01-01', '2023-01-01')).toBe(1);
      expect(calculateWorkingDays('2023-01-01', '2023-01-02')).toBe(2);
      expect(calculateWorkingDays('2023-01-01', '2023-01-05')).toBe(5);
    });

    it('should handle different months', () => {
      expect(calculateWorkingDays('2023-01-30', '2023-02-02')).toBe(4);
    });
  });
});

describe('Business Logic Validation', () => {
  describe('Leave Request Validation', () => {
    function validateLeaveRequest(startDate: string, endDate: string, reason: string): {
      isValid: boolean;
      errors: string[];
    } {
      const errors: string[] = [];

      if (!isValidDate(startDate)) {
        errors.push('Invalid start date');
      }

      if (!isValidDate(endDate)) {
        errors.push('Invalid end date');
      }

      if (isValidDate(startDate) && isValidDate(endDate)) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
          errors.push('End date cannot be before start date');
        }

        const workingDays = calculateWorkingDays(startDate, endDate);
        if (workingDays > 30) {
          errors.push('Leave request cannot exceed 30 days');
        }
      }

      if (!reason || reason.trim().length < 10) {
        errors.push('Reason must be at least 10 characters long');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    }

    it('should validate correct leave requests', () => {
      const result = validateLeaveRequest(
        '2023-01-15',
        '2023-01-16',
        'Family vacation to visit relatives'
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject leave requests with invalid dates', () => {
      const result = validateLeaveRequest(
        'invalid-date',
        '2023-01-16',
        'Family vacation to visit relatives'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid start date');
    });

    it('should reject leave requests with end date before start date', () => {
      const result = validateLeaveRequest(
        '2023-01-16',
        '2023-01-15',
        'Family vacation to visit relatives'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End date cannot be before start date');
    });

    it('should reject leave requests exceeding 30 days', () => {
      const result = validateLeaveRequest(
        '2023-01-01',
        '2023-02-15',
        'Extended vacation to visit relatives'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Leave request cannot exceed 30 days');
    });

    it('should reject leave requests with insufficient reason', () => {
      const result = validateLeaveRequest(
        '2023-01-15',
        '2023-01-16',
        'Sick'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Reason must be at least 10 characters long');
    });
  });

  describe('Employee Data Validation', () => {
    function validateEmployee(employee: {
      name: string;
      email: string;
      phone: string;
      employee_id: string;
      department: string;
      position: string;
    }): {
      isValid: boolean;
      errors: string[];
    } {
      const errors: string[] = [];

      if (!employee.name || employee.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }

      if (!isValidEmail(employee.email)) {
        errors.push('Invalid email address');
      }

      if (!isValidPhoneNumber(employee.phone)) {
        errors.push('Invalid phone number');
      }

      if (!isValidEmployeeId(employee.employee_id)) {
        errors.push('Invalid employee ID format');
      }

      if (!employee.department || employee.department.trim().length < 2) {
        errors.push('Department must be at least 2 characters long');
      }

      if (!employee.position || employee.position.trim().length < 2) {
        errors.push('Position must be at least 2 characters long');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    }

    it('should validate correct employee data', () => {
      const result = validateEmployee({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        employee_id: 'EMP001',
        department: 'IT',
        position: 'Developer'
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject employee data with invalid email', () => {
      const result = validateEmployee({
        name: 'John Doe',
        email: 'invalid-email',
        phone: '1234567890',
        employee_id: 'EMP001',
        department: 'IT',
        position: 'Developer'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email address');
    });

    it('should reject employee data with invalid employee ID', () => {
      const result = validateEmployee({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        employee_id: 'INVALID',
        department: 'IT',
        position: 'Developer'
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid employee ID format');
    });
  });
});
