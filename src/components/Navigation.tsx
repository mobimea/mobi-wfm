import React from 'react';
import {
  Users, Calendar, Clock, FileText, BarChart3,
  MapPin, Bot, X, Settings, DollarSign, Building2
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: 'admin' | 'supervisor' | 'employee';
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  branding: {
    colorTheme: {
      navHover: string;
      navActive?: string;
      navText?: string;
    };
  };
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  userRole,
  isMobile,
  sidebarOpen,
  setSidebarOpen,
  branding
}) => {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'supervisor', 'employee'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'supervisor'] },
    // Removed separate Employee Excel Upload menu item to integrate inside Employees tab
    // { id: 'employee-excel-upload', label: 'Employee Excel Upload', icon: Upload, roles: ['admin'] },
    { id: 'user-management', label: 'User Management', icon: Settings, roles: ['admin'] },
    { id: 'salary-management', label: 'Salary Management', icon: DollarSign, roles: ['admin'] },
    { id: 'holiday-management', label: 'Holiday Management', icon: Calendar, roles: ['admin'] },
    { id: 'roster', label: 'Roster', icon: Calendar, roles: ['admin', 'supervisor', 'employee'] },
    { id: 'attendance', label: 'Attendance', icon: Clock, roles: ['admin', 'supervisor', 'employee'] },
    { id: 'leaves', label: 'Leaves', icon: FileText, roles: ['admin', 'supervisor', 'employee'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'supervisor', 'employee'] },
    { id: 'field-ops', label: 'Field Operations', icon: MapPin, roles: ['admin', 'supervisor'] },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, roles: ['admin', 'supervisor'] },
    { id: 'admin-settings', label: 'Admin Settings', icon: Settings, roles: ['admin'] },
    { id: 'company-settings', label: 'Company Settings', icon: Building2, roles: ['admin'] }
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const sidebarClasses = `
    ${isMobile ? 'fixed' : 'relative'} 
    ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
    ${isMobile ? 'z-50' : ''}
    h-screen transition-transform duration-300 ease-in-out flex flex-col
  `;

  const sidebarStyle = {
    width: '256px',
    backgroundColor: '#1e293b',
    color: '#f1f5f9'
  };
  return (
    <>
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={sidebarClasses} style={sidebarStyle}>
        <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: branding.colorTheme.navHover }}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              HR Management
            </h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors hover:bg-slate-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <p className="text-sm mt-1 text-slate-300">
            Workforce Management System
          </p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? (branding.colorTheme.navActive || '#475569') : 'transparent',
                      color: branding.colorTheme.navText || '#f1f5f9'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = branding.colorTheme.navHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex-shrink-0 p-4">
          <div className="p-4 rounded-lg bg-slate-600">
            <p className="text-xs text-slate-300">
              {userRole.toUpperCase()} • {window.location.hostname === 'localhost' ? 'DEV' : 'PROD'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;