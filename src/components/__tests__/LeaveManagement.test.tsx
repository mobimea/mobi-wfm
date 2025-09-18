import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeaveManagement from '../LeaveManagement';
import { LeaveRequest, Employee } from '../../types';

describe('LeaveManagement Component', () => {
  const mockLeaves: LeaveRequest[] = [
    {
      id: '1',
      employee_id: 'EMP001',
      type: 'paid_local' as LeaveRequest['type'],
      status: 'pending',
      start_date: '2023-01-01',
      end_date: '2023-01-02',
      reason: 'Vacation',
      total_days: 2,
      salary_deduction: 0,
      applied_date: '2023-01-01'
    }
  ];

  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      employee_id: 'EMP001',
      email: 'john@example.com',
      phone: '+1234567890',
      department: 'IT',
      position: 'HR' as Employee['position'],
      start_date: '2022-01-01',
      status: 'employed' as Employee['status']
    }
  ];

  const mockCurrentUser = {
    employee_id: 'EMP001',
    role: 'employee' as const,
    name: 'John Doe',
    email: 'john@example.com'
  };

  const mockAddLeaveRequest = vi.fn().mockResolvedValue(undefined);
  const mockUpdateLeaveStatus = vi.fn().mockResolvedValue(undefined);

  it('renders the component with leave management title', () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={mockCurrentUser}
    />);
    expect(screen.getByText('Enhanced Leave Management')).toBeInTheDocument();
  });

  it('displays leave statistics', () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={mockCurrentUser}
    />);
    expect(screen.getByText('Leave Types & Salary Impact')).toBeInTheDocument();
  });

  it('renders leave request form and list components', () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={mockCurrentUser}
    />);
    expect(screen.getByText('Leave Requests')).toBeInTheDocument();
  });

  it('shows request leave button for employees', () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={mockCurrentUser}
    />);

    const requestButton = screen.getByRole('button', { name: /request leave/i });
    expect(requestButton).toBeInTheDocument();
  });

  it('handles leave status update', async () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={{ ...mockCurrentUser, role: 'admin' }}
      updateLeaveStatus={mockUpdateLeaveStatus}
    />);

    // Find approve button
    const approveButton = screen.getByRole('button', { name: /approve/i });

    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockUpdateLeaveStatus).toHaveBeenCalledWith('1', 'approved', 'EMP001');
    });
  });

  it('displays leave details correctly', () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={mockCurrentUser}
    />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('shows leave type badges', () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={mockCurrentUser}
    />);
    expect(screen.getByText('Paid Local')).toBeInTheDocument();
  });

  it('shows leave status badges', () => {
    render(<LeaveManagement
      leaves={mockLeaves}
      employees={mockEmployees}
      currentUser={mockCurrentUser}
    />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
