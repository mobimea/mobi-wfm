// Client-side user management API calls
// This module makes HTTP requests to backend API endpoints for user management

export interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
  employee_id?: string;
  department?: string;
}

export interface UserResponse {
  data?: any;
  error?: string;
}

export async function createUser(user: CreateUserRequest): Promise<UserResponse> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Failed to create user' };
    }

    return { data: result.data };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { error: error.message || 'Failed to create user' };
  }
}

export async function getUsers(): Promise<UserResponse> {
  try {
    const response = await fetch('/api/users');
    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Failed to fetch users' };
    }

    return { data: result.data };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { error: error.message || 'Failed to fetch users' };
  }
}

export async function updateUser(userId: string, updates: any): Promise<UserResponse> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Failed to update user' };
    }

    return { data: result.data };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { error: error.message || 'Failed to update user' };
  }
}

export async function deleteUser(userId: string): Promise<UserResponse> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Failed to delete user' };
    }

    return { data: result.data };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { error: error.message || 'Failed to delete user' };
  }
}
