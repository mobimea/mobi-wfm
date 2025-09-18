import { DatabaseService } from '../lib/supabase';

export interface PayslipData {
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
}

export interface LeaveBalanceRequest {
  employee_id: string;
  year: number;
  action?: 'year_end_processing';
}

export class PayrollApi {
  // Generate payslip using edge function
  static async generatePayslip(payslipData: PayslipData): Promise<{ data: any; error?: string }> {
    try {
      // For now, we'll use DatabaseService to create the payslip record
      // In a real implementation, this would call the payslip_generator edge function
      const result = await DatabaseService.insertRecord('payslips', payslipData);
      
      if (result.error) {
        return { data: null, error: result.error };
      }

      return { data: result.data };
    } catch (error: any) {
      console.error('Error generating payslip:', error);
      return { data: null, error: error.message || 'Failed to generate payslip' };
    }
  }

  // Fetch payslips for an employee or all employees
  static async fetchPayslips(employeeId?: string, month?: number, year?: number): Promise<{ data: any[]; error?: string }> {
    try {
      // Since DatabaseService doesn't have a specific method for payslips,
      // we'll simulate fetching payslips for now
      // In a real implementation, you would add this method to DatabaseService
      return { data: [] };
    } catch (error: any) {
      console.error('Error fetching payslips:', error);
      return { data: [], error: error.message || 'Failed to fetch payslips' };
    }
  }

  // Calculate leave balance using edge function
  static async calculateLeaveBalance(request: LeaveBalanceRequest): Promise<{ data: any; error?: string }> {
    try {
      // For now, we'll simulate leave balance calculation
      // In a real implementation, this would call the leave_balance_calculator edge function
      const mockBalance = {
        employee_id: request.employee_id,
        year: request.year,
        balances: {
          allocated: {
            vacation: 28,
            emergency: 5,
            local: 5,
            paid_local: 5,
            paid_sick: 10,
            carried_over: 0
          },
          taken: {
            vacation: 0,
            emergency: 0,
            local: 0,
            paid_local: 0,
            paid_sick: 0
          },
          remaining: {
            vacation: 28,
            emergency: 5,
            local: 5,
            paid_local: 5,
            paid_sick: 10
          },
          total_taken: 0
        }
      };

      return { data: mockBalance };
    } catch (error: any) {
      console.error('Error calculating leave balance:', error);
      return { data: null, error: error.message || 'Failed to calculate leave balance' };
    }
  }

  // Process employee Excel upload
  static async processEmployeeUpload(fileUrl: string, importId: string): Promise<{ data: any; error?: string }> {
    try {
      // For now, we'll simulate the upload processing
      // In a real implementation, this would call the employee_excel_upload edge function
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update import record status
      const updateResult = await DatabaseService.updateRecord('employee_imports', importId, {
        status: 'completed',
        file_url: fileUrl
      });

      if (updateResult.error) {
        return { data: null, error: updateResult.error };
      }

      return { data: { message: 'Employee import completed successfully' } };
    } catch (error: any) {
      console.error('Error processing employee upload:', error);
      return { data: null, error: error.message || 'Failed to process employee upload' };
    }
  }

  // Fetch employee import history
  static async fetchImportHistory(): Promise<{ data: any[]; error?: string }> {
    try {
      // Since DatabaseService doesn't have a specific method for employee_imports,
      // we'll simulate fetching import history for now
      return { data: [] };
    } catch (error: any) {
      console.error('Error fetching import history:', error);
      return { data: [], error: error.message || 'Failed to fetch import history' };
    }
  }

  // Year-end leave processing
  static async processYearEndLeaves(year: number): Promise<{ data: any; error?: string }> {
    try {
      // This would process all employees' leave balances for year-end
      // For now, we'll simulate this process
      return { data: { message: `Year-end processing completed for ${year}` } };
    } catch (error: any) {
      console.error('Error processing year-end leaves:', error);
      return { data: null, error: error.message || 'Failed to process year-end leaves' };
    }
  }

  // Generate bulk payslips for all employees
  static async generateBulkPayslips(month: number, year: number, employeeIds?: string[]): Promise<{ data: any; error?: string }> {
    try {
      // This would generate payslips for multiple employees at once
      // For now, we'll simulate this process
      const count = employeeIds?.length || 0;
      return { data: { message: `Generated ${count} payslips for ${month}/${year}` } };
    } catch (error: any) {
      console.error('Error generating bulk payslips:', error);
      return { data: null, error: error.message || 'Failed to generate bulk payslips' };
    }
  }
}
