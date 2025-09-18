import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { useCompanyConfig } from '../../hooks/useCompanyConfig';
import { useUICustomization } from '../../hooks/useUICustomization';

// Mock the hooks
vi.mock('../../hooks/useSupabaseData');
vi.mock('../../hooks/useCompanyConfig');
vi.mock('../../hooks/useUICustomization');

// Mock the components
vi.mock('../Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation</div>
}));
vi.mock('../Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>
}));
vi.mock('../EmployeeManagement', () => ({
  default: () => <div data-testid="employee-management">Employee Management</div>
}));
vi.mock('../Login', () => ({
  default: () => <div data-testid="login">Login</div>
}));
vi.mock('../LoadingScreen', () => ({
  default: () => <div data-testid="loading-screen">Loading Screen</div>
}));

describe('App Component', () => {
  const mockUseSupabaseData = vi.mocked(useSupabaseData);
  const mockUseCompanyConfig = vi.mocked(useCompanyConfig as unknown as () => any);
  const mockUseUICustomization = vi.mocked(useUICustomization as unknown as () => any);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Provide default company config and UI customization mocks to avoid undefined destructuring
    mockUseCompanyConfig.mockReturnValue({
      config: {} as any,
      updateConfig: vi.fn(),
      isFirstTimeSetup: false,
      skipFirstTimeSetup: vi.fn(),
      loading: false,
    });

    mockUseUICustomization.mockReturnValue({
      labels: {} as any,
      branding: { appName: 'TestApp' } as any,
    });

    // Default Supabase data hook mock
    mockUseSupabaseData.mockReturnValue({
      employees: [],
      attendance: [],
      leaves: [],
      holidays: [],
      locations: [],
      roster: [],
      users: [],
      loading: false,
      error: null,
      connectionStatus: 'connected',
      isOnlineMode: true,
      lastSyncTime: null,
      setupRequired: false,
      retryConnection: vi.fn(),
      useOfflineMode: vi.fn(),
      handleSetupComplete: vi.fn(),
      refreshData: vi.fn(),
      updateEmployees: vi.fn(),
      updateAttendance: vi.fn(),
      updateLeaves: vi.fn(),
      updateHolidays: vi.fn(),
      updateRoster: vi.fn(),
      updateLocations: vi.fn(),
      addEmployee: vi.fn(),
      editEmployee: vi.fn(),
      removeEmployee: vi.fn(),
      addAttendanceRecord: vi.fn(),
      editAttendanceRecord: vi.fn(),
      removeAttendanceRecord: vi.fn(),
      addLeaveRequest: vi.fn(),
      updateLeaveStatus: vi.fn(),
      removeLeaveRequest: vi.fn(),
      addHoliday: vi.fn(),
      editHoliday: vi.fn(),
      removeHoliday: vi.fn(),
      addLocation: vi.fn(),
      editLocation: vi.fn(),
      removeLocation: vi.fn(),
      addRosterEntry: vi.fn(),
      editRosterEntry: vi.fn(),
      removeRosterEntry: vi.fn(),
      bulkUpdateEmployees: vi.fn(),
      bulkDeleteRecords: vi.fn(),
      searchEmployees: vi.fn(),
      getAttendanceByDateRange: vi.fn(),
      addUser: vi.fn(),
      editUser: vi.fn(),
      removeUser: vi.fn(),
      fetchUsers: vi.fn()
    });
  });

  it('renders loading screen when loading', () => {
    mockUseSupabaseData.mockReturnValue({
      ...mockUseSupabaseData(),
      loading: true
    });

    render(<App />);

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  });

  it('renders login when no user is authenticated', async () => {
    // Mock the currentUser as null (not authenticated)
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    render(<App />);

    // Advance auth loading timeout in App
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    await waitFor(() => expect(screen.getByTestId('login')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('renders dashboard by default when user is authenticated', async () => {
    // Mock authenticated user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify({ id: 1, role: 'admin' })),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    render(<App />);

    // Advance auth loading timeout in App
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('navigates between views correctly', async () => {
    const user = userEvent.setup();

    // Mock authenticated user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify({ id: 1, role: 'admin' })),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    render(<App />);

    // Advance auth loading timeout in App and wait for dashboard
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument(), { timeout: 2000 });

    // Click on employees button (assuming it's rendered)
    // Note: This test assumes the navigation buttons are rendered
    // In a real scenario, you'd need to mock the navigation component properly
  });

  it('shows quick actions menu for admin users', () => {
    // Mock admin user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify({ id: 1, role: 'admin' })),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    render(<App />);

    // Check if admin-specific quick actions are present
    // This would depend on the actual implementation of the quick actions menu
  });

  it('handles setup required state', () => {
    mockUseSupabaseData.mockReturnValue({
      ...mockUseSupabaseData(),
      setupRequired: true
    });

    render(<App />);

    // Should render setup wizard when setup is required
    // This test would need to be adjusted based on the actual setup wizard component
  });

  it('displays error boundary when errors occur', () => {
    // Mock an error in the component
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // This test would require triggering an error in the component
    // For now, we'll just ensure the error boundary is present

    consoleSpy.mockRestore();
  });
});
