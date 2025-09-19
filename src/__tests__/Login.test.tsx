import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login';

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    mockOnLogin.mockReset();
  });

  it('renders login form with email and password inputs', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('toggles password visibility when toggle button is clicked', () => {
    render(<Login onLogin={mockOnLogin} />);
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially password type is password
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle button again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays error message on failed login', async () => {
    mockOnLogin.mockResolvedValue(false);
    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('calls onLogin with email and password on form submit', async () => {
    mockOnLogin.mockResolvedValue(true);
    render(<Login onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('user@example.com', 'correctpassword');
    });
  });
});
