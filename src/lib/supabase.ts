
import { createClient } from '@supabase/supabase-js';
import { Employee, AttendanceRecord, LeaveRequest, Holiday, Location, RosterEntry } from '../types';

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // For local development, use local Supabase if no cloud config
  if (!supabaseUrl || !supabaseKey) {
    return true; // Allow local development
  }

  // Basic validation for URL format
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && urlObj.hostname.includes('supabase');
    } catch {
      return false;
    }
  };

  return !!(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== '' &&
    supabaseKey !== '' &&
    isValidUrl(supabaseUrl)
  );
};

let supabase: any = null;

export function setSupabaseClient(client: any) {
  supabase = client;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  // Use cloud Supabase if configured
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('🔌 Supabase client initialized (Cloud)');
} else {
  // Use local Supabase for development
  const localUrl = 'http://127.0.0.1:54321';
  const localKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  supabase = createClient(localUrl, localKey);
  console.log('🔌 Supabase client initialized (Local Development)');
}

// Export the supabase client for direct use
export { supabase };

// Database service class
export class DatabaseService {
  static async testConnection(): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      return false;
    }

    try {
      // Simple lightweight query to test connection
      const { data, error } = await supabase
        .from('locations')
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('Connection test failed:', error.message);
        return false;
      }

      console.log('✅ Supabase connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ Connection test error:', error);
      return false;
    }
  }

  // ==================== GENERIC CRUD OPERATIONS ====================

  static async insertRecord(tableName: string, record: any): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log(`📝 Inserting record to ${tableName}:`, record);

      const { data, error } = await supabase
        .from(tableName)
        .insert([record])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting record to ${tableName}:`, error);
        return { data: null, error: error.message };
      }

      console.log(`✅ Record inserted to ${tableName}:`, data);
      return { data };
    } catch (error: any) {
      console.error(`❌ Insert operation failed for ${tableName}:`, error);
      return { data: null, error: error.message || 'Insert operation failed' };
    }
  }

  static async updateRecord(tableName: string, id: string, updates: Partial<any>): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log(`✏️ Updating record in ${tableName} (${id}):`, updates);

      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating record in ${tableName}:`, error);
        return { data: null, error: error.message };
      }

      console.log(`✅ Record updated in ${tableName}:`, data);
      return { data };
    } catch (error: any) {
      console.error(`❌ Update operation failed for ${tableName}:`, error);
      return { data: null, error: error.message || 'Update operation failed' };
    }
  }

  static async deleteRecord(tableName: string, id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log(`🗑️ Deleting record from ${tableName} (${id})`);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ Error deleting record from ${tableName}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Record deleted from ${tableName}`);
      return { success: true };
    } catch (error: any) {
      console.error(`❌ Delete operation failed for ${tableName}:`, error);
      return { success: false, error: error.message || 'Delete operation failed' };
    }
  }

  // ==================== FETCH OPERATIONS ====================

  static async fetchEmployees(): Promise<{ data: Employee[] }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  }

  static async fetchAttendance(): Promise<{ data: AttendanceRecord[] }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  }

  static async fetchLeaves(): Promise<{ data: LeaveRequest[] }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('leaves')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  }

  static async fetchHolidays(): Promise<{ data: Holiday[] }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    return { data: data || [] };
  }

  static async fetchLocations(): Promise<{ data: Location[] }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return { data: data || [] };
  }

  static async fetchRoster(): Promise<{ data: RosterEntry[] }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('roster')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    return { data: data || [] };
  }

  // ==================== EMPLOYEE OPERATIONS ====================

  static async insertEmployee(employee: Employee): Promise<{ data: any; error?: string }> {
    return this.insertRecord('employees', employee);
  }

  static async updateEmployee(id: string, updates: Partial<Employee>): Promise<{ data: any; error?: string }> {
    return this.updateRecord('employees', id, updates);
  }

  static async deleteEmployee(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log(`🗑️ Deleting employee (${id}) and checking for linked user profiles...`);

      // First, find any user profiles linked to this employee
      const { data: linkedProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('employee_record_id', id);

      if (profilesError) {
        console.error('❌ Error finding linked profiles:', profilesError);
        return { success: false, error: `Failed to check linked user profiles: ${profilesError.message}` };
      }

      // Delete linked user profiles (this will cascade to auth.users and user_roles)
      if (linkedProfiles && linkedProfiles.length > 0) {
        console.log(`🔗 Found ${linkedProfiles.length} linked user profile(s), deleting them first...`);

        for (const profile of linkedProfiles) {
          console.log(`🗑️ Deleting linked user profile: ${profile.email}`);

          // Delete user roles first
          const { error: rolesError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', profile.id);

          if (rolesError) {
            console.warn(`⚠️ Warning: Could not delete user roles for ${profile.email}:`, rolesError);
          }

          // Delete the profile (this should cascade to auth.users)
          const { error: profileDeleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id);

          if (profileDeleteError) {
            console.error(`❌ Error deleting profile ${profile.email}:`, profileDeleteError);
            return {
              success: false,
              error: `Failed to delete linked user profile ${profile.email}: ${profileDeleteError.message}`
            };
          }

          console.log(`✅ Successfully deleted user profile: ${profile.email}`);
        }
      } else {
        console.log('✅ No linked user profiles found');
      }

      // Now delete the employee record
      console.log(`🗑️ Deleting employee record from employees table...`);
      const { error: employeeError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (employeeError) {
        console.error(`❌ Error deleting employee record:`, employeeError);
        return { success: false, error: `Failed to delete employee record: ${employeeError.message}` };
      }

      console.log(`✅ Employee and all linked accounts deleted successfully`);
      return { success: true };

    } catch (error: any) {
      console.error(`❌ Delete employee operation failed:`, error);
      return { success: false, error: error.message || 'Delete employee operation failed' };
    }
  }

  // ==================== ATTENDANCE OPERATIONS ====================

  static async insertAttendance(attendance: AttendanceRecord): Promise<{ data: any; error?: string }> {
    return this.insertRecord('attendance', attendance);
  }

  static async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<{ data: any; error?: string }> {
    return this.updateRecord('attendance', id, updates);
  }

  static async deleteAttendance(id: string): Promise<{ success: boolean; error?: string }> {
    return this.deleteRecord('attendance', id);
  }

  // ==================== LEAVE OPERATIONS ====================

  static async insertLeave(leave: LeaveRequest): Promise<{ data: any; error?: string }> {
    return this.insertRecord('leaves', leave);
  }

  static async updateLeave(id: string, updates: Partial<LeaveRequest>): Promise<{ data: any; error?: string }> {
    return this.updateRecord('leaves', id, updates);
  }

  static async deleteLeave(id: string): Promise<{ success: boolean; error?: string }> {
    return this.deleteRecord('leaves', id);
  }

  // ==================== HOLIDAY OPERATIONS ====================

  static async insertHoliday(holiday: Holiday): Promise<{ data: any; error?: string }> {
    return this.insertRecord('holidays', holiday);
  }

  static async updateHoliday(id: string, updates: Partial<Holiday>): Promise<{ data: any; error?: string }> {
    return this.updateRecord('holidays', id, updates);
  }

  static async deleteHoliday(id: string): Promise<{ success: boolean; error?: string }> {
    return this.deleteRecord('holidays', id);
  }

  // ==================== LOCATION OPERATIONS ====================

  static async insertLocation(location: Location): Promise<{ data: any; error?: string }> {
    return this.insertRecord('locations', location);
  }

  static async updateLocation(id: string, updates: Partial<Location>): Promise<{ data: any; error?: string }> {
    return this.updateRecord('locations', id, updates);
  }

  static async deleteLocation(id: string): Promise<{ success: boolean; error?: string }> {
    return this.deleteRecord('locations', id);
  }

  // ==================== ROSTER OPERATIONS ====================

  static async insertRoster(roster: RosterEntry): Promise<{ data: any; error?: string }> {
    return this.insertRecord('roster', roster);
  }

  static async updateRoster(id: string, updates: Partial<RosterEntry>): Promise<{ data: any; error?: string }> {
    return this.updateRecord('roster', id, updates);
  }

  static async deleteRoster(id: string): Promise<{ success: boolean; error?: string }> {
    return this.deleteRecord('roster', id);
  }

  // ==================== USER MANAGEMENT OPERATIONS ====================

  static async fetchUsers(): Promise<{ data: any[]; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          department,
          employee_record_id,
          created_at,
          user_roles (
            roles (
              name
            )
          ),
          employees (
            employee_id,
            name
          )
        `);

      if (error) {
        console.error('❌ Error fetching users:', error);
        return { data: [], error: error.message };
      }

      // Transform data to match the expected User interface
      const users = (data || []).map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        role: profile.user_roles?.[0]?.roles?.name || 'employee',
        employee_id: profile.employees?.employee_id || null,
        department: profile.department,
        created_date: profile.created_at?.split('T')[0],
        last_login: undefined, // Would need to track this separately
        status: 'active', // Would need to add this field to profiles table
        permissions: [], // Would need to fetch from role_permissions
        name: profile.employees?.name || profile.email.split('@')[0]
      }));

      console.log('✅ Users fetched successfully:', users.length);
      return { data: users };
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      return { data: [], error: error.message || 'Failed to fetch users' };
    }
  }

  static async insertUser(user: any, password: string): Promise<{ data: any; error?: string }> {
    try {
      console.log('🔐 Creating new user account:', user.email);
      
      // Call the backend API to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: password,
          role: user.role || 'employee',
          employee_id: user.employee_id,
          department: user.department
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error creating user:', result.error);
        return { data: null, error: result.error };
      }
      
      console.log('✅ User created successfully:', result.user);
      return { data: result.user };
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      return { data: null, error: error.message || 'Failed to create user' };
    }
  }

  static async updateUser(id: string, updates: any): Promise<{ data: any; error?: string }> {
    return this.updateRecord('profiles', id, updates);
  }

  static async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      // Delete user roles first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', id);

      // Delete profile (this will cascade to auth user)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting user:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ User deleted successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      return { success: false, error: error.message || 'Failed to delete user' };
    }
  }

  static async fetchUserProfileByEmail(email: string): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      // Fetch user profile with role information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          department,
          employee_record_id,
          created_at,
          user_roles (
            roles (
              name
            )
          ),
          employees (
            employee_id,
            name
          )
        `)
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return { data: null, error: profileError.message };
      }

      if (!profileData) {
        return { data: null, error: 'User profile not found' };
      }

      // Transform the data to match your application's user structure
      const userProfile = {
        id: profileData.id,
        email: profileData.email,
        role: profileData.user_roles?.[0]?.roles?.name || 'employee',
        employee_id: profileData.employees?.employee_id || null,
        department: profileData.department,
        name: profileData.employees?.name || profileData.email.split('@')[0]
      };

      console.log('✅ User profile fetched successfully:', userProfile);
      return { data: userProfile };

    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);
      return { data: null, error: error.message || 'Failed to fetch user profile' };
    }
  }

  static async authenticateUser(email: string, password: string): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      // Clear any existing sessions to avoid JWT conflicts
      console.log('🧹 Clearing existing session...');
      await supabase.auth.signOut();

      // First, try to sign in with Supabase Auth
      console.log('🔐 Attempting Supabase sign-in for:', email);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('🔑 Authentication error details:', authError);

        // Handle specific error types
        if (authError.message.includes('Invalid login credentials')) {
          return { data: null, error: 'Invalid email or password' };
        }
        if (authError.message.includes('Email not confirmed')) {
          return { data: null, error: 'Please confirm your email address' };
        }
        if (authError.message.includes('user_not_found') || authError.message.includes('does not exist')) {
          return { data: null, error: 'User account not found. Please check the email address.' };
        }

        console.error('Authentication error:', authError);
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        return { data: null, error: 'Authentication failed' };
      }

      // Fetch the user's profile and role information
      const profileResult = await this.fetchUserProfileByEmail(email);

      if (profileResult.error || !profileResult.data) {
        return { data: null, error: profileResult.error || 'User profile not found' };
      }

      console.log('✅ User authenticated successfully:', profileResult.data);
      return { data: profileResult.data };

    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      return { data: null, error: error.message || 'Authentication failed' };
    }
  }

  // ==================== BULK OPERATIONS ====================

  static async bulkInsert(tableName: string, records: any[]): Promise<{ data: any[]; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log(`📦 Bulk inserting ${records.length} records to ${tableName}`);

      const { data, error } = await supabase
        .from(tableName)
        .insert(records)
        .select();

      if (error) {
        console.error(`❌ Error bulk inserting to ${tableName}:`, error);
        return { data: [], error: error.message };
      }

      console.log(`✅ Bulk insert to ${tableName} successful:`, data?.length);
      return { data: data || [] };
    } catch (error: any) {
      console.error(`❌ Bulk insert operation failed for ${tableName}:`, error);
      return { data: [], error: error.message || 'Bulk insert operation failed' };
    }
  }

  static async bulkUpdate(tableName: string, updates: { id: string; data: any }[]): Promise<{ success: boolean; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log(`📦 Bulk updating ${updates.length} records in ${tableName}`);

      const promises = updates.map(update =>
        supabase
          .from(tableName)
          .update(update.data)
          .eq('id', update.id)
      );

      const results = await Promise.all(promises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        const errors = results.filter(result => result.error).map(result => result.error.message);
        console.error(`❌ Some bulk updates failed for ${tableName}:`, errors);
        return { success: false, error: 'Some updates failed: ' + errors.join(', ') };
      }

      console.log(`✅ Bulk update to ${tableName} successful`);
      return { success: true };
    } catch (error: any) {
      console.error(`❌ Bulk update operation failed for ${tableName}:`, error);
      return { success: false, error: error.message || 'Bulk update operation failed' };
    }
  }

  static async bulkDelete(tableName: string, ids: string[]): Promise<{ success: boolean; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log(`📦 Bulk deleting ${ids.length} records from ${tableName}`);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids);

      if (error) {
        console.error(`❌ Error bulk deleting from ${tableName}:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Bulk delete from ${tableName} successful`);
      return { success: true };
    } catch (error: any) {
      console.error(`❌ Bulk delete operation failed for ${tableName}:`, error);
      return { success: false, error: error.message || 'Bulk delete operation failed' };
    }
  }

  // ==================== DATA SYNCHRONIZATION ====================

  static async syncData(): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      console.log('🔄 Starting data synchronization...');

      // Fetch latest data from all tables
      const [employees, attendance, leaves, holidays, locations, roster] = await Promise.all([
        this.fetchEmployees(),
        this.fetchAttendance(),
        this.fetchLeaves(),
        this.fetchHolidays(),
        this.fetchLocations(),
        this.fetchRoster()
      ]);

      const syncedData = {
        employees: employees.data,
        attendance: attendance.data,
        leaves: leaves.data,
        holidays: holidays.data,
        locations: locations.data,
        roster: roster.data
      };

      console.log('✅ Data synchronization complete:', {
        employees: syncedData.employees.length,
        attendance: syncedData.attendance.length,
        leaves: syncedData.leaves.length,
        holidays: syncedData.holidays.length,
        locations: syncedData.locations.length,
        roster: syncedData.roster.length
      });

      return { data: syncedData };
    } catch (error: any) {
      console.error('❌ Data synchronization failed:', error);
      return { data: null, error: error.message || 'Synchronization failed' };
    }
  }

  // ==================== ADVANCED SEARCH & FILTERING ====================

  static async searchEmployees(searchTerm: string, filters?: any): Promise<{ data: Employee[]; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      let query = supabase.from('employees').select('*');

      // Apply search term
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.position) {
        query = query.eq('position', filters.position);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [] };
    } catch (error: any) {
      return { data: [], error: error.message || 'Search failed' };
    }
  }

  static async getAttendanceByDateRange(startDate: string, endDate: string, employeeId?: string): Promise<{ data: AttendanceRecord[]; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [] };
    } catch (error: any) {
      return { data: [], error: error.message || 'Failed to fetch attendance' };
    }
  }

  // ==================== SETTINGS OPERATIONS ====================

  static async fetchSystemSettings(): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return { data: null, error: error.message };
      }

      return { data: data || null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to fetch system settings' };
    }
  }

  static async updateSystemSettings(settings: any): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      // First try to update existing record
      const { data: existing } = await this.fetchSystemSettings();

      if (existing) {
        const { data, error } = await supabase
          .from('system_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data };
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('system_settings')
          .insert([settings])
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data };
      }
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to update system settings' };
    }
  }

  static async fetchSecuritySettings(): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: error.message };
      }

      return { data: data || null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to fetch security settings' };
    }
  }

  static async updateSecuritySettings(settings: any): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data: existing } = await this.fetchSecuritySettings();

      if (existing) {
        const { data, error } = await supabase
          .from('security_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data };
      } else {
        const { data, error } = await supabase
          .from('security_settings')
          .insert([settings])
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data };
      }
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to update security settings' };
    }
  }

  static async fetchNotificationSettings(): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: error.message };
      }

      return { data: data || null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to fetch notification settings' };
    }
  }

  static async updateNotificationSettings(settings: any): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data: existing } = await this.fetchNotificationSettings();

      if (existing) {
        const { data, error } = await supabase
          .from('notification_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data };
      } else {
        const { data, error } = await supabase
          .from('notification_settings')
          .insert([settings])
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data };
      }
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to update notification settings' };
    }
  }

  static async fetchAuditLogs(limit: number = 1000): Promise<{ data: any[]; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) return { data: [], error: error.message };
      return { data: data || [] };
    } catch (error: any) {
      return { data: [], error: error.message || 'Failed to fetch audit logs' };
    }
  }

  static async insertAuditLog(log: { action: string; details: string; success?: boolean; ip_address?: string }): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([{
          ...log,
          user_email: 'admin@demo', // In a real app, get from auth context
          success: log.success !== undefined ? log.success : true
        }])
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to insert audit log' };
    }
  }

  static async clearAuditLogs(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to clear audit logs' };
    }
  }

  static async fetchCompanyConfigurations(): Promise<{ data: any[]; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('company_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: data || [] };
    } catch (error: any) {
      return { data: [], error: error.message || 'Failed to fetch company configurations' };
    }
  }

  static async fetchCompanyConfiguration(companyName: string): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('company_configurations')
        .select('*')
        .eq('company_name', companyName)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: error.message };
      }

      return { data: data || null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to fetch company configuration' };
    }
  }

  static async insertCompanyConfiguration(config: any): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('company_configurations')
        .insert([config])
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to insert company configuration' };
    }
  }

  static async updateCompanyConfiguration(id: string, config: any): Promise<{ data: any; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('company_configurations')
        .update(config)
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to update company configuration' };
    }
  }

  static async deleteCompanyConfiguration(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { error } = await supabase
        .from('company_configurations')
        .delete()
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete company configuration' };
    }
  }
}

