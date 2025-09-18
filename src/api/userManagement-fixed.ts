import { createClient } from '@supabase/supabase-js';

// Load service_role key from environment variables (ensure this is set securely in your backend environment)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Input validation
interface CreateUserInput {
  email: string;
  password: string;
  role: string;
  employee_id?: string;
  department?: string;
}

function validateUserInput(input: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.email || typeof input.email !== 'string' || !input.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!input.password || typeof input.password !== 'string' || input.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!input.role || typeof input.role !== 'string') {
    errors.push('Role is required');
  }

  const validRoles = ['admin', 'supervisor', 'employee'];
  if (!validRoles.includes(input.role)) {
    errors.push('Invalid role. Must be one of: admin, supervisor, employee');
  }

  return { isValid: errors.length === 0, errors };
}

export async function createUser(input: CreateUserInput) {
  try {
    // Validate input
    const validation = validateUserInput(input);
    if (!validation.isValid) {
      return { error: `Validation failed: ${validation.errors.join(', ')}` };
    }

    const { email, password, role, employee_id, department } = input;

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((u: any) => u.email === email);

    if (existingUser) {
      return { error: 'User already exists with this email address' };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return { error: `Failed to create user account: ${authError.message}` };
    }

    // Find employee record if employee_id provided
    let employeeRecordId = null;
    if (employee_id) {
      const { data: employeeData, error: empError } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('employee_id', employee_id)
        .single();

      if (!empError && employeeData) {
        employeeRecordId = employeeData.id;
      } else if (empError) {
        console.warn(`Employee ID ${employee_id} not found, proceeding without linking`);
      }
    }

    // Check if profile exists, then insert or update accordingly
    console.log('Checking if profile exists for user ID:', authData.user.id);
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single();

    console.log('Profile check result:', { existingProfile, profileCheckError });

    let profile;
    let profileError;

    if (existingProfile) {
      console.log('Profile exists, updating...');
      // Update existing profile
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          email,
          department: department || null,
          employee_record_id: employeeRecordId,
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      profile = data;
      profileError = error;
      console.log('Profile update result:', { profile, profileError });
    } else {
      console.log('Profile does not exist, inserting...');
      // Insert new profile
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email,
          department: department || null,
          employee_record_id: employeeRecordId,
        }])
        .select()
        .single();

      profile = data;
      profileError = error;
      console.log('Profile insert result:', { profile, profileError });
    }

    if (profileError) {
      console.error('Error creating/updating profile:', profileError);
      // Clean up auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to create user profile: ${profileError.message}` };
    }

    // Assign role if provided and not 'employee'
    if (role && role !== 'employee') {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (!roleError && roleData) {
        const { error: userRoleError } = await supabaseAdmin
          .from('user_roles')
          .upsert([{
            user_id: authData.user.id,
            role_id: roleData.id,
          }]);

        if (userRoleError) {
          console.error('Error assigning role:', userRoleError);
          // Don't fail the entire operation for role assignment error
        }
      } else {
        console.warn(`Role '${role}' not found in database, user created without role assignment`);
      }
    }

    console.log('User created successfully:', { id: authData.user.id, email, role });
    return { data: profile };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { error: error.message || 'Failed to create user' };
  }
}
