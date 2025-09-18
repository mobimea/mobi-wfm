import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import EmployeeExcelUpload from './components/EmployeeExcelUpload';
import PayslipManagement from './components/PayslipManagement';
import LeaveBalances from './components/LeaveBalances';
import AttendanceSystem from './components/AttendanceSystem';
import LeaveManagement from './components/LeaveManagement';
import RosterManagement from './components/RosterManagement';
import FieldOperations from './components/FieldOperations';
import AIAssistant from './components/AIAssistant';
import UserManagement from './components/UserManagement';
import PayrollReports from './components/PayrollReports';
import SalaryManagement from './components/SalaryManagement';
import HolidayManagement from './components/HolidayManagement';
import AdminSettings from './components/AdminSettings';
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import DatabaseSetupWizard from './components/DatabaseSetupWizard';
import CompanySetupWizard from './components/CompanySetupWizard';
import CompanySettings from './components/CompanySettings';
import { Home, Users, BarChart3, Database, XCircle } from 'lucide-react';
import { useSupabaseData } from './hooks/useSupabaseData';
import { DatabaseService, isSupabaseConfigured } from './lib/supabase';
import { useCompanyConfig } from './hooks/useCompanyConfig';
import { useUICustomization } from './hooks/useUICustomization';

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Supabase data hook
  const {
    employees,
    attendance,
    leaves,
    holidays,
    locations,
    roster,
    users,
    loading,
    error,
    connectionStatus,
    isOnlineMode,
    setupRequired,
    retryConnection,
    useOfflineMode,
    handleSetupComplete,
    updateEmployees,
    updateAttendance,
    updateLeaves,
    updateHolidays,
    addEmployee,
    editEmployee,
    removeEmployee,
    addAttendanceRecord,
    editAttendanceRecord,
    updateRoster,
    addRosterEntry,
    editRosterEntry,
    removeRosterEntry,
    addLeaveRequest,
    updateLeaveStatus,
    addHoliday,
    editHoliday,
    removeHoliday,
    updateLocations,
    addLocation,
    editLocation,
    removeLocation,
    refreshData,
    addUser,
    editUser,
    removeUser
  } = useSupabaseData();
  
  // UI state
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Company configuration
  const {
    config: companyConfig,
    updateConfig: updateCompanyConfig,
    isFirstTimeSetup,
    skipFirstTimeSetup,
    loading: configLoading
  } = useCompanyConfig();

  // UI customization
  const { labels, branding } = useUICustomization();

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simulate auth check (skip delay in Vitest)
  useEffect(() => {
    // In unit tests, finish auth immediately
    try {
      // Vitest sets import.meta.env.MODE='test' and defines globalThis.vi
      if ((import.meta as any).env?.MODE === 'test' || (globalThis as any).vi) {
        setAuthLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Persisted auth: load currentUser from localStorage on mount
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('currentUser') : null;
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      // ignore JSON/localStorage errors in test environments
    }
  }, []);

  // Auto-login for Cypress E2E (test-only)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Cypress) {
      setCurrentUser({
        email: 'admin@demo.com',
        role: 'admin'
      } as any);
      setCurrentView('user-management');
    }
  }, []);

  // Handle authentication
  const [authError, setAuthError] = useState<string>('');
  
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setAuthError('');
    try {
      console.log('🔑 Starting authentication process for:', email);
      console.log('🔌 Connection status:', connectionStatus);
      console.log('📊 Is Supabase configured?', isSupabaseConfigured());
      
      // Check if Supabase is configured and connected
      if (isSupabaseConfigured() && connectionStatus === 'connected') {
        console.log('🔑 Attempting Supabase authentication for:', email);
        
        // Try to authenticate with Supabase
        const authResult = await DatabaseService.authenticateUser(email, password);
        
        if (authResult.data && !authResult.error) {
          console.log('✅ Supabase authentication successful');
          setCurrentUser(authResult.data);
          try {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('currentUser', JSON.stringify(authResult.data));
            }
          } catch {
            // ignore localStorage errors
          }
          return true;
        } else {
          console.log('❌ Supabase authentication failed:', authResult.error);
          setAuthError(`Database authentication failed: ${authResult.error || 'Unknown error'}`);
          // Don't return false yet, fall through to demo users
          return false; // Added return false here to fix bug
        }
      }
      
      // Fallback to demo users (always try this if Supabase auth fails or isn't configured)
      console.log('❌ Both database and demo authentication failed');
      setAuthError('Invalid credentials. Please check your email and password.');
      return false;
      
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      setAuthError(`Authentication error: ${error.message}`);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('currentUser');
      }
    } catch {
      // ignore localStorage errors
    }
    setCurrentView('dashboard');
  };

  // Filter data based on user role - employees only see their own records
  const getFilteredData = () => {
    if (currentUser?.role === 'employee' && currentUser.employee_id) {
      // Find employee record by employee_id (not id)
      const userEmployeeRecord = employees.find(emp => emp.employee_id === currentUser.employee_id);
      
      if (!userEmployeeRecord) {
        return { employees: [], attendance: [], roster: [], leaves: [] };
      }
      
      return {
        employees: [userEmployeeRecord],
        attendance: attendance.filter(record => record.employee_id === userEmployeeRecord.id),
        roster: [],
        leaves: leaves.filter(leave => leave.employee_id === userEmployeeRecord.id)
      };
    }
    
    if (currentUser?.role === 'supervisor' && currentUser.employee_id) {
      // Supervisor sees their department employees
      const managerRecord = employees.find(emp => emp.employee_id === currentUser.employee_id);
      let departmentEmployees = employees;
      
      if (managerRecord) {
        departmentEmployees = employees.filter(emp => emp.department === managerRecord.department);
      } else if (currentUser.department) {
        departmentEmployees = employees.filter(emp => emp.department === currentUser.department);
      }
      
      const departmentEmployeeIds = departmentEmployees.map(emp => emp.id);
      
      return {
        employees: departmentEmployees,
        attendance: attendance.filter(record => departmentEmployeeIds.includes(record.employee_id)),
        roster: [],
        leaves: leaves.filter(leave => departmentEmployeeIds.includes(leave.employee_id))
      };
    }
    
    // Admin and supervisors see all data
    return {
      employees,
      attendance,
      roster: [],
      leaves
    };
  };

  // Show company setup wizard if this is first time setup
  if (configLoading) {
    return <LoadingScreen message="Loading company configuration..." connectionStatus="connecting" />;
  }

  if (isFirstTimeSetup) {
    return (
      <CompanySetupWizard
        onSetupComplete={updateCompanyConfig}
        onSkipSetup={skipFirstTimeSetup}
      />
    );
  }

  // Show setup wizard if required
  // Skip setup wizard - database can start empty
  if (setupRequired) {
    return (
      <DatabaseSetupWizard
        onSetupComplete={handleSetupComplete}
        onUseOfflineMode={useOfflineMode}
      />
    );
  }

  // Show loading screen during initial load or auth check
  if (loading || authLoading) {
    return (
      <LoadingScreen
        message={authLoading ? 'Initializing application...' : 'Loading workspace data...'}
        connectionStatus={connectionStatus}
        onRetry={retryConnection}
        onUseOffline={useOfflineMode}
      />
    );
  }

  // Show connection error screen
  if (error && connectionStatus === 'error' && !isOnlineMode) {
    return (
      <LoadingScreen
        message={error}
        connectionStatus={connectionStatus}
        onRetry={retryConnection}
        onUseOffline={useOfflineMode}
      />
    );
  }

  const filteredData = getFilteredData();

  if (!currentUser) {
    return (
      <div>
        <Login onLogin={handleLogin} />
        {/* Connection Status Indicator */}
        <div className="fixed bottom-4 left-4 z-50">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'offline' ? 'bg-orange-100 text-orange-800' :
            connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'offline' ? 'bg-orange-500' :
              connectionStatus === 'error' ? 'bg-red-500' :
              'bg-blue-500 animate-pulse'
            }`} />
            <span className="font-medium">
              {connectionStatus === 'connected' ? 'Online' :
               connectionStatus === 'offline' ? 'Offline Mode' :
               connectionStatus === 'error' ? 'Connection Error' :
               'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    const commonProps = {
      currentUser,
      employees: filteredData.employees,
      attendance: filteredData.attendance,
      leaves: filteredData.leaves,
      roster: filteredData.roster,
      locations,
      holidays
    };

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            employees={filteredData.employees}
            attendance={filteredData.attendance}
            leaves={filteredData.leaves}
            roster={roster}
            currentUser={currentUser}
            onViewChange={setCurrentView}
          />
        );
      case 'employees':
        return (
          <EmployeeManagement 
            employees={filteredData.employees}
            locations={locations}
            onEmployeeUpdate={updateEmployees}
            addEmployee={addEmployee}
            editEmployee={editEmployee}
            removeEmployee={removeEmployee}
            currentUser={currentUser}
            attendance={filteredData.attendance}
            leaves={filteredData.leaves}
          />
        );
      case 'employee-excel-upload':
        return (
          <EmployeeExcelUpload 
            onUploadComplete={refreshData}
            currentUser={currentUser}
          />
        );
      case 'payslip-management':
        return (
          <PayslipManagement 
            employees={filteredData.employees}
            currentUser={currentUser}
          />
        );
      case 'leave-balances':
        return (
          <LeaveBalances 
            employees={filteredData.employees}
            currentUser={currentUser}
          />
        );
      case 'attendance':
        return (
          <AttendanceSystem 
            attendance={filteredData.attendance}
            employees={filteredData.employees}
            locations={locations}
            roster={filteredData.roster}
            onAttendanceUpdate={updateAttendance}
            addAttendanceRecord={addAttendanceRecord}
            editAttendanceRecord={editAttendanceRecord}
            currentUser={currentUser}
          />
        );
      case 'roster':
        return (
          <RosterManagement 
            roster={roster}
            employees={filteredData.employees}
            locations={locations}
            onRosterUpdate={updateRoster}
            addRosterEntry={addRosterEntry}
            editRosterEntry={editRosterEntry}
            removeRosterEntry={removeRosterEntry}
            currentUser={currentUser}
            onViewChange={setCurrentView}
          />
        );
      case 'leaves':
        return (
          <LeaveManagement 
            leaves={filteredData.leaves}
            employees={filteredData.employees}
            onLeaveUpdate={updateLeaves}
            addLeaveRequest={addLeaveRequest}
            updateLeaveStatus={updateLeaveStatus}
            currentUser={currentUser}
          />
        );
      case 'reports':
        return (
          <PayrollReports 
            employees={filteredData.employees}
            attendance={filteredData.attendance}
            leaves={filteredData.leaves}
            roster={roster}
            locations={locations}
            holidays={holidays}
            currentUser={currentUser}
          />
        );
      case 'field-ops':
        return (
          <FieldOperations 
            employees={filteredData.employees}
            locations={locations}
            attendance={filteredData.attendance}
            addLocation={addLocation}
            editLocation={editLocation}
            removeLocation={removeLocation}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistant 
            employees={filteredData.employees}
            attendance={filteredData.attendance}
            leaves={filteredData.leaves}
            onEmployeeUpdate={updateEmployees}
            onAttendanceUpdate={updateAttendance}
            onLeaveUpdate={updateLeaves}
          />
        );
      case 'user-management':
        return (
          <UserManagement 
            currentUser={currentUser}
            users={users}
            onAddUser={addUser}
            onEditUser={editUser}
            onRemoveUser={removeUser}
          />
        );
      case 'salary-management':
        return (
          <SalaryManagement 
            employees={filteredData.employees}
            onEmployeeUpdate={updateEmployees}
            currentUser={currentUser}
          />
        );
      case 'holiday-management':
        return (
          <HolidayManagement 
            holidays={holidays}
            onHolidayUpdate={updateHolidays}
            addHoliday={addHoliday}
            editHoliday={editHoliday}
            removeHoliday={removeHoliday}
            currentUser={currentUser}
          />
        );
      case 'admin-settings':
        return (
          <AdminSettings 
            employees={filteredData.employees}
            attendance={filteredData.attendance}
            leaves={filteredData.leaves}
            locations={locations}
            holidays={holidays}
            onEmployeeUpdate={updateEmployees}
            onRefreshData={refreshData}
            connectionStatus={connectionStatus}
            isOnlineMode={isOnlineMode}
          />
        );
      case 'company-settings':
        return (
          <CompanySettings
            currentConfig={companyConfig}
            onConfigUpdate={updateCompanyConfig}
          />
        );
      default:
        return (
          <Dashboard 
            employees={filteredData.employees}
            attendance={filteredData.attendance}
            leaves={filteredData.leaves}
            roster={roster}
            currentUser={currentUser}
            onViewChange={setCurrentView}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        userRole={currentUser.role}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        branding={branding}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
              title="Open menu"
            >
              <Menu size={24} />
            </button>
            
            <div className="text-right">
              <div className="font-medium text-gray-900">{currentUser.email}</div>
              <button
                onClick={handleLogout}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div 
            className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white h-16"
          >
            <div className="flex items-center gap-4">
              {/* Connection Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'offline' ? 'bg-orange-100 text-orange-800' :
                connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'offline' ? 'bg-orange-500' :
                  connectionStatus === 'error' ? 'bg-red-500' :
                  'bg-blue-500 animate-pulse'
                }`} />
                <span className="font-medium">
                  {connectionStatus === 'connected' ? 'Database Online' :
                   connectionStatus === 'offline' ? 'Offline Mode' :
                   connectionStatus === 'error' ? 'Database Error' :
                   'Connecting...'}
                </span>
                {connectionStatus === 'error' && (
                  <button
                    onClick={retryConnection}
                    className="ml-1 text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {currentUser.email}
                </div>
                <div className="text-sm capitalize text-gray-600">
                  {currentUser.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && connectionStatus !== 'offline' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-700">
                    <strong>Database Error:</strong> {error}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={retryConnection}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
                <button
                  onClick={useOfflineMode}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Work Offline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Offline Mode Banner */}
        {connectionStatus === 'offline' && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Database className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-orange-700">
                    <strong>Offline Mode:</strong> Changes will not be saved to database. 
                    <button
                      onClick={retryConnection}
                      className="ml-2 underline hover:text-orange-900"
                    >
                      Try to reconnect
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 relative">
          {renderCurrentView()}
          
          {/* Global Quick Actions Floating Menu */}
          <div className="fixed bottom-6 right-6 z-40">
            <div className="bg-gray-900 rounded-full p-4 shadow-lg">
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setCurrentView('ai-assistant')}
                      className="p-2 bg-gray-700 text-white rounded-full hover:bg-black transition-colors"
                      title="AI Assistant"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentView('reports')}
                      className="p-2 bg-gray-700 text-white rounded-full hover:bg-black transition-colors"
                      title="Reports"
                    >
                      <BarChart3 size={16} />
                    </button>
                  </>
                )}
                {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
                  <button
                    onClick={() => setCurrentView('employees')}
                    className="p-2 bg-gray-700 text-white rounded-full hover:bg-black transition-colors"
                    title="Employees"
                  >
                    <Users size={16} />
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="p-2 bg-gray-700 text-white rounded-full hover:bg-black transition-colors"
                  title="Dashboard"
                >
                  <Home size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;