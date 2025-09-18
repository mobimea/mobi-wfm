import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSupabaseData } from '../useSupabaseData';
import { DatabaseService } from '../../lib/supabase';

// Mock the DatabaseService
vi.mock('../../lib/supabase', () => ({
  DatabaseService: {
    testConnection: vi.fn(),
    syncData: vi.fn(),
    insertEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    insertAttendance: vi.fn(),
    updateAttendance: vi.fn(),
    deleteAttendance: vi.fn(),
    insertLeave: vi.fn(),
    updateLeave: vi.fn(),
    deleteLeave: vi.fn(),
    searchEmployees: vi.fn(),
    getAttendanceByDateRange: vi.fn()
  },
  isSupabaseConfigured: vi.fn()
}));

 // Mock React hooks using hoisted refs to avoid vi.mock hoist issues
const { mockUseState, mockUseEffect } = vi.hoisted(() => ({
  mockUseState: vi.fn(),
  mockUseEffect: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useState: (initial: any) => {
      const [state, setState] = (mockUseState as any)(initial);
      return [state ?? initial, setState];
    },
    useEffect: mockUseEffect as any
  };
});

describe('useSupabaseData', () => {
  const mockData = {
    employees: [{ id: '1', name: 'John Doe', employee_id: 'EMP001' }],
    attendance: [{ id: '1', employee_id: 'EMP001', date: '2023-01-01' }],
    leaves: [{ id: '1', employee_id: 'EMP001', type: 'paid_local' }],
    holidays: [{ id: '1', name: 'New Year', date: '2023-01-01' }],
    locations: [{ id: '1', name: 'Office' }],
    roster: [{ id: '1', employee_id: 'EMP001', date: '2023-01-01' }]
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (DatabaseService.testConnection as any).mockResolvedValue(true);
    (DatabaseService.syncData as any).mockResolvedValue({ data: mockData });
  });

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      mockUseState.mockReturnValueOnce([{ loading: true, error: null }, vi.fn()]);
      mockUseState.mockReturnValueOnce([{
        employees: [],
        attendance: [],
        leaves: [],
        holidays: [],
        locations: [],
        roster: []
      }, vi.fn()]);
      mockUseState.mockReturnValueOnce([{
        connectionStatus: 'connecting',
        isOnlineMode: true,
        lastSyncTime: null
      }, vi.fn()]);

      const { result } = renderHook(() => useSupabaseData());

      expect(result.current.loading).toBe(true);
      expect(result.current.connectionStatus).toBe('connecting');
    });

    it('should load data successfully when Supabase is configured', async () => {
      (DatabaseService.testConnection as any).mockResolvedValue(true);
      (DatabaseService.syncData as any).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useSupabaseData());

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(DatabaseService.testConnection).toHaveBeenCalled();
      expect(DatabaseService.syncData).toHaveBeenCalled();
    });

    it('should switch to offline mode when Supabase is not configured', async () => {
      (DatabaseService.testConnection as any).mockResolvedValue(false);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isOnlineMode).toBe(false);
      expect(result.current.connectionStatus).toBe('offline');
    });

    it('should handle connection test failure', async () => {
      (DatabaseService.testConnection as any).mockResolvedValue(false);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.connectionStatus).toBe('offline');
    });
  });

  describe('Data Operations', () => {
    it('should add employee successfully', async () => {
      const newEmployee: any = {
        id: '2',
        name: 'Jane Smith',
        employee_id: 'EMP002',
        email: 'jane@example.com',
        department: 'HR',
        position: 'HR',
        phone: '1234567890',
        start_date: '2023-01-01',
        status: 'employed'
      };
      const expectedResult = { data: { ...newEmployee, id: '2' } };

      (DatabaseService.insertEmployee as any).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.addEmployee(newEmployee);
      });

      expect(DatabaseService.insertEmployee).toHaveBeenCalledWith(newEmployee);
      expect(result.current.employees).toContain(expectedResult.data);
    });

    it('should update employee successfully', async () => {
      const updates = { name: 'Updated Name' };
      const expectedResult = { data: { id: '1', ...updates } };

      (DatabaseService.updateEmployee as any).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.editEmployee('1', updates);
      });

      expect(DatabaseService.updateEmployee).toHaveBeenCalledWith('1', updates);
    });

    it('should remove employee successfully', async () => {
      const expectedResult = { success: true };

      (DatabaseService.deleteEmployee as any).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.removeEmployee('1');
      });

      expect(DatabaseService.deleteEmployee).toHaveBeenCalledWith('1');
    });

    it('should add leave request successfully', async () => {
      const newLeave: any = {
        id: '1',
        employee_id: 'EMP001',
        start_date: '2023-01-01',
        end_date: '2023-01-02',
        type: 'paid_local' as const,
        status: 'pending' as const,
        reason: 'Vacation',
        total_days: 2,
        salary_deduction: 0,
        applied_date: '2023-01-01'
      };
      const expectedResult = { data: { ...newLeave, id: '1' } };

      (DatabaseService.insertLeave as any).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.addLeaveRequest(newLeave);
      });

      expect(DatabaseService.insertLeave).toHaveBeenCalledWith(newLeave);
    });

    it('should update leave status successfully', async () => {
      const expectedResult = { data: { id: '1', status: 'approved' } };

      (DatabaseService.updateLeave as any).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.updateLeaveStatus('1', 'approved', 'admin');
      });

      expect(DatabaseService.updateLeave).toHaveBeenCalledWith('1', {
        status: 'approved',
        approved_by: 'admin',
        approved_date: expect.any(String)
      });
    });
  });

  describe('Search and Filter Operations', () => {
    it('should search employees successfully', async () => {
      const searchTerm = 'John';
      const expectedResults = [{ id: '1', name: 'John Doe' }];

      (DatabaseService.searchEmployees as any).mockResolvedValue({
        data: expectedResults
      });

      const { result } = renderHook(() => useSupabaseData());

      let searchResults;
      await act(async () => {
        searchResults = await result.current.searchEmployees(searchTerm);
      });

      expect(DatabaseService.searchEmployees).toHaveBeenCalledWith(searchTerm, undefined);
      expect(searchResults).toEqual(expectedResults);
    });

    it('should get attendance by date range successfully', async () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const expectedResults = [{ id: '1', date: '2023-01-15' }];

      (DatabaseService.getAttendanceByDateRange as any).mockResolvedValue({
        data: expectedResults
      });

      const { result } = renderHook(() => useSupabaseData());

      let attendanceResults;
      await act(async () => {
        attendanceResults = await result.current.getAttendanceByDateRange(startDate, endDate);
      });

      expect(DatabaseService.getAttendanceByDateRange).toHaveBeenCalledWith(startDate, endDate, undefined);
      expect(attendanceResults).toEqual(expectedResults);
    });
  });

  describe('Error Handling', () => {
    it('should handle add employee error', async () => {
      const newEmployee: any = {
        id: '2',
        name: 'Jane Smith',
        employee_id: 'EMP002',
        email: 'jane@example.com',
        department: 'HR',
        position: 'HR',
        phone: '1234567890',
        start_date: '2023-01-01',
        status: 'employed'
      };
      const errorMessage = 'Insert failed';

      (DatabaseService.insertEmployee as any).mockResolvedValue({
        data: null,
        error: errorMessage
      });

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        try {
          await result.current.addEmployee(newEmployee);
        } catch (error: any) {
          expect(error.message).toContain(errorMessage);
        }
      });
    });

    it('should handle sync data error', async () => {
      const errorMessage = 'Sync failed';

      (DatabaseService.syncData as any).mockResolvedValue({
        data: null,
        error: errorMessage
      });

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.connectionStatus).toBe('error');
    });
  });

  describe('Connection Management', () => {
    it('should retry connection successfully', async () => {
      (DatabaseService.testConnection as any).mockResolvedValue(true);
      (DatabaseService.syncData as any).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.retryConnection();
      });

      expect(DatabaseService.testConnection).toHaveBeenCalled();
      expect(result.current.connectionStatus).toBe('connected');
    });

    it('should switch to offline mode', async () => {
      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        result.current.useOfflineMode();
      });

      expect(result.current.isOnlineMode).toBe(false);
      expect(result.current.connectionStatus).toBe('offline');
    });

    it('should refresh data successfully', async () => {
      (DatabaseService.syncData as any).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.refreshData();
      });

      expect(DatabaseService.syncData).toHaveBeenCalled();
      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk employee updates', async () => {
      const updates = [
        { id: '1', updates: { name: 'Updated Name 1' } },
        { id: '2', updates: { name: 'Updated Name 2' } }
      ];

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.bulkUpdateEmployees(updates);
      });

      // Verify that individual update calls were made
      expect(DatabaseService.updateEmployee).toHaveBeenCalledTimes(2);
    });

    it('should handle bulk record deletion', async () => {
      const ids = ['1', '2', '3'];

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.bulkDeleteRecords('employees', ids);
      });

      // Verify that individual delete calls were made
      expect(DatabaseService.deleteEmployee).toHaveBeenCalledTimes(3);
    });
  });
});
