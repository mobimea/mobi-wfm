import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DatabaseService, isSupabaseConfigured, setSupabaseClient } from '../supabase';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

describe('DatabaseService', () => {
  let mockSupabase: any;
  let mockFrom: any;
  let mockSelect: any;
  let mockInsert: any;
  let mockUpdate: any;
  let mockDelete: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock environment variables for each test
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

    // Setup mock chain
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

    // Inject the mock Supabase client
    setSupabaseClient(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('isSupabaseConfigured', () => {
    it('should return true when environment variables are set correctly', () => {
      expect(isSupabaseConfigured()).toBe(true);
    });

    it('should return false when URL is missing', () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');

      expect(isSupabaseConfigured()).toBe(false);
    });

    it('should return false when URL is invalid format', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'invalid-url');

      expect(isSupabaseConfigured()).toBe(false);
    });

    it('should return false when ANON_KEY is missing', () => {
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

      expect(isSupabaseConfigured()).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should return true when connection test succeeds', async () => {
      mockSelect.eq.mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null })
      });

      const result = await DatabaseService.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when Supabase is not configured', async () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');

      const result = await DatabaseService.testConnection();
      expect(result).toBe(false);
    });

    it('should return false when connection test fails', async () => {
      mockSelect.eq.mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Connection failed' } })
      });

      const result = await DatabaseService.testConnection();
      // The actual implementation returns false if error, true otherwise
      expect(result).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    describe('insertRecord', () => {
      it('should successfully insert a record', async () => {
        const testRecord = { name: 'Test Employee', employee_id: 'EMP001' };
        const expectedResult = { ...testRecord, id: 1 };

        mockInsert.select.mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: expectedResult,
            error: null
          })
        });

        const result = await DatabaseService.insertRecord('employees', testRecord);

        expect(result.data).toEqual(expectedResult);
        expect(result.error).toBeUndefined();
        expect(mockFrom).toHaveBeenCalledWith('employees');
      });

      it('should handle insert errors', async () => {
        const testRecord = { name: 'Test Employee' };
        const errorMessage = 'Insert failed';

        mockInsert.select.mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: errorMessage }
          })
        });

        const result = await DatabaseService.insertRecord('employees', testRecord);

        expect(result.data).toBeNull();
        expect(result.error).toBe(errorMessage);
      });
    });

    describe('syncData', () => {
      it('should fetch all data successfully', async () => {
        const mockEmployees = [{ id: 1, name: 'Employee 1' }];
        const mockAttendance = [{ id: 1, date: '2023-01-01' }];
        const mockLeaves = [{ id: 1, type: 'annual' }];
        const mockHolidays = [{ id: 1, name: 'New Year' }];
        const mockLocations = [{ id: 1, name: 'Office' }];
        const mockRoster = [{ id: 1, date: '2023-01-01' }];

        // Mock each fetch method
        mockSelect.order
          .mockResolvedValueOnce({ data: mockEmployees, error: null })
          .mockResolvedValueOnce({ data: mockAttendance, error: null })
          .mockResolvedValueOnce({ data: mockLeaves, error: null })
          .mockResolvedValueOnce({ data: mockHolidays, error: null })
          .mockResolvedValueOnce({ data: mockLocations, error: null })
          .mockResolvedValueOnce({ data: mockRoster, error: null });

        const result = await DatabaseService.syncData();

        expect(result.data).toEqual({
          employees: mockEmployees,
          attendance: mockAttendance,
          leaves: mockLeaves,
          holidays: mockHolidays,
          locations: mockLocations,
          roster: mockRoster
        });
        expect(result.error).toBeUndefined();
      });

      it('should handle sync errors', async () => {
        const errorMessage = 'Sync failed';

        mockSelect.order.mockResolvedValue({
          data: null,
          error: { message: errorMessage }
        });

        const result = await DatabaseService.syncData();

        expect(result.data).toBeNull();
        expect(result.error).toBe(errorMessage);
      });
    });

    describe('updateRecord', () => {
      it('should update a record successfully', async () => {
        const updates = { name: 'Updated Name' };
        const expectedResult = { id: '1', ...updates };

        mockUpdate.eq.mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: expectedResult,
              error: null
            })
          })
        });

        const result = await DatabaseService.updateRecord('employees', '1', updates);

        expect(result.data).toEqual(expectedResult);
        expect(result.error).toBeUndefined();
      });

      it('should handle update errors', async () => {
        const updates = { name: 'Updated Name' };
        const errorMessage = 'Update failed';

        mockUpdate.eq.mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: errorMessage }
            })
          })
        });

        const result = await DatabaseService.updateRecord('employees', '1', updates);

        expect(result.data).toBeNull();
        expect(result.error).toBe(errorMessage);
      });
    });

    describe('deleteRecord', () => {
      it('should delete a record successfully', async () => {
        mockDelete.eq.mockResolvedValue({ error: null });

        const result = await DatabaseService.deleteRecord('employees', '1');

        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(mockDelete.eq).toHaveBeenCalledWith('id', '1');
      });

      it('should handle delete errors', async () => {
        const errorMessage = 'Delete failed';

        mockDelete.eq.mockResolvedValue({
          error: { message: errorMessage }
        });

        const result = await DatabaseService.deleteRecord('employees', '1');

        expect(result.success).toBe(false);
        expect(result.error).toBe(errorMessage);
      });
    });
  });

  describe('Advanced Operations', () => {
    describe('searchEmployees', () => {
      it('should search employees by term', async () => {
        const searchTerm = 'John';
        const mockResults = [{ id: 1, name: 'John Doe' }];

        mockSelect.or.mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockResults,
            error: null
          })
        });

        const result = await DatabaseService.searchEmployees(searchTerm);

        expect(result.data).toEqual(mockResults);
        expect(result.error).toBeUndefined();
      });

      it('should apply filters correctly', async () => {
        const filters = { department: 'IT', status: 'active' };
        const mockResults = [{ id: 1, name: 'John Doe', department: 'IT' }];

        mockSelect.eq.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockResults,
              error: null
            })
          })
        });

        const result = await DatabaseService.searchEmployees('', filters);

        expect(result.data).toEqual(mockResults);
        expect(result.error).toBeUndefined();
      });
    });

    describe('getAttendanceByDateRange', () => {
      it('should fetch attendance records within date range', async () => {
        const startDate = '2023-01-01';
        const endDate = '2023-01-31';
        const mockResults = [
          { id: 1, date: '2023-01-15', employee_id: 'EMP001' }
        ];

        mockSelect.gte.mockReturnValue({
          lte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockResults,
              error: null
            })
          })
        });

        const result = await DatabaseService.getAttendanceByDateRange(startDate, endDate);

        expect(result.data).toEqual(mockResults);
        expect(result.error).toBeUndefined();
      });

      it('should filter by employee ID when provided', async () => {
        const startDate = '2023-01-01';
        const endDate = '2023-01-31';
        const employeeId = 'EMP001';
        const mockResults = [
          { id: 1, date: '2023-01-15', employee_id: 'EMP001' }
        ];

        mockSelect.gte.mockReturnValue({
          lte: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockResults,
                error: null
              })
            })
          })
        });

        const result = await DatabaseService.getAttendanceByDateRange(startDate, endDate, employeeId);

        expect(result.data).toEqual(mockResults);
        expect(result.error).toBeUndefined();
      });
    });
  });
});
