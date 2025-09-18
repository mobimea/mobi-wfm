import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DatabaseService, setSupabaseClient } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for integration tests
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

describe('Integration Tests - Database Endpoints', () => {
  let mockSupabase: any;
  let mockFrom: any;
  let mockSelect: any;
  let mockInsert: any;
  let mockUpdate: any;
  let mockDelete: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup comprehensive mock chain for integration testing
    mockDelete = {
      eq: vi.fn().mockResolvedValue({ error: null })
    };

    mockUpdate = {
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    };

    mockInsert = {
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    };

    mockSelect = {
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null })
      }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      or: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }),
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
    };

    mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockSelect),
      insert: vi.fn().mockReturnValue(mockInsert),
      update: vi.fn().mockReturnValue(mockUpdate),
      delete: vi.fn().mockReturnValue(mockDelete)
    });

    mockSupabase = {
      from: mockFrom
    };

    (createClient as any).mockReturnValue(mockSupabase);

    // Properly initialize the Supabase client for this test using setSupabaseClient
    setSupabaseClient(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Employee Management Endpoints', () => {
    it('should handle complete employee CRUD workflow', async () => {
      const employeeData = {
        name: 'John Doe',
        employee_id: 'EMP001',
        email: 'john@example.com',
        department: 'Engineering',
        position: 'Developer'
      };

      // Mock successful insert
      mockInsert.select.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { ...employeeData, id: 1 },
          error: null
        })
      });

      // Test employee creation
      const createResult = await DatabaseService.insertRecord('employees', employeeData);
      expect(createResult.data).toEqual({ ...employeeData, id: 1 });
      expect(createResult.error).toBeUndefined();

      // Mock successful fetch
      mockSelect.order.mockResolvedValue({
        data: [{ ...employeeData, id: 1 }],
        error: null
      });

      // Test employee retrieval
      const fetchResult = await DatabaseService.syncData();
      expect(fetchResult.data?.employees).toContainEqual({ ...employeeData, id: 1 });

      // Mock successful update
      const updateData = { ...employeeData, id: 1, department: 'DevOps' };
      mockUpdate.eq.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: updateData,
            error: null
          })
        })
      });

      // Test employee update
      const updateResult = await DatabaseService.updateRecord('employees', '1', { department: 'DevOps' });
      expect(updateResult.data).toEqual(updateData);
      expect(updateResult.error).toBeUndefined();

      // Mock successful delete
      mockDelete.eq.mockResolvedValue({ error: null });

      // Test employee deletion
      const deleteResult = await DatabaseService.deleteRecord('employees', '1');
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.error).toBeUndefined();
    });

    it('should handle employee search with filters', async () => {
      const searchResults = [
        { id: 1, name: 'John Doe', employee_id: 'EMP001', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', employee_id: 'EMP002', department: 'Engineering' }
      ];

      mockSelect.or.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: searchResults,
            error: null
          })
        }),
        order: vi.fn().mockResolvedValue({
          data: searchResults,
          error: null
        })
      });

      const searchResult = await DatabaseService.searchEmployees('John', { department: 'Engineering' });
      expect(searchResult.data).toEqual(searchResults);
      expect(searchResult.error).toBeUndefined();
    });
  });

  describe('Attendance Management Endpoints', () => {
    it('should handle attendance record lifecycle', async () => {
      const attendanceData = {
        employee_id: 'EMP001',
        date: '2023-12-01',
        check_in: '09:00',
        check_out: '17:00',
        status: 'present'
      };

      // Mock successful attendance insert
      mockInsert.select.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { ...attendanceData, id: 1 },
          error: null
        })
      });

      const createResult = await DatabaseService.insertRecord('attendance', attendanceData);
      expect(createResult.data).toEqual({ ...attendanceData, id: 1 });

      // Mock date range query
      mockSelect.gte.mockReturnValue({
        lte: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [{ ...attendanceData, id: 1 }],
              error: null
            })
          }),
          order: vi.fn().mockResolvedValue({
            data: [{ ...attendanceData, id: 1 }],
            error: null
          })
        })
      });

      const dateRangeResult = await DatabaseService.getAttendanceByDateRange('2023-12-01', '2023-12-31', 'EMP001');
      expect(dateRangeResult.data).toContainEqual({ ...attendanceData, id: 1 });
    });
  });

  describe('Leave Management Endpoints', () => {
    it('should handle leave request workflow', async () => {
      const leaveData = {
        employee_id: 'EMP001',
        type: 'annual',
        start_date: '2023-12-20',
        end_date: '2023-12-22',
        reason: 'Vacation',
        status: 'pending'
      };

      // Mock successful leave request creation
      mockInsert.select.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { ...leaveData, id: 1 },
          error: null
        })
      });

      const createResult = await DatabaseService.insertRecord('leaves', leaveData);
      expect(createResult.data).toEqual({ ...leaveData, id: 1 });

      // Mock leave status update
      const updatedLeave = { ...leaveData, id: 1, status: 'approved' };
      mockUpdate.eq.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: updatedLeave,
            error: null
          })
        })
      });

      const updateResult = await DatabaseService.updateRecord('leaves', '1', { status: 'approved' });
      expect(updateResult.data).toEqual(updatedLeave);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockSelect.limit.mockResolvedValue({
        data: null,
        error: { message: 'Network error' }
      });

      const result = await DatabaseService.testConnection();
      expect(result).toBe(false);
    });

    it('should handle invalid data submissions', async () => {
      // Mock validation error
      mockInsert.select.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid data format' }
        })
      });

      const result = await DatabaseService.insertRecord('employees', {});
      expect(result.data).toBeNull();
      expect(result.error).toBe('Invalid data format');
    });

    it('should handle concurrent operations', async () => {
      const employeeData = { name: 'Concurrent User', employee_id: 'EMP999' };

      // Mock successful concurrent inserts
      mockInsert.select.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { ...employeeData, id: 1 },
          error: null
        })
      });

      // Simulate concurrent operations
      const promises = Array(5).fill().map(() =>
        DatabaseService.insertRecord('employees', employeeData)
      );

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('Data Synchronization', () => {
    it('should synchronize all data tables correctly', async () => {
      const mockData = {
        employees: [{ id: 1, name: 'Employee 1' }],
        attendance: [{ id: 1, date: '2023-01-01' }],
        leaves: [{ id: 1, type: 'annual' }],
        holidays: [{ id: 1, name: 'New Year' }],
        locations: [{ id: 1, name: 'Office' }],
        roster: [{ id: 1, date: '2023-01-01' }]
      };

      // Mock each table fetch
      let callCount = 0;
      mockSelect.order.mockImplementation(() => {
        const tables = ['employees', 'attendance', 'leaves', 'holidays', 'locations', 'roster'];
        const tableData = mockData[tables[callCount] as keyof typeof mockData] || [];
        callCount++;
        return Promise.resolve({ data: tableData, error: null });
      });

      const syncResult = await DatabaseService.syncData();

      expect(syncResult.data).toEqual(mockData);
      expect(syncResult.error).toBeUndefined();
      expect(mockFrom).toHaveBeenCalledTimes(6); // Once for each table
    });

    it('should handle partial sync failures', async () => {
      // Mock partial failure - employees succeed, attendance fails
      mockSelect.order
        .mockResolvedValueOnce({ data: [{ id: 1, name: 'Employee 1' }], error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'Attendance sync failed' } });

      const syncResult = await DatabaseService.syncData();

      expect(syncResult.data).toBeNull();
      expect(syncResult.error).toBe('Attendance sync failed');
    });
  });
});
